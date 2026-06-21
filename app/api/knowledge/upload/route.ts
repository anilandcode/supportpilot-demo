import { PDFParse } from "pdf-parse";
import { hasEnterpriseRole } from "@/lib/auth/roles";
import { createKnowledgeDocument } from "@/lib/db/support";
import { chunkDocument } from "@/lib/rag/chunking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasEnterpriseRole(["support_agent", "support_manager", "admin"]))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const pastedContent = String(formData.get("content") || "");
  const workspaceId = String(formData.get("workspaceId") || "");

  const title = String(formData.get("title") || (file instanceof File ? file.name.replace(/\.[^.]+$/, "") : "Pasted knowledge"));
  const sourceType = normalizeSourceType(String(formData.get("sourceType") || "upload"));
  const content = file instanceof File ? await extractText(file) : pastedContent;

  if (!content.trim()) {
    return Response.json({ error: "document did not contain text" }, { status: 400 });
  }

  const chunks = chunkDocument({ docId: "pending", title, content });
  const doc = await createKnowledgeDocument({
    workspaceId: workspaceId || undefined,
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
