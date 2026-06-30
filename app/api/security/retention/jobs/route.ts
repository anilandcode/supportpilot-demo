import { requireWorkspaceRole } from "@/lib/auth/api";
import { listRetentionJobs, scheduleRetentionJobs } from "@/lib/db/retention";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspaceId") || url.searchParams.get("workspace") || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await listRetentionJobs(workspace.id);
  return Response.json({ jobs });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const workspace = await getWorkspace(String(body?.workspaceId || DEMO_WORKSPACE_ID));
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await scheduleRetentionJobs(workspace.id);
  return Response.json({ jobs }, { status: 202 });
}
