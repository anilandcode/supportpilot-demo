import { z } from "zod";
import { hasEnterpriseRole } from "@/lib/auth/roles";
import { addWorkspaceDomain } from "@/lib/db/support";

export const runtime = "nodejs";

const domainSchema = z.object({
  domain: z.string().min(3).max(255),
});

export async function POST(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  if (!(await hasEnterpriseRole(["support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const parsed = domainSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "invalid domain", issues: parsed.error.flatten() }, { status: 400 });
  }

  const domain = await addWorkspaceDomain({
    workspaceId,
    domain: parsed.data.domain,
  });

  return Response.json({ domain }, { status: 201 });
}
