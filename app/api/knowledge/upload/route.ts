import { requireWorkspaceRole } from "@/lib/auth/api";
import { getBillingSnapshot, getPlanLimitBlock } from "@/lib/billing/plans";
import { appendSecurityEvent } from "@/lib/db/support";
import { createIngestionJob } from "@/lib/db/ingestion";
import { checkRateLimit, rateLimitHeaders, retryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");
  const pastedContent = String(formData.get("content") || "");
  const workspaceId = String(formData.get("workspaceId") || "");
  const asyncRequested = String(formData.get("async") || "").toLowerCase() === "true";
  const auth = await requireWorkspaceRole(workspaceId || undefined, ["owner", "admin", "manager", "agent"]);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const rate = await checkRateLimit({
    scope: "knowledge_upload",
    workspaceId: auth.workspaceId,
    key: auth.userId || clientKey(req),
  });
  if (!rate.allowed) {
    await appendSecurityEvent({
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId,
      eventType: "rate_limited",
      severity: "medium",
      origin: req.headers.get("origin"),
      ipHash: rate.keyHash,
      details: { route: "/api/knowledge/upload", scope: rate.scope, store: rate.store, resetAt: rate.resetAt, limit: rate.limit },
    });
    return Response.json(
      { error: "knowledge upload rate limit exceeded", retryAfter: retryAfterSeconds(rate) },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const title = String(formData.get("title") || (file instanceof File ? file.name.replace(/\.[^.]+$/, "") : "Pasted knowledge"));
  const sourceType = normalizeSourceType(String(formData.get("sourceType") || "upload"));
  const fileBase64 = file instanceof File ? Buffer.from(await file.arrayBuffer()).toString("base64") : undefined;
  const contentType = file instanceof File ? file.type || "text/plain" : "text/plain";
  const shouldQueue = asyncRequested || (file instanceof File && (file.size > 750_000 || file.type === "application/pdf" || /\.pdf$/i.test(file.name)));
  const content = file instanceof File ? undefined : pastedContent;

  if (!fileBase64 && !pastedContent.trim()) {
    return Response.json({ error: "document did not contain text" }, { status: 400 });
  }

  const billing = await getBillingSnapshot(auth.workspaceId);
  const planLimitBlock = getPlanLimitBlock(billing, ["sources", "documentChunks"]);
  if (planLimitBlock) {
    return Response.json({
      error: "plan limit reached",
      metric: planLimitBlock.key,
      label: planLimitBlock.label,
      used: planLimitBlock.used,
      limit: planLimitBlock.limit,
      plan: billing.plan.key,
    }, { status: 402 });
  }

  const { job, queued } = await createIngestionJob({
    workspaceId: auth.workspaceId,
    title,
    sourceType,
    content,
    fileBase64,
    contentType,
    filename: file instanceof File ? file.name : null,
    actorUserId: auth.userId,
    asyncRequested: shouldQueue,
  });

  return Response.json({
    job,
    queued,
    doc: job.docId ? { id: job.docId } : null,
    chunks: job.chunksEmbedded,
  }, { status: queued || job.status === "queued" ? 202 : job.status === "failed" ? 500 : 200 });
}

function normalizeSourceType(value: string) {
  if (value === "faq" || value === "product_doc" || value === "policy" || value === "onboarding" || value === "upload") {
    return value;
  }
  return "upload";
}

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "local-demo";
}
