# Memory - Phase 2, Feature 04: Authentication complete

Last updated: 2026-08-15

## What was built

- Feature 04 authentication is implemented on `feature/04-authentication`: secure SSR sessions, verified AppUser synchronization, sign-in, password recovery/reset, invitation acceptance, sign-out, protected-route gating, disabled-user denial, and typed auth analytics.
- Added `scripts/start-local-development.ts`; `pnpm dev` now launches BTLS on port 3000 with the running local Supabase Auth/PostgreSQL environment rather than mismatched `.env.local` public values.
- The canonical full E2E command remains `pnpm test:e2e` on isolated port 3100. `pnpm test:e2e:auth:local` is the focused Auth suite.

## Decisions made

- Manual local development uses port 3000; Playwright uses port 3100. Public Auth configuration is resolved from the running local Auth/PostgreSQL containers and is never printed.
- The development launcher checks the required containers first and runs the slower Supabase CLI startup only when they are missing.
- Invitation acceptance creates an AppUser only. Account membership and property access remain Feature 05 responsibilities.

## Problems solved

- Valid local invitation links and password users initially failed manually because the app used different public Supabase configuration from the local Auth service. The local development launcher now supplies the matching environment.
- An old Node development process can retain port 3000. Stop it before starting a fresh `pnpm dev`.
- Next cannot run manual dev and the focused Playwright dev server concurrently from the same repository because they share `.next/dev`. Stop `pnpm dev` before `pnpm test:e2e:auth:local`.

## Current state

- Manual password sign-in and a genuine emailed local invitation both succeeded after the repair.
- Focused local Auth browser suite passed: 10 desktop/mobile journeys.
- Canonical local full E2E previously passed: 26 desktop/mobile tests. Full unit/integration suite previously passed: 26 files / 80 tests.
- Typecheck, lint, formatting, production build, and Git diff checks passed during Feature 04 closeout.
- Work is intentionally uncommitted. Do not stage or commit unless explicitly asked. Leave unrelated untracked `v11/` content untouched.

## Next session starts with

1. Treat Feature 04 as complete. Do not start Feature 05 without explicit direction and `/architect`.
2. For manual Auth testing, run `pnpm dev` and use a fresh invite link. For focused Auth E2E, first stop the manual dev server, then run `pnpm test:e2e:auth:local`.

## Open questions

- No known product defects. The sequential dev-server rule is a local Next.js tooling constraint, not an Auth behavior gap.
