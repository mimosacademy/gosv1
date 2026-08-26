-- MIMOS Academy PMS — authoritative reconciliation after initial Supabase install
-- Source of truth: readme/mimos_pms_section1.sql .. section4.sql + design documents.
-- NON-DESTRUCTIVE: safe to run after the initial consolidated installer.

begin;

drop function if exists public.fn_days_outstanding(date, boolean);

create or replace function public.fn_days_outstanding(p_due_date date, p_payment_status_id bigint)
returns integer
language plpgsql stable
as $$
declare v_paid_id bigint;
begin
  select id into v_paid_id from public.payment_status where code='PAID' limit 1;
  if p_due_date is null or (v_paid_id is not null and p_payment_status_id=v_paid_id) then return null; end if;
  return current_date - p_due_date;
end;
$$;

create or replace function public.guard_profile_authorization_fields()
returns trigger language plpgsql security invoker set search_path=public
as $$
begin
  if auth.uid()=old.id and not public.is_admin() then
    new.role:=old.role; new.staff_id:=old.staff_id; new.is_active:=old.is_active;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard_authorization on public.profiles;
create trigger trg_profiles_guard_authorization before update on public.profiles
for each row execute function public.guard_profile_authorization_fields();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,email,full_name,role,is_active)
  values(new.id,new.email,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),split_part(coalesce(new.email,''),'@',1)),'staff',true)
  on conflict(id) do update set email=excluded.email,full_name=coalesce(nullif(excluded.full_name,''),public.profiles.full_name);
  return new;
end;
$$;

create or replace view public.v_r1_income_statement with (security_invoker=true) as
select i.id invoice_id,i.invoice_no,i.invoice_date,i.due_date,
 public.fn_days_outstanding(i.due_date,i.payment_status_id) days_outstanding,
 p.id programme_id,p.programme_code,p.title programme_title,c.id client_id,c.company_name client_name,
 a.code account_code,a.name account_name,rt.code revenue_type_code,rt.name revenue_type_name,
 i.amount_excl_tax,i.sst_amount,i.sst_rate,i.total_incl_tax,i.amount_collected,i.amount_outstanding,
 ps.code payment_status_code,ps.name payment_status_name,i.payment_date,
 pm.code payment_method_code,pm.name payment_method_name,pt.code payment_terms_code,pt.name payment_terms_name,
 i.quotation_no_ref,i.po_no_ref,i.training_start_date,i.training_end_date,
 am.full_name account_manager,pic.full_name pic_name,i.is_placeholder,i.is_cancelled,i.source_file,i.source_row_number
from public.invoice i
left join public.programme p on p.id=i.programme_id
left join public.client c on c.id=i.client_id
left join public.account a on a.id=i.account_id
left join public.revenue_type rt on rt.id=i.revenue_type_id
left join public.payment_status ps on ps.id=i.payment_status_id
left join public.payment_method pm on pm.id=i.payment_method_id
left join public.payment_terms pt on pt.id=i.payment_terms_id
left join public.staff am on am.id=p.account_manager_id
left join public.staff pic on pic.id=p.pic_id
where not i.is_cancelled;

alter view public.v_r2_training_stats set(security_invoker=true);
alter view public.v_r3_funnel_pipeline set(security_invoker=true);
alter view public.v_programme_completeness set(security_invoker=true);
alter view public.v_financial_dashboard set(security_invoker=true);
alter view public.v_action_item_dashboard set(security_invoker=true);
alter view public.v_payment_collection set(security_invoker=true);
alter view public.v_staff_performance set(security_invoker=true);

create or replace function public.fn_refresh_invoice(p_invoice_id bigint)
returns void language plpgsql
as $$
declare v_total numeric; v_collected numeric; v_due date; v_status bigint;
begin
  select coalesce(total_incl_tax,coalesce(amount_excl_tax,0)+coalesce(sst_amount,0)),due_date,payment_status_id
  into v_total,v_due,v_status from public.invoice where id=p_invoice_id;
  if not found then return; end if;
  select coalesce(sum(total_amount),0) into v_collected from public.payment where invoice_id=p_invoice_id;
  update public.invoice set total_incl_tax=v_total,amount_collected=v_collected,
    amount_outstanding=greatest(v_total-v_collected,0),
    days_outstanding=public.fn_days_outstanding(v_due,v_status),updated_at=now()
  where id=p_invoice_id;
end;
$$;

create or replace function public.fn_refresh_programme(p_programme_id bigint)
returns void language plpgsql
as $$
begin
 update public.programme p set
  total_revenue_excl_tax=coalesce(x.revenue_excl,0),total_sst_amount=coalesce(x.sst,0),
  total_revenue_incl_tax=coalesce(x.revenue_incl,0),total_collected=coalesce(x.collected,0),
  total_outstanding=coalesce(x.outstanding,0),updated_at=now()
 from (select programme_id,
   sum(case when not is_cancelled and not is_placeholder then coalesce(amount_excl_tax,0) else 0 end) revenue_excl,
   sum(case when not is_cancelled and not is_placeholder then coalesce(sst_amount,0) else 0 end) sst,
   sum(case when not is_cancelled and not is_placeholder then coalesce(total_incl_tax,0) else 0 end) revenue_incl,
   sum(case when not is_cancelled and not is_placeholder then coalesce(amount_collected,0) else 0 end) collected,
   sum(case when not is_cancelled and not is_placeholder then coalesce(amount_outstanding,0) else 0 end) outstanding
  from public.invoice where programme_id=p_programme_id group by programme_id) x
 where p.id=x.programme_id;
