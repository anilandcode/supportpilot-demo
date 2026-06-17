# Enterprise Ingestion Path

The current app is retrieval-interface ready. `EnterpriseRetriever` in `lib/retriever.ts` is the boundary for pgvector/Supabase or Pinecone.

## Target pipeline

1. Collect sources:
   - Markdown and text files
   - PDFs
   - Notion exports
   - simple site crawl pages
2. Normalize content to Markdown text.
3. Chunk by heading and token budget.
4. Embed chunks with the selected embedding model.
5. Upsert into Supabase pgvector with metadata:
   - `source`
   - `url`
   - `heading`
   - `chunk_index`
   - `checksum`
6. Query top-k chunks from `EnterpriseRetriever.retrieve(query, k)`.
7. Optionally rerank before building the model context.

## Suggested table

```sql
create extension if not exists vector;

create table supportpilot_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  url text,
  heading text,
  chunk_index integer not null,
  content text not null,
  checksum text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index supportpilot_chunks_embedding_idx
on supportpilot_chunks using ivfflat (embedding vector_cosine_ops);
```

## Current implementation status

- UI is already retriever-agnostic.
- Citations are already rendered from returned chunks.
- Analytics and feedback endpoints are already present.
- Lite mode reads `/knowledge` and works without a database.
- Enterprise mode falls back to Lite until the Supabase query/upsert code is connected.
