import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApprovalAuditTimeline } from "@/components/enterprise/approval-audit-timeline";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { TicketAiPanel } from "@/components/enterprise/ticket-ai-panel";
import { Card } from "@/components/ui/card";
import { getTicket, listAuditLogs } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Ticket Detail - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const [ticket, auditLogs] = await Promise.all([getTicket(ticketId), listAuditLogs(undefined, ticketId)]);
  if (!ticket) notFound();

  return (
    <AdminShell title={ticket.subject} description={`${ticket.customer.company} · ${ticket.customer.plan} plan`} active="/admin/tickets">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card className="rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={ticket.status} />
              <StatusBadge value={ticket.priority} />
              <StatusBadge value={ticket.riskLevel} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <Info label="Customer" value={ticket.customer.name} />
              <Info label="Company" value={ticket.customer.company} />
              <Info label="Assigned" value={ticket.assignedAgent?.fullName ?? "Unassigned"} />
              <Info label="Health score" value={`${ticket.customer.healthScore}/100`} />
              <Info label="Sentiment" value={ticket.sentiment} />
              <Info label="Escalation" value={ticket.escalationReason ?? "None"} />
            </dl>
          </Card>

          <Card className="overflow-hidden rounded-2xl">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Conversation history</h2>
            </div>
            <div className="divide-y divide-border">
              {ticket.messages.map((message) => (
                <div key={message.id} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-3">{message.sender}</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-2">{message.body}</p>
                </div>
              ))}
            </div>
          </Card>

          <ApprovalAuditTimeline logs={auditLogs} />
        </div>

        <TicketAiPanel ticket={ticket} />
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-3">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
