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
| Last updated | 2026-10-02 — Robin architecture reconciliation adopted in the working tree; documentation diff awaiting owner review; numbered-feature status unchanged |
| Current phase | Phase 4 — Revenue Operations Foundation |
| Current feature | Feature 08 — complete through Slice 08.10; exit gate passed |
| Overall status | Features 01–08 complete; Feature 09 and later features not started |
| MVP progress | Features 01–08 complete |
| Next implementation target | Feature 09 — Lead Operations and Action Workspace (not started; requires its own architect approval) |

---

## Preparation — Robin architecture adoption (2026-10-02)

- Owner approved the repository-aware reconciliation and controlled documentation adoption.
  Preflight verified canonical main `7d211e2f9e6ee77755031674a2826a951ec65b10`, unchanged
  from the Robin handoff/review. Features 01–08 remain complete; F09+ is not started.
- Recorded the approved proposal/resolution within the existing Shared Change Gate section
  of `context/shared/shared-contracts.md`; no new decision registry or ID scheme.
- Adopted `context/robin/architecture.md` as subordinate detail, discoverable from AGENTS
  and root/shared context. The supplied draft is retained as historical source evidence.
- Robin owns core/runtime/policy and bounded evidence; Revenue owns its first integration
  and business truth. SC-16 explicitly distinguishes those owners and shared infrastructure.
- Adopted the four-part domain contract, narrow planned AIModelGateway/OpenAI boundary,
  execution revalidation, specific-action approval, scoped takeover and unknown-result
  reconciliation. Contextual UI and BTLS-assisted capability-specific onboarding preserve
  separate Shadow-ready/live-ready concepts and all existing MVP limits.
- Clarified F12 minimum evaluation/evidence foundation, F13 live non-scheduling runtime,
  F14 Revenue scheduling then Robin integration/milestone, and F23 later Revenue expansion.
  Feature numbering, declared dependencies and serial development governance are unchanged.
- Updated `context/shared/dependency-analysis-draft.md` only as supporting evidence. The
  dependency analysis exists; its canonical map remains unadopted and absent. Earlier
  preparation notes saying analysis was not started are historical bookmarks.
- No schema, migration, package, application/provider/runtime code, API/event/job/capability
  registration or implemented UI changed. UI tokens and registry are unchanged; no imprint
  is required. No Ownership Matrix, parallel pilot/development or F12/F13 implementation started.
- Branch: `codex/adopt-robin-architecture`, based on verified main. Changes are uncommitted
  and unstaged; commit/push requires approval of the completed documentation diff.
- Validation: complete documentation diff and source-relative draft review passed; local
  Markdown links/anchors and artifact authority checks passed. All 56 feature headings,
  declared dependencies, unrelated feature sections, protected domain sections, inherited
  shared rules and serial governance are unchanged. Original Robin source body and input
  hashes were verified. Live main still matches the preflight baseline; implementation
  files are unchanged. No unresolved critical/high documentation finding remains. Product
  tests/build were not rerun because this adoption changes documentation only.
- Next: owner review of the completed diff; commit/push only when approved. Dependency-map
  canonicalization requires separate authorization, followed by separately authorized
  Ownership Matrix/execution preparation. Feature 09 remains the next implementation target
  and needs its own architect approval; do not start it as part of this preparation.

## Preparation — Shared Contracts canonicalization (2026-10-01)

- Adopted the approved draft as `context/shared/shared-contracts.md`, preserving SC-01 through SC-16,
  their ownership/classifications, producer/consumer boundaries, and T01–T12 obligations.
- The Shared Change Gate is canonical governance. Shared use never grants shared mutation authority;
  additive shared changes are not automatically safe. Private approved work may continue locally.
- Verified remote `main` remains the audited `db7f6d61bf21bc331a055548fea7559b8486f5c1`.
  The starting checkout at `5f26e57` had the same tracked tree; the documentation branch
  `codex/canonicalize-shared-contracts` starts from the audited merge.
- Added Shared Contracts discovery and authority by concern in AGENTS.md and synchronized the
  architecture read list. Corrected only the residual SearchKeyword glossary's locale wording.
- D1, D2, Lead Stage, planned/implemented/deferred distinctions, and explicitly uncontracted
  details remain unchanged. Historical reports and the supplied draft/report remain input evidence.
- Verification: complete diff and draft comparison, contract/test-obligation preservation,
  discovery/authority checks, evidence targets, documentation scope, and `git diff --check`.
  No product code, Prisma schema, migrations, dependencies, tests, API/event registrations,
  jobs, integrations, or UI behavior changed; product test/build suites were not rerun.
- Three-layer review: plan alignment PASS; system integrity PASS; documentation readiness PASS.
  No unresolved critical/high finding or blocker to dependency mapping.
- Next preparation stage: dependency mapping, not started. Ownership matrix, parallel-development
  plan, Snitch File, parallel pilot, and parallel development remain not started. This adoption
  does not establish readiness for sustained parallel development. Feature 09 remains not started.

---

## Preparation — Ubiquitous Language canonicalization (2026-09-29)

- Adopted the approved draft as `context/shared/ubiquitous-language.md`; preserved the supplied
  `context/ubiquitous-language.md` review draft unchanged as input evidence, not current authority.
- Verified repository HEAD matches the approved baseline
  `7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7`; no newer implementation change needs reconciliation.
- Preserved D1's exact SearchKeyword identity and market-evidence boundary, D2's durable provenance
  requirement and two approved ticketless paths, and Work Management ownership of Intervention history.
- Made Lead Stage / `stage` / future `lead.stage_changed` explicit. Corrected only the identified
  PropertyAccess, Lead Stage, transactional email result, Notification read, and WorkPackageTemplate
  wording in current context. Existing MediaAsset explicit-relationship semantics already agree.
- Added authoritative terminology discovery to AGENTS.md and the architecture read list without
  changing architecture, schema, or feature-plan authority in their respective concerns.
- Verification: full documentation diff and draft comparison reviewed; `git diff --check` and
  new-file whitespace checks passed; read-only assertions verified D1/D2, terminology/discovery,
  29 pinned evidence targets, current relative links, and documentation-only scope. No product code,
  schema, migration, dependency, event registration, job, integration, or UI behavior changed.
- Three-layer review: plan alignment PASS; system integrity PASS; documentation readiness PASS.
  No unresolved critical/high finding or blocker to the next preparation stage.
- Exact Search evidence fields, AUTO_GUARDED allowlist, Intervention persistence design, connected
  mailboxes, voice/transcription, and Generated Job Brief remain deferred to their owning work.
- Ready for Shared Contracts preparation; Shared Contracts and Feature 09 were not started.

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

## Phase 3 — Feature 07: Events, Jobs, Notifications, and Operational Records

- [x] Slice 07.1 — Documentation and contracts
- [x] Slice 07.2 — Persistence and security
- [x] Slice 07.3 — Durable event/job proof
- [x] Slice 07.4 — Notification center
- [x] Slice 07.5 — Operations and retry UI
- [x] Slice 07.6 — Communication providers and receipts
- [x] Slice 07.7 — Scheduled media cleanup and observability
- [x] Slice 07.8 — Verification and closeout
- [x] Slice 07.9 — Durable recovery hardening and final review remediation
- [x] Slice 07.10 — Provider interruption safety, webhook claim recovery, and verification reliability
- [x] Slice 07.11 — PostgreSQL ProviderDispatch compare-and-set proof and final review
- [x] Feature 07 exit gate passed

Feature 07 provides versioned internal events, durable job/outbox/attempt evidence, generic contextual notifications,
tenant-safe operations and Admin retry controls, Postmark/Twilio provider boundaries with infrastructure-only
dispatch and receipt evidence, interruption-safe provider outcomes, recoverable timestamp-fenced webhook processing,
scheduled delegation to Feature 06 media cleanup, and data-minimized Pino/Sentry observability.

## Phase 4 — Feature 08: Customer, Workforce, and Revenue Settings Foundation

- [x] Slices 08.1–08.10 implemented and verified.
- [x] Slice 08.8: browser SELECT/mutation denial on all nine tables, existing restricted server role, atomic discard, stable search focus/history.
- [x] Customer/person Contact UI/services, explicit relationship state, safe duplicate review, and phone normalization.
- [x] Optional service locations/assets and explicit property Tag assignments.
- [x] EmployeeProfile administration separate from AppUser.
- [x] Revenue defaults and eligible shared SendingIdentity selection.
- [x] Minimal canonical shared PropertyService, approved capability bundles, additive migrations and RLS.
- [x] Shared sentence-case table headers, responsive UI imprint, and three-layer review.
- [x] Slice 08.9: Feature 08 document boundaries, shared draft guard, coordinated directory state, and regression review.
- [x] Slice 08.10: offered-service editor history protection and same-editor directory preservation; full gate and review passed.
- [x] Feature 08 exit gate passed.

