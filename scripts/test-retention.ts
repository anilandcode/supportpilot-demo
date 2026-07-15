import {
  createAuditEvidenceExport,
  createDeletionRequest,
  getLocalRetentionState,
  processRetentionJob,
  resetLocalRetentionStateForTests,
  scheduleRetentionJobs,
} from "../lib/db/retention.ts";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  resetLocalRetentionStateForTests();

  const pending = await createDeletionRequest({
    workspaceId: DEMO_WORKSPACE_ID,
    scope: "ticket",
    subjectId: "tkt_019",
    requesterEmail: "privacy@example.com",
    reason: "Customer requested GDPR deletion.",
  });
  checks.push([
    "unverified deletion request is recorded without job",
    pending.request.status === "requested" && pending.job === null,
    `${pending.request.status}/${pending.job}`,
  ]);

  const verified = await createDeletionRequest({
    workspaceId: DEMO_WORKSPACE_ID,
    scope: "ticket",
    subjectId: "tkt_019",
    requesterEmail: "privacy@example.com",
    reason: "Verified GDPR deletion.",
    verificationMethod: "manager_verified_email",
  });
  checks.push([
    "verified deletion request queues deletion job",
    verified.request.status === "queued" && verified.job?.jobType === "deletion_request",
    `${verified.request.status}/${verified.job?.jobType}`,
  ]);

  const completed = await processRetentionJob(verified.job!.id, "usr_manager_lena");
  checks.push([
    "deletion job completes with proof hash and affected counts",
    completed.status === "succeeded" && Boolean(completed.auditProofHash) && Number(completed.affectedCounts.tickets ?? 0) >= 1,
    `${completed.status}/${completed.auditProofHash?.slice(0, 8)}/${JSON.stringify(completed.affectedCounts)}`,
  ]);
  checks.push([
    "deletion request receives completion proof",
    getLocalRetentionState().deletionRequests.some((request) => request.id === verified.request.id && request.status === "completed" && request.auditProofHash === completed.auditProofHash),
    getLocalRetentionState().deletionRequests.map((request) => `${request.status}:${request.auditProofHash?.slice(0, 8)}`).join(","),
  ]);

  const jobs = await scheduleRetentionJobs(DEMO_WORKSPACE_ID);
  checks.push([
    "retention settings schedule conversation and AI cleanup jobs",
    jobs.some((job) => job.jobType === "conversation_cleanup" && job.cutoffAt) && jobs.some((job) => job.jobType === "ai_log_cleanup" && job.cutoffAt),
    jobs.map((job) => `${job.jobType}:${job.cutoffAt}`).join(" | "),
  ]);
  const aiCleanupJob = jobs.find((job) => job.jobType === "ai_log_cleanup");
  checks.push([
    "retention jobs respect plan duration entitlement",
    Boolean(aiCleanupJob?.cutoffAt) && Math.round(ageDays(aiCleanupJob!.cutoffAt!)) <= 365,
    aiCleanupJob?.cutoffAt ? `${Math.round(ageDays(aiCleanupJob.cutoffAt))} days` : "missing cutoff",
  ]);

  const exportRecord = await createAuditEvidenceExport({
    workspaceId: DEMO_WORKSPACE_ID,
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-30T23:59:59.000Z",
    generatedBy: "usr_admin_mira",
  });
  checks.push([
    "audit evidence export is tamper-evident",
    exportRecord.status === "succeeded" && Boolean(exportRecord.artifactHash) && exportRecord.artifactUrl?.startsWith("memory://audit-evidence/") === true,
    `${exportRecord.status}/${exportRecord.artifactHash?.slice(0, 8)}/${exportRecord.artifactUrl}`,
  ]);
  checks.push([
    "audit evidence export includes reviewable item counts",
    Number(exportRecord.itemCounts.auditLogs ?? 0) > 0 && Number(exportRecord.itemCounts.securityEvents ?? 0) > 0 && exportRecord.itemCounts.rlsReports === 1,
    JSON.stringify(exportRecord.itemCounts),
  ]);

  let failed = 0;
  console.log("\nSupportPilot retention checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} retention checks failed`);
    process.exit(1);
  }

  console.log("\nRetention checks passed\n");
}

function ageDays(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}
