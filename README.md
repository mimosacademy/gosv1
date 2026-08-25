# gosv1

Production-oriented monorepo containing the web application and PocketBase backend.

## Deployment architecture

**Production frontend: Vercel**

**Production backend: PocketBase on a persistent server/runtime**

Vercel is used for the React/Vite frontend only. PocketBase is stateful and runs as a separate persistent backend service; it is not started by the Vercel deployment.

```text
Browser
   |
   | HTTPS
   v
Vercel (React + Vite static frontend)
   |
   | HTTPS / VITE_POCKETBASE_API_URL
   v
PocketBase (persistent server)
   |
   +-- pb_data / SQLite
   +-- pb_hooks
   +-- pb_migrations
```

## Stack

- Web: React 18 + Vite 7
- Backend: PocketBase 0.39.8
- Package manager: npm workspaces
- Node.js: version pinned by `.nvmrc`

## Repository layout

```text
gosv1/
├── apps/
│   ├── web/          # React/Vite frontend deployed to Vercel
│   └── pocketbase/   # PocketBase runtime, hooks and migrations
├── .github/workflows/ci.yml
├── vercel.json       # Vercel build/output/SPA routing
├── package.json
├── package-lock.json
└── .nvmrc
```

The legacy nested `app/` tree was removed because it duplicated the canonical `apps/` tree.

## Requirements

- Node.js version specified by `.nvmrc`
- npm compatible with the lockfile

## Install

```bash
npm ci
```

## Environment

### Vercel

Create this environment variable in the Vercel project:

```text
VITE_POCKETBASE_API_URL=https://YOUR-POCKETBASE-DOMAIN
```

Do not use `localhost`, `127.0.0.1`, or the old Hostinger `/hcgi/platform` path in the Vercel production environment.

`VITE_POCKETBASE_API_URL` is a browser-visible URL, so it must contain only the public PocketBase base URL. Never put private credentials or admin tokens in any `VITE_*` variable.

### PocketBase server

Set server-side secrets in the PocketBase runtime environment, including:

```text
PB_ENCRYPTION_KEY=<strong-random-secret>
```

Any staff provisioning secret must also be supplied through the PocketBase runtime environment and must never be committed to source control.

## Development

```bash
npm run dev
```

This starts the web application on port `3000` and PocketBase on port `8090` for local development.

## Vercel production build

The repository contains `vercel.json` configured for the Vite frontend:

```bash
npm ci
npm run build
```

Build output:

```text
dist/apps/web
```

When importing the repository into Vercel, use the repository root as the project root. The committed `vercel.json` supplies the build command and output directory.

## PocketBase production runtime

PocketBase must run outside Vercel on a persistent server/runtime capable of keeping its SQLite database and filesystem state.

```bash
npm run start:backend
```

Persist `apps/pocketbase/pb_data` on the backend host. Do not deploy or track production `pb_data` from Git.

The public PocketBase URL must be HTTPS and must allow the Vercel production origin through PocketBase CORS/origin configuration.

## Lint

```bash
npm run lint
```

## CI

GitHub Actions validates dependency installation, linting and the production frontend build on pushes and pull requests.

## Security requirements

- Do not commit `pb_data` production data, secrets, or `.env` files.
- Do not expose PocketBase admin credentials to the browser.
- Do not put secrets in `VITE_*` variables.
- Supply `PB_ENCRYPTION_KEY` through the PocketBase hosting environment or secret manager.
- Keep PocketBase admin access restricted and protected.
- Review PocketBase collection API rules before exposing the backend publicly.
- Configure HTTPS and CORS for the production Vercel origin.
- Persist PocketBase `pb_data` outside ephemeral application release directories.

## Important Vercel limitation

Vercel is the frontend deployment target. The PocketBase executable in `apps/pocketbase/pocketbase` is not part of the Vercel runtime. Do not attempt to start PocketBase from a Vercel build, serverless function, or static frontend deployment.
