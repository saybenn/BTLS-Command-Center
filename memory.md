# Memory — Feature 08 Slice 08.10 closeout

Last updated: 2026-09-19 (America/New_York)

## Current state

- Features 01–08 complete. Feature 08 exit gate passed after Slice 08.10 and another three-layer review.
- Feature 09 — Lead Operations and Action Workspace is not started and needs its own architect approval.
- Branch: `feature/08-customer-workforce-and-revenue-settings-foundation`.
- Feature 07 was merged before Feature 08 began. All Feature 08 changes remain uncommitted; preserve them.
- No PR, commit, deployment or production mutation was performed.
- Authoritative feature plan and full file/check inventory: `context/feature-08-plan.md` and `context/feature-08-completion.md`.

## What was built

Feature 08 provides Customer/person Contact directories/detail, explicit relationship state,
safe matching and duplicate review, retry-safe creation, international phone normalization,
optional locations/equipment and explicit Tags, EmployeeProfile administration, Revenue defaults,
and the minimal canonical shared PropertyService substrate. Shared MediaAsset and SendingIdentity
ownership remains unchanged. No Feature 09 or downstream commercial records were added.

Slices 08.9–08.10 resolve browser Back/property-switch draft loss and the search/filter race.
A shared draft registry coordinates atomic Discard/Cancel. Feature 08 explicitly opts into document
navigation for entry, route/section changes, related-record pages that replace editable forms,
and departures. Native unload protection exists only while dirty and is removed synchronously
on accepted app Discard. Browser cache restoration reloads persisted data. Unrelated routes retain
their navigation behavior. This exception is not a global architecture for future features.

Directories keep one desired query/status/page state, cancel obsolete debounce work, preserve
newer controls across old acknowledgments, and restore all controls on history traversal.
Query/filter updates replace; pagination pushes and uses the latest desired page. Same-route
result changes preserve the working Customer form and stay client-side.

## Binding boundaries

- Customer is the property-scoped end customer, not ClientAccount. Contact is person-only.
- ServiceLocation is optional Customer context, not BusinessLocation. EmployeeProfile is separate
  from optional AppUser and never creates access. Revenue settings never own credentials or verification.
- Permission bundles and explicit platform counterparts remain those approved in the plan;
  client manager Revenue settings are view-only, client staff/viewer have no broad directory access.
- Phone handling uses libphonenumber-js/max, valid international numbers and canonical E.164
  separate from display. Shared TableShell uses muted 12px medium sentence-case headers.
- All nine foundation tables deny direct authenticated/anon browser reads and mutations.
  No Feature 08 direct-browser CRUD/Realtime exception exists.
- Ordinary operations use existing restricted btls_app with user/property context and RLS,
  never service_role, a new privileged role or BYPASSRLS. Application services own capability
  checks, validation, matching/review, transactions, relational safeguards and AuditEvent.
- Applied locally: Prisma `20260914120000_revenue_foundation`; security migrations
  `20260914120100_revenue_foundation_security`, `20260914123000_employee_link_property_guard`,
  and `20260914180000_revenue_foundation_server_access`. Never rewrite them. Slice 08.9 added none.

## Verification and review

- 288 unit/component tests in 69 files passed.
- 58 database tests in 17 files passed, including browser-key CRUD denial with unchanged records,
  actual non-superuser/non-BYPASSRLS btls_app service transactions, active RLS and employee linking.
- All 60 production browser tests passed on desktop/mobile, including authentication, shared shell,
  notifications, operations and all Feature 08 journeys. New tests cover native Back/Forward/reload,
  atomic cancel/discard, duplicate review while switching property, delayed query/filter/page/history,
  and related-record pagination. Persisted browser-cache lifecycle also has explicit coverage.
- Typecheck, lint, production build, schema validation and security-migration integrity passed.
- Browser evidence: zero page/console errors and unexpected network failures; request cancellations
  caused by navigation/supersession are expected. Desktop light and tablet/mobile dark captures inspected.
- UI imprint, tracker, library usage notes and completion report updated. Three-layer review passed
  with no unresolved critical/high finding. No known unresolved Slice 08.10 issue.

## Problems solved / verification lessons

- Build and browser runtime must use the same local Supabase environment. Plain `pnpm build`
  reads `.env.local`, which differs from the running local fixture environment. Mixing that build
  with local fixture runtime broke invitation bootstrap, while server-only workflows still passed.
  Rebuild with `getMinimalLocalSupabaseEnvironment` before local browser verification. The repository's
  `pnpm test:e2e` uses that resolver; verification helpers may use it without redeploying/resetting data.
  No authentication source or environment credential file was changed to resolve the mismatch.
- Wait for client readiness before clicking the mobile drawer. The existing Radix theme label
  appears after hydration, including in the hidden mobile header. No test was weakened or disabled.
- This machine has limited RAM. Run heavy checks sequentially. Ordinary sandbox file tools have
  encountered a Windows ACL-helper issue; authorized escalated PowerShell commands worked.
- Successful saves load committed server data using document navigation after dirty-state cleanup.
  Keep the saved URL marker presentation-only and preserve retry identity after interrupted responses.

## Latest slice

Slice 08.10 treats offered-service edit identity changes as working-form departures, including
clean navigation so later dirty Back/Forward can be protected. New/existing, existing/existing,
and existing/new transitions use the shared guard. Search/pagination and directory-row reselection
with unchanged editor identity remain client-side and preserve the working form. Changed-boundary
protection takes precedence over the existing directory draft-preserving marker.

Only two product files changed: foundation-navigation-boundary.tsx and foundation-directory.tsx.
Added feature-08-navigation-boundary.test.tsx and desktop/mobile service-editor regressions in
revenue-foundation.spec.ts. No schema, migration, dependency, provider, event/job or Feature 09 work.
Final three-layer review passed; the original P2 and same-editor row-reselection edge are resolved.
The final complete browser run passed all 60 tests; all 60 evidence files contain zero page/console
errors and unexpected network failures. The full completion report records all files and commands.

Test diagnostics worth preserving: wait for lookup options before comparing complete form text;
wait for committed pagination URLs before traversing history. A queued query can legitimately
update page-one history before Next commits, so the Customer race regression captures the actual
committed entry rather than assuming an empty previous query. Its rapid query/pagination sequence,
Back/Forward, newest-intent and retained-draft assertions remain. One earlier Operations label
refresh timed out after the action succeeded; the unchanged test passed on the final full run.
## 2026-09-19 test follow-up

User supplied a default pnpm test failure (287/288 passed). The Operations failure test raced
React transition completion after the error text appeared. It now waits for the error and
re-enabled controls, and verifies the reason remains entered. Retry implementation is unchanged.
NavigationList conditionally supplies onNavigate only to Next Link, fixing native button warnings.
Default pnpm test passed all 288 tests in 69 files without worker overrides or those warnings.
Typecheck, lint, whitespace checks and targeted review also passed.
Changes are limited to operations.test.tsx, navigation-list.tsx and follow-up documentation.
The previous database/build/browser results are historical, not rerun for this narrow correction.
## Next session starts with

1. Restore memory, read the tracker and inspect Git status.
2. Preserve all completed, uncommitted Feature 08 work; commit or create a PR only when requested.
3. Feature 09 needs a separate architect plan and explicit approval before implementation.

## Open questions

None for Slice 08.10. Future features must justify any document-navigation exception separately.

Plain English: Leaving unfinished work now asks before throwing it away. Search and filters
keep the newest choice even when an older request is slow.
