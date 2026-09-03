# BTLS Architecture

> **Document status:** Target architecture for the BTLS MVP  
> **Repository location:** `context/architecture.md`  
> **Companion standard:** `context/code-standards.md`  
> **Audience:** Codex, developers, reviewers, and future maintainers  
> **Update rule:** Change this file whenever a binding architectural decision changes.
>
> This document defines the stable structure and boundaries of the BTLS application. It is intentionally more specific than a generic architecture guide, but it does not replace feature specifications or the Prisma schema.

---

## 1. Product Boundary

The BTLS MVP contains three product studios and six primary product components.

### Web Growth Studio

1. **Website Intelligence**
2. **Smart Blog Studio**
3. **Content Intelligence**

### Revenue Operations Studio

4. **Revenue Operations / Command Center**
5. **Robin AI Automation Agent**

Revenue Operations is the supported service-business customer, sales, scheduling,
field-operation, invoicing, payment-tracking, and lifecycle operating system inside
BTLS. Its durable domain may be relationally rich, but the normal worker path must
remain action driven and simple.

### Search Operations Studio

6. **Search Operations / Fulfillment**

### Shared feature

7. **Work Management**

Work Management is shared by Website Intelligence, Content Intelligence, and Search Operations. It owns the common Finding-to-work loop:

```text
Finding
→ operator review
→ Work Package
→ ticket
→ completed intervention
→ before-and-after measurement
→ resolve, monitor, or reopen
```

### Explicit MVP exclusions

The MVP does not include:

- General campaign management
- General funnel mapping
- Advertising-platform management
- Advanced multi-touch attribution
- Predictive analytics
- Cross-client benchmarking
- Full project-management software
- A universal CRM or general ERP
- General accounting, general ledger, bank reconciliation, payroll, or tax accounting
- Inventory-suite or advanced dispatch/route-optimization behavior
- An automatic tax-compliance engine
- A native offline field application during the MVP
- Unbounded or AI-directed automatic website modification
- Unapproved autonomous AI actions

Shared infrastructure required by the six primary MVP components is allowed.

Search Operations may execute bounded website actions only through the approved guarded-execution architecture. `AUTO_GUARDED` is not unrestricted automation: it requires a BTLS-managed site, an explicit adapter capability, an approved operation allowlist, property automation policy, validated deterministic input, idempotency, traceability, conflict checks, and rollback/reversal where risk requires it. AI may suggest or draft but may not grant itself execution authority.

---

## 2. Architecture Principles

1. **Feature-first organization**  
   Product behavior lives with the feature that owns it.

2. **Server-authoritative application**  
   Authentication, authorization, business rules, tenant isolation, and durable mutations are enforced on the server.

3. **Thin delivery layers**  
   React components, Server Actions, and Route Handlers delegate business work to application services.

4. **PostgreSQL protects durable truth**  
   The database owns relational integrity, constraints, indexes, transactions, and Row-Level Security.

5. **Prisma is the primary server database client**  
   Feature code does not invent competing database-access patterns.

6. **Supabase provides managed platform services**  
   Supabase owns PostgreSQL hosting, authentication, storage, and selected realtime behavior.

7. **External systems are isolated behind adapters**  
   Google, email, SMS, calendar, publishing, and AI provider payloads do not spread through feature code.

8. **Background work stays outside web requests**  
   Slow, scheduled, retryable, and provider-dependent operations use durable background jobs.

9. **AI acts through narrow tools**  
   Robin never receives unrestricted database or provider access.

10. **Evidence precedes diagnosis**  
    Website, Content, and Search Findings must preserve the facts and rule version that produced them.

11. **Readable beats clever**  
    The implementation follows `context/code-standards.md`.

12. **Fulfillment orchestration stays separate from diagnosis**  
    Website and Content Intelligence determine evidence-backed conditions. Search Operations owns recurring search-program fulfillment, portfolio exceptions, and bounded execution. Work Management remains the shared execution and measurement record.

13. **Robust underneath; simple in front**
    Durable relational truth must not force ordinary users to perform unnecessary clerical work. Advanced Revenue detail uses defaults and progressive disclosure.

14. **Derived state beats duplicated manual status**
    Persist the source facts that happened and derive summaries such as delivery, payment, overdue, coverage, and health when reality permits.

15. **Commercial history becomes immutable when issued or accepted**
    Current catalog, agreement, or template changes never rewrite issued, signed, or otherwise historical commercial truth.

16. **Natural-language capture proposes before mutation**
    AI extraction produces typed, validated proposals. Consequential proposals are reviewed before normal application services execute them.

17. **Operational financial truth is not accounting truth**
    BTLS records estimates, authorized work, invoices, payments, balances, and collected revenue without becoming a ledger, payroll, or tax-accounting system.

18. **Provider-independent operational truth**
    A provider may execute or project a capability without becoming the source of the underlying BTLS business fact.

---

## 3. Stack

| Layer | Tool | Purpose |
|---|---|---|
| Full-stack framework | Next.js App Router | Routing, rendering, Server Components, Server Actions, Route Handlers |
| UI runtime | React | Interactive application interfaces |
| Language | TypeScript strict mode | Application-wide static typing |
| Styling | Tailwind CSS | Consistent utility-based styling |
| UI primitives | shadcn/ui with Radix primitives | Accessible, reusable interface components |
| Primary database | Supabase PostgreSQL | Durable relational data |
| ORM and migrations | Prisma | Typed server-side queries, transactions, schema, migrations |
| Authentication | Supabase Auth | Identity, secure sessions, invitations, password recovery |
| Authorization | BTLS application services plus PostgreSQL RLS | Capability enforcement and tenant isolation |
| Runtime validation | Zod | Validation at all server and external trust boundaries |
| File storage | Supabase Storage | Public media and private attachments |
| Background jobs | Inngest | Durable jobs, schedules, retries, and event-driven workflows |
| AI provider | OpenAI API behind a BTLS adapter | Robin reasoning plus bounded Quick Capture extraction and derived summaries |
| Email | Postmark behind a BTLS adapter | Transactional and customer communication email |
| SMS | Twilio behind a BTLS adapter | Permissioned Customer/Contact communication |
| Calendar | Cronofy behind a BTLS adapter | Availability and external projection/synchronization of BTLS schedule truth |
| Web analytics | Google Analytics Data API | Website behavior and events |
| Search data | Google Search Console API | Queries, pages, impressions, clicks, CTR, position |
| Local presence | Google Business Profile APIs | Local visibility and interaction metrics |
| Page performance evidence | BTLS `PagePerformanceProvider`; Google PageSpeed-compatible implementation may be selected later | Search audit performance evidence |
| Keyword metrics | BTLS `KeywordMetricsProvider` | Replaceable search-demand evidence |
| Organic rank tracking | BTLS `OrganicRankProvider` | Point-in-time organic ranking evidence |
| Local rank maps | BTLS `LocalRankGridProvider` | Geographic local-pack visibility evidence |
| Site inspection | BTLS `SiteInspectionAdapter` | Normalized technical crawl/inspection evidence |
| Search authority data | BTLS `CitationProvider` and `BacklinkProvider` when enabled | Narrow citation/backlink evidence for Findings |
| Site optimization | BTLS `SiteOptimizationAdapter` | Capability-aware preview/execution/rollback for approved bounded actions |
| Unit/integration tests | Vitest | Fast TypeScript tests |
| Component tests | React Testing Library | Important interactive UI behavior |
| End-to-end tests | Playwright | Critical product journeys and tenant isolation |
| Error monitoring | Sentry | Exceptions, traces, and production diagnostics |
| Structured logging | Pino-compatible logger | Searchable server and job logs |
| Deployment | Vercel | Next.js application and preview deployments |
| Managed data services | Supabase | Database, Auth, and Storage environments |

### Provider substitution rule

Providers are accessed through internal adapters. A provider may be replaced without rewriting feature business logic, but replacing a listed core provider requires an architecture decision.

---

## 4. Runtime Topology

```text
Browser
  │
  ├── Next.js pages and Client Components
  │
  ├── Server Actions for authenticated first-party mutations
  │
  └── Route Handlers for webhooks, OAuth, public forms, health, and APIs
        │
        ▼
Feature application services
        │
        ├── Authorization and property access
        ├── Zod validation
        ├── Prisma transactions and queries
        ├── Audit records
        ├── Internal events
        └── Background-job dispatch
             │
             ├── Supabase PostgreSQL
             ├── Supabase Storage
             ├── Google APIs
             ├── Search data providers through BTLS adapters
             ├── Site inspection and optimization adapters
             ├── Email/SMS/Calendar providers
             └── OpenAI adapter
```

### Core runtime rule

No browser component, Server Action, Route Handler, job handler, or AI tool should implement a complete business workflow by itself. Each delegates to an owning application service.

---

## 5. Folder Structure

```text
/
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── build-plan.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   └── progress-tracker.md
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   ├── reset-password/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── [propertyId]/
│   │   │   │   ├── overview/
│   │   │   │   ├── revenue-operations/
│   │   │   │   ├── website-intelligence/
│   │   │   │   ├── smart-blog-studio/
│   │   │   │   ├── content-intelligence/
│   │   │   │   ├── search-operations/
│   │   │   │   ├── robin/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── integrations/
│   │   │   ├── webhooks/
│   │   │   ├── forms/
│   │   │   └── health/
│   │   │
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── revenue-operations/
│   │   │   ├── customers/
│   │   │   ├── opportunities/
│   │   │   ├── communications/
│   │   │   ├── scheduling/
│   │   │   ├── estimates/
│   │   │   ├── field-operations/
│   │   │   ├── billing/
│   │   │   ├── intelligence/
│   │   │   ├── quick-capture/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   ├── robin/
│   │   │   ├── components/
│   │   │   ├── prompts/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── tools/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   ├── website-intelligence/
│   │   │   ├── components/
│   │   │   ├── findings/
│   │   │   ├── metrics/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   ├── smart-blog-studio/
│   │   │   ├── components/
│   │   │   ├── editor/
│   │   │   ├── publishing/
│   │   │   ├── schemas/
│   │   │   ├── seo-checks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   ├── content-intelligence/
│   │   │   ├── components/
│   │   │   ├── findings/
│   │   │   ├── metrics/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   ├── search-operations/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── strategy/
│   │   │   ├── coverage/
│   │   │   ├── rankings/
│   │   │   ├── audits/
│   │   │   ├── local/
│   │   │   ├── linking/
│   │   │   ├── fulfillment/
│   │   │   ├── optimization/
│   │   │   ├── measurement/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │
│   │   └── work-management/
│   │       ├── components/
│   │       ├── queries/
│   │       ├── schemas/
│   │       ├── services/
│   │       ├── types/
│   │       └── tests/
│   │
│   ├── components/
│   │   ├── feedback/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── tables/
│   │   └── ui/
│   │
│   ├── server/
│   │   ├── audit/
│   │   ├── auth/
│   │   │   ├── permissions.ts
│   │   │   ├── property-access.ts
│   │   │   └── session.ts
│   │   ├── database/
│   │   │   ├── prisma.ts
│   │   │   ├── tenant-context.ts
│   │   │   └── transactions.ts
│   │   ├── events/
│   │   │   ├── event-types.ts
│   │   │   ├── handlers/
│   │   │   └── publish-event.ts
│   │   ├── feature-flags/
│   │   ├── integrations/
│   │   │   ├── calendar/
│   │   │   ├── email/
│   │   │   ├── google-analytics/
│   │   │   ├── google-business-profile/
│   │   │   ├── openai/
│   │   │   ├── publishing/
│   │   │   ├── search-console/
│   │   │   ├── keyword-metrics/
│   │   │   ├── organic-rank/
│   │   │   ├── local-rank-grid/
│   │   │   ├── site-inspection/
│   │   │   ├── page-performance/
│   │   │   ├── citations/
│   │   │   ├── backlinks/
│   │   │   ├── call-attribution/
│   │   │   ├── site-optimization/
│   │   │   └── sms/
│   │   ├── jobs/
│   │   │   ├── handlers/
│   │   │   ├── schedules/
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── logging/
│   │   └── storage/
│   │       ├── file-validation.ts
│   │       ├── signed-urls.ts
│   │       └── uploads.ts
│   │
│   ├── lib/
│   │   ├── constants/
│   │   ├── dates/
│   │   ├── errors/
│   │   ├── formatting/
│   │   ├── pagination/
│   │   ├── result/
│   │   └── validation/
│   │
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── policies/
│
├── public/
│   ├── icons/
│   └── images/
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── integration/
│   └── mocks/
│
├── scripts/
│   ├── maintenance/
│   ├── migrations/
│   └── setup/
│
├── .env.example
├── eslint.config.js
├── next.config.ts
├── package.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

### Structural notes

- `context/` contains the binding context files Codex reads before work.
- `src/app/` owns routes, layouts, boundaries, and thin entry points.
- `src/features/` owns product behavior.
- `src/components/` contains genuinely shared presentation components.
- `src/server/` contains shared server infrastructure.
- `src/lib/` contains small framework-independent utilities.
- `prisma/` owns the application schema and normal migrations.
- `supabase/` owns RLS policies and Supabase-specific SQL/configuration that Prisma cannot express safely.
- `tests/` contains cross-feature integration and end-to-end coverage.
- `work-management/` is shared because Website Intelligence, Content Intelligence, and Search Operations use Findings, Work Packages, tickets, interventions, and measurement reviews.
- Revenue Operations remains one product feature root. Its internal subdomains are permitted seams as complexity appears, not separate products or folders that must be created in advance.

---

## 6. System Boundaries

| Area | Owns | Must not own |
|---|---|---|
| `src/app/` | Routes, layouts, loading/error boundaries, thin actions and handlers | Business workflows, direct provider logic, complex database queries |
| React components | Presentation, interaction, temporary UI state | Authorization authority, database access, durable business rules |
| Feature actions | Validated entry points for first-party mutations | Full workflow implementations |
| Feature queries | Read-oriented feature APIs and DTO construction | Cross-tenant access, provider-specific parsing |
| Feature services | Business rules, workflow orchestration, transactions, audit/event dispatch | Rendering or provider SDK leakage |
| `work-management/` | Shared Finding-to-work lifecycle | Website, Content, or Search rule calculation |
| `revenue-operations/` | End-customer, opportunity, communication, scheduling, commercial, field-work, billing, operational-attention, time, and Quick Capture truth | Client tenancy, shared MediaAsset byte lifecycle, provider credentials, growth Findings, or general accounting/payroll |
| `search-operations/` | Search strategy, recurring SEO fulfillment, Search-specific evidence/rules, portfolio exceptions, and bounded optimization requests | Duplicate analytics ingestion, duplicate tickets/interventions, billing truth, unrestricted site mutation |
| `src/server/auth/` | Session resolution, capabilities, property access | Feature-specific business rules |
| `src/server/database/` | Prisma client, tenant context, transaction helpers | Feature workflows |
| `src/server/integrations/` | Provider clients, OAuth, provider-to-BTLS normalization | Product decisions and UI |
| `src/server/jobs/` | Durable background execution and schedules | Unvalidated feature logic |
| `src/server/events/` | Typed internal event publication and dispatch | Durable source-of-truth state |
| `src/server/storage/` | Upload authorization, paths, validation, signed access | Feature ownership decisions |
| `src/server/audit/` | Append-only sensitive action history | Operational debug logging |
| `src/lib/` | Small stable utilities and shared primitives | Feature-specific behavior |
| Prisma | Schema, typed queries, transactions, migrations | Authorization decisions or hidden business workflows |
| PostgreSQL | Relational integrity, constraints, indexes, RLS, durable state | Complex product orchestration in triggers |
| Supabase Auth | Identity and sessions | Client/property authorization |
| Supabase Storage | File bytes and delivery | File ownership truth |
| Inngest | Durable execution, retries, schedules | Business rules that belong in services |
| OpenAI adapter | Model invocation and normalized responses | Direct mutation authority |

---

## 7. Multi-Tenant Model

### Tenant hierarchy

```text
BTLS platform
└── ClientAccount
    ├── ClientProperty
    ├── ClientProperty
    └── memberships and access grants
```

### Definitions

- **ClientAccount** represents the organization or business subscribing to BTLS. It is not a Revenue Operations `Customer`.
- **ClientProperty** represents one business website and its connected operating data.
- **Customer** represents that client's end customer inside one ClientProperty.
- **BusinessLocation** represents the subscribing business's own operating/search location. A Revenue `ServiceLocation` represents an end-customer location where service may be delivered.
- A client account may own multiple properties.
- Major operational, content, intelligence, integration, and automation records belong to a `ClientProperty`.
- Users receive access through explicit membership and property permissions.
- BTLS staff may receive cross-property capabilities through explicit internal roles.

### Tenant-scoping rule

Every tenant-owned service operation receives an authorized property context. Feature code must not accept a browser-supplied `propertyId` as proof of access.

### Database enforcement

Tenant isolation uses both:

1. **Server-side authorization and explicitly scoped Prisma queries**
2. **PostgreSQL Row-Level Security as defense in depth**

The application should use a dedicated restricted database role for normal requests. Administrative and background access must be server-only, explicitly property-scoped, and audited when sensitive.

### Required tenant tests

The test suite must prove:

- A client user cannot read another account's property.
- A client user cannot mutate another account's records.
- Changing a route `propertyId` does not bypass authorization.
- Background jobs cannot execute without a stored property scope.
- Robin tools cannot access a lead outside the active property.
- Signed file access cannot cross property boundaries.

---

## 8. Authentication and Authorization

### Provider

Supabase Auth is the identity provider.

### MVP authentication methods

- Email and password
- Email verification
- Password reset
- Invite-based account access

Additional social login methods are deferred unless a product requirement appears.

### Session pattern

- Supabase SSR helpers maintain secure cookie-based sessions.
- Middleware refreshes sessions and handles basic route gating.
- Middleware does not replace service-level authorization.
- Every protected Server Component, Server Action, Route Handler, and job resolves an application user and access context before protected work.

### Authorization model

Authorization is capability-based and property-scoped.

Example capabilities:

```text
property.view
lead.view
lead.update
lead.assign
revenue.view
customer.view
customer.manage
employee.view
employee.manage
time.use_self
time.manage_team
communication.view
communication.send
schedule.view
schedule.manage
pricebook.view
pricebook.manage
estimate.view
estimate.manage
estimate.issue
job.view
job.manage
job.close
invoice.view
invoice.manage
invoice.issue
invoice.void
payment.view
payment.record
payment.correct
attention.view
attention.manage
quick_capture.use
service_issue.manage
review_request.manage
content.view
content.edit
content.publish
finding.review
ticket.manage
robin.view
robin.configure
integration.manage
user.manage
search.program.view
search.program.manage
search.strategy.view
search.strategy.manage
search.audit.view
search.audit.run
search.ranking.view
search.ranking.manage
search.finding.review
search.optimization.view
search.optimization.approve
search.optimization.execute
search.delivery.view
search.delivery.approve
search.portfolio.view
search.fleet.manage
```

Roles bundle capabilities; services check capabilities rather than relying only on role names.

Exact Revenue capabilities are added with the feature that owns them. The architecture
must preserve meaningful separations such as `revenue.view != payment.record`,
`payment.record != payment.correct`, `invoice.issue != invoice.void`, and
`time.use_self != time.manage_team`; this list is not permission seed data.

### Role classes

The initial system may include:

- Platform administrator
- BTLS operator
- Client owner
- Client manager
- Client staff
- Client viewer

The detailed role-to-capability matrix belongs in the authorization specification and seed data.

### Client-visible and internal data

Fields and records may be:

- Client visible
- BTLS internal
- Restricted to platform administration

Client visibility must be enforced in server queries and DTOs, not only hidden in the interface.

---

## 9. Data Access Pattern

### Primary rule

Prisma is the default server-side database client.

### Browser database access

The browser does not perform general tenant CRUD directly against Supabase in the MVP.

Allowed browser-side Supabase usage is limited to:

- Authentication/session support
- Approved realtime subscriptions
- Direct upload to a server-authorized signed storage path

### Query pattern

```ts
const context = await requirePropertyCapability({
  propertyId,
  capability: "lead.view",
});

