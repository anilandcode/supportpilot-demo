import {
  demoAiRuns,
  demoAuditLogs,
  demoCustomers,
  demoDocumentChunks,
  demoEscalationRules,
  demoKnowledgeDocs,
  demoTickets,
} from "../lib/enterprise/demo-data";

const checks = [
  ["customers", demoCustomers.length === 5, demoCustomers.length],
  ["tickets", demoTickets.length === 20, demoTickets.length],
  ["knowledge articles", demoKnowledgeDocs.length === 10, demoKnowledgeDocs.length],
  ["policy docs", demoKnowledgeDocs.filter((doc) => doc.sourceType === "policy").length >= 5, demoKnowledgeDocs.filter((doc) => doc.sourceType === "policy").length],
  ["document chunks", demoDocumentChunks.length >= 10, demoDocumentChunks.length],
  ["escalated tickets", demoTickets.filter((ticket) => ticket.status === "escalated").length === 5, demoTickets.filter((ticket) => ticket.status === "escalated").length],
  ["AI draft replies", demoAiRuns.length === 10, demoAiRuns.length],
  ["audit logs", demoAuditLogs.length >= 10, demoAuditLogs.length],
  ["escalation rules", demoEscalationRules.length >= 5, demoEscalationRules.length],
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

if (failed > 0) {
  console.error(`\n${failed} enterprise checks failed`);
  process.exit(1);
}

console.log("\nEnterprise checks passed\n");
