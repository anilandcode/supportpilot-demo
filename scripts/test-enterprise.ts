import {
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
  demoMessages,
  demoOrganizations,
  demoTickets,
  demoUsageEvents,
  demoWidgetConfigs,
  demoWorkspaces,
} from "../lib/enterprise/demo-data.ts";

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
];
const allTenantScoped = tenantOwnedRows.every((row) => Boolean(row.tenantId && row.workspaceId));
console.log(`${allTenantScoped ? "PASS" : "FAIL"} tenant-scoped demo rows: ${tenantOwnedRows.length}`);
if (!allTenantScoped) failed++;

const chunkMetadataComplete = demoDocumentChunks.every((chunk) => chunk.embeddingModel && chunk.embeddingVersion && chunk.contentHash);
console.log(`${chunkMetadataComplete ? "PASS" : "FAIL"} chunk embedding metadata: ${demoDocumentChunks.length}`);
if (!chunkMetadataComplete) failed++;

if (failed > 0) {
  console.error(`\n${failed} enterprise checks failed`);
  process.exit(1);
}

console.log("\nEnterprise checks passed\n");
