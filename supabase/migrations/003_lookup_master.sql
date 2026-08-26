-- Phase 1 / 003: lookup + master data
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email citext unique,
 full_name text not null,
 role public.app_role not null default 'staff',
 staff_id bigint,
 is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.account_type (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.staff_role (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.sector (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.training_type (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.payment_method (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.payment_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.quotation_type (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.quotation_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.programme_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.project_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.opportunity_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.action_item_status (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.payment_terms (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, days integer check(days>=0), description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.speed_to_market (id bigint generated always as identity primary key, code varchar(10) not null unique, name varchar(50) not null, quarter varchar(10), year integer check(year between 2000 and 2200), description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.programme_category (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.service_type (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.revenue_type (id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.account (
 id bigint generated always as identity primary key, code varchar(20) not null unique, name varchar(100) not null, description varchar(255), account_type_id bigint references public.account_type(id) on delete set null, is_active boolean not null default true, source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint
);
create table public.staff (
 id bigint generated always as identity primary key, staff_number varchar(50), full_name varchar(100) not null, email citext not null unique, phone varchar(50), role_id bigint references public.staff_role(id) on delete set null, is_active boolean not null default true, source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null
);
create table public.client (
 id bigint generated always as identity primary key, company_name varchar(255) not null, registration_number varchar(100), address text, sector_id bigint references public.sector(id) on delete set null, is_active boolean not null default true, source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null
);
create table public.client_contact (
 id bigint generated always as identity primary key, client_id bigint not null references public.client(id) on delete cascade, contact_name varchar(100) not null, contact_email varchar(255), contact_phone varchar(50), contact_designation varchar(100), is_primary boolean not null default false, is_active boolean not null default true, source_file text, source_row_number integer, import_batch_id bigint, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by bigint references public.staff(id) on delete set null
);

insert into public.account_type(code,name,description) values ('MSSB','MIMOS Services Sdn Bhd','Primary operating subsidiary'),('MB','MIMOS Berhad','Parent company / holding entity'),('MIMOS','MIMOS Group','Generic MIMOS entity'),('MH','MIMOS Holdings','Investment holding company'),('OTHER','Other','Third party or external entity') on conflict(code) do nothing;
insert into public.staff_role(code,name,description) values ('MASB_TEAM','MASB Team','Core MIMOS Academy team member'),('SUPER_ADMIN','Super Admin','System administrator'),('MANAGER','Manager','Team manager'),('PIC','Person In Charge','Programme owner'),('SALES','Sales','Business development'),('FINANCE','Finance','Financial operations'),('TRAINER','Trainer','Training delivery'),('INTERN','Intern','Temporary staff') on conflict(code) do nothing;
insert into public.sector(code,name) values ('GOVT','Government'),('PRIVATE','Private Sector'),('INTERCO','Intercompany'),('ACADEMIC','Academic'),('NGO','NGO'),('OTHER','Other') on conflict(code) do nothing;
