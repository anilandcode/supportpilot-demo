import { z } from "zod";
import { createPortalTicket } from "@/lib/db/support";

export const runtime = "nodejs";

const PortalTicketSchema = z.object({
  workspaceId: z.string().optional(),
  subject: z.string().min(2),
  category: z.string().optional(),
  description: z.string().min(2),
});

export async function POST(req: Request) {
  const parsed = PortalTicketSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "subject and description are required", issues: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await createPortalTicket(parsed.data);
  return Response.json({ ticket }, { status: 201 });
}