return getLeadList({
  propertyId: context.propertyId,
  viewer: context.viewer,
});
```

### Mutation pattern

```ts
export async function updateLeadAction(
  input: unknown,
): Promise<ActionResult<LeadView>> {
  const parsed = updateLeadSchema.parse(input);

  const context = await requirePropertyCapability({
    propertyId: parsed.propertyId,
    capability: "lead.update",
  });

  return updateLead({
    context,
    input: parsed,
  });
}
```

### Service pattern

```ts
async function updateLead({
  context,
  input,
}: UpdateLeadCommand): Promise<ActionResult<LeadView>> {
  return withTransaction(async (tx) => {
    const lead = await tx.lead.findFirstOrThrow({
      where: {
        id: input.leadId,
        propertyId: context.propertyId,
      },
    });

    assertLeadTransitionAllowed(lead.status, input.status);

    const updated = await tx.lead.update({
      where: { id: lead.id },
      data: { status: input.status },
    });

    await recordAuditEvent(tx, {
      actorId: context.userId,
      propertyId: context.propertyId,
      action: "lead.status_changed",
      subjectId: lead.id,
    });

    return { ok: true, data: toLeadView(updated) };
  });
}
```

### Raw SQL

Raw SQL is allowed only for:

- PostgreSQL features Prisma cannot express
- Carefully reviewed reporting queries
- Performance-critical operations proven by measurement
- RLS setup
- Data migrations

Raw SQL must remain tenant-scoped, typed at its boundary, reviewed, and tested.

---

## 10. Conceptual Database Model

The Prisma schema is the executable source of truth. This section defines the intended aggregates and relationships, not every column.

### Platform and tenancy

| Entity | Purpose | Key relationships |
|---|---|---|
| `AppUser` | Application profile linked to Supabase identity | Memberships, audit events |
| `ClientAccount` | Customer organization or account | Properties, memberships |
| `ClientProperty` | One business website/operating property | Owns feature data |
| `AccountMembership` | User access to a client account | User, account, role |
| `PropertyAccess` | Optional property-specific access or restrictions | User/membership, property |
| `FeatureFlag` | Controlled capability rollout | Global, account, or property scope |

### Shared infrastructure

| Entity | Purpose | Key relationships |
|---|---|---|
| `IntegrationConnection` | Connection status and provider metadata | Property, provider |
| `SendingIdentity` | Shared verified sender identity and mode, separate from provider credentials and Revenue defaults | Property/integration configuration |
| `MediaAsset` | Shared ownership and metadata for stored files | Property, uploader, owning-feature relationships |
| `AuditEvent` | Append-only history of sensitive actions | Actor, property, subject |
| `Notification` | In-app notification and delivery status | User, property |
| `WebhookReceipt` | Idempotency and processing history | Provider, external event ID |
| `JobExecution` | Optional application record for important background work | Property, job type, status |

### Revenue Operations

Revenue Operations owns service-business operating truth inside a property. Exact Prisma
fields and joins are specified in the feature that introduces them; the ownership and
history boundaries below are binding.

| Entity | Purpose | Key relationships |
|---|---|---|
| `Customer` | Durable operational end-customer parent | Property, Contacts, locations, opportunities, communications, commercial and work records |
| `Contact` | Person associated with a Customer | Customer, endpoints, consent, Conversations |
| `ServiceLocation` | End-customer place where service may occur | Customer, optional ServiceAssets, Appointments, Jobs |
| `ServiceAsset` | Optional basic customer equipment/item context | Customer, ServiceLocation, Jobs, service history |
| `Tag` and explicit assignments | Property-defined flexible classification | Customer, Lead, or other approved Revenue subjects |
| `RevenueOperationsSettings` | Property Revenue defaults and references | Property; may reference shared SendingIdentity but never owns provider credentials |
| `EmployeeProfile` | Revenue workforce identity separate from AppUser login identity | Property, optional AppUser, assignments, TimeEntries |
| `TimeEntry` | Basic clock-in/out work record | EmployeeProfile, optional Job/JobVisit, audited corrections |
| `Lead` | One commercial opportunity with sales-stage truth only | Customer, Contact, PropertyService, owner, attribution |
| `RevenueActivity` | Append-only cross-lifecycle operating history | Customer plus optional Lead/Estimate/Appointment/Job/Invoice context |
| `RevenueNote` | Human-authored Revenue note distinct from customer communication | Customer plus optional operational context |
| `NextRequiredAction` | Canonical next work for a supported Revenue subject | Customer/Lead/Estimate/Job/Invoice, assignee |
| `AttentionFlag` | Contextual human/rule/AI concern | Revenue subject, creator/source |
| `BusinessExceptionDefinition` | Stable deterministic operating-rule identity/version | BusinessException history |
| `BusinessException` | Current or historical deterministic condition such as stale, unscheduled, uninvoiced, or overdue work | Definition, property, Revenue subject |
| `Appointment` | Sales, evaluation, or consultation schedule truth | Customer, Contact, optional Lead/Estimate, assignments |
| `Conversation` | Customer-owned, Contact-specific, channel/route-scoped communication thread | Required Customer and primary Contact, Messages |
| `Message` | Inbound/outbound communication item and provider evidence | Conversation plus optional Lead/Estimate/Appointment/Job/Invoice context |
| `Pricebook` | Revenue drafting catalog | Property, PricebookItems |
| `PricebookItem` | Reusable priced drafting item, optionally linked to shared PropertyService | Pricebook; snapshots into commercial line items |
| `AgreementTemplate` | Reusable current agreement source for drafting | Property; snapshots into Estimate revisions |
| `Estimate` | Stable commercial identity | Customer, Lead, revisions, delivery, acceptance |
| `EstimateRevision` | Versioned commercial content | Estimate, line-item and agreement snapshots |
| `EstimateLineItem` | Historical line snapshot for one revision | EstimateRevision, optional PricebookItem provenance |
| `EstimateAgreementSnapshot` | Historical agreement text for one revision | EstimateRevision, optional template provenance |
| `EstimateDelivery` | One Estimate send/presentation attempt | Exact EstimateRevision, Message/provider correlation |
| `EstimateViewEvent` | Customer document-view evidence | Exact EstimateRevision and scoped grant |
| `EstimateAcceptance` | Signature/acceptance evidence bound to one exact revision | EstimateRevision, signer evidence, shared MediaAsset/artifact references |
| `CustomerDocumentAccessGrant` | Scoped, expiring/revocable public access authority | Exact Estimate or Invoice document/version |
| `Job` | Authorized service work and provenance | Customer, ServiceLocation, accepted Estimate or authorized manual source |
| `JobVisit` | One scheduled field-fulfillment visit | Job, schedule, assignments |
| `JobTask` | Narrow checklist within a service Job | Job/JobVisit; never shared WorkTicket work |
| `ChangeOrder` | Material post-acceptance scope/price change | Job, immutable issued/accepted commercial snapshots |
| `ServiceIssue` | Basic callback/quality/service concern | Customer, Job, optional evidence MediaAssets |
| `Invoice` | Commercial billing document truth | Customer, Job, immutable issued lines, deliveries, Payments |
| `InvoiceLineItem` | Historical issued invoice line snapshot | Invoice, optional source provenance |
| `InvoiceDelivery` | One Invoice delivery attempt | Invoice, Message/provider correlation |
| `Payment` | Factual money received or explicit reversal/correction | Invoice, method/date/reference; provider linkage optional |
| `ReviewRequest` | Basic post-work review request without operational gating | Customer, Job, communication evidence |
| `QuickCaptureRun` | One natural-language/text/voice capture and review context | Property, actor, source MediaAsset when applicable |
| `QuickCaptureMutationProposal` | Typed proposed source mutation with confidence and before/after preview | QuickCaptureRun; applies only after confirmation through normal services |

Canonical distinctions:

- `ClientAccount` is the business subscribing to BTLS; `Customer` is that business's end customer.
- `BusinessLocation` is the client's own business/search location; `ServiceLocation` is an end-customer work location.
- Shared `PropertyService` is the identity of what the business offers. `PricebookItem` may reference it but never replaces it.
- Shared `MediaAsset` owns file-byte lifecycle. Revenue owns explicit contextual relationships only.
- `JobTask != WorkTicketTask` and `BusinessException != Finding`.
- Revenue Leak is a `BusinessException` rule family/category, not another model.
- Generated Job Brief, customer journey views, Estimate intelligence, and Invoice payment/overdue states are derived projections, not competing source records.

### Robin

| Entity | Purpose | Key relationships |
|---|---|---|
| `BusinessKnowledgePack` | Approved facts Robin may use | Property, version |
| `RobinConfiguration` | Modes, tools, hours, and capability settings | Property |
| `RobinRun` | One agent reasoning/execution session | Customer/Lead context, property, configuration version |
| `RobinAction` | Proposed or executed typed tool action | Robin run, approval, result |

Conversation and Message belong to Revenue Operations communication truth. Robin may
consume them and send through the same authorized application services as a human, but
Robin does not own or bypass their consent, threading, or provider rules.

### Smart Blog Studio

| Entity | Purpose | Key relationships |
|---|---|---|
| `ContentAsset` | Draft, scheduled, published, or retired content | Property, strategy, media |
| `ContentStrategy` | Target question, query, intent, service, money page, CTA | Content asset |
| `TopicCluster` | Group of related content supporting a topic/service | Content assets, property |
| `ContentLink` | Intended or confirmed internal link relationship | Source and target content/page |
| `PublicationRecord` | Publishing target, external ID, URL, and version | Content asset |

### Website and Content Intelligence

| Entity | Purpose | Key relationships |
|---|---|---|
| `WebsitePage` | Discovered website page and broad role | Property, content asset when managed |
| `MetricSnapshot` | Normalized metric values for a subject and period | Property, page/content/source |
| `DataHealthCheck` | Connection and tracking reliability result | Property, integration |
| `FindingDefinition` | Versioned fixed diagnostic rule metadata | Seeded reference data |
| `Finding` | Triggered evidence-backed condition | Property, subject, definition version |
| `FindingEvidence` | Metrics and comparisons that triggered a Finding | Finding |

### Shared property knowledge

| Entity | Purpose | Key relationships |
|---|---|---|
| `PropertyService` | Canonical service vocabulary reused across Revenue Operations, Robin, Smart Blog Studio, and Search Operations | Property, parent service |
| `BusinessLocation` | Actual business location, optionally connected to GBP | Property |
| `ServiceArea` | Geographic market the business serves or intentionally targets | Property |

Search priority does not belong on these shared records. Search-specific commercial and market priority belongs to `SearchProgram`. If implementation already contains equivalent canonical models, those existing names remain authoritative and Search Operations must reuse them.

If `PropertyService` has not been implemented when Feature 08 begins, Feature 08 may
introduce only the minimal already-canonical shared substrate as a prerequisite slice.
That timing does not transfer ownership to Revenue Operations. Search Feature 36 reuses
and may extend the same shared record while preserving Search-specific
BusinessLocation/ServiceArea behavior and internal Search feature order.

### Search Operations

| Entity | Purpose | Key relationships |
|---|---|---|
| `SearchProgram` | Property recurring SEO fulfillment program | Property, policy versions |
| `SearchFulfillmentPolicyVersion` | Versioned scope/cadence/quotas owed by a program | SearchProgram, cycle requirements |
| `SearchAutomationPolicyVersion` | Versioned property execution policy | SearchProgram, OptimizationAction |
| `PageSearchProfile` | Search semantic classification attached to a WebsitePage | WebsitePage, service/location/topic assignments |
| `SearchTopic` | Property-scoped search subject vocabulary | Pages, SearchTargets |
| `SearchKeyword` | Normalized query identity | Keyword clusters, metric/rank snapshots |
| `KeywordMetricSnapshot` | Dated search-demand/provider metrics | SearchKeyword |
| `SearchKeywordCluster` | Related queries normally served by one intent/ranking asset | Keywords, SearchTarget |
| `SearchTarget` | Primary strategic search unit: service/topic × geography × intent × keyword cluster | Program, target page, rankings, Findings |
| `SearchTargetPageAssignment` | Historical intended primary/secondary ranking-asset assignment | SearchTarget, WebsitePage |
| `SearchTargetSupport` | Intended supporting-authority relationship | SearchTarget, supporting WebsitePage |
| `SearchCoverageAssessment` | Versioned derived coverage state | SearchTarget |
| `SearchTrackedEntity` | Self or deliberately selected competitor for rank/authority evidence | Property |
| `OrganicRankRun` / `OrganicRankObservation` | Point-in-time organic ranking evidence | Keywords, tracked entities, SearchTargets |
| `LocalRankGridRun` / `LocalRankGridPoint` | Geographic local-pack visibility evidence | SearchTarget, keyword, BusinessLocation |
| `SiteInspectionRun` / `PageTechnicalSnapshot` | Normalized technical crawl evidence | WebsitePage |
| `InternalLinkEdge` | Current observed internal hyperlink graph | Source/target WebsitePage |
| `SearchAuditRun` / `SearchAuditCheckResult` | Versioned deterministic SEO audit evidence | Program, crawl, page/location/target |
| `LocalPresenceSnapshot` | Dated local-presence evidence | BusinessLocation |
| `ExternalListingObservation` | Citation/listing consistency evidence | BusinessLocation |
| `AuthoritySnapshot` / `BacklinkObservation` | Narrow external-authority evidence | SearchTrackedEntity, WebsitePage |
| `SearchFulfillmentCycle` / `SearchCycleRequirement` | Historical service period and snapshotted obligations | SearchProgram |
| `SearchDeliverySummary` | Client-safe proof of delivered work | SearchFulfillmentCycle |
| `SearchInterventionScope` | Search-specific scope attached to shared Intervention | Intervention, target/page/keyword/area |
| `OptimizationAction` | Proposed/approved/executed bounded site action | Program, WorkTicket, policy, Intervention |
| `SearchProviderUsageRecord` | Provider-unit usage and estimated cost by property/program | SearchProgram |
| `FleetRemediation` / `FleetRemediationTarget` | BTLS-internal shared-platform fix with property-specific verification | Multiple properties, Interventions |

### Shared Work Management

| Entity | Purpose | Key relationships |
|---|---|---|
| `WorkPackageTemplate` | Predetermined prescription for a Finding | Versioned reference data |
| `WorkTicket` | Assignable work generated from a confirmed Finding | Finding, property, assignee |
| `WorkTicketTask` | Practical checklist item | Ticket |
| `Intervention` | Durable record of what actually changed | Ticket, affected subject |
| `MeasurementReview` | Before-and-after result | Finding, intervention, periods |

### Reference-data versioning

Finding definitions and Work Package templates are versioned reference records. A triggered Finding stores the definition version and evidence used at creation so later rule changes do not rewrite history.

---

## 11. Core Data Flows

### 11.1 Authenticated read

```text
Request to property route
→ session resolved
→ property access and capability checked
→ feature query called with authorized property context
→ Prisma performs property-scoped read
→ server maps database records to a safe view model
→ Server Component renders
```

### 11.2 Authenticated mutation

```text
User submits form
→ client validation for usability
→ Server Action
→ Zod server validation
→ session and capability check
→ feature application service
→ Prisma transaction
→ audit event and internal event
→ revalidate or redirect
→ safe result returned
```

### 11.3 Public website lead submission

```text
Client website form
→ public ingestion Route Handler
→ bot/rate-limit checks
→ payload validation
→ property resolved through public form key
→ idempotency check
→ Customer and person-only Contact safely matched or created
→ one Lead opportunity created
→ RevenueActivity recorded
→ lead.created event published
→ employee notification and eligible Robin job dispatched
→ safe success response
```

Public forms never accept a privileged property ID as proof of destination. They use a
revocable public form identifier mapped server-side to the property. Matching rules must
not silently merge ambiguous end customers or people.

### 11.4 Customer communication

```text
Authorized human or Robin requests a send
→ required Customer and primary Contact resolved
→ consent, endpoint, property route, capability, and idempotency checked
→ Customer/Contact Conversation resolved for the concrete channel/route
→ provider adapter executes
→ Message and provider correlation persisted
→ RevenueActivity records optional Lead/Estimate/Appointment/Job/Invoice context
→ callbacks update delivery evidence idempotently
```

For SMS, the receiving property number plus normalized Contact phone resolves the
Customer/Contact Conversation. An unmatched inbound SMS preserves verified provider
receipt evidence and enters bounded resolution; it never guesses or creates ownership.
Outbound email may appear in the same Customer communication history, but inbound email
synchronization remains deferred.

### 11.5 Estimate issue and acceptance

```text
Known Customer and obvious/default Contact selected
→ optional ServiceLocation and Pricebook defaults applied
→ Estimate draft and mutable draft revision created
→ line items and agreement content snapshotted
→ exact revision issued and becomes immutable
→ scoped CustomerDocumentAccessGrant created
→ EstimateDelivery records presentation/send attempts
→ customer may view Agreement and sign/accept that exact current revision
→ EstimateAcceptance persists signer/signature evidence
→ signed artifact generation follows through shared MediaAsset
→ linked Lead may transition to WON through the acceptance service
```

A superseded or stale revision cannot be accepted as current. Customers cannot edit,
comment, request revisions, or publicly reject in MVP. Artifact-generation failure does
not erase authoritative database acceptance. Material post-acceptance change uses
ChangeOrder.

### 11.6 Authorized Job and field work

```text
Accepted Estimate or authorized manual workflow
→ Job resolved or created with provenance
→ Start work makes Job IN_PROGRESS
→ optional JobVisit, assignments, notes, tasks, assets, and MediaAsset evidence
→ Work complete makes Job WORK_COMPLETE
→ authorized Close makes Job CLOSED
```

The simple path does not require JobVisit, ServiceAsset, photos, notes, tasks, or a
closeout wizard unless a later explicit property policy requires them.

### 11.7 Invoice and Payment

```text
Authorized completed/active work
→ Invoice draft and line snapshots created
→ user-entered tax inputs included only when supplied
→ Invoice issued and financial content becomes immutable
→ InvoiceDelivery records send attempts
→ one or more factual Payments recorded
→ net collected and remaining balance calculated
→ UNPAID / PARTIALLY_PAID / PAID derived
→ OVERDUE derived from issued document + due date + remaining balance
```

Manual or externally processed money is a complete MVP path. A payment processor is
optional. Mistakes use explicit reversal/correction; voided commercial documents use a
traceable replacement flow. BTLS performs arithmetic on user-entered tax data but does
not determine jurisdiction, taxability, or statutory rates.

### 11.8 Quick Capture

```text
Natural text or voice
→ transcription when required
→ structured extraction
→ typed mutation proposals
→ runtime, authorization, and business-context validation
→ persisted confidence and before/after preview
→ proposal window always shown
→ human confirms selected proposals
→ normal application services execute source mutations
→ audit, RevenueActivity, and internal events persist
```

Quick Capture has no automatic mode and is not Robin. It proposes facts such as creating
a Payment or adding a Job note; it never directly writes derived payment, overdue, or
lifecycle state. Consequential Undo uses reversal, void, replacement, or other
compensating operations.

### 11.9 Robin-assisted Revenue action

```text
Eligible Revenue event or due action
→ durable Robin job
→ property configuration, Customer context, Knowledge Pack, and workflow version loaded
→ duplicate-action check
→ AI produces typed proposed tool action
→ Zod validates tool arguments
→ property capability, mode, consent, and business-hour checks
→ approval requested or approved action executed
→ normal Revenue application service performs mutation/provider call
→ Message/RevenueActivity, RobinRun, RobinAction, and audit evidence recorded
→ human handoff created when required
```

Robin exposes only already-implemented application services. It cannot fabricate
signature or Payment truth, set derived state directly, or own Conversation/Message.

### 11.10 Content creation and publication

```text
Content strategy brief
→ draft created
→ editor updates content
→ SEO/readiness checks
→ operator review
→ publication request
→ publishing adapter
→ PublicationRecord and published URL saved
→ content.published event
→ performance collection begins after data becomes available
```

A publishing adapter allows BTLS-built sites and supported external CMS targets to use different implementations without changing Smart Blog Studio workflows.

### 11.11 Website data ingestion

```text
Scheduled integration job
→ connection and credentials checked
→ provider adapter requests data
→ provider payload validated
→ source data normalized
→ pages discovered or reconciled
→ MetricSnapshots stored
→ DataHealthChecks updated
→ Finding evaluation job dispatched
```

### 11.12 Finding evaluation

```text
Normalized metrics
→ eligible FindingDefinitions selected
→ evidence minimums checked
→ rules evaluated
→ exclusions and data health checked
→ confidence and priority calculated
→ Finding created or updated
→ operator review queue refreshed
```

AI may explain a Finding, but deterministic application rules decide whether it activates.

### 11.13 Finding-to-work loop

```text
Finding detected
→ BTLS operator confirms, edits, defers, or dismisses
→ Work Package selected
→ WorkTicket created and assigned
→ work completed
→ Intervention records actual change
→ before period pinned
→ measurement window scheduled
→ after period evaluated
→ Finding resolved, monitored, or reopened
```

### 11.14 File upload

```text
User requests upload
→ session, property access, file intent, type, and size validated
→ server creates authorized storage path
→ signed upload granted
→ browser uploads directly to Supabase Storage
→ server finalizes MediaAsset metadata
→ asynchronous safety checks when required
```

---

### 11.15 Search Operations recurring fulfillment

```text
SearchProgram active
→ SearchFulfillmentCycle opens and snapshots policy requirements
→ required data-health/provider checks run
→ technical/rank/local evidence refreshes according to policy
→ SearchCoverageAssessment and Search Finding rules evaluate
→ existing Website/Content Findings are included
→ operator sees only material exceptions and opportunities
→ confirmed work uses shared WorkTicket
→ human work or guarded OptimizationAction executes
→ Intervention records what actually changed
→ cycle requirements become satisfied, waived, or blocked
→ SearchDeliverySummary proves fulfillment
→ MeasurementReview later evaluates performance outcome
```

### 11.16 Bounded Search optimization

```text
Approved Search work requests an action
→ site-management mode and SiteOptimizationAdapter capabilities resolve
→ operation allowlist and property policy are checked
→ input, conflict, and idempotency checks run
→ preview is generated where required
→ human approval occurs when required
→ adapter executes supported action
→ exact provider/result state is persisted
→ successful action creates or links an Intervention
→ verification and later measurement are scheduled
```

AI may propose content or action inputs but never authorizes the action.

---

## 12. Storage

The database owns file metadata and relationships. Supabase Storage owns file bytes.

| Bucket | Visibility | Path pattern | Contents |
|---|---|---|---|
| `public-media` | Public | `{propertyId}/{pathFamily}/{targetKey?}/{assetId}.{verifiedExtension}` | Server-owned public brand assets |
| `public-content` | Public | `{propertyId}/{pathFamily}/{targetKey?}/{assetId}.{verifiedExtension}` | Server-owned public content images |
| `private-media` | Private | `{propertyId}/{pathFamily}/{targetKey?}/{assetId}.{verifiedExtension}` | Attachments, signatures, commercial artifacts, evidence, and documents |
| `temporary-uploads` | Private | `{propertyId}/{pathFamily}/{targetKey?}/{assetId}.{verifiedExtension}` | Pending or temporary inputs eligible for expiry cleanup |

### Storage rules

- File paths always include the owning property.
- Every finalized file has a `MediaAsset` record.
- Private files require server-authorized signed access.
- Public status is an explicit application decision.
- Upload type, size, ownership, and intended use are validated before authorization.
- Storage authorization/finalization uses property scope plus server-owned purpose/target metadata; it does not require every future owning Revenue record to exist before upload begins.
- Finalized bytes are never overwritten in place. Replacement finalizes a new MediaAsset and later changes the owning relationship.
- Generic semantics distinguish public/private, temporary/durable, ordinary attachment, and durable evidence/generated document without one purpose value per Revenue noun.
- Removing a database relationship does not silently delete a reusable file.
- Feature 06 owns cleanup eligibility, deletion claims, tombstones, retry-safe physical deletion, and a bounded server-only maintenance entry point. Feature 07 later schedules that same service; owning features decide business retention.
- Published content should not depend on short-lived signed URLs.
- Private access remains compatible with property authorization plus owning-record authorization and short-lived signed delivery.
- Client users cannot list or access another property's paths.
- Shared MediaAsset supports future signatures, signed Estimate artifacts, customer/location/asset/job photos, ServiceIssue evidence, temporary capture audio, and commercial documents without prebuilding Revenue attachment models.

---

## 13. Integration Pattern

Each external provider follows the same boundary:

```text
Feature service
→ BTLS-owned provider interface
→ provider adapter
→ external SDK/API
→ validated provider response
→ BTLS-owned normalized result
```

### Example interface

```ts
export interface AnalyticsProvider {
  getPageMetrics(input: {
    externalPropertyId: string;
    startDate: string;
    endDate: string;
  }): Promise<NormalizedPageMetric[]>;
}
```

Feature code consumes `NormalizedPageMetric`, not a Google SDK response.

### Integration connection record

Every connection tracks:

- Property
- Provider
- External account/property identifier
- Connection status
- Granted scopes
- Last successful sync
- Last attempted sync
- Last error category
- Reauthorization requirement
- Token reference or encrypted credential reference

### Credentials

- OAuth and provider secrets are server-only.
- Tokens are encrypted at rest or stored through an approved secret mechanism.
- Tokens never enter client-rendered data.
- Refresh is handled inside the provider adapter.
- Disconnecting revokes or clears credentials and pauses dependent jobs.

### Communication and scheduling provider boundaries

- `EmailProvider` accepts a normalized shared `SendingIdentity`, display name, Reply-To, recipients, business correlation, and idempotency input. Postmark remains the outbound implementation.
- Sending modes are `BTLS_MANAGED`, `CUSTOM_DOMAIN`, and deferred `CONNECTED_MAILBOX`. `BTLS_MANAGED` uses a verified BTLS-owned From identity and may use a client's Gmail, Yahoo, or custom address as Reply-To.
- `SmsProvider` executes Customer/Contact messaging only after consent, property-number routing, and idempotency checks. Twilio remains the implementation.
- BTLS `Appointment` and `JobVisit` records are operational schedule truth. Cronofy supplies availability and external calendar projection/synchronization; provider failure never erases valid BTLS schedule state.

### Deferred Revenue capability interfaces

The architecture recognizes replaceable `PaymentProvider`, `AddressLookupProvider`, and
`TranscriptionProvider` boundaries without selecting vendors. Manual ServiceLocation
entry, manual/external Payment recording, and text Quick Capture remain complete paths.
Signature capture and commercial document generation do not require an external SaaS
provider.

### Search Operations provider interfaces

Search Operations uses BTLS-owned contracts for provider-intensive capabilities:

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

Provider SDK types remain inside integration adapters. Exact vendors remain deferred until the owning build feature unless already approved in `context/library-docs.md`.

### Provider failure rule

External systems are treated as delayed and unreliable. Adapters must handle timeouts, expired credentials, rate limits, partial data, missing fields, duplicate events, and provider outages.

---

## 14. Internal Events

Internal events decouple completed business facts from follow-on work.

Examples:

```text
customer.created
lead.created
lead.stage_changed
next_required_action.due
appointment.scheduled
estimate.revision_issued
estimate.accepted
job.work_completed
invoice.issued
payment.recorded
business_exception.opened
review_request.sent
quick_capture.applied

