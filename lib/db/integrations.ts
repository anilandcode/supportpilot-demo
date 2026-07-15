import { createHmac } from "node:crypto";
import { appendAuditLog, getTicket, getWorkspace } from "@/lib/db/support";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import type {
  AIRun,
  IntegrationAccount,
  IntegrationDelivery,
  IntegrationProvider,
  OutboundEvent,
  OutboundEventType,
  WebhookEndpoint,
} from "@/lib/enterprise/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type IntegrationChannel =
  | { kind: "account"; account: IntegrationAccount }
  | { kind: "webhook_endpoint"; endpoint: WebhookEndpoint };

type EnqueueInput = {
  tenantId: string;
  workspaceId: string;
  eventType: OutboundEventType;
  subjectType: OutboundEvent["subjectType"];
  subjectId: string;
  payload: Record<string, unknown>;
};

type UpsertIntegrationAccountInput = {
  workspaceId?: string;
  provider: IntegrationProvider;
  name: string;
  status?: IntegrationAccount["status"];
  config?: Record<string, unknown>;
  secretRef?: string | null;
};

type UpsertWebhookEndpointInput = {
  workspaceId?: string;
  name: string;
  url: string;
  signingSecretRef?: string | null;
  status?: WebhookEndpoint["status"];
  events?: OutboundEventType[];
};

export type IntegrationHealthSummary = {
  status: "ok" | "degraded" | "fail";
  checkedAt: string;
  channels: {
    activeAccounts: number;
    activeWebhookEndpoints: number;
    errorAccounts: number;
    errorWebhookEndpoints: number;
  };
  events: {
    queued: number;
    processing: number;
    delivered: number;
    failed: number;
    skipped: number;
    retryDue: number;
    nextRetryAt: string | null;
  };
  deliveries: {
    total: number;
    delivered: number;
    failed: number;
    skipped: number;
    successRate: number;
    latestStatus: IntegrationDelivery["status"] | null;
    latestError: string | null;
  };
};

const localIntegrationState = {
  accounts: [] as IntegrationAccount[],
  webhookEndpoints: [] as WebhookEndpoint[],
  outboundEvents: [] as OutboundEvent[],
  deliveries: [] as IntegrationDelivery[],
};

export function getLocalIntegrationState() {
  return localIntegrationState;
}

export function resetLocalIntegrationStateForTests() {
  localIntegrationState.accounts.length = 0;
  localIntegrationState.webhookEndpoints.length = 0;
  localIntegrationState.outboundEvents.length = 0;
  localIntegrationState.deliveries.length = 0;
}

export async function upsertIntegrationAccount(input: UpsertIntegrationAccountInput): Promise<IntegrationAccount> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const now = new Date().toISOString();
  const existing = localIntegrationState.accounts.find((account) => account.workspaceId === workspace.id && account.provider === input.provider && account.name === input.name);
  const account: IntegrationAccount = {
    id: existing?.id ?? publicId(),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    provider: input.provider,
    name: input.name,
    status: input.status ?? existing?.status ?? "disabled",
    config: input.config ?? existing?.config ?? {},
    secretRef: input.secretRef ?? existing?.secretRef ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) Object.assign(existing, account);
  else localIntegrationState.accounts.unshift(account);

  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("integration_accounts").upsert(toIntegrationAccountRow(account), { onConflict: "id" });
  return account;
}

export async function upsertWebhookEndpoint(input: UpsertWebhookEndpointInput): Promise<WebhookEndpoint> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const now = new Date().toISOString();
  const existing = localIntegrationState.webhookEndpoints.find((endpoint) => endpoint.workspaceId === workspace.id && endpoint.name === input.name);
  const endpoint: WebhookEndpoint = {
    id: existing?.id ?? publicId(),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    name: input.name,
    url: input.url,
    signingSecretRef: input.signingSecretRef ?? existing?.signingSecretRef ?? null,
    status: input.status ?? existing?.status ?? "disabled",
    events: input.events ?? existing?.events ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) Object.assign(existing, endpoint);
  else localIntegrationState.webhookEndpoints.unshift(endpoint);

  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("webhook_endpoints").upsert(toWebhookEndpointRow(endpoint), { onConflict: "id" });
  return endpoint;
}