Verification: 288 unit/component tests, 58 PostgreSQL tests (including all 18 Feature 08 regressions),
and all 60 desktop/mobile production browser tests passed. Typecheck, lint, production build,
Prisma validation, applied security-migration integrity, source formatting and whitespace checks passed.
Dark/light desktop, mobile, and tablet screenshots were inspected. No unresolved critical/high finding.
Changes are uncommitted; migrations are applied locally only. No production deployment or provider send.
See [Feature 08 completion report](feature-08-completion.md) for the full inventory and evidence.

## Product and Architecture Context

- [x] Robin 1.0 established as the Revenue Response Sidekick
- [x] Robin 1.0 completion milestone established after Feature 14
- [x] Shadow Mode established as a no-side-effect evaluation overlay
- [x] Robin call-content listening/recording/transcription prohibited
- [x] Connected-mailbox intelligence remains deferred
- [x] Voice Quick Capture and Generated Job Brief deferred beyond current MVP
- [x] Robin 2.0 Operational Companion substrate explicitly deferred

These completed entries record context decisions, not implemented Robin product features.

- [x] MVP product boundary established
- [x] Three product studios / six primary MVP components established
  - Website Intelligence
  - Smart Blog Studio
  - Content Intelligence
  - Revenue Operations / Command Center
  - Robin AI Automation Agent
  - Search Operations / Fulfillment
- [x] Shared Work Management established across Website Intelligence, Content Intelligence, and Search Operations
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
- [x] Search Operations domain architecture established
- [x] Revenue Operations canonical architecture reconciled before Feature 08 implementation
- [x] SearchTarget established as the primary search-strategy unit
- [x] Search fulfillment and outcome measurement explicitly separated
- [x] Search provider usage/cost controls established
- [x] Guarded Search optimization and Fleet Remediation boundaries established
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
- [x] `context/ui-registry.md`
- [x] `context/progress-tracker.md`

---

# In Progress

No feature is in progress. Feature 08 is complete through Slice 08.10. Offered-service history and same-editor directory preservation passed regression coverage and the full verification/review gate; no unresolved review finding remains. See [completion report](feature-08-completion.md). Feature 09 remains not started.

---

# Up Next

## Immediate

1. [ ] Review the uncommitted Robin documentation adoption; commit/push only after owner approval.
2. [ ] Obtain separate authorization before canonicalizing the updated dependency map or starting Ownership Matrix/execution preparation.
3. [ ] Run restore/architect and obtain approval before starting Feature 09; no implementation starts in this documentation task.

---

# Build Roadmap

## Phase 1 — Project Bootstrap

- [x] 01 Repository and Tooling
- [x] 02 Shared UI Foundation

## Phase 2 — Tenancy, Authentication, and Property Management

- [x] 03 Supabase and Prisma Foundation
- [x] 04 Authentication
- [x] 05 Property Access and Admin Property Directory

## Phase 3 — Shared Infrastructure

- [x] 06 Storage and Media
- [x] 07 Events, Jobs, Notifications, and Operational Records

## Phase 4 — Revenue Operations Foundation

- [x] 08 Customer, Workforce, and Revenue Settings Foundation
- [ ] 09 Lead Operations and Action Workspace
- [ ] 10 Public Lead Ingestion
- [ ] 11 Customer Conversations and Communication

## Phase 5 — Revenue Operations and Robin Core

- [ ] 12 Robin Configuration, Knowledge, and Shadow Mode
- [ ] 13 Robin Core Response, Runs, Approval, and Handoff
- [ ] 14 Appointment Scheduling and Time Tracking Foundation
  - Robin 1.0 milestone after Feature 14
- [ ] 15 Pricebook and Estimate Drafting
- [ ] 16 Estimate Delivery, Public Presentation, and Acceptance
- [ ] 17 Job and Field Operations
- [ ] 18 Invoice and Payment Operations
- [ ] 19 Revenue Exceptions and Operations Views
- [ ] 20 Quick Capture — Text and Proposal Review
- [~] 21 Voice Quick Capture and Generated Job Brief — Deferred / Post-MVP
- [ ] 22 Review Requests and Lifecycle Automation
- [ ] 23 Expanded Robin Revenue Automations

## Phase 6 — Smart Blog Studio

- [ ] 24 Content Foundation and Strategy
- [ ] 25 Article Editor and SEO Readiness
- [ ] 26 Internal Links, Publishing, and Playbook

## Phase 7 — Website Data Foundation

- [ ] 27 Integration Connections
- [ ] 28 Data Ingestion, Normalization, and Page Inventory
- [ ] 29 Metric Engine and Baselines

## Phase 8 — Website Intelligence

- [ ] 30 Findings Engine
- [ ] 31 Website Intelligence Interface

## Phase 9 — Content Intelligence

- [ ] 32 Article Scorecards
- [ ] 33 Content Findings

## Phase 10 — Shared Work Management

- [ ] 34 Work Packages and Tickets
- [ ] 35 Interventions and Before/After Measurement

## Phase 11 — Search Operations Studio

- [ ] 36 Search Program and Shared Vocabulary Foundation
- [ ] 37 Page Semantic Classification and Search Graph
- [ ] 38 Keyword Clusters and Search Targets
- [ ] 39 Market Coverage Workspace
- [ ] 40 Search Provider and Usage Foundation
- [ ] 41 Organic and Local Ranking Evidence
- [ ] 42 Site Inspection and Technical Audit
- [ ] 43 Content Authority and Internal Linking
- [ ] 44 Local Presence and External Authority Signals
- [ ] 45 Search Opportunity and Prioritization Engine
- [ ] 46 Search Work Integration
- [ ] 47 Fulfillment Cycles and Delivery Proof
- [ ] 48 Portfolio Exception Operations
- [ ] 49 Bounded Optimization Execution
- [ ] 50 Fleet Remediation
- [ ] 51 Search Measurement and Business Outcomes

## Phase 12 — Command Center Completion

- [ ] 52 Property Overview
- [ ] 53 BTLS Cross-Property Overview

## Phase 13 — Production Hardening and Launch

- [ ] 54 Security and Data Protection Review
- [ ] 55 Reliability, Performance, and Accessibility
- [ ] 56 Release Readiness

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

- **2026-09-07** — Robin 1.0 is the Revenue Response Sidekick focused on bounded Revenue response.
- **2026-09-07** — Robin 1.0 becomes operational through Features 12–14 and reaches its milestone after Feature 14; Feature 13 activates core non-scheduling response and Feature 14 adds approved scheduling.
- **2026-09-07** — Feature 23 expands later Revenue automation rather than activating Robin for the first time; only implemented owning services become tools.
- **2026-09-07** — Shadow Mode is a no-side-effect evaluation overlay separate from Off / Approval Required / Automatic authority; RobinRun/RobinAction records proposals while business mutations and customer sends are suppressed.
- **2026-09-07** — Feature 21 is retained as a numbered but deferred post-MVP roadmap slot and is not an MVP gate or dependency for Features 22 or 23.
- **2026-09-07** — Current-MVP Quick Capture is text-only, always previews proposals, requires human confirmation, and remains separate from Robin authority modes.
- **2026-09-07** — Robin does not listen to, record, ingest, or transcribe ordinary phone calls. Human-reported outcomes and separate Search call-attribution metadata do not authorize Robin call-content processing.
- **2026-09-07** — Connected-mailbox/inbound email intelligence remains post-MVP; current TransactionalEmailProvider / Postmark, Twilio, and Cronofy boundaries remain intact.
- **2026-09-07** — Robin 2.0 Business Knowledge Ocean, generalized Business Graph, ontology, Operational Registers, generalized commitments/handoffs, advanced natural field reporting/entity resolution, offline field runtime, role companions, and cross-system/cross-studio orchestration remain deferred.
- **2026-09-07** — Generic Feature 07 Notification must carry property, recipient, origin/source, validated subject, concise title/body, read state, practical destination/action route, and correlation context. Owning workflows provide business meaning; no Robin-specific shared infrastructure or HandoffPackage model is introduced.

