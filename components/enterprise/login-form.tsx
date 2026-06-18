"use client";

import { useState, useTransition } from "react";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  function onSubmit(formData: FormData) {
    if (!hasSupabase) return;
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const next = new URLSearchParams(window.location.search).get("next") ?? "/admin";
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      window.location.assign(next.startsWith("/") ? next : "/admin");
    });
  }

  if (!hasSupabase) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-semibold">Demo mode is active</p>
        <p className="mt-2 text-sm text-foreground-2">
          Add Supabase env vars to enable real authentication. Without them, the seeded enterprise workspace is available locally.
        </p>
        <a href="/admin" className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg">
          Open demo workspace
        </a>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="rounded-2xl border border-border bg-card p-6">
      <label className="block text-sm font-medium" htmlFor="email">
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

      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
      />

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
