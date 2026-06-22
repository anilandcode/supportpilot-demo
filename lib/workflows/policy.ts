import type { PolicyDecision, RiskLevel, TicketWithRelations, ToolDefinition } from "@/lib/enterprise/types";

const ALLOWED_READ_TOOLS: ToolDefinition["name"][] = ["search_knowledge", "get_ticket_history", "get_workspace_policy"];

export function evaluatePolicy(input: {
  ticket?: TicketWithRelations;
  content: string;
  confidence: number;
  riskFlags: string[];
  riskLevel: RiskLevel;
}): PolicyDecision {
  const text = `${input.ticket?.subject ?? ""}\n${input.content}`.toLowerCase();
  const reasons = new Set(input.riskFlags);

  if (input.confidence < 0.55) reasons.add("very_low_confidence");
  if (/\b(refund|charge|invoice|billing|credit)\b/i.test(text)) reasons.add("billing_or_refund");
  if (/\b(legal|dpa|gdpr|privacy|lawsuit|compliance)\b/i.test(text)) reasons.add("legal_or_policy");
  if (/\b(password|secret|token|api key|card|cvv|ssn)\b/i.test(text)) reasons.add("sensitive_data");
  if (/\b(angry|furious|unacceptable|cancel now|lawyer)\b/i.test(text) || input.ticket?.sentiment === "angry") reasons.add("angry_sentiment");

  const reasonList = Array.from(reasons);
  if (reasonList.includes("sensitive_data")) {
    return {
      action: "refuse",
      reasons: reasonList,
      requiredRole: "manager",
      allowedTools: ALLOWED_READ_TOOLS,
      riskLevel: "critical",
    };
  }

  if (input.riskLevel === "critical" || reasonList.includes("legal_or_policy")) {
    return {
      action: "approve_required",
      reasons: reasonList.length ? reasonList : ["critical_risk"],
      requiredRole: "manager",
      allowedTools: ALLOWED_READ_TOOLS,
      riskLevel: "critical",
    };
  }

  if (input.riskLevel === "high" || reasonList.length > 0 || input.confidence < 0.72) {
    return {
      action: "approve_required",
      reasons: reasonList.length ? reasonList : ["low_confidence"],
      requiredRole: "manager",
      allowedTools: ALLOWED_READ_TOOLS,
      riskLevel: input.riskLevel === "low" ? "medium" : input.riskLevel,
    };
  }

  return {
    action: "answer",
    reasons: ["approved_sources", "confidence_above_threshold"],
    requiredRole: null,
    allowedTools: ALLOWED_READ_TOOLS,
    riskLevel: input.riskLevel,
  };
}
