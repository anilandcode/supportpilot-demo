import { requireWorkspaceRole } from "@/lib/auth/api";
import { getRetentionJob, processRetentionJob } from "@/lib/db/retention";

export const runtime = "nodejs";

export async function POST(req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const job = await getRetentionJob(jobId);
  if (!job) return Response.json({ error: "retention job not found" }, { status: 404 });

  const workerSecret = process.env.SUPPORTPILOT_RETENTION_WORKER_SECRET;
  const providedSecret = req.headers.get("x-supportpilot-retention-secret");
  let actorUserId: string | null = null;

  if (!workerSecret || providedSecret !== workerSecret) {
    const auth = await requireWorkspaceRole(job.workspaceId, ["owner", "admin", "manager"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    actorUserId = auth.userId;
  }

  const result = await processRetentionJob(job.id, actorUserId);
  return Response.json({ job: result }, { status: result.status === "failed" ? 500 : 202 });
}
