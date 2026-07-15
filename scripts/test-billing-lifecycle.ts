import {
  deriveBillingEntitlementLimits,
  getBillingCatalog,
  intervalFromPriceId,
  makeStripeTestSignature,
  normalizeStripeBillingEvent,
  tierFromPriceId,
  verifyStripeWebhookSignature,
} from "../lib/billing/stripe.ts";
import { buildBillingReconciliationReport } from "../lib/billing/reconciliation.ts";
import {
  sendBillingReconciliationAlert,
  verifyBillingReconciliationSecret,
} from "../lib/ops/billing-alerts.ts";
import {
  getLocalBillingState,
  hasProcessedStripeWebhookEvent,
  processStripeBillingEvent,
  recordStripeWebhookEvent,
  upsertStripeCustomerMapping,
} from "../lib/db/billing.ts";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

process.env.STRIPE_LAUNCH_MONTHLY_PRICE_ID = "price_launch_monthly";
process.env.STRIPE_LAUNCH_ANNUAL_PRICE_ID = "price_launch_annual";
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
const catalog = getBillingCatalog();
checks.push(["Stripe catalog has Launch/Pro monthly and annual prices", catalog.length === 4 && catalog.every((item) => item.configured), String(catalog.length)]);
checks.push(["price ID maps to tier", tierFromPriceId("price_pro_monthly") === "pro", tierFromPriceId("price_pro_monthly") ?? "null"]);
checks.push(["price ID maps to interval", intervalFromPriceId("price_launch_annual") === "annual", intervalFromPriceId("price_launch_annual") ?? "null"]);

const limits = deriveBillingEntitlementLimits("pro");
checks.push(["Pro entitlements include higher conversations", limits.conversations === 10000 && limits.aiReplies === 8000, JSON.stringify(limits)]);

const payload = JSON.stringify({ id: "evt_test_signature", type: "invoice.paid", data: { object: { id: "in_test" } } });
const signature = makeStripeTestSignature(payload, "whsec_test", 1_800_000_000);
checks.push([
  "Stripe webhook signature accepts valid payload",
  verifyStripeWebhookSignature({ payload, signatureHeader: signature, secret: "whsec_test", nowMs: 1_800_000_000_000 }),
  signature.slice(0, 18),
]);
checks.push([
  "Stripe webhook signature rejects tampered payload",
  !verifyStripeWebhookSignature({ payload: payload.replace("invoice.paid", "invoice.failed"), signatureHeader: signature, secret: "whsec_test", nowMs: 1_800_000_000_000 }),
  "tampered",
]);

await upsertStripeCustomerMapping({
  tenantId: DEMO_TENANT_ID,
  workspaceId: DEMO_WORKSPACE_ID,
  stripeCustomerId: "cus_test_supportpilot",
  email: "owner@example.com",
  name: "Owner",
});

const subscriptionEvent = {
  id: "evt_sub_created",
  type: "customer.subscription.created",
  livemode: false,
  data: {
    object: {
      id: "sub_test_supportpilot",
      customer: "cus_test_supportpilot",
      status: "active",
      current_period_start: 1_800_000_000,
      current_period_end: 1_802_592_000,
      cancel_at_period_end: false,
      metadata: {
        org_id: DEMO_TENANT_ID,
        workspace_id: DEMO_WORKSPACE_ID,
        tier: "pro",
        interval: "monthly",
      },
      items: {
        data: [{ price: { id: "price_pro_monthly", recurring: { interval: "month" } } }],
      },
    },
  },
};

const normalized = normalizeStripeBillingEvent(subscriptionEvent);
checks.push(["subscription event normalizes Pro tier", normalized.tier === "pro" && normalized.interval === "monthly", `${normalized.tier}/${normalized.interval}`]);

await processStripeBillingEvent(subscriptionEvent);
const state = getLocalBillingState();
checks.push(["subscription event creates subscription", state.subscriptions.some((sub) => sub.stripeSubscriptionId === "sub_test_supportpilot" && sub.status === "active"), String(state.subscriptions.length)]);
checks.push(["subscription event derives entitlements", state.entitlements.some((entitlement) => entitlement.tier === "pro" && entitlement.limits.aiReplies === 8000), String(state.entitlements.length)]);

await processStripeBillingEvent({
  id: "evt_invoice_failed",
  type: "invoice.payment_failed",
  livemode: false,
  data: {
    object: {
      id: "in_failed",
      customer: "cus_test_supportpilot",
      subscription: "sub_test_supportpilot",
      status: "open",
      amount_due: 14900,
      amount_paid: 0,
      currency: "usd",
      lines: { data: [{ period: { start: 1_800_000_000, end: 1_802_592_000 }, price: { id: "price_pro_monthly" } }] },
    },
  },
});

