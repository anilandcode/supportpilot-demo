import { processDueRetentionJobs } from "@/lib/db/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const workerSecret = process.env.SUPPORTPILOT_RETENTION_WORKER_SECRET;
  const providedSecret = req.headers.get("x-supportpilot-retention-secret");
  if (!workerSecret || providedSecret !== workerSecret) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const workspaceId = typeof body?.workspaceId === "string" && body.workspaceId.length > 0 ? body.workspaceId : null;
  const limit = typeof body?.limit === "number" ? body.limit : undefined;
  const result = await processDueRetentionJobs({ workspaceId, limit });
  return Response.json(result, {
    status: result.failed > 0 ? 207 : 202,
    headers: { "Cache-Control": "no-store" },
  });
}
