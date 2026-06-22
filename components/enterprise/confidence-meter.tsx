import { StatusBadge } from "@/components/enterprise/status-badge";
import type { ConfidenceBreakdown } from "@/lib/enterprise/types";

type ConfidenceMeterProps = {
  breakdown: ConfidenceBreakdown;
};

export function ConfidenceMeter({ breakdown }: ConfidenceMeterProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-3">Confidence</p>
        <StatusBadge value={breakdown.overall >= 0.75 ? "high" : breakdown.overall >= 0.62 ? "medium" : "low"} label={`${Math.round(breakdown.overall * 100)}%`} />
      </div>
      <div className="mt-3 space-y-2">
        <Meter label="Retrieval" value={breakdown.retrievalScore} />
        <Meter label="Generation" value={breakdown.generationScore} />
        <Meter label="Policy risk" value={breakdown.policyRiskScore} inverse />
      </div>
    </div>
  );
}

function Meter({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const width = `${Math.round(value * 100)}%`;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-2">{label}</span>
        <span className="font-mono text-foreground-3">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={inverse ? "h-full rounded-full bg-[var(--semantic-risk-high)]" : "h-full rounded-full bg-accent"}
          style={{ width }}
        />
      </div>
    </div>
  );
}
