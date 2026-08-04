# BTLS Progress Tracker

> **Repository location:** `context/progress-tracker.md`  
> **Project state:** Greenfield  
> **Source plan:** `context/build-plan.md`  
> **Update owner:** Codex or the developer completing the current feature  
> **Update rule:** Update this file at the end of every implementation session.

---

## Current Status

| Field | Value |
|---|---|
| Last updated | 2026-08-02 |
| Current phase | Phase 2 in progress |
| Current feature | Feature 03 — Supabase and Prisma Foundation complete |
| Overall status | Feature exit gate passed |
| MVP progress | Features 01 and 02 complete |
| Next implementation target | Feature 04 — Authentication (not started) |

---

## Status Key

- `[x]` Complete
- `[-]` In progress
- `[ ]` Not started
- `[!]` Blocked
- `[~]` Deferred

A feature is complete only when its exit gate in `context/build-plan.md` passes.

---

# Completed

## Phase 1 — Feature 01: Repository and Tooling

- [x] Slice 0 — Context reconciliation
- [x] Slice 1 — Toolchain contracts
- [x] Slice 2 — Approved structure and shadcn prerequisites
- [x] Slice 3 — Runtime safety and diagnostic boundaries
- [x] Slice 4 — Bootstrap interface and UI imprint
- [x] Slice 5 — Full verification and Feature 01 handoff
- [x] Feature 01 exit gate passed

Feature 01 provides the pnpm-only application baseline, source ownership structure, tooling contracts, GitHub Actions quality workflow, safe system diagnostics, a responsive bootstrap interface, and the initial UI registry.

## Phase 1 — Feature 02: Shared UI Foundation

- [x] Slice 1 — Foundation contracts and token alignment
- [x] Slice 2 — Theme infrastructure
- [x] Slice 3 — Core shared controls and form composition
- [x] Slice 4 — Feedback, data display, and page composition
- [x] Slice 5 — Responsive shell and navigation
- [x] Slice 6 — Internal showcase, documentation, and exit verification
- [x] Feature 02 exit gate passed

Feature 02 provides semantic dark/light tokens, local theme preference, accessible shared controls and field composition, feedback and data-display primitives, responsive application-shell compositions, and a guarded internal UI Foundation catalog. Production and development Playwright modes are intentionally separated: production-visible workflows are release-gating, while the guarded catalog remains development diagnostic coverage.

## Phase 2 — Feature 03: Supabase and Prisma Foundation

- [x] Slice 1 — Tooling and environment contracts
- [x] Slice 2 — Core tenancy schema and Prisma migration
- [x] Slice 3 — Supabase security and storage migrations
- [x] Slice 4 — Reset, seed, and tenant-isolation foundation
- [x] Slice 5 — Development status and feature verification
- [x] Feature 03 exit gate passed

## Product and Architecture Context

- [x] MVP product boundary established
- [x] Five primary MVP components established
  - Website Intelligence
  - Smart Blog Studio
  - Content Intelligence
  - Revenue Operations / Command Center
  - Robin AI Automation Agent
- [x] Shared Work Management established
- [x] Non-MVP features explicitly excluded
- [x] One-codebase multi-tenant SaaS direction established
- [x] Property-scoped Supabase/Postgres architecture established
- [x] Target repository folder structure established
- [x] Core technology stack selected
- [x] Provider direction selected
  - Supabase
  - Prisma
  - Inngest
  - Postmark
  - Twilio
  - Cronofy
  - Google APIs
  - OpenAI
- [x] WordPress publishing compatibility bounded to a limited REST adapter
- [x] BTLS-built websites established as the primary publishing target
- [x] Public lead-ingestion direction established
- [x] Dark UI direction approved
- [x] Light theme support approved
- [x] Existing Next.js repository and root instructions confirmed
- [x] pnpm 11.9.0 baseline recovered and locked

## Context Files Created

- [x] `context/project-overview.md`
- [x] `context/code-standards.md`
- [x] `context/architecture.md`
- [x] `context/library-docs.md`
- [x] `context/build-plan.md`
- [x] `context/ui-tokens.md`
- [x] `context/ui-rules.md`
- [x] `context/progress-tracker.md`

---

# In Progress

No active implementation feature.

---

# Up Next

## Immediate

1. [ ] Run `/architect` for Feature 04 — Authentication
2. [ ] Confirm the Feature 04 plan before implementation
3. [ ] Do not implement Feature 04 until its plan is approved

