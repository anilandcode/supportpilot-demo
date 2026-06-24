import type { Metadata } from "next";
import { Bot, CheckCircle2, Code2, CreditCard, Database, Globe2, Palette, Route, ShieldCheck, Users2 } from "lucide-react";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { DomainForm } from "@/components/enterprise/domain-form";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { WorkspaceSettingsForm } from "@/components/enterprise/workspace-settings-form";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { getWorkspaceLaunchState } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Settings - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const launchState = await getWorkspaceLaunchState();
  const { workspace, domains, widgetConfig, approvalPolicies } = launchState;
  const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://supportpilot-demo.vercel.app";
  const widgetSnippet = `<script async src="${publicBaseUrl}/widget.js" data-workspace="${workspace.widgetKey}"></script>`;
  const iframeSnippet = `<iframe src="${publicBaseUrl}/embed?workspace=${workspace.widgetKey}" width="400" height="620" style="border:0;border-radius:18px"></iframe>`;

  return (
    <AdminShell title="Workspace settings" description="Branding, widget installation, domain allowlist, and approval policy controls." active="/admin/settings">
      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Workspace", desc: workspace.name, icon: Palette },
          { title: "Knowledge", desc: `${launchState.health.approvedSources} approved chunks`, icon: Database },
          { title: "Approval policies", desc: `${approvalPolicies.length} active policies`, icon: ShieldCheck },
          { title: "Escalation routes", desc: workspace.escalationEmail, icon: Route },
          { title: "Members and roles", desc: "Owner/Admin/Manager/Agent/Analyst/Viewer", icon: Users2 },
          { title: "Branding", desc: `${workspace.botName} · ${workspace.brandColor}`, icon: Palette },
          { title: "Domains", desc: `${launchState.health.verifiedDomains} verified origins`, icon: Globe2 },
          { title: "Billing and usage", desc: `${workspace.monthlyReplyLimit}/mo reply limit`, icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="rounded-lg p-4 shadow-none">
              <Icon className="h-4 w-4 text-accent" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-foreground-3">{item.desc}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <WorkspaceSettingsForm workspace={workspace} />

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Verified domains</h2>
            </div>
            <p className="mt-2 text-sm text-foreground-2">Only these origins can call the widget config and customer chat APIs for this workspace.</p>
            <DomainForm workspaceId={workspace.id} />
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>{domain.domain}</span>
                  <StatusBadge value={domain.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Widget install</h2>
            </div>
            <p className="mt-2 text-sm text-foreground-2">Workspace key: <span className="font-mono text-foreground">{workspace.widgetKey}</span></p>
            <Snippet label="Script embed" value={widgetSnippet} />
            <Snippet label="Iframe embed" value={iframeSnippet} />
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Launcher" value={widgetConfig.launcherLabel} />
              <Stat label="Position" value={widgetConfig.position.replace("-", " ")} />
              <Stat label="Branding" value={widgetConfig.showBranding ? "Visible" : "Hidden"} />
              <Stat label="Limit" value={`${workspace.monthlyReplyLimit}/mo`} />
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Live widget preview</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3" style={{ background: workspace.brandColor, color: workspace.accentForeground }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{workspace.botName.slice(0, 1)}</span>
                  <div>
                    <p className="text-sm font-semibold">{workspace.botName}</p>
                    <p className="text-xs opacity-80">AI answers from approved docs</p>
                  </div>
                </div>
                <span className="text-xs">Online</span>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-2xl bg-card px-3 py-2 text-sm text-foreground-2">How do I configure SSO?</div>
                <div className="rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground-2">
                  I found the SSO guide. This needs review because SSO is a security-sensitive topic.
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge value="medium" label="68% confidence" />
                    <StatusBadge value="pending" label="approval pending" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--badge-success-border)] bg-[var(--badge-success-bg)] p-3 text-sm text-[var(--badge-success-text)]">
              <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden />
              Primary color passes AA on white text in the demo theme.
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Approval policies</h2>
            </div>
            <div className="mt-4 space-y-3">
              {approvalPolicies.map((policy) => (
                <div key={policy.id} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{policy.riskCategory.replace(/_/g, " ")}</p>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">{policy.approverRole}</span>
                  </div>
                  <p className="mt-2 text-xs text-foreground-3">
                    Approval required below {(policy.minConfidenceToAutoSend * 100).toFixed(0)}% confidence.
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Security and retention</h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Prompt logs" value={launchState.retention?.aiPromptLogging ?? "redacted"} />
              <Stat label="Conversations" value={`${launchState.retention?.conversationDays ?? 365} days`} />
              <Stat label="Audit logs" value={`${launchState.retention?.auditDays ?? 730} days`} />
              <Stat label="Security events" value={`${launchState.health.securityEvents24h}/24h`} />
            </dl>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Snippet({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-foreground-3">{label}</p>
        <CopyButton text={value} />
      </div>
      <code className="mt-3 block break-all rounded-lg bg-background p-3 text-xs text-foreground-2">{value}</code>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <dt className="text-xs text-foreground-3">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
