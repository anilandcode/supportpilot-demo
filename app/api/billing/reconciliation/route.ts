import { requireWorkspaceRole } from "@/lib/auth/api";
import { buildBillingReconciliationReport } from "@/lib/billing/reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const report = await buildBillingReconciliationReport(auth.workspaceId);
  return Response.json(report, { status: report.status === "fail" ? 409 : 200 });
}
