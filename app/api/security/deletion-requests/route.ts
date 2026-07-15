import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { createDeletionRequest, listDeletionRequests } from "@/lib/db/retention";

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
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const requests = await listDeletionRequests(auth.workspaceId);
  return Response.json({ requests });
}

export async function POST(req: Request) {
  const parsed = DeletionRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid deletion request", issues: parsed.error.flatten() }, { status: 400 });

  const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const result = await createDeletionRequest({
    ...parsed.data,
    workspaceId: auth.workspaceId,
    actorUserId: auth.userId,
  });
  return Response.json(result, { status: result.job ? 202 : 201 });
}
