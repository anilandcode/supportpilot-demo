import { z } from "zod";
import { hashInviteToken } from "@/lib/auth/invitations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProductionSupabaseConfigError, hasSupabaseAdminEnv, hasSupabaseEnv, isDemoMode } from "@/lib/supabase/config";

export const runtime = "nodejs";

const acceptSchema = z.object({
  token: z.string().min(20),
});

export async function POST(req: Request) {
  const parsed = acceptSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "invalid invitation token" }, { status: 400 });
  }

  const productionConfigError = getProductionSupabaseConfigError();
  if (productionConfigError) {
    return Response.json({ error: productionConfigError }, { status: 503 });
  }

  if (isDemoMode() && (!hasSupabaseEnv() || !hasSupabaseAdminEnv())) {
    return Response.json({ ok: true, demo: true, redirectTo: "/admin" });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return Response.json({ error: "Authentication required" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "Supabase service role is not configured" }, { status: 500 });

  const tokenHash = hashInviteToken(parsed.data.token);
  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id,tenant_id,workspace_id,email,role,status,expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (invitationError) return Response.json({ error: invitationError.message }, { status: 500 });
  if (!invitation) {
    return Response.json({ error: "Invitation is expired or unavailable" }, { status: 410 });
  }
  if (invitation.status !== "pending") {
    return Response.json({ error: "Invitation is expired or unavailable" }, { status: 410 });
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    const expiredAt = new Date().toISOString();
    await Promise.all([
      admin.from("invitations").update({ status: "expired" }).eq("id", invitation.id).eq("status", "pending"),
      admin.from("audit_logs").insert({
        tenant_id: invitation.tenant_id,
        workspace_id: invitation.workspace_id,
        ticket_id: null,
        user_id: user.id,
        action: "member.invite.expired",
        details: { invitationId: invitation.id, email: invitation.email, role: invitation.role, expiredAt },
      }),
    ]);
    return Response.json({ error: "Invitation is expired or unavailable" }, { status: 410 });
  }
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return Response.json({ error: "Sign in with the invited email address" }, { status: 403 });
  }

  const fullName = String(user.user_metadata?.full_name ?? user.email);
  const now = new Date().toISOString();

  const { error: profileError } = await admin.from("users").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    role: invitation.role === "manager" ? "support_manager" : invitation.role === "agent" ? "support_agent" : "admin",
  });
  if (profileError) return Response.json({ error: profileError.message }, { status: 500 });

  const { error: membershipError } = await admin.from("memberships").upsert(
    {
      tenant_id: invitation.tenant_id,
      workspace_id: invitation.workspace_id,
      user_id: user.id,
      role: invitation.role,
      status: "active",
      accepted_at: now,
    },
    { onConflict: "workspace_id,user_id" },
  );
  if (membershipError) return Response.json({ error: membershipError.message }, { status: 500 });

  await Promise.all([
    admin.from("invitations").update({ status: "accepted", accepted_at: now }).eq("id", invitation.id),
    admin.from("audit_logs").insert({
      tenant_id: invitation.tenant_id,
      workspace_id: invitation.workspace_id,
      ticket_id: null,
      user_id: user.id,
      action: "member.invite.accepted",
      details: { email: user.email, role: invitation.role },
    }),
  ]);

  return Response.json({ ok: true, workspaceId: invitation.workspace_id, redirectTo: "/admin" });
}
