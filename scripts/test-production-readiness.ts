import {
  canAccessAnyRole,
  canApproveDraft,
  canInviteRole,
  decideAdminRouteAccess,
  getRequiredAdminRoles,
  profileRoleToMembershipRole,
} from "../lib/auth/permissions.ts";
import { makeWidgetKey, slugifyWorkspaceName, ONBOARDING_CHECKLIST } from "../lib/auth/onboarding.ts";
import { createInviteToken, hashInviteToken } from "../lib/auth/invitations.ts";
import {
  getAppMode,
  getMissingSupabaseConfig,
  getProductionSupabaseConfigError,
  hasSupabaseAdminEnv,
  isDemoMode,
  isProductionMode,
} from "../lib/supabase/config.ts";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const checks: Array<[string, boolean, string]> = [];

checks.push([
  "admin approvals require manager+",
  JSON.stringify(getRequiredAdminRoles("/admin/approvals")) === JSON.stringify(["owner", "admin", "manager"]),
  getRequiredAdminRoles("/admin/approvals").join(","),
]);

checks.push([
  "billing route owner-only",
  JSON.stringify(getRequiredAdminRoles("/admin/billing")) === JSON.stringify(["owner"]),
  getRequiredAdminRoles("/admin/billing").join(","),
]);

checks.push([
  "unauthenticated admin redirects to login with next",
  decideAdminRouteAccess({ authenticated: false, role: null, pathname: "/admin/tickets" }).redirectTo === "/login?next=%2Fadmin%2Ftickets",
  decideAdminRouteAccess({ authenticated: false, role: null, pathname: "/admin/tickets" }).redirectTo ?? "",
]);

checks.push([
  "agent blocked from approvals",
  !decideAdminRouteAccess({ authenticated: true, role: "agent", pathname: "/admin/approvals" }).allowed,
  decideAdminRouteAccess({ authenticated: true, role: "agent", pathname: "/admin/approvals" }).reason,
]);

checks.push([
  "manager can approve but not owner billing",
  canApproveDraft("manager", "manager") && !decideAdminRouteAccess({ authenticated: true, role: "manager", pathname: "/admin/billing" }).allowed,
  "manager",
]);

checks.push(["owner can invite owner", canInviteRole("owner", "owner"), "owner"]);
checks.push(["admin cannot invite owner", !canInviteRole("admin", "owner"), "admin"]);
checks.push(["agent cannot invite agent", !canInviteRole("agent", "agent"), "agent"]);
checks.push(["agent is accepted by staff gate", canAccessAnyRole("agent", ["owner", "admin", "manager", "agent"]), "agent"]);
checks.push(["viewer is rejected by staff gate", !canAccessAnyRole("viewer", ["owner", "admin", "manager", "agent"]), "viewer"]);
checks.push(["legacy admin maps to owner", profileRoleToMembershipRole("admin") === "owner", profileRoleToMembershipRole("admin")]);
checks.push(["legacy manager maps to manager", profileRoleToMembershipRole("support_manager") === "manager", profileRoleToMembershipRole("support_manager")]);
checks.push(["workspace slug normalizes names", slugifyWorkspaceName(" Acme Support, Inc. ") === "acme-support-inc", slugifyWorkspaceName(" Acme Support, Inc. ")]);
checks.push(["onboarding checklist has eight launch gates", ONBOARDING_CHECKLIST.length === 8, String(ONBOARDING_CHECKLIST.length)]);

const token = createInviteToken();
checks.push(["invite token is URL safe", /^[A-Za-z0-9_-]{32,}$/.test(token), token.slice(0, 8)]);
checks.push(["invite token hashes deterministically", hashInviteToken(token) === hashInviteToken(token) && hashInviteToken(token).length === 64, hashInviteToken(token).slice(0, 8)]);
checks.push(["widget key uses production prefix", makeWidgetKey().startsWith("wk_"), makeWidgetKey().slice(0, 3)]);

const originalAppMode = process.env.SUPPORTPILOT_APP_MODE;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

delete process.env.SUPPORTPILOT_APP_MODE;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
checks.push(["app mode defaults to explicit demo fallback", getAppMode() === "demo" && isDemoMode(), getAppMode()]);

process.env.SUPPORTPILOT_APP_MODE = "production";
checks.push([
  "production mode fails closed without Supabase service config",
  isProductionMode() && !hasSupabaseAdminEnv() && getMissingSupabaseConfig().length === 3 && Boolean(getProductionSupabaseConfigError()),
  getProductionSupabaseConfigError() ?? "none",
]);

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
checks.push(["production mode accepts complete Supabase config", hasSupabaseAdminEnv() && getProductionSupabaseConfigError() === null, String(hasSupabaseAdminEnv())]);

restoreEnv("SUPPORTPILOT_APP_MODE", originalAppMode);
restoreEnv("NEXT_PUBLIC_SUPABASE_URL", originalSupabaseUrl);
restoreEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalSupabaseAnonKey);
restoreEnv("SUPABASE_SERVICE_ROLE_KEY", originalSupabaseServiceRoleKey);

const supportDbSource = readFileSync("lib/db/support.ts", "utf8");
checks.push([
  "production workspace lookup rejects demo fallback",
  supportDbSource.includes("if (local && isDemoMode()) return local") && supportDbSource.includes("throw new Error(`Workspace not found or Supabase service role is not configured: ${workspaceId}`)"),
  "lib/db/support.ts",
]);

const apiFiles = walk("app/api").filter((file) => file.endsWith("route.ts"));
const legacyApiAuthFiles = apiFiles.filter((file) => {
  const source = readFileSync(file, "utf8");
  return source.includes("hasEnterpriseRole(") || source.includes("getDemoUser(");
});
checks.push(["API routes use workspace auth helpers", legacyApiAuthFiles.length === 0, legacyApiAuthFiles.join(",") || "none"]);

let failed = 0;
console.log("\nSupportPilot production-readiness checks");
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} production-readiness checks failed`);
  process.exit(1);
}

console.log("\nProduction-readiness checks passed\n");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
