# BTLS Library Docs

> **Applies to:** BTLS Command Center, Web Growth Studio, Revenue Operations Studio, Robin, shared Work Management, integrations, and background jobs.
>
> **Repository location:** `context/library-docs.md`
>
> **Purpose:** Define how third-party libraries and provider SDKs are used in this project. This file records BTLS-specific patterns, restrictions, and ownership boundaries. It is not a replacement for official documentation.
>
> **Companion files:** `context/architecture.md` and `context/code-standards.md`

---

## 1. Before Using Any Library

Before implementing or changing code that uses a third-party library:

1. Read the relevant project context files.
2. Inspect the package version installed in `package.json` and the lockfile.
3. Check `AGENTS.md` for installed skills or project-specific instructions.
4. Use an available documentation MCP or official provider documentation for the installed version.
5. Read the relevant section of this file for BTLS-specific rules.
6. Inspect existing project usage before creating a new pattern.

Order of authority:

```text
Approved architecture decision
→ installed-version official documentation
→ project skills/MCP documentation
→ this file's BTLS usage rules
→ existing approved code patterns
→ general training knowledge
```

Never rely on memory alone for a third-party API.

### Version policy

- Exact versions are controlled by `package.json` and the lockfile.
- Use stable supported releases.
- Do not upgrade major versions during unrelated feature work.
- Major upgrades require an isolated task, migration notes, tests, and an architecture decision when behavior changes.
- Do not install two libraries that solve the same project problem without approval.

### Import policy

- Import from documented public package entry points.
- Do not import private or undocumented internal library files.
- Keep provider SDK imports inside their integration adapters.
- Feature modules should depend on BTLS-owned interfaces and normalized types.

---

# Core Application Libraries

## 2. Next.js App Router

**Package:** `next`

Next.js owns application routing, rendering, Server Components, Server Actions, Route Handlers, middleware, and deployment integration.

### Server Components

Server Components are the default for pages and non-interactive layout sections.

Use them for:

- Authenticated data reads
- Dashboard page composition
- Initial property context
- Static or server-rendered content
- Passing safe view models into Client Components

```tsx
export default async function LeadPage({
  params,
}: {
  params: Promise<{ propertyId: string; leadId: string }>;
}) {
  const { propertyId, leadId } = await params;

  const lead = await getLeadPageData({
    propertyId,
    leadId,
  });

  return <LeadDetail initialLead={lead} />;
}
```

Rules:

- Do not add `"use client"` to a page or large layout without a browser-only need.
- Do not expose raw Prisma records when a smaller view model is sufficient.
- Protected reads must resolve authenticated property access before querying.
- Keep provider SDK calls out of page components.

### Client Components

Use Client Components for:

- Event handlers
- Browser APIs
- Temporary local state
- Interactive tables and filters
- Dialogs and forms
- Realtime subscriptions

Rules:

- Client Components never authorize an operation.
- Client Components never receive secrets or provider tokens.
- Avoid turning an entire feature tree into client-rendered code.
- Keep durable workflow state on the server.

### Server Actions

Use Server Actions for authenticated first-party mutations initiated from the BTLS interface.

```ts
"use server";

export async function updateLeadAction(
  rawInput: unknown,
): Promise<ActionResult<LeadView>> {
  const input = updateLeadSchema.parse(rawInput);

  const context = await requirePropertyCapability({
    propertyId: input.propertyId,
    capability: "lead.update",
  });

  return updateLead({
    context,
    input,
  });
}
```

Rules:

- Validate input with Zod.
- Resolve authentication and authorization.
- Delegate business logic to an application service.
- Return a safe predictable result.
- Revalidate only affected paths or tags.
- Do not use Server Actions for public webhooks or provider callbacks.

### Route Handlers

Use Route Handlers for:

- Public form ingestion
- OAuth callbacks
- Twilio webhooks
- Postmark webhooks
- Google integration callbacks
- WordPress connection tests
- Health endpoints
- Conventional APIs required by an external client

Rules:

- Route Handlers remain thin.
- Validate signatures and payloads before business processing.
- Dispatch long-running work to Inngest.
- Use explicit HTTP status codes.
- Never trust a public `propertyId` without resolving it through a server-owned key or connection.

