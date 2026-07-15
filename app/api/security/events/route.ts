import { requireWorkspaceRole } from "@/lib/auth/api";
import { listSecurityEvents } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const events = await listSecurityEvents(auth.workspaceId);
  return Response.json({ events });
}
