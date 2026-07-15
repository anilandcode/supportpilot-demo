import { requireWorkspaceRole } from "@/lib/auth/api";
import { buildBillingReconciliationReport } from "@/lib/billing/reconciliation";
import { sendBillingReconciliationAlert, verifyBillingReconciliationSecret } from "@/lib/ops/billing-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId"), ["owner"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const report = await buildBillingReconciliationReport(auth.workspaceId);
  return Response.json(report, {
    status: report.status === "fail" ? 409 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  if (!verifyBillingReconciliationSecret(req.headers.get("x-supportpilot-billing-secret"))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const workspaceId = typeof body?.workspaceId === "string" && body.workspaceId.length > 0 ? body.workspaceId : null;
  const report = await buildBillingReconciliationReport(workspaceId);
  const alert = await sendBillingReconciliationAlert(report);
  return Response.json(
    { report, alert },
    {
      status: report.status === "fail" ? 409 : 202,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