## First implementation feature

### Phase 1 — Project Bootstrap

#### Feature 01 — Repository and Tooling

- [x] Initialize Next.js App Router application
- [x] Enable strict TypeScript
- [x] Add Tailwind CSS
- [x] Add shadcn/ui foundation
- [x] Add linting and formatting
- [x] Add Vitest
- [x] Add React Testing Library
- [x] Add Playwright
- [x] Add Zod environment validation
- [x] Create approved folder structure
- [x] Add health Route Handler
- [x] Add development status page
- [x] Add CI checks
- [x] Commit initial context files into repository
- [x] Run type-check, lint, unit tests, Playwright, and production build
- [x] Verify Feature 01 exit gate

---

# Build Roadmap

## Phase 1 — Project Bootstrap

- [x] 01 Repository and Tooling
- [x] 02 Shared UI Foundation

## Phase 2 — Tenancy, Authentication, and Property Management

- [x] 03 Supabase and Prisma Foundation
- [ ] 04 Authentication
- [ ] 05 Property Access and Admin Property Directory

## Phase 3 — Shared Infrastructure

- [ ] 06 Storage and Media
- [ ] 07 Events, Jobs, Notifications, and Operational Records

## Phase 4 — Revenue Operations Foundation

- [ ] 08 Revenue Operations Data Model
- [ ] 09 Unified Lead Inbox — Full UI
- [ ] 10 Revenue Operations Mutations and Reporting
- [ ] 11 Public Lead Ingestion

## Phase 5 — Conversations and Robin Foundation

- [ ] 12 Two-Way SMS and Outbound Email
- [ ] 13 Robin Configuration and Knowledge
- [ ] 14 Robin Agent Runs and Approval Workflow
- [ ] 15 Robin Automations

## Phase 6 — Smart Blog Studio

- [ ] 16 Content Foundation and Strategy
- [ ] 17 Article Editor and SEO Readiness
- [ ] 18 Internal Links, Publishing, and Playbook

## Phase 7 — Website Data Foundation

- [ ] 19 Integration Connections
- [ ] 20 Data Ingestion, Normalization, and Page Inventory
- [ ] 21 Metric Engine and Baselines

## Phase 8 — Website Intelligence

- [ ] 22 Findings Engine
- [ ] 23 Website Intelligence Interface

## Phase 9 — Content Intelligence

- [ ] 24 Article Scorecards
- [ ] 25 Content Findings

## Phase 10 — Shared Work Management

- [ ] 26 Work Packages and Tickets
- [ ] 27 Interventions and Before/After Measurement

## Phase 11 — Command Center Completion

- [ ] 28 Property Overview
- [ ] 29 BTLS Cross-Property Overview

## Phase 12 — Production Hardening and Launch

- [ ] 30 Security and Data Protection Review
- [ ] 31 Reliability, Performance, and Accessibility
- [ ] 32 Release Readiness

---

# Blocked

No implementation work is currently blocked.

Use this section only for active blockers.

Example format:

- [!] Feature or task — **Blocked by:** specific missing dependency, decision, credential, or defect
  - Owner:
  - Date identified:
  - Required resolution:
  - Next review:

---

# Known Issues

| Issue | Severity | Status | Owner | Next action |
|---|---|---|---|---|
| Production audit reports 3 high and 1 moderate findings through Next.js 16.2.12 transitive `sharp@0.34.5` and `postcss@8.4.31` | High | Open upstream risk | Next.js / Project owner | Upgrade Next.js when a supported release updates these transitive packages; do not override them independently |
| Full audit reports one additional high development-only `brace-expansion` finding through ESLint transitive dependencies | High | Open upstream risk | ESLint / Project owner | Upgrade supported direct tooling when its dependency graph resolves the advisory; do not use a forced override |
| Production credentials and external provider accounts are not configured | Expected | Deferred | Project owner | Configure during relevant integration phase |

Do not add normal unfinished roadmap work to Known Issues.

Known Issues are defects, inconsistencies, or risks that need attention.

---

# Decisions Made

Record only decisions that future sessions might otherwise reopen.

