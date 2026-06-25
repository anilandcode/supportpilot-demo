import { hasEnterpriseRole } from "@/lib/auth/roles";
import { regenerateWorkspaceWidgetKey } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ workspaceId: string }> }) {
  if (!(await hasEnterpriseRole(["support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const { workspaceId } = await context.params;
  const workspace = await regenerateWorkspaceWidgetKey(workspaceId);
  return Response.json({ workspace });
}
