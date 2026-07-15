import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { canManageMembershipMutation } from "@/lib/auth/memberships";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, hasSupabaseEnv, isDemoMode } from "@/lib/supabase/config";

export const runtime = "nodejs";

const MembershipUpdateSchema = z
  .object({
    role: z.enum(["owner", "admin", "manager", "agent", "analyst", "viewer"]).optional(),
    status: z.enum(["active", "disabled"]).optional(),
  })
  .refine((value) => value.role || value.status, { message: "role or status is required" });

export async function PATCH(req: Request, context: { params: Promise<{ workspaceId: string; membershipId: string }> }) {
  const { workspaceId, membershipId } = await context.params;
  const parsed = MembershipUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid membership update", issues: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  if (isDemoMode() && (!hasSupabaseEnv() || !hasSupabaseAdminEnv())) {
    return Response.json({
      membership: {
        id: membershipId,
        workspaceId: auth.workspaceId,
        role: parsed.data.role ?? auth.role,
        status: parsed.data.status ?? "active",
      },
      demo: true,
    });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "Supabase service role is not configured" }, { status: 500 });

  const { data: target, error: targetError } = await admin
    .from("memberships")
    .select("id,tenant_id,workspace_id,user_id,role,status")
    .eq("id", membershipId)
    .eq("workspace_id", auth.workspaceId)
    .maybeSingle();

  if (targetError) return Response.json({ error: targetError.message }, { status: 500 });
  if (!target) return Response.json({ error: "membership not found" }, { status: 404 });

  const { count: activeOwnerCount, error: ownerCountError } = await admin
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", auth.workspaceId)
    .eq("role", "owner")
    .eq("status", "active");

  if (ownerCountError) return Response.json({ error: ownerCountError.message }, { status: 500 });

  const decision = canManageMembershipMutation({
    actorRole: auth.role,
    targetRole: target.role,
    nextRole: parsed.data.role ?? null,
    nextStatus: parsed.data.status ?? null,
    activeOwnerCount: activeOwnerCount ?? 0,
  });

  if (!decision.allowed) {
    return Response.json(
      { error: decision.reason === "last_owner" ? "workspace must keep at least one active owner" : "forbidden" },
      { status: 403 },
    );
  }

  const update = {
    ...(parsed.data.role ? { role: parsed.data.role } : {}),
    ...(parsed.data.status ? { status: parsed.data.status, disabled_at: parsed.data.status === "disabled" ? new Date().toISOString() : null } : {}),
  };

  const { data: membership, error: updateError } = await admin
    .from("memberships")
    .update(update)
    .eq("id", membershipId)
    .eq("workspace_id", auth.workspaceId)
    .select("id,tenant_id,workspace_id,user_id,role,status,accepted_at,disabled_at")
    .single();

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  await admin.from("audit_logs").insert({
    tenant_id: auth.tenantId,
    workspace_id: auth.workspaceId,
    ticket_id: null,
    user_id: auth.userId,
    action: parsed.data.status === "disabled" ? "member.disabled" : "member.updated",
    details: {
      membershipId,
      targetUserId: target.user_id,
      previousRole: target.role,
      nextRole: parsed.data.role ?? target.role,
      previousStatus: target.status,
      nextStatus: parsed.data.status ?? target.status,
    },
  });

  return Response.json({ membership });
}

export async function DELETE(_req: Request, context: { params: Promise<{ workspaceId: string; membershipId: string }> }) {
  const { workspaceId, membershipId } = await context.params;
  return PATCH(
    new Request("https://supportpilot.local/internal-membership-disable", {
      method: "PATCH",
      body: JSON.stringify({ status: "disabled" }),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ workspaceId, membershipId }) },
  );
}