- **2026-07-28** — The MVP contains Website Intelligence, Smart Blog Studio, Content Intelligence, Revenue Operations, Robin, and shared Work Management.
- **2026-07-28** — Campaign Tracking, general Funnel Mapping, advertising management, predictive analytics, and full project-management features are outside the MVP.
- **2026-07-28** — BTLS will be one multi-tenant SaaS application and one managed codebase.
- **2026-07-28** — Client properties are database records, not separate deployments or repositories.
- **2026-07-28** — Supabase provides PostgreSQL, Auth, Storage, and selected Realtime capabilities.
- **2026-07-28** — Prisma is the primary server-side database and migration layer.
- **2026-07-28** — Server-side authorization and PostgreSQL RLS jointly protect property data.
- **2026-07-29** — Work Management is shared by Website Intelligence and Content Intelligence.
- **2026-07-29** — Inngest is the default background-job and scheduling system.
- **2026-07-29** — Postmark is the outbound email provider for MVP.
- **2026-07-29** — Inbound email synchronization is deferred.
- **2026-07-29** — Twilio is the two-way SMS provider.
- **2026-07-29** — Cronofy is the calendar provider.
- **2026-07-29** — BTLS-built websites are the primary publishing target.
- **2026-07-29** — WordPress native-post publishing is supported through a limited REST API adapter.
- **2026-07-29** — Unsupported WordPress configurations use manual/export fallback.
- **2026-07-29** — Dark mode is the default UI theme.
- **2026-07-29** — Light and system themes use the same semantic UI tokens.
- **2026-07-29** — Code must favor clarity, explicitness, and junior-developer debuggability over cleverness.
- **2026-07-29** — Revenue Operations will launch as a responsive web beta. A dedicated mobile application is a post-MVP direction and will not begin until the current web platform is complete and field workflows have been validated.
- **2026-07-29** — pnpm 11.9.0 is the sole package manager. `pnpm-lock.yaml` is the only committed dependency lockfile.

---

# Session Notes

## 2026-07-30 — Phase 1, Feature 01 completion

### Completed

- Completed and verified all five Feature 01 slices.
- Added CI parity for Playwright smoke tests.
- Ran formatting, type-checking, linting, unit tests, desktop/mobile Playwright tests, and a production build.
- Restored the approved dark-first landing surface after deferring the user-selectable theme control to Feature 02, which owns shared theme setup.
- Hardened the global error fallback so it independently preserves the BTLS dark, semantic-token, and Inter baseline.
- Re-ran formatting, type-checking, linting, 8 unit tests, desktop/mobile Playwright tests, and the production build; all passed.

### Open risk

- `pnpm audit --prod`: 3 high and 1 moderate finding through the supported Next.js dependency graph.
- `pnpm audit`: one additional high development-only finding through ESLint transitive dependencies.
- Both are documented upstream risks; no supported direct-dependency update is currently available within the approved recovery constraints.

### Next session

1. Run `/architect` for Feature 02 — Shared UI Foundation.
2. Do not implement Feature 02 until its plan is approved.

## 2026-07-30 — Phase 1, Feature 02: Slice 1

### Completed

- Added the full approved semantic token bridge for dark and light themes.
- Added presentation-only application-shell display contracts without tenant, authorization, or database fields.
- Added approved Radix Dialog, Select, and Tabs dependencies.
- Added focused token and contract unit tests plus a browser assertion for dark/light token resolution.
- Imprinted the semantic token foundation in `context/ui-registry.md`.
- Ran focused formatting, type-checking, linting, unit tests, Chromium checks, and a production build.

### Changed

- Files: `src/app/globals.css`, `src/components/layout/app-shell.types.ts`, focused tests, `package.json`, and `pnpm-lock.yaml`
- Migrations: none
- Dependencies: `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs`
- Events/jobs: none
- UI components: none; foundation tokens and presentation contracts only

### Issues

- Local Playwright checks pass when the bundled pnpm runtime is exposed on `PATH`; Windows leaves the development server alive after the suite, so its process must be stopped by port during local verification.
- Production builds require network access to download the existing Google Inter font in this environment.

### Next session

1. Implement Feature 02 — Slice 2: Theme infrastructure.
2. Test persisted dark, light, and system preferences.
3. Continue only after Slice 2 verification passes.

## 2026-07-30 — Phase 1, Feature 02: Slice 2

### Completed

- Made dark the token default and added a pre-hydration initializer for locally persisted dark, light, and system preferences.
- Added `ThemeProvider` with storage-safe persistence and system-preference listeners limited to the system setting.
- Added the accessible Radix-based Theme Control and imprinted its reusable visual pattern.
- Resolved the focus-style registry conflict by adopting the canonical ring-based token pattern.
- Ran focused formatting, type-checking, unit tests, production-server browser verification, and a production build.

