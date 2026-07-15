"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { BellRing, CheckCircle2, ClipboardCheck, Code2, Globe2, Loader2, Palette, Upload } from "lucide-react";
import type { LaunchChecklistStep, WorkspaceChecklistItem, WorkspaceLaunchState } from "@/lib/enterprise/types";

type OnboardingWizardProps = {
  launchState: WorkspaceLaunchState;
};

type Notice = {
  tone: "success" | "error" | "info";
  message: string;
};

const stepOrder: LaunchChecklistStep[] = [
  "knowledge_source",
  "embeddings_generated",
  "brand_disclosure",
  "escalation_owner",
  "domain_verified",
  "widget_installed",
  "golden_questions",
  "monitoring_enabled",
];

export function OnboardingWizard({ launchState }: OnboardingWizardProps) {
  const [checklist, setChecklist] = useState(launchState.checklist);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [domainChallenge, setDomainChallenge] = useState<string | null>(null);
  const [goldenSummary, setGoldenSummary] = useState<{ passed: number; total: number; passRate: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const completed = checklist.filter((item) => item.completed).length;
  const workspace = launchState.workspace;
  const widgetSnippet = `<script src="${typeof window === "undefined" ? "https://supportpilot-demo.vercel.app" : window.location.origin}/widget.js" data-id="${workspace.widgetKey}" data-theme="warm" async></script>`;

  const checklistByStep = useMemo(() => new Map(checklist.map((item) => [item.step, item])), [checklist]);

  function runAction(label: string, action: () => Promise<void>) {
    setNotice(null);
    setPendingAction(label);
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        setNotice({ tone: "error", message: error instanceof Error ? error.message : "Action failed" });
      } finally {
        setPendingAction(null);
      }
    });
  }

  async function completeStep(step: LaunchChecklistStep, message?: string) {
    const response = await fetch(`/api/onboarding/steps/${encodeURIComponent(step)}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? `Could not complete ${step}`);
    if (payload.checklist) setChecklist(payload.checklist);
    setNotice({ tone: "success", message: message ?? "Launch step completed." });
  }

  function onCreateWorkspace(formData: FormData) {
    runAction("workspace", async () => {
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
      if (!response.ok) throw new Error(payload.error ?? "Could not create workspace");
      window.location.assign(payload.redirectTo ?? "/onboarding");
    });
  }

  function onUploadKnowledge(formData: FormData) {
    runAction("knowledge", async () => {
      const body = new FormData();
      body.set("workspaceId", workspace.id);
      body.set("title", String(formData.get("knowledge_title") || "Onboarding source"));
      body.set("sourceType", "onboarding");
      body.set("content", String(formData.get("knowledge_content") || ""));
      const response = await fetch("/api/knowledge/upload", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not upload knowledge");
      await completeStep("knowledge_source", "Approved source added.");
      if (Number(payload.chunks ?? 0) > 0 || payload.job?.status === "succeeded") {
        await completeStep("embeddings_generated", "Source chunks and embeddings are ready.");
      }
    });
  }

  function onSaveBrand(formData: FormData) {
    runAction("brand", async () => {
      const response = await fetch(`/api/workspaces/${encodeURIComponent(workspace.id)}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspace.name,
          botName: formData.get("bot_name"),
          brandColor: formData.get("brand_color"),
          welcomeMessage: formData.get("welcome_message"),
          escalationEmail: formData.get("escalation_email"),
          calendlyUrl: workspace.calendlyUrl || "",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not save brand settings");
      await completeStep("brand_disclosure", "Brand, assistant copy, and disclosure are configured.");
      await completeStep("escalation_owner", "Escalation owner is configured.");
    });
  }

  function onAddDomain(formData: FormData) {
    runAction("domain", async () => {
      const domain = String(formData.get("domain") || "").trim();
      if (!domain) {
        await completeStep("domain_verified", "Existing verified domain confirmed.");
        return;
      }
      const response = await fetch(`/api/workspaces/${encodeURIComponent(workspace.id)}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not add domain");
      setDomainChallenge(`${payload.verification?.record ?? "_supportpilot"} TXT ${payload.verification?.value ?? "legacy verified domain"}`);
      if (payload.domain?.status === "verified") {
        await completeStep("domain_verified", "Widget domain is verified.");
      } else {
        setNotice({ tone: "info", message: "Domain added. Add the DNS record, then verify it from Settings." });
      }
    });
  }

  function onConfirmWidgetInstalled() {
    runAction("widget", async () => {
      await navigator.clipboard?.writeText(widgetSnippet).catch(() => null);
      await completeStep("widget_installed", "Widget install marked complete.");
    });
  }

  function onRunGoldenQuestions() {
    runAction("golden", async () => {
      const response = await fetch("/api/onboarding/golden-questions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Golden questions did not pass");
      if (payload.checklist) setChecklist(payload.checklist);
      setGoldenSummary({
        passed: payload.summary?.passed ?? 0,
        total: payload.summary?.total ?? 0,
        passRate: payload.summary?.passRate ?? 0,
      });
      setNotice({ tone: "success", message: "Golden questions passed and launch gate is complete." });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Step 1</p>
        <h2 className="mt-2 text-2xl font-semibold">Create your production workspace</h2>
        <p className="mt-2 text-sm text-foreground-2">
          This creates the organization, workspace, owner membership, widget config, onboarding session, policies, and launch checklist.
        </p>

        <form action={onCreateWorkspace} className="mt-6 space-y-4">
          <Field label="Organization name" id="org_name" defaultValue={workspace.name.replace(/ Support$/i, "")} required />
          <Field label="Workspace name" id="workspace_name" defaultValue={workspace.name} required />
          <Field label="Support or booking URL" id="support_url" type="url" defaultValue={workspace.calendlyUrl ?? ""} />
          <SubmitButton label="Save workspace" loadingLabel="Saving workspace" active={pendingAction === "workspace"} />
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Launch checklist</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {completed}/{checklist.length} complete
            </h2>
          </div>
          <a href="/admin" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
            Open admin
          </a>
        </div>

        <div className="mt-6 grid gap-3">
          {stepOrder.map((step) => {
            const item = checklistByStep.get(step);
            return item ? <ChecklistRow key={item.step} item={item} /> : null;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
        <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Launch steps</p>
            <h2 className="mt-2 text-2xl font-semibold">Finish the workspace setup gates</h2>
            <p className="mt-2 max-w-3xl text-sm text-foreground-2">
              Each panel maps to a launch checklist gate. Actions use the same APIs as the admin console so setup evidence lands in audit logs and product data.
            </p>
          </div>
          {notice ? (
            <p className={notice.tone === "error" ? "text-sm font-semibold text-red-600" : notice.tone === "success" ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-amber-700"}>
              {notice.message}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ActionCard icon={<Upload className="h-5 w-5" aria-hidden />} title="Knowledge source and chunks" status={checklistByStep.get("knowledge_source")?.completed && checklistByStep.get("embeddings_generated")?.completed ? "Complete" : "Needs setup"}>
            <form action={onUploadKnowledge} className="grid gap-3">
              <Field label="Source title" id="knowledge_title" defaultValue="Launch onboarding FAQ" required />
              <label className="text-sm font-medium" htmlFor="knowledge_content">
                Approved source content
              </label>
              <textarea
                id="knowledge_content"
                name="knowledge_content"
                defaultValue="SupportPilot answers from approved sources, cites retrieved chunks, and routes refund, legal, billing, policy, angry, or low-confidence cases to human approval."
                required
                className="min-h-28 rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
              />
              <SubmitButton label="Upload and chunk" loadingLabel="Uploading" active={pendingAction === "knowledge"} />
            </form>
          </ActionCard>

          <ActionCard icon={<Palette className="h-5 w-5" aria-hidden />} title="Brand, disclosure, and escalation owner" status={checklistByStep.get("brand_disclosure")?.completed && checklistByStep.get("escalation_owner")?.completed ? "Complete" : "Needs setup"}>
            <form action={onSaveBrand} className="grid gap-3">
              <Field label="Assistant name" id="bot_name" defaultValue={workspace.botName} required />
              <Field label="Brand color" id="brand_color" defaultValue={workspace.brandColor || "#fa8f1f"} pattern="^#[0-9a-fA-F]{6}$" required />
              <Field label="Escalation owner email" id="escalation_email" type="email" defaultValue={workspace.escalationEmail} required />
              <label className="text-sm font-medium" htmlFor="welcome_message">
                Welcome and AI disclosure
              </label>
              <textarea
                id="welcome_message"
                name="welcome_message"
                defaultValue={workspace.welcomeMessage}
                required
                className="min-h-24 rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
              />
              <SubmitButton label="Save brand and owner" loadingLabel="Saving" active={pendingAction === "brand"} />
            </form>
          </ActionCard>

          <ActionCard icon={<Globe2 className="h-5 w-5" aria-hidden />} title="Widget domain verification" status={checklistByStep.get("domain_verified")?.completed ? "Complete" : "Needs DNS"}>
            <form action={onAddDomain} className="grid gap-3">
              <Field label="Customer site domain" id="domain" placeholder={launchState.domains.find((domain) => domain.status === "verified")?.domain ?? "support.example.com"} />
              {domainChallenge ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 font-mono text-xs text-amber-900">{domainChallenge}</p> : null}
              <div className="flex flex-wrap gap-2">
                <SubmitButton label="Add domain" loadingLabel="Adding domain" active={pendingAction === "domain"} />
                <button type="button" onClick={() => runAction("domain", () => completeStep("domain_verified", "Existing verified domain confirmed."))} className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted">
                  Confirm existing verified domain
                </button>
              </div>
            </form>
          </ActionCard>

          <ActionCard icon={<Code2 className="h-5 w-5" aria-hidden />} title="Widget installation" status={checklistByStep.get("widget_installed")?.completed ? "Complete" : "Needs install"}>
            <div className="grid gap-3">
              <pre className="overflow-x-auto rounded-xl border border-border bg-background p-3 text-xs text-foreground-2">{widgetSnippet}</pre>
              <button type="button" onClick={onConfirmWidgetInstalled} disabled={pending && pendingAction === "widget"} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60">
                {pendingAction === "widget" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Copy snippet and mark installed
              </button>
            </div>
          </ActionCard>

          <ActionCard icon={<ClipboardCheck className="h-5 w-5" aria-hidden />} title="Golden questions" status={checklistByStep.get("golden_questions")?.completed ? "Complete" : "Needs eval"}>
            <div className="grid gap-3">
              <div className="grid gap-2">
                {launchState.goldenQuestions.slice(0, 5).map((question) => (
                  <div key={question.id} className="rounded-xl border border-border bg-background p-3 text-sm">
                    <p className="font-semibold">{question.question}</p>
                    <p className="mt-1 text-xs text-foreground-2">Expected: {question.expectedSources.join(", ")}</p>
                  </div>
                ))}
              </div>
              {goldenSummary ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  {goldenSummary.passed}/{goldenSummary.total} passed ({Math.round(goldenSummary.passRate * 100)}%)
                </p>
              ) : null}
              <button type="button" onClick={onRunGoldenQuestions} disabled={pending && pendingAction === "golden"} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60">
                {pendingAction === "golden" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Run golden eval
              </button>
            </div>
          </ActionCard>

          <ActionCard icon={<BellRing className="h-5 w-5" aria-hidden />} title="Monitoring readiness" status={checklistByStep.get("monitoring_enabled")?.completed ? "Complete" : "Needs confirmation"}>
            <div className="grid gap-3 text-sm text-foreground-2">
              <p>Confirm `/api/health`, Sentry DSN, rate-limit store, worker secrets, and billing webhook checks are monitored before launch.</p>
              <a href="/api/health" className="font-semibold text-accent">Open deployment health endpoint</a>
              <button type="button" onClick={() => runAction("monitoring", () => completeStep("monitoring_enabled", "Monitoring readiness confirmed."))} className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg">
                Mark monitoring enabled
              </button>
            </div>
          </ActionCard>
        </div>
      </section>
    </div>
  );
}

function ChecklistRow({ item }: { item: WorkspaceChecklistItem }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background p-4">
      <CheckCircle2 className={item.completed ? "mt-0.5 h-5 w-5 text-emerald-600" : "mt-0.5 h-5 w-5 text-foreground-3"} aria-hidden />
      <div>
        <p className="font-semibold">{item.label}</p>
        <p className="mt-1 text-sm text-foreground-2">{item.description}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, status, children }: { icon: ReactNode; title: string; status: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-accent">{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground-2">{status}</span>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  id,
  type = "text",
  defaultValue,
  placeholder,
  pattern,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  pattern?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        pattern={pattern}
        required={required}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function SubmitButton({ label, loadingLabel, active }: { label: string; loadingLabel: string; active: boolean }) {
  return (
    <button
      type="submit"
      disabled={active}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-60"
    >
      {active ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {active ? loadingLabel : label}
    </button>
  );
}
