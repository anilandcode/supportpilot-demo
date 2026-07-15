import {
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
  demoOrganizations,
  demoMissingKnowledgeTasks,
  demoModelRouteLogs,
  demoMessages,
  demoPolicyEvaluations,
  demoRetentionSettings,
  demoSecurityEvents,
  demoTickets,
  demoToolDefinitions,
  demoUsageEvents,
  demoWidgetSessions,
  demoWidgetConfigs,
  demoWorkspaces,
} from "../lib/enterprise/demo-data.ts";
import { selectModelRoute } from "../lib/ai/model-router.ts";
import { buildBillingSnapshot, getPlanLimitBlock } from "../lib/billing/core.ts";
import { hasSensitiveFindings, previewRedactedText } from "../lib/security/redaction.ts";
import { calculateConfidenceBreakdown } from "../lib/workflows/confidence.ts";
import { verifyGrounding } from "../lib/workflows/grounding.ts";
import { evaluatePolicy } from "../lib/workflows/policy.ts";

const checks = [
  ["organizations", demoOrganizations.length === 1, demoOrganizations.length],
  ["workspaces", demoWorkspaces.length === 1, demoWorkspaces.length],
  ["workspace memberships", demoMemberships.length >= 4, demoMemberships.length],
  ["verified domains", demoDomains.filter((domain) => domain.status === "verified").length >= 3, demoDomains.length],
  ["widget configs", demoWidgetConfigs.length === 1, demoWidgetConfigs.length],
  ["customers", demoCustomers.length === 5, demoCustomers.length],
  ["tickets", demoTickets.length === 20, demoTickets.length],
  ["knowledge articles", demoKnowledgeDocs.length === 10, demoKnowledgeDocs.length],
  ["policy docs", demoKnowledgeDocs.filter((doc) => doc.sourceType === "policy").length >= 5, demoKnowledgeDocs.filter((doc) => doc.sourceType === "policy").length],
  ["document chunks", demoDocumentChunks.length >= 10, demoDocumentChunks.length],
  ["escalated tickets", demoTickets.filter((ticket) => ticket.status === "escalated").length === 5, demoTickets.filter((ticket) => ticket.status === "escalated").length],
  ["AI draft replies", demoAiRuns.length === 10, demoAiRuns.length],
  ["audit logs", demoAuditLogs.length >= 10, demoAuditLogs.length],
  ["escalation rules", demoEscalationRules.length >= 5, demoEscalationRules.length],
  ["approval policies", demoApprovalPolicies.length >= 3, demoApprovalPolicies.length],
  ["usage events", demoUsageEvents.length >= 10, demoUsageEvents.length],
  ["launch checklist", demoChecklistItems.length === 8, demoChecklistItems.length],
  ["golden questions", demoGoldenQuestions.length === 5, demoGoldenQuestions.length],
  ["missing knowledge tasks", demoMissingKnowledgeTasks.length >= 2, demoMissingKnowledgeTasks.length],
  ["model route logs", demoModelRouteLogs.length === demoAiRuns.length, demoModelRouteLogs.length],
  ["security events", demoSecurityEvents.length >= 2, demoSecurityEvents.length],
  ["widget sessions", demoWidgetSessions.length >= 1, demoWidgetSessions.length],
  ["retention settings", demoRetentionSettings.length === 1, demoRetentionSettings.length],
  ["read-only tool definitions", demoToolDefinitions.length === 3 && demoToolDefinitions.every((tool) => tool.readOnly), demoToolDefinitions.length],
  ["agent runs", demoAgentRuns.length >= 4, demoAgentRuns.length],
  ["policy evaluations", demoPolicyEvaluations.length === demoAiRuns.length, demoPolicyEvaluations.length],
  ["grounding checks", demoGroundingChecks.length === demoAiRuns.length, demoGroundingChecks.length],
] as const;

let failed = 0;

