import { requireWorkspaceRole } from "@/lib/auth/api";
import { deliverOutboundEvent, getOutboundEvent } from "@/lib/db/integrations";

export const runtime = "nodejs";

export async function POST(req: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const event = await getOutboundEvent(eventId);
  if (!event) return Response.json({ error: "outbound event not found" }, { status: 404 });

  const workerSecret = process.env.SUPPORTPILOT_INTEGRATION_WORKER_SECRET;
  const providedSecret = req.headers.get("x-supportpilot-integration-secret");
  if (!workerSecret || providedSecret !== workerSecret) {
    const auth = await requireWorkspaceRole(event.workspaceId, ["owner", "admin", "manager"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  }

  const result = await deliverOutboundEvent(event.id);
  return Response.json(result, { status: result.event.status === "failed" ? 502 : 202 });
}
