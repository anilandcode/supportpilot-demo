import { cache } from "react";
import type { EnterpriseUser, MembershipRole, UserRole } from "@/lib/enterprise/types";
import { DEMO_WORKSPACE_ID, demoMemberships } from "@/lib/enterprise/demo-data";
import { canPerformMembershipAction, profileRoleToMembershipRole } from "@/lib/auth/permissions";
import { getDemoUser } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const getCurrentEnterpriseUser = cache(async (): Promise<EnterpriseUser | null> => {
  if (!hasSupabaseEnv()) return getDemoUser("admin");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.email ?? "Customer",
      role: "customer",
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
});

export async function hasEnterpriseRole(allowedRoles: UserRole[]) {
  const user = await getCurrentEnterpriseUser();
  return Boolean(user && allowedRoles.includes(user.role));
}

export { canPerformMembershipAction, profileRoleToMembershipRole };

export type CurrentWorkspaceMembership = {
  id: string;
  tenantId: string;
  workspaceId: string;
  role: MembershipRole;
  status: "active" | "invited" | "disabled";
};

export const getCurrentWorkspaceMembership = cache(async (workspaceId = DEMO_WORKSPACE_ID): Promise<CurrentWorkspaceMembership | null> => {
  const user = await getCurrentEnterpriseUser();
  if (!user) return null;

  if (!hasSupabaseEnv()) {
    const demoMembership =
      demoMemberships.find((membership) => membership.userId === user.id && membership.workspaceId === workspaceId) ??
      demoMemberships.find((membership) => membership.userId === user.id);
    if (!demoMembership) return null;
    return {
      id: demoMembership.id,
      tenantId: demoMembership.tenantId,
      workspaceId: demoMembership.workspaceId,
      role: demoMembership.role,
      status: demoMembership.status ?? "active",
    };
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("memberships")
    .select("id,tenant_id,workspace_id,role,status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (workspaceId) query = query.eq("workspace_id", workspaceId);

  const { data } = await query.limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    tenantId: data.tenant_id,
    workspaceId: data.workspace_id,
    role: data.role,
    status: data.status ?? "active",
  };
});

export async function hasWorkspacePermission(minimumRole: MembershipRole) {
  const membership = await getCurrentWorkspaceMembership();
  if (!membership) return false;
  return canPerformMembershipAction(membership.role, minimumRole);
}
