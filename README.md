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
pnpm test:e2e
pnpm build
```

Run the end-to-end suite with `pnpm test:e2e` after installing the Playwright browser:

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

The GitHub Actions workflow runs formatting, type-checking, linting, unit tests, Playwright smoke tests, and the production build.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
