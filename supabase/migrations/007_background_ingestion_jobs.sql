do $$ begin
  create type public.knowledge_ingestion_job_type as enum (
    'extract_pdf',
    'ingest_markdown',
    'ingest_text',
    'embed_chunks',
    'reembed_source',
    'run_golden_eval'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.knowledge_ingestion_job_status as enum (
    'queued',
    'running',
    'succeeded',
    'failed',
    'needs_review',
    'skipped'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.knowledge_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  doc_id uuid references public.knowledge_docs(id) on delete set null,
  job_type public.knowledge_ingestion_job_type not null,
  status public.knowledge_ingestion_job_status not null default 'queued',
  source_type text not null default 'upload',
  title text not null,
  content_type text,
  source_content_hash text not null,
  storage_url text,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  chunks_total integer not null default 0,
  chunks_embedded integer not null default 0,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_ingestion_jobs_workspace_status_idx on public.knowledge_ingestion_jobs(workspace_id, status, created_at desc);
create index if not exists knowledge_ingestion_jobs_hash_idx on public.knowledge_ingestion_jobs(workspace_id, source_content_hash);
create unique index if not exists knowledge_ingestion_jobs_success_hash_idx
  on public.knowledge_ingestion_jobs(workspace_id, source_content_hash)
  where status in ('succeeded', 'skipped');

alter table public.knowledge_ingestion_jobs enable row level security;

drop policy if exists "workspace members read ingestion jobs" on public.knowledge_ingestion_jobs;
drop policy if exists "workspace managers manage ingestion jobs" on public.knowledge_ingestion_jobs;

create policy "workspace members read ingestion jobs" on public.knowledge_ingestion_jobs
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage ingestion jobs" on public.knowledge_ingestion_jobs
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager','agent']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager','agent']::public.membership_role[]));
