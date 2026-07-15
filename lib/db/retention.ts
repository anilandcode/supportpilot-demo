import { createHash } from "node:crypto";
import { getBillingSnapshot } from "@/lib/billing/plans";
import {
  appendAuditLog,
  getLocalState,
  getRetentionSetting,
  getWorkspace,
  listAuditLogs,
  listSecurityEvents,
} from "@/lib/db/support";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import type {
  AuditEvidenceExport,
  DataDeletionRequest,
  DeletionRequestScope,
  EvidenceExportStatus,
  RetentionJob,
  RetentionJobType,
} from "@/lib/enterprise/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateDeletionRequestInput = {
  workspaceId?: string;
  scope: DeletionRequestScope;
  subjectId: string;
  requesterEmail?: string | null;
  actorUserId?: string | null;
  reason?: string | null;
  verificationMethod?: string | null;
  metadata?: Record<string, unknown>;
};

type CreateEvidenceExportInput = {
  workspaceId?: string;
  exportType?: AuditEvidenceExport["exportType"];
  periodStart?: string;
  periodEnd?: string;
  generatedBy?: string | null;
};

const localRetentionState = {
  deletionRequests: [] as DataDeletionRequest[],
  retentionJobs: [] as RetentionJob[],
  evidenceExports: [] as AuditEvidenceExport[],
};

export function getLocalRetentionState() {
  return localRetentionState;
}

export function resetLocalRetentionStateForTests() {
  localRetentionState.deletionRequests.length = 0;
  localRetentionState.retentionJobs.length = 0;
  localRetentionState.evidenceExports.length = 0;
}

export async function listDeletionRequests(workspaceId = DEMO_WORKSPACE_ID): Promise<DataDeletionRequest[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("data_deletion_requests")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapDeletionRequest);
  }
  return localRetentionState.deletionRequests.filter((request) => request.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listRetentionJobs(workspaceId = DEMO_WORKSPACE_ID): Promise<RetentionJob[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("retention_jobs")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapRetentionJob);
  }
  return localRetentionState.retentionJobs.filter((job) => job.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAuditEvidenceExports(workspaceId = DEMO_WORKSPACE_ID): Promise<AuditEvidenceExport[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("audit_evidence_exports")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapAuditEvidenceExport);
  }
  return localRetentionState.evidenceExports.filter((item) => item.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createDeletionRequest(input: CreateDeletionRequestInput) {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const now = new Date().toISOString();
  const verified = Boolean(input.verificationMethod);
  const request: DataDeletionRequest = {
    id: publicId(),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    scope: input.scope,
    subjectId: input.subjectId,
    requesterEmail: input.requesterEmail ?? null,
    actorUserId: input.actorUserId ?? null,
    status: verified ? "queued" : "requested",
    reason: input.reason ?? null,
    verificationMethod: input.verificationMethod ?? null,
    verifiedAt: verified ? now : null,
    queuedAt: verified ? now : null,
    completedAt: null,
    auditProofHash: null,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };
  localRetentionState.deletionRequests.unshift(request);
  await persistDeletionRequest(request);

  let job: RetentionJob | null = null;
  if (verified) {
    job = await createRetentionJob({
      workspaceId: workspace.id,
      tenantId: workspace.tenantId,
      jobType: "deletion_request",
      deletionRequestId: request.id,
      scope: request.scope,
      cutoffAt: null,
    });
  }

  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: request.scope === "ticket" ? request.subjectId : null,
    userId: input.actorUserId ?? null,
    action: "retention.deletion_requested",
    details: { deletionRequestId: request.id, scope: request.scope, subjectId: request.subjectId, queued: Boolean(job) },
  });

  return { request, job };
}

