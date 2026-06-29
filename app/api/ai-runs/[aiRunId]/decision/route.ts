import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { getAiRun, updateAiRunDecision } from "@/lib/db/support";

export const runtime = "nodejs";

const DecisionSchema = z.object({
  decision: z.enum(["approved", "edited", "rejected", "escalated"]),
  finalResponse: z.string().optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ aiRunId: string }> }) {
  const { aiRunId } = await context.params;
  const parsed = DecisionSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "decision must be approved, edited, rejected, or escalated" }, { status: 400 });
  }

  const existingRun = await getAiRun(aiRunId);
  if (!existingRun) {
    return Response.json({ error: "ai run not found" }, { status: 404 });
  }

  const auth = await requireWorkspaceRole(existingRun.workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const run = await updateAiRunDecision({
    aiRunId,
    userId: auth.userId,
    decision: parsed.data.decision,
    finalResponse: parsed.data.finalResponse,
  });

  if (!run) {
    return Response.json({ error: "ai run not found" }, { status: 404 });
  }

  return Response.json({ run });
}
