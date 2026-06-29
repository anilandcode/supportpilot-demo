import type { Metadata } from "next";
import { AuthForm } from "@/components/enterprise/auth-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Choose new password - ${theme.productName}`,
  robots: "noindex",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-foreground-2">Complete the recovery session from your email link.</p>
        <div className="mt-6">
          <AuthForm mode="reset-password" />
        </div>
      </div>
    </main>
  );
}
