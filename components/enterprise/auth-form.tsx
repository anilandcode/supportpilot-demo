"use client";

import { useState, useTransition } from "react";
import { KeyRound, Mail, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthFormMode = "sign-up" | "magic-link" | "forgot-password" | "reset-password" | "portal";

type AuthFormProps = {
  mode: AuthFormMode;
  defaultRedirect?: string;
};

const MODE_COPY: Record<AuthFormMode, { title: string; cta: string; success: string; icon: typeof UserPlus }> = {
  "sign-up": {
    title: "Create owner account",
    cta: "Create account",
    success: "Check your inbox to verify your email, then continue workspace setup.",
    icon: UserPlus,
  },
  "magic-link": {
    title: "Send magic link",
    cta: "Send magic link",
    success: "Check your inbox for a one-time sign-in link.",
    icon: Mail,
  },
  "forgot-password": {
    title: "Reset password",
    cta: "Send reset link",
    success: "Check your inbox for a password reset link.",
    icon: KeyRound,
  },
  "reset-password": {
    title: "Choose new password",
    cta: "Update password",
    success: "Password updated. Redirecting...",
    icon: KeyRound,
  },
  portal: {
    title: "Customer portal sign in",
    cta: "Continue",
    success: "Check your inbox if verification is required.",
    icon: Mail,
  },
};

export function AuthForm({ mode, defaultRedirect = "/onboarding" }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const copy = MODE_COPY[mode];
  const Icon = copy.icon;

  function redirectTo(path: string) {
    const next = path.startsWith("/") ? path : defaultRedirect;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  function onSubmit(formData: FormData) {
    if (!hasSupabase) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const fullName = String(formData.get("full_name") ?? "");
      const next = new URLSearchParams(window.location.search).get("next") ?? defaultRedirect;

      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: redirectTo("/onboarding"),
          },
        });
        if (signUpError) return setError(signUpError.message);
        setSuccess(copy.success);
        return;
      }

      if (mode === "magic-link" || mode === "portal") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: mode === "portal",
            emailRedirectTo: redirectTo(next.startsWith("/") ? next : defaultRedirect),
          },
        });
        if (otpError) return setError(otpError.message);
        setSuccess(copy.success);
        return;
      }

      if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo("/reset-password"),
        });
        if (resetError) return setError(resetError.message);
        setSuccess(copy.success);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) return setError(updateError.message);
      setSuccess(copy.success);
      window.setTimeout(() => window.location.assign("/login"), 800);
    });
  }

  if (!hasSupabase) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-semibold">Demo mode is active</p>
        <p className="mt-2 text-sm text-foreground-2">Add Supabase env vars to enable production authentication flows.</p>
        <a href="/admin" className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg">
          Open demo workspace
        </a>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <p className="font-semibold">{copy.title}</p>
      </div>

      {mode === "sign-up" ? (
        <>
          <label className="block text-sm font-medium" htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          />
        </>
      ) : null}

      {mode !== "reset-password" ? (
        <>
          <label className="mt-4 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          />
        </>
      ) : null}

      {mode === "sign-up" || mode === "reset-password" ? (
        <>
          <label className="mt-4 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            minLength={8}
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          />
        </>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60"
      >
        {pending ? "Working..." : copy.cta}
      </button>
    </form>
  );
}
