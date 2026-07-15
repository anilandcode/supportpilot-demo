import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";
import { runGoldenQuestionEvals } from "../lib/evals/golden.ts";

const ARTIFACT_DIR = "artifacts";
const ARTIFACT_PATH = join(ARTIFACT_DIR, "golden-eval-summary.json");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const summary = await runGoldenQuestionEvals(DEMO_WORKSPACE_ID);

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`);

  console.log("\nSupportPilot golden-question eval smoke");
  for (const item of summary.cases) {
    console.log(
      `${item.passed ? "PASS" : "FAIL"} ${item.id}: source=${item.expectedSourceHit} score=${item.bestScore} confidence=${item.confidence} grounding=${item.groundingStatus} policy=${item.policyAction}`,
    );
  }
  console.log(`\nGolden eval summary: ${summary.passed}/${summary.total} passed (${Math.round(summary.passRate * 100)}%)`);
  console.log(`Artifact: ${ARTIFACT_PATH}`);

  if (summary.total < 5) {
    console.error("Expected at least five golden questions for the demo workspace.");
    process.exit(1);
  }

  if (summary.passRate < summary.thresholds.minimumPassRate) {
    console.error(`Golden eval pass rate ${summary.passRate} is below ${summary.thresholds.minimumPassRate}.`);
    process.exit(1);
  }
}