export async function listIntegrationAccounts(workspaceId = DEMO_WORKSPACE_ID): Promise<IntegrationAccount[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("integration_accounts")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("updated_at", { ascending: false });
    if (!error && data) return data.map(mapIntegrationAccount);
  }
  return localIntegrationState.accounts.filter((account) => account.workspaceId === workspace.id);
}

export async function listWebhookEndpoints(workspaceId = DEMO_WORKSPACE_ID): Promise<WebhookEndpoint[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("updated_at", { ascending: false });
    if (!error && data) return data.map(mapWebhookEndpoint);
  }
  return localIntegrationState.webhookEndpoints.filter((endpoint) => endpoint.workspaceId === workspace.id);
}

export async function listOutboundEvents(workspaceId = DEMO_WORKSPACE_ID): Promise<OutboundEvent[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("outbound_events")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapOutboundEvent);
  }
  return localIntegrationState.outboundEvents.filter((event) => event.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listIntegrationDeliveries(workspaceId = DEMO_WORKSPACE_ID): Promise<IntegrationDelivery[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("integration_deliveries")
      .select("*")
      .eq("workspace_id", maybeUuid(workspace.id))
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) return data.map(mapIntegrationDelivery);
  }
  return localIntegrationState.deliveries.filter((delivery) => delivery.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getIntegrationHealth(workspaceId = DEMO_WORKSPACE_ID, now = new Date()): Promise<IntegrationHealthSummary> {
  const [accounts, webhookEndpoints, events, deliveries] = await Promise.all([
    listIntegrationAccounts(workspaceId),
    listWebhookEndpoints(workspaceId),
    listOutboundEvents(workspaceId),
    listIntegrationDeliveries(workspaceId),
  ]);
  const nextRetryAt = events
    .map((event) => event.nextRunAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0] ?? null;
  const retryDue = events.filter((event) => event.status === "queued" && event.nextRunAt && Date.parse(event.nextRunAt) <= now.getTime()).length;
  const delivered = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const failedDeliveries = deliveries.filter((delivery) => delivery.status === "failed").length;
  const failedEvents = events.filter((event) => event.status === "failed").length;
  const queuedEvents = events.filter((event) => event.status === "queued").length;
  const errorChannels = accounts.filter((account) => account.status === "error").length + webhookEndpoints.filter((endpoint) => endpoint.status === "error").length;
  const latestDelivery = deliveries[0] ?? null;
  const totalFinalDeliveries = delivered + failedDeliveries;

  return {
    status: failedEvents > 0 || errorChannels > 0 ? "fail" : failedDeliveries > 0 || queuedEvents > 0 || retryDue > 0 ? "degraded" : "ok",
    checkedAt: now.toISOString(),
    channels: {
      activeAccounts: accounts.filter((account) => account.status === "active").length,
      activeWebhookEndpoints: webhookEndpoints.filter((endpoint) => endpoint.status === "active").length,
      errorAccounts: accounts.filter((account) => account.status === "error").length,
      errorWebhookEndpoints: webhookEndpoints.filter((endpoint) => endpoint.status === "error").length,
    },
    events: {
      queued: queuedEvents,
      processing: events.filter((event) => event.status === "processing").length,
      delivered: events.filter((event) => event.status === "delivered").length,
      failed: failedEvents,
      skipped: events.filter((event) => event.status === "skipped").length,
      retryDue,
      nextRetryAt,
    },
    deliveries: {
      total: deliveries.length,
      delivered,
      failed: failedDeliveries,
      skipped: deliveries.filter((delivery) => delivery.status === "skipped").length,
      successRate: totalFinalDeliveries ? Number((delivered / totalFinalDeliveries).toFixed(2)) : 1,
      latestStatus: latestDelivery?.status ?? null,
      latestError: latestDelivery?.error ?? null,
    },
  };
}

export async function enqueueApprovalRequested(aiRun: AIRun) {
  if (!aiRun.ticketId) return [];
  const payload = await buildApprovalPayload(aiRun, "approval_needed");
  return enqueueOutboundEvents({
    tenantId: aiRun.tenantId,
    workspaceId: aiRun.workspaceId,
    eventType: "approval_needed",
    subjectType: "ai_run",
    subjectId: aiRun.id,
    payload,
  });
}

export async function enqueueApprovalDecision(aiRun: AIRun) {
  if (!aiRun.ticketId) return [];
  const eventType: OutboundEventType =
    aiRun.approvalStatus === "approved" || aiRun.approvalStatus === "edited"
      ? "approved_reply"
      : aiRun.approvalStatus === "escalated"
        ? "ticket_escalated"
        : "approval_decided";
  const payload = await buildApprovalPayload(aiRun, eventType);
  return enqueueOutboundEvents({
    tenantId: aiRun.tenantId,
    workspaceId: aiRun.workspaceId,
    eventType,
    subjectType: "ai_run",
    subjectId: aiRun.id,
    payload,
  });
}

export async function enqueueOutboundEvents(input: EnqueueInput): Promise<OutboundEvent[]> {
  const channels = await listActiveChannels(input.workspaceId, input.eventType);
  const events: OutboundEvent[] = [];
  for (const channel of channels) {
    const idempotencyKey = channelIdempotencyKey(input, channel);
    const existing = await findOutboundEventByIdempotencyKey(idempotencyKey);
    if (existing) {
      events.push(existing);
      continue;
    }

    const now = new Date().toISOString();
    const event: OutboundEvent = {
      id: publicId(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      integrationAccountId: channel.kind === "account" ? channel.account.id : null,
      webhookEndpointId: channel.kind === "webhook_endpoint" ? channel.endpoint.id : null,
      eventType: input.eventType,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      idempotencyKey,
      payload: input.payload,
      status: "queued",
      attempts: 0,
      maxAttempts: 5,
      nextRunAt: null,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    localIntegrationState.outboundEvents.unshift(event);
    await persistOutboundEvent(event);
    events.push(event);
  }

  await maybeDeliverInline(events);
  return events;
}

export async function deliverOutboundEvent(eventId: string): Promise<{ event: OutboundEvent; delivery: IntegrationDelivery }> {
  const event = await getOutboundEvent(eventId);
  if (!event) throw new Error(`Outbound event ${eventId} was not found`);
  if (event.status === "delivered" || event.status === "skipped") {
    return {
      event,
      delivery: await recordDelivery(event, {
        provider: await providerForEvent(event),
        status: "skipped",
        httpStatus: null,
        responsePreview: "Event already finalized.",
        error: null,
      }),
    };
  }

  event.status = "processing";
  event.attempts += 1;
  event.updatedAt = new Date().toISOString();
  await persistOutboundEvent(event);

  const provider = await providerForEvent(event);
  try {
    const request = await buildDeliveryRequest(event);
    if (!request) {
      event.status = "skipped";
      event.lastError = "Integration is disabled or missing delivery target.";
      event.updatedAt = new Date().toISOString();
      await persistOutboundEvent(event);
      const delivery = await recordDelivery(event, { provider, status: "skipped", httpStatus: null, responsePreview: null, error: event.lastError });
      return { event, delivery };
    }

    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: request.body,
      cache: "no-store",
    });
    const responsePreview = await response.text().then((text) => text.slice(0, 500)).catch(() => null);
    event.status = response.ok ? "delivered" : event.attempts >= event.maxAttempts ? "failed" : "queued";
    event.lastError = response.ok ? null : `HTTP ${response.status}`;
    event.nextRunAt = response.ok || event.status === "failed" ? null : new Date(Date.now() + Math.min(60_000 * event.attempts, 900_000)).toISOString();
    event.updatedAt = new Date().toISOString();
    await persistOutboundEvent(event);
    const delivery = await recordDelivery(event, {
      provider,
      status: response.ok ? "delivered" : "failed",
      httpStatus: response.status,
      responsePreview,
      error: response.ok ? null : event.lastError,
    });
    return { event, delivery };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown integration delivery error";
    event.status = event.attempts >= event.maxAttempts ? "failed" : "queued";
    event.lastError = message;
    event.nextRunAt = event.status === "queued" ? new Date(Date.now() + Math.min(60_000 * event.attempts, 900_000)).toISOString() : null;
    event.updatedAt = new Date().toISOString();
    await persistOutboundEvent(event);
    const delivery = await recordDelivery(event, { provider, status: "failed", httpStatus: null, responsePreview: null, error: message });
    return { event, delivery };
  }
}

async function listActiveChannels(workspaceId: string, eventType: OutboundEventType): Promise<IntegrationChannel[]> {
  const [accounts, endpoints] = await Promise.all([listIntegrationAccounts(workspaceId), listWebhookEndpoints(workspaceId)]);
  return [
    ...accounts
      .filter((account) => account.status === "active" && channelAllowsEvent(account.config, eventType))
      .map((account): IntegrationChannel => ({ kind: "account", account })),
    ...endpoints
      .filter((endpoint) => endpoint.status === "active" && (endpoint.events.length === 0 || endpoint.events.includes(eventType)))
      .map((endpoint): IntegrationChannel => ({ kind: "webhook_endpoint", endpoint })),
  ];
}

function channelAllowsEvent(config: Record<string, unknown>, eventType: OutboundEventType) {
  const events = Array.isArray(config.events) ? config.events.map(String) : [];
  return events.length === 0 || events.includes(eventType);
}

async function buildApprovalPayload(aiRun: AIRun, eventType: OutboundEventType) {
  const ticket = aiRun.ticketId ? await getTicket(aiRun.ticketId) : null;
  return {
    eventType,
    aiRunId: aiRun.id,
    ticketId: aiRun.ticketId,
    ticketSubject: ticket?.subject ?? "SupportPilot ticket",
    ticketStatus: ticket?.status ?? null,
    customer: ticket?.customer ? { name: ticket.customer.name, company: ticket.customer.company, plan: ticket.customer.plan } : null,
    approvalStatus: aiRun.approvalStatus,
    confidence: aiRun.confidence,
    riskFlags: aiRun.riskFlags,
    responsePreview: aiRun.response.slice(0, 700),
    sources: aiRun.sources,
    createdAt: new Date().toISOString(),
  };
}

async function buildDeliveryRequest(event: OutboundEvent): Promise<{ url: string; body: string; headers: HeadersInit } | null> {
  const account = event.integrationAccountId ? await getIntegrationAccount(event.integrationAccountId) : null;
  const endpoint = event.webhookEndpointId ? await getWebhookEndpoint(event.webhookEndpointId) : null;
  if (account?.status === "disabled" || account?.status === "error" || endpoint?.status === "disabled" || endpoint?.status === "error") return null;

  if (account?.provider === "slack") {
    const url = resolveSecret(account.secretRef) || stringConfig(account.config, "webhookUrl");
    if (!url) return null;
    return {
      url,
      body: JSON.stringify(toSlackPayload(event)),
      headers: { "Content-Type": "application/json" },
    };
  }

  if (account?.provider === "webhook" || endpoint) {
    const url = endpoint?.url ?? stringConfig(account?.config ?? {}, "url");
    if (!url) return null;
    const body = JSON.stringify({ id: event.id, type: event.eventType, createdAt: event.createdAt, data: event.payload });
    const secret = endpoint?.signingSecretRef ? resolveSecret(endpoint.signingSecretRef) : resolveSecret(account?.secretRef ?? null) || stringConfig(account?.config ?? {}, "signingSecret");
    return {
      url,
      body,
      headers: {
        "Content-Type": "application/json",
        "X-SupportPilot-Event": event.eventType,
        "X-SupportPilot-Delivery": event.id,
        ...(secret ? signedWebhookHeaders(body, secret) : {}),
      },
    };
  }

  return null;
}

function toSlackPayload(event: OutboundEvent) {
  const subject = String(event.payload.ticketSubject ?? "SupportPilot ticket");
  const confidence = typeof event.payload.confidence === "number" ? `${Math.round(event.payload.confidence * 100)}%` : "n/a";
  const status = String(event.payload.approvalStatus ?? event.eventType);
  return {
    text: `SupportPilot ${event.eventType}: ${subject}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: `SupportPilot: ${event.eventType.replace(/_/g, " ")}` } },
      { type: "section", text: { type: "mrkdwn", text: `*${subject}*\nStatus: ${status}\nConfidence: ${confidence}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `AI run: ${event.subjectId}` }] },
    ],
  };
}

