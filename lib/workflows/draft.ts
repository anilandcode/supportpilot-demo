import { generateText } from "ai";
import { createAiRun, getTicket } from "@/lib/db/support";
import type { DraftResult } from "@/lib/enterprise/types";
import { getLanguageModel, getModelReadiness } from "@/lib/generation";
import { retrieveEnterpriseChunks } from "@/lib/rag/retrieval";
import { assessTicketRisk } from "@/lib/workflows/risk";

export async function draftTicketReply(ticketId: string, userId: string | null): Promise<DraftResult | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  const ticketContext = [
    ticket.subject,
    ticket.customer.company,
    ticket.customer.plan,
    ...ticket.messages.map((message) => message.body),
  ].join("\n");
  const chunks = await retrieveEnterpriseChunks(ticketContext, 5, ticket.workspaceId);
  const confidence = calculateConfidence(chunks);
  const risk = assessTicketRisk(ticket, ticketContext, confidence);
  const prompt = buildDraftPrompt(ticketContext, chunks.map((chunk) => `${chunk.source}#${chunk.heading}: ${chunk.content}`).join("\n\n"));
  const startedAt = Date.now();

  let response = localDraft(ticket.subject, chunks);
  const readiness = getModelReadiness();
  if (readiness.ready) {
    const result = await generateText({
      model: getLanguageModel(),
      system: "You draft support replies for human review. Answer only from supplied sources. Include citation labels inline.",
      prompt,
      temperature: 0.25,
      maxOutputTokens: 700,
    });
    response = result.text;
  }

  const aiRun = await createAiRun({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    ticketId: ticket.id,
    userId,
    prompt,
    response,
    model: readiness.ready ? process.env.GOOGLE_MODEL || process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || "configured-provider" : "demo-enterprise",
    latencyMs: Date.now() - startedAt,
    confidence,
    approvalStatus: risk.requiresManagerApproval ? "escalated" : "draft",
    escalationReason: risk.escalationReason,
    riskFlags: risk.flags,
    sources: chunks.map((chunk) => ({
      source: `${chunk.source}#${chunk.heading}`,
      docId: chunk.docId,
      chunkId: chunk.id,
      score: chunk.score,
    })),
    rationale: risk.flags.length > 0
      ? `Escalation flags: ${risk.flags.join(", ")}. Draft still cites approved sources for manager review.`
      : "High-confidence draft from approved knowledge chunks.",
  });

  return {
    aiRun,
    draft: aiRun.response,
    citations: aiRun.sources,
    confidence: aiRun.confidence,
    rationale: aiRun.rationale,
    riskFlags: aiRun.riskFlags,
    requiresManagerApproval: risk.requiresManagerApproval,
  };
}

function calculateConfidence(chunks: { score?: number }[]) {
  const bestScore = chunks[0]?.score ?? 0;
  return Number(Math.max(0.42, Math.min(0.94, 0.58 + bestScore * 0.34)).toFixed(2));
}

function localDraft(subject: string, chunks: { source: string; heading: string; content: string }[]) {
  const best = chunks[0];
  if (!best) {
    return "I do not have enough approved knowledge to answer this safely. Please escalate this ticket for human review.";
  }

  return `Thanks for reaching out about ${subject}. Based on our approved ${best.source} guidance, ${best.content} [Source: ${best.source}#${best.heading}]\n\nPlease review this draft before sending.`;
}

function buildDraftPrompt(ticketContext: string, sourceContext: string) {
  return `Ticket context:\n${ticketContext}\n\nApproved sources:\n${sourceContext}\n\nDraft a concise customer-facing reply. Include citations using [Source: source#heading]. Explain limitations if context is incomplete.`;
}
