import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getDashboardMetrics, getWorkspaceLaunchState, listModelRouteLogs, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Analytics - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [launchState, metrics, routeLogs, tickets] = await Promise.all([
    getWorkspaceLaunchState(),
    getDashboardMetrics(),
    listModelRouteLogs(),
    listTickets(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="dashboard-analytics.html"
      pageKey="analytics"
      data={{
        workspace: launchState.workspace,
        metrics,
        routeLogs,
        routes: { conversationHref },
      }}
    />
  );
}
