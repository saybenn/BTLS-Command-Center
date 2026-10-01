# Memory — Shared Contracts canonicalization

Last updated: 2026-10-01 (America/New_York)

## What was built

Created `context/shared/shared-contracts.md` from the approved supplied draft.
Updated AGENTS.md discovery/authority, the architecture SearchKeyword glossary and read list,
and the progress tracker. SC-01–SC-16 and T01–T12 remain unchanged from the approved draft;
adoption wording makes the approved Shared Change Gate canonical governance.

## Decisions made

No new product or implementation decision. D1, D2, Lead Stage, ownership distinctions,
planned status, and uncontracted details remain governed by the canonical documents.
The user explicitly approved replacing the previous Ubiquitous Language session memory.

## Problems solved

Corrected the residual SearchKeyword glossary wording that implied geographic locale identity.
Remote main remains the audited commit; the former checkout had identical tracked contents.
The Windows shell sandbox hit its existing ACL-helper startup failure; approved escalated
PowerShell commands worked. No sandbox configuration was changed.

## Current state

- Branch: `codex/canonicalize-shared-contracts`, based on audited main
  `db7f6d61bf21bc331a055548fea7559b8486f5c1`.
- Features 01–08 complete; Feature 09 and later remain not started.
- Ubiquitous Language and Shared Contracts are canonicalized in the working tree.
- Changes are uncommitted; no push, PR, deployment, or product implementation occurred.
- Supplied untracked `context/shared-contracts.md` and
  `context/BTLS_Shared_Contracts_Report.md` remain unchanged as historical input evidence,
  not current governing sources. Use `context/shared/shared-contracts.md`.
- Full diff/draft comparison, all 16 contract sections and 12 test-obligation preservation,
  42 pinned evidence-file/line checks, relative links, governing discovery, deferred-status
  review, whitespace, and documentation-scope checks passed.
- Three-layer review: plan alignment PASS; system integrity PASS; documentation readiness PASS.
  No unresolved critical/high findings. Product code, schema, migrations, tests, dependencies,
  events, jobs, integrations, and UI behavior are unchanged.
- Product test/build suites were not rerun for documentation-only adoption.
  Existing implementation verification remains in historical Feature 08 evidence.

## Next session starts with

1. Restore this memory and read current AGENTS.md governing context.
2. Inspect Git state; preserve the uncommitted canonicalization and supplied input artifacts.
3. Dependency mapping is the next preparation stage, not started. Begin only under its own
   requested scope. Ownership matrix, parallel-development plan, Snitch File, parallel pilot,
   and parallel development have not started; sustained parallel readiness is not established.
4. Feature 09 requires its separate architect plan and approval before implementation.

## Open questions

None blocking dependency mapping. Exact Revenue outcome DTOs/queries/events and field projections,
Intervention persistence, Search market-evidence columns, future provider selection, and concrete
AUTO_GUARDED allowlists remain owning-feature work. Connected mailboxes, voice/transcription,
Generated Job Brief, and integrated payment processing remain deferred.

Plain English: The project now has an official rulebook for shared parts. The app did not change.
