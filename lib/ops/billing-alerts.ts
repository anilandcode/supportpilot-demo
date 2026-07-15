import type { BillingReconciliationReport } from "@/lib/billing/reconciliation";

export type BillingReconciliationAlertResult =
  | { status: "skipped"; reason: "not_configured" | "healthy" }
  | { status: "sent"; destination: string; issueCount: number }
  | { status: "failed"; destination: string; error: string; issueCount: number };

export function verifyBillingReconciliationSecret(value: string | null) {
  const expected = process.env.SUPPORTPILOT_BILLING_RECONCILIATION_SECRET;
  return Boolean(expected) && value === expected;
}

export async function sendBillingReconciliationAlert(
  report: BillingReconciliationReport,
  fetcher: typeof fetch = fetch,
): Promise<BillingReconciliationAlertResult> {
  const webhookUrl = process.env.SUPPORTPILOT_BILLING_RECONCILIATION_WEBHOOK_URL;
  if (!webhookUrl) return { status: "skipped", reason: "not_configured" };
  if (report.status === "ok") return { status: "skipped", reason: "healthy" };

  const payload = {
    service: "supportpilot",
    event: "billing_reconciliation_attention_required",
    workspaceId: report.workspaceId,
    tenantId: report.tenantId,
    status: report.status,
    checkedAt: report.checkedAt,
    counts: report.counts,
    issues: report.issues.map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
    })),
  };

  try {
    const response = await fetcher(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return {
        status: "failed",
        destination: redactUrl(webhookUrl),
        error: `webhook returned ${response.status}`,
        issueCount: report.issues.length,
      };
    }
    return { status: "sent", destination: redactUrl(webhookUrl), issueCount: report.issues.length };
  } catch (error) {
    return {
      status: "failed",
      destination: redactUrl(webhookUrl),
      error: error instanceof Error ? error.message : "unknown billing reconciliation alert delivery error",
      issueCount: report.issues.length,
    };
  }
}

function redactUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "configured-webhook";
  }
}
