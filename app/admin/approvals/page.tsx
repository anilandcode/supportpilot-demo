import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Edit3, FileSearch, Flag, ShieldAlert, X } from "lucide-react";
import { ApprovalAuditTimeline } from "@/components/enterprise/approval-audit-timeline";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { ConfidenceMeter } from "@/components/enterprise/confidence-meter";
import { SourceDrawer } from "@/components/enterprise/source-drawer";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listApprovalQueue, listAuditLogs } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Approval Queue - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

const TABS = ["All", "Refunds", "Billing", "SSO/Security", "Data residency", "Low confidence", "Tool actions"];

export default async function ApprovalsPage() {
  const [approvals, auditLogs] = await Promise.all([listApprovalQueue(), listAuditLogs()]);
  const selected = approvals[0] ?? null;
  const slaAtRisk = approvals.filter((run) => (run.policyRiskScore ?? 0) >= 0.74 || run.confidence < 0.7).length;
  const sourceGaps = approvals.filter((run) => run.sources.length === 0 || (run.groundingStatus && run.groundingStatus !== "pass")).length;

  return (
    <AdminShell title="Approvals" description="Review AI drafts before risky replies or actions reach customers." active="/admin/approvals">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Pending approvals" value={approvals.length} />
        <Metric label="SLA at risk" value={slaAtRisk} />
        <Metric label="Average edit rate" value="24%" />
        <Metric label="Auto-send blocked" value="31" detail="this week" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((tab, index) => (
          <a key={tab} href={index === 0 ? "/admin/approvals" : `/admin/approvals?view=${encodeURIComponent(tab.toLowerCase())}`} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${index === 0 ? "border-accent bg-accent-soft text-accent" : "border-border bg-card text-foreground-2 hover:border-accent hover:text-accent"}`}>
            {tab}
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="space-y-3">
          {approvals.map((run) => (
            <Link key={run.id} href={run.ticketId ? `/admin/tickets/${run.ticketId}` : "/admin/approvals"} className={`block rounded-2xl border bg-card p-4 transition-colors hover:border-accent ${selected?.id === run.id ? "border-accent shadow-sm" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{run.redactedPromptPreview ?? run.prompt.replace(/^Draft a support reply for /, "")}</p>
                  <p className="mt-1 text-xs leading-5 text-foreground-3">{run.rationale}</p>
                </div>
                <StatusBadge value={run.confidence >= 0.82 ? "high" : run.confidence >= 0.62 ? "medium" : "low"} label={`${Math.round(run.confidence * 100)}%`} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(run.riskFlags.length ? run.riskFlags.slice(0, 2) : ["manual review"]).map((flag) => (
                  <StatusBadge key={flag} value={(run.policyRiskScore ?? 0) >= 0.8 ? "critical" : "high"} label={flag.replace(/_/g, " ")} />
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground-3">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                SLA {run.confidence < 0.7 ? "28m" : "1h 12m"} • {run.sources.length} sources
              </p>
            </Link>
          ))}
        </div>

        {selected ? (
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="border-b border-border bg-surface px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-foreground-3">Selected review workspace</p>
                  <h2 className="mt-1 text-xl font-semibold">{selected.redactedPromptPreview ?? selected.prompt.replace(/^Draft a support reply for /, "")}</h2>
                  <p className="mt-2 text-sm text-foreground-2">{selected.escalationReason ?? "Retrieval confidence is usable, but policy prevents auto-send."}</p>
                </div>
                {selected.ticketId && (
                  <Link href={`/admin/tickets/${selected.ticketId}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground-2 hover:border-accent hover:text-accent">
                    <FileSearch className="h-3.5 w-3.5" aria-hidden />
                    Open ticket
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-5 p-5 2xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <ConfidenceMeter breakdown={{
                  retrievalScore: selected.retrievalScore ?? selected.confidence,
                  generationScore: selected.generationScore ?? selected.confidence,
                  policyRiskScore: selected.policyRiskScore ?? (selected.riskFlags.length > 0 ? 0.72 : 0.2),
                  overall: selected.confidence,
                }} />
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-foreground-3">
                    <AlertTriangle className="h-4 w-4 text-[var(--semantic-risk-high)]" aria-hidden />
                    Queue reason
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selected.riskFlags.length ? selected.riskFlags : ["approval policy matched"]).map((flag) => (
                      <StatusBadge key={flag} value={(selected.policyRiskScore ?? 0) >= 0.8 ? "critical" : "high"} label={flag.replace(/_/g, " ")} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                  <p className="flex items-center gap-2 text-xs font-semibold text-foreground-3">
                    <ShieldAlert className="h-4 w-4 text-accent" aria-hidden />
                    Matched policy
                  </p>
                  <p className="mt-3 font-medium text-foreground">Risky topics require manager approval.</p>
                  <p className="mt-1 text-xs leading-5 text-foreground-3">Allowed actions: approve, edit, reject, escalate, add internal note.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">Editable draft</h3>
                    <StatusBadge value={selected.approvalStatus} />
                  </div>
                  <p className="min-h-40 rounded-xl bg-surface p-4 text-sm leading-7 text-foreground-2">{selected.response}</p>
                </div>
                <SourceDrawer sources={selected.sources} />
                <ApprovalAuditTimeline logs={auditLogs.filter((log) => log.ticketId === selected.ticketId || log.details.aiRunId === selected.id)} />
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card/95 px-5 py-4 backdrop-blur">
              <Button size="sm"><CheckCircle2 className="h-4 w-4" aria-hidden /> Approve and send</Button>
              <Button size="sm" variant="outline"><Edit3 className="h-4 w-4" aria-hidden /> Edit draft</Button>
              <Button size="sm" variant="outline"><X className="h-4 w-4" aria-hidden /> Reject draft</Button>
              <Button size="sm" variant="outline"><Flag className="h-4 w-4" aria-hidden /> Escalate to human</Button>
            </div>
          </Card>
        ) : (
          <Card className="rounded-2xl p-8 text-center shadow-none">
            <p className="text-lg font-semibold">No approvals waiting</p>
            <p className="mt-2 text-sm text-foreground-2">Risky or low-confidence drafts will appear here before they reach customers.</p>
          </Card>
        )}
      </div>

      {sourceGaps > 0 && (
        <Card className="mt-6 rounded-2xl border-[var(--badge-waiting-border)] bg-[var(--badge-waiting-bg)] p-4 text-sm text-[var(--badge-waiting-text)] shadow-none">
          {sourceGaps} approval item(s) need better source coverage. Route them to Knowledge as missing-source tasks.
        </Card>
      )}
    </AdminShell>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card className="rounded-lg p-4 shadow-none">
      <p className="text-sm text-foreground-2">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-foreground-3">{detail}</p>}
    </Card>
  );
}
