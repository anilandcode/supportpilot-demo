import { PDFParse } from "pdf-parse";
import { getProjectedPlanLimitBlock } from "@/lib/billing/core";
import { getBillingSnapshot } from "@/lib/billing/plans";
import { appendAuditLog, createKnowledgeDocument, getLocalState, getWorkspace } from "@/lib/db/support";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import type { KnowledgeDoc, KnowledgeIngestionJob } from "@/lib/enterprise/types";
import { chunkDocument } from "@/lib/rag/chunking";
import { embeddingContentHash } from "@/lib/rag/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isProductionMode } from "@/lib/supabase/config";

type CreateIngestionJobInput = {
  workspaceId?: string;
  title: string;
  sourceType: KnowledgeDoc["sourceType"];
  content?: string;
  fileBase64?: string;
  contentType?: string | null;
  filename?: string | null;
  actorUserId?: string | null;
  asyncRequested?: boolean;
};

const localIngestionJobs: KnowledgeIngestionJob[] = [];

export function getLocalIngestionJobs() {
  return localIngestionJobs;
}

export async function listIngestionJobs(workspaceId = DEMO_WORKSPACE_ID): Promise<KnowledgeIngestionJob[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("knowledge_ingestion_jobs")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapIngestionJob);
  }
  return localIngestionJobs.filter((job) => job.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listDueIngestionJobs(workspaceId = DEMO_WORKSPACE_ID, now = new Date(), limit = 25): Promise<KnowledgeIngestionJob[]> {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const jobs = await listIngestionJobs(workspaceId);
  return jobs
    .filter((job) => job.status === "queued" && (!job.nextRunAt || Date.parse(job.nextRunAt) <= now.getTime()))
    .sort((a, b) => {
      const aTime = a.nextRunAt ? Date.parse(a.nextRunAt) : Date.parse(a.createdAt);
      const bTime = b.nextRunAt ? Date.parse(b.nextRunAt) : Date.parse(b.createdAt);
      return aTime - bTime;
    })
    .slice(0, safeLimit);
}

export async function processDueIngestionJobs(input: { workspaceId?: string | null; now?: Date; limit?: number; actorUserId?: string | null } = {}) {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const now = input.now ?? new Date();
  const limit = Math.max(1, Math.min(Math.floor(input.limit ?? 25), 100));
  const due = await listDueIngestionJobs(workspace.id, now, limit);
  const results: Array<{
    jobId: string;
    status: KnowledgeIngestionJob["status"];
    attempts: number;
    docId: string | null;
    chunksEmbedded: number;
    error: string | null;
  }> = [];

  for (const job of due) {
    const result = await processIngestionJob(job.id, { actorUserId: input.actorUserId });
    results.push({
      jobId: result.id,
      status: result.status,
      attempts: result.attempts,
      docId: result.docId,
      chunksEmbedded: result.chunksEmbedded,
      error: result.error,
    });
  }

  return {
    workspaceId: workspace.id,
    checkedAt: now.toISOString(),
    limit,
    selected: due.length,
    succeeded: results.filter((result) => result.status === "succeeded").length,
    queued: results.filter((result) => result.status === "queued").length,
    failed: results.filter((result) => result.status === "failed").length,
    needsReview: results.filter((result) => result.status === "needs_review").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    results,
  };
}

export async function createIngestionJob(input: CreateIngestionJobInput): Promise<{ job: KnowledgeIngestionJob; queued: boolean }> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const sourceContentHash = sourceHash(input);
  const now = new Date().toISOString();

  const duplicate = await findDuplicateSuccessfulJob(workspace.id, sourceContentHash);
  if (duplicate) {
    const job: KnowledgeIngestionJob = {
      id: publicId("ingest"),
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      docId: duplicate.docId,
      jobType: inferJobType(input),
      status: "skipped",
      sourceType: input.sourceType,
      title: input.title,
      contentType: input.contentType ?? null,
      sourceContentHash,
      storageUrl: null,
      payload: { filename: input.filename, duplicateOf: duplicate.id },
      attempts: 0,
      maxAttempts: 3,
      chunksTotal: 0,
      chunksEmbedded: 0,
      error: "Duplicate source content already ingested.",
      startedAt: null,
      completedAt: now,
      nextRunAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await persistJob(job);
    return { job, queued: false };
  }

  const storedPayload = await buildPayload(input, workspace.id, sourceContentHash);
  const job: KnowledgeIngestionJob = {
    id: publicId("ingest"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    docId: null,
    jobType: inferJobType(input),
    status: "queued",
    sourceType: input.sourceType,
    title: input.title,
    contentType: input.contentType ?? null,
    sourceContentHash,
    storageUrl: storedPayload.storageUrl,
    payload: storedPayload.payload,
    attempts: 0,
    maxAttempts: 3,
    chunksTotal: 0,
    chunksEmbedded: 0,
    error: null,
    startedAt: null,
    completedAt: null,
    nextRunAt: null,
    createdAt: now,
    updatedAt: now,
  };

  localIngestionJobs.unshift(job);
  await persistJob(job);

  if (storedPayload.error && isProductionMode() && input.asyncRequested) {
    job.status = "needs_review";
    job.error = storedPayload.error;
    job.completedAt = now;
    job.updatedAt = now;
    await persistJob(job);
    await appendAuditLog({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      ticketId: null,
      userId: input.actorUserId ?? null,
      action: "knowledge.ingestion.storage_failed",
      details: { jobId: job.id, title: job.title, error: storedPayload.error },
    });
    return { job, queued: false };
  }

  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: null,
    userId: input.actorUserId ?? null,
    action: "knowledge.ingestion.queued",
    details: { jobId: job.id, jobType: job.jobType, title: job.title, asyncRequested: Boolean(input.asyncRequested) },
  });

  const qstashQueued = input.asyncRequested ? await enqueueWithQStash(job).catch(() => false) : false;
  if (qstashQueued) return { job, queued: true };

  const processed = await processIngestionJob(job.id, { actorUserId: input.actorUserId });
  return { job: processed, queued: false };
}

