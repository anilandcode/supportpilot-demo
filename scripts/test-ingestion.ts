import { createIngestionJob, getLocalIngestionJobs, processDueIngestionJobs, retryIngestionJob } from "../lib/db/ingestion.ts";
import { getLocalState } from "../lib/db/support.ts";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  delete process.env.QSTASH_TOKEN;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET;

  const demoOrganization = getLocalState().organizations[0];
  const originalPlan = demoOrganization.plan;
  demoOrganization.plan = "Pro";

  const unique = crypto.randomUUID();
  const content = [
    `# Ingestion smoke ${unique}`,
    "SupportPilot answers must cite approved sources.",
    "Billing, refund, legal, and angry customer issues need approval before final reply.",
  ].join("\n\n");

  const first = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Ingestion smoke ${unique}`,
    sourceType: "upload",
    content,
  });
  checks.push([
    "text ingestion processes synchronously without QStash",
    !first.queued && first.job.status === "succeeded" && Boolean(first.job.docId) && first.job.chunksEmbedded > 0,
    `${first.queued}/${first.job.status}/${first.job.chunksEmbedded}`,
  ]);

  const duplicate = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Different title ${unique}`,
    sourceType: "upload",
    content,
  });
  checks.push([
    "duplicate source content is skipped by content hash",
    !duplicate.queued && duplicate.job.status === "skipped" && duplicate.job.docId === first.job.docId,
    `${duplicate.queued}/${duplicate.job.status}/${duplicate.job.docId}`,
  ]);
  checks.push([
    "duplicate jobs remain visible in local job history",
    getLocalIngestionJobs().some((job) => job.id === duplicate.job.id && job.status === "skipped"),
    `${getLocalIngestionJobs().length}`,
  ]);

  const blank = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Blank source ${unique}`,
    sourceType: "upload",
    content: "   ",
  });
  checks.push([
    "empty extraction enters review state",
    blank.job.status === "needs_review" && blank.job.error === "No extractable text was found.",
    `${blank.job.status}/${blank.job.error}`,
  ]);

  const originalFetch = globalThis.fetch;
  const queuedContent = `Queued ingestion ${unique}`;
  let forwardedSecret = "";
  process.env.QSTASH_TOKEN = "test-qstash-token";
  process.env.NEXT_PUBLIC_APP_URL = "https://supportpilot.example";
  process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET = "test-worker-secret";
  globalThis.fetch = (async (_input, init) => {
    forwardedSecret = String(new Headers(init?.headers).get("Upstash-Forward-X-Supportpilot-Worker-Secret") ?? "");
    return Response.json({ messageId: "msg_test" }, { status: 202 });
  }) as typeof fetch;

  const queued = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Queued source ${unique}`,
    sourceType: "upload",
    content: queuedContent,
    asyncRequested: true,
  });
  const queuedForWorker = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Queued worker source ${unique}`,
    sourceType: "upload",
    content: `Queued worker ingestion ${unique}`,
    asyncRequested: true,
  });
  checks.push([
    "async ingestion queues when QStash and worker secret are configured",
    queued.queued && queuedForWorker.queued && queued.job.status === "queued" && queuedForWorker.job.status === "queued" && forwardedSecret === "test-worker-secret",
    `${queued.queued}/${queuedForWorker.queued}/${queued.job.status}/${queuedForWorker.job.status}/${forwardedSecret}`,
  ]);

  globalThis.fetch = originalFetch;
  delete process.env.QSTASH_TOKEN;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET;

  const retried = await retryIngestionJob(queued.job.id);
  checks.push([
    "queued ingestion can be manually retried",
    retried.status === "succeeded" && retried.chunksEmbedded > 0,
    `${retried.status}/${retried.chunksEmbedded}`,
  ]);

  const drained = await processDueIngestionJobs({ workspaceId: DEMO_WORKSPACE_ID, limit: 5, actorUserId: "usr_agent_omar" });
  checks.push([
    "ingestion worker drains due queued jobs",
    drained.selected >= 1 && drained.succeeded >= 1 && drained.results.some((result) => result.jobId === queuedForWorker.job.id && result.status === "succeeded"),
    `${drained.selected}/${drained.succeeded}/${drained.results.map((result) => `${result.jobId}:${result.status}`).join(",")}`,
  ]);

  demoOrganization.plan = "Lite";
  const planLimited = await createIngestionJob({
    workspaceId: DEMO_WORKSPACE_ID,
    title: `Plan limited source ${unique}`,
    sourceType: "upload",
    content: `# Plan limited source ${unique}\n\nThis source should be parked for review once Launch source limits are reached.`,
  });
  checks.push([
    "ingestion processing parks jobs that would exceed source or chunk limits",
    !planLimited.queued && planLimited.job.status === "needs_review" && Boolean(planLimited.job.error?.includes("Plan limit reached")),
    `${planLimited.queued}/${planLimited.job.status}/${planLimited.job.error}`,
  ]);

  demoOrganization.plan = originalPlan;

  let failed = 0;
  console.log("\nSupportPilot ingestion checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} ingestion checks failed`);
    process.exit(1);
  }

  console.log("\nIngestion checks passed\n");
}
