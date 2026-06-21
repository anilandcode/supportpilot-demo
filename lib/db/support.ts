import {
  DEMO_TENANT_ID,
  DEMO_WORKSPACE_ID,
  demoAiRuns,
  demoApprovalPolicies,
  demoAuditLogs,
  demoCustomers,
  demoDomains,
  demoDocumentChunks,
  demoEscalationRules,
  demoFeedback,
  demoKnowledgeDocs,
  demoMemberships,
  demoOrganizations,
  demoMessages,
  demoTickets,
  demoUsageEvents,
  demoUsers,
  demoWidgetConfigs,
  demoWorkspaces,
} from "@/lib/enterprise/demo-data";
import type {
  AIRun,
  AIFeedback,
  ApprovalPolicy,
  AuditLog,
  Customer,
  DashboardMetrics,
  DocumentChunk,
  EnterpriseUser,
  KnowledgeDoc,
  Organization,
  RiskLevel,
  Ticket,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketWithRelations,
  UsageEvent,
  UsageEventType,
  WidgetConfig,
  Workspace,
  WorkspaceDomain,
  WorkspaceLaunchState,
} from "@/lib/enterprise/types";
import { createDeterministicEmbedding } from "@/lib/rag/embeddings";
import type { PendingDocumentChunk } from "@/lib/rag/chunking";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type TicketFilters = {
  workspaceId?: string;
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  assignedAgentId?: string | "all";
  riskLevel?: RiskLevel | "all";
};

const localState = {
  organizations: [...demoOrganizations],
  workspaces: [...demoWorkspaces],
  memberships: [...demoMemberships],
  domains: [...demoDomains],
  widgetConfigs: [...demoWidgetConfigs],
  users: [...demoUsers],
  customers: [...demoCustomers],
  tickets: [...demoTickets],
  messages: [...demoMessages],
  docs: [...demoKnowledgeDocs],
  chunks: [...demoDocumentChunks],
  aiRuns: [...demoAiRuns],
  feedback: [...demoFeedback],
  auditLogs: [...demoAuditLogs],
  escalationRules: [...demoEscalationRules],
  approvalPolicies: [...demoApprovalPolicies],
  usageEvents: [...demoUsageEvents],
};

const DEFAULT_EMBEDDING_MODEL = "deterministic-hash";
const DEFAULT_EMBEDDING_VERSION = "v1";

function publicId(prefix: string) {
  void prefix;
  return crypto.randomUUID();
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

export function getLocalState() {
  return localState;
}

function workspaceIdOrDefault(workspaceId?: string | null) {
  const requested = workspaceId || DEMO_WORKSPACE_ID;
  return localState.workspaces.find((workspace) => workspace.id === requested || workspace.widgetKey === requested)?.id ?? requested;
}

function tenantIdForWorkspace(workspaceId?: string | null) {
  const requested = workspaceIdOrDefault(workspaceId);
  const workspace = localState.workspaces.find((item) => item.id === requested || item.widgetKey === requested);
  return workspace?.tenantId ?? DEMO_TENANT_ID;
}

function normalizeDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}