export async function processIngestionJob(jobId: string, input: { actorUserId?: string | null } = {}): Promise<KnowledgeIngestionJob> {
  const job = await getIngestionJob(jobId);
  if (!job) throw new Error(`Ingestion job ${jobId} was not found`);
  if (job.status === "succeeded" || job.status === "skipped") return job;

  job.status = "running";
  job.attempts += 1;
  job.startedAt ??= new Date().toISOString();
  job.updatedAt = new Date().toISOString();
  await persistJob(job);

  try {
    const text = await extractJobText(job);
    if (!text.trim()) {
      job.status = "needs_review";
      job.error = "No extractable text was found.";
      job.completedAt = new Date().toISOString();
      job.updatedAt = job.completedAt;
      await persistJob(job);
      return job;
    }

    if (hasDuplicateDoc(job.workspaceId, text)) {
      job.status = "skipped";
      job.error = "Duplicate source content already ingested.";
      job.completedAt = new Date().toISOString();
      job.updatedAt = job.completedAt;
      await persistJob(job);
      return job;
    }

    const chunks = chunkDocument({ docId: "pending", title: job.title, content: text });
    const planLimitBlock = await getIngestionPlanLimitBlock(job.workspaceId, chunks.length);
    if (planLimitBlock) {
      job.status = "needs_review";
      job.error = planLimitBlock.message;
      job.chunksTotal = chunks.length;
      job.chunksEmbedded = 0;
      job.completedAt = new Date().toISOString();
      job.updatedAt = job.completedAt;
      await persistJob(job);
      await appendAuditLog({
        tenantId: job.tenantId,
        workspaceId: job.workspaceId,
        ticketId: null,
        userId: input.actorUserId ?? null,
        action: "knowledge.ingestion.plan_limited",
        details: { jobId: job.id, metric: planLimitBlock.metricKey, used: planLimitBlock.used, limit: planLimitBlock.limit, pending: planLimitBlock.pending },
      });
      return job;
    }

    const doc = await createKnowledgeDocument({
      workspaceId: job.workspaceId,
      title: job.title,
      sourceType: job.sourceType,
      content: text,
      chunks,
    });

    job.docId = doc.id;
    job.chunksTotal = chunks.length;
    job.chunksEmbedded = chunks.length;
    job.status = "succeeded";
    job.error = null;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    await persistJob(job);
    await appendAuditLog({
      tenantId: job.tenantId,
      workspaceId: job.workspaceId,
      ticketId: null,
      userId: input.actorUserId ?? null,
      action: "knowledge.ingestion.succeeded",
      details: { jobId: job.id, docId: doc.id, chunks: chunks.length },
    });
    return job;
  } catch (error) {
    job.error = error instanceof Error ? error.message : "unknown ingestion error";
    job.status = job.attempts >= job.maxAttempts ? "failed" : "queued";
    job.nextRunAt = job.status === "queued" ? new Date(Date.now() + Math.min(60_000 * job.attempts, 300_000)).toISOString() : null;
    job.completedAt = job.status === "failed" ? new Date().toISOString() : null;
    job.updatedAt = new Date().toISOString();
    await persistJob(job);
    return job;
  }
}

