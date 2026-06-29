import {
  deriveBillingEntitlementLimits,
  normalizeStripeBillingEvent,
  type StripeBillingEvent,
} from "@/lib/billing/stripe";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import type {
  BillingCheckoutSession,
  BillingDunningState,
  BillingEntitlement,
  BillingInterval,
  BillingInvoice,
  BillingSubscription,
  BillingSubscriptionStatus,
  BillingTierKey,
  StripeCustomerMapping,
  StripeWebhookEvent,
} from "@/lib/enterprise/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const localBillingState = {
  customers: [] as StripeCustomerMapping[],
  checkoutSessions: [] as BillingCheckoutSession[],
  subscriptions: [] as BillingSubscription[],
  invoices: [] as BillingInvoice[],
  entitlements: [] as BillingEntitlement[],
  webhookEvents: [] as StripeWebhookEvent[],
};

export function getLocalBillingState() {
  return localBillingState;
}

export async function getStripeCustomerForTenant(tenantId: string): Promise<StripeCustomerMapping | null> {
  const local = localBillingState.customers.find((customer) => customer.tenantId === tenantId);
  if (local) return local;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("stripe_customers").select("*").eq("tenant_id", maybeUuid(tenantId)).maybeSingle();
  if (error || !data) return null;
  return mapStripeCustomer(data);
}

export async function getStripeCustomerByStripeId(stripeCustomerId: string): Promise<StripeCustomerMapping | null> {
  const local = localBillingState.customers.find((customer) => customer.stripeCustomerId === stripeCustomerId);
  if (local) return local;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("stripe_customers").select("*").eq("stripe_customer_id", stripeCustomerId).maybeSingle();
  if (error || !data) return null;
  return mapStripeCustomer(data);
}

export async function upsertStripeCustomerMapping(input: {
  tenantId: string;
  workspaceId?: string | null;
  stripeCustomerId: string;
  email?: string | null;
  name?: string | null;
}): Promise<StripeCustomerMapping> {
  const now = new Date().toISOString();
  const existing = localBillingState.customers.find((customer) => customer.tenantId === input.tenantId);
  const customer: StripeCustomerMapping = {
    id: existing?.id ?? publicId("cusmap"),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? existing?.workspaceId ?? null,
    stripeCustomerId: input.stripeCustomerId,
    email: input.email ?? existing?.email ?? null,
    name: input.name ?? existing?.name ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) Object.assign(existing, customer);
  else localBillingState.customers.unshift(customer);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("stripe_customers").upsert(toStripeCustomerRow(customer), { onConflict: "tenant_id" });
  }

  return customer;
}

export async function recordCheckoutSession(input: Omit<BillingCheckoutSession, "id" | "createdAt" | "completedAt" | "status"> & Partial<Pick<BillingCheckoutSession, "id" | "createdAt" | "completedAt" | "status">>) {
  const session: BillingCheckoutSession = {
    ...input,
    id: input.id ?? publicId("checkout"),
    status: input.status ?? "created",
    createdAt: input.createdAt ?? new Date().toISOString(),
    completedAt: input.completedAt ?? null,
  };
  localBillingState.checkoutSessions.unshift(session);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("billing_checkout_sessions").upsert(toCheckoutSessionRow(session), { onConflict: "stripe_checkout_session_id" });
  }

  return session;
}

