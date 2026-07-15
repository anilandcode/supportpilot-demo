import { getBillingCatalog, deriveBillingEntitlementLimits, intervalFromPriceId, tierFromPriceId } from "@/lib/billing/stripe";
import { getBillingSnapshot } from "@/lib/billing/plans";
import { getBillingLifecycleState } from "@/lib/db/billing";
import type { BillingEntitlement, BillingInvoice, BillingSubscription } from "@/lib/enterprise/types";

export type BillingReconciliationSeverity = "warn" | "fail";

export type BillingReconciliationIssue = {
  code: string;
  severity: BillingReconciliationSeverity;
  message: string;
  evidence?: Record<string, unknown>;
};

export type BillingReconciliationReport = {
  workspaceId: string;
  tenantId: string;
  checkedAt: string;
  status: "ok" | "warn" | "fail";
  counts: {
    checkoutSessions: number;
    configuredPrices: number;
    customers: number;
    entitlements: number;
    invoices: number;
    subscriptions: number;
  };
  activeSubscriptionId: string | null;
  activeEntitlementId: string | null;
  issues: BillingReconciliationIssue[];
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const BLOCKED_SUBSCRIPTION_STATUSES = new Set(["past_due", "unpaid", "incomplete", "incomplete_expired"]);
const OPEN_INVOICE_STATUSES = new Set(["open", "uncollectible", "void", "failed"]);

export async function buildBillingReconciliationReport(workspaceId?: string | null, now = new Date()): Promise<BillingReconciliationReport> {
  const [snapshot, lifecycle] = await Promise.all([getBillingSnapshot(workspaceId), getBillingLifecycleState(workspaceId ?? undefined)]);
  const issues: BillingReconciliationIssue[] = [];
  const catalog = getBillingCatalog();
  const configuredPrices = catalog.filter((item) => item.configured);
  const subscriptions = lifecycle.subscriptions;
  const entitlements = lifecycle.entitlements;
  const activeSubscriptions = subscriptions.filter((subscription) => ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status));
  const activeSubscription = activeSubscriptions[0] ?? null;
  const activeEntitlement = activeSubscription
    ? entitlements.find((entitlement) => entitlement.stripeSubscriptionId === activeSubscription.stripeSubscriptionId) ?? null
    : entitlements.find((entitlement) => entitlement.source === "stripe") ?? null;

  if (configuredPrices.length < catalog.length) {
    issues.push({
      code: "stripe_price_catalog_incomplete",
      severity: process.env.STRIPE_SECRET_KEY ? "fail" : "warn",
      message: "Launch and Pro monthly/annual Stripe price IDs are not all configured.",
      evidence: {
        configured: configuredPrices.length,
        required: catalog.length,
        missing: catalog.filter((item) => !item.configured).map((item) => item.envVar),
      },
    });
  }

  if ((subscriptions.length > 0 || entitlements.some((entitlement) => entitlement.source === "stripe")) && !lifecycle.customer) {
    issues.push({
      code: "stripe_customer_missing",
      severity: "fail",
      message: "Stripe-backed billing records exist without a tenant customer mapping.",
    });
  }

  if (activeSubscriptions.length > 1) {
    issues.push({
      code: "multiple_active_subscriptions",
      severity: "fail",
      message: "More than one active Stripe subscription exists for the tenant.",
      evidence: { subscriptionIds: activeSubscriptions.map((subscription) => subscription.stripeSubscriptionId) },
    });
  }

  for (const subscription of subscriptions) {
    reconcileSubscription(subscription, lifecycle.customer?.stripeCustomerId ?? null, now, issues);
  }

  for (const entitlement of entitlements.filter((item) => item.source === "stripe")) {
    reconcileEntitlement(entitlement, subscriptions, issues);
  }

  for (const invoice of lifecycle.invoices) {
    reconcileInvoice(invoice, subscriptions, issues);
  }

  for (const session of lifecycle.checkoutSessions) {
    if (session.status === "completed" && !session.stripeSubscriptionId) {
      issues.push({
        code: "checkout_completed_without_subscription",
        severity: "warn",
        message: "A completed checkout session has no linked Stripe subscription.",
        evidence: { stripeCheckoutSessionId: session.stripeCheckoutSessionId },
      });
    }
  }

  if (snapshot.plan.key !== "launch" && subscriptions.length === 0 && entitlements.every((entitlement) => entitlement.source !== "stripe")) {
    issues.push({
      code: "paid_plan_without_stripe_entitlement",
      severity: "warn",
      message: "The workspace is on a paid plan but no Stripe subscription or Stripe entitlement was found.",
      evidence: { plan: snapshot.plan.key },
    });
  }

  const status = issues.some((issue) => issue.severity === "fail") ? "fail" : issues.length > 0 ? "warn" : "ok";

  return {
    workspaceId: snapshot.workspace.id,
    tenantId: snapshot.workspace.tenantId,
    checkedAt: now.toISOString(),
    status,
    counts: {
      checkoutSessions: lifecycle.checkoutSessions.length,
      configuredPrices: configuredPrices.length,
      customers: lifecycle.customer ? 1 : 0,
      entitlements: entitlements.length,
      invoices: lifecycle.invoices.length,
      subscriptions: subscriptions.length,
    },
    activeSubscriptionId: activeSubscription?.stripeSubscriptionId ?? null,
    activeEntitlementId: activeEntitlement?.id ?? null,
    issues,
  };
}

