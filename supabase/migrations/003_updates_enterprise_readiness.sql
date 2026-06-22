do $$ begin
  alter type public.membership_role add value if not exists 'analyst';
exception when undefined_object then null;
end $$;

alter table public.ai_runs add column if not exists prompt_hash text;
alter table public.ai_runs add column if not exists redacted_prompt_preview text;
alter table public.ai_runs add column if not exists provider text;
alter table public.ai_runs add column if not exists model_route text check (model_route is null or model_route in ('R0','R1','R2','R3','R4','R5'));
alter table public.ai_runs add column if not exists input_tokens integer not null default 0;
alter table public.ai_runs add column if not exists output_tokens integer not null default 0;
alter table public.ai_runs add column if not exists cost_estimate_usd numeric not null default 0;
alter table public.ai_runs add column if not exists retrieval_score numeric;
alter table public.ai_runs add column if not exists generation_score numeric;
alter table public.ai_runs add column if not exists policy_risk_score numeric;
alter table public.ai_runs add column if not exists grounding_status text check (grounding_status is null or grounding_status in ('pass','needs_review','fail'));
alter table public.ai_runs add column if not exists grounding_score numeric;

do $$ begin
  alter type public.usage_event_type add value if not exists 'onboarding_step_completed';
  alter type public.usage_event_type add value if not exists 'knowledge_source_added';
  alter type public.usage_event_type add value if not exists 'rag_answer_generated';
  alter type public.usage_event_type add value if not exists 'approval_requested';
  alter type public.usage_event_type add value if not exists 'approval_decided';
  alter type public.usage_event_type add value if not exists 'ticket_escalated';
  alter type public.usage_event_type add value if not exists 'widget_installed';
  alter type public.usage_event_type add value if not exists 'answer_feedback';
  alter type public.usage_event_type add value if not exists 'model_route_used';
  alter type public.usage_event_type add value if not exists 'security_event_logged';
exception when undefined_object then null;
end $$;

create table if not exists public.workspace_checklist_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  step text not null check (step in ('knowledge_source','embeddings_generated','golden_questions','brand_disclosure','escalation_owner','domain_verified','widget_installed','monitoring_enabled')),
  label text not null,
  description text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, step)
);

