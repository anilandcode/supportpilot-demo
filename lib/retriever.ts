import { promises as fs } from "fs";
import path from "path";
import { DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import { DEFAULT_KNOWLEDGE_FILES, type KnowledgeFile } from "@/lib/knowledge";
import { retrieveEnterpriseChunks } from "@/lib/rag/retrieval";
import { hasSupabaseAdminEnv } from "@/lib/supabase/config";
import { theme } from "@/lib/theme";

export type Chunk = {
  text: string;
  source: string;
  url?: string;
  score: number;
};

export interface Retriever {
  retrieve(query: string, k?: number): Promise<Chunk[]>;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "the",
  "to",
  "we",
  "what",
  "when",
  "where",
  "with",
  "you",
  "your",
]);

let knowledgeCache: KnowledgeFile[] | null = null;

async function readKnowledgeFiles(): Promise<KnowledgeFile[]> {
  try {
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true });
    const supported = entries
      .filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (supported.length === 0) return DEFAULT_KNOWLEDGE_FILES;

    return Promise.all(
      supported.map(async (entry) => ({
        filename: entry.name,
        content: await fs.readFile(path.join(KNOWLEDGE_DIR, entry.name), "utf8"),
      }))
    );
  } catch {
    return DEFAULT_KNOWLEDGE_FILES;
  }
}

async function getKnowledgeFiles(): Promise<KnowledgeFile[]> {
  knowledgeCache ??= await readKnowledgeFiles();
  return knowledgeCache;
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function splitMarkdown(file: KnowledgeFile): Chunk[] {
  const lines = file.content.split(/\r?\n/);
  const chunks: Chunk[] = [];
  let heading = file.filename.replace(/\.(md|txt)$/i, "");
  let buffer: string[] = [];

  function flush() {
    const text = buffer.join("\n").trim();
    if (!text) return;
    chunks.push({
      text,
      source: `${file.filename}#${heading}`,
      score: 0,
    });
    buffer = [];
  }

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.+)$/.exec(line);
    if (match) {
      flush();
      heading = match[2].trim();
      buffer.push(line);
    } else {
      buffer.push(line);
    }
  }

  flush();
  return chunks;
}

function scoreChunk(queryTokens: string[], chunk: Chunk): number {
  if (queryTokens.length === 0) return 0;

  const haystack = `${chunk.source}\n${chunk.text}`.toLowerCase();
  let score = 0;

  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
    if (chunk.source.toLowerCase().includes(token)) score += 1.5;
  }

  return Number((score / queryTokens.length).toFixed(3));
}

export class LiteRetriever implements Retriever {
  async retrieve(query: string, k = 4): Promise<Chunk[]> {
    const files = await getKnowledgeFiles();
    const queryTokens = tokenize(query);
    const chunks = files.flatMap(splitMarkdown);
    const scored = chunks
      .map((chunk) => ({ ...chunk, score: scoreChunk(queryTokens, chunk) }))
      .sort((a, b) => b.score - a.score);

    const matches = scored.filter((chunk) => chunk.score > 0);
    return (matches.length > 0 ? matches : scored).slice(0, k);
  }
}

export class EnterpriseRetriever implements Retriever {
  private readonly fallback = new LiteRetriever();

  constructor(private readonly workspaceId = DEMO_WORKSPACE_ID) {}

  async retrieve(query: string, k = 5): Promise<Chunk[]> {
    if (!hasSupabaseAdminEnv()) {
      const enterpriseChunks = await retrieveEnterpriseChunks(query, k, this.workspaceId);
      if (enterpriseChunks.length > 0) {
        return enterpriseChunks.map((chunk) => ({
          text: chunk.content,
          source: `${chunk.source}#${chunk.heading}`,
          score: chunk.score ?? 0,
        }));
      }
      return this.fallback.retrieve(query, k);
    }

    const enterpriseChunks = await retrieveEnterpriseChunks(query, k, this.workspaceId);
    return enterpriseChunks.map((chunk) => ({
      text: chunk.content,
      source: `${chunk.source}#${chunk.heading}`,
      score: chunk.score ?? 0,
    }));
  }
}

export function getRetriever(workspaceId = DEMO_WORKSPACE_ID): Retriever {
  const tier = theme.tier as "lite" | "enterprise";
  return tier === "enterprise" ? new EnterpriseRetriever(workspaceId) : new LiteRetriever();
}

export function formatContext(chunks: Chunk[]): string {
  return chunks
    .map((chunk, index) => {
      return `### Source ${index + 1}: ${chunk.source}\nScore: ${chunk.score}\n${chunk.text}`;
    })
    .join("\n\n");
}

export function hasUsefulContext(chunks: Chunk[]): boolean {
  return chunks.some((chunk) => chunk.score >= 0.25);
}