- **2026-08-26** — Revenue Operations canonical reconciliation supersedes the old Lead-centric planned architecture before Feature 08 implementation; no Revenue feature is implemented or complete.
- **2026-08-26** — The canonical roadmap contains 13 phases and 56 numbered features: Search Operations is 36–51, Command Center Completion is 52–53, and Production Hardening is 54–56.
- **2026-08-26** — Payment processing, address/geocoding, voice transcription, and connected-mailbox providers remain deferred; core manual/external Payment and text Quick Capture paths do not require them.
- **2026-08-20** — The MVP contains Website Intelligence, Smart Blog Studio, Content Intelligence, Revenue Operations, Robin, Search Operations, and shared Work Management.
- **2026-07-28** — Campaign Tracking, general Funnel Mapping, advertising management, predictive analytics, and full project-management features are outside the MVP.
- **2026-07-28** — BTLS will be one multi-tenant SaaS application and one managed codebase.
- **2026-07-28** — Client properties are database records, not separate deployments or repositories.
- **2026-07-28** — Supabase provides PostgreSQL, Auth, Storage, and selected Realtime capabilities.
- **2026-07-28** — Prisma is the primary server-side database and migration layer.
- **2026-07-28** — Server-side authorization and PostgreSQL RLS jointly protect property data.
- **2026-08-20** — Work Management is shared by Website Intelligence, Content Intelligence, and Search Operations.
- **2026-07-29** — Inngest is the default background-job and scheduling system.
- **2026-07-29** — Postmark is the outbound email provider for MVP.
- **2026-07-29** — Inbound email synchronization is deferred.
- **2026-07-29** — Twilio is the two-way SMS provider.
- **2026-08-26** — Cronofy supplies availability and external calendar projection/synchronization; BTLS Appointment and JobVisit records remain operational schedule truth.
- **2026-07-29** — BTLS-built websites are the primary publishing target.
- **2026-07-29** — WordPress native-post publishing is supported through a limited REST API adapter.
- **2026-07-29** — Unsupported WordPress configurations use manual/export fallback.
- **2026-07-29** — Dark mode is the default UI theme.
- **2026-07-29** — Light and system themes use the same semantic UI tokens.
- **2026-07-29** — Code must favor clarity, explicitness, and junior-developer debuggability over cleverness.
- **2026-08-26** — Revenue Operations launches as a field-capable responsive web beta. A dedicated native application remains post-MVP for validated offline/background/deeper-device needs.
- **2026-07-29** — pnpm 11.9.0 is the sole package manager. `pnpm-lock.yaml` is the only committed dependency lockfile.

---

- **2026-08-20** — Search Operations Studio is the third BTLS studio and the recurring organic-search fulfillment control plane.
- **2026-08-20** — SearchTarget is the strategic search unit; WebsitePage remains page identity and receives Search semantics through related records.
- **2026-08-20** — Page structural type and strategic purpose are separate; service/location/topic assignments are normalized.
- **2026-08-20** — Search keyword metrics, organic ranks, and local rank maps are dated evidence; coverage is a versioned derived assessment.
- **2026-08-20** — Durable Search opportunities/problems reuse shared Findings and Work Management.
- **2026-08-20** — SearchFulfillmentCycle proves delivery; MeasurementReview evaluates outcome.
- **2026-08-20** — The blanket website-modification exclusion is narrowed: unbounded/AI-directed modification remains prohibited; approved `AUTO_GUARDED` actions may run only through capability- and policy-controlled Search adapters on supported managed sites.
- **2026-08-20** — Search provider usage and estimated cost are property/program-scoped operational data.
- **2026-08-20** — Fleet Remediation is BTLS-internal and preserves property-specific Intervention history.
- **2026-08-20 (superseded 2026-08-26)** — The Search Operations reconciliation previously expanded the roadmap to 48 features; the current 56-feature roadmap above now controls.

# Session Notes

## 2026-09-13 — Feature 07 Slice 07.11: PostgreSQL ProviderDispatch race proof

### Review finding resolved

- Added a real Prisma/PostgreSQL lifecycle test for the stale ProviderDispatch compare-and-set transition. It creates
  an authentic accepted SMS dispatch and fingerprint, converts the fixture to pending, and verifies that a fresh
  duplicate remains in progress without changing the row or calling the provider again.
- A deterministic read barrier makes two workers load the same expired pending generation before either may update
  it. PostgreSQL records exactly one successful pending-to-uncertain update and one lost compare-and-set race.
  Both callers return controlled `PROVIDER_DISPATCH_INTERRUPTED` uncertainty, the provider is not called again,
  and one durable uncertain row retains its property, correlation, idempotency, operation, channel, and fingerprint.
- The existing provider-dispatch service behaved as designed. No production implementation, schema, migration,
  provider, dependency, event, job, authorization rule, or UI code changed.

### Verification and boundaries

- Full local PostgreSQL/RLS suite: 15 files / 40 tests passed.
- Full unit/component suite: 63 files / 269 tests passed.
- Repository lint, TypeScript, Prisma validation, production build, and `git diff --check` passed.
- The existing two consecutive 6/6 production notification/operations browser runs remain applicable because
  Slice 07.11 changes database integration coverage and documentation only.
- Final `/review`: plan alignment, system integrity, and production readiness passed with no unresolved critical,
  important, or minor finding.
- No reusable UI pattern changed, so the existing Feature 07 imprint remains current.
- Features 01–07 remain complete. Feature 08 and future Revenue/Robin functionality remain not started.
## 2026-09-13 — Feature 07 Slice 07.10: Provider interruption and verification hardening

### Review findings resolved

- Provider dispatches now expose one explicit successful result: `ACCEPTED`. Fresh `PENDING` duplicates return a
  controlled in-progress failure with a retry deadline. Expired pending rows atomically become `UNCERTAIN`, and
  uncertain, rejected, and failed duplicates remain non-success outcomes. None of these paths repeats a Postmark or
  Twilio call when the earlier provider outcome may be unknown.
- Webhook receipts now use `processingStartedAt` as an expiring lease and fencing token. Simultaneous claims yield
  one worker, expired claims recover atomically, and an abandoned worker cannot complete or fail work after a
  replacement claim.
- Notification and operations browser tests share a positive 20-second sign-in navigation wait started before form
  submission. The global error test renders a complete static document, removing the invalid nested `html` test
  markup and warning.
- The canonical project instructions now use `TransactionalEmailProvider`; no competing `EmailProvider` name
  remains. The build-plan project marker and Slice 07.10 contract now agree with Feature 07 completion.

### Verification and boundaries

- Provider focused unit suite: 10/10 passed, covering accepted, pending, uncertain, rejected, failed, conflicting,
  cross-property, and no-resend cases.
- PropertySwitcher passed five consecutive isolated runs (10/10 assertions); its component and timeout remain
  unchanged because the attached overlapping-run timeout did not reproduce.
- Full unit/component suite: 63 files / 269 tests passed with no global document warning.
- Full local PostgreSQL/RLS suite: 15 files / 39 tests passed, including simultaneous webhook claims, expired
  recovery, and old-worker fencing.
- Repository lint, TypeScript, Prisma validation, production build, and `git diff --check` passed.
- Two consecutive production-server notification/operations Playwright runs each passed 6/6 across desktop and
  mobile Chromium.
- Final `/review`: plan alignment, system integrity, and production readiness passed with no unresolved critical,
  important, or minor finding.
- No schema, migration, dependency, event, job, or reusable UI pattern changed. The existing Feature 07 UI imprint
  remains current.
- Features 01–07 remain complete. Feature 08 and all future Revenue/Robin work remain not started. ProviderDispatch
  and WebhookReceipt remain infrastructure evidence only; Feature 06 media ownership and behavior are unchanged.

## 2026-09-12 — Feature 07 Slice 07.9: Durable recovery hardening

### Review findings resolved

- Active `RUNNING` collisions now return their lease deadline, and the Inngest adapter raises `RetryAfterError`
  instead of acknowledging the delivery as successful.
- Claim, completion, failure, and interrupted-attempt transitions use Prisma transactions. The exact claim
  `startedAt` value fences late workers so a recovered execution cannot be overwritten.
- Expired `STARTED` attempts become `FAILED / INTERRUPTED_EXECUTION` with a finish time. Recovery checks the
  existing attempt count before invoking another handler and never exceeds the configured maximum.
- Job and attempt records now persist controlled failure messages rather than arbitrary exception text. Existing
  safe categories, correlation identifiers, structured logs, and sanitized Sentry context retain diagnostic value.
- Admin manual retry accepts interrupted failures only for the existing validated, idempotent handler allowlist.
  Operator property isolation and all existing retry restrictions remain unchanged.
- The roadmap marker now agrees with the tracker header and completed Feature 07 exit gate.

### Verification and boundaries

- Focused job/media/operations unit suite: 21/21 passed.
- Full unit/component suite: 63 files / 266 tests passed.
- Full local PostgreSQL/RLS suite: 15 files / 39 tests passed, including real concurrent recovery and late-worker
  fencing with no abandoned `STARTED` attempts.
