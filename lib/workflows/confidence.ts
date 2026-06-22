import type { ConfidenceBreakdown, RiskLevel } from "@/lib/enterprise/types";

type ConfidenceInput = {
  bestRetrievalScore?: number;
  citationCount: number;
  riskLevel: RiskLevel;
  sourceFreshnessScore?: number;
};

export function calculateConfidenceBreakdown(input: ConfidenceInput): ConfidenceBreakdown {
  const retrievalScore = clamp(input.bestRetrievalScore ?? 0.3);
  const citationBoost = input.citationCount > 0 ? Math.min(0.12, input.citationCount * 0.03) : -0.16;
  const generationScore = clamp(0.62 + retrievalScore * 0.28 + citationBoost + (input.sourceFreshnessScore ?? 0.75) * 0.08);
  const policyRiskScore = input.riskLevel === "critical" ? 0.92 : input.riskLevel === "high" ? 0.74 : input.riskLevel === "medium" ? 0.46 : 0.18;
  const overall = clamp(retrievalScore * 0.44 + generationScore * 0.36 + (1 - policyRiskScore) * 0.2);

  return {
    retrievalScore: round(retrievalScore),
    generationScore: round(generationScore),
    policyRiskScore: round(policyRiskScore),
    overall: round(overall),
  };
}

function clamp(value: number) {
  return Math.max(0.05, Math.min(0.98, value));
}

function round(value: number) {
  return Number(value.toFixed(2));
}
