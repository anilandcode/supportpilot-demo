import { z } from "zod";
import { canInviteRole } from "@/lib/auth/permissions";
import { createInviteToken, hashInviteToken, inviteUrlFromRequest } from "@/lib/auth/invitations";
import { getCurrentWorkspaceMembership } from "@/lib/auth/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProductionSupabaseConfigError, hasSupabaseAdminEnv, hasSupabaseEnv, isDemoMode } from "@/lib/supabase/config";

export const runtime = "nodejs";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "manager", "agent", "analyst", "viewer"]),
});

export async function POST(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const parsed = inviteSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "invalid invitation", issues: parsed.error.flatten() }, { status: 400 });
  }

  const productionConfigError = getProductionSupabaseConfigError();
  if (productionConfigError) {
    return Response.json({ error: productionConfigError }, { status: 503 });
  }

  if (isDemoMode() && (!hasSupabaseEnv() || !hasSupabaseAdminEnv())) {
    const token = createInviteToken();
    return Response.json({
      invitation: {
        email: parsed.data.email,
        role: parsed.data.role,
        workspaceId,
        status: "pending",
        inviteUrl: inviteUrlFromRequest(req, token),
      },
      demo: true,
    });
  }

  const membership = await getCurrentWorkspaceMembership(workspaceId);
  if (!membership || !canInviteRole(membership.role, parsed.data.role)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "Supabase service role is not configured" }, { status: 500 });

  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("invitations")
    .insert({
      tenant_id: membership.tenantId,
      workspace_id: workspaceId,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      token_hash: tokenHash,
      invited_by: user.id,
      expires_at: expiresAt,
    })
    .select("id,email,role,status,expires_at,created_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await admin.from("audit_logs").insert({
    tenant_id: membership.tenantId,
    workspace_id: workspaceId,
    ticket_id: null,
    user_id: user.id,
    action: "member.invited",
    details: { email: parsed.data.email.toLowerCase(), role: parsed.data.role },
  });

  return Response.json({ invitation: { ...data, inviteUrl: inviteUrlFromRequest(req, token) } }, { status: 201 });
}
