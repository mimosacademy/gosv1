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

The legacy nested `app/` tree was removed because it duplicated the canonical `apps/` tree.

## Requirements

- Node.js version specified by `.nvmrc`
- npm compatible with the lockfile

## Install

```bash
npm ci
```

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` for local frontend configuration.

`VITE_POCKETBASE_API_URL` controls the browser-facing PocketBase base URL and defaults to `/hcgi/platform`, preserving the existing reverse-proxy deployment path.

For PocketBase, set `PB_ENCRYPTION_KEY` in the server environment. Never commit production secrets.

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

## Production runtime

Run PocketBase:

```bash
npm run start:backend
```

Run the built frontend with Vite preview when a Node runtime is required:

```bash
npm run start:web
```

For Hostinger or another reverse-proxy deployment, serving the generated static frontend through the web server is preferred. Keep PocketBase as a separate persistent backend process and proxy the browser-facing `/hcgi/platform` path to it.

## Lint

```bash
npm run lint
```

## CI

GitHub Actions validates dependency installation, linting and the production frontend build on pushes and pull requests.

## Security notes

- Do not commit `pb_data` production data, secrets, or `.env` files.
- Supply `PB_ENCRYPTION_KEY` through the hosting environment or secret manager.
- Review PocketBase API rules and hooks before exposing the service publicly.
- Persist PocketBase `pb_data` outside ephemeral application release directories.
- Keep the PocketBase admin interface inaccessible to the public unless explicitly required and protected.