console.log("\nSupportPilot enterprise dataset checks");
for (const [name, ok, value] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${value}`);
  if (!ok) failed++;
}

const riskyDrafts = demoAiRuns.filter((run) => run.riskFlags.length > 0 || run.confidence < 0.72);
const managerRequired = riskyDrafts.every((run) => run.approvalStatus === "escalated");
console.log(`${managerRequired ? "PASS" : "FAIL"} risky drafts require review: ${riskyDrafts.length}`);
if (!managerRequired) failed++;

const tenantOwnedRows = [
  ...demoCustomers,
  ...demoTickets,
  ...demoMessages,
  ...demoKnowledgeDocs,
  ...demoDocumentChunks,
  ...demoAiRuns,
  ...demoFeedback,
  ...demoAuditLogs,
  ...demoEscalationRules,
  ...demoApprovalPolicies,
  ...demoUsageEvents,
  ...demoChecklistItems,
  ...demoGoldenQuestions,
  ...demoMissingKnowledgeTasks,
  ...demoModelRouteLogs,
  ...demoSecurityEvents,
  ...demoWidgetSessions,
  ...demoRetentionSettings,
  ...demoToolDefinitions,
  ...demoAgentRuns,
  ...demoPolicyEvaluations,
  ...demoGroundingChecks,
];
const allTenantScoped = tenantOwnedRows.every((row) => Boolean(row.tenantId && row.workspaceId));
console.log(`${allTenantScoped ? "PASS" : "FAIL"} tenant-scoped demo rows: ${tenantOwnedRows.length}`);
if (!allTenantScoped) failed++;

const chunkMetadataComplete = demoDocumentChunks.every((chunk) =>
  chunk.embeddingModel &&
  chunk.embeddingVersion &&
  chunk.embeddingProvider &&
  chunk.embeddingDimensions === 768 &&
  chunk.embeddedAt &&
  chunk.sourceVersionId &&
  chunk.contentHash
);
console.log(`${chunkMetadataComplete ? "PASS" : "FAIL"} chunk embedding metadata: ${demoDocumentChunks.length}`);
if (!chunkMetadataComplete) failed++;

const redacted = previewRedactedText("Email maya@example.com and card 4242 4242 4242 4242");
const redactionOk = redacted.text.includes("[redacted-email]") && redacted.text.includes("[redacted-card]") && hasSensitiveFindings("secret token abc");
console.log(`${redactionOk ? "PASS" : "FAIL"} redaction and prompt hash: ${redacted.hash.slice(0, 8)}`);
if (!redactionOk) failed++;

const criticalRoute = selectModelRoute({ task: "ticket_draft", confidence: 0.64, riskLevel: "critical", riskFlags: ["legal_or_policy"] });
const easyRoute = selectModelRoute({ task: "chat", confidence: 0.88, riskLevel: "low", riskFlags: [] });
const routingOk = criticalRoute.route === "R5" && easyRoute.route === "R2";
console.log(`${routingOk ? "PASS" : "FAIL"} deterministic model routing: ${criticalRoute.route}/${easyRoute.route}`);
if (!routingOk) failed++;

const confidence = calculateConfidenceBreakdown({ bestRetrievalScore: 0.88, citationCount: 2, riskLevel: "low" });
const confidenceOk = confidence.overall > 0.7 && confidence.policyRiskScore < 0.3;
console.log(`${confidenceOk ? "PASS" : "FAIL"} confidence breakdown: ${confidence.overall}`);
if (!confidenceOk) failed++;

const grounding = verifyGrounding({
  response: "The refund policy requires manager review. [Source: Refund Policy#Refund Policy]",
  sources: [{ source: "Refund Policy#Refund Policy", score: 0.9 }],
});
const groundingOk = grounding.status === "pass";
console.log(`${groundingOk ? "PASS" : "FAIL"} grounding verifier: ${grounding.status}`);
if (!groundingOk) failed++;

const policy = evaluatePolicy({
  content: "Customer asks for a refund after renewal and is angry.",
  confidence: 0.66,
  riskFlags: [],
  riskLevel: "high",
});
const policyOk = policy.action === "approve_required" && policy.requiredRole === "manager";
console.log(`${policyOk ? "PASS" : "FAIL"} policy decision: ${policy.action}`);
if (!policyOk) failed++;

const billing = buildBillingSnapshot({
  workspace: demoWorkspaces[0],
  organizationPlan: demoOrganizations[0].plan,
  usageEvents: demoUsageEvents,
  aiRunCount: demoAiRuns.length,
  workspaceCount: demoWorkspaces.length,
  memberCount: demoMemberships.length,
  knowledgeDocs: demoKnowledgeDocs,
  documentChunkCount: demoDocumentChunks.length,
  domainCount: demoDomains.length,
  integrationCount: 0,
  routeLogs: demoModelRouteLogs,
  hasStripePortal: false,
  now: new Date("2026-06-24T00:00:00.000Z"),
});
const billingOk =
  billing.plan.key === "launch" &&
  billing.metrics.aiReplies.limit === demoWorkspaces[0].monthlyReplyLimit &&
  billing.metrics.aiReplies.used === demoAiRuns.length &&
  billing.metrics.sources.used === demoKnowledgeDocs.length &&
  billing.metrics.documentChunks.used === demoDocumentChunks.length &&
  billing.metrics.domains.used === demoDomains.length &&
  getPlanLimitBlock(billing) === null;
console.log(`${billingOk ? "PASS" : "FAIL"} billing plan limits: ${billing.plan.name}/${billing.metrics.aiReplies.used}/${billing.metrics.aiReplies.limit}`);
if (!billingOk) failed++;

const entitlementOk =
  billing.metrics.sources.enforced &&
  billing.metrics.documentChunks.enforced &&
  billing.metrics.members.enforced &&
  billing.metrics.domains.enforced &&
  billing.metrics.integrations.enforced &&
  billing.metrics.modelFallbacks.enforced;
console.log(`${entitlementOk ? "PASS" : "FAIL"} runtime entitlement gates: ${billing.orderedMetrics.filter((metric) => metric.enforced).length}`);
if (!entitlementOk) failed++;

const routeCostOk =
  billing.routeCosts.length > 0 &&
  billing.routeCosts.reduce((sum, route) => sum + route.calls, 0) === demoModelRouteLogs.length &&
  billing.totalEstimatedCostUsd >= 0;
console.log(`${routeCostOk ? "PASS" : "FAIL"} billing route cost summary: ${billing.routeCosts.length}`);
if (!routeCostOk) failed++;

if (failed > 0) {
  console.error(`\n${failed} enterprise checks failed`);
  process.exit(1);
}

console.log("\nEnterprise checks passed\n");
