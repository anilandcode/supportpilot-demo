import type { RiskLevel, TicketWithRelations } from "@/lib/enterprise/types";

const RISK_PATTERNS = [
  { flag: "legal_or_policy", level: "critical" as RiskLevel, pattern: /\b(legal|lawsuit|dpa|gdpr|privacy|policy|compliance)\b/i },
  { flag: "billing_or_refund", level: "high" as RiskLevel, pattern: /\b(refund|billing|invoice|charge|credit|payment)\b/i },
  { flag: "sensitive_data", level: "critical" as RiskLevel, pattern: /\b(password|token|api key|card|cvv|secret)\b/i },
  { flag: "angry_sentiment", level: "high" as RiskLevel, pattern: /\b(angry|furious|terrible|unacceptable|cancel now|lawyer)\b/i },
];

export function assessTicketRisk(ticket: TicketWithRelations, content: string, confidence: number) {
  const text = `${ticket.subject}\n${ticket.messages.map((message) => message.body).join("\n")}\n${content}`;
  const flags = RISK_PATTERNS.filter((rule) => rule.pattern.test(text)).map((rule) => rule.flag);
  if (confidence < 0.72) flags.push("low_confidence");
  if (ticket.sentiment === "angry") flags.push("angry_sentiment");

  const uniqueFlags = Array.from(new Set(flags));
  const riskLevel = uniqueFlags.includes("legal_or_policy") || uniqueFlags.includes("sensitive_data")
    ? "critical"
    : uniqueFlags.includes("billing_or_refund") || uniqueFlags.includes("angry_sentiment")
      ? "high"
      : confidence < 0.72
        ? "medium"
        : ticket.riskLevel;

  return {
    riskLevel,
    flags: uniqueFlags,
    requiresManagerApproval: riskLevel === "critical" || riskLevel === "high",
    escalationReason: uniqueFlags.length > 0 ? uniqueFlags.join(", ") : null,
  };
}
