import { requireWorkspaceRole } from "@/lib/auth/api";
import { createStripePortalSession } from "@/lib/billing/stripe";
import { getStripeCustomerForTenant } from "@/lib/db/billing";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";

export const runtime = "nodejs";

async function createPortalResult(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspaceId") || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner"]);
  if (!auth.ok) return { error: auth.error, status: auth.status } as const;

  const mappedCustomer = await getStripeCustomerForTenant(workspace.tenantId);
  const customerId = mappedCustomer?.stripeCustomerId || process.env.STRIPE_CUSTOMER_ID || process.env.SUPPORTPILOT_STRIPE_CUSTOMER_ID || null;
  return createStripePortalSession({ customerId, requestUrl: req.url });
}

export async function GET(req: Request) {
  const result = await createPortalResult(req);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.redirect(result.url, 303);
}

export async function POST(req: Request) {
  const result = await createPortalResult(req);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result, { status: result.mode === "stripe" || result.reason === "demo" ? 200 : 502 });
}
