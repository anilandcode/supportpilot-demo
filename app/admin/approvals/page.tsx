import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getWorkspaceLaunchState, listApprovalQueue, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Approval Queue - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const [launchState, approvals, tickets] = await Promise.all([
    getWorkspaceLaunchState(),
    listApprovalQueue(),
    listTickets(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="dashboard-approvals.html"
      pageKey="approvals"
      data={{
        workspace: launchState.workspace,
        approvals,
        routes: { conversationHref },
      }}
    />
  );
}
