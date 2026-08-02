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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
