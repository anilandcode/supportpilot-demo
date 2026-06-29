import { requireWorkspaceRole } from "@/lib/auth/api";
import { getIngestionJob, processIngestionJob, retryIngestionJob } from "@/lib/db/ingestion";

export const runtime = "nodejs";

export async function POST(req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const job = await getIngestionJob(jobId);
  if (!job) return Response.json({ error: "ingestion job not found" }, { status: 404 });

  const workerSecret = process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET;
  const providedSecret = req.headers.get("x-supportpilot-worker-secret");
  let actorUserId: string | null = null;

  if (!workerSecret || providedSecret !== workerSecret) {
    const auth = await requireWorkspaceRole(job.workspaceId, ["owner", "admin", "manager", "agent"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    actorUserId = auth.userId;
  }

  const url = new URL(req.url);
  const retry = url.searchParams.get("retry") === "true";
  const result = retry ? await retryIngestionJob(job.id, actorUserId) : await processIngestionJob(job.id, { actorUserId });
  return Response.json({ job: result }, { status: result.status === "failed" ? 500 : 202 });
}