end;
$$;

create or replace function public.fn_programme_completeness(p_programme_id bigint)
returns numeric language plpgsql stable
as $$
declare score numeric:=0; delivered boolean:=false;
begin
 if exists(select 1 from public.quotation where programme_id=p_programme_id) then score:=score+1; end if;
 if exists(select 1 from public.purchase_order where programme_id=p_programme_id) then score:=score+1; end if;
 if exists(select 1 from public.invoice where programme_id=p_programme_id and not is_placeholder) then score:=score+1; end if;
 if exists(select 1 from public.payment where programme_id=p_programme_id) then score:=score+1; end if;
 select exists(select 1 from public.programme p join public.programme_status ps on ps.id=p.programme_status_id where p.id=p_programme_id and ps.code in('DELIVERED','COMPLETED')) into delivered;
 if delivered then score:=score+1; end if;
 if exists(select 1 from public.training_stat where programme_id=p_programme_id) then score:=score+1; end if;
 if exists(select 1 from public.invoice where programme_id=p_programme_id and coalesce(amount_excl_tax,0)>0) then score:=score+1; end if;
 if exists(select 1 from public.programme where id=p_programme_id and pic_id is not null) then score:=score+1; end if;
 return round((score/8)*100,2);
end;
$$;

create or replace function public.fn_refresh_all_financials()
returns integer language plpgsql
as $$
declare r record; n integer:=0;
begin
 for r in select id from public.invoice loop perform public.fn_refresh_invoice(r.id); end loop;
 for r in select id from public.programme loop perform public.fn_refresh_programme(r.id); n:=n+1; end loop;
 return n;
end;
$$;

create or replace function public.fn_evaluate_all_completeness()
returns integer language plpgsql
as $$
declare r record; n integer:=0; s numeric;
begin
 for r in select id from public.programme loop
  s:=public.fn_programme_completeness(r.id);
  insert into public.completeness_score(programme_id,overall_score,overall_status,evaluated_at,evaluated_by)
  values(r.id,s,case when s>=100 then 'COMPLETE' when s>=75 then 'MOSTLY_COMPLETE' when s>=50 then 'PARTIAL' else 'INCOMPLETE' end,now(),auth.uid())
  on conflict(programme_id) do update set overall_score=excluded.overall_score,overall_status=excluded.overall_status,evaluated_at=excluded.evaluated_at,evaluated_by=excluded.evaluated_by;
  n:=n+1;
 end loop; return n;
end;
$$;

create or replace function public.fn_overdue_invoices()
returns table(invoice_id bigint,invoice_no varchar,programme_id bigint,client_id bigint,due_date date,amount_outstanding numeric,days_outstanding integer)
language sql stable
as $$
 select i.id,i.invoice_no,i.programme_id,i.client_id,i.due_date,i.amount_outstanding,current_date-i.due_date
 from public.invoice i where not i.is_cancelled and not i.is_placeholder and i.due_date<current_date and i.amount_outstanding>0
 order by i.due_date;
$$;

create or replace function public.fn_pipeline_by_salesman(p_salesman_id bigint default null)
returns table(opportunity_id bigint,opportunity_code varchar,project_title varchar,client_name varchar,forecast_value numeric,probability_percentage numeric,weighted_value numeric,opportunity_status_code varchar,expected_close_date date,salesman_id bigint)
language sql stable
as $$
 select o.id,o.opportunity_code,o.project_title,c.company_name,o.forecast_value,o.probability_percentage,
 coalesce(o.weighted_value,public.fn_weighted_forecast(o.forecast_value,o.probability_percentage)),os.code,o.expected_close_date,o.salesman_id
 from public.opportunity o left join public.client c on c.id=o.client_id left join public.opportunity_status os on os.id=o.opportunity_status_id
 where p_salesman_id is null or o.salesman_id=p_salesman_id order by o.expected_close_date nulls last,o.id;
$$;

create or replace function public.fn_export_r1() returns setof public.v_r1_income_statement language sql stable as $$ select * from public.v_r1_income_statement $$;
create or replace function public.fn_export_r2() returns setof public.v_r2_training_stats language sql stable as $$ select * from public.v_r2_training_stats $$;
create or replace function public.fn_export_r3() returns setof public.v_r3_funnel_pipeline language sql stable as $$ select * from public.v_r3_funnel_pipeline $$;

create unique index if not exists uq_migration_id_map_source_entity_legacy on public.migration_id_map(source_system,entity_type,legacy_id);
create unique index if not exists uq_client_alias_source_name on public.client_alias(lower(source_name));
create unique index if not exists uq_staff_alias_source_name on public.staff_alias(lower(source_name));

commit;
