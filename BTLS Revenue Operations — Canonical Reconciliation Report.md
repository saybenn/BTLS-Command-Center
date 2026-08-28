# BTLS Revenue Operations — Canonical Reconciliation Report

> **Completed:** 2026-08-26
> **Scope:** Canonical documentation/context reconciliation only
> **Controlling specification:** BTLS Revenue Operations — Canonical Reconciliation Plan

## 1. Files Changed

| File | Major sections changed | Why |
|---|---|---|
| `context/architecture.md` | Product boundary, principles, domain ownership, lifecycles, flows, storage/provider boundaries, Revenue architecture, cross-studio outcomes, tests, invariants, deferred decisions | Establish the implementation-grade canonical Revenue domain and its shared-system boundaries. |
| `context/project-overview.md` | Product promise, roles, routes, Revenue flows, data summary, scope, events, success criteria, launch positioning | Describe the approved service-business operating loop at product depth. |
| `context/build-plan.md` | Features 06–07 clarifications, new Revenue/Robin vertical slices, all downstream numbering/dependencies, roadmap totals | Replace the obsolete Lead-centric macro-features with the approved 13-phase/56-feature roadmap. |
| `context/library-docs.md` | OpenAI, Postmark, Twilio, Cronofy, deferred Revenue interfaces, Search feature-number references | Align provider mechanics with Customer/Contact communication, mandatory Quick Capture review, BTLS schedule truth, and deferred vendor choices. |
| `context/code-standards.md` | Lead-stage examples, derived state, commercial snapshots, money/tax math, explicit/compensating mutations, AI proposals, provider-independent truth | Remove stale lifecycle teaching and add only reusable engineering rules. |
| `context/ui-rules.md` | Complete Revenue Operations section and responsive field-web actions | Make Revenue action-first, progressively disclosed, calm, and domain-specific. |
| `AGENTS.md` | Revenue guardrails, communication ownership, Quick Capture safety, scope/test examples, branch-number examples | Prevent later agents from recreating flattened Lead or duplicate shared systems. |
| `context/progress-tracker.md` | Current status, canonical roadmap, decisions, reconciliation session note | Record the documentation decision without changing implementation completion. |
| `context/ui-tokens.md` | Removed the obsolete flattened Lead-status guidance table only | The plan-authorized contradiction exception applied: the table directly encoded retired Lead stages. No token value or semantic color family changed. |
| `BTLS Revenue Operations — Canonical Reconciliation Report.md` | This report | Provide the required audit and acceptance record. |

## 2. Files Intentionally Unchanged

### `context/ui-registry.md`

No change. It records implemented and approved reusable patterns, and no existing entry became false. No speculative Customer, Estimate, Invoice, Quick Capture, TimeClock, or BusinessException pattern was added.

### Implementation and configuration

No application source, Prisma file, migration, dependency manifest, lockfile, Supabase configuration, or runtime configuration changed.

`context/ui-tokens.md` was expected to remain unchanged by default, but the full sweep proved one directly false governing table. The narrow exception removed only that contradiction and added no token.

## 3. Architecture Decisions Applied

The reconciliation applied the approved R-01–R-55 decision groups:

- Customer is the end-customer parent; Contact is person-only; Lead is one opportunity.
- Appointment, Estimate, Job/JobVisit, Invoice, Payment, next action, and operating exceptions own their own facts.
- Issued/accepted commercial history is immutable and current Pricebook/agreement changes cannot rewrite it.
- Invoice document truth and factual Payment truth remain separate; payment and overdue summaries are derived.
- Operational financial truth is not accounting, payroll, or tax-compliance truth.
- Quick Capture is a confirmation-required Revenue proposal workflow distinct from Robin.
- PropertyService, MediaAsset, Finding, and Work Management remain shared and are not duplicated.
- Responsive field-capable web is the MVP; native mobile remains post-MVP.

## 4. Conversation Ruling

The final parentage is:

```text
Customer
└── Conversation
    ├── required primary Contact
    └── Message(s)
```

Conversation and Message belong to Revenue Operations. Lead, Estimate, Appointment, Job, Invoice, and Robin do not own Conversation. Optional operational context belongs on Message and/or RevenueActivity. Twilio correlation uses the receiving property number plus normalized Contact phone. Inbound email synchronization remains deferred.

## 5. Roadmap Reconciliation

Verified canonical result:

