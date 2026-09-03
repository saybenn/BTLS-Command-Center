# BTLS Project Overview

> **Repository location:** `context/project-overview.md`  
> **Project name:** BTLS Command Center  
> **Company:** Brought to Life Solutions  
> **Project state:** Greenfield MVP  
> **Architecture:** One multi-tenant SaaS application, one managed codebase  
> **Primary audience:** Codex, developers, reviewers, and future maintainers

---

## About the Project

The BTLS Command Center is a multi-tenant service-business operations and web-growth platform for local service businesses.

It connects customer acquisition to communication, sales, scheduling, field fulfillment, invoicing, collected revenue, content production, website performance diagnosis, recurring Search fulfillment, and measurable improvement work in one property-scoped workspace.

The product is managed from one BTLS codebase. Each client business and website is represented by records, permissions, settings, and integrations in the shared platform rather than by a separate application deployment.

---

## Product Promise

BTLS helps service businesses:

- Capture opportunities into durable Customer, Contact, and Lead records
- Respond and communicate quickly
- Estimate, schedule, perform authorized work, invoice, and record money received
- Surface clear next actions and operational exceptions
- Automate only approved customer communication and lifecycle work
- Create purposeful SEO content
- Understand whether websites and content are producing useful business outcomes
- Turn evidence-backed Findings into measurable improvement work
- Operate recurring SEO fulfillment through standardized search targeting, monitoring, exception handling, and measurable work

The system should reduce the need to manage customer operations, analytics, SEO content, communication, and improvement work through disconnected tools.

---

## The Problem It Solves

### Before BTLS

A service business or BTLS operator may need to:

- Check multiple inboxes for leads
- Manually notify employees
- Remember follow-ups
- Track estimates and jobs in spreadsheets
- Search through Google Analytics for useful patterns
- Search through Search Console separately
- Review Google Business Profile separately
- Create SEO content in unrelated writing tools
- Track internal links manually
- Explain SEO work to clients using technical language
- Perform website work without a clear before-and-after record
- Lose attribution between a website visit, lead, sale, and payment

### After BTLS

The Command Center provides:

- One durable Customer operating record
- One prioritized Revenue Operations workspace
- Separate, connected Lead, Appointment, Estimate, Job, Invoice, and Payment truth
- Clear next actions and operational exceptions
- Customer/Contact communication history
- Robin-assisted communication and approved lifecycle work
- One Smart Blog Studio
- Evidence-backed Website, Content, and Search Findings
- Predetermined Work Packages
- Shared work tickets
- Intervention history
- Before-and-after measurement
- Property-level and cross-property operating views
- Search Programs and recurring fulfillment cycles
- Search-target coverage across services, geographies, intent, and topical support
- Organic rank and local geo-grid visibility evidence
- Continuous technical/search monitoring
- Bounded guarded optimization for supported BTLS-managed sites
- Search delivery proof connected to later outcome measurement

The system should present the next useful action instead of merely displaying more data.

---

## Product Structure

The MVP contains three product studios.

### Group 1 — Web Growth Studio

1. Website Intelligence
2. Smart Blog Studio
3. Content Intelligence

### Group 2 — Revenue Operations Studio

4. Revenue Operations / Command Center
5. Robin AI Automation Agent

Revenue Operations is the service-business operating core for Customers, opportunities,
communication, scheduling, Estimates/acceptance, Jobs/field work, Invoices/Payments,
next actions, operational exceptions, basic time tracking, and Quick Capture. Robin is a
controlled consumer of the approved application services, not a separate owner of that
business truth.

### Group 3 — Search Operations Studio

6. Search Operations / Fulfillment

### Shared Feature

7. Work Management

Work Management is shared by Website Intelligence, Content Intelligence, and Search Operations.

---

## Launch Positioning and Future Mobile Direction

Web Growth Studio is the primary commercial MVP.

Revenue Operations launches as a clearly labeled, field-capable responsive web beta. The web version supports call/text, Estimate presentation and acceptance, schedule visibility, Start Work and Work Complete, photos and notes, authorized Payment recording, clock in/out, and Quick Capture from a phone browser.

A dedicated native mobile application remains post-MVP. Its scope will be designed only after real field usage validates needs such as offline work, background behavior, and deeper device integration. The responsive web application remains the administrative and desktop workspace.

---

## Multi-Tenant Operating Model

```text
One BTLS application
→ many ClientAccounts subscribing to BTLS
→ one or more properties per account
→ property-scoped users, end Customers, operating data, integrations, settings, and automation
```

A `ClientProperty` represents one business website and its connected operating data.

A property may contain:

- Website domain
- Business details
- Assigned users
- GA4 property ID
- Search Console property
- Google Business Profile location
- Lead data
- Content
- Findings
- Work tickets
- Robin configuration
- Communication settings
- Integration connections

Adding a new property does not create a new repository or application deployment.

Authorized users see the property automatically through the shared interface.

---

# Users

## BTLS Platform Administrator

Responsible for:

- Platform administration
- Property onboarding
- User and permission management
- Integration support
- Cross-property oversight
- Production troubleshooting
- High-risk configuration

Needs:

- Access to authorized properties
- Platform-level health
- Audit history
- Integration failure visibility
- Controlled support access

## BTLS Operator

Responsible for:

- Managing leads where assigned
- Reviewing Website, Content, and Search Findings
- Creating and completing work tickets
- Creating and publishing content
- Monitoring client performance
- Reviewing Robin handoffs
- Explaining work to clients
- Overseeing recurring Search Programs
- Reviewing Search coverage/ranking/technical exceptions
- Approving strategic or guarded Search actions
- Managing portfolio Search fulfillment by exception rather than opening every property

Needs:

