create extension if not exists pgcrypto;
create extension if not exists vector;

create type public.user_role as enum ('customer', 'support_agent', 'support_manager', 'admin');
create type public.ticket_status as enum ('new', 'in_progress', 'escalated', 'resolved');
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
create type public.message_sender as enum ('customer', 'agent', 'ai');
create type public.approval_status as enum ('draft', 'approved', 'edited', 'rejected', 'escalated');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  plan text not null,
  health_score integer not null default 75,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  status public.ticket_status not null default 'new',
  priority public.ticket_priority not null default 'medium',
  risk_level public.risk_level not null default 'low',
  customer_id uuid not null references public.customers(id) on delete cascade,
  assigned_agent_id uuid references public.users(id) on delete set null,
  escalation_reason text,
  sentiment text not null default 'neutral',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender public.message_sender not null,
  author_id uuid references public.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.knowledge_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null,
  approved boolean not null default false,
  url text,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.knowledge_docs(id) on delete cascade,
  source text not null,
  heading text not null,
  content text not null,
  chunk_index integer not null,
  approved boolean not null default false,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  prompt text not null,
  response text not null,
  sources jsonb not null default '[]'::jsonb,
  approval_status public.approval_status not null default 'draft',
  confidence numeric not null default 0,
  escalation_reason text,
  risk_flags text[] not null default '{}',
  rationale text not null default '',
  model text not null,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  ai_run_id uuid references public.ai_runs(id) on delete cascade,
  message_id text,
  user_id uuid references public.users(id) on delete set null,
  rating text not null check (rating in ('up', 'down')),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.escalation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text not null,
  risk_level public.risk_level not null,
  requires_manager_approval boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index document_chunks_embedding_idx on public.document_chunks using ivfflat (embedding vector_cosine_ops);
create index tickets_status_idx on public.tickets(status);
create index tickets_priority_idx on public.tickets(priority);
create index tickets_risk_level_idx on public.tickets(risk_level);
create index ai_runs_ticket_idx on public.ai_runs(ticket_id);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select coalesce((select role from public.users where id = auth.uid()), 'customer'::public.user_role)
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select email from public.users where id = auth.uid()
$$;

create or replace function public.is_support_staff()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('support_agent', 'support_manager', 'admin')
$$;

create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.1
)
returns table (
  id uuid,
  doc_id uuid,
  source text,
  heading text,
  content text,
  chunk_index integer,
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.doc_id,
    dc.source,
    dc.heading,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.approved = true
    and dc.embedding is not null
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.knowledge_docs enable row level security;
alter table public.document_chunks enable row level security;
alter table public.ai_runs enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.audit_logs enable row level security;
alter table public.escalation_rules enable row level security;

create policy "users read own or staff" on public.users for select using (id = auth.uid() or public.is_support_staff());
create policy "users insert own profile" on public.users for insert with check (id = auth.uid());
create policy "users update own profile" on public.users for update using (id = auth.uid() or public.current_user_role() = 'admin') with check (id = auth.uid() or public.current_user_role() = 'admin');
create policy "staff read customers" on public.customers for select using (public.is_support_staff());
create policy "customers read own profile" on public.customers for select using (email = public.current_user_email());
create policy "staff manage tickets" on public.tickets for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "customers read own tickets" on public.tickets for select using (
  customer_id in (select id from public.customers where email = public.current_user_email())
);
create policy "customers create own tickets" on public.tickets for insert with check (
  customer_id in (select id from public.customers where email = public.current_user_email())
);
create policy "staff manage messages" on public.ticket_messages for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "customers read own messages" on public.ticket_messages for select using (
  ticket_id in (
    select tickets.id
    from public.tickets
    join public.customers on customers.id = tickets.customer_id
    where customers.email = public.current_user_email()
  )
);
create policy "customers create own messages" on public.ticket_messages for insert with check (
  sender = 'customer'
  and ticket_id in (
    select tickets.id
    from public.tickets
    join public.customers on customers.id = tickets.customer_id
    where customers.email = public.current_user_email()
  )
);
create policy "approved docs readable" on public.knowledge_docs for select using (approved = true or public.is_support_staff());
create policy "staff manage docs" on public.knowledge_docs for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "approved chunks readable" on public.document_chunks for select using (approved = true or public.is_support_staff());
create policy "staff manage chunks" on public.document_chunks for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "staff manage ai runs" on public.ai_runs for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "staff manage feedback" on public.ai_feedback for all using (public.is_support_staff()) with check (public.is_support_staff());
create policy "users create own feedback" on public.ai_feedback for insert with check (user_id = auth.uid());
create policy "staff read audit" on public.audit_logs for select using (public.is_support_staff());
create policy "admin manage audit" on public.audit_logs for insert with check (public.current_user_role() in ('support_manager', 'admin'));
create policy "staff read rules" on public.escalation_rules for select using (public.is_support_staff());
create policy "manager manage rules" on public.escalation_rules for all using (public.current_user_role() in ('support_manager', 'admin')) with check (public.current_user_role() in ('support_manager', 'admin'));
