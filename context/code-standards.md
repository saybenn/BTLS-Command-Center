# BTLS Code Standards

> **Applies to:** BTLS Command Center, Web Growth Studio, Revenue Operations Studio, Robin, shared platform code, integrations, background jobs, and future MVP extensions.
>
> **Primary goal:** Produce code that is safe, predictable, readable, testable, and easy to debug.
>
> **Default rule:** Prefer established industry practices and plain code over clever abstractions.

---

## 1. Engineering Principles

### 1.1 Optimize for clarity

Code should be understandable by a capable junior developer without requiring hidden context.

Prefer:

- Clear names
- Straightforward control flow
- Small focused functions
- Explicit types
- Predictable file locations
- Visible error handling
- Familiar patterns

Avoid:

- Clever one-liners
- Dense functional chains
- Hidden side effects
- Unnecessary metaprogramming
- Abstract base classes without a clear need
- Framework patterns invented only for this project

### 1.2 Make the correct path the easy path

Project structure should guide developers toward:

- Server-side authorization
- Tenant-safe database access
- Validated inputs
- Consistent error handling
- Audited sensitive actions
- Reusable application services
- Testable business logic

A developer should not need to remember dozens of unwritten rules.

### 1.3 Build only what the product needs

Do not introduce:

- Premature abstractions
- Generic frameworks for one use case
- Speculative extension points
- Duplicate systems
- New dependencies for trivial work
- Architecture intended for hypothetical enterprise scale

Refactor after a real pattern appears more than once and the abstraction improves readability.

### 1.4 Keep behavior close to its owner

Business rules belong in the feature or domain that owns them.

Examples:

- Lead lifecycle rules belong in Revenue Operations
- Finding evaluation belongs in Website Intelligence
- Content readiness rules belong in Smart Blog Studio
- Robin action permissions belong in Robin
- Tenant and permission rules belong in shared authorization infrastructure

Do not scatter one workflow across UI components, route handlers, database triggers, and background jobs without a clear reason.

### 1.5 Treat production safety as part of the feature

A feature is not complete until it includes:

- Validation
- Authorization
- Tenant isolation
- Error handling
- Loading and empty states
- Audit behavior where required
- Tests appropriate to the risk
- Logging for failures
- Documentation for non-obvious behavior

---

## 2. Core Technology Standards

The expected BTLS stack is:

- **Next.js App Router**
- **TypeScript in strict mode**
- **React**
- **Supabase**
  - PostgreSQL hosting
  - Authentication
  - Storage
  - Row-Level Security
- **Prisma**
  - Schema
  - Migrations
  - Typed server-side database access
- **Zod**
  - Runtime validation at server boundaries
- **A shared UI component system**
- **A dedicated background-job mechanism**
- **A structured logging solution**
- **Automated unit, integration, and end-to-end tests**

Do not replace a core technology without:

1. A documented problem
2. A concrete benefit
3. An approved architecture decision
4. A migration plan

---

## 3. TypeScript Standards

### 3.1 Strict mode is mandatory

TypeScript must remain strict.

Do not disable strictness to make code compile.

### 3.2 Avoid `any`

Do not use `any` unless interfacing with an unavoidable untyped boundary.

When an external value is unknown:

```ts
function parseWebhookPayload(payload: unknown): WebhookPayload {
  return webhookPayloadSchema.parse(payload);
}
```

If `any` is unavoidable, isolate it, explain why, and convert it to a safe type immediately.

### 3.3 Prefer explicit domain types

Use named types for business concepts.

```ts
type LeadId = string;
type ClientPropertyId = string;

interface LeadSummary {
  id: LeadId;
  propertyId: ClientPropertyId;
  status: LeadStatus;
  customerName: string;
}
```

Do not pass large anonymous object shapes through multiple layers.

### 3.4 Use enums or constant unions intentionally

Use a shared enum or `as const` union for stable lifecycle values.

```ts
export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ESTIMATE_SCHEDULED",
  "ESTIMATE_SENT",
  "FOLLOW_UP",
  "SALE_WON",
  "LOST",
  "STALE",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
```