### Changed

- Files: root layout, global styles, theme provider, initializer, control, focused tests, and UI registry
- Migrations: none
- Dependencies: none beyond the Radix primitives added in Slice 1
- Events/jobs: none
- UI components: `ThemeControl`

### Issues

- Local development-server verification requires network access for the existing Google Inter font; production-server verification runs after the production build without that runtime dependency.

### Next session

1. Implement Feature 02 — Slice 3: Core shared controls and form composition.
2. Verify keyboard behavior, focus handling, and field semantics.
3. Continue only after Slice 3 verification passes.

## 2026-07-30 — Phase 1, Feature 02: Slice 3

### Completed

- Added the shared Button, Input, Textarea, Select, Dialog, Tabs, Badge, Card, and Alert components.
- Added visible Label and Field composition with optional help text, required indicators, and linked validation errors.
- Preserved Radix Dialog, Select, and Tabs keyboard/focus behavior through thin BTLS styling wrappers.
- Added and passed keyboard-focused tests for loading buttons, fields, dialog focus restoration, tabs, Select, and alert announcement priority.
- Added the JSDOM `scrollIntoView` shim required by Radix Select tests.
- Imprinted every new reusable visual pattern in `context/ui-registry.md`.

### Changed

- Files: shared UI components, form composition components, test setup, focused component tests, UI registry, and progress tracker
- Migrations: none
- Dependencies: none beyond the Radix primitives added in Slice 1
- Events/jobs: none
- UI components: Button, Input, Textarea, Select, Dialog, Tabs, Badge, Card, Alert, Label, and Field

### Issues

- No open Slice 3 implementation issue.

### Next session

1. Implement Feature 02 — Slice 4: Feedback, data display, and page composition.
2. Verify empty, loading, error, table, and page-header patterns.
3. Continue only after Slice 4 verification passes.

## 2026-07-29 — Context foundation

### Completed

- Defined the target architecture
- Defined professional code standards
- Defined approved libraries and providers
- Created the 12-phase, 32-feature build plan
- Created the dark-first UI token system
- Created UI composition and behavior rules
- Created this progress tracker

### Needs attention

- Complete Feature 01 in approved slices
- Create `context/ui-registry.md` only after the first UI pattern is imprinted
- Reassess the current Next.js upstream security advisories when a supported patched release becomes available

### Next session

1. Complete Feature 01, Slice 1 — Toolchain contracts
2. Run the Slice 1 verification checks
3. Begin Slice 2 only after Slice 1 is verified

---

# Session Update Template

Copy this block at the end of each implementation session.

```md
## YYYY-MM-DD — Phase X, Feature XX

### Completed

- [What was completed]
- [Tests or checks that passed]
- [Documentation updated]

### Changed

- Files:
- Migrations:
- Dependencies:
- Events/jobs:
- UI components:

### Issues

- [What broke, remains uncertain, or needs follow-up]

### Decisions

- [Any binding decision made during the session]

### Next session

1. [First concrete task]
2. [Second concrete task]
3. [Exit gate or verification step]
```

---

# Update Rules

At the end of every session:

1. Update the date and current phase.
2. Move completed tasks to Completed.
3. Keep only current work in In Progress.
4. Keep Up Next limited to the next three to six concrete actions.
5. Add actual blockers to Blocked.
6. Add defects or inconsistencies to Known Issues.
7. Record only important decisions.
8. Add a concise session note.
9. Confirm whether the current feature exit gate passed.
10. Do not mark a feature complete merely because code was generated.

The tracker should remain a working status document, not a duplicate of `build-plan.md`.

## 2026-07-30 — Phase 1, Feature 02: Slice 4

### Completed

- Added generic EmptyState, LoadingState, and ErrorState components with safe, actionable copy and optional relevant actions.
- Added a semantic TableShell with native header, body, and footer slots, numeric alignment, and horizontal overflow containment for narrow screens.
- Added a responsive PageHeader with title, optional description, primary-action, and secondary-control slots.
- Added a development-only Shared UI Foundation showcase covering loading, empty, error, disabled, success, and table states.
- Added focused component tests and imprinted the feedback, table, and page-header patterns.
- Ran focused formatting, unit tests, type checking, linting, and a production build.