- Prioritized cross-property attention
- Clear evidence
- Practical work scopes
- Simple assignment and completion workflows
- Client-safe explanations

## Client Owner

Responsible for:

- Understanding Customer, work, collection, and growth outcomes
- Managing client users and Revenue defaults
- Reviewing unresolved operational exceptions
- Overseeing Job, Invoice, Payment, and team state at the authorized level
- Approving selected work or automation
- Viewing approved Findings and completed work

Needs:

- Plain-English summaries
- Revenue outcomes and what is not being handled
- Visibility into planned and completed work
- Control over Robin, Revenue settings, and user access

## Client Manager

Responsible for:

- Managing Customer and Lead records
- Assigning employees and scheduling Appointments or field work
- Creating and managing Estimates, Jobs, Invoices, and factual Payments where authorized
- Correcting team TimeEntries with reason and audit
- Resolving next actions, AttentionFlags, and BusinessExceptions
- Approving operational actions where permitted

Needs:

- Daily action-first clarity
- Clear operational exceptions and balances
- Customer/Contact conversation history
- Schedule and employee assignment

## Client Staff Member

Responsible for:

- Responding to assigned Customer, Lead, Appointment, and Job work
- Completing next actions
- Performing permitted Estimate and field workflows
- Clocking in and out
- Recording notes and photos
- Using Quick Capture with confirmation
- Recording a Payment only when explicitly authorized

Needs:

- A focused assigned-work view
- Simple business actions instead of generic status maintenance
- Clear next actions
- Field-capable mobile web
- Limited access to sensitive financial data

## Client Viewer

Responsible for:

- Reviewing approved reports and outcomes

Needs:

- Read-only access
- Plain-language explanations
- No administrative or mutation controls

---

# Pages

The exact route structure may evolve, but the MVP uses the following page families.

## Public and Authentication

```text
/                         → Product entry or sign-in redirect
/sign-in                  → User authentication
/forgot-password          → Password recovery request
/reset-password           → Password reset
/invite                    → Invitation acceptance
/forms/[publicFormKey]     → Optional hosted public lead form
```

## Property-Scoped Application

```text
/[propertyId]/overview
→ Property summary and prioritized attention

/[propertyId]/media
→ Shared property media library for public content images and private attachments

/[propertyId]/revenue-operations
→ Action-first Revenue home and attention workspace

/[propertyId]/revenue-operations/customers
→ Customer directory

/[propertyId]/revenue-operations/customers/[customerId]
→ Durable Customer operating record

/[propertyId]/revenue-operations/leads/[leadId]
→ One opportunity, sales stage, next action, attribution, and related commercial context

/[propertyId]/revenue-operations/schedule
→ Unified visual schedule for distinct Appointments and JobVisits

/[propertyId]/revenue-operations/estimates/[estimateId]
→ Estimate drafting, revision history, delivery, presentation, and acceptance evidence

/[propertyId]/revenue-operations/jobs/[jobId]
→ Authorized work and field detail

/[propertyId]/revenue-operations/invoices/[invoiceId]
→ Invoice, balance, and factual Payment detail

/[propertyId]/revenue-operations/time
→ Own and authorized team time

/[propertyId]/robin
→ Robin activity, approvals, handoffs, and automation outcomes

/[propertyId]/website-intelligence
→ Website Findings, evidence, data health, and raw metrics

/[propertyId]/smart-blog-studio
→ Content inventory and content workflow

/[propertyId]/smart-blog-studio/new
→ Content strategy brief and draft creation

/[propertyId]/smart-blog-studio/[contentId]
→ Article editor, readiness, internal links, preview, and publishing

/[propertyId]/content-intelligence
→ Content scorecards, topic clusters, and Content Findings

/[propertyId]/search-operations
→ Search Program, targets, coverage, rankings, audits, current cycle, exceptions, actions, and delivery proof

/[propertyId]/settings/search-operations
→ Search Program priorities, site-management mode, fulfillment policy, provider quotas, and automation policy

/[propertyId]/work-management
→ Shared work queue

/[propertyId]/work-management/[ticketId]
→ Finding evidence, Work Package, tasks, Intervention, and measurement

/[propertyId]/settings
→ Property configuration

/[propertyId]/settings/integrations
→ Google, Postmark, Twilio, Cronofy, and publishing connections

/[propertyId]/settings/robin
→ Robin modes, knowledge, workflows, and capabilities

/[propertyId]/settings/revenue-operations
→ Revenue workflow defaults and shared sending-identity selection

/[propertyId]/settings/users
→ Property users and permissions
```

## BTLS Administrative Pages

```text
/admin/properties
→ Cross-property directory and onboarding

/admin/users
→ User and access administration

/admin/integrations
→ Connection and sync health across properties

/admin/operations
→ Failed jobs, handoffs, and system attention

/admin/search-operations
→ Cross-property Search Program health, fulfillment exceptions, approvals, provider failures, and optimization failures

/admin/audit
→ Sensitive action history
```

## Technical Endpoints

```text
/api/health
→ Application health

/api/forms/[publicFormKey]
→ Public lead ingestion

/api/webhooks/twilio
→ Inbound SMS and delivery events

/api/webhooks/postmark
→ Outbound delivery and bounce events

/api/integrations/google/callback
→ Google OAuth callback

/api/integrations/wordpress/test
→ WordPress connection test
```

---

# Navigation

## Primary Sidebar

1. Overview
2. Revenue Operations
3. Robin
4. Website Intelligence
5. Smart Blog Studio
6. Content Intelligence
7. Search Operations
8. Work Management
9. Settings

## Administrative Navigation

Visible only with appropriate capabilities:

1. Properties
2. Users and Permissions
3. Integrations
4. Operations
5. Audit Log

## Top Bar

Contains:

- Current property
- Property switcher
- Global or property search where supported
- Notifications
- Theme control
- User account menu

