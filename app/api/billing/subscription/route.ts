import { requireWorkspaceRole } from "@/lib/auth/api";
import { getBillingLifecycleState } from "@/lib/db/billing";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspaceId") || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const state = await getBillingLifecycleState(workspace.id);
  return Response.json({
    workspaceId: workspace.id,
    tenantId: workspace.tenantId,
    customer: state.customer,
    subscription: state.subscriptions[0] ?? null,
    entitlements: state.entitlements,
    invoices: state.invoices,
    checkoutSessions: state.checkoutSessions,
  });
}