create table if not exists public.golden_questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  question text not null,
  expected_sources text[] not null default '{}',
  last_score numeric,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.missing_knowledge_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  topic text not null,
  reason text not null,
  source_ai_run_id uuid references public.ai_runs(id) on delete set null,
  status text not null default 'open' check (status in ('open','planned','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.model_route_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  route text not null check (route in ('R0','R1','R2','R3','R4','R5')),
  task text not null,
  provider text not null,
  model text not null,
  latency_ms integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric not null default 0,
  confidence numeric not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type text not null check (event_type in ('blocked_origin','rate_limited','pii_redacted','prompt_injection_suspected','widget_session_invalid','widget_session_created')),
  severity public.risk_level not null default 'medium',
  origin text,
  ip_hash text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.widget_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  token_hash text not null,
  origin text not null,
  domain text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.retention_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  conversation_days integer not null default 365,
  audit_days integer not null default 730,
  ai_prompt_logging text not null default 'redacted' check (ai_prompt_logging in ('redacted','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (name in ('search_knowledge','get_ticket_history','get_workspace_policy')),
  description text not null,
  read_only boolean not null default true,
  active boolean not null default true,
  unique (workspace_id, name)
);

create table if not exists public.tool_calls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  output_summary text not null default '',
  status text not null default 'success' check (status in ('success','blocked','error')),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete set null,
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  loop_step text not null,
  outcome text not null check (outcome in ('answer','ask_clarifying','approve_required','escalate','refuse')),
  created_at timestamptz not null default now()
);

create table if not exists public.policy_evaluations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  action text not null check (action in ('answer','ask_clarifying','approve_required','escalate','refuse')),
  reasons text[] not null default '{}',
  required_role public.membership_role,
  allowed_tools text[] not null default '{}',
  risk_level public.risk_level not null default 'low',
  created_at timestamptz not null default now()
);

create table if not exists public.grounding_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  status text not null check (status in ('pass','needs_review','fail')),
  score numeric not null default 0,
  citation_coverage numeric not null default 0,
  freshness_score numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists checklist_workspace_idx on public.workspace_checklist_items(workspace_id);
create index if not exists golden_questions_workspace_idx on public.golden_questions(workspace_id);
create index if not exists missing_knowledge_workspace_idx on public.missing_knowledge_tasks(workspace_id, status);
create index if not exists model_route_logs_workspace_idx on public.model_route_logs(workspace_id, created_at desc);
create index if not exists security_events_workspace_idx on public.security_events(workspace_id, created_at desc);
create index if not exists widget_sessions_workspace_idx on public.widget_sessions(workspace_id, expires_at desc);
create index if not exists grounding_checks_ai_run_idx on public.grounding_checks(ai_run_id);
create index if not exists policy_evaluations_ai_run_idx on public.policy_evaluations(ai_run_id);

alter table public.workspace_checklist_items enable row level security;
alter table public.golden_questions enable row level security;
alter table public.missing_knowledge_tasks enable row level security;
alter table public.model_route_logs enable row level security;
alter table public.security_events enable row level security;
alter table public.widget_sessions enable row level security;
alter table public.retention_settings enable row level security;
alter table public.tool_definitions enable row level security;
alter table public.tool_calls enable row level security;
alter table public.agent_runs enable row level security;
alter table public.policy_evaluations enable row level security;
alter table public.grounding_checks enable row level security;

do $$ declare table_name text; begin
  foreach table_name in array array[
    'workspace_checklist_items','golden_questions','missing_knowledge_tasks','model_route_logs',
    'security_events','widget_sessions','retention_settings','tool_definitions','tool_calls',
    'agent_runs','policy_evaluations','grounding_checks'
  ] loop
    execute format('drop policy if exists "members read %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "managers manage %1$s" on public.%1$I', table_name);
    execute format('create policy "members read %1$s" on public.%1$I for select using (public.can_access_workspace(workspace_id))', table_name);
    execute format('create policy "managers manage %1$s" on public.%1$I for all using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id))', table_name);
  end loop;
end $$;

insert into public.workspace_checklist_items (tenant_id, workspace_id, step, label, description, completed, completed_at) values
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','knowledge_source','Add knowledge source','Upload or paste the first approved FAQ, policy, or support article.',true,now() - interval '3 hours'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','embeddings_generated','Generate source chunks','Confirm approved sources have searchable chunks and embedding metadata.',true,now() - interval '2 hours'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','golden_questions','Pass five golden questions','Validate citations and safe refusal behavior before launch.',false,null),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','brand_disclosure','Configure brand and disclosure','Set the assistant name, colors, welcome copy, and AI disclosure.',true,now() - interval '90 minutes'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','escalation_owner','Set escalation owner','Add the manager or inbox that receives risky conversations.',true,now() - interval '80 minutes'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','domain_verified','Verify widget domain','Restrict the widget to approved customer origins.',true,now() - interval '70 minutes'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','widget_installed','Install widget','Place the script or iframe on the customer site.',false,null),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','monitoring_enabled','Enable monitoring','Turn on Sentry and product events for launch visibility.',false,null)
on conflict (workspace_id, step) do update set label = excluded.label, description = excluded.description, completed = excluded.completed, completed_at = excluded.completed_at;

insert into public.golden_questions (tenant_id, workspace_id, question, expected_sources, last_score, passed) values
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','What does Pro cost?',array['Pricing and Plans'],0.92,true),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Can I get a refund after renewal?',array['Refund Policy'],0.74,false),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Can you share the SOC 2 report?',array['Security Overview'],0.88,true),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Can legal get a DPA?',array['Data Processing Agreement'],0.69,false),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Why am I seeing API 429 errors?',array['API Rate Limits'],0.90,true)
on conflict do nothing;

insert into public.retention_settings (tenant_id, workspace_id, conversation_days, audit_days, ai_prompt_logging)
values ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002',365,730,'redacted')
on conflict (workspace_id) do update set conversation_days = excluded.conversation_days, audit_days = excluded.audit_days, ai_prompt_logging = excluded.ai_prompt_logging, updated_at = now();

insert into public.tool_definitions (tenant_id, workspace_id, name, description, read_only, active) values
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','search_knowledge','Search approved workspace knowledge chunks for cited support evidence.',true,true),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','get_ticket_history','Read customer metadata and ticket conversation history for agent-assist drafts.',true,true),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','get_workspace_policy','Read approval, escalation, and safety policies before deciding whether to answer.',true,true)
on conflict (workspace_id, name) do update set description = excluded.description, read_only = true, active = true;

insert into public.missing_knowledge_tasks (tenant_id, workspace_id, topic, reason, status)
values
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Refund exceptions for renewal disputes','Low-confidence and billing-risk drafts need clearer manager policy.','open'),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','DPA approval workflow','Legal requests cite source availability but lack internal handoff steps.','planned')
on conflict do nothing;
