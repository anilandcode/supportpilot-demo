import type { Metadata } from "next";
import { CheckCircle2, Code2, Globe2, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { DomainForm } from "@/components/enterprise/domain-form";
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
  const { workspace, domains, widgetConfig, approvalPolicies } = await getWorkspaceLaunchState();
  const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://supportpilot-demo.vercel.app";
  const widgetSnippet = `<script async src="${publicBaseUrl}/widget.js" data-workspace="${workspace.widgetKey}"></script>`;
  const iframeSnippet = `<iframe src="${publicBaseUrl}/embed?workspace=${workspace.widgetKey}" width="400" height="620" style="border:0;border-radius:18px"></iframe>`;

  return (
    <AdminShell title="Workspace settings" description="Branding, widget installation, domain allowlist, and approval policy controls." active="/admin/settings">
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {domain.status}
                  </span>
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
        </div>
      </div>
    </AdminShell>
  );
}

function Snippet({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-3">{label}</p>
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
