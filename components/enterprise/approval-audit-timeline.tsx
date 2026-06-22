import { Clock3 } from "lucide-react";
import type { AuditLog } from "@/lib/enterprise/types";

type ApprovalAuditTimelineProps = {
  logs: AuditLog[];
};

export function ApprovalAuditTimeline({ logs }: ApprovalAuditTimelineProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-accent" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-3">Audit trail</p>
      </div>
      <div className="mt-3 space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-foreground-3">No decision events yet.</p>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log.id} className="border-l border-border pl-3">
              <p className="text-sm font-medium text-foreground">{log.action.replace(/\./g, " ")}</p>
              <p className="text-xs text-foreground-3">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
