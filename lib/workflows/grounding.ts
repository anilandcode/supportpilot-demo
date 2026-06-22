import type { AIRun, GroundingCheck, GroundingStatus } from "@/lib/enterprise/types";

type GroundingInput = {
  response: string;
  sources: AIRun["sources"];
};

export function verifyGrounding(input: GroundingInput): Omit<GroundingCheck, "id" | "createdAt" | "tenantId" | "workspaceId"> {
  const citationCoverage = input.sources.length > 0 ? Math.min(1, input.sources.length / 2) : 0;
  const inlineCitation = /\[Source:|\bSource:/i.test(input.response);
  const freshnessScore = 0.82;
  const sourceScore = input.sources.reduce((best, source) => Math.max(best, source.score ?? 0), 0);
  const score = round(citationCoverage * 0.34 + (inlineCitation ? 0.26 : 0) + sourceScore * 0.28 + freshnessScore * 0.12);
  const status: GroundingStatus = score >= 0.75 ? "pass" : score >= 0.5 ? "needs_review" : "fail";

  return {
    aiRunId: null,
    status,
    score,
    citationCoverage: round(citationCoverage),
    freshnessScore,
    notes: status === "pass" ? "Draft cites approved support sources." : "Draft needs citation or source coverage review.",
  };
}

function round(value: number) {
  return Number(value.toFixed(2));
}
