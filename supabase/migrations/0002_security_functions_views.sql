-- Security, business functions, reporting views, RLS and Storage.

create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid() and is_active=true;
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public as $$
  select coalesce(public.current_app_role()='admin'::public.app_role,false);
$$;
create or replace function public.is_staff_or_admin() returns boolean
language sql stable security definer set search_path=public as $$
  select coalesce(public.current_app_role() = any(array['admin'::public.app_role,'staff'::public.app_role]),false);
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',split_part(coalesce(new.email,''),'@',1)),'staff')
  on conflict(id) do update set email=excluded.email;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.calc_sst(p_net numeric,p_rate numeric default 8.00) returns numeric
language sql immutable as $$ select round(coalesce(p_net,0)*coalesce(p_rate,0)/100,2); $$;
create or replace function public.days_outstanding(p_due_date date,p_paid boolean default false) returns integer
language sql stable as $$ select case when p_paid or p_due_date is null then 0 else greatest(current_date-p_due_date,0) end; $$;
create or replace function public.weighted_forecast(p_value numeric,p_probability numeric) returns numeric
language sql immutable as $$ select round(coalesce(p_value,0)*greatest(least(coalesce(p_probability,0),100),0)/100,2); $$;

create or replace function public.evaluate_completeness(p_entity_type text,p_entity_id bigint) returns numeric
language plpgsql security invoker as $$
declare payload jsonb; total integer; missing integer; score numeric;
begin
  if p_entity_type='programmes' then
    select to_jsonb(p) into payload from public.programmes p where id=p_entity_id;
    if payload is null then return 0; end if;
    total:=8;
    missing:=(case when payload->>'client_id' is null then 1 else 0 end)+(case when payload->>'code' is null then 1 else 0 end)+(case when payload->>'title' is null then 1 else 0 end)+(case when payload->>'start_date' is null then 1 else 0 end)+(case when payload->>'end_date' is null then 1 else 0 end)+(case when payload->>'status' is null then 1 else 0 end)+(case when payload->>'contract_value' is null then 1 else 0 end)+(case when payload->>'created_by' is null then 1 else 0 end);
  elsif p_entity_type='invoices' then
    select to_jsonb(i) into payload from public.invoices i where id=p_entity_id;
    if payload is null then return 0; end if;
    total:=7;
    missing:=(case when payload->>'programme_id' is null then 1 else 0 end)+(case when payload->>'client_id' is null then 1 else 0 end)+(case when payload->>'invoice_no' is null then 1 else 0 end)+(case when payload->>'amount' is null then 1 else 0 end)+(case when payload->>'issue_date' is null then 1 else 0 end)+(case when payload->>'due_date' is null then 1 else 0 end)+(case when payload->>'created_by' is null then 1 else 0 end);
  else return 100; end if;
  score:=round(100.0*(total-missing)/nullif(total,0),2);
  insert into public.completeness_score(entity_type,entity_id,score,missing_fields,evaluated_by) values(p_entity_type,p_entity_id,score,'[]'::jsonb,auth.uid())
  on conflict(entity_type,entity_id) do update set score=excluded.score,evaluated_at=now(),evaluated_by=excluded.evaluated_by;
  return score;
end; $$;

create or replace function public.refresh_invoice_status(p_invoice_id bigint) returns void language plpgsql security invoker as $$
declare inv public.invoices; paid numeric;
begin
  select * into inv from public.invoices where id=p_invoice_id for update;
  if not found then return; end if;
  select coalesce(sum(amount),0) into paid from public.payments where invoice_id=p_invoice_id and status='Completed';
  update public.invoices set paid_amount=least(paid,amount),status=case when paid>=amount then 'Paid' when paid>0 then 'Partial' when due_date is not null and due_date<current_date then 'Overdue' else 'Unpaid' end where id=p_invoice_id;
end; $$;
create or replace function public.refresh_all_financials() returns integer language plpgsql security invoker as $$
declare r record; n integer:=0;
begin for r in select id from public.invoices loop perform public.refresh_invoice_status(r.id); n:=n+1; end loop; return n; end; $$;
create or replace function public.overdue_invoices() returns table(invoice_id bigint,invoice_no text,client_name text,amount numeric,paid_amount numeric,outstanding numeric,days_overdue integer)
language sql stable security invoker as $$
select i.id,i.invoice_no,c.name,i.amount,i.paid_amount,i.amount-i.paid_amount,greatest(current_date-i.due_date,0) from public.invoices i join public.clients c on c.id=i.client_id where i.due_date<current_date and i.paid_amount<i.amount order by i.due_date;
$$;

