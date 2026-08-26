create table public.migration_id_map (
  id bigint generated always as identity primary key,
  source_system text not null,
  entity_type text not null,
  legacy_id text not null,
  target_id bigint not null,
  created_at timestamptz not null default now(),
  unique(source_system, entity_type, legacy_id)
);
create index idx_migration_id_map_lookup on public.migration_id_map(source_system, entity_type, legacy_id);
alter table public.migration_id_map enable row level security;
create policy migration_id_map_admin_read on public.migration_id_map for select to authenticated using (public.is_admin());
create policy migration_id_map_admin_write on public.migration_id_map for all to authenticated using (public.is_admin()) with check (public.is_admin());
