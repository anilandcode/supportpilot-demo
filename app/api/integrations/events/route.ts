import { requireWorkspaceRole } from "@/lib/auth/api";
import { listIntegrationDeliveries, listOutboundEvents } from "@/lib/db/integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const [events, deliveries] = await Promise.all([listOutboundEvents(auth.workspaceId), listIntegrationDeliveries(auth.workspaceId)]);
  return Response.json({ events, deliveries });
}