content.created
content.published
content.updated

integration.connected
integration.sync_completed
integration.sync_failed

metrics.normalized
finding.detected
finding.confirmed
finding.resolved

ticket.created
ticket.completed
intervention.recorded
measurement.review_due

robin.action_proposed
robin.action_completed
robin.action_failed
robin.handoff_requested
```

Search Operations event families include:

```text
search.program.created
search.program.activated
search.program.paused
search.target.created
search.target.updated
search.coverage.assessed
search.keyword_metrics.collected
search.organic_rank.completed
search.organic_rank.failed
search.local_grid.completed
search.local_grid.failed
search.inspection.completed
search.inspection.failed
search.audit.completed
search.audit.failed
search.cycle.opened
search.cycle.needs_attention
search.cycle.fulfilled
search.optimization.proposed
search.optimization.approved
search.optimization.executed
search.optimization.failed
search.optimization.reversed
search.delivery_summary.generated
search.delivery_summary.visible
search.fleet_remediation.started
search.fleet_remediation.completed
```

### Event rules

- Events describe something that happened; they are not commands disguised as events.
- Event payloads include `eventId`, `occurredAt`, `propertyId`, event version, and relevant subject IDs.
- Consumers are idempotent.
- Publishing an internal event does not replace the database transaction that created the source fact.
- Important provider work is dispatched to durable background jobs.

---

## 15. Background Processing

Inngest is the default MVP job and scheduling system.

Use background jobs for:

- GA4, Search Console, and GBP imports
- Data normalization
- Finding evaluation
- Content-performance calculations
- Robin acknowledgments and approved follow-ups
- Notification and Message delivery
- Estimate and Invoice delivery and signed-document generation
- External calendar projection/synchronization
- BusinessException evaluation
- Quick Capture extraction/transcription follow-on work
- ReviewRequest delivery
- Measurement reviews
- Webhook follow-on work
- Orphaned-file and temporary-upload cleanup
- Search keyword-metric refresh
- Organic rank refresh
- Local rank-grid refresh
- Site inspection and technical audit
- Search coverage/Finding evaluation
- Local/citation/backlink refresh according to policy
- Search fulfillment-cycle opening/evaluation
- Search program health read-model refresh
- Search delivery-summary generation
- Guarded optimization execution and verification
- Fleet remediation target verification
- Integration retries

### Job contract

Every job defines:

- Typed and validated payload
- `propertyId`
- Idempotency key
- Retry policy
- Maximum execution expectations
- Safe re-run behavior
- Logging context
- Failure/escalation behavior

### Request boundary

A web request may enqueue work but must not wait for long provider synchronization, AI processing, or bulk metric evaluation.

---

## 16. Website Intelligence Architecture

Website Intelligence owns:

- Data-source coordination for web-growth measurements
- URL normalization
- Website page discovery
- Broad page-role classification
- Metric calculation
- Data-health checks
- Website Finding rules
- Confidence and priority
- Operator-facing evidence

It does not own:

- General project management
- Content creation
- Lead lifecycle
- AI lead communication
- Work execution records

### Page roles

The MVP uses broad roles:

- Homepage
- Service page
- Location page
- Blog post
- Landing page
- Contact or booking page
- Other

Detailed DOM object mapping is outside the MVP.

### Finding rule

A Finding must preserve:

- Definition and version
- Subject and period
- Factual observed condition
- Evidence snapshot
- Exclusions considered
- Confidence
- Priority
- Recommended Work Package
- Operator review state

---

## 17. Smart Blog Studio Architecture

Smart Blog Studio owns:

- Content strategy brief
- Draft and editorial lifecycle
- SEO readiness checks
- Topic clusters
- Related service and money-page relationships
- Internal-link planning
- Media selection
- Publishing workflow
- Content Strategy Playbook

It does not own:

- Performance diagnosis
- Lead lifecycle
- Work-ticket measurement
- Raw provider integration clients

Content strategy data is durable and reused by Content Intelligence. It is entered once and not rebuilt as a separate funnel.

---

## 18. Content Intelligence Architecture

Content Intelligence owns:

- Article search and engagement metrics
- Article-to-service progression
- Topic-cluster performance
- Content-specific Finding rules
- Content scorecards
- Recommended content action

It reuses:

- Website Intelligence ingestion and normalized metric infrastructure
- Smart Blog Studio strategy records
- Command Center lead outcomes
- Shared Work Management

It does not duplicate integration connections, ticketing, or measurement infrastructure.

---

## 19. Revenue Operations Architecture

Revenue Operations is the service-business operating core for end customers,
opportunities, communication, scheduling, Estimates and acceptance, authorized field
work, Invoices and Payments, next work, operating exceptions, basic time tracking, and
bounded natural-language capture.

It owns:

```text
Customer / Contact
ServiceLocation / optional ServiceAsset
Lead
RevenueActivity / RevenueNote / Tags
Conversation / Message
RevenueOperationsSettings
EmployeeProfile / TimeEntry
Appointment
Pricebook / PricebookItem
AgreementTemplate
Estimate aggregate and customer access/acceptance evidence
Job / JobVisit / JobTask / ChangeOrder / ServiceIssue
Invoice / Payment
NextRequiredAction / AttentionFlag / BusinessException
ReviewRequest
QuickCaptureRun / QuickCaptureMutationProposal
```

It consumes rather than owns:

```text
ClientAccount / ClientProperty
AppUser / PropertyAccess / capabilities
PropertyService
BusinessLocation / ServiceArea
MediaAsset byte lifecycle
AuditEvent
Notification / WebhookReceipt / JobExecution
SendingIdentity and provider connections
Finding / WorkTicket / Intervention / MeasurementReview
```

### 19.1 Robust-underneath/simple-in-front contract

The first-class simple path is:

```text
Lead
→ Estimate
→ Start work
→ Work done
→ Record payment
→ Close
```

The user is not forced to manipulate the full entity graph.

- **Create Estimate** uses the known Customer, obvious/default Contact, and the only/default ServiceLocation when available. ServiceAsset and advanced fields remain optional. Approved Pricebook/agreement defaults may apply.
- **Start work** resolves or creates an authorized Job through a valid workflow, makes the consequential creation clear, and moves the Job to `IN_PROGRESS`. JobVisit is not required for simple work.
- **Work done** moves the Job to `WORK_COMPLETE` without mandatory photos, tasks, notes, assets, or a closeout wizard.
- **Record payment** creates a factual Payment; the application recalculates collected amount, remaining balance, and payment state.
- **Close** lets an authorized user move a work-complete Job to `CLOSED`.

ServiceLocation, ServiceAsset, Appointment, JobVisit, JobTask, files, detailed notes,
ChangeOrder, and ServiceIssue appear through defaults or progressive disclosure when
they are relevant. Issue, acceptance/signature, Invoice issue/void, Payment
record/reversal, external sends, and terminal closure remain explicit consequential
actions.

### 19.2 Customer, Contact, and Lead

```text
ClientAccount = the organization subscribing to BTLS
Customer      = that client's end customer
Contact       = one person associated with a Customer
Lead          = one commercial opportunity
```

Customer relationship state may move between `PROSPECT`, `CURRENT`, and `INACTIVE`; it
is not the sales pipeline.

Lead persists only sales-stage truth:

```text
NEW
→ CONTACTED
→ QUALIFIED
→ WON
```

or:

```text
NEW / CONTACTED / QUALIFIED
→ LOST
```

Estimate scheduling, Estimate delivery, next work, staleness, accepted-work scheduling,
Job progress, Invoice state, overdue state, and payment state belong to their source
domains. When acceptance is the business's winning event, the acceptance application
service may compositionally move a linked Lead to `WON`.

`RevenueActivity` is the chronological operating record across the Customer journey.
`RevenueNote` is human-authored internal context and never masquerades as a customer
Message. Current-catalog Tag definitions use explicit property-scoped assignments.

### 19.3 Conversation and Message

Canonical parentage is:

```text
Customer
└── Conversation
    ├── required primary Contact
    └── Message(s)
