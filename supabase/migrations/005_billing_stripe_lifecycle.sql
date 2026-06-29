do $$ begin
  create type public.billing_tier as enum ('launch', 'pro', 'enterprise');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_interval as enum ('monthly', 'annual');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_checkout_status as enum ('created', 'completed', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_subscription_status as enum (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_dunning_state as enum ('none', 'payment_failed', 'grace_day_3', 'grace_day_7', 'recovered');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_entitlement_source as enum ('demo', 'stripe');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.stripe_webhook_status as enum ('processing', 'processed', 'failed', 'ignored');
exception when duplicate_object then null;
end $$;

create table if not exists public.billing_products (
  id uuid primary key default gen_random_uuid(),
  stripe_product_id text not null unique,
  tier public.billing_tier not null unique,
  name text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.billing_products(id) on delete cascade,
  stripe_price_id text not null unique,
  tier public.billing_tier not null,
  interval public.billing_interval not null,
  currency text not null default 'usd',
  unit_amount integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tier, interval)
);

create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  stripe_customer_id text not null unique,
  email text,
  name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table if not exists public.billing_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  price_id text not null,
  tier public.billing_tier not null,
  interval public.billing_interval not null,
  status public.billing_checkout_status not null default 'created',
  url text,
  actor_user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text,
  tier public.billing_tier not null default 'launch',
  interval public.billing_interval,
  status public.billing_subscription_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  dunning_state public.billing_dunning_state not null default 'none',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  stripe_invoice_id text not null unique,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null,
  amount_due integer not null default 0,
  amount_paid integer not null default 0,
  currency text not null default 'usd',
  hosted_invoice_url text,
  invoice_pdf text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  tier public.billing_tier not null default 'launch',
  status text not null default 'demo',
  limits jsonb not null default '{}'::jsonb,
  source public.billing_entitlement_source not null default 'demo',
  stripe_subscription_id text,
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id, workspace_id)
);

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  livemode boolean not null default false,
  status public.stripe_webhook_status not null default 'processing',
  error text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists billing_prices_tier_interval_idx on public.billing_prices(tier, interval);
create index if not exists stripe_customers_tenant_idx on public.stripe_customers(tenant_id);
create index if not exists checkout_sessions_tenant_status_idx on public.billing_checkout_sessions(tenant_id, status, created_at desc);
create index if not exists subscriptions_tenant_status_idx on public.subscriptions(tenant_id, status);
create index if not exists subscriptions_customer_idx on public.subscriptions(stripe_customer_id);
create index if not exists invoices_tenant_created_idx on public.invoices(tenant_id, created_at desc);
create index if not exists entitlements_tenant_workspace_idx on public.entitlements(tenant_id, workspace_id);
create index if not exists stripe_webhook_events_status_idx on public.stripe_webhook_events(status, received_at desc);

alter table public.billing_products enable row level security;
alter table public.billing_prices enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.billing_checkout_sessions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.entitlements enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists "authenticated read billing products" on public.billing_products;
drop policy if exists "authenticated read billing prices" on public.billing_prices;
drop policy if exists "owners manage stripe customers" on public.stripe_customers;
drop policy if exists "owners manage checkout sessions" on public.billing_checkout_sessions;
drop policy if exists "owners read subscriptions" on public.subscriptions;
drop policy if exists "owners read invoices" on public.invoices;
drop policy if exists "workspace members read entitlements" on public.entitlements;

create policy "authenticated read billing products" on public.billing_products
for select to authenticated using (true);

create policy "authenticated read billing prices" on public.billing_prices
for select to authenticated using (true);

create policy "owners manage stripe customers" on public.stripe_customers
for all using (public.is_org_owner(tenant_id))
with check (public.is_org_owner(tenant_id));

create policy "owners manage checkout sessions" on public.billing_checkout_sessions
for all using (public.is_org_owner(tenant_id))
with check (public.is_org_owner(tenant_id));

create policy "owners read subscriptions" on public.subscriptions
for select using (public.is_org_owner(tenant_id));

create policy "owners read invoices" on public.invoices
for select using (public.is_org_owner(tenant_id));

create policy "workspace members read entitlements" on public.entitlements
for select using (
  public.is_org_owner(tenant_id)
  or workspace_id is not null and public.can_access_workspace(workspace_id)
);

insert into public.billing_products (stripe_product_id, tier, name, metadata)
values
  ('supportpilot_launch', 'launch', 'SupportPilot Launch', '{"source":"config"}'::jsonb),
  ('supportpilot_pro', 'pro', 'SupportPilot Pro', '{"source":"config"}'::jsonb),
  ('supportpilot_enterprise', 'enterprise', 'SupportPilot Enterprise', '{"source":"manual_quote"}'::jsonb)
on conflict (tier) do update set
  stripe_product_id = excluded.stripe_product_id,
  name = excluded.name,
  metadata = excluded.metadata,
  updated_at = now();
