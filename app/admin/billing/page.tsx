import type { Metadata } from "next";
import { AlertTriangle, ArrowUpRight, CreditCard, Gauge, ReceiptText, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { getBillingPlans, getBillingSnapshot, type BillingUsageMetric } from "@/lib/billing/plans";
import { getBillingLifecycleState } from "@/lib/db/billing";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Billing - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

type BillingSearchParams = {
  portal?: "demo" | "stripe_error";
  checkout?: "demo" | "stripe_error" | "processing" | "canceled";
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<BillingSearchParams> }) {
  const params = await searchParams;
  const [billing, plans] = await Promise.all([getBillingSnapshot(), Promise.resolve(getBillingPlans())]);
  const lifecycle = await getBillingLifecycleState(billing.workspace.id);
  const blockingMetrics = billing.orderedMetrics.filter((metric) => metric.exceeded);
  const nearLimitMetrics = billing.orderedMetrics.filter((metric) => metric.nearLimit);
  const periodStart = new Date(billing.period.start).toLocaleDateString("en", { month: "short", day: "numeric" });
  const periodEnd = new Date(new Date(billing.period.end).getTime() - 1).toLocaleDateString("en", { month: "short", day: "numeric" });

  return (
    <AdminShell title="Billing and usage" description="Track Launch and Pro limits, model cost, invoice status, and Stripe portal readiness." active="/admin/billing">
      {params.portal === "demo" ? (
        <Notice
          title="Stripe portal is not configured"
          detail="Set STRIPE_SECRET_KEY and STRIPE_CUSTOMER_ID to open a live billing portal. The current workspace still enforces local plan limits."
        />
      ) : null}
      {params.portal === "stripe_error" ? (
        <Notice
          title="Stripe portal could not be opened"
          detail="The configured Stripe keys did not return a portal session. The billing dashboard is still available with current workspace usage."
        />
      ) : null}
      {params.checkout === "demo" ? (
        <Notice
          title="Checkout is in demo mode"
          detail="Set Stripe price IDs and STRIPE_SECRET_KEY to send owners to hosted Checkout. The request was still recorded for billing lifecycle testing."
        />
      ) : null}
      {params.checkout === "processing" ? (
        <Notice
          title="Checkout completed, waiting for webhook"
          detail="SupportPilot will unlock paid entitlements only after Stripe sends a verified subscription webhook."
        />
      ) : null}
      {params.checkout === "stripe_error" ? (
        <Notice
          title="Checkout could not be opened"
          detail="The configured Stripe account did not return a Checkout session. Confirm price IDs, customer state, and test/live API keys."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden rounded-2xl shadow-none">
          <div className="border-b border-border bg-surface px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={blockingMetrics.length > 0 ? "critical" : nearLimitMetrics.length > 0 ? "medium" : "high"} label={blockingMetrics.length > 0 ? "limit reached" : nearLimitMetrics.length > 0 ? "watch usage" : "within limits"} />
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground-2">
                    {periodStart} - {periodEnd}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{billing.plan.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-2">{billing.plan.description}</p>
              </div>
              <div className="text-left xl:text-right">
                <p className="text-sm text-foreground-3">Current plan</p>
                <p className="mt-1 text-3xl font-semibold">{billing.plan.price}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`/api/billing/portal?workspaceId=${billing.workspace.id}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg">
                <CreditCard className="h-4 w-4" aria-hidden />
                Open Stripe portal
              </a>
              <a href="#plans" className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground-2 hover:bg-card">
                <TrendingUp className="h-4 w-4" aria-hidden />
                Compare plans
              </a>
              <a href={`mailto:${billing.workspace.escalationEmail}?subject=SupportPilot%20billing%20upgrade`} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground-2 hover:bg-card">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
                Contact sales
              </a>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {billing.orderedMetrics.map((metric) => (
              <UsageCard key={metric.key} metric={metric} />
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl p-5 shadow-none">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Enforcement status</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Chat conversations", metric: billing.metrics.conversations },
                { label: "AI reply generation", metric: billing.metrics.aiReplies },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm">
                  <span className="text-foreground-2">{item.label}</span>
                  <StatusBadge value={item.metric.exceeded ? "critical" : item.metric.nearLimit ? "medium" : "high"} label={item.metric.exceeded ? "blocked" : "enabled"} />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm">
                <span className="text-foreground-2">Stripe portal</span>
                <StatusBadge value={billing.hasStripePortal ? "verified" : "pending"} label={billing.hasStripePortal ? "Live" : "Demo"} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-none">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Invoices</h2>
            </div>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {(lifecycle.invoices.length > 0 ? lifecycle.invoices : []).map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-3 text-sm">
                  <span>{new Date(invoice.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                  <span className="text-foreground-2">{formatCurrency(invoice.amountPaid || invoice.amountDue, invoice.currency)}</span>
                  <StatusBadge value={invoice.status === "paid" ? "approved" : invoice.status === "open" ? "pending" : "medium"} label={invoice.status} />
                </div>
              ))}
              {lifecycle.invoices.length === 0 ? (
                <div className="px-3 py-4 text-sm text-foreground-2">No synced Stripe invoices yet. Invoices appear after verified webhook events.</div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <div>
            <h2 className="font-semibold">Model route cost</h2>
            <p className="mt-1 text-sm text-foreground-2">Grouped route usage for the current billing period. Advanced R4/R5 routes count toward fallback limits.</p>
          </div>
          <StatusBadge value={billing.totalEstimatedCostUsd > 1 ? "medium" : "high"} label={`$${billing.totalEstimatedCostUsd.toFixed(4)} estimated`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-card text-xs font-semibold text-foreground-3">
              <tr className="border-b border-border">
                <Th>Route</Th>
                <Th>Provider/model</Th>
                <Th>Calls</Th>
                <Th>Avg latency</Th>
                <Th>Tokens</Th>
                <Th>Cost</Th>
                <Th>Reason</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {billing.routeCosts.length > 0 ? billing.routeCosts.map((route) => (
                <tr key={route.key} className="hover:bg-surface">
                  <Td><StatusBadge value={route.route === "R5" ? "critical" : route.route === "R4" ? "high" : "medium"} label={route.route} /></Td>
                  <Td>{route.provider} / {route.model}</Td>
                  <Td>{route.calls}</Td>
                  <Td>{route.avgLatencyMs}ms</Td>
                  <Td>{route.tokens}</Td>
                  <Td>${route.estimatedCostUsd.toFixed(4)}</Td>
                  <Td>{route.reason}</Td>
                </tr>
              )) : (
                <tr><Td colSpan={7}>No model routes recorded in this billing period.</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div id="plans" className="mt-6 grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.key} className="rounded-2xl p-5 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-foreground-2">{plan.description}</p>
              </div>
              {plan.key === billing.plan.key ? <StatusBadge value="verified" label="current" /> : null}
            </div>
            <p className="mt-5 text-3xl font-semibold">{plan.price}</p>
            <dl className="mt-5 grid gap-2 text-sm">
              <PlanLimit label="Conversations" value={plan.limits.conversations} />
              <PlanLimit label="AI replies" value={plan.limits.aiReplies} />
              <PlanLimit label="Sources" value={plan.limits.sources} />
              <PlanLimit label="Members" value={plan.limits.members} />
              <PlanLimit label="Advanced routes" value={plan.limits.modelFallbacks} />
            </dl>
            {plan.key === "enterprise" ? (
              <a href={`mailto:${billing.workspace.escalationEmail}?subject=SupportPilot%20Enterprise%20quote`} className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground-2 hover:bg-surface">
                Contact sales
              </a>
            ) : plan.key === billing.plan.key ? (
              <button disabled className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground-3">
                Current plan
              </button>
            ) : (
              <form action="/api/billing/checkout" method="post" className="mt-5">
                <input type="hidden" name="workspaceId" value={billing.workspace.id} />
                <input type="hidden" name="tier" value={plan.key} />
                <input type="hidden" name="interval" value="monthly" />
                <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
                  Start monthly checkout
                </button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

function Notice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-5 rounded-2xl border border-[var(--badge-warning-border)] bg-[var(--badge-warning-bg)] p-4 text-[var(--badge-warning-text)]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ metric }: { metric: BillingUsageMetric }) {
  const width = metric.limit ? Math.min(metric.percentage, 100) : 100;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{metric.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground-3">{metric.description}</p>
        </div>
        {metric.exceeded ? <StatusBadge value="critical" label="limit" /> : metric.nearLimit ? <StatusBadge value="medium" label="watch" /> : <StatusBadge value="high" label="ok" />}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold">{metric.used.toLocaleString()}</p>
        <p className="text-xs text-foreground-3">{metric.limit ? `${metric.limit.toLocaleString()} ${metric.unit}` : `Unlimited ${metric.unit}`}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-border">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: metric.exceeded ? "var(--semantic-risk-critical)" : metric.nearLimit ? "var(--semantic-confidence-mid)" : "var(--semantic-confidence-high)",
          }}
        />
      </div>
    </div>
  );
}

function PlanLimit({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2">
      <dt className="text-foreground-2">{label}</dt>
      <dd className="font-semibold">{value === null ? "Custom" : value.toLocaleString()}</dd>
    </div>
  );
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return <td colSpan={colSpan} className="align-top px-4 py-3 text-foreground-2">{children}</td>;
}