```

Rules:

- Customer is required.
- A persisted customer-facing MVP Conversation requires a primary Contact so consent and routing belong to an identified person and endpoint.
- Conversation is channel/route scoped, not a generic omnichannel container.
- Lead, Estimate, Appointment, Job, and Invoice never own Conversation.
- Robin never owns Conversation or Message.
- Optional operational context belongs on Message and/or RevenueActivity through real relationships where practical.
- A long-lived Customer/Contact SMS thread may span several opportunities and Jobs without reparenting.
- Twilio correlation uses the receiving property number plus normalized Contact phone.
- Unmatched inbound SMS preserves verified provider receipt evidence and enters bounded resolution; it does not guess Customer ownership.
- Outbound Postmark email may participate in Customer communication history. Inbound email synchronization, connected mailboxes, group threads, social channels, and a generic contact-center platform remain deferred.

Consent, opt-out, business hours, provider identifiers, delivery outcomes, and webhook
idempotency are durable application-service concerns shared by human and Robin sends.

### 19.4 Scheduling and time

```text
Appointment = sales, evaluation, or consultation event
Job         = authorized work
JobVisit    = one scheduled field-fulfillment visit
```

A schedule UI may combine Appointment and JobVisit while preserving their separate
domain meaning. Appointment owns its own `SCHEDULED / CONFIRMED / COMPLETED` lifecycle
with `CANCELLED / NO_SHOW` terminals. JobVisit owns `SCHEDULED / IN_PROGRESS /
COMPLETED` with `CANCELLED / NO_SHOW` alternatives.

BTLS Appointment and JobVisit records are operational schedule truth. Cronofy provides
availability and external projection/synchronization; a sync failure is visible but does
not delete or invalidate valid BTLS schedule state.

Basic TimeEntry belongs in Revenue Operations:

```text
clock in
→ OPEN
→ clock out
→ CLOSED
```

At most one open entry exists per EmployeeProfile unless a later explicit rule changes
that invariant. Employees manage their own current clock where authorized. Team history,
correction, and export require separate authority. A correction preserves actor, reason,
original value, and result. Time tracking excludes payroll, pay rates, withholding, PTO,
advanced overtime compliance, geofencing, and automatic payroll behavior.

### 19.5 Pricebook, Agreement, and Estimate

Pricebook is drafting productivity, not historical truth. `PropertyService` remains the
shared offered-service identity. PricebookItem may reference it and snapshots current
commercial content into EstimateLineItem.

```text
Estimate
→ EstimateRevision
   ├── EstimateLineItem snapshots
   └── EstimateAgreementSnapshot