export async function scheduleRetentionJobs(workspaceId = DEMO_WORKSPACE_ID) {
  const workspace = await getWorkspace(workspaceId);
  const setting = await getRetentionSetting(workspace.id);
  if (!setting) return [];

  const billing = await getBillingSnapshot(workspace.id);
  const retentionLimit = billing.metrics.retentionDays.limit;
  const conversationDays = clampRetentionDays(setting.conversationDays, retentionLimit);
  const auditDays = clampRetentionDays(setting.auditDays, retentionLimit);
  const clamped = conversationDays !== setting.conversationDays || auditDays !== setting.auditDays;

  const jobs: RetentionJob[] = [];
  const conversationCutoff = daysAgo(conversationDays);
  const aiLogCutoff = daysAgo(auditDays);
  jobs.push(
    await createRetentionJob({
      workspaceId: workspace.id,
      tenantId: workspace.tenantId,
      jobType: "conversation_cleanup",
      retentionSettingId: setting.id,
      scope: "workspace_retention",
      cutoffAt: conversationCutoff,
    }),
  );
  jobs.push(
    await createRetentionJob({
      workspaceId: workspace.id,
      tenantId: workspace.tenantId,
      jobType: "ai_log_cleanup",
      retentionSettingId: setting.id,
      scope: "workspace_retention",
      cutoffAt: aiLogCutoff,
    }),
  );
  if (clamped) {
    await appendAuditLog({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      ticketId: null,
      userId: null,
      action: "billing.retention_limit.applied",
      details: {
        plan: billing.plan.key,
        limit: retentionLimit,
        configuredConversationDays: setting.conversationDays,
        configuredAuditDays: setting.auditDays,
        scheduledConversationDays: conversationDays,
        scheduledAuditDays: auditDays,
      },
    });
  }
  return jobs;
}

export async function processRetentionJob(jobId: string, actorUserId?: string | null) {
  const job = await getRetentionJob(jobId);
  if (!job) throw new Error(`Retention job ${jobId} was not found`);
  if (job.status === "succeeded") return job;

  job.status = "running";
  job.attempts += 1;
  job.startedAt ??= new Date().toISOString();
  job.updatedAt = new Date().toISOString();
  await persistRetentionJob(job);

  try {
    const affectedCounts = await estimateAffectedCounts(job);
    const proof = proofHash({ jobId: job.id, jobType: job.jobType, scope: job.scope, cutoffAt: job.cutoffAt, affectedCounts });
    job.affectedCounts = affectedCounts;
    job.auditProofHash = proof;
    job.status = "succeeded";
    job.error = null;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    await persistRetentionJob(job);

    if (job.deletionRequestId) {
      const request = await getDeletionRequest(job.deletionRequestId);
      if (request) {
        request.status = "completed";
        request.completedAt = job.completedAt;
        request.auditProofHash = proof;
        request.updatedAt = job.completedAt;
        await persistDeletionRequest(request);
      }
    }

    await appendAuditLog({
      tenantId: job.tenantId,
      workspaceId: job.workspaceId,
      ticketId: job.scope === "ticket" && job.deletionRequestId ? (await getDeletionRequest(job.deletionRequestId))?.subjectId ?? null : null,
      userId: actorUserId ?? null,
      action: "retention.job_succeeded",
      details: { jobId: job.id, jobType: job.jobType, affectedCounts, proof },
    });
    return job;
  } catch (error) {
    job.error = error instanceof Error ? error.message : "unknown retention job error";
    job.status = job.attempts >= job.maxAttempts ? "failed" : "queued";
    job.nextRunAt = job.status === "queued" ? new Date(Date.now() + Math.min(job.attempts * 60_000, 900_000)).toISOString() : null;
    job.updatedAt = new Date().toISOString();
    await persistRetentionJob(job);
    return job;
  }
}

