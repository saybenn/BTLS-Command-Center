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

The BTLS MVP contains two product groups and five product components.

### Web Growth Studio

1. **Website Intelligence**
2. **Smart Blog Studio**
3. **Content Intelligence**

### Revenue Operations Studio

4. **Revenue Operations / Command Center**
5. **Robin AI Automation Agent**

### Shared feature

6. **Work Management**

Work Management is shared by Website Intelligence and Content Intelligence. It owns the common Finding-to-work loop:

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
- Automatic website modification
- Unapproved autonomous AI actions

Shared infrastructure required by the five MVP components is allowed.

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
    Website and Content Findings must preserve the facts and rule version that produced them.

11. **Readable beats clever**  
    The implementation follows `context/code-standards.md`.

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
| AI provider | OpenAI API behind a BTLS adapter | Robin reasoning, extraction, and message generation |
| Email | Postmark behind a BTLS adapter | Transactional and lead communication email |
| SMS | Twilio behind a BTLS adapter | Permissioned lead communication |
| Calendar | Cronofy behind a BTLS adapter | Availability and approved appointment scheduling |
| Web analytics | Google Analytics Data API | Website behavior and events |
| Search data | Google Search Console API | Queries, pages, impressions, clicks, CTR, position |
| Local presence | Google Business Profile APIs | Local visibility and interaction metrics |
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
- `work-management/` is shared because both intelligence features use Findings, Work Packages, tickets, interventions, and measurement reviews.

---

## 6. System Boundaries

| Area | Owns | Must not own |
|---|---|---|
| `src/app/` | Routes, layouts, loading/error boundaries, thin actions and handlers | Business workflows, direct provider logic, complex database queries |
| React components | Presentation, interaction, temporary UI state | Authorization authority, database access, durable business rules |
| Feature actions | Validated entry points for first-party mutations | Full workflow implementations |
| Feature queries | Read-oriented feature APIs and DTO construction | Cross-tenant access, provider-specific parsing |
| Feature services | Business rules, workflow orchestration, transactions, audit/event dispatch | Rendering or provider SDK leakage |
| `work-management/` | Shared Finding-to-work lifecycle | Intelligence rule calculation |
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

- **ClientAccount** represents the customer relationship or business organization.
- **ClientProperty** represents one business website and its connected operating data.
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
content.view
content.edit
content.publish
finding.review
ticket.manage
robin.view
robin.configure
integration.manage
user.manage
```

Roles bundle capabilities; services check capabilities rather than relying only on role names.

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
| `MediaAsset` | Ownership and metadata for stored files | Property, uploader, feature record |
| `AuditEvent` | Append-only history of sensitive actions | Actor, property, subject |
| `Notification` | In-app notification and delivery status | User, property |
| `WebhookReceipt` | Idempotency and processing history | Provider, external event ID |
| `JobExecution` | Optional application record for important background work | Property, job type, status |

### Revenue Operations

| Entity | Purpose | Key relationships |
|---|---|---|
| `Contact` | A person or organization known to the client | May have multiple leads |
| `Lead` | One commercial opportunity | Contact, property, activities, estimate/job/payment |
| `LeadActivity` | Communication and lifecycle timeline | Lead, actor |
| `FollowUpTask` | Human or Robin follow-up work | Lead, assignee |
| `Estimate` | Proposed work and value | Lead |
| `Job` | Fulfillment after a won sale | Lead |
| `PaymentRecord` | Payment state and confirmed value | Lead and/or job |

The parent `Lead.status` remains the source of the opportunity lifecycle. Estimate, job, and payment records contain their own operational details without creating competing lead-status systems.

### Robin

| Entity | Purpose | Key relationships |
|---|---|---|
| `BusinessKnowledgePack` | Approved facts Robin may use | Property, version |
| `RobinConfiguration` | Modes, tools, hours, and capability settings | Property |
| `Conversation` | Lead communication thread | Lead, property |
| `Message` | Inbound/outbound communication item | Conversation |
| `RobinRun` | One agent reasoning/execution session | Lead, property, configuration version |
| `RobinAction` | Proposed or executed typed tool action | Robin run, approval, result |

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
→ contact matched or created
→ lead created
→ activity recorded
→ lead.created event published
→ employee notification and Robin job dispatched
→ safe success response
```

Public forms never accept a privileged property ID as proof of destination. They use a revocable public form identifier mapped server-side to the property.

### 11.4 Robin lead response

