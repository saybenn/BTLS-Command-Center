# Memory — Feature 07 closeout

Last updated: 2026-09-13

## What was built

- Feature 07 is complete across slices 07.1–07.11: durable internal events/outbox/jobs/attempts, generic contextual
  notifications and bell, tenant-safe operations/retry UI, Postmark transactional email and Twilio SMS adapters,
  ProviderDispatch/WebhookReceipt evidence, scheduled Feature 06 media cleanup, Pino logging, and Sentry setup.
- Slice 07.9 hardened job-execution leases, interrupted-attempt recovery, maximum attempts, and late-worker fencing.
- Slice 07.10 hardened provider dispatch interruption states, webhook processing leases/fencing, authenticated browser
  waits, and the global error test harness.
- Slice 07.11 adds deterministic PostgreSQL proof that two stale ProviderDispatch workers produce one
  pending-to-uncertain compare-and-set winner, one safe lost race, and no duplicate provider send.

## Decisions made

- `TransactionalEmailProvider` is the only Feature 07 email boundary and uses Postmark for outbound system mail.
  `ConnectedMailboxProvider` remains future documentation only.
- `ProviderDispatch` is transport execution/idempotency/correlation evidence. Only `ACCEPTED` duplicates resolve
  successfully. Fresh `PENDING` work remains in progress; expired pending work becomes `UNCERTAIN`. Unknown
  outcomes are never resent automatically.
- `WebhookReceipt.processingStartedAt` is an expiring claim and fencing token. Recovery replaces an expired claim
  atomically, and only the current token may finalize processing.
- Provider evidence and sending identity tables remain server-write-only with authorized tenant-scoped reads.
- Feature 06 retains all media lifecycle and cleanup behavior.

## Problems solved

- Unresolved provider dispatches cannot be reported as successful or automatically resent.
- PostgreSQL now directly proves the stale ProviderDispatch transition under a deterministic two-worker collision:
  one conditional update succeeds, one loses and reloads the winning state, both remain controlled uncertainty, and
  the provider is not called again.
- Webhook processing recovers after an abandoned worker, while a late old worker is denied.
- Notification and operations E2E authentication uses a positive bounded navigation wait.
- The global error test no longer mounts an `html` root inside a Testing Library container.
- The attached PropertySwitcher timeout did not reproduce in five isolated runs; no product code or broad timeout
  was changed.
- The canonical email boundary is consistently named `TransactionalEmailProvider`.

## Current state

- Branch: `feature/07-events-jobs-notifications-and-op-records`.
- Features 01–07 are complete. Feature 08 and future Revenue/Robin work are not started.
- All Feature 07 work remains uncommitted and must be preserved.
- Final gates pass: 63 files / 269 unit and component tests; 15 files / 40 PostgreSQL and RLS tests; lint;
  TypeScript; Prisma validation; production build; and whitespace verification.
- The two consecutive 6/6 desktop/mobile production notification/operations browser runs from Slice 07.10 remain
  valid; Slice 07.11 changed integration tests and documentation only.
- Final Slice 07.11 review passes all three layers with no unresolved finding.
- Slice 07.11 required no production code, schema migration, dependency, provider, event, job, authorization, or UI
  change. The existing Feature 07 imprint remains current.
- Local Supabase has all current Feature 07 Prisma and security migrations applied.
- Live Postmark/Twilio sends and hosted Inngest/Sentry delivery remain deployment checks; no secrets are stored here.

## Next session starts with

1. Run `/remember restore` and inspect `git status`; preserve the full uncommitted Feature 07 worktree.
2. Do not start Feature 08 until explicitly directed and its required planning workflow is complete.
3. If asked to commit or open a PR, review the complete Feature 07 diff and keep the forward-only migration history
   intact.

## Open questions

- No Feature 07 product or architecture question remains open.
- Hosted credentials and real provider/event delivery should be verified during environment deployment without
  committing secret values.
