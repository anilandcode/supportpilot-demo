do $$ begin
  create type public.integration_provider as enum ('slack', 'webhook', 'zendesk', 'intercom');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.integration_status as enum ('active', 'disabled', 'error');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.outbound_event_type as enum ('approval_needed', 'approval_decided', 'approved_reply', 'ticket_escalated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.outbound_event_status as enum ('queued', 'processing', 'delivered', 'failed', 'skipped');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.integration_delivery_status as enum ('processing', 'delivered', 'failed', 'skipped');
exception when duplicate_object then null;
end $$;

create table if not exists public.integration_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider public.integration_provider not null,
  name text not null,
  status public.integration_status not null default 'disabled',
  config jsonb not null default '{}'::jsonb,
  secret_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  url text not null,
  signing_secret_ref text,
  status public.integration_status not null default 'disabled',
  events public.outbound_event_type[] not null default '{}'::public.outbound_event_type[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_external_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider public.integration_provider not null,
  local_type text not null,
  local_id text not null,
  external_type text not null,
  external_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, provider, local_type, local_id, external_type)
);

create table if not exists public.outbound_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  integration_account_id uuid references public.integration_accounts(id) on delete set null,
  webhook_endpoint_id uuid references public.webhook_endpoints(id) on delete set null,
  event_type public.outbound_event_type not null,
  subject_type text not null,
  subject_id text not null,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status public.outbound_event_status not null default 'queued',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  next_run_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (integration_account_id is not null or webhook_endpoint_id is not null)
);

create table if not exists public.integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  outbound_event_id uuid not null references public.outbound_events(id) on delete cascade,
  integration_account_id uuid references public.integration_accounts(id) on delete set null,
  webhook_endpoint_id uuid references public.webhook_endpoints(id) on delete set null,
  provider text not null,
  attempt integer not null default 1,
  status public.integration_delivery_status not null default 'processing',
  http_status integer,
  response_preview text,
  error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists integration_accounts_workspace_provider_idx on public.integration_accounts(workspace_id, provider, status);
create index if not exists webhook_endpoints_workspace_status_idx on public.webhook_endpoints(workspace_id, status);
create index if not exists integration_external_mappings_local_idx on public.integration_external_mappings(workspace_id, provider, local_type, local_id);
create index if not exists outbound_events_workspace_status_idx on public.outbound_events(workspace_id, status, created_at desc);
create index if not exists outbound_events_next_run_idx on public.outbound_events(status, next_run_at);
create index if not exists integration_deliveries_event_idx on public.integration_deliveries(outbound_event_id, created_at desc);

alter table public.integration_accounts enable row level security;
alter table public.webhook_endpoints enable row level security;
alter table public.integration_external_mappings enable row level security;
alter table public.outbound_events enable row level security;
alter table public.integration_deliveries enable row level security;

drop policy if exists "workspace members read integration accounts" on public.integration_accounts;
drop policy if exists "workspace admins manage integration accounts" on public.integration_accounts;
drop policy if exists "workspace members read webhook endpoints" on public.webhook_endpoints;
drop policy if exists "workspace admins manage webhook endpoints" on public.webhook_endpoints;
drop policy if exists "workspace members read external mappings" on public.integration_external_mappings;
drop policy if exists "workspace admins manage external mappings" on public.integration_external_mappings;
drop policy if exists "workspace members read outbound events" on public.outbound_events;
drop policy if exists "workspace managers manage outbound events" on public.outbound_events;
drop policy if exists "workspace members read integration deliveries" on public.integration_deliveries;
drop policy if exists "workspace managers manage integration deliveries" on public.integration_deliveries;

create policy "workspace members read integration accounts" on public.integration_accounts
for select using (public.can_access_workspace(workspace_id));

create policy "workspace admins manage integration accounts" on public.integration_accounts
for all using (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]));

create policy "workspace members read webhook endpoints" on public.webhook_endpoints
for select using (public.can_access_workspace(workspace_id));

create policy "workspace admins manage webhook endpoints" on public.webhook_endpoints
for all using (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]));

create policy "workspace members read external mappings" on public.integration_external_mappings
for select using (public.can_access_workspace(workspace_id));

create policy "workspace admins manage external mappings" on public.integration_external_mappings
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));

create policy "workspace members read outbound events" on public.outbound_events
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage outbound events" on public.outbound_events
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));

create policy "workspace members read integration deliveries" on public.integration_deliveries
for select using (public.can_access_workspace(workspace_id));

create policy "workspace managers manage integration deliveries" on public.integration_deliveries
for all using (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin','manager']::public.membership_role[]));
