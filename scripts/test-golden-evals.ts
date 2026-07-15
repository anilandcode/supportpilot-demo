import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";
import type { DocumentChunk, GoldenQuestion, PolicyAction } from "../lib/enterprise/types.ts";
import { listGoldenQuestions } from "../lib/db/support.ts";
import { retrieveEnterpriseChunks } from "../lib/rag/retrieval.ts";
import { calculateConfidenceBreakdown } from "../lib/workflows/confidence.ts";
import { verifyGrounding } from "../lib/workflows/grounding.ts";
import { evaluatePolicy } from "../lib/workflows/policy.ts";

type EvalCase = {
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

const ARTIFACT_DIR = "artifacts";
const ARTIFACT_PATH = join(ARTIFACT_DIR, "golden-eval-summary.json");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const questions = await listGoldenQuestions(DEMO_WORKSPACE_ID);
  const cases: EvalCase[] = [];

  for (const question of questions) {
    const chunks = await retrieveEnterpriseChunks(question.question, 5, DEMO_WORKSPACE_ID);
    cases.push(evaluateGoldenQuestion(question, chunks));
  }

  const passed = cases.filter((item) => item.passed).length;
  const passRate = questions.length ? Number((passed / questions.length).toFixed(2)) : 0;
  const summary = {
    workspaceId: DEMO_WORKSPACE_ID,
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

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`);

  console.log("\nSupportPilot golden-question eval smoke");
  for (const item of cases) {
    console.log(
      `${item.passed ? "PASS" : "FAIL"} ${item.id}: source=${item.expectedSourceHit} score=${item.bestScore} confidence=${item.confidence} grounding=${item.groundingStatus} policy=${item.policyAction}`,
    );
  }
  console.log(`\nGolden eval summary: ${passed}/${questions.length} passed (${Math.round(passRate * 100)}%)`);
  console.log(`Artifact: ${ARTIFACT_PATH}`);

  if (questions.length < 5) {
    console.error("Expected at least five golden questions for the demo workspace.");
    process.exit(1);
  }

  if (passRate < summary.thresholds.minimumPassRate) {
    console.error(`Golden eval pass rate ${passRate} is below ${summary.thresholds.minimumPassRate}.`);
    process.exit(1);
  }
}

function evaluateGoldenQuestion(question: GoldenQuestion, chunks: DocumentChunk[]): EvalCase {
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

function riskLevelFor(question: string) {
  return requiresHumanReview(question) ? "medium" : "low";
}

function requiresHumanReview(question: string) {
  return /\b(refund|renewal|legal|dpa|gdpr|privacy)\b/i.test(question);
}