function contentHash(content: string) {
  let hash = 0;
  for (let index = 0; index < content.length; index++) {
    hash = (hash << 5) - hash + content.charCodeAt(index);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export async function getWorkspace(workspaceId = DEMO_WORKSPACE_ID): Promise<Workspace> {
  const local = localState.workspaces.find((workspace) => workspace.id === workspaceId || workspace.widgetKey === workspaceId);
  if (local) return local;

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const query = supabase.from("workspaces").select("*");
    const { data, error } = maybeUuid(workspaceId)
      ? await query.or(`id.eq.${workspaceId},widget_key.eq.${workspaceId}`).maybeSingle()
      : await query.eq("widget_key", workspaceId).maybeSingle();
    if (!error && data) return mapWorkspace(data);
  }

  return localState.workspaces[0];
}

export async function getWorkspaceLaunchState(workspaceId = DEMO_WORKSPACE_ID): Promise<WorkspaceLaunchState> {
  const workspace = await getWorkspace(workspaceId);
  const [domains, approvalPolicies] = await Promise.all([listWorkspaceDomains(workspace.id), listApprovalPolicies(workspace.id)]);
  const widgetConfig = await getWidgetConfig(workspace.id);
  return { workspace, domains, widgetConfig, approvalPolicies };
}

export async function updateWorkspaceSettings(input: {
  workspaceId?: string;
  name: string;
  botName: string;
  brandColor: string;
  welcomeMessage: string;
  escalationEmail: string;
  calendlyUrl?: string | null;
}) {
  const currentWorkspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const workspaceId = currentWorkspace.id;
  const workspace = localState.workspaces.find((item) => item.id === workspaceId);
  if (workspace) {
    workspace.name = input.name;
    workspace.botName = input.botName;
    workspace.brandColor = input.brandColor;
    workspace.welcomeMessage = input.welcomeMessage;
    workspace.escalationEmail = input.escalationEmail;
    workspace.calendlyUrl = input.calendlyUrl ?? null;
    workspace.updatedAt = new Date().toISOString();
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("workspaces").update({
      name: input.name,
      bot_name: input.botName,
      brand_color: input.brandColor,
      welcome_message: input.welcomeMessage,
      escalation_email: input.escalationEmail,
      calendly_url: input.calendlyUrl ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", workspaceId);
  }

  await appendAuditLog({
    tenantId: tenantIdForWorkspace(workspaceId),
    workspaceId,
    ticketId: null,
    userId: null,
    action: "workspace.settings.updated",
    details: { name: input.name, botName: input.botName },
  });

  return getWorkspace(workspaceId);
}

export async function listWorkspaceDomains(workspaceId = DEMO_WORKSPACE_ID): Promise<WorkspaceDomain[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("workspace_domains").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false });
    if (!error && data) return data.map(mapWorkspaceDomain);
  }

  return localState.domains.filter((domain) => domain.workspaceId === workspace.id);
}

export async function addWorkspaceDomain(input: { workspaceId?: string; domain: string }): Promise<WorkspaceDomain> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const workspaceId = workspace.id;
  const tenantId = workspace.tenantId;
  const domain: WorkspaceDomain = {
    id: publicId("dom"),
    tenantId,
    workspaceId,
    domain: normalizeDomain(input.domain),
    status: "verified",
    createdAt: new Date().toISOString(),
  };

  localState.domains.unshift(domain);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("workspace_domains").insert(toWorkspaceDomainRow(domain));

  await appendAuditLog({
    tenantId,
    workspaceId,
    ticketId: null,
    userId: null,
    action: "workspace.domain.added",
    details: { domain: domain.domain },
  });

  return domain;
}

export async function isOriginAllowed(workspaceId: string, origin: string | null): Promise<boolean> {
  if (!origin) return true;
  let hostname = "";
  try {
    hostname = normalizeDomain(new URL(origin).hostname);
  } catch {
    return false;
  }
  const domains = await listWorkspaceDomains(workspaceId);
  return domains.some((domain) => domain.status === "verified" && hostname === normalizeDomain(domain.domain));
}

export async function getWidgetConfig(workspaceId = DEMO_WORKSPACE_ID): Promise<WidgetConfig> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("widget_configs").select("*").eq("workspace_id", workspace.id).maybeSingle();
    if (!error && data) return mapWidgetConfig(data);
  }

  return localState.widgetConfigs.find((config) => config.workspaceId === workspace.id) ?? localState.widgetConfigs[0];
}

export async function recordUsageEvent(input: {
  workspaceId?: string;
  eventType: UsageEventType;
  quantity?: number;
  metadata?: Record<string, unknown>;
}): Promise<UsageEvent> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const workspaceId = workspace.id;
  const event: UsageEvent = {
    id: publicId("usage"),
    tenantId: workspace.tenantId,
    workspaceId,
    eventType: input.eventType,
    quantity: input.quantity ?? 1,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  localState.usageEvents.unshift(event);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("usage_events").insert(toUsageEventRow(event));
  return event;
}