### Middleware

Middleware may:

- Refresh Supabase sessions
- Redirect unauthenticated users
- Apply broad route gating
- Add safe request context

Middleware must not:

- Replace service-level authorization
- Run database-heavy permission logic on every asset request
- Contain feature workflows

---

## 3. React

**Package:** `react`

React owns interface composition and interaction.

Rules:

- Prefer controlled complexity over generalized component frameworks.
- Keep feature business rules in services, not hooks or components.
- Use local state for local interface behavior.
- Use URL state for filters, tabs, and shareable views when practical.
- Do not copy server records into global state without a real need.
- Avoid effects for work that can happen during rendering, an event, or on the server.
- Clean up subscriptions and browser listeners.
- Components must expose loading, empty, error, disabled, and success behavior where relevant.

---

## 4. TypeScript

**Package:** `typescript`

TypeScript runs in strict mode throughout the project.

Project-specific rules are defined in `context/code-standards.md`.

Library-related rules:

- Use provider types only inside provider adapters.
- Convert provider responses into BTLS-owned types.
- Treat external input as `unknown` until validated.
- Avoid SDK types as database or feature-domain contracts.
- Never silence library type errors with broad `any`.
- Prefer explicit wrapper interfaces around unstable external APIs.

---

# Data, Auth, and Validation

## 5. Supabase JavaScript and SSR

**Packages:**

- `@supabase/supabase-js`
- `@supabase/ssr`

Supabase provides Auth, PostgreSQL hosting, Storage, and selective Realtime.

### Browser client

The browser Supabase client is limited to:

- Authentication/session support
- Approved Realtime subscriptions
- Direct upload through an authorized storage flow

Rules:

- Do not perform normal tenant CRUD directly from the browser.
- Never expose the service-role key.
- Do not treat an authenticated Supabase user as automatically authorized for a property.
- Realtime subscriptions must be property-scoped and backed by RLS.

### Server client

Use the SSR server client for:

- Reading and refreshing the current Supabase session
- Auth actions
- Invite and password-reset workflows
- User identity resolution

The application database remains the source of memberships, roles, capabilities, and property access.

### Service-role client

The service-role client is allowed only in tightly controlled server infrastructure.

Acceptable examples:

- Administrative onboarding
- Secure storage administration
- Verified background processing that cannot use a normal user session

Rules:

- Explicitly scope every tenant operation.
- Log sensitive administrative actions.
- Never place service-role code in a browser-importable module.
- Do not use service role merely to avoid writing correct RLS or authorization.

### Realtime

Realtime is optional for the MVP.

Use it selectively for interfaces where live updates materially improve work, such as:

- Active lead inbox
- Conversation messages
- Robin approval state

Do not add Realtime to static reporting or every dashboard by default.

---

## 6. Prisma

**Packages:**

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

Prisma is the primary server-side database-access and migration layer.

### Client initialization

Use one server-only Prisma client module.

