# Supabase migration guide

## 1. Create the project

Create a Supabase project and keep the project URL and publishable/anon key. The browser must never receive a `service_role` key.

## 2. Apply the database

In Supabase SQL Editor, run these files in order:

1. `migrations/0001_core_schema.sql`
2. `migrations/0002_security_functions_views.sql`

The first migration creates the relational model. The second creates authentication profile handling, business functions, reporting views, RLS and the private `programme-documents` Storage bucket.

## 3. Authentication

Enable Email/Password in Supabase Auth. For an internal staff system, disable public sign-up after the initial provisioning process and create staff accounts administratively.

After a user exists in `auth.users`, the trigger creates `public.profiles`. Set the business role explicitly:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Use `staff` for normal PIC/Staff accounts and `viewer` for read-only accounts.

Password hashes should not be copied manually. For existing PocketBase users, use a controlled password-reset migration unless a server-side migration process has been verified for the exact legacy hash format.

## 4. RLS model

All business tables require an authenticated Supabase session. `viewer` can read but cannot write. `staff` can create/update operational data. `admin` has administrative write/delete rights.

Application role is resolved from `public.profiles`, not from a client-supplied value. Never trust a role stored in localStorage or React state for authorization.

## 5. Storage

The SQL migration creates a private bucket named `programme-documents`.

Recommended path:

```text
programmes/<programme_id>/<uuid>-<safe-file-name>
```

Store the resulting Storage path in `public.documents.storage_path`. Use signed URLs when a private document must be downloaded.

## 6. Frontend environment

Create `apps/web/.env.local`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Vercel uses the same variables under Project Settings → Environment Variables.

## 7. PocketBase → Supabase operation mapping

### Client initialization

Before:

```js
const pb = new PocketBase('https://api.mimosacademy.com');
```

After:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

### List/filter

Before:

```js
const records = await pb.collection('programmes').getList(1, 50, {
  filter: 'status = "active"',
});
```

After:

```js
const { data, error } = await supabase
  .from('programmes')
  .select('*', { count: 'exact' })
  .eq('status', 'Scheduled')
  .order('created_at', { ascending: false })
  .range(0, 49);

if (error) throw error;
```

### Authentication

Before:

```js
const authData = await pb.collection('users').authWithPassword(email, password);
```

After:

```js
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) throw error;
```

Logout:

```js
await supabase.auth.signOut();
```

Password reset:

```js
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/login`,
});
```

### CRUD

```js
const { data, error } = await supabase
  .from('clients')
  .insert({ name: 'Example Client', status: 'Active' })
  .select()
  .single();
```

```js
const { data, error } = await supabase
  .from('clients')
  .update({ phone: '+60312345678' })
  .eq('id', clientId)
  .select()
  .single();
```

```js
const { error } = await supabase
  .from('clients')
  .delete()
  .eq('id', clientId);
```

### Relational query / PocketBase expand equivalent

PocketBase expand:

```js
pb.collection('programmes').getOne(id, { expand: 'client' });
```

Supabase:

```js
const { data, error } = await supabase
  .from('programmes')
  .select('*, clients(*), quotations(*), purchase_orders(*), invoices(*), participants(*)')
  .eq('id', id)
  .single();
```

### Realtime

PocketBase:

```js
pb.collection('programmes').subscribe('*', callback);
```

Supabase:

```js
const channel = supabase
  .channel('programmes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'programmes' },
    (payload) => callback(payload),
  )
  .subscribe();

return () => supabase.removeChannel(channel);
```

Realtime must be enabled for the tables that need live updates. Do not enable it indiscriminately for every table.

### File upload

PocketBase embedded-file pattern:

```js
await pb.collection('programmes').create({ file: new File(...) });
```

Supabase separates binary storage from relational metadata:

```js
const path = `programmes/${programmeId}/${crypto.randomUUID()}-${file.name}`;

const { error: uploadError } = await supabase.storage
  .from('programme-documents')
  .upload(path, file, { upsert: false });

if (uploadError) throw uploadError;

const { error: dbError } = await supabase
  .from('documents')
  .insert({
    programme_id: programmeId,
    name: file.name,
    storage_path: path,
    file_size: file.size,
    document_type: file.type,
  });

if (dbError) throw dbError;
```

For downloads from the private bucket:

```js
const { data, error } = await supabase.storage
  .from('programme-documents')
  .createSignedUrl(storagePath, 300);
```

## 8. Vercel deployment

Import the repository into Vercel. Keep the repository root as the project root. Set:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Build command:

```text
npm run build
```

The existing Vercel SPA rewrite keeps React Router routes working after direct navigation.

## 9. Hostinger DNS

Keep the domain registered with Hostinger. In Hostinger DNS, use the exact records Vercel displays for the chosen hostname. After DNS propagates, add the same production URL to Supabase Auth redirect URLs.

Do not create an application reverse proxy through the former backend path.

## 10. Validation before decommissioning the old system

Run the migration tool against a backup/copy first. Compare:

- row counts by entity;
- client/programme/invoice/payment relationships;
- invoice totals and payment totals;
- outstanding balances;
- date/time values;
- Malaysian names containing apostrophes and non-ASCII characters;
- source file and source row lineage;
- conflict queue size;
- completeness scores;
- all staff emails and role assignments.

Only after the new system passes these checks should the old backend be taken offline.
