import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, RiskLevel, TicketPriority, TicketStatus } from "@/lib/enterprise/types";

type StatusBadgeProps = {
  value: TicketStatus | TicketPriority | RiskLevel | ApprovalStatus;
};

export function StatusBadge({ value }: StatusBadgeProps) {
  const variant =
    value === "resolved" || value === "approved"
      ? "success"
      : value === "urgent" || value === "critical" || value === "rejected"
        ? "error"
        : value === "high" || value === "escalated"
          ? "warning"
          : value === "in_progress" || value === "edited"
            ? "info"
            : "default";

  return <Badge variant={variant}>{value.replace(/_/g, " ")}</Badge>;
}