Navigation is capability-aware, but server authorization remains mandatory.

---

# Core User Flows

## Flow 1 — Property Onboarding

1. A BTLS administrator creates or selects a client account.
2. The administrator creates a new client property.
3. The system creates default property settings.
4. The administrator adds business details and website domain.
5. The administrator invites users or assigns existing users.
6. The administrator configures feature access.
7. Google and communication integrations may be connected.
8. Robin starts in Off or test mode.
9. The property appears in authorized property directories and switchers.
10. No new codebase or deployment is created.

---

## Flow 2 — Website Lead Capture

1. A visitor submits a form on a client website.
2. The shared public endpoint validates the revocable form key, Turnstile, honeypot, rate limit, payload, and submission idempotency.
3. The system resolves the property server-side.
4. Safe matching resolves or creates the end Customer and person-only Contact.
5. The system creates one Lead opportunity and preserves permitted source/landing-page attribution.
6. RevenueActivity records the intake fact.
7. A `lead.created` event notifies assigned employees and may dispatch an eligible Robin job.
8. The Lead appears in the action workspace.

---

## Flow 3 — Customer and Lead Management

1. A user opens the action-first Revenue Operations workspace.
2. The user sees prioritized next work and material operational exceptions.
3. The user opens a durable Customer record and one related Lead opportunity.
4. The user reviews identity, requested service, source, owner, sales stage, next action, related Appointment/Estimate, communication, and history.
5. The Lead moves only through `NEW`, `CONTACTED`, `QUALIFIED`, and `WON` or `LOST` sales stages.
6. Estimate, Job, Invoice, Payment, follow-up, stale, and overdue facts remain in their owning records.
7. Meaningful business actions append RevenueActivity and update reports from source truth.

---

## Flow 4 — Human Communication

1. An authorized user selects an identified Customer and primary Contact.
2. Consent, endpoint, property route, capability, business hours, and duplicate protections are checked.
3. The system resolves a concrete Customer/Contact SMS or outbound-email Conversation.
4. Twilio handles two-way SMS; Postmark handles outbound email.
5. Message delivery and provider evidence are stored idempotently.
6. Optional Lead, Estimate, Appointment, Job, or Invoice context belongs to the Message/RevenueActivity, not Conversation ownership.
7. Unmatched inbound SMS enters bounded resolution without guessing a Customer.
8. Inbound email synchronization remains deferred.

---

## Flow 5 — Estimate and Acceptance

1. An employee creates an Estimate from the known Customer and obvious/default Contact.
2. ServiceLocation, ServiceAsset, Pricebook, and agreement detail use defaults or progressive disclosure where available.
3. Draft content becomes an immutable issued revision with line and agreement snapshots.
4. The employee presents or sends the exact revision through scoped customer access.
5. The customer may view the Estimate and Agreement, then sign and accept.
6. The customer cannot edit, comment, request revisions, or publicly reject in MVP.
7. Acceptance binds exact signer/signature evidence; a linked Lead may become `WON` through the application service.
8. Material post-acceptance changes use ChangeOrder.

---

## Flow 6 — Scheduling and Field Work

1. An Appointment records a sales/evaluation event when required.
2. Accepted or otherwise authorized work resolves a Job.
3. The user selects Start Work; the Job becomes `IN_PROGRESS`.
4. JobVisit supports scheduled field visits when needed but is not a clerical gate for simple work.
5. Authorized staff may add notes, tasks, ServiceAssets, photos/files, and ServiceIssues when relevant.
6. Work Complete makes the Job `WORK_COMPLETE`.
7. An authorized user closes the completed Job.
8. Cronofy supplies availability and external calendar projection while BTLS remains schedule truth.

---

## Flow 7 — Invoice and Payment

1. An authorized user drafts and issues an Invoice with immutable historical line content.
2. User-entered tax input is snapshotted only when supplied; BTLS does not determine tax law.
3. The Invoice may be delivered through scoped customer access.
4. The business receives money by cash, check, external card/ACH/bank flow, or another method.
5. The user records one or more factual Payments.
6. BTLS derives total paid, balance, `UNPAID / PARTIALLY_PAID / PAID`, and `OVERDUE`.
7. Mistakes use traceable reversal/correction rather than deletion.
8. Integrated payment processing is optional; BTLS is not an accounting ledger.

---

## Flow 8 — Quick Capture

1. An authorized user enters natural text or voice.
2. Voice is transcribed through a future provider boundary when required.
3. Structured extraction produces typed source-mutation proposals.
4. Runtime, authorization, and business-context validation run.
5. The proposal window always shows confidence, before/after values, new records, missing information, and derived effects.
6. The human confirms selected proposals.
7. Normal application services execute and persist audit/activity/events.
8. Quick Capture never directly writes derived state and is distinct from Robin.

---

## Flow 9 — Robin-Assisted Response

1. An eligible Revenue event or due action triggers a durable Robin job.
2. The system loads property configuration, Customer context, Business Knowledge Pack, implemented workflow, business hours, and enabled tools.
3. Robin creates a typed proposed action.
4. Runtime validation, property authorization, capability, operating-mode, consent, duplicate, and business-hour checks run.
5. Approval Required mode waits for human review; Automatic mode may execute only an already-approved implemented tool.
6. Normal application services own every mutation or provider action.
7. Message, RevenueActivity, RobinRun, RobinAction, and audit evidence are recorded.
8. Unsafe, failed, or uncertain actions create a human handoff.
9. Robin cannot fabricate signature or Payment truth or own Conversation/Message.

---

## Flow 10 — Review Request and Lifecycle Follow-Up

