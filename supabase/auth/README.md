# Supabase Auth provisioning — gosv1

Email provider is assumed enabled in the `gosv1` Supabase project.

## Provisioning policy

Staff accounts are created from `readme/User Profiles Mapping.xlsx`, using email as the natural key. Do not commit passwords, service-role keys, database passwords, or access tokens.

Recommended production flow:

1. Create users through Supabase Dashboard or a trusted server-side provisioning script using the Supabase Admin API.
2. Use the exact email from the mapping workbook.
3. Set `user_metadata.full_name` and `user_metadata.role` only as convenience metadata; authorization must use `public.profiles.role` and RLS.
4. Insert/update `public.profiles` for the resulting `auth.users.id`.
5. Require password reset/change for migrated users instead of attempting to copy an opaque PocketBase password hash.
6. Verify that disabled/departed staff are not granted application access.

## Role mapping

- Admin → `admin`
- PIC/Staff → `staff`
- Viewer → `viewer`

## Required secrets

Server-side provisioning requires a Supabase secret/service-role credential. Keep it outside Git and never expose it as a `VITE_*` variable.

Browser variables are only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Verification

After provisioning, run:

`supabase/gosv1_post_install_verification.sql`

and confirm the expected profile count and auth user count before starting the data migration.