### Changed

- Files: shared feedback components, TableShell, PageHeader, development status showcase, tests, UI registry, and progress tracker
- Migrations: none
- Dependencies: none
- Events/jobs: none
- UI components: EmptyState, LoadingState, ErrorState, TableShell, PageHeader

### Issues

- The in-app browser runtime could not initialize in this desktop session because of a process-environment collision. Component tests verify semantic table structure and overflow containment; production build verification passed.

### Next session

1. Implement Feature 02 — Slice 5: application shell and navigation presentation.
2. Verify keyboard navigation and responsive sidebar/drawer behavior.
3. Continue only after Slice 5 verification passes.

## 2026-07-30 — Phase 1, Feature 02: Slice 5

### Completed

- Added presentation-only AppShell, ApplicationSidebar, TopNavigation, MobileNavigation, and shared navigation-list compositions.
- Added the exact context-defined primary navigation order plus the separate Administration group to the static showcase.
- Added the desktop 232px persistent sidebar, 72px top bar, tablet drawer trigger, and a labelled Radix dialog drawer containing property, navigation, theme, and account display.
- Corrected the React Server Component boundary: navigation icons are now serializable tokens, and the interactive navigation list is client-owned.
- Added focused AppShell unit coverage and the requested Playwright scenarios for desktop, tablet, mobile focus trap, Escape, overlay dismissal, focus return, and visible labels.
- Imprinted the application shell and navigation pattern.

### Verification

- Production build: passed.
- Focused AppShell unit test: passed.
- Typecheck and targeted lint: passed.
- Playwright: 10 of 12 checks pass. Both desktop and mobile Chromium fail only when opening the responsive drawer. The user manually verified that the trigger changes to `data-state="open"` and a dialog mounts without console or network errors. The automated browser remains closed even after a focused retry helper and when the server runs through Webpack.

### Current blocker

- Do not mark Slice 5 complete until the automated-browser-only drawer interaction is diagnosed and `pnpm test:e2e -- tests/e2e/app-shell.spec.ts` passes. The earlier React Server Component serialization errors are resolved. The Button ref forwarding remains a valid Radix composition correction; the unproven Playwright retry helper should be reassessed during the fresh diagnosis.

### Next session

1. Start with a narrow Playwright-versus-manual-browser diagnosis; capture trace, video, console, network, and client state before editing source.
2. Determine why Playwright's trigger remains closed while the manually operated drawer opens.
3. Restore or replace the retry helper only once the root cause is established, then re-run the Slice 5 proof.

## 2026-08-01 â€” Phase 1, Feature 02: Slice 5 recovery handoff

### Current state

- The application shell presentation is implemented but Slice 5 is incomplete because its Playwright exit proof fails.
- Manual browser verification succeeds: the responsive hamburger trigger opens the labelled dialog drawer.
- The same interaction fails only in Playwright Chromium; it is not resolved by the current development bundler, a browser restart, or the current retry helper.

### Next session

1. Run `/remember restore` and begin from the Slice 5 recovery notes.
2. Diagnose the automated browser boundary without speculative component changes.
3. Do not start Slice 6 until Slice 5 Playwright proof passes.

## 2026-08-01 — Phase 1, Feature 02: Slice 5 E2E recovery

### Completed

- Diagnosed the automated-browser failure as a Next.js development-origin mismatch: Playwright used `127.0.0.1` while the dev server initialized for `localhost` and blocked the HMR resource.
- Allowed the loopback test origin through the documented `allowedDevOrigins` configuration.
- Replaced the unproven drawer retry helper with the normal click-and-visible assertion.
- Configured Playwright to retain trace and video only when a test fails.
- Restored the responsive drawer proof in both Chromium projects, including focus trap, Escape dismissal, overlay dismissal, focus return, and visible labels.
- Reconciled the stale Slice 4 checklist with the already-completed Slice 4 session record.

### Verification

- `pnpm typecheck` passed.
- Focused ESLint passed for `next.config.ts`, `playwright.config.ts`, and `tests/e2e/app-shell.spec.ts`.
- Focused AppShell unit test passed: 2 tests.
- `tests/e2e/app-shell.spec.ts` passed: 6 checks across desktop and mobile Chromium.

### Remaining

- Feature 02 remains in progress. Complete Slice 6 and the feature-level imprint, review, and exit verification before starting Feature 03.

