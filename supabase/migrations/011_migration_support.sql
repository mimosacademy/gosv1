-- Phase 1 / 011: lineage and PocketBase/Excel migration map
create table public.migration_id_map (
 id bigint generated always as identity primary key, source_system text not null, entity_type text not null, legacy_id text not null, target_id bigint not null, source_file text, source_row_number integer, created_at timestamptz not null default now(), unique(source_system,entity_type,legacy_id)
);
create index idx_migration_id_map_lookup on public.migration_id_map(source_system,entity_type,legacy_id);
alter table public.migration_id_map enable row level security;
create policy migration_map_admin_read on public.migration_id_map for select to authenticated using(public.is_admin());
create policy migration_map_admin_write on public.migration_id_map for all to authenticated using(public.is_admin()) with check(public.is_admin());

create or replace function public.record_audit(p_entity_type text,p_entity_id bigint,p_action text,p_old jsonb,p_new jsonb,p_metadata jsonb default '{}'::jsonb) returns bigint language plpgsql security definer set search_path=public as $$ declare v_id bigint; begin insert into public.audit_log(entity_type,entity_id,action,actor_id,old_data,new_data,metadata) values(p_entity_type,p_entity_id,p_action,auth.uid(),p_old,p_new,p_metadata) returning id into v_id; return v_id; end; $$;
