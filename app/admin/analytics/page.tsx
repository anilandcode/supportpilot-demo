import type { Metadata } from "next";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { Card } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Analytics - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const metrics = await getDashboardMetrics();

  return (
    <AdminShell title="Support analytics" description="AI quality, escalation, response speed, and missing topics." active="/admin/analytics">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Resolved tickets" value={String(metrics.resolvedTickets)} />
        <Metric label="Acceptance rate" value={`${metrics.acceptanceRate}%`} />
        <Metric label="Response time" value={`${metrics.responseTimeMinutes}m`} />
        <Metric label="Escalation rate" value={`${metrics.escalationRate}%`} />
        <Metric label="Cost per conversation" value={`$${metrics.costPerConversation}`} />
        <Metric label="Cost per accepted reply" value={`$${metrics.costPerAcceptedReply}`} />
        <Metric label="Fallback route rate" value={`${metrics.fallbackRate}%`} />
        <Metric label="Escalated tickets" value={String(metrics.escalatedTickets)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl p-5">
          <h2 className="font-semibold">Missing topics</h2>
          <div className="mt-4 space-y-3">
            {metrics.missingTopics.map((item) => (
              <div key={item.topic} className="flex items-center justify-between rounded-xl bg-surface p-3 text-sm">
                <span>{item.topic}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-2xl p-5">
          <h2 className="font-semibold">Top ticket questions</h2>
          <div className="mt-4 space-y-3">
            {metrics.topQuestions.map((item) => (
              <div key={item.question} className="flex items-center justify-between rounded-xl bg-surface p-3 text-sm">
                <span>{item.question}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl p-5">
      <p className="text-sm text-foreground-2">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
