"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DomainForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus(null);

    const response = await fetch(`/api/workspaces/${workspaceId}/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: String(formData.get("domain") || "") }),
    });
    const data = await response.json();
    setStatus(response.ok ? `Added ${data.domain.domain}.` : data.error ?? "Domain add failed.");
    setLoading(false);
    if (response.ok) router.refresh();
  }

  return (
    <form action={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        name="domain"
        placeholder="docs.example.com"
        className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm"
      />
      <Button disabled={loading}>
        <Plus className="h-4 w-4" aria-hidden />
        {loading ? "Adding..." : "Add domain"}
      </Button>
      {status && <p className="self-center text-sm text-accent">{status}</p>}
    </form>
  );
}
