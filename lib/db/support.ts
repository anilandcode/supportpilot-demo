import {
  demoAiRuns,
  demoAuditLogs,
  demoCustomers,
  demoDocumentChunks,
  demoEscalationRules,
  demoFeedback,
  demoKnowledgeDocs,
  demoMessages,
  demoTickets,
  demoUsers,
} from "@/lib/enterprise/demo-data";
import type {
  AIRun,
  AIFeedback,
  AuditLog,
  Customer,
  DashboardMetrics,
  DocumentChunk,
  EnterpriseUser,
  KnowledgeDoc,
  RiskLevel,
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketWithRelations,
} from "@/lib/enterprise/types";
import { createDeterministicEmbedding } from "@/lib/rag/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type TicketFilters = {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  assignedAgentId?: string | "all";
  riskLevel?: RiskLevel | "all";
};

const localState = {
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
};

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

export async function listTickets(filters: TicketFilters = {}): Promise<TicketWithRelations[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase
      .from("tickets")
      .select("*, customers(*), assigned_agent:users(*)")
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

export async function listKnowledgeDocs(): Promise<KnowledgeDoc[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("knowledge_docs").select("*").order("created_at", { ascending: false });
    if (!error && data) return data.map(mapKnowledgeDoc);
  }
  return [...localState.docs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listDocumentChunks(): Promise<DocumentChunk[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("document_chunks").select("*").eq("approved", true);
    if (!error && data) return data.map(mapDocumentChunk);
  }
  return localState.chunks.filter((chunk) => chunk.approved);
}

export async function createKnowledgeDocument(input: {
  title: string;
  sourceType: KnowledgeDoc["sourceType"];
  content: string;
  chunks: Omit<DocumentChunk, "id" | "docId" | "approved">[];
}): Promise<KnowledgeDoc> {
  const doc: KnowledgeDoc = {
    id: publicId("doc"),
    title: input.title,
    sourceType: input.sourceType,
    approved: true,
    url: null,
    content: input.content,
    createdAt: new Date().toISOString(),
  };

  const chunks = input.chunks.map<DocumentChunk>((chunk, index) => ({
    ...chunk,
    id: publicId("chunk"),
    docId: doc.id,
    chunkIndex: index,
    approved: true,
  }));

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("knowledge_docs").insert(toKnowledgeDocRow(doc));
    await supabase.from("document_chunks").insert(chunks.map(toDocumentChunkRow));
  }

  localState.docs.unshift(doc);
  localState.chunks.unshift(...chunks);
  await appendAuditLog({
    ticketId: null,
    userId: null,
    action: "knowledge.uploaded",
    details: { title: doc.title, chunks: chunks.length },
  });

  return doc;
}

export async function createAiRun(input: Omit<AIRun, "id" | "createdAt">): Promise<AIRun> {
  const run: AIRun = {
    ...input,
    id: publicId("airun"),
    createdAt: new Date().toISOString(),
  };
  localState.aiRuns.unshift(run);

  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("ai_runs").insert(toAiRunRow(run));

  await appendAuditLog({
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
    ticketId: run.ticketId,
    userId: input.userId,
    action: `ai_run.${input.decision}`,
    details: { aiRunId: run.id, finalResponseEdited: Boolean(input.finalResponse) },
  });

  return run;
}

export async function appendFeedback(input: {
  aiRunId?: string | null;
  messageId?: string | null;
  userId?: string | null;
  rating: AIFeedback["rating"];
}) {
  const feedback: AIFeedback = {
    id: publicId("fb"),
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

export async function appendAuditLog(input: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
  const log: AuditLog = {
    ...input,
    id: publicId("audit"),
    createdAt: new Date().toISOString(),
  };
  localState.auditLogs.unshift(log);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("audit_logs").insert(toAuditLogRow(log));
  return log;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const [{ data: tickets }, { data: aiRuns }] = await Promise.all([
      supabase.from("tickets").select("id,status,subject"),
      supabase.from("ai_runs").select("approval_status,confidence,prompt"),
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
    localState.tickets.map((ticket) => ({ id: ticket.id, status: ticket.status, subject: ticket.subject })),
    localState.aiRuns.map((run) => ({ approvalStatus: run.approvalStatus, confidence: run.confidence, prompt: run.prompt })),
  );
}

export async function listApprovalQueue(): Promise<AIRun[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("ai_runs").select("*").order("created_at", { ascending: false }).limit(100);
    if (!error && data) {
      return data.map(mapAiRun).filter((run) => run.approvalStatus === "escalated" || run.riskFlags.length > 0);
    }
  }

  return localState.aiRuns.filter((run) => run.approvalStatus === "escalated" || run.riskFlags.length > 0);
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

function mapCustomer(row: any): Customer {
  return {
    id: row.id,
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
    title: row.title,
    sourceType: row.source_type,
    approved: row.approved,
    url: row.url,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapDocumentChunk(row: any): DocumentChunk {
  return {
    id: row.id,
    docId: row.doc_id,
    source: row.source,
    heading: row.heading,
    content: row.content,
    chunkIndex: row.chunk_index,
    approved: row.approved,
    score: row.score,
  };
}

function mapTicketMessage(row: any) {
  return {
    id: row.id,
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

function toKnowledgeDocRow(doc: KnowledgeDoc) {
  return {
    id: doc.id,
    title: doc.title,
    source_type: doc.sourceType,
    approved: doc.approved,
    url: doc.url,
    content: doc.content,
    created_at: doc.createdAt,
  };
}

function toDocumentChunkRow(chunk: DocumentChunk) {
  return {
    id: maybeUuid(chunk.id) ?? crypto.randomUUID(),
    doc_id: maybeUuid(chunk.docId),
    source: chunk.source,
    heading: chunk.heading,
    content: chunk.content,
    chunk_index: chunk.chunkIndex,
    approved: chunk.approved,
    embedding: createDeterministicEmbedding(chunk.content),
  };
}

function toAiRunRow(run: AIRun) {
  return {
    id: maybeUuid(run.id) ?? crypto.randomUUID(),
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
    ai_run_id: maybeUuid(feedback.aiRunId),
    message_id: feedback.messageId,
    user_id: maybeUuid(feedback.userId),
    rating: feedback.rating,
    created_at: feedback.createdAt,
  };
}

function toAuditLogRow(log: AuditLog) {
  return {
    id: maybeUuid(log.id) ?? crypto.randomUUID(),
    ticket_id: maybeUuid(log.ticketId),
    user_id: maybeUuid(log.userId),
    action: log.action,
    details: log.details,
    created_at: log.createdAt,
  };
}