```text
lead.created or follow-up-due event
→ durable Robin job
→ property configuration loaded
→ Knowledge Pack and workflow version loaded
→ duplicate-action check
→ AI produces typed proposed tool action
→ Zod validates tool arguments
→ capability and automation-mode checks
→ approval requested or action executed
→ application service performs mutation/provider call
→ message, RobinRun, RobinAction, and LeadActivity recorded
→ human handoff created when required
```

### 11.5 Content creation and publication

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

### 11.6 Website data ingestion

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

### 11.7 Finding evaluation

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

### 11.8 Finding-to-work loop

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

### 11.9 File upload

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

## 12. Storage

The database owns file metadata and relationships. Supabase Storage owns file bytes.

| Bucket | Visibility | Path pattern | Contents |
|---|---|---|---|
| `public-media` | Public | `{propertyId}/brand/{assetId}/{filename}` | Client logos and approved public brand assets |
| `public-content` | Public | `{propertyId}/content/{contentAssetId}/{assetId}/{filename}` | Published article images and featured images |
| `private-media` | Private | `{propertyId}/{category}/{recordId}/{assetId}/{filename}` | Lead attachments, work evidence, internal screenshots, Knowledge Pack files |
| `temporary-uploads` | Private | `{propertyId}/{uploadId}/{filename}` | Unfinalized or pending-validation uploads |

### Storage rules

- File paths always include the owning property.
- Every finalized file has a `MediaAsset` record.
- Private files require server-authorized signed access.
- Public status is an explicit application decision.
- Upload type, size, ownership, and intended use are validated before authorization.
- Removing a database relationship does not silently delete a reusable file.
- Orphan cleanup runs as a scheduled background job.
- Published content should not depend on short-lived signed URLs.
- Client users cannot list or access another property's paths.

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

### Provider failure rule

External systems are treated as delayed and unreliable. Adapters must handle timeouts, expired credentials, rate limits, partial data, missing fields, duplicate events, and provider outages.

---

## 14. Internal Events

Internal events decouple completed business facts from follow-on work.

Examples:

```text
lead.created
lead.status_changed
lead.follow_up_due

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
- Robin acknowledgments and follow-ups
- Notification delivery
- Measurement reviews
- Webhook follow-on work
- Orphaned-file cleanup
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

Revenue Operations owns:

- Contacts
- Leads
- Lead attribution
- Opportunity lifecycle
- Estimates
- Jobs
- Payments
- Follow-up tasks
- Conversation/activity timeline
- Operational and revenue reporting

### Lead lifecycle

```text
New
→ Contacted
→ Qualified
→ Estimate Scheduled
→ Estimate Sent
→ Follow-Up
→ Sale Won
```

Terminal or holding outcomes include:

- Lost
- Stale

Fulfillment after sale:

```text
Sale Won
→ Job Scheduled
→ Job In Progress
→ Job Complete
```

Collections after completion:

```text
Job Complete
→ Payment Due
→ Paid
```

The `Lead` remains the parent opportunity record. Related records enrich the lead without creating competing opportunity-status authorities.

---

## 20. Robin Architecture

Robin is a controlled application agent, not an autonomous database user.

Robin owns:

- Lead acknowledgment
- Approved qualification
- Approved field updates
- Approved scheduling
- Approved follow-up
- Human escalation
- Agent run/action records
- Automation outcome reporting

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

## 21. Shared Work Management Architecture

Work Management owns the common execution loop used by Website Intelligence and Content Intelligence.

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

- Finding rules
- Metric calculations
- URL normalization
- lifecycle transitions
- permission checks
- validation
- Robin tool policies

### Integration tests

Used for:

- Prisma queries and transactions
- tenant-scoped services
- RLS behavior
- lead creation workflows
- Finding persistence
- ticket/intervention workflows
- provider adapters
- webhook idempotency
- background jobs

### End-to-end tests

Critical MVP journeys include:

- Sign in and property access
- Cross-tenant access denied
- Public form creates a lead
- Lead progresses through its lifecycle
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
21. Website and Content Intelligence share Work Management.
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

A deferred decision must not be silently invented inside feature code. Record it in the architecture decision log when settled.

---

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
- Work Management is a shared feature used by both intelligence modules.
- Robin acts only through validated, property-authorized tools.
- Findings preserve versioned evidence.
- Tickets, interventions, and measurement reviews are separate records with separate meanings.

---

## 30. Codex Usage

Before beginning any task, Codex must read:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/build-plan.md`
4. `context/code-standards.md`
5. Relevant UI and feature context files
6. `context/progress-tracker.md`

When the repository differs from this target architecture:

- Do not silently create a second pattern.
- Inspect the existing implementation.
- State the conflict.
- Prefer a small migration toward the target architecture.
- Record an approved exception or architecture change when migration is not appropriate.
