import { requireWorkspaceRole } from "@/lib/auth/api";
import { verifyWorkspaceDomain } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ workspaceId: string; domainId: string }> }) {
  const { workspaceId, domainId } = await context.params;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const result = await verifyWorkspaceDomain({ workspaceId, domainId });
    return Response.json(result, { status: result.verified ? 200 : 409 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "domain verification failed" }, { status: 404 });
  }
}