- Repository lint, TypeScript, Prisma validation, scoped Prettier, production build, and whitespace checks passed.
- Production-server notification/operations Playwright: 6/6 passed across desktop and mobile Chromium.
- `/review` repeated after Slice 07.9: plan alignment, system integrity, and production readiness passed with no unresolved critical, important, or minor finding.
- No schema or migration was required. No UI pattern changed, so the existing Feature 07 imprint remains current.
- Features 01–06 remain complete. Feature 08 and all Revenue/Robin work remain not started. No Feature 06 media
  lifecycle, cleanup policy, provider boundary, or unrelated uncommitted change was overwritten.


## 2026-09-11 — Feature 07 Slices 07.6 and 07.8: Providers, verification, and closeout

### Completed implementation

- Completed the previously open communication-provider slice with the official `postmark@5.1.0` and
  `twilio@6.1.1` SDKs. The Postmark adapter maps the normalized `TransactionalEmailProvider` contract to the
  transactional stream and returns Postmark message IDs. The Twilio adapter maps the property-scoped
  `SmsProvider` contract through a Messaging Service and returns normalized Twilio message IDs.
- Added a durable ProviderDispatch service. It resolves an active property-owned `BTLS_MANAGED` identity,
  validates an optional JobExecution against the same property, fingerprints the complete request, persists
  provider correlation/acceptance evidence, rejects conflicting idempotency reuse, and never resends an accepted or
  uncertain duplicate. It remains infrastructure execution evidence only.
- Added provider-neutral WebhookReceipt recording and atomic claim/complete/fail transitions. Duplicate provider
  event keys reuse one receipt only when their normalized context matches. Failure records accept safe categories,
  never raw provider text.
- Removed the empty connected-mailbox code placeholder. ConnectedMailboxProvider remains a documented future
  boundary only; no mailbox provider, OAuth, sync, inbound email, or mailbox sending was implemented.
- Added server-only provider environment placeholders without values. Provider SDK failures are normalized and do
  not retain raw SDK exception causes.

### Persistence, migration, and security closeout

- Applied the existing Feature 07 Prisma and security migrations to local Supabase. The historical Feature 06
  checksum mismatch was not erased, reset, or resolved by editing its applied migration.
- Updated the security migration runner to hash normalized LF content while accepting raw platform bytes, and
  explicitly recorded the one observed historical draft checksum. Added
  `20260911120000_reconcile_storage_media_security.sql` as a forward-only reconciliation of the committed Feature
  06 definition.
- After deployment exposed the old capability function ordering, added the forward-only
  `20260911122000_restore_feature_07_platform_capabilities.sql`; no applied migration was rewritten.
- Review found direct browser grants on provider evidence tables. Added
  `20260911121000_provider_infrastructure_server_writes.sql` to reserve WebhookReceipt, SendingIdentity, and
  ProviderDispatch writes for trusted server services while retaining scoped reads. PostgreSQL tests prove browser
  forgery is denied.

### Verification, responsive review, and JSM closeout

- `pnpm test`: 63 files / 263 tests passed.
- `pnpm test:database`: 14 files / 37 PostgreSQL integration and RLS tests passed after real local deployment.
- `pnpm lint`, `pnpm typecheck`, `pnpm db:validate`, final scoped Prettier, and `git diff --check` passed.
- `pnpm build` passed with the Inngest route, notification routes, operations routes, and Sentry build hook.
- Production-server Playwright: the full Feature 07 selection passed 10/10 across desktop and mobile Chromium.
  The corrected notification-only rerun passed 2/2. Real authentication/database coverage proves unread reload
  persistence, keyboard read action, safe typed destination opening, unsupported-destination fallback, cross-user
  denial, operations retry/denial, and zero horizontal overflow at desktop/mobile plus the 768px check. Captured
  browser evidence recorded zero page and console errors.
- `/imprint`: desktop/mobile notification screenshots and the registered operations/development patterns were
  audited. The registry remains accurate; only the closeout verification note/date changed.
- `/review`: fixed provider-table browser writes, cross-property JobExecution linkage, provider-error data
  minimization, safe failure categories, migration ordering, and an incorrect screenshot capture point. Final plan
  alignment, system integrity, and production readiness pass with no unresolved critical, high, or meaningful
  finding.

### Feature 07 exit gate

- PASS — a versioned test event completes one durable property-scoped job and creates exactly one intended,
  contextual notification.
- PASS — duplicate events, jobs, dispatches, and provider receipts do not duplicate intended effects; interrupted
  and uncertain execution remains visible.
- PASS — failed work is tenant-scoped, correlated, inspectable, and safely retryable only through the audited Admin
  allowlist.
- PASS — active execution collisions defer until lease expiry; abandoned attempts finalize atomically, maximum attempts remain bounded, and late workers cannot overwrite recovered execution.
- PASS — notifications enforce current property/recipient authorization, persistence, validated subjects, and
  server-derived destinations.
- PASS — Postmark and Twilio remain behind normalized BTLS interfaces; ProviderDispatch/WebhookReceipt remain
  infrastructure evidence.
- PASS — scheduled media cleanup calls the existing Feature 06 service without changing media ownership or policy.
- PASS — no Revenue or Robin business record, rule, handler, connected mailbox, or later-feature workflow was
  introduced.

Feature 07 is complete. Feature 08 remains not started. Existing Feature 01–06 completion and all prior session
history are preserved.

## 2026-09-10 — Feature 07 Slice 07.7: Scheduled media cleanup and observability

### Implemented and retained boundaries

- Added one bounded Inngest coordinator at `TZ=UTC 17 3 * * *` with five-minute jitter, global concurrency `1`, three workflow retries, and a 25-candidate maximum. Each candidate creates or reuses a property-scoped `storage.media_cleanup` JobExecution with a deterministic per-day business idempotency key and correlation context.
- The job adapter reloads the exact property/asset, uses Feature 06's exported eligibility evaluator for changed state, and delegates actual claims, lease timing, storage deletion, tombstones, and retry state to `executeMediaCleanupCandidate`. It does not redefine or move MediaAsset lifecycle policy.
- Provider deletion failures and active claim races remain retryable and visible through JobExecutionAttempt. The now-implemented cleanup handler was added to the existing Admin-only manual-retry allowlist; ordinary Operator property scoping and retry denial remain unchanged.
- Added Pino structured logging with central redaction for credentials, payloads, bodies, recipients, filenames, and object paths. Added Sentry's documented Next.js initialization for server, edge, client, request errors, release/source-map configuration, and a strict operational capture boundary that emits only safe identifiers/categories. Automatic Sentry events remove request, user, breadcrumb, extra, and non-allowlisted context before transmission.
- Extended the existing guarded development-status panel with value-free Inngest and Sentry configuration states. `/imprint` refreshed the existing Development Status Summary entry and removed its exact duplicate; no new visual pattern was introduced.
- Selected dependencies: `@sentry/nextjs@10.74.0` and `pino@10.3.1`; the known `@sentry/cli` install script is explicitly allowed by the repository pnpm policy. No schema or migration changed in this slice.

### Verification and review

- Unit/component: `pnpm test` — 62 files / 255 tests passed. Focused 07.7 group — 7 files / 43 tests passed.
- PostgreSQL: focused scheduled-cleanup integration — 2/2 passed, proving one durable job under duplicate scheduling, Feature 06 deletion/tombstone delegation, and persisted provider-failure visibility in MediaAsset, JobExecution, and JobExecutionAttempt.
- Browser: development-status desktop/mobile projects — 4/4 passed and explicitly found the Inngest/Sentry rows.
- Static/release: `pnpm typecheck`, scoped ESLint, scoped Prettier, `git diff --check`, and `pnpm build` passed. The Sentry v11 deprecation warning found on the first build was fixed by using `@sentry/nextjs/config`; the final build was clean.
- Repository-wide `pnpm lint` still has the one pre-existing Slice 07.6 `ConnectedMailboxProvider` empty-interface placeholder error. The full database suite reaches PostgreSQL but still has the three known Feature 07 policy failures because security migrations remain unapplied behind the historical storage-security checksum mismatch. The focused 07.7 database test is passing; no migration was rewritten or bypassed.
- `/review`: plan alignment PASS; system integrity PASS; production readiness PASS for Slice 07.7 with the explicit live-environment qualification below. No critical, high, or important finding remains.

### Exit gate and next work

