# Memory — Phase 1, Feature 01 Complete

Last updated: 2026-07-30

## What was built

- Completed Feature 01 on branch `feature/01-repository-tooling`: pnpm-only tooling, source ownership structure, CI quality workflow, safe environment parsing and health endpoint, development diagnostics, app boundaries, responsive bootstrap landing page, tests, and initial UI registry.
- Added a self-contained `src/app/global-error.tsx` fallback that preserves the static dark, Inter, and semantic-token baseline when the root layout is unavailable.
- Added unit coverage for the global error fallback and recorded its visual pattern in `context/ui-registry.md`.

## Decisions made

- `pnpm@11.9.0` is the sole package manager; `pnpm-lock.yaml` is the only lockfile.
- `sharp` and `unrs-resolver` are the only approved dependency build scripts.
- Dark remains the Feature 01 default. User-selectable dark/light/system preference handling is deferred to Feature 02, which owns shared theme setup.

## Problems solved

- Recovered the project from mixed npm/pnpm tooling and restored ESLint 9.39.5 compatibility.
- Removed an unfinished theme selector after browser verification showed its preference did not survive reload; it is not an approved Feature 01 pattern.
- Hardened the global error fallback so it does not depend on the root layout for its visual baseline.

## Current state

- Feature 01 exit gate passes. Formatting, type-checking, lint, 8 unit tests, desktop/mobile Playwright smoke tests, and production build all pass.
- `context/progress-tracker.md` records Feature 01 as complete and Feature 02 as not started.
- Production audit remains 3 high and 1 moderate advisory through supported Next.js transitives; full audit has one additional high development-only ESLint advisory. These are documented open upstream risks; do not use force or independent overrides.

## Next session starts with

Run `/architect` for Phase 1, Feature 02 — Shared UI Foundation. Do not implement Feature 02 until its plan is approved.

## Open questions

- Reassess supported Next.js and ESLint updates when they resolve the documented transitive audit advisories.
