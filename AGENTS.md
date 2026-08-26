# AGENTS.md

## Project

**BTLS Command Center** is a greenfield, multi-tenant SaaS platform for local service businesses and BTLS operators.

The MVP contains three product studios and one shared execution feature:

### Web Growth Studio

1. Website Intelligence
2. Smart Blog Studio
3. Content Intelligence

### Revenue Operations Studio

4. Revenue Operations / Command Center
5. Robin AI Automation Agent

### Search Operations Studio

6. Search Operations / Fulfillment

### Shared

**Work Management** is shared by Website Intelligence, Content Intelligence, and Search Operations.

Build one shared application, backend, database, and permission system for all client properties.

---

## Authoritative Context

Before planning or implementing work, read the relevant files in this order:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/build-plan.md`
4. `context/code-standards.md`
5. `context/library-docs.md`
6. `context/ui-tokens.md`
7. `context/ui-rules.md`
8. `context/ui-registry.md`
9. `context/progress-tracker.md`
10. `memory.md`, when restored by `/remember`

These files are authoritative.

Search Operations is governed by the Search Operations sections integrated into canonical `context/architecture.md` and Phase 11 of canonical `context/build-plan.md`. Do not create or rely on a second parallel Search Operations architecture or build plan.

Do not override the canonical context based on convenience, framework defaults, generated patterns, or assumptions.

When two context files appear to conflict:

1. Stop implementation.
2. Identify the exact conflict.
3. Recommend the smallest resolution.
4. Do not silently choose one interpretation.

---

## Required JSM Skill Loop

Use the JSM Skills throughout development.

### Start of session

Run:

```text
/remember restore
```

Confirm the restored state before continuing.

### Before building a feature

Run:

```text
/architect
```

Use it to:

- Inspect the current repository
- Read the relevant context
- Confirm the requested feature boundary
- Identify dependencies
- Define implementation slices
- Define tests
- Confirm the exit gate

Do not implement before the plan is approved.

### After building UI

Run:

```text
/imprint
```

Use `/imprint [file]` when reviewing a specific reusable component.

Use `/imprint audit` after the Shared UI Foundation and at major UI checkpoints.

Update `context/ui-registry.md` when a reusable visual pattern is approved.

### After building a feature

Run:

```text
/review
```

Review:

1. Plan alignment
2. System integrity
3. Production readiness

Fix meaningful findings and review again before shipping.

### When work goes wrong

Run:

```text
/recover
```

Do not continue stacking speculative patches.

Use the result to choose:

- Targeted fix
- Hard reset
- Architectural rethink

### End of session

Run:

```text
/remember save
```

Update `context/progress-tracker.md` before saving session memory.

---

## Unit of Work

Work on **one numbered feature from `context/build-plan.md` at a time**.

A numbered feature may be divided into smaller implementation slices.

Do not:

- Start the next numbered feature
- Build an entire phase in one uncontrolled pass
- Implement unrelated cleanup
- Expand the MVP
- Add speculative future systems

The current feature remains incomplete until every approved slice and its exit gate pass.

---

## Branch and Commit Rules

Use one branch per numbered feature.

Recommended naming:

```text
feature/01-repository-tooling
feature/09-unified-lead-inbox
feature/23-website-intelligence-interface
```

Rules:

- Begin from a clean branch.
- Keep commits focused and understandable.
- Do not combine unrelated features.
- Do not leave incomplete migrations on the main branch.
- Keep the main branch deployable.
- Do not commit secrets, provider tokens, local credentials, or production data.

---

## Planning Requirements

Before editing files, provide a concise implementation plan containing:

1. Current repository state
2. Objective
3. User-visible result
4. In-scope behavior
5. Explicitly out-of-scope behavior
6. Files expected to change
7. Data and migration impact
8. Authorization and tenant boundaries
9. Events, jobs, or integrations involved
10. UI states
11. Tests
12. Risks
13. Implementation slices
14. Exit gate

Do not create a new product architecture inside a feature plan.

---

## Implementation Rules

### General

- Favor readable, explicit code over clever abstractions.
- Follow existing approved patterns before inventing new ones.
- Keep feature code inside the owning feature.
- Keep provider SDKs behind BTLS-owned adapters.
- Validate external data and mutation input with Zod.
- Use strict TypeScript.
- Do not use broad `any`.
- Do not hide failures.
- Do not claim work is complete because code was generated.

### Business logic

Business rules belong in reusable server-side services, not:

- React components
- Client hooks
- Route files
- Server Actions
- Provider adapters

Web interfaces call reusable application services.

This is required so Revenue Operations can later support a dedicated mobile client without duplicating business logic.

### Web and future mobile boundary

The current product is a responsive web application.

Revenue Operations launches as a web beta.

A future mobile application is post-MVP.

Therefore:

- Do not build the mobile application now.
- Do not add mobile-framework dependencies now.
- Keep Revenue Operations workflows reusable by future API routes.
- Do not make browser URL state the source of business truth.
- Support pagination and incremental loading.
- Keep field-critical workflows usable on mobile web.
- Keep file architecture compatible with future camera uploads and attachments.
- Keep notification delivery behind an adapter for future push support.

### Tenant isolation

Every property-owned operation must:

1. Resolve the authenticated user.
2. Resolve the authorized property.
3. Check the required capability.
4. Scope every read and mutation to that property.
5. Preserve property scope in events and background jobs.

Never trust a browser-supplied `propertyId` by itself.

Never rely on hidden navigation as authorization.

Add cross-tenant tests for every important property-owned feature.

### Database

- Prisma is the primary server-side database layer.
- Supabase provides PostgreSQL hosting, Auth, Storage, and selected Realtime.
- PostgreSQL RLS supplements server authorization.
- Use transactions for multi-record durable workflows.
- Do not call slow external providers inside database transactions.
- Never rewrite an applied migration.
- Add indexes and constraints deliberately.
- Explain destructive or irreversible migration risks before implementation.

### External providers

Approved providers include:

- Supabase
- Prisma
- Inngest
- OpenAI
- Postmark
- Twilio
- Cronofy
- Google APIs
- Cloudflare Turnstile
- WordPress REST API
- Sentry
- Pino-compatible logging
- Vercel

Do not add a new major provider or overlapping library without approval.

Search Operations may define and consume BTLS-owned interfaces for keyword metrics, organic ranks, local rank grids, site inspection, page performance, local presence, citations, backlinks, call attribution, and site optimization. A concrete new paid Search provider still requires the approved architecture/library decision for its owning feature.

Use current official documentation for the installed version.

### AI and Robin

Robin acts only through approved typed tools.

Required flow:

```text
Model proposes action
→ runtime validation
→ property authorization
→ capability check
→ operating-mode check
→ consent and duplicate checks
→ application service
→ persisted result and audit trail
```

Robin must not:

- Query the database freely
- Modify records directly
- Bypass application services
- Decide permissions
- Send unapproved messages in Approval Required mode
- Present possible causes as proven facts
- Act outside the property Business Knowledge Pack and enabled capabilities

### Communication

- Postmark is outbound-only email for MVP.
- Twilio provides two-way SMS.
- Inbound email synchronization is deferred.
- Respect consent, opt-out state, business hours, and duplicate protection.
- Store provider identifiers and delivery outcomes.
- Process provider webhooks idempotently.

### Publishing

Publishing targets:

1. BTLS-built websites
2. Supported native WordPress posts through the REST API
3. Manual/export fallback

Do not promise compatibility with arbitrary WordPress page builders, custom layouts, or unsupported plugins.

### Search Operations

Search Operations is a fulfillment/orchestration system, not an unrestricted autonomous SEO agent.

Required rules:

- Treat `SearchTarget` as the strategic search unit.
- Keep `WebsitePage` as discovered page identity; Search-specific semantics belong in Search Operations records.
- Reuse shared Findings, Work Management, Interventions, and Measurement Reviews rather than creating parallel systems.
- Keep organic rank tracking, local rank grids, Search Console evidence, technical audits, and business outcomes as distinct evidence sources.
- Keep provider SDKs behind BTLS-owned Search provider interfaces.
- Track provider-intensive Search usage against program policy and quotas.
- A fulfilled Search cycle proves agreed work was delivered; it does not prove rankings or revenue improved.
- Search strategy, consequential content/page decisions, and unsupported external-site changes remain human-controlled.

#### Search optimization authority

Do not implement unbounded or AI-directed automatic website modification.

Search Operations execution classes are:

```text
AUTO_GUARDED
APPROVAL_REQUIRED
HUMAN_ONLY
UNSUPPORTED
```

`AUTO_GUARDED` is allowed only when all applicable safeguards pass:

- the property is on a supported BTLS-managed site;
- the site adapter declares the capability;
- the operation is explicitly allowlisted;
- the property automation policy permits it;
- inputs are deterministic and runtime-validated;
- the action is idempotent;
- the action is traceable and auditable;
- conflicting active work is checked;
- rollback or reversal exists where risk requires it;
- no human strategy decision is required.

AI may propose, classify, explain, or draft. AI never grants itself execution authority.

---

## UI Rules

Use:

- `context/ui-tokens.md`
- `context/ui-rules.md`
- `context/ui-registry.md`

Required principles:

- Dark mode is the default.
- Light and system themes are supported.
- Use semantic tokens only.
- Do not use raw Tailwind palette colors in product components.
- Do not hardcode client colors.
- Use approved shared components before creating new ones.
- Include loading, empty, error, disabled, and success states.
- Preserve keyboard access and visible focus.
- Verify desktop, tablet, and mobile behavior.
- Do not use charts as decoration.
- Do not display AI suggestions as approved facts.

### Client branding

The BTLS theme is always the fallback.

A client property may override only the approved brand-accent token family.

Brand configuration lives in PostgreSQL.

Brand files such as logos and favicons live in Supabase Storage.

Client branding must not change:

- Success, warning, danger, or informational meaning
- Robin’s intelligence identity
- Typography
- Layout
- Spacing
- Radius
- Accessibility requirements

Cross-property BTLS screens retain the default BTLS interface theme.

---

## MVP Boundaries

Do not add:

- Campaign management
- General funnel mapping
- General funnel leak detection
- Advertising management
- Advanced multi-touch attribution
- Predictive analytics
- Cross-client benchmarking
- Full project-management features
- Unbounded or AI-directed automatic website modification
- Inbound email synchronization
- Arbitrary WordPress page-builder support
- Unrestricted AI autonomy
- A mobile application during the current build

When requested work implies one of these areas, report the conflict before implementation.

---

## Testing and Verification

Run focused tests during implementation.

Before declaring a numbered feature complete, run the repository’s required equivalents of:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run end-to-end tests when the feature affects a critical user journey.

Critical areas require tests for:

- Authentication
- Authorization
- Cross-tenant denial
- Public lead ingestion
- Lead lifecycle transitions
- Robin approval and automatic modes
- Messaging consent and opt-out
- Content publishing
- Finding generation
- Finding-to-ticket flow
- Before-and-after measurement
- Search page/target ownership and cross-tenant denial
- Organic/local ranking normalization and provider-failure behavior
- Search fulfillment-cycle requirements
- Search optimization policy, approval, idempotency, and unsupported-site denial
- Fleet Remediation property isolation

Do not disable tests, lint rules, strict typing, RLS, or authorization to make checks pass.

---

## Completion Requirements

A feature is complete only when:

- Approved behavior is implemented
- The user-visible workflow works
- Input validation exists
- Authorization and property scope are enforced
- Failure states are handled
- Required tests pass
- Type-check passes
- Lint passes
- Production build passes
- Relevant UI patterns are imprinted
- `context/progress-tracker.md` is updated
- The build-plan exit gate is explicitly evaluated
- `/review` finds no unresolved critical or high-severity issue

---

## Required Completion Report

At the end of each numbered feature, report:

- Phase and feature
- Feature slices completed
- Files created
- Files changed
- Schema changes
- Migrations
- Dependencies added
- Events and background jobs
- Integrations affected
- Tests added or changed
- Commands run
- Manual verification
- UI imprint updates
- Context files updated
- Assumptions
- Known issues
- Deferred work
- Review findings
- Exit-gate result
- Recommended next feature

Do not mark the next feature as started.

---

## Decisions the Agent May Make

Make ordinary implementation decisions independently when they follow existing context and patterns.

Examples:

- File and function names
- Small component extraction
- Test fixture structure
- Local helper placement
- Clear accessible labels
- Conventional error handling
- Routine loading and empty states
- Obvious indexes or validation limits

Prefer the simplest maintainable choice.

---

## Decisions Requiring a Stop

Stop and report before proceeding when work requires:

- Scope expansion
- A new major dependency
- A new paid provider
- A destructive migration
- A change in schema ownership
- A change in tenant isolation
- A change in authentication strategy
- A change in AI authority
- A security or privacy compromise
- A contradiction between context files
- A material change in user-facing behavior
- Removal or weakening of required tests
- An inability to satisfy the current exit gate

Ask only about genuine product or architectural blockers.

Do not ask the user to decide ordinary implementation details.

---

## Documentation Discipline

Update documentation only when needed.

- Update `progress-tracker.md` after every implementation session.
- Update `ui-registry.md` after approving reusable UI patterns.
- Update `architecture.md` only when a binding architecture decision changes.
- Keep Search Operations architecture inside canonical `context/architecture.md`; do not create a competing standalone governing architecture.
- Update `library-docs.md` only when an approved library pattern changes.
- Update `ui-tokens.md` or `ui-rules.md` only when the design system changes.
- Do not regenerate whole context files to make a small edit.
- Preserve established terminology.

---

## Current Implementation Target

Do not hardcode the next feature in this file.

At the start of each implementation session:

1. Read `context/progress-tracker.md`.
2. Confirm the next not-started numbered feature against `context/build-plan.md`.
3. Run `/architect` for that feature.
4. Do not begin implementation until the feature plan is approved.
5. Do not advance to the following numbered feature until the current feature exit gate passes.

As of the current reconciled context, Features 01–05 are complete and Feature 06 — Storage and Media is the next implementation target. If `context/progress-tracker.md` changes later, the tracker controls.
