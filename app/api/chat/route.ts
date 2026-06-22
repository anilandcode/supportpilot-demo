import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isTextUIPart,
  streamText,
  type UIMessage,
} from "ai";
import { captureProductEvent } from "@/lib/analytics/events";
import { estimateTokenCount, selectModelRoute } from "@/lib/ai/model-router";
import { getLanguageModel, getModelReadiness } from "@/lib/generation";
import { appendAuditLog, appendSecurityEvent, createAiRun, createModelRouteLog, getWorkspace, isOriginAllowed, recordUsageEvent } from "@/lib/db/support";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRetriever, hasUsefulContext, type Chunk } from "@/lib/retriever";
import { previewRedactedText } from "@/lib/security/redaction";
import { sanitizeAssistantText } from "@/lib/security/markdown";
import { getWidgetSessionSecret, verifySignedWidgetSession } from "@/lib/security/widget-session";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { theme } from "@/lib/theme";
import type { ChatMetadata, Citation } from "@/lib/types";

export const runtime = "nodejs";

type SupportUIMessage = UIMessage<ChatMetadata>;

function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "local-demo";
}

function getTextContent(message: UIMessage): string {
  return message.parts.filter(isTextUIPart).map((part) => part.text).join("");
}

function toCitations(chunks: Chunk[]): Citation[] {
  return chunks.map((chunk) => ({
    source: chunk.source,
    url: chunk.url,
    score: chunk.score,
  }));
}

async function logChatRun(input: {
  tenantId: string;
  workspaceId: string;
  question: string;
  response: string;
  answered: boolean;
  escalated: boolean;
  rateLimited: boolean;
  citations: Citation[];
  latencyMs?: number;
}) {
  const redactedPrompt = previewRedactedText(input.question);
  const route = selectModelRoute({
    task: "chat",
    confidence: input.answered ? 0.84 : 0.45,
    riskLevel: input.escalated ? "medium" : "low",
    riskFlags: input.rateLimited ? ["rate_limited"] : input.escalated ? ["low_confidence"] : [],
    hasLocalEndpoint: Boolean(process.env.LOCAL_MODEL_ENDPOINT),
  });
  const inputTokens = estimateTokenCount(input.question);
  const outputTokens = estimateTokenCount(input.response);
  const run = await createAiRun({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    ticketId: null,
    userId: null,
    prompt: redactedPrompt.text,
    promptHash: redactedPrompt.hash,
    redactedPromptPreview: redactedPrompt.text,
    response: sanitizeAssistantText(input.response),
    model: route.model,
    provider: route.provider,
    modelRoute: route.route,
    latencyMs: input.latencyMs ?? 0,
    inputTokens,
    outputTokens,
    costEstimateUsd: route.estimatedCostUsd,
    confidence: input.answered ? 0.84 : 0.45,
    retrievalScore: input.citations[0]?.score ?? 0,
    generationScore: input.answered ? 0.86 : 0.42,
    policyRiskScore: input.escalated ? 0.58 : 0.18,
    groundingStatus: input.answered ? "pass" : "needs_review",
    groundingScore: input.answered ? 0.84 : 0.44,
    approvalStatus: input.escalated ? "escalated" : "approved",
    escalationReason: input.escalated ? "Customer chat requires human follow-up" : null,
    riskFlags: input.rateLimited ? ["rate_limited"] : input.escalated ? ["low_confidence"] : [],
    sources: input.citations.map((citation) => ({
      source: citation.source,
      score: citation.score,
    })),
    rationale: input.answered ? "Answered from retrieved approved support knowledge." : "Could not answer confidently from retrieved knowledge.",
  });
  await createModelRouteLog({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    aiRunId: run.id,
    route: route.route,
    task: route.task,
    provider: route.provider,
    model: route.model,
    latencyMs: input.latencyMs ?? 0,
    inputTokens,
    outputTokens,
    estimatedCostUsd: route.estimatedCostUsd,
    confidence: run.confidence,
    reason: route.reason,
  });

  await recordUsageEvent({
    workspaceId: input.workspaceId,
    eventType: input.escalated ? "chat.escalated" : "chat.answered",
    metadata: { aiRunId: run.id, answered: input.answered, rateLimited: input.rateLimited },
  });
  await captureProductEvent({
    workspaceId: input.workspaceId,
    event: input.escalated ? "chat.escalated" : "chat.answered",
    properties: { ai_run_id: run.id, answered: input.answered, rate_limited: input.rateLimited },
  });
  await appendAuditLog({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    ticketId: null,
    userId: null,
    action: "chat.completed",
    details: { aiRunId: run.id, answered: input.answered, escalated: input.escalated, rateLimited: input.rateLimited },
  });
}

function containsSensitiveData(text: string): boolean {
  return /\b(password|passcode|secret|api[_\s-]?key|token|card number|cvv|ssn)\b/i.test(text);
}

function ipHash(req: Request) {
  return getClientKey(req).replace(/[^a-z0-9]/gi, "_").slice(0, 64);
}

function assistantResponse(text: string, metadata: ChatMetadata, status = 200): Response {
  const stream = createUIMessageStream<SupportUIMessage>({
    execute: ({ writer }) => {
      writer.write({
        type: "start",
        messageId: crypto.randomUUID(),
        messageMetadata: metadata,
      });
      writer.write({ type: "text-start", id: "answer" });
      writer.write({ type: "text-delta", id: "answer", delta: text });
      writer.write({ type: "text-end", id: "answer" });
      writer.write({
        type: "finish",
        finishReason: "stop",
        messageMetadata: metadata,
      });
    },
  });

  return createUIMessageStreamResponse({ stream, status });
}

