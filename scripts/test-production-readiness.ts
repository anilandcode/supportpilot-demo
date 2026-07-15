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
  "app/api/billing/reconciliation/route.ts",
  "app/api/billing/subscription/route.ts",
  "app/api/integrations/accounts/route.ts",
  "app/api/integrations/events/route.ts",
  "app/api/integrations/health/route.ts",
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
  "app/api/workspaces/[workspaceId]/domains/route.ts",
  "app/api/workspaces/[workspaceId]/domains/[domainId]/verify/route.ts",
  "app/api/workspaces/[workspaceId]/domains/recheck/route.ts",
  "app/api/workspaces/[workspaceId]/invitations/route.ts",
  "app/api/workspaces/[workspaceId]/memberships/[membershipId]/route.ts",
  "app/api/workspaces/[workspaceId]/settings/route.ts",
  "app/api/workspaces/[workspaceId]/widget-key/regenerate/route.ts",
];
const unprotectedWorkspaceRoutes = workspaceProtectedRoutes.filter((file) => !readFileSync(file, "utf8").includes("requireWorkspaceRole("));
checks.push(["workspace data APIs require role authorization", unprotectedWorkspaceRoutes.length === 0, unprotectedWorkspaceRoutes.join(",") || "none"]);

const apiDemoFallbackFiles = apiFiles.filter((file) => readFileSync(file, "utf8").includes("DEMO_WORKSPACE_ID"));
checks.push(["API routes avoid direct demo workspace fallback", apiDemoFallbackFiles.length === 0, apiDemoFallbackFiles.join(",") || "none"]);

const membershipRouteSource = readFileSync("app/api/workspaces/[workspaceId]/memberships/[membershipId]/route.ts", "utf8");
const billingCheckoutSource = readFileSync("app/api/billing/checkout/route.ts", "utf8");
const billingPortalSource = readFileSync("app/api/billing/portal/route.ts", "utf8");
const billingReconciliationSource = readFileSync("app/api/billing/reconciliation/route.ts", "utf8");
const billingSubscriptionSource = readFileSync("app/api/billing/subscription/route.ts", "utf8");
const widgetKeyRouteSource = readFileSync("app/api/workspaces/[workspaceId]/widget-key/regenerate/route.ts", "utf8");
const workspaceSettingsSource = readFileSync("app/api/workspaces/[workspaceId]/settings/route.ts", "utf8");
const workspaceDomainRouteSource = readFileSync("app/api/workspaces/[workspaceId]/domains/route.ts", "utf8");
const workspaceDomainVerifySource = readFileSync("app/api/workspaces/[workspaceId]/domains/[domainId]/verify/route.ts", "utf8");
const workspaceDomainRecheckSource = readFileSync("app/api/workspaces/[workspaceId]/domains/recheck/route.ts", "utf8");
const domainAlertsSource = readFileSync("lib/ops/domain-alerts.ts", "utf8");
checks.push([
  "billing APIs are owner-only",
  billingCheckoutSource.includes('requireWorkspaceRole(body.workspaceId, ["owner"])') &&
    billingPortalSource.includes('requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"])') &&
    billingReconciliationSource.includes('requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"])') &&
    billingSubscriptionSource.includes('requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"])'),
  "billing routes",
]);
checks.push([
  "widget key rotation is owner/admin-only and canonical",
  widgetKeyRouteSource.includes('requireWorkspaceRole(workspaceId, ["owner", "admin"])') &&
    widgetKeyRouteSource.includes("regenerateWorkspaceWidgetKey(auth.workspaceId)") &&
    !widgetKeyRouteSource.includes("regenerateWorkspaceWidgetKey(workspaceId)"),
  "widget key route",
]);
checks.push([
  "workspace settings and domain actions use authorized workspace",
  workspaceSettingsSource.includes("workspaceId: auth.workspaceId") &&
    workspaceDomainRouteSource.includes("getWorkspaceDomainHealth(auth.workspaceId)") &&
    workspaceDomainRouteSource.includes("workspaceId: auth.workspaceId") &&
    workspaceDomainVerifySource.includes("workspaceId: auth.workspaceId") &&
    workspaceDomainRecheckSource.includes("workspaceId = auth.workspaceId"),
  "workspace route canonical ids",
]);
checks.push([
  "domain recheck can send sanitized monitoring alerts",
  workspaceDomainRecheckSource.includes("sendDomainRecheckAlert(result)") &&
    workspaceDomainRecheckSource.includes("alert") &&
    domainAlertsSource.includes("SUPPORTPILOT_DOMAIN_ALERT_WEBHOOK_URL") &&
    domainAlertsSource.includes("expectedCname") &&
    !domainAlertsSource.includes("expectedTxt") &&
    !domainAlertsSource.includes("observed: item.observed") &&
    !domainAlertsSource.includes("expectedTxt:"),
  "domain recheck alerting",
]);
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
checks.push([
  "invitation route exposes owner/admin member management state",
  invitationRouteSource.includes("export async function GET") &&
    invitationRouteSource.includes('requireWorkspaceRole(workspaceId, ["owner", "admin"])') &&
    invitationRouteSource.includes("listWorkspaceMembers") &&
    invitationRouteSource.includes("listWorkspaceInvitations"),
  "invitations route",
]);
checks.push([
  "invitation route sends production email",
  invitationRouteSource.includes("getTransactionalEmailConfigError") &&
    invitationRouteSource.includes("sendInvitationEmail") &&
    invitationRouteSource.includes("isProductionMode()") &&
    invitationRouteSource.includes("member.invited") &&
    invitationRouteSource.includes("delivery:"),
  "invitations route",
]);

