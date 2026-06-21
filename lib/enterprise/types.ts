export type UserRole = "customer" | "support_agent" | "support_manager" | "admin";
export type TicketStatus = "new" | "in_progress" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MessageSender = "customer" | "agent" | "ai";
export type ApprovalStatus = "draft" | "approved" | "edited" | "rejected" | "escalated";
export type MembershipRole = "owner" | "admin" | "manager" | "agent" | "viewer";
export type DomainStatus = "pending" | "verified" | "blocked";
export type UsageEventType =
  | "chat.message"
  | "chat.answered"
  | "chat.escalated"
  | "knowledge.uploaded"
  | "ai_run.created"
  | "approval.decided"
  | "email.escalated";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: "Lite" | "Agency" | "Pro" | "Enterprise";
  createdAt: string;
};

export type Workspace = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  botName: string;
  brandColor: string;
  accentForeground: string;
  welcomeMessage: string;
  escalationEmail: string;
  calendlyUrl: string | null;
  widgetKey: string;
  monthlyReplyLimit: number;
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  role: MembershipRole;
};

export type WorkspaceDomain = {
  id: string;
  tenantId: string;
  workspaceId: string;
  domain: string;
  status: DomainStatus;
  createdAt: string;
};

export type WidgetConfig = {
  id: string;
  tenantId: string;
  workspaceId: string;
  launcherLabel: string;
  position: "bottom-right" | "bottom-left";
  showBranding: boolean;
  privacyText: string;
  createdAt: string;
  updatedAt: string;
};

export type EnterpriseUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type Customer = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  email: string;
  company: string;
  plan: "Free" | "Pro" | "Business" | "Enterprise";
  healthScore: number;
  metadata: Record<string, string>;
};

export type Ticket = {
  id: string;
  tenantId: string;
  workspaceId: string;
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
  tenantId: string;
  workspaceId: string;
  ticketId: string;
  sender: MessageSender;
  authorId: string | null;
  body: string;
  createdAt: string;
};

export type KnowledgeDoc = {
  id: string;
  tenantId: string;
  workspaceId: string;
  title: string;
  sourceType: "faq" | "product_doc" | "policy" | "onboarding" | "upload";
  sourceVersion: number;
  approved: boolean;
  url: string | null;
  content: string;
  createdAt: string;
};

export type DocumentChunk = {
  id: string;
  tenantId: string;
  workspaceId: string;
  docId: string;
  source: string;
  heading: string;
  content: string;
  chunkIndex: number;
  approved: boolean;
  embeddingModel: string;
  embeddingVersion: string;
  contentHash: string;
  score?: number;
};

export type AIRun = {
  id: string;
  tenantId: string;
  workspaceId: string;
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
  tenantId: string;
  workspaceId: string;
  aiRunId: string | null;
  messageId: string | null;
  userId: string | null;
  rating: "up" | "down";
  createdAt: string;
};

export type AuditLog = {
  id: string;
  tenantId: string;
  workspaceId: string;
  ticketId: string | null;
  userId: string | null;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
};

export type EscalationRule = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  trigger: string;
  riskLevel: RiskLevel;
  requiresManagerApproval: boolean;
  active: boolean;
};

export type ApprovalPolicy = {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskCategory: string;
  minConfidenceToAutoSend: number;
  requireApproval: boolean;
  allowedActions: string[];
  approverRole: MembershipRole;
  active: boolean;
};

export type UsageEvent = {
  id: string;
  tenantId: string;
  workspaceId: string;
  eventType: UsageEventType;
  quantity: number;
  metadata: Record<string, unknown>;
  createdAt: string;
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

export type WorkspaceLaunchState = {
  workspace: Workspace;
  widgetConfig: WidgetConfig;
  domains: WorkspaceDomain[];
  approvalPolicies: ApprovalPolicy[];
};
