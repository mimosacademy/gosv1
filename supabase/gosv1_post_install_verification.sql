-- MIMOS Academy PMS — post-install verification for Supabase project gosv1
-- Run AFTER gosv1_consolidated.sql has completed successfully.

select current_database() as database_name, now() as verified_at;

select table_schema, table_name
from information_schema.tables
where table_schema='public'
order by table_name;

select typname as enum_name
from pg_type
where typtype='e' and typnamespace='public'::regnamespace
order by typname;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname='public'
order by tablename;

select n.nspname as schema_name,
       c.relname as table_name,
       count(*) filter (where p.polname is not null) as policy_count
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
left join pg_policy p on p.polrelid=c.oid
where n.nspname='public' and c.relkind='r'
group by n.nspname,c.relname
order by c.relname;

select table_name, column_name, data_type
from information_schema.columns
where table_schema='public'
  and (data_type in ('numeric','jsonb','timestamp with time zone')
       or column_name in ('created_by','updated_by'))
order by table_name, ordinal_position;

select indexname, tablename
from pg_indexes
where schemaname='public'
order by tablename,indexname;

select b.id, b.name, b.public, b.file_size_limit
from storage.buckets b
where b.id='pms-documents';

select pubname, schemaname, tablename
from pg_publication_tables
where pubname='supabase_realtime'
order by tablename;

-- Expected key objects
select to_regclass('public.programme') as programme_table,
       to_regclass('public.invoice') as invoice_table,
       to_regclass('public.payment') as payment_table,
       to_regclass('public.opportunity') as opportunity_table,
       to_regclass('public.audit_log') as audit_log_table,
       to_regclass('public.data_conflict') as conflict_table,
       to_regclass('public.completeness_score') as completeness_table;

select to_regprocedure('public.fn_days_outstanding(date,boolean)') as days_outstanding_fn,
       to_regprocedure('public.fn_weighted_forecast(numeric,numeric)') as weighted_forecast_fn,
       to_regprocedure('public.fn_calc_sst(numeric,numeric)') as sst_fn,
       to_regprocedure('public.fn_refresh_invoice(bigint)') as refresh_invoice_fn,
       to_regprocedure('public.fn_refresh_programme(bigint)') as refresh_programme_fn,
       to_regprocedure('public.fn_programme_completeness(bigint)') as completeness_fn;

select table_name
from information_schema.views
where table_schema='public'
  and table_name in (
    'v_r1_income_statement',
    'v_r2_training_stats',
    'v_r3_funnel_pipeline',
    'v_programme_completeness',
    'v_financial_dashboard',
    'v_action_item_dashboard',
    'v_payment_collection',
    'v_staff_performance'
  )
order by table_name;

-- Auth/profile readiness. This must be 0 until staff users are provisioned.
select count(*) as application_profiles
from public.profiles;

select count(*) as auth_users
from auth.users;