- Slice 07.7 acceptance is satisfied. Live hosted Inngest cron delivery and Sentry event receipt remain deployment checks because those credentials/services are not configured locally; configuration state is now visible without exposing values.
- Feature 07 remains IN PROGRESS. Slice 07.6 Communication providers and receipts is still not started, and Slice 07.8 final verification/closeout remains open. Feature 08, Revenue, Robin, and connected-mailbox work were not started.

## 2026-09-10 — Feature 07 Slice 07.5: Operations and retry UI

### Implemented and retained boundaries

- Added `/admin/operations` and `/admin/operations/[jobExecutionId]`: property/status/correlation filters, paginated execution/attempt history, failure summaries, correlation IDs, retry eligibility, and visible dispatch progress/failure. Loading, empty, error, denied, disabled, queued, and success states are present.
- BTLS Admin can view active properties across tenants. Ordinary Operators require explicit active property membership. Clients and disabled/unauthenticated users cannot access operations. All list/detail/attempt queries enforce server scope; hidden navigation is not authorization.
- Admin-only retry validates the last failed attempt and allowlisted replay contract, then atomically claims the execution, writes `job_execution.retry_requested` audit evidence, and persists an EventOutbox request. Concurrent, duplicate, stale, cross-property, active, permanent, malformed, and unsupported retry requests are denied. Original effect idempotency/correlation and attempt history remain intact.
- Manual retries initially allow only the implemented `infrastructure.contextual_proof` handler and grant one further execution attempt. No legacy no-op, media cleanup, provider, or future domain handler is implicitly approved for retry.
- Added version-1 `operations.job.retry_requested` internal event and a bounded one-minute outbox dispatch pump for committed retry recovery. Dispatch reloads the durable row, validates its context, reuses the existing JobExecution, and uses Inngest `step.sendEvent` for subsequent worker delivery. Unsupported permanent outbox rows no longer occupy every automatic dispatch batch.
- Generic job notification links now resolve through the operations service and still enforce the recipient notice's property. Raw payloads, provider error text, and credentials are omitted from UI DTOs. ProviderDispatch remains infrastructure evidence only.
- Features 01–06 remain complete. Feature 08 and future Revenue/Robin work are not started. No Feature 06 lifecycle/cleanup logic, provider implementation, dependency, or previously applied migration file was changed. Existing uncommitted context/code/package changes were preserved; no commit or branch change occurred.

### Files and database impact

- New service: `src/server/operations/operations.ts`.
- New UI/routes: `src/components/operations/{operations-view,retry-operation-form}.tsx`; operations list/detail pages, actions, loading and error boundaries under `src/app/admin/operations/`.
- Updated: event registry/outbox, Feature 07 job workflows/Inngest functions, notification resolver, property shell navigation, notification test fixture and durable-job regression tests.
- New tests: `tests/unit/server/feature-07-operations.test.ts`, `tests/unit/components/operations.test.tsx`, `tests/integration/operations-retry.test.ts`, `tests/integration/operations-rls.test.ts`, `tests/e2e/operations.spec.ts`.
- New security migration: `supabase/security-migrations/20260910120100_operations_retry_security.sql`. It revokes direct browser/application-role execution/outbox/attempt writes and adds restrictive active-property read policies. No schema columns, Prisma migration, or dependency was added in 07.5.
- Ledger inspection corrected earlier uncertainty: `20260907120000_events_jobs_notifications_operational_records` was already applied on September 7; today's `db:local:deploy` applied `20260909120000_notification_context` before stopping at the pre-existing `20260830090100_storage_and_media_security.sql` checksum mismatch.
- Feature 07 security migrations (September 7, 9, and 10) remain UNAPPLIED in the ledger. The policy tests executed their pending SQL inside a rollback-only transaction, without altering the ledger or bypassing deployment checks. This proves transactional policy behavior, not deployment completion.

### Final verification and review

- `pnpm test`: 60 files / 243 tests passed.
- Focused operations/durable/notification/UI suite: 19 tests passed.
- Local database suites: 8 tests passed (4 real application-service/persistence/retry/link tests; 4 transactional policy-validation tests). Real concurrent requests produced one audit/outbox request; execution created one persistent notice; outbox failure rolled back the retry claim and audit. Operator property denial and cross-property notification-link denial were verified against PostgreSQL.
- Production-build Playwright: 4 passed across desktop Chromium and mobile Chromium, including keyboard retry, persistence after reload, denial, and tablet-width overflow checks. Desktop/mobile screenshots reviewed; all four runs recorded zero page errors and zero console errors.
- `pnpm typecheck`, `pnpm build`, `pnpm db:validate`, scoped ESLint/Prettier, and `git diff --check` passed. Initial test-only SQL cast and sign-in selector errors were diagnosed and corrected; final results above supersede those attempts.
- `pnpm lint` still fails only on the preserved empty `ConnectedMailboxProvider` placeholder in `src/server/integrations/email/transactional-email-provider.ts:56`. No lint rule was disabled and provider work was not expanded.
- `/review`: plan alignment and slice system integrity passed after correcting dispatch starvation, retry delivery visibility, and preserving exact retry bounds. Slice UI/application behavior is verified. Production readiness remains gated by security deployment, the existing global lint blocker, and live Inngest scheduling/delivery verification in 07.8.
- `/imprint`: added the Operations Failure List and Retry Details entry to `context/ui-registry.md`. Updated current notification/job-link architecture wording and the 07.5 acceptance row in the build plan; preserved prior session entries.

### Exit gate and next work

- Slice 07.5 implementation/behavior acceptance is satisfied with the verification qualifications above. Feature 07 is NOT complete and is not declared production-ready.
- Next approved slice is 07.6 Communication providers and receipts; it was not started here. 07.7 and 07.8 remain outstanding. Retain the original security checksum evidence for a deliberate resolution; never rewrite an applied migration or reset the shared database to hide it.

## 2026-09-09 — Feature 07 generic Notification contract follow-up

### Scope and retained state

- Repository/tracker state superseded the stale Feature 06 memory bookmark. Features 01–06 remain complete; Feature 07 stays in progress; numbering 01–56 and completed 07.1–07.4 history are preserved. Feature 08 and future Robin features remain not started.
- Preserved the existing uncommitted context reconciliation, dependency/lockfile/build-policy edits, operations permissions, provider foundations, and Feature 06 media implementation. No reset, commit, branch change, dependency update, or prior migration rewrite occurred.
- Retained Notification property/recipient ownership, uniqueness/indexes, read-state storage, bell, pagination, and read actions. External delivery remains separate.

### Gaps addressed by approved slice

- 07.1: Strict source and subject registries; source identifies the producer while type identifies the notice kind. New notices require correlation. Unknown fields (including arbitrary URLs), unsupported types/sources, and malformed IDs fail validation. Event v1 remains supported; contextual proof v2 is additive.
- 07.2: Added nullable source/correlation columns solely for legacy compatibility, with a paired-context constraint. New service calls require both and validate active recipient access. An additive restrictive RLS policy requires explicit active Operator property grants, retains recipient isolation for Admin, and revokes browser/application-role notification INSERT. Trusted server owning services emit notices. Existing SELECT/read_at UPDATE policies and indexes remain.
- 07.3: Contextual event/job produces a real persistent notice with inherited source/correlation and a stable event-based deduplication key. Tests cover lost dispatch acknowledgement, retry after the notification effect, terminal duplicate execution, conflicting event context, unknown versions, and backlog-safe dispatch of the requested event. Stored job payload must match its execution property/correlation/idempotency context.
- 07.4: Typed destinations use a recipient-scoped open route with fresh access checks. Proof navigates to the implemented property overview; media destinations invoke existing Feature 06 access/library services. Unsupported/unavailable links fail safely. Job detail navigation stays unavailable pending 07.5. Fixed pagination refresh/order stability, all-page read wording, visible action errors, refreshed count double-decrement, deterministic dates, wrapping, and unavailable bell count fallback.
- 07.8: Added contextual end-to-end service proof, production authorization-path tests, UI regressions, and an unexecuted local PostgreSQL/RLS integration suite.

### Files and migrations

- Source: `src/server/notifications/{notification-contracts,notifications}.ts`, `src/server/events/{internal-event-registry,event-outbox}.ts`, `src/server/jobs/{job-contracts,job-execution,feature-07-job-workflows}.ts`.
- UI/routes: `src/components/notifications/{notification-center,notification-bell}.tsx`, `src/components/layout/property-overview-shell.tsx`, `src/app/[propertyId]/notifications/page.tsx`, new `src/app/[propertyId]/notifications/[notificationId]/open/page.tsx`.
- Persistence: `prisma/schema.prisma`; new `prisma/migrations/20260909120000_notification_context/migration.sql`; new `supabase/security-migrations/20260909120100_notification_context_security.sql`. These new migrations have NOT been applied locally during this session.
- Tests: existing Feature 07 contracts, notifications, durable-jobs, notification-center tests and property-overview-shell test; new `tests/fixtures/feature-07-notifications.ts`, `tests/unit/server/feature-07-notification-authorization.test.ts`, `tests/integration/notification-context.test.ts`.
- Documentation: bounded additions in architecture/build-plan; updated existing notification UI imprint; tracker and appended memory bookmark. Other concurrent context changes retained.

