import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { TicketWithRelations } from "@/lib/enterprise/types";

type TicketListProps = {
  tickets: TicketWithRelations[];
};

export function TicketList({ tickets }: TicketListProps) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead className="sticky top-0 bg-surface text-left text-xs font-semibold text-foreground-3">
            <tr className="border-b border-border">
              <Th>ID</Th>
              <Th>Customer</Th>
              <Th>Subject</Th>
              <Th>Intent</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>AI confidence</Th>
              <Th>Sources</Th>
              <Th>Assignee</Th>
              <Th>Last activity</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => {
              const latestRun = ticket.latestAiRun;
              return (
                <tr key={ticket.id} className="group hover:bg-surface">
                  <Td>
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-mono text-xs font-semibold text-accent">
                      {ticket.id.replace("tkt_", "T-")}
                    </Link>
                  </Td>
                  <Td>
                    <p className="font-medium text-foreground">{ticket.customer.company}</p>
                    <p className="mt-0.5 text-xs text-foreground-3">{ticket.customer.name}</p>
                  </Td>
                  <Td>
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-medium text-foreground group-hover:text-accent">
                      {ticket.subject}
                    </Link>
                    <p className="mt-0.5 text-xs text-foreground-3">{ticket.escalationReason ?? "No escalation reason"}</p>
                  </Td>
                  <Td>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground-2">
                      {ticket.tags[0] ?? "support"}
                    </span>
                  </Td>
                  <Td><StatusBadge value={ticket.status} /></Td>
                  <Td><StatusBadge value={ticket.priority} /></Td>
                  <Td>
                    {latestRun ? (
                      <StatusBadge value={latestRun.confidence >= 0.82 ? "high" : latestRun.confidence >= 0.62 ? "medium" : "low"} label={`${Math.round(latestRun.confidence * 100)}%`} />
                    ) : (
                      <span className="text-xs text-foreground-3">Not drafted</span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-xs font-medium text-foreground-2">{latestRun?.sources.length ?? 0} cited</span>
                  </Td>
                  <Td>
                    <span className="text-sm text-foreground-2">{ticket.assignedAgent?.fullName ?? "Unassigned"}</span>
                  </Td>
                  <Td>
                    <time dateTime={ticket.updatedAt} className="text-xs text-foreground-3">{formatDate(ticket.updatedAt)}</time>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="align-top px-4 py-3">{children}</td>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
