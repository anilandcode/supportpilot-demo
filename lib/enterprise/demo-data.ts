import type {
  AIFeedback,
  AgentRun,
  AIRun,
  ApprovalPolicy,
  AuditLog,
  Customer,
  DocumentChunk,
  EnterpriseUser,
  EscalationRule,
  GoldenQuestion,
  GroundingCheck,
  KnowledgeDoc,
  Membership,
  MissingKnowledgeTask,
  ModelRouteLog,
  Organization,
  PolicyEvaluation,
  RetentionSetting,
  SecurityEvent,
  Ticket,
  TicketMessage,
  ToolCall,
  ToolDefinition,
  UsageEvent,
  WidgetConfig,
  WidgetSession,
  Workspace,
  WorkspaceChecklistItem,
  WorkspaceDomain,
} from "@/lib/enterprise/types";

const now = new Date("2026-06-18T09:00:00.000Z");

function iso(minutesAgo: number) {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

export const DEMO_TENANT_ID = "70000000-0000-4000-8000-000000000001";
export const DEMO_WORKSPACE_ID = "70000000-0000-4000-8000-000000000002";
const DEFAULT_EMBEDDING_MODEL = "deterministic-hash";
const DEFAULT_EMBEDDING_VERSION = "v1";
const DEFAULT_EMBEDDING_PROVIDER = "deterministic";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;

function contentHash(content: string) {
  let hash = 0;
  for (let index = 0; index < content.length; index++) {
    hash = (hash << 5) - hash + content.charCodeAt(index);
    hash |= 0;
  }
  return `demo_${Math.abs(hash).toString(36)}`;
}

export const demoOrganizations: Organization[] = [
  {
    id: DEMO_TENANT_ID,
    name: "AcmeDesk",
    slug: "acmedesk",
    plan: "Lite",
    createdAt: iso(7200),
  },
];

export const demoWorkspaces: Workspace[] = [
  {
    id: DEMO_WORKSPACE_ID,
    tenantId: DEMO_TENANT_ID,
    name: "AcmeDesk Support",
    slug: "acmedesk-support",
    botName: "Pilot",
    brandColor: "#4f46e5",
    accentForeground: "#ffffff",
    welcomeMessage: "Hi, I'm Pilot. Ask me anything about AcmeDesk pricing, integrations, billing, or security.",
    escalationEmail: "support@acmedesk.example",
    calendlyUrl: "https://calendly.com/anilpervaiz/15min",
    widgetKey: "wk_demo_acmedesk",
    monthlyReplyLimit: 1000,
    createdAt: iso(7200),
    updatedAt: iso(120),
  },
];

export const demoUsers: EnterpriseUser[] = [
  { id: "usr_customer_maya", email: "maya@northstar.example", fullName: "Maya Patel", role: "customer" },
  { id: "usr_agent_ava", email: "ava@acmedesk.example", fullName: "Ava Brooks", role: "support_agent" },
  { id: "usr_agent_noah", email: "noah@acmedesk.example", fullName: "Noah Reed", role: "support_agent" },
  { id: "usr_manager_lena", email: "lena@acmedesk.example", fullName: "Lena Ortiz", role: "support_manager" },
  { id: "usr_admin_anil", email: "admin@acmedesk.example", fullName: "Anil Pervaiz", role: "admin" },
];

export const demoMemberships: Membership[] = demoUsers
  .filter((user) => user.role !== "customer")
  .map((user) => ({
    id: `mbr_${user.id}`,
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    userId: user.id,
    role: user.role === "admin" ? "owner" : user.role === "support_manager" ? "manager" : "agent",
  }));

export const demoDomains: WorkspaceDomain[] = [
  { id: "dom_localhost", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, domain: "localhost", status: "verified", createdAt: iso(7100) },
  { id: "dom_127", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, domain: "127.0.0.1", status: "verified", createdAt: iso(7100) },
  { id: "dom_demo", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, domain: "supportpilot-demo.vercel.app", status: "verified", createdAt: iso(7000) },
];

export const demoWidgetConfigs: WidgetConfig[] = [
  {
    id: "wcfg_acmedesk",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    launcherLabel: "Chat with Pilot",
    position: "bottom-right",
    showBranding: true,
    privacyText: "Answers are generated from approved AcmeDesk support sources and may be escalated to a human.",
    createdAt: iso(7100),
    updatedAt: iso(120),
  },
];

export const demoCustomers: Customer[] = [
  { id: "cus_northstar", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Maya Patel", email: "maya@northstar.example", company: "Northstar Labs", plan: "Business", healthScore: 82, metadata: { seats: "38", region: "US" } },
  { id: "cus_riverline", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Jon Bell", email: "jon@riverline.example", company: "Riverline Finance", plan: "Enterprise", healthScore: 64, metadata: { seats: "140", region: "EU" } },
  { id: "cus_halo", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Priya Shah", email: "priya@halo.example", company: "Halo Health", plan: "Pro", healthScore: 76, metadata: { seats: "22", region: "US" } },
  { id: "cus_vector", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Chris Wong", email: "chris@vector.example", company: "Vector Ops", plan: "Free", healthScore: 58, metadata: { seats: "4", region: "APAC" } },
  { id: "cus_evergreen", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Nora Smith", email: "nora@evergreen.example", company: "Evergreen Retail", plan: "Business", healthScore: 91, metadata: { seats: "55", region: "US" } },
];

const ticketSubjects = [
  ["tkt_001", "SOC 2 report request", "new", "medium", "medium", "cus_northstar", "usr_agent_ava", "calm", null],
  ["tkt_002", "Refund after renewal charge", "escalated", "urgent", "critical", "cus_riverline", "usr_manager_lena", "angry", "Refund policy risk requires manager approval"],
  ["tkt_003", "GitHub sync stopped after org permission change", "in_progress", "high", "medium", "cus_halo", "usr_agent_noah", "frustrated", null],
  ["tkt_004", "Need SAML SSO setup steps", "new", "high", "high", "cus_evergreen", "usr_agent_ava", "neutral", "SSO/security configuration"],
  ["tkt_005", "Billing invoice says wrong seat count", "escalated", "urgent", "high", "cus_northstar", "usr_manager_lena", "angry", "Billing dispute"],
  ["tkt_006", "Can guests view roadmaps?", "resolved", "low", "low", "cus_vector", "usr_agent_noah", "calm", null],
  ["tkt_007", "Data residency for EU customers", "escalated", "high", "high", "cus_riverline", "usr_manager_lena", "neutral", "Policy/legal risk"],
  ["tkt_008", "Slack notifications duplicated", "in_progress", "medium", "medium", "cus_halo", "usr_agent_ava", "frustrated", null],
  ["tkt_009", "Cancel workspace but keep data", "new", "medium", "medium", "cus_vector", "usr_agent_noah", "neutral", null],
  ["tkt_010", "Custom onboarding for 100 seats", "resolved", "medium", "low", "cus_evergreen", "usr_agent_ava", "calm", null],
  ["tkt_011", "Audit log retention question", "new", "medium", "medium", "cus_northstar", "usr_agent_noah", "calm", null],
  ["tkt_012", "Notion sync status mismatch", "in_progress", "high", "medium", "cus_halo", "usr_agent_ava", "frustrated", null],
  ["tkt_013", "Legal team needs DPA", "escalated", "urgent", "critical", "cus_riverline", "usr_manager_lena", "neutral", "Legal approval required"],
  ["tkt_014", "Upgrade from Pro to Business mid-cycle", "resolved", "medium", "low", "cus_evergreen", "usr_agent_noah", "calm", null],
  ["tkt_015", "Password shared in chat", "escalated", "urgent", "critical", "cus_vector", "usr_manager_lena", "angry", "Sensitive data exposure"],
  ["tkt_016", "Roadmap external sharing", "new", "low", "low", "cus_halo", "usr_agent_ava", "calm", null],
  ["tkt_017", "API 429 errors", "in_progress", "high", "medium", "cus_northstar", "usr_agent_noah", "frustrated", null],
  ["tkt_018", "Enterprise quote request", "resolved", "medium", "low", "cus_riverline", "usr_agent_ava", "calm", null],
  ["tkt_019", "Delete personal data under GDPR", "new", "urgent", "critical", "cus_evergreen", "usr_manager_lena", "neutral", "GDPR request"],
  ["tkt_020", "Figma previews not loading", "resolved", "low", "low", "cus_vector", "usr_agent_noah", "calm", null],
] as const;

export const demoTickets: Ticket[] = ticketSubjects.map((ticket, index) => ({
  id: ticket[0],
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  subject: ticket[1],
  status: ticket[2],
  priority: ticket[3],
  riskLevel: ticket[4],
  customerId: ticket[5],
  assignedAgentId: ticket[6],
  sentiment: ticket[7],
  escalationReason: ticket[8],
  tags: ticket[1].toLowerCase().split(/\s+/).slice(0, 3),
  createdAt: iso(2400 - index * 65),
  updatedAt: iso(2000 - index * 44),
}));

export const demoMessages: TicketMessage[] = demoTickets.flatMap((ticket, index) => [
  {
    id: `${ticket.id}_msg_customer`,
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    ticketId: ticket.id,
    sender: "customer",
    authorId: null,
    body: `Customer asks: ${ticket.subject}. Please answer with approved policy and next steps.`,
    createdAt: iso(1800 - index * 38),
  },
  {
    id: `${ticket.id}_msg_agent_note`,
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    ticketId: ticket.id,
    sender: "agent",
    authorId: ticket.assignedAgentId,
    body: ticket.escalationReason ? `Agent note: ${ticket.escalationReason}.` : "Agent note: draft an answer from approved docs.",
    createdAt: iso(1770 - index * 38),
  },
]);

const docBodies = [
  ["doc_pricing", "Pricing and Plans", "faq", "Pro is $12 per user per month. Business is $24 per user per month. Enterprise is custom priced for larger customers."],
  ["doc_refunds", "Refund Policy", "policy", "First-time upgrades from Free to paid plans are refundable within 14 days. Renewals, seat additions, and later upgrades are not refundable without manager approval."],
  ["doc_security", "Security Overview", "policy", "AcmeDesk is SOC 2 Type II certified. Reports are available to Business and Enterprise customers under NDA."],
  ["doc_sso", "SSO Setup", "onboarding", "SAML SSO is available on Business and Enterprise plans with Okta, Azure AD, Google Workspace, and OneLogin."],
  ["doc_github", "GitHub Integration", "product_doc", "Install the AcmeDesk GitHub App to link pull requests, move issues to In Review, and close issues when PRs merge."],
  ["doc_slack", "Slack Integration", "product_doc", "Slack users can create issues, receive channel notifications, unfurl links, and manage notification rules."],
  ["doc_gdpr", "GDPR and Data Residency", "policy", "Enterprise customers can choose EU data residency. GDPR deletion requests are completed within 30 days."],
  ["doc_billing", "Billing Operations", "policy", "Annual billing saves 20 percent. Upgrades are prorated mid-cycle and downgrades apply at period end."],
  ["doc_dpa", "Data Processing Agreement", "policy", "A signed DPA is available to Business and Enterprise customers after legal review and account verification."],
  ["doc_api", "API Rate Limits", "product_doc", "API keys are created from Settings > API. 429 errors mean the integration exceeded 1,000 requests per minute."],
] as const;

export const demoKnowledgeDocs: KnowledgeDoc[] = docBodies.map((doc, index) => ({
  id: doc[0],
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  title: doc[1],
  sourceType: doc[2],
  sourceVersion: 1,
  approved: true,
  url: null,
  content: doc[3],
  createdAt: iso(6000 - index * 75),
}));

export const demoDocumentChunks: DocumentChunk[] = demoKnowledgeDocs.map((doc, index) => ({
  id: `${doc.id}_chunk_1`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  docId: doc.id,
  source: `${doc.title}`,
  heading: doc.title,
  content: doc.content,
  chunkIndex: index,
  approved: doc.approved,
  embeddingModel: DEFAULT_EMBEDDING_MODEL,
  embeddingVersion: DEFAULT_EMBEDDING_VERSION,
  embeddingProvider: DEFAULT_EMBEDDING_PROVIDER,
  embeddingDimensions: DEFAULT_EMBEDDING_DIMENSIONS,
  embeddedAt: iso(6900),
  sourceVersionId: `${doc.id}:v${doc.sourceVersion}`,
  contentHash: contentHash(doc.content),
}));

export const demoEscalationRules: EscalationRule[] = [
  { id: "rule_low_confidence", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Low confidence", trigger: "confidence < 0.72", riskLevel: "medium", requiresManagerApproval: false, active: true },
  { id: "rule_angry", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Angry sentiment", trigger: "sentiment = angry", riskLevel: "high", requiresManagerApproval: true, active: true },
  { id: "rule_legal", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Legal or policy risk", trigger: "legal|policy|DPA|GDPR", riskLevel: "critical", requiresManagerApproval: true, active: true },
  { id: "rule_billing", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Billing/refund risk", trigger: "refund|billing|invoice|charge", riskLevel: "high", requiresManagerApproval: true, active: true },
  { id: "rule_sensitive", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "Sensitive data exposure", trigger: "password|token|secret|api key", riskLevel: "critical", requiresManagerApproval: true, active: true },
];

export const demoApprovalPolicies: ApprovalPolicy[] = [
  { id: "pol_low_confidence", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, riskCategory: "low_confidence", minConfidenceToAutoSend: 0.72, requireApproval: true, allowedActions: ["draft_reply", "email_escalation"], approverRole: "manager", active: true },
  { id: "pol_billing", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, riskCategory: "billing_or_refund", minConfidenceToAutoSend: 0.9, requireApproval: true, allowedActions: ["draft_reply"], approverRole: "manager", active: true },
  { id: "pol_legal", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, riskCategory: "legal_or_policy", minConfidenceToAutoSend: 0.95, requireApproval: true, allowedActions: ["draft_reply"], approverRole: "manager", active: true },
];

export const demoAiRuns: AIRun[] = demoTickets.slice(0, 10).map((ticket, index) => ({
  id: `airun_${String(index + 1).padStart(2, "0")}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  ticketId: ticket.id,
  userId: ticket.assignedAgentId,
  prompt: `Draft a support reply for ${ticket.subject}`,
  promptHash: `demo_hash_${index + 1}`,
  redactedPromptPreview: `Draft a support reply for ${ticket.subject}`,
  response: `Draft reply for ${ticket.subject}: answer from approved documentation, cite the matching source, and route risky details for approval.`,
  model: "demo-enterprise",
  provider: "demo",
  modelRoute: ticket.riskLevel === "critical" ? "R5" : ticket.riskLevel === "high" ? "R4" : "R2",
  latencyMs: 850 + index * 42,
  inputTokens: 620 + index * 12,
  outputTokens: 190 + index * 7,
  costEstimateUsd: Number((0.002 + index * 0.0002).toFixed(4)),
  confidence: ticket.riskLevel === "critical" ? 0.61 : ticket.riskLevel === "high" ? 0.72 : 0.86,
  retrievalScore: ticket.riskLevel === "critical" ? 0.55 : 0.84,
  generationScore: ticket.riskLevel === "critical" ? 0.68 : 0.88,
  policyRiskScore: ticket.riskLevel === "critical" ? 0.92 : ticket.riskLevel === "high" ? 0.74 : 0.22,
  groundingStatus: ticket.riskLevel === "critical" ? "needs_review" : "pass",
  groundingScore: ticket.riskLevel === "critical" ? 0.66 : 0.89,
  approvalStatus: ticket.riskLevel === "critical" || ticket.riskLevel === "high" || ticket.status === "escalated" ? "escalated" : index % 3 === 0 ? "approved" : "draft",
  escalationReason: ticket.escalationReason,
  riskFlags: ticket.escalationReason ? [ticket.escalationReason] : [],
  sources: [{ source: demoDocumentChunks[index % demoDocumentChunks.length].source, chunkId: demoDocumentChunks[index % demoDocumentChunks.length].id, score: 0.88 }],
  rationale: ticket.escalationReason ? "Risk language matched escalation rules." : "High lexical overlap with approved support docs.",
  createdAt: iso(900 - index * 33),
}));

export const demoFeedback: AIFeedback[] = demoAiRuns.slice(0, 6).map((run, index) => ({
  id: `fb_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  aiRunId: run.id,
  messageId: null,
  userId: run.userId,
  rating: index % 4 === 0 ? "down" : "up",
  createdAt: iso(500 - index * 20),
}));

export const demoAuditLogs: AuditLog[] = demoAiRuns.map((run, index) => ({
  id: `audit_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  ticketId: run.ticketId,
  userId: run.userId,
  action: `ai_run.${run.approvalStatus}`,
  details: { confidence: run.confidence, riskFlags: run.riskFlags, model: run.model },
  createdAt: iso(400 - index * 18),
}));

export const demoUsageEvents: UsageEvent[] = demoAiRuns.map((run, index) => ({
  id: `usage_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  eventType: run.approvalStatus === "escalated" ? "chat.escalated" : "chat.answered",
  quantity: 1,
  metadata: { aiRunId: run.id, model: run.model, confidence: run.confidence },
  createdAt: iso(300 - index * 12),
}));

const checklist: Array<[WorkspaceChecklistItem["step"], string, string, boolean]> = [
  ["knowledge_source", "Add knowledge source", "Upload or paste the first approved FAQ, policy, or support article.", true],
  ["embeddings_generated", "Generate source chunks", "Confirm approved sources have searchable chunks and embedding metadata.", true],
  ["golden_questions", "Pass five golden questions", "Validate citations and safe refusal behavior before launch.", false],
  ["brand_disclosure", "Configure brand and disclosure", "Set the assistant name, colors, welcome copy, and AI disclosure.", true],
  ["escalation_owner", "Set escalation owner", "Add the manager or inbox that receives risky conversations.", true],
  ["domain_verified", "Verify widget domain", "Restrict the widget to approved customer origins.", true],
  ["widget_installed", "Install widget", "Place the script or iframe on the customer site.", false],
  ["monitoring_enabled", "Enable monitoring", "Turn on Sentry and product events for launch visibility.", false],
];

export const demoChecklistItems: WorkspaceChecklistItem[] = checklist.map(([step, label, description, completed], index) => ({
  id: `check_${step}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  step,
  label,
  description,
  completed,
  completedAt: completed ? iso(180 - index * 10) : null,
  createdAt: iso(800 - index * 8),
}));

export const demoGoldenQuestions: GoldenQuestion[] = [
  ["gq_pricing", "What does Pro cost?", ["Pricing and Plans"], 0.92, true],
  ["gq_refund", "Can I get a refund after renewal?", ["Refund Policy"], 0.74, false],
  ["gq_soc2", "Can you share the SOC 2 report?", ["Security Overview"], 0.88, true],
  ["gq_dpa", "Can legal get a DPA?", ["Data Processing Agreement"], 0.69, false],
  ["gq_rate_limit", "Why am I seeing API 429 errors?", ["API Rate Limits"], 0.9, true],
].map(([id, question, expectedSources, lastScore, passed], index) => ({
  id: id as string,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  question: question as string,
  expectedSources: expectedSources as string[],
  lastScore: lastScore as number,
  passed: passed as boolean,
  createdAt: iso(700 - index * 12),
}));

export const demoMissingKnowledgeTasks: MissingKnowledgeTask[] = [
  {
    id: "mk_refund_exceptions",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    topic: "Refund exceptions for renewal disputes",
    reason: "Low-confidence and billing-risk drafts need clearer manager policy.",
    sourceAiRunId: "airun_02",
    status: "open",
    createdAt: iso(240),
  },
  {
    id: "mk_dpa_process",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    topic: "DPA approval workflow",
    reason: "Legal requests cite source availability but lack internal handoff steps.",
    sourceAiRunId: "airun_07",
    status: "planned",
    createdAt: iso(220),
  },
];

export const demoModelRouteLogs: ModelRouteLog[] = demoAiRuns.map((run, index) => ({
  id: `route_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  aiRunId: run.id,
  route: run.modelRoute ?? "R2",
  task: run.modelRoute === "R5" ? "critical enterprise review" : run.modelRoute === "R4" ? "high-risk draft" : "easy cited answer",
  provider: run.provider ?? "demo",
  model: run.model,
  latencyMs: run.latencyMs,
  inputTokens: run.inputTokens ?? 0,
  outputTokens: run.outputTokens ?? 0,
  estimatedCostUsd: run.costEstimateUsd ?? 0,
  confidence: run.confidence,
  reason: run.riskFlags.length > 0 ? run.riskFlags.join(", ") : "Approved-source answer with low policy risk.",
  createdAt: run.createdAt,
}));

export const demoSecurityEvents: SecurityEvent[] = [
  {
    id: "sec_origin_blocked",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    eventType: "blocked_origin",
    severity: "medium",
    origin: "https://unknown.example",
    ipHash: "demo_ip_hash",
    details: { reason: "Origin is not on the verified workspace domain list." },
    createdAt: iso(96),
  },
  {
    id: "sec_pii_redacted",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    eventType: "pii_redacted",
    severity: "high",
    origin: "https://supportpilot-demo.vercel.app",
    ipHash: "demo_ip_hash",
    details: { fields: ["email", "phone"] },
    createdAt: iso(72),
  },
];

export const demoWidgetSessions: WidgetSession[] = [
  {
    id: "wsess_demo",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    tokenHash: "demo_widget_session_hash",
    origin: "http://localhost",
    domain: "localhost",
    expiresAt: iso(-60),
    createdAt: iso(30),
    lastSeenAt: iso(10),
  },
];

export const demoRetentionSettings: RetentionSetting[] = [
  {
    id: "retention_demo",
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    conversationDays: 365,
    auditDays: 730,
    aiPromptLogging: "redacted",
    createdAt: iso(7100),
    updatedAt: iso(120),
  },
];

export const demoToolDefinitions: ToolDefinition[] = [
  { id: "tool_search_knowledge", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "search_knowledge", description: "Search approved knowledge chunks for cited support answers.", readOnly: true, active: true },
  { id: "tool_ticket_history", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "get_ticket_history", description: "Read ticket conversation history and customer metadata.", readOnly: true, active: true },
  { id: "tool_workspace_policy", tenantId: DEMO_TENANT_ID, workspaceId: DEMO_WORKSPACE_ID, name: "get_workspace_policy", description: "Read active approval and escalation policies.", readOnly: true, active: true },
];

export const demoToolCalls: ToolCall[] = demoAiRuns.slice(0, 4).map((run, index) => ({
  id: `tool_call_${index + 1}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  aiRunId: run.id,
  toolName: index % 2 === 0 ? "search_knowledge" : "get_ticket_history",
  input: { ticketId: run.ticketId },
  outputSummary: "Read-only enterprise context retrieved for draft generation.",
  status: "success",
  createdAt: iso(120 - index * 11),
}));

export const demoAgentRuns: AgentRun[] = demoAiRuns.slice(0, 4).map((run, index) => ({
  id: `agent_run_${index + 1}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  ticketId: run.ticketId,
  aiRunId: run.id,
  loopStep: "retrieve -> draft -> verify -> policy",
  outcome: run.approvalStatus === "escalated" ? "approve_required" : "answer",
  createdAt: iso(110 - index * 9),
}));

export const demoPolicyEvaluations: PolicyEvaluation[] = demoAiRuns.map((run, index) => ({
  id: `policy_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  aiRunId: run.id,
  action: run.approvalStatus === "escalated" ? "approve_required" : "answer",
  reasons: run.riskFlags.length > 0 ? run.riskFlags : ["approved_sources", "confidence_above_threshold"],
  requiredRole: run.approvalStatus === "escalated" ? "manager" : null,
  allowedTools: ["search_knowledge", "get_ticket_history", "get_workspace_policy"],
  riskLevel: run.policyRiskScore && run.policyRiskScore > 0.8 ? "critical" : run.policyRiskScore && run.policyRiskScore > 0.55 ? "high" : "low",
  createdAt: iso(95 - index * 5),
}));

export const demoGroundingChecks: GroundingCheck[] = demoAiRuns.map((run, index) => ({
  id: `grounding_${run.id}`,
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  aiRunId: run.id,
  status: run.groundingStatus ?? "pass",
  score: run.groundingScore ?? 0.86,
  citationCoverage: run.sources.length > 0 ? 0.9 : 0.2,
  freshnessScore: 0.82,
  notes: run.sources.length > 0 ? "Draft includes approved source citations." : "No approved source citation available.",
  createdAt: iso(90 - index * 5),
}));
