import { listDocumentChunks } from "@/lib/db/support";
import type { DocumentChunk } from "@/lib/enterprise/types";
import { createDeterministicEmbedding } from "@/lib/rag/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STOP_WORDS = new Set(["the", "and", "for", "with", "that", "this", "from", "your", "you", "are", "can", "does"]);

export async function retrieveEnterpriseChunks(query: string, k = 5): Promise<DocumentChunk[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: createDeterministicEmbedding(query),
      match_count: k,
      match_threshold: 0.1,
    });

    if (!error && data?.length) {
      return data.map((row: any) => ({
        id: row.id,
        docId: row.doc_id,
        source: row.source,
        heading: row.heading,
        content: row.content,
        chunkIndex: row.chunk_index,
        approved: true,
        score: row.similarity,
      }));
    }
  }

  const chunks = await listDocumentChunks();
  return scoreChunks(query, chunks).slice(0, k);
}

export function scoreChunks(query: string, chunks: DocumentChunk[]): DocumentChunk[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  return chunks
    .filter((chunk) => chunk.approved)
    .map((chunk) => {
      const haystack = `${chunk.source} ${chunk.heading} ${chunk.content}`.toLowerCase();
      const hits = tokens.reduce((count, token) => count + (haystack.includes(token) ? 1 : 0), 0);
      const score = tokens.length === 0 ? 0 : hits / tokens.length;
      return { ...chunk, score: Number(score.toFixed(3)) };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
