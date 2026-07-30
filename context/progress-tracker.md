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
| Last updated | 2026-07-30 |
| Current phase | Phase 1 — Project Bootstrap |
| Current feature | Feature 01 — Repository and Tooling complete |
| Overall status | Exit gate passed; upstream dependency risk recorded |
| MVP progress | Feature 01 complete; Feature 02 not started |
| Next implementation target | Await approval to plan Feature 02 — Shared UI Foundation |

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

No implementation feature is active.

---

# Up Next

## Immediate

1. [ ] Run `/architect` before planning Feature 02 — Shared UI Foundation
2. [ ] Approve the Feature 02 plan before implementation

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
- [ ] 02 Shared UI Foundation

## Phase 2 — Tenancy, Authentication, and Property Management

- [ ] 03 Supabase and Prisma Foundation
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