export async function markCheckoutSessionCompleted(input: {
  stripeCheckoutSessionId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const now = new Date().toISOString();
  const local = localBillingState.checkoutSessions.find((session) => session.stripeCheckoutSessionId === input.stripeCheckoutSessionId);
  if (local) {
    local.status = "completed";
    local.completedAt = now;
    local.stripeCustomerId = input.stripeCustomerId ?? local.stripeCustomerId;
    local.stripeSubscriptionId = input.stripeSubscriptionId ?? local.stripeSubscriptionId;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase
      .from("billing_checkout_sessions")
      .update({
        status: "completed",
        completed_at: now,
        stripe_customer_id: input.stripeCustomerId ?? undefined,
        stripe_subscription_id: input.stripeSubscriptionId ?? undefined,
      })
      .eq("stripe_checkout_session_id", input.stripeCheckoutSessionId);
  }
}

export async function hasProcessedStripeWebhookEvent(stripeEventId: string) {
  const local = localBillingState.webhookEvents.find((event) => event.stripeEventId === stripeEventId);
  if (local?.status === "processed" || local?.status === "ignored") return true;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { data, error } = await supabase.from("stripe_webhook_events").select("status").eq("stripe_event_id", stripeEventId).maybeSingle();
  if (error || !data) return false;
  return data.status === "processed" || data.status === "ignored";
}

export async function recordStripeWebhookEvent(input: {
  stripeEventId: string;
  type: string;
  livemode: boolean;
  status: StripeWebhookEvent["status"];
  payload: Record<string, unknown>;
  error?: string | null;
}) {
  const now = new Date().toISOString();
  const existing = localBillingState.webhookEvents.find((event) => event.stripeEventId === input.stripeEventId);
  const event: StripeWebhookEvent = {
    id: existing?.id ?? publicId("stripeevt"),
    stripeEventId: input.stripeEventId,
    type: input.type,
    livemode: input.livemode,
    status: input.status,
    error: input.error ?? null,
    payload: input.payload,
    receivedAt: existing?.receivedAt ?? now,
    processedAt: input.status === "processed" || input.status === "failed" || input.status === "ignored" ? now : null,
  };
  if (existing) Object.assign(existing, event);
  else localBillingState.webhookEvents.unshift(event);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("stripe_webhook_events").upsert(toWebhookEventRow(event), { onConflict: "stripe_event_id" });
  }

  return event;
}

export async function upsertSubscription(input: {
  tenantId: string;
  workspaceId?: string | null;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId?: string | null;
  tier: BillingTierKey;
  interval?: BillingInterval | null;
  status: BillingSubscriptionStatus;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  dunningState?: BillingDunningState;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const existing = localBillingState.subscriptions.find((subscription) => subscription.stripeSubscriptionId === input.stripeSubscriptionId);
  const subscription: BillingSubscription = {
    id: existing?.id ?? publicId("sub"),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? existing?.workspaceId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId,
    stripeCustomerId: input.stripeCustomerId,
    stripePriceId: input.stripePriceId ?? existing?.stripePriceId ?? null,
    tier: input.tier,
    interval: input.interval ?? existing?.interval ?? null,
    status: input.status,
    currentPeriodStart: input.currentPeriodStart ?? existing?.currentPeriodStart ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? existing?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing?.cancelAtPeriodEnd ?? false,
    canceledAt: input.canceledAt ?? existing?.canceledAt ?? null,
    dunningState: input.dunningState ?? existing?.dunningState ?? "none",
    metadata: input.metadata ?? existing?.metadata ?? {},
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) Object.assign(existing, subscription);
  else localBillingState.subscriptions.unshift(subscription);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("subscriptions").upsert(toSubscriptionRow(subscription), { onConflict: "stripe_subscription_id" });
  }

  await upsertEntitlementFromSubscription(subscription);
  return subscription;
}

export async function upsertInvoice(input: {
  tenantId: string;
  workspaceId?: string | null;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  status: string;
  amountDue?: number;
  amountPaid?: number;
  currency?: string;
  hostedInvoiceUrl?: string | null;
  invoicePdf?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}) {
  const now = new Date().toISOString();
  const existing = localBillingState.invoices.find((invoice) => invoice.stripeInvoiceId === input.stripeInvoiceId);
  const invoice: BillingInvoice = {
    id: existing?.id ?? publicId("invoice"),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? existing?.workspaceId ?? null,
    stripeInvoiceId: input.stripeInvoiceId,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
    status: input.status,
    amountDue: input.amountDue ?? existing?.amountDue ?? 0,
    amountPaid: input.amountPaid ?? existing?.amountPaid ?? 0,
    currency: input.currency ?? existing?.currency ?? "usd",
    hostedInvoiceUrl: input.hostedInvoiceUrl ?? existing?.hostedInvoiceUrl ?? null,
    invoicePdf: input.invoicePdf ?? existing?.invoicePdf ?? null,
    periodStart: input.periodStart ?? existing?.periodStart ?? null,
    periodEnd: input.periodEnd ?? existing?.periodEnd ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) Object.assign(existing, invoice);
  else localBillingState.invoices.unshift(invoice);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("invoices").upsert(toInvoiceRow(invoice), { onConflict: "stripe_invoice_id" });
  }

  return invoice;
}

