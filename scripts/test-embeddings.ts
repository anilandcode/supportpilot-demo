import {
  coerceEmbeddingDimensions,
  createTextEmbedding,
  embeddingContentHash,
  getEmbeddingConfig,
} from "../lib/rag/embeddings.ts";
import { runReembeddingJob } from "../lib/db/embeddings.ts";
import { getLocalState } from "../lib/db/support.ts";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  delete process.env.EMBEDDING_PROVIDER;
  delete process.env.LOCAL_EMBEDDING_ENDPOINT;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const fallbackConfig = getEmbeddingConfig();
  checks.push(["default embedding provider is deterministic", fallbackConfig.provider === "deterministic" && fallbackConfig.ready, `${fallbackConfig.provider}/${fallbackConfig.ready}`]);

  const deterministic = await createTextEmbedding("billing refund policy");
  checks.push(["deterministic embedding has 768 dimensions", deterministic.embedding.length === 768 && deterministic.provider === "deterministic", `${deterministic.provider}/${deterministic.embedding.length}`]);
  checks.push(["content hash is stable", embeddingContentHash("same") === embeddingContentHash("same"), embeddingContentHash("same")]);

  const coerced = coerceEmbeddingDimensions([3, 4], 4);
  checks.push(["dimension coercion pads and normalizes", coerced.length === 4 && coerced[0] === 0.6 && coerced[1] === 0.8, coerced.join(",")]);

  const originalFetch = globalThis.fetch;
  process.env.EMBEDDING_PROVIDER = "local";
  process.env.LOCAL_EMBEDDING_ENDPOINT = "https://local-embedding.example/embed";
  process.env.LOCAL_EMBEDDING_MODEL = "local-test-embedding";
  process.env.EMBEDDING_VERSION = "local-test-v1";
  globalThis.fetch = (async () => Response.json({ embedding: Array.from({ length: 768 }, (_, index) => (index === 0 ? 1 : 0)) })) as typeof fetch;
  const local = await createTextEmbedding("workspace setup");
  checks.push(["local endpoint embedding is used when configured", local.provider === "local" && local.model === "local-test-embedding" && local.version === "local-test-v1", `${local.provider}/${local.model}/${local.version}`]);

  globalThis.fetch = originalFetch;
  delete process.env.EMBEDDING_PROVIDER;
  delete process.env.LOCAL_EMBEDDING_ENDPOINT;
  delete process.env.LOCAL_EMBEDDING_MODEL;
  delete process.env.EMBEDDING_VERSION;

  const firstChunk = getLocalState().chunks.find((chunk) => chunk.workspaceId === DEMO_WORKSPACE_ID);
  const job = await runReembeddingJob({ workspaceId: DEMO_WORKSPACE_ID, docId: firstChunk?.docId ?? null, limit: 1 });
  const updatedChunk = getLocalState().chunks.find((chunk) => chunk.id === firstChunk?.id);
  checks.push(["re-embedding job succeeds", job.status === "succeeded" && job.chunksEmbedded === 1, `${job.status}/${job.chunksEmbedded}`]);
  checks.push([
    "re-embedding updates chunk metadata",
    Boolean(updatedChunk?.embeddingProvider && updatedChunk?.embeddingModel && updatedChunk?.embeddingVersion && updatedChunk?.embeddedAt && updatedChunk?.sourceVersionId),
    `${updatedChunk?.embeddingProvider}/${updatedChunk?.embeddingModel}/${updatedChunk?.sourceVersionId}`,
  ]);

  let failed = 0;
  console.log("\nSupportPilot embedding checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} embedding checks failed`);
    process.exit(1);
  }

  console.log("\nEmbedding checks passed\n");
}