## 2026-08-01 — Phase 1, Feature 02: Slice 6 partial implementation

### Completed

- Established `/development-status` as a guarded internal index and `/development-status/ui-foundation` as the stable UI Foundation catalog route.
- Moved the production `notFound()` guard into the development-status layout so it applies to current and future child routes.
- Organized the catalog into illustrative primitives, feedback states, table shell, page header, theme, and full shell preview.
- Corrected the desktop sidebar so it remains sticky while its own navigation area can scroll.
- Added focused route/catalog unit coverage and desktop/mobile Playwright coverage for the showcase.
- Ran and confirmed the UI imprint audit; no `ui-registry.md` amendment was required.

### Verification

- Focused unit suite passed: 31 tests.
- Strict TypeScript typecheck passed.
- Focused Playwright suite: 14 of 16 checks passed. All catalog checks passed.

### Current blocker

- The recurring mobile navigation-drawer assertion still fails in Chromium and mobile Chromium. Do not make speculative UI changes; hand the targeted recovery prompt to the task that previously resolved the Slice 5 drawer issue, then resume this feature once the failure is diagnosed.
- Do not run feature review or the full exit gate until that test is resolved.

### Next session

1. Give the prepared recovery handoff to the prior Slice 5 resolution task.
2. Diagnose the drawer failure at `/development-status/ui-foundation` without speculative component changes.
3. After it passes, run `/review` and the complete Feature 02 verification suite.

## 2026-08-02 — Phase 1, Feature 02 completion

### Completed

- Completed Slice 6 with the guarded `/development-status` index and permanent `/development-status/ui-foundation` catalog.
- Preserved the production guard while separating production-backed Playwright coverage from development-only catalog diagnostics.
- Added shared browser failure evidence capture, a semantic client-ready helper, and unique generated ThemeControl label ids.
- Completed the required `/imprint` audit and `/review`; no unresolved review finding remains.

### Verification

- `pnpm format:check` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed: 32 tests.
- `pnpm test:e2e:dev` passed: 16 checks.
- `pnpm test:e2e` passed: 6 production-backed checks.
- `pnpm build` passed.

### Changed

- Migrations: none.
- Dependencies: the approved Radix Dialog, Select, and Tabs primitives added in Slice 1.
- Events/jobs/integrations: none.
- Context: `ui-registry.md`, `code-standards.md`, `library-docs.md`, and this tracker updated where required.

### Exit gate

- Feature 02 exit gate passed. Feature 03 has not started.

## 2026-08-02 — Phase 2, Feature 03: Slice 1

### Completed

- Added Prisma 7 with its PostgreSQL adapter and a generated, server-only Prisma client.
- Added Supabase JavaScript/SSR packages and a project-local Supabase CLI contract.
- Added safe local/hosted Supabase, application database, migration database, and service-role environment contracts.
- Added initial Prisma configuration, generated-client boundary, seed command contract, database-test configuration, and migration command contracts.
- Documented the Docker prerequisite and database environment boundaries.

### Verification

- Prisma client generation and schema validation passed.
- Focused formatting, strict type-checking, linting, and 36 unit tests passed.
- Production build passed.
- `git diff --check` passed.

### Issues

- Docker is not installed in the current workspace, so local Supabase startup, migrations, reset, and real database integration tests await later slices and a Docker-capable environment.
- The bundled desktop runtime does not expose Node on `PATH`; direct Node-based verification passed, while standard pnpm scripts require a normal Node installation or PATH setup.

### Next session

1. Implement Slice 2 — Core tenancy schema and Prisma migration.
2. Add initial models, constraints, indexes, and property-role override support.
3. Verify the first migration against local Supabase once Docker is available.

## 2026-08-02 — Phase 2, Feature 03: Slice 2

### Completed

- Added the seven foundational models: `AppUser`, `ClientAccount`, `ClientProperty`, `AccountMembership`, `PropertyAccess`, `FeatureFlag`, and `AuditEvent`.
- Linked `AppUser.id` by UUID contract to Supabase Auth, without duplicating ownership of the `auth.users` table.
- Added account-level client roles and explicit property grants with optional `roleOverride`.
- Added composite foreign keys that require a property access grant's membership and property to belong to the same account.
- Added the initial Prisma migration, including scoped feature-flag constraints and indexes.

### Verification

