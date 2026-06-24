import type { Metadata } from "next";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { getDashboardMetrics, listModelRouteLogs } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Analytics - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [metrics, routeLogs] = await Promise.all([getDashboardMetrics(), listModelRouteLogs()]);

  return (
    <AdminShell title="Analytics" description="Measure deflection, answer quality, human review, and model cost." active="/admin/analytics">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["Last 14 days", "All workspaces", "Widget + portal"].map((filter) => (
            <span key={filter} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground-2">{filter}</span>
          ))}
        </div>
        <a href="/api/model-routes" className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-fg">Export route logs</a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Deflection rate" value="64%" />
        <Metric label="AI acceptance" value={`${metrics.acceptanceRate}%`} />
        <Metric label="Escalation rate" value={`${metrics.escalationRate}%`} />
        <Metric label="Cost per accepted AI reply" value={`$${metrics.costPerAcceptedReply}`} />
        <Metric label="Median first response" value="1.8s" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Resolution funnel</h2>
              <p className="mt-1 text-sm text-foreground-2">Conversations to AI answered, approved, and resolved.</p>
            </div>
            <StatusBadge value="high" label="healthy" />
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Conversations", 100],
              ["AI eligible", 82],
              ["AI answered", 64],
              ["Approved", metrics.acceptanceRate || 54],
              ["Resolved", metrics.resolvedTickets * 4],
            ].map(([label, value]) => (
              <Bar key={label} label={String(label)} value={Number(value)} />
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-none">
          <h2 className="font-semibold">Confidence distribution</h2>
          <p className="mt-1 text-sm text-foreground-2">High-confidence answers stay fast; medium/low route to review.</p>
          <div className="mt-6 grid gap-3">
            <Distribution label="High" value={52} tone="success" />
            <Distribution label="Medium" value={31} tone="warning" />
            <Distribution label="Low" value={17} tone="danger" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Missing knowledge clusters</h2>
            <a href="/admin/knowledge" className="text-xs font-semibold text-accent">Add source</a>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs font-semibold text-foreground-3">
                <tr>
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">Tickets</th>
                  <th className="px-3 py-2">Lift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.missingTopics.length > 0 ? metrics.missingTopics.map((item, index) => (
                  <tr key={item.topic}>
                    <td className="px-3 py-3">{item.topic}</td>
                    <td className="px-3 py-3">{item.count}</td>
                    <td className="px-3 py-3">{12 - index * 2}%</td>
                  </tr>
                )) : (
                  <tr><td className="px-3 py-3 text-foreground-3" colSpan={3}>No missing topics detected.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Quality panel</h2>
            <StatusBadge value="medium" label="watch" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Quality label="Citation missing rate" value="2.7%" />
            <Quality label="Source stale rate" value="8%" />
            <Quality label="Approval edit rate" value="24%" />
            <Quality label="Human override reason" value="policy gap" />
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <div>
            <h2 className="font-semibold">Model routing and cost</h2>
            <p className="mt-1 text-sm text-foreground-2">Route, provider, model, latency, estimated cost, confidence, and fallback reason.</p>
          </div>
          <StatusBadge value={metrics.fallbackRate > 25 ? "medium" : "high"} label={`${metrics.fallbackRate}% fallback`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-card text-xs font-semibold text-foreground-3">
              <tr className="border-b border-border">
                <Th>Route</Th>
                <Th>Task</Th>
                <Th>Provider/model</Th>
                <Th>Latency</Th>
                <Th>Tokens</Th>
                <Th>Cost</Th>
                <Th>Confidence</Th>
                <Th>Reason</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {routeLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-surface">
                  <Td><StatusBadge value={log.route === "R5" ? "critical" : log.route === "R4" ? "high" : "medium"} label={log.route} /></Td>
                  <Td>{log.task}</Td>
                  <Td>{log.provider} / {log.model}</Td>
                  <Td>{log.latencyMs}ms</Td>
                  <Td>{log.inputTokens + log.outputTokens}</Td>
                  <Td>${log.estimatedCostUsd.toFixed(4)}</Td>
                  <Td>{Math.round(log.confidence * 100)}%</Td>
                  <Td>{log.reason}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-lg p-4 shadow-none">
      <p className="text-sm text-foreground-2">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground-2">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function Distribution({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "danger" }) {
  const color = tone === "success" ? "var(--semantic-confidence-high)" : tone === "warning" ? "var(--semantic-confidence-mid)" : "var(--semantic-confidence-low)";
  return (
    <div className="rounded-xl bg-surface p-3">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-border">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function Quality({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="text-xs text-foreground-3">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="align-top px-4 py-3 text-foreground-2">{children}</td>;
}
