import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { getDashboardMetrics, listApprovalQueue, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Enterprise Dashboard - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [metrics, tickets, approvals] = await Promise.all([
    getDashboardMetrics(),
    listTickets(),
    listApprovalQueue(),
  ]);
  const recentTickets = tickets.slice(0, 6);

  return (
    <AdminShell
      title="Enterprise support dashboard"
      description="Ticket triage, agent-assist AI, escalation workflow, and audit-backed analytics."
      active="/admin"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total tickets", value: metrics.totalTickets, icon: Clock },
          { label: "Resolved", value: metrics.resolvedTickets, icon: CheckCircle2 },
          { label: "Escalated", value: metrics.escalatedTickets, icon: ShieldAlert },
          { label: "AI acceptance", value: `${metrics.acceptanceRate}%`, icon: TrendingUp },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-2">{metric.label}</p>
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent tickets</h2>
            <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm font-medium text-accent">
              Open inbox <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTickets.map((ticket) => (
              <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="grid gap-3 px-5 py-4 hover:bg-surface sm:grid-cols-[1fr_120px_100px] sm:items-center">
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-foreground-3">{ticket.customer.company} · {ticket.assignedAgent?.fullName ?? "Unassigned"}</p>
                </div>
                <StatusBadge value={ticket.status} />
                <StatusBadge value={ticket.riskLevel} />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Approval queue</h2>
            <StatusBadge value="escalated" />
          </div>
          <p className="mt-2 text-sm text-foreground-2">
            High-risk or low-confidence drafts require manager approval before a customer reply can be sent.
          </p>
          <div className="mt-5 space-y-3">
            {approvals.slice(0, 5).map((run) => (
              <Link key={run.id} href={run.ticketId ? `/admin/tickets/${run.ticketId}` : "/admin/approvals"} className="block rounded-xl border border-border bg-surface p-3 hover:border-accent">
                <p className="text-sm font-medium">{run.prompt.replace(/^Draft a support reply for /, "")}</p>
                <p className="mt-1 text-xs text-foreground-3">{Math.round(run.confidence * 100)}% confidence · {run.riskFlags.join(", ") || "manual review"}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
