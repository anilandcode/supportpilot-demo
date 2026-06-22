import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileSearch } from "lucide-react";
import { ApprovalAuditTimeline } from "@/components/enterprise/approval-audit-timeline";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { ConfidenceMeter } from "@/components/enterprise/confidence-meter";
import { SourceDrawer } from "@/components/enterprise/source-drawer";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { listApprovalQueue, listAuditLogs } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Approval Queue - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const [approvals, auditLogs] = await Promise.all([listApprovalQueue(), listAuditLogs()]);

  return (
    <AdminShell title="Human approval queue" description="Manager review for high-risk, legal, billing, refund, policy, or low-confidence drafts." active="/admin/approvals">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card className="rounded-lg p-4 shadow-none">
          <p className="text-sm text-foreground-2">Queued drafts</p>
          <p className="mt-2 text-2xl font-semibold">{approvals.length}</p>
        </Card>
        <Card className="rounded-lg p-4 shadow-none">
          <p className="text-sm text-foreground-2">Critical policy risk</p>
          <p className="mt-2 text-2xl font-semibold">{approvals.filter((run) => (run.policyRiskScore ?? 0) >= 0.8 || run.riskFlags.some((flag) => /legal|gdpr|sensitive|dpa/i.test(flag))).length}</p>
        </Card>
        <Card className="rounded-lg p-4 shadow-none">
          <p className="text-sm text-foreground-2">Source gaps</p>
          <p className="mt-2 text-2xl font-semibold">{approvals.filter((run) => run.sources.length === 0 || (run.groundingStatus && run.groundingStatus !== "pass")).length}</p>
        </Card>
      </div>

      <div className="space-y-4">
        {approvals.map((run) => (
          <Card key={run.id} className="rounded-lg p-5 shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{run.redactedPromptPreview ?? run.prompt.replace(/^Draft a support reply for /, "")}</h2>
                  <StatusBadge value={run.approvalStatus} />
                </div>
                <p className="mt-1 text-sm text-foreground-2">{run.rationale}</p>
              </div>
              {run.ticketId && (
                <Link href={`/admin/tickets/${run.ticketId}`} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-2 hover:border-accent hover:text-accent">
                  <FileSearch className="h-3.5 w-3.5" aria-hidden />
                  Open ticket
                </Link>
              )}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[280px_1fr]">
              <div className="space-y-3">
                <ConfidenceMeter breakdown={{
                  retrievalScore: run.retrievalScore ?? run.confidence,
                  generationScore: run.generationScore ?? run.confidence,
                  policyRiskScore: run.policyRiskScore ?? (run.riskFlags.length > 0 ? 0.72 : 0.2),
                  overall: run.confidence,
                }} />
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground-3">
                    <AlertTriangle className="h-4 w-4 text-[var(--semantic-risk-high)]" aria-hidden />
                    Why queued
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(run.riskFlags.length ? run.riskFlags : ["manual review"]).map((flag) => <StatusBadge key={flag} value={flag.includes("critical") ? "critical" : "high"} label={flag.replace(/_/g, " ")} />)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="rounded-lg bg-surface p-4 text-sm leading-relaxed text-foreground-2">{run.response}</p>
                <SourceDrawer sources={run.sources} />
                <ApprovalAuditTimeline logs={auditLogs.filter((log) => log.ticketId === run.ticketId || log.details.aiRunId === run.id)} />
                <div className="flex flex-wrap gap-2 text-xs text-foreground-3">
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden /> Final customer send requires manager action.</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
