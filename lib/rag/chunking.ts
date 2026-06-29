import type { DocumentChunk } from "@/lib/enterprise/types";

const MAX_CHARS = 900;
export type PendingDocumentChunk = Omit<
  DocumentChunk,
  | "id"
  | "tenantId"
  | "workspaceId"
  | "docId"
  | "approved"
  | "embeddingModel"
  | "embeddingVersion"
  | "embeddingProvider"
  | "embeddingDimensions"
  | "embeddedAt"
  | "sourceVersionId"
  | "contentHash"
  | "embedding"
>;

export function chunkDocument(input: {
  docId: string;
  title: string;
  content: string;
}): PendingDocumentChunk[] {
  const sections = splitSections(input.content);
  const chunks: PendingDocumentChunk[] = [];

  for (const section of sections) {
    const paragraphs = section.content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
    let buffer = "";

    for (const paragraph of paragraphs) {
      if ((buffer + "\n\n" + paragraph).length > MAX_CHARS && buffer) {
        chunks.push(makeChunk(input.title, section.heading, buffer, chunks.length));
        buffer = paragraph;
      } else {
        buffer = [buffer, paragraph].filter(Boolean).join("\n\n");
      }
    }

    if (buffer) chunks.push(makeChunk(input.title, section.heading, buffer, chunks.length));
  }

  return chunks.length > 0 ? chunks : [makeChunk(input.title, input.title, input.content.slice(0, MAX_CHARS), 0)];
}

function splitSections(content: string) {
  const lines = content.split(/\r?\n/);
  const sections: { heading: string; content: string }[] = [];
  let heading = "Overview";
  let buffer: string[] = [];

  function flush() {
    const sectionContent = buffer.join("\n").trim();
    if (sectionContent) sections.push({ heading, content: sectionContent });
    buffer = [];
  }

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.+)$/.exec(line);
    if (match) {
      flush();
      heading = match[2].trim();
    } else {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

function makeChunk(source: string, heading: string, content: string, chunkIndex: number) {
  return {
    source,
    heading,
    content,
    chunkIndex,
    score: 0,
  };
}