→ EstimateDelivery
→ EstimateViewEvent
→ EstimateAcceptance
→ CustomerDocumentAccessGrant
```

Binding rules:

- Estimate is the stable commercial identity.
- Draft revisions are mutable; issued revisions are immutable; an accepted revision is terminal and immutable.
- A newly issued revision supersedes the prior issued revision without rewriting it.
- Pricebook or AgreementTemplate changes never alter historical Estimate content.
- Agreement content is snapshotted into the exact revision.
- Delivery is per attempt; sent/delivered summaries derive from EstimateDelivery evidence.
- A scoped, expiring/revocable CustomerDocumentAccessGrant authorizes public access. A route ID alone never does.
- Acceptance/signature binds the exact current revision and preserves signer/signature evidence.
- A superseded or stale revision cannot be signed as current.
- Signed artifacts and signature images use shared private MediaAsset. Artifact-generation failure does not erase authoritative database acceptance.
- The customer may view the Estimate, view the Agreement, and sign/accept. The customer cannot edit, comment, request a revision, or publicly reject in MVP.
- Employees control rejection and authorized salespeople control revisions.
- Material post-acceptance scope or price change uses an issued/accepted immutable ChangeOrder, not a rewrite of the accepted Estimate.

### 19.6 Job and field operations

Job owns authorized work and its provenance.

```text
AUTHORIZED
→ SCHEDULED
→ IN_PROGRESS
→ WORK_COMPLETE
→ CLOSED
```

Authorized cancellation may terminate appropriate pre-close states. Start Work, Work
Complete, and Close are business commands, not a generic status picker.

JobVisit is optional for simple same-day work. JobTask is a narrow service checklist and
never becomes shared growth/search Work Management. Customer/ServiceLocation,
assignments, ServiceAssets, notes, files/photos, ChangeOrders, and ServiceIssues remain
contextual unless the business fact requires them. ServiceIssue supports an
`OPEN → IN_PROGRESS → RESOLVED` path or a controlled `DISMISSED` outcome and may retain
shared MediaAsset evidence.

### 19.7 Invoice, Payment, and tax

BTLS owns operational financial truth:

```text
quoted value
accepted value
authorized Job value
Invoice amount
Payment facts
balance due
partial/paid/overdue state
collected revenue
```

BTLS does not own a general ledger, chart of accounts, bank reconciliation, payroll
accounting, tax accounting, or GAAP bookkeeping.

Invoice persists document truth:

```text
DRAFT
→ ISSUED
→ VOID
```

Issued Invoice line content is immutable. InvoiceDelivery is per-attempt evidence.
Payments record money actually received through cash, check, an external card processor,
externally handled ACH/bank transfer, or another factual method. Multiple Payments support
deposits and partial collection.

Derived payment state:

```text
net collected <= 0                 → UNPAID
0 < net collected < invoice total  → PARTIALLY_PAID
net collected >= invoice total     → PAID
```

Derived overdue:

```text
Invoice is ISSUED
AND dueAt is before now
AND remaining balance > 0
→ OVERDUE
```

Payment processing is optional. Core Invoice and Payment records do not require a
processor ID. PaymentSchedule is outside MVP; PaymentAttempt and provider-driven Refund
records remain deferred until an integrated PaymentProvider exists. Mistaken manual
Payments use explicit reversal/compensation, not deletion.

Tax is optional user-entered commercial information. BTLS accepts and snapshots the
input and performs decimal-safe arithmetic; it does not determine tax jurisdiction,
taxability, statutory rate, or compliance. No tax engine is part of MVP.

### 19.8 Operational attention

Keep these meanings separate:

```text
NextRequiredAction = what should happen next
AttentionFlag      = a contextual concern a human, rule, or AI wants noticed
BusinessException  = a deterministic operating rule condition currently or historically true
Finding            = Website/Content/Search evidence-backed growth diagnostic
```

NextRequiredAction supports `OPEN → COMPLETED / DISMISSED`, with at most one primary
open action per supported subject. AttentionFlag supports `OPEN → RESOLVED / DISMISSED`
and may be created manually. BusinessException refers to a stable versioned definition
and supports open, snooze, resolve, or dismiss behavior without erasing history.

Examples include Lead untouched, accepted Estimate unscheduled, Work Complete without an
Invoice, and Invoice overdue. Revenue Leak is a BusinessException rule family/category,
not a separate model. BusinessException never reuses shared growth Finding.

### 19.9 Quick Capture and derived assistance

Quick Capture is a Revenue Operations input workflow, not Robin:

```text
text / voice
→ transcription when required
→ structured extraction
→ typed source-mutation proposals
→ runtime, property, capability, and business validation
→ persisted confidence and before/after preview
→ proposal window always shown
→ explicit human confirmation
→ normal application services
→ audit, RevenueActivity, and events
```

There is no automatic Quick Capture mode. AI cannot set permission, fabricate signature
or Payment truth, call Prisma/providers directly, or write derived state.

Example input "Invoice partially paid $375. Parts ordered." proposes a $375 Payment and
a Job note. Domain logic derives the remaining balance and `PARTIALLY_PAID`; the proposal
does not write those fields.

Consequential Undo uses compensating business operations: reverse/correct Payment,
void/replace Invoice, supersede a commercial document, or append corrective history.
Externally sent communication cannot be made unsent.

Generated Job Brief is a derived, evidence-cited, non-authoritative projection from
trusted Revenue sources. It never becomes a competing Job record.

### 19.10 Revenue settings, sending identity, and review requests

RevenueOperationsSettings owns Revenue workflow defaults such as Pricebook/agreement
selection, review timing, and a reference to the default shared SendingIdentity. It does
not own provider credentials, sender verification, Twilio number mapping, or mailbox
OAuth.

Shared sending modes are:

```text
BTLS_MANAGED
CUSTOM_DOMAIN
CONNECTED_MAILBOX — deferred
```

The MVP-safe `BTLS_MANAGED` mode uses a verified BTLS-owned From identity with a visible
business display name and a client Gmail, Yahoo, or custom address as Reply-To. A client
is not forced to authenticate a consumer domain as a From domain.

ReviewRequest is a basic scheduled/sent/delivered post-work communication. It does not
gate Job completion, reopen operational truth, or become a reputation-management
platform.

### 19.11 Revenue attribution and reporting

The directional evidence chain is:

```text
website / content / search source evidence
→ Lead
→ Estimate
→ Job
→ Invoice
→ Payment
```

Collected Payment is confirmed operational revenue where evidence exists. Reporting and
adjacent studios may describe observed or assisted relationships with confidence language;
they must not claim unsupported individual or multi-touch causation.

---

## 20. Robin Architecture

Robin is a controlled application agent, not an autonomous database user.

Robin consumes the approved Customer/Contact/Lead/Conversation context and only the
Revenue application services that already exist. Robin supports:

- approved acknowledgment and communication;
- approved qualification and sales-stage updates;
- approved scheduling through Appointment services;
- approved next actions and follow-up;
- bounded Estimate/Job/Invoice/Payment assistance only after the owning service exists;
- human escalation;
- agent run/action records;
- automation outcome reporting.

Robin does not own Conversation, Message, Quick Capture, or any Revenue aggregate. It
cannot fabricate acceptance/signature or Payment truth, directly mutate derived state,
or invent tools for unfinished features.

### Modes

- **Off**
- **Approval Required**
- **Automatic**

Modes are property-scoped and capability-specific.

### Tool boundary

Robin can act only through typed tools that call normal application services.

```text
AI proposes tool call
→ tool arguments validated
→ property configuration checked
→ automation mode checked
→ duplicate/permission checks
→ application service executes
→ result and audit trail recorded
```

### Robin invariants

- No unrestricted Prisma client
- No direct SQL
- No raw provider credentials
- No action outside enabled property capabilities
- No automatic action when approval is required
- No unsupported claim presented as business fact
- Every material action is recorded
- Human handoff is available and explicit

---

## 20A. Search Operations Studio Architecture

Search Operations is the recurring organic-search fulfillment control plane. It consumes normalized web data and existing Intelligence Findings, owns search strategy/fulfillment-specific records and rules, and reuses Work Management for execution and measurement. The detailed domain rules below are canonical and were merged from the previously standalone Search Operations architecture.

### 3. Architecture Principles

#### 3.1 Page identity and SEO meaning are separate

`WebsitePage` remains the durable identity of a discovered URL.

Search Operations attaches semantic search strategy to a page through explicit related records.

Do not turn `WebsitePage` into a giant collection of nullable SEO fields.

#### 3.2 Facts, strategy, fulfillment, and outcomes are different

The architecture separates:

```text
Observed fact
→ strategic interpretation
→ selected work
→ actual intervention
→ measured outcome
```

Examples:

- "Position changed from 6 to 14" is evidence.
- "Ranking decline requires investigation" is a Finding.
- "Improve service-page internal support" is selected work.
- "Added links from three supporting articles" is an Intervention.
- "Ranking recovered to 7 after the measurement window" is a Measurement Review.

These records must not collapse into one mutable status.

#### 3.3 A search target is the strategic unit

Search Operations does not manage isolated keywords as the primary planning unit.

A `SearchTarget` represents the business/search objective being pursued and connects:

- a service or topic;
- optional geography;
- search intent;
- a keyword cluster;
- the preferred ranking asset;
- business priority;
- coverage assessments;
- ranking evidence;
- supporting pages;
- Findings and work.

#### 3.4 Keyword metrics are snapshots, not permanent keyword properties

Search volume, CPC, difficulty, ranking position, and SERP features change.

They must be stored as dated provider observations, not as timeless truth on `SearchKeyword`.

#### 3.5 "Money page" is a purpose, not a structural page type

A page has separate classifications for:

1. structural type;
2. strategic search purpose;
3. service assignments;
4. geographic assignments;
5. topic assignments;
6. search-target relationships.

A service page can be a money page. A location page can be a money page. A guide can be supporting content or, in unusual cases, a primary conversion asset.

#### 3.6 One canonical target page is preferred per search target

Each active SearchTarget should normally have at most one active `PRIMARY` target-page assignment.

The system may observe another page ranking instead.

That difference is useful evidence for:

- cannibalization;
- wrong-page ranking;
- target migration;
- content consolidation decisions.

#### 3.7 Coverage is derived evidence

`MISSING`, `WEAK`, `COVERED`, `STRONG`, `DECLINING`, and `CANNIBALIZED` are assessment results.

They are not manually maintained permanent states on pages or keywords.

#### 3.8 Findings remain the shared opportunity/problem record

Search Operations does not create a second durable `SearchOpportunity` task system.

Rule evaluation may create in-memory candidates, but durable actionable conditions become normal shared `Finding` records with Search Operations definitions and evidence.

#### 3.9 Work Management remains execution truth

Search Operations decides what recurring SEO conditions and priorities exist.

Work Management still owns:

```text
Finding
→ WorkPackageTemplate
→ WorkTicket
→ Intervention
→ MeasurementReview
```

#### 3.10 Fulfillment and performance are separate

A client cycle can be fulfilled because BTLS delivered the agreed work.

That does not mean rankings, leads, or revenue improved.

The system must be able to prove fulfillment immediately and performance only after sufficient evidence exists.

#### 3.11 Automatic execution is always guarded

There is no unguarded automatic website modification mode.

Search Operations uses:

```text
AUTO_GUARDED
APPROVAL_REQUIRED
HUMAN_ONLY
UNSUPPORTED
```

Even `AUTO_GUARDED` requires policy, capability, validation, idempotency, auditability, and a supported site.

#### 3.12 Cost is part of fulfillment architecture

A low-touch/high-volume service fails if provider costs scale unpredictably.

Provider-intensive operations must have:

- quotas;
- cadence;
- usage records;
- cost estimates;
- service-policy limits.

#### 3.13 Provider payloads never become product contracts

Rank tracking, geo-grid tracking, crawling, citation data, backlink data, PageSpeed, and call attribution use BTLS-owned normalized interfaces.

#### 3.14 Portfolio status is derived

"Healthy" is a rebuildable operator read model.

It is not a permanent business fact.

#### 3.15 Explainability is required

The system must answer:

- Why did this Finding exist?
- Why was this work prioritized?
- Why was this property marked Needs Attention?
- Why was an automatic action permitted?
- What changed?
- What evidence came afterward?

---

### 4. Ownership Matrix

| Domain concept | Owner | Search Operations behavior |
|---|---|---|
| `ClientProperty` | Shared property/tenancy | Consumes |
| `PropertyService` | Shared property knowledge | Consumes and may establish if not already normalized |
| `BusinessLocation` | Shared property knowledge | Consumes |
| `ServiceArea` | Shared property knowledge | Consumes |
| `IntegrationConnection` | Shared infrastructure | Consumes |
| `WebsitePage` | Website data foundation | Consumes |
| `MetricSnapshot` | Website data foundation | Consumes |
| `DataHealthCheck` | Website Intelligence/shared web data | Consumes |
| `ContentAsset` | Smart Blog Studio | Consumes |
| `ContentStrategy` | Smart Blog Studio | Consumes and links to SearchTarget |
| `TopicCluster` | Smart Blog Studio | Consumes; does not replace SearchTopic |
| `FindingDefinition` | Shared intelligence infrastructure | Adds Search Operations definitions |
| `Finding` / `FindingEvidence` | Shared intelligence infrastructure | Creates through shared engine |
| `WorkPackageTemplate` | Work Management | Adds Search Operations prescriptions |
| `WorkTicket` | Work Management | Creates through shared workflow |
| `Intervention` | Work Management | Links Search-specific scope |
| `MeasurementReview` | Work Management | Supplies Search evidence |
| Lead / Estimate / Job / Invoice / Payment | Revenue Operations | Reads authorized outcome evidence |
| SearchProgram | Search Operations | Owns |
| Search fulfillment policy | Search Operations | Owns |
| Page search semantics | Search Operations | Owns |
| SearchTopic | Search Operations | Owns |
| SearchKeyword / cluster | Search Operations | Owns |
| SearchTarget | Search Operations | Owns |
| Coverage assessment | Search Operations | Owns |
| Organic rank observations | Search Operations | Owns |
| Local rank-grid observations | Search Operations | Owns |
| Technical inspection/audit | Search Operations | Owns |
| Internal-link crawl graph | Search Operations | Owns normalized current graph |
| Local/citation/authority evidence | Search Operations | Owns normalized evidence |
| Fulfillment cycle | Search Operations | Owns |
| Search delivery proof | Search Operations | Owns |
| OptimizationAction | Search Operations | Owns |
| Fleet remediation | Search Operations platform operations | Owns |
| Search provider usage ledger | Search Operations | Owns |

---

### 5. Required Shared Property Vocabulary

Search Operations needs queryable canonical business facts.

The current system already refers to services and locations in Revenue Operations, Robin, and Smart Blog Studio. Search Operations must not create a fourth private copy.

If equivalent canonical models already exist at implementation time, reuse them.

If they do not exist, promote the following to shared property knowledge.

#### 5.1 PropertyService

```ts
interface PropertyService {
  id: string;
  propertyId: string;
  name: string;
  normalizedName: string;
  slug: string;
  parentServiceId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

Purpose:

- canonical service vocabulary;
- Revenue Operations service selection;
- Robin approved knowledge;
- Smart Blog relationships;
- SearchTarget service relationships.

Commercial SEO priority does **not** belong on `PropertyService`. It belongs to the SearchProgram strategy.

#### 5.2 BusinessLocation

Represents an actual business location that may correspond to a Google Business Profile location.

```ts
interface BusinessLocation {
  id: string;
  propertyId: string;
  name: string;
  addressLine1: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  isPrimary: boolean;
  isActive: boolean;
}
```

MVP UI may support one primary location while the data model allows more than one.

#### 5.3 ServiceArea

Represents a geographic market the business intends to serve or target.

```ts
type ServiceAreaType =
  | "CITY"
  | "COUNTY"
  | "POSTAL_CODE"
  | "REGION"
  | "CUSTOM";

interface ServiceArea {
  id: string;
  propertyId: string;
  type: ServiceAreaType;
  name: string;
  regionCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}
```

`BusinessLocation` and `ServiceArea` are not interchangeable.

A plumber may be physically located in Norfolk and intentionally target Chesapeake.

---

### 6. Domain Glossary

#### SearchProgram

One property's active recurring SEO fulfillment program.

#### SearchFulfillmentPolicyVersion

Versioned definition of what the program is expected to monitor or deliver and how frequently.

#### SearchAutomationPolicyVersion

Versioned property policy defining which operation classes may be automated and under which conditions.

#### SearchTopic

A Search Operations subject concept such as "tankless water heaters," "sewer line repair," or "bathroom refinishing."

It is not the same as a Smart Blog `TopicCluster`.

A `TopicCluster` organizes content production. A `SearchTopic` represents a search subject that may span existing pages, future pages, queries, and competitive evidence.

#### SearchKeyword

One normalized search query string and locale/language identity.

#### SearchKeywordCluster

A set of closely related queries that should normally be served by the same search intent and primary ranking asset.

#### SearchTarget

The strategic unit BTLS wants to win or defend.

Example:

```text
Service: Water Heater Repair
Area: Chesapeake
Intent: TRANSACTIONAL
Cluster: water heater repair Chesapeake variants
Primary target page: /water-heater-repair/chesapeake/
```

#### PageSearchProfile

Search-specific semantic classification attached one-to-one to a `WebsitePage`.

#### SearchCoverageAssessment

Versioned assessment of how well a SearchTarget is currently covered.

#### OrganicRankRun

One provider collection context for one or more tracked keywords.

#### OrganicRankObservation

One tracked entity's observed organic position for a keyword within an OrganicRankRun.

#### LocalRankGridRun

One geo-grid measurement for one keyword and business location.

#### LocalRankGridPoint

One coordinate and local-pack ranking observation inside the grid.

#### SiteInspectionRun

One normalized crawl/inspection collection.

#### PageTechnicalSnapshot

One page's technical state within a SiteInspectionRun.

#### SearchAuditRun

One versioned application of BTLS Search audit rules against normalized evidence.

#### SearchAuditCheckResult

One pass/warn/fail/not-applicable/unknown observation from an audit.

#### SearchFulfillmentCycle

One historical service-delivery period.

#### SearchCycleRequirement

One snapshotted obligation in a fulfillment cycle.

#### OptimizationAction

One proposed, approved, executed, failed, or reversed bounded change.

#### FleetRemediation

One BTLS-internal shared-platform root-cause fix affecting multiple managed properties.

#### SearchDeliverySummary

Client-safe proof of what was delivered during a cycle.

---

### 7. Core Entity Relationship Map

```text
ClientProperty
├── PropertyService
├── BusinessLocation
├── ServiceArea
├── WebsitePage
│   └── PageSearchProfile
│       ├── PageServiceAssignment
│       ├── PageLocationAssignment
│       └── PageTopicAssignment
│
├── SearchProgram
│   ├── SearchProgramServicePriority
│   ├── SearchProgramAreaPriority
│   ├── SearchFulfillmentPolicyVersion
│   ├── SearchAutomationPolicyVersion
│   └── SearchFulfillmentCycle
│       ├── SearchCycleRequirement
│       └── SearchDeliverySummary
│
├── SearchTopic
├── SearchKeyword
│   └── KeywordMetricSnapshot
├── SearchKeywordCluster
│   └── SearchKeywordClusterMember
├── SearchTarget
│   ├── SearchTargetPageAssignment
│   ├── SearchTargetSupport
│   ├── SearchCoverageAssessment
│   ├── OrganicRankObservation
│   ├── LocalRankGridRun
│   └── Findings
│
├── SearchCompetitor
├── SearchTrackedEntity
├── SiteInspectionRun
│   ├── PageTechnicalSnapshot
│   └── InternalLinkEdge current graph
├── SearchAuditRun
│   └── SearchAuditCheckResult
├── LocalPresenceSnapshot
├── ExternalListingObservation
├── AuthoritySnapshot
├── BacklinkObservation
├── SearchProviderUsageRecord
└── OptimizationAction

Finding
→ WorkTicket
→ Intervention
   └── SearchInterventionScope
→ MeasurementReview
```

---

### 8. Page and Content Taxonomy

The existing broad `WebsitePage` role is not enough for Search Operations.

Search Operations attaches a `PageSearchProfile`.

#### 8.1 Structural page type

Exactly one active structural type.

```ts
type SearchPageType =
  | "HOMEPAGE"
  | "SERVICE"
  | "LOCATION"
  | "SERVICE_LOCATION"
  | "ARTICLE"
  | "PILLAR_GUIDE"
  | "FAQ"
  | "CASE_STUDY"
  | "GALLERY"
  | "CONTACT_BOOKING"
  | "LANDING"
  | "ABOUT_TRUST"
  | "LEGAL"
  | "UTILITY"
  | "OTHER"
  | "UNKNOWN";
```

This answers:

> What kind of page is this structurally?

#### 8.2 Strategic page purpose

Exactly one primary purpose.

```ts
type SearchPagePurpose =
  | "MONEY"
  | "SUPPORTING"
  | "HUB"
  | "TRUST"
  | "NAVIGATION"
  | "UTILITY"
  | "NON_SEARCH"
  | "UNKNOWN";
```

This answers:

> What role should this page play in the search strategy?

Examples:

- `SERVICE + MONEY`
- `SERVICE_LOCATION + MONEY`
- `ARTICLE + SUPPORTING`
- `PILLAR_GUIDE + HUB`
- `CASE_STUDY + TRUST`
- `CONTACT_BOOKING + NAVIGATION`

#### 8.3 Indexing intent

```ts
type IndexingIntent =
  | "INDEX"
  | "NOINDEX"
  | "UNDECIDED";
```

This is desired state, not observed state.

Observed robots/indexability belongs to technical crawl evidence.

#### 8.4 PageSearchProfile

```ts
interface PageSearchProfile {
  id: string;
  propertyId: string;
  websitePageId: string;
  pageType: SearchPageType;
  purpose: SearchPagePurpose;
  indexingIntent: IndexingIntent;
  classificationSource: "MANUAL" | "RULE" | "AI_ASSISTED";
  classificationConfidence: "HIGH" | "MEDIUM" | "LOW" | null;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

AI may suggest classification. Low-confidence classification must not silently become strategic truth.

#### 8.5 Page assignments

Services, locations, and topics are many-to-many.

```ts
type AssignmentRole = "PRIMARY" | "SECONDARY";

PageServiceAssignment
- propertyId
- pageSearchProfileId
- serviceId
- role

PageLocationAssignment
- propertyId
- pageSearchProfileId
- serviceAreaId
- role

PageTopicAssignment
- propertyId
- pageSearchProfileId
- searchTopicId
- role
```

Rules:

- At most one active `PRIMARY` service assignment per page.
- At most one active `PRIMARY` location assignment per page.
- At most one active `PRIMARY` topic assignment per page.
- Multiple secondary assignments are allowed.
- Absence of a location is valid.
- A page can support multiple SearchTargets without pretending all are primary.

#### 8.6 Fields deliberately not stored on PageSearchProfile

Do not store:

- current rank;
- coverage state;
- SEO score;
- keyword volume;
- "authority score";
- performance status;
- recommended action.

Those are time-varying evidence or Findings.

---

### 9. Search Topic Model

```ts
interface SearchTopic {
  id: string;
  propertyId: string;
  name: string;
  normalizedName: string;
  parentTopicId: string | null;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}
```

A SearchTopic may:

- relate to one or more services;
- be used by many pages;
- be represented by many keyword clusters;
- map to one or more Smart Blog TopicClusters.

Do not create a universal internet taxonomy.

Topics are property-scoped because the useful vocabulary is business-specific.

---

### 10. Keyword Architecture

#### 10.1 SearchKeyword

```ts
interface SearchKeyword {
  id: string;
  propertyId: string;
  query: string;
  normalizedQuery: string;
  languageCode: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  discoverySource:
    | "MANUAL"
    | "SEARCH_CONSOLE"
    | "KEYWORD_PROVIDER"
    | "SERP_PROVIDER"
    | "AI_ASSISTED"
    | "IMPORT";
  discoveredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Unique identity should normally include:

```text
propertyId + normalizedQuery + languageCode
```

#### 10.2 Search intent

```ts
type SearchIntent =
  | "TRANSACTIONAL"
  | "COMMERCIAL"
  | "INFORMATIONAL"
  | "NAVIGATIONAL"
  | "MIXED"
  | "UNKNOWN";

type GeographicIntent =
  | "NONE"
  | "IMPLICIT_LOCAL"
  | "EXPLICIT_LOCAL"
  | "UNKNOWN";
```

Locality is not treated as a fifth general search intent.

#### 10.3 Keyword metrics

Do not store mutable provider metrics directly on SearchKeyword.

```ts
interface KeywordMetricSnapshot {
  id: string;
  propertyId: string;
  searchKeywordId: string;
  providerKey: string;
  capturedAt: Date;
  searchVolume: number | null;
  cpcMicros: bigint | null;
  difficulty: number | null;
  competitionLabel: string | null;
  providerMetrics: unknown | null;
}
```

`providerMetrics` is permitted only for non-canonical provider metadata.

The normalized columns are the values BTLS actually queries.

#### 10.4 Keyword clusters

```ts
interface SearchKeywordCluster {
  id: string;
  propertyId: string;
  name: string;
  intent: SearchIntent;
  geographicIntent: GeographicIntent;
  primaryKeywordId: string | null;
  status: "ACTIVE" | "ARCHIVED";
}
```

Membership:

```ts
type KeywordClusterRole =
  | "PRIMARY"
  | "VARIANT"
  | "QUESTION"
  | "SUPPORTING";

interface SearchKeywordClusterMember {
  clusterId: string;
  keywordId: string;
  role: KeywordClusterRole;
}
```

Rule:

A keyword may be researched in more than one grouping historically, but the active targeting strategy should not intentionally assign the same query to competing active SearchTargets without an explicit cannibalization exception.

---

### 11. Search Target Architecture

`SearchTarget` is the center of the Search Operations knowledge graph.

```ts
interface SearchTarget {
  id: string;
  propertyId: string;
  searchProgramId: string;
  serviceId: string | null;
  serviceAreaId: string | null;
  searchTopicId: string | null;
  keywordClusterId: string;
  intent: SearchIntent;
  geographicIntent: GeographicIntent;

  strategicPriority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  commercialImportance: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

  status: "ACTIVE" | "PAUSED" | "RETIRED";
  retiredReason: string | null;

  createdAt: Date;
  updatedAt: Date;
}
```

Requirements:

- A target must have a keyword cluster.
- A target should have at least one of `serviceId` or `searchTopicId`.
- Geography may be absent for non-local topics.
- Commercial importance is a human/business strategy input.
- Search volume does not define commercial importance.
- "Not worth targeting" is represented by retiring/rejecting a target or research decision, not by a coverage state.

#### 11.1 Target page assignment

Do not put a mutable `preferredPageId` directly on SearchTarget without history.

Use:

```ts
type TargetPageRole = "PRIMARY" | "SECONDARY";

interface SearchTargetPageAssignment {
  id: string;
  propertyId: string;
  searchTargetId: string;
  websitePageId: string;
  role: TargetPageRole;
  validFrom: Date;
  validTo: Date | null;
  reason: string | null;
}
```

Invariant:

- At most one active `PRIMARY` assignment per SearchTarget.
- A page may be the primary ranking asset for multiple closely related SearchTargets when explicitly intended.
- Historical assignments are retained so measurement can interpret page-target changes.

#### 11.2 Supporting authority relationship

```ts
type SearchSupportRole =
  | "CORE_SUPPORT"
  | "FAQ_SUPPORT"
  | "LOCAL_SUPPORT"
  | "PROOF_SUPPORT"
  | "REFERENCE_SUPPORT";

interface SearchTargetSupport {
  id: string;
  propertyId: string;
  searchTargetId: string;
  supportingPageId: string;
  role: SearchSupportRole;
  isPlanned: boolean;
  createdAt: Date;
}
```

This expresses intended authority support.

It is different from an actual hyperlink.

---

### 12. Search Program

#### 12.1 SearchProgram

```ts
type SearchProgramStatus =
  | "DRAFT"
  | "ONBOARDING"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED";

type SiteManagementMode =
  | "BTLS_MANAGED"
  | "SUPPORTED_EXTERNAL"
  | "MANUAL_EXTERNAL";

interface SearchProgram {
  id: string;
  propertyId: string;
  status: SearchProgramStatus;
  siteManagementMode: SiteManagementMode;
  fulfillmentPolicyVersionId: string;
  automationPolicyVersionId: string;
  activatedAt: Date | null;
  pausedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

SearchProgram owns fulfillment state.

It does not own:

- subscription billing;
- payment truth;
- business identity;
- provider credentials.

#### 12.2 Program priorities

Search priority belongs to the program, not the canonical business service record.

```text
SearchProgramServicePriority
- propertyId
- searchProgramId
- serviceId
- priority
- rationale

SearchProgramAreaPriority
- propertyId
- searchProgramId
- serviceAreaId
- priority
- rationale
```

These records allow a client to sell ten services while BTLS actively emphasizes three.

---

### 13. Fulfillment Policy and Client Scope

#### 13.1 SearchFulfillmentPolicyVersion

A versioned policy defines what a tier/program is owed.

Examples:

- technical audit cadence;
- keyword metric refresh cadence;
- organic rank checks;
- local rank grids;
- content opportunity evaluation;
- GBP/local checks;
- maximum tracked keywords;
- maximum grid size;
- crawl-page budget;
- supported competitor count;
- client summary cadence.

Do not hide the policy solely in code.

#### 13.2 Policy requirement definitions

```ts
interface SearchFulfillmentPolicyRequirement {
  id: string;
  policyVersionId: string;
  requirementKey: string;
  cadence: string;
  quantity: number | null;
  isRequired: boolean;
  configuration: unknown | null;
}
```

Use JSON only for versioned configuration that is not routinely relationally queried.

#### 13.3 Historical scope rule

A fulfillment cycle snapshots its requirements at opening.

Later changes to the client's service tier must not rewrite what BTLS owed in a prior month.

---

### 14. Market Coverage Architecture

Market coverage is evaluated at the `SearchTarget` level.

The system should not attempt to materialize the full Cartesian product of every service × location × topic × intent.

That would produce meaningless combinations.

Instead:

```text
Property strategy
→ candidate service/location/topic combinations
→ research
→ accepted SearchTargets
→ coverage evaluation
```

#### 14.1 Coverage states

```ts
type SearchCoverageState =
  | "MISSING"
  | "WEAK"
  | "COVERED"
  | "STRONG"
  | "DECLINING"
  | "CANNIBALIZED"
  | "INSUFFICIENT_DATA";
```

`OPPORTUNITY` is not a coverage state.

`UNRESEARCHED` is represented by absence of an assessment.

`NOT_WORTH_TARGETING` is a strategic decision, not coverage.

#### 14.2 SearchCoverageAssessment

```ts
interface SearchCoverageAssessment {
  id: string;
  propertyId: string;
  searchTargetId: string;
  ruleVersion: number;
  assessedAt: Date;
  state: SearchCoverageState;

  targetPageExists: boolean;
  targetPageIndexable: boolean | null;
  organicVisibilityBand: string | null;
  localVisibilityBand: string | null;
  supportingCoverageBand: string | null;
  internalLinkSupportBand: string | null;
  dataConfidence: "HIGH" | "MEDIUM" | "LOW";

  evidence: unknown;
}
```

The assessment is immutable historical evidence.

A current coverage view selects the latest eligible assessment.

#### 14.3 Coverage evaluation

Coverage may consider:

- target-page existence;
- intended indexability;
- observed indexability;
- target-page query/ranking evidence;
- supporting content;
- internal links;
- topical depth;
- local visibility where relevant;
- recent trend;
- wrong-page ranking/cannibalization.

Coverage does not pretend to compute a universal "SEO authority score."

---

### 15. Organic Ranking Architecture

Search Console average position and external point-in-time rank tracking are different evidence sources.

Do not mix them.

#### 15.1 SearchTrackedEntity

```ts
type TrackedEntityType = "SELF" | "COMPETITOR";

interface SearchTrackedEntity {
  id: string;
  propertyId: string;
  type: TrackedEntityType;
  name: string;
  domain: string | null;
  externalPlaceId: string | null;
  isActive: boolean;
}
```

Each property has one SELF tracked entity.

Competitors are deliberate, limited records, not an unlimited competitive-intelligence graph.

#### 15.2 OrganicRankRun

```ts
interface OrganicRankRun {
  id: string;
  propertyId: string;
  providerKey: string;
  serviceAreaId: string | null;
  languageCode: string;
  device: "DESKTOP" | "MOBILE";
  requestedDepth: number;
  capturedAt: Date;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
  idempotencyKey: string;
}
```

#### 15.3 OrganicRankObservation

```ts
interface OrganicRankObservation {
  id: string;
  propertyId: string;
  organicRankRunId: string;
  searchKeywordId: string;
  trackedEntityId: string;
  position: number | null;
  resultUrl: string | null;
  websitePageId: string | null;
  resultType: string | null;
  wasFound: boolean;
}
```

Uses:

- ranking history;
- near-page-one detection;
- wrong-page ranking;
- ranking decline;
- competitor context;
- before/after Intervention evidence.

---

### 16. Local Rank-Map Architecture

Geo-grid ranking is its own evidence system.

#### 16.1 LocalRankGridRun

```ts
interface LocalRankGridRun {
  id: string;
  propertyId: string;
  searchTargetId: string;
  searchKeywordId: string;
  businessLocationId: string;
  trackedEntityId: string;

