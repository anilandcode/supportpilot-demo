import { PDFParse } from "pdf-parse";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { appendSecurityEvent, createKnowledgeDocument } from "@/lib/db/support";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import { chunkDocument } from "@/lib/rag/chunking";
import { checkRateLimit, rateLimitHeaders, retryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");
  const pastedContent = String(formData.get("content") || "");
  const workspaceId = String(formData.get("workspaceId") || "");
  const auth = await requireWorkspaceRole(workspaceId || DEMO_WORKSPACE_ID, ["owner", "admin", "manager", "agent"]);
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
  const content = file instanceof File ? await extractText(file) : pastedContent;

  if (!content.trim()) {
    return Response.json({ error: "document did not contain text" }, { status: 400 });
  }

  const chunks = chunkDocument({ docId: "pending", title, content });
  const doc = await createKnowledgeDocument({
    workspaceId: auth.workspaceId,
    title,
    sourceType,
    content,
    chunks,
  });

  return Response.json({
    doc,
    chunks: chunks.length,
  });
}

function normalizeSourceType(value: string) {
  if (value === "faq" || value === "product_doc" || value === "policy" || value === "onboarding" || value === "upload") {
    return value;
  }
  return "upload";
}

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  return file.text();
}

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "local-demo";
}