create or replace view public.v_r1_income_statement as
select date_trunc('month',coalesce(i.issue_date,i.created_at::date))::date month,count(*) invoice_count,sum(i.amount) billed_amount,sum(i.paid_amount) collected_amount,sum(i.amount-i.paid_amount) outstanding_amount
from public.invoices i group by 1 order by 1;
create or replace view public.v_r2_training_stats as
select p.id programme_id,p.code,p.title,p.client_id,c.name client_name,count(distinct td.id) sessions,coalesce(ts.sessions_planned,p.sessions_planned) sessions_planned,coalesce(ts.sessions_delivered,p.sessions_delivered) sessions_delivered,ts.attendance_rate,ts.completion_rate,ts.avg_score,ts.nps_score
from public.programmes p join public.clients c on c.id=p.client_id left join public.training_delivery td on td.programme_id=p.id left join lateral(select * from public.training_statistics x where x.programme_id=p.id order by x.updated_at desc limit 1) ts on true
group by p.id,p.code,p.title,p.client_id,c.name,ts.sessions_planned,ts.sessions_delivered,ts.attendance_rate,ts.completion_rate,ts.avg_score,ts.nps_score;
create or replace view public.v_r3_funnel_pipeline as
select o.stage,count(*) opportunity_count,sum(o.value) pipeline_value,sum(public.weighted_forecast(o.value,o.probability)) weighted_value from public.opportunities o group by o.stage order by o.stage;
create or replace view public.v_financial_dashboard as
select count(*) filter(where status in('Unpaid','Partial','Overdue')) open_invoices,coalesce(sum(amount),0) total_billed,coalesce(sum(paid_amount),0) total_collected,coalesce(sum(amount-paid_amount),0) total_outstanding,coalesce(sum(amount-paid_amount) filter(where due_date<current_date),0) overdue_amount from public.invoices;
create or replace view public.v_action_item_dashboard as
select status,count(*) item_count,count(*) filter(where due_date<current_date and status<>'Completed') overdue_count from public.action_items group by status;
create or replace view public.v_payment_collection as
select i.id invoice_id,i.invoice_no,c.name client_name,i.amount,i.paid_amount,i.amount-i.paid_amount outstanding,i.due_date,public.days_outstanding(i.due_date,i.paid_amount>=i.amount) days_outstanding from public.invoices i join public.clients c on c.id=i.client_id;
create or replace view public.v_staff_performance as
select p.id profile_id,p.full_name,p.email,p.role,count(distinct pr.id) programmes_created,count(distinct a.id) action_items_created from public.profiles p left join public.programmes pr on pr.created_by=p.id left join public.action_items a on a.created_by=p.id group by p.id,p.full_name,p.email,p.role;

-- Enable RLS for all application tables.
do $$ declare t text; begin foreach t in array array['clients','client_contacts','opportunities','programmes','quotations','purchase_orders','training_delivery','training_statistics','participants','invoices','payments','action_items','documents','projects','profiles','completeness_score','source_file','import_batch','stg_import_row','data_conflict','staff_alias','client_alias','audit_history','audit_log','migration_id_map'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

-- Authenticated read access.
do $$ declare t text; begin foreach t in array array['clients','client_contacts','opportunities','programmes','quotations','purchase_orders','training_delivery','training_statistics','participants','invoices','payments','action_items','documents','projects','profiles','completeness_score','source_file','import_batch','stg_import_row','data_conflict','staff_alias','client_alias','audit_history'] loop execute format('create policy %I_select on public.%I for select to authenticated using(auth.uid() is not null)',t,t); end loop; end $$;

-- Operational staff/admin writes; admin-only deletes.
do $$ declare t text; begin foreach t in array array['clients','client_contacts','opportunities','programmes','quotations','purchase_orders','training_delivery','training_statistics','participants','invoices','payments','action_items','documents','projects'] loop
execute format('create policy %I_insert on public.%I for insert to authenticated with check(public.is_staff_or_admin())',t,t);
execute format('create policy %I_update on public.%I for update to authenticated using(public.is_staff_or_admin()) with check(public.is_staff_or_admin())',t,t);
execute format('create policy %I_delete on public.%I for delete to authenticated using(public.is_admin())',t,t);
end loop; end $$;

create policy profiles_self_update on public.profiles for update to authenticated using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy profiles_admin_insert on public.profiles for insert to authenticated with check(public.is_admin() or id=auth.uid());
create policy profiles_admin_delete on public.profiles for delete to authenticated using(public.is_admin());
create policy audit_log_admin_read on public.audit_log for select to authenticated using(public.is_admin());
create policy audit_log_staff_insert on public.audit_log for insert to authenticated with check(public.is_staff_or_admin());
create policy migration_id_map_admin_read on public.migration_id_map for select to authenticated using(public.is_admin());
create policy migration_id_map_admin_write on public.migration_id_map for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Import/control tables.
do $$ declare t text; begin foreach t in array array['completeness_score','source_file','import_batch','stg_import_row','data_conflict'] loop
execute format('create policy %I_write on public.%I for all to authenticated using(public.is_staff_or_admin()) with check(public.is_staff_or_admin())',t,t); end loop; end $$;
create policy aliases_staff_read on public.staff_alias for select to authenticated using(auth.uid() is not null);
create policy aliases_admin_write on public.staff_alias for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy client_aliases_staff_read on public.client_alias for select to authenticated using(auth.uid() is not null);
create policy client_aliases_staff_write on public.client_alias for all to authenticated using(public.is_staff_or_admin()) with check(public.is_staff_or_admin());
create policy audit_history_insert on public.audit_history for insert to authenticated with check(public.is_staff_or_admin());

insert into storage.buckets(id,name,public) values('programme-documents','programme-documents',false) on conflict(id) do update set public=false;
create policy programme_documents_select on storage.objects for select to authenticated using(bucket_id='programme-documents');
create policy programme_documents_insert on storage.objects for insert to authenticated with check(bucket_id='programme-documents' and public.is_staff_or_admin());
create policy programme_documents_update on storage.objects for update to authenticated using(bucket_id='programme-documents' and public.is_staff_or_admin()) with check(bucket_id='programme-documents' and public.is_staff_or_admin());
create policy programme_documents_delete on storage.objects for delete to authenticated using(bucket_id='programme-documents' and public.is_admin());