export async function listApprovalPolicies(workspaceId = DEMO_WORKSPACE_ID): Promise<ApprovalPolicy[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("approval_policies").select("*").eq("workspace_id", workspace.id).eq("active", true);
    if (!error && data) return data.map(mapApprovalPolicy);
  }

  return localState.approvalPolicies.filter((policy) => policy.workspaceId === workspace.id && policy.active);
}

export async function listTickets(filters: TicketFilters = {}): Promise<TicketWithRelations[]> {
  const workspaceId = workspaceIdOrDefault(filters.workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase
      .from("tickets")
      .select("*, customers(*), assigned_agent:users(*)")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false });

    if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
    if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
    if (filters.riskLevel && filters.riskLevel !== "all") query = query.eq("risk_level", filters.riskLevel);
    if (filters.assignedAgentId && filters.assignedAgentId !== "all") query = query.eq("assigned_agent_id", filters.assignedAgentId);

    const { data, error } = await query;
    if (!error && data) {
      return data.map((row: any) => hydrateSupabaseTicket(row));
    }
  }

  return localState.tickets
    .filter((ticket) => ticket.workspaceId === workspaceId)
    .filter((ticket) => !filters.status || filters.status === "all" || ticket.status === filters.status)
    .filter((ticket) => !filters.priority || filters.priority === "all" || ticket.priority === filters.priority)
    .filter((ticket) => !filters.riskLevel || filters.riskLevel === "all" || ticket.riskLevel === filters.riskLevel)
    .filter((ticket) => !filters.assignedAgentId || filters.assignedAgentId === "all" || ticket.assignedAgentId === filters.assignedAgentId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(hydrateTicket);
}

export async function getTicket(ticketId: string): Promise<TicketWithRelations | null> {
  const ticket = localState.tickets.find((item) => item.id === ticketId);
  if (ticket) return hydrateTicket(ticket);

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tickets")
    .select("*, customers(*), assigned_agent:users(*)")
    .eq("id", ticketId)
    .maybeSingle();
  if (error || !data) return null;

  const [{ data: messages }, { data: aiRuns }] = await Promise.all([
    supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true }),
    supabase.from("ai_runs").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: false }).limit(1),
  ]);

  return hydrateSupabaseTicket(data, {
    messages: (messages ?? []).map(mapTicketMessage),
    latestAiRun: aiRuns?.[0] ? mapAiRun(aiRuns[0]) : undefined,
  });
}

export async function listAgents(): Promise<EnterpriseUser[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("role", ["support_agent", "support_manager", "admin"])
      .order("full_name", { ascending: true });
    if (!error && data) return data.map(mapUser);
  }
  return localState.users.filter((user) => user.role === "support_agent" || user.role === "support_manager" || user.role === "admin");
}

export async function listKnowledgeDocs(workspaceId = DEMO_WORKSPACE_ID): Promise<KnowledgeDoc[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("knowledge_docs").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false });
    if (!error && data) return data.map(mapKnowledgeDoc);
  }
  return localState.docs.filter((doc) => doc.workspaceId === resolvedWorkspaceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listDocumentChunks(workspaceId = DEMO_WORKSPACE_ID): Promise<DocumentChunk[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("document_chunks").select("*").eq("workspace_id", resolvedWorkspaceId).eq("approved", true);
    if (!error && data) return data.map(mapDocumentChunk);
  }
  return localState.chunks.filter((chunk) => chunk.workspaceId === resolvedWorkspaceId && chunk.approved);
}

