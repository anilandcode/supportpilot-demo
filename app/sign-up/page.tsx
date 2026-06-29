import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/enterprise/auth-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Create workspace - ${theme.productName}`,
  robots: "noindex",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Create your support workspace</h1>
        <p className="mt-2 text-sm text-foreground-2">The first verified user becomes the workspace owner and continues into production onboarding.</p>
        <div className="mt-6">
          <AuthForm mode="sign-up" />
        </div>
        <p className="mt-5 text-sm text-foreground-2">
          Already have access?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
