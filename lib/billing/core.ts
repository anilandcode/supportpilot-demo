import type { KnowledgeDoc, ModelRouteCode, ModelRouteLog, Organization, UsageEvent, Workspace } from "@/lib/enterprise/types";

export type BillingPlanKey = "launch" | "pro" | "enterprise";
export type UsageMetricKey =
  | "conversations"
  | "aiReplies"
  | "approvalReviews"
  | "sources"
  | "documentChunks"
  | "members"
  | "workspaces"
  | "domains"
  | "integrations"
  | "retentionDays"
  | "modelFallbacks";

export type BillingUsageMetric = {
  key: UsageMetricKey;
  label: string;
  unit: string;
  used: number;
  limit: number | null;
  description: string;
  percentage: number;
  nearLimit: boolean;
  exceeded: boolean;
  enforced: boolean;
};

export type BillingRouteCost = {
  key: string;
  route: ModelRouteCode;
  provider: string;
  model: string;
  calls: number;
  avgLatencyMs: number;
  tokens: number;
  estimatedCostUsd: number;
  reason: string;
};

export type BillingSnapshot = {
  workspace: Workspace;
  plan: {
    key: BillingPlanKey;
    name: string;
    price: string;
    description: string;
  };
  period: {
    start: string;
    end: string;
  };
  metrics: Record<UsageMetricKey, BillingUsageMetric>;
  orderedMetrics: BillingUsageMetric[];
  routeCosts: BillingRouteCost[];
  totalEstimatedCostUsd: number;
  hasStripePortal: boolean;
};

type BillingPlanDefinition = BillingSnapshot["plan"] & {
  limits: Record<UsageMetricKey, number | null>;
};

type BillingSnapshotInput = {
  workspace: Workspace;
  organizationPlan?: Organization["plan"] | BillingPlanKey | string | null;
  usageEvents: UsageEvent[];
  aiRunCount: number;
  workspaceCount: number;
  memberCount: number;
  knowledgeDocs: Pick<KnowledgeDoc, "approved">[];
  documentChunkCount: number;
  domainCount: number;
  integrationCount: number;
  retentionDays: number;
  routeLogs: ModelRouteLog[];
  hasStripePortal: boolean;
  now?: Date;
};