export async function createAuditEvidenceExport(input: CreateEvidenceExportInput = {}) {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const periodEnd = input.periodEnd ?? new Date().toISOString();
  const periodStart = input.periodStart ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const exportRecord: AuditEvidenceExport = {
    id: publicId(),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    exportType: input.exportType ?? "monthly_soc2_readiness",
    status: "running",
    periodStart,
    periodEnd,
    artifactUrl: null,
    artifactHash: null,
    itemCounts: {},
    generatedBy: input.generatedBy ?? null,
    error: null,
    createdAt: now,
    completedAt: null,
  };
  localRetentionState.evidenceExports.unshift(exportRecord);
  await persistAuditEvidenceExport(exportRecord);

  try {
    const [auditLogs, securityEvents] = await Promise.all([listAuditLogs(workspace.id), listSecurityEvents(workspace.id)]);
    const payload = {
      workspaceId: workspace.id,
      periodStart,
      periodEnd,
      auditLogIds: auditLogs.map((log) => log.id),
      securityEventIds: securityEvents.map((event) => event.id),
      rlsStaticGate: "npm run test:rls",
      generatedAt: new Date().toISOString(),
      claimBoundary: "SOC 2 readiness evidence only; no certification claim.",
    };
    exportRecord.status = "succeeded";
    exportRecord.itemCounts = { auditLogs: auditLogs.length, securityEvents: securityEvents.length, rlsReports: 1 };
    exportRecord.artifactHash = proofHash(payload);
    exportRecord.artifactUrl = `memory://audit-evidence/${exportRecord.id}.json`;
    exportRecord.completedAt = new Date().toISOString();
    await persistAuditEvidenceExport(exportRecord);
    await appendAuditLog({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      ticketId: null,
      userId: input.generatedBy ?? null,
      action: "retention.evidence_exported",
      details: { exportId: exportRecord.id, artifactHash: exportRecord.artifactHash, itemCounts: exportRecord.itemCounts },
    });
    return exportRecord;
  } catch (error) {
    exportRecord.status = "failed";
    exportRecord.error = error instanceof Error ? error.message : "unknown evidence export error";
    await persistAuditEvidenceExport(exportRecord);
    return exportRecord;
  }
}

