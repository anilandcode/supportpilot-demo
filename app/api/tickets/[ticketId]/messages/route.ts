import { z } from "zod";
import { hasEnterpriseRole } from "@/lib/auth/roles";
import { appendTicketMessage } from "@/lib/db/support";
import { getDemoUser } from "@/lib/supabase/session";

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

  if (parsed.data.sender !== "customer" && !(await hasEnterpriseRole(["support_agent", "support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const message = await appendTicketMessage({
    ticketId,
    sender: parsed.data.sender,
    body: parsed.data.body,
    authorId: parsed.data.sender === "agent" ? getDemoUser("support_agent").id : null,
  });

  if (!message) {
    return Response.json({ error: "ticket not found" }, { status: 404 });
  }

  return Response.json({ message }, { status: 201 });
}
