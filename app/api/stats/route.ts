import { requireWorkspaceRole } from "@/lib/auth/api";
import { getDashboardMetrics } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin", "manager", "agent", "analyst", "viewer"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  return Response.json(await getDashboardMetrics(auth.workspaceId), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
