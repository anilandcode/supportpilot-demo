import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getTicket, getWorkspace, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Ticket Detail - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);
  if (!ticket) notFound();

  const [workspace, tickets] = await Promise.all([
    getWorkspace(ticket.workspaceId),
    listTickets(),
  ]);
  const conversationHref = `/admin/tickets/${ticket.id}`;

  return (
    <HtmlHandoffPage
      fileName="dashboard-conversations.html"
      pageKey="conversations"
      data={{
        workspace,
        ticket,
        tickets,
        routes: { conversationHref },
      }}
    />
  );
}
