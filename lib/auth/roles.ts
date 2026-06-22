import { cache } from "react";
import type { EnterpriseUser, MembershipRole, UserRole } from "@/lib/enterprise/types";
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

const ROLE_RANK: Record<MembershipRole, number> = {
  viewer: 10,
  analyst: 20,
  agent: 30,
  manager: 40,
  admin: 50,
  owner: 60,
};

export function profileRoleToMembershipRole(role: UserRole): MembershipRole {
  if (role === "admin") return "owner";
  if (role === "support_manager") return "manager";
  if (role === "support_agent") return "agent";
  return "viewer";
}

export function canPerformMembershipAction(role: MembershipRole, minimumRole: MembershipRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

export async function hasWorkspacePermission(minimumRole: MembershipRole) {
  const user = await getCurrentEnterpriseUser();
  if (!user) return false;
  return canPerformMembershipAction(profileRoleToMembershipRole(user.role), minimumRole);
}
