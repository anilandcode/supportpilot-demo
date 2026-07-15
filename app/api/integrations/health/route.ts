import { requireWorkspaceRole } from "@/lib/auth/api";
import { getIntegrationHealth } from "@/lib/db/integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const health = await getIntegrationHealth(auth.workspaceId);
  return Response.json(
    { health },
    {
      status: health.status === "fail" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
