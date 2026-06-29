do $$ begin
  create type public.embedding_job_status as enum ('queued', 'running', 'succeeded', 'failed');
exception when duplicate_object then null;
end $$;

alter table public.document_chunks add column if not exists embedding_provider text not null default 'deterministic';
alter table public.document_chunks add column if not exists embedding_dimensions integer not null default 768;
alter table public.document_chunks add column if not exists embedded_at timestamptz;
alter table public.document_chunks add column if not exists source_version_id text;

update public.document_chunks
set
  embedding_provider = case
    when embedding_model = 'deterministic-hash' then 'deterministic'
    else coalesce(nullif(embedding_provider, ''), 'managed')
  end,
  embedding_dimensions = coalesce(nullif(embedding_dimensions, 0), 768),
  embedded_at = coalesce(embedded_at, created_at),
  source_version_id = coalesce(source_version_id, doc_id::text || ':v1')
where embedded_at is null or source_version_id is null;

create table if not exists public.knowledge_embedding_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  doc_id uuid references public.knowledge_docs(id) on delete cascade,
  status public.embedding_job_status not null default 'queued',
  embedding_provider text not null default 'deterministic',
  embedding_model text not null default 'deterministic-hash',
  embedding_version text not null default 'v1',
  chunks_total integer not null default 0,
  chunks_embedded integer not null default 0,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists document_chunks_embedding_version_idx on public.document_chunks(workspace_id, embedding_provider, embedding_model, embedding_version);
create index if not exists document_chunks_source_version_idx on public.document_chunks(workspace_id, source_version_id);
create index if not exists knowledge_embedding_jobs_workspace_idx on public.knowledge_embedding_jobs(workspace_id, status, created_at desc);

drop function if exists public.match_document_chunks(vector(768), int, float);
drop function if exists public.match_document_chunks(vector(768), int, float, uuid);
create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.1,
  target_workspace_id uuid default null
)
returns table (
  id uuid,
  tenant_id uuid,
  workspace_id uuid,
  doc_id uuid,
  source text,
  heading text,
  content text,
  chunk_index integer,
  embedding_model text,
  embedding_version text,
  embedding_provider text,
  embedding_dimensions integer,
  embedded_at timestamptz,
  source_version_id text,
  content_hash text,
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.tenant_id,
    dc.workspace_id,
    dc.doc_id,
    dc.source,
    dc.heading,
    dc.content,
    dc.chunk_index,
    dc.embedding_model,
    dc.embedding_version,
    dc.embedding_provider,
    dc.embedding_dimensions,
    dc.embedded_at,
    dc.source_version_id,
    dc.content_hash,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.approved = true
    and dc.embedding is not null
    and (target_workspace_id is null or dc.workspace_id = target_workspace_id)
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.knowledge_embedding_jobs enable row level security;

drop policy if exists "workspace managers read embedding jobs" on public.knowledge_embedding_jobs;
drop policy if exists "workspace managers manage embedding jobs" on public.knowledge_embedding_jobs;

create policy "workspace managers read embedding jobs" on public.knowledge_embedding_jobs
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage embedding jobs" on public.knowledge_embedding_jobs
for all using (public.can_manage_workspace(workspace_id))
with check (public.can_manage_workspace(workspace_id));
