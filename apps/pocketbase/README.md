# PocketBase backend

This directory contains the PocketBase backend configuration used by gosv1.

## Production architecture

The React/Vite frontend is deployed to Vercel. PocketBase is deployed separately on a persistent server/runtime because it requires a long-running process and persistent SQLite/filesystem storage.

## Required runtime environment

Copy `.env.example` to the backend host's secret/environment configuration and provide real values for:

- `PB_ENCRYPTION_KEY`
- `PB_SUPERUSER_EMAIL`
- `PB_SUPERUSER_PASSWORD`
- `PB_STAFF_DEFAULT_PASSWORD`
- `PB_PUBLIC_URL`

Never commit the real values.

## Persistence

The `pb_data` directory is runtime state and must live on persistent storage. It must not be replaced on every deployment.

## Version

Use the PocketBase version recorded in `.pocketbase-version` (currently `0.39.8`).

## Migrations and hooks

Keep `pb_migrations/` and `pb_hooks/` deployed with the backend release. Apply migrations before exposing the updated API to production traffic.

## Browser access

Configure the PocketBase server and reverse proxy for HTTPS and allow the production Vercel origin. The frontend uses `VITE_POCKETBASE_API_URL` and must point to the public PocketBase base URL.

## Security

Do not expose the PocketBase admin UI publicly unless required. Use strong unique credentials and rotate any credentials that may have been used in previous deployments.
