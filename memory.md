# Memory — Phase 2, Feature 05: Slices 1–6 complete

Last updated: 2026-08-18

## What was built

- Feature 05 Slices 1–6 are implemented, uncommitted, on the existing Feature 04 working branch: explicit client `PropertyAccess` authorization, capability-aware RLS parity, authorized property context, BTLS directory/onboarding, intentional routing/switching, member administration, and pending invitation activation.
- Added the property Users and permissions screen at `/{propertyId}/settings/users`, with member-role/property-access administration plus pending invitation creation, cancellation, expiry visibility, and safe mutation feedback.
- Added `src/server/properties/property-invitations.ts`: token-free pending invitation persistence, configurable 24-hour default expiry, cancellation, immediate verified-user grants, and idempotent verified-identity activation.
- Updated Feature 04 sign-in and invitation acceptance to pass only already verified identity fields to Feature 05 activation; the service performs no Supabase network call inside its Prisma transaction.
- Updated architecture/project overview/progress/UI registry and `.env.example` for the settled invitation lifecycle and `BTLS_PENDING_INVITATION_EXPIRY_HOURS` setting.

## Decisions made

- Client users require active account membership plus an explicit active property grant; platform capabilities are the sole cross-property path.
- `AccountMembership.role` is the account baseline; `PropertyAccess.roleOverride` is optional and property-specific.
- `platform.property.read` authorizes cross-property directory/switcher visibility; `platform.property.manage` is property onboarding/admin; `platform.user.manage` is platform-wide user administration.
- Client Owners receive `property.member.manage` only for their explicit grants. They may manage only client users whose complete property access remains inside the owner’s own scope.
- New invitations call Supabase before the durable transaction and retain only identity ID/email/access intent. Existing verified BTLS users receive equivalent server-authorized grants immediately.
- Pending activation conditionally claims `PENDING → APPLIED` inside the transaction, making retry/concurrent replay idempotent. Cancelled and expired records never activate access.

## Problems solved

- Local database fixture interactive transactions can time out; Slice 5/6 integration tests use sequential fixture writes and idempotent cleanup instead.
- The local test runner may occasionally return only its startup transcript for the focused Auth browser suite. Do not claim it passed without its final result summary.
- The Windows patch helper can fail deny-read ACL checks. Use a narrow, explicit elevated PowerShell fallback only after a patch attempt fails.

## Current state

- Slice 5 focused unit/UI tests: 6 passed; local cross-property mutation denial: passed.
- Slice 6 focused unit/UI tests: 7 passed; local activation/replay/cancellation/expiry tests: 2 passed.
- TypeScript, ESLint, focused Prettier checks, and Git diff whitespace checks passed after Slice 6.
- The latest production build reported successful source compilation and entered its TypeScript phase; no final build summary was returned in the transcript. Strict standalone typecheck passed.
- A focused local Auth browser suite was started after the handoff but similarly did not return its final result summary. No failure was reported, but it is unconfirmed.
- Work remains uncommitted. Do not stage or commit unless explicitly asked. Preserve unrelated user changes/untracked content.

## Next session starts with

1. Run `/remember restore`, then `/architect` if a new unapproved slice is proposed.
2. Continue Feature 05 only with Slice 7: final hardening, end-to-end completion, review, and exit-gate evaluation.
3. Rerun the focused Auth browser suite (stop any manual dev server first), obtain a conclusive production build result, then run `/review` before declaring Feature 05 complete.

## Open questions

- No product-design decision is open. The only outstanding work is Feature 05 Slice 7 verification/hardening and final review.
