# MIMOS Academy PMS — Supabase deployment

## Migration order
Run `migrations/001_extensions.sql` through `migrations/012_storage.sql` in numeric order. The files are the PostgreSQL/Supabase target for the legacy MySQL sections in `readme/mimos_pms_section1.sql`–`section4.sql`.

### MySQL → PostgreSQL
- `BIGINT UNSIGNED AUTO_INCREMENT` → `BIGINT GENERATED ALWAYS AS IDENTITY`
- `DATETIME(6)` → `TIMESTAMPTZ`
- monetary `DECIMAL` → exact `NUMERIC(18,2)` / `NUMERIC(18,4)`
- `JSON` → `JSONB`
- `YEAR` → `INTEGER` + range check
- `ON UPDATE CURRENT_TIMESTAMP` → `set_updated_at()` trigger
- `DATEDIFF(CURDATE(), due_date)` → `CURRENT_DATE - due_date`
- `GROUP_CONCAT` → `string_agg`
- `FIND_IN_SET` → `ANY(string_to_array(...))`
- `JSON_ARRAY_APPEND` → `jsonb_set`/`jsonb_insert`/`||`
- `DELIMITER` procedures → PL/pgSQL functions
- `utf8mb4` → PostgreSQL UTF-8

Money is never stored as floating point. SST uses exact numeric arithmetic. N/A is explicit through `n_a_state` and is never silently substituted for missing data.

## Auth and staff
`public.profiles.id` references `auth.users.id`. A trigger creates profiles for new users. Roles are `admin`, `staff`, `viewer` and are enforced by RLS.

Provision the 19 staff from the repository's mapping workbook on a trusted machine:

```bash
pip install -r tools/requirements.txt
export SUPABASE_URL=https://<project-ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
python tools/provision_staff.py "readme/User Profiles Mapping.xlsx"
```

Existing PocketBase password hashes are not copied blindly. Users receive a controlled password-reset flow unless a verified server-side legacy-hash adapter is introduced.

## Data migration
Run against a COPY of the PocketBase SQLite database:

```bash
python tools/migrate_to_supabase.py --sqlite /path/to/pb_data/data.db --database-url "$DATABASE_URL" --dry-run
python tools/migrate_to_supabase.py --sqlite /path/to/pb_data/data.db --database-url "$DATABASE_URL"
```

Excel files in `readme/` are staged into `source_file`, `import_batch`, and `stg_import_row`. `migration_id_map` preserves legacy IDs. Conflicts go to `data_conflict` rather than being silently overwritten.

## Storage
Private bucket: `pms-documents`.

Recommended path: `programmes/{programme_id}/{uuid}-{filename}`. Store the path in `documents.storage_path` and issue short-lived signed URLs for downloads.

## Frontend environment
Local/Vercel:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or a Supabase secret key in browser code or `VITE_*` variables.

## PocketBase → Supabase examples

Initialization:

```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
```

List/filter:

```js
const { data, error } = await supabase.from('programme').select('*').eq('programme_status_id', statusId).range(0,49);
if (error) throw error;
```

Auth:

```js
const { data, error } = await supabase.auth.signInWithPassword({email,password});
if (error) throw error;
await supabase.auth.signOut();
```

Relational query:

```js
const { data, error } = await supabase.from('programme').select('*,client:client_id(*),quotation:quotation(*),purchase_order:purchase_order(*),invoice:invoice(*),participant:participant(*)').eq('id',id).single();
```

Realtime:

```js
const channel = supabase.channel('programmes').on('postgres_changes',{event:'*',schema:'public',table:'programme'},callback).subscribe();
return () => supabase.removeChannel(channel);
```

File upload:

```js
const path=`programmes/${programmeId}/${crypto.randomUUID()}-${file.name}`;
await supabase.storage.from('pms-documents').upload(path,file,{upsert:false});
await supabase.from('documents').insert({programme_id:programmeId,name:file.name,storage_path:path,file_size:file.size,document_type:file.type});
```

## Vercel + Hostinger
Import the repository into Vercel and set the two `VITE_*` variables for Production/Preview as appropriate. Keep the Hostinger domain registration; point its DNS records to the exact Vercel target shown by Vercel. Then add the production URL to Supabase Auth redirect/origin settings.

## Cutover verification
Do not decommission PocketBase until row counts, relationships, invoice/payment totals, outstanding balances, timestamps, Malaysian/non-ASCII names, source lineage, conflict queue, completeness scores, staff emails and role assignments all reconcile.
