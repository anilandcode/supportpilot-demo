import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getWorkspaceDomainHealth, getWorkspaceLaunchState, listTickets, listWorkspaceInvitations, listWorkspaceMembers } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Settings - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [launchState, domainHealth, tickets, members, invitations] = await Promise.all([
    getWorkspaceLaunchState(),
    getWorkspaceDomainHealth(),
    listTickets(),
    listWorkspaceMembers(),
    listWorkspaceInvitations(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="dashboard-settings.html"
      pageKey="settings"
      data={{
        launchState,
        domainHealth: domainHealth.health,
        members,
        invitations: invitations.filter((invitation) => invitation.status === "pending"),
        workspace: launchState.workspace,
        publicBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://supportpilot-demo.vercel.app",
        routes: { conversationHref },
      }}
    />
  );
}
