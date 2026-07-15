import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
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

const revokeSchema = z.object({
  invitationId: z.string().min(1),
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

export async function DELETE(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const parsed = revokeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invitationId is required" }, { status: 400 });
  }

  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  if (isDemoMode() && (!hasSupabaseEnv() || !hasSupabaseAdminEnv())) {
    return Response.json({ invitation: { id: parsed.data.invitationId, workspaceId: auth.workspaceId, status: "revoked" }, demo: true });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "Supabase service role is not configured" }, { status: 500 });

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.invitationId)
    .eq("workspace_id", auth.workspaceId)
    .eq("status", "pending")
    .select("id,email,role,status,revoked_at")
    .maybeSingle();

  if (invitationError) return Response.json({ error: invitationError.message }, { status: 500 });
  if (!invitation) return Response.json({ error: "pending invitation not found" }, { status: 404 });

  await admin.from("audit_logs").insert({
    tenant_id: auth.tenantId,
    workspace_id: auth.workspaceId,
    ticket_id: null,
    user_id: auth.userId,
    action: "member.invite.revoked",
    details: { invitationId: invitation.id, email: invitation.email, role: invitation.role },
  });

  return Response.json({ invitation });
}
