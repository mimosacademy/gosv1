-- Align application staff records with Supabase Auth UUIDs.
-- The bigint staff PK remains the business/relational identifier; auth_user_id
-- is the identity bridge used by the application and RLS.
begin;

alter table public.staff
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists uq_staff_auth_user_id
  on public.staff(auth_user_id)
  where auth_user_id is not null;

alter table public.profiles
  add constraint profiles_staff_id_fkey
  foreign key (staff_id) references public.staff(id) on delete set null;

create or replace function public.sync_profile_staff_link()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  matched_staff_id bigint;
begin
  select s.id into matched_staff_id
  from public.staff s
  where lower(s.email::text) = lower(new.email::text)
  order by s.is_active desc, s.id
  limit 1;

  if matched_staff_id is not null then
    update public.staff
    set auth_user_id = new.id,
        updated_at = now()
    where id = matched_staff_id;

    new.staff_id := matched_staff_id;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_link_staff on public.profiles;
create trigger profiles_link_staff
before insert or update of email on public.profiles
for each row execute function public.sync_profile_staff_link();

-- Backfill existing profiles/staff where the email is the natural key.
update public.staff s
set auth_user_id = p.id,
    updated_at = now()
from public.profiles p
where p.staff_id = s.id
  and s.auth_user_id is distinct from p.id;

update public.profiles p
set staff_id = s.id,
    updated_at = now()
from public.staff s
where lower(s.email::text) = lower(p.email::text)
  and p.staff_id is distinct from s.id;

-- Authorization must never depend on editable user metadata.
revoke all on function public.sync_profile_staff_link() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_staff_link_admin_update'
  ) then
    create policy profiles_staff_link_admin_update
      on public.profiles for update to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

commit;