export async function processStripeBillingEvent(event: StripeBillingEvent) {
  const normalized = normalizeStripeBillingEvent(event);
  const customer = normalized.stripeCustomerId ? await getStripeCustomerByStripeId(normalized.stripeCustomerId) : null;
  const tenantId = normalized.tenantId ?? customer?.tenantId ?? null;
  const workspaceId = normalized.workspaceId ?? customer?.workspaceId ?? null;

  if (normalized.type === "checkout.session.completed") {
    if (normalized.stripeCheckoutSessionId) {
      await markCheckoutSessionCompleted({
        stripeCheckoutSessionId: normalized.stripeCheckoutSessionId,
        stripeCustomerId: normalized.stripeCustomerId,
        stripeSubscriptionId: normalized.stripeSubscriptionId,
      });
    }
    if (tenantId && normalized.stripeCustomerId) {
      await upsertStripeCustomerMapping({
        tenantId,
        workspaceId,
        stripeCustomerId: normalized.stripeCustomerId,
        email: stringOrNull(normalized.object.customer_details?.email ?? normalized.object.customer_email),
        name: stringOrNull(normalized.object.customer_details?.name),
      });
    }
    return { action: "checkout_completed", normalized };
  }

  if (normalized.type.startsWith("customer.subscription.")) {
    if (!tenantId || !normalized.stripeCustomerId || !normalized.stripeSubscriptionId || !normalized.tier) {
      return { action: "ignored_missing_subscription_context", normalized };
    }
    const status = normalizeSubscriptionStatus(normalized.status);
    await upsertSubscription({
      tenantId,
      workspaceId,
      stripeSubscriptionId: normalized.stripeSubscriptionId,
      stripeCustomerId: normalized.stripeCustomerId,
      stripePriceId: normalized.stripePriceId,
      tier: normalized.tier,
      interval: normalized.interval,
      status,
      currentPeriodStart: normalized.currentPeriodStart,
      currentPeriodEnd: normalized.currentPeriodEnd,
      cancelAtPeriodEnd: normalized.cancelAtPeriodEnd,
      canceledAt: normalized.canceledAt,
      dunningState: status === "past_due" || status === "unpaid" ? "payment_failed" : "none",
      metadata: { stripeEventType: normalized.type },
    });
    return { action: "subscription_upserted", normalized };
  }

  if (normalized.type === "invoice.paid" || normalized.type === "invoice.payment_failed") {
    if (!tenantId || !normalized.stripeCustomerId || !normalized.stripeInvoiceId) {
      return { action: "ignored_missing_invoice_context", normalized };
    }
    await upsertInvoice({
      tenantId,
      workspaceId,
      stripeInvoiceId: normalized.stripeInvoiceId,
      stripeCustomerId: normalized.stripeCustomerId,
      stripeSubscriptionId: normalized.stripeSubscriptionId,
      status: normalized.status ?? (normalized.type === "invoice.paid" ? "paid" : "open"),
      amountDue: normalized.amountDue,
      amountPaid: normalized.amountPaid,
      currency: normalized.currency,
      hostedInvoiceUrl: stringOrNull(normalized.object.hosted_invoice_url),
      invoicePdf: stringOrNull(normalized.object.invoice_pdf),
      periodStart: normalized.currentPeriodStart,
      periodEnd: normalized.currentPeriodEnd,
    });
    if (normalized.stripeSubscriptionId) {
      await updateSubscriptionDunning(normalized.stripeSubscriptionId, normalized.type === "invoice.paid" ? "recovered" : "payment_failed");
    }
    return { action: normalized.type === "invoice.paid" ? "invoice_paid" : "invoice_payment_failed", normalized };
  }

  return { action: "ignored_unsupported_event", normalized };
}

