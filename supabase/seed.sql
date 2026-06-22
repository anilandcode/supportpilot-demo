create extension if not exists pgcrypto;

create or replace function public.seed_embedding(slot int)
returns vector
language sql
immutable
as $$
  select ('[' || string_agg(
    case when i = ((slot - 1) % 768) + 1 then '1' else '0' end,
    ',' order by i
  ) || ']')::vector
  from generate_series(1, 768) as series(i)
$$;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
  ('01000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'maya@northstar.example', crypt('SupportPilot2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maya Patel"}', now(), now()),
  ('01000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'ava@acmedesk.example', crypt('SupportPilot2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ava Brooks"}', now(), now()),
  ('01000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'noah@acmedesk.example', crypt('SupportPilot2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Noah Reed"}', now(), now()),
  ('01000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'lena@acmedesk.example', crypt('SupportPilot2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lena Ortiz"}', now(), now()),
  ('01000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'admin@acmedesk.example', crypt('SupportPilot2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Anil Pervaiz"}', now(), now())
on conflict (id) do update set email = excluded.email, encrypted_password = excluded.encrypted_password, updated_at = now();

insert into public.users (id, email, full_name, role) values
  ('01000000-0000-4000-8000-000000000001', 'maya@northstar.example', 'Maya Patel', 'customer'),
  ('01000000-0000-4000-8000-000000000002', 'ava@acmedesk.example', 'Ava Brooks', 'support_agent'),
  ('01000000-0000-4000-8000-000000000003', 'noah@acmedesk.example', 'Noah Reed', 'support_agent'),
  ('01000000-0000-4000-8000-000000000004', 'lena@acmedesk.example', 'Lena Ortiz', 'support_manager'),
  ('01000000-0000-4000-8000-000000000005', 'admin@acmedesk.example', 'Anil Pervaiz', 'admin')
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

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
) values (
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
on conflict (workspace_id) do update set launcher_label = excluded.launcher_label, position = excluded.position, show_branding = excluded.show_branding, privacy_text = excluded.privacy_text, updated_at = now();

insert into public.customers (id, name, email, company, plan, health_score, metadata) values
  ('00000000-0000-4000-8000-000000000001', 'Maya Patel', 'maya@northstar.example', 'Northstar Labs', 'Business', 82, '{"seats":"38","region":"US"}'),
  ('00000000-0000-4000-8000-000000000002', 'Jon Bell', 'jon@riverline.example', 'Riverline Finance', 'Enterprise', 64, '{"seats":"140","region":"EU"}'),
  ('00000000-0000-4000-8000-000000000003', 'Priya Shah', 'priya@halo.example', 'Halo Health', 'Pro', 76, '{"seats":"22","region":"US"}'),
  ('00000000-0000-4000-8000-000000000004', 'Chris Wong', 'chris@vector.example', 'Vector Ops', 'Free', 58, '{"seats":"4","region":"APAC"}'),
  ('00000000-0000-4000-8000-000000000005', 'Nora Smith', 'nora@evergreen.example', 'Evergreen Retail', 'Business', 91, '{"seats":"55","region":"US"}')
on conflict (id) do update set name = excluded.name, email = excluded.email, company = excluded.company, plan = excluded.plan, health_score = excluded.health_score, metadata = excluded.metadata;

insert into public.knowledge_docs (id, title, source_type, approved, content) values
  ('10000000-0000-4000-8000-000000000001', 'Pricing and Plans', 'faq', true, 'Pro is $12 per user per month. Business is $24 per user per month. Enterprise is custom priced for larger customers.'),
  ('10000000-0000-4000-8000-000000000002', 'Refund Policy', 'policy', true, 'First-time upgrades from Free to paid plans are refundable within 14 days. Renewals, seat additions, and later upgrades are not refundable without manager approval.'),
  ('10000000-0000-4000-8000-000000000003', 'Security Overview', 'policy', true, 'AcmeDesk is SOC 2 Type II certified. Reports are available to Business and Enterprise customers under NDA.'),
  ('10000000-0000-4000-8000-000000000004', 'SSO Setup', 'onboarding', true, 'SAML SSO is available on Business and Enterprise plans with Okta, Azure AD, Google Workspace, and OneLogin.'),
  ('10000000-0000-4000-8000-000000000005', 'GitHub Integration', 'product_doc', true, 'Install the AcmeDesk GitHub App to link pull requests, move issues to In Review, and close issues when PRs merge.'),
  ('10000000-0000-4000-8000-000000000006', 'Slack Integration', 'product_doc', true, 'Slack users can create issues, receive channel notifications, unfurl links, and manage notification rules.'),
  ('10000000-0000-4000-8000-000000000007', 'GDPR and Data Residency', 'policy', true, 'Enterprise customers can choose EU data residency. GDPR deletion requests are completed within 30 days.'),
  ('10000000-0000-4000-8000-000000000008', 'Billing Operations', 'policy', true, 'Annual billing saves 20 percent. Upgrades are prorated mid-cycle and downgrades apply at period end.'),
  ('10000000-0000-4000-8000-000000000009', 'Data Processing Agreement', 'policy', true, 'A signed DPA is available to Business and Enterprise customers after legal review and account verification.'),
  ('10000000-0000-4000-8000-000000000010', 'API Rate Limits', 'product_doc', true, 'API keys are created from Settings > API. 429 errors mean the integration exceeded 1,000 requests per minute.')
on conflict (id) do update set title = excluded.title, source_type = excluded.source_type, approved = excluded.approved, content = excluded.content;

insert into public.document_chunks (id, doc_id, source, heading, content, chunk_index, approved, embedding_model, embedding_version, content_hash, embedding)
select
  ('11000000-0000-4000-8000-' || lpad(slot::text, 12, '0'))::uuid,
  id,
  title,
  title,
  content,
  slot,
  true,
  'deterministic-hash',
  'v1',
  md5(content),
  public.seed_embedding(slot)
from (
  values
    (1, '10000000-0000-4000-8000-000000000001'::uuid, 'Pricing and Plans', 'Pro is $12 per user per month. Business is $24 per user per month. Enterprise is custom priced for larger customers.'),
    (2, '10000000-0000-4000-8000-000000000002'::uuid, 'Refund Policy', 'First-time upgrades from Free to paid plans are refundable within 14 days. Renewals, seat additions, and later upgrades are not refundable without manager approval.'),
    (3, '10000000-0000-4000-8000-000000000003'::uuid, 'Security Overview', 'AcmeDesk is SOC 2 Type II certified. Reports are available to Business and Enterprise customers under NDA.'),
    (4, '10000000-0000-4000-8000-000000000004'::uuid, 'SSO Setup', 'SAML SSO is available on Business and Enterprise plans with Okta, Azure AD, Google Workspace, and OneLogin.'),
    (5, '10000000-0000-4000-8000-000000000005'::uuid, 'GitHub Integration', 'Install the AcmeDesk GitHub App to link pull requests, move issues to In Review, and close issues when PRs merge.'),
    (6, '10000000-0000-4000-8000-000000000006'::uuid, 'Slack Integration', 'Slack users can create issues, receive channel notifications, unfurl links, and manage notification rules.'),
    (7, '10000000-0000-4000-8000-000000000007'::uuid, 'GDPR and Data Residency', 'Enterprise customers can choose EU data residency. GDPR deletion requests are completed within 30 days.'),
    (8, '10000000-0000-4000-8000-000000000008'::uuid, 'Billing Operations', 'Annual billing saves 20 percent. Upgrades are prorated mid-cycle and downgrades apply at period end.'),
    (9, '10000000-0000-4000-8000-000000000009'::uuid, 'Data Processing Agreement', 'A signed DPA is available to Business and Enterprise customers after legal review and account verification.'),
    (10, '10000000-0000-4000-8000-000000000010'::uuid, 'API Rate Limits', 'API keys are created from Settings > API. 429 errors mean the integration exceeded 1,000 requests per minute.')
) as docs(slot, id, title, content)
on conflict (id) do update set
  content = excluded.content,
  approved = excluded.approved,
  embedding_model = excluded.embedding_model,
  embedding_version = excluded.embedding_version,
  content_hash = excluded.content_hash,
  embedding = excluded.embedding;

insert into public.tickets (id, subject, status, priority, risk_level, customer_id, assigned_agent_id, escalation_reason, sentiment, tags, created_at, updated_at) values
  ('20000000-0000-4000-8000-000000000001', 'SOC 2 report request', 'new', 'medium', 'medium', '00000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000002', null, 'calm', array['soc','security'], now() - interval '40 hours', now() - interval '33 hours'),
  ('20000000-0000-4000-8000-000000000002', 'Refund after renewal charge', 'escalated', 'urgent', 'critical', '00000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000004', 'Refund policy risk requires manager approval', 'angry', array['refund','billing'], now() - interval '39 hours', now() - interval '32 hours'),
  ('20000000-0000-4000-8000-000000000003', 'GitHub sync stopped after org permission change', 'in_progress', 'high', 'medium', '00000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000003', null, 'frustrated', array['github','sync'], now() - interval '38 hours', now() - interval '31 hours'),
  ('20000000-0000-4000-8000-000000000004', 'Need SAML SSO setup steps', 'new', 'high', 'high', '00000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000002', 'SSO/security configuration', 'neutral', array['sso','security'], now() - interval '37 hours', now() - interval '30 hours'),
  ('20000000-0000-4000-8000-000000000005', 'Billing invoice says wrong seat count', 'escalated', 'urgent', 'high', '00000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000004', 'Billing dispute', 'angry', array['billing','invoice'], now() - interval '36 hours', now() - interval '29 hours'),
  ('20000000-0000-4000-8000-000000000006', 'Can guests view roadmaps?', 'resolved', 'low', 'low', '00000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000003', null, 'calm', array['roadmaps'], now() - interval '35 hours', now() - interval '28 hours'),
  ('20000000-0000-4000-8000-000000000007', 'Data residency for EU customers', 'escalated', 'high', 'high', '00000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000004', 'Policy/legal risk', 'neutral', array['gdpr','residency'], now() - interval '34 hours', now() - interval '27 hours'),
  ('20000000-0000-4000-8000-000000000008', 'Slack notifications duplicated', 'in_progress', 'medium', 'medium', '00000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000002', null, 'frustrated', array['slack','notifications'], now() - interval '33 hours', now() - interval '26 hours'),
  ('20000000-0000-4000-8000-000000000009', 'Cancel workspace but keep data', 'new', 'medium', 'medium', '00000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000003', null, 'neutral', array['cancel','data'], now() - interval '32 hours', now() - interval '25 hours'),
  ('20000000-0000-4000-8000-000000000010', 'Custom onboarding for 100 seats', 'resolved', 'medium', 'low', '00000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000002', null, 'calm', array['onboarding'], now() - interval '31 hours', now() - interval '24 hours'),
  ('20000000-0000-4000-8000-000000000011', 'Audit log retention question', 'new', 'medium', 'medium', '00000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000003', null, 'calm', array['audit'], now() - interval '30 hours', now() - interval '23 hours'),
  ('20000000-0000-4000-8000-000000000012', 'Notion sync status mismatch', 'in_progress', 'high', 'medium', '00000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000002', null, 'frustrated', array['notion','sync'], now() - interval '29 hours', now() - interval '22 hours'),
  ('20000000-0000-4000-8000-000000000013', 'Legal team needs DPA', 'escalated', 'urgent', 'critical', '00000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000004', 'Legal approval required', 'neutral', array['legal','dpa'], now() - interval '28 hours', now() - interval '21 hours'),
  ('20000000-0000-4000-8000-000000000014', 'Upgrade from Pro to Business mid-cycle', 'resolved', 'medium', 'low', '00000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000003', null, 'calm', array['upgrade'], now() - interval '27 hours', now() - interval '20 hours'),
  ('20000000-0000-4000-8000-000000000015', 'Password shared in chat', 'escalated', 'urgent', 'critical', '00000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000004', 'Sensitive data exposure', 'angry', array['sensitive','security'], now() - interval '26 hours', now() - interval '19 hours'),
  ('20000000-0000-4000-8000-000000000016', 'Roadmap external sharing', 'new', 'low', 'low', '00000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000002', null, 'calm', array['roadmap'], now() - interval '25 hours', now() - interval '18 hours'),
  ('20000000-0000-4000-8000-000000000017', 'API 429 errors', 'in_progress', 'high', 'medium', '00000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000003', null, 'frustrated', array['api','rate-limit'], now() - interval '24 hours', now() - interval '17 hours'),
  ('20000000-0000-4000-8000-000000000018', 'Enterprise quote request', 'resolved', 'medium', 'low', '00000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000002', null, 'calm', array['quote'], now() - interval '23 hours', now() - interval '16 hours'),
  ('20000000-0000-4000-8000-000000000019', 'Delete personal data under GDPR', 'new', 'urgent', 'critical', '00000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000004', 'GDPR request', 'neutral', array['gdpr','privacy'], now() - interval '22 hours', now() - interval '15 hours'),
  ('20000000-0000-4000-8000-000000000020', 'Figma previews not loading', 'resolved', 'low', 'low', '00000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000003', null, 'calm', array['figma'], now() - interval '21 hours', now() - interval '14 hours')
on conflict (id) do update set status = excluded.status, priority = excluded.priority, risk_level = excluded.risk_level, escalation_reason = excluded.escalation_reason, updated_at = excluded.updated_at;

insert into public.ticket_messages (id, ticket_id, sender, author_id, body, created_at)
select
  ('30000000-0000-4000-8000-' || lpad(((ticket_index * 2) - 1)::text, 12, '0'))::uuid,
  ticket_id,
  'customer',
  null,
  'Customer asks: ' || subject || '. Please answer with approved policy and next steps.',
  now() - (ticket_index || ' hours')::interval
from (
  select row_number() over (order by id) as ticket_index, id as ticket_id, subject from public.tickets
) tickets
on conflict (id) do nothing;

insert into public.ticket_messages (id, ticket_id, sender, author_id, body, created_at)
select
  ('30000000-0000-4000-8000-' || lpad((ticket_index * 2)::text, 12, '0'))::uuid,
  ticket_id,
  'agent',
  assigned_agent_id,
  coalesce('Agent note: ' || escalation_reason || '.', 'Agent note: draft an answer from approved docs.'),
  now() - ((ticket_index || ' hours')::interval - interval '15 minutes')
from (
  select row_number() over (order by id) as ticket_index, id as ticket_id, assigned_agent_id, escalation_reason from public.tickets
) tickets
on conflict (id) do nothing;

insert into public.ai_runs (id, ticket_id, user_id, prompt, response, model, latency_ms, confidence, approval_status, escalation_reason, risk_flags, sources, rationale, created_at)
select
  ('40000000-0000-4000-8000-' || lpad(ticket_index::text, 12, '0'))::uuid,
  id,
  assigned_agent_id,
  'Draft a support reply for ' || subject,
  'Draft reply for ' || subject || ': answer from approved documentation, cite the matching source, and route risky details for approval.',
  'demo-enterprise',
  850 + ticket_index * 42,
  case when risk_level = 'critical' then 0.61 when risk_level = 'high' then 0.72 else 0.86 end,
  case when risk_level = 'critical' or status = 'escalated' then 'escalated'::public.approval_status when ticket_index in (1, 4, 7, 10) then 'approved'::public.approval_status else 'draft'::public.approval_status end,
  escalation_reason,
  case when escalation_reason is null then array[]::text[] else array[escalation_reason] end,
  jsonb_build_array(jsonb_build_object('source', 'Seeded support policy', 'chunkId', ('11000000-0000-4000-8000-' || lpad(((ticket_index - 1) % 10 + 1)::text, 12, '0')), 'score', 0.88)),
  case when escalation_reason is null then 'High overlap with approved support docs.' else 'Risk language matched escalation rules.' end,
  now() - (ticket_index || ' hours')::interval
from (
  select row_number() over (order by id) as ticket_index, * from public.tickets order by id limit 10
) tickets
on conflict (id) do update set approval_status = excluded.approval_status, risk_flags = excluded.risk_flags, escalation_reason = excluded.escalation_reason;

insert into public.ai_feedback (id, ai_run_id, user_id, rating)
select
  ('45000000-0000-4000-8000-' || lpad(row_number() over (order by id)::text, 12, '0'))::uuid,
  id,
  user_id,
  case when row_number() over (order by id) in (1, 5) then 'down' else 'up' end
from public.ai_runs
order by id
limit 6
on conflict (id) do nothing;

insert into public.audit_logs (id, ticket_id, user_id, action, details, created_at)
select
  ('50000000-0000-4000-8000-' || lpad(row_number() over (order by id)::text, 12, '0'))::uuid,
  ticket_id,
  user_id,
  'ai_run.' || approval_status::text,
  jsonb_build_object('confidence', confidence, 'riskFlags', risk_flags, 'model', model),
  created_at
from public.ai_runs
on conflict (id) do nothing;

insert into public.escalation_rules (id, name, trigger, risk_level, requires_manager_approval) values
  ('60000000-0000-4000-8000-000000000001', 'Low confidence', 'confidence < 0.72', 'medium', false),
  ('60000000-0000-4000-8000-000000000002', 'Angry sentiment', 'sentiment = angry', 'high', true),
  ('60000000-0000-4000-8000-000000000003', 'Legal or policy risk', 'legal|policy|DPA|GDPR', 'critical', true),
  ('60000000-0000-4000-8000-000000000004', 'Billing/refund risk', 'refund|billing|invoice|charge', 'high', true),
  ('60000000-0000-4000-8000-000000000005', 'Sensitive data exposure', 'password|token|secret|api key', 'critical', true)
on conflict (id) do update set trigger = excluded.trigger, risk_level = excluded.risk_level, requires_manager_approval = excluded.requires_manager_approval;

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

insert into public.usage_events (id, tenant_id, workspace_id, event_type, quantity, metadata, created_at)
select
  ('65000000-0000-4000-8000-' || lpad(row_number() over (order by id)::text, 12, '0'))::uuid,
  tenant_id,
  workspace_id,
  case when approval_status = 'escalated' then 'chat.escalated'::public.usage_event_type else 'chat.answered'::public.usage_event_type end,
  1,
  jsonb_build_object('aiRunId', id, 'model', model, 'confidence', confidence),
  created_at
from public.ai_runs
on conflict (id) do update set event_type = excluded.event_type, metadata = excluded.metadata, created_at = excluded.created_at;

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

insert into public.security_events (tenant_id, workspace_id, event_type, severity, origin, ip_hash, details)
values
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','blocked_origin','medium','https://unknown.example','demo_ip_hash','{"reason":"Origin is not on the verified workspace domain list."}'::jsonb),
  ('70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','pii_redacted','high','https://supportpilot-demo.vercel.app','demo_ip_hash','{"fields":["email","phone"]}'::jsonb)
on conflict do nothing;

insert into public.model_route_logs (tenant_id, workspace_id, ai_run_id, route, task, provider, model, latency_ms, input_tokens, output_tokens, estimated_cost_usd, confidence, reason)
select
  tenant_id,
  workspace_id,
  id,
  case when risk_flags && array['Legal approval required','Sensitive data exposure','GDPR request'] then 'R5' else case when approval_status = 'escalated' then 'R4' else 'R2' end end,
  case when approval_status = 'escalated' then 'high-risk draft' else 'easy cited answer' end,
  'demo',
  model,
  latency_ms,
  620,
  190,
  0.002,
  confidence,
  case when array_length(risk_flags, 1) is null then 'Approved-source answer with low policy risk.' else array_to_string(risk_flags, ', ') end
from public.ai_runs
on conflict do nothing;

insert into public.grounding_checks (tenant_id, workspace_id, ai_run_id, status, score, citation_coverage, freshness_score, notes)
select
  tenant_id,
  workspace_id,
  id,
  case when approval_status = 'escalated' then 'needs_review' else 'pass' end,
  case when approval_status = 'escalated' then 0.66 else 0.89 end,
  0.9,
  0.82,
  'Seeded draft includes approved source citation metadata.'
from public.ai_runs
on conflict do nothing;

insert into public.policy_evaluations (tenant_id, workspace_id, ai_run_id, action, reasons, required_role, allowed_tools, risk_level)
select
  tenant_id,
  workspace_id,
  id,
  case when approval_status = 'escalated' then 'approve_required' else 'answer' end,
  case when array_length(risk_flags, 1) is null then array['approved_sources','confidence_above_threshold'] else risk_flags end,
  case when approval_status = 'escalated' then 'manager'::public.membership_role else null end,
  array['search_knowledge','get_ticket_history','get_workspace_policy'],
  case when approval_status = 'escalated' then 'high'::public.risk_level else 'low'::public.risk_level end
from public.ai_runs
on conflict do nothing;
