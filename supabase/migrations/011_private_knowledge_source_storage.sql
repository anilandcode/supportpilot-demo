insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'supportpilot-knowledge-sources',
  'supportpilot-knowledge-sources',
  false,
  52428800,
  array[
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace staff read stored knowledge sources" on storage.objects;
drop policy if exists "workspace staff write stored knowledge sources" on storage.objects;

create policy "workspace staff read stored knowledge sources" on storage.objects
for select using (
  bucket_id = 'supportpilot-knowledge-sources'
  and public.can_access_workspace((storage.foldername(name))[1]::uuid)
);

create policy "workspace staff write stored knowledge sources" on storage.objects
for all using (
  bucket_id = 'supportpilot-knowledge-sources'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','manager','agent']::public.membership_role[])
) with check (
  bucket_id = 'supportpilot-knowledge-sources'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','manager','agent']::public.membership_role[])
);
