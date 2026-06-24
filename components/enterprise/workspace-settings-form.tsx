"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/enterprise/types";

export function WorkspaceSettingsForm({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus(null);

    const response = await fetch(`/api/workspaces/${workspace.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") || ""),
        botName: String(formData.get("botName") || ""),
        brandColor: String(formData.get("brandColor") || ""),
        welcomeMessage: String(formData.get("welcomeMessage") || ""),
        escalationEmail: String(formData.get("escalationEmail") || ""),
        calendlyUrl: String(formData.get("calendlyUrl") || ""),
      }),
    });
    const data = await response.json();
    setStatus(response.ok ? "Workspace settings saved." : data.error ?? "Settings update failed.");
    setLoading(false);
    if (response.ok) router.refresh();
  }

  return (
    <form action={submit} className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">Workspace identity</h2>
      <p className="mt-2 text-sm text-foreground-2">Branding, support handoff, and customer-facing bot copy for this workspace.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field name="name" label="Workspace name" defaultValue={workspace.name} />
        <Field name="botName" label="Bot name" defaultValue={workspace.botName} />
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-foreground-3">Brand color</span>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3">
            <input name="brandColor" type="color" defaultValue={workspace.brandColor} className="h-6 w-8 rounded border-0 bg-transparent p-0" />
            <span className="text-xs text-foreground-3">{workspace.brandColor}</span>
          </div>
        </label>
        <Field name="escalationEmail" label="Escalation email" defaultValue={workspace.escalationEmail} type="email" />
        <Field name="calendlyUrl" label="Calendly link" defaultValue={workspace.calendlyUrl ?? ""} className="md:col-span-2" />
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase text-foreground-3">Welcome message</span>
          <textarea
            name="welcomeMessage"
            defaultValue={workspace.welcomeMessage}
            className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button disabled={loading}>
          <Save className="h-4 w-4" aria-hidden />
          {loading ? "Saving..." : "Save settings"}
        </Button>
        {status && <p className="text-sm text-accent">{status}</p>}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  className = "",
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase text-foreground-3">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm" />
    </label>
  );
}