export async function createKnowledgeDocument(input: {
  workspaceId?: string;
  title: string;
  sourceType: KnowledgeDoc["sourceType"];
  content: string;
  chunks: PendingDocumentChunk[];
  sourceVersion?: number;
}): Promise<KnowledgeDoc> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const doc: KnowledgeDoc = {
    id: publicId("doc"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    title: input.title,
    sourceType: input.sourceType,
    sourceVersion: input.sourceVersion ?? 1,
    approved: true,
    url: null,
    content: input.content,
    createdAt: new Date().toISOString(),
  };

  const chunks = input.chunks.map<DocumentChunk>((chunk, index) => ({
    ...chunk,
    id: publicId("chunk"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    docId: doc.id,
    chunkIndex: index,
    approved: true,
    embeddingModel: DEFAULT_EMBEDDING_MODEL,
    embeddingVersion: DEFAULT_EMBEDDING_VERSION,
    contentHash: contentHash(chunk.content),
  }));

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("knowledge_docs").insert(toKnowledgeDocRow(doc));
    await supabase.from("document_chunks").insert(chunks.map(toDocumentChunkRow));
  }

  localState.docs.unshift(doc);
  localState.chunks.unshift(...chunks);
  await recordUsageEvent({
    workspaceId: workspace.id,
    eventType: "knowledge.uploaded",
    metadata: { docId: doc.id, title: doc.title, chunks: chunks.length },
  });
  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: null,
    userId: null,
    action: "knowledge.uploaded",
    details: { title: doc.title, chunks: chunks.length },
  });

  return doc;
}