1. An eligible completed Job reaches the property’s approved review-request timing.
2. One idempotent ReviewRequest is scheduled without changing or gating Job completion.
3. Consent, opt-out, business hours, duplicate, and communication-route checks run.
4. The normal Customer/Contact communication service sends the request.
5. Scheduled, sent, delivered, failed, or cancelled evidence is recorded.
6. Provider failure remains visible and retryable where safe.
7. A ReviewRequest never reopens operational truth or becomes a reputation-management platform.

---

## Flow 11 — Content Creation

1. A BTLS operator creates a content strategy brief.
2. The operator defines:
   - Customer question
   - Target query or long-tail terms
   - Search intent
   - Related service
   - Related location
   - Topic cluster
   - Money page
   - Content purpose
   - CTA or lead magnet
3. The operator writes the article.
4. The system runs readiness checks.
5. The operator manages internal links.
6. The operator previews the content.
7. The content enters review.
8. The operator publishes immediately or schedules publication.
9. The system publishes through:
   - BTLS-built website adapter
   - Supported WordPress adapter
   - Manual/export fallback
10. The publication record stores the external ID and URL.
11. Content Intelligence begins measuring the article when data becomes available.

---

## Flow 12 — Website Data Collection

1. A property connects GA4, Search Console, and optionally Google Business Profile.
2. Scheduled background jobs request provider data.
3. Provider responses are validated.
4. URLs, dates, sources, devices, and events are normalized.
5. Website pages are discovered or reconciled.
6. Pages receive broad roles:
   - Homepage
   - Service page
   - Location page
   - Blog post
   - Landing page
   - Contact or booking page
   - Other
7. Metric snapshots are stored.
8. Data-health checks identify missing, delayed, or broken data.
9. The metric engine calculates derived measurements and comparisons.
10. Finding evaluation is scheduled.

---

## Flow 13 — Finding Evaluation

1. The system selects eligible fixed Finding definitions.
2. It checks required inputs and evidence minimums.
3. It evaluates the trigger pattern.
4. It checks exclusions and data health.
5. It calculates confidence and priority.
6. It stores:
   - Finding definition version
   - Subject
   - Period
   - Evidence
   - Factual condition
   - Confidence
   - Priority
7. The Finding enters the operator review queue.
8. AI may create a plain-language explanation from the stored evidence.
9. AI may not invent evidence or determine that the rule passed.

---

## Flow 14 — Finding to Measured Work

1. An operator reviews a Finding.
2. The operator confirms, edits, defers, monitors, dismisses, or groups it.
3. The operator selects a predetermined Work Package.
4. The system creates a Work Ticket.
5. The ticket is assigned.
6. Tasks are completed.
7. The operator records the Intervention:
   - What changed
   - Where
   - When
   - Why
8. The system pins the before period.
9. The ticket enters Measurement Pending.
10. A background job waits for sufficient after-data.
11. A Measurement Review compares the periods.
12. The result is marked:
   - Improved
   - Partially Improved
   - No Measurable Change
   - Worsened
   - Inconclusive
   - Insufficient Data
13. The Finding is resolved, monitored, or reopened.

---

## Flow 15 — Client Review

1. A client user opens the property overview.
2. The client sees authorized lead and business outcomes.
3. The client sees only approved Findings.
4. The client sees planned and completed work where visible.
5. The client sees before-and-after results.
6. Internal hypotheses, dismissed Findings, and operator-only notes remain hidden.

---

## Flow 16 — Recurring Search Fulfillment

1. An authorized BTLS operator activates a Search Program for a property.
2. The program records priority services, service areas, site-management mode, fulfillment policy, provider limits, and automation policy.
3. Existing Website Pages receive Search semantic profiles without changing their core page identity.
4. BTLS defines SearchTargets that connect service/topic, geography, intent, keyword cluster, and intended ranking page.
5. Scheduled jobs refresh required technical, ranking, local, and other approved Search evidence.
6. Coverage and Search Finding rules evaluate evidence and data confidence.
7. The operator portfolio surfaces only material exceptions, approvals, and high-value opportunities.
8. Confirmed Search Findings create normal WorkTickets.
9. Human work or approved guarded site actions create Interventions.
10. The fulfillment cycle records which required scope was satisfied, waived, or blocked.
11. A client-safe SearchDeliverySummary proves what BTLS delivered.
12. Later MeasurementReviews compare visibility, traffic, and authorized business outcomes without claiming unsupported causation.

---

# Data Architecture

The Prisma schema is the executable source of truth. This section defines product ownership.

## AppUser

- Lives in PostgreSQL and links to Supabase Auth identity.
- Changes when profile or platform access changes.
- Used for memberships, assignment, authorship, and audit.
- Must not store passwords or raw Supabase credentials.

## ClientAccount

- Lives in PostgreSQL.
- Represents the organization/business subscribing to BTLS, never a Revenue Operations end Customer.
- Owns one or more Client Properties.
- Changes through authorized administration.
- Must not be used as a substitute for property ownership on property-specific records.

## ClientProperty

- Lives in PostgreSQL.
- Represents one business website and operational workspace.
- Owns feature data and integration relationships.
- Changes during onboarding, settings updates, suspension, or offboarding.
- Must never be inferred only from a browser route without authorization.

## Membership and Property Access

- Lives in PostgreSQL.
- Connects users to accounts, properties, roles, and capabilities.
- Changes through authorized user administration.
- Used by every protected service operation.
- Must never rely only on hidden navigation or frontend state.

## Pending Invitation Authorization

`PropertyAccess` is the authoritative client-user property assignment record: an account membership without an explicit grant does not authorize property entry. BTLS cross-property access comes only from explicit platform capabilities. Pending invitations store intended account and same-account property grants without Auth tokens or credentials; verified acceptance activates them idempotently; existing verified AppUsers receive the same server-authorized grants immediately. Cancellation and expiry deny activation.
## IntegrationConnection

