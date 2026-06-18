import { z } from "zod";
import { updateAiRunDecision } from "@/lib/db/support";
import { getDemoUser } from "@/lib/supabase/session";

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

  const run = await updateAiRunDecision({
    aiRunId,
    userId: getDemoUser("support_manager").id,
    decision: parsed.data.decision,
    finalResponse: parsed.data.finalResponse,
  });

  if (!run) {
    return Response.json({ error: "ai run not found" }, { status: 404 });
  }

  return Response.json({ run });
}
