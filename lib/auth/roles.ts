import { cache } from "react";
import type { EnterpriseUser, UserRole } from "@/lib/enterprise/types";
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