- Lives in PostgreSQL.
- Stores provider identity, connection status, scopes, sync state, and secure credential references.
- Changes when a connection is authorized, refreshed, disconnected, or fails.
- Used by background jobs and provider adapters.
- Must not expose refresh tokens or secrets to the browser.

## Revenue Operations Records

- `Customer` is the property-scoped durable end-customer parent.
- `Contact` is one person associated with a Customer and carries communication endpoint/consent context.
- `ServiceLocation` is an end-customer work location; optional `ServiceAsset` supplies basic equipment/item context.
- `Lead` is one commercial opportunity with sales stages only.
- `RevenueActivity`, `RevenueNote`, Tags, `NextRequiredAction`, `AttentionFlag`, and `BusinessException` preserve history, next work, contextual concerns, and deterministic operating conditions without flattening them into Lead status.
- `Conversation` belongs to a Customer and required primary Contact; `Message` may carry optional Lead/Estimate/Appointment/Job/Invoice context.
- `EmployeeProfile` and `TimeEntry` support assignments and basic clock in/out without becoming payroll or HR.
- `Appointment` is sales/evaluation scheduling; `JobVisit` is scheduled field fulfillment.
- `Pricebook`, versioned `Estimate` revisions, agreement snapshots, delivery/view/acceptance evidence, and scoped document grants preserve commercial history.
- `Job`, `JobVisit`, `JobTask`, `ChangeOrder`, and `ServiceIssue` own authorized field-work truth.
- `Invoice`, immutable issued line content, delivery evidence, and factual `Payment` records own operational collection truth; balance and payment/overdue states are derived.
- `QuickCaptureRun` and typed mutation proposals always require review before normal services execute.
- `ReviewRequest` is basic post-work lifecycle communication.
- `RevenueOperationsSettings` owns Revenue defaults and references shared communication configuration; it never owns provider credentials.

Shared `PropertyService` remains the offered-service identity, and shared `MediaAsset`
remains file-byte truth. Revenue owns only its contextual relationships to those shared
records. Generated Job Brief, Estimate intelligence, customer journey presentation, and
Invoice payment/overdue state are derived rather than separate authoritative records.
## ContentAsset

- Lives in PostgreSQL.
- Represents a draft, scheduled, published, or retired content item.
- Changes through Smart Blog Studio.
- Used by publishing and Content Intelligence.
- Must not lose its original strategy context when published.

## ContentStrategy

- Lives in PostgreSQL.
- Stores the reason the content exists.
- Changes through operator editing and versioned content planning.
- Used by Content Intelligence to evaluate the intended job.
- Must not be recreated separately in a general funnel system.

## WebsitePage

- Lives in PostgreSQL.
- Represents discovered URL/page identity and broad web-data classification.
- Changes through sync, reconciliation, or operator correction.
- Used by Website Intelligence, Content Intelligence, Smart Blog linking, and Search Operations.
- Search-specific semantic purpose, services, locations, topics, targets, coverage, and ranking evidence live in related Search Operations records rather than bloating this entity.
- Must not require every DOM element to become an object.

## MetricSnapshot

- Lives in PostgreSQL.
- Stores normalized values for a property, subject, and period.
- Changes through background imports and calculations.
- Used by Findings and reporting.
- Must not be treated as individualized user proof when sourced from aggregate provider data.

## FindingDefinition

- Lives in seeded or managed reference data.
- Represents a versioned fixed diagnostic rule.
- Changes through controlled rule updates.
- Used by the Finding engine.
- Must not allow a rule change to rewrite historical Findings.

## Finding

- Lives in PostgreSQL.
- Represents an evidence-backed condition detected for a property subject.
- Changes through evaluation and operator review.
- Used to explain performance and create work.
- Must not present possible causes as proven facts.

## WorkPackageTemplate

- Lives in versioned reference data.
- Represents a predetermined prescription for a Finding type.
- Changes through controlled template updates.
- Used to create practical work scopes.
- Must not force every ticket to remain identical after operator review.

## WorkTicket

- Lives in PostgreSQL.
- Represents assigned work created from a confirmed Finding.
- Changes through assignment and task execution.
- Used to manage who does the work.
- Must not claim the work succeeded.

## Intervention

- Lives in PostgreSQL.
- Records what actually changed.
- Changes when work is completed or corrected.
- Used by before-and-after measurement.
- Must not be replaced by a generic “ticket completed” timestamp.

## MeasurementReview

- Lives in PostgreSQL.
- Stores the before-and-after result.
- Changes after sufficient data is available and reviewed.
- Used to resolve, monitor, or reopen Findings.
- Must not claim improvement without evidence.

## BusinessKnowledgePack

- Lives in PostgreSQL and approved private storage where documents are involved.
- Stores property-approved business facts Robin may use.
- Changes through versioned operator or client updates.
- Used for qualification, responses, and scheduling.
- Must not be replaced by unrestricted website scraping during live conversation.

## RobinRun and RobinAction

- Live in PostgreSQL.
- Record one reasoning session and its proposed or executed actions.
- Change through controlled agent workflows.
- Used for audit, debugging, approval, and reporting.
- Must not provide unrestricted database or provider access.

## MediaAsset

- Metadata lives in PostgreSQL.
- File bytes live in Supabase Storage.
- Changes through upload, publication, replacement, and removal workflows.
- Used by content, attachments, evidence, and branding.
- Must not permit cross-property access.

---

## Shared Property Search Vocabulary

`PropertyService`, `BusinessLocation`, and `ServiceArea` are canonical property business facts reused across Revenue Operations, Robin, Smart Blog Studio, and Search Operations. Search-specific priority lives in the Search Program rather than these shared records.

## Search Operations Records

Search Operations adds property-scoped strategy, evidence, fulfillment, and execution records including:

