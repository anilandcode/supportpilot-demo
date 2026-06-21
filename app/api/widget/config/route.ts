import { getWidgetConfig, getWorkspace, isOriginAllowed } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined);
  const originAllowed = await isOriginAllowed(workspace.id, req.headers.get("origin"));

  if (!originAllowed) {
    return Response.json({ error: "origin is not allowed for this workspace" }, { status: 403 });
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
