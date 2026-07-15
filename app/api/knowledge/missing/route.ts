import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { createMissingKnowledgeTask, listMissingKnowledgeTasks } from "@/lib/db/support";

export const runtime = "nodejs";

const MissingKnowledgeSchema = z.object({
  workspaceId: z.string().optional(),
  topic: z.string().min(2),
  reason: z.string().min(2),
  sourceAiRunId: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin", "manager", "agent", "analyst"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const tasks = await listMissingKnowledgeTasks(auth.workspaceId);
  return Response.json({ tasks });
}

export async function POST(req: Request) {
  const parsed = MissingKnowledgeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "topic and reason are required" }, { status: 400 });
  }
  const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin", "manager", "agent"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const task = await createMissingKnowledgeTask({ ...parsed.data, workspaceId: auth.workspaceId });
  return Response.json({ task }, { status: 201 });
}
