import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseAdminEnv } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminEnv()) return null;

  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
