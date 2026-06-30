import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { createDeletionRequest, listDeletionRequests } from "@/lib/db/retention";
import { getWorkspace } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DeletionRequestSchema = z.object({
  workspaceId: z.string().optional(),
  scope: z.enum(["customer", "ticket", "workspace", "source_document"]),
  subjectId: z.string().min(1),
  requesterEmail: z.string().email().nullable().optional(),
  reason: z.string().nullable().optional(),
  verificationMethod: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspace = await getWorkspace(url.searchParams.get("workspaceId") || url.searchParams.get("workspace") || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const requests = await listDeletionRequests(workspace.id);
  return Response.json({ requests });
}

export async function POST(req: Request) {
  const parsed = DeletionRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid deletion request", issues: parsed.error.flatten() }, { status: 400 });

  const workspace = await getWorkspace(parsed.data.workspaceId || DEMO_WORKSPACE_ID);
  const auth = await requireWorkspaceRole(workspace.id, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const result = await createDeletionRequest({
    ...parsed.data,
    workspaceId: workspace.id,
    actorUserId: auth.userId,
  });
  return Response.json(result, { status: result.job ? 202 : 201 });
}