export async function getBillingLifecycleState(workspaceId = DEMO_WORKSPACE_ID) {
  const workspace = await getWorkspace(workspaceId);
  const tenantId = workspace.tenantId;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const [{ data: customers }, { data: subscriptions }, { data: invoices }, { data: entitlements }, { data: sessions }] = await Promise.all([
      supabase.from("stripe_customers").select("*").eq("tenant_id", maybeUuid(tenantId)),
      supabase.from("subscriptions").select("*").eq("tenant_id", maybeUuid(tenantId)).order("updated_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("tenant_id", maybeUuid(tenantId)).order("created_at", { ascending: false }).limit(10),
      supabase.from("entitlements").select("*").eq("tenant_id", maybeUuid(tenantId)),
      supabase.from("billing_checkout_sessions").select("*").eq("tenant_id", maybeUuid(tenantId)).order("created_at", { ascending: false }).limit(10),
    ]);
    return {
      customer: customers?.[0] ? mapStripeCustomer(customers[0]) : null,
      subscriptions: (subscriptions ?? []).map(mapSubscription),
      invoices: (invoices ?? []).map(mapInvoice),
      entitlements: (entitlements ?? []).map(mapEntitlement),
      checkoutSessions: (sessions ?? []).map(mapCheckoutSession),
    };
  }

  return {
    customer: localBillingState.customers.find((customer) => customer.tenantId === tenantId) ?? null,
    subscriptions: localBillingState.subscriptions.filter((subscription) => subscription.tenantId === tenantId),
    invoices: localBillingState.invoices.filter((invoice) => invoice.tenantId === tenantId),
    entitlements: localBillingState.entitlements.filter((entitlement) => entitlement.tenantId === tenantId),
    checkoutSessions: localBillingState.checkoutSessions.filter((session) => session.tenantId === tenantId),
  };
}

async function upsertEntitlementFromSubscription(subscription: BillingSubscription) {
  const now = new Date().toISOString();
  const existing = localBillingState.entitlements.find((entitlement) => entitlement.tenantId === subscription.tenantId && entitlement.workspaceId === subscription.workspaceId);
  const entitlement: BillingEntitlement = {
    id: existing?.id ?? publicId("ent"),
    tenantId: subscription.tenantId,
    workspaceId: subscription.workspaceId,
    tier: subscription.tier,
    status: subscription.status,
    limits: deriveBillingEntitlementLimits(subscription.tier),
    source: "stripe",
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    effectiveAt: subscription.currentPeriodStart ?? existing?.effectiveAt ?? now,
    expiresAt: subscription.currentPeriodEnd,
    updatedAt: now,
  };
  if (existing) Object.assign(existing, entitlement);
  else localBillingState.entitlements.unshift(entitlement);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("entitlements").upsert(toEntitlementRow(entitlement), { onConflict: "tenant_id,workspace_id" });
  }

  return entitlement;
}

async function updateSubscriptionDunning(stripeSubscriptionId: string, dunningState: BillingDunningState) {
  const local = localBillingState.subscriptions.find((subscription) => subscription.stripeSubscriptionId === stripeSubscriptionId);
  if (local) {
    local.dunningState = dunningState;
    local.updatedAt = new Date().toISOString();
  }
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("subscriptions").update({ dunning_state: dunningState, updated_at: new Date().toISOString() }).eq("stripe_subscription_id", stripeSubscriptionId);
  }
}

function mapStripeCustomer(row: any): StripeCustomerMapping {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? null,
    stripeCustomerId: row.stripe_customer_id,
    email: row.email ?? null,
    name: row.name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCheckoutSession(row: any): BillingCheckoutSession {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    priceId: row.price_id,
    tier: row.tier ?? "launch",
    interval: row.interval ?? "monthly",
    status: row.status ?? "created",
    url: row.url ?? null,
    actorUserId: row.actor_user_id ?? null,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    completedAt: row.completed_at ?? null,
  };
}

