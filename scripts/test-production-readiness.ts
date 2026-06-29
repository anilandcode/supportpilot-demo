import {
  canApproveDraft,
  canInviteRole,
  decideAdminRouteAccess,
  getRequiredAdminRoles,
  profileRoleToMembershipRole,
} from "../lib/auth/permissions.ts";
import { makeWidgetKey, slugifyWorkspaceName, ONBOARDING_CHECKLIST } from "../lib/auth/onboarding.ts";
import { createInviteToken, hashInviteToken } from "../lib/auth/invitations.ts";

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
checks.push(["legacy admin maps to owner", profileRoleToMembershipRole("admin") === "owner", profileRoleToMembershipRole("admin")]);
checks.push(["legacy manager maps to manager", profileRoleToMembershipRole("support_manager") === "manager", profileRoleToMembershipRole("support_manager")]);
checks.push(["workspace slug normalizes names", slugifyWorkspaceName(" Acme Support, Inc. ") === "acme-support-inc", slugifyWorkspaceName(" Acme Support, Inc. ")]);
checks.push(["onboarding checklist has eight launch gates", ONBOARDING_CHECKLIST.length === 8, String(ONBOARDING_CHECKLIST.length)]);

const token = createInviteToken();
checks.push(["invite token is URL safe", /^[A-Za-z0-9_-]{32,}$/.test(token), token.slice(0, 8)]);
checks.push(["invite token hashes deterministically", hashInviteToken(token) === hashInviteToken(token) && hashInviteToken(token).length === 64, hashInviteToken(token).slice(0, 8)]);
checks.push(["widget key uses production prefix", makeWidgetKey().startsWith("wk_"), makeWidgetKey().slice(0, 3)]);

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
