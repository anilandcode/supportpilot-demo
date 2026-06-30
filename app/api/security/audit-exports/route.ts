import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { createAuditEvidenceExport, listAuditEvidenceExports } from "@/lib/db/retention";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AuditExportSchema = z.object({
  workspaceId: z.string().optional(),
  exportType: z.enum(["monthly_soc2_readiness", "audit_logs", "security_events", "deletion_proof"]).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspaceId") || url.searchParams.get("workspace") || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const exports = await listAuditEvidenceExports(workspace.id);
  return Response.json({ exports });
}

export async function POST(req: Request) {
  const parsed = AuditExportSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "invalid audit export request", issues: parsed.error.flatten() }, { status: 400 });

  const workspace = await getWorkspace(parsed.data.workspaceId || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const exportRecord = await createAuditEvidenceExport({ ...parsed.data, workspaceId: workspace.id, generatedBy: auth.userId });
  return Response.json({ export: exportRecord }, { status: exportRecord.status === "failed" ? 500 : 201 });
}
