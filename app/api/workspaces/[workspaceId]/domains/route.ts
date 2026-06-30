import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { addWorkspaceDomain, listWorkspaceDomains } from "@/lib/db/support";

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

  const domains = await listWorkspaceDomains(workspaceId);
  return Response.json({ domains });
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

  const domain = await addWorkspaceDomain({
    workspaceId,
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
  }, { status: 201 });
}
