import type { Metadata } from "next";
import { LoginForm } from "@/components/enterprise/login-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Sign in - ${theme.productName}`,
  robots: "noindex",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">{theme.productName}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Enterprise sign in</h1>
          <p className="mt-2 text-sm text-foreground-2">
            Access the support workspace with a Supabase-backed agent, manager, or admin account.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
