import type { ModelRouteCode, RiskLevel } from "@/lib/enterprise/types";

export type ModelRouteDecision = {
  route: ModelRouteCode;
  task: string;
  provider: string;
  model: string;
  reason: string;
  estimatedCostUsd: number;
};

type RouteInput = {
  task: "chat" | "ticket_draft" | "classification" | "rerank";
  confidence?: number;
  riskLevel?: RiskLevel;
  riskFlags?: string[];
  hasLocalEndpoint?: boolean;
};

export function selectModelRoute(input: RouteInput): ModelRouteDecision {
  const provider = process.env.LLM_PROVIDER || "google";
  const configuredModel = process.env.GOOGLE_MODEL || process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || "demo-enterprise";
  const flags = input.riskFlags ?? [];

  if (input.task === "classification") {
    return {
      route: "R0",
      task: "classification, pii, language, spam, intent",
      provider: input.hasLocalEndpoint ? "local" : "deterministic",
      model: input.hasLocalEndpoint ? "local-small-classifier" : "rules",
      reason: "Cheap deterministic or local classification before generation.",
      estimatedCostUsd: 0,
    };
  }

  if (input.task === "rerank") {
    return {
      route: "R3",
      task: "rerank retrieved evidence",
      provider: process.env.LOCAL_RERANKER_ENDPOINT ? "local" : "deterministic",
      model: process.env.LOCAL_RERANKER_ENDPOINT ? "local-reranker" : "score-sort",
      reason: "Evidence reranking is isolated from answer generation.",
      estimatedCostUsd: 0,
    };
  }

  if (input.riskLevel === "critical" || flags.some((flag) => /legal|gdpr|dpa|sensitive|security/i.test(flag))) {
    return {
      route: "R5",
      task: "critical enterprise, legal, security, or privacy draft",
      provider,
      model: configuredModel,
      reason: "Critical risk class requires premium route and human approval.",
      estimatedCostUsd: 0.012,
    };
  }

  if (input.riskLevel === "high" || flags.length > 0 || (input.confidence ?? 1) < 0.72) {
    return {
      route: "R4",
      task: "ambiguous or high-risk support draft",
      provider,
      model: configuredModel,
      reason: "Risk flags or low confidence require stronger generation and approval.",
      estimatedCostUsd: 0.006,
    };
  }

  return {
    route: "R2",
    task: "easy cited support answer",
    provider: process.env.LOCAL_MODEL_ENDPOINT ? "local" : provider,
    model: process.env.LOCAL_MODEL_ENDPOINT ? "local-small-answer" : configuredModel,
    reason: "Approved-source answer with low policy risk.",
    estimatedCostUsd: process.env.LOCAL_MODEL_ENDPOINT ? 0 : 0.002,
  };
}

export function estimateTokenCount(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}
