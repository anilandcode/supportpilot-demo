"use client";

import { useState } from "react";
import { Bot, Check, Edit3, FileWarning, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "@/components/enterprise/confidence-meter";
import { SourceDrawer } from "@/components/enterprise/source-drawer";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { DraftResult, TicketWithRelations } from "@/lib/enterprise/types";

type TicketAiPanelProps = {
  ticket: TicketWithRelations;
};

export function TicketAiPanel({ ticket }: TicketAiPanelProps) {
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);

  async function generateDraft() {
    setLoading(true);
    setDecision(null);
    const res = await fetch(`/api/tickets/${ticket.id}/draft`, { method: "POST" });
    const data = await res.json();
    setDraft(data);
    setText(data.draft ?? "");
    setLoading(false);
  }

  async function decide(nextDecision: "approved" | "edited" | "rejected" | "escalated") {
    if (!draft) return;
    if ((nextDecision === "rejected" || nextDecision === "escalated") && !window.confirm(`Confirm ${nextDecision.replace("_", " ")} for this AI draft?`)) {
      return;
    }
    setLoading(true);
    await fetch(`/api/ai-runs/${draft.aiRun.id}/decision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: nextDecision, finalResponse: text }),
    });
    setDecision(nextDecision);
    setLoading(false);
  }

  async function createMissingKnowledge() {
    if (!draft) return;
    await fetch("/api/knowledge/missing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: ticket.workspaceId,
        topic: ticket.subject,
        reason: "Agent flagged the generated draft as needing better source coverage.",
        sourceAiRunId: draft.aiRun.id,
      }),
    });
    setDecision("missing knowledge logged");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="font-semibold">AI reply assistant</h2>
        </div>
        {draft && <StatusBadge value={draft.aiRun.approvalStatus} />}
      </div>

      {!draft ? (
        <div className="mt-5">
          <p className="text-sm leading-relaxed text-foreground-2">
            Generate a cited draft from ticket history, customer metadata, and approved knowledge. The draft is never sent without human approval.
          </p>
          <Button onClick={generateDraft} disabled={loading} className="mt-4">
            Draft response
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 text-sm">
            <ConfidenceMeter breakdown={draft.confidenceBreakdown} />
            <div className="rounded-xl bg-surface p-3">
              <p className="text-xs text-foreground-3">Manager approval</p>
              <p className="mt-1 font-semibold">{draft.requiresManagerApproval ? `Required (${draft.policyDecision.requiredRole})` : "Not required"}</p>
              <p className="mt-1 text-xs text-foreground-3">Policy action: {draft.policyDecision.action.replace(/_/g, " ")}</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-48 w-full rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed focus:border-accent focus:outline-none"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-3">Why suggested</p>
            <p className="mt-1 text-sm text-foreground-2">{draft.rationale}</p>
          </div>

          <SourceDrawer sources={draft.citations} />

          {draft.riskFlags.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <Flag className="mr-2 inline h-4 w-4" aria-hidden />
              {draft.riskFlags.join(", ")}
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-3 text-sm text-foreground-2">
            Grounding: <span className="font-semibold text-foreground">{draft.groundingCheck.status.replace("_", " ")}</span> · {Math.round(draft.groundingCheck.score * 100)}% source coverage score.
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => decide("approved")} disabled={loading} size="sm">
              <Check className="h-4 w-4" aria-hidden />
              Approve
            </Button>
            <Button onClick={() => decide("edited")} disabled={loading} size="sm" variant="outline">
              <Edit3 className="h-4 w-4" aria-hidden />
              Save edit
            </Button>
            <Button onClick={() => decide("rejected")} disabled={loading} size="sm" variant="outline">
              <X className="h-4 w-4" aria-hidden />
              Reject
            </Button>
            <Button onClick={() => decide("escalated")} disabled={loading} size="sm" variant="outline">
              <Flag className="h-4 w-4" aria-hidden />
              Escalate
            </Button>
            <Button onClick={createMissingKnowledge} disabled={loading} size="sm" variant="ghost">
              <FileWarning className="h-4 w-4" aria-hidden />
              Source gap
            </Button>
          </div>

          {decision && <p className="text-sm font-medium text-accent">Decision logged: {decision.replace(/_/g, " ")}</p>}
        </div>
      )}
    </div>
  );
}