```ts
import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { requireDatabaseRuntimeEnvironment } from "@/server/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const { databaseUrl } = requireDatabaseRuntimeEnvironment();
  const adapter = new PrismaPg({ connectionString: databaseUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Rules:

- Do not create Prisma clients throughout feature files.
- Never import Prisma into Client Components.
- Feature services and queries must scope tenant records by authorized `propertyId`.
- Use transactions for workflows that update multiple durable records.
- Avoid large indiscriminate relation includes.
- Paginate unbounded lists.
- Review dashboards for N+1 queries.

### Prisma 7 configuration

Use the `prisma-client` generator with an explicit generated-client output path. The committed
schema contains only the PostgreSQL provider; Prisma CLI configuration belongs in
`prisma.config.ts`.

`DIRECT_DATABASE_URL` is used by the Prisma CLI for migration operations. The runtime client uses
the restricted application `DATABASE_URL` through `PrismaPg`. Load `.env.local` before `.env` in
the Prisma config so local developer configuration remains private and takes precedence.

### Transactions

```ts
return prisma.$transaction(async (tx) => {
  const updatedLead = await tx.lead.update({
    where: {
      id: leadId,
    },
    data: {
      status: nextStatus,
    },
  });

  await tx.auditEvent.create({
    data: buildLeadStatusAuditEvent({
      context,
      updatedLead,
    }),
  });

  return updatedLead;
});
```

Rules:

- Keep transactions focused.
- Do not make slow provider API calls inside a database transaction.
- Publish durable background work after the source transaction succeeds.
- Use an outbox or durable dispatch pattern when losing an event would be unacceptable.

### Raw SQL

Use raw SQL only when Prisma cannot express the required PostgreSQL behavior cleanly.

Examples:

- RLS policy support
- Specialized reporting queries
- Data migrations
- PostgreSQL-specific features

Rules:

- Parameterize inputs.
- Preserve tenant scope.
- Validate returned rows.
- Add integration tests.
- Explain why Prisma was insufficient.

### Migrations

- Prisma owns ordinary schema migrations.
- Prisma 7 migration configuration, migration location, and seed command live in `prisma.config.ts`.
- Supabase-specific RLS SQL lives under `supabase/`.
- Do not define the same object in both migration systems.
- Never rewrite an applied migration.
- Verify migrations against an empty database and realistic existing data.

---

## 7. Zod

**Package:** `zod`

Zod validates runtime data at every server and external boundary.

Use it for:

- Server Action inputs
- Route Handler payloads
- Webhooks
- Environment variables
- Background-job payloads
- Provider responses where needed
- Robin tool arguments
- Stored versioned configuration

```ts
export const createLeadSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  email: z.string().email().nullable(),
  phone: z.string().trim().min(7).max(30).nullable(),
  service: z.string().trim().max(160).nullable(),
});
```

Rules:

- Place feature schemas near the owning feature.
- Reuse schemas across client and server only when the contract is truly identical.
- Use `.strict()` for provider/tool payloads when unknown properties are unsafe.
- Convert validation failures into safe field errors.
- Do not use TypeScript types as a substitute for runtime validation.

---

## 8. React Hook Form

**Packages:**

- `react-hook-form`
- `@hookform/resolvers`

React Hook Form manages complex interactive forms.

```tsx
const form = useForm<CreateLeadInput>({
  resolver: zodResolver(createLeadSchema),
  defaultValues,
});
```

Rules:

- Zod remains the source of validation truth.
- Server validation is still required.
- Use shared accessible form primitives.
- Preserve server field errors.
- Disable duplicate submission while a mutation is pending.
- Avoid using React Hook Form for trivial one-control interactions.

---

# Interface Libraries

## 9. Tailwind CSS

**Package:** `tailwindcss`

Tailwind is the primary styling method.

Rules:

- Use design tokens rather than arbitrary one-off values.
- Follow `context/ui-tokens.md` and `context/ui-rules.md`.
- Extract repeated interface patterns into components, not custom CSS classes alone.
- Keep responsive behavior explicit.
- Avoid unreadable class strings by grouping structural concerns and extracting real components.
- Do not use inline style objects except for calculated values that cannot be expressed otherwise.

---

## 10. shadcn/ui and Radix Primitives

**Packages:** Installed components and relevant `@radix-ui/*` packages

Use these for accessible foundational controls:

- Dialogs
- Dropdown menus
- Tabs
- Tooltips
- Selects
- Popovers
- Toasts
- Form controls

Rules:

- shadcn components are project-owned source files and may be adapted.
- Preserve keyboard interaction, focus management, and ARIA behavior.
- Do not create a second competing primitive library.
- Feature components belong in feature folders; generic primitives belong in `src/components/ui`.
- Avoid wrapping every primitive in unnecessary project abstractions.

---

## 11. TanStack Table

**Package:** `@tanstack/react-table`

Use TanStack Table for data-heavy operator views such as:

- Unified Lead Inbox
- Property overview tables
- Findings queues
- Work-ticket queues
- Content inventory

Rules:

- The table library owns table behavior, not data fetching.
- Use server-side pagination, sorting, and filtering for large datasets.
- Keep column definitions near the owning feature.
- Use stable row IDs.
- Persist only useful operator preferences.
- Do not render every record into the browser for client-side filtering.
- Every table needs loading, empty, error, and accessible row-action behavior.

---

## 12. Tiptap

**Packages:**

- `@tiptap/react`
- Approved Tiptap extensions only

Tiptap powers the Smart Blog Studio article editor.

### Stored format

Store editor content in a structured Tiptap/ProseMirror JSON document as the editable source.

Generate sanitized HTML for:

- Preview
- Publishing
- External CMS delivery

Rules:

- Do not store only raw editor HTML as the canonical editable document.
- Version content before significant publication changes.
- Whitelist approved extensions and node types.
- Sanitize generated or imported HTML.
- Do not install broad extension packs when only a few nodes are needed.
- Keep SEO metadata outside the editor document.
- Internal-link relationships and strategy fields remain separate records.
- Media nodes reference BTLS `MediaAsset` records rather than arbitrary upload URLs.

### MVP editor capabilities

- Paragraphs
- Headings
- Lists
- Blockquotes
- Links
- Images
- Basic emphasis
- Horizontal rules
- FAQ-compatible sections
- Undo/redo

Advanced collaboration and comments are outside MVP unless separately approved.

---

# Background Work and Observability

## 13. Inngest

**Package:** `inngest`

Inngest handles durable jobs, retries, schedules, and event-driven workflows.

Use it for:

- Google metric imports
- Data normalization
- Finding evaluation
- Content performance calculations
- Robin acknowledgments and follow-ups
- Notification delivery
- Measurement reviews
- Webhook follow-on processing
- Orphaned-file cleanup

### Event pattern

```ts
await inngest.send({
  name: "lead/created",
  data: {
    eventId,
    propertyId,
    leadId,
  },
});
```

Rules:

- Every event and function payload has a Zod schema.
- Every tenant job includes `propertyId`.
- Jobs must be safe to retry.
- Use idempotency keys for side effects.
- Do not put large provider payloads directly in events.
- Store durable source facts before dispatching jobs.
- Use explicit concurrency limits for provider APIs.
- Log and surface repeated failures.
- Do not run long analytics imports or AI work in web requests.

---

## 14. Sentry

**Packages:** Relevant Sentry Next.js package

Sentry captures application errors, important traces, releases, and production diagnostics.

Rules:

- Initialize through the documented Next.js integration.
- Tag errors with feature, operation, property ID, and job/request ID when safe.
- Never send secrets, auth tokens, message bodies, or sensitive lead data by default.
- Filter expected application errors from noisy error reporting.
- Capture provider failures with safe metadata.
- Associate releases with deployments.
- Sentry does not replace structured logs or durable audit events.

---

## 15. Pino-Compatible Structured Logger

**Package:** Selected Pino package and approved transport

Use structured logging for server, webhook, integration, and job operations.

```ts
logger.info(
  {
    propertyId,
    leadId,
    source,
  },
  "Lead created",
);
```

Rules:

- Use structured fields, not interpolated paragraphs.
- Include request, job, webhook, or Robin run IDs.
- Redact secrets and sensitive fields centrally.
- Do not use `console.log` in production application paths.
- Audit events remain separate durable records.

---

# AI and Communication Providers

## 16. OpenAI SDK

**Package:** `openai`

The OpenAI SDK is used behind `src/server/integrations/openai`.

Feature modules and Robin tools do not instantiate provider clients directly.

### Structured output

Use schema-constrained structured output or tool calling for:

- Lead extraction
- Qualification result
- Suggested next action
- Plain-language Finding explanation
- Ticket draft
- Content planning assistance

Rules:

- Model names are configured centrally, not scattered in feature code.
- Every structured result is runtime validated.
- Treat model output as untrusted input.
- Do not give the model database credentials or unrestricted query tools.
- Do not let AI decide tenant access or application permissions.
- Preserve prompt, tool, Knowledge Pack, and model versions for material Robin runs.
- Use lower-variance settings for extraction, classification, and tool selection.
- Use creative generation only where the product explicitly needs it.
- Never claim a Finding or intervention succeeded based only on model text.
- Avoid sending unnecessary personal or sensitive data.

### Robin tool pattern

```text
Model proposes typed tool action
→ Zod validation
→ property and capability check
→ automation-mode check
→ duplicate/consent/business-hours check
→ normal application service
→ persisted result and audit trail
```

---

## 17. Postmark

**Package:** `postmark`

Postmark is the BTLS outbound email provider for MVP.

### MVP scope

Included:

- Transactional system email
- Lead acknowledgment email
- Robin-approved outbound email
- Employee notifications
- Delivery and bounce status handling

Deferred:

- Inbound email synchronization
- Full mailbox behavior
- Reply ingestion into the Command Center

### Sending pattern

All sends go through the BTLS email adapter.

```ts
export interface EmailProvider {
  sendTransactionalEmail(
    input: TransactionalEmailInput,
  ): Promise<EmailDeliveryResult>;
}
```

Use Postmark templates for stable system messages such as:

- Invitations
- Account notifications
- Standard acknowledgments
- Scheduled reminders

Use a validated direct transactional body when Robin generates approved conversational content.

Rules:

- Use the official Node SDK.
- Use the Transactional Message Stream for operational mail.
- Store the Postmark `MessageID` for delivery correlation.
- Provide both HTML and plain-text content where applicable.
- Do not expose the server token.
- Do not call Postmark directly from feature components or Robin.
- Respect client/property sender configuration.
- Separate system identity from client-facing reply addresses.
- Treat bounce and delivery webhooks as idempotent provider events.
- Outbound-only MVP means customer replies are not imported into BTLS.

### Webhooks

Use Postmark webhooks for delivery, bounce, spam complaint, and related outbound status when useful.

Webhook handlers must:

- Validate the request using the approved Postmark security method/configuration.
- Validate the payload.
- Store provider event identifiers.
- Prevent duplicate processing.
- Update delivery state.
- Dispatch long follow-up work to Inngest.

---

## 18. Twilio Programmable Messaging

**Package:** `twilio`

Twilio provides two-way SMS for Robin and human lead communication.

### MVP operating model

- One Twilio Messaging Service for the BTLS application or controlled environment.
- A dedicated SMS-capable number assigned to each participating client property.
- The property-number mapping is stored in BTLS.
- Inbound and outbound messages appear in the lead conversation timeline.
- Robin uses the same approved messaging tools as human-triggered automation.
- MMS may be accepted for customer images only when storage and safety handling are enabled.

### Outbound pattern

```ts
export interface SmsProvider {
  sendMessage(input: {
    propertyId: string;
    to: string;
    body: string;
    mediaUrls?: string[];
    idempotencyKey: string;
  }): Promise<SmsDeliveryResult>;
}
```

Rules:

- Normalize telephone numbers to E.164.
- Resolve the sending number or Messaging Service from the property configuration.
- Store the Twilio Message SID.
- Configure delivery-status callbacks.
- Check consent and opt-out state before every automated send.
- Do not send directly from React components, Server Actions, or AI code.
- Use an application service and durable job for automated sends.
- Prevent duplicate sends through idempotency.
- Respect property business hours and Robin operating mode.

### Inbound webhook pattern

```text
Twilio inbound webhook
→ verify Twilio signature
→ validate normalized payload
→ store webhook receipt
→ resolve property from destination number
→ match or create conversation/contact as allowed
→ store inbound message
→ update consent/opt-out state
→ dispatch Robin or human-notification job
→ return promptly
```

Rules:

- Use Twilio's official request-validation helper.
- Trust neither `From` nor `To` until validation succeeds.
- Resolve the property from a server-owned phone-number mapping.
- Store media references only after controlled import and validation.
- Do not perform the full Robin response inside the webhook request.
- Correlate duplicate webhooks by provider identifiers.

### Consent and messaging compliance

The system must support:

- Recorded SMS consent source and time
- STOP/START/HELP behavior
- Twilio Messaging Service opt-out handling
- Internal suppression state
- Quiet/business-hour controls
- Required sender registration and campaign configuration
- Clear human override

Do not ship automated US application-to-person messaging until required registration and compliance setup is complete.

---

## 19. Cronofy

**Provider:** Cronofy API through a BTLS adapter

Cronofy provides calendar connection, availability, and approved scheduling.

Use it for:

- Connected calendar accounts
- Availability lookup
- Booking approved appointment types
- Calendar event creation
- Rescheduling and cancellation where supported

Rules:

- Keep Cronofy credentials and tokens server-only.
- Store external profile/calendar identifiers in the property/user integration records.
- Normalize availability and event data into BTLS-owned types.
- Store the external event ID after creation.
- Use idempotency for scheduling.
- Confirm time zone explicitly.
- Robin may schedule only approved workflow steps and configured appointment types.
- Do not assume a calendar write succeeded until the provider response is persisted.
- Provider outage creates a human handoff rather than repeated customer promises.

---

# Google Data Integrations

## 20. Google API Client

**Package:** `googleapis` or approved official Google client packages

Google provider code lives under dedicated adapters:

```text
src/server/integrations/google-analytics/
src/server/integrations/search-console/
src/server/integrations/google-business-profile/
```

Common rules:

- Use server-side OAuth.
- Encrypt or securely reference refresh tokens.
- Store granted scopes and external property identifiers.
- Refresh tokens inside the adapter.
- Use provider-specific rate limits and retry policies.
- Keep raw provider fields out of feature-domain code.
- Store normalized snapshots and sync health.
- Treat Google data as delayed and potentially incomplete.
- Do not infer individual visitor identity from aggregate reporting data.

---

## 21. Google Analytics Data API

Use for:

- Sessions and users
- Landing pages
- Traffic sources
- Device categories
- Engagement
- Configured key events
- CTA/form/booking events when implemented

Rules:

- Store the GA4 property ID on the BTLS integration connection.
- Query only approved dimensions and metrics.
- Normalize URLs before matching pages.
- Preserve requested period and import timestamp.
- Avoid repeated live API requests while rendering dashboards.
- Import and persist reporting snapshots through background jobs.
- Handle thresholding, missing data, and reporting differences honestly.
- GA4 events must follow the BTLS event taxonomy.

---

## 22. Google Search Console API

Use for:

- Search impressions
- Clicks
- CTR
- Average position
- Queries
- Pages
- Device and country breakdowns when needed

Rules:

- Store the verified Search Console property identifier.
- Use normalized page URLs.
- Preserve date period and dimensions.
- Expect hidden or omitted low-volume query data.
- Do not promise exact user-level query attribution.
- Import through scheduled jobs.
- Use longer periods when small-business volume is insufficient.
- Keep raw and derived metrics distinguishable.

---

## 23. Google Business Profile APIs

Use for:

- Profile performance
- Website clicks
- Calls and other available interactions
- Local search visibility
- Aggregate search keyword context
- Connected location identity

Rules:

- Store the relevant account and location IDs.
- Treat keyword information as aggregate context.
- Tag the profile website link for website-session attribution when supported.
- Never claim an exact GBP query belongs to an individual lead.
- Import through scheduled jobs.
- Surface connection or permission failures through Data Health.

---

# Publishing and Website Compatibility

## 24. BTLS Publishing Adapter

Smart Blog Studio publishes through a BTLS-owned interface.

```ts
export interface ContentPublisher {
  testConnection(): Promise<PublishingConnectionResult>;

  publishContent(
    input: PublishContentInput,
  ): Promise<PublicationResult>;

  updateContent(
    input: UpdatePublishedContentInput,
  ): Promise<PublicationResult>;
}
```

Initial implementations:

1. BTLS-built website adapter
2. WordPress REST API adapter
3. Manual/export fallback

Smart Blog Studio must not contain provider-specific publishing logic.

---

## 25. BTLS-Built Website Publishing

This is the primary and most predictable publishing target.

The adapter may publish by:

- Writing to a shared content API
- Creating/updating a content record consumed by the BTLS-built website
- Triggering path revalidation
- Returning the final published URL and external identifier

Rules:

- Publishing is authenticated server to server.
- Property ownership is verified.
- Published content references durable public media URLs.
- Slug conflicts are handled explicitly.
- Publication is idempotent.
- Existing content is updated through the stored external publication ID.
- The adapter returns a normalized publication result.

---

## 26. WordPress REST API

WordPress is a supported MVP publishing option with a deliberately limited scope.

### Authentication

Use WordPress Application Passwords over HTTPS for the MVP adapter.

Store:

- WordPress site base URL
- Publishing username or user identifier
- Encrypted application password/credential reference
- Connection status
- Last tested time
- Supported capability result

Do not store the user's primary WordPress password.

### Supported MVP behavior

The adapter may:

- Test REST API access
- Create a native WordPress post
- Update a previously published native post
- Set title
- Set slug
- Set status
- Set excerpt
- Set HTML content
- Assign supported categories and tags
- Upload and attach featured media
- Store the returned post ID and URL

### Explicit compatibility boundary

The MVP adapter does not promise automatic compatibility with:

- Elementor layouts
- Divi layouts
- WPBakery layouts
- Arbitrary page builders
- Custom ACF field layouts
- Custom post types without explicit configuration
- Plugin-specific SEO schemas
- Theme-specific content blocks
- Custom editorial workflows
- Unsupported authentication plugins

When a WordPress installation is incompatible, Smart Blog Studio uses the manual/export fallback rather than creating site-specific custom code inside the core product.

### Publishing rules

- Test connection and permissions before enabling publish.
- Require HTTPS.
- Sanitize and convert Tiptap content into WordPress-safe HTML.
- Upload media through the WordPress media endpoint when needed.
- Store the WordPress post ID.
- Use the stored post ID for updates.
- Do not identify posts only by slug.
- Treat partial media/post failures explicitly.
- Avoid installing a custom WordPress plugin unless later requirements prove it necessary.

### Feasibility ruling

Native WordPress post publishing through the REST API is an acceptable MVP addition because it remains behind the common publishing adapter. Advanced WordPress ecosystem compatibility is deferred.

---

## 27. Public Lead Ingestion

The core integration is a BTLS public form-ingestion endpoint.

Supported sources:

1. BTLS React forms
2. Direct documented server request
3. WordPress form adapter/plugin or webhook configuration

All sources call the same Revenue Operations lead-creation service.

### Public endpoint rules

- Use a revocable public form key, not a privileged property ID.
- Apply Turnstile, honeypot, validation, and rate limits.
- Accept an idempotency/submission identifier.
- Map allowed form fields through a property form configuration.
- Reject unknown privileged fields.
- Preserve permitted source, landing page, and UTM values.
- Return a generic safe response.
- Create the lead only through the shared application service.

### WordPress lead compatibility

Prefer a light integration:

- Existing WordPress form tool sends a webhook to BTLS, or
- A minimal BTLS plugin/component posts to the public ingestion endpoint.

Do not require WordPress to understand BTLS database models.

---

## 28. Cloudflare Turnstile

**Package:** Approved Turnstile client helper or direct documented integration

Use Turnstile on public lead and contact forms.

Rules:

- Verify the token server-side with Cloudflare.
- Bind verification to the intended action where supported.
- Do not accept a client-side success callback as proof.
- Combine Turnstile with honeypot, rate limiting, validation, and duplicate detection.
- Fail safely when verification is unavailable.
- Log verification failures without storing unnecessary visitor data.
- Provide an accessible user-facing retry path.

---

# Utilities

## 29. date-fns

**Package:** `date-fns`

Use date-fns for predictable application date calculations and formatting.

Rules:

- Store timestamps in UTC.
- Preserve the property time zone.
- Convert to local time only at display or business-rule boundaries.
- Pass explicit dates rather than depending on mutable global time.
- Use fake/system time in tests for scheduled behavior.
- Do not mix several date libraries.

---

## 30. Formatting and Phone Utilities

Prefer small project-owned formatting functions for:

- Currency
- percentages
- phone display
- names
- metric values
- relative labels

Use a dedicated maintained phone-number library only if required for robust E.164 parsing and validation.

Rules:

- Do not build custom international phone parsing with regular expressions.
- Store canonical phone values separately from display formatting.
- Store money as integer cents and format through `Intl.NumberFormat`.

---

# Testing Libraries

## 31. Vitest

**Package:** `vitest`

Use Vitest for:

- Pure unit tests
- Feature service tests
- Finding rules
- Metric calculations
- Validation
- Permission functions
- Provider normalization
- Robin policy logic

Rules:

- Tests must be deterministic.
- Mock external providers at adapter boundaries.
- Do not mock the function under test.
- Prefer representative factories over large opaque fixtures.
- Use a real test database for behavior that depends on Prisma or constraints.

---

## 32. React Testing Library

**Packages:**

- `@testing-library/react`
- `@testing-library/user-event`
- Relevant DOM matchers

Use for important interactive component behavior.

Rules:

- Test the interface as a user interacts with it.
- Prefer roles and labels over implementation selectors.
- Avoid testing private component state.
- Verify loading, errors, validation, keyboard behavior, and disabled states.
- Do not duplicate end-to-end tests for every visual detail.

---

## 33. Playwright

**Package:** `@playwright/test`

Use for critical full-product journeys.

Required areas include:

- Authentication
- Property access
- Cross-tenant denial
- Public lead submission
- Lead progression
- Robin approval/automatic modes
- Content creation and publication
- Finding-to-ticket flow
- Before-and-after measurement visibility

Rules:

- Use isolated test accounts and properties.
- Avoid production data.
- Use stable role/label selectors or approved test IDs.
- Mock external providers only where real sandbox testing is impractical.
- Keep a small dependable critical suite rather than a large brittle suite.

### Runtime and readiness model

Use two explicit Playwright modes:

1. **Authoritative suite** â€” runs the application from a production Next.js build and is the CI or release-gating result.
2. **Development diagnostic suite** â€” may run against `next dev` for fast local feedback, but HMR, compilation, and refresh behavior are diagnostic context rather than correctness signals.

`pnpm test:e2e` is the production-backed authoritative suite. Guarded development-status routes are verified through `pnpm test:e2e:dev`, which remains diagnostic because those routes intentionally return `notFound()` from a production server.

For interactive pages, navigation completion does not prove React hydration. Before a test's first interaction:

- wait for a shared hydration-ready helper or an established user-visible client-ready condition;
- keep the condition semantic and local to the page or shell, rather than inspecting private React state;
- do not add arbitrary waits or outcome-retry loops to compensate for an unhydrated page.

The preferred long-term pattern is one BTLS-owned readiness helper used by client-interactive E2E tests. A temporary page-specific condition is acceptable only when it clearly demonstrates client interactivity and is covered by the test's user-visible workflow.

### Failure evidence

- Configure trace and video retention for failed tests.
- In shared Playwright fixtures, collect browser console errors, uncaught page errors, and failed network requests with the test artifact output.
- When diagnosing a browser-only failure, compare those artifacts with trigger state and the client-ready condition before changing application components.
- Keep browser selectors role-, label-, or approved-test-ID-based; do not use framework-private hydration selectors.

---

# Dependency Decisions and Deferred Libraries

## 34. Approved Direction

The expected library/provider set is:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix
- Supabase JavaScript and SSR
- Prisma
- Zod
- React Hook Form
- TanStack Table
- Tiptap
- Inngest
- OpenAI SDK
- Postmark
- Twilio
- Cronofy
- Google official API clients
- Cloudflare Turnstile
- Sentry
- Pino-compatible logging
- date-fns
- Vitest
- React Testing Library
- Playwright

## 35. Deferred

Do not add MVP dependencies for:

- Inbound email synchronization
- General campaign management
- Paid-ad platform ingestion
- Advanced call attribution
- Cross-session identity stitching
- Predictive analytics
- Full project management
- Real-time collaborative article editing
- Arbitrary WordPress page-builder support
- Automatic site code modification

## 36. Final Rule

Before adding or using a library, a developer should be able to answer:

- What problem does it solve in BTLS?
- Which architectural layer owns it?
- Is there already an approved library for that problem?
- How is tenant scope preserved?
- How is external input validated?
- How does failure behave?
- How is it tested?
- Can the rest of the application depend on a BTLS-owned interface instead of the provider directly?

If those answers are unclear, implementation should pause before introducing the dependency.
