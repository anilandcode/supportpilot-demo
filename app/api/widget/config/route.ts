import { requireWidgetWorkspace } from "@/lib/auth/widget";
import { appendSecurityEvent, getWidgetConfig } from "@/lib/db/support";
import { checkRateLimit, rateLimitHeaders, retryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const widgetAuth = await requireWidgetWorkspace({
    req,
    route: "/api/widget/config",
    requestedWorkspace: url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined,
  });
  if (!widgetAuth.ok) return widgetAuth.response;
  const { workspace, origin } = widgetAuth;
  const rate = await checkRateLimit({
    scope: "widget_config",
    workspaceId: workspace.id,
    key: `${clientKey(req)}:${origin ?? "no-origin"}`,
  });
  if (!rate.allowed) {
    await appendSecurityEvent({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      eventType: "rate_limited",
      severity: "medium",
      origin,
      ipHash: rate.keyHash,
      details: { route: "/api/widget/config", scope: rate.scope, store: rate.store, resetAt: rate.resetAt, limit: rate.limit },
    });
    return Response.json(
      { error: "widget config rate limit exceeded", retryAfter: retryAfterSeconds(rate) },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const widgetConfig = await getWidgetConfig(workspace.id);

  return Response.json(
    {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        botName: workspace.botName,
        brandColor: workspace.brandColor,
        accentForeground: workspace.accentForeground,
        welcomeMessage: workspace.welcomeMessage,
        widgetKey: workspace.widgetKey,
      },
      widgetConfig: {
        launcherLabel: widgetConfig.launcherLabel,
        position: widgetConfig.position,
        showBranding: widgetConfig.showBranding,
        privacyText: widgetConfig.privacyText,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "local-demo";
}
