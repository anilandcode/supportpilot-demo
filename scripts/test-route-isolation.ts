import { existsSync, readFileSync } from "node:fs";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

const checks: Check[] = [];

const routeFiles = {
  chat: "app/api/chat/route.ts",
  widgetConfig: "app/api/widget/config/route.ts",
  widgetSession: "app/api/widget/session/route.ts",
  portalTickets: "app/api/portal/tickets/route.ts",
  ticketMessages: "app/api/tickets/[ticketId]/messages/route.ts",
  ticketDraft: "app/api/tickets/[ticketId]/draft/route.ts",
  aiDecision: "app/api/ai-runs/[aiRunId]/decision/route.ts",
  knowledgeUpload: "app/api/knowledge/upload/route.ts",
  workspaceSettings: "app/api/workspaces/[workspaceId]/settings/route.ts",
  widgetAuth: "lib/auth/widget.ts",
  apiAuth: "lib/auth/api.ts",
};

const sources = Object.fromEntries(Object.entries(routeFiles).map(([key, file]) => [key, source(file)]));

addCheck(
  "chat resolves workspace through widget origin/session guard before use",
    callAppearsBefore(sources.chat, "requireWidgetWorkspace", "getBillingSnapshot(workspace.id)") &&
    sources.chat.includes("verifySignedWidgetSession") &&
    sources.chat.includes("widget_session_invalid") &&
    !sources.chat.includes("import { getWorkspace"),
  routeFiles.chat,
);

addCheck(
  "widget config/session share centralized production origin gate",
  sources.widgetConfig.includes("requireWidgetWorkspace") &&
    sources.widgetSession.includes("requireWidgetWorkspace") &&
    sources.widgetAuth.includes("isProductionMode() && !origin") &&
    sources.widgetAuth.includes("origin is required for widget traffic") &&
    sources.widgetAuth.includes("origin_not_allowed"),
  "widget routes + lib/auth/widget.ts",
);

addCheck(
  "portal ticket list is bound to authenticated portal identity",
  sources.portalTickets.includes("ensurePortalIdentity({ workspaceId: workspace.id, tenantId: workspace.tenantId })") &&
    sources.portalTickets.includes("if (!portal.customerId)") &&
    sources.portalTickets.includes("listPortalTickets({ workspaceId: workspace.id, customerId: portal.customerId })"),
  routeFiles.portalTickets,
);

addCheck(
  "portal ticket creation binds only the created customer identity",
  appearsBefore(sources.portalTickets, "createPortalTicket", "allowCustomerBinding: true") &&
    sources.portalTickets.includes("requesterUserId: portal.userId") &&
    sources.apiAuth.includes("ticket does not belong to this customer"),
  "portal ticket route + auth helper",
);

addCheck(
  "customer ticket messages cannot self-bind to foreign tickets",
  sources.ticketMessages.includes('sender === "customer"') &&
    sources.ticketMessages.includes("ensurePortalIdentity({ workspaceId: ticket.workspaceId, tenantId: ticket.tenantId, customerId: ticket.customerId })") &&
    !sources.ticketMessages.includes("allowCustomerBinding: true"),
  routeFiles.ticketMessages,
);

addCheck(
  "staff ticket actions authorize against the ticket workspace",
  sources.ticketMessages.includes("requireTicketWorkspaceRole(ticket, [\"owner\", \"admin\", \"manager\", \"agent\"]") &&
    sources.ticketDraft.includes("requireTicketWorkspaceRole(ticket, [\"owner\", \"admin\", \"manager\", \"agent\"]") &&
    sources.aiDecision.includes("requireWorkspaceRole(existingRun.workspaceId, [\"owner\", \"admin\", \"manager\"]"),
  "ticket message, draft, and decision routes",
);

addCheck(
  "knowledge and settings mutations use canonical authorized workspace IDs",
  sources.knowledgeUpload.includes("requireWorkspaceRole(workspaceId || undefined, [\"owner\", \"admin\", \"manager\", \"agent\"]") &&
    sources.knowledgeUpload.includes("workspaceId: auth.workspaceId") &&
    sources.workspaceSettings.includes("requireWorkspaceRole(workspaceId, [\"owner\", \"admin\"]") &&
    sources.workspaceSettings.includes("workspaceId: auth.workspaceId"),
  "knowledge upload + workspace settings routes",
);

const failed = checks.filter((check) => !check.ok);

console.log("\nSupportPilot route-isolation checks");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} route-isolation checks failed`);
  process.exit(1);
}

console.log("\nRoute-isolation checks passed\n");

function addCheck(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
}

function source(file: string) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
  return readFileSync(file, "utf8");
}

function appearsBefore(text: string, first: string, second: string) {
  const firstIndex = text.indexOf(first);
  const secondIndex = text.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

function callAppearsBefore(text: string, firstCall: string, secondCall: string) {
  const postIndex = text.indexOf("export async function");
  const body = postIndex >= 0 ? text.slice(postIndex) : text;
  return appearsBefore(body, firstCall, secondCall);
}
