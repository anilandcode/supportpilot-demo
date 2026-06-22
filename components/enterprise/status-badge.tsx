import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, DomainStatus, RiskLevel, TicketPriority, TicketStatus } from "@/lib/enterprise/types";

type StatusBadgeProps = {
  value: TicketStatus | TicketPriority | RiskLevel | ApprovalStatus | DomainStatus;
  label?: string;
};

const STATUS_STYLES: Record<string, { className: string; dot: string }> = {
  resolved: { className: "bg-[color-mix(in_srgb,var(--semantic-status-resolved)_12%,transparent)] text-[var(--semantic-status-resolved)] border-[color-mix(in_srgb,var(--semantic-status-resolved)_24%,transparent)]", dot: "bg-[var(--semantic-status-resolved)]" },
  approved: { className: "bg-[color-mix(in_srgb,var(--semantic-status-resolved)_12%,transparent)] text-[var(--semantic-status-resolved)] border-[color-mix(in_srgb,var(--semantic-status-resolved)_24%,transparent)]", dot: "bg-[var(--semantic-status-resolved)]" },
  verified: { className: "bg-[color-mix(in_srgb,var(--semantic-status-resolved)_12%,transparent)] text-[var(--semantic-status-resolved)] border-[color-mix(in_srgb,var(--semantic-status-resolved)_24%,transparent)]", dot: "bg-[var(--semantic-status-resolved)]" },
  new: { className: "bg-[color-mix(in_srgb,var(--semantic-status-new)_12%,transparent)] text-[var(--semantic-status-new)] border-[color-mix(in_srgb,var(--semantic-status-new)_24%,transparent)]", dot: "bg-[var(--semantic-status-new)]" },
  in_progress: { className: "bg-[color-mix(in_srgb,var(--semantic-status-progress)_12%,transparent)] text-[var(--semantic-status-progress)] border-[color-mix(in_srgb,var(--semantic-status-progress)_24%,transparent)]", dot: "bg-[var(--semantic-status-progress)]" },
  edited: { className: "bg-[color-mix(in_srgb,var(--semantic-status-progress)_12%,transparent)] text-[var(--semantic-status-progress)] border-[color-mix(in_srgb,var(--semantic-status-progress)_24%,transparent)]", dot: "bg-[var(--semantic-status-progress)]" },
  pending: { className: "bg-[color-mix(in_srgb,var(--semantic-priority-medium)_12%,transparent)] text-[var(--semantic-priority-medium)] border-[color-mix(in_srgb,var(--semantic-priority-medium)_24%,transparent)]", dot: "bg-[var(--semantic-priority-medium)]" },
  draft: { className: "bg-[color-mix(in_srgb,var(--semantic-priority-low)_12%,transparent)] text-[var(--semantic-priority-low)] border-[color-mix(in_srgb,var(--semantic-priority-low)_24%,transparent)]", dot: "bg-[var(--semantic-priority-low)]" },
  escalated: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-high)_12%,transparent)] text-[var(--semantic-risk-high)] border-[color-mix(in_srgb,var(--semantic-risk-high)_24%,transparent)]", dot: "bg-[var(--semantic-risk-high)]" },
  rejected: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-critical)_12%,transparent)] text-[var(--semantic-risk-critical)] border-[color-mix(in_srgb,var(--semantic-risk-critical)_24%,transparent)]", dot: "bg-[var(--semantic-risk-critical)]" },
  blocked: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-critical)_12%,transparent)] text-[var(--semantic-risk-critical)] border-[color-mix(in_srgb,var(--semantic-risk-critical)_24%,transparent)]", dot: "bg-[var(--semantic-risk-critical)]" },
  urgent: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-critical)_12%,transparent)] text-[var(--semantic-risk-critical)] border-[color-mix(in_srgb,var(--semantic-risk-critical)_24%,transparent)]", dot: "bg-[var(--semantic-risk-critical)]" },
  critical: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-critical)_12%,transparent)] text-[var(--semantic-risk-critical)] border-[color-mix(in_srgb,var(--semantic-risk-critical)_24%,transparent)]", dot: "bg-[var(--semantic-risk-critical)]" },
  high: { className: "bg-[color-mix(in_srgb,var(--semantic-risk-high)_12%,transparent)] text-[var(--semantic-risk-high)] border-[color-mix(in_srgb,var(--semantic-risk-high)_24%,transparent)]", dot: "bg-[var(--semantic-risk-high)]" },
  medium: { className: "bg-[color-mix(in_srgb,var(--semantic-priority-medium)_12%,transparent)] text-[var(--semantic-priority-medium)] border-[color-mix(in_srgb,var(--semantic-priority-medium)_24%,transparent)]", dot: "bg-[var(--semantic-priority-medium)]" },
  low: { className: "bg-[color-mix(in_srgb,var(--semantic-priority-low)_12%,transparent)] text-[var(--semantic-priority-low)] border-[color-mix(in_srgb,var(--semantic-priority-low)_24%,transparent)]", dot: "bg-[var(--semantic-priority-low)]" },
};

export function StatusBadge({ value, label }: StatusBadgeProps) {
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.low;
  return (
    <Badge variant="semantic" className={style.className} dotClassName={style.dot}>
      {label ?? value.replace(/_/g, " ")}
    </Badge>
  );
}
