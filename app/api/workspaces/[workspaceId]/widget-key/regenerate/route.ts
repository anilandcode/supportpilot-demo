import { requireWorkspaceRole } from "@/lib/auth/api";
import { regenerateWorkspaceWidgetKey } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const workspace = await regenerateWorkspaceWidgetKey(workspaceId);
  return Response.json({ workspace });
}
