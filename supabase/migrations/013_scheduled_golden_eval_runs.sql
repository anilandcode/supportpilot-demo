create table if not exists public.golden_eval_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null check (status in ('passed','failed')),
  total integer not null default 0,
  passed integer not null default 0,
  failed integer not null default 0,
  pass_rate numeric not null default 0,
  thresholds jsonb not null default '{}'::jsonb,
  cases jsonb not null default '[]'::jsonb,
  triggered_by text not null default 'manual' check (triggered_by in ('manual','scheduled','onboarding')),
  artifact_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists golden_eval_runs_workspace_idx on public.golden_eval_runs(workspace_id, created_at desc);
create index if not exists golden_eval_runs_status_idx on public.golden_eval_runs(workspace_id, status, created_at desc);

alter table public.golden_eval_runs enable row level security;

drop policy if exists "members read golden_eval_runs" on public.golden_eval_runs;
drop policy if exists "managers manage golden_eval_runs" on public.golden_eval_runs;

create policy "members read golden_eval_runs"
  on public.golden_eval_runs
  for select
  using (public.can_access_workspace(workspace_id));

create policy "managers manage golden_eval_runs"
  on public.golden_eval_runs
  for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));