export async function retryIngestionJob(jobId: string, actorUserId?: string | null) {
  const job = await getIngestionJob(jobId);
  if (!job) throw new Error(`Ingestion job ${jobId} was not found`);
  job.status = "queued";
  job.error = null;
  job.nextRunAt = null;
  job.updatedAt = new Date().toISOString();
  await persistJob(job);
  return processIngestionJob(job.id, { actorUserId });
}

export async function getIngestionJob(jobId: string) {
  const local = localIngestionJobs.find((job) => job.id === jobId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("knowledge_ingestion_jobs").select("*").eq("id", maybeUuid(jobId)).maybeSingle();
  if (error || !data) return null;
  const job = mapIngestionJob(data);
  localIngestionJobs.unshift(job);
  return job;
}

async function findDuplicateSuccessfulJob(workspaceId: string, sourceContentHash: string) {
  const local = localIngestionJobs.find((job) => job.workspaceId === workspaceId && job.sourceContentHash === sourceContentHash && (job.status === "succeeded" || job.status === "skipped"));
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("knowledge_ingestion_jobs")
    .select("*")
    .eq("workspace_id", maybeUuid(workspaceId))
    .eq("source_content_hash", sourceContentHash)
    .in("status", ["succeeded", "skipped"])
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapIngestionJob(data);
}

function hasDuplicateDoc(workspaceId: string, content: string) {
  const hash = embeddingContentHash(content);
  return getLocalState().docs.some((doc) => doc.workspaceId === workspaceId && embeddingContentHash(doc.content) === hash);
}

async function getIngestionPlanLimitBlock(workspaceId: string, pendingChunks: number) {
  const billing = await getBillingSnapshot(workspaceId);
  const projected = getProjectedPlanLimitBlock(billing, { sources: 1, documentChunks: pendingChunks });
  if (!projected) return null;

  const [metricKey, pending] = projected;
  const metric = billing.metrics[metricKey];
  return {
    metricKey,
    pending,
    used: metric.used,
    limit: metric.limit,
    message: `Plan limit reached for ${metric.label} (${metric.used}/${metric.limit}) before ingestion. Upgrade or remove sources before retrying.`,
  };
}

async function extractJobText(job: KnowledgeIngestionJob) {
  const stored = await readStoredPayload(job);
  if (stored) return extractBufferText(stored.buffer, job.contentType, stored.filename);
  if (typeof job.payload.content === "string") return job.payload.content;
  if (typeof job.payload.fileBase64 === "string") {
    const buffer = Buffer.from(job.payload.fileBase64, "base64");
    return extractBufferText(buffer, job.contentType, String(job.payload.filename ?? ""));
  }
  return "";
}

async function extractBufferText(buffer: Buffer, contentType: string | null, filename?: string | null) {
  if (contentType === "application/pdf" || /\.pdf$/i.test(String(filename ?? ""))) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  return buffer.toString("utf8");
}

async function enqueueWithQStash(job: KnowledgeIngestionJob) {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const workerSecret = process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET;
  if (!token || !appUrl || !workerSecret) return false;
  const target = new URL(`/api/knowledge/ingest/jobs/${job.id}/run`, appUrl).toString();
  const response = await fetch("https://qstash.upstash.io/v2/publish/" + encodeURIComponent(target), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Upstash-Forward-X-Supportpilot-Worker-Secret": workerSecret,
    },
    body: JSON.stringify({ jobId: job.id }),
    cache: "no-store",
  });
  return response.ok;
}

async function persistJob(job: KnowledgeIngestionJob) {
  const local = localIngestionJobs.find((item) => item.id === job.id);
  if (local && local !== job) Object.assign(local, job);
  if (!local) localIngestionJobs.unshift(job);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("knowledge_ingestion_jobs").upsert(toIngestionJobRow(job), { onConflict: "id" });
}

async function buildPayload(input: CreateIngestionJobInput, workspaceId: string, sourceContentHash: string): Promise<{ payload: Record<string, unknown>; storageUrl: string | null; error: string | null }> {
  const stored = await storeSourcePayload(input, workspaceId, sourceContentHash);
  if (stored.storageUrl) {
    return {
      payload: {
        filename: input.filename,
        sourceBytes: stored.sourceBytes,
        storageRef: stored.storageUrl,
      },
      storageUrl: stored.storageUrl,
      error: null,
    };
  }

  return {
    payload: {
      content: input.content,
      fileBase64: input.fileBase64,
      filename: input.filename,
    },
    storageUrl: null,
    error: stored.error,
  };
}

