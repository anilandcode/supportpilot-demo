import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { createAuditEvidenceExport, listAuditEvidenceExports } from "@/lib/db/retention";

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
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const exports = await listAuditEvidenceExports(auth.workspaceId);
  return Response.json({ exports });
}

export async function POST(req: Request) {
  const parsed = AuditExportSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "invalid audit export request", issues: parsed.error.flatten() }, { status: 400 });

  const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const exportRecord = await createAuditEvidenceExport({ ...parsed.data, workspaceId: auth.workspaceId, generatedBy: auth.userId });
  return Response.json({ export: exportRecord }, { status: exportRecord.status === "failed" ? 500 : 201 });
}
