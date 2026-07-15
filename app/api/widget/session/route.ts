import { requireWidgetWorkspace } from "@/lib/auth/widget";
import { appendSecurityEvent, createWidgetSession, recordUsageEvent } from "@/lib/db/support";
import { checkRateLimit, rateLimitHeaders, retryAfterSeconds } from "@/lib/rate-limit";
import { createSignedWidgetSession, getWidgetSessionSecret } from "@/lib/security/widget-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const widgetAuth = await requireWidgetWorkspace({
    req,
    route: "/api/widget/session",
    requestedWorkspace: typeof body?.workspace === "string" ? body.workspace : typeof body?.workspaceId === "string" ? body.workspaceId : undefined,
  });
  if (!widgetAuth.ok) return widgetAuth.response;
  const { workspace, origin } = widgetAuth;

  const rate = await checkRateLimit({
    scope: "widget_session",
    workspaceId: workspace.id,
    key: `${clientKey(req)}:${origin || "no-origin"}`,
  });
  if (!rate.allowed) {
    await appendSecurityEvent({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      eventType: "rate_limited",
      severity: "medium",
      origin,
      ipHash: rate.keyHash,
      details: { route: "/api/widget/session", scope: rate.scope, store: rate.store, resetAt: rate.resetAt, limit: rate.limit },
    });
    return Response.json(
      { error: "widget session rate limit exceeded", retryAfter: retryAfterSeconds(rate) },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const signed = createSignedWidgetSession({ workspaceId: workspace.id, origin: origin ?? "" });
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
    origin: origin ?? "",
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

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "local-demo";
}
