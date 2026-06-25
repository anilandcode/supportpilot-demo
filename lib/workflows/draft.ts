import { generateText } from "ai";
import {
  appendAgentRun,
  appendGroundingCheck,
  appendPolicyEvaluation,
  appendToolCall,
  createAiRun,
  createModelRouteLog,
  getTicket,
  recordUsageEvent,
} from "@/lib/db/support";
import { estimateTokenCount, selectModelRoute } from "@/lib/ai/model-router";
import type { DraftResult } from "@/lib/enterprise/types";
import { getLanguageModel, getModelReadiness } from "@/lib/generation";
import { retrieveEnterpriseChunks } from "@/lib/rag/retrieval";
import { previewRedactedText } from "@/lib/security/redaction";
import { sanitizeAssistantText } from "@/lib/security/markdown";
import { calculateConfidenceBreakdown } from "@/lib/workflows/confidence";
import { verifyGrounding } from "@/lib/workflows/grounding";
import { evaluatePolicy } from "@/lib/workflows/policy";
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
  const initialConfidence = calculateConfidenceBreakdown({
    bestRetrievalScore: chunks[0]?.score,
    citationCount: chunks.length,
    riskLevel: ticket.riskLevel,
  });
  const risk = assessTicketRisk(ticket, ticketContext, initialConfidence.overall);
  const confidenceBreakdown = calculateConfidenceBreakdown({
    bestRetrievalScore: chunks[0]?.score,
    citationCount: chunks.length,
    riskLevel: risk.riskLevel,
  });
  const confidence = confidenceBreakdown.overall;
  const policyDecision = evaluatePolicy({
    ticket,
    content: ticketContext,
    confidence,
    riskFlags: risk.flags,
    riskLevel: risk.riskLevel,
  });
  const routeDecision = selectModelRoute({
    task: "ticket_draft",
    confidence,
    riskLevel: policyDecision.riskLevel,
    riskFlags: policyDecision.reasons,
    hasLocalEndpoint: Boolean(process.env.LOCAL_MODEL_ENDPOINT),
  });
  const prompt = buildDraftPrompt(ticketContext, chunks.map((chunk) => `${chunk.source}#${chunk.heading}: ${chunk.content}`).join("\n\n"));
  const redactedPrompt = previewRedactedText(prompt, 420);
  const startedAt = Date.now();

  let response = localDraft(ticket.subject, chunks);
  const readiness = getModelReadiness();
  if (readiness.ready) {
    try {
      const result = await generateText({
        model: getLanguageModel(),
        system: "You draft support replies for human review. Answer only from supplied sources. Include citation labels inline.",
        prompt,
        temperature: 0.25,
        maxOutputTokens: 700,
      });
      response = result.text;
    } catch (err) {
      const reason = err instanceof Error ? err.name || err.message : "UnknownError";
      console.warn(`[draftTicketReply] Provider generation failed; using local fallback (${reason}).`);
    }
  }
  response = sanitizeAssistantText(response);

  const sources = chunks.map((chunk) => ({
    source: `${chunk.source}#${chunk.heading}`,
    docId: chunk.docId,
    chunkId: chunk.id,
    score: chunk.score,
  }));
  const groundingDraft = verifyGrounding({ response, sources });
  const latencyMs = Date.now() - startedAt;

  const aiRun = await createAiRun({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    ticketId: ticket.id,
    userId,
    prompt: redactedPrompt.text,
    promptHash: redactedPrompt.hash,
    redactedPromptPreview: redactedPrompt.text,
    response,
    model: routeDecision.model,
    provider: routeDecision.provider,
    modelRoute: routeDecision.route,
    latencyMs,
    inputTokens: estimateTokenCount(prompt),
    outputTokens: estimateTokenCount(response),
    costEstimateUsd: routeDecision.estimatedCostUsd,
    confidence,
    retrievalScore: confidenceBreakdown.retrievalScore,
    generationScore: confidenceBreakdown.generationScore,
    policyRiskScore: confidenceBreakdown.policyRiskScore,
    groundingStatus: groundingDraft.status,
    groundingScore: groundingDraft.score,
    approvalStatus: policyDecision.action === "answer" ? "draft" : "escalated",
    escalationReason: policyDecision.action === "answer" ? null : policyDecision.reasons.join(", "),
    riskFlags: policyDecision.reasons,
    sources,
    rationale: policyDecision.action === "answer"
      ? "High-confidence draft from approved knowledge chunks."
      : `Queued because ${policyDecision.reasons.join(", ")}. Draft cites approved sources for manager review.`,
  });
  const groundingCheck = await appendGroundingCheck({
    ...groundingDraft,
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    aiRunId: aiRun.id,
  });
  await appendPolicyEvaluation({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    aiRunId: aiRun.id,
    ...policyDecision,
  });
  await appendAgentRun({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    ticketId: ticket.id,
    aiRunId: aiRun.id,
    loopStep: "retrieve -> draft -> verify -> policy",
    outcome: policyDecision.action,
  });
  await appendToolCall({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    aiRunId: aiRun.id,
    toolName: "search_knowledge",
    input: { ticketId: ticket.id, chunks: chunks.length },
    outputSummary: `${chunks.length} approved source chunks retrieved.`,
    status: chunks.length > 0 ? "success" : "blocked",
  });
  await createModelRouteLog({
    tenantId: ticket.tenantId,
    workspaceId: ticket.workspaceId,
    aiRunId: aiRun.id,
    route: routeDecision.route,
    task: routeDecision.task,
    provider: routeDecision.provider,
    model: routeDecision.model,
    latencyMs,
    inputTokens: aiRun.inputTokens ?? 0,
    outputTokens: aiRun.outputTokens ?? 0,
    estimatedCostUsd: routeDecision.estimatedCostUsd,
    confidence,
    reason: routeDecision.reason,
  });
  if (policyDecision.action !== "answer") {
    await recordUsageEvent({
      workspaceId: ticket.workspaceId,
      eventType: "approval_requested",
      metadata: { aiRunId: aiRun.id, ticketId: ticket.id, reasons: policyDecision.reasons },
    });
  }

  return {
    aiRun,
    draft: aiRun.response,
    citations: aiRun.sources,
    confidence: aiRun.confidence,
    confidenceBreakdown,
    rationale: aiRun.rationale,
    riskFlags: aiRun.riskFlags,
    requiresManagerApproval: policyDecision.requiredRole === "manager",
    policyDecision,
    groundingCheck,
  };
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
