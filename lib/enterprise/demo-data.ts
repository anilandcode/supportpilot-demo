import type {
  AIFeedback,
  AIRun,
  AuditLog,
  Customer,
  DocumentChunk,
  EnterpriseUser,
  EscalationRule,
  KnowledgeDoc,
  Ticket,
  TicketMessage,
} from "@/lib/enterprise/types";

const now = new Date("2026-06-18T09:00:00.000Z");

function iso(minutesAgo: number) {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

export const demoUsers: EnterpriseUser[] = [
  { id: "usr_customer_maya", email: "maya@northstar.example", fullName: "Maya Patel", role: "customer" },
  { id: "usr_agent_ava", email: "ava@acmedesk.example", fullName: "Ava Brooks", role: "support_agent" },
  { id: "usr_agent_noah", email: "noah@acmedesk.example", fullName: "Noah Reed", role: "support_agent" },
  { id: "usr_manager_lena", email: "lena@acmedesk.example", fullName: "Lena Ortiz", role: "support_manager" },
  { id: "usr_admin_anil", email: "admin@acmedesk.example", fullName: "Anil Pervaiz", role: "admin" },
];

export const demoCustomers: Customer[] = [
  { id: "cus_northstar", name: "Maya Patel", email: "maya@northstar.example", company: "Northstar Labs", plan: "Business", healthScore: 82, metadata: { seats: "38", region: "US" } },
  { id: "cus_riverline", name: "Jon Bell", email: "jon@riverline.example", company: "Riverline Finance", plan: "Enterprise", healthScore: 64, metadata: { seats: "140", region: "EU" } },
  { id: "cus_halo", name: "Priya Shah", email: "priya@halo.example", company: "Halo Health", plan: "Pro", healthScore: 76, metadata: { seats: "22", region: "US" } },
  { id: "cus_vector", name: "Chris Wong", email: "chris@vector.example", company: "Vector Ops", plan: "Free", healthScore: 58, metadata: { seats: "4", region: "APAC" } },
  { id: "cus_evergreen", name: "Nora Smith", email: "nora@evergreen.example", company: "Evergreen Retail", plan: "Business", healthScore: 91, metadata: { seats: "55", region: "US" } },
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
    ticketId: ticket.id,
    sender: "customer",
    authorId: null,
    body: `Customer asks: ${ticket.subject}. Please answer with approved policy and next steps.`,
    createdAt: iso(1800 - index * 38),
  },
  {
    id: `${ticket.id}_msg_agent_note`,
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
  ["doc_roadmaps", "Roadmaps", "product_doc", "Roadmaps are available on Pro and above and can be shared externally using read-only links."],
  ["doc_api", "API Rate Limits", "product_doc", "API keys are created from Settings > API. 429 errors mean the integration exceeded 1,000 requests per minute."],
] as const;

export const demoKnowledgeDocs: KnowledgeDoc[] = docBodies.map((doc, index) => ({
  id: doc[0],
  title: doc[1],
  sourceType: doc[2],
  approved: true,
  url: null,
  content: doc[3],
  createdAt: iso(6000 - index * 75),
}));

export const demoDocumentChunks: DocumentChunk[] = demoKnowledgeDocs.map((doc, index) => ({
  id: `${doc.id}_chunk_1`,
  docId: doc.id,
  source: `${doc.title}`,
  heading: doc.title,
  content: doc.content,
  chunkIndex: index,
  approved: doc.approved,
}));

export const demoEscalationRules: EscalationRule[] = [
  { id: "rule_low_confidence", name: "Low confidence", trigger: "confidence < 0.72", riskLevel: "medium", requiresManagerApproval: false, active: true },
  { id: "rule_angry", name: "Angry sentiment", trigger: "sentiment = angry", riskLevel: "high", requiresManagerApproval: true, active: true },
  { id: "rule_legal", name: "Legal or policy risk", trigger: "legal|policy|DPA|GDPR", riskLevel: "critical", requiresManagerApproval: true, active: true },
  { id: "rule_billing", name: "Billing/refund risk", trigger: "refund|billing|invoice|charge", riskLevel: "high", requiresManagerApproval: true, active: true },
  { id: "rule_sensitive", name: "Sensitive data exposure", trigger: "password|token|secret|api key", riskLevel: "critical", requiresManagerApproval: true, active: true },
];

export const demoAiRuns: AIRun[] = demoTickets.slice(0, 10).map((ticket, index) => ({
  id: `airun_${String(index + 1).padStart(2, "0")}`,
  ticketId: ticket.id,
  userId: ticket.assignedAgentId,
  prompt: `Draft a support reply for ${ticket.subject}`,
  response: `Draft reply for ${ticket.subject}: answer from approved documentation, cite the matching source, and route risky details for approval.`,
  model: "demo-enterprise",
  latencyMs: 850 + index * 42,
  confidence: ticket.riskLevel === "critical" ? 0.61 : ticket.riskLevel === "high" ? 0.72 : 0.86,
  approvalStatus: ticket.riskLevel === "critical" || ticket.status === "escalated" ? "escalated" : index % 3 === 0 ? "approved" : "draft",
  escalationReason: ticket.escalationReason,
  riskFlags: ticket.escalationReason ? [ticket.escalationReason] : [],
  sources: [{ source: demoDocumentChunks[index % demoDocumentChunks.length].source, chunkId: demoDocumentChunks[index % demoDocumentChunks.length].id, score: 0.88 }],
  rationale: ticket.escalationReason ? "Risk language matched escalation rules." : "High lexical overlap with approved support docs.",
  createdAt: iso(900 - index * 33),
}));

export const demoFeedback: AIFeedback[] = demoAiRuns.slice(0, 6).map((run, index) => ({
  id: `fb_${run.id}`,
  aiRunId: run.id,
  messageId: null,
  userId: run.userId,
  rating: index % 4 === 0 ? "down" : "up",
  createdAt: iso(500 - index * 20),
}));

export const demoAuditLogs: AuditLog[] = demoAiRuns.map((run, index) => ({
  id: `audit_${run.id}`,
  ticketId: run.ticketId,
  userId: run.userId,
  action: `ai_run.${run.approvalStatus}`,
  details: { confidence: run.confidence, riskFlags: run.riskFlags, model: run.model },
  createdAt: iso(400 - index * 18),
}));
