import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { listApprovalQueue } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Approval Queue - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await listApprovalQueue();

  return (
    <AdminShell title="Human approval queue" description="Manager review for high-risk, legal, billing, refund, policy, or low-confidence drafts." active="/admin/approvals">
      <div className="space-y-4">
        {approvals.map((run) => (
          <Card key={run.id} className="rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{run.prompt.replace(/^Draft a support reply for /, "")}</h2>
                <p className="mt-1 text-sm text-foreground-2">{run.rationale}</p>
              </div>
              <StatusBadge value={run.approvalStatus} />
            </div>
            <p className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed text-foreground-2">{run.response}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground-3">
              <span>{Math.round(run.confidence * 100)}% confidence</span>
              <span>·</span>
              <span>{run.riskFlags.join(", ") || "No flags"}</span>
              {run.ticketId && (
                <>
                  <span>·</span>
                  <Link href={`/admin/tickets/${run.ticketId}`} className="text-accent">Open ticket</Link>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
