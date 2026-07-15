import { buildBillingSnapshot, currentBillingPeriod, getBillingPlans, getPlanLimitBlock, type BillingSnapshot } from "@/lib/billing/core";
import { listIntegrationAccounts, listWebhookEndpoints } from "@/lib/db/integrations";
import { getLocalState, getWorkspace, listDocumentChunks, listKnowledgeDocs, listModelRouteLogs, listWorkspaceDomains } from "@/lib/db/support";
import type { Organization, UsageEvent, Workspace } from "@/lib/enterprise/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export { getBillingPlans, getPlanLimitBlock };
export type { BillingPlanKey, BillingRouteCost, BillingSnapshot, BillingUsageMetric, UsageMetricKey } from "@/lib/billing/core";

async function resolvePlanForWorkspace(workspace: Workspace): Promise<Organization["plan"] | string | null> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("organizations").select("plan").eq("id", workspace.tenantId).maybeSingle();
    if (!error && data?.plan) return data.plan;
  }

  const organization = getLocalState().organizations.find((item) => item.id === workspace.tenantId);
  return organization?.plan ?? null;
}

async function readSupabaseUsage(workspace: Workspace, start: Date, end: Date) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const [{ data: usageEvents }, { count: aiRunCount }, { count: workspaceCount }, { count: memberCount }] = await Promise.all([
    supabase
      .from("usage_events")
      .select("*")
      .eq("workspace_id", workspace.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("ai_runs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase.from("workspaces").select("id", { count: "exact", head: true }).eq("tenant_id", workspace.tenantId),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
  ]);

  if (!usageEvents) return null;

  const events = usageEvents.map((event: any): UsageEvent => ({
    id: event.id,
    tenantId: event.tenant_id,
    workspaceId: event.workspace_id,
    eventType: event.event_type,
    quantity: Number(event.quantity ?? 1),
    metadata: event.metadata ?? {},
    createdAt: event.created_at,
  }));

  return {
    usageEvents: events,
    aiRunCount: aiRunCount ?? 0,
    workspaceCount: workspaceCount ?? 1,
    memberCount: memberCount ?? 0,
  };
}

function inPeriod(createdAt: string, start: Date, end: Date) {
  const created = new Date(createdAt).getTime();
  return created >= start.getTime() && created < end.getTime();
}

async function readUsage(workspace: Workspace, start: Date, end: Date) {
  const supabaseUsage = await readSupabaseUsage(workspace, start, end);
  if (supabaseUsage) return supabaseUsage;

  const state = getLocalState();
  return {
    usageEvents: state.usageEvents.filter((event) => event.workspaceId === workspace.id && inPeriod(event.createdAt, start, end)),
    aiRunCount: state.aiRuns.filter((run) => run.workspaceId === workspace.id && inPeriod(run.createdAt, start, end)).length,
    workspaceCount: state.workspaces.filter((item) => item.tenantId === workspace.tenantId).length,
    memberCount: state.memberships.filter((membership) => membership.workspaceId === workspace.id).length,
  };
}

export async function getBillingSnapshot(workspaceId?: string | null): Promise<BillingSnapshot> {
  const workspace = await getWorkspace(workspaceId ?? undefined);
  const { start, end } = currentBillingPeriod();
  const [organizationPlan, usage, knowledgeDocs, documentChunks, domains, accounts, webhookEndpoints, routeLogs] = await Promise.all([
    resolvePlanForWorkspace(workspace),
    readUsage(workspace, start, end),
    listKnowledgeDocs(workspace.id),
    listDocumentChunks(workspace.id),
    listWorkspaceDomains(workspace.id),
    listIntegrationAccounts(workspace.id),
    listWebhookEndpoints(workspace.id),
    listModelRouteLogs(workspace.id),
  ]);

  return buildBillingSnapshot({
    workspace,
    organizationPlan,
    usageEvents: usage.usageEvents,
    aiRunCount: usage.aiRunCount,
    workspaceCount: usage.workspaceCount,
    memberCount: usage.memberCount,
    knowledgeDocs,
    documentChunkCount: documentChunks.length,
    domainCount: domains.length,
    integrationCount: accounts.length + webhookEndpoints.length,
    routeLogs,
    hasStripePortal: Boolean(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_CUSTOMER_ID || process.env.SUPPORTPILOT_STRIPE_CUSTOMER_ID)),
  });
}
