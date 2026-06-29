import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/enterprise/auth-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Reset password - ${theme.productName}`,
  robots: "noindex",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-foreground-2">Send a secure Supabase recovery link to your email.</p>
        <div className="mt-6">
          <AuthForm mode="forgot-password" />
        </div>
        <p className="mt-5 text-sm text-foreground-2">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
