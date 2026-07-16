import {
  createAuditEvidenceExport,
  createDeletionRequest,
  getLocalRetentionState,
  processDueRetentionJobs,
  processRetentionJob,
  resetLocalRetentionStateForTests,
  scheduleRetentionJobs,
} from "../lib/db/retention.ts";
import { createAiRun, createModelRouteLog, getLocalState } from "../lib/db/support.ts";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  resetLocalRetentionStateForTests();
  const state = getLocalState();
  const targetMessage = state.messages.find((message) => message.ticketId === "tkt_019" && message.workspaceId === DEMO_WORKSPACE_ID);
  const targetDoc = state.docs.find((doc) => doc.workspaceId === DEMO_WORKSPACE_ID);
  if (!targetMessage || !targetDoc) throw new Error("retention test seed data missing target ticket message or source document");

  const aiRun = await createAiRun({
    workspaceId: DEMO_WORKSPACE_ID,
    ticketId: "tkt_019",
    userId: "usr_agent_omar",
    prompt: "Customer email privacy@example.com asked to delete billing history.",
    response: "Draft response with personal data.",
    model: "deterministic-test",
    provider: "deterministic",
    modelRoute: "R4",
    latencyMs: 10,
    inputTokens: 12,
    outputTokens: 8,
    costEstimateUsd: 0,
    confidence: 0.61,
    approvalStatus: "draft",
    escalationReason: "privacy deletion request",
    riskFlags: ["privacy", "deletion"],
    sources: [{ source: "Deletion policy", docId: targetDoc.id }],
    rationale: "Contains privacy deletion data.",
  });
  await createModelRouteLog({
    workspaceId: DEMO_WORKSPACE_ID,
    aiRunId: aiRun.id,
    route: "R4",
    task: "Privacy deletion answer for privacy@example.com",
    provider: "deterministic",
    model: "deterministic-test",
    latencyMs: 10,
    inputTokens: 12,
    outputTokens: 8,
    estimatedCostUsd: 0,
    confidence: 0.61,
    reason: "Privacy/deletion request needs manager review.",
  });

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
  checks.push([
    "verified ticket deletion redacts message and AI draft content",
    targetMessage.body.startsWith("[retention-redacted:ticket message") &&
      aiRun.prompt.startsWith("[retention-redacted:prompt") &&
      aiRun.response.startsWith("[retention-redacted:ai response") &&
      aiRun.sources.length === 0,
    `${targetMessage.body}/${aiRun.prompt}/${aiRun.response}/${aiRun.sources.length}`,
  ]);

  const sourceDeletion = await createDeletionRequest({
    workspaceId: DEMO_WORKSPACE_ID,
    scope: "source_document",
    subjectId: targetDoc.id,
    requesterEmail: "privacy@example.com",
    reason: "Remove outdated uploaded policy source.",
    verificationMethod: "manager_verified_source_owner",
  });
  const sourceCompleted = await processRetentionJob(sourceDeletion.job!.id, "usr_manager_lena");
  checks.push([
    "source document deletion removes source and vector chunks",
    sourceCompleted.status === "succeeded" &&
      !state.docs.some((doc) => doc.id === targetDoc.id && doc.workspaceId === DEMO_WORKSPACE_ID) &&
      !state.chunks.some((chunk) => chunk.docId === targetDoc.id && chunk.workspaceId === DEMO_WORKSPACE_ID),
    `${sourceCompleted.status}/docs:${state.docs.some((doc) => doc.id === targetDoc.id)}/chunks:${state.chunks.some((chunk) => chunk.docId === targetDoc.id)}`,
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
  const drained = await processDueRetentionJobs({ workspaceId: DEMO_WORKSPACE_ID, limit: 5, actorUserId: "usr_manager_lena" });
  checks.push([
    "retention worker drains due queued jobs with real processors",
    drained.selected >= 2 && drained.succeeded >= 2 && drained.results.every((result) => Boolean(result.auditProofHash)),
    `${drained.selected}/${drained.succeeded}/${drained.results.map((result) => `${result.jobType}:${result.status}`).join(",")}`,
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
