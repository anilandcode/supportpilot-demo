import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { WorkspaceChecklistItem } from "@/lib/enterprise/types";

type SetupChecklistProps = {
  items: WorkspaceChecklistItem[];
};

export function SetupChecklist({ items }: SetupChecklistProps) {
  const remaining = items.filter((item) => !item.completed).length;
  if (remaining === 0) return null;

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Launch checklist</h2>
          <p className="mt-1 text-sm text-foreground-2">Pinned until the workspace is safe to go live.</p>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{remaining} left</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.completed ? CheckCircle2 : Circle;
          return (
            <div key={item.step} className="flex gap-3 rounded-md border border-border bg-surface p-3">
              <Icon className={item.completed ? "mt-0.5 h-4 w-4 text-[var(--semantic-status-resolved)]" : "mt-0.5 h-4 w-4 text-foreground-3"} aria-hidden />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground-3">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