### Verification and review

- Full unit suite: 57 files / 229 tests passed before final authorization/backlog additions; final focused suite: 7 files / 26 tests passed, including the new cases. No tests disabled.
- Final TypeScript, Prisma schema validation/client generation, scoped lint, scoped Prettier, and whitespace checks passed. Production build and the final repeat both passed, including the new notification-open route.
- Repository-wide lint is blocked by the pre-existing empty `ConnectedMailboxProvider` interface at `src/server/integrations/email/transactional-email-provider.ts:56`. The provider placeholder was deliberately preserved within this bounded follow-up; no rule was disabled.
- `pnpm db:local:deploy` failed before connection because Docker Desktop's Linux engine pipe is unavailable. PostgreSQL migration application, RLS integration, reload persistence against a real database, and authenticated desktop/tablet/mobile browser checks remain pending. The earlier security-migration checksum mismatch remains historical unresolved evidence, not something repaired or bypassed here.
- Review fixed recipient/Operator scope, unsupported links, source/correlation validation, duplicate context collisions, requested-event dispatch, pagination refresh, read wording/counts, and visible failure states. Plan alignment and bounded system-integrity review passed; production readiness remains gated by the above verification plus unfinished approved slices.
- No future Robin/Revenue records, handlers, handoff infrastructure, or provider workflows were implemented. TransactionalEmailProvider/Postmark, Twilio, Cronofy, and Feature 06 media lifecycle/cleanup boundaries remain unchanged.

### Exit gate and remaining work

- This follow-up has implementation plus unit/static evidence; it does not close Feature 07's exit gate.
- Remaining: 07.5 operations/retry UI; 07.6 communication providers/receipts (including its existing lint blocker); 07.7 scheduled existing media cleanup/observability; 07.8 database, authenticated browser, live provider/job, and final closeout gates.
- No later slice or feature was started in this session.

## 2026-09-07 — Robin 1.0 context reconciliation

- Context only: aligned the roadmap, architecture, overview, UI rules, provider guidance, and code/testing standards for Robin 1.0. No application code, Prisma schema, migrations, dependencies, or implemented UI changed in this reconciliation.
- Features 01–06 remain complete and Feature 07 remains in progress. Preserve the current Feature 07 slice progress, local verification caveats, and all existing implementation/session history. Future Robin features remain unimplemented; Feature 21 is explicitly deferred. Numbering 01–56 is preserved.
- The interrupted attempt had already updated build-plan.md and architecture.md; resumed work retained those changes and completed the other five context files.
- The repository advanced beyond the earlier snapshot: Feature 07 Slice 07.2 is recorded complete pending local migration verification, and Slice 07.3 is active. Existing Inngest dependency/lockfile/build-policy changes are separate work and remain untouched. The memory file is an older Feature 06 closeout record; the current tracker controls implementation progress.
- Feature 07 follow-through: its in-progress Notification contract must satisfy the newly approved source, destination, and correlation requirements before the feature exit gate passes. Existing code is preserved; this note does not claim those additions have been implemented or reset completed slices.
- UI tokens and implemented UI registry remain unchanged; no hypothetical Robin components are registered. Historical tracker entries retain the implementation bookmark that was true on their date.
- Verification: required context-wide terminology search and broader voice/audio scan completed; stale Robin activation, Feature 23 dependency range, test-mode, and current Quick Capture transcript wording are absent. Retained matches describe explicit deferrals/prohibitions, ordinary human or Search metadata behavior, Shadow Mode/handoff requirements, or preserved future storage compatibility.
- Documentation review passed plan alignment and system-integrity checks: numbering 01–56, completed Features 01–06 specifications, Features 15–20, canonical Search sections, Appointment/TimeEntry foundation, provider sections, current implementation status/slices, and historical session notes are preserved. Scoped `git diff --check` passed. No product test/build was run or product feature declared complete for this documentation-only task.
- Concurrent Feature 07 work also changed the job-contract file during the audit; this reconciliation did not edit implementation files or dependency configuration.

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
- Created the original pre-Search-Operations build plan; the roadmap was expanded to 13 phases / 48 features on 2026-08-20
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

## 2026-08-05 — Feature 03 test stability follow-up

### Completed

- Capped Vitest unit-test execution at two workers after the full JSDOM suite intermittently starved the development-status loading test.
- Verified the full suite twice; the affected loading test completed in under one second in both runs.
## 2026-08-08 ??? Phase 2, Feature 04: Slices 1 and 2

### Completed

- Added the Slice 1 server-only application URL validation, browser/server/admin Supabase client boundaries, SSR session refresh, and temporary `/dashboard` anonymous gate.
- Added fixed post-auth redirect destinations, local Auth password-length and redirect configuration, and Slice 1 environment/redirect/proxy/client-boundary tests.
- Added Slice 2 verified identity resolution through Supabase `getClaims()` followed by BTLS `AppUser` lookup and active-status enforcement.
- Added the explicit `platform.user.manage` capability with platform-role mapping; services authorize through the capability rather than role-name checks.
- Added idempotent trusted-profile synchronization and account disable/re-enable services with the required BTLS/audit and Supabase provider ordering.
- Added platform-scoped audit persistence with actor and target user, leaving account and property scope null.

### Verification

- Feature 04 focused unit suites passed: 9 tests.
- Strict typecheck, lint, formatting check, and Git diff check passed.

### Decisions

- No Prisma migration was required: the executable schema already provides `AppUser.status` and a platform-scoped `AuditEvent` shape.
- A disabled BTLS account is denied by every protected service check even while an existing Auth JWT may remain valid until expiry.

### Next session

1. Continue Feature 04 only with the approved next slice.
2. Do not begin authentication UI flows until their slice is explicitly requested.
## 2026-08-08 ??? Phase 2, Feature 04: Slice 3

### Completed

- Added sign-in, forgot-password, reset-password, invitation-acceptance, unauthorized, and temporary dashboard routes.
- Added fixed-destination Auth callback handling, server sign-out, server-side 12-character password validation, and enumeration-safe password recovery.
- Added invitation acceptance that creates credentials and synchronizes an `AppUser` without creating memberships or property access.
- Added disabled-account and session-expired user-facing states.
- Added the `Authentication Surface` shared UI pattern and recorded it in the UI registry.

### Verification

- Feature 04 focused unit suites passed: 14 tests across action, route, component, and prior auth coverage.
- Strict typecheck, lint, formatting check, and Git diff check passed.

### Decisions

- The temporary `/dashboard` contains only signed-in profile details and sign-out; it exposes no tenant data or access shortcuts.
- Callback destinations accept only the existing fixed BTLS post-auth allowlist; no request host, origin, or forwarded header constructs redirects.

### Next session

1. Continue Feature 04 only with the next approved slice.
2. Do not start Feature 05 property access or directory work.
## 2026-08-08 ??? Phase 2, Feature 04: Slice 4

### Completed

- Added a server-only Supabase invitation primitive for future Feature 05 use, with a fixed `/invite` redirect and no membership, property-access, resend, or cancellation behavior.
- Added typed product analytics with an in-memory test/development sink and an explicitly unconfigured production no-op.
- Updated auth event timing and safe failure categories so sign-in success follows Auth and active AppUser validation, and invitation acceptance follows profile synchronization.
- Added deterministic local Supabase Auth integration coverage for invitations, password recovery, and immediate refresh-token rejection after ban.

### Verification

- Local Auth integration harness passed.
- Feature 04 focused unit suites passed: 18 tests.
- Strict typecheck, lint, formatting check, and Git diff check passed.

### Decisions

- Production analytics collection remains deliberately unconfigured; Feature 04 emits to the no-op production adapter only.
- Provider-ban invalidation is tested by an immediate refresh attempt, not by waiting for JWT expiry.

### Next session

1. Continue Feature 04 only with the next approved slice.
2. Do not begin Feature 05 member management or property access UI.

## 2026-08-09 - Phase 2, Feature 04: Slice 7 diagnostic handoff

### Completed