function mapSubscription(row: any): BillingSubscription {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCustomerId: row.stripe_customer_id,
    stripePriceId: row.stripe_price_id ?? null,
    tier: row.tier ?? "launch",
    interval: row.interval ?? null,
    status: row.status ?? "active",
    currentPeriodStart: row.current_period_start ?? null,
    currentPeriodEnd: row.current_period_end ?? null,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    canceledAt: row.canceled_at ?? null,
    dunningState: row.dunning_state ?? "none",
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvoice(row: any): BillingInvoice {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? null,
    stripeInvoiceId: row.stripe_invoice_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    status: row.status,
    amountDue: row.amount_due ?? 0,
    amountPaid: row.amount_paid ?? 0,
    currency: row.currency ?? "usd",
    hostedInvoiceUrl: row.hosted_invoice_url ?? null,
    invoicePdf: row.invoice_pdf ?? null,
    periodStart: row.period_start ?? null,
    periodEnd: row.period_end ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEntitlement(row: any): BillingEntitlement {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? null,
    tier: row.tier ?? "launch",
    status: row.status ?? "demo",
    limits: row.limits ?? {},
    source: row.source ?? "demo",
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    effectiveAt: row.effective_at,
    expiresAt: row.expires_at ?? null,
    updatedAt: row.updated_at,
  };
}

function toStripeCustomerRow(customer: StripeCustomerMapping) {
  return {
    id: maybeUuid(customer.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(customer.tenantId),
    workspace_id: maybeUuid(customer.workspaceId),
    stripe_customer_id: customer.stripeCustomerId,
    email: customer.email,
    name: customer.name,
    updated_at: customer.updatedAt,
  };
}

function toCheckoutSessionRow(session: BillingCheckoutSession) {
  return {
    id: maybeUuid(session.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(session.tenantId),
    workspace_id: maybeUuid(session.workspaceId),
    stripe_checkout_session_id: session.stripeCheckoutSessionId,
    stripe_customer_id: session.stripeCustomerId,
    stripe_subscription_id: session.stripeSubscriptionId,
    price_id: session.priceId,
    tier: session.tier,
    interval: session.interval,
    status: session.status,
    url: session.url,
    actor_user_id: maybeUuid(session.actorUserId),
    metadata: session.metadata,
    completed_at: session.completedAt,
    created_at: session.createdAt,
  };
}

function toSubscriptionRow(subscription: BillingSubscription) {
  return {
    id: maybeUuid(subscription.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(subscription.tenantId),
    workspace_id: maybeUuid(subscription.workspaceId),
    stripe_subscription_id: subscription.stripeSubscriptionId,
    stripe_customer_id: subscription.stripeCustomerId,
    stripe_price_id: subscription.stripePriceId,
    tier: subscription.tier,
    interval: subscription.interval,
    status: subscription.status,
    current_period_start: subscription.currentPeriodStart,
    current_period_end: subscription.currentPeriodEnd,
    cancel_at_period_end: subscription.cancelAtPeriodEnd,
    canceled_at: subscription.canceledAt,
    dunning_state: subscription.dunningState,
    metadata: subscription.metadata,
    created_at: subscription.createdAt,
    updated_at: subscription.updatedAt,
  };
}

function toInvoiceRow(invoice: BillingInvoice) {
  return {
    id: maybeUuid(invoice.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(invoice.tenantId),
    workspace_id: maybeUuid(invoice.workspaceId),
    stripe_invoice_id: invoice.stripeInvoiceId,
    stripe_customer_id: invoice.stripeCustomerId,
    stripe_subscription_id: invoice.stripeSubscriptionId,
    status: invoice.status,
    amount_due: invoice.amountDue,
    amount_paid: invoice.amountPaid,
    currency: invoice.currency,
    hosted_invoice_url: invoice.hostedInvoiceUrl,
    invoice_pdf: invoice.invoicePdf,
    period_start: invoice.periodStart,
    period_end: invoice.periodEnd,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
  };
}

function toEntitlementRow(entitlement: BillingEntitlement) {
  return {
    id: maybeUuid(entitlement.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(entitlement.tenantId),
    workspace_id: maybeUuid(entitlement.workspaceId),
    tier: entitlement.tier,
    status: entitlement.status,
    limits: entitlement.limits,
    source: entitlement.source,
    stripe_subscription_id: entitlement.stripeSubscriptionId,
    effective_at: entitlement.effectiveAt,
    expires_at: entitlement.expiresAt,
    updated_at: entitlement.updatedAt,
  };
}

function toWebhookEventRow(event: StripeWebhookEvent) {
  return {
    id: maybeUuid(event.id) ?? crypto.randomUUID(),
    stripe_event_id: event.stripeEventId,
    type: event.type,
    livemode: event.livemode,
    status: event.status,
    error: event.error,
    payload: event.payload,
    received_at: event.receivedAt,
    processed_at: event.processedAt,
  };
}

function normalizeSubscriptionStatus(value: string | null): BillingSubscriptionStatus {
  if (
    value === "incomplete" ||
    value === "incomplete_expired" ||
    value === "trialing" ||
    value === "active" ||
    value === "past_due" ||
    value === "canceled" ||
    value === "unpaid" ||
    value === "paused"
  ) {
    return value;
  }
  return "active";
}

function publicId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