export async function createAiRun(
  input: Omit<AIRun, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<AIRun, "tenantId" | "workspaceId">>,
): Promise<AIRun> {
  const relatedTicket = input.ticketId ? localState.tickets.find((ticket) => ticket.id === input.ticketId) : null;
  const workspace = await getWorkspace(input.workspaceId ?? relatedTicket?.workspaceId ?? DEMO_WORKSPACE_ID);
  const run: AIRun = {
    ...input,
    id: publicId("airun"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.aiRuns.unshift(run);

  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("ai_runs").insert(toAiRunRow(run));

  await recordUsageEvent({
    workspaceId: run.workspaceId,
    eventType: "ai_run.created",
    metadata: { aiRunId: run.id, ticketId: run.ticketId, confidence: run.confidence },
  });
  await appendAuditLog({
    tenantId: run.tenantId,
    workspaceId: run.workspaceId,
    ticketId: run.ticketId,
    userId: run.userId,
    action: "ai_run.created",
    details: { confidence: run.confidence, riskFlags: run.riskFlags, sources: run.sources },
  });

  return run;
}

export async function updateAiRunDecision(input: {
  aiRunId: string;
  userId: string | null;
  decision: AIRun["approvalStatus"];
  finalResponse?: string;
}): Promise<AIRun | null> {
  const run = localState.aiRuns.find((item) => item.id === input.aiRunId);
  if (!run) return null;

  run.approvalStatus = input.decision;
  if (input.finalResponse) run.response = input.finalResponse;

  if ((input.decision === "approved" || input.decision === "edited") && run.ticketId) {
    localState.messages.push({
      id: publicId("msg"),
      tenantId: run.tenantId,
      workspaceId: run.workspaceId,
      ticketId: run.ticketId,
      sender: "agent",
      authorId: input.userId,
      body: run.response,
      createdAt: new Date().toISOString(),
    });
    const ticket = localState.tickets.find((item) => item.id === run.ticketId);
    if (ticket) {
      ticket.status = "resolved";
      ticket.updatedAt = new Date().toISOString();
    }
  }

  if (input.decision === "escalated" && run.ticketId) {
    const ticket = localState.tickets.find((item) => item.id === run.ticketId);
    if (ticket) {
      ticket.status = "escalated";
      ticket.riskLevel = ticket.riskLevel === "critical" ? "critical" : "high";
      ticket.escalationReason = run.escalationReason ?? "Manual escalation";
      ticket.updatedAt = new Date().toISOString();
    }
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("ai_runs").update({
      approval_status: run.approvalStatus,
      response: run.response,
    }).eq("id", run.id);
  }

  await appendAuditLog({
    tenantId: run.tenantId,
    workspaceId: run.workspaceId,
    ticketId: run.ticketId,
    userId: input.userId,
    action: `ai_run.${input.decision}`,
    details: { aiRunId: run.id, finalResponseEdited: Boolean(input.finalResponse) },
  });
  await recordUsageEvent({
    workspaceId: run.workspaceId,
    eventType: "approval.decided",
    metadata: { aiRunId: run.id, decision: input.decision, ticketId: run.ticketId },
  });

  return run;
}

export async function appendFeedback(input: {
  workspaceId?: string;
  aiRunId?: string | null;
  messageId?: string | null;
  userId?: string | null;
  rating: AIFeedback["rating"];
}) {
  const relatedRun = input.aiRunId ? localState.aiRuns.find((run) => run.id === input.aiRunId) : null;
  const relatedMessage = input.messageId ? localState.messages.find((message) => message.id === input.messageId) : null;
  const workspace = await getWorkspace(input.workspaceId ?? relatedRun?.workspaceId ?? relatedMessage?.workspaceId ?? DEMO_WORKSPACE_ID);
  const feedback: AIFeedback = {
    id: publicId("fb"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    aiRunId: input.aiRunId ?? null,
    messageId: input.messageId ?? null,
    userId: input.userId ?? null,
    rating: input.rating,
    createdAt: new Date().toISOString(),
  };
  localState.feedback.unshift(feedback);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("ai_feedback").insert(toFeedbackRow(feedback));
  return feedback;
}

export async function appendAuditLog(
  input: Omit<AuditLog, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<AuditLog, "tenantId" | "workspaceId">>,
): Promise<AuditLog> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const log: AuditLog = {
    ...input,
    id: publicId("audit"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.auditLogs.unshift(log);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("audit_logs").insert(toAuditLogRow(log));
  return log;
}

export async function getDashboardMetrics(workspaceId = DEMO_WORKSPACE_ID): Promise<DashboardMetrics> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const [{ data: tickets }, { data: aiRuns }] = await Promise.all([
      supabase.from("tickets").select("id,status,subject").eq("workspace_id", resolvedWorkspaceId),
      supabase.from("ai_runs").select("approval_status,confidence,prompt").eq("workspace_id", resolvedWorkspaceId),
    ]);

    if (tickets && aiRuns) {
      return calculateMetrics(
        tickets.map((ticket: any) => ({
          id: ticket.id,
          status: ticket.status,
          subject: ticket.subject,
        })),
        aiRuns.map((run: any) => ({
          approvalStatus: run.approval_status,
          confidence: Number(run.confidence ?? 0),
          prompt: run.prompt ?? "",
        })),
      );
    }
  }

  return calculateMetrics(
    localState.tickets.filter((ticket) => ticket.workspaceId === resolvedWorkspaceId).map((ticket) => ({ id: ticket.id, status: ticket.status, subject: ticket.subject })),
    localState.aiRuns.filter((run) => run.workspaceId === resolvedWorkspaceId).map((run) => ({ approvalStatus: run.approvalStatus, confidence: run.confidence, prompt: run.prompt })),
  );
}

export async function listApprovalQueue(workspaceId = DEMO_WORKSPACE_ID): Promise<AIRun[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("ai_runs").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false }).limit(100);
    if (!error && data) {
      return data.map(mapAiRun).filter((run) => run.approvalStatus === "escalated" || run.riskFlags.length > 0);
    }
  }

  return localState.aiRuns.filter((run) => run.workspaceId === resolvedWorkspaceId && (run.approvalStatus === "escalated" || run.riskFlags.length > 0));
}

function calculateMetrics(
  tickets: { id: string; status: TicketStatus; subject: string }[],
  aiRuns: { approvalStatus: AIRun["approvalStatus"]; confidence: number; prompt: string }[],
): DashboardMetrics {
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved").length;
  const escalatedTickets = tickets.filter((ticket) => ticket.status === "escalated").length;
  const decidedRuns = aiRuns.filter((run) => run.approvalStatus !== "draft");
  const acceptedRuns = decidedRuns.filter((run) => run.approvalStatus === "approved" || run.approvalStatus === "edited");
  const lowConfidence = aiRuns.filter((run) => run.confidence < 0.72);

  return {
    totalTickets,
    resolvedTickets,
    escalatedTickets,
    acceptanceRate: decidedRuns.length === 0 ? 0 : Math.round((acceptedRuns.length / decidedRuns.length) * 100),
    responseTimeMinutes: 14,
    escalationRate: totalTickets === 0 ? 0 : Math.round((escalatedTickets / totalTickets) * 100),
    missingTopics: lowConfidence.slice(0, 5).map((run) => ({
      topic: run.prompt.replace(/^Draft a support reply for /, ""),
      count: 1,
    })),
    topQuestions: tickets.slice(0, 5).map((ticket) => ({ question: ticket.subject, count: 1 })),
  };
}