  providerKey: string;
  centerLatitude: number;
  centerLongitude: number;
  gridWidth: number;
  gridHeight: number;
  radius: number;
  radiusUnit: "MILES" | "KILOMETERS";

  capturedAt: Date;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";

  averageRank: number | null;
  top3Share: number | null;
  top10Share: number | null;
  top20Share: number | null;
  visibilityShare: number | null;

  idempotencyKey: string;
}
```

Aggregate fields are stored because they are deterministic results of an immutable run and are heavily used in portfolio queries.

#### 16.2 LocalRankGridPoint

```ts
interface LocalRankGridPoint {
  id: string;
  propertyId: string;
  gridRunId: string;
  rowIndex: number;
  columnIndex: number;
  latitude: number;
  longitude: number;
  position: number | null;
  wasFound: boolean;
}
```

Optional competitor detail may be retained only when purchased and useful.

The MVP does not need to store every local SERP result.

#### 16.3 Comparison

The system supports:

- previous grid vs current grid;
- baseline grid vs post-intervention grid;
- coverage share change;
- weak geographic zones;
- local visibility decline;
- grid reliability/partial-state awareness.

---

### 17. Search Console Performance

Search Operations reuses normalized Search Console evidence from the Website Data Foundation.

Useful Search Operations signals include:

- query impressions;
- query clicks;
- CTR;
- average position;
- query-to-page relationship;
- query growth;
- query decline;
- new query emergence;
- high-impression/low-click opportunities;
- page-one proximity.

Search Operations must not create a duplicate Search Console ingestion pipeline.

It may create SearchKeywords or SearchTargets from reviewed Search Console discoveries.

---

### 18. Site Inspection Architecture

#### 18.1 Adapter

```ts
interface SiteInspectionAdapter {
  inspectSite(input: SiteInspectionInput): Promise<NormalizedSiteInspection>;
}
```

The exact crawler implementation is deferred.

Feature code never consumes crawler-vendor payloads directly.

#### 18.2 SiteInspectionRun

```ts
interface SiteInspectionRun {
  id: string;
  propertyId: string;
  providerKey: string;
  startedAt: Date;
  completedAt: Date | null;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
  requestedPageLimit: number;
  discoveredPageCount: number | null;
  inspectedPageCount: number | null;
  idempotencyKey: string;
}
```

#### 18.3 PageTechnicalSnapshot

Store normalized fields needed by approved rules.

```ts
interface PageTechnicalSnapshot {
  id: string;
  propertyId: string;
  siteInspectionRunId: string;
  websitePageId: string;

  httpStatus: number | null;
  indexable: boolean | null;
  robotsDirective: string | null;
  canonicalUrl: string | null;
  title: string | null;
  metaDescription: string | null;
  h1Count: number | null;
  crawlDepth: number | null;
  internalInlinkCount: number | null;
  internalOutlinkCount: number | null;
  structuredDataTypes: string[];
  sitemapIncluded: boolean | null;
  responseTimeMs: number | null;
}
```

Do not persist full HTML unless a specific future requirement justifies it.

#### 18.4 SSRF and crawl safety

Inspection must enforce:

- allowed root domain;
- URL normalization;
- no private-network fetching;
- redirect restrictions;
- crawl limits;
- timeouts;
- robots behavior;
- concurrency limits;
- content-type limits.

---

### 19. Internal Linking Architecture

There are two separate concepts:

1. intended search support;
2. observed hyperlinks.

`SearchTargetSupport` owns intended support.

`InternalLinkEdge` owns the current observed graph.

#### 19.1 InternalLinkEdge

```ts
type InternalLinkContext =
  | "CONTEXTUAL"
  | "NAVIGATION"
  | "FOOTER"
  | "BREADCRUMB"
  | "CTA"
  | "OTHER"
  | "UNKNOWN";

interface InternalLinkEdge {
  id: string;
  propertyId: string;
  sourcePageId: string;
  targetPageId: string;
  anchorText: string | null;
  context: InternalLinkContext;
  isFollow: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  isCurrent: boolean;
}
```

Do not retain a complete duplicate edge graph for every crawl.

Historical audit results preserve important past facts.

#### 19.2 Linking Findings

Rules may detect:

- orphaned target page;
- underlinked money page;
- support page missing expected target link;
- broken internal link;
- irrelevant/noisy repeated recommendation;
- excessive competing target paths.

Anchor-text suggestions may be AI-assisted but require rule validation and policy control before execution.

---

### 20. Technical SEO Audit Architecture

#### 20.1 SearchAuditRun

```ts
interface SearchAuditRun {
  id: string;
  propertyId: string;
  searchProgramId: string;
  fulfillmentCycleId: string | null;
  siteInspectionRunId: string | null;
  ruleSetVersion: number;
  startedAt: Date;
  completedAt: Date | null;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
}
```

#### 20.2 Check results

```ts
type SearchCheckResultState =
  | "PASS"
  | "WARNING"
  | "FAIL"
  | "OPPORTUNITY"
  | "NOT_APPLICABLE"
  | "UNKNOWN";

interface SearchAuditCheckResult {
  id: string;
  propertyId: string;
  searchAuditRunId: string;
  checkKey: string;
  ruleVersion: number;
  state: SearchCheckResultState;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;

  websitePageId: string | null;
  businessLocationId: string | null;
  searchTargetId: string | null;

  remediationType: string | null;
  automationClass: SearchExecutionClass | null;
  evidence: unknown;
}
```

#### 20.3 Initial rule families

- HTTP status
- redirects
- indexability
- robots directives
- sitemap inclusion
- canonical consistency
- title presence/duplication
- meta-description maintenance
- H1 presence/duplication
- structured-data expectation
- broken internal links
- orphan/underlinked pages
- crawl depth
- page performance evidence
- image metadata where useful
- conversion/tracking installation checks
- conflicting target pages

Technical observations do not automatically create duplicate tickets.

Rules evaluate existing open Findings before creating/updating a Finding.

---

### 21. Local SEO Architecture

Search Operations consumes normalized Google Business Profile data and augments it with local operational evidence.

#### 21.1 High-value recurring local signals

- GBP connection health;
- selected category consistency;
- core business-data consistency;
- review count/rating movement;
- unanswered-review queue where supported;
- local rank-grid movement;
- local competitor visibility;
- profile completeness issues;
- important business-data mismatch.

#### 21.2 Setup/foundation local work

- citation baseline;
- core NAP consistency;
- profile completeness;
- primary/secondary category review;
- primary service areas;
- initial local competitor set;
- initial rank grids.

These should not be regenerated as monthly busywork.

#### 21.3 LocalPresenceSnapshot

```ts
interface LocalPresenceSnapshot {
  id: string;
  propertyId: string;
  businessLocationId: string;
  providerKey: string;
  capturedAt: Date;

  reviewCount: number | null;
  averageRating: number | null;
  unansweredReviewCount: number | null;
  completenessState: string | null;
  primaryCategory: string | null;
  providerMetrics: unknown | null;
}
```

Canonical business name/address/phone should come from property knowledge, not from the snapshot.

---

### 22. Citation Architecture

Citations are supporting local authority/foundation evidence, not the core monthly SEO engine.

```ts
interface ExternalListingObservation {
  id: string;
  propertyId: string;
  businessLocationId: string;
  providerKey: string;
  directoryKey: string;
  listingUrl: string | null;
  status: "FOUND" | "MISSING" | "INCONSISTENT" | "UNKNOWN";
  nameMatch: boolean | null;
  addressMatch: boolean | null;
  phoneMatch: boolean | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
}
```

Use:

- onboarding baseline;
- important inconsistency Finding;
- post-fix verification;
- periodic low-frequency recheck.

Do not invent recurring citation tasks when nothing changed.

---

### 23. Backlink and External Authority Architecture

The MVP does not build an Ahrefs replacement.

Search Operations needs only enough evidence to support decisions.

#### 23.1 AuthoritySnapshot

```ts
interface AuthoritySnapshot {
  id: string;
  propertyId: string;
  trackedEntityId: string;
  providerKey: string;
  capturedAt: Date;
  referringDomainCount: number | null;
  backlinkCount: number | null;
  providerAuthorityMetric: number | null;
}
```

Provider authority metrics are labeled as provider metrics, not BTLS universal truth.

#### 23.2 BacklinkObservation

Track links when useful for new/lost monitoring.

```ts
interface BacklinkObservation {
  id: string;
  propertyId: string;
  providerKey: string;
  sourceDomain: string;
  sourceUrl: string;
  targetUrl: string;
  targetPageId: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  status: "ACTIVE" | "LOST";
  followType: string | null;
  importanceBand: "HIGH" | "NORMAL" | "LOW" | null;
}
```

Initial useful Findings:

- important backlink lost;
- content naturally earning authority;
- material referring-domain gap against selected competitor.

Automated link outreach is out of scope.

---

### 24. Opportunity Engine

Search opportunity/problem detection uses the existing shared Finding system.

There is no durable `SearchOpportunity` model unless implementation proves a need later.

#### 24.1 Evaluation flow

```text
Normalized evidence
→ Search rule selected
→ evidence minimum checked
→ exclusions checked
→ deterministic condition evaluated
→ priority factors evaluated
→ duplicate/cooldown checked
→ Finding created, updated, suppressed, or resolved
```

AI may:

- cluster candidate keywords;
- suggest page classification;
- summarize evidence;
- draft a plain-language explanation;
- suggest investigation areas.

AI may not be the sole trigger for a production Finding without deterministic evidence or operator review.

#### 24.2 Initial Search Finding families

##### Coverage

- search target missing ranking asset;
- weak target coverage;
- supporting coverage gap;
- geographic coverage gap;
- possible cannibalization;
- wrong page ranking.

##### Ranking

- near-page-one opportunity;
- meaningful organic decline;
- local grid decline;
- local visibility expansion;
- target gaining momentum;
- target absent from expected range.

##### Content/links

- underlinked money page;
- supporting article not connected to target;
- orphan search asset;
- content decay;
- hidden content winner;
- query-to-target mismatch.

##### Technical

- indexing blocker;
- canonical conflict;
- broken internal-link cluster;
- sitemap/robots conflict;
- technical template defect;
- page-performance concern;
- tracking/data failure.

##### Local

- GBP data inconsistency;
- review-response backlog where applicable;
- local visibility weakness;
- citation inconsistency.

##### Authority

- important backlink lost;
- authority-winning content;
- material competitor authority gap.

#### 24.3 Finding fingerprint

Every Search Finding definition must establish a stable fingerprint based on the minimum subject identity needed to prevent duplicates.

Example:

```text
definitionKey + propertyId + searchTargetId
```

or:

```text
definitionKey + propertyId + websitePageId + affectedField
```

---

### 25. Prioritization Engine

The operator should not receive a hundred equally urgent SEO tasks.

Search Operations uses deterministic priority factors, but the UI should show reasons rather than pretend the score is scientific.

#### 25.1 Priority factors

1. **Blocker severity**
   - Is important search visibility impossible or materially impaired?

2. **Commercial importance**
   - How important is the related service to the client?

3. **Strategic market importance**
   - Is this a priority service area?

4. **Opportunity proximity**
   - Near win, large gap, decline, maintenance, or speculative?

5. **Evidence confidence**
   - Is the evidence complete and recent?

6. **Observed demand**
   - Search Console demand and/or keyword provider evidence.

7. **Business outcome evidence**
   - Does this page/target already produce qualified leads or revenue?

8. **Estimated effort**
   - Small fix, moderate work, strategic build, unknown.

9. **Recency/cooldown**
   - Was the same issue just addressed?

10. **Client/operator override**
   - Explicit human priority wins.

#### 25.2 Output

Use:

```ts
type SearchPriorityBand =
  | "URGENT"
  | "HIGH"
  | "NORMAL"
  | "LOW";
```

An internal numeric sort value may be used to order a queue, but the evidence record must preserve the factor breakdown.

Do not expose an unexplained "87/100 SEO opportunity score" to clients.

---

### 26. Work Management Integration

Search Operations reuses shared Work Management.

#### 26.1 Flow

```text
Search Finding
→ operator confirms
→ Search WorkPackageTemplate selected
→ WorkTicket
→ work performed
→ Intervention
→ SearchInterventionScope
→ MeasurementReview
```

#### 26.2 SearchInterventionScope

An SEO Intervention may affect more than one search subject.

```ts
interface SearchInterventionScope {
  id: string;
  propertyId: string;
  interventionId: string;
  searchTargetId: string | null;
  websitePageId: string | null;
  searchKeywordId: string | null;
  serviceAreaId: string | null;
}
```

This does not replace Intervention.

It tells Search Operations which evidence to evaluate afterward.

#### 26.3 Work package examples

- Improve near-page-one target
- Build missing service/location asset
- Refresh declining target page
- Strengthen internal support
- Correct indexability blocker
- Repair technical page issue
- Resolve cannibalization
- Improve GBP/local presence
- Investigate rank decline
- Restore important lost link
- Publish supporting content

---

### 27. Smart Blog Studio Integration

Search Operations does not own the editor.

When a Search Finding requires content:

```text
SearchTarget
→ Finding
→ WorkTicket
→ create/update ContentStrategy
→ ContentAsset
→ Smart Blog editorial workflow
→ PublicationRecord
→ Intervention
→ later Search/Content measurement
```

Smart Blog strategy should be able to reference:

- SearchTarget;
- SearchTopic;
- related PropertyService;
- related ServiceArea;
- target money page.

Search Operations must not mass-generate service/location pages without deliberate human strategy.

---

### 28. Content Intelligence Integration

Content Intelligence remains responsible for evaluating how published content performs.

Search Operations consumes Content Findings such as:

- content losing momentum;
- informational dead end;
- hidden winner;
- topic cluster gaining momentum;
- topic cluster missing commercial support.

Search Operations may use these Findings when deciding what is most important within a fulfillment cycle.

It does not reimplement article scorecards.

---

### 29. Website Intelligence Integration

Website Intelligence remains responsible for broad web performance diagnosis and shared normalized analytics.

Search Operations consumes:

- Search Console/GA4/GBP normalized metrics;
- DataHealthCheck;
- Website Findings;
- WebsitePage inventory;
- commercial-action evidence.

Search Operations adds search-specific strategy and recurring fulfillment behavior.

---

### 30. Revenue Operations Integration

Revenue Operations remains the source of truth for:

- Lead source, landing page, qualification, and won/lost outcome;
- Estimate issue, delivery, and acceptance;
- authorized Job and fulfillment state;
- Invoice document truth;
- Payment and collected revenue.

Search Operations may calculate evidence such as:

```text
organic/local attributed Leads
qualified organic/local Leads
accepted Estimates or authorized Jobs where defensible
collected Payment revenue from attributable Leads
```

Search consumes these outcomes and never owns Revenue records. Do not claim exact SEO
causation when attribution is incomplete; use confidence language.

---

### 31. Fulfillment Cycle Architecture

#### 31.1 SearchFulfillmentCycle

```ts
type SearchCycleStatus =
  | "PLANNED"
  | "RUNNING"
  | "NEEDS_ATTENTION"
  | "AWAITING_APPROVAL"
  | "BLOCKED"
  | "FULFILLED"
  | "CLOSED";

interface SearchFulfillmentCycle {
  id: string;
  propertyId: string;
  searchProgramId: string;
  policyVersionId: string;
  periodStart: Date;
  periodEnd: Date;
  status: SearchCycleStatus;
  openedAt: Date;
  fulfilledAt: Date | null;
  closedAt: Date | null;
}
```

#### 31.2 SearchCycleRequirement

```ts
type SearchRequirementStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SATISFIED"
  | "WAIVED"
  | "BLOCKED";

interface SearchCycleRequirement {
  id: string;
  propertyId: string;
  fulfillmentCycleId: string;
  requirementKey: string;
  expectedQuantity: number | null;
  completedQuantity: number;
  status: SearchRequirementStatus;
  waiverReason: string | null;
  satisfiedAt: Date | null;
}
```

Requirements are historical snapshots.

#### 31.3 Cycle flow

```text
Cycle opens
→ policy requirements snapshotted
→ data-health checks run
→ technical/site audit runs if due
→ keyword metrics refresh if due
→ organic ranks refresh if due
→ local grids refresh if due
→ coverage assessed
→ local presence checked
→ existing Website/Content/Search Findings evaluated
→ highest-value work selected
→ safe routine actions may execute
→ strategic work enters operator/approval queue
→ WorkTickets complete
→ Interventions recorded
→ requirements satisfied or explicitly waived
→ SearchDeliverySummary generated
→ cycle becomes FULFILLED
→ later MeasurementReviews continue
→ cycle may be CLOSED
```

#### 31.4 What blocks fulfillment

Examples:

- required audit never ran;
- required data collection failed and was not waived;
- required work remains incomplete;
- required client approval remains pending;
- cycle has an unresolved execution failure for required scope.

#### 31.5 What does not automatically block fulfillment

Examples:

- ranking did not improve;
- search volume fell;
- an optional opportunity was deferred;
- a Measurement Review is still waiting for enough data;
- a non-required low-priority Finding remains open.

---

### 32. Program Health and Portfolio Read Model

`Healthy` is derived operational state.

```ts
type SearchProgramHealth =
  | "HEALTHY"
  | "NEEDS_ATTENTION"
  | "BLOCKED"
  | "PAUSED";
```

A rebuildable `SearchProgramHealthSnapshot` may be persisted for fast portfolio queries.

Possible reason keys:

- REQUIRED_WORK_DUE
- APPROVAL_WAITING
- AUDIT_FAILED
- RANK_REFRESH_FAILED
- LOCAL_GRID_FAILED
- INTEGRATION_UNHEALTHY
- HIGH_PRIORITY_FINDING
- AUTOMATION_FAILED
- CYCLE_OVERDUE
- DATA_INSUFFICIENT

"Healthy" means no material operational exception.

It does not mean "SEO is succeeding."

---

### 33. Client Delivery Proof

#### 33.1 SearchDeliverySummary

```ts
interface SearchDeliverySummary {
  id: string;
  propertyId: string;
  fulfillmentCycleId: string;
  status: "DRAFT" | "APPROVED" | "VISIBLE";
  generatedAt: Date;
  approvedAt: Date | null;
  approvedByUserId: string | null;
  operatorCommentary: string | null;
  summaryPayload: unknown;
}
```

The generated summary should be derived from durable records.

Client-safe output may include:

- work completed;
- technical issues fixed;
- pages/content published or improved;
- local actions completed;
- visibility gains;
- visibility declines;
- organic/local leads where defensible;
- measurement results;
- next work.

Do not fill the report with provider metrics merely because they exist.

---

### 34. Automation Policy

#### 34.1 Execution classes

```ts
type SearchExecutionClass =
  | "AUTO_GUARDED"
  | "APPROVAL_REQUIRED"
  | "HUMAN_ONLY"
  | "UNSUPPORTED";
```

There is no unguarded automatic mode.

#### 34.2 Automatic eligibility

An action may be `AUTO_GUARDED` only if:

- site is `BTLS_MANAGED`;
- operation key is explicitly allowlisted;
- current property automation policy allows it;
- inputs are validated;
- expected change is deterministic;
- action is idempotent;
- change is traceable;
- rollback/reversal exists where risk requires it;
- no human strategy decision is required;
- no conflicting open action exists;
- policy version is recorded.

#### 34.3 Actions requiring human control

Always human-controlled or approval-required:

- new service page decision;
- new location page decision;
- major page restructuring;
- deleting or consolidating content;
- changing core business claims;
- publishing AI-generated customer-facing content;
- competitive strategy;
- backlink outreach;
- uncertain technical diagnosis;
- unsupported external-site changes;
- changes with material conversion/business risk.

---

### 35. OptimizationAction

```ts
type OptimizationActionStatus =
  | "PROPOSED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED"
  | "CANCELLED";

interface OptimizationAction {
  id: string;
  propertyId: string;
  searchProgramId: string;
  workTicketId: string | null;