- Moved active work to the primary clone at `C:\dev\BTLS-Command-Center` on `feature/04-authentication`.
- Added local-database proof that invitation profile synchronization creates an `AppUser` without creating `AccountMembership` or `PropertyAccess`.
- Added invitation bootstrap coverage for valid fragments, existing sessions, unavailable states, and fragment removal from browser history.
- Added browser public-environment boundary coverage, including valid/invalid configuration and server-only credential exclusion.

### Verification and diagnosis

- Focused invitation-bootstrap and browser-client unit suites passed: 8 tests.
- The real local Playwright invitation journey initially remained at the verifying state on desktop and mobile.
- The approved next step was isolated port 3100 testing with a secret-safe diagnostic before product changes.

### Boundaries

- No Prisma migration, database reset, Feature 05 membership/property-access work, public registration, production debug logging, staging, or commit.

## 2026-08-11 - Phase 2, Feature 04: Slice 7 complete

### Completed

- Added the dedicated local Playwright Auth harness on port 3100 with matching fixed `BTLS_APP_URL`, opt-in existing-server reuse, and serialized local Auth journeys.
- Added a one-run invitation bootstrap guard so React development Strict Mode cannot consume a one-time invitation refresh token twice.
- Replaced local test resolver full-stack status dependency with direct Auth and PostgreSQL container inspection, avoiding unrelated Vector health failures.
- Made Prisma initialization request-scoped during authenticated session resolution so production build succeeds without a build-time database URL.

### Diagnostic conclusion

- The safe diagnostic confirmed invitation session setup reached Auth verification, user lookup, a named session cookie, and the password form.
- Initial acceptance failed because the restarted local database lacked `public.app_users`; existing checked-in schema and security history initialized it without a new migration or reset.
- The intermittent unavailable invitation state was a development Strict Mode double-effect race. A later Docker Auth daemon stall was recovered by restarting Docker Desktop.

### Verification

- Local invited-user no-grant integration coverage passed: AppUser created; zero AccountMembership and zero PropertyAccess rows.
- Invitation bootstrap and browser boundary unit coverage: 8 passed.
- Full unit suite: 26 files / 80 tests passed.
- Full local browser matrix: 10 desktop/mobile journeys passed.
- Typecheck, lint, formatting, and production build passed.

### Boundaries retained

- No migration, reset, Feature 05 grant behavior, or production debug code was added.
- Work remains uncommitted; unrelated untracked `v11/` content was untouched.

## 2026-08-14 - Phase 2, Feature 04: final closeout verification

### Completed

- Made `pnpm test:e2e` the canonical local full-suite command: it quietly prepares the required local Supabase/Auth harness, builds with the isolated local environment, and runs every Playwright E2E spec.
- Kept `pnpm test:e2e:auth:local` as the focused Auth-development command.
- Replaced contradictory session memory with one current, secret-free Feature 04 handoff.

### Verification

- Canonical local E2E: 26 desktop/mobile tests passed.
- Focused local Auth browser suite: 10 desktop/mobile journeys passed.
- Local database no-grant invariant and provider-ban refresh-token invalidation coverage passed.
- Full unit/integration suite: 26 files / 80 tests passed.
- Typecheck, lint, Prettier check, production build, and Git diff check passed.

### Boundaries retained

- No migration, database reset, Feature 05 grant behavior, production debug code, staging, or commit.
- Manual local development remains on port 3000; Playwright remains isolated on port 3100.
- Unrelated untracked `v11/` content remains untouched.

### Next session

1. Feature 04 is ready for final review and handoff only.
2. Do not start Feature 05 without explicit direction.

## 2026-08-15 - Phase 2, Feature 04: local development follow-up

- pnpm dev now resolves the running local Supabase Auth/PostgreSQL environment before starting Next on port 3000, avoiding mismatched .env.local public Auth configuration.
- Manual password sign-in and a genuine local mailed invitation both passed after restarting the development server.
- Focused local Auth Playwright suite passed again: 10 desktop/mobile journeys.
- Operational note: stop the manual dev server before pnpm test:e2e:auth:local; separate ports still share Next's .next/dev lock directory.
## 2026-08-15 - Phase 2, Feature 04: CI clean-database follow-up

- Canonical `pnpm test:e2e` now invokes the existing non-destructive local deployment workflow after local Auth starts and before the production build.
- The workflow applies committed Prisma migrations, Supabase security migration, and idempotent non-production seed data; it does not add a migration, reset a database, or use `prisma db push`.
- CI-equivalent canonical E2E passed afterward: 26 desktop/mobile tests, including invitation acceptance.
## 2026-08-16 — Phase 2, Feature 05: Slices 1 and 2

### Completed

- Added the binding explicit-property-grant authorization decision, pending invitation schema/migration, capability-aware RLS defense-in-depth, and TypeScript/SQL platform-capability parity coverage.
- Added the reusable server-only property-context and authorized-property-list services.
- Property routes now resolve an active verified `AppUser`, property/account status, active client membership, explicit `PropertyAccess`, effective role, and capabilities before returning an authorized context.
- Platform users require `platform.property.read` for cross-property context without individual grants. Client users require their active membership and explicit property grant.
- Invalid, anonymous, disabled, unavailable, suspended-account/property, suspended-membership, and no-property outcomes are explicit and browser-safe.

### Verification

- Slice 2 focused property-context unit suite: 6 tests passed.
- Strict TypeScript passed.
- Local database tenant-isolation and SQL-capability-parity suites: 5 tests passed.
- Focused lint, Prettier, and Git diff whitespace checks passed.

### Next session

1. Continue Feature 05 only with its approved Slice 3: capability-authorized property directory and onboarding.

## 2026-08-16 — Phase 2, Feature 05: Slice 3

### Completed

- Added the capability-authorized `/admin/properties` server-paginated directory with search and property-status filtering.
- Added account/property onboarding through `platform.property.manage`; creation is an atomic active-account/active-property transaction with account and property audit events.
- Added capability-gated account/property status-change services with durable audit events. No future settings model was invented.
- Added the administrative directory, search/filter control, creation form, pagination, loading, empty, validation, recoverable-error, pending-disabled, and success states.
- Imprinted the Administrative Property Directory and Onboarding visual pattern in `context/ui-registry.md`.

### Verification

- Strict TypeScript and focused lint passed.
- Slice 3 service, action, component, loading, and error-boundary coverage: 10 tests passed.
- Real local database proof for immediate directory appearance, creation audits, cross-property isolation, and capability parity: 7 tests passed.
- Local-runtime production build, Prettier, and Git diff whitespace checks passed.

### Next session

1. Continue Feature 05 only with its approved Slice 4: intentional property routing, property overview shell, and switcher.
2. Preserve `platform.property.manage` for property onboarding and administration; do not infer access from a route ID or role name.
## 2026-08-16 — Phase 2, Feature 05: Slice 4

### Completed

- Replaced the temporary post-auth dashboard with server-authorized routing: platform readers go to `/admin/properties`; clients with one property go directly to its overview; multiple-property clients select intentionally; no active grant goes to `/no-access`.
- Opened the shared directory to `platform.property.read` while retaining `platform.property.manage` exclusively for onboarding controls and mutations.
- Added protected session-refresh coverage for administrative, selection, no-access, and UUID property routes.
- Added the authorized property overview shell, capability-aware administrative navigation, and responsive top-bar property switcher.
- Switcher and selection options come solely from the server-resolved active authorized-property list; they omit suspended and ungranted properties.
- Imprinted the Authorized Property Navigation pattern and updated the AppShell registry note.

### Verification

- Focused property-context, routing, admin-directory, protected-route, switcher, and overview-shell suites: 21 tests passed.
- Real local directory/onboarding, cross-property isolation, and capability-parity suites: 7 tests passed.
- Local desktop/mobile authentication routing suite passed after the temporary dashboard was replaced.
- Strict TypeScript, lint, Prettier, Git diff whitespace checks, and local-runtime production build passed.

### Next session

1. Continue Feature 05 only with its approved Slice 5: existing-user member and property-access administration.
2. Preserve the settled split: `platform.property.read` authorizes directory/switcher visibility; `platform.property.manage` authorizes property onboarding and administration.
## 2026-08-18 — Phase 2, Feature 05: Slice 5

### Completed

- Added the server-authorized `/{propertyId}/settings/users` screen for existing account-member role and explicit property-access administration, with loading, empty, error, pending, success, and disabled-action states.
- Added reusable property-user services and actions. `AccountMembership.role` remains the account baseline; `PropertyAccess.roleOverride` is an explicit optional per-property override.
- `platform.user.manage` retains account-wide administration. A Client Owner can manage only non-platform client users whose complete property access is inside the owner’s own explicit grants; managers, staff, and viewers are denied before user data is read or changed.
- Access saves reactivate the membership, synchronize only the submitted same-account active property grants, and append membership plus grant/revocation audit events. Account-wide suspension is separately audited.
- Imprinted the Property User Administration pattern in `context/ui-registry.md`.

