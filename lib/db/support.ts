import {
  DEMO_TENANT_ID,
  DEMO_WORKSPACE_ID,
  demoAgentRuns,
  demoAiRuns,
  demoApprovalPolicies,
  demoAuditLogs,
  demoChecklistItems,
  demoCustomers,
  demoDomains,
  demoDocumentChunks,
  demoEscalationRules,
  demoFeedback,
  demoGoldenQuestions,
  demoGroundingChecks,
  demoKnowledgeDocs,
  demoMemberships,
  demoMissingKnowledgeTasks,
  demoModelRouteLogs,
  demoOrganizations,
  demoMessages,
  demoPolicyEvaluations,
  demoRetentionSettings,
  demoSecurityEvents,
  demoTickets,
  demoToolCalls,
  demoToolDefinitions,
  demoUsageEvents,
  demoUsers,
  demoWidgetSessions,
  demoWidgetConfigs,
  demoWorkspaces,
} from "@/lib/enterprise/demo-data";
import type {
  AgentRun,
  AIRun,
  AIFeedback,
  ApprovalPolicy,
  AuditLog,
  Customer,
  DashboardMetrics,
  DocumentChunk,
  EnterpriseUser,
  GoldenQuestion,
  GroundingCheck,
  KnowledgeDoc,
  MissingKnowledgeTask,
  ModelRouteLog,
  Organization,
  PolicyEvaluation,
  RetentionSetting,
  RiskLevel,
  SecurityEvent,
  Ticket,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketWithRelations,
  ToolCall,
  ToolDefinition,
  UsageEvent,
  UsageEventType,
  WidgetConfig,
  WidgetSession,
  Workspace,
  WorkspaceChecklistItem,
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
  checklistItems: [...demoChecklistItems],
  goldenQuestions: [...demoGoldenQuestions],
  missingKnowledgeTasks: [...demoMissingKnowledgeTasks],
  modelRouteLogs: [...demoModelRouteLogs],
  securityEvents: [...demoSecurityEvents],
  widgetSessions: [...demoWidgetSessions],
  retentionSettings: [...demoRetentionSettings],
  toolDefinitions: [...demoToolDefinitions],
  toolCalls: [...demoToolCalls],
  agentRuns: [...demoAgentRuns],
  policyEvaluations: [...demoPolicyEvaluations],
  groundingChecks: [...demoGroundingChecks],
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

async function resolveCustomerId(workspaceId: string) {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data } = await supabase.from("customers").select("id").eq("workspace_id", workspaceId).limit(1).maybeSingle();
    if (data?.id) return data.id;
  }

  const localCustomer = localState.customers.find((customer) => customer.workspaceId === workspaceId);
  if (localCustomer) return localCustomer.id;

  return localState.customers[0]?.id ?? crypto.randomUUID();
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
  const [domains, approvalPolicies, checklist, goldenQuestions, missingKnowledge, retention] = await Promise.all([
    listWorkspaceDomains(workspace.id),
    listApprovalPolicies(workspace.id),
    listWorkspaceChecklist(workspace.id),
    listGoldenQuestions(workspace.id),
    listMissingKnowledgeTasks(workspace.id),
    getRetentionSetting(workspace.id),
  ]);
  const widgetConfig = await getWidgetConfig(workspace.id);
  const health = await getWorkspaceHealth(workspace.id);
  return { workspace, domains, widgetConfig, approvalPolicies, checklist, goldenQuestions, missingKnowledge, retention, health };
}

export async function listWorkspaceChecklist(workspaceId = DEMO_WORKSPACE_ID): Promise<WorkspaceChecklistItem[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("workspace_checklist_items")
      .select("*")
      .eq("workspace_id", resolvedWorkspaceId)
      .order("created_at", { ascending: true });
    if (!error && data) return data.map(mapChecklistItem);
  }
  return localState.checklistItems.filter((item) => item.workspaceId === resolvedWorkspaceId);
}

