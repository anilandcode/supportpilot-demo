import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/enterprise/auth-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Customer portal sign in - ${theme.productName}`,
  robots: "noindex",
};

export default function PortalLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Customer portal access</h1>
        <p className="mt-2 text-sm text-foreground-2">Use a magic link to view your own support tickets and conversations.</p>
        <div className="mt-6">
          <AuthForm mode="portal" defaultRedirect="/portal" />
        </div>
        <p className="mt-5 text-sm text-foreground-2">
          Internal user?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Agent sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
