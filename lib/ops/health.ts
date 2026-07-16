import { getAppMode, getMissingSupabaseConfig, isProductionMode } from "@/lib/supabase/config";
import { isTransactionalEmailConfigured } from "@/lib/integrations/resend";
import { getDashboardMetrics, getTicket, getWidgetConfig, getWorkspace, listApprovalQueue, listTickets } from "@/lib/db/support";
import { getModelReadiness } from "@/lib/generation";
import { getRetriever, hasUsefulContext } from "@/lib/retriever";

export type HealthCheckStatus = "pass" | "warn" | "fail";

export type HealthCheck = {
  key: string;
  status: HealthCheckStatus;
  message: string;
};

export type HealthSnapshot = {
  status: "ok" | "degraded" | "fail";
  appMode: ReturnType<typeof getAppMode>;
  checkedAt: string;
  checks: HealthCheck[];
};

export type HealthAlertResult =
  | { status: "skipped"; reason: "not_configured" | "healthy" }
  | { status: "sent"; destination: string }
  | { status: "failed"; destination: string; error: string };

export function buildHealthSnapshot(now = new Date()): HealthSnapshot {
  const checks: HealthCheck[] = [
    checkSupabaseConfig(),
    checkInvitationEmail(),
    checkSentry(),
    checkRateLimitStore(),
    checkBackgroundWorkers(),
    checkStripe(),
  ];
  const hasFail = checks.some((check) => check.status === "fail");
  const hasWarn = checks.some((check) => check.status === "warn");
  return {
    status: hasFail ? "fail" : hasWarn ? "degraded" : "ok",
    appMode: getAppMode(),
    checkedAt: now.toISOString(),
    checks,
  };
}

export async function buildDeploymentHealthSnapshot(now = new Date()): Promise<HealthSnapshot> {
  const base = buildHealthSnapshot(now);
  const checks = [...base.checks, ...(await checkCoreRouteContracts())];
  return {
    ...base,
    status: snapshotStatus(checks),
    checks,
  };
}

export function verifyHealthAlertSecret(value: string | null) {
  const expected = process.env.SUPPORTPILOT_HEALTH_ALERT_SECRET;
  return !expected || value === expected;
}

export async function sendHealthAlert(
  snapshot: HealthSnapshot,
  fetcher: typeof fetch = fetch,
): Promise<HealthAlertResult> {
  const webhookUrl = process.env.SUPPORTPILOT_HEALTH_ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return { status: "skipped", reason: "not_configured" };
  }
  if (snapshot.status === "ok") {
    return { status: "skipped", reason: "healthy" };
  }

  const payload = {
    service: "supportpilot",
    status: snapshot.status,
    appMode: snapshot.appMode,
    checkedAt: snapshot.checkedAt,
    failingChecks: snapshot.checks
      .filter((check) => check.status !== "pass")
      .map((check) => ({
        key: check.key,
        status: check.status,
        message: check.message,
      })),
  };

  try {
    const response = await fetcher(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { status: "failed", destination: redactUrl(webhookUrl), error: `webhook returned ${response.status}` };
    }
    return { status: "sent", destination: redactUrl(webhookUrl) };
  } catch (error) {
    return {
      status: "failed",
      destination: redactUrl(webhookUrl),
      error: error instanceof Error ? error.message : "unknown alert delivery error",
    };
  }
}

function checkSupabaseConfig(): HealthCheck {
  const missing = getMissingSupabaseConfig();
  if (missing.length === 0) {
    return { key: "supabase", status: "pass", message: "Supabase URL, anon key, and service role are configured." };
  }
  return {
    key: "supabase",
    status: isProductionMode() ? "fail" : "warn",
    message: `Missing Supabase config: ${missing.join(", ")}`,
  };
}

function checkInvitationEmail(): HealthCheck {
  if (isTransactionalEmailConfigured()) {
    return { key: "invitation_email", status: "pass", message: "Resend transactional email is configured." };
  }
  return {
    key: "invitation_email",
    status: isProductionMode() ? "fail" : "warn",
    message: "RESEND_API_KEY is not configured.",
  };
}

function checkSentry(): HealthCheck {
  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return { key: "sentry", status: "pass", message: "Sentry DSN is configured." };
  }
  return {
    key: "sentry",
    status: isProductionMode() ? "warn" : "warn",
    message: "Sentry DSN is not configured.",
  };
}

function checkRateLimitStore(): HealthCheck {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { key: "rate_limit_store", status: "pass", message: "Upstash Redis REST rate-limit store is configured." };
  }
  return {
    key: "rate_limit_store",
    status: isProductionMode() ? "warn" : "warn",
    message: "Using local in-memory rate limiter because Upstash Redis REST is not configured.",
  };
}

