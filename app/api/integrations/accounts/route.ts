import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { getBillingSnapshot, getPlanLimitBlock } from "@/lib/billing/plans";
import { listIntegrationAccounts, listWebhookEndpoints, upsertIntegrationAccount, upsertWebhookEndpoint } from "@/lib/db/integrations";
import type { IntegrationAccount, WebhookEndpoint } from "@/lib/enterprise/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AccountSchema = z.object({
  workspaceId: z.string().optional(),
  provider: z.enum(["slack", "webhook", "zendesk", "intercom"]),
  name: z.string().min(1),
  status: z.enum(["active", "disabled", "error"]).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  secretRef: z.string().min(1).nullable().optional(),
});

const WebhookEndpointSchema = z.object({
  workspaceId: z.string().optional(),
  name: z.string().min(1),
  url: z.string().url(),
  signingSecretRef: z.string().min(1).nullable().optional(),
  status: z.enum(["active", "disabled", "error"]).optional(),
  events: z.array(z.enum(["approval_needed", "approval_decided", "approved_reply", "ticket_escalated"])).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const [accounts, webhookEndpoints] = await Promise.all([listIntegrationAccounts(auth.workspaceId), listWebhookEndpoints(auth.workspaceId)]);
  return Response.json({
    accounts: accounts.map(redactAccount),
    webhookEndpoints: webhookEndpoints.map(redactEndpoint),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type = body?.type === "webhook_endpoint" ? "webhook_endpoint" : "account";

  if (type === "webhook_endpoint") {
    const parsed = WebhookEndpointSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid integration payload", issues: parsed.error.flatten() }, { status: 400 });
    const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    const planLimitBlock = await integrationLimitBlock(auth.workspaceId);
    if (planLimitBlock) return planLimitBlock;
    const endpoint = await upsertWebhookEndpoint({ ...parsed.data, workspaceId: auth.workspaceId });
    return Response.json({ webhookEndpoint: redactEndpoint(endpoint) });
  }

  const parsed = AccountSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid integration payload", issues: parsed.error.flatten() }, { status: 400 });
  const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  const planLimitBlock = await integrationLimitBlock(auth.workspaceId);
  if (planLimitBlock) return planLimitBlock;
  const account = await upsertIntegrationAccount({ ...parsed.data, workspaceId: auth.workspaceId });
  return Response.json({ account: redactAccount(account) });
}

async function integrationLimitBlock(workspaceId: string) {
  const billing = await getBillingSnapshot(workspaceId);
  const planLimitBlock = getPlanLimitBlock(billing, ["integrations"]);
  if (!planLimitBlock) return null;
  return Response.json({
    error: "plan limit reached",
    metric: planLimitBlock.key,
    label: planLimitBlock.label,
    used: planLimitBlock.used,
    limit: planLimitBlock.limit,
    plan: billing.plan.key,
  }, { status: 402 });
}

function redactAccount(account: IntegrationAccount) {
  return {
    ...account,
    config: redactConfig(account.config),
    secretRef: account.secretRef ? `${account.secretRef.slice(0, 4)}...` : null,
  };
}

function redactEndpoint(endpoint: WebhookEndpoint) {
  return {
    ...endpoint,
    url: endpoint.url.replace(/\/\/([^/@]+)@/, "//***@"),
    signingSecretRef: endpoint.signingSecretRef ? `${endpoint.signingSecretRef.slice(0, 4)}...` : null,
  };
}

function redactConfig(config: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => (/secret|token|webhook|url/i.test(key) && typeof value === "string" ? [key, `${value.slice(0, 8)}...`] : [key, value])),
  );
}
