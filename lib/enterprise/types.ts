export type UserRole = "customer" | "support_agent" | "support_manager" | "admin";
export type TicketStatus = "new" | "in_progress" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MessageSender = "customer" | "agent" | "ai";
export type ApprovalStatus = "draft" | "approved" | "edited" | "rejected" | "escalated";
export type MembershipRole = "owner" | "admin" | "manager" | "agent" | "analyst" | "viewer";
export type DomainStatus = "pending" | "verified" | "blocked";
export type UsageEventType =
  | "chat.message"
  | "chat.answered"
  | "chat.escalated"
  | "knowledge.uploaded"
  | "ai_run.created"
  | "approval.decided"
  | "email.escalated"
  | "onboarding_step_completed"
  | "knowledge_source_added"
  | "rag_answer_generated"
  | "approval_requested"
  | "approval_decided"
  | "ticket_escalated"
  | "widget_installed"
  | "answer_feedback"
  | "model_route_used"
  | "security_event_logged";

export type LaunchChecklistStep =
  | "knowledge_source"
  | "embeddings_generated"
  | "golden_questions"
  | "brand_disclosure"
  | "escalation_owner"
  | "domain_verified"
  | "widget_installed"
  | "monitoring_enabled";

export type ModelRouteCode = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export type PolicyAction = "answer" | "ask_clarifying" | "approve_required" | "escalate" | "refuse";
export type GroundingStatus = "pass" | "needs_review" | "fail";
export type SecurityEventType =
  | "blocked_origin"
  | "rate_limited"
  | "pii_redacted"
  | "prompt_injection_suspected"
  | "widget_session_invalid"
  | "widget_session_created";

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
  promptHash?: string | null;
  redactedPromptPreview?: string | null;
  response: string;
  model: string;
  provider?: string | null;
  modelRoute?: ModelRouteCode | null;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  costEstimateUsd?: number;
  confidence: number;
  retrievalScore?: number;
  generationScore?: number;
  policyRiskScore?: number;
  groundingStatus?: GroundingStatus;
  groundingScore?: number;
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

export type WorkspaceChecklistItem = {
  id: string;
  tenantId: string;
  workspaceId: string;
  step: LaunchChecklistStep;
  label: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

export type GoldenQuestion = {
  id: string;
  tenantId: string;
  workspaceId: string;
  question: string;
  expectedSources: string[];
  lastScore: number | null;
  passed: boolean;
  createdAt: string;
};

export type MissingKnowledgeTask = {
  id: string;
  tenantId: string;
  workspaceId: string;
  topic: string;
  reason: string;
  sourceAiRunId: string | null;
  status: "open" | "planned" | "resolved";
  createdAt: string;
};

export type ModelRouteLog = {
  id: string;
  tenantId: string;
  workspaceId: string;
  aiRunId: string | null;
  route: ModelRouteCode;
  task: string;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  confidence: number;
  reason: string;
  createdAt: string;
};

export type SecurityEvent = {
  id: string;
  tenantId: string;
  workspaceId: string;
  eventType: SecurityEventType;
  severity: RiskLevel;
  origin: string | null;
  ipHash: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};

export type WidgetSession = {
  id: string;
  tenantId: string;
  workspaceId: string;
  tokenHash: string;
  origin: string;
  domain: string;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string | null;
};

export type RetentionSetting = {
  id: string;
  tenantId: string;
  workspaceId: string;
  conversationDays: number;
  auditDays: number;
  aiPromptLogging: "redacted" | "disabled";
  createdAt: string;
  updatedAt: string;
};

export type ToolDefinition = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: "search_knowledge" | "get_ticket_history" | "get_workspace_policy";
  description: string;
  readOnly: boolean;
  active: boolean;
};

export type ToolCall = {
  id: string;
  tenantId: string;
  workspaceId: string;
  aiRunId: string | null;
  toolName: ToolDefinition["name"];
  input: Record<string, unknown>;
  outputSummary: string;
  status: "success" | "blocked" | "error";
  createdAt: string;
};

export type AgentRun = {
  id: string;
  tenantId: string;
  workspaceId: string;
  ticketId: string | null;
  aiRunId: string | null;
  loopStep: string;
  outcome: PolicyAction;
  createdAt: string;
};

export type PolicyEvaluation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  aiRunId: string | null;
  action: PolicyAction;
  reasons: string[];
  requiredRole: MembershipRole | null;
  allowedTools: ToolDefinition["name"][];
  riskLevel: RiskLevel;
  createdAt: string;
};

export type GroundingCheck = {
  id: string;
  tenantId: string;
  workspaceId: string;
  aiRunId: string | null;
  status: GroundingStatus;
  score: number;
  citationCoverage: number;
  freshnessScore: number;
  notes: string;
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
  costPerConversation: number;
  costPerAcceptedReply: number;
  fallbackRate: number;
  missingTopics: { topic: string; count: number }[];
  topQuestions: { question: string; count: number }[];
};

export type WorkspaceHealth = {
  launchReady: boolean;
  checklistCompleted: number;
  checklistTotal: number;
  approvedSources: number;
  verifiedDomains: number;
  openApprovals: number;
  missingKnowledge: number;
  securityEvents24h: number;
};

export type ConfidenceBreakdown = {
  retrievalScore: number;
  generationScore: number;
  policyRiskScore: number;
  overall: number;
};

export type PolicyDecision = {
  action: PolicyAction;
  reasons: string[];
  requiredRole: MembershipRole | null;
  allowedTools: ToolDefinition["name"][];
  riskLevel: RiskLevel;
};

export type DraftResult = {
  aiRun: AIRun;
  draft: string;
  citations: AIRun["sources"];
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  rationale: string;
  riskFlags: string[];
  requiresManagerApproval: boolean;
  policyDecision: PolicyDecision;
  groundingCheck: GroundingCheck;
};

export type WorkspaceLaunchState = {
  workspace: Workspace;
  widgetConfig: WidgetConfig;
  domains: WorkspaceDomain[];
  approvalPolicies: ApprovalPolicy[];
  checklist: WorkspaceChecklistItem[];
  goldenQuestions: GoldenQuestion[];
  missingKnowledge: MissingKnowledgeTask[];
  retention: RetentionSetting | null;
  health: WorkspaceHealth;
};