export async function completeOnboardingStep(input: { workspaceId?: string; step: WorkspaceChecklistItem["step"] }) {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const item = localState.checklistItems.find((row) => row.workspaceId === workspace.id && row.step === input.step);
  if (item) {
    item.completed = true;
    item.completedAt = new Date().toISOString();
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase
      .from("workspace_checklist_items")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("workspace_id", workspace.id)
      .eq("step", input.step);
  }

  await recordUsageEvent({
    workspaceId: workspace.id,
    eventType: "onboarding_step_completed",
    metadata: { step: input.step },
  });
  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: null,
    userId: null,
    action: "onboarding.step.completed",
    details: { step: input.step },
  });

  return listWorkspaceChecklist(workspace.id);
}

export async function listGoldenQuestions(workspaceId = DEMO_WORKSPACE_ID): Promise<GoldenQuestion[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("golden_questions").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: true });
    if (!error && data) return data.map(mapGoldenQuestion);
  }
  return localState.goldenQuestions.filter((question) => question.workspaceId === resolvedWorkspaceId);
}

export async function getRetentionSetting(workspaceId = DEMO_WORKSPACE_ID): Promise<RetentionSetting | null> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("retention_settings").select("*").eq("workspace_id", resolvedWorkspaceId).maybeSingle();
    if (!error && data) return mapRetentionSetting(data);
  }
  return localState.retentionSettings.find((item) => item.workspaceId === resolvedWorkspaceId) ?? null;
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

export async function createPortalTicket(input: {
  workspaceId?: string;
  subject: string;
  category?: string;
  description: string;
}): Promise<TicketWithRelations> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const now = new Date().toISOString();
  const category = (input.category || "general").toLowerCase();
  const priority: TicketPriority = /billing|refund|security|legal|scim|sso/.test(category) ? "high" : "medium";
  const riskLevel: RiskLevel = /refund|security|legal|scim|sso/.test(category) ? "medium" : "low";
  const customerId = await resolveCustomerId(workspace.id);
  const ticket: Ticket = {
    id: publicId("tkt"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    subject: input.subject,
    status: "new",
    priority,
    riskLevel,
    customerId,
    assignedAgentId: null,
    escalationReason: null,
    sentiment: "neutral",
    tags: ["portal", category.replace(/[^a-z0-9_-]/g, "_")],
    createdAt: now,
    updatedAt: now,
  };
  const message: TicketMessage = {
    id: publicId("msg"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: ticket.id,
    sender: "customer",
    authorId: null,
    body: input.description,
    createdAt: now,
  };

  localState.tickets.unshift(ticket);
  localState.messages.push(message);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("tickets").insert(toTicketRow(ticket));
    await supabase.from("ticket_messages").insert(toTicketMessageRow(message));
  }

  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: ticket.id,
    userId: null,
    action: "ticket.portal.created",
    details: { category, subject: input.subject },
  });

  return hydrateTicket(ticket);
}

export async function appendTicketMessage(input: {
  ticketId: string;
  sender: TicketMessage["sender"];
  body: string;
  authorId?: string | null;
}): Promise<TicketMessage | null> {
  const ticket = localState.tickets.find((item) => item.id === input.ticketId);
  const supabase = createSupabaseAdminClient();
  let resolvedTicket = ticket;

  if (!resolvedTicket && supabase) {
    const { data } = await supabase.from("tickets").select("*").eq("id", input.ticketId).maybeSingle();
    if (data) resolvedTicket = mapTicket(data);
  }

  if (!resolvedTicket) return null;

  const now = new Date().toISOString();
  const message: TicketMessage = {
    id: publicId("msg"),
    tenantId: resolvedTicket.tenantId,
    workspaceId: resolvedTicket.workspaceId,
    ticketId: resolvedTicket.id,
    sender: input.sender,
    authorId: input.authorId ?? null,
    body: input.body,
    createdAt: now,
  };

  localState.messages.push(message);
  if (ticket) {
    ticket.updatedAt = now;
    if (input.sender === "agent" && ticket.status === "new") ticket.status = "in_progress";
  }

  if (supabase) {
    await supabase.from("ticket_messages").insert(toTicketMessageRow(message));
    await supabase.from("tickets").update({
      updated_at: now,
      status: input.sender === "agent" && resolvedTicket.status === "new" ? "in_progress" : resolvedTicket.status,
    }).eq("id", resolvedTicket.id);
  }

  await appendAuditLog({
    tenantId: resolvedTicket.tenantId,
    workspaceId: resolvedTicket.workspaceId,
    ticketId: resolvedTicket.id,
    userId: input.authorId ?? null,
    action: "ticket.message.appended",
    details: { sender: input.sender },
  });

  return message;
}

