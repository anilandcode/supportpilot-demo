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
import { canManageMembershipMutation } from "../lib/auth/memberships.ts";
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
checks.push([
  "membership mutation blocks ownerless workspace",
  !canManageMembershipMutation({ actorRole: "owner", targetRole: "owner", nextRole: "admin", activeOwnerCount: 1 }).allowed,
  "last_owner",
]);
checks.push([
  "admin cannot mutate owner membership",
  !canManageMembershipMutation({ actorRole: "admin", targetRole: "owner", nextStatus: "disabled", activeOwnerCount: 2 }).allowed,
  "admin",
]);
checks.push([
  "owner can manage non-owner membership",
  canManageMembershipMutation({ actorRole: "owner", targetRole: "agent", nextRole: "manager", activeOwnerCount: 1 }).allowed,
  "owner",
]);

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

const workspaceProtectedRoutes = [
  "app/api/billing/checkout/route.ts",
  "app/api/billing/portal/route.ts",
  "app/api/billing/subscription/route.ts",
  "app/api/integrations/accounts/route.ts",
  "app/api/integrations/events/route.ts",
  "app/api/knowledge/ingest/jobs/route.ts",
  "app/api/knowledge/missing/route.ts",
  "app/api/knowledge/reembed/route.ts",
  "app/api/knowledge/upload/route.ts",
  "app/api/model-routes/route.ts",
  "app/api/onboarding/state/route.ts",
  "app/api/onboarding/steps/[step]/complete/route.ts",
  "app/api/security/audit-exports/route.ts",
  "app/api/security/deletion-requests/route.ts",
  "app/api/security/events/route.ts",
  "app/api/security/retention/jobs/route.ts",
  "app/api/stats/route.ts",
  "app/api/workspaces/[workspaceId]/memberships/[membershipId]/route.ts",
];
const unprotectedWorkspaceRoutes = workspaceProtectedRoutes.filter((file) => !readFileSync(file, "utf8").includes("requireWorkspaceRole("));
checks.push(["workspace data APIs require role authorization", unprotectedWorkspaceRoutes.length === 0, unprotectedWorkspaceRoutes.join(",") || "none"]);

const apiDemoFallbackFiles = apiFiles.filter((file) => readFileSync(file, "utf8").includes("DEMO_WORKSPACE_ID"));
checks.push(["API routes avoid direct demo workspace fallback", apiDemoFallbackFiles.length === 0, apiDemoFallbackFiles.join(",") || "none"]);

const membershipRouteSource = readFileSync("app/api/workspaces/[workspaceId]/memberships/[membershipId]/route.ts", "utf8");
checks.push([
  "membership route prevents disabling final owner",
  membershipRouteSource.includes("canManageMembershipMutation") && membershipRouteSource.includes("workspace must keep at least one active owner"),
  "memberships route",
]);

const invitationRouteSource = readFileSync("app/api/workspaces/[workspaceId]/invitations/route.ts", "utf8");
checks.push([
  "invitation route supports audited revocation",
  invitationRouteSource.includes("export async function DELETE") && invitationRouteSource.includes("member.invite.revoked"),
  "invitations route",
]);

const onboardingWorkspaceSource = readFileSync("app/api/onboarding/workspace/route.ts", "utf8");
checks.push([
  "workspace onboarding seeds escalation defaults",
  onboardingWorkspaceSource.includes('admin.from("escalation_rules").insert') &&
    onboardingWorkspaceSource.includes("Billing/refund risk") &&
    onboardingWorkspaceSource.includes("Sensitive data exposure"),
  "onboarding workspace",
]);
checks.push([
  "workspace onboarding seeds approval defaults",
  onboardingWorkspaceSource.includes('admin.from("approval_policies").insert') &&
    onboardingWorkspaceSource.includes("low_confidence") &&
    onboardingWorkspaceSource.includes("billing_or_refund") &&
    onboardingWorkspaceSource.includes("legal_or_policy"),
  "onboarding workspace",
]);

const portalTicketsRouteSource = readFileSync("app/api/portal/tickets/route.ts", "utf8");
const authApiSource = readFileSync("lib/auth/api.ts", "utf8");
const ticketMessagesRouteSource = readFileSync("app/api/tickets/[ticketId]/messages/route.ts", "utf8");
checks.push([
  "portal ticket list is customer scoped",
  portalTicketsRouteSource.includes("export async function GET") &&
    portalTicketsRouteSource.includes("ensurePortalIdentity") &&
    portalTicketsRouteSource.includes("portal.customerId") &&
    portalTicketsRouteSource.includes("listPortalTickets({ workspaceId: workspace.id, customerId: portal.customerId })"),
  "portal tickets route",
]);
checks.push([
  "portal ticket creation explicitly binds customer identity",
  portalTicketsRouteSource.includes("allowCustomerBinding: true") &&
    authApiSource.includes("allowCustomerBinding?: boolean") &&
    authApiSource.includes("ticket does not belong to this customer"),
  "portal identity binding",
]);
checks.push([
  "customer ticket messages cannot self-bind to foreign tickets",
  ticketMessagesRouteSource.includes('sender === "customer"') &&
    ticketMessagesRouteSource.includes("ensurePortalIdentity") &&
    !ticketMessagesRouteSource.includes("allowCustomerBinding: true"),
  "ticket messages route",
]);

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
