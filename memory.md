# Memory - Phase 2, Feature 04: Authentication complete

Last updated: 2026-08-15

## What was built

- Feature 04 authentication is implemented on `feature/04-authentication`: secure SSR sessions, verified AppUser synchronization, sign-in, password recovery/reset, invitation acceptance, sign-out, protected-route gating, disabled-user denial, and typed auth analytics.
- Added `scripts/start-local-development.ts`; `pnpm dev` launches BTLS on port 3000 with the running local Supabase Auth/PostgreSQL environment rather than mismatched `.env.local` public values.
- The canonical `pnpm test:e2e` runner now starts local Auth, deploys the committed Prisma and Supabase security schema, runs the idempotent non-production seed, builds, and runs all Playwright E2E tests on port 3100.

## Decisions made

- Manual local development uses port 3000; Playwright uses port 3100. Public Auth configuration is resolved from the running local Auth/PostgreSQL containers and is never printed.
- The development launcher checks required containers first and runs the slower Supabase CLI startup only when they are missing.
- Canonical E2E initializes a clean database through the existing deployment workflow. It does not create migrations, reset a database, or use `prisma db push`.
- Invitation acceptance creates an AppUser only. Account membership and property access remain Feature 05 responsibilities.

## Problems solved

- Valid local invitation links and password users initially failed manually because the app used different public Supabase configuration from the local Auth service. The local development launcher now supplies the matching environment.
- GitHub CI started a clean local database without applying the existing schema, causing Prisma `P2021` during invitation acceptance. The canonical E2E harness now deploys the existing schema/security/seed before tests.
- An old Node development process can retain port 3000. Stop it before starting a fresh `pnpm dev`.
- Next cannot run manual dev and the focused Playwright dev server concurrently from the same repository because they share `.next/dev`. Stop `pnpm dev` before `pnpm test:e2e:auth:local`.

## Current state

- Manual password sign-in and a genuine emailed local invitation both succeeded after the repair.
- Focused local Auth browser suite passed: 10 desktop/mobile journeys.
- Canonical CI-equivalent local E2E passed after clean schema deployment: 26 desktop/mobile tests.
- Full unit/integration suite previously passed: 26 files / 80 tests. Typecheck, lint, formatting, production build, and Git diff checks passed during Feature 04 closeout.
- Work is intentionally uncommitted. Do not stage or commit unless explicitly asked. Leave unrelated untracked `v11/` content untouched.

## Next session starts with

1. Treat Feature 04 as complete. Do not start Feature 05 without explicit direction and `/architect`.
2. For manual Auth testing, run `pnpm dev` and use a fresh invite link. For focused Auth E2E, first stop the manual dev server, then run `pnpm test:e2e:auth:local`.

## Open questions

- No known product defects. The sequential dev-server rule is a local Next.js tooling constraint, not an Auth behavior gap.