function hydrateTicket(ticket: Ticket): TicketWithRelations {
  const customer = localState.customers.find((item) => item.id === ticket.customerId) ?? localState.customers[0];
  const assignedAgent = localState.users.find((item) => item.id === ticket.assignedAgentId) ?? null;
  const messages = localState.messages.filter((item) => item.ticketId === ticket.id);
  const latestAiRun = localState.aiRuns.find((item) => item.ticketId === ticket.id);
  return { ...ticket, customer, assignedAgent, messages, latestAiRun };
}

function hydrateSupabaseTicket(
  row: any,
  relations: { messages?: TicketWithRelations["messages"]; latestAiRun?: AIRun } = {},
): TicketWithRelations {
  return {
    ...mapTicket(row),
    customer: row.customers ? mapCustomer(row.customers) : localState.customers[0],
    assignedAgent: row.assigned_agent ? mapUser(row.assigned_agent) : null,
    messages: relations.messages ?? [],
    latestAiRun: relations.latestAiRun,
  };
}

function mapUser(row: any): EnterpriseUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
  };
}

function mapWorkspace(row: any): Workspace {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? row.organization_id ?? DEMO_TENANT_ID,
    name: row.name,
    slug: row.slug,
    botName: row.bot_name ?? "Pilot",
    brandColor: row.brand_color ?? "#10b981",
    accentForeground: row.accent_foreground ?? "#ffffff",
    welcomeMessage: row.welcome_message ?? "Hi, I can help with approved support answers.",
    escalationEmail: row.escalation_email ?? "support@example.com",
    calendlyUrl: row.calendly_url ?? null,
    widgetKey: row.widget_key,
    monthlyReplyLimit: row.monthly_reply_limit ?? 1000,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkspaceDomain(row: any): WorkspaceDomain {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    domain: row.domain,
    status: row.status ?? "pending",
    createdAt: row.created_at,
  };
}

function mapWidgetConfig(row: any): WidgetConfig {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    launcherLabel: row.launcher_label ?? "Chat",
    position: row.position ?? "bottom-right",
    showBranding: row.show_branding ?? true,
    privacyText: row.privacy_text ?? "Answers are generated from approved support sources.",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapApprovalPolicy(row: any): ApprovalPolicy {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    riskCategory: row.risk_category,
    minConfidenceToAutoSend: Number(row.min_confidence_to_auto_send ?? 0.72),
    requireApproval: row.require_approval ?? true,
    allowedActions: row.allowed_actions ?? [],
    approverRole: row.approver_role ?? "manager",
    active: row.active ?? true,
  };
}

function mapCustomer(row: any): Customer {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    name: row.name,
    email: row.email,
    company: row.company,
    plan: row.plan,
    healthScore: row.health_score,
    metadata: row.metadata ?? {},
  };
}

