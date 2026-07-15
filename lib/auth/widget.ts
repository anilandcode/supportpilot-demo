import { appendSecurityEvent, getWorkspace, isOriginAllowed } from "@/lib/db/support";
import type { Workspace } from "@/lib/enterprise/types";
import { getProductionSupabaseConfigError, isProductionMode } from "@/lib/supabase/config";

type WidgetWorkspaceResult =
  | { ok: true; workspace: Workspace; origin: string | null }
  | { ok: false; response: Response };

export async function requireWidgetWorkspace(input: {
  req: Request;
  requestedWorkspace?: string | null;
  route: string;
}): Promise<WidgetWorkspaceResult> {
  const productionConfigError = getProductionSupabaseConfigError();
  if (productionConfigError) {
    return { ok: false, response: Response.json({ error: productionConfigError }, { status: 503 }) };
  }

  let workspace: Workspace;
  try {
    workspace = await getWorkspace(input.requestedWorkspace || undefined);
  } catch (error) {
    return {
      ok: false,
      response: Response.json({ error: error instanceof Error ? error.message : "workspace not found" }, { status: 404 }),
    };
  }

  const origin = input.req.headers.get("origin");
  if (isProductionMode() && !origin) {
    await appendSecurityEvent({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      eventType: "blocked_origin",
      severity: "high",
      origin: null,
      ipHash: ipHash(input.req),
      details: { route: input.route, reason: "missing_origin" },
    });
    return { ok: false, response: Response.json({ error: "origin is required for widget traffic" }, { status: 403 }) };
  }

  const originAllowed = await isOriginAllowed(workspace.id, origin);
  if (!originAllowed) {
    await appendSecurityEvent({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      eventType: "blocked_origin",
      severity: "medium",
      origin,
      ipHash: ipHash(input.req),
      details: { route: input.route, reason: "origin_not_allowed" },
    });
    return { ok: false, response: Response.json({ error: "origin is not allowed for this workspace" }, { status: 403 }) };
  }

  return { ok: true, workspace, origin };
}

function ipHash(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || req.headers.get("x-real-ip") || "local-demo").replace(/[^a-z0-9]/gi, "_").slice(0, 64);
}
