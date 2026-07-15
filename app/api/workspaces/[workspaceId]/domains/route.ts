import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { getBillingSnapshot, getPlanLimitBlock } from "@/lib/billing/plans";
import { addWorkspaceDomain, getDomainHealth, getWorkspaceDomainHealth } from "@/lib/db/support";

export const runtime = "nodejs";

const domainSchema = z.object({
  domain: z.string().min(3).max(255),
});

export async function GET(_req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin", "manager", "agent"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const result = await getWorkspaceDomainHealth(workspaceId);
  return Response.json(result);
}

export async function POST(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = domainSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "invalid domain", issues: parsed.error.flatten() }, { status: 400 });
  }

  const billing = await getBillingSnapshot(auth.workspaceId);
  const planLimitBlock = getPlanLimitBlock(billing, ["domains"]);
  if (planLimitBlock) {
    return Response.json({
      error: "plan limit reached",
      metric: planLimitBlock.key,
      label: planLimitBlock.label,
      used: planLimitBlock.used,
      limit: planLimitBlock.limit,
      plan: billing.plan.key,
    }, { status: 402 });
  }

  const domain = await addWorkspaceDomain({
    workspaceId: auth.workspaceId,
    domain: parsed.data.domain,
  });

  return Response.json({
    domain,
    verification: {
      type: "TXT",
      record: domain.verificationRecord,
      value: domain.verificationToken ? `supportpilot-verify=${domain.verificationToken}` : null,
      cnameTarget: process.env.SUPPORTPILOT_DOMAIN_CNAME_TARGET || "verify.supportpilot.ai",
    },
    health: getDomainHealth(domain),
  }, { status: 201 });
}
