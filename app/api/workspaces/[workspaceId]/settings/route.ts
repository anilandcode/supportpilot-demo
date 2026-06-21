import { z } from "zod";
import { hasEnterpriseRole } from "@/lib/auth/roles";
import { updateWorkspaceSettings } from "@/lib/db/support";

export const runtime = "nodejs";

const settingsSchema = z.object({
  name: z.string().min(2),
  botName: z.string().min(2),
  brandColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  welcomeMessage: z.string().min(10),
  escalationEmail: z.string().email(),
  calendlyUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  if (!(await hasEnterpriseRole(["support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const parsed = settingsSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "invalid workspace settings", issues: parsed.error.flatten() }, { status: 400 });
  }

  const workspace = await updateWorkspaceSettings({
    workspaceId,
    ...parsed.data,
    calendlyUrl: parsed.data.calendlyUrl || null,
  });

  return Response.json({ workspace });
}
