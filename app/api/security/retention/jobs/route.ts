import { requireWorkspaceRole } from "@/lib/auth/api";
import { listRetentionJobs, scheduleRetentionJobs } from "@/lib/db/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await listRetentionJobs(auth.workspaceId);
  return Response.json({ jobs });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const workspaceId = typeof body?.workspaceId === "string" ? body.workspaceId : undefined;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await scheduleRetentionJobs(auth.workspaceId);
  return Response.json({ jobs }, { status: 202 });
}
