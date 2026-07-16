insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'supportpilot-audit-evidence',
  'supportpilot-audit-evidence',
  false,
  52428800,
  array['application/json']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace members read audit evidence artifacts" on storage.objects;
drop policy if exists "workspace managers write audit evidence artifacts" on storage.objects;

create policy "workspace members read audit evidence artifacts" on storage.objects
for select using (
  bucket_id = 'supportpilot-audit-evidence'
  and public.can_access_workspace((storage.foldername(name))[1]::uuid)
);

create policy "workspace managers write audit evidence artifacts" on storage.objects
for all using (
  bucket_id = 'supportpilot-audit-evidence'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','manager']::public.membership_role[])
) with check (
  bucket_id = 'supportpilot-audit-evidence'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','manager']::public.membership_role[])
);
