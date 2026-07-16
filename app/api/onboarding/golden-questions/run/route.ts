import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { completeOnboardingStep } from "@/lib/db/support";
import { runAndRecordGoldenQuestionEvals } from "@/lib/evals/golden";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  workspaceId: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const auth = await requireWorkspaceRole(parsed.success ? parsed.data.workspaceId : undefined, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const result = await runAndRecordGoldenQuestionEvals(auth.workspaceId, "onboarding");
  const passed = result.status === "passed";
  const checklist = passed
    ? await completeOnboardingStep({
        workspaceId: auth.workspaceId,
        step: "golden_questions",
      })
    : null;

  return Response.json(
    {
      ok: passed,
      summary: result.summary,
      artifactHash: result.artifactHash,
      checklist,
      error: passed ? null : "golden questions did not meet launch thresholds",
    },
    { status: passed ? 200 : 422 },
  );
}