- `SearchProgram` and versioned fulfillment/automation policies
- `PageSearchProfile` plus normalized page-service/location/topic assignments
- `SearchTopic`
- `SearchKeyword`, dated keyword metric snapshots, and keyword clusters
- `SearchTarget` plus historical target-page and support relationships
- `SearchCoverageAssessment`
- organic rank runs/observations
- local rank-grid runs/points
- normalized site-inspection/technical-audit evidence
- current internal-link graph
- narrow local/citation/backlink authority evidence
- `SearchFulfillmentCycle`, requirements, and `SearchDeliverySummary`
- `SearchInterventionScope` linked to shared Interventions
- guarded `OptimizationAction` records
- provider usage/cost records
- BTLS-internal Fleet Remediation with property-specific target/Intervention history

Durable actionable Search conditions use the existing shared `Finding` system. Search work uses the existing shared Work Management lifecycle.

---

# Features In Scope

## Website Intelligence

- GA4 integration
- Search Console integration
- Google Business Profile integration
- Command Center outcome connection
- Data normalization
- Page discovery
- Broad page classification
- Essential action measurement
- Derived metrics
- Comparisons and baselines
- Data-health checks
- Fixed Website Findings
- Confidence and priority
- Plain-English explanation
- Operator review
- Client-approved view
- Raw metric drill-down

## Smart Blog Studio

- Content inventory
- Strategy brief
- Target question and query
- Search intent
- Service and location connection
- Topic clusters
- Money page
- Content purpose
- CTA or lead magnet
- Tiptap article editor
- SEO metadata
- Images and alt text
- FAQs
- Internal links
- Readiness checks
- Review
- Scheduling
- BTLS-built publishing
- Limited WordPress publishing
- Manual/export fallback
- Content Strategy Playbook

## Content Intelligence

- Strategy reuse
- Article search metrics
- Organic traffic and engagement
- Query gain and loss
- Service-page progression
- CTA and internal-link activity
- Lead and conversion contribution
- Topic-cluster performance
- Content scorecards
- Fixed Content Findings
- Content Work Packages
- Update, expand, consolidate, monitor, or retire recommendations

## Revenue Operations

- Action-first Revenue home and Customer operating record
- Customer, person-only Contact, ServiceLocation, and optional ServiceAsset
- Lead opportunity and attribution
- Next required actions, contextual attention, and deterministic BusinessExceptions
- Customer/Contact SMS and outbound-email communication history
- Employee assignment and basic TimeEntry clock in/out
- Appointment scheduling and unified Appointment/JobVisit schedule view
- Pricebook-assisted Estimate drafting
- Immutable Estimate revisions, agreement snapshots, delivery, scoped presentation, and acceptance
- Authorized Job, optional field visits/tasks/assets/files, ChangeOrder, and basic ServiceIssue
- Immutable issued Invoice, factual Payment, derived balance/partial/paid/overdue state
- Safe text and voice Quick Capture proposal review
- Generated Job Brief and Customer journey presentation as derived assistance
- Basic ReviewRequest lifecycle
- Revenue and attribution reporting through collected Payment where evidence exists
- Property and cross-property operational attention for authorized BTLS users

## Robin

- New-lead acknowledgment
- Staff notification
- Lead summary
- Missing-information detection
- Approved qualification
- Approved field updates
- Client-specific workflows
- Approved scheduling
- Follow-up
- Re-engagement
- Human escalation
- Business Knowledge Pack
- Off, Approval Required, and Automatic modes
- Capability toggles
- Complete action logging
- Duplicate prevention
- Outcome reporting

## Search Operations

- Search Program configuration and recurring fulfillment policy
- Canonical service/location reuse
- Page semantic classification
- Search topics, keyword clusters, and SearchTargets
- Service × geography × intent coverage assessment
- Organic rank tracking for selected targets
- Local geo-grid/rank-map measurement
- Technical site inspection and versioned Search audit checks
- Internal-link/support evaluation
- Google Business Profile/local presence evidence
- Foundation/exception-driven citation checks
- Narrow backlink/authority monitoring
- Evidence-backed Search Findings and prioritization
- Shared Work Package/Ticket/Intervention integration
- Fulfillment cycles and client delivery proof
- Cross-property exception-first Search operations
- Provider usage, quota, and estimated-cost controls
- Guarded, capability-aware bounded optimization on supported sites
- BTLS-managed Fleet Remediation
- Search MeasurementReview integration with rankings, traffic, leads, and revenue where defensible

## Shared Work Management

- Finding review
- Work Package templates
- Tickets
- Assignment
- Task checklist
- Notes and attachments
- Intervention record
- Before-and-after measurement
- Finding resolution, monitoring, and reopening

## Shared Platform

- Multi-tenancy
- Supabase Auth
- Property-scoped permissions
- PostgreSQL RLS
- Supabase Storage
- Background jobs
- Internal events
- Notifications
- Audit history
- Feature flags
- Logging and monitoring
- Dark, light, and system themes

---

# Features Out of Scope

