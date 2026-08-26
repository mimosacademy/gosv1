# MIMOS Academy PMS

Production-oriented React/Vite application using Supabase for PostgreSQL, Auth, Storage and Realtime, with Vercel as the frontend deployment target.

## Deployment architecture

```text
Browser
   |
   | HTTPS
   v
Vercel (React + Vite)
   |
   +---- Supabase Auth
   +---- Supabase PostgreSQL + RLS
   +---- Supabase Realtime
   +---- Supabase Storage
   |
   +---- Hostinger DNS/domain -> Vercel
```

The application no longer requires a persistent application server. The former stateful backend is removed from the application workspace.

## Stack

- Web: React 18 + Vite 7
- Backend platform: Supabase
- Database: PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Realtime: Supabase Realtime
- Frontend deployment: Vercel
- Domain/DNS: Hostinger
- Package manager: npm workspaces

## Repository layout

```text
gosv1/
├── apps/web/                 # React/Vite frontend
├── supabase/
│   ├── migrations/           # PostgreSQL schema, functions, views, RLS, Storage
│   └── README.md             # Supabase setup and deployment guide
├── tools/
│   ├── migrate-pocketbase-to-supabase.py
│   └── requirements.txt
├── .github/workflows/ci.yml
├── vercel.json
├── package.json
└── .nvmrc
```

## Environment

Set these in Vercel and local `apps/web/.env.local`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Never expose a Supabase `service_role` key in the browser or any `VITE_*` variable.

## Install and run

```bash
npm install
npm run dev
```

The frontend runs on port 3000.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run `supabase/migrations/0001_core_schema.sql`.
4. Run `supabase/migrations/0002_security_functions_views.sql`.
5. Configure Auth email/password and redirect URLs for the Vercel domain.
6. Create/provision staff accounts, then assign explicit roles in `public.profiles`.
7. Confirm the `programme-documents` private Storage bucket exists and its policies are enabled.
8. Add the Vercel production URL to Supabase Auth redirect/origin configuration.

## Data migration

The legacy PocketBase migration utility is replaced by `tools/migrate-pocketbase-to-supabase.py`. It reads a backed-up PocketBase SQLite database, exports/normalizes supported enterprise collections, preserves source row information, and loads the relational data into PostgreSQL in dependency order.

The migration must be run against a copy of the old SQLite database first. Do not delete the old database until row counts, relationships, financial totals and authentication accounts have been verified.

## Vercel

The repository is configured for Vercel + Vite. Import the repository, keep the repository root as the project root, and set the two Supabase environment variables above. Vercel builds the frontend with `npm run build`.

## Hostinger domain

Keep the domain registered at Hostinger and point the production hostname to the Vercel project using the DNS records shown by Vercel. Do not route application traffic through the old backend path.

## Security

- Browser code uses only the Supabase publishable/anon key.
- Database access is protected by PostgreSQL Row Level Security.
- `admin`, `staff` and `viewer` are application roles stored in `public.profiles`.
- Viewers are read-only.
- Audit tables are append-oriented and sensitive audit data is restricted.
- Monetary values use PostgreSQL `numeric`, never JavaScript/database floating-point storage.
- N/A is represented explicitly by `n_a_state`; it is not silently substituted for missing data.
- Production secrets and `.env` files must never be committed.
