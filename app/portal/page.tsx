import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getWorkspaceLaunchState, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Customer Portal - ${theme.productName}`,
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const [launchState, tickets] = await Promise.all([
    getWorkspaceLaunchState(),
    listTickets(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="customer-portal.html"
      pageKey="portal"
      data={{
        workspace: launchState.workspace,
        tickets,
        routes: { conversationHref },
      }}
    />
  );
}
