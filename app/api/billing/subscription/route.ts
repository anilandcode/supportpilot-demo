import { requireWorkspaceRole } from "@/lib/auth/api";
import { getBillingLifecycleState } from "@/lib/db/billing";
import { getWorkspace } from "@/lib/db/support";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const workspace = await getWorkspace(auth.workspaceId);
  const state = await getBillingLifecycleState(auth.workspaceId);
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
