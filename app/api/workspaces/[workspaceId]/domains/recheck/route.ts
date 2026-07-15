import { requireWorkspaceRole } from "@/lib/auth/api";
import { recheckWorkspaceDomains } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(req: Request, context: { params: Promise<{ workspaceId: string }> }) {
  let { workspaceId } = await context.params;
  const workerSecret = process.env.SUPPORTPILOT_DOMAIN_RECHECK_SECRET;
  const providedSecret = req.headers.get("x-supportpilot-domain-secret");
  let domainIds: string[] | undefined;

  const body = await req.json().catch(() => null);
  if (Array.isArray(body?.domainIds)) {
    domainIds = body.domainIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0);
  }

  if (!workerSecret || providedSecret !== workerSecret) {
    const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    workspaceId = auth.workspaceId;
  }

  const result = await recheckWorkspaceDomains({ workspaceId, domainIds });
  const failed = result.results.some((item) => !item.skipped && !item.verified);
  return Response.json(result, { status: failed ? 207 : 202 });
}
