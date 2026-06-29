import { z } from "zod";
import { ensurePortalIdentity } from "@/lib/auth/api";
import { createPortalTicket, getWorkspace } from "@/lib/db/support";

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

  const workspace = await getWorkspace(parsed.data.workspaceId);
  const portal = await ensurePortalIdentity({ workspaceId: workspace.id, tenantId: workspace.tenantId });
  if (!portal.ok) {
    return Response.json({ error: portal.error }, { status: portal.status });
  }

  const ticket = await createPortalTicket({
    ...parsed.data,
    workspaceId: workspace.id,
    requesterEmail: portal.email,
    requesterUserId: portal.userId,
  });

  if (portal.ok && portal.userId) {
    await ensurePortalIdentity({ workspaceId: workspace.id, tenantId: workspace.tenantId, customerId: ticket.customerId });
  }

  return Response.json({ ticket }, { status: 201 });
}
