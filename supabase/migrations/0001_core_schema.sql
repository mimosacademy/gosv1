-- MIMOS Academy PMS — Supabase/PostgreSQL foundation
-- Programme-centric enterprise model, staging/import lineage, audit/conflict/completeness.
-- Monetary fields use NUMERIC only. No floating-point monetary storage.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','staff','viewer');
create type public.n_a_state as enum ('not_applicable','provided','pending','unknown');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  role public.app_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger
language plpgsql security invoker as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create table public.account_type (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.staff_role (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sector (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.training_type (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payment_method (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payment_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quotation_type (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quotation_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.programme_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.opportunity_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.action_item_status (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payment_terms (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  days integer check (days >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.speed_to_market (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.programme_category (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_type (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.revenue_type (
  id bigint generated always as identity primary key,
  code text not null unique, name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.clients (
  id bigint generated always as identity primary key,
  name text not null,
  industry text,
  contact_person text,
  email text,
  phone text,
  location text,
  status text not null default 'Active' check (status in ('Active','Prospect','Inactive')),
  since date,
  account_type_id bigint references public.account_type(id),
  sector_id bigint references public.sector(id),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.client_contacts (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete restrict,
  name text not null, title text, email text, phone text, is_primary boolean not null default false,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.opportunities (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete restrict,
  title text not null,
  value numeric(18,2) not null default 0 check (value >= 0),
  stage text not null default 'Lead' check (stage in ('Lead','Qualified','Proposal','Negotiation','Won','Lost')),
  probability numeric(5,2) not null default 0 check (probability between 0 and 100),
  expected_close date,
  owner text,
  source text,
  programme_code text,
  linked_programme_id bigint,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.programmes (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete restrict,
  code text not null unique,
  title text not null,
  category text,
  programme_category_id bigint references public.programme_category(id),
  service_type_id bigint references public.service_type(id),
  revenue_type_id bigint references public.revenue_type(id),
  start_date date,
  end_date date,
  venue text,
  pic text,
  trainer text,
  status text not null default 'Scheduled' check (status in ('Scheduled','In Progress','Completed','On Hold')),
  participants integer not null default 0 check (participants >= 0),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  contract_value numeric(18,2) not null default 0 check (contract_value >= 0),
  sessions_planned integer not null default 0 check (sessions_planned >= 0),
  sessions_delivered integer not null default 0 check (sessions_delivered >= 0),
  n_a_state public.n_a_state,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.opportunities add constraint opportunities_linked_programme_fk
  foreign key (linked_programme_id) references public.programmes(id) on delete set null;

create table public.quotations (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete restrict,
  programme_id bigint references public.programmes(id) on delete set null,
  opportunity_id bigint references public.opportunities(id) on delete set null,
  quote_no text not null unique,
  programme_title text,
  programme_code text,
  amount numeric(18,2) not null default 0 check (amount >= 0),
  status text not null default 'Draft' check (status in ('Draft','Sent','Accepted','Rejected','Expired')),
  issue_date date,
  valid_until date,
  prepared_by text,
  quotation_type_id bigint references public.quotation_type(id),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.purchase_orders (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete restrict,
  programme_id bigint references public.programmes(id) on delete set null,
  quotation_id bigint references public.quotations(id) on delete set null,
  po_no text not null unique,
  amount numeric(18,2) not null default 0 check (amount >= 0),
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Closed','On Hold')),
  issue_date date, received_date date,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.training_delivery (
  id bigint generated always as identity primary key,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  title text not null, delivery_date date, delivery_time text, trainer text, venue text,
  mode text check (mode in ('In-Person','Virtual','Hybrid')),
  status text not null default 'Scheduled' check (status in ('Scheduled','Completed','Cancelled')),
  training_type_id bigint references public.training_type(id),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.training_statistics (
  id bigint generated always as identity primary key,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  sessions_planned integer not null default 0,
  sessions_delivered integer not null default 0,
  attendance_rate numeric(6,3) check (attendance_rate between 0 and 100),
  completion_rate numeric(6,3) check (completion_rate between 0 and 100),
  avg_score numeric(6,3) check (avg_score between 0 and 5),
  nps_score numeric(6,3), last_session date,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.participants (
  id bigint generated always as identity primary key,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  client_id bigint references public.clients(id) on delete set null,
  name text not null, email text, company text, phone text,
  status text not null default 'Confirmed' check (status in ('Confirmed','Attending','Waitlisted','Completed','Withdrawn')),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.invoices (
  id bigint generated always as identity primary key,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  client_id bigint not null references public.clients(id) on delete restrict,
  invoice_no text not null unique,
  description text,
  amount numeric(18,2) not null default 0 check (amount >= 0),
  paid_amount numeric(18,2) not null default 0 check (paid_amount >= 0 and paid_amount <= amount),
  issue_date date, due_date date,
  status text not null default 'Unpaid' check (status in ('Unpaid','Paid','Overdue','Partial')),
  payment_terms_id bigint references public.payment_terms(id),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.payments (
  id bigint generated always as identity primary key,
  invoice_id bigint references public.invoices(id) on delete set null,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  client_id bigint not null references public.clients(id) on delete restrict,
  payment_no text not null unique,
  amount numeric(18,2) not null default 0 check (amount >= 0),
  method text, payment_date date, reference text,
  status text not null default 'Completed' check (status in ('Completed','Pending','Failed')),
  payment_method_id bigint references public.payment_method(id),
  payment_status_id bigint references public.payment_status(id),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.action_items (
  id bigint generated always as identity primary key,
  programme_id bigint references public.programmes(id) on delete set null,
  title text not null, related_to text, owner text, due_date date,
  priority text check (priority in ('Low','Medium','High')),
  status text not null default 'Open' check (status in ('Open','In Progress','Completed')),
  action_item_status_id bigint references public.action_item_status(id),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.documents (
  id bigint generated always as identity primary key,
  programme_id bigint not null references public.programmes(id) on delete restrict,
  name text not null, document_type text, storage_path text,
  uploaded_by uuid references auth.users(id), document_date date, file_size bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.projects (
  id bigint generated always as identity primary key,
  programme_id bigint references public.programmes(id) on delete set null,
  name text not null, status text, description text,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.audit_history (
  id bigint generated always as identity primary key,
  programme_id bigint references public.programmes(id) on delete set null,
  action text not null, entity text, description text, actor_id uuid references auth.users(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.source_file (
  id bigint generated always as identity primary key,
  file_name text not null, storage_path text, content_hash text,
  source_type text, imported_at timestamptz not null default now(), imported_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create table public.import_batch (
  id bigint generated always as identity primary key,
  source_file_id bigint references public.source_file(id) on delete set null,
  status text not null default 'staged' check (status in ('staged','validated','committed','rejected','rolled_back')),
  row_count integer not null default 0, valid_count integer not null default 0, invalid_count integer not null default 0,
  started_at timestamptz not null default now(), completed_at timestamptz, created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);

create table public.completeness_score (
  id bigint generated always as identity primary key,
  entity_type text not null, entity_id bigint not null,
  score numeric(6,3) not null default 0 check (score between 0 and 100),
  missing_fields jsonb not null default '[]'::jsonb,
  evaluated_at timestamptz not null default now(), evaluated_by uuid references auth.users(id),
  unique(entity_type, entity_id)
);
create table public.data_conflict (
  id bigint generated always as identity primary key,
  import_batch_id bigint references public.import_batch(id) on delete cascade,
  entity_type text not null, business_key text not null,
  existing_record_id bigint, staged_payload jsonb not null,
  conflict_type text not null, resolution text check (resolution in ('pending','keep_existing','use_staged','merge','discard')),
  resolved_by uuid references auth.users(id), resolved_at timestamptz, notes text,
  created_at timestamptz not null default now()
);
create table public.staff_alias (
  id bigint generated always as identity primary key,
  canonical_user_id uuid references auth.users(id) on delete set null,
  alias_name text not null unique, source text, created_at timestamptz not null default now()
);
create table public.client_alias (
  id bigint generated always as identity primary key,
  canonical_client_id bigint references public.clients(id) on delete set null,
  alias_name text not null unique, source text, created_at timestamptz not null default now()
);
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id), action text not null, entity_type text, entity_id bigint,
  old_data jsonb, new_data jsonb, request_id uuid, created_at timestamptz not null default now()
);

create table public.stg_import_row (
  id bigint generated always as identity primary key,
  import_batch_id bigint not null references public.import_batch(id) on delete cascade,
  source_row_number integer not null,
  entity_type text not null,
  business_key text,
  raw_data jsonb not null,
  normalized_data jsonb,
  validation_status text not null default 'pending' check (validation_status in ('pending','valid','invalid','conflict','committed')),
  validation_errors jsonb not null default '[]'::jsonb,
  target_id bigint,
  created_at timestamptz not null default now(),
  unique(import_batch_id, source_row_number)
);

create index idx_clients_status on public.clients(status);
create index idx_clients_sector on public.clients(sector_id);
create index idx_client_contacts_client on public.client_contacts(client_id);
create index idx_programmes_client on public.programmes(client_id);
create index idx_programmes_status on public.programmes(status);
create index idx_programmes_dates on public.programmes(start_date, end_date);
create index idx_opportunities_client on public.opportunities(client_id);
create index idx_opportunities_stage on public.opportunities(stage);
create index idx_quotations_client on public.quotations(client_id);
create index idx_quotations_programme on public.quotations(programme_id);
create index idx_purchase_orders_client on public.purchase_orders(client_id);
create index idx_purchase_orders_programme on public.purchase_orders(programme_id);
create index idx_training_delivery_programme on public.training_delivery(programme_id);
create index idx_training_statistics_programme on public.training_statistics(programme_id);
create index idx_participants_programme on public.participants(programme_id);
create index idx_invoices_programme on public.invoices(programme_id);
create index idx_invoices_client on public.invoices(client_id);
create index idx_invoices_due_date on public.invoices(due_date);
create index idx_payments_programme on public.payments(programme_id);
create index idx_payments_invoice on public.payments(invoice_id);
create index idx_action_items_programme on public.action_items(programme_id);
create index idx_action_items_due on public.action_items(due_date);
create index idx_documents_programme on public.documents(programme_id);
create index idx_audit_history_programme on public.audit_history(programme_id);
create index idx_stg_import_batch on public.stg_import_row(import_batch_id);
create index idx_stg_import_business_key on public.stg_import_row(entity_type, business_key);
create index idx_conflict_batch on public.data_conflict(import_batch_id);
create index idx_audit_log_entity on public.audit_log(entity_type, entity_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['account_type','staff_role','sector','training_type','payment_method','payment_status','quotation_type','quotation_status','programme_status','project_status','opportunity_status','action_item_status','payment_terms','speed_to_market','programme_category','service_type','revenue_type','clients','client_contacts','opportunities','programmes','quotations','purchase_orders','training_delivery','training_statistics','participants','invoices','payments','action_items','documents','projects','profiles'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

insert into public.programme_status(code,name) values
 ('scheduled','Scheduled'),('in_progress','In Progress'),('completed','Completed'),('on_hold','On Hold') on conflict do nothing;
insert into public.opportunity_status(code,name) values
 ('lead','Lead'),('qualified','Qualified'),('proposal','Proposal'),('negotiation','Negotiation'),('won','Won'),('lost','Lost') on conflict do nothing;
insert into public.payment_status(code,name) values
 ('completed','Completed'),('pending','Pending'),('failed','Failed') on conflict do nothing;
insert into public.payment_method(code,name) values
 ('bank_transfer','Bank Transfer'),('cheque','Cheque'),('online_banking','Online Banking'),('credit_card','Credit Card') on conflict do nothing;

-- Generic audit trigger. It records data changes without exposing sensitive auth fields.
create or replace function public.write_audit_log() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.audit_log(actor_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), tg_op, tg_table_name,
          case when tg_op='DELETE' then (to_jsonb(old)->>'id')::bigint else (to_jsonb(new)->>'id')::bigint end,
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return case when tg_op='DELETE' then old else new end;
end; $$;

create trigger clients_audit after insert or update or delete on public.clients for each row execute function public.write_audit_log();
create trigger programmes_audit after insert or update or delete on public.programmes for each row execute function public.write_audit_log();
create trigger quotations_audit after insert or update or delete on public.quotations for each row execute function public.write_audit_log();
create trigger purchase_orders_audit after insert or update or delete on public.purchase_orders for each row execute function public.write_audit_log();
create trigger invoices_audit after insert or update or delete on public.invoices for each row execute function public.write_audit_log();
create trigger payments_audit after insert or update or delete on public.payments for each row execute function public.write_audit_log();
