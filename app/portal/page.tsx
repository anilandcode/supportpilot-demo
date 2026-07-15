import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { ensurePortalIdentity } from "@/lib/auth/api";
import { getWorkspaceLaunchState, listPortalTickets, listTickets } from "@/lib/db/support";
import type { TicketWithRelations, Workspace } from "@/lib/enterprise/types";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/supabase/config";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Customer Portal - ${theme.productName}`,
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const launchState = await getWorkspaceLaunchState();
  const portalAccount = await getPortalAccount(launchState.workspace);
  const tickets = portalAccount.tickets;
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="customer-portal.html"
      pageKey="portal"
      data={{
        workspace: launchState.workspace,
        tickets,
        portalAccount,
        routes: { conversationHref },
      }}
    />
  );
}

async function getPortalAccount(workspace: Workspace): Promise<{
  signedIn: boolean;
  email: string | null;
  customerId: string | null;
  tickets: TicketWithRelations[];
}> {
  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    return {
      signedIn: true,
      email: "maya@northstar.example",
      customerId: null,
      tickets: await listTickets(),
    };
  }

  const portal = await ensurePortalIdentity({ workspaceId: workspace.id, tenantId: workspace.tenantId });
  if (!portal.ok) {
    return {
      signedIn: false,
      email: null,
      customerId: null,
      tickets: [],
    };
  }

  return {
    signedIn: true,
    email: portal.email,
    customerId: portal.customerId,
    tickets: portal.customerId ? await listPortalTickets({ workspaceId: workspace.id, customerId: portal.customerId }) : [],
  };
}
