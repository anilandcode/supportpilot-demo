import { appendFeedback, createMissingKnowledgeTask, recordUsageEvent } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const messageId = typeof body?.messageId === "string" ? body.messageId : null;
  const aiRunId = typeof body?.aiRunId === "string" ? body.aiRunId : null;
  const workspaceId = typeof body?.workspaceId === "string" ? body.workspaceId : undefined;
  const value = body?.value === "up" || body?.value === "down" ? body.value : null;

  if ((!messageId && !aiRunId) || !value) {
    return Response.json({ error: "messageId or aiRunId and value are required" }, { status: 400 });
  }

  await appendFeedback({ workspaceId, messageId, aiRunId, rating: value });
  await recordUsageEvent({
    workspaceId,
    eventType: "answer_feedback",
    metadata: { messageId, aiRunId, value },
  });
  if (value === "down") {
    await createMissingKnowledgeTask({
      workspaceId,
      topic: typeof body?.topic === "string" ? body.topic : "Negative answer feedback",
      reason: "Customer or reviewer marked an answer as unhelpful.",
      sourceAiRunId: aiRunId,
    });
  }
  return Response.json({ ok: true });
}
