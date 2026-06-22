import { z } from "zod";
import { completeOnboardingStep } from "@/lib/db/support";
import type { LaunchChecklistStep } from "@/lib/enterprise/types";

export const runtime = "nodejs";

const BodySchema = z.object({
  workspaceId: z.string().optional(),
});

const STEPS = new Set<LaunchChecklistStep>([
  "knowledge_source",
  "embeddings_generated",
  "golden_questions",
  "brand_disclosure",
  "escalation_owner",
  "domain_verified",
  "widget_installed",
  "monitoring_enabled",
]);

export async function POST(req: Request, context: { params: Promise<{ step: string }> }) {
  const { step } = await context.params;
  if (!STEPS.has(step as LaunchChecklistStep)) {
    return Response.json({ error: "unknown onboarding step" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const checklist = await completeOnboardingStep({
    workspaceId: parsed.success ? parsed.data.workspaceId : undefined,
    step: step as LaunchChecklistStep,
  });
  return Response.json({ checklist });
}
