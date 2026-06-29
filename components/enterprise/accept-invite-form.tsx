"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function AcceptInviteForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function acceptInvite() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Could not accept invitation");
        return;
      }
      window.location.assign(payload.redirectTo ?? "/admin");
    });
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-semibold">Invitation token missing</p>
        <p className="mt-2 text-sm text-foreground-2">Open the exact invitation link or ask an admin to send a new one.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <p className="font-semibold">Accept workspace invitation</p>
      </div>
      <p className="mt-4 text-sm text-foreground-2">Sign in with the invited email address first, then accept to create your workspace membership.</p>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={pending}
        onClick={acceptInvite}
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60"
      >
        {pending ? "Accepting..." : "Accept invitation"}
      </button>
      <p className="mt-4 text-sm text-foreground-2">
        Not signed in yet?{" "}
        <Link href={`/magic-link?next=/invite/accept?token=${encodeURIComponent(token)}`} className="font-semibold text-accent">
          Send a magic link
        </Link>
      </p>
    </div>
  );
}
