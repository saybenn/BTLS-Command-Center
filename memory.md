# Memory — Phase 2, Feature 05 closeout

Last updated: 2026-08-20

## What was built

- Feature 05 is implemented, uncommitted: explicit client PropertyAccess grants, platform capability authorization/RLS parity, authorized property context, administrative directory/onboarding, property routing/switching, member administration, and pending invitation activation.
- Added the Feature 05 property pages and reusable directory, switcher, membership, and invitation UI. Context, UI registry, architecture, and progress records reflect the binding authorization decisions.
- Added browser coverage for explicit client property grants, multi-property selection/switching, and URL-manipulation denial across desktop and mobile.

## Decisions made

- Client users need both an active AccountMembership and explicit active PropertyAccess; platform capabilities are the only cross-property path.
- AccountMembership.role is the account baseline; PropertyAccess.roleOverride is optional and property-specific.
- platform.property.read grants cross-property read/navigation, platform.property.manage controls property onboarding, and platform.user.manage controls platform-wide access administration.
- Client Owners may manage only client users and property grants fully inside the owner’s own explicit access scope.
- Pending invitations retain no tokens or credentials; verified identity activation is idempotent and occurs after Supabase verification, outside the database transaction.

## Problems solved

- Local Supabase integration files now run serially with a bounded 30-second setup hook timeout to avoid false Auth-provider timeouts.
- Browser fixtures using PostgREST explicitly supply Prisma-managed UUID and updated-at values.
- Prisma is now lazily initialized at its shared boundary so dynamic routes do not require database configuration during Next build module analysis.

## Current state

- Feature 05 review found no unresolved critical or high findings.
- Before the lazy-Prisma hardening, the canonical Playwright suite passed 28 desktop/mobile tests; typecheck, lint, unit/database checks, formatting, and diff checks passed.
- The lazy-Prisma change passed TypeScript. Rerun the complete final verification matrix before treating Feature 05’s final build verification as reconfirmed.
- Work remains uncommitted. Preserve unrelated working-tree changes and untracked content.

## Next session starts with

1. Run /remember restore, then use /architect for Feature 06 — Storage and Media.
2. As part of Feature 06 preparation, rerun Feature 05 final verification: pnpm typecheck, pnpm lint, pnpm test, pnpm test:database, pnpm build, and pnpm test:e2e.
3. Do not start Feature 07. Feature 06 owns shared file/image management, Supabase Storage paths, signed URLs, public/private access, and recovery of failed uploads.

## Open questions

- No Feature 05 product decision remains open. The only carryover is reconfirming the full verification matrix after the lazy-Prisma build hardening.
