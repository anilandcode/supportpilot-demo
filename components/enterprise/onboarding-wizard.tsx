"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { WorkspaceLaunchState } from "@/lib/enterprise/types";

type OnboardingWizardProps = {
  launchState: WorkspaceLaunchState;
};

export function OnboardingWizard({ launchState }: OnboardingWizardProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const completed = launchState.checklist.filter((item) => item.completed).length;

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: formData.get("org_name"),
          workspaceName: formData.get("workspace_name"),
          supportUrl: formData.get("support_url"),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Could not create workspace");
        return;
      }
      window.location.assign(payload.redirectTo ?? "/onboarding");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Step 1</p>
        <h2 className="mt-2 text-2xl font-semibold">Create your production workspace</h2>
        <p className="mt-2 text-sm text-foreground-2">
          This creates the organization, workspace, owner membership, widget config, onboarding session, and launch checklist.
        </p>

        <form action={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="org_name">
              Organization name
            </label>
            <input
              id="org_name"
              name="org_name"
              defaultValue={launchState.workspace.name.replace(/ Support$/i, "")}
              required
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="workspace_name">
              Workspace name
            </label>
            <input
              id="workspace_name"
              name="workspace_name"
              defaultValue={launchState.workspace.name}
              required
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="support_url">
              Support or booking URL
            </label>
            <input
              id="support_url"
              name="support_url"
              type="url"
              defaultValue={launchState.workspace.calendlyUrl ?? ""}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {pending ? "Creating workspace" : "Save workspace"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Launch checklist</p>
            <h2 className="mt-2 text-2xl font-semibold">{completed}/{launchState.checklist.length} complete</h2>
          </div>
          <a href="/admin" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
            Open admin
          </a>
        </div>

        <div className="mt-6 grid gap-3">
          {launchState.checklist.map((item) => (
            <div key={item.step} className="flex gap-3 rounded-xl border border-border bg-background p-4">
              <CheckCircle2 className={item.completed ? "mt-0.5 h-5 w-5 text-emerald-600" : "mt-0.5 h-5 w-5 text-foreground-3"} aria-hidden />
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-foreground-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