export async function regenerateWorkspaceWidgetKey(workspaceId = DEMO_WORKSPACE_ID): Promise<Workspace> {
  const workspace = await getWorkspace(workspaceId);
  const nextKey = `wk_${workspace.slug.replace(/[^a-z0-9]/gi, "_")}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const now = new Date().toISOString();
  const localWorkspace = localState.workspaces.find((item) => item.id === workspace.id);
  if (localWorkspace) {
    localWorkspace.widgetKey = nextKey;
    localWorkspace.updatedAt = now;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("workspaces").update({ widget_key: nextKey, updated_at: now }).eq("id", workspace.id);
  }

  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: null,
    userId: null,
    action: "workspace.widget_key.regenerated",
    details: { widgetKeyPreview: `${nextKey.slice(0, 10)}...` },
  });

  return getWorkspace(workspace.id);
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
  await recordUsageEvent({
    workspaceId: run.workspaceId,
    eventType: input.decision === "escalated" ? "ticket_escalated" : "approval_decided",
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

export async function listMissingKnowledgeTasks(workspaceId = DEMO_WORKSPACE_ID): Promise<MissingKnowledgeTask[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("missing_knowledge_tasks").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false });
    if (!error && data) return data.map(mapMissingKnowledgeTask);
  }
  return localState.missingKnowledgeTasks.filter((task) => task.workspaceId === resolvedWorkspaceId);
}

export async function createMissingKnowledgeTask(input: {
  workspaceId?: string;
  topic: string;
  reason: string;
  sourceAiRunId?: string | null;
}): Promise<MissingKnowledgeTask> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const task: MissingKnowledgeTask = {
    id: publicId("mk"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    topic: input.topic,
    reason: input.reason,
    sourceAiRunId: input.sourceAiRunId ?? null,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  localState.missingKnowledgeTasks.unshift(task);

  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("missing_knowledge_tasks").insert(toMissingKnowledgeTaskRow(task));

  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: null,
    userId: null,
    action: "knowledge.missing.created",
    details: { topic: task.topic, reason: task.reason, sourceAiRunId: task.sourceAiRunId },
  });
  return task;
}

export async function createModelRouteLog(
  input: Omit<ModelRouteLog, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<ModelRouteLog, "tenantId" | "workspaceId">>,
): Promise<ModelRouteLog> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const log: ModelRouteLog = {
    ...input,
    id: publicId("route"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.modelRouteLogs.unshift(log);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("model_route_logs").insert(toModelRouteLogRow(log));
  await recordUsageEvent({
    workspaceId: log.workspaceId,
    eventType: "model_route_used",
    metadata: { aiRunId: log.aiRunId, route: log.route, provider: log.provider, model: log.model, estimatedCostUsd: log.estimatedCostUsd },
  });
  return log;
}

export async function listModelRouteLogs(workspaceId = DEMO_WORKSPACE_ID): Promise<ModelRouteLog[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("model_route_logs").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false }).limit(100);
    if (!error && data) return data.map(mapModelRouteLog);
  }
  return localState.modelRouteLogs.filter((log) => log.workspaceId === resolvedWorkspaceId);
}

export async function appendSecurityEvent(
  input: Omit<SecurityEvent, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<SecurityEvent, "tenantId" | "workspaceId">>,
): Promise<SecurityEvent> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const event: SecurityEvent = {
    ...input,
    id: publicId("sec"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.securityEvents.unshift(event);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("security_events").insert(toSecurityEventRow(event));
  await recordUsageEvent({
    workspaceId: event.workspaceId,
    eventType: "security_event_logged",
    metadata: { eventType: event.eventType, severity: event.severity, origin: event.origin },
  });
  return event;
}

export async function listSecurityEvents(workspaceId = DEMO_WORKSPACE_ID): Promise<SecurityEvent[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("security_events").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false }).limit(100);
    if (!error && data) return data.map(mapSecurityEvent);
  }
  return localState.securityEvents.filter((event) => event.workspaceId === resolvedWorkspaceId);
}

export async function createWidgetSession(input: {
  workspaceId?: string;
  tokenHash: string;
  origin: string;
  domain: string;
  expiresAt: string;
}): Promise<WidgetSession> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const session: WidgetSession = {
    id: publicId("wsess"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    tokenHash: input.tokenHash,
    origin: input.origin,
    domain: input.domain,
    expiresAt: input.expiresAt,
    createdAt: new Date().toISOString(),
    lastSeenAt: null,
  };
  localState.widgetSessions.unshift(session);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("widget_sessions").insert(toWidgetSessionRow(session));
  return session;
}

export async function appendGroundingCheck(
  input: Omit<GroundingCheck, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<GroundingCheck, "tenantId" | "workspaceId">>,
): Promise<GroundingCheck> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const check: GroundingCheck = {
    ...input,
    id: publicId("grounding"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.groundingChecks.unshift(check);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("grounding_checks").insert(toGroundingCheckRow(check));
  return check;
}

export async function appendPolicyEvaluation(
  input: Omit<PolicyEvaluation, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<PolicyEvaluation, "tenantId" | "workspaceId">>,
): Promise<PolicyEvaluation> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const evaluation: PolicyEvaluation = {
    ...input,
    id: publicId("policy"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.policyEvaluations.unshift(evaluation);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("policy_evaluations").insert(toPolicyEvaluationRow(evaluation));
  return evaluation;
}

export async function appendAgentRun(
  input: Omit<AgentRun, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<AgentRun, "tenantId" | "workspaceId">>,
): Promise<AgentRun> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const run: AgentRun = {
    ...input,
    id: publicId("agent"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.agentRuns.unshift(run);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("agent_runs").insert(toAgentRunRow(run));
  return run;
}

export async function appendToolCall(
  input: Omit<ToolCall, "id" | "createdAt" | "tenantId" | "workspaceId"> & Partial<Pick<ToolCall, "tenantId" | "workspaceId">>,
): Promise<ToolCall> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const call: ToolCall = {
    ...input,
    id: publicId("toolcall"),
    tenantId: input.tenantId ?? workspace.tenantId,
    workspaceId: workspace.id,
    createdAt: new Date().toISOString(),
  };
  localState.toolCalls.unshift(call);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("tool_calls").insert(toToolCallRow(call));
  return call;
}

export async function listToolDefinitions(workspaceId = DEMO_WORKSPACE_ID): Promise<ToolDefinition[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("tool_definitions").select("*").eq("workspace_id", resolvedWorkspaceId).eq("active", true).order("name", { ascending: true });
    if (!error && data) return data.map(mapToolDefinition);
  }
  return localState.toolDefinitions.filter((tool) => tool.workspaceId === resolvedWorkspaceId && tool.active);
}

export async function listAuditLogs(workspaceId = DEMO_WORKSPACE_ID, ticketId?: string | null): Promise<AuditLog[]> {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase.from("audit_logs").select("*").eq("workspace_id", resolvedWorkspaceId).order("created_at", { ascending: false }).limit(100);
    if (ticketId) query = query.eq("ticket_id", ticketId);
    const { data, error } = await query;
    if (!error && data) return data.map(mapAuditLog);
  }
  return localState.auditLogs
    .filter((log) => log.workspaceId === resolvedWorkspaceId && (!ticketId || log.ticketId === ticketId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
      supabase.from("ai_runs").select("approval_status,confidence,prompt,cost_estimate_usd,model_route").eq("workspace_id", resolvedWorkspaceId),
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
          costEstimateUsd: Number(run.cost_estimate_usd ?? 0),
          modelRoute: run.model_route ?? null,
        })),
      );
    }
  }

  return calculateMetrics(
    localState.tickets.filter((ticket) => ticket.workspaceId === resolvedWorkspaceId).map((ticket) => ({ id: ticket.id, status: ticket.status, subject: ticket.subject })),
    localState.aiRuns.filter((run) => run.workspaceId === resolvedWorkspaceId).map((run) => ({
      approvalStatus: run.approvalStatus,
      confidence: run.confidence,
      prompt: run.prompt,
      costEstimateUsd: run.costEstimateUsd ?? 0,
      modelRoute: run.modelRoute ?? null,
    })),
  );
}

export async function getWorkspaceHealth(workspaceId = DEMO_WORKSPACE_ID) {
  const resolvedWorkspaceId = workspaceIdOrDefault(workspaceId);
  const [checklist, chunks, domains, approvals, missingKnowledge, securityEvents] = await Promise.all([
    listWorkspaceChecklist(resolvedWorkspaceId),
    listDocumentChunks(resolvedWorkspaceId),
    listWorkspaceDomains(resolvedWorkspaceId),
    listApprovalQueue(resolvedWorkspaceId),
    listMissingKnowledgeTasks(resolvedWorkspaceId),
    listSecurityEvents(resolvedWorkspaceId),
  ]);
  const completed = checklist.filter((item) => item.completed).length;
  const since24h = Date.now() - 24 * 60 * 60 * 1000;

  return {
    launchReady: checklist.length > 0 && completed === checklist.length && approvals.length === 0,
    checklistCompleted: completed,
    checklistTotal: checklist.length,
    approvedSources: chunks.length,
    verifiedDomains: domains.filter((domain) => domain.status === "verified").length,
    openApprovals: approvals.length,
    missingKnowledge: missingKnowledge.filter((task) => task.status !== "resolved").length,
    securityEvents24h: securityEvents.filter((event) => new Date(event.createdAt).getTime() >= since24h).length,
  };
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
  aiRuns: { approvalStatus: AIRun["approvalStatus"]; confidence: number; prompt: string; costEstimateUsd?: number; modelRoute?: AIRun["modelRoute"] }[],
): DashboardMetrics {
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved").length;
  const escalatedTickets = tickets.filter((ticket) => ticket.status === "escalated").length;
  const decidedRuns = aiRuns.filter((run) => run.approvalStatus !== "draft");
  const acceptedRuns = decidedRuns.filter((run) => run.approvalStatus === "approved" || run.approvalStatus === "edited");
  const lowConfidence = aiRuns.filter((run) => run.confidence < 0.72);
  const totalCost = aiRuns.reduce((sum, run) => sum + (run.costEstimateUsd ?? 0), 0);
  const fallbackRuns = aiRuns.filter((run) => run.modelRoute === "R4" || run.modelRoute === "R5");

  return {
    totalTickets,
    resolvedTickets,
    escalatedTickets,
    acceptanceRate: decidedRuns.length === 0 ? 0 : Math.round((acceptedRuns.length / decidedRuns.length) * 100),
    responseTimeMinutes: 14,
    escalationRate: totalTickets === 0 ? 0 : Math.round((escalatedTickets / totalTickets) * 100),
    costPerConversation: aiRuns.length === 0 ? 0 : Number((totalCost / aiRuns.length).toFixed(4)),
    costPerAcceptedReply: acceptedRuns.length === 0 ? 0 : Number((totalCost / acceptedRuns.length).toFixed(4)),
    fallbackRate: aiRuns.length === 0 ? 0 : Math.round((fallbackRuns.length / aiRuns.length) * 100),
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

function mapChecklistItem(row: any): WorkspaceChecklistItem {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    step: row.step,
    label: row.label,
    description: row.description,
    completed: Boolean(row.completed),
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

function mapGoldenQuestion(row: any): GoldenQuestion {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    question: row.question,
    expectedSources: row.expected_sources ?? [],
    lastScore: row.last_score == null ? null : Number(row.last_score),
    passed: Boolean(row.passed),
    createdAt: row.created_at,
  };
}

function mapRetentionSetting(row: any): RetentionSetting {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    conversationDays: Number(row.conversation_days ?? 365),
    auditDays: Number(row.audit_days ?? 730),
    aiPromptLogging: row.ai_prompt_logging ?? "redacted",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMissingKnowledgeTask(row: any): MissingKnowledgeTask {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    topic: row.topic,
    reason: row.reason,
    sourceAiRunId: row.source_ai_run_id,
    status: row.status ?? "open",
    createdAt: row.created_at,
  };
}

function mapModelRouteLog(row: any): ModelRouteLog {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    aiRunId: row.ai_run_id,
    route: row.route,
    task: row.task,
    provider: row.provider,
    model: row.model,
    latencyMs: Number(row.latency_ms ?? 0),
    inputTokens: Number(row.input_tokens ?? 0),
    outputTokens: Number(row.output_tokens ?? 0),
    estimatedCostUsd: Number(row.estimated_cost_usd ?? 0),
    confidence: Number(row.confidence ?? 0),
    reason: row.reason ?? "",
    createdAt: row.created_at,
  };
}

function mapSecurityEvent(row: any): SecurityEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    eventType: row.event_type,
    severity: row.severity ?? "medium",
    origin: row.origin,
    ipHash: row.ip_hash,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}

function mapToolDefinition(row: any): ToolDefinition {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    name: row.name,
    description: row.description,
    readOnly: Boolean(row.read_only),
    active: Boolean(row.active),
  };
}

function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    ticketId: row.ticket_id,
    userId: row.user_id,
    action: row.action,
    details: row.details ?? {},
    createdAt: row.created_at,
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
    promptHash: row.prompt_hash ?? null,
    redactedPromptPreview: row.redacted_prompt_preview ?? null,
    response: row.response,
    model: row.model,
    provider: row.provider ?? null,
    modelRoute: row.model_route ?? null,
    latencyMs: row.latency_ms,
    inputTokens: Number(row.input_tokens ?? 0),
    outputTokens: Number(row.output_tokens ?? 0),
    costEstimateUsd: Number(row.cost_estimate_usd ?? 0),
    confidence: Number(row.confidence ?? 0),
    retrievalScore: row.retrieval_score == null ? undefined : Number(row.retrieval_score),
    generationScore: row.generation_score == null ? undefined : Number(row.generation_score),
    policyRiskScore: row.policy_risk_score == null ? undefined : Number(row.policy_risk_score),
    groundingStatus: row.grounding_status ?? undefined,
    groundingScore: row.grounding_score == null ? undefined : Number(row.grounding_score),
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

function toTicketRow(ticket: Ticket) {
  return {
    id: maybeUuid(ticket.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(ticket.tenantId),
    workspace_id: maybeUuid(ticket.workspaceId),
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    risk_level: ticket.riskLevel,
    customer_id: maybeUuid(ticket.customerId),
    assigned_agent_id: maybeUuid(ticket.assignedAgentId),
    escalation_reason: ticket.escalationReason,
    sentiment: ticket.sentiment,
    tags: ticket.tags,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
  };
}

function toTicketMessageRow(message: TicketMessage) {
  return {
    id: maybeUuid(message.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(message.tenantId),
    workspace_id: maybeUuid(message.workspaceId),
    ticket_id: maybeUuid(message.ticketId),
    sender: message.sender,
    author_id: maybeUuid(message.authorId),
    body: message.body,
    created_at: message.createdAt,
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
    prompt_hash: run.promptHash,
    redacted_prompt_preview: run.redactedPromptPreview,
    response: run.response,
    model: run.model,
    provider: run.provider,
    model_route: run.modelRoute,
    latency_ms: run.latencyMs,
    input_tokens: run.inputTokens ?? 0,
    output_tokens: run.outputTokens ?? 0,
    cost_estimate_usd: run.costEstimateUsd ?? 0,
    confidence: run.confidence,
    retrieval_score: run.retrievalScore,
    generation_score: run.generationScore,
    policy_risk_score: run.policyRiskScore,
    grounding_status: run.groundingStatus,
    grounding_score: run.groundingScore,
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

function toMissingKnowledgeTaskRow(task: MissingKnowledgeTask) {
  return {
    id: maybeUuid(task.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(task.tenantId),
    workspace_id: maybeUuid(task.workspaceId),
    topic: task.topic,
    reason: task.reason,
    source_ai_run_id: maybeUuid(task.sourceAiRunId),
    status: task.status,
    created_at: task.createdAt,
  };
}

function toModelRouteLogRow(log: ModelRouteLog) {
  return {
    id: maybeUuid(log.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(log.tenantId),
    workspace_id: maybeUuid(log.workspaceId),
    ai_run_id: maybeUuid(log.aiRunId),
    route: log.route,
    task: log.task,
    provider: log.provider,
    model: log.model,
    latency_ms: log.latencyMs,
    input_tokens: log.inputTokens,
    output_tokens: log.outputTokens,
    estimated_cost_usd: log.estimatedCostUsd,
    confidence: log.confidence,
    reason: log.reason,
    created_at: log.createdAt,
  };
}

function toSecurityEventRow(event: SecurityEvent) {
  return {
    id: maybeUuid(event.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(event.tenantId),
    workspace_id: maybeUuid(event.workspaceId),
    event_type: event.eventType,
    severity: event.severity,
    origin: event.origin,
    ip_hash: event.ipHash,
    details: event.details,
    created_at: event.createdAt,
  };
}

function toWidgetSessionRow(session: WidgetSession) {
  return {
    id: maybeUuid(session.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(session.tenantId),
    workspace_id: maybeUuid(session.workspaceId),
    token_hash: session.tokenHash,
    origin: session.origin,
    domain: session.domain,
    expires_at: session.expiresAt,
    created_at: session.createdAt,
    last_seen_at: session.lastSeenAt,
  };
}

function toGroundingCheckRow(check: GroundingCheck) {
  return {
    id: maybeUuid(check.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(check.tenantId),
    workspace_id: maybeUuid(check.workspaceId),
    ai_run_id: maybeUuid(check.aiRunId),
    status: check.status,
    score: check.score,
    citation_coverage: check.citationCoverage,
    freshness_score: check.freshnessScore,
    notes: check.notes,
    created_at: check.createdAt,
  };
}

function toPolicyEvaluationRow(evaluation: PolicyEvaluation) {
  return {
    id: maybeUuid(evaluation.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(evaluation.tenantId),
    workspace_id: maybeUuid(evaluation.workspaceId),
    ai_run_id: maybeUuid(evaluation.aiRunId),
    action: evaluation.action,
    reasons: evaluation.reasons,
    required_role: evaluation.requiredRole,
    allowed_tools: evaluation.allowedTools,
    risk_level: evaluation.riskLevel,
    created_at: evaluation.createdAt,
  };
}

function toAgentRunRow(run: AgentRun) {
  return {
    id: maybeUuid(run.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(run.tenantId),
    workspace_id: maybeUuid(run.workspaceId),
    ticket_id: maybeUuid(run.ticketId),
    ai_run_id: maybeUuid(run.aiRunId),
    loop_step: run.loopStep,
    outcome: run.outcome,
    created_at: run.createdAt,
  };
}

function toToolCallRow(call: ToolCall) {
  return {
    id: maybeUuid(call.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(call.tenantId),
    workspace_id: maybeUuid(call.workspaceId),
    ai_run_id: maybeUuid(call.aiRunId),
    tool_name: call.toolName,
    input: call.input,
    output_summary: call.outputSummary,
    status: call.status,
    created_at: call.createdAt,
  };
}
