do $$ begin
  create type public.membership_status as enum ('active', 'invited', 'disabled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.portal_identity_status as enum ('active', 'disabled');
exception when duplicate_object then null;
end $$;

alter table public.memberships add column if not exists status public.membership_status not null default 'active';
alter table public.memberships add column if not exists accepted_at timestamptz default now();
alter table public.memberships add column if not exists disabled_at timestamptz;
alter table public.memberships add column if not exists invited_by uuid references public.users(id) on delete set null;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.membership_role not null,
  token_hash text not null unique,
  invited_by uuid references public.users(id) on delete set null,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.portal_identities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  external_customer_id text,
  email text not null,
  status public.portal_identity_status not null default 'active',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (workspace_id, email)
);

create table if not exists public.workspace_onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  current_step text not null default 'create_workspace',
  completed_steps text[] not null default '{}',
  live_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_workspace_status_idx on public.memberships(workspace_id, status, role);
create index if not exists memberships_user_status_idx on public.memberships(user_id, status);
create index if not exists invitations_workspace_status_idx on public.invitations(workspace_id, status, expires_at);
create index if not exists invitations_email_idx on public.invitations(lower(email));
create index if not exists portal_identities_user_idx on public.portal_identities(user_id, status);
create index if not exists portal_identities_workspace_email_idx on public.portal_identities(workspace_id, lower(email));
create index if not exists onboarding_sessions_workspace_idx on public.workspace_onboarding_sessions(workspace_id);

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.membership_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where memberships.workspace_id = target_workspace_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.role = any(allowed_roles)
  )
$$;

create or replace function public.is_org_owner(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where memberships.tenant_id = target_tenant_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.role = 'owner'
  )
$$;

create or replace function public.is_customer_for_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portal_identities
    where portal_identities.workspace_id = target_workspace_id
      and portal_identities.user_id = auth.uid()
      and portal_identities.status = 'active'
  )
$$;

create or replace function public.can_access_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(target_workspace_id, array['owner','admin','manager','agent','analyst','viewer']::public.membership_role[])
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(target_workspace_id, array['owner','admin','manager']::public.membership_role[])
$$;

alter table public.invitations enable row level security;
alter table public.portal_identities enable row level security;
alter table public.workspace_onboarding_sessions enable row level security;

drop policy if exists "managers manage invitations" on public.invitations;
drop policy if exists "invited users read own invitations" on public.invitations;
drop policy if exists "portal users read own identity" on public.portal_identities;
drop policy if exists "workspace admins manage portal identities" on public.portal_identities;
drop policy if exists "members read onboarding sessions" on public.workspace_onboarding_sessions;
drop policy if exists "managers manage onboarding sessions" on public.workspace_onboarding_sessions;

create policy "managers manage invitations" on public.invitations
for all using (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]))
with check (public.has_workspace_role(workspace_id, array['owner','admin']::public.membership_role[]));

create policy "invited users read own invitations" on public.invitations
for select using (
  status = 'pending'
  and expires_at > now()
  and lower(email) = lower(public.current_user_email())
);

create policy "portal users read own identity" on public.portal_identities
for select using (user_id = auth.uid());

create policy "workspace admins manage portal identities" on public.portal_identities
for all using (public.can_manage_workspace(workspace_id))
with check (public.can_manage_workspace(workspace_id));

create policy "members read onboarding sessions" on public.workspace_onboarding_sessions
for select using (public.can_access_workspace(workspace_id));

create policy "managers manage onboarding sessions" on public.workspace_onboarding_sessions
for all using (public.can_manage_workspace(workspace_id))
with check (public.can_manage_workspace(workspace_id));

drop policy if exists "customers read own profile" on public.customers;
drop policy if exists "customers create own profile" on public.customers;
drop policy if exists "customers read own tickets" on public.tickets;
drop policy if exists "customers create own tickets" on public.tickets;
drop policy if exists "customers read own messages" on public.ticket_messages;
drop policy if exists "customers create own messages" on public.ticket_messages;

create policy "customers read own profile" on public.customers
for select using (
  public.is_customer_for_workspace(workspace_id)
  and lower(email) = lower(public.current_user_email())
);

create policy "customers create own profile" on public.customers
for insert with check (
  public.is_customer_for_workspace(workspace_id)
  and lower(email) = lower(public.current_user_email())
);

create policy "customers read own tickets" on public.tickets
for select using (
  public.is_customer_for_workspace(workspace_id)
  and customer_id in (
    select id from public.customers where lower(customers.email) = lower(public.current_user_email())
  )
);

create policy "customers create own tickets" on public.tickets
for insert with check (
  public.is_customer_for_workspace(workspace_id)
  and customer_id in (
    select id from public.customers where lower(customers.email) = lower(public.current_user_email())
  )
);

create policy "customers read own messages" on public.ticket_messages
for select using (
  public.is_customer_for_workspace(workspace_id)
  and ticket_id in (
    select tickets.id
    from public.tickets
    join public.customers on customers.id = tickets.customer_id
    where lower(customers.email) = lower(public.current_user_email())
  )
);

create policy "customers create own messages" on public.ticket_messages
for insert with check (
  public.is_customer_for_workspace(workspace_id)
  and sender = 'customer'
  and ticket_id in (
    select tickets.id
    from public.tickets
    join public.customers on customers.id = tickets.customer_id
    where lower(customers.email) = lower(public.current_user_email())
  )
);

insert into public.workspace_onboarding_sessions (tenant_id, workspace_id, current_step, completed_steps, created_by)
values (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002',
  'golden_questions',
  array['create_workspace','brand_voice','ingest_docs','configure_policies','invite_team','verify_domain'],
  null
)
on conflict (workspace_id) do nothing;
