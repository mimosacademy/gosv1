-- Phase 1 / 004: programme and commercial core
create table public.programme (
 id bigint generated always as identity primary key,
 programme_code varchar(50), title varchar(500) not null, description text,
 client_id bigint not null references public.client(id) on delete restrict,
 training_type_id bigint references public.training_type(id) on delete set null,
 programme_category_id bigint references public.programme_category(id) on delete set null,
 programme_status_id bigint references public.programme_status(id) on delete set null,
 account_id bigint references public.account(id) on delete set null,
 account_manager_id bigint references public.staff(id) on delete set null,
 pic_id bigint references public.staff(id) on delete set null,
 duration_days numeric(5,2) check(duration_days is null or duration_days>=0), no_of_pax integer check(no_of_pax is null or no_of_pax>=0), start_date date, end_date date,
 total_revenue_excl_tax numeric(18,2) not null default 0, total_sst_amount numeric(18,2) not null default 0, total_revenue_incl_tax numeric(18,2) not null default 0, total_collected numeric(18,2) not null default 0, total_outstanding numeric(18,2) not null default 0,
 is_public_training boolean not null default false, is_in_house boolean not null default false, is_internal boolean not null default false,
 n_a_state public.n_a_state, source_file text, source_row_number integer, import_batch_id bigint,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null, updated_by bigint references public.staff(id) on delete set null,
 constraint chk_programme_dates check(end_date is null or start_date is null or end_date>=start_date)
);
create unique index uq_programme_code_real on public.programme(programme_code) where programme_code is not null and programme_code<>'';
create index idx_programme_client on public.programme(client_id); create index idx_programme_status on public.programme(programme_status_id); create index idx_programme_dates on public.programme(start_date,end_date); create index idx_programme_match on public.programme(client_id,title,start_date,end_date);

create table public.quotation (
 id bigint generated always as identity primary key, quotation_no varchar(100) not null, revision varchar(20) not null default '0',
 programme_id bigint references public.programme(id) on delete set null, client_id bigint not null references public.client(id) on delete restrict, quotation_type_id bigint references public.quotation_type(id) on delete set null, training_type_id bigint references public.training_type(id) on delete set null, quotation_status_id bigint references public.quotation_status(id) on delete set null, account_manager_id bigint references public.staff(id) on delete set null, pic_id bigint references public.staff(id) on delete set null, account_id bigint references public.account(id) on delete set null,
 project_title varchar(500), duration_days numeric(5,2), no_of_unit integer, unit_price_excl_tax numeric(18,4), unit_price_incl_tax numeric(18,4), total_price_excl_tax numeric(18,2), total_price_incl_tax numeric(18,2), sst_amount numeric(18,2), sst_rate numeric(7,5) default .08, discount_percentage numeric(5,2) default 0, discount_amount numeric(18,2) default 0, final_price numeric(18,2), currency varchar(3) not null default 'MYR', quotation_date date, valid_until date, pic_full_name varchar(100), pic_contact_no varchar(50), pic_email varchar(255),
 source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null, updated_by bigint references public.staff(id) on delete set null,
 constraint chk_quotation_sst_rate check(sst_rate between 0 and 1), constraint chk_quotation_discount check(discount_percentage between 0 and 100)
);
create index idx_quotation_programme on public.quotation(programme_id); create index idx_quotation_client on public.quotation(client_id); create index idx_quotation_date on public.quotation(quotation_date); create index idx_quotation_match on public.quotation(quotation_no,client_id,programme_id);

create table public.purchase_order (
 id bigint generated always as identity primary key, po_no varchar(100), po_reference varchar(100), programme_id bigint references public.programme(id) on delete set null, quotation_id bigint references public.quotation(id) on delete set null, client_id bigint not null references public.client(id) on delete restrict, account_id bigint references public.account(id) on delete set null,
 po_date date, po_value_excl_tax numeric(18,2), po_value_incl_tax numeric(18,2), sst_amount numeric(18,2), sst_rate numeric(7,5) default .08, currency varchar(3) not null default 'MYR', description text, po_status varchar(50), is_active boolean not null default true,
 source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null, updated_by bigint references public.staff(id) on delete set null,
 constraint chk_po_sst_rate check(sst_rate between 0 and 1), constraint chk_po_value check(po_value_excl_tax is null or po_value_excl_tax>=0)
);
create index idx_po_programme on public.purchase_order(programme_id); create index idx_po_client on public.purchase_order(client_id); create index idx_po_date on public.purchase_order(po_date);

create table public.invoice (
 id bigint generated always as identity primary key, invoice_no varchar(100), invoice_reference varchar(100), programme_id bigint not null references public.programme(id) on delete restrict, quotation_id bigint references public.quotation(id) on delete set null, purchase_order_id bigint references public.purchase_order(id) on delete set null, client_id bigint not null references public.client(id) on delete restrict, account_id bigint references public.account(id) on delete set null, revenue_type_id bigint references public.revenue_type(id) on delete set null, payment_status_id bigint references public.payment_status(id) on delete set null, payment_terms_id bigint references public.payment_terms(id) on delete set null, payment_method_id bigint references public.payment_method(id) on delete set null,
 invoice_date date, due_date date, training_start_date date, training_end_date date, amount_excl_tax numeric(18,2), sst_amount numeric(18,2), sst_rate numeric(7,5) default .08, total_incl_tax numeric(18,2), amount_collected numeric(18,2) not null default 0, amount_outstanding numeric(18,2) not null default 0, currency varchar(3) not null default 'MYR', payment_date date, days_outstanding integer, quotation_no_ref varchar(100), po_no_ref varchar(100), is_placeholder boolean not null default false, is_cancelled boolean not null default false,
 source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null, updated_by bigint references public.staff(id) on delete set null,
 constraint chk_invoice_dates check(training_end_date is null or training_start_date is null or training_end_date>=training_start_date), constraint chk_invoice_sst_rate check(sst_rate between 0 and 1)
);
create index idx_invoice_programme on public.invoice(programme_id); create index idx_invoice_client on public.invoice(client_id); create index idx_invoice_due_date on public.invoice(due_date); create index idx_invoice_status on public.invoice(payment_status_id); create index idx_invoice_import_batch on public.invoice(import_batch_id); create index idx_invoice_real_no on public.invoice(invoice_no) where invoice_no is not null and invoice_no<>'';

create table public.payment (
 id bigint generated always as identity primary key, payment_reference varchar(100), invoice_id bigint references public.invoice(id) on delete set null, programme_id bigint references public.programme(id) on delete set null, client_id bigint references public.client(id) on delete set null, payment_date date, amount numeric(18,2) not null default 0, sst_amount numeric(18,2) not null default 0, total_amount numeric(18,2) not null default 0, currency varchar(3) not null default 'MYR', amount_allocated numeric(18,2) not null default 0, amount_unallocated numeric(18,2) not null default 0, payment_method_id bigint references public.payment_method(id) on delete set null, payment_status_id bigint references public.payment_status(id) on delete set null, received_by_id bigint references public.staff(id) on delete set null, bank_reference varchar(100), cheque_no varchar(100), transaction_id varchar(150), notes text,
 source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null, updated_by bigint references public.staff(id) on delete set null,
 constraint chk_payment_amount check(amount>=0), constraint chk_payment_alloc check(amount_allocated>=0 and amount_unallocated>=0)
);
create index idx_payment_invoice on public.payment(invoice_id); create index idx_payment_programme on public.payment(programme_id); create index idx_payment_date on public.payment(payment_date); create index idx_payment_status on public.payment(payment_status_id);
