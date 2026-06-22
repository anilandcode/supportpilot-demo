import type { Metadata } from "next";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { TicketList } from "@/components/enterprise/ticket-list";
import { listAgents, listTickets } from "@/lib/db/support";
import type { RiskLevel, TicketPriority, TicketStatus } from "@/lib/enterprise/types";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Ticket Inbox - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  risk?: RiskLevel | "all";
  agent?: string | "all";
};

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [tickets, agents] = await Promise.all([
    listTickets({
      status: params.status ?? "all",
      priority: params.priority ?? "all",
      riskLevel: params.risk ?? "all",
      assignedAgentId: params.agent ?? "all",
    }),
    listAgents(),
  ]);

  return (
    <AdminShell
      title="Ticket inbox"
      description="Filter customer tickets by status, priority, assigned agent, and AI risk level."
      active="/admin/tickets"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Needs approval", href: "/admin/tickets?status=escalated" },
          { label: "Low confidence", href: "/admin/tickets?risk=medium" },
          { label: "Billing disputes", href: "/admin/tickets?priority=urgent&risk=high" },
          { label: "Unassigned", href: "/admin/tickets?agent=all&status=new" },
          { label: "Stale knowledge", href: "/admin/tickets?risk=critical" },
        ].map((view) => (
          <a key={view.label} href={view.href} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground-2 hover:border-accent hover:text-accent">
            {view.label}
          </a>
        ))}
      </div>
      <form className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <Select name="status" label="Status" value={params.status ?? "all"} options={["all", "new", "in_progress", "escalated", "resolved"]} />
        <Select name="priority" label="Priority" value={params.priority ?? "all"} options={["all", "low", "medium", "high", "urgent"]} />
        <Select name="risk" label="Risk" value={params.risk ?? "all"} options={["all", "low", "medium", "high", "critical"]} />
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground-3">Agent</span>
          <select name="agent" defaultValue={params.agent ?? "all"} className="h-10 w-full rounded-xl border border-border bg-surface px-3">
            <option value="all">All</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.fullName}</option>
            ))}
          </select>
        </label>
        <button className="h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg md:col-span-4">Apply filters</button>
      </form>
      <TicketList tickets={tickets} />
    </AdminShell>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: string[] }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground-3">{label}</span>
      <select name={name} defaultValue={value} className="h-10 w-full rounded-xl border border-border bg-surface px-3">
        {options.map((option) => (
          <option key={option} value={option}>{option.replace(/_/g, " ")}</option>
        ))}
      </select>
    </label>
  );
}