Database-owned lifecycle values must remain synchronized with Prisma.

### 3.5 Prefer interfaces for object contracts

Use `interface` for extendable object contracts and `type` for unions, aliases, and composed utility types.

Consistency matters more than dogma.

### 3.6 Do not hide nullability

If a value can be missing, type it honestly.

```ts
interface LeadAttribution {
  source: string | null;
  landingPage: string | null;
  campaignId: string | null;
}
```

Do not use non-null assertions unless the invariant has already been proven.

### 3.7 Exhaustive state handling

Use exhaustive checks for lifecycle and permission logic.

```ts
function getLeadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case "NEW":
      return "New";
    case "CONTACTED":
      return "Contacted";
    case "QUALIFIED":
      return "Qualified";
    case "ESTIMATE_SCHEDULED":
      return "Estimate Scheduled";
    case "ESTIMATE_SENT":
      return "Estimate Sent";
    case "FOLLOW_UP":
      return "Follow-Up";
    case "SALE_WON":
      return "Sale Won";
    case "LOST":
      return "Lost";
    case "STALE":
      return "Stale";
    default:
      return assertNever(status);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
```

---

## 4. Naming Standards

### 4.1 General naming

Use names that describe purpose, not implementation details.

Prefer:

- `createLead`
- `findContactByEmail`
- `evaluateWebsiteFinding`
- `scheduleRobinFollowUp`
- `normalizePageUrl`

Avoid:

- `handleThing`
- `processData`
- `runLogic`
- `doStuff`
- `manager`
- `helper`
- `utils2`

### 4.2 Files and folders

Use:

- `kebab-case` for folders and general files
- `PascalCase` for React component files when the component is the main export
- `.schema.ts` for Zod schemas
- `.service.ts` for application services
- `.repository.ts` only when a repository abstraction is justified
- `.types.ts` for shared feature types
- `.test.ts` or `.spec.ts` for tests

Examples:

```text
lead-detail/
  LeadDetail.tsx
  lead-detail.schema.ts
  lead-detail.service.ts
  lead-detail.test.ts
```

### 4.3 Booleans

Boolean names should read naturally:

- `isActive`
- `hasPermission`
- `canPublish`
- `shouldNotify`
- `wasAutoAcknowledged`

Avoid ambiguous names such as `active`, `permission`, or `publishable`.

### 4.4 Dates and timestamps

Timestamp fields should end in `At`.

Examples:

- `createdAt`
- `updatedAt`
- `publishedAt`
- `paidAt`
- `lastSyncedAt`

Date-only fields should end in `Date`.

---

## 5. Project Structure

Organize the application primarily by feature.

Recommended high-level structure:

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/

  features/
    website-intelligence/
      components/
      services/
      schemas/
      queries/
      types/
      tests/

    smart-blog-studio/
    content-intelligence/
    revenue-operations/
    robin/

  components/
    ui/
    layout/
    feedback/

  server/
    auth/
    database/
    integrations/
    jobs/
    events/
    logging/
    storage/

  lib/
    validation/
    formatting/
    dates/
    result/
    constants/

  types/

prisma/
  schema.prisma
  migrations/
  seed/

docs/
  product/
  architecture/
  features/
  build/
