import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/enterprise/auth-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Magic link - ${theme.productName}`,
  robots: "noindex",
};

export default function MagicLinkPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Passwordless sign in</h1>
        <p className="mt-2 text-sm text-foreground-2">Send a one-time link for staff or owner access.</p>
        <div className="mt-6">
          <AuthForm mode="magic-link" defaultRedirect="/admin" />
        </div>
        <p className="mt-5 text-sm text-foreground-2">
          Prefer password?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
