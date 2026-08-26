# BTLS Build Plan

> **Repository location:** `context/build-plan.md`  
> **Project state:** Greenfield; no existing repository  
> **Companion files:** `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, `context/library-docs.md`  
> **MVP:** Website Intelligence, Smart Blog Studio, Content Intelligence, Revenue Operations / Command Center, Robin, Search Operations Studio, and shared Work Management

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
- Search Operations reuses shared normalized web data, Findings, Work Management, Content, and Revenue Operations truth rather than duplicating them.
- Search provider calls must be isolated behind BTLS-owned adapters and bounded by program usage/cost policy.
- Search website actions are never unguarded; `AUTO_GUARDED` requires approved capability and policy.

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

Calculate the shared measurements used by Website and Content Intelligence and consumed by Search Operations where applicable.

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

- Website, Content, and Search Findings use the same work system
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

# Phase 11 — Search Operations Studio

## 28 Search Program and Shared Vocabulary Foundation

### Objective

Create the durable Search Operations program and the canonical business/service/geography vocabulary required by every later search feature.

### User / Operator Value

A BTLS operator can activate one property's SEO program, define what services and markets matter, and know exactly which site-management mode and fulfillment policy apply.

### Dependencies

- Phase 2 tenancy/auth/property access
- Phase 3 shared jobs/audit infrastructure
- existing property settings
- parent authorization model

### Data

Create or reuse canonical shared records:

- `PropertyService`
- `BusinessLocation`
- `ServiceArea`

Create Search Operations records:

- `SearchProgram`
- `SearchProgramServicePriority`
- `SearchProgramAreaPriority`
- `SearchFulfillmentPolicyVersion`
- `SearchFulfillmentPolicyRequirement`
- `SearchAutomationPolicyVersion`

Required enums:

```text
SearchProgramStatus
SiteManagementMode
SearchExecutionClass
ServiceAreaType
```

Requirements:

- direct `propertyId` on property-owned records;
- one active SearchProgram per property for MVP;
- one primary BusinessLocation may be enforced by application/database constraint;
- service/location priority belongs to SearchProgram, not canonical vocabulary;
- policy versions are immutable after use.

### UI

Property:

```text
/[propertyId]/search-operations
```

Initial program screen:

- program status;
- onboarding/readiness;
- active services;
- service priorities;
- service areas;
- area priorities;
- primary business location;
- site-management mode;
- fulfillment policy;
- automation-policy summary;
- activate/pause controls.

Settings:

```text
/[propertyId]/settings/search-operations
```

### Logic

Application services:

- create/update shared service vocabulary;
- create/update business locations;
- create/update service areas;
- configure SearchProgram;
- assign priorities;
- validate site-management mode;
- activate/pause program;
- snapshot policy references;
- validate required onboarding fields.

Activation requires:

- valid property;
- at least one active PropertyService;
- at least one SearchProgram priority;
- valid fulfillment policy;
- valid automation policy;
- explicit site-management mode.

### Integrations

None required beyond existing property/integration status reads.

### Authorization

Suggested:

```text
search.program.view
search.program.manage
search.strategy.view
search.strategy.manage
```

Client permissions remain property-scoped.

### Events / Jobs

Events:

```text
search.program.created
search.program.activated
search.program.paused
```

No heavy background jobs yet.

### Tests

Unit:

- activation rules;
- priority validation;
- policy immutability;
- site-management state handling.

Integration:

- property-scoped CRUD;
- cross-property denial;
- one active program constraint;
- shared vocabulary relationships.

E2E:

- BTLS operator configures and activates a SearchProgram;
- unauthorized client cannot alter program.

### Explicit Non-Goals

- keywords;
- rankings;
- audits;
- coverage;
- optimization;
- billing;
- provider selection.

### Exit Gate

- one authorized property can have an active SearchProgram;
- canonical services/locations are reusable by other BTLS features;
- no duplicate service/location vocabulary is introduced;
- program policy and site-management mode are explicit;
- tenant-isolation tests pass.

### Required Completion Report

Codex reports:

- shared models added/reused;
- migrations;
- any migration from earlier service/location records;
- permissions;
- tests;
- context updates;
- activation workflow verification;
- unresolved upstream conflicts.

---

## 29 Page Semantic Classification and Search Graph

### Objective

Teach BTLS what each discovered website page exists to do without bloating `WebsitePage`.

### User / Operator Value

An operator can classify a site once and the machine can reason about money pages, supporting pages, topics, services, and geography thereafter.

### Dependencies

- Feature 28
- WebsitePage inventory from Feature 20 or seeded equivalent

### Data

Create:

- `PageSearchProfile`
- `SearchTopic`
- `PageServiceAssignment`
- `PageLocationAssignment`
- `PageTopicAssignment`

Enums:

```text
SearchPageType
SearchPagePurpose
IndexingIntent
AssignmentRole
```

Structural type and strategic purpose remain separate.

Do not store current SEO performance in these records.

### UI

Page-classification workspace:

- discovered page table;
- structural page type;
- strategic purpose;
- indexing intent;
- primary service;
- secondary services;
- primary location;
- secondary locations;
- primary topic;
- secondary topics;
- confidence;
- reviewed/unreviewed state;
- bulk classification for obvious patterns.

Filters:

- unknown;
- money;
- supporting;
- service;
- service-location;
- article;
- unreviewed.

### Logic

- rule-based initial classification from URL/site inventory where safe;
- AI-assisted suggestion may be optional;
- low-confidence suggestions remain unreviewed;
- operator correction becomes durable strategy truth;
- uniqueness validation for PRIMARY assignments;
- normalize existing broad WebsitePage roles into suggestions, not overwrite source identity.

### Integrations

- WebsitePage inventory only.
- Optional OpenAI suggestion uses existing adapter; not required for exit gate.

### Authorization

```text
search.strategy.view
search.strategy.manage
```

### Events / Jobs

Optional event:

```text
search.page_profile.reviewed
```

Bulk classification may use a background job for large sites.

### Tests

Unit:

- type/purpose combinations;
- primary assignment validation;
- classification confidence rules.

Integration:

- page profile one-to-one identity;
- property isolation;
- many-to-many service/location/topic assignments.

E2E:

- operator classifies a service page as `SERVICE + MONEY`;
- operator classifies an article as `ARTICLE + SUPPORTING`;
- assignments survive refresh and are queryable.

### Explicit Non-Goals

- keyword targeting;
- rank tracking;
- SEO scores;
- content publication;
- DOM object mapping.

### Exit Gate

- every active discovered page can have explicit search semantics;
- money/supporting is independent of structural type;
- service/location/topic relationships are normalized;
- unknown pages are visible rather than guessed as truth.

### Required Completion Report

Include:

- taxonomy implemented;
- migration/schema details;
- classification rules;
- manual verification cases;
- AI use, if any;
- remaining unknown-classification risks.

---

## 30 Keyword Clusters and Search Targets

### Objective

Create the strategic model that connects business priorities to actual search demand.

### User / Operator Value

BTLS can explicitly say what a client is trying to rank for, why it matters, and which page should win.

### Dependencies

- Features 28–29
- Search Console query data may exist but is not required to create manual targets.

### Data

Create:

- `SearchKeyword`
- `SearchKeywordCluster`
- `SearchKeywordClusterMember`
- `SearchTarget`
- `SearchTargetPageAssignment`
- `SearchTargetSupport`

Enums:

```text
SearchIntent
GeographicIntent
KeywordClusterRole
TargetPageRole
SearchSupportRole
```

Rules:

- SearchKeyword identity does not store current search volume/rank;
- SearchTarget requires keyword cluster;
- SearchTarget requires service and/or topic;
- one active PRIMARY target-page assignment per target;
- target-page assignment history retained.

### UI

Search strategy workspace:

- keyword inventory;
- cluster editor;
- search intent;
- local intent;
- service;
- service area;
- topic;
- commercial importance;
- strategic priority;
- primary keyword;
- variants/questions/supporting terms;
- preferred ranking page;
- planned supporting pages;
- target status.

Operator can:

- create target manually;
- promote Search Console query into keyword;
- group keywords;
- assign/change primary ranking page;
- pause/retire target.

### Logic

- normalize query identity;
- cluster validation;
- duplicate target detection;
- active-target conflict detection;
- target-page assignment history;
- explicit retirement reason;
- target-page reassignment audit.

AI may suggest clustering but operator remains authority.

### Integrations

- existing Search Console normalized queries;
- optional OpenAI clustering assistance.

### Authorization

```text
search.strategy.view
search.strategy.manage
```

### Events / Jobs

```text
search.target.created
search.target.updated
```

No paid keyword-provider calls yet.

### Tests

- query normalization;
- duplicate keyword identity;
- one active primary page per target;
- target retirement;
- target-page history;
- cross-property restrictions.

E2E:

- create a Chesapeake water-heater SearchTarget with cluster and preferred page.

### Explicit Non-Goals

- search-volume API;
- ranking;
- coverage score;
- automatic target creation;
- arbitrary keyword universe generation.

### Exit Gate

- operator can model service × geography × intent as a SearchTarget;
- keyword variants live in a cluster;
- preferred ranking asset is historically explicit;
- the system can answer "what should rank for this target?"

### Required Completion Report

Include:

- domain models;
- target constraints;
- keyword normalization rules;
- target-page history verification;
- tests;
- known taxonomy edge cases.

---

## 31 Market Coverage Workspace

### Objective

Evaluate how well each accepted SearchTarget is currently represented by the site's strategy and assets.

### User / Operator Value

BTLS can see which important service/location opportunities are missing, weak, covered, strong, declining, or cannibalized instead of browsing the site manually.

### Dependencies

- Features 29–30
- WebsitePage technical/indexability evidence may be partially mocked until Feature 34
- existing Search Console evidence

### Data

Create:

- `SearchCoverageAssessment`

Enum:

```text
MISSING
WEAK
COVERED
STRONG
DECLINING
CANNIBALIZED
INSUFFICIENT_DATA
```

Assessment stores:

- rule version;
- evidence;
- data confidence;
- target-page existence;
- intended/observed indexability where available;
- support band;
- organic/local visibility bands where available.

### UI

Coverage matrix:

```text
Service × Service Area
```

with target drill-down.

Views:

- Missing
- Weak
- Covered
- Strong
- Declining
- Cannibalized
- Insufficient data

Target detail explains why.

### Logic

Initial rule version works with available evidence and degrades safely.

Important:

- do not materialize every Cartesian combination;
- assess accepted SearchTargets only;
- absent evidence becomes `INSUFFICIENT_DATA`;
- no opaque universal authority score;
- later rank/audit features enrich the same assessment rules.

### Integrations

- Search Console normalized data;
- WebsitePage inventory;
- Search semantic graph.

### Authorization

```text
search.strategy.view
```

### Events / Jobs

```text
search.coverage.assessed
```

Background job:

- evaluate active SearchTargets;
- idempotent by target + rule version + evaluation period.

### Tests

- each coverage state;
- incomplete data;
- wrong-page/cannibalization inputs;
- rule-version history;
- no duplicate assessment on retry.

### Explicit Non-Goals

- paid rank tracking;
- geo-grid;
- crawler;
- automatic work creation.

### Exit Gate

- every active target can produce an explainable assessment or insufficient-data state;
- assessment history is retained;
- coverage matrix identifies strategic gaps without invented combinations.

### Required Completion Report

Include:

- rule version;
- evidence used;
- state test fixtures;
- performance at realistic target count;
- known evidence gaps awaiting later features.

---

## 32 Search Provider and Usage Foundation

### Objective

Create replaceable provider boundaries and per-property cost controls before paid collection begins.

### User / Operator Value

BTLS can add ranking/crawl/authority vendors without contaminating feature code or accidentally creating an unprofitable service tier.

### Dependencies

- Feature 28 SearchProgram policies
- shared IntegrationConnection/job infrastructure

### Data

Create:

- `SearchProviderUsageRecord`
- provider capability configuration as appropriate.

BTLS interfaces:

```text
KeywordMetricsProvider
OrganicRankProvider
LocalRankGridProvider
SiteInspectionAdapter
PagePerformanceProvider
LocalPresenceProvider
CitationProvider
BacklinkProvider
CallAttributionProvider
SiteOptimizationAdapter
```

Only interfaces needed by upcoming implemented features need concrete adapters now.

### UI

Internal provider/usage surface:

- provider health;
- capability;
- last success;
- last failure;
- program usage;
- program quota;
- estimated provider cost;
- budget warning.

Property UI shows safe data-source status, not vendor internals.

### Logic

- normalized adapter contracts;
- provider configuration;
- unit usage recording;
- estimated cost recording;
- quota checks;
- required-vs-optional call behavior;
- provider retry categories;
- no provider payload leakage.

### Integrations

Select concrete providers only through an approved architecture/library decision.

Google shared adapters remain reused.

### Authorization

- property usage reads: BTLS operators;
- cross-property cost: platform admin/operator capability;
- clients do not see internal provider economics unless explicitly designed later.

### Events / Jobs

```text
search.provider_usage.recorded
search.provider_budget.warning
```

### Tests

Contract tests:

- adapter normalization;
- provider failure mapping;
- quota exceeded;
- duplicate usage protection;
- retry does not double count effects incorrectly.

### Explicit Non-Goals

- ranking UI;
- crawling UI;
- full vendor management portal;
- billing.

### Exit Gate

- paid provider calls can be accounted to property/program;
- feature services depend on BTLS interfaces;
- quota enforcement exists before high-volume jobs begin.

### Required Completion Report

Include:

- providers selected, if any;
- reason and library-doc update;
- interface contracts;
- cost-unit assumptions;
- quota behavior;
- contract tests;
- deferred providers.

---

## 33 Organic and Local Ranking Evidence

### Objective

Collect durable organic rank and geographic local visibility evidence.

### User / Operator Value

BTLS can prove whether important targets are gaining or losing visibility and can see where local Maps visibility is strong or weak geographically.

### Dependencies

- Features 30–32
- BusinessLocation coordinates
- selected rank provider(s)

### Data

Create:

- `SearchTrackedEntity`
- `OrganicRankRun`
- `OrganicRankObservation`
- `LocalRankGridRun`
- `LocalRankGridPoint`

Store deterministic grid aggregates:

- average rank;
- top-3 share;
- top-10 share;
- top-20 share;
- visibility share.

### UI

Target ranking detail:

- organic ranking history;
- ranking URL;
- desired page versus ranking page;
- device/location context;
- rank changes.

Local rank map:

- geo grid;
- rank per point;
- previous comparison;
- weak zones;
- visibility-share trend;
- partial/failed-run state.

Tracking settings:

- selected tracked keywords;
- device;
- service area;
- grid center;
- grid size/radius;
- frequency within policy.

### Logic

- scheduled rank batches;
- grid scheduling;
- provider normalization;
- idempotent runs;
- partial results;
- target-page matching;
- selected competitor support;
- usage/cost ledger;
- previous-run comparisons.

Do not treat Search Console average position as this rank data.

### Integrations

- OrganicRankProvider
- LocalRankGridProvider

### Authorization

```text
search.ranking.view
search.ranking.manage
```

### Events / Jobs

```text
search.organic_rank.completed
search.organic_rank.failed
search.local_grid.completed
search.local_grid.failed
```

Jobs are staggered by property/policy.

### Tests

- provider fixtures;
- missing ranking;
- wrong page ranking;
- partial grid;
- deterministic aggregate calculations;
- cross-property access;
- idempotent retry;
- quota use.

E2E:

- operator opens rank map and compares two completed grids.

### Explicit Non-Goals

- unlimited keyword tracking;
- general SERP explorer;
- storing every SERP result;
- full competitor intelligence.

### Exit Gate

- selected SearchTargets have reproducible organic/local rank history;
- map changes can be compared;
- provider failure is not interpreted as rank loss;
- provider usage is accounted.

### Required Completion Report

Include:

- rank provider;
- grid assumptions;
- observation volume;
- jobs;
- tests;
- cost estimate from fixtures/config;
- known provider limitations.

---

## 34 Site Inspection and Technical Audit

### Objective

Continuously verify that SEO strategy is not being undermined by technical website problems.

### User / Operator Value

The machine detects mechanical SEO failures so the operator does not manually crawl every client site.

### Dependencies

- Feature 32 provider foundation
- WebsitePage inventory
- SearchProgram
- shared Finding infrastructure

### Data

Create:

- `SiteInspectionRun`
- `PageTechnicalSnapshot`
- `InternalLinkEdge`
- `SearchAuditRun`
- `SearchAuditCheckResult`

Reference data:

- versioned Search audit rule set;
- check key;
- severity;
- evidence requirements;
- remediation type;
- execution classification.

### UI

Technical health:

- crawl status;
- audit history;
- pass/warning/fail/unknown counts;
- affected pages;
- evidence;
- remediation type;
- run/retry audit;
- partial crawl warning.

### Logic

Site inspection:

- root-domain restriction;
- SSRF defense;
- crawl limits;
- URL normalization;
- robots behavior;
- timeouts;
- redirect handling;
- current InternalLinkEdge reconciliation.

Audit rules initially cover:

- HTTP status;
- redirects;
- indexability;
- robots;
- sitemap;
- canonical;
- titles;
- meta descriptions;
- H1;
- structured data;
- broken links;
- orphan/underlinked pages;
- crawl depth;
- page performance;
- tracking presence where available.

Partial evidence must not produce false PASS.

### Integrations

- SiteInspectionAdapter
- PagePerformanceProvider
- existing tracking/data health

### Authorization

```text
search.audit.view
search.audit.run
```

### Events / Jobs

```text
search.inspection.completed
search.inspection.failed
search.audit.completed
search.audit.failed
```

### Tests

Security:

- private-network/SSRF protection;
- cross-domain redirect restrictions.

Rule tests:

- pass/warn/fail/unknown;
- incomplete crawl;
- duplicate Finding suppression.

Integration:

- crawl normalization;
- edge reconciliation;
- audit persistence;
- retry.

### Explicit Non-Goals

- storing full HTML history;
- arbitrary site scraping;
- general accessibility audit;
- automatic remediation.

### Exit Gate

- a property can complete a repeatable versioned technical audit;
- each failed check contains explainable evidence;
- partial provider data fails safely;
- current internal-link graph is queryable;
- high-value technical conditions can feed shared Findings.

### Required Completion Report

Include:

- crawler/provider decision;
- security controls;
- audit rule registry;
- crawl limits;
- tests;
- provider cost/usage;
- unresolved technical checks.

---

## 35 Content Authority and Internal Linking

### Objective

Model and evaluate whether supporting content actually strengthens the intended SearchTargets and money pages.

### User / Operator Value

BTLS can find under-supported money pages, orphan content, missing links, and topic gaps without manually tracing every article.

### Dependencies

- Features 29–34
- Smart Blog Studio
- Content Intelligence
- current InternalLinkEdge graph

### Data

Reuse:

- `SearchTargetSupport`
- `InternalLinkEdge`
- `ContentAsset`
- `ContentStrategy`
- `TopicCluster`

Add only bridging relationships if implementation proves required; do not create duplicate content records.

Smart Blog ContentStrategy should be able to reference SearchTarget/SearchTopic where relevant.

### UI

Target authority view:

- target money page;
- supporting pages;
- planned support;
- actual contextual links;
- missing expected links;
- orphaned support;
- topic-cluster connection;
- content performance summary;
- suggested internal-link opportunities.

### Logic

Rules:

- supporting page not linked to target;
- money page underlinked;
- orphan supporting page;
- target has shallow support;
- content cluster lacks commercial target;
- supporting content is winning and should be expanded/protected;
- exact-match anchor overuse is not encouraged.

Recommendations:

- link existing page;
- improve anchor/context;
- create supporting content;
- connect TopicCluster;
- monitor.

AI may suggest anchor wording, but evidence/rule decides whether the relationship is needed.

### Integrations

- Smart Blog Studio
- Content Intelligence
- SiteInspection current graph

### Authorization

```text
search.strategy.view
search.strategy.manage
content.view
```

Content mutation still requires Smart Blog permissions.

### Events / Jobs

Coverage/link evaluation may run after:

```text
content.published
content.updated
search.inspection.completed
```

### Tests

- planned-vs-actual link detection;
- orphan detection;
- target support depth;
- managed/external content matching;
- no duplicate content records.

### Explicit Non-Goals

- autonomous article writing;
- autonomous publication;
- generalized knowledge graph;
- backlink outreach.

### Exit Gate

- operator can see intended and actual support around a SearchTarget;
- missing useful internal links are detectable;
- Search Operations does not duplicate Smart Blog or Content Intelligence ownership.

### Required Completion Report

Include:

- bridge relationships added;
- rule definitions;
- test examples;
- UI verification;
- any discovered ownership conflict.

---

## 36 Local Presence and External Authority Signals

### Objective

Add only the local/citation/backlink evidence that creates useful Findings or verifies foundational work.

### User / Operator Value

BTLS can detect local-profile problems, citation inconsistencies, and meaningful authority changes without manufacturing recurring busywork.

### Dependencies

- Feature 32 provider foundation
- Feature 33 local ranking
- Google Business Profile normalized data

### Data

Create as needed:

- `LocalPresenceSnapshot`
- `ExternalListingObservation`
- `AuthoritySnapshot`
- `BacklinkObservation`

Reuse BusinessLocation and SearchTrackedEntity.

### UI

Local/authority evidence:

- GBP/local data health;
- profile completeness concerns;
- review-count/rating trend;
- unanswered-review indicator where supported;
- core citation consistency;
- important new/lost links;
- selected competitor authority context.

Foundation checklist distinguishes:

```text
SETUP
RECURRING
EXCEPTION
```

### Logic

High-value recurring rules:

- GBP data mismatch;
- meaningful review/reputation movement;
- local profile incompleteness;
- important citation inconsistency;
- important backlink lost;
- content naturally earning links;
- material selected-competitor authority gap.

Citation checks run low-frequency after baseline unless required.

Backlink data is intentionally narrow.

### Integrations

- existing Google Business Profile adapter;
- CitationProvider if approved;
- BacklinkProvider if approved.

### Authorization

```text
search.audit.view
search.strategy.view
```

Any GBP write capability requires a separate explicit permission and later policy decision.

### Events / Jobs

- scheduled local presence refresh;
- low-frequency citation refresh;
- low-frequency authority refresh;
- usage/cost recording.

### Tests

- NAP consistency;
- new/lost backlink state;
- provider partial failure;
- no false monthly task when state is unchanged;
- cross-property restrictions.

### Explicit Non-Goals

- full reputation management platform;
- automatic review manipulation;
- citation churn;
- backlink marketplace;
- automated mass outreach.

### Exit Gate

- foundational local/authority problems can be detected;
- unchanged citation/backlink data does not create repetitive work;
- local signals can contribute to Search Findings.

### Required Completion Report

Include:

- providers used;
- cadences;
- rule definitions;
- cost impact;
- tests;
- explicitly deferred external-authority functionality.

---

## 37 Search Opportunity and Prioritization Engine

### Objective

Turn Search Operations evidence into a small, explainable queue of high-value Findings.

### User / Operator Value

The operator sees what is likely worth doing next instead of receiving every possible SEO issue.

### Dependencies

- Features 31–36
- shared FindingDefinition/Finding infrastructure

### Data

Reuse:

- `FindingDefinition`
- `Finding`
- `FindingEvidence`

Extend shared Finding data only where necessary for:

- stable fingerprint;
- suppression/cooldown;
- priority-factor evidence;
- operator priority override.

Do not create `SearchOpportunity` as a second durable system.

### UI

Search Finding queue:

- priority band;
- confidence;
- observed condition;
- affected target/page/location;
- why it matters;
- evidence;
- priority reasons;
- recommended Work Package;
- confirm/defer/dismiss;
- override priority.

### Logic

Initial rules include:

- missing ranking asset;
- weak coverage;
- near-page-one;
- organic decline;
- local-grid decline;
- wrong-page ranking;
- cannibalization;
- underlinked money page;
- orphan support;
- technical blocker;
- local profile inconsistency;
- important link lost;
- hidden winner;
- insufficient evidence.

Prioritization factors:

- blocker severity;
- commercial importance;
- market priority;
- opportunity proximity;
- evidence confidence;
- demand;
- business outcomes;
- effort;
- recency/cooldown;
- human override.

UI shows reasons, not an opaque score.

### Integrations

- all normalized Search evidence;
- shared Finding engine;
- Revenue Operations outcome evidence where available.

### Authorization

```text
search.finding.review
finding.review
```

Client visibility follows existing approved-Finding rules.

### Events / Jobs

Reuse:

```text
finding.detected
finding.confirmed
finding.dismissed
```

Search evaluation jobs run after relevant evidence refreshes.

### Tests

Rule tests for each Finding class.

Priority tests:

- high commercial near-win outranks low-value speculative gap;
- technical blocker escalates;
- insufficient data reduces confidence;
- cooldown prevents noisy repeat;
- operator override wins visibly.

### Explicit Non-Goals

- AI-only Findings;
- black-box opportunity score;
- automatic ticket creation without approved policy.

### Exit Gate

- evidence produces a concise explainable Finding queue;
- duplicate/noisy Findings are suppressed;
- operator can understand why each item is ranked;
- client-visible Findings still require approved visibility.

### Required Completion Report

Include:

- Finding definitions and versions;
- evidence minimums;
- priority rules;
- fixtures;
- queue-volume results on realistic seeded portfolio;
- false-positive risks.

---

## 38 Search Work Integration

### Objective

Connect confirmed Search Findings to the existing BTLS work/intervention system.

### User / Operator Value

Search insight becomes actual controlled work without inventing another task manager.

### Dependencies

- Feature 37
- Work Management Features 26–27
- Smart Blog integration

### Data

Create:

- `SearchInterventionScope`

Add Search-specific `WorkPackageTemplate` reference data.

No second ticket or intervention model.

### UI

From Search Finding:

- select/review Work Package;
- create WorkTicket;
- show scope;
- show entitlement/service-scope label;
- show SearchTarget/page/location context.

From WorkTicket:

- link back to Search evidence;
- record affected SearchTargets/pages;
- complete work;
- record actual intervention.

### Logic

Search Work Package templates:

- near-page-one improvement;
- missing target asset;
- supporting-content build;
- internal-link strengthening;
- technical blocker repair;
- cannibalization investigation;
- local presence correction;
- ranking decline investigation;
- authority restoration.

Completion must never claim improvement.

### Integrations

- Work Management
- Smart Blog Studio for content tickets
- Site workflows later for OptimizationAction

### Authorization

Reuse:

```text
finding.review
ticket.manage
```

plus Search view capability.

### Events / Jobs

Reuse:

```text
ticket.created
ticket.completed
intervention.recorded
```

Search scope may trigger future measurement scheduling.

### Tests

- Finding-to-ticket linkage;
- WorkPackage version preservation;
- SearchInterventionScope;
- ticket completion without success claim;
- property isolation.

### Explicit Non-Goals

- full project management;
- Search-specific duplicate ticket system;
- automatic website action.

### Exit Gate

- a confirmed Search Finding can become normal BTLS work;
- Intervention records exactly what changed;
- SearchTarget/page scope is available for later measurement.

### Required Completion Report

Include:

- templates added;
- links to shared Work Management;
- schema changes;
- tests;
- end-to-end Finding → ticket → Intervention verification.

---

## 39 Fulfillment Cycles and Delivery Proof

### Objective

Make recurring client service scope explicit, track whether BTLS delivered it, and generate client-safe proof.

### User / Operator Value

The machine knows what each client is owed this cycle and prevents recurring fulfillment from depending on operator memory.

### Dependencies

- Features 28–38

### Data

Create:

- `SearchFulfillmentCycle`
- `SearchCycleRequirement`
- `SearchDeliverySummary`

Cycle snapshots policy version and requirements.

### UI

Property fulfillment view:

- current cycle;
- period;
- requirements;
- satisfied;
- in progress;
- blocked;
- waived;
- open Findings/work;
- awaiting approval;
- completed interventions;
- delivery-summary preview.

Operator actions:

- waive requirement with reason;
- resolve blocker;
- approve client summary.

### Logic

Cycle open:

- snapshot current policy;
- create requirements;
- dispatch due collection/evaluation jobs.

Cycle evaluation:

- update requirement completion from source records;
- compute cycle status;
- distinguish required and optional work;
- never use ranking improvement as requirement for fulfillment.

Summary generator derives:

- work completed;
- fixes;
- content;
- visibility changes;
- declines;
- lead evidence;
- next work.

### Integrations

- all prior Search Operations features;
- Work Management;
- Smart Blog;
- Revenue Operations evidence.

### Authorization

```text
search.delivery.view
search.delivery.approve
search.program.view
```

### Events / Jobs

```text
search.cycle.opened
search.cycle.needs_attention
search.cycle.fulfilled
search.delivery_summary.generated
search.delivery_summary.visible
```

Scheduled cycle-opening/evaluation jobs.

### Tests

- policy snapshot immutability;
- requirement state transitions;
- waiver audit;
- blocked required work;
- fulfillment without ranking gain;
- summary derives only from durable facts.

E2E:

- complete one monthly cycle and approve delivery summary.

### Explicit Non-Goals

- invoicing;
- billing;
- guaranteed outcome;
- hand-built PDF reporting as system truth.

### Exit Gate

- system can answer "what was this client owed?" historically;
- system can answer "was it delivered?";
- client summary is generated from actual records;
- fulfillment does not claim performance success.

### Required Completion Report

Include:

- policy/requirement mapping;
- cycle jobs;
- sample generated summary;
- waiver behavior;
- tests;
- blocked-cycle behavior.

---

## 40 Portfolio Exception Operations

### Objective

Allow one BTLS operator to oversee many Search Programs without opening every client property.

### User / Operator Value

This is the core agency leverage: the machine watches the portfolio and routes human attention only where needed.

### Dependencies

- Feature 39
- all evidence/Findings needed for health calculation

### Data

Create or materialize:

- `SearchProgramHealthSnapshot` or equivalent rebuildable read model.

Health:

```text
HEALTHY
NEEDS_ATTENTION
BLOCKED
PAUSED
```

Reason keys remain explicit.

### UI

BTLS-only:

```text
/admin/search-operations
```

Show:

- active programs;
- healthy;
- needs attention;
- blocked;
- approvals waiting;
- cycle overdue;
- audit failures;
- ranking/local refresh failures;
- high-priority Findings;
- data/integration problems;
- provider budget pressure;
- measurement due;
- operator assignment.

Filters:

- operator;
- program policy/tier;
- reason;
- health;
- due date;
- service area/client.

### Logic

Health calculation from source records.

Read model refreshes after:

- cycle updates;
- Finding changes;
- provider failures;
- approval changes;
- integration health;
- optimization failures.

Paginate and index for 500-property target.

### Integrations

- cross-property authorization;
- shared notification/operations infrastructure.

### Authorization

```text
search.portfolio.view
```

BTLS-only platform capability.

Client users can never query the portfolio read model across properties.

### Events / Jobs

- health refresh job;
- overdue-cycle detection;
- daily portfolio reconciliation.

### Tests

- health reason precedence;
- rebuild from source;
- 100/500 property query performance fixture;
- pagination;
- client cross-property denial;
- stale read-model repair.

### Explicit Non-Goals

- cross-client benchmarking;
- exposing client-vs-client performance;
- general agency project management.

### Exit Gate

- operator can identify every Search Program requiring attention from one screen;
- healthy programs require no manual opening;
- read model is rebuildable;
- cross-property access is BTLS-only.

### Required Completion Report

Include:

- health rules;
- indexes/query plan notes;
- seeded portfolio performance;
- authorization tests;
- reconciliation behavior.

---

## 41 Bounded Optimization Execution

### Objective

Safely execute repeatable SEO actions on supported websites without granting unrestricted automation.

### User / Operator Value

Routine fixes stop consuming human production time while risky or strategic decisions remain controlled.

### Dependencies

- Features 34, 37–40
- Work Management
- managed-site capability contract

### Data

Create:

- `OptimizationAction`

Reference operation definitions/allowlist.

Statuses:

```text
PROPOSED
AWAITING_APPROVAL
APPROVED
EXECUTING
COMPLETED
FAILED
REVERSED
CANCELLED
```

Execution classes:

```text
AUTO_GUARDED
APPROVAL_REQUIRED
HUMAN_ONLY
UNSUPPORTED
```

### UI

Action queue:

- operation;
- target;
- source Finding/ticket;
- execution class;
- site capability;
- proposed change;
- preview;
- approval;
- execution result;
- failure;
- reversal where supported.

Settings:

- per-operation automation policy.

### Logic

Flow:

```text
Finding/work requests action
→ site capabilities loaded
→ policy version loaded
→ operation allowlist checked
→ input validated
→ conflict check
→ idempotency check
→ preview
→ approval if required
→ execute adapter
→ persist exact result
→ create/link Intervention
→ verification job
```

Initial allowlist should be deliberately small.

Potential candidates only:

- approved metadata update;
- deterministic schema sync;
- deterministic sitemap refresh;
- unambiguous broken internal-link repair;
- approved alt-text update;
- approved redirect correction.

Final allowlist requires feature specification approval.

### Integrations

- `SiteOptimizationAdapter`
- existing publishing adapter remains separate for Smart Blog.

### Authorization

```text
search.optimization.view
search.optimization.approve
search.optimization.execute
```

Permission never overrides policy/capability.

### Events / Jobs

```text
search.optimization.proposed
search.optimization.approved
search.optimization.executed
search.optimization.failed
search.optimization.reversed
```

Execution/verification runs as durable jobs where appropriate.

### Tests

Security/policy matrix:

- managed + allowed + policy = execute;
- managed + approval required = blocked before approval;
- external/manual = no unsafe execution;
- unsupported operation = blocked;
- AI-proposed invalid input = rejected;
- duplicate request = one effect;
- failed execution = no success Intervention;
- reversal path when supported.

### Explicit Non-Goals

- autonomous strategy;
- autonomous content publication;
- arbitrary code changes;
- arbitrary external-site mutation;
- AI choosing its own permission.

### Exit Gate

- at least one low-risk BTLS-managed operation can execute end to end safely;
- every action is explainable and auditable;
- unsupported sites fail to human workflow;
- completed actions create/link Interventions;
- no unguarded automatic path exists.

### Required Completion Report

Include:

- exact allowlist;
- policy matrix;
- adapter capabilities;
- tests;
- rollback behavior;
- manual safety verification;
- actions intentionally excluded.

---

## 42 Fleet Remediation

### Objective

Allow BTLS to fix one shared managed-site defect once while preserving property-specific audit and fulfillment truth.

### User / Operator Value

A defect affecting dozens of BTLS-built sites can become one platform remediation instead of dozens of manual jobs.

### Dependencies

- Feature 41
- BTLS-managed site architecture
- platform authorization

### Data

Create:

- `FleetRemediation`
- `FleetRemediationTarget`

Fleet root is BTLS-internal cross-property state.

Each target remains property-scoped.

### UI

BTLS-only fleet view:

- root cause;
- affected properties;
- proposed shared fix;
- approval;
- deploy state;
- per-property verification;
- failed targets;
- linked Interventions.

Property users see only their own normal Intervention when appropriate.

### Logic

- detect common implementation fingerprint;
- human confirms shared root cause;
- approve shared fix;
- deploy through managed platform process;
- fan out property verification;
- create property-specific Interventions;
- update affected cycle requirements where applicable;
- partial failure handling.

Fleet detection never automatically decides two issues have the same root cause without review.

### Integrations

- deployment/version metadata;
- SiteInspectionAdapter;
- SiteOptimization/managed-site capability boundary where appropriate.

### Authorization

```text
search.fleet.manage
platform.property.read
```

Platform-only.

### Events / Jobs

```text
search.fleet_remediation.started
search.fleet_remediation.completed
search.fleet_remediation.failed
```

Fan-out verification jobs are property-scoped.

### Tests

- cross-property root hidden from clients;
- target fan-out;
- partial verification failure;
- property-specific Intervention creation;
- rerun idempotency.

### Explicit Non-Goals

- arbitrary multi-tenant bulk mutation;
- client-visible cross-property data;
- bypassing deployment controls.

### Exit Gate

- one simulated/shared defect can be remediated and revalidated across multiple managed properties;
- each property retains independent Intervention history;
- failed targets are visible.

### Required Completion Report

Include:

- fleet authorization;
- target model;
- verification strategy;
- tests;
- simulated fleet remediation evidence;
- production safeguards.

---

## 43 Search Measurement and Business Outcomes

### Objective

Close the SEO loop by measuring what happened after Search Interventions and connecting search visibility to business outcomes where defensible.

### User / Operator Value

BTLS can stop doing SEO blindly and can show clients whether work was followed by better visibility, traffic, leads, and revenue.

### Dependencies

- Features 33–42
- Work Management MeasurementReview
- Website Intelligence metrics
- Revenue Operations outcomes

### Data

Reuse:

- `MeasurementReview`
- `SearchInterventionScope`
- rank/grid evidence;
- Search Console/GA4 metrics;
- Lead/Job/Payment records.

Add only Search-specific measurement snapshot/reference data if required for reproducibility.

Do not create a competing outcome-review system.

### UI

Intervention measurement:

- expected result;
- affected target/page/location;
- before period;
- after period;
- organic rank change;
- local-grid change;
- Search Console change;
- organic traffic;
- commercial actions;
- attributed leads;
- qualified leads;
- won leads;
- confirmed revenue;
- evidence confidence;
- result:

```text
IMPROVED
PARTIALLY_IMPROVED
NO_MEASURABLE_CHANGE
WORSENED
INCONCLUSIVE
INSUFFICIENT_DATA
```

Target history:

- interventions overlaid against ranking/visibility timeline.

Cycle/client summary consumes completed MeasurementReviews.

### Logic

Measurement readiness checks:

- minimum elapsed time;
- provider health;
- comparable periods;
- target-page history;
- data sufficiency.

Attribution:

- use existing lead source/landing-page evidence;
- distinguish direct from assisted evidence;
- no unsupported causal claims.

Results may:

- resolve Finding;
- keep monitoring;
- reopen;
- create a new evidence-backed Finding;
- influence later prioritization.

### Integrations

- Work Management;
- Website Intelligence;
- Content Intelligence;
- Revenue Operations;
- ranking/local evidence.

### Authorization

- Search measurement view follows Search/Work permissions;
- sensitive revenue fields require `revenue.view`.

### Events / Jobs

Reuse:

```text
measurement.review_due
measurement.review_completed
finding.resolved
finding.reopened
```

Search measurement scheduling is triggered by Intervention scope.

### Tests

- before/after period reproducibility;
- target-page reassignment during window;
- insufficient data;
- provider outage;
- organic lead attribution;
- sensitive revenue authorization;
- no automatic success on ticket completion.

E2E:

```text
Search Finding
→ WorkTicket
→ Intervention
→ wait/test clock
→ fresh evidence
→ MeasurementReview
→ client-safe outcome
```

### Explicit Non-Goals

- advanced multi-touch attribution;
- guaranteed causation;
- predictive SEO;
- cross-client benchmarking.

### Exit Gate

- Search Interventions receive reproducible outcome reviews;
- rank/local/traffic/business evidence can be shown together;
- incomplete evidence results in honest uncertainty;
- client delivery proof can include measured outcomes without overclaiming.

### Required Completion Report

Include:

- measurement windows;
- evidence requirements;
- attribution rules;
- authorization checks;
- end-to-end test;
- sample client-safe language;
- known attribution limits.

---

---


# Phase 12 — Command Center Completion

## 44 Property Overview

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

Search Operations summary additions:

- Search Program status
- current Search fulfillment-cycle state
- Search operational health
- highest-priority Search Finding requiring attention
- Search approval waiting
- recent Search Intervention
- latest completed Search Measurement Review

Do not duplicate the Search Operations workspace.

Exit gate:

- Property overview answers what requires attention
- It does not become a duplicate of every studio
- Client and BTLS views show appropriate detail

---

## 45 BTLS Cross-Property Overview

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

Search Operations portfolio-summary additions:

- Search Programs needing attention
- overdue Search cycles
- failed Search audits/data collections
- Search optimization approvals
- Search optimization failures

Do not duplicate `/admin/search-operations`.

Exit gate:

- BTLS staff can find every authorized property
- Property additions automatically appear
- Client users cannot access cross-property views
- Large property counts remain paginated and performant

---

# Phase 13 — Production Hardening and Launch

## 46 Security and Data Protection Review

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

Search Operations security review must include:

- provider credentials
- crawler SSRF/private-network protections
- Search tenant isolation
- Search portfolio authorization
- Fleet Remediation authorization
- optimization capability/policy enforcement
- Search action idempotency and auditability
- denial of unsafe external-site mutation

Exit gate:

- Cross-tenant penetration tests pass
- No service credentials appear in client bundles
- Public endpoints are protected appropriately
- Critical actions have audit trails

---

## 47 Reliability, Performance, and Accessibility

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

Search Operations reliability/performance review must include:

- provider concurrency and rate limits
- organic-rank scheduling
- geo-grid scheduling
- crawl scheduling
- provider quotas/cost pressure
- time-series indexes and retention
- portfolio read-model reconciliation
- provider outage behavior
- optimization failure recovery
- approximately 500 properties without core architectural redesign

Exit gate:

- Critical pages meet agreed performance targets
- Accessibility review has no critical violations
- Provider failures degrade safely
- Backup restoration is documented and tested

---

## 48 Release Readiness

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

Search Operations release readiness must include:

- Search feature flags
- production provider credentials
- Search policy defaults
- audit-rule versions
- Search Finding-rule versions
- Search Work Package versions
- final guarded-automation allowlist
- provider cost monitoring
- Search support/runbook documentation

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
| 11 | Search Operations Studio | 16 |
| 12 | Command Center Completion | 2 |
| 13 | Production Hardening and Launch | 3 |
| **Total** |  | **48** |

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

For Search Operations Features 28–43, the feature specification must also state:

- Enums and lifecycle states
- Constraints and indexes
- Provider cost implications
- Idempotency strategy
- Audit behavior
- Unit, integration, and E2E test expectations separately
- Which deferred provider/threshold/allowlist decisions must be resolved for that feature

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

For Search Operations Features 28–43, also report:

- Constraints/indexes added or changed
- Provider decisions
- Provider usage/cost behavior
- Permissions added or changed
- Idempotency verification
- Search-specific deferred decisions resolved or retained

---

## JSM Agentic Development Loop

For each numbered feature, preserve the project workflow:

```text
/remember restore
→ read governing context
→ /architect
→ approve one feature specification
→ implement only that feature
→ run required quality/test commands
→ visual/workflow verification
→ /review
→ fix material findings
→ update progress tracker/context
→ /remember save
→ commit feature branch
→ push / pull request / CI / merge
→ next feature branch and thread
```

Use one implementation thread per numbered feature. Use a separate review thread when practical. Never continue automatically into the next numbered feature.

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
