import {
  checkRateLimit,
  hasRedisRateLimitEnv,
  rateLimitHeaders,
  rateLimitIdentityHash,
  resetLocalRateLimitForTests,
  retryAfterSeconds,
} from "../lib/rate-limit.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetLocalRateLimitForTests();

  const first = await checkRateLimit({
    scope: "chat",
    workspaceId: "ws_test",
    key: "203.0.113.1",
    limit: 2,
    windowMs: 1000,
    nowMs: 1000,
  });
  const second = await checkRateLimit({
    scope: "chat",
    workspaceId: "ws_test",
    key: "203.0.113.1",
    limit: 2,
    windowMs: 1000,
    nowMs: 1100,
  });
  const third = await checkRateLimit({
    scope: "chat",
    workspaceId: "ws_test",
    key: "203.0.113.1",
    limit: 2,
    windowMs: 1000,
    nowMs: 1200,
  });

  checks.push(["local limiter allows first request", first.allowed && first.remaining === 1 && first.store === "memory", `${first.allowed}/${first.remaining}/${first.store}`]);
  checks.push(["local limiter allows within quota", second.allowed && second.remaining === 0, `${second.allowed}/${second.remaining}`]);
  checks.push(["local limiter blocks over quota", !third.allowed && retryAfterSeconds(third, 1200) === 1, `${third.allowed}/${retryAfterSeconds(third, 1200)}`]);

  const afterReset = await checkRateLimit({
    scope: "chat",
    workspaceId: "ws_test",
    key: "203.0.113.1",
    limit: 2,
    windowMs: 1000,
    nowMs: 2101,
  });
  checks.push(["local limiter resets after window", afterReset.allowed && afterReset.remaining === 1, `${afterReset.allowed}/${afterReset.remaining}`]);

  const hash = rateLimitIdentityHash("same-key");
  checks.push(["identity hash is stable and redacted", hash === rateLimitIdentityHash("same-key") && hash !== "same-key" && hash.length === 32, hash]);

  const headers = rateLimitHeaders(third) as Record<string, string>;
  checks.push(["rate-limit headers expose limit state", headers["X-RateLimit-Limit"] === "2" && headers["X-RateLimit-Remaining"] === "0", JSON.stringify(headers)]);

  const originalFetch = globalThis.fetch;
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  let pipelineBody = "";
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    pipelineBody = String(init?.body ?? "");
    return Response.json([{ result: 1 }, { result: 1 }]);
  }) as typeof fetch;

  const redis = await checkRateLimit({
    scope: "widget_session",
    workspaceId: "ws_test",
    key: "https://app.example",
    limit: 2,
    windowMs: 1000,
    nowMs: 3000,
  });
  checks.push(["redis limiter is selected when configured", hasRedisRateLimitEnv() && redis.store === "redis" && redis.allowed, `${redis.store}/${redis.allowed}`]);
  checks.push(["redis limiter pipelines INCR and PEXPIRE", pipelineBody.includes("INCR") && pipelineBody.includes("PEXPIRE"), pipelineBody]);

  globalThis.fetch = originalFetch;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  let failed = 0;
  console.log("\nSupportPilot rate-limit checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} rate-limit checks failed`);
    process.exit(1);
  }

  console.log("\nRate-limit checks passed\n");
}