- Prisma schema formatting, generation, and validation passed.
- Strict typecheck and lint passed.
- Unit suite passed: 41 tests, including five tenancy-schema and migration contracts.

### Issues

- Docker remains unavailable, so `prisma migrate deploy` against local Supabase and clean-database execution remain pending.

### Next session

1. Implement Slice 3 — Supabase security and storage migrations.
2. Add the restricted application database role, tenant-context helpers, RLS structure, and baseline buckets.
3. Continue with Slice 4 only after the Supabase migration layer is ready.

## 2026-08-02 — Phase 2, Feature 03: Slice 3

### Completed

- Added local Supabase configuration plus telemetry-safe start/stop commands that tolerate slow initial health checks.
- Added a separate, checksum-tracked Supabase security migration runner, applied only after Prisma migrations.
- Added the restricted `btls_app` database role, tenant-context helpers, RLS policies for all seven tenancy tables, and property-scoped Storage access policies.
- Initialized `public-media`, `public-content`, `private-media`, and `temporary-uploads` with the approved public/private boundaries.
- Started the local Docker-backed Supabase stack and applied both the Prisma and Supabase security migration layers in order.

### Verification

- Local Prisma migration deploy passed.
- Live database verification confirmed the security migration record, non-bypassing application role, seven RLS-enabled tenancy tables, and all four configured buckets.
- Focused Supabase migration contract tests, formatting, and strict type checking passed.

### Decisions

- Prisma retains ownership of application tables and constraints; Supabase security SQL is versioned under `supabase/security-migrations` and executed explicitly after Prisma.
- Restricted Codex shells disable only optional Supabase CLI telemetry when starting the local stack; this does not affect product data or services.

### Next session

1. Implement Slice 4 — reset, seed, and tenant-isolation integration foundation.
2. Extend the reset workflow to run Prisma, Supabase security migrations, then seed data in order.
3. Add local database integration coverage for cross-property RLS denial.

## 2026-08-02 — Phase 2, Feature 03: Slice 4

### Completed

- Added ordered local deploy and reset workflows: Prisma migration, Supabase security migration, then seed.
- Added non-production Supabase Auth-backed seed users, a BTLS admin, test client account, HVAC and Plumbing properties, membership, and explicit property access grants.
- Seeded the approved access example: account viewer by default, HVAC manager by override, and Plumbing viewer by override.
- Added real local-database tenant-isolation tests for cross-property denial, missing grants, account-role fallback, and property-role precedence.
- Made local reset repeatable by removing only the BTLS-owned Storage policies that the security migration recreates.

### Verification

- Local reset completed successfully after rebuilding Prisma, security, Storage policy, and seed layers.
- Local database authorization suite passed: 4 integration tests.
- Focused workflow and security-migration tests passed: 8 tests.
- Strict TypeScript type-check passed.

### Decisions

- `db:reset` is a local-development-only workflow; it must never target hosted or production data.
- Prisma 7 no longer auto-runs seeds on reset, so the workflow invokes the seed process explicitly after security migrations.

### Next session

1. Implement Slice 5 — development status and feature verification.
2. Run the Feature 03 review and complete exit-gate checks.
3. Do not begin Feature 04 until Feature 03 passes its exit gate.

## 2026-08-02 — Phase 2, Feature 03: Slice 5 and completion

### Completed

- Added the guarded development-status database and environment summary with safe configuration states and restricted-connection reachability.
- Added loading and generic recoverable-error boundaries that never display configuration values or raw database failures.
- Imprinted the diagnostic status-panel pattern in `context/ui-registry.md`.
- Updated ESLint to ignore Supabase CLI temporary output and Prettier to preserve the repository's existing cross-platform line endings.
- Completed the required feature review with no unresolved critical or high-severity findings.

### Verification

- Production status-page request returned 200, rendered the status panel, and contained no connection string or service-role key label.
- Final local reset, migrations, security setup, seed, and four real tenant-isolation tests passed.
- Formatting, linting, strict type checking, 54 unit tests, production build, and six production Playwright checks passed.

### Exit gate

- Passed: a clean local database is created by the ordered migrations; the seed creates the BTLS admin, test client, and properties; Prisma and Supabase migration layers remain separate and repeatable; and real tenant-isolation coverage exists.

### Next session

1. Run `/remember restore`.
2. Run `/architect` for Feature 04 — Authentication.
3. Do not begin Feature 04 until its plan is approved.
