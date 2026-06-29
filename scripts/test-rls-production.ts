import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REQUIRED_RLS_HELPERS, REQUIRED_RLS_TABLES, RLS_EXPECTATIONS, describeRlsMatrix } from "../lib/auth/rls-matrix.ts";

const migrationDir = "supabase/migrations";
const migrationFiles = readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => join(migrationDir, file));

const sql = migrationFiles.map((file) => readFileSync(file, "utf8")).join("\n").toLowerCase();
const checks: Array<[string, boolean, string]> = [];

checks.push(["seven migration files exist", migrationFiles.length >= 7, String(migrationFiles.length)]);
checks.push(["production auth migration present", migrationFiles.some((file) => file.endsWith("004_production_auth_onboarding.sql")), migrationFiles.join(",")]);
checks.push(["billing lifecycle migration present", migrationFiles.some((file) => file.endsWith("005_billing_stripe_lifecycle.sql")), migrationFiles.join(",")]);
checks.push(["embedding versioning migration present", migrationFiles.some((file) => file.endsWith("006_embedding_versioning_jobs.sql")), migrationFiles.join(",")]);
checks.push(["background ingestion migration present", migrationFiles.some((file) => file.endsWith("007_background_ingestion_jobs.sql")), migrationFiles.join(",")]);

for (const table of REQUIRED_RLS_TABLES) {
  checks.push([`RLS enabled on ${table}`, hasRlsEnable(table), table]);
}

for (const helper of REQUIRED_RLS_HELPERS) {
  checks.push([`RLS helper ${helper} exists`, sql.includes(`function public.${helper}`), helper]);
}

for (const expectation of RLS_EXPECTATIONS) {
  const evidenceOk = expectation.policyEvidence.every((fragment) => sql.includes(fragment.toLowerCase()));
  checks.push([`matrix evidence ${expectation.id}`, evidenceOk, expectation.policyEvidence.join(" | ")]);
}

checks.push(["customer ticket policies exist", sql.includes("customers read own tickets") && sql.includes("customers create own tickets"), "tickets"]);
checks.push(["customer message policies constrain sender", sql.includes("customers create own messages") && sql.includes("sender = 'customer'"), "ticket_messages"]);
checks.push(["membership checks require active status", sql.includes("memberships.status = 'active'"), "memberships.status"]);
checks.push(["invite policies are owner/admin gated", sql.includes("managers manage invitations") && sql.includes("array['owner','admin']"), "invitations"]);
checks.push(["portal identities are workspace unique", sql.includes("unique (workspace_id, user_id)") && sql.includes("unique (workspace_id, email)"), "portal_identities"]);
checks.push(["billing owner policies exist", sql.includes("owners manage checkout sessions") && sql.includes("owners read subscriptions") && sql.includes("owners read invoices"), "billing"]);
checks.push(["Stripe webhooks are idempotent", sql.includes("stripe_event_id text not null unique") && sql.includes("stripe_webhook_events"), "stripe_webhook_events"]);
checks.push(["embedding jobs are workspace gated", sql.includes("workspace managers manage embedding jobs") && sql.includes("knowledge_embedding_jobs"), "knowledge_embedding_jobs"]);
checks.push(["document chunk match is workspace scoped", sql.includes("target_workspace_id") && sql.includes("dc.workspace_id = target_workspace_id"), "match_document_chunks"]);
checks.push(["ingestion jobs are workspace gated", sql.includes("workspace managers manage ingestion jobs") && sql.includes("knowledge_ingestion_jobs"), "knowledge_ingestion_jobs"]);
checks.push(["ingestion jobs track retry metadata", sql.includes("attempts integer not null default 0") && sql.includes("max_attempts integer not null default 3") && sql.includes("next_run_at"), "retry"]);
checks.push(["ingestion jobs dedupe successful hashes", sql.includes("knowledge_ingestion_jobs_success_hash_idx") && sql.includes("source_content_hash"), "dedupe"]);

let failed = 0;
console.log("\nSupportPilot RLS production checks");
console.log(`Migrations: ${migrationFiles.join(", ")}`);
console.log(`Matrix: ${describeRlsMatrix().join(" | ")}`);

for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} RLS production checks failed`);
  process.exit(1);
}

if (process.env.RUN_LIVE_RLS === "1") {
  console.log("\nLIVE RLS NOTE: RUN_LIVE_RLS is set, but this script is the static migration gate.");
  console.log("Use docs/RLS_VERIFICATION.md for the clean Supabase project rehearsal steps and required actor fixtures.");
}

console.log("\nRLS production checks passed\n");

function hasRlsEnable(table: string) {
  return sql.includes(`alter table public.${table} enable row level security`);
}
