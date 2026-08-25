# gosv1

Production-oriented monorepo containing the web application and PocketBase backend.

## Stack

- Web: React 18 + Vite 7
- Backend: PocketBase
- Package manager: npm workspaces
- Node.js: version pinned by `.nvmrc`

## Repository layout

```text
gosv1/
├── apps/
│   ├── web/          # React/Vite frontend
│   └── pocketbase/   # PocketBase executable, hooks and migrations
├── package.json
├── package-lock.json
└── .nvmrc
```

The legacy nested `app/` tree is intentionally removed in the cleanup commit because it duplicated the canonical root `apps/` tree.

## Requirements

- Node.js version specified by `.nvmrc`
- npm compatible with the lockfile

## Install

```bash
npm ci
```

## Development

```bash
npm run dev
```

This starts the web application on port `3000` and PocketBase on port `8090`.

## Production build

```bash
npm run build
```

The web build is emitted to `dist/apps/web`.

## Production start

```bash
npm run start
```

Set `PB_ENCRYPTION_KEY` in the deployment environment before starting PocketBase.

## Lint

```bash
npm run lint
```

## Security notes

- Do not commit `pb_data` production data, secrets, or `.env` files.
- Supply `PB_ENCRYPTION_KEY` through the hosting environment or secret manager.
- Review PocketBase API rules and hooks before exposing the service publicly.

## Deployment

Deploy the frontend and PocketBase as separate runtime processes where possible. The frontend is a static Vite build and PocketBase is the stateful backend. Persist PocketBase `pb_data` outside the application release directory.
