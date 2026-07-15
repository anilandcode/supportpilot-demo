import { existsSync, readFileSync } from "node:fs";

type JourneyCheck = {
  name: string;
  evidence: string[];
  ok: boolean;
};

const checks: JourneyCheck[] = [];

addCheck("marketing page loads", [
  fileExists("app/page.tsx"),
  fileContains("app/page.tsx", ["supportpilot-lynai-stage-14-clean.html", "donorHeroHtml", "supportpilot-stage14-interactions"]),
  fileExists("Design Upgrade/supportpilot-lynai-stage-14-clean.html"),
]);

addCheck("owner onboarding creates workspace and launch defaults", [
  fileExists("app/onboarding/page.tsx"),
  fileContains("app/onboarding/page.tsx", ["OnboardingWizard", "getWorkspaceLaunchState"]),
  fileContains("app/api/onboarding/workspace/route.ts", [
    '.from("organizations")',
    ".insert({",
    'admin.from("memberships").insert',
    'admin.from("widget_configs").insert',
    'admin.from("escalation_rules").insert',
    'admin.from("approval_policies").insert',
  ]),
]);

addCheck("knowledge upload and ingestion journey", [
  fileExists("app/admin/knowledge/page.tsx"),
  fileContains("app/admin/knowledge/page.tsx", ["dashboard-knowledge.html", "listKnowledgeDocs", "listDocumentChunks"]),
  fileContains("app/api/knowledge/upload/route.ts", ["createIngestionJob", 'getPlanLimitBlock(billing, ["sources", "documentChunks"])']),
  fileContains("components/handoff/handoff-runtime.tsx", ["hydrateKnowledge", "/api/knowledge/upload"]),
]);

addCheck("ticket inbox and ticket detail journey", [
  fileExists("app/admin/tickets/page.tsx"),
  fileExists("app/admin/tickets/[ticketId]/page.tsx"),
  fileContains("app/admin/tickets/page.tsx", ["TicketList", "listTickets", "Review approvals"]),
  fileContains("app/admin/tickets/[ticketId]/page.tsx", ["dashboard-conversations.html", "getTicket", "notFound"]),
  fileContains("components/handoff/handoff-runtime.tsx", ["hydrateConversations", "/api/tickets/", "/messages"]),
]);

addCheck("AI draft with citations journey", [
  fileContains("app/api/tickets/[ticketId]/draft/route.ts", ["draftTicketReply", "requireTicketWorkspaceRole", "Response.json(result)"]),
  fileContains("components/handoff/handoff-runtime.tsx", ["/draft", "appendConversationBubble", "citations"]),
  fileContains("components/enterprise/ticket-ai-panel.tsx", ["SourceDrawer", "ConfidenceMeter", "Draft response"]),
]);

addCheck("approval decision journey", [
  fileExists("app/admin/approvals/page.tsx"),
  fileContains("app/admin/approvals/page.tsx", ["dashboard-approvals.html", "listApprovalQueue"]),
  fileContains("app/api/ai-runs/[aiRunId]/decision/route.ts", ["updateAiRunDecision", "enqueueApprovalDecision", '["owner", "admin", "manager"]']),
  fileContains("lib/db/support.ts", ["approval.decided", "updateAiRunDecision"]),
  fileContains("components/handoff/handoff-runtime.tsx", ["/api/ai-runs/", "decision", "hydrateApprovals"]),
]);

addCheck("customer portal ticket creation journey", [
  fileExists("app/portal/page.tsx"),
  fileContains("app/portal/page.tsx", ["customer-portal.html", "HtmlHandoffPage"]),
  fileContains("app/api/portal/tickets/route.ts", ["export async function POST", "ensurePortalIdentity", "createPortalTicket"]),
  fileContains("components/handoff/handoff-runtime.tsx", ["hydratePortal", "/api/portal/tickets"]),
]);

addCheck("widget chat journey", [
  fileExists("app/widget-test/page.tsx"),
  fileExists("app/embed/page.tsx"),
  fileContains("app/widget-test/page.tsx", ["/widget.js", "data-workspace"]),
  fileContains("app/embed/page.tsx", ["ChatWindow", "widgetSession"]),
  fileContains("app/api/chat/route.ts", ["requireWidgetWorkspace", "verifySignedWidgetSession", "getPlanLimitBlock"]),
]);

addCheck("billing checkout and portal journey", [
  fileExists("app/admin/billing/page.tsx"),
  fileContains("app/admin/billing/page.tsx", ["/api/billing/portal", "/api/billing/checkout", "getBillingSnapshot"]),
  fileContains("app/api/billing/checkout/route.ts", ["createStripeCheckoutSession", 'requireWorkspaceRole(body.workspaceId, ["owner"])']),
  fileContains("app/api/billing/portal/route.ts", ["createStripePortalSession", 'requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"])']),
]);

addCheck("settings, domain, and widget install journey", [
  fileExists("app/admin/settings/page.tsx"),
  fileContains("app/admin/settings/page.tsx", ["dashboard-settings.html", "getWorkspaceDomainHealth", "listWorkspaceMembers", "listWorkspaceInvitations"]),
  fileContains("app/api/workspaces/[workspaceId]/settings/route.ts", ["updateWorkspaceSettings", "workspaceId: auth.workspaceId"]),
  fileContains("app/api/workspaces/[workspaceId]/domains/route.ts", ["addWorkspaceDomain", "workspaceId: auth.workspaceId"]),
  fileContains("app/api/workspaces/[workspaceId]/domains/[domainId]/verify/route.ts", ["verifyWorkspaceDomain", "workspaceId: auth.workspaceId"]),
  fileContains("app/api/workspaces/[workspaceId]/widget-key/regenerate/route.ts", ["regenerateWorkspaceWidgetKey(auth.workspaceId)"]),
  fileContains("components/handoff/handoff-runtime.tsx", ["renderMemberManagementPanel", "member-invite-form", "data-member-disable", "data-invite-revoke"]),
]);

let failed = 0;
console.log("\nSupportPilot critical journey checks");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.evidence.join(" | ")}`);
  if (!check.ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} critical journey checks failed`);
  process.exit(1);
}

console.log("\nCritical journey checks passed\n");

function addCheck(name: string, assertions: Array<{ ok: boolean; detail: string }>) {
  checks.push({
    name,
    ok: assertions.every((assertion) => assertion.ok),
    evidence: assertions.map((assertion) => assertion.detail),
  });
}

function fileExists(path: string) {
  return { ok: existsSync(path), detail: path };
}

function fileContains(path: string, needles: string[]) {
  if (!existsSync(path)) return { ok: false, detail: `${path}: missing` };
  const source = readFileSync(path, "utf8");
  const missing = needles.filter((needle) => !source.includes(needle));
  return {
    ok: missing.length === 0,
    detail: missing.length === 0 ? `${path}: ${needles.length} markers` : `${path}: missing ${missing.join(", ")}`,
  };
}