async function storeSourcePayload(input: CreateIngestionJobInput, workspaceId: string, sourceContentHash: string): Promise<{ storageUrl: string | null; sourceBytes: number; error: string | null }> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { storageUrl: null, sourceBytes: 0, error: null };

  const buffer = input.fileBase64 ? Buffer.from(input.fileBase64, "base64") : input.content ? Buffer.from(input.content, "utf8") : null;
  if (!buffer) return { storageUrl: null, sourceBytes: 0, error: null };

  const bucket = sourceBucketName();
  const path = storagePath(workspaceId, sourceContentHash, input.filename ?? `${input.title}.txt`);
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: input.contentType ?? "text/plain",
    upsert: false,
  });
  if (error) return { storageUrl: null, sourceBytes: buffer.byteLength, error: `Source storage upload failed: ${error.message}` };
  return { storageUrl: `supabase://${bucket}/${path}`, sourceBytes: buffer.byteLength, error: null };
}

async function readStoredPayload(job: KnowledgeIngestionJob): Promise<{ buffer: Buffer; filename: string | null } | null> {
  const storageUrl = typeof job.storageUrl === "string" ? job.storageUrl : typeof job.payload.storageRef === "string" ? job.payload.storageRef : null;
  const ref = parseStorageUrl(storageUrl);
  if (!ref) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase service role is required to read stored ingestion source.");

  const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);
  if (error || !data) throw new Error(`Stored ingestion source download failed: ${error?.message ?? "missing object"}`);
  return { buffer: Buffer.from(await data.arrayBuffer()), filename: String(job.payload.filename ?? ref.path.split("/").pop() ?? "") };
}

function parseStorageUrl(storageUrl: string | null | undefined) {
  if (!storageUrl?.startsWith("supabase://")) return null;
  const withoutScheme = storageUrl.slice("supabase://".length);
  const slashIndex = withoutScheme.indexOf("/");
  if (slashIndex <= 0) return null;
  return {
    bucket: withoutScheme.slice(0, slashIndex),
    path: withoutScheme.slice(slashIndex + 1),
  };
}

function sourceBucketName() {
  return process.env.SUPPORTPILOT_KNOWLEDGE_SOURCE_BUCKET || "supportpilot-knowledge-sources";
}

function storagePath(workspaceId: string, sourceContentHash: string, filename: string) {
  return `${workspaceId}/${sourceContentHash.slice(0, 16)}/${safeFilename(filename)}`;
}

function safeFilename(filename: string) {
  const normalized = filename.trim().replace(/[/\\]/g, "-").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "source.txt";
}

function inferJobType(input: CreateIngestionJobInput): KnowledgeIngestionJob["jobType"] {
  if (input.contentType === "application/pdf" || /\.pdf$/i.test(input.filename ?? "")) return "extract_pdf";
  if (/\.md$/i.test(input.filename ?? "")) return "ingest_markdown";
  return input.content ? "ingest_text" : "ingest_markdown";
}

function sourceHash(input: CreateIngestionJobInput) {
  return embeddingContentHash(input.content ?? input.fileBase64 ?? input.title);
}

function mapIngestionJob(row: any): KnowledgeIngestionJob {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    docId: row.doc_id ?? null,
    jobType: row.job_type ?? "ingest_text",
    status: row.status ?? "queued",
    sourceType: row.source_type ?? "upload",
    title: row.title,
    contentType: row.content_type ?? null,
    sourceContentHash: row.source_content_hash,
    storageUrl: row.storage_url ?? null,
    payload: row.payload ?? {},
    attempts: Number(row.attempts ?? 0),
    maxAttempts: Number(row.max_attempts ?? 3),
    chunksTotal: Number(row.chunks_total ?? 0),
    chunksEmbedded: Number(row.chunks_embedded ?? 0),
    error: row.error ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    nextRunAt: row.next_run_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toIngestionJobRow(job: KnowledgeIngestionJob) {
  return {
    id: maybeUuid(job.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(job.tenantId),
    workspace_id: maybeUuid(job.workspaceId),
    doc_id: maybeUuid(job.docId),
    job_type: job.jobType,
    status: job.status,
    source_type: job.sourceType,
    title: job.title,
    content_type: job.contentType,
    source_content_hash: job.sourceContentHash,
    storage_url: job.storageUrl,
    payload: job.payload,
    attempts: job.attempts,
    max_attempts: job.maxAttempts,
    chunks_total: job.chunksTotal,
    chunks_embedded: job.chunksEmbedded,
    error: job.error,
    started_at: job.startedAt,
    completed_at: job.completedAt,
    next_run_at: job.nextRunAt,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function publicId(prefix: string) {
  void prefix;
  return crypto.randomUUID();
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