function mapTicket(row: any): Ticket {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    riskLevel: row.risk_level,
    customerId: row.customer_id,
    assignedAgentId: row.assigned_agent_id,
    escalationReason: row.escalation_reason,
    sentiment: row.sentiment,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapKnowledgeDoc(row: any): KnowledgeDoc {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    title: row.title,
    sourceType: row.source_type,
    sourceVersion: row.source_version ?? 1,
    approved: row.approved,
    url: row.url,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapDocumentChunk(row: any): DocumentChunk {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    docId: row.doc_id,
    source: row.source,
    heading: row.heading,
    content: row.content,
    chunkIndex: row.chunk_index,
    approved: row.approved,
    embeddingModel: row.embedding_model ?? DEFAULT_EMBEDDING_MODEL,
    embeddingVersion: row.embedding_version ?? DEFAULT_EMBEDDING_VERSION,
    contentHash: row.content_hash ?? contentHash(row.content ?? ""),
    score: row.score ?? row.similarity,
  };
}

function mapTicketMessage(row: any): TicketMessage {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    ticketId: row.ticket_id,
    sender: row.sender,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapAiRun(row: any): AIRun {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    ticketId: row.ticket_id,
    userId: row.user_id,
    prompt: row.prompt,
    response: row.response,
    model: row.model,
    latencyMs: row.latency_ms,
    confidence: Number(row.confidence ?? 0),
    approvalStatus: row.approval_status,
    escalationReason: row.escalation_reason,
    riskFlags: row.risk_flags ?? [],
    sources: row.sources ?? [],
    rationale: row.rationale ?? "",
    createdAt: row.created_at,
  };
}

function toWorkspaceDomainRow(domain: WorkspaceDomain) {
  return {
    id: maybeUuid(domain.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(domain.tenantId),
    workspace_id: maybeUuid(domain.workspaceId),
    domain: domain.domain,
    status: domain.status,
    created_at: domain.createdAt,
  };
}

function toUsageEventRow(event: UsageEvent) {
  return {
    id: maybeUuid(event.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(event.tenantId),
    workspace_id: maybeUuid(event.workspaceId),
    event_type: event.eventType,
    quantity: event.quantity,
    metadata: event.metadata,
    created_at: event.createdAt,
  };
}

function toKnowledgeDocRow(doc: KnowledgeDoc) {
  return {
    id: maybeUuid(doc.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(doc.tenantId),
    workspace_id: maybeUuid(doc.workspaceId),
    title: doc.title,
    source_type: doc.sourceType,
    source_version: doc.sourceVersion,
    approved: doc.approved,
    url: doc.url,
    content: doc.content,
    created_at: doc.createdAt,
  };
}

function toDocumentChunkRow(chunk: DocumentChunk) {
  return {
    id: maybeUuid(chunk.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(chunk.tenantId),
    workspace_id: maybeUuid(chunk.workspaceId),
    doc_id: maybeUuid(chunk.docId),
    source: chunk.source,
    heading: chunk.heading,
    content: chunk.content,
    chunk_index: chunk.chunkIndex,
    approved: chunk.approved,
    embedding_model: chunk.embeddingModel,
    embedding_version: chunk.embeddingVersion,
    content_hash: chunk.contentHash,
    embedding: createDeterministicEmbedding(chunk.content),
  };
}

function toAiRunRow(run: AIRun) {
  return {
    id: maybeUuid(run.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(run.tenantId),
    workspace_id: maybeUuid(run.workspaceId),
    ticket_id: maybeUuid(run.ticketId),
    user_id: maybeUuid(run.userId),
    prompt: run.prompt,
    response: run.response,
    model: run.model,
    latency_ms: run.latencyMs,
    confidence: run.confidence,
    approval_status: run.approvalStatus,
    escalation_reason: run.escalationReason,
    risk_flags: run.riskFlags,
    sources: run.sources,
    rationale: run.rationale,
    created_at: run.createdAt,
  };
}

function toFeedbackRow(feedback: AIFeedback) {
  return {
    id: maybeUuid(feedback.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(feedback.tenantId),
    workspace_id: maybeUuid(feedback.workspaceId),
    ai_run_id: maybeUuid(feedback.aiRunId),
    message_id: maybeUuid(feedback.messageId),
    user_id: maybeUuid(feedback.userId),
    rating: feedback.rating,
    created_at: feedback.createdAt,
  };
}

function toAuditLogRow(log: AuditLog) {
  return {
    id: maybeUuid(log.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(log.tenantId),
    workspace_id: maybeUuid(log.workspaceId),
    ticket_id: maybeUuid(log.ticketId),
    user_id: maybeUuid(log.userId),
    action: log.action,
    details: log.details,
    created_at: log.createdAt,
  };
}
