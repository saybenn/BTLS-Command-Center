# Feature 08 — Approved implementation plan
Approved 2026-09-14. Phase 4, branch feature/08-customer-workforce-and-revenue-settings-foundation.
Baseline: clean branch at merged Feature 07; Features 01–07 complete.

## Objective and visible result
Property-scoped Customer/person Contact directory and detail, optional locations/assets/tags,
employee administration, Revenue defaults and shared offered services. One feature only.

## Binding decisions
Customer is an end customer, not ClientAccount. Contact is a person. ServiceLocation is
customer work context, not BusinessLocation. Relationship states: PROSPECT/CURRENT/INACTIVE.
EmployeeProfile is separate from optional AppUser and never grants access.
PropertyService remains shared. MediaAsset byte ownership remains unchanged.
Revenue settings reference eligible shared SendingIdentity, never credentials/verification.
Matching is advisory and human-reviewed; names/endpoints never silently merge people.
Phone parsing uses approved libphonenumber-js; canonical E.164 is separate from display.
Correct shared TableShell to muted 12px medium sentence case; regression-check all consumers.

## Permission bundles
BTLS administrator and Client owner manage all four areas.
BTLS operator manages Customers; views Employees, Revenue settings, PropertyService.
Client manager manages Customers, Employees, PropertyService; views Revenue settings.
Client staff/viewer receive no Feature 08 directory/administration capabilities.
Check capabilities and explicit platform counterparts; preserve existing property authorization.

## Slices
08.1 Shared PropertyService prerequisite, capabilities, migrations/RLS, shared table correction.
08.2 Customer/Contact vertical UI/service slice, relationship state and primary contact.
08.3 Safe matching, duplicate review and repeated-submission protection.
08.4 Optional ServiceLocation/ServiceAsset and Tag definitions/CustomerTag assignments.
08.5 Employee directory/profiles and eligible optional AppUser association.
08.6 Revenue defaults and nullable active BTLS_MANAGED SendingIdentity selection.
08.7 Verification, imprint, review, exit gate and documentation.

## Files and data
Prisma schema/new additive migrations; supabase/security-migrations; authorization;
src/features/revenue-operations; shared src/server/properties services; property routes and
navigation; unit/integration/E2E tests; package/lockfile; relevant context and memory.
Same-property relational constraints, indexes, optimistic revisions, transactional audit.
No applied migration rewrites or destructive reset of existing data.

## Events, dependencies and exclusions
Reuse AuditEvent. No new jobs, notifications, sends or unused event handlers.
Add approved react-hook-form, @hookform/resolvers, @tanstack/react-table, libphonenumber-js.
Exclude Leads, communications, RevenueActivity/notes, scheduling, TimeEntry, commercial
records, payroll, Robin, Search implementation, address providers, new media systems.

## UI and tests
Shared components, all loading/empty/no-results/error/disabled/success states, dirty-form
protection, paginated lists, mobile lists, keyboard and dark/light/system themes.
Test semantic ownership, person contracts, ambiguous matching, duplicate submissions,
same-customer links, employee/login separation, sender restrictions, cross-tenant denial,
RLS/capability parity, migrations on clean and existing databases, production browser journeys.
Commands: pnpm typecheck, lint, test, test:database, db:validate, build, test:e2e; git diff --check.

## Risks and exit gate
Guard false identity matches, stale writes, duplicate submissions, default-selection races,
dangling relations, privilege escalation and accidental sender-credential ownership.
Complete only when real authorized UI/services manage Customers/Contacts; optional detail
never gates basic work; workforce/settings exist without downstream records; shared ownership
is preserved; all checks pass; imprint/tracker are updated; review has no critical/high finding.
Feature 09 remains not started.

## Slice 08.8 — Approved final review remediation

Approved 2026-09-14 with binding security clarification: all nine foundation tables deny
direct browser reads and writes. There is no Feature 08 browser CRUD/Realtime exception.
Use the existing restricted btls_app role and tenant context; no new role, service_role
operation path, or BYPASSRLS role. Application services retain validation, capabilities,
duplicate review, transactions, same-property relations, and AuditEvent responsibility.

08.8a: forward-only grants/RLS migration and explicit restricted Prisma transaction path;
verify browser-key SELECT/INSERT/UPDATE/DELETE denial with unchanged records, plus real
restricted-role service success, user-link lookup, capabilities, and cross-tenant denial.
08.8b: one atomic navigation confirmation across dirty forms; accepted discard restores
persisted values and clears abandoned errors/review; cancellation preserves every draft.
08.8c: stable search control identity, continued typing/caret/focus, URL filter/pagination
and Back/Forward synchronization without stale results overwriting newer input.
Run focused regressions, full unit/database suites, typecheck, lint, production build,
production browser journeys, migration checks, imprint and final review.
Feature 08 remains reopened until these gates pass. Feature 09 is not started.
## Slice 08.9 — Approved navigation and directory coordination remediation

Approved with document navigation restricted to Feature 08 entry, route/section changes,
and departures. Shared draft registry owns unfinished-work truth. App-controlled navigation
uses one atomic Discard/Cancel decision; native beforeunload is attached only while dirty.
Cancel preserves property, route, every draft, validation and duplicate review. Accept removes
the native handler synchronously to avoid a second prompt. Browser cache restoration must not
revive discarded values. Unrelated routes retain their existing navigation behavior.

Same-working-route directory search/filter/pagination remains client-side with one desired
query/status/page state and one navigation writer. Pending/debounced work loses to newer
intent; responses cannot overwrite newer controls; Back/Forward restores the complete state.

Slices: 08.9a shared guard + Feature 08 document boundary; 08.9b coordinated directory;
08.9c deterministic regressions, full verification, imprint and another three-layer review.
No schema, migration, dependency, provider, event/job, authorization or Feature 09 changes.
Retain the 08.8 restricted-role and browser read/mutation-denial regressions. Exit gate stays
open until both findings and the complete required verification/review gate pass.

## Slice 08.10 — Approved offered-service editor boundary

Approved 2026-09-14 after review reproduced offered-service Back navigation losing a draft
without a prompt on desktop and mobile. Feature 08 is reopened for this finding.
On /{propertyId}/settings/services, editor identity is the selected edit parameter or the
new-service form. New-to-existing, existing-to-existing, and existing-to-new transitions
are working-form departures and establish document history boundaries even while clean.
The existing shared registry retains atomic app Discard/Cancel and dirty-only native exit
protection. Cancel preserves identity, input, validation and review state; accepted Discard
clears dirty state before departure to prevent a second native prompt.

08.10a: extend only the Feature 08 service-editor boundary.
08.10b: retain client-side query/pagination when editor identity is unchanged; test pending
search cannot restore an abandoned editor.
08.10c: focused boundary regression, desktop/mobile transition and directory tests, full
unit/database/typecheck/lint/build/browser verification, imprint and another review.
No global navigation conversion, Feature 09 work, schema, migration, dependency, provider,
event or job changes. Restricted btls_app, RLS, capabilities and browser CRUD denials remain.
Exit gate remains open until this regression and the complete verification/review gate pass.

Slice 08.10 final result: PASS. 288 unit, 58 database and 60 desktop/mobile production-browser tests passed, with typecheck, lint, production build, schema/migration integrity, imprint and final review. Feature 08 is complete; Feature 09 remains not started.
