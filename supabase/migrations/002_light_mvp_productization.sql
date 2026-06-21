do $$ begin
  create type public.membership_role as enum ('owner', 'admin', 'manager', 'agent', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.domain_status as enum ('pending', 'verified', 'blocked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.usage_event_type as enum (
    'chat.message',
    'chat.answered',
    'chat.escalated',
    'knowledge.uploaded',
    'ai_run.created',
    'approval.decided',
    'email.escalated'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'Lite',
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  bot_name text not null default 'Pilot',
  brand_color text not null default '#10b981',
  accent_foreground text not null default '#ffffff',
  welcome_message text not null default 'Hi, I can help with approved support answers.',
  escalation_email text not null,
  calendly_url text,
  widget_key text not null unique,
  monthly_reply_limit integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.membership_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.workspace_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  domain text not null,
  status public.domain_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (workspace_id, domain)
);

create table if not exists public.widget_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  launcher_label text not null default 'Chat',
  position text not null default 'bottom-right' check (position in ('bottom-right', 'bottom-left')),
  show_branding boolean not null default true,
  privacy_text text not null default 'Answers are generated from approved support sources.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type public.usage_event_type not null,
  quantity integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  risk_category text not null,
  min_confidence_to_auto_send numeric not null default 0.72,
  require_approval boolean not null default true,
  allowed_actions text[] not null default '{}',
  approver_role public.membership_role not null default 'manager',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workspace_id, risk_category)
);

insert into public.organizations (id, name, slug, plan)
values ('70000000-0000-4000-8000-000000000001', 'AcmeDesk', 'acmedesk', 'Lite')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, plan = excluded.plan;

insert into public.workspaces (
  id,
  tenant_id,
  name,
  slug,
  bot_name,
  brand_color,
  accent_foreground,
  welcome_message,
  escalation_email,
  calendly_url,
  widget_key,
  monthly_reply_limit
)
values (
  '70000000-0000-4000-8000-000000000002',
  '70000000-0000-4000-8000-000000000001',
  'AcmeDesk Support',
  'acmedesk-support',
  'Pilot',
  '#10b981',
  '#ffffff',
  'Hi, I''m Pilot. Ask me anything about AcmeDesk pricing, integrations, billing, or security.',
  'support@acmedesk.example',
  'https://calendly.com/anilpervaiz/15min',
  'wk_demo_acmedesk',
  1000
)
on conflict (id) do update set
  name = excluded.name,
  bot_name = excluded.bot_name,
  brand_color = excluded.brand_color,
  welcome_message = excluded.welcome_message,
  escalation_email = excluded.escalation_email,
  calendly_url = excluded.calendly_url,
  widget_key = excluded.widget_key,
  updated_at = now();

alter table public.customers add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.customers add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.tickets add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.tickets add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.ticket_messages add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.ticket_messages add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.knowledge_docs add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.knowledge_docs add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.knowledge_docs add column if not exists source_version integer not null default 1;
alter table public.document_chunks add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.document_chunks add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.document_chunks add column if not exists embedding_model text not null default 'deterministic-hash';
alter table public.document_chunks add column if not exists embedding_version text not null default 'v1';
alter table public.document_chunks add column if not exists content_hash text not null default '';
alter table public.ai_runs add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.ai_runs add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.ai_feedback add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.ai_feedback add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.audit_logs add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.audit_logs add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';
alter table public.escalation_rules add column if not exists tenant_id uuid not null default '70000000-0000-4000-8000-000000000001';
alter table public.escalation_rules add column if not exists workspace_id uuid not null default '70000000-0000-4000-8000-000000000002';

update public.document_chunks
set content_hash = md5(content)
where content_hash = '';

insert into public.memberships (tenant_id, workspace_id, user_id, role)
select
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002',
  id,
  case
    when role = 'admin' then 'owner'::public.membership_role
    when role = 'support_manager' then 'manager'::public.membership_role
    when role = 'support_agent' then 'agent'::public.membership_role
    else 'viewer'::public.membership_role
  end
from public.users
where role <> 'customer'
on conflict (workspace_id, user_id) do update set role = excluded.role;

insert into public.workspace_domains (tenant_id, workspace_id, domain, status) values
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 'localhost', 'verified'),
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', '127.0.0.1', 'verified'),
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 'supportpilot-demo.vercel.app', 'verified')
on conflict (workspace_id, domain) do update set status = excluded.status;

insert into public.widget_configs (tenant_id, workspace_id, launcher_label, position, show_branding, privacy_text)
values (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002',
  'Chat with Pilot',
  'bottom-right',
  true,
  'Answers are generated from approved AcmeDesk support sources and may be escalated to a human.'
)
on conflict (workspace_id) do update set
  launcher_label = excluded.launcher_label,
  position = excluded.position,
  show_branding = excluded.show_branding,
  privacy_text = excluded.privacy_text,
  updated_at = now();

