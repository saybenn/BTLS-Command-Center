# BTLS Build Plan

> **Repository location:** `context/build-plan.md`  
> **Project state:** Greenfield; no existing repository  
> **Companion files:** `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, `context/library-docs.md`  
> **MVP:** Website Intelligence, Smart Blog Studio, Content Intelligence, Revenue Operations / Command Center, Robin, and shared Work Management

---

## Core Principle

Build BTLS as one multi-tenant SaaS application and one managed codebase.

### Launch order

1. Build the entire platform as a responsive web application.
2. Prioritize Web Growth Studio for the commercial launch.
3. Launch Revenue Operations as a clearly labeled beta.
4. Validate Revenue Operations workflows with real businesses.
5. Finish and stabilize the web platform.
6. Design the mobile application only after field usage reveals the correct mobile scope.

Use a vertical-slice approach:

```text
Visible UI
→ validated workflow
→ real database records
→ permissions and tenant isolation
→ tests
→ production safeguards
```

Each major feature should become visible and testable before the next major feature is started.

Foundation work is allowed when later features genuinely depend on it, but avoid long invisible backend phases. Build the smallest stable shared foundation, then prove it through real product screens and workflows.

### Build rules

- Follow `context/architecture.md`.
- Follow `context/code-standards.md`.
- Use only approved libraries in `context/library-docs.md`.
- Do not expand the MVP.
- Build one codebase for all client properties.
- Every tenant-owned record must be property-scoped.
- Every mutation must validate input and enforce authorization.
- Every phase ends with working UI, tests, and updated context documents.
- Do not begin the next phase until the current phase exit gate passes.
- Use feature flags for incomplete or risky production behavior.
- External integrations must be isolated behind BTLS-owned adapters.
- Background jobs must be durable, retryable, and property-scoped.
- Robin must act only through approved application tools.

---

# Phase 1 — Project Bootstrap

## 01 Repository and Tooling

Create the greenfield Next.js application and install the approved development foundation.

UI:

- Basic application landing page
- Basic development status page
- Visible environment indicator outside production

Logic:

- Next.js App Router
- Strict TypeScript
- Tailwind CSS
- shadcn/ui foundation
- ESLint
- formatting
- Vitest
- React Testing Library
- Playwright
- environment validation with Zod
- initial scripts for development, testing, type-checking, linting, and builds

Deliverables:

- Repository initialized
- Approved folder structure created
- `.env.example`
- CI workflow
- health Route Handler
- base error and loading boundaries
- context files committed

Exit gate:

- Local application starts cleanly
- Type-check, lint, unit tests, and production build pass
- CI runs the same checks
- No feature code exists outside approved folders

---

## 02 Shared UI Foundation

Create the minimum shared interface system required for the dashboard.

UI:

- Buttons
- Inputs
- text areas
- select controls
- dialogs
- alerts
- tabs
- badges
- cards
- empty states
- loading states
- table shell
- page header
- application sidebar
- top navigation
- responsive dashboard layout

Logic:

- Shared component conventions
- accessibility behavior
- design tokens
- theme setup
- reusable feedback patterns

Deliverables:

- `context/ui-tokens.md`
- `context/ui-rules.md`
- initial `context/ui-registry.md`
- visual component showcase or internal development route

Exit gate:

- Shared controls are keyboard accessible
- Dashboard shell works on desktop and mobile
- Feature teams can build without inventing new basic controls

---

# Phase 2 — Tenancy, Authentication, and Property Management

## 03 Supabase and Prisma Foundation

Establish the shared database, Auth, Storage, Prisma, and migration setup.

UI:

- Database and environment status visible in the development status page

Logic:

- Supabase local and hosted environment configuration
- Prisma client
- initial migrations
- seed process
- restricted normal application database role
- RLS migration structure
- storage bucket initialization
- migration and reset scripts

Initial records:

- `AppUser`
- `ClientAccount`
- `ClientProperty`
- `AccountMembership`
- `PropertyAccess`
- `FeatureFlag`
- `AuditEvent`

Exit gate:

- Clean database can be created from migrations
- Seed creates a BTLS admin, test client, and test property
- Prisma and Supabase-specific migrations do not conflict
- Tenant isolation test foundation exists

---

## 04 Authentication

Build secure user access.

UI:

- Sign in
- forgot password
- reset password
- invitation acceptance
- sign out
- unauthorized page
- session-expired message

Logic:

- Supabase Auth
- secure SSR session handling
- user profile synchronization
- invitation flow
- route gating
- account disable behavior

Analytics events:

- `auth.sign_in_succeeded`
- `auth.sign_in_failed`
- `auth.invitation_accepted`

Exit gate:

- Invited users can create an account and sign in
- Disabled users cannot access the dashboard
- Sessions survive normal navigation and refresh
- Protected routes cannot be opened anonymously

---

## 05 Property Access and Admin Property Directory

Prove the multi-tenant architecture through an actual property directory and property switcher.

UI:

- BTLS property directory
- property search
- property status
- property switcher
- property overview shell
- account and property creation form
- member invitation and access screen

Logic:

- capability-based authorization
- account membership
- property access
- server-scoped property context
- admin cross-property access
- client property restrictions
- onboarding defaults
- audit events

Exit gate:

- BTLS admin sees all authorized properties
- Client users see only assigned properties
- URL manipulation cannot expose another property
- Creating a property makes it appear without a new deployment
- Cross-tenant read and mutation tests pass

---

# Phase 3 — Shared Infrastructure

## 06 Storage and Media

Build shared file and image management.

UI:

- Reusable upload control
- upload progress
- media preview
- replace and remove actions
- private attachment access
- public image selection

Logic:

- Supabase Storage buckets
- property-scoped paths
- `MediaAsset`
- signed upload and download URLs
- type and size validation
- public/private access rules
- orphan cleanup job
- audit events for sensitive files

Exit gate:

- Public content images can be served durably
- Private attachments require permission
- Cross-property file access is denied
- Failed and abandoned uploads are recoverable

---

## 07 Events, Jobs, Notifications, and Operational Records

Create the shared asynchronous foundation.

UI:

- In-app notification center
- background-operation status where useful
- internal admin failure view

Logic:

- Inngest setup
- typed internal events
- typed job payloads
- retry and idempotency patterns
- notification records
- webhook receipt records
- important job execution records
- Postmark adapter
- Twilio adapter foundation
- structured logging
- Sentry setup

Initial events:

- `lead.created`
- `lead.status_changed`
- `content.published`
- `integration.sync_completed`
- `integration.sync_failed`
- `finding.detected`
- `ticket.completed`
- `robin.handoff_requested`

Exit gate:

- A test event completes a durable job
- Duplicate provider events do not duplicate effects
- Failed jobs are visible and retryable
- Notifications are property- and user-scoped
- Email and SMS providers are isolated behind adapters

---

# Phase 4 — Revenue Operations Foundation

## 08 Revenue Operations Data Model

Create the source-of-truth records and lifecycle rules for customer opportunities.

UI:

- Internal data-development view or seeded examples visible through the upcoming inbox shell

Logic:

- `Contact`
- `Lead`
- `LeadActivity`
- `FollowUpTask`
- `Estimate`
- `Job`
- `PaymentRecord`
- source and landing-page attribution
- lifecycle transition rules
- assignment
- notes and tags
- audit history
- property-scoped services

Lead lifecycle:

```text
New
→ Contacted
→ Qualified
→ Estimate Scheduled
→ Estimate Sent
→ Follow-Up
→ Sale Won
```

Additional outcomes:

- Lost
- Stale

Fulfillment:

```text
Sale Won
→ Job Scheduled
→ Job In Progress
→ Job Complete
```

Collections:

```text
Job Complete
→ Payment Due
→ Paid
```

Exit gate:

- Lifecycle rules are covered by unit tests
- Core workflows use transactions
- Contact may own multiple leads
- Lead remains the parent opportunity
- Property isolation tests pass

---

## 09 Unified Lead Inbox — Full UI

Build the complete Revenue Operations interface first against stable seeded data.

UI:

- Lead Inbox table
- search and filters
- assignment
- status indicators
- stale and overdue indicators
- lead-detail page
- contact details
- attribution
- notes
- tags
- next action
- estimate, job, and payment sections
- conversation/activity timeline
- follow-up task list
- mobile-friendly lead view

Logic:

- Read-only feature queries
- pagination
- sorting
- filtering
- safe view models

Exit gate:

- The complete lead-management experience is visually reviewable
- Empty, loading, error, and populated states exist
- Table behavior performs with realistic seeded volume
- UI does not invent lifecycle behavior

---

## 10 Revenue Operations Mutations and Reporting

Wire the interface to production data and workflows.

UI:

- Create and edit lead
- change lifecycle status
- assign owner
- add note
- schedule follow-up
- create estimate
- update job state
- record payment
- mark won, lost, or stale
- property operations summary
- response and outcome reports

Logic:

- Server Actions
- Zod validation
- authorization
- application services
- audit events
- internal events
- response-time calculations
- qualification rates
- estimate outcomes
- win/loss reporting
- completed job and confirmed revenue reporting

Analytics events:

- `lead.created`
- `lead.assigned`
- `lead.status_changed`
- `follow_up.created`
- `estimate.created`
- `payment.recorded`

Exit gate:

- Lead can move through the full MVP lifecycle
- Reports derive from real records
- Sensitive revenue views require capability
- Every material lifecycle change appears in the activity history

---

## 11 Public Lead Ingestion

Connect client websites to the shared Revenue Operations system.

UI:

- Public form configuration
- embed/integration instructions
- form-source status
- submission test tool

Logic:

- revocable public form key
- public ingestion endpoint
- Turnstile
- honeypot
- rate limiting
- payload validation
- idempotency
- contact matching
- lead creation
- attribution preservation
- WordPress webhook/plugin-compatible request
- employee notification dispatch

Exit gate:

- BTLS React form creates a lead
- Direct documented request creates a lead
- WordPress-compatible webhook request creates a lead
- Spam and duplicate protections work
- Public callers cannot choose arbitrary tenant access

---

# Phase 5 — Conversations and Robin Foundation

## 12 Two-Way SMS and Outbound Email

Build the communication timeline before adding AI behavior.

UI:

- Lead conversation panel
- send SMS
- send outbound email
- delivery state
- failed-message state
- consent and opt-out state
- human reply composer
- property phone-number settings

Logic:

- Postmark outbound email
- Twilio outbound SMS
- Twilio inbound SMS webhook
- delivery callbacks
- message records
- conversation threading
- property-number mapping
- E.164 normalization
- STOP/START/HELP handling
- consent records
- duplicate webhook protection

Exit gate:

- Human user can send SMS and email from a lead
- Inbound SMS reaches the correct property and lead conversation
- Delivery status is visible
- Opted-out contacts cannot receive automated SMS
- Postmark inbound email remains out of scope

---

## 13 Robin Configuration and Knowledge

Create Robin’s approved knowledge and operating controls.

UI:

- Robin settings
- Off / Approval Required / Automatic modes
- capability toggles
- business hours
- escalation rules
- Business Knowledge Pack editor
- services
- locations
- hours
- policies
- approved appointment types
- workflow steps
- draft/test mode

Logic:

- `BusinessKnowledgePack`
- versioning
- `RobinConfiguration`
- client progression workflows
- capability enforcement
- configuration validation
- property-scoped tool registry
- audit events

Exit gate:

- Robin cannot run without valid property configuration
- Configuration changes are versioned and audited
- Tools can be enabled or disabled independently
- Draft/test mode performs no customer-facing action

---

## 14 Robin Agent Runs and Approval Workflow

Build Robin’s controlled reasoning and tool-execution foundation.

UI:

- Robin run history
- proposed action review
- approve, edit, reject
- human-handoff queue
- failure detail
- related lead context

Logic:

- OpenAI adapter
- structured outputs
- `RobinRun`
- `RobinAction`
- typed tool arguments
- action validation
- approval workflow
- duplicate-action protection
- human escalation
- prompt/model/configuration version logging

Initial tools:

- summarize lead
- identify missing approved fields
- propose qualification question
- update approved lead field
- create follow-up task
- send approved message
- request human handoff

Exit gate:

- AI output cannot directly mutate data
- Approval Required mode blocks action until approval
- Every tool request is validated and property-scoped
- Failed or unsafe actions create a visible handoff

---

## 15 Robin Automations

Activate the MVP automation workflows.

UI:

- Automation outcome dashboard
- awaiting-human queue
- upcoming Robin follow-ups
- successful/failed action summary

Logic:

- new-lead acknowledgment
- employee notification
- lead summarization
- approved qualification
- missing-information collection
- approved field updates
- follow-up scheduling
- unresponsive-lead re-engagement
- approved appointment scheduling through Cronofy
- business-hours enforcement
- escalation
- success/failure reporting

Exit gate:

- Each automation respects property mode
- Automatic mode is capability-specific
- Duplicate acknowledgments and follow-ups are prevented
- Calendar outage creates a handoff
- Robin-assisted outcomes are traceable to the lead

---

# Phase 6 — Smart Blog Studio

## 16 Content Foundation and Strategy

Create the content records and strategy workflow.

UI:

- Content inventory
- content strategy brief
- topic-cluster manager
- content status
- filters
- create-content flow

Logic:

- `ContentAsset`
- `ContentStrategy`
- `TopicCluster`
- related service
- related location
- target customer question
- target query and long-tail terms
- search intent
- money page
- content role
- CTA
- lead magnet
- publication state
- audit history

Exit gate:

- Every content asset has durable strategy context
- Topic clusters and money-page relationships are reusable
- Client and operator visibility rules work
- Strategy data is ready for later measurement

---

## 17 Article Editor and SEO Readiness

Build the production editor.

UI:

- Tiptap editor
- title
- slug
- headings
- images
- FAQs
- meta title
- meta description
- featured image
- image alt text
- readiness panel
- preview
- draft and review workflow

Logic:

- structured editor document
- HTML generation and sanitization
- content versioning
- SEO readiness checks
- slug validation
- canonical URL
- asset relationships
- draft autosave strategy

Exit gate:

- Draft can be created, edited, saved, previewed, and reviewed
- Content survives reload without corruption
- Generated HTML is sanitized
- Readiness checks are explainable rather than an unexplained score

---

## 18 Internal Links, Publishing, and Playbook

Complete the Smart Blog Studio workflow.

UI:

- Search existing website pages
- choose service and location pages
- related article selection
- money-page link
- anchor-text controls
- suggested links
- backlink opportunity list
- publishing settings
- schedule publication
- Content Strategy Playbook

Logic:

- `ContentLink`
- internal-link suggestions
- publishing adapter interface
- BTLS-built website adapter
- WordPress REST adapter
- manual/export fallback
- `PublicationRecord`
- publication idempotency
- schedule jobs
- update published content

Exit gate:

- BTLS-built target can publish and update an article
- Compatible WordPress site can publish and update a native post
- Unsupported WordPress configuration falls back cleanly
- Published URL and external ID are stored
- Strategy and link relationships remain intact

---

# Phase 7 — Website Data Foundation

## 19 Integration Connections

Build property-level Google integration onboarding and status.

UI:

- Integrations settings
- connect/disconnect
- OAuth result
- select GA4 property
- select Search Console property
- select GBP location
- sync status
- last success
- actionable errors
- reauthorize action

Logic:

- `IntegrationConnection`
- Google OAuth adapter
- encrypted or securely referenced tokens
- token refresh
- granted scopes
- connection testing
- provider identifiers
- disconnect
- sync scheduling

Exit gate:

- Each property can connect its own Google resources
- Tokens never reach the browser
- Removing a connection pauses dependent jobs
- Permission and credential failures are understandable

---

## 20 Data Ingestion, Normalization, and Page Inventory

Build the shared web-growth data pipeline.

UI:

- Sync history
- data-source health
- discovered page inventory
- broad page-role correction
- excluded/retired page controls

Logic:

- scheduled GA4 import
- scheduled Search Console import
- scheduled GBP import
- URL normalization
- duplicate URL handling
- page discovery
- broad role classification
- normalized metric snapshots
- raw import references where needed
- data completeness checks
- retry and backfill tools

Page roles:

- Homepage
- Service page
- Location page
- Blog post
- Landing page
- Contact or booking page
- Other

Exit gate:

- Connected property imports real data
- Metrics from different sources can be matched by normalized page and period
- Missing or delayed sources create Data Health results
- DOM-level object mapping is not required

---

## 21 Metric Engine and Baselines

Calculate the shared measurements used by both intelligence features.

UI:

- Internal metric inspection view
- period selector
- raw and derived metric drill-down
- data sufficiency labels

Logic:

- current versus previous period
- year-over-year where available
- longer windows for low-volume properties
- page-role comparison
- device comparison
- traffic-source comparison
- commercial action rate
- lead yield
- qualified lead yield
- form completion
- internal continuation
- lead qualification
- sales win rate
- revenue per lead where available
- data evidence minimums

Exit gate:

- Calculations are covered by deterministic tests
- Small samples are not presented as confident conclusions
- Raw and derived values are distinguishable
- Command Center outcomes can join to web attribution where available

---

# Phase 8 — Website Intelligence

## 22 Findings Engine

Build the fixed evidence-backed diagnostic engine.

UI:

- Internal Finding rule inspection view
- shadow-mode evaluation output
- evidence drill-down

Logic:

- `FindingDefinition`
- versioned rule registry
- required and optional inputs
- trigger patterns
- exclusions
- precedence
- confidence
- priority
- Finding persistence
- evidence snapshots
- deduplication
- reopen/update behavior

Initial Finding classes:

- Search opportunity
- visibility decline
- traffic without action
- engagement without conversion
- form or CTA friction
- mobile gap
- GBP handoff weakness
- hidden winner
- lead-quality weakness
- sales-handoff weakness
- tracking failure
- insufficient evidence

Exit gate:

- Rules run in shadow mode against test and real imported data
- Each Finding can explain exactly why it triggered
- Rule changes do not rewrite historical evidence
- Possible causes remain hypotheses

---

## 23 Website Intelligence Interface

Build the operator and client-facing Website Intelligence experience.

UI:

- Property outlook
- Finding cards
- priority and confidence
- positive and negative classifications
- evidence
- plain-English meaning
- possible investigation areas
- recommended Work Package
- operator review queue
- approve, edit, defer, dismiss
- raw metrics drill-down
- simplified client-approved view

Logic:

- operator review states
- client visibility
- Finding grouping
- rule explanation generation
- AI plain-language assistance with deterministic evidence
- notification of important confirmed Findings

Exit gate:

- Operator can review and approve a Finding
- Client sees only approved information
- AI cannot create unsupported evidence
- The primary interface emphasizes conditions and action rather than metric clutter

---

# Phase 9 — Content Intelligence

## 24 Article Scorecards

Connect Smart Blog Studio strategy to real performance.

UI:

- Article performance list
- article scorecard
- topic-cluster view
- discoverability
- search capture
- reader value
- commercial connection
- business contribution
- query and period drill-down

Logic:

- strategy-to-page matching
- article search metrics
- organic visits and engagement
- article-to-service progression
- CTA and internal-link activity
- direct leads
- assisted leads where defensible
- money-page movement
- topic-cluster aggregation

Exit gate:

- Published managed content can be matched to provider data
- Imported existing articles can be classified
- Scorecard labels are evidence-backed
- Missing attribution lowers depth rather than breaking the feature

---

## 25 Content Findings

Build content-specific diagnostics and recommendations.

UI:

- Content Finding cards
- content update recommendations
- cluster Findings
- protect, expand, update, consolidate, monitor, retire actions

Logic:

- Content Not Yet Discoverable
- Search Demand Undercaptured
- Query-to-Content Misalignment
- Traffic Without Engagement
- Informational Traffic Dead End
- Strong Bridge, Weak Conversion
- Content-Assisted Winner
- Hidden Content Revenue Winner
- Content Losing Momentum
- Topic Cluster Gaining Momentum
- Topic Cluster Without Commercial Support
- possible cannibalization
- insufficient content data

Exit gate:

- Content Findings reuse shared evidence and rule infrastructure
- No general funnel-mapping system is introduced
- Findings connect directly to original content strategy
- Topic clusters can be evaluated without judging only direct conversions

---

# Phase 10 — Shared Work Management

## 26 Work Packages and Tickets

Turn confirmed Findings into focused operator work.

UI:

- Work Package registry
- create ticket from Finding
- assign operator
- task checklist
- due date
- status
- notes
- attachments
- approval
- work queue

Logic:

- `WorkPackageTemplate`
- versioning
- `WorkTicket`
- `WorkTicketTask`
- Finding linkage
- assignment
- entitlement/scope label
- status transitions
- audit history
- notifications

Exit gate:

- Website and Content Findings use the same work system
- Tickets remain narrower than full project-management software
- A Finding can exist without a ticket
- A ticket always retains its originating evidence and prescription version

---

## 27 Interventions and Before/After Measurement

Close the diagnosis-to-proof loop.

UI:

- Complete-work flow
- intervention record
- before snapshot
- measurement-pending state
- after snapshot
- outcome review
- resolve, monitor, or reopen controls

Logic:

- `Intervention`
- actual changed subject
- completion and deployment dates
- expected result
- pinned before period
- scheduled measurement review
- `MeasurementReview`
- improved
- partially improved
- no measurable change
- worsened
- inconclusive
- insufficient data
- Finding resolution and reopen behavior

Exit gate:

- Completing a ticket does not automatically claim success
- Measurement waits for sufficient new evidence
- Before and after periods are reproducible
- Operators can document inconclusive outcomes honestly

---

# Phase 11 — Command Center Completion

## 28 Property Overview

Create the property-level summary across both studios.

UI:

- New inquiries
- leads awaiting response
- overdue follow-ups
- estimates awaiting decisions
- recent wins and losses
- calls and forms
- top sources
- Visibility Health
- Conversion Health
- important Findings
- active tickets
- measurement results
- Robin issues
- recommended next actions

Logic:

- summary queries
- priority ordering
- capability-aware data
- client versus BTLS visibility
- safe caching and invalidation

Exit gate:

- Property overview answers what requires attention
- It does not become a duplicate of every studio
- Client and BTLS views show appropriate detail

---

## 29 BTLS Cross-Property Overview

Give BTLS operators one place to manage the client portfolio.

UI:

- Property ledger
- property search and filters
- unanswered leads
- failed integrations
- Robin handoffs
- unreviewed Findings
- overdue work
- content awaiting approval
- data-health problems
- visibility and conversion trends

Logic:

- cross-property queries restricted to BTLS capabilities
- alert prioritization
- pagination
- operator assignments
- safe aggregate reporting

Exit gate:

- BTLS staff can find every authorized property
- Property additions automatically appear
- Client users cannot access cross-property views
- Large property counts remain paginated and performant

---

# Phase 12 — Production Hardening and Launch

## 30 Security and Data Protection Review

Validate production safeguards across the system.

UI:

- Safe error messages
- access-denied behavior
- session-expiry behavior
- privacy and deletion administration where required

Logic:

- RLS review
- authorization review
- secret review
- rate limits
- bot protection
- webhook verification
- file-access review
- idempotency review
- audit completeness
- retention and deletion jobs
- dependency/security scanning

Exit gate:

- Cross-tenant penetration tests pass
- No service credentials appear in client bundles
- Public endpoints are protected appropriately
- Critical actions have audit trails

---

## 31 Reliability, Performance, and Accessibility

Prepare the product for sustained operation.

UI:

- Responsive review
- keyboard navigation
- screen-reader labels
- loading and empty states
- large-table performance
- failure recovery

Logic:

- query profiling
- index review
- background-job concurrency
- provider retry tuning
- caching review
- Sentry alerts
- structured log review
- backup and restore procedure
- health and smoke checks

Exit gate:

- Critical pages meet agreed performance targets
- Accessibility review has no critical violations
- Provider failures degrade safely
- Backup restoration is documented and tested

---

## 32 Release Readiness

Complete staging and production launch preparation.

UI:

- onboarding walkthrough
- operator support information
- client-facing status and help content

Logic:

- staging environment
- production environment
- seed/admin bootstrap
- controlled migration command
- feature flags
- release checklist
- rollback procedure
- smoke tests
- support runbook
- implementation status documentation

Exit gate:

- Staging passes full critical Playwright suite
- Production deployment and migrations are repeatable
- Feature flags protect unfinished or risky behavior
- Known risks are documented
- MVP boundary is preserved

---

# Post-MVP — Revenue Operations Mobile Application

Revenue Operations mobile is a future direction, not an active implementation phase. Start its product and technical design only after the responsive web beta is complete, the web platform is stable, and real field usage has validated the mobile scope.

Do not break this phase into implementation tasks yet.

---

# Phase Summary

| Phase | Name | Features |
|---:|---|---:|
| 1 | Project Bootstrap | 2 |
| 2 | Tenancy, Authentication, and Property Management | 3 |
| 3 | Shared Infrastructure | 2 |
| 4 | Revenue Operations Foundation | 4 |
| 5 | Conversations and Robin Foundation | 4 |
| 6 | Smart Blog Studio | 3 |
| 7 | Website Data Foundation | 3 |
| 8 | Website Intelligence | 2 |
| 9 | Content Intelligence | 2 |
| 10 | Shared Work Management | 2 |
| 11 | Command Center Completion | 2 |
| 12 | Production Hardening and Launch | 3 |
| **Total** |  | **32** |

Post-MVP: Revenue Operations Mobile Application — deferred; no implementation tasks are defined.

---

# Phase Execution Pattern

Before implementing each numbered feature:

1. Read all required context files.
2. Confirm the previous exit gate passed.
3. Write a feature implementation specification.
4. Define schemas, contracts, permissions, and tests required for that feature.
5. Implement only that numbered feature.
6. Run type-check, lint, tests, and build.
7. Perform visual and workflow verification.
8. Update `context/progress-tracker.md`.
9. Update architecture or library docs if a binding decision changed.
10. Record known risks and deferred work.

---

# Required Feature Specification

Every numbered feature should receive a concise implementation specification containing:

- Objective
- User-visible result
- Dependencies
- In scope
- Out of scope
- Data records affected
- Permissions
- Primary workflow
- UI states
- External integrations
- Background jobs or events
- Error and failure behavior
- Tests
- Acceptance criteria
- Documentation updates

Do not begin implementation while required behavior is undefined.

Do not write a massive standalone specification for the entire product before starting development. Specify the next numbered feature in detail, build it, verify it, then continue.

---

# Required Codex Completion Report

After each numbered feature, Codex must report:

- Feature completed
- Files added
- Files changed
- Database changes
- Migrations
- Dependencies added
- Events and jobs added
- Tests added or changed
- Commands run
- Manual verification performed
- Documentation updated
- Assumptions
- Known failures
- Remaining risks
- Deferred work
- Exit-gate result

---

# First Development Session

Start with:

```text
Phase 1
01 Repository and Tooling
```

The first Codex prompt should instruct Codex to:

- Create the repository from zero
- Add only the approved platform and development dependencies
- Reproduce the folder and context structure
- Add strict configuration
- Add the health and development status routes
- Add the CI checks
- Add no product feature schemas or screens beyond the basic shell
- Return the required completion report
