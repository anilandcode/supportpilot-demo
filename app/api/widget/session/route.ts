import { appendSecurityEvent, createWidgetSession, getWorkspace, isOriginAllowed, recordUsageEvent } from "@/lib/db/support";
import { createSignedWidgetSession, getWidgetSessionSecret } from "@/lib/security/widget-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const workspace = await getWorkspace(
    typeof body?.workspace === "string" ? body.workspace : typeof body?.workspaceId === "string" ? body.workspaceId : undefined,
  );
  const origin = req.headers.get("origin") || "";
  const originAllowed = await isOriginAllowed(workspace.id, origin);
  if (!originAllowed) {
    await appendSecurityEvent({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      eventType: "blocked_origin",
      severity: "medium",
      origin,
      ipHash: null,
      details: { route: "/api/widget/session" },
    });
    return Response.json({ error: "origin is not allowed for this workspace" }, { status: 403 });
  }

  const signed = createSignedWidgetSession({ workspaceId: workspace.id, origin });
  if (!signed || !getWidgetSessionSecret()) {
    return Response.json({ required: false });
  }

  let domain = "unknown";
  if (origin) {
    try {
      domain = new URL(origin).hostname;
    } catch {
      domain = "invalid";
    }
  }
  await createWidgetSession({
    workspaceId: workspace.id,
    tokenHash: signed.tokenHash,
    origin,
    domain,
    expiresAt: signed.expiresAt,
  });
  await appendSecurityEvent({
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    eventType: "widget_session_created",
    severity: "low",
    origin,
    ipHash: null,
    details: { expiresAt: signed.expiresAt },
  });
  await recordUsageEvent({
    workspaceId: workspace.id,
    eventType: "widget_installed",
    metadata: { origin, session: true },
  });

  return Response.json({ required: true, token: signed.token, expiresAt: signed.expiresAt });
}
