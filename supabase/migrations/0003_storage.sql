-- WonderKids Sprint-2 Storage Buckets
-- Run this via Supabase MCP or SQL editor

-- Images & audio for activities
insert into storage.buckets (id, name, public) values ('images','images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('audio','audio', true)
on conflict (id) do nothing;

-- Public read, authenticated write for guardians/admin
create policy "public read images" on storage.objects for select
using (bucket_id = 'images');

create policy "public read audio" on storage.objects for select
using (bucket_id = 'audio');

create policy "auth write images" on storage.objects for insert
with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "auth write audio" on storage.objects for insert
with check (bucket_id = 'audio' and auth.role() = 'authenticated');

-- Additional policies for update and delete operations
create policy "auth update images" on storage.objects for update
using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "auth update audio" on storage.objects for update
using (bucket_id = 'audio' and auth.role() = 'authenticated');

create policy "auth delete images" on storage.objects for delete
using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "auth delete audio" on storage.objects for delete
using (bucket_id = 'audio' and auth.role() = 'authenticated');
