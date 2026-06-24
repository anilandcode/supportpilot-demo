import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, DomainStatus, RiskLevel, TicketPriority, TicketStatus } from "@/lib/enterprise/types";

type StatusBadgeProps = {
  value: TicketStatus | TicketPriority | RiskLevel | ApprovalStatus | DomainStatus;
  label?: string;
};

const STATUS_STYLES: Record<string, { className: string; dot: string }> = {
  new: { className: "bg-[var(--badge-new-bg)] text-[var(--badge-new-text)] border-[var(--badge-new-border)]", dot: "bg-[var(--semantic-status-new)]" },
  in_progress: { className: "bg-[var(--badge-progress-bg)] text-[var(--badge-progress-text)] border-[var(--badge-progress-border)]", dot: "bg-[var(--semantic-status-progress)]" },
  waiting: { className: "bg-[var(--badge-waiting-bg)] text-[var(--badge-waiting-text)] border-[var(--badge-waiting-border)]", dot: "bg-[var(--semantic-status-waiting)]" },
  resolved: { className: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]", dot: "bg-[var(--semantic-status-resolved)]" },
  escalated: { className: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border-[var(--badge-danger-border)]", dot: "bg-[var(--semantic-confidence-low)]" },

  low: { className: "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]", dot: "bg-[var(--semantic-priority-low)]" },
  medium: { className: "bg-[var(--badge-progress-bg)] text-[var(--badge-progress-text)] border-[var(--badge-progress-border)]", dot: "bg-[var(--semantic-priority-medium)]" },
  high: { className: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]", dot: "bg-[var(--semantic-priority-high)]" },
  urgent: { className: "bg-[var(--badge-danger-bg)] text-[#991B1B] border-[var(--badge-critical-border)]", dot: "bg-[var(--semantic-risk-critical)]" },
  critical: { className: "bg-[var(--badge-danger-bg)] text-[#991B1B] border-[var(--badge-critical-border)]", dot: "bg-[var(--semantic-risk-critical)]" },

  draft: { className: "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]", dot: "bg-[var(--semantic-priority-low)]" },
  pending: { className: "bg-[var(--badge-waiting-bg)] text-[var(--badge-waiting-text)] border-[var(--badge-waiting-border)]", dot: "bg-[var(--semantic-status-waiting)]" },
  approved: { className: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]", dot: "bg-[var(--semantic-status-resolved)]" },
  edited: { className: "bg-[var(--badge-progress-bg)] text-[var(--badge-progress-text)] border-[var(--badge-progress-border)]", dot: "bg-[var(--semantic-status-progress)]" },
  rejected: { className: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border-[var(--badge-danger-border)]", dot: "bg-[var(--semantic-confidence-low)]" },

  verified: { className: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]", dot: "bg-[var(--semantic-status-resolved)]" },
  blocked: { className: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border-[var(--badge-danger-border)]", dot: "bg-[var(--semantic-confidence-low)]" },
};

export function StatusBadge({ value, label }: StatusBadgeProps) {
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.low;
  return (
    <Badge variant="semantic" className={style.className} dotClassName={style.dot}>
      {label ?? value.replace(/_/g, " ")}
    </Badge>
  );
}