- Campaign management — remains outside the MVP so the platform stays focused on the approved studios.
- General Funnel Mapper — content effectiveness is handled by Content Intelligence.
- General Funnel Leak Detection — useful diagnostics belong in fixed Website and Content Findings.
- Advertising management — campaign spend and ad-platform control are deferred.
- Advanced multi-touch attribution — provider data does not support perfect individualized proof.
- Predictive analytics — current and historical diagnosis comes first.
- Cross-client benchmarks — deferred until sufficient comparable data exists.
- Full project-management software — Work Management remains purpose-built and narrow.
- Unbounded or AI-directed website modification — Search Operations may execute only explicitly allowlisted, deterministic, policy-authorized guarded actions on supported BTLS-managed sites.
- Inbound email synchronization — Postmark is outbound-only in MVP.
- Arbitrary WordPress compatibility — only native REST-compatible posts are supported.
- Page-builder-specific WordPress editing — Elementor, Divi, WPBakery, and custom layouts are deferred.
- Real-time collaborative article editing — unnecessary for MVP.
- Unrestricted Robin autonomy — all actions remain tool-, permission-, and mode-controlled.
- Cross-session identity stitching — deferred due complexity, consent, and attribution limits.
- Universal CRM, ERP, accounting/general-ledger, payroll, inventory, advanced dispatch/route optimization, tax-compliance, and general project-management suites — Revenue Operations is intentionally bounded to supported service-business workflows.
- Mass automated service/location page generation — strategy remains human-controlled.
- Autonomous AI content publication — customer-facing publication follows approved review policy.
- Automated backlink marketplace or mass outreach — external authority work remains restrained and human-directed.
- Search billing/subscription ownership — SearchProgram owns fulfillment state, not commercial billing truth.
- Unlimited keyword, competitor, rank, crawl, citation, or backlink tracking — provider-intensive work is policy/quota controlled.

---

# Tech Stack

## Application

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Radix UI primitives

## Data and Identity

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- PostgreSQL Row-Level Security
- Prisma
- Zod

## Interface Libraries

- React Hook Form
- TanStack Table
- Tiptap
- Lucide icons
- date-fns

## Background and Operations

- Inngest
- Sentry
- Pino-compatible structured logging
- Vercel

## AI and Communication

- OpenAI API through a BTLS adapter
- Postmark for outbound email
- Twilio for two-way SMS
- Cronofy for availability and external calendar projection/synchronization; BTLS remains operational schedule truth

## Web Growth and Search Data

- Google Analytics Data API
- Google Search Console API
- Google Business Profile APIs
- BTLS `KeywordMetricsProvider`
- BTLS `OrganicRankProvider`
- BTLS `LocalRankGridProvider`
- BTLS `SiteInspectionAdapter`
- BTLS `PagePerformanceProvider`
- BTLS `CitationProvider` and `BacklinkProvider` when enabled
- BTLS `CallAttributionProvider` when enabled
- BTLS `SiteOptimizationAdapter`

Exact Search vendors remain deferred to the owning build features unless separately approved.

## Public Form Protection

- Cloudflare Turnstile
- Honeypot
- Rate limiting
- Idempotency

## Testing

- Vitest
- React Testing Library
- Playwright

## Publishing

- BTLS-built website publishing adapter
- WordPress REST API adapter
- Manual/export fallback

---

# Analytics Events

Analytics events measure product use. They do not replace audit records or business source-of-truth data.

## Authentication and Property

```text
auth.sign_in_succeeded
auth.sign_in_failed
auth.invitation_accepted

property.created
property.switched
property.integration_connected
property.integration_disconnected
```

## Revenue Operations

```text
customer.created
lead.created
lead.opened
lead.assigned
lead.stage_changed
lead.won
lead.lost

next_required_action.created
next_required_action.completed

appointment.scheduled

estimate.created
estimate.revision_issued
estimate.sent
estimate.viewed
estimate.accepted

job.started
job.work_completed
job.closed

invoice.issued
payment.recorded

quick_capture.confirmed
review_request.sent
```

## Robin

```text
robin.run_started
robin.action_proposed
robin.action_approved
robin.action_edited
robin.action_rejected
robin.action_completed
robin.action_failed
robin.handoff_requested
```

## Smart Blog Studio

```text
content.created
content.strategy_completed
content.readiness_viewed
content.previewed
content.review_requested
content.published
content.publication_failed
content.updated
```

## Website and Content Intelligence

```text
finding.detected
finding.opened
finding.confirmed
finding.deferred
finding.dismissed
finding.client_visible

content_scorecard.opened
topic_cluster.opened
raw_metrics.opened
```

## Work Management

```text
ticket.created
ticket.assigned
ticket.started
ticket.completed

intervention.recorded

measurement.review_started
measurement.review_completed

finding.resolved
finding.reopened
```

## Search Operations

- `search.program.created`
- `search.program.activated`
- `search.program.paused`
- `search.target.created`
- `search.target.updated`
- `search.coverage.assessed`
- `search.organic_rank.completed`
- `search.organic_rank.failed`
- `search.local_grid.completed`
- `search.local_grid.failed`
- `search.inspection.completed`
- `search.inspection.failed`
- `search.audit.completed`
- `search.audit.failed`
- `search.cycle.opened`
- `search.cycle.fulfilled`
- `search.optimization.proposed`
- `search.optimization.approved`
- `search.optimization.executed`
- `search.optimization.failed`
- `search.delivery_summary.generated`
- `search.fleet_remediation.completed`

### Common event parameters

Where relevant:

```text
propertyId
accountId
userRole
feature
recordId
source
provider
status
mode
findingDefinitionId
workPackageId
```

Do not send secrets, customer message content, or unnecessary personal data to product analytics.

---

# Target User

## Primary Business Customer

A local service-business owner or manager who:

- Receives leads through calls and website forms
- Needs employees to respond quickly
- Tracks estimates, jobs, and payments
- Does not want to manage several disconnected systems
- Wants to understand whether marketing work produces useful business outcomes
- May not understand analytics or SEO terminology
- Needs clear next actions

## Primary Internal User

A BTLS operator who:

- Manages multiple client properties
- Creates content
- Reviews search and website data
- Diagnoses performance
- Performs improvement work
- Communicates value to clients
- Needs a prioritized portfolio view
- Does not want to manually sift through every provider dashboard

## Secondary User

A client employee who:

- Needs only assigned leads and tasks
- Requires simple status updates
- Should not see unrelated properties or restricted financial data

