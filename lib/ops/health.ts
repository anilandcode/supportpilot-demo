import { getAppMode, getMissingSupabaseConfig, isProductionMode } from "@/lib/supabase/config";
import { isTransactionalEmailConfigured } from "@/lib/integrations/resend";

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

function redactUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "configured-webhook";
  }
}