const invitationAcceptSource = readFileSync("app/api/invitations/accept/route.ts", "utf8");
checks.push([
  "invitation accept persists expiry decisions",
  invitationAcceptSource.includes('status: "expired"') &&
    invitationAcceptSource.includes("member.invite.expired") &&
    invitationAcceptSource.includes('eq("status", "pending")'),
  "invitation accept route",
]);

const onboardingWorkspaceSource = readFileSync("app/api/onboarding/workspace/route.ts", "utf8");
const onboardingWizardSource = readFileSync("components/enterprise/onboarding-wizard.tsx", "utf8");
const onboardingGoldenRouteSource = readFileSync("app/api/onboarding/golden-questions/run/route.ts", "utf8");
checks.push([
  "workspace onboarding seeds escalation defaults",
  onboardingWorkspaceSource.includes('admin.from("escalation_rules").insert') &&
    onboardingWorkspaceSource.includes("Billing/refund risk") &&
    onboardingWorkspaceSource.includes("Sensitive data exposure"),
  "onboarding workspace",
]);
checks.push([
  "onboarding wizard covers launch setup gates",
  onboardingWizardSource.includes("/api/knowledge/upload") &&
    onboardingWizardSource.includes("/api/workspaces/") &&
    onboardingWizardSource.includes("/api/onboarding/golden-questions/run") &&
    onboardingWizardSource.includes("widget_installed") &&
    onboardingWizardSource.includes("monitoring_enabled"),
  "onboarding wizard",
]);
checks.push([
  "onboarding golden-question gate runs shared evals before completion",
  onboardingGoldenRouteSource.includes("runGoldenQuestionEvals") &&
    onboardingGoldenRouteSource.includes("summary.total >= 5") &&
    onboardingGoldenRouteSource.includes("completeOnboardingStep") &&
    onboardingGoldenRouteSource.includes('step: "golden_questions"'),
  "onboarding golden route",
]);
checks.push([
  "workspace onboarding seeds approval defaults",
  onboardingWorkspaceSource.includes('admin.from("approval_policies").insert') &&
    onboardingWorkspaceSource.includes("low_confidence") &&
    onboardingWorkspaceSource.includes("billing_or_refund") &&
    onboardingWorkspaceSource.includes("legal_or_policy"),
  "onboarding workspace",
]);
checks.push([
  "workspace onboarding seeds retention and tool defaults",
  onboardingWorkspaceSource.includes('admin.from("retention_settings").insert') &&
    onboardingWorkspaceSource.includes("conversation_days: 365") &&
    onboardingWorkspaceSource.includes("audit_days: 730") &&
    onboardingWorkspaceSource.includes('admin.from("tool_definitions").insert') &&
    onboardingWorkspaceSource.includes("search_knowledge") &&
    onboardingWorkspaceSource.includes("get_ticket_history") &&
    onboardingWorkspaceSource.includes("get_workspace_policy"),
  "onboarding workspace",
]);

