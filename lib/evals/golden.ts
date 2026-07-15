import type { DocumentChunk, GoldenQuestion, PolicyAction, RiskLevel } from "@/lib/enterprise/types";
import { listGoldenQuestions } from "@/lib/db/support";
import { retrieveEnterpriseChunks } from "@/lib/rag/retrieval";
import { calculateConfidenceBreakdown } from "@/lib/workflows/confidence";
import { verifyGrounding } from "@/lib/workflows/grounding";
import { evaluatePolicy } from "@/lib/workflows/policy";

export type GoldenEvalCase = {
  id: string;
  question: string;
  expectedSources: string[];
  retrievedSources: string[];
  expectedSourceHit: boolean;
  bestScore: number;
  confidence: number;
  groundingStatus: string;
  groundingScore: number;
  policyAction: PolicyAction;
  passed: boolean;
};

export type GoldenEvalSummary = {
  workspaceId: string;
  evaluatedAt: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  thresholds: {
    minimumPassRate: number;
    minimumBestScore: number;
    minimumConfidence: number;
  };
  cases: GoldenEvalCase[];
};

export async function runGoldenQuestionEvals(workspaceId: string): Promise<GoldenEvalSummary> {
  const questions = await listGoldenQuestions(workspaceId);
  const cases: GoldenEvalCase[] = [];

  for (const question of questions) {
    const chunks = await retrieveEnterpriseChunks(question.question, 5, workspaceId);
    cases.push(evaluateGoldenQuestion(question, chunks));
  }

  const passed = cases.filter((item) => item.passed).length;
  const passRate = questions.length ? Number((passed / questions.length).toFixed(2)) : 0;

  return {
    workspaceId,
    evaluatedAt: new Date().toISOString(),
    total: questions.length,
    passed,
    failed: questions.length - passed,
    passRate,
    thresholds: {
      minimumPassRate: 0.8,
      minimumBestScore: 0.3,
      minimumConfidence: 0.55,
    },
    cases,
  };
}

function evaluateGoldenQuestion(question: GoldenQuestion, chunks: DocumentChunk[]): GoldenEvalCase {
  const retrievedSources = chunks.map((chunk) => chunk.source);
  const expectedSourceHit = question.expectedSources.some((expected) =>
    retrievedSources.some((source) => normalize(source).includes(normalize(expected))),
  );
  const bestScore = Number((chunks[0]?.score ?? 0).toFixed(2));
  const riskLevel = riskLevelFor(question.question);
  const confidenceBreakdown = calculateConfidenceBreakdown({
    bestRetrievalScore: bestScore,
    citationCount: chunks.length,
    riskLevel,
  });
  const sources = chunks.slice(0, 2).map((chunk) => ({
    source: chunk.source,
    docId: chunk.docId,
    chunkId: chunk.id,
    score: chunk.score,
  }));
  const response = chunks[0]
    ? `${chunks[0].content.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")} [Source: ${chunks[0].source}]`
    : "I do not know from the approved sources.";
  const grounding = verifyGrounding({ response, sources });
  const policy = evaluatePolicy({
    content: question.question,
    confidence: Math.max(confidenceBreakdown.overall, question.lastScore ?? 0),
    riskFlags: [],
    riskLevel,
  });
  const expectedReview = requiresHumanReview(question.question);
  const policyOk = expectedReview ? policy.action === "approve_required" : policy.action === "answer";
  const passed = expectedSourceHit && bestScore >= 0.3 && confidenceBreakdown.overall >= 0.55 && grounding.status !== "fail" && policyOk;

  return {
    id: question.id,
    question: question.question,
    expectedSources: question.expectedSources,
    retrievedSources,
    expectedSourceHit,
    bestScore,
    confidence: confidenceBreakdown.overall,
    groundingStatus: grounding.status,
    groundingScore: grounding.score,
    policyAction: policy.action,
    passed,
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function riskLevelFor(question: string): RiskLevel {
  return requiresHumanReview(question) ? "medium" : "low";
}

function requiresHumanReview(question: string) {
  return /\b(refund|renewal|legal|dpa|gdpr|privacy)\b/i.test(question);
}