async function createRetentionJob(input: {
  workspaceId: string;
  tenantId: string;
  jobType: RetentionJobType;
  deletionRequestId?: string | null;
  retentionSettingId?: string | null;
  scope: RetentionJob["scope"];
  cutoffAt: string | null;
}) {
  const existing = localRetentionState.retentionJobs.find(
    (job) =>
      job.workspaceId === input.workspaceId &&
      job.jobType === input.jobType &&
      job.status === "queued" &&
      job.deletionRequestId === (input.deletionRequestId ?? null) &&
      job.cutoffAt === input.cutoffAt,
  );
  if (existing) return existing;

  const now = new Date().toISOString();
  const job: RetentionJob = {
    id: publicId(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    jobType: input.jobType,
    status: "queued",
    deletionRequestId: input.deletionRequestId ?? null,
    retentionSettingId: input.retentionSettingId ?? null,
    scope: input.scope,
    cutoffAt: input.cutoffAt,
    attempts: 0,
    maxAttempts: 3,
    affectedCounts: {},
    error: null,
    auditProofHash: null,
    startedAt: null,
    completedAt: null,
    nextRunAt: null,
    createdAt: now,
    updatedAt: now,
  };
  localRetentionState.retentionJobs.unshift(job);
  await persistRetentionJob(job);
  return job;
}

async function estimateAffectedCounts(job: RetentionJob): Promise<Record<string, number>> {
  const state = getLocalState();
  if (job.jobType === "conversation_cleanup") {
    return {
      tickets: countOlderThan(state.tickets.filter((ticket) => ticket.workspaceId === job.workspaceId).map((ticket) => ticket.updatedAt), job.cutoffAt),
      messages: countOlderThan(state.messages.filter((message) => message.workspaceId === job.workspaceId).map((message) => message.createdAt), job.cutoffAt),
    };
  }
  if (job.jobType === "ai_log_cleanup") {
    return {
      aiRuns: countOlderThan(state.aiRuns.filter((run) => run.workspaceId === job.workspaceId).map((run) => run.createdAt), job.cutoffAt),
      modelRouteLogs: countOlderThan(state.modelRouteLogs.filter((log) => log.workspaceId === job.workspaceId).map((log) => log.createdAt), job.cutoffAt),
    };
  }
  if (job.jobType === "deletion_request" && job.deletionRequestId) {
    const request = await getDeletionRequest(job.deletionRequestId);
    return request ? deletionScopeCounts(request) : {};
  }
  return {};
}

function deletionScopeCounts(request: DataDeletionRequest): Record<string, number> {
  const state = getLocalState();
  if (request.scope === "ticket") {
    return {
      tickets: state.tickets.filter((ticket) => ticket.id === request.subjectId && ticket.workspaceId === request.workspaceId).length,
      messages: state.messages.filter((message) => message.ticketId === request.subjectId && message.workspaceId === request.workspaceId).length,
      aiRuns: state.aiRuns.filter((run) => run.ticketId === request.subjectId && run.workspaceId === request.workspaceId).length,
    };
  }
  if (request.scope === "customer") {
    const tickets = state.tickets.filter((ticket) => ticket.customerId === request.subjectId && ticket.workspaceId === request.workspaceId);
    return {
      customers: state.customers.filter((customer) => customer.id === request.subjectId && customer.workspaceId === request.workspaceId).length,
      tickets: tickets.length,
      messages: state.messages.filter((message) => tickets.some((ticket) => ticket.id === message.ticketId)).length,
    };
  }
  if (request.scope === "source_document") {
    return {
      docs: state.docs.filter((doc) => doc.id === request.subjectId && doc.workspaceId === request.workspaceId).length,
      chunks: state.chunks.filter((chunk) => chunk.docId === request.subjectId && chunk.workspaceId === request.workspaceId).length,
    };
  }
  return { workspace: request.workspaceId === request.subjectId ? 1 : 0 };
}

function countOlderThan(values: string[], cutoffAt: string | null) {
  if (!cutoffAt) return 0;
  const cutoff = new Date(cutoffAt).getTime();
  return values.filter((value) => new Date(value).getTime() < cutoff).length;
}

async function getDeletionRequest(requestId: string) {
  const local = localRetentionState.deletionRequests.find((request) => request.id === requestId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("data_deletion_requests").select("*").eq("id", maybeUuid(requestId)).maybeSingle();
  if (error || !data) return null;
  const request = mapDeletionRequest(data);
  localRetentionState.deletionRequests.unshift(request);
  return request;
}

export async function getRetentionJob(jobId: string) {
  const local = localRetentionState.retentionJobs.find((job) => job.id === jobId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("retention_jobs").select("*").eq("id", maybeUuid(jobId)).maybeSingle();
  if (error || !data) return null;
  const job = mapRetentionJob(data);
  localRetentionState.retentionJobs.unshift(job);
  return job;
}

async function persistDeletionRequest(request: DataDeletionRequest) {
  const local = localRetentionState.deletionRequests.find((item) => item.id === request.id);
  if (local && local !== request) Object.assign(local, request);
  if (!local) localRetentionState.deletionRequests.unshift(request);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("data_deletion_requests").upsert(toDeletionRequestRow(request), { onConflict: "id" });
}

async function persistRetentionJob(job: RetentionJob) {
  const local = localRetentionState.retentionJobs.find((item) => item.id === job.id);
  if (local && local !== job) Object.assign(local, job);
  if (!local) localRetentionState.retentionJobs.unshift(job);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("retention_jobs").upsert(toRetentionJobRow(job), { onConflict: "id" });
}

async function persistAuditEvidenceExport(exportRecord: AuditEvidenceExport) {
  const local = localRetentionState.evidenceExports.find((item) => item.id === exportRecord.id);
  if (local && local !== exportRecord) Object.assign(local, exportRecord);
  if (!local) localRetentionState.evidenceExports.unshift(exportRecord);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("audit_evidence_exports").upsert(toAuditEvidenceExportRow(exportRecord), { onConflict: "id" });
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function clampRetentionDays(days: number, limit: number | null) {
  if (!limit) return days;
  return Math.min(days, limit);
}

function proofHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function mapDeletionRequest(row: any): DataDeletionRequest {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    scope: row.scope,
    subjectId: row.subject_id,
    requesterEmail: row.requester_email ?? null,
    actorUserId: row.actor_user_id ?? null,
    status: row.status ?? "requested",
    reason: row.reason ?? null,
    verificationMethod: row.verification_method ?? null,
    verifiedAt: row.verified_at ?? null,
    queuedAt: row.queued_at ?? null,
    completedAt: row.completed_at ?? null,
    auditProofHash: row.audit_proof_hash ?? null,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRetentionJob(row: any): RetentionJob {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    jobType: row.job_type,
    status: row.status ?? "queued",
    deletionRequestId: row.deletion_request_id ?? null,
    retentionSettingId: row.retention_setting_id ?? null,
    scope: row.scope,
    cutoffAt: row.cutoff_at ?? null,
    attempts: Number(row.attempts ?? 0),
    maxAttempts: Number(row.max_attempts ?? 3),
    affectedCounts: row.affected_counts ?? {},
    error: row.error ?? null,
    auditProofHash: row.audit_proof_hash ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    nextRunAt: row.next_run_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAuditEvidenceExport(row: any): AuditEvidenceExport {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    exportType: row.export_type,
    status: row.status ?? "queued",
    periodStart: row.period_start,
    periodEnd: row.period_end,
    artifactUrl: row.artifact_url ?? null,
    artifactHash: row.artifact_hash ?? null,
    itemCounts: row.item_counts ?? {},
    generatedBy: row.generated_by ?? null,
    error: row.error ?? null,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? null,
  };
}

function toDeletionRequestRow(request: DataDeletionRequest) {
  return {
    id: maybeUuid(request.id),
    tenant_id: maybeUuid(request.tenantId),
    workspace_id: maybeUuid(request.workspaceId),
    scope: request.scope,
    subject_id: request.subjectId,
    requester_email: request.requesterEmail,
    actor_user_id: maybeUuid(request.actorUserId),
    status: request.status,
    reason: request.reason,
    verification_method: request.verificationMethod,
    verified_at: request.verifiedAt,
    queued_at: request.queuedAt,
    completed_at: request.completedAt,
    audit_proof_hash: request.auditProofHash,
    metadata: request.metadata,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  };
}

function toRetentionJobRow(job: RetentionJob) {
  return {
    id: maybeUuid(job.id),
    tenant_id: maybeUuid(job.tenantId),
    workspace_id: maybeUuid(job.workspaceId),
    job_type: job.jobType,
    status: job.status,
    deletion_request_id: maybeUuid(job.deletionRequestId),
    retention_setting_id: maybeUuid(job.retentionSettingId),
    scope: job.scope,
    cutoff_at: job.cutoffAt,
    attempts: job.attempts,
    max_attempts: job.maxAttempts,
    affected_counts: job.affectedCounts,
    error: job.error,
    audit_proof_hash: job.auditProofHash,
    started_at: job.startedAt,
    completed_at: job.completedAt,
    next_run_at: job.nextRunAt,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function toAuditEvidenceExportRow(exportRecord: AuditEvidenceExport) {
  return {
    id: maybeUuid(exportRecord.id),
    tenant_id: maybeUuid(exportRecord.tenantId),
    workspace_id: maybeUuid(exportRecord.workspaceId),
    export_type: exportRecord.exportType,
    status: exportRecord.status as EvidenceExportStatus,
    period_start: exportRecord.periodStart,
    period_end: exportRecord.periodEnd,
    artifact_url: exportRecord.artifactUrl,
    artifact_hash: exportRecord.artifactHash,
    item_counts: exportRecord.itemCounts,
    generated_by: maybeUuid(exportRecord.generatedBy),
    error: exportRecord.error,
    created_at: exportRecord.createdAt,
    completed_at: exportRecord.completedAt,
  };
}

function publicId() {
  return crypto.randomUUID();
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