### Verification

- Focused service and UI suites: 6 tests passed.
- Local database cross-property mutation-denial test passed: an out-of-scope Client Owner mutation was denied and left the target membership and grant unchanged.
- Strict TypeScript, ESLint, focused Prettier formatting, and Git diff whitespace checks passed.
- Production build compiled successfully through the TypeScript stage with the local project environment.

### Next session

1. Continue Feature 05 only with its approved Slice 6: normalized pending invitation activation.
2. Keep Supabase identity verification outside the activation transaction; Feature 05 activates pending BTLS authorization only after verified identity resolution.

## 2026-08-18 — Phase 2, Feature 05: Slice 6

### Completed

- Added server-authorized pending invitation creation, listing, automatic expiry, cancellation, and immediate existing-verified-user grant paths to the property Users and permissions screen.
- Added a configurable `BTLS_PENDING_INVITATION_EXPIRY_HOURS` setting with a safe 24-hour default and documented it in `.env.example`.
- New-user invitations call Supabase before the durable Prisma transaction and persist only the Auth identity ID, intended account role, property grants, status, timestamps, and audit events—never tokens or credentials.
- Feature 04 continues to verify Supabase identity/session state. Its sign-in and invitation-acceptance flows now delegate only verified identity fields to Feature 05’s idempotent authorization activation transaction.
- Activation atomically upserts the `AppUser`, conditionally claims pending records, resolves membership, upserts unique same-account property grants, marks invitations applied, and appends audit events. Cancelled and expired records create no BTLS membership or property access.
- Imprinted the Pending Invitation Administration pattern in `context/ui-registry.md` and updated Feature 05 binding documentation for the immediate verified-user path.

### Verification

- Pending lifecycle and invitation UI unit suites: 7 tests passed.
- Local database lifecycle suite: 2 tests passed for activation/replay and cancellation/expiry denial.
- Focused local Auth browser suite was started after the handoff; its runner reported startup and active execution but did not return a final result summary in the command transcript.

### Next session

1. Continue Feature 05 only with its approved Slice 7: final hardening, end-to-end completion, and review.
2. Preserve the verified-identity boundary: no Supabase network call or credential handling may enter the activation transaction.

## 2026-08-18 — Phase 2, Feature 05: Slice 7 / Feature complete

### Completed

- Added final browser coverage for explicit client property grants, multi-property selection and switching, and URL-manipulation denial on desktop and mobile.
- Hardened local database integration execution for external Supabase Auth setup by serializing integration files and using a bounded 30-second hook timeout.
- Completed Feature 05 review: no unresolved critical or high-severity findings remain.

### Final verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:database`, `pnpm build`, `pnpm test:e2e`, `pnpm format:check`, and `git diff --check` passed.
- Canonical Playwright suite: 28 passed across desktop and mobile.
- Exit gate passed: platform-capability directory visibility, explicit client grants, server-side URL denial, immediate property directory appearance, and cross-tenant read/mutation denial are covered by service, database/RLS, and browser tests.

### Next session

1. Feature 05 is complete. Do not start Feature 06 without explicit direction.

## 2026-08-20 — Search Operations context reconciliation

### Completed

- Merged the approved Search Operations architecture into the canonical BTLS architecture.
- Expanded the master roadmap from 32 to 48 features without changing Features 01–27.
- Reconciled product overview, library/provider boundaries, UI rules, and this roadmap.
- Corrected this tracker’s stale top-level status/roadmap to match its existing Feature 04/05 completion session evidence; no new implementation feature was marked complete.

### Decisions

- Search Operations is now governed by canonical `context/architecture.md` and `context/build-plan.md`, not a parallel Search-specific source of truth.
- Exact Search providers and the first guarded-automation allowlist remain deferred to their owning features.

### Next session

1. Run `/architect` for Feature 06 — Storage and Media when implementation resumes.
2. Do not begin Search Operations implementation before Features 01–27 reach their normal dependency point.

## 2026-08-26 — Revenue Operations canonical reconciliation

### Completed

- Reconciled the canonical Revenue Operations product, domain, provider, UI, code-standard, and agent-operating context before Revenue implementation.
- Replaced the old Lead-centric planned lifecycle with the approved Customer/Contact/Lead and source-domain ownership boundaries.
- Adopted the 13-phase, 56-feature roadmap while preserving Search Operations internal order.

### Implementation state preserved

- Features 01–05 remain complete; Feature 05 verification and exit-gate evidence remain unchanged.
- Feature 06 — Storage and Media remains next and not started.
- Feature 07 remains not started.
- New Feature 08 — Customer, Workforce, and Revenue Settings Foundation remains not started.
- No Prisma schema, migration, application source, dependency, configuration, or product implementation changed.

### Next session

1. Run /architect for Feature 06 when implementation is explicitly resumed.
2. Do not start Feature 06, Feature 07, or Feature 08 as part of this reconciliation.

## 2026-09-02 — Phase 3, Feature 06: Storage and Media (complete)

### Completed

- Added property-scoped, server-owned Supabase Storage adapter paths, MediaAsset policy/lifecycle, signed upload/finalization, immutable replacement, private/public delivery, sensitive auditing, cleanup service, and bounded server-only maintenance launcher.
- Added `/[propertyId]/media` as a secondary-navigation proof surface with reusable MediaUploadControl, MediaPicker, previews, private attachment access, and capability-gated mutations.
- Added server-authoritative pending-upload recovery: normal CONTENT_IMAGE/ATTACHMENT PENDING_UPLOAD records are rediscovered after reload and classified as FINALIZE, RESTART, EXPIRED, or temporary UNAVAILABLE. The UI never claims missing local bytes were restored.
- Corrected Media Library recovery rendering so each pending upload appears only in its corresponding Content Images or Attachments view.
- Updated project route documentation, Storage architecture path/cleanup boundary, and UI registry Media pattern.

### Final verification

- All 50 unit-test files pass in bounded direct Vitest groups (191 tests); the Feature 06 storage group passes 59 tests and final media UI tests pass 14 tests.
- Local database integration exits successfully (`0`); Playwright’s final authoritative record reports `passed` with no failed tests.
- Typecheck, lint (zero errors; one intentional dynamic-image preview warning), scoped supported-file Prettier check, and production build all pass.
- Scoped Feature 06 tracked and untracked whitespace checks are clean. Global `git diff --check` reports only the intentionally preserved unrelated `AGENTS.md` final blank-line change.
- Final review found and corrected duplicate cross-tab recovery-card rendering. The remediation review also added Zod validation to every generic Media Library browser action and a server-only normal-library asset guard, preventing forged profile values or same-property infrastructure/sensitive asset IDs from reaching shared mutations. No unresolved critical or high-severity review findings remain.

### Exit gate

- Passed: public content images receive durable delivery URLs.
- Passed: private attachments require server authorization and short-lived signed URLs.
- Passed: property authorization, capability checks, scoped queries, and tests deny cross-property access.
- Passed: failed/abandoned pending uploads are rediscovered after reload, recover uploaded bytes only when verified, and remain cleanup eligible.
- Passed: finalized assets are immutable; replacement creates a distinct MediaAsset.
- Passed: responsive web upload controls support file/image selection and browser camera capture hints without native-mobile dependencies.

### Next session

1. Feature 06 is complete. Do not start Feature 07 without explicit direction.

## 2026-09-19 — Follow-up to pasted unit-test failure

The supplied default pnpm test run had 287 passes and one Operations error-path failure.
The error message could render before React's asynchronous transition finished clearing pending;
the test asserted the retry button was enabled synchronously. The test now waits for the complete
failed-request state and additionally checks that the reason remains editable and preserved.
Retry application behavior is unchanged. NavigationList now attaches Next Link's onNavigate prop
only to Link elements, removing the unsupported-event-handler warnings on native buttons.

Changed: tests/unit/components/operations.test.tsx and
src/components/navigation/navigation-list.tsx. No schema, migration, dependency or authorization
changes. No worker setting, test timeout or business assertion was weakened.
Verification: default pnpm test passed all 288 tests in 69 files with no onNavigate warnings.
The earlier full database/build/browser gate is historical evidence; it was not rerun for this
narrow follow-up. Feature 09 remains not started and all changes remain uncommitted.
Typecheck, lint and whitespace checks also passed. Targeted review found no unresolved issue: retry behavior and Feature 08 navigation guard behavior are preserved.
