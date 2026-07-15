export type SupportPilotAppMode = "demo" | "production";

export function getAppMode(): SupportPilotAppMode {
  return process.env.SUPPORTPILOT_APP_MODE === "production" ? "production" : "demo";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

export function isProductionMode(): boolean {
  return getAppMode() === "production";
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseAdminEnv(): boolean {
  return hasSupabaseEnv() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getMissingSupabaseConfig(): string[] {
  const required: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ];

  return required.filter(([, value]) => !value).map(([key]) => key);
}

export function getProductionSupabaseConfigError(): string | null {
  if (!isProductionMode() || hasSupabaseAdminEnv()) return null;
  return `Production mode requires Supabase configuration: ${getMissingSupabaseConfig().join(", ")}`;
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://demo.supabase.local";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "demo-anon-key";
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "demo-service-role-key";
}