function reconcileSubscription(
  subscription: BillingSubscription,
  stripeCustomerId: string | null,
  now: Date,
  issues: BillingReconciliationIssue[],
) {
  if (stripeCustomerId && subscription.stripeCustomerId !== stripeCustomerId) {
    issues.push({
      code: "subscription_customer_mismatch",
      severity: "fail",
      message: "Subscription customer ID does not match the tenant Stripe customer mapping.",
      evidence: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        subscriptionCustomerId: subscription.stripeCustomerId,
        mappedCustomerId: stripeCustomerId,
      },
    });
  }

  if (subscription.stripePriceId) {
    const priceTier = tierFromPriceId(subscription.stripePriceId);
    const priceInterval = intervalFromPriceId(subscription.stripePriceId);
    if (!priceTier || !priceInterval) {
      issues.push({
        code: "subscription_price_unmapped",
        severity: "fail",
        message: "Subscription references a Stripe price ID that is not present in the configured catalog.",
        evidence: { stripeSubscriptionId: subscription.stripeSubscriptionId, stripePriceId: subscription.stripePriceId },
      });
    } else if (priceTier !== subscription.tier || priceInterval !== subscription.interval) {
      issues.push({
        code: "subscription_price_plan_mismatch",
        severity: "fail",
        message: "Subscription tier or interval does not match its configured Stripe price.",
        evidence: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          stripePriceId: subscription.stripePriceId,
          subscriptionTier: subscription.tier,
          priceTier,
          subscriptionInterval: subscription.interval,
          priceInterval,
        },
      });
    }
  }

  if (BLOCKED_SUBSCRIPTION_STATUSES.has(subscription.status) || subscription.dunningState === "payment_failed") {
    issues.push({
      code: "subscription_payment_blocked",
      severity: "fail",
      message: "Subscription is in a blocked payment or dunning state.",
      evidence: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: subscription.status,
        dunningState: subscription.dunningState,
      },
    });
  }

  if (subscription.currentPeriodStart && subscription.currentPeriodEnd) {
    const start = new Date(subscription.currentPeriodStart).getTime();
    const end = new Date(subscription.currentPeriodEnd).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      issues.push({
        code: "subscription_period_invalid",
        severity: "fail",
        message: "Subscription current period dates are invalid.",
        evidence: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      });
    } else if (ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status) && end <= now.getTime()) {
      issues.push({
        code: "active_subscription_expired",
        severity: "fail",
        message: "Subscription is marked active but its current period has already ended.",
        evidence: { stripeSubscriptionId: subscription.stripeSubscriptionId, currentPeriodEnd: subscription.currentPeriodEnd },
      });
    }
  }
}

function reconcileEntitlement(entitlement: BillingEntitlement, subscriptions: BillingSubscription[], issues: BillingReconciliationIssue[]) {
  const subscription = subscriptions.find((item) => item.stripeSubscriptionId === entitlement.stripeSubscriptionId);
  if (!subscription) {
    issues.push({
      code: "entitlement_subscription_missing",
      severity: "fail",
      message: "Stripe entitlement points at a subscription that is not present in billing state.",
      evidence: { entitlementId: entitlement.id, stripeSubscriptionId: entitlement.stripeSubscriptionId },
    });
    return;
  }

  if (entitlement.tier !== subscription.tier || entitlement.status !== subscription.status) {
    issues.push({
      code: "entitlement_subscription_mismatch",
      severity: "fail",
      message: "Stripe entitlement tier or status does not match the subscription.",
      evidence: {
        entitlementId: entitlement.id,
        entitlementTier: entitlement.tier,
        entitlementStatus: entitlement.status,
        subscriptionTier: subscription.tier,
        subscriptionStatus: subscription.status,
      },
    });
  }

  const expectedLimits = deriveBillingEntitlementLimits(subscription.tier);
  for (const [key, value] of Object.entries(expectedLimits)) {
    if (entitlement.limits[key] !== value) {
      issues.push({
        code: "entitlement_limit_mismatch",
        severity: "fail",
        message: "Stripe entitlement limits do not match the derived plan limits.",
        evidence: { entitlementId: entitlement.id, metric: key, expected: value, actual: entitlement.limits[key] },
      });
      return;
    }
  }
}

function reconcileInvoice(invoice: BillingInvoice, subscriptions: BillingSubscription[], issues: BillingReconciliationIssue[]) {
  if (invoice.stripeSubscriptionId && !subscriptions.some((subscription) => subscription.stripeSubscriptionId === invoice.stripeSubscriptionId)) {
    issues.push({
      code: "invoice_subscription_missing",
      severity: "fail",
      message: "Invoice points at a subscription that is not present in billing state.",
      evidence: { stripeInvoiceId: invoice.stripeInvoiceId, stripeSubscriptionId: invoice.stripeSubscriptionId },
    });
  }

  if (OPEN_INVOICE_STATUSES.has(invoice.status) && invoice.amountDue > invoice.amountPaid) {
    issues.push({
      code: "invoice_unpaid",
      severity: "fail",
      message: "Invoice is unpaid or failed with remaining amount due.",
      evidence: {
        stripeInvoiceId: invoice.stripeInvoiceId,
        status: invoice.status,
        amountDue: invoice.amountDue,
        amountPaid: invoice.amountPaid,
      },
    });
  }
}
