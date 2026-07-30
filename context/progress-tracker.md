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
| Last updated | 2026-07-29 |
| Current phase | Pre-development context setup |
| Current feature | Context files and repository preparation |
| Overall status | On track |
| MVP progress | Planning complete; implementation not started |
| Next implementation target | Phase 1, Feature 01 — Repository and Tooling |

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

## Context Files Created

- [x] `context/code-standards.md`
- [x] `context/architecture.md`
- [x] `context/library-docs.md`
- [x] `context/build-plan.md`
- [x] `context/ui-tokens.md`
- [x] `context/ui-rules.md`
- [x] `context/progress-tracker.md`

---

# In Progress

- [-] Complete the remaining context-driven development files
- [-] Prepare the first Codex implementation prompt
- [-] Final consistency pass across architecture and library provider names

### Current consistency note

`context/architecture.md` must use:

- Postmark for outbound email
- Twilio for two-way SMS

Remove any remaining Resend references.

---

# Up Next

## Immediate

1. [ ] Create `context/project-overview.md`
2. [ ] Create `context/ui-registry.md`
3. [ ] Create any required root instructions such as `AGENTS.md`
4. [ ] Confirm all context files use matching terminology
5. [ ] Prepare Codex prompt for Phase 1, Feature 01
6. [ ] Initialize the repository

## First implementation feature

### Phase 1 — Project Bootstrap

#### Feature 01 — Repository and Tooling

- [ ] Initialize Next.js App Router application
- [ ] Enable strict TypeScript
- [ ] Add Tailwind CSS
- [ ] Add shadcn/ui foundation
- [ ] Add linting and formatting
- [ ] Add Vitest
- [ ] Add React Testing Library
- [ ] Add Playwright
- [ ] Add Zod environment validation
- [ ] Create approved folder structure
- [ ] Add health Route Handler
- [ ] Add development status page
- [ ] Add CI checks
- [ ] Commit context files into repository
- [ ] Run type-check, lint, tests, and production build
- [ ] Verify Feature 01 exit gate

---

# Build Roadmap

## Phase 1 — Project Bootstrap

- [ ] 01 Repository and Tooling
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
| `architecture.md` may still reference Resend instead of Postmark | Low | Open | Project owner / Codex | Replace remaining Resend references before repository bootstrap |
| Repository has not yet been initialized | Expected | Open | Codex | Begin Phase 1, Feature 01 |
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

---

# Session Notes

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

- Create the remaining context files
- Correct any Resend references in `architecture.md`
- Prepare the first implementation prompt
- No repository exists yet

### Next session

1. Finish `project-overview.md`
2. Create `ui-registry.md`
3. Prepare Phase 1, Feature 01 Codex prompt
4. Initialize the project repository

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