```

### 5.1 Feature folders own feature behavior

A feature folder may contain:

- UI components
- Input schemas
- Application services
- Queries
- Feature-specific types
- Feature-specific tests

### 5.2 Shared folders must remain genuinely shared

Do not move code into `lib`, `components`, or `server` merely because two files use it once.

Shared code should have:

- A clear cross-feature purpose
- Stable ownership
- A descriptive name
- No dependency on one feature’s private details

### 5.3 Avoid barrel-file abuse

Do not create large `index.ts` files that re-export entire modules.

Small intentional public entry points are acceptable.

---

## 6. Layer Responsibilities

### 6.1 React components

React components own:

- Presentation
- User interaction
- Temporary UI state
- Loading, empty, and error states
- Calling approved server entry points

React components must not own:

- Tenant authorization
- Business lifecycle rules
- Direct database queries
- Secret handling
- Webhook verification
- Robin authority decisions

### 6.2 Server Actions

Use Server Actions for authenticated first-party mutations closely tied to the application UI.

Examples:

- Update a lead
- Publish an article
- Confirm a Finding
- Create a work ticket

A Server Action should:

1. Parse and validate input
2. Resolve the authenticated user
3. Confirm tenant and permission access
4. Call an application service
5. Return a safe result

Do not place substantial business logic directly inside the action.

### 6.3 Route Handlers

Use Route Handlers for:

- External webhooks
- OAuth callbacks
- Public ingestion endpoints
- File delivery endpoints
- Conventional APIs where required
- Health checks

Route Handlers should remain thin and delegate to services.

### 6.4 Application services

Application services own business workflows.

Examples:

- `createLeadFromFormSubmission`
- `transitionLeadStatus`
- `publishContentAsset`
- `evaluatePropertyFindings`
- `executeRobinAction`

A service should coordinate:

- Authorization context
- Domain rules
- Database operations
- Transactions
- Audit events
- Internal events
- Background-job dispatch

### 6.5 Database layer

PostgreSQL owns:

- Relational integrity
- Foreign keys
- Unique constraints
- Check constraints
- Indexes
- Transactions
- Row-Level Security
- Durable data

The database should not own complex product workflows through hidden triggers unless an architecture decision explicitly requires it.

### 6.6 Prisma

Prisma is the default server-side database access layer.

Prisma owns:

- Schema definition
- Migrations
- Typed queries
- Transactions
- Relations
- Seed data

Raw SQL is acceptable only when:

- Prisma cannot express the operation safely
- Performance requires it
- RLS or a database-specific feature requires it
- The query is isolated, reviewed, and tested

---

## 7. Authentication, Authorization, and Tenancy

### 7.1 Authentication is not authorization

Supabase Auth proves who the user is.

The application determines:

- Which client accounts they belong to
- Which properties they may access
- Which actions they may perform
- Which internal BTLS data they may view

### 7.2 Every tenant-owned record must be traceable

Major records must be associated with the correct client and property.

Examples:

- Leads
- Contacts
- Content assets
- Findings
- Tickets
- Robin runs
- Integrations
- Media assets

Do not infer tenant ownership through fragile joins when a direct property relationship is appropriate.

### 7.3 Authorization must be server-side

The UI may hide unavailable actions, but server-side checks are mandatory.

Never trust:

- A property ID from the browser
- A hidden button
- A disabled control
- A client-provided role
- A client-provided user ID

### 7.4 RLS is defense in depth

Use Row-Level Security to prevent cross-tenant access.

Do not treat RLS as a replacement for application-level authorization.

### 7.5 Service-role access is restricted

Supabase service-role credentials must:

- Exist only on the server
- Never be exposed to browser bundles
- Be used only in tightly controlled infrastructure paths
- Always include explicit tenant scoping where relevant

---

## 8. Validation Standards

### 8.1 Validate at every trust boundary

Validate:

- Form submissions
- Server Action inputs
- Route Handler payloads
- Webhooks
- Background-job payloads
- Integration responses
- AI tool arguments
- Environment variables

### 8.2 Use Zod for runtime validation

Create reusable schemas near the owning feature.

```ts
export const createLeadSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  email: z.string().email().nullable(),
  phone: z.string().trim().min(7).max(30).nullable(),
  service: z.string().trim().max(160).nullable(),
});
```

### 8.3 Client validation improves UX only

Client-side validation is helpful, but server validation remains required.

### 8.4 Database constraints protect durable truth

Use database constraints for invariants that must never be violated.

Examples:

- Unique memberships
- Required ownership
- Valid relationships
- Non-negative currency values
- One active integration of a given type per property when required

---

## 9. Error Handling

### 9.1 Use typed application errors

Create a small set of meaningful error types.

Examples:

- `ValidationError`
- `AuthenticationError`
- `AuthorizationError`
- `NotFoundError`
- `ConflictError`
- `IntegrationError`
- `RateLimitError`

### 9.2 Do not expose internal errors to users

User-facing messages should be safe and actionable.

Internal logs should include:

- Error name
- Operation
- Request or job ID
- User ID when available
- Property ID when available
- Integration name when relevant
- Stack trace
- Safe structured context

Never log:

- Passwords
- Auth tokens
- API secrets
- Full payment details
- Sensitive customer content without a specific reason

### 9.3 Do not swallow errors

Avoid empty catch blocks.

```ts
try {
  await syncSearchConsole(propertyId);
} catch (error) {
  logger.error("Search Console sync failed", {
    propertyId,
    error,
  });

  throw new IntegrationError("Search Console sync failed", {
    cause: error,
  });
}
```

### 9.4 Return predictable results

Server entry points should return a consistent success or error shape.

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

Do not return raw thrown errors to the browser.

---

## 10. Logging and Observability

### 10.1 Use structured logging

Log structured fields rather than long unsearchable strings.

Prefer:

```ts
logger.info("Lead created", {
  leadId,
  propertyId,
  source,
});
```

### 10.2 Important workflows need traceability

Track identifiers across:

- Request
- Webhook
- Background job
- Robin run
- Integration sync
- Finding evaluation

### 10.3 Audit events are separate from logs

Logs help engineers operate the system.

Audit events explain who changed business data and when.

Audit sensitive actions such as:

- Permission changes
- Integration connections
- Robin configuration changes
- Lead lifecycle changes
- Content publication
- Finding approval
- Ticket completion
- Manual attribution changes

---

## 11. Database Standards

### 11.1 Use descriptive model names

Model names should reflect business language.

Prefer:

- `ClientProperty`
- `Lead`
- `ContentAsset`
- `Finding`
- `RobinRun`

Avoid vague names such as:

- `Record`
- `Item`
- `EntityData`
- `Object`

### 11.2 Use explicit relationships

Prefer normalized relationships for durable business facts.

Use JSON only for:

- Provider payload snapshots
- Flexible metadata
- Versioned configuration
- Data that is not routinely queried relationally

Do not store core lifecycle or ownership facts only in JSON.

### 11.3 Currency values

Store money as integer cents.

```ts
estimatedValueCents: number;
```

Never use floating-point values for money.

### 11.4 Migrations are append-only history

Do not rewrite applied migrations.

Every schema change requires:

- A reviewed Prisma schema change
- A generated migration
- Appropriate indexes and constraints
- Data migration planning when existing rows are affected
- Verification against a clean database
- Verification against realistic existing data

### 11.5 Avoid N+1 queries

Review list pages and dashboards for query count.

Use intentional relation loading, aggregation, and pagination.

---

## 12. React and UI Standards

### 12.1 Prefer Server Components by default

Use Client Components only when the component needs:

- Browser APIs
- Local interactive state
- Event handlers
- Client-only libraries
- Realtime subscriptions

Do not add `"use client"` to large feature trees without need.

### 12.2 Keep components focused

A component should have one clear responsibility.

Split a component when:

- It contains unrelated sections
- It owns multiple complex workflows
- It becomes difficult to test
- Its props become confusing
- Its state becomes difficult to reason about

Do not split components merely to reduce line count.

### 12.3 Use accessible shared primitives

Forms, dialogs, tables, menus, alerts, and navigation should use accessible shared components.

Every interactive control must support:

- Keyboard use
- Visible focus
- Clear labels
- Appropriate ARIA behavior
- Disabled and loading states

### 12.4 Data-heavy interfaces must remain readable

Dashboards should prioritize:

- Clear hierarchy
- Useful defaults
- Empty states
- Filters that reflect real operator needs
- Progressive disclosure
- Plain-English labels
- Limited visual noise

Do not display metrics merely because they are available.

---

## 13. Forms and Mutations

Use a consistent form stack across the application.

A form submission should follow:

```text
User input
→ Client-side validation
→ Server Action or Route Handler
→ Server validation
→ Authentication
→ Authorization
→ Application service
→ Database transaction
→ Audit/event dispatch
→ Safe response
```

### 13.1 Prevent duplicate submissions

Use:

- Disabled submit state
- Request IDs or idempotency keys where needed
- Database uniqueness where appropriate
- Server-side duplicate protection

### 13.2 Mutations should be explicit

Prefer:

- `markLeadQualified`
- `scheduleEstimate`
- `publishContentAsset`

Avoid broad mutation methods such as:

- `updateEverything`
- `saveRecord`
- `patchEntity`

---

## 14. External Integrations

### 14.1 Integrations must be isolated

Each provider should have a dedicated adapter or service.

Examples:

```text
server/integrations/google-analytics/
server/integrations/search-console/
server/integrations/google-business-profile/
server/integrations/email/
server/integrations/sms/
```

Feature code should depend on internal contracts, not provider-specific payloads.

### 14.2 Normalize provider data

Do not let Google, email, SMS, or calendar payload shapes leak throughout the application.

Convert them into BTLS-owned types at the integration boundary.

### 14.3 Treat external systems as unreliable

Every integration must account for:

- Timeouts
- Rate limits
- Partial failures
- Expired credentials
- Duplicate webhooks
- Delayed data
- Missing fields
- Provider outages

### 14.4 Verify webhooks

Webhook handlers must:

- Verify signatures
- Validate payloads
- Enforce idempotency
- Log receipt
- Return quickly
- Dispatch long work to background processing

---

## 15. Background Jobs

Use background jobs for work that is:

- Slow
- Retryable
- Scheduled
- Provider-dependent
- Not required to complete the current request

Examples:

- Analytics imports
- Search Console imports
- Finding evaluation
- Robin follow-ups
- Notification delivery
- Measurement reviews
- Orphaned-file cleanup

Every job should define:

- Typed payload
- Idempotency strategy
- Retry policy
- Failure behavior
- Logging context
- Tenant/property scope
- Safe re-run behavior

Do not run long external syncs inside page requests.

---

## 16. Robin and AI Standards

AI must not be treated as a trusted authority.

### 16.1 AI output is untrusted input

Validate every AI-generated tool argument before execution.

### 16.2 Robin acts through narrow tools

Robin may only perform actions through approved, typed application tools.

Examples:

- Read approved business information
- Send an approved message
- Update approved lead fields
- Schedule an approved next step
- Create a human follow-up task
- Escalate a conversation

Robin must not receive unrestricted database access.

### 16.3 Respect automation mode

Every Robin action must check:

- Property configuration
- Enabled capability
- Automation mode
- Required approval
- Business hours
- Duplicate-action protections
- Human escalation rules

### 16.4 Log every material AI action

Record:

- Why the action was attempted
- Inputs used
- Tool invoked
- Approval state
- Result
- Error
- Related lead
- Related property
- Model and prompt version where relevant

---

## 17. Security Standards

Mandatory controls include:

- Server-side authorization
- Row-Level Security
- Input validation
- Secure secret storage
- CSRF-safe mutation patterns
- Rate limiting on exposed endpoints
- Bot protection on public forms
- Signed upload and download access
- Webhook signature verification
- Idempotency
- Tenant-scoped queries
- Audit logging for sensitive actions

Never rely on obscurity, hidden fields, or frontend checks for security.

---

## 18. Testing Standards

Testing should match business risk.

### 18.1 Unit tests

Use for:

- Pure calculations
- Finding rules
- Lifecycle rules
- Permission functions
- Normalization functions
- Validation helpers

### 18.2 Integration tests

Use for:

- Prisma queries
- Transactions
- RLS-sensitive behavior
- Service-layer workflows
- Webhook processing
- Background jobs
- External integration adapters

### 18.3 Component tests

Use for important interactive UI behavior.

### 18.4 End-to-end tests

Cover critical journeys:

- User signs in and accesses the correct property
- Lead is created and progressed
- Robin requests approval or acts correctly
- Content is created and published
- Finding becomes a ticket
- Completed work enters measurement review
- Cross-tenant access is denied

### 18.5 Every bug fix should consider a regression test

When a reproducible defect is fixed, add a test when practical.

---

## 19. Comments and Documentation

### 19.1 Comments explain why

Do not narrate obvious code.

Bad:

```ts
// Increment count
count += 1;
```

Good:

```ts
// Provider retries may deliver the same event, so the unique event ID
// must be stored before any downstream action is dispatched.
await recordWebhookReceipt(eventId);
```

### 19.2 Document non-obvious contracts

Use documentation for:

- Business invariants
- External provider quirks
- Security-sensitive behavior
- Retry and idempotency rules
- Important architectural tradeoffs

### 19.3 Keep documentation current

A feature is not complete if its implementation contradicts its documentation.

---

## 20. Dependency Policy

Before adding a dependency, confirm:

- The platform does not already provide the capability
- The dependency solves a real project need
- It is actively maintained
- It has an acceptable license
- It does not introduce excessive bundle size
- It does not duplicate an approved library
- Its API is stable and understandable
- The team can debug it

Prefer a small, well-known dependency over custom security-sensitive code.

Prefer a small local function over a dependency for trivial behavior.

Do not add packages without documenting their purpose.

---

## 21. Environment Variables and Secrets

### 21.1 Validate environment variables at startup

Use a typed environment schema.

Separate:

- Public browser variables
- Server-only variables
- Secrets
- Provider credentials
- Test variables

### 21.2 Never expose server secrets

Only variables intentionally prefixed for browser exposure may enter client bundles.

### 21.3 Keep environments isolated

Local, preview, staging, and production must not share:

- Databases
- Storage buckets
- OAuth credentials
- Webhook destinations
- Production secrets

---

## 22. Performance Standards

Optimize measured problems, not imagined problems.

Still, always:

- Paginate unbounded lists
- Avoid N+1 database queries
- Avoid loading unnecessary relations
- Keep client bundles small
- Use Server Components where practical
- Cache only when invalidation is understood
- Run slow work in background jobs
- Add indexes for real query patterns
- Avoid repeated external API calls

Document any deliberate performance tradeoff.

---

## 23. Feature Flags

Use feature flags for:

- Incomplete production work
- Gradual rollout
- Property-specific access
- Robin capability rollout
- Risky integration changes
- Shadow-mode Finding evaluation

Feature flags must not replace authorization.

Remove stale flags after rollout is complete.

---

## 24. Definition of Done

A feature is complete only when:

- Requirements are implemented
- MVP scope is respected
- TypeScript passes
- Linting passes
- Tests pass
- Inputs are validated
- Authorization is enforced
- Tenant isolation is preserved
- Error, loading, and empty states exist
- Important actions are logged or audited
- Database migrations are safe
- Documentation is updated
- No known critical defect remains
- The implementation can be explained by another developer

---

## 25. Codex Working Rules

Before changing code, Codex must:

1. Read the relevant product and architecture documents
2. Inspect existing patterns
3. Reuse established project conventions
4. Identify affected schemas, services, UI, tests, and documentation
5. Avoid unrelated refactors
6. Stay within the approved phase

Codex must not:

- Invent new architecture without documenting it
- Add dependencies silently
- Disable TypeScript or lint rules
- Bypass authorization
- Remove tests to make a build pass
- Rewrite unrelated modules
- Hide failures with broad try/catch blocks
- Leave temporary production shortcuts undocumented
- Expand MVP scope

After implementation, Codex must report:

- Files changed
- Migrations added
- Tests added or updated
- Commands run
- Validation performed
- Assumptions made
- Remaining risks
- Deferred work
- Known failures

---

## 26. Final Standard

When two approaches both work, choose the one that is:

1. Easier to read
2. Easier to test
3. Easier to debug
4. Safer across tenants
5. More consistent with the existing codebase
6. Less dependent on hidden behavior
7. Less abstract
8. Easier for the next developer to maintain

The BTLS codebase should feel familiar, orderly, and teachable.

A new developer should be able to answer:

- Where does this feature live?
- Where is this input validated?
- Where is permission enforced?
- Where is the database accessed?
- Where is the business rule implemented?
- How is failure handled?
- How is this tested?

If those answers are difficult to find, the code is not organized well enough.
