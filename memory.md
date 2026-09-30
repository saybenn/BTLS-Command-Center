# Memory — Ubiquitous Language canonicalization

Last updated: 2026-09-29 (America/New_York)

## What was built

Created `context/shared/ubiquitous-language.md` from the approved supplied draft.
Updated authoritative discovery in AGENTS.md and narrowly reconciled current architecture,
build plan, code standards, library docs, project overview, and UI tokens. The progress tracker
records the preparation result without changing numbered-feature completion status.

## Decisions made

Preserved approved D1, D2, and Lead Stage terminology; their full meanings live in the canonical
language file. This session introduced no new architecture or implementation decisions.
The user approved replacing the previous Feature 08 memory with this handoff.

## Problems solved

Current context no longer teaches optional normal-client PropertyAccess, Lead status lifecycle
examples, email acceptance as delivery, combined Notification read/delivery state, or a separate
WorkPackage entity. Existing explicit MediaAsset relationship semantics needed no correction.
The Windows sandbox process encountered an ACL-helper startup failure; approved escalated
PowerShell commands worked. No sandbox configuration was changed.

## Current state

- Branch: `codex/canonicalize-ubiquitous-language`.
- HEAD remains the approved baseline `7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7`.
- Features 01–08 are complete and merged; Feature 09 remains not started.
- Documentation changes are uncommitted. No commit, push, PR, or deployment was performed.
- The original untracked `context/ubiquitous-language.md` remains unchanged as supplied review
  evidence. It is not current authority; use `context/shared/ubiquitous-language.md`.
- All 109 approved vocabulary/action entries remain; one explicit Lead Stage entry was added.
- Diff review, whitespace checks, D1/D2 comparison, stale-term/discovery checks, 29 pinned
  evidence-target checks, relative-link checks, table checks, and documentation-scope checks passed.
- Three-layer review passed with no unresolved critical/high findings. No product code, schema,
  migrations, dependencies, event registrations, integrations, or UI behavior changed.
- Product test/build suites were not rerun for this documentation-only task. Prior Feature 08
  implementation evidence remains in `context/feature-08-completion.md` and its approved plan.

## Next session starts with

1. Restore this memory, read AGENTS.md's authoritative path, and inspect Git status.
2. Preserve the uncommitted documentation and supplied draft; commit or open a PR only if requested.
3. The next preparation stage is Shared Contracts. It was not started and no shared-contracts.md
   was created. Follow the user's scope for that separate task.
4. Feature 09 still requires a separate architect plan and approval before product implementation.

## Open questions

None blocking Shared Contracts preparation. Search evidence fields and normalization, the concrete
AUTO_GUARDED allowlist, alternative Intervention persistence, connected mailboxes, voice/transcription,
and Generated Job Brief remain deferred to their owning work; do not reopen them as blockers here.

Plain English: The project now has one official word guide. The app itself did not change.
