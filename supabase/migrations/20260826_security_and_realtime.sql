-- Security/performance/realtime hardening applied to the gosv1 Supabase project.
-- Kept as a tracked migration so the database state is reproducible.

begin;
create schema if not exists private;

create or replace function private.current_app_role()
returns public.app_role language sql stable security definer set search_path=public,pg_temp
as $$ select role from public.profiles where id=auth.uid() and is_active $$;

create or replace function public.current_app_role()
returns public.app_role language sql stable security invoker set search_path=public,private,pg_temp
as $$ select case when auth.uid() is null then null::public.app_role else private.current_app_role() end $$;

create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path=public,private,pg_temp
as $$ select case when auth.uid() is null then false else coalesce(private.current_app_role()='admin',false) end $$;

create or replace function public.is_staff_or_admin()
returns boolean language sql stable security invoker set search_path=public,private,pg_temp
as $$ select case when auth.uid() is null then false else coalesce(private.current_app_role() in ('admin','staff'),false) end $$;

revoke all on function private.current_app_role() from public,anon;
grant execute on function private.current_app_role() to authenticated;

revoke all on function public.handle_new_user() from public,anon,authenticated;
revoke all on function public.record_audit(text,bigint,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.trg_invoice_refresh_programme() from public,anon,authenticated;
revoke all on function public.trg_payment_refresh_invoice() from public,anon,authenticated;

alter function public.set_updated_at() set search_path=public,pg_temp;
alter function public.fn_weighted_forecast(numeric,numeric) set search_path=public,pg_temp;
alter function public.fn_calc_sst(numeric,numeric) set search_path=public,pg_temp;
alter function public.fn_calc_total_incl_sst(numeric,numeric) set search_path=public,pg_temp;
alter function public.fn_days_outstanding(date,bigint) set search_path=public,pg_temp;
alter function public.fn_refresh_invoice(bigint) set search_path=public,pg_temp;
alter function public.fn_refresh_programme(bigint) set search_path=public,pg_temp;
alter function public.fn_programme_completeness(bigint) set search_path=public,pg_temp;
alter function public.guard_profile_authorization_fields() set search_path=public,pg_temp;
alter function public.handle_new_user() set search_path=public,pg_temp;

alter extension citext set schema extensions;

alter publication supabase_realtime add table public.client;
alter publication supabase_realtime add table public.quotation;
alter publication supabase_realtime add table public.purchase_order;
alter publication supabase_realtime add table public.training_stat;
alter publication supabase_realtime add table public.participant;

commit;
