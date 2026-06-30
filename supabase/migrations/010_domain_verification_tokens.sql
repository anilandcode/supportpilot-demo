alter table public.workspace_domains
  add column if not exists verification_token text,
  add column if not exists verification_record text,
  add column if not exists verified_at timestamptz,
  add column if not exists last_checked_at timestamptz,
  add column if not exists verification_error text;

create index if not exists workspace_domains_verification_token_idx on public.workspace_domains(workspace_id, verification_token);

update public.workspace_domains
set
  verified_at = coalesce(verified_at, created_at),
  last_checked_at = coalesce(last_checked_at, created_at)
where status = 'verified';