checks.push(["invoice payment failure records invoice", state.invoices.some((invoice) => invoice.stripeInvoiceId === "in_failed" && invoice.amountDue === 14900), String(state.invoices.length)]);
checks.push(["invoice payment failure starts dunning", state.subscriptions.some((sub) => sub.stripeSubscriptionId === "sub_test_supportpilot" && sub.dunningState === "payment_failed"), state.subscriptions[0]?.dunningState ?? "none"]);

const failedBillingReport = await buildBillingReconciliationReport(DEMO_WORKSPACE_ID, new Date("2027-01-20T00:00:00.000Z"));
checks.push(["billing reconciliation flags unpaid invoice", failedBillingReport.status === "fail" && failedBillingReport.issues.some((issue) => issue.code === "invoice_unpaid"), failedBillingReport.status]);
checks.push(["billing reconciliation flags dunning state", failedBillingReport.issues.some((issue) => issue.code === "subscription_payment_blocked"), failedBillingReport.issues.map((issue) => issue.code).join(",")]);
const originalBillingSecret = process.env.SUPPORTPILOT_BILLING_RECONCILIATION_SECRET;
const originalBillingWebhook = process.env.SUPPORTPILOT_BILLING_RECONCILIATION_WEBHOOK_URL;
process.env.SUPPORTPILOT_BILLING_RECONCILIATION_SECRET = "billing_reconcile_secret";
process.env.SUPPORTPILOT_BILLING_RECONCILIATION_WEBHOOK_URL = "https://hooks.example.test/billing/reconciliation?token=secret";
checks.push(["billing reconciliation worker secret rejects missing value", !verifyBillingReconciliationSecret(null), "missing"]);
checks.push(["billing reconciliation worker secret accepts matching value", verifyBillingReconciliationSecret("billing_reconcile_secret"), "matched"]);
let alertPayload: any = null;
const alertResult = await sendBillingReconciliationAlert(failedBillingReport, async (_url, init) => {
  alertPayload = JSON.parse(String(init?.body ?? "{}"));
  return new Response(null, { status: 204 });
});
checks.push(["billing reconciliation alert sends failing report", alertResult.status === "sent" && alertPayload?.event === "billing_reconciliation_attention_required", alertResult.status]);
checks.push(["billing reconciliation alert redacts Stripe object evidence", !JSON.stringify(alertPayload).includes("sub_test_supportpilot") && !JSON.stringify(alertPayload).includes("cus_test_supportpilot"), JSON.stringify(alertPayload?.issues ?? [])]);

await processStripeBillingEvent({
  id: "evt_invoice_paid",
  type: "invoice.paid",
  livemode: false,
  data: {
    object: {
      id: "in_failed",
      customer: "cus_test_supportpilot",
      subscription: "sub_test_supportpilot",
      status: "paid",
      amount_due: 14900,
      amount_paid: 14900,
      currency: "usd",
      lines: { data: [{ period: { start: 1_800_000_000, end: 1_802_592_000 }, price: { id: "price_pro_monthly" } }] },
    },
  },
});
const recoveredBillingReport = await buildBillingReconciliationReport(DEMO_WORKSPACE_ID, new Date("2027-01-20T00:00:00.000Z"));
checks.push(["billing reconciliation passes recovered subscription", recoveredBillingReport.status === "ok", recoveredBillingReport.issues.map((issue) => issue.code).join(",") || "ok"]);
const healthyAlert = await sendBillingReconciliationAlert(recoveredBillingReport, async () => new Response(null, { status: 204 }));
checks.push(["billing reconciliation alert skips healthy report", healthyAlert.status === "skipped" && healthyAlert.reason === "healthy", healthyAlert.status]);
restoreEnv("SUPPORTPILOT_BILLING_RECONCILIATION_SECRET", originalBillingSecret);
restoreEnv("SUPPORTPILOT_BILLING_RECONCILIATION_WEBHOOK_URL", originalBillingWebhook);

await recordStripeWebhookEvent({
  stripeEventId: "evt_duplicate",
  type: "invoice.paid",
  livemode: false,
  status: "processed",
  payload: { id: "evt_duplicate" },
});
checks.push(["processed webhook events are idempotent", await hasProcessedStripeWebhookEvent("evt_duplicate"), "evt_duplicate"]);

let failed = 0;
console.log("\nSupportPilot billing lifecycle checks");
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} billing lifecycle checks failed`);
  process.exit(1);
}

console.log("\nBilling lifecycle checks passed\n");
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
