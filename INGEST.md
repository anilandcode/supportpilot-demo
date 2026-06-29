# Enterprise Ingestion

SupportPilot supports Lite file retrieval and Enterprise Supabase RAG.

## Lite Path

Lite mode reads `/knowledge/*.md|*.txt`, chunks by heading, scores chunks against the query, and cites results as `filename#heading`. This path works without Supabase or model keys.

## Enterprise Upload Path

`POST /api/knowledge/upload` accepts:

- `.md`
- `.txt`
- `.pdf`
- pasted `content`
- optional `workspaceId`

The route:

1. Creates a `knowledge_ingestion_jobs` row with job status, attempts, source hash, payload metadata, and chunk counters.
2. Processes small pasted/text uploads inline.
3. Queues large files and PDFs through QStash when `QSTASH_TOKEN`, `NEXT_PUBLIC_APP_URL`, and `SUPPORTPILOT_INGESTION_WORKER_SECRET` are configured.
4. Falls back to synchronous local processing when the queue is not configured.
5. Extracts text and moves empty extraction results to `needs_review`.
6. Chunks content with `lib/rag/chunking.ts`.
7. Resolves the workspace from `workspaceId` or the seeded demo workspace.
8. Creates a `knowledge_docs` row with `tenant_id`, `workspace_id`, and `source_version`.
9. Creates approved `document_chunks` rows with `embedding_model`, `embedding_version`, and `content_hash`.
10. Stores deterministic embeddings for pgvector search.
11. Writes `knowledge.ingestion.queued`, `knowledge.ingestion.succeeded`, `knowledge.uploaded`, and usage events.

Job endpoints:

- `GET /api/knowledge/ingest/jobs?workspaceId=...` returns recent ingestion jobs for owner/admin/manager/agent roles.
- `POST /api/knowledge/ingest/jobs/[jobId]/run` runs or retries a job. Human users need workspace role access; QStash workers must send `x-supportpilot-worker-secret`.

## Query Path

`EnterpriseRetriever` calls `retrieveEnterpriseChunks()`:

1. Embed the query.
2. Call Supabase `match_document_chunks`.
3. Return approved chunks only.
4. Scope fallback chunk scoring to the active workspace.
5. Fall back to Lite retrieval only when no Enterprise chunks are available.

## Supabase Schema

The production schema lives in:

- `supabase/migrations/001_enterprise_supportpilot.sql`
- `supabase/migrations/002_light_mvp_productization.sql`

Key tables:

- `knowledge_docs`
- `document_chunks`
- `knowledge_ingestion_jobs`
- `ai_runs`
- `audit_logs`
- `organizations`
- `workspaces`
- `workspace_domains`
- `widget_configs`
- `usage_events`
- `approval_policies`

Key RPC:

```sql
public.match_document_chunks(query_embedding vector(768), match_count int, match_threshold float)
```

## Source Governance

- Only approved chunks are retrieved.
- Chunks are workspace-scoped and include a content hash for deduplication checks.
- Uploads are audit logged.
- AI prompts instruct the model to answer only from retrieved approved context.
- Low-confidence or risky drafts route to escalation.
- Managers approve high-risk replies before final customer messages are created.

## Future Hardening

- Store original uploaded files in Supabase Storage.
- Move original-file payloads to Supabase Storage object references instead of inline job payloads.
- Provision QStash in production and load-test large PDF/import queues.
- Replace deterministic demo embeddings with provider embeddings.
- Add source-level approval workflow before chunks become retrievable.