function localAnswer(question: string, chunks: Chunk[], citations: Citation[]): string {
  if (!hasUsefulContext(chunks)) {
    return `I do not know from the docs I have. ${theme.escalation.label} can help with that.`;
  }

  const best = chunks[0];
  const sentences = best.text
    .replace(/^#+\s+.+$/gm, "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");

  return `${sentences} [Source: ${best.source}]\n\nI can go deeper if you want the exact setup, billing, or security details.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const requestedWorkspace =
      body.workspaceId ||
      body.workspace ||
      url.searchParams.get("workspaceId") ||
      url.searchParams.get("workspace") ||
      req.headers.get("x-supportpilot-workspace") ||
      undefined;
    const workspace = await getWorkspace(requestedWorkspace);
    const originAllowed = await isOriginAllowed(workspace.id, req.headers.get("origin"));
    if (!originAllowed) {
      await appendSecurityEvent({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        eventType: "blocked_origin",
        severity: "medium",
        origin: req.headers.get("origin"),
        ipHash: ipHash(req),
        details: { route: "/api/chat" },
      });
      return Response.json({ error: "origin is not allowed for this workspace" }, { status: 403 });
    }

    const sessionToken = body.widgetSession || body.session || url.searchParams.get("widgetSession") || req.headers.get("x-supportpilot-widget-session");
    const widgetSession = verifySignedWidgetSession(typeof sessionToken === "string" ? sessionToken : null, {
      workspaceId: workspace.id,
      origin: req.headers.get("origin"),
    });
    if (!widgetSession.ok && getWidgetSessionSecret()) {
      await appendSecurityEvent({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        eventType: "widget_session_invalid",
        severity: "high",
        origin: req.headers.get("origin"),
        ipHash: ipHash(req),
        details: { reason: widgetSession.reason },
      });
      return Response.json({ error: "widget session is invalid" }, { status: 403 });
    }

    const messages = body.messages as UIMessage[] | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages must be a non-empty array" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    const question = lastUserMessage ? getTextContent(lastUserMessage).trim() : "";

    if (!question) {
      return assistantResponse("Send me a question and I will check the docs.", {
        tier: theme.tier,
      });
    }

    await recordUsageEvent({
      workspaceId: workspace.id,
      eventType: "chat.message",
      metadata: { origin: req.headers.get("origin") },
    });

    const rate = checkRateLimit(getClientKey(req));
    if (!rate.allowed) {
      const retrySeconds = Math.max(Math.ceil((rate.resetAt - Date.now()) / 1000), 1);
      const text = `You have hit the demo rate limit. Try again in about ${retrySeconds} seconds, or ${theme.escalation.label.toLowerCase()} for help.`;
      const metadata = { tier: theme.tier, rateLimited: true, escalated: true } satisfies ChatMetadata;
      await logChatRun({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        question,
        response: text,
        answered: false,
        escalated: true,
        rateLimited: true,
        citations: [],
      });
      await appendSecurityEvent({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        eventType: "rate_limited",
        severity: "medium",
        origin: req.headers.get("origin"),
        ipHash: ipHash(req),
        details: { resetAt: rate.resetAt },
      });
      return assistantResponse(text, metadata);
    }

    if (containsSensitiveData(question)) {
      const text =
        "Please do not share passwords, payment details, tokens, or other sensitive credentials here. If you already shared one, rotate it and contact a human for account help.";
      const metadata = { tier: theme.tier, escalated: true } satisfies ChatMetadata;
      await logChatRun({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        question,
        response: text,
        answered: false,
        escalated: true,
        rateLimited: false,
        citations: [],
      });
      await appendSecurityEvent({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        eventType: "pii_redacted",
        severity: "high",
        origin: req.headers.get("origin"),
        ipHash: ipHash(req),
        details: { reason: "Sensitive credential or payment-like content detected." },
      });
      return assistantResponse(text, metadata);
    }

    const chunks = await getRetriever(workspace.id).retrieve(question, 5);
    const citations = toCitations(chunks);
    const usefulContext = hasUsefulContext(chunks);
    await recordUsageEvent({
      workspaceId: workspace.id,
      eventType: "rag_answer_generated",
      metadata: { usefulContext, citations: citations.length },
    });
    const metadata = {
      citations,
      tier: theme.tier,
      escalated: !usefulContext,
    } satisfies ChatMetadata;

    const readiness = getModelReadiness();
    if (!readiness.ready) {
      const response = sanitizeAssistantText(localAnswer(question, chunks, citations));
      await logChatRun({
        tenantId: workspace.tenantId,
        workspaceId: workspace.id,
        question,
        response,
        answered: usefulContext,
        escalated: !usefulContext,
        rateLimited: false,
        citations: usefulContext ? citations : [],
      });
      return assistantResponse(response, metadata);
    }

    const startedAt = Date.now();
    const result = streamText({
      model: getLanguageModel(),
      system: buildSystemPrompt(chunks),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 900,
      temperature: 0.35,
      onFinish: async ({ text }) => {
        await logChatRun({
          tenantId: workspace.tenantId,
          workspaceId: workspace.id,
          question,
          response: text,
          answered: usefulContext,
          escalated: !usefulContext,
          rateLimited: false,
          citations: usefulContext ? citations : [],
          latencyMs: Date.now() - startedAt,
        });
      },
    });

    return result.toUIMessageStreamResponse<SupportUIMessage>({
      sendSources: true,
      messageMetadata: ({ part }) => {
        if (part.type === "start" || part.type === "finish") return metadata;
        return undefined;
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return assistantResponse(
      `I could not answer that request. ${theme.escalation.label} can help while I recover.`,
      { tier: theme.tier, escalated: true },
      500
    );
  }
}
