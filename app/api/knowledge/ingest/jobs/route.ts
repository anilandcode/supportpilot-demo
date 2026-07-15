import { requireWorkspaceRole } from "@/lib/auth/api";
import { listIngestionJobs } from "@/lib/db/ingestion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager", "agent"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await listIngestionJobs(auth.workspaceId);
  return Response.json({ jobs });
}
