import { requireTicketWorkspaceRole } from "@/lib/auth/api";
import { getTicket } from "@/lib/db/support";
import { draftTicketReply } from "@/lib/workflows/draft";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await context.params;
  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  const auth = await requireTicketWorkspaceRole(ticket, ["owner", "admin", "manager", "agent"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const result = await draftTicketReply(ticketId, auth.userId);

  if (!result) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  return Response.json(result);
}
