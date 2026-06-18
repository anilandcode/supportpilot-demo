import type { Metadata } from "next";
import Link from "next/link";
import { ChatWindow } from "@/components/chat/chat-window";
import { Card } from "@/components/ui/card";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Customer Portal - ${theme.productName}`,
};

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <section>
          <Link href="/" className="text-sm font-medium text-accent">← Back to site</Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Customer support portal</h1>
          <p className="mt-4 max-w-2xl text-foreground-2">
            Customers can ask questions, create support context, and get grounded answers from approved docs. Risky cases route into the enterprise ticket workflow.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Grounded answers", "The bot answers only from approved source chunks and shows citations."],
              ["Human handoff", "Low-confidence, refund, billing, legal, policy, or angry cases are escalated."],
              ["Audit trail", "Every AI run and decision is logged for managers and admins."],
              ["Role-ready", "Supabase Auth can protect customer, agent, manager, and admin workspaces."],
            ].map(([title, copy]) => (
              <Card key={title} className="rounded-2xl p-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground-2">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="h-[680px] overflow-hidden rounded-2xl border border-border bg-card">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}
