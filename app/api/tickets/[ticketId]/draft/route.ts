import { getDemoUser } from "@/lib/supabase/session";
import { draftTicketReply } from "@/lib/workflows/draft";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await context.params;
  const result = await draftTicketReply(ticketId, getDemoUser("support_agent").id);

  if (!result) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  return Response.json(result);
}