const BILLING_PLANS: Record<BillingPlanKey, BillingPlanDefinition> = {
  launch: {
    key: "launch",
    name: "Launch",
    price: "$49/mo",
    description: "For a single support workspace going live with approval-gated AI answers.",
    limits: {
      conversations: 1000,
      aiReplies: 1000,
      approvalReviews: 50,
      sources: 10,
      documentChunks: 500,
      members: 3,
      workspaces: 1,
      domains: 3,
      integrations: 2,
      retentionDays: 365,
      modelFallbacks: 100,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "$149/mo",
    description: "For teams managing multiple support surfaces with heavier review and RAG volume.",
    limits: {
      conversations: 10000,
      aiReplies: 8000,
      approvalReviews: 1000,
      sources: 50,
      documentChunks: 5000,
      members: 15,
      workspaces: 3,
      domains: 10,
      integrations: 10,
      retentionDays: 730,
      modelFallbacks: 1500,
    },
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For regulated support teams that need custom retention, SSO, SLAs, and procurement.",
    limits: {
      conversations: null,
      aiReplies: null,
      approvalReviews: null,
      sources: null,
      documentChunks: null,
      members: null,
      workspaces: null,
      domains: null,
      integrations: null,
      retentionDays: null,
      modelFallbacks: null,
    },
  },
};

const METRIC_COPY: Record<UsageMetricKey, Pick<BillingUsageMetric, "label" | "unit" | "description" | "enforced">> = {
  conversations: {
    label: "Conversations",
    unit: "messages",
    description: "Inbound chat messages accepted from the widget and portal.",
    enforced: true,
  },
  aiReplies: {
    label: "AI replies",
    unit: "runs",
    description: "AI runs created for chat answers and ticket drafts.",
    enforced: true,
  },
  approvalReviews: {
    label: "Approval reviews",
    unit: "decisions",
    description: "Approve, edit, reject, and escalate decisions recorded by the team.",
    enforced: false,
  },
  sources: {
    label: "Approved sources",
    unit: "docs",
    description: "Approved knowledge documents available to RAG.",
    enforced: true,
  },
  documentChunks: {
    label: "Document chunks",
    unit: "chunks",
    description: "Approved indexed chunks available to retrieval.",
    enforced: true,
  },
  members: {
    label: "Members",
    unit: "seats",
    description: "Owner, admin, manager, agent, analyst, and viewer memberships.",
    enforced: true,
  },
  workspaces: {
    label: "Workspaces",
    unit: "workspaces",
    description: "SupportPilot workspaces owned by the organization.",
    enforced: true,
  },
  domains: {
    label: "Domains",
    unit: "domains",
    description: "Verified or pending widget/customer portal domains.",
    enforced: true,
  },
  integrations: {
    label: "Integrations",
    unit: "connections",
    description: "Slack, webhook, helpdesk, and outbound integration endpoints.",
    enforced: true,
  },
  retentionDays: {
    label: "Retention duration",
    unit: "days",
    description: "Maximum configured conversation and AI/audit retention window.",
    enforced: true,
  },
  modelFallbacks: {
    label: "Advanced routes",
    unit: "R4/R5 calls",
    description: "Ambiguous, high-risk, legal, security, and billing model routes.",
    enforced: true,
  },
};

const METRIC_ORDER: UsageMetricKey[] = [
  "conversations",
  "aiReplies",
  "approvalReviews",
  "sources",
  "documentChunks",
  "members",
  "workspaces",
  "domains",
  "integrations",
  "retentionDays",
  "modelFallbacks",
];

export function currentBillingPeriod(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

function normalizePlan(plan: Organization["plan"] | BillingPlanKey | string | null | undefined): BillingPlanKey {
  if (plan === "Enterprise" || plan === "enterprise") return "enterprise";
  if (plan === "Agency" || plan === "Pro" || plan === "pro") return "pro";
  return "launch";
}

function inPeriod(createdAt: string, start: Date, end: Date) {
  const created = new Date(createdAt).getTime();
  return created >= start.getTime() && created < end.getTime();
}

function sumUsageEvents(events: UsageEvent[], eventTypes: UsageEvent["eventType"][], start: Date, end: Date) {
  return events.reduce((sum, event) => sum + (eventTypes.includes(event.eventType) && inPeriod(event.createdAt, start, end) ? event.quantity : 0), 0);
}

function buildMetric(key: UsageMetricKey, used: number, limit: number | null): BillingUsageMetric {
  const copy = METRIC_COPY[key];
  const percentage = limit ? Math.round((used / limit) * 100) : 0;
  return {
    key,
    ...copy,
    used,
    limit,
    percentage,
    nearLimit: Boolean(limit && used / limit >= 0.85 && used < limit),
    exceeded: Boolean(limit && used >= limit),
  };
}

function summarizeRouteCosts(routeLogs: ModelRouteLog[], start: Date, end: Date): BillingRouteCost[] {
  const summaries = new Map<string, BillingRouteCost>();
  for (const log of routeLogs.filter((item) => inPeriod(item.createdAt, start, end))) {
    const key = `${log.route}:${log.provider}:${log.model}`;
    const existing = summaries.get(key);
    if (!existing) {
      summaries.set(key, {
        key,
        route: log.route,
        provider: log.provider,
        model: log.model,
        calls: 1,
        avgLatencyMs: log.latencyMs,
        tokens: log.inputTokens + log.outputTokens,
        estimatedCostUsd: log.estimatedCostUsd,
        reason: log.reason,
      });
      continue;
    }
    existing.calls += 1;
    existing.avgLatencyMs = Math.round((existing.avgLatencyMs * (existing.calls - 1) + log.latencyMs) / existing.calls);
    existing.tokens += log.inputTokens + log.outputTokens;
    existing.estimatedCostUsd += log.estimatedCostUsd;
  }

  return [...summaries.values()].sort((a, b) => b.estimatedCostUsd - a.estimatedCostUsd);
}

export function buildBillingSnapshot(input: BillingSnapshotInput): BillingSnapshot {
  const { start, end } = currentBillingPeriod(input.now);
  const plan = BILLING_PLANS[normalizePlan(input.organizationPlan)];
  const routeCosts = summarizeRouteCosts(input.routeLogs, start, end);
  const currentPeriodRoutes = input.routeLogs.filter((log) => inPeriod(log.createdAt, start, end));
  const currentPeriodAiRuns = input.aiRunCount;
  const limits = {
    ...plan.limits,
    aiReplies: plan.key === "enterprise" ? null : input.workspace.monthlyReplyLimit || plan.limits.aiReplies,
  };
  const metrics = {
    conversations: buildMetric("conversations", sumUsageEvents(input.usageEvents, ["chat.message"], start, end), limits.conversations),
    aiReplies: buildMetric("aiReplies", currentPeriodAiRuns, limits.aiReplies),
    approvalReviews: buildMetric("approvalReviews", sumUsageEvents(input.usageEvents, ["approval.decided", "approval_decided"], start, end), limits.approvalReviews),
    sources: buildMetric("sources", input.knowledgeDocs.filter((doc) => doc.approved).length, limits.sources),
    documentChunks: buildMetric("documentChunks", input.documentChunkCount, limits.documentChunks),
    members: buildMetric("members", input.memberCount, limits.members),
    workspaces: buildMetric("workspaces", input.workspaceCount, limits.workspaces),
    domains: buildMetric("domains", input.domainCount, limits.domains),
    integrations: buildMetric("integrations", input.integrationCount, limits.integrations),
    retentionDays: buildMetric("retentionDays", input.retentionDays, limits.retentionDays),
    modelFallbacks: buildMetric("modelFallbacks", currentPeriodRoutes.filter((log) => log.route === "R4" || log.route === "R5").length, limits.modelFallbacks),
  } satisfies Record<UsageMetricKey, BillingUsageMetric>;

  return {
    workspace: input.workspace,
    plan: {
      key: plan.key,
      name: plan.name,
      price: plan.price,
      description: plan.description,
    },
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    metrics,
    orderedMetrics: METRIC_ORDER.map((key) => metrics[key]),
    routeCosts,
    totalEstimatedCostUsd: routeCosts.reduce((sum, route) => sum + route.estimatedCostUsd, 0),
    hasStripePortal: input.hasStripePortal,
  };
}

export function getPlanLimitBlock(snapshot: BillingSnapshot, keys: UsageMetricKey[] = ["conversations", "aiReplies"]) {
  return keys.map((key) => snapshot.metrics[key]).find((metric) => metric.enforced && metric.exceeded) ?? null;
}

export function getProjectedPlanLimitBlock(snapshot: BillingSnapshot, additions: Partial<Record<UsageMetricKey, number>>): [UsageMetricKey, number] | null {
  const projectedBlock = Object.entries(additions).find(([key, addition]) => {
    const metric = snapshot.metrics[key as UsageMetricKey];
    return Boolean(metric?.enforced && metric.limit !== null && metric.used + Number(addition ?? 0) > metric.limit);
  }) as [UsageMetricKey, number] | undefined;
  return projectedBlock ?? null;
}

export function getBillingPlans() {
  return Object.values(BILLING_PLANS).map((plan) => ({
    key: plan.key,
    name: plan.name,
    price: plan.price,
    description: plan.description,
    limits: plan.limits,
  }));
}