insert into public.approval_policies (
  tenant_id,
  workspace_id,
  risk_category,
  min_confidence_to_auto_send,
  require_approval,
  allowed_actions,
  approver_role
) values
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 'low_confidence', 0.72, true, array['draft_reply','email_escalation'], 'manager'),
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 'billing_or_refund', 0.90, true, array['draft_reply'], 'manager'),
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 'legal_or_policy', 0.95, true, array['draft_reply'], 'manager')
on conflict (workspace_id, risk_category) do update set
  min_confidence_to_auto_send = excluded.min_confidence_to_auto_send,
  require_approval = excluded.require_approval,
  allowed_actions = excluded.allowed_actions,
  approver_role = excluded.approver_role,
  active = true;

create index if not exists customers_workspace_idx on public.customers(workspace_id);
create index if not exists tickets_workspace_status_idx on public.tickets(workspace_id, status);
create index if not exists ticket_messages_workspace_idx on public.ticket_messages(workspace_id);
create index if not exists knowledge_docs_workspace_idx on public.knowledge_docs(workspace_id);
create index if not exists document_chunks_workspace_idx on public.document_chunks(workspace_id);
create index if not exists ai_runs_workspace_idx on public.ai_runs(workspace_id);
create index if not exists usage_events_workspace_idx on public.usage_events(workspace_id, created_at desc);

drop function if exists public.match_document_chunks(vector(768), int, float);
create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.1
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
    dc.content_hash,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.approved = true
    and dc.embedding is not null
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.can_access_workspace(target_workspace_id uuid)
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
  )
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
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
      and memberships.role in ('owner', 'admin', 'manager')
  )
$$;

alter table public.organizations enable row level security;
alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.workspace_domains enable row level security;
alter table public.widget_configs enable row level security;
alter table public.usage_events enable row level security;
alter table public.approval_policies enable row level security;

drop policy if exists "staff read customers" on public.customers;
drop policy if exists "customers read own profile" on public.customers;
drop policy if exists "staff manage tickets" on public.tickets;
drop policy if exists "staff manage messages" on public.ticket_messages;
drop policy if exists "approved docs readable" on public.knowledge_docs;
drop policy if exists "staff manage docs" on public.knowledge_docs;
drop policy if exists "approved chunks readable" on public.document_chunks;
drop policy if exists "staff manage chunks" on public.document_chunks;
drop policy if exists "staff manage ai runs" on public.ai_runs;
drop policy if exists "staff manage feedback" on public.ai_feedback;
drop policy if exists "staff read audit" on public.audit_logs;
drop policy if exists "admin manage audit" on public.audit_logs;
drop policy if exists "staff read rules" on public.escalation_rules;
drop policy if exists "manager manage rules" on public.escalation_rules;

create policy "members read organizations" on public.organizations for select using (
  exists (select 1 from public.memberships where memberships.tenant_id = organizations.id and memberships.user_id = auth.uid())
);
create policy "members read workspaces" on public.workspaces for select using (public.can_access_workspace(id));
create policy "managers update workspaces" on public.workspaces for update using (public.can_manage_workspace(id)) with check (public.can_manage_workspace(id));
create policy "members read memberships" on public.memberships for select using (public.can_access_workspace(workspace_id));
create policy "managers manage memberships" on public.memberships for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "members read domains" on public.workspace_domains for select using (public.can_access_workspace(workspace_id));
create policy "managers manage domains" on public.workspace_domains for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "members read widget config" on public.widget_configs for select using (public.can_access_workspace(workspace_id));
create policy "managers manage widget config" on public.widget_configs for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "members read usage events" on public.usage_events for select using (public.can_manage_workspace(workspace_id));
create policy "members insert usage events" on public.usage_events for insert with check (public.can_access_workspace(workspace_id));
create policy "members read approval policies" on public.approval_policies for select using (public.can_access_workspace(workspace_id));
create policy "managers manage approval policies" on public.approval_policies for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));

create policy "workspace staff read customers" on public.customers for select using (public.can_access_workspace(workspace_id));
create policy "customers read own profile" on public.customers for select using (email = public.current_user_email());
create policy "workspace staff manage tickets" on public.tickets for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace staff manage messages" on public.ticket_messages for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace approved docs readable" on public.knowledge_docs for select using (public.can_access_workspace(workspace_id));
create policy "workspace staff manage docs" on public.knowledge_docs for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace approved chunks readable" on public.document_chunks for select using (public.can_access_workspace(workspace_id));
create policy "workspace staff manage chunks" on public.document_chunks for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace staff manage ai runs" on public.ai_runs for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace staff manage feedback" on public.ai_feedback for all using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "workspace staff read audit" on public.audit_logs for select using (public.can_access_workspace(workspace_id));
create policy "workspace managers create audit" on public.audit_logs for insert with check (public.can_manage_workspace(workspace_id));
create policy "workspace staff read rules" on public.escalation_rules for select using (public.can_access_workspace(workspace_id));
create policy "workspace managers manage rules" on public.escalation_rules for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
