import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { completeOnboardingStep } from "@/lib/db/support";
import { runGoldenQuestionEvals } from "@/lib/evals/golden";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  workspaceId: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const auth = await requireWorkspaceRole(parsed.success ? parsed.data.workspaceId : undefined, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const summary = await runGoldenQuestionEvals(auth.workspaceId);
  const passed = summary.total >= 5 && summary.passRate >= summary.thresholds.minimumPassRate;
  const checklist = passed
    ? await completeOnboardingStep({
        workspaceId: auth.workspaceId,
        step: "golden_questions",
      })
    : null;

  return Response.json(
    {
      ok: passed,
      summary,
      checklist,
      error: passed ? null : "golden questions did not meet launch thresholds",
    },
    { status: passed ? 200 : 422 },
  );
}