function checkBackgroundWorkers(): HealthCheck {
  const missing = [
    ["SUPPORTPILOT_INGESTION_WORKER_SECRET", process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET],
    ["SUPPORTPILOT_INTEGRATION_WORKER_SECRET", process.env.SUPPORTPILOT_INTEGRATION_WORKER_SECRET],
    ["SUPPORTPILOT_RETENTION_WORKER_SECRET", process.env.SUPPORTPILOT_RETENTION_WORKER_SECRET],
    ["SUPPORTPILOT_EVAL_WORKER_SECRET", process.env.SUPPORTPILOT_EVAL_WORKER_SECRET],
  ].filter(([, value]) => !value).map(([key]) => key);

  if (missing.length === 0) {
    return { key: "background_workers", status: "pass", message: "Background worker secrets are configured." };
  }
  return {
    key: "background_workers",
    status: isProductionMode() ? "warn" : "warn",
    message: `Missing worker secret(s): ${missing.join(", ")}`,
  };
}

function checkStripe(): HealthCheck {
  const missing = [
    ["STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET],
  ].filter(([, value]) => !value).map(([key]) => key);

  if (missing.length === 0) {
    return { key: "stripe", status: "pass", message: "Stripe secret and webhook secret are configured." };
  }
  return {
    key: "stripe",
    status: isProductionMode() ? "warn" : "warn",
    message: `Missing Stripe config: ${missing.join(", ")}`,
  };
}

async function checkCoreRouteContracts(): Promise<HealthCheck[]> {
  const workspace = await safeCheck("workspace_runtime", async () => {
    const resolvedWorkspace = await getWorkspace();
    return {
      ok: Boolean(resolvedWorkspace.id && resolvedWorkspace.widgetKey),
      message: `Workspace ${resolvedWorkspace.slug} resolved for deployment probes.`,
      workspaceId: resolvedWorkspace.id,
    };
  });
  const workspaceId = typeof workspace.extra?.workspaceId === "string" ? workspace.extra.workspaceId : undefined;

  return [
    workspace.check,
    await safeCheck("stats_runtime", async () => {
      const metrics = await getDashboardMetrics(workspaceId);
      return {
        ok: Number.isFinite(metrics.totalTickets) && Number.isFinite(metrics.acceptanceRate),
        message: `/api/stats dependencies returned ${metrics.totalTickets} tickets and ${Math.round(metrics.acceptanceRate * 100)}% acceptance.`,
      };
    }),
    await safeCheck("chat_runtime", async () => {
      const [widgetConfig, chunks] = await Promise.all([
        getWidgetConfig(workspaceId),
        getRetriever(workspaceId).retrieve("pricing refund security support", 3),
      ]);
      const modelReadiness = getModelReadiness();
      const retrievalReady = chunks.length > 0 && hasUsefulContext(chunks);
      return {
        ok: retrievalReady && modelReadiness.ready && Boolean(widgetConfig.launcherLabel),
        allowWarn: retrievalReady && !modelReadiness.ready,
        message: retrievalReady
          ? modelReadiness.ready
            ? `/api/chat dependencies can retrieve approved context and provider generation is configured.`
            : `/api/chat retrieval works, but provider generation is not configured: ${modelReadiness.reason}`
          : "/api/chat could not retrieve useful approved context.",
      };
    }),
    await safeCheck("ticket_draft_runtime", async () => {
      const tickets = await listTickets({ workspaceId });
      const ticket = tickets[0] ? await getTicket(tickets[0].id) : null;
      return {
        ok: Boolean(ticket?.customer && Array.isArray(ticket.messages)),
        message: ticket ? `/api/tickets/[ticketId]/draft dependencies resolved ticket ${ticket.id}.` : "No ticket is available for draft probes.",
      };
    }),
    await safeCheck("approval_decision_runtime", async () => {
      const queue = await listApprovalQueue(workspaceId);
      return {
        ok: Array.isArray(queue) && queue.every((run) => Boolean(run.id && run.approvalStatus)),
        message: `/api/ai-runs/[aiRunId]/decision dependencies returned ${queue.length} review candidate(s).`,
      };
    }),
  ].map((item) => ("check" in item ? item.check : item));
}

async function safeCheck(
  key: string,
  fn: () => Promise<{ ok: boolean; allowWarn?: boolean; message: string; workspaceId?: string }>,
): Promise<{ check: HealthCheck; extra?: { workspaceId?: string } }> {
  try {
    const result = await fn();
    const status: HealthCheckStatus = result.ok ? "pass" : result.allowWarn || !isProductionMode() ? "warn" : "fail";
    return { check: { key, status, message: result.message }, extra: { workspaceId: result.workspaceId } };
  } catch (error) {
    return {
      check: {
        key,
        status: isProductionMode() ? "fail" : "warn",
        message: error instanceof Error ? error.message : "runtime probe failed",
      },
    };
  }
}

function snapshotStatus(checks: HealthCheck[]): HealthSnapshot["status"] {
  const hasFail = checks.some((check) => check.status === "fail");
  const hasWarn = checks.some((check) => check.status === "warn");
  return hasFail ? "fail" : hasWarn ? "degraded" : "ok";
}

function redactUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "configured-webhook";
  }
}
