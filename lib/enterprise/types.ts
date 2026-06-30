export type UserRole = "customer" | "support_agent" | "support_manager" | "admin";
export type TicketStatus = "new" | "in_progress" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MessageSender = "customer" | "agent" | "ai";
export type ApprovalStatus = "draft" | "approved" | "edited" | "rejected" | "escalated";
export type MembershipRole = "owner" | "admin" | "manager" | "agent" | "analyst" | "viewer";
export type DomainStatus = "pending" | "verified" | "blocked";
export type BillingTierKey = "launch" | "pro" | "enterprise";
export type BillingInterval = "monthly" | "annual";
export type IntegrationProvider = "slack" | "webhook" | "zendesk" | "intercom";
export type IntegrationStatus = "active" | "disabled" | "error";
export type OutboundEventType = "approval_needed" | "approval_decided" | "approved_reply" | "ticket_escalated";
export type OutboundEventStatus = "queued" | "processing" | "delivered" | "failed" | "skipped";
export type IntegrationDeliveryStatus = "processing" | "delivered" | "failed" | "skipped";
export type DeletionRequestStatus = "requested" | "verified" | "queued" | "processing" | "completed" | "rejected" | "failed";
export type DeletionRequestScope = "customer" | "ticket" | "workspace" | "source_document";
export type RetentionJobType = "conversation_cleanup" | "ai_log_cleanup" | "audit_export" | "deletion_request";
export type RetentionJobStatus = "queued" | "running" | "succeeded" | "failed" | "needs_review";
export type EvidenceExportStatus = "queued" | "running" | "succeeded" | "failed";
export type BillingSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";
export type BillingDunningState = "none" | "payment_failed" | "grace_day_3" | "grace_day_7" | "recovered";
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
  status?: "active" | "invited" | "disabled";
  acceptedAt?: string | null;
};

export type WorkspaceInvitation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  email: string;
  role: MembershipRole;
  tokenHash: string;
  invitedBy: string | null;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type PortalIdentity = {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  customerId: string | null;
  externalCustomerId: string | null;
  email: string;
  status: "active" | "disabled";
  verifiedAt: string | null;
  createdAt: string;
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
  embeddingProvider: string;
  embeddingDimensions: number;
  embeddedAt: string | null;
  sourceVersionId: string | null;
  contentHash: string;
  embedding?: number[];
  score?: number;
};

export type KnowledgeEmbeddingJob = {
  id: string;
  tenantId: string;
  workspaceId: string;
  docId: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  embeddingProvider: string;
  embeddingModel: string;
  embeddingVersion: string;
  chunksTotal: number;
  chunksEmbedded: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeIngestionJob = {
  id: string;
  tenantId: string;
  workspaceId: string;
  docId: string | null;
  jobType: "extract_pdf" | "ingest_markdown" | "ingest_text" | "embed_chunks" | "reembed_source" | "run_golden_eval";
  status: "queued" | "running" | "succeeded" | "failed" | "needs_review" | "skipped";
  sourceType: KnowledgeDoc["sourceType"];
  title: string;
  contentType: string | null;
  sourceContentHash: string;
  storageUrl: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  chunksTotal: number;
  chunksEmbedded: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export type StripeCustomerMapping = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  stripeCustomerId: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingCheckoutSession = {
  id: string;
  tenantId: string;
  workspaceId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  priceId: string;
  tier: BillingTierKey;
  interval: BillingInterval;
  status: "created" | "completed" | "expired";
  url: string | null;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  completedAt: string | null;
};

export type BillingSubscription = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string | null;
  tier: BillingTierKey;
  interval: BillingInterval | null;
  status: BillingSubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  dunningState: BillingDunningState;
  metadata: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
};

export type BillingInvoice = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingEntitlement = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  tier: BillingTierKey;
  status: BillingSubscriptionStatus | "demo";
  limits: Record<string, number | null>;
  source: "demo" | "stripe";
  stripeSubscriptionId: string | null;
  effectiveAt: string;
  expiresAt: string | null;
  updatedAt: string;
};

export type StripeWebhookEvent = {
  id: string;
  stripeEventId: string;
  type: string;
  livemode: boolean;
  status: "processing" | "processed" | "failed" | "ignored";
  error: string | null;
  payload: Record<string, unknown>;
  receivedAt: string;
  processedAt: string | null;
};

export type IntegrationAccount = {
  id: string;
  tenantId: string;
  workspaceId: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  secretRef: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WebhookEndpoint = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  url: string;
  signingSecretRef: string | null;
  status: IntegrationStatus;
  events: OutboundEventType[];
  createdAt: string;
  updatedAt: string;
};

export type IntegrationExternalMapping = {
  id: string;
  tenantId: string;
  workspaceId: string;
  provider: IntegrationProvider;
  localType: "ticket" | "message" | "ai_run" | "approval";
  localId: string;
  externalType: string;
  externalId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type OutboundEvent = {
  id: string;
  tenantId: string;
  workspaceId: string;
  integrationAccountId: string | null;
  webhookEndpointId: string | null;
  eventType: OutboundEventType;
  subjectType: "ticket" | "message" | "ai_run" | "approval";
  subjectId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  status: OutboundEventStatus;
  attempts: number;
  maxAttempts: number;
  nextRunAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IntegrationDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  outboundEventId: string;
  integrationAccountId: string | null;
  webhookEndpointId: string | null;
  provider: IntegrationProvider | "webhook_endpoint";
  attempt: number;
  status: IntegrationDeliveryStatus;
  httpStatus: number | null;
  responsePreview: string | null;
  error: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type DataDeletionRequest = {
  id: string;
  tenantId: string;
  workspaceId: string;
  scope: DeletionRequestScope;
  subjectId: string;
  requesterEmail: string | null;
  actorUserId: string | null;
  status: DeletionRequestStatus;
  reason: string | null;
  verificationMethod: string | null;
  verifiedAt: string | null;
  queuedAt: string | null;
  completedAt: string | null;
  auditProofHash: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type RetentionJob = {
  id: string;
  tenantId: string;
  workspaceId: string;
  jobType: RetentionJobType;
  status: RetentionJobStatus;
  deletionRequestId: string | null;
  retentionSettingId: string | null;
  scope: DeletionRequestScope | "workspace_retention";
  cutoffAt: string | null;
  attempts: number;
  maxAttempts: number;
  affectedCounts: Record<string, number>;
  error: string | null;
  auditProofHash: string | null;
  startedAt: string | null;
  completedAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditEvidenceExport = {
  id: string;
  tenantId: string;
  workspaceId: string;
  exportType: "monthly_soc2_readiness" | "audit_logs" | "security_events" | "deletion_proof";
  status: EvidenceExportStatus;
  periodStart: string;
  periodEnd: string;
  artifactUrl: string | null;
  artifactHash: string | null;
  itemCounts: Record<string, number>;
  generatedBy: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
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
