import { createHmac, timingSafeEqual } from "node:crypto";
import { getBillingPlans, type BillingPlanKey } from "@/lib/billing/core";
import type { BillingInterval, BillingTierKey } from "@/lib/enterprise/types";

export type StripeCheckoutInput = {
  customerId: string;
  priceId: string | null;
  tier: BillingTierKey;
  interval: BillingInterval;
  tenantId: string;
  workspaceId: string;
  actorUserId: string | null;
  requestUrl: string;
};

export type StripeCheckoutResult =
  | { mode: "stripe"; sessionId: string; url: string; priceId: string }
  | { mode: "demo"; sessionId: string; url: string; priceId: string | null; reason: "missing_stripe_config" | "stripe_error" };

export type StripePortalResult =
  | { mode: "stripe"; url: string }
  | { mode: "demo"; url: string; reason: "demo" | "stripe_error" };

export type StripeBillingEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  data?: { object?: Record<string, any> };
};

export type NormalizedStripeBillingEvent = {
  eventId: string;
  type: string;
  livemode: boolean;
  object: Record<string, any>;
  tenantId: string | null;
  workspaceId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeInvoiceId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePriceId: string | null;
  tier: BillingTierKey | null;
  interval: BillingInterval | null;
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
};

const PRICE_ENV: Record<Exclude<BillingTierKey, "enterprise">, Record<BillingInterval, string>> = {
  launch: {
    monthly: "STRIPE_LAUNCH_MONTHLY_PRICE_ID",
    annual: "STRIPE_LAUNCH_ANNUAL_PRICE_ID",
  },
  pro: {
    monthly: "STRIPE_PRO_MONTHLY_PRICE_ID",
    annual: "STRIPE_PRO_ANNUAL_PRICE_ID",
  },
};

const BILLING_PLAN_KEY_BY_TIER: Record<BillingTierKey, BillingPlanKey> = {
  launch: "launch",
  pro: "pro",
  enterprise: "enterprise",
};

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || null;
}

export function getConfiguredStripePriceId(tier: BillingTierKey, interval: BillingInterval) {
  if (tier === "enterprise") return null;
  return process.env[PRICE_ENV[tier][interval]] || null;
}

export function getBillingCatalog() {
  return (["launch", "pro"] as const).flatMap((tier) =>
    (["monthly", "annual"] as const).map((interval) => ({
      tier,
      interval,
      priceId: getConfiguredStripePriceId(tier, interval),
      envVar: PRICE_ENV[tier][interval],
      configured: Boolean(getConfiguredStripePriceId(tier, interval)),
    })),
  );
}

export function dashboardBillingUrl(reqOrUrl: Request | string, params: Record<string, string> = {}) {
  const base = typeof reqOrUrl === "string" ? reqOrUrl : reqOrUrl.url;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || base;
  const url = new URL("/admin/billing", appUrl);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

export function deriveBillingEntitlementLimits(tier: BillingTierKey): Record<string, number | null> {
  const plan = getBillingPlans().find((item) => item.key === BILLING_PLAN_KEY_BY_TIER[tier]);
  return plan?.limits ?? {};
}

export function tierFromPriceId(priceId: string | null | undefined): BillingTierKey | null {
  if (!priceId) return null;
  for (const item of getBillingCatalog()) {
    if (item.priceId === priceId) return item.tier;
  }
  return null;
}

export function intervalFromPriceId(priceId: string | null | undefined): BillingInterval | null {
  if (!priceId) return null;
  for (const item of getBillingCatalog()) {
    if (item.priceId === priceId) return item.interval;
  }
  return null;
}

export async function createStripeCustomer(input: { email?: string | null; name?: string | null; tenantId: string; workspaceId: string }) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;

  const body = new URLSearchParams();
  if (input.email) body.set("email", input.email);
  if (input.name) body.set("name", input.name);
  body.set("metadata[org_id]", input.tenantId);
  body.set("metadata[workspace_id]", input.workspaceId);

  const response = await stripePost("/v1/customers", body, secretKey);
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.id === "string" ? data.id : null;
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<StripeCheckoutResult> {
  const secretKey = getStripeSecretKey();
  if (!secretKey || !input.priceId) {
    return {
      mode: "demo",
      sessionId: `cs_demo_${input.tier}_${Date.now()}`,
      url: dashboardBillingUrl(input.requestUrl, { checkout: "demo", plan: input.tier }),
      priceId: input.priceId,
      reason: "missing_stripe_config",
    };
  }

  const successUrl = dashboardBillingUrl(input.requestUrl, { checkout: "processing", session_id: "{CHECKOUT_SESSION_ID}" });
  const cancelUrl = dashboardBillingUrl(input.requestUrl, { checkout: "canceled", plan: input.tier });
  const body = new URLSearchParams({
    mode: "subscription",
    customer: input.customerId,
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: input.tenantId,
    "metadata[org_id]": input.tenantId,
    "metadata[workspace_id]": input.workspaceId,
    "metadata[tier]": input.tier,
    "metadata[interval]": input.interval,
    "metadata[actor_user_id]": input.actorUserId ?? "",
    "subscription_data[metadata][org_id]": input.tenantId,
    "subscription_data[metadata][workspace_id]": input.workspaceId,
    "subscription_data[metadata][tier]": input.tier,
    "subscription_data[metadata][interval]": input.interval,
  });

  const response = await stripePost("/v1/checkout/sessions", body, secretKey);
  if (!response.ok) {
    return {
      mode: "demo",
      sessionId: `cs_error_${input.tier}_${Date.now()}`,
      url: dashboardBillingUrl(input.requestUrl, { checkout: "stripe_error", plan: input.tier }),
      priceId: input.priceId,
      reason: "stripe_error",
    };
  }

  const data = await response.json();
  if (typeof data.id === "string" && typeof data.url === "string") {
    return { mode: "stripe", sessionId: data.id, url: data.url, priceId: input.priceId };
  }

  return {
    mode: "demo",
    sessionId: `cs_error_${input.tier}_${Date.now()}`,
    url: dashboardBillingUrl(input.requestUrl, { checkout: "stripe_error", plan: input.tier }),
    priceId: input.priceId,
    reason: "stripe_error",
  };
}

export async function createStripePortalSession(input: { customerId: string | null; requestUrl: string }): Promise<StripePortalResult> {
  const secretKey = getStripeSecretKey();
  if (!secretKey || !input.customerId) {
    return { mode: "demo", url: dashboardBillingUrl(input.requestUrl, { portal: "demo" }), reason: "demo" };
  }

  const returnUrl = process.env.STRIPE_BILLING_PORTAL_RETURN_URL || dashboardBillingUrl(input.requestUrl);
  const response = await stripePost(
    "/v1/billing_portal/sessions",
    new URLSearchParams({
      customer: input.customerId,
      return_url: returnUrl,
    }),
    secretKey,
  );

  if (!response.ok) return { mode: "demo", url: dashboardBillingUrl(input.requestUrl, { portal: "stripe_error" }), reason: "stripe_error" };
  const data = await response.json();
  if (typeof data.url === "string") return { mode: "stripe", url: data.url };
  return { mode: "demo", url: dashboardBillingUrl(input.requestUrl, { portal: "stripe_error" }), reason: "stripe_error" };
}

export function verifyStripeWebhookSignature(input: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
  nowMs?: number;
}) {
  if (!input.signatureHeader) return false;
  const parts = input.signatureHeader.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value).filter(Boolean);
  if (!timestamp || signatures.length === 0) return false;

  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return false;
  const nowSeconds = Math.floor((input.nowMs ?? Date.now()) / 1000);
  if (Math.abs(nowSeconds - seconds) > (input.toleranceSeconds ?? 300)) return false;

  const expected = createHmac("sha256", input.secret).update(`${timestamp}.${input.payload}`).digest("hex");
  return signatures.some((signature) => safeCompareHex(signature, expected));
}

