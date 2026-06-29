import { z } from "zod";
import { ensurePortalIdentity, requireTicketWorkspaceRole } from "@/lib/auth/api";
import { appendTicketMessage, getTicket } from "@/lib/db/support";

export const runtime = "nodejs";

const TicketMessageSchema = z.object({
  sender: z.enum(["customer", "agent", "ai"]).default("agent"),
  body: z.string().min(1),
});

export async function POST(req: Request, context: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await context.params;
  const parsed = TicketMessageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "message body is required", issues: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  let authorId: string | null = null;
  if (parsed.data.sender === "customer") {
    const portal = await ensurePortalIdentity({ workspaceId: ticket.workspaceId, tenantId: ticket.tenantId, customerId: ticket.customerId });
    if (!portal.ok) return Response.json({ error: portal.error }, { status: portal.status });
    authorId = portal.userId;
  } else {
    const auth = await requireTicketWorkspaceRole(ticket, ["owner", "admin", "manager", "agent"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    authorId = auth.userId;
  }

  const message = await appendTicketMessage({
    ticketId,
    sender: parsed.data.sender,
    body: parsed.data.body,
    authorId,
  });

  if (!message) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  return Response.json({ message }, { status: 201 });
}