function signedWebhookHeaders(body: string, secret: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return { "X-SupportPilot-Signature": `t=${timestamp},v1=${signature}` };
}

async function getIntegrationAccount(accountId: string) {
  const local = localIntegrationState.accounts.find((account) => account.id === accountId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("integration_accounts").select("*").eq("id", maybeUuid(accountId)).maybeSingle();
  if (error || !data) return null;
  const account = mapIntegrationAccount(data);
  localIntegrationState.accounts.unshift(account);
  return account;
}

async function getWebhookEndpoint(endpointId: string) {
  const local = localIntegrationState.webhookEndpoints.find((endpoint) => endpoint.id === endpointId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("webhook_endpoints").select("*").eq("id", maybeUuid(endpointId)).maybeSingle();
  if (error || !data) return null;
  const endpoint = mapWebhookEndpoint(data);
  localIntegrationState.webhookEndpoints.unshift(endpoint);
  return endpoint;
}

export async function getOutboundEvent(eventId: string) {
  const local = localIntegrationState.outboundEvents.find((event) => event.id === eventId);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("outbound_events").select("*").eq("id", maybeUuid(eventId)).maybeSingle();
  if (error || !data) return null;
  const event = mapOutboundEvent(data);
  localIntegrationState.outboundEvents.unshift(event);
  return event;
}

async function findOutboundEventByIdempotencyKey(idempotencyKey: string) {
  const local = localIntegrationState.outboundEvents.find((event) => event.idempotencyKey === idempotencyKey);
  if (local) return local;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("outbound_events").select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
  if (error || !data) return null;
  const event = mapOutboundEvent(data);
  localIntegrationState.outboundEvents.unshift(event);
  return event;
}

async function persistOutboundEvent(event: OutboundEvent) {
  const local = localIntegrationState.outboundEvents.find((item) => item.id === event.id);
  if (local && local !== event) Object.assign(local, event);
  if (!local) localIntegrationState.outboundEvents.unshift(event);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("outbound_events").upsert(toOutboundEventRow(event), { onConflict: "id" });
}

async function recordDelivery(
  event: OutboundEvent,
  input: Pick<IntegrationDelivery, "provider" | "status" | "httpStatus" | "responsePreview" | "error">,
) {
  const delivery: IntegrationDelivery = {
    id: publicId(),
    tenantId: event.tenantId,
    workspaceId: event.workspaceId,
    outboundEventId: event.id,
    integrationAccountId: event.integrationAccountId,
    webhookEndpointId: event.webhookEndpointId,
    provider: input.provider,
    attempt: Math.max(event.attempts, 1),
    status: input.status,
    httpStatus: input.httpStatus,
    responsePreview: input.responsePreview,
    error: input.error,
    deliveredAt: input.status === "delivered" ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  };
  localIntegrationState.deliveries.unshift(delivery);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("integration_deliveries").insert(toIntegrationDeliveryRow(delivery));

  if (delivery.status === "delivered" || delivery.status === "failed") {
    await appendAuditLog({
      tenantId: event.tenantId,
      workspaceId: event.workspaceId,
      ticketId: event.subjectType === "ticket" ? event.subjectId : typeof event.payload.ticketId === "string" ? event.payload.ticketId : null,
      userId: null,
      action: `integration.delivery.${delivery.status}`,
      details: { outboundEventId: event.id, provider: delivery.provider, httpStatus: delivery.httpStatus, error: delivery.error },
    });
  }

  return delivery;
}

async function providerForEvent(event: OutboundEvent): Promise<IntegrationDelivery["provider"]> {
  if (event.integrationAccountId) {
    const account = await getIntegrationAccount(event.integrationAccountId);
    return account?.provider ?? "webhook";
  }
  return "webhook_endpoint";
}

function channelIdempotencyKey(input: EnqueueInput, channel: IntegrationChannel) {
  const channelKey = channel.kind === "account" ? `account:${channel.account.id}` : `endpoint:${channel.endpoint.id}`;
  return `${input.workspaceId}:${channelKey}:${input.eventType}:${input.subjectType}:${input.subjectId}`;
}

async function maybeDeliverInline(events: OutboundEvent[]) {
  if (process.env.SUPPORTPILOT_INTEGRATION_DELIVERY_MODE !== "inline") return;
  for (const event of events) {
    await deliverOutboundEvent(event.id).catch(() => null);
  }
}

function stringConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function resolveSecret(secretRef: string | null | undefined) {
  if (!secretRef) return null;
  return process.env[secretRef] || null;
}

function mapIntegrationAccount(row: any): IntegrationAccount {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    provider: row.provider ?? "webhook",
    name: row.name,
    status: row.status ?? "disabled",
    config: row.config ?? {},
    secretRef: row.secret_ref ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWebhookEndpoint(row: any): WebhookEndpoint {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    name: row.name,
    url: row.url,
    signingSecretRef: row.signing_secret_ref ?? null,
    status: row.status ?? "disabled",
    events: Array.isArray(row.events) ? row.events : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOutboundEvent(row: any): OutboundEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    integrationAccountId: row.integration_account_id ?? null,
    webhookEndpointId: row.webhook_endpoint_id ?? null,
    eventType: row.event_type,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    idempotencyKey: row.idempotency_key,
    payload: row.payload ?? {},
    status: row.status ?? "queued",
    attempts: Number(row.attempts ?? 0),
    maxAttempts: Number(row.max_attempts ?? 5),
    nextRunAt: row.next_run_at ?? null,
    lastError: row.last_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapIntegrationDelivery(row: any): IntegrationDelivery {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    outboundEventId: row.outbound_event_id,
    integrationAccountId: row.integration_account_id ?? null,
    webhookEndpointId: row.webhook_endpoint_id ?? null,
    provider: row.provider ?? "webhook",
    attempt: Number(row.attempt ?? 1),
    status: row.status ?? "processing",
    httpStatus: row.http_status ?? null,
    responsePreview: row.response_preview ?? null,
    error: row.error ?? null,
    deliveredAt: row.delivered_at ?? null,
    createdAt: row.created_at,
  };
}

function toIntegrationAccountRow(account: IntegrationAccount) {
  return {
    id: maybeUuid(account.id),
    tenant_id: maybeUuid(account.tenantId),
    workspace_id: maybeUuid(account.workspaceId),
    provider: account.provider,
    name: account.name,
    status: account.status,
    config: account.config,
    secret_ref: account.secretRef,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
  };
}

function toWebhookEndpointRow(endpoint: WebhookEndpoint) {
  return {
    id: maybeUuid(endpoint.id),
    tenant_id: maybeUuid(endpoint.tenantId),
    workspace_id: maybeUuid(endpoint.workspaceId),
    name: endpoint.name,
    url: endpoint.url,
    signing_secret_ref: endpoint.signingSecretRef,
    status: endpoint.status,
    events: endpoint.events,
    created_at: endpoint.createdAt,
    updated_at: endpoint.updatedAt,
  };
}

function toOutboundEventRow(event: OutboundEvent) {
  return {
    id: maybeUuid(event.id),
    tenant_id: maybeUuid(event.tenantId),
    workspace_id: maybeUuid(event.workspaceId),
    integration_account_id: maybeUuid(event.integrationAccountId),
    webhook_endpoint_id: maybeUuid(event.webhookEndpointId),
    event_type: event.eventType,
    subject_type: event.subjectType,
    subject_id: event.subjectId,
    idempotency_key: event.idempotencyKey,
    payload: event.payload,
    status: event.status,
    attempts: event.attempts,
    max_attempts: event.maxAttempts,
    next_run_at: event.nextRunAt,
    last_error: event.lastError,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

function toIntegrationDeliveryRow(delivery: IntegrationDelivery) {
  return {
    id: maybeUuid(delivery.id),
    tenant_id: maybeUuid(delivery.tenantId),
    workspace_id: maybeUuid(delivery.workspaceId),
    outbound_event_id: maybeUuid(delivery.outboundEventId),
    integration_account_id: maybeUuid(delivery.integrationAccountId),
    webhook_endpoint_id: maybeUuid(delivery.webhookEndpointId),
    provider: delivery.provider,
    attempt: delivery.attempt,
    status: delivery.status,
    http_status: delivery.httpStatus,
    response_preview: delivery.responsePreview,
    error: delivery.error,
    delivered_at: delivery.deliveredAt,
    created_at: delivery.createdAt,
  };
}

function publicId() {
  return crypto.randomUUID();
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