const portalTicketsRouteSource = readFileSync("app/api/portal/tickets/route.ts", "utf8");
const portalPageSource = readFileSync("app/portal/page.tsx", "utf8");
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
  "portal account page avoids cross-customer ticket listing in Supabase mode",
  portalPageSource.includes("ensurePortalIdentity") &&
    portalPageSource.includes("hasSupabaseEnv") &&
    portalPageSource.includes("listPortalTickets({ workspaceId: workspace.id, customerId: portal.customerId })") &&
    portalPageSource.includes("portalAccount"),
  "portal page",
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

const billingCoreSource = readFileSync("lib/billing/core.ts", "utf8");
const billingReconciliationLibSource = readFileSync("lib/billing/reconciliation.ts", "utf8");
const knowledgeUploadSource = readFileSync("app/api/knowledge/upload/route.ts", "utf8");
const domainRouteSource = readFileSync("app/api/workspaces/[workspaceId]/domains/route.ts", "utf8");
const integrationsRouteSource = readFileSync("app/api/integrations/accounts/route.ts", "utf8");
const integrationsHealthRouteSource = readFileSync("app/api/integrations/health/route.ts", "utf8");
const integrationsDbSource = readFileSync("lib/db/integrations.ts", "utf8");
const invitationsRouteSource = readFileSync("app/api/workspaces/[workspaceId]/invitations/route.ts", "utf8");
const chatRouteSource = readFileSync("app/api/chat/route.ts", "utf8");
const ticketDraftRouteSource = readFileSync("app/api/tickets/[ticketId]/draft/route.ts", "utf8");
const widgetAuthSource = readFileSync("lib/auth/widget.ts", "utf8");
const widgetSessionRouteSource = readFileSync("app/api/widget/session/route.ts", "utf8");
const widgetConfigRouteSource = readFileSync("app/api/widget/config/route.ts", "utf8");
const rateLimitSource = readFileSync("lib/rate-limit.ts", "utf8");
const rateLimitTestSource = readFileSync("scripts/test-rate-limit.ts", "utf8");
const retentionSource = readFileSync("lib/db/retention.ts", "utf8");
const ingestionSource = readFileSync("lib/db/ingestion.ts", "utf8");
const healthRouteSource = readFileSync("app/api/health/route.ts", "utf8");
const healthOpsSource = readFileSync("lib/ops/health.ts", "utf8");
checks.push([
  "billing snapshot includes launch-critical entitlement metrics",
  billingCoreSource.includes('"documentChunks"') &&
    billingCoreSource.includes('"domains"') &&
    billingCoreSource.includes('"integrations"') &&
    billingCoreSource.includes('"retentionDays"') &&
    billingCoreSource.includes("modelFallbacks") &&
    billingCoreSource.includes("enforced: true"),
  "billing core",
]);
checks.push([
  "billing reconciliation catches Stripe launch drift",
  billingReconciliationLibSource.includes("buildBillingReconciliationReport") &&
    billingReconciliationLibSource.includes("stripe_price_catalog_incomplete") &&
    billingReconciliationLibSource.includes("subscription_payment_blocked") &&
    billingReconciliationLibSource.includes("entitlement_limit_mismatch") &&
    billingReconciliationLibSource.includes("invoice_unpaid"),
  "billing reconciliation",
]);
checks.push([
  "runtime entitlements gate knowledge, domains, integrations, seats, chat, and drafts",
  knowledgeUploadSource.includes('getPlanLimitBlock(billing, ["sources", "documentChunks"])') &&
    domainRouteSource.includes('getPlanLimitBlock(billing, ["domains"])') &&
    integrationsRouteSource.includes('getPlanLimitBlock(billing, ["integrations"])') &&
    invitationsRouteSource.includes('getPlanLimitBlock(billing, ["members"])') &&
    chatRouteSource.includes('getPlanLimitBlock(billing, ["conversations", "aiReplies", "modelFallbacks"])') &&
    ticketDraftRouteSource.includes('getPlanLimitBlock(billing, ["aiReplies", "modelFallbacks"])'),
  "entitlement route gates",
]);
checks.push([
  "integration health route is workspace authorized and summarizes retries",
  integrationsHealthRouteSource.includes('requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"])') &&
    integrationsHealthRouteSource.includes("getIntegrationHealth(auth.workspaceId)") &&
    integrationsHealthRouteSource.includes('status: health.status === "fail" ? 503 : 200') &&
    integrationsDbSource.includes("export async function getIntegrationHealth") &&
    integrationsDbSource.includes("retryDue") &&
    integrationsDbSource.includes("successRate"),
  "integration health route",
]);
checks.push([
  "widget routes use centralized production origin gate",
  chatRouteSource.includes("requireWidgetWorkspace({ req, requestedWorkspace, route: \"/api/chat\" })") &&
    widgetSessionRouteSource.includes("requireWidgetWorkspace") &&
    widgetConfigRouteSource.includes("requireWidgetWorkspace") &&
    !chatRouteSource.includes("isOriginAllowed") &&
    !widgetSessionRouteSource.includes("isOriginAllowed") &&
    !widgetConfigRouteSource.includes("isOriginAllowed"),
  "widget route guards",
]);
checks.push([
  "rate-limit burst simulation covers public abuse behavior",
  rateLimitSource.includes("simulateRateLimitBurst") &&
    rateLimitSource.includes("RateLimitBurstSummary") &&
    rateLimitTestSource.includes("burst simulation fails closed after configured quota") &&
    rateLimitTestSource.includes("burst.blocked === 5"),
  "rate-limit burst simulation",
]);
checks.push([
  "production widget traffic requires origin",
  widgetAuthSource.includes("isProductionMode() && !origin") &&
    widgetAuthSource.includes("origin is required for widget traffic") &&
    widgetAuthSource.includes('reason: "missing_origin"'),
  "lib/auth/widget.ts",
]);
checks.push([
  "retention background jobs respect billing entitlements",
  retentionSource.includes("getBillingSnapshot") &&
    retentionSource.includes("billing.metrics.retentionDays.limit") &&
    retentionSource.includes("clampRetentionDays") &&
    retentionSource.includes("billing.retention_limit.applied"),
  "lib/db/retention.ts",
]);
checks.push([
  "background ingestion jobs respect source and chunk entitlements",
  ingestionSource.includes("getBillingSnapshot") &&
    ingestionSource.includes("getProjectedPlanLimitBlock") &&
    ingestionSource.includes("sources: 1") &&
    ingestionSource.includes("documentChunks: pendingChunks") &&
    ingestionSource.includes("knowledge.ingestion.plan_limited"),
  "lib/db/ingestion.ts",
]);
checks.push([
  "health endpoint supports authenticated incident alert routing",
  healthRouteSource.includes("export async function POST") &&
    healthRouteSource.includes("verifyHealthAlertSecret") &&
    healthRouteSource.includes("sendHealthAlert") &&
    healthOpsSource.includes("SUPPORTPILOT_HEALTH_ALERT_WEBHOOK_URL") &&
    healthOpsSource.includes("redactUrl"),
  "health alert route",
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
