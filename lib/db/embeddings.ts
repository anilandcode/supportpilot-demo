import { appendAuditLog, getLocalState, getWorkspace } from "@/lib/db/support";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "@/lib/enterprise/demo-data";
import type { DocumentChunk, KnowledgeEmbeddingJob } from "@/lib/enterprise/types";
import { createTextEmbedding, embeddingContentHash, getEmbeddingConfig } from "@/lib/rag/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const localEmbeddingJobs: KnowledgeEmbeddingJob[] = [];

export async function listEmbeddingJobs(workspaceId = DEMO_WORKSPACE_ID): Promise<KnowledgeEmbeddingJob[]> {
  const workspace = await getWorkspace(workspaceId);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("knowledge_embedding_jobs")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) return data.map(mapEmbeddingJob);
  }
  return localEmbeddingJobs.filter((job) => job.workspaceId === workspace.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function runReembeddingJob(input: {
  workspaceId?: string;
  docId?: string | null;
  limit?: number;
  actorUserId?: string | null;
}): Promise<KnowledgeEmbeddingJob> {
  const workspace = await getWorkspace(input.workspaceId ?? DEMO_WORKSPACE_ID);
  const config = getEmbeddingConfig();
  const now = new Date().toISOString();
  const job: KnowledgeEmbeddingJob = {
    id: publicId("embjob"),
    tenantId: workspace.tenantId,
    workspaceId: workspace.id,
    docId: input.docId ?? null,
    status: "running",
    embeddingProvider: config.provider,
    embeddingModel: config.model,
    embeddingVersion: config.version,
    chunksTotal: 0,
    chunksEmbedded: 0,
    error: null,
    startedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  localEmbeddingJobs.unshift(job);
  await upsertJob(job);

  try {
    const chunks = await getChunksForReembedding(workspace.id, input.docId ?? null, input.limit ?? 100);
    job.chunksTotal = chunks.length;
    await upsertJob(job);

    for (const chunk of chunks) {
      const embedding = await createTextEmbedding(chunk.content);
      const updated: DocumentChunk = {
        ...chunk,
        embedding: embedding.embedding,
        embeddingProvider: embedding.provider,
        embeddingModel: embedding.model,
        embeddingVersion: embedding.version,
        embeddingDimensions: embedding.dimensions,
        embeddedAt: embedding.embeddedAt,
        sourceVersionId: chunk.sourceVersionId ?? `${chunk.docId}:v1`,
        contentHash: embeddingContentHash(chunk.content),
      };
      await updateChunkEmbedding(updated);
      job.chunksEmbedded += 1;
      job.embeddingProvider = embedding.provider;
      job.embeddingModel = embedding.model;
      job.embeddingVersion = embedding.version;
      job.updatedAt = new Date().toISOString();
      await upsertJob(job);
    }

    job.status = "succeeded";
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    await upsertJob(job);
    await appendAuditLog({
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      ticketId: null,
      userId: input.actorUserId ?? null,
      action: "knowledge.embeddings.reembedded",
      details: {
        docId: input.docId ?? null,
        chunksTotal: job.chunksTotal,
        chunksEmbedded: job.chunksEmbedded,
        embeddingProvider: job.embeddingProvider,
        embeddingModel: job.embeddingModel,
        embeddingVersion: job.embeddingVersion,
      },
    });
    return job;
  } catch (error) {
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "unknown embedding job error";
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    await upsertJob(job);
    return job;
  }
}

async function getChunksForReembedding(workspaceId: string, docId: string | null, limit: number) {
  const boundedLimit = Math.max(1, Math.min(limit, 500));
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase
      .from("document_chunks")
      .select("*")
      .eq("workspace_id", maybeUuid(workspaceId))
      .eq("approved", true)
      .order("chunk_index", { ascending: true })
      .limit(boundedLimit);
    if (docId) query = query.eq("doc_id", maybeUuid(docId));
    const { data, error } = await query;
    if (!error && data) return data.map(mapDocumentChunk);
  }

  return getLocalState().chunks
    .filter((chunk) => chunk.workspaceId === workspaceId && chunk.approved && (!docId || chunk.docId === docId))
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .slice(0, boundedLimit);
}

async function updateChunkEmbedding(chunk: DocumentChunk) {
  const local = getLocalState().chunks.find((item) => item.id === chunk.id);
  if (local) Object.assign(local, chunk);

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase
      .from("document_chunks")
      .update({
        embedding: chunk.embedding,
        embedding_provider: chunk.embeddingProvider,
        embedding_model: chunk.embeddingModel,
        embedding_version: chunk.embeddingVersion,
        embedding_dimensions: chunk.embeddingDimensions,
        embedded_at: chunk.embeddedAt,
        source_version_id: chunk.sourceVersionId,
        content_hash: chunk.contentHash,
      })
      .eq("id", maybeUuid(chunk.id));
  }
}

async function upsertJob(job: KnowledgeEmbeddingJob) {
  const local = localEmbeddingJobs.find((item) => item.id === job.id);
  if (local && local !== job) Object.assign(local, job);
  const supabase = createSupabaseAdminClient();
  if (supabase) await supabase.from("knowledge_embedding_jobs").upsert(toEmbeddingJobRow(job), { onConflict: "id" });
}

function mapEmbeddingJob(row: any): KnowledgeEmbeddingJob {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    docId: row.doc_id ?? null,
    status: row.status ?? "queued",
    embeddingProvider: row.embedding_provider ?? "deterministic",
    embeddingModel: row.embedding_model ?? "deterministic-hash",
    embeddingVersion: row.embedding_version ?? "v1",
    chunksTotal: Number(row.chunks_total ?? 0),
    chunksEmbedded: Number(row.chunks_embedded ?? 0),
    error: row.error ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDocumentChunk(row: any): DocumentChunk {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? DEMO_TENANT_ID,
    workspaceId: row.workspace_id ?? DEMO_WORKSPACE_ID,
    docId: row.doc_id,
    source: row.source,
    heading: row.heading,
    content: row.content,
    chunkIndex: Number(row.chunk_index ?? 0),
    approved: row.approved ?? true,
    embeddingProvider: row.embedding_provider ?? "deterministic",
    embeddingModel: row.embedding_model ?? "deterministic-hash",
    embeddingVersion: row.embedding_version ?? "v1",
    embeddingDimensions: Number(row.embedding_dimensions ?? 768),
    embeddedAt: row.embedded_at ?? null,
    sourceVersionId: row.source_version_id ?? null,
    contentHash: row.content_hash ?? embeddingContentHash(row.content ?? ""),
  };
}

function toEmbeddingJobRow(job: KnowledgeEmbeddingJob) {
  return {
    id: maybeUuid(job.id) ?? crypto.randomUUID(),
    tenant_id: maybeUuid(job.tenantId),
    workspace_id: maybeUuid(job.workspaceId),
    doc_id: maybeUuid(job.docId),
    status: job.status,
    embedding_provider: job.embeddingProvider,
    embedding_model: job.embeddingModel,
    embedding_version: job.embeddingVersion,
    chunks_total: job.chunksTotal,
    chunks_embedded: job.chunksEmbedded,
    error: job.error,
    started_at: job.startedAt,
    completed_at: job.completedAt,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function publicId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function maybeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
