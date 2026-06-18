import { PDFParse } from "pdf-parse";
import { createKnowledgeDocument } from "@/lib/db/support";
import { chunkDocument } from "@/lib/rag/chunking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  const title = String(formData.get("title") || file.name.replace(/\.[^.]+$/, ""));
  const sourceType = String(formData.get("sourceType") || "upload") as "upload";
  const content = await extractText(file);

  if (!content.trim()) {
    return Response.json({ error: "uploaded document did not contain text" }, { status: 400 });
  }

  const chunks = chunkDocument({ docId: "pending", title, content });
  const doc = await createKnowledgeDocument({
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
