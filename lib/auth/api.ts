import type { MembershipRole, TicketWithRelations } from "@/lib/enterprise/types";
import { getCurrentEnterpriseUser, getCurrentWorkspaceMembership } from "@/lib/auth/roles";
import { canAccessAnyRole } from "@/lib/auth/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProductionSupabaseConfigError, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ApiAuthResult =
  | { ok: true; userId: string | null; role: MembershipRole; workspaceId: string; tenantId: string }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function requireWorkspaceRole(workspaceId: string | null | undefined, allowedRoles: MembershipRole[]): Promise<ApiAuthResult> {
  const productionConfigError = getProductionSupabaseConfigError();
  if (productionConfigError) {
    return { ok: false, status: 503, error: productionConfigError };
  }

  const membership = await getCurrentWorkspaceMembership(workspaceId);
  const user = await getCurrentEnterpriseUser();

  if (!user && hasSupabaseEnv()) {
    return { ok: false, status: 401, error: "authentication required" };
  }

  if (!membership || membership.status !== "active" || !canAccessAnyRole(membership.role, allowedRoles)) {
    return { ok: false, status: 403, error: "forbidden" };
  }

  return {
    ok: true,
    userId: user?.id ?? null,
    role: membership.role,
    workspaceId: membership.workspaceId,
    tenantId: membership.tenantId,
  };
}

export async function requireTicketWorkspaceRole(ticket: TicketWithRelations, allowedRoles: MembershipRole[]) {
  return requireWorkspaceRole(ticket.workspaceId, allowedRoles);
}

export async function getAuthenticatedUser() {
  if (!hasSupabaseEnv()) return getCurrentEnterpriseUser();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return user;
}

export async function ensurePortalIdentity(input: { workspaceId: string; tenantId: string; customerId?: string | null; allowCustomerBinding?: boolean }) {
  const productionConfigError = getProductionSupabaseConfigError();
  if (productionConfigError) {
    return { ok: false as const, status: 503 as const, error: productionConfigError };
  }

  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    return { ok: true as const, userId: null, email: null, customerId: input.customerId ?? null };
  }

  const user = await getAuthenticatedUser();
  if (!user?.email) {
    return { ok: false as const, status: 401 as const, error: "customer authentication required" };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false as const, status: 500 as const, error: "Supabase service role is not configured" };
  }

  const { data: existing, error: existingError } = await admin
    .from("portal_identities")
    .select("id,customer_id,status")
    .eq("workspace_id", input.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false as const, status: 500 as const, error: existingError.message };
  }

  if (existing?.status === "disabled") {
    return { ok: false as const, status: 403 as const, error: "customer portal identity is disabled" };
  }

  if (input.customerId && existing?.customer_id && existing.customer_id !== input.customerId) {
    return { ok: false as const, status: 403 as const, error: "ticket does not belong to this customer" };
  }

  if (input.customerId && !existing?.customer_id && !input.allowCustomerBinding) {
    return { ok: false as const, status: 403 as const, error: "ticket does not belong to this customer" };
  }

  const { error } = await admin.from("portal_identities").upsert(
    {
      tenant_id: input.tenantId,
      workspace_id: input.workspaceId,
      user_id: user.id,
      customer_id: input.customerId ?? existing?.customer_id ?? null,
      email: user.email.toLowerCase(),
      status: "active",
      verified_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,user_id" },
  );

  if (error) {
    return { ok: false as const, status: 500 as const, error: error.message };
  }

  return { ok: true as const, userId: user.id, email: user.email, customerId: input.customerId ?? existing?.customer_id ?? null };
}
