export type UserRole = "customer" | "support_agent" | "support_manager" | "admin";
export type TicketStatus = "new" | "in_progress" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MessageSender = "customer" | "agent" | "ai";
export type ApprovalStatus = "draft" | "approved" | "edited" | "rejected" | "escalated";

export type EnterpriseUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: "Free" | "Pro" | "Business" | "Enterprise";
  healthScore: number;
  metadata: Record<string, string>;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  riskLevel: RiskLevel;
  customerId: string;
  assignedAgentId: string | null;
  escalationReason: string | null;
  sentiment: "calm" | "neutral" | "frustrated" | "angry";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  sender: MessageSender;
  authorId: string | null;
  body: string;
  createdAt: string;
};

export type KnowledgeDoc = {
  id: string;
  title: string;
  sourceType: "faq" | "product_doc" | "policy" | "onboarding" | "upload";
  approved: boolean;
  url: string | null;
  content: string;
  createdAt: string;
};

export type DocumentChunk = {
  id: string;
  docId: string;
  source: string;
  heading: string;
  content: string;
  chunkIndex: number;
  approved: boolean;
  score?: number;
};

export type AIRun = {
  id: string;
  ticketId: string | null;
  userId: string | null;
  prompt: string;
  response: string;
  model: string;
  latencyMs: number;
  confidence: number;
  approvalStatus: ApprovalStatus;
  escalationReason: string | null;
  riskFlags: string[];
  sources: { source: string; docId?: string; chunkId?: string; score?: number }[];
  rationale: string;
  createdAt: string;
};

export type AIFeedback = {
  id: string;
  aiRunId: string | null;
  messageId: string | null;
  userId: string | null;
  rating: "up" | "down";
  createdAt: string;
};

export type AuditLog = {
  id: string;
  ticketId: string | null;
  userId: string | null;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
};

export type EscalationRule = {
  id: string;
  name: string;
  trigger: string;
  riskLevel: RiskLevel;
  requiresManagerApproval: boolean;
  active: boolean;
};

export type TicketWithRelations = Ticket & {
  customer: Customer;
  assignedAgent: EnterpriseUser | null;
  messages: TicketMessage[];
  latestAiRun?: AIRun;
};

export type DashboardMetrics = {
  totalTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  acceptanceRate: number;
  responseTimeMinutes: number;
  escalationRate: number;
  missingTopics: { topic: string; count: number }[];
  topQuestions: { question: string; count: number }[];
};

export type DraftResult = {
  aiRun: AIRun;
  draft: string;
  citations: AIRun["sources"];
  confidence: number;
  rationale: string;
  riskFlags: string[];
  requiresManagerApproval: boolean;
};
