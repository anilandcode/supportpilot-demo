import { z } from "zod";
import { captureProductEvent } from "@/lib/analytics/events";
import { hasEnterpriseRole } from "@/lib/auth/roles";
import { appendAuditLog, getTicket, getWorkspace, recordUsageEvent } from "@/lib/db/support";
import { sendEscalationEmail } from "@/lib/integrations/resend";

export const runtime = "nodejs";

const EscalationEmailSchema = z.object({
  workspaceId: z.string().optional(),
  ticketId: z.string().optional(),
  subject: z.string().min(3),
  body: z.string().min(10),
  to: z.string().email().optional(),
});

export async function POST(req: Request) {
  if (!(await hasEnterpriseRole(["support_agent", "support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = EscalationEmailSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "invalid escalation email payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = parsed.data.ticketId ? await getTicket(parsed.data.ticketId) : null;
  const workspace = await getWorkspace(parsed.data.workspaceId ?? ticket?.workspaceId);
  const to = parsed.data.to || workspace.escalationEmail;
  const subject = `[${workspace.name}] ${parsed.data.subject}`;
  const text = [ticket ? `Ticket: ${ticket.subject}` : null, parsed.data.body].filter(Boolean).join("\n\n");
  const result = await sendEscalationEmail({
    to,
    subject,
    text,
    html: `<p>${text.replace(/\n/g, "<br />")}</p>`,
  });

  await recordUsageEvent({
    workspaceId: workspace.id,
    eventType: "email.escalated",
    metadata: { ticketId: ticket?.id ?? null, to, skipped: result.skipped },
  });
  await captureProductEvent({
    workspaceId: workspace.id,
    event: "email.escalated",
    properties: { ticket_id: ticket?.id ?? null, skipped: result.skipped },
  });
  await appendAuditLog({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    ticketId: ticket?.id ?? null,
    userId: null,
    action: "email.escalated",
    details: { to, subject, result },
  });

  return Response.json({ ok: result.skipped ? true : result.ok, result });
}
