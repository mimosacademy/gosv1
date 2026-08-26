-- Phase 1 / 012: private Storage bucket and access policies
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('pms-documents','pms-documents',false,52428800,array['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','text/csv']) on conflict(id) do update set public=false;

create policy pms_documents_select on storage.objects for select to authenticated using(bucket_id='pms-documents' and auth.uid() is not null);
create policy pms_documents_insert on storage.objects for insert to authenticated with check(bucket_id='pms-documents' and public.is_staff_or_admin());
create policy pms_documents_update on storage.objects for update to authenticated using(bucket_id='pms-documents' and public.is_staff_or_admin()) with check(bucket_id='pms-documents' and public.is_staff_or_admin());
create policy pms_documents_delete on storage.objects for delete to authenticated using(bucket_id='pms-documents' and public.is_admin());

-- Recommended path: programmes/{programme_id}/{document_uuid}-{filename}
