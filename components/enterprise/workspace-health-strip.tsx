import { AlertTriangle, CheckCircle2, Database, Globe2, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { WorkspaceHealth } from "@/lib/enterprise/types";

type WorkspaceHealthStripProps = {
  health: WorkspaceHealth;
};

export function WorkspaceHealthStrip({ health }: WorkspaceHealthStripProps) {
  const items = [
    { label: "Launch", value: health.launchReady ? "Ready" : "Setup", icon: health.launchReady ? CheckCircle2 : AlertTriangle },
    { label: "Checklist", value: `${health.checklistCompleted}/${health.checklistTotal}`, icon: CheckCircle2 },
    { label: "Sources", value: health.approvedSources, icon: Database },
    { label: "Domains", value: health.verifiedDomains, icon: Globe2 },
    { label: "Approvals", value: health.openApprovals, icon: ShieldAlert },
  ];

  return (
    <Card className="rounded-lg p-3 shadow-none">
      <div className="grid gap-2 md:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-md bg-surface px-3 py-2">
              <Icon className="h-4 w-4 text-accent" aria-hidden />
              <div>
                <p className="text-xs text-foreground-3">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