  operationKey: string;
  executionClass: SearchExecutionClass;
  status: OptimizationActionStatus;

  targetType: string;
  targetId: string;
  policyVersionId: string;
  capabilitySnapshot: unknown;
  proposedChange: unknown;
  preview: unknown | null;
  executedChange: unknown | null;

  idempotencyKey: string;
  approvedByUserId: string | null;
  approvedAt: Date | null;
  executedAt: Date | null;
  reversalReference: string | null;
  failureCode: string | null;
}
```

Successful execution must create or link to an `Intervention`.

AI never calls the site adapter directly.

---

### 36. Site Optimization Adapter

```ts
interface SiteOptimizationAdapter {
  getCapabilities(input: {
    propertyId: string;
  }): Promise<SiteOptimizationCapability[]>;

  previewAction(
    input: PreviewOptimizationActionInput,
  ): Promise<OptimizationPreview>;

  executeAction(
    input: ExecuteOptimizationActionInput,
  ): Promise<OptimizationExecutionResult>;

  rollbackAction?(
    input: RollbackOptimizationActionInput,
  ): Promise<OptimizationExecutionResult>;
}
```

#### 36.1 Capability examples

Potential capability keys:

- `metadata.update`
- `schema.sync`
- `internal_link.add`
- `internal_link.remove`
- `redirect.upsert`
- `sitemap.refresh`
- `canonical.update`
- `image_alt.update`

The approved allowlist is established during the implementation feature.

A capability existing does not mean automatic execution is permitted.

Capability and policy must both allow it.

---

### 37. Managed-Site Leverage

BTLS-managed websites can expose standardized semantic capabilities.

Search Operations should interact with the site through stable application interfaces rather than editing framework files directly.

Benefits:

- consistent metadata;
- consistent schema;
- consistent internal-link operations;
- predictable sitemaps;
- predictable canonical behavior;
- safer rollbacks;
- repeatable validation.

This is the primary execution leverage unavailable on arbitrary external sites.

---

### 38. Fleet Remediation

Fleet remediation handles a shared BTLS platform defect that affects many client properties.

Example:

```text
Audit rule detects schema defect
→ same implementation fingerprint appears on 32 managed sites
→ BTLS operator confirms shared root cause
→ FleetRemediation created
→ shared platform fix deployed once
→ affected properties revalidated
→ one property-specific Intervention recorded per affected property
→ individual measurement/fulfillment records remain property-scoped
```

#### 38.1 FleetRemediation

Cross-property, BTLS-internal record:

```ts
interface FleetRemediation {
  id: string;
  rootCauseKey: string;
  title: string;
  status:
    | "PROPOSED"
    | "APPROVED"
    | "DEPLOYING"
    | "VERIFYING"
    | "COMPLETED"
    | "FAILED";
  sharedFixReference: string | null;
  createdByUserId: string;
  createdAt: Date;
}
```

#### 38.2 FleetRemediationTarget

```ts
interface FleetRemediationTarget {
  id: string;
  fleetRemediationId: string;
  propertyId: string;
  affectedSubjectId: string | null;
  verificationStatus: string;
  interventionId: string | null;
}
```

Only BTLS platform capabilities may access the cross-property root record.

Client users see only their property-specific Intervention where appropriate.

---

### 39. External Site Fallback

#### BTLS_MANAGED

- richest capability set;
- guarded automatic actions may be available;
- direct verification possible.

#### SUPPORTED_EXTERNAL

- only adapter-declared operations are available;
- default execution class is Approval Required unless explicitly approved otherwise;
- WordPress native-post publishing remains a separate Smart Blog capability.

#### MANUAL_EXTERNAL

Search Operations still:

- crawls where permitted;
- collects rankings;
- evaluates coverage;
- creates Findings;
- creates WorkTickets;
- records manual Interventions;
- measures outcomes.

It does not attempt direct modification.

---

### 40. Provider Adapter Boundaries

Search Operations may require these BTLS-owned interfaces:

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

Existing Google providers remain shared.

#### Normalization rule

Provider adapters return BTLS types.

Example:

```ts
interface OrganicRankProvider {
  collectRankings(
    input: OrganicRankRequest,
  ): Promise<NormalizedOrganicRankResult>;
}
```

Feature code must not import third-party SDK result types.

#### Provider selection

Exact vendors are deferred unless already approved in `library-docs.md`.

Provider choice may vary by capability.

---

### 41. Provider Usage and Cost Control

#### 41.1 SearchProviderUsageRecord

```ts
interface SearchProviderUsageRecord {
  id: string;
  propertyId: string;
  searchProgramId: string;
  providerKey: string;
  capabilityKey: string;
  occurredAt: Date;
  unitType: string;
  unitCount: number;
  estimatedCostCents: number | null;
  jobExecutionId: string | null;
}
```

#### 41.2 Program budget controls

Policy may limit:

- tracked keyword count;
- keyword refresh frequency;
- organic rank locations;
- geo-grid size;
- geo-grid frequency;
- crawl page count;
- crawl frequency;
- competitor count;
- backlink refresh frequency;
- citation refresh frequency;
- retention class.

#### 41.3 Budget behavior

When a quota would be exceeded:

```text
job evaluates budget
→ required versus optional work determined
→ optional provider call deferred or batched
→ reason recorded
→ required work creates operator/system alert if it cannot run
```

Do not silently exceed the client/program operating budget.

---

### 42. Measurement Architecture

Search Operations supplies Search evidence to shared `MeasurementReview`.

#### 42.1 Measurement chain

```text
Search Finding
→ WorkTicket
→ Intervention
→ SearchInterventionScope
→ waiting window
→ fresh ranking/local/traffic evidence
→ Revenue Operations outcomes where available
→ MeasurementReview
```

#### 42.2 Evidence classes

##### Search visibility

- organic rank;
- local grid visibility;
- Search Console impressions;
- Search Console clicks;
- CTR;
- ranking-page alignment.

##### Website behavior

- organic landing sessions;
- commercial actions;
- service-page progression.

##### Business outcomes

- organic/local Leads and qualification;
- accepted Estimates or authorized Jobs where evidence supports the relationship;
- issued Invoices where useful;
- collected Payments/revenue.

#### 42.3 Causation language

Allowed:

- "followed by";
- "improved after";
- "associated with";
- "organic leads increased during the review period";
- "evidence is consistent with improvement."

Avoid unsupported:

- "this change caused $8,000 revenue";
- "this article generated every assisted sale."

#### 42.4 Measurement windows

The Work Package or Finding definition may recommend a minimum window.

The review begins only when:

- enough post-intervention time has passed;
- required providers are healthy;
- minimum evidence exists.

Otherwise result is:

```text
INCONCLUSIVE
INSUFFICIENT_DATA
```

---

### 43. Portfolio Operations

The primary operator experience is exception-first.

Example:

```text
100 Active Search Programs

67 Healthy
14 Need Content Decision
7 Technical Issues
5 Ranking Declines
3 Awaiting Approval
2 Failed Data Connections
1 Failed Automation
1 Major Growth Opportunity
```

#### 43.1 Portfolio queries

Must support:

- health state;
- health reasons;
- current cycle state;
- overdue requirements;
- high-priority Findings;
- approval backlog;
- provider failures;
- execution failures;
- measurement due;
- operator assignment;
- program tier/policy;
- cost/usage pressure.

#### 43.2 Read model

A derived `SearchProgramHealthSnapshot` or equivalent materialized read model may be persisted.

It must be rebuildable from source records.

Do not make portfolio status the only source of truth.

---

### 44. Events

Candidate events:

```text
search.program.created
search.program.activated
search.program.paused

search.target.created
search.target.updated

search.coverage.assessed

search.keyword_metrics.collected
search.organic_rank.completed
search.organic_rank.failed
search.local_grid.completed
search.local_grid.failed

search.inspection.completed
search.inspection.failed
search.audit.completed
search.audit.failed

search.cycle.opened
search.cycle.needs_attention
search.cycle.fulfilled

search.optimization.proposed
search.optimization.approved
search.optimization.executed
search.optimization.failed
search.optimization.reversed

search.delivery_summary.generated
search.delivery_summary.visible

search.fleet_remediation.started
search.fleet_remediation.completed
```

All internal events follow existing BTLS event rules:

- `eventId`;
- `occurredAt`;
- `propertyId` when property-scoped;
- version;
- subject IDs;
- idempotent consumers.

Fleet root events are platform-scoped and may fan out to property-scoped verification jobs.

---

### 45. Background Jobs

Use Inngest for:

- keyword metric refresh;
- organic rank refresh;
- local grid refresh;
- site crawl/inspection;
- PageSpeed collection;
- technical audit evaluation;
- local presence refresh;
- citation refresh;
- backlink refresh;
- coverage assessment;
- Finding evaluation;
- fulfillment-cycle opening;
- fulfillment-cycle evaluation;
- health read-model refresh;
- delivery-summary generation;
- optimization execution;
- optimization verification;
- fleet verification;
- Measurement Review scheduling;
- provider reconciliation;
- retry/backfill.

Every job must carry property scope except explicit BTLS platform fleet coordination.

---

### 46. Permissions

Suggested capabilities:

```text
search.program.view
search.program.manage

search.strategy.view
search.strategy.manage

search.audit.view
search.audit.run

search.ranking.view
search.ranking.manage

search.finding.review

search.optimization.view
search.optimization.approve
search.optimization.execute

search.delivery.view
search.delivery.approve

search.portfolio.view

search.fleet.manage
```

Rules:

- client users receive only explicitly granted property capabilities;
- cross-property portfolio access requires BTLS platform capability;
- fleet remediation requires platform-level capability;
- `search.optimization.execute` does not bypass automation policy;
- browser UI visibility never replaces service authorization.

---

### 47. Multi-Tenancy and RLS

Every tenant-owned Search Operations table includes direct `propertyId` unless the record is immutable global reference data.

Examples requiring direct property scope:

- SearchProgram
- SearchTarget
- SearchKeyword
- SearchKeywordCluster
- PageSearchProfile
- rank runs/observations
- local grids/points
- audit runs/results
- cycle/requirements
- OptimizationAction
- provider usage
- delivery summary.

Global/versioned reference data may include:

- approved audit rule definitions;
- WorkPackage templates;
- global fulfillment policy templates;
- global automation operation definitions.

Cross-property `FleetRemediation` is BTLS-internal and must not be exposed through normal client property queries.

RLS tests must prove cross-property denial.

---

### 48. Observability

Structured logs include:

- propertyId;
- searchProgramId;
- fulfillmentCycleId where relevant;
- jobExecutionId;
- provider;
- capability;
- operation;
- result;
- safe failure category.

Operational alerts include:

- repeated rank-provider failure;
- repeated local-grid failure;
- crawl failure;
- audit failure;
- expired/revoked integration;
- cycle overdue;
- required cycle requirement blocked;
- unexpected provider-cost spike;
- optimization failure;
- rollback failure;
- fleet verification failure.

Audit events include:

- SearchProgram activation/pause;
- strategy priority changes;
- target-page reassignment;
- manual page classification changes;
- automation-policy changes;
- action approval/rejection;
- automatic action execution;
- delivery-summary approval;
- fleet remediation approval.

---

### 49. Failure Modes

#### Missing provider data

- mark evidence unavailable;
- lower confidence;
- do not invent a Finding;
- mark required fulfillment requirement blocked if necessary.

#### Partial crawl

- audit run becomes PARTIAL;
- rules requiring complete crawl do not claim PASS;
- affected checks become UNKNOWN where necessary.

#### Rank provider outage

- retain prior evidence;
- do not treat absence as ranking loss;
- retry;
- show collection failure.

#### Target page removed

- preserve historical assignment;
- create evidence-backed Finding if active target now lacks an appropriate page.

#### Keyword cluster changed

- version/record strategy change;
- do not rewrite old ranking observations.

#### Integration disconnected

- pause dependent jobs;
- health status becomes attention/blocking according to program requirement.

#### Automatic action fails

- OptimizationAction becomes FAILED;
- no Intervention claims success;
- required cycle work may become blocked;
- operator receives recovery path.

#### Rollback fails

- escalate as high-risk operational failure;
- preserve both original and rollback provider results;
- require human resolution.

---

### 50. Idempotency

Stable idempotency keys are required for:

- provider collection runs;
- cycle opening;
- audit evaluation;
- Finding generation;
- scheduled delivery-summary generation;
- OptimizationAction execution;
- provider webhooks if any;
- fleet target verification.

Examples:

```text
organic-rank:{propertyId}:{policyPeriod}:{contextHash}
local-grid:{propertyId}:{keywordId}:{businessLocationId}:{period}:{gridHash}
search-cycle:{searchProgramId}:{periodStart}:{periodEnd}
optimization:{propertyId}:{operationKey}:{targetId}:{changeHash}
```

Idempotency prevents duplicate effects, not merely duplicate UI rows.

---

### 51. Data Retention

Retention classes:

#### Durable strategy/history

Retain while the property is active and according to account-retention policy:

- SearchProgram;
- SearchTarget;
- target-page assignment history;
- Findings;
- WorkTickets;
- Interventions;
- MeasurementReviews;
- delivery summaries;
- audit decision history.

#### Time-series evidence

Retention may be tier/configuration dependent:

- keyword metric snapshots;
- organic rank observations;
- geo-grid points;
- authority snapshots;
- local presence snapshots.

Keep longer-lived aggregates if raw high-volume detail is pruned.

#### Current graph/evidence

Maintain current state with historical decision evidence:

- InternalLinkEdge;
- ExternalListingObservation;
- BacklinkObservation.

Exact retention durations remain a parent architecture deferred decision.

Deletion must follow property/account data-deletion rules.

---

### 52. Scaling Model

Architecture should support:

```text
10 → 50 → 100 → 500 properties
```

without changing core domain ownership.

Scaling mechanisms:

- scheduled job staggering;
- provider-specific concurrency;
- per-program quotas;
- batched provider requests;
- immutable snapshot indexes;
- partition-friendly timestamps if later required;
- current-state read models;
- pagination;
- partial refresh;
- cooldowns;
- no full-portfolio synchronous page request;
- no automatic competitor expansion;
- no full historical crawl graph duplication.

Do not add distributed-systems complexity before measurements require it.

---

### 53. Folder and Code Placement

Add:

```text
context/
└── search-operations/
    ├── architecture.md
    └── build-plan.md

src/
├── app/
│   └── (dashboard)/
│       └── [propertyId]/
│           └── search-operations/
│               ├── page.tsx
│               ├── targets/
│               ├── rankings/
│               ├── audits/
│               ├── cycles/
│               └── actions/
│
├── features/
│   └── search-operations/
│       ├── components/
│       ├── actions/
│       ├── queries/
│       ├── schemas/
│       ├── services/
│       ├── strategy/
│       ├── coverage/
│       ├── rankings/
│       ├── audits/
│       ├── local/
│       ├── linking/
│       ├── fulfillment/
│       ├── optimization/
│       ├── measurement/
│       ├── types/
│       └── tests/
│
└── server/
    └── integrations/
        ├── keyword-metrics/
        ├── organic-rank/
        ├── local-rank-grid/
        ├── site-inspection/
        ├── page-performance/
        ├── citations/
        ├── backlinks/
        ├── call-attribution/
        └── site-optimization/
```

Keep provider SDK code in `src/server/integrations/`.

Keep Search business logic in `src/features/search-operations/`.

---

### 54. Key Invariants

1. Every tenant-owned Search Operations record is directly property-scoped.
2. `WebsitePage` remains page identity; Search Operations semantics live in related records.
3. Structural page type and strategic page purpose are different fields.
4. Money/supporting is not encoded as page structural type.
5. SearchKeyword stores query identity, not current metrics.
6. Search volume, CPC, difficulty, and ranks are dated evidence.
7. Search Console average position is not treated as an external rank-tracker position.
8. SearchTarget is the primary strategy unit.
9. Each active SearchTarget normally has at most one active PRIMARY target-page assignment.
10. Coverage state is derived from versioned evidence.
11. `OPPORTUNITY` is not a coverage state.
12. Durable actionable SEO conditions use shared Finding.
13. Search Operations does not create a parallel ticket system.
14. An Intervention records actual change, not intended work.
15. A completed WorkTicket does not prove search improvement.
16. A fulfilled cycle does not prove search improvement.
17. MeasurementReview remains outcome truth.
18. AI suggestions are untrusted until validated/reviewed according to policy.
19. AI never grants execution authority.
20. There is no unguarded automatic website modification mode.
21. Automatic guarded actions require BTLS-managed capability plus policy permission.
22. Unsupported external sites fail to manual work rather than unsafe modification.
23. Provider payloads are normalized at adapters.
24. Provider collection failure is not interpreted as negative SEO performance.
25. A partial crawl cannot produce false PASS results for checks requiring complete evidence.
26. Historical target-page assignments are retained.
27. Historical fulfillment policy is snapshotted into each cycle.
28. Provider quotas and usage are visible.
29. Portfolio health is derived and rebuildable.
30. Fleet remediation never erases property-specific Intervention history.
31. Clients never see cross-property fleet records.
32. Search Operations does not mass-produce low-value service/location pages as an automatic fulfillment tactic.
33. Citation work is foundation/exception driven, not fabricated monthly busywork.
34. Backlink monitoring does not become automated spam outreach.
35. Business outcome attribution uses confidence language and does not overclaim causation.

---

### 55. Explicit Exclusions

Initial Search Operations implementation does not include:

- unrestricted autonomous SEO;
- unguarded website changes;
- automatic mass service/location page generation;
- automatic publishing of AI content without required review;
- backlink marketplace;
- automated mass link outreach;
- general-purpose Ahrefs/Semrush replacement;
- unlimited competitor tracking;
- unlimited rank tracking;
- general project-management software;
- advertising management;
- multi-touch attribution platform;
- universal SEO score;
- cross-client benchmarking;
- arbitrary page-builder modification;
- undocumented provider-specific logic in feature code;
- billing/subscription source of truth.

---

### 56. Deferred Decisions

May be settled during the relevant feature specification:

- exact keyword-metrics provider;
- exact organic-rank provider;
- exact geo-grid provider;
- exact crawler implementation;
- exact citation provider;
- exact backlink provider;
- exact call-attribution provider;
- exact first `AUTO_GUARDED` operation allowlist;
- exact GBP write operations, if any;
- exact external-site optimization adapters;
- exact rank/crawl/citation/backlink cadence by commercial tier;
- exact retention periods;
- exact numeric queue sort formula behind visible priority bands;
- exact threshold values for coverage-state rule versions.

A deferred decision must not be silently invented in feature code.

---

### 58. Architecture Decision Summary

The binding Search Operations rulings are:

- SearchTarget is the strategic unit.
- WebsitePage remains discovered URL identity.
- PageSearchProfile owns search semantics.
- Structural page type and strategic purpose are separate.
- Service/location/topic relationships are normalized joins.
- Search metrics and rankings are immutable dated observations.
- SearchTarget page assignment is historical and explicit.
- Coverage is a versioned assessment, not a permanent tag.
- Durable opportunities/problems reuse shared Finding.
- Work Management remains the shared execution and measurement loop.
- SearchFulfillmentCycle snapshots what BTLS owed.
- SearchDeliverySummary proves fulfillment, not outcome.
- Organic rank and local geo-grid evidence are separate.
- Search Console position is not conflated with rank-tracker position.
- Technical crawl evidence is normalized before rules run.
- Internal support strategy and observed hyperlinks are separate.
- Local/citation/backlink evidence is intentionally narrow and operational.
- Priority uses explainable factor bands, not an opaque SEO score.
- All automation is guarded; AI cannot authorize itself.
- Managed sites expose capabilities through SiteOptimizationAdapter.
- Manual external sites still receive detection, work, and measurement.
- Provider spend is measured per property/program.
- Fleet remediation is BTLS-internal and still produces property-specific Interventions.
- Portfolio health is a rebuildable read model.
- Search measurement uses existing MeasurementReview and Revenue Operations evidence.
- Every important decision remains explainable and property-scoped.

---

---

## 21. Shared Work Management Architecture

Work Management owns the common execution loop used by Website Intelligence, Content Intelligence, and Search Operations.

### Ownership

- Finding review state
- Work Package templates
- Work tickets
- Ticket tasks
- Assignment
- Intervention records
- Measurement reviews
- Resolution/reopen workflow

### Boundary

- Intelligence features decide what condition exists and supply evidence.
- Work Management tracks what BTLS decided to do.
- An Intervention records what actually changed.
- A Measurement Review records what happened afterward.

### Required linkage

```text
ClientProperty
→ Finding
→ WorkPackageTemplate version
→ WorkTicket
→ Intervention
→ MeasurementReview
```

A ticket may not claim success. Success is determined only through the later measurement review.

---

## 22. Error and Result Pattern

Expected application errors include:

- Validation
- Authentication
- Authorization
- Not found
- Conflict
- Rate limit
- Integration failure
- Temporary dependency failure

Server-facing entry points return predictable safe results.

```ts
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
```

Internal logs preserve technical context; user responses do not expose stack traces, tokens, provider payloads, or sensitive data.

---

## 23. Environment and Deployment

### Environments

- Local
- Preview
- Staging
- Production

Each environment has isolated:

- Supabase project or database
- Storage
- OAuth credentials
- Webhook endpoints
- provider API keys
- Inngest environment
- application secrets

Preview environments must not use production customer data.

### Deployment flow

```text
Pull request
→ lint, typecheck, tests
→ preview deployment
→ review
→ merge
→ database migration against target environment
→ production deployment
→ health and smoke checks
```

### Migration rule

- Prisma migrations are committed and reviewed.
- Applied migrations are not rewritten.
- Supabase-specific RLS SQL is committed under `supabase/`.
- Prisma and Supabase migrations must not create the same object twice.
- Destructive or backfill-heavy changes require a phased migration plan.
- Production migrations run through a controlled release command, not automatically from an arbitrary app instance.

### Rollback

Application deployments must be independently reversible. Database rollbacks are handled by forward corrective migrations unless a tested rollback is explicitly safe.

---

## 24. Observability

### Logs

Structured logs include:

- Request or job identifier
- Property ID when relevant
- User or actor ID when relevant
- Feature/operation
- Provider
- Outcome
- Safe error metadata

### Monitoring

Sentry captures:

- Unhandled exceptions
- Important server and job failures
- Performance traces for critical operations
- Release version

Operational alerts cover:

- Integration sync failures
- Expired/revoked credentials
- Repeated job failures
- Robin action failures
- Lead-ingestion failures
- Data-health degradation

### Audit versus operational logs

- Operational logs help developers diagnose systems.
- Audit events explain who changed business data and when.
- Audit events are durable and append-only.
- Logs may have shorter retention and must not be used as the only business history.

---

## 25. Security Boundaries

Required controls:

- Server-side capability checks
- Property-scoped queries
- PostgreSQL RLS
- Zod validation
- secure cookie sessions
- server-only secrets
- signed private-file access
- scoped, expiring/revocable public Customer document grants bound to the exact commercial document/version
- sensitive signature, commercial artifact, Payment, and time-record authorization/audit controls
- public-form bot protection
- rate limits on exposed endpoints
- webhook signature verification
- idempotent provider processing
- audit history for sensitive actions
- restricted Robin tools
- cross-tenant tests

Public form ingestion and webhooks are the only intentionally unauthenticated business endpoints. They still require signature, public-key, rate-limit, bot, and validation controls appropriate to the endpoint.

---

## 26. Testing Architecture

### Unit tests

Used for:

- Finding and BusinessException rules
- Metric and derived-state calculations
- URL normalization
- source-domain lifecycle transitions
- Estimate/Invoice snapshot and immutability rules
- Invoice balance, payment, overdue, and correction rules
- permission checks
- validation
- Robin and Quick Capture proposal policies

### Integration tests

Used for:

- Prisma queries and transactions
- tenant-scoped services and cross-tenant denial
- RLS behavior
- Customer/Contact/Lead creation workflows
- Conversation consent and thread correlation
- Estimate issue/acceptance/public-grant behavior
- Job/JobVisit and TimeEntry workflows
- Invoice/Payment derivation and compensation
- Quick Capture proposal confirmation through normal services
- Finding persistence
- ticket/intervention workflows
- provider adapters
- webhook idempotency
- background jobs

### End-to-end tests

Critical MVP journeys include:

- Sign in and property access
- Cross-tenant access denied
- Public form creates the correct Customer/Contact/Lead
- Lead progresses only through its sales stages
- Customer communication respects consent and thread ownership
- Estimate issue, public presentation, exact-revision acceptance, and immutability
- Start Work, Work Complete, and Close use the authorized Job workflow
- Invoice records partial Payment and derives balance/overdue correctly
- Quick Capture always previews and confirms typed proposals
- Robin acts or requests approval according to configuration
- Article is created and published
- Analytics data produces a reviewable Finding
- Finding becomes a ticket
- Intervention enters measurement review
- Client sees only approved information

---

## 27. Invariants

Rules Codex and developers must never violate:

1. Every tenant-owned record is traceable to a `ClientProperty`.
2. A browser-supplied property ID never proves authorization.
3. Client users never access another client account or property.
4. Server Actions and Route Handlers remain thin.
5. React components contain no direct database logic.
6. Feature services own business workflows.
7. Prisma is the normal server database access path.
8. Provider SDK response types do not leak into feature modules.
9. PostgreSQL owns durable relational constraints.
10. Complex product workflows are not hidden in database triggers.
11. All server and provider inputs are validated.
12. Webhooks and jobs are idempotent.
13. Money is stored as integer cents.
14. Files have database ownership metadata.
15. Private files require authorized signed access.
16. Findings cannot exist without a definition version and evidence.
17. Possible causes are not stored or shown as proven facts.
18. Client-visible Findings require operator approval.
19. Website Intelligence does not require DOM-level object mapping.
20. Smart Blog Studio strategy data is reused by Content Intelligence.
21. Website Intelligence, Content Intelligence, and Search Operations share Work Management.
22. A ticket records assigned work; an Intervention records actual change.
23. A completed ticket does not prove improvement.
24. Before-and-after conclusions require a Measurement Review.
25. Robin has no unrestricted database or provider access.
26. Every Robin action checks property mode and capability.
27. AI-generated tool arguments are untrusted until validated.
28. Background work always carries property scope.
29. Applied migrations are not rewritten.
30. Architecture changes update this file and the decision record before implementation proceeds.
31. Business logic remains outside React and Next.js page components.
32. Revenue Operations services are reusable by a future mobile client.
33. Important workflows have stable server-side service or API boundaries.
34. Authentication and authorization do not depend exclusively on Next.js cookies or browser routing.
35. Notification delivery is provider-agnostic so push notifications can be added later.
36. Records support mobile-safe IDs, pagination, incremental loading, and timestamps.
37. File handling supports future camera uploads and mobile attachments.
38. Web-specific concepts such as URL state do not become business source-of-truth data.
39. `WebsitePage` remains page identity; Search-specific semantics live in related Search Operations records.
40. SearchTarget is the primary search-strategy unit; individual keyword metrics remain dated evidence.
41. Search Console average position is not conflated with point-in-time rank tracking.
42. Coverage and program health are derived/versioned evidence, not permanent manual truth.
43. Search fulfillment does not prove performance outcome.
44. No unguarded Search website-modification path exists.
45. Provider usage and estimated cost remain attributable to property/program.
46. Fleet remediation preserves property-specific Intervention history and tenant isolation.
47. Customer is the end-customer parent; Contact is person-only; Lead is one opportunity.
48. ClientAccount never substitutes for Customer, and BusinessLocation never substitutes for ServiceLocation.
49. PropertyService remains shared and PricebookItem never replaces it.
50. Estimate scheduling derives from Appointment and Estimate sent/delivered summaries derive from EstimateDelivery.
51. Issued and accepted commercial revisions/snapshots are immutable.
52. Customer public access is grant-scoped and cannot edit, comment, request a revision, or publicly reject an Estimate in MVP.
53. Material post-acceptance commercial change uses ChangeOrder.
54. Conversation requires Customer and primary Contact and is never owned by Lead, Job, Invoice, or Robin.
55. Appointment, Job, and JobVisit preserve separate operational meanings.
56. JobTask never becomes shared WorkTicket work.
57. Invoice document truth and Payment truth remain separate.
58. Invoice payment and overdue states derive from Invoice and valid Payment facts.
59. Payment processing is optional and manual/external Payment remains a complete path.
60. BTLS does not infer taxability, jurisdiction, or statutory tax rates.
61. TimeEntry remains basic operational time and excludes payroll/HR truth.
62. NextRequiredAction, AttentionFlag, BusinessException, and growth Finding remain distinct.
63. Revenue Leak remains a BusinessException rule family rather than a model.
64. MediaAsset remains shared byte-lifecycle truth.
65. Quick Capture is distinct from Robin, always previews proposals, and never writes derived state directly.
66. AI cannot fabricate signature or Payment truth or bypass normal application services.
67. Consequential corrections preserve history through reversal, void, replacement, or compensation.
68. Generated Job Brief and customer journey views remain derived, non-authoritative projections.

The MVP does not need a public mobile API for every feature immediately. However, workflows must not be buried inside Server Actions so deeply that they cannot later be exposed through authenticated API endpoints.

---

## 28. Deferred Decisions

These decisions may be finalized during the relevant build phase without blocking the target architecture:

- Exact external CMS publishing adapters supported in the MVP
- Exact retention periods for analytics snapshots and operational logs
- Exact role-to-capability matrix
- Whether selected dashboards use Supabase Realtime or normal refresh
- Exact provider for voice-call attribution
- Exact advanced file-scanning service
- Whether Work Package templates receive an admin editing UI in MVP
- Exact OpenAI model selection and model fallback policy
- Exact client-facing notification preference options
- Exact integrated `PaymentProvider`, if online payment processing is later approved; no provider is required for core Invoice/Payment
- Exact `AddressLookupProvider`, if address assistance/geocoding is later approved; manual ServiceLocation entry remains default
- Exact `TranscriptionProvider` before Feature 21 voice Quick Capture; text Quick Capture is provider-independent
- Exact connected-mailbox provider/OAuth behavior; Postmark outbound with BTLS-managed From and client Reply-To remains the MVP default
- Exact server library for commercial PDF/artifact generation, if Feature 16 requires one
- Exact customer document-grant expiry, claim, and revocation policies within the scoped-access architecture
- Exact keyword-metrics provider
- Exact organic-rank provider
- Exact local rank-grid provider
- Exact site crawler/inspection implementation
- Exact citation and backlink providers
- Exact Search call-attribution provider
- Exact first `AUTO_GUARDED` Search operation allowlist
- Exact supported GBP write operations, if any
- Exact external-site optimization adapters
- Exact Search provider cadences/quotas and time-series retention by commercial tier

A deferred decision must not be silently invented inside feature code. Record it in the architecture decision log when settled.

---

## 28A. Feature 05 Authorization Decision

Client users require an active `AccountMembership` and explicit `PropertyAccess` for every property. `AccountMembership.role` is the baseline client role; `PropertyAccess.roleOverride` is an optional property-specific override. Platform capabilities are the sole cross-property exception: `platform.property.read` is granted to BTLS admins and operators, while `platform.property.manage` and `platform.user.manage` are admin-only. `CLIENT_OWNER` alone has `property.member.manage`, limited to properties the owner explicitly accesses.

Feature 04 verifies Supabase identity and sessions. Feature 05 activates pending BTLS authorization. A token-free `PendingAccountInvitation` and same-account `PendingPropertyAccess` set record intended access, which is activated idempotently only after verified acceptance. Existing verified AppUsers receive their validated grants immediately without a pending record. Pending invitations expire after the configured 24-hour default; expiry or cancellation never activates access.
## 29. Architecture Decision Summary

The binding rulings are:

- Next.js App Router and strict TypeScript are the application foundation.
- Supabase owns PostgreSQL hosting, Auth, Storage, and selective realtime.
- Prisma is the primary server-side database and migration layer.
- The browser does not directly perform normal tenant CRUD.
- Server-side authorization plus RLS protects tenant data.
- Feature modules own business behavior.
- Application services own workflows.
- Route Handlers and Server Actions are thin adapters.
- External providers are isolated behind BTLS-owned interfaces.
- Inngest handles durable background and scheduled work.
- Website Intelligence and Content Intelligence reuse shared normalized data infrastructure.
- Smart Blog Studio provides the strategy context used by Content Intelligence.
- Work Management is a shared feature used by Website Intelligence, Content Intelligence, and Search Operations.
- Robin acts only through validated, property-authorized tools.
- Findings preserve versioned evidence.
- Tickets, interventions, and measurement reviews are separate records with separate meanings.
- Search Operations is the third studio and owns recurring organic-search fulfillment.
- SearchTarget is the strategic search unit; WebsitePage remains discovered page identity.
- Page structural type and strategic search purpose remain separate.
- Search keyword/ranking/provider metrics are dated evidence.
- Organic rank, local geo-grid, technical audit, local presence, and narrow authority evidence remain distinct normalized sources.
- Search durable opportunities/problems reuse shared Findings and Work Management.
- SearchFulfillmentCycle proves scope delivery; MeasurementReview evaluates outcome.
- Search provider cost/usage is first-class operational data.
- Search automatic execution is guarded, capability-aware, policy-authorized, and never self-authorized by AI.
- Fleet remediation is BTLS-internal and still records property-specific Interventions.
- Revenue Operations uses Customer as end-customer parent, Contact as person, and Lead as one opportunity rather than one flattened master lifecycle.
- Customer/Contact Conversation ownership, separate Appointment/JobVisit schedule truth, immutable Estimate revision/acceptance history, and Invoice/Payment derivation are binding.
- Operational financial truth is not accounting truth; payment processing is optional and tax remains user-entered commercial input.
- Quick Capture is a confirmation-required Revenue proposal workflow distinct from Robin.
- Shared PropertyService, MediaAsset, Finding, and Work Management ownership remain unchanged by Revenue Operations.

---

## 30. Codex Usage

Before beginning any task, Codex must read:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/build-plan.md`
4. `context/code-standards.md`
5. Relevant UI and feature context files
6. For Search Operations work, the canonical Search Operations sections in this `architecture.md` and `build-plan.md`
7. `context/progress-tracker.md`

When the repository differs from this target architecture:

- Do not silently create a second pattern.
- Inspect the existing implementation.
- State the conflict.
- Prefer a small migration toward the target architecture.
- Record an approved exception or architecture change when migration is not appropriate.
