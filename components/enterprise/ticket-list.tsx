import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { TicketWithRelations } from "@/lib/enterprise/types";

type TicketListProps = {
  tickets: TicketWithRelations[];
};

export function TicketList({ tickets }: TicketListProps) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="grid grid-cols-[1.2fr_160px_120px_120px_120px] gap-4 border-b border-border bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-3 max-lg:hidden">
        <span>Ticket</span>
        <span>Customer</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Risk</span>
      </div>
      <div className="divide-y divide-border">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/admin/tickets/${ticket.id}`}
            className="grid gap-3 px-5 py-4 hover:bg-surface lg:grid-cols-[1.2fr_160px_120px_120px_120px] lg:items-center"
          >
            <div>
              <p className="font-medium text-foreground">{ticket.subject}</p>
              <p className="mt-1 text-xs text-foreground-3">
                {ticket.assignedAgent?.fullName ?? "Unassigned"} · {ticket.tags.join(", ")}
              </p>
            </div>
            <span className="text-sm text-foreground-2">{ticket.customer.company}</span>
            <StatusBadge value={ticket.status} />
            <StatusBadge value={ticket.priority} />
            <StatusBadge value={ticket.riskLevel} />
          </Link>
        ))}
      </div>
    </Card>
  );
}