```text
13 phases
56 numbered features
01–05 complete
06–07 shared infrastructure
08–11 Revenue Operations Foundation
12–13 Robin foundation
14–22 Revenue Operations and lifecycle core
23 Robin Automations
24–26 Smart Blog Studio
27–29 Website Data
30–31 Website Intelligence
32–33 Content Intelligence
34–35 Shared Work Management
36–51 Search Operations
52–53 Command Center Completion
54–56 Production Hardening
```

New Feature 08 is **Customer, Workforce, and Revenue Settings Foundation**. Search Operations retains its original internal sequence at Features 36–51. Security, reliability/accessibility, and release readiness remain final at 54–56.

## 6. Feature 06 / 07 Status

Feature 06 — Storage and Media remains the next implementation target and is not started. Its plan now supports generic temporary/durable storage, immutable finalized bytes, signed private access, cleanup eligibility, and future Revenue consumers without prebuilding Revenue attachment models.

Feature 07 — Events, Jobs, Notifications, and Operational Records remains not started. Its plan now supports additive typed events, durable property-scoped jobs, idempotency, provider-neutral receipts, failure visibility, Notification subject links, EmailProvider, and SendingIdentity-compatible inputs without implementing Revenue business rules.

Feature 05 remains complete from repository evidence: the tracker records typecheck, lint, tests, database tests, build, Playwright, formatting, and diff checks passed; 28 Playwright journeys passed; and the exit gate passed.

## 7. Deferred Decisions

No vendor was selected or installed for:

- payment processing;
- address lookup or geocoding;
- voice transcription;
- connected mailbox behavior.

PaymentProvider, AddressLookupProvider, and TranscriptionProvider remain optional/deferred BTLS-owned boundaries. Manual/external Payment, manual ServiceLocation entry, and text Quick Capture remain complete provider-independent paths. Signature capture and basic document generation do not require external SaaS.

## 8. Contradiction Sweep Results

Reconciled stale governing concepts included:

- Contact as person-or-organization;
- Lead as the parent of the entire customer lifecycle;
- ESTIMATE_SCHEDULED, ESTIMATE_SENT, FOLLOW_UP, SALE_WON, and STALE as Lead stages;
- FollowUpTask and PaymentRecord as target models;
- Unified Lead Inbox as the whole Revenue operating surface;
- parent Lead status as visually primary;
- Lead-owned or Robin-owned Conversation;
- Cronofy as authoritative scheduling truth;
- old Search provider feature numbers;
- the obsolete flattened Lead-status token guidance.

Remaining textual matches were inspected and are valid only as:

- explicit exclusions/deprecations, such as PaymentRecord and PaymentSchedule not existing;
- derived child-domain language, such as Estimate sent summary from EstimateDelivery;
- orthogonal UI context, such as an accepted Estimate with a separately scheduled Job;
- clearly dated historical tracker evidence.

No retired uppercase Lead lifecycle code remains in the canonical context.

## 9. Acceptance Checklist Result

# PASS

Verified:

- final repository audit on 2026-08-27 compared baseline `0344b21` through the working tree;
- the changed-file allowlist contains exactly the ten documentation/report files listed in this report;
- `git diff --check 0344b21` passes and `context/ui-registry.md` remains unchanged;
- no Prisma, migration, application-source, dependency, lockfile, Supabase, or configuration path changed;
- domain ownership and terminology are consistent;
- source-domain lifecycles and derived-state rules are explicit;
- Conversation uses Customer plus required primary Contact;
- Estimate revision/acceptance history and customer powers are bounded;
- ChangeOrder owns material post-acceptance change;
- Invoice plus Payment replaces PaymentRecord;
- payment processing remains optional and tax remains user-entered;
- TimeEntry excludes payroll/HR scope;
- NextRequiredAction, AttentionFlag, BusinessException, and Finding remain distinct;
- JobTask remains distinct from WorkTicketTask;
- MediaAsset and PropertyService remain shared;
- Quick Capture always proposes and confirms through normal services;
- Postmark remains, Gmail/Yahoo Reply-To is supported through BTLS-managed identity, and Cronofy is not local schedule truth;
- build plan and tracker contain 13 sequential phases and 56 matching features;
- Search remains 36–51 and Production Hardening remains final;
- no Revenue feature was marked complete.

## 10. Implementation State

```text
No Prisma schema changes
No migrations
No application code
No dependencies installed
No package or lockfile changes
No Supabase configuration changes
No Revenue feature implementation started
Feature 06 not started
Feature 07 not started
Feature 08 not started
```