---

# Success Criteria

## Platform and Tenancy

- One application supports multiple client accounts and properties.
- Adding a property requires configuration, not a new codebase or deployment.
- Authorized BTLS users can find every property they are permitted to manage.
- Client users cannot read or mutate another client’s data.
- Cross-tenant tests pass for routes, services, storage, jobs, and Robin tools.

## Revenue Operations

- Public inquiries reliably become the correct property-scoped Customer, Contact, and Lead without unsafe matching.
- The next useful action and material operational exceptions are obvious.
- Lead source and landing-page evidence are retained when available, while Lead state remains sales-only.
- Customer/Contact communication reaches the correct thread and respects consent.
- Issued Estimate revisions, agreement snapshots, scoped presentation, and exact-revision acceptance remain trustworthy and immutable.
- Accepted or otherwise authorized work can be scheduled, started, completed, and closed through field-capable responsive web workflows.
- Invoice, partial Payment, balance, and overdue math derive correctly from durable facts.
- Quick Capture reduces clerical entry while always previewing and confirming typed proposals.
- Basic TimeEntry clock in/out works without becoming payroll.
- Confirmed collected revenue derives from recorded Payments and can connect to source evidence without unsupported causal claims.

## Robin

- Robin respects Off, Approval Required, and Automatic modes.
- Every Robin action is property-scoped, validated, and recorded.
- Duplicate acknowledgments and follow-ups are prevented.
- Unsafe or failed actions create a human handoff.
- Two-way SMS reaches the correct property conversation.
- Opt-out state prevents unauthorized automated SMS.

## Smart Blog Studio

- An operator can move content from strategy brief to publication.
- Strategy information remains connected to the published article.
- BTLS-built websites can publish and update content.
- Compatible WordPress sites can publish and update native posts.
- Unsupported WordPress configurations fail safely to export/manual publishing.
- Readiness checks are understandable and actionable.

## Website Intelligence

- Connected Google data is imported and normalized reliably.
- The system can identify missing or degraded tracking.
- Findings come from versioned fixed rules.
- Every Finding displays its supporting evidence.
- Findings distinguish observed facts from possible causes.
- Client users see only approved Findings.
- The interface prioritizes action over metric volume.

## Content Intelligence

- Published content can be matched to its strategy and performance.
- Articles show useful scorecards without arbitrary overall grades.
- Content may receive credit for service support and assisted outcomes, not only direct Leads.
- Topic clusters can be evaluated as connected content strategies.
- Recommendations identify whether to protect, expand, update, consolidate, monitor, or retire content.

## Work Management

- Confirmed Findings can become tickets.
- Tickets retain the originating Finding and Work Package.
- Completed work produces an Intervention record.
- Ticket completion does not automatically claim success.
- Measurement Reviews compare reproducible before-and-after periods.
- Findings can be resolved, monitored, or reopened based on evidence.

## Search Operations

- One operator can identify Search Programs needing attention without opening every property.
- SearchTargets connect commercial services/topics, geography, intent, keyword clusters, and intended ranking assets.
- Technical, organic-rank, local-grid, and other Search evidence is versioned and provider-normalized.
- Search Findings reuse the shared Finding/work lifecycle.
- Fulfillment cycles prove what BTLS delivered without claiming that delivery caused improvement.
- Guarded automatic execution exists only where adapter capability and property policy permit it.
- Unsupported external sites degrade safely to human work.
- Provider cost/usage remains bounded and attributable.
- Search Interventions can later be measured against visibility, traffic, and authorized business outcomes.

## Usability

- A new developer can locate feature code, validation, authorization, data access, and tests.
- A client can understand approved Findings without SEO training.
- A BTLS operator can identify the most important work without opening every raw provider report.
- Critical workflows work on desktop and remain usable on mobile.
- Dark and light themes use the same semantic UI system.
- Critical interfaces meet accessibility requirements.

## Production Readiness

- Type-check, lint, tests, and production build pass.
- Critical Playwright journeys pass in staging.
- Public endpoints have validation, bot protection, rate limits, and idempotency.
- Provider failures degrade safely.
- Important operations have structured logs.
- Sensitive actions have audit history.
- Database migrations are repeatable and controlled.
- Backup, recovery, deployment, and rollback procedures are documented.

---

# Launch Calibration Metrics

Exact business targets should be calibrated after real usage begins.

The product should initially measure:

- Lead ingestion success rate
- Median time from Lead creation to first response
- Percentage of Leads acknowledged automatically
- Percentage of Robin actions requiring correction
- Human-handoff rate
- Lead qualification rate
- Estimate issue, delivery, and acceptance rates
- Time from accepted work to scheduled/started work
- Job work-completion and close rates
- Invoice-to-Payment collection and overdue rates
- Quick Capture proposal correction/rejection rate
- Confirmed collected-revenue capture completeness
- Google integration sync success rate
- Percentage of Findings confirmed versus dismissed
- Percentage of confirmed Findings converted into work
- Percentage of completed Interventions receiving Measurement Reviews
- Content publication success rate
- WordPress adapter success rate
- Cross-tenant authorization test pass rate
- Critical background-job failure rate

Targets should be established from observed baselines rather than invented before the product has production data.

---

# Final Product Definition

The BTLS Command Center is not merely:

- A CRM
- An analytics dashboard
- An AI chatbot
- A blogging tool
- A ticket system

It is a shared operating system that connects:

```text
Website opportunity
→ Customer and Lead response
→ Estimate and acceptance
→ scheduling and authorized field work
→ Invoice and collected Payment
→ follow-up and review
→ website and content intelligence
→ recurring search fulfillment
→ evidence-backed work
→ measured improvement
```

Its value depends on keeping these systems connected while remaining simple enough for service businesses and BTLS operators to use every day.
