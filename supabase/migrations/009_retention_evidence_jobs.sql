do $$ begin
  create type public.deletion_request_status as enum ('requested', 'verified', 'queued', 'processing', 'completed', 'rejected', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deletion_request_scope as enum ('customer', 'ticket', 'workspace', 'source_document');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.retention_job_type as enum ('conversation_cleanup', 'ai_log_cleanup', 'audit_export', 'deletion_request');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.retention_job_status as enum ('queued', 'running', 'succeeded', 'failed', 'needs_review');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.evidence_export_status as enum ('queued', 'running', 'succeeded', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  scope public.deletion_request_scope not null,
  subject_id text not null,
  requester_email text,
  actor_user_id uuid references public.users(id) on delete set null,
  status public.deletion_request_status not null default 'requested',
  reason text,
  verification_method text,
  verified_at timestamptz,
  queued_at timestamptz,
  completed_at timestamptz,
  audit_proof_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.retention_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_type public.retention_job_type not null,
  status public.retention_job_status not null default 'queued',
  deletion_request_id uuid references public.data_deletion_requests(id) on delete set null,
  retention_setting_id uuid references public.retention_settings(id) on delete set null,
  scope text not null,
  cutoff_at timestamptz,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  affected_counts jsonb not null default '{}'::jsonb,
  error text,
  audit_proof_hash text,
  started_at timestamptz,
  completed_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_evidence_exports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  export_type text not null,
  status public.evidence_export_status not null default 'queued',
  period_start timestamptz not null,
  period_end timestamptz not null,
  artifact_url text,
  artifact_hash text,
  item_counts jsonb not null default '{}'::jsonb,
  generated_by uuid references public.users(id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists data_deletion_requests_workspace_status_idx on public.data_deletion_requests(workspace_id, status, created_at desc);
create index if not exists data_deletion_requests_subject_idx on public.data_deletion_requests(workspace_id, scope, subject_id);
create index if not exists retention_jobs_workspace_status_idx on public.retention_jobs(workspace_id, status, created_at desc);
create index if not exists retention_jobs_next_run_idx on public.retention_jobs(status, next_run_at);
create index if not exists audit_evidence_exports_workspace_period_idx on public.audit_evidence_exports(workspace_id, period_start, period_end);

alter table public.data_deletion_requests enable row level security;
alter table public.retention_jobs enable row level security;
alter table public.audit_evidence_exports enable row level security;

drop policy if exists "workspace members read deletion requests" on public.data_deletion_requests;
drop policy if exists "workspace managers manage deletion requests" on public.data_deletion_requests;
drop policy if exists "workspace members read retention jobs" on public.retention_jobs;
drop policy if exists "workspace managers manage retention jobs" on public.retention_jobs;
drop policy if exists "workspace members read evidence exports" on public.audit_evidence_exports;
drop policy if exists "workspace managers manage evidence exports" on public.audit_evidence_exports;

create policy "workspace members read deletion requests" on public.data_deletion_requests
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage deletion requests" on public.data_deletion_requests
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));

create policy "workspace members read retention jobs" on public.retention_jobs
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage retention jobs" on public.retention_jobs
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));

create policy "workspace members read evidence exports" on public.audit_evidence_exports
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage evidence exports" on public.audit_evidence_exports
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));
