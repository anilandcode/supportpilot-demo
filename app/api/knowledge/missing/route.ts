import { z } from "zod";
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
  const tasks = await listMissingKnowledgeTasks(url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined);
  return Response.json({ tasks });
}

export async function POST(req: Request) {
  const parsed = MissingKnowledgeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "topic and reason are required" }, { status: 400 });
  }
  const task = await createMissingKnowledgeTask(parsed.data);
  return Response.json({ task }, { status: 201 });
}
