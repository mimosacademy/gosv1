# MIMOS Academy PMS — Supabase migration runbook

## Current target

- Supabase project ref: `frzyodxqcvxivtukvdqj`
- Browser URL: `https://frzyodxqcvxivtukvdqj.supabase.co`
- Frontend: Vercel
- Domain: Hostinger DNS -> Vercel

## 1. Database

The base consolidated installer is `supabase/gosv1_consolidated.sql`.
Tracked hardening migrations are under `supabase/migrations/`.

The production project has been reconciled and verified with:
- 41 public tables, all RLS-enabled
- 8 reporting views
- private `pms-documents` Storage bucket
- 10 Realtime business tables
- PostgreSQL financial/completeness functions

## 2. Auth bootstrap

Supabase Auth email provider is assumed enabled.

Create the first trusted administrator in **Authentication -> Users -> Add user**. Supabase documents that creating/inviting users is an admin operation and secret keys must remain server-side. Do not put the secret key in Vite/browser variables.

After the first user exists, set its application role from SQL Editor:

```sql
update public.profiles p
set role = 'admin', is_active = true
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('YOUR_ADMIN_EMAIL');
```

## 3. Provision staff

From a trusted workstation:

```bash
pip install -r tools/requirements-auth.txt
export SUPABASE_URL=https://frzyodxqcvxivtukvdqj.supabase.co
export SUPABASE_SERVICE_ROLE_KEY='DO_NOT_COMMIT_THIS'
python tools/provision_supabase_auth.py
```

The workbook is read from `readme/User Profiles Mapping.xlsx` and email is the natural key. If no temporary password is provided, use invitation/reset flow.

## 4. Stage Excel source data

```bash
pip install -r tools/requirements-import.txt
export SUPABASE_URL=https://frzyodxqcvxivtukvdqj.supabase.co
export SUPABASE_SERVICE_ROLE_KEY='DO_NOT_COMMIT_THIS'
python tools/import_readme_sources.py
```

The importer downloads the authoritative workbooks from the repository, hashes them, creates `source_file` and `import_batch`, then writes raw rows to `stg_import_row`. It does not write directly to business tables.

## 5. Promotion policy

Promotion must be deterministic:

`source_file -> import_batch -> stg_import_row -> validation -> data_conflict -> business table`

Use composite business keys and `migration_id_map` for legacy IDs. Financial values must remain `NUMERIC`, never floating point.

## 6. Frontend

Browser variables:

```env
VITE_SUPABASE_URL=https://frzyodxqcvxivtukvdqj.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`/`sb_secret_*` in `VITE_*` variables.

## 7. Production cutover

Do not decommission PocketBase until:

- Auth users verified
- all Excel/PocketBase source batches reconciled
- R1 totals match source
- R2 participant/training totals match source
- R3 pipeline totals match source
- invoice/payment totals match source
- conflict queue is empty or explicitly resolved
- frontend CRUD/realtime/storage verified
- Vercel production environment variables verified
- Hostinger DNS points to Vercel

Only then freeze PocketBase, take a final backup, and decommission it.
