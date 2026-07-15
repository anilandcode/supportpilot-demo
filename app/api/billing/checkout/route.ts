import { requireWorkspaceRole, getAuthenticatedUser } from "@/lib/auth/api";
import {
  createStripeCheckoutSession,
  createStripeCustomer,
  getConfiguredStripePriceId,
  getStripeSecretKey,
} from "@/lib/billing/stripe";
import { parseBillingInterval, parseBillingTier } from "@/lib/billing/web";
import { getStripeCustomerForTenant, recordCheckoutSession, upsertStripeCustomerMapping } from "@/lib/db/billing";
import { getWorkspace } from "@/lib/db/support";

export const runtime = "nodejs";

type CheckoutBody = {
  workspaceId?: string;
  tier?: string;
  interval?: string;
};

export async function POST(req: Request) {
  const { body, formPost } = await readCheckoutBody(req);
  const auth = await requireWorkspaceRole(body.workspaceId, ["owner"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  const workspace = await getWorkspace(auth.workspaceId);

  const tier = parseBillingTier(body.tier);
  const interval = parseBillingInterval(body.interval);
  if (!tier || tier === "enterprise") return Response.json({ error: "Launch or Pro checkout is required" }, { status: 400 });

  const user = await getAuthenticatedUser();
  const existingCustomer = await getStripeCustomerForTenant(workspace.tenantId);
  const stripeCustomerId =
    existingCustomer?.stripeCustomerId ??
    (getStripeSecretKey()
      ? await createStripeCustomer({
          tenantId: workspace.tenantId,
          workspaceId: workspace.id,
          email: user?.email ?? null,
          name: "fullName" in (user ?? {}) ? String((user as any).fullName ?? "") : null,
        })
      : `cus_demo_${workspace.tenantId.slice(0, 8)}`);

  if (!stripeCustomerId) {
    const url = new URL("/admin/billing", req.url);
    url.searchParams.set("checkout", "stripe_error");
    return formPost ? Response.redirect(url, 303) : Response.json({ mode: "demo", reason: "stripe_error", url: url.toString() }, { status: 502 });
  }

  await upsertStripeCustomerMapping({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    stripeCustomerId,
    email: user?.email ?? null,
    name: "fullName" in (user ?? {}) ? String((user as any).fullName ?? "") : null,
  });

  const priceId = getConfiguredStripePriceId(tier, interval);
  const result = await createStripeCheckoutSession({
    customerId: stripeCustomerId,
    priceId,
    tier,
    interval,
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    actorUserId: auth.userId,
    requestUrl: req.url,
  });

  await recordCheckoutSession({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    stripeCheckoutSessionId: result.sessionId,
    stripeCustomerId,
    stripeSubscriptionId: null,
    priceId: result.priceId ?? "",
    tier,
    interval,
    url: result.url,
    actorUserId: auth.userId,
    metadata: { mode: result.mode, reason: result.mode === "demo" ? result.reason : null },
  });

  if (formPost) return Response.redirect(result.url, 303);
  return Response.json(result, { status: result.mode === "stripe" || result.reason === "missing_stripe_config" ? 200 : 502 });
}

async function readCheckoutBody(req: Request): Promise<{ body: CheckoutBody; formPost: boolean }> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    return {
      formPost: true,
      body: {
        workspaceId: stringField(form.get("workspaceId")),
        tier: stringField(form.get("tier")),
        interval: stringField(form.get("interval")),
      },
    };
  }
  return { formPost: false, body: (await req.json().catch(() => ({}))) as CheckoutBody };
}

function stringField(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : undefined;
}
