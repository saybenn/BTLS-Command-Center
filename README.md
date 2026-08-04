# BTLS Command Center

BTLS Command Center is the multi-tenant operations and web-growth platform for Brought to Life Solutions.

## Development

This repository uses pnpm 11.9.0. Enable Corepack, then install dependencies:

```powershell
corepack enable
pnpm install --frozen-lockfile
```

Start the development server with `pnpm dev` and open http://localhost:3000.

## Quality checks

Run the relevant command before opening a pull request:

```powershell
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Run the authoritative end-to-end suite with `pnpm test:e2e` after installing the Playwright browser. It builds the application and serves the production build on port 3001, leaving a local development server on port 3000 untouched:

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

For fast local diagnostics against `next dev`, use `pnpm test:e2e:dev`. This is also the required verification path for guarded `/development-status` routes, which intentionally return `notFound()` on a production server. Development-server results are not release-gating.

The GitHub Actions workflow runs formatting, type-checking, linting, unit tests, and the production-backed Playwright suite.

## Database tooling

Feature 03 uses Prisma for application schema migrations and the Supabase CLI for the local
Supabase stack. Copy `.env.example` to `.env.local` and set only the values needed for your target
after creating a local or hosted Supabase project. Never commit `.env.local` or provider keys.

Local Supabase commands require Docker Desktop, or a compatible Docker API, to be installed and
running:

```powershell
pnpm supabase:start
pnpm db:generate
pnpm db:validate
```

The project Supabase commands disable only the CLI's optional telemetry. This keeps local tooling
compatible with restricted development shells; it does not affect application data or services.

`DATABASE_URL` is reserved for the restricted application role. `DIRECT_DATABASE_URL` is used by
Prisma migration commands and must never be exposed to browser code. The initial tenancy migration
and the Supabase security/storage migration are versioned separately. Apply them in this order:

```powershell
pnpm db:migrate:deploy
pnpm db:migrate:supabase-security
```

The security migration creates the restricted application role, tenant-context helpers, RLS
policies, and Storage buckets. To deploy all local database layers and seed non-production
fixtures, or to rebuild the local database from scratch, use:

```powershell
pnpm db:local:deploy
pnpm db:reset
pnpm test:database
```

`db:reset` is local-development-only: it rebuilds the Prisma schema, reapplies the Supabase
security layer, and recreates the BTLS admin plus the test client, HVAC property, Plumbing
property, membership, and property-level access examples. It must never target a hosted or
production database.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
