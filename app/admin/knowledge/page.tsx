import type { Metadata } from "next";
import { HtmlHandoffPage } from "@/components/handoff/html-handoff-page";
import { getWorkspaceLaunchState, listDocumentChunks, listKnowledgeDocs, listTickets } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Knowledge Base - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [launchState, docs, chunks, tickets] = await Promise.all([
    getWorkspaceLaunchState(),
    listKnowledgeDocs(),
    listDocumentChunks(),
    listTickets(),
  ]);
  const conversationHref = tickets[0] ? `/admin/tickets/${tickets[0].id}` : "/admin/tickets";

  return (
    <HtmlHandoffPage
      fileName="dashboard-knowledge.html"
      pageKey="knowledge"
      data={{
        workspace: launchState.workspace,
        docs,
        chunks,
        domains: launchState.domains,
        routes: { conversationHref },
      }}
    />
  );
}
