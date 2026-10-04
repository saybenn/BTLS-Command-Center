# Memory — Robin architecture documentation adoption

Last updated: 2026-10-02 (America/New_York)

## What was built

Documentation only: adopted `context/robin/architecture.md` as subordinate detail and
reconciled governing root/shared documents, Robin build descriptions and relevant
standards. Updated the supporting dependency analysis without canonicalizing its map.
Preserved the original Robin draft body under a historical-source banner.

## Decisions made

The owner explicitly approved the reconciliation report, controlled adoption and this
memory update. The dated Shared Change Gate proposal/resolution is recorded in
`context/shared/shared-contracts.md`. Follow that record and current governing documents;
no separate decision registry, terminology authority or implementation plan was created.

## Problems solved

Confirmed both supplied drafts by their review hashes. Canonical main remains
`7d211e2f9e6ee77755031674a2826a951ec65b10`, matching the handoff. Refreshed stale origin/main
and created `codex/adopt-robin-architecture` from it; local main was left unchanged.
The Windows shell sandbox's ACL startup issue required approved escalated commands.
No sandbox configuration changed. A rejected out-of-order patch was reapplied in ordered
sections; it did not introduce partial unrelated changes.

## Current state

- Features 01–08 complete; Feature 09+ and Robin remain unimplemented.
- Adoption branch: `codex/adopt-robin-architecture`, HEAD at the verified main commit.
- Documentation changes are uncommitted and unstaged; owner review of the completed diff
  is required before commit/push. No PR or deployment was created.
- No code, schema, migrations, dependencies, runtime/provider contracts, event/job/capability
  registrations, UI tokens or UI registry changes. Product tests/build were not rerun.
- Complete diff/source comparisons, local links/anchors, artifact authority, terminology,
  ownership, sequencing and protected-boundary checks passed. Live main remains unchanged.
  All 56 feature headings and declared dependencies are preserved; no critical/high
  documentation finding remains. See the tracker and final report for validation scope.
- `context/shared/dependency-analysis-draft.md` is supporting evidence only;
  `context/shared/dependency-map.md` is absent. Ownership Matrix, execution protocols,
  parallel pilot and parallel development have not started.

## Next session starts with

1. Restore context and inspect the current Git diff; preserve this adoption and source files.
2. Obtain owner approval of the completed documentation diff before committing or pushing.
3. Dependency-map canonicalization needs its own authorization. Do not infer permission
   to begin Ownership Matrix, parallel preparation or product implementation.
4. Feature 09 remains the next implementation target and requires its own architect plan
   and approval. Do not jump to Features 12 or 13.

## Open questions

No remaining O1–O7 direction ruling. Exact schema, evidence retention/redaction/snapshots,
knowledge lifecycle, approval/takeover mechanics, gateway interface/model, capability and
event/job contracts, evaluation thresholds, Shadow/OFF behavior and notification fallback
remain F12/F13 architecture decisions. Required shared geography is specified before first
reliance without making full Feature 36 a Robin prerequisite.

Plain English: Robin now has a clear place in the rulebook. The app has not changed.
The written changes still need review before they are saved as a Git commit.
