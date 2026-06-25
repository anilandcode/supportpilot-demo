import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getDashboardMetrics, getWorkspaceLaunchState, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Enterprise Dashboard - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [metrics, launchState, tickets] = await Promise.all([
    getDashboardMetrics(),
    getWorkspaceLaunchState(),
    listTickets(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="dashboard-overview.html"
      pageKey="overview"
      data={{
        metrics,
        launchState,
        workspace: launchState.workspace,
        routes: { conversationHref },
      }}
    />
  );
}
