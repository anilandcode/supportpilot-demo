import { buildHealthSnapshot } from "../lib/ops/health.ts";

const checks: Array<[string, boolean, string]> = [];

const trackedEnv = [
  "SUPPORTPILOT_APP_MODE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SUPPORTPILOT_INGESTION_WORKER_SECRET",
  "SUPPORTPILOT_INTEGRATION_WORKER_SECRET",
  "SUPPORTPILOT_RETENTION_WORKER_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const originalEnv = Object.fromEntries(trackedEnv.map((key) => [key, process.env[key]]));

clearTrackedEnv();
const demoHealth = buildHealthSnapshot(new Date("2026-07-15T00:00:00.000Z"));
checks.push([
  "demo health is degraded but does not fail without optional services",
  demoHealth.status === "degraded" && demoHealth.appMode === "demo" && demoHealth.checks.some((check) => check.key === "supabase" && check.status === "warn"),
  `${demoHealth.status}/${demoHealth.appMode}`,
]);

clearTrackedEnv();
process.env.SUPPORTPILOT_APP_MODE = "production";
const productionMissing = buildHealthSnapshot(new Date("2026-07-15T00:00:00.000Z"));
checks.push([
  "production health fails closed without required Supabase and email config",
  productionMissing.status === "fail" &&
    productionMissing.checks.some((check) => check.key === "supabase" && check.status === "fail") &&
    productionMissing.checks.some((check) => check.key === "invitation_email" && check.status === "fail"),
  productionMissing.checks.map((check) => `${check.key}:${check.status}`).join(","),
]);

clearTrackedEnv();
process.env.SUPPORTPILOT_APP_MODE = "production";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
process.env.RESEND_API_KEY = "resend";
process.env.SENTRY_DSN = "https://sentry.example/1";
process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
process.env.UPSTASH_REDIS_REST_TOKEN = "redis";
process.env.SUPPORTPILOT_INGESTION_WORKER_SECRET = "ingest";
process.env.SUPPORTPILOT_INTEGRATION_WORKER_SECRET = "integrations";
process.env.SUPPORTPILOT_RETENTION_WORKER_SECRET = "retention";
process.env.STRIPE_SECRET_KEY = "sk_test";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
const productionReady = buildHealthSnapshot(new Date("2026-07-15T00:00:00.000Z"));
checks.push([
  "production health passes when launch dependencies are configured",
  productionReady.status === "ok" && productionReady.checks.every((check) => check.status === "pass"),
  productionReady.checks.map((check) => `${check.key}:${check.status}`).join(","),
]);

restoreTrackedEnv();

let failed = 0;
console.log("\nSupportPilot health checks");
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} health checks failed`);
  process.exit(1);
}

console.log("\nHealth checks passed\n");

function clearTrackedEnv() {
  for (const key of trackedEnv) delete process.env[key];
}

function restoreTrackedEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}