export function makeStripeTestSignature(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

export function normalizeStripeBillingEvent(event: StripeBillingEvent): NormalizedStripeBillingEvent {
  const object = event.data?.object ?? {};
  const metadata = object.metadata ?? {};
  const price = firstSubscriptionPrice(object);
  const priceId = stringOrNull(price?.id ?? object.price?.id ?? object.price_id);
  const tier = normalizeTier(metadata.tier) ?? tierFromPriceId(priceId);
  const interval = normalizeInterval(metadata.interval) ?? intervalFromPriceId(priceId) ?? normalizeInterval(price?.recurring?.interval);
  const periodStart = object.current_period_start ?? object.period_start ?? object.lines?.data?.[0]?.period?.start;
  const periodEnd = object.current_period_end ?? object.period_end ?? object.lines?.data?.[0]?.period?.end;

  return {
    eventId: event.id,
    type: event.type,
    livemode: Boolean(event.livemode),
    object,
    tenantId: stringOrNull(metadata.org_id ?? metadata.tenant_id ?? object.client_reference_id),
    workspaceId: stringOrNull(metadata.workspace_id),
    stripeCustomerId: stringOrNull(object.customer),
    stripeSubscriptionId: stringOrNull(object.subscription ?? object.id),
    stripeInvoiceId: event.type.startsWith("invoice.") ? stringOrNull(object.id) : null,
    stripeCheckoutSessionId: event.type.startsWith("checkout.") ? stringOrNull(object.id) : null,
    stripePriceId: priceId,
    tier,
    interval,
    status: stringOrNull(object.status),
    currentPeriodStart: timestampToIso(periodStart),
    currentPeriodEnd: timestampToIso(periodEnd),
    cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
    canceledAt: timestampToIso(object.canceled_at),
    amountDue: numberOrZero(object.amount_due),
    amountPaid: numberOrZero(object.amount_paid),
    currency: stringOrNull(object.currency) ?? "usd",
  };
}

async function stripePost(path: string, body: URLSearchParams, secretKey: string) {
  return fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

function safeCompareHex(left: string, right: string) {
  try {
    const leftBuffer = Buffer.from(left, "hex");
    const rightBuffer = Buffer.from(right, "hex");
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  } catch {
    return false;
  }
}

function firstSubscriptionPrice(object: Record<string, any>) {
  return object.items?.data?.[0]?.price ?? object.lines?.data?.[0]?.price ?? null;
}

function timestampToIso(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeTier(value: unknown): BillingTierKey | null {
  return value === "launch" || value === "pro" || value === "enterprise" ? value : null;
}

function normalizeInterval(value: unknown): BillingInterval | null {
  if (value === "month" || value === "monthly") return "monthly";
  if (value === "year" || value === "annual") return "annual";
  return null;
}
