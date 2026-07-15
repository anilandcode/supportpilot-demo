import type { WorkspaceDomain, WorkspaceDomainHealth } from "@/lib/enterprise/types";

type DomainRecheckResult = {
  workspaceId: string;
  results: Array<{
    domain: WorkspaceDomain;
    verified: boolean;
    skipped: boolean;
    reason: string | null;
    observed: string[];
    health: WorkspaceDomainHealth;
  }>;
  health: WorkspaceDomainHealth[];
};

export type DomainAlertResult =
  | { status: "skipped"; reason: "not_configured" | "healthy" }
  | { status: "sent"; destination: string; unhealthyDomains: number }
  | { status: "failed"; destination: string; error: string; unhealthyDomains: number };

export async function sendDomainRecheckAlert(
  result: DomainRecheckResult,
  fetcher: typeof fetch = fetch,
): Promise<DomainAlertResult> {
  const webhookUrl = process.env.SUPPORTPILOT_DOMAIN_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return { status: "skipped", reason: "not_configured" };

  const unhealthy = result.health.filter((item) => ["failing", "stale", "blocked"].includes(item.status));
  if (unhealthy.length === 0) return { status: "skipped", reason: "healthy" };

  const payload = {
    service: "supportpilot",
    event: "domain_recheck_attention_required",
    workspaceId: result.workspaceId,
    unhealthyDomains: unhealthy.length,
    domains: unhealthy.map((item) => ({
      id: item.domain.id,
      domain: item.domain.domain,
      domainStatus: item.domain.status,
      healthStatus: item.status,
      message: item.message,
      stale: item.stale,
      record: item.record,
      expectedCname: item.expectedCname,
      lastCheckedAt: item.domain.lastCheckedAt,
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
        unhealthyDomains: unhealthy.length,
      };
    }
    return { status: "sent", destination: redactUrl(webhookUrl), unhealthyDomains: unhealthy.length };
  } catch (error) {
    return {
      status: "failed",
      destination: redactUrl(webhookUrl),
      error: error instanceof Error ? error.message : "unknown domain alert delivery error",
      unhealthyDomains: unhealthy.length,
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
