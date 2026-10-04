# BTLS Command Center — Feature Dependency Mapping Report

Read-only analysis and proposed artifact • 1 October 2026 (America/New_York)

**Supporting draft — amended 2 October 2026 for approved Robin reconciliation.** This
analysis and its embedded map are noncanonical dependency evidence. Build/feature plans
retain sequencing authority; `context/shared/dependency-map.md` has not been adopted or
created. The original repository baseline remains current at adoption preflight. See
[the Shared Change Gate resolution](shared-contracts.md#2026-10-02--robin-architecture-adoption-approved-resolution)
and [adopted subordinate Robin detail](../robin/architecture.md). The original read-only
analysis did not edit the repository; this amendment changes documentation only.

**Baseline:** `saybenn/BTLS-Command-Center`, `main`, `7d211e2f9e6ee77755031674a2826a951ec65b10`. **Scope:** Features 09–56; no implementation, repository edits, branch/worktree creation, ownership matrix, parallel-development plan, or Snitch File. Section 13 contains the proposed canonical artifact.

**Finding:** The two product lanes can become technically independent after narrow shared surfaces are established. They are not currently authorized to run in parallel. Feature 09 does not need WebsitePage or Search; Search visibility/fulfillment does not need Revenue outcomes. Early shared geography, connection/page identities, and later Finding/Work Management boundaries—not feature numbering—are the important construction gates. **09 + 27 is the strongest first candidate on currently verified dependency evidence; 09 + 24 becomes competitive after its geography/page-reference prerequisites are settled.**

## 1. Current-state verification

| Check | Verified result / evidence |
|---|---|
| Repository/default branch | [saybenn/BTLS-Command-Center / main](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/AGENTS.md); current HEAD pinned above. |
| Features01–08 | Feature08 merged by PR#8 at `7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7`. [Completion report](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/feature-08-completion.md) and [tracker](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/progress-tracker.md) record completion through08.10. Recorded tests:287 unit/component,58 database,52 browser; these are historical reported passes, not tests rerun for this analysis. |
| Ubiquitous Language | Merged PR#9 at `db7f6d61bf21bc331a055548fea7559b8486f5c1`; canonical [shared vocabulary](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/shared/ubiquitous-language.md). D1/D2 unchanged. |
| Shared Contracts / Change Gate | Merged PR#10 at `8724c38bc1261c569056f08eaddfa8109a70468d`; [canonical SC-01–16](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/shared/shared-contracts.md) and AGENTS discovery/authority agree. |
| Latest commit | HEAD adds `context/shared-contracts-draft.md`; it does not replace the canonical shared-path contract. |
| No09+ implementation on main | Commit comparison from Feature08 merge to HEAD contains documentation only. Current schema, ordered migrations, source tree and registries corroborate this: no Lead, ContentAsset, IntegrationConnection, WebsitePage, Finding, WorkTicket, Intervention or Search models/services. Scope of this claim is main, not undisclosed local work or all remote branches. |
| Database evidence | Inspected [Prisma schema](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/prisma/schema.prisma), six ordered Prisma SQL migrations and sixteen ordered Supabase security migrations. Latest represented product foundation is08; later security migrations restrict earlier grants. No migration replay or database mutation performed. |
| Implemented surfaces | PropertyService is real shared code in `src/server/properties/property-services.ts`; Feature08 uses transaction-time restricted-role checks. Media, events/outbox, jobs, notices and transport are implemented; domain-specific event/subject/handler families remain future. |
| Stale historical wording | `memory.md` still says canonicalization is uncommitted on its branch; tracker preparation entries retain old remote HEADs; Feature08 completion says uncommitted. Live merge history supersedes those state claims. Historical root-level draft/report files are not governing sources. |
| Session restoration | Read current `memory.md` as historical handoff and reconciled it to live main. JSM slash commands are not exposed here; no claim to have run them. This is analysis, not an implementation session. |
| Authority | Vocabulary owns terms; Shared Contracts owns cross-domain boundaries/gate; architecture owns lifecycle/policy; Prisma+ordered migrations own represented DB; plans own sequencing. The proposed technical graph does not override current sequential rules. |

Evidence references throughout: **BPnn** = the pinned Feature nn link in §2; **A19/A20/A21** = Revenue/Robin/Work Management sections of [architecture](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/architecture.md); **A20A§n** = numbered Search subsection within that architecture; **SC-nn** = section in [Shared Contracts](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/shared/shared-contracts.md). These are repository evidence, not assertions that conceptual APIs exist. Supporting code: [capabilities](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/auth/permissions.ts), [foundation transactions](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/properties/foundation-database.ts), [PropertyService](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/properties/property-services.ts), [events](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/events/internal-event-registry.ts), [jobs](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/jobs/job-contracts.ts), [notification subjects](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/src/server/notifications/notification-contracts.ts).

## 2. Feature inventory 09–56

Every row is planned/unimplemented at the pinned HEAD;21 is deferred. Outputs identify likely new models or derived/service behavior rather than promise a frozen schema. The named domain owns writes to its outputs; consumers do not acquire source write authority. All active rows inherit **SC-01 and SC-02**; the SC column lists additional affected contracts. “Shared” names a semantic subsystem, not an assigned agent or ownership matrix.

| Feature / exact roadmap name | Owner/domain | Introduces / primary outputs | Consumes | Additional SC |
|---|---|---|---|---|
| [09 — Lead Operations and Action Workspace](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L441) | Revenue | Lead; RevenueActivity/Note; NextRequiredAction; AttentionFlag; assignment/source/stage commands | 08 identity, workforce, PropertyService; 07 events | 03,04,06,08,14 |
| [10 — Public Lead Ingestion](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L481) | Revenue intake | Public form configuration/key; idempotent intake; lead.created; staff notice | 09 Lead commands; 08 matching; 07 outbox/notices; Turnstile | 04,06,07,08,14 |
| [11 — Customer Conversations and Communication](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L516) | Revenue communication | Conversation; Message; consent/routing and domain delivery evidence | 08 Customer/Contact; 09 optional context; 07 sender/transport/receipts | 04,06,07,08,09,10 |
| [12 — Robin Configuration, Knowledge, and Shadow Mode](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L560) | Robin core/policy; Revenue integration | BusinessKnowledgePack; RobinConfiguration; minimum reasoning/validation and inspectable Shadow evidence | 09 Lead context; 11 communication contracts; shared service/geography knowledge; planned gateway support | 03,04,06,07,09,10,16 |
| [13 — Robin Core Response, Runs, Approval, and Handoff](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L608) | Robin core/runtime; Revenue integration | F12 evidence extended for live RobinRun/Action execution; approval/takeover; bounded response and handoff | 10 eligible event; 11 communication; 12 policy; 09 actions | 04,06,07,08,09,10,16 |
| [14 — Appointment Scheduling and Time Tracking Foundation](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L662) | Revenue scheduling/adapter; Robin orchestration | Appointment; TimeEntry; assignments; unified schedule; Robin scheduling integration | 08 workforce; Cronofy boundary; 12–13 for Robin slice | 04,06,07,08,09,10,16 |
| [15 — Pricebook and Estimate Drafting](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L720) | Revenue commercial | Pricebook/Item; AgreementTemplate; Estimate/Revision/LineItem/AgreementSnapshot drafts | 08 identity; 09 context; shared PropertyService | 03,04,06,14 |
| [16 — Estimate Delivery, Public Presentation, and Acceptance](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L744) | Revenue commercial | Issued immutable revisions; EstimateDelivery/ViewEvent/Acceptance; CustomerDocumentAccessGrant; signature/artifact relations | 15 drafts; 11 sends; 06 media; 07 jobs | 04,05,06,07,09,10,14 |
| [17 — Job and Field Operations](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L767) | Revenue field | Job/Visit/Task; ChangeOrder; ServiceIssue; explicit asset/media links | 08; 14 schedule; 16 acceptance or governed manual provenance | 04,05,06,07,08,10,14 |
| [18 — Invoice and Payment Operations](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L790) | Revenue billing | Invoice/LineItem/Delivery; Payment; corrected net collection and derived balances | 17 Job; 16 estimate/grant surfaces where used; 11 delivery; 07 transport | 04,05,06,07,09,10,14 |
| [19 — Revenue Exceptions and Operations Views](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L815) | Revenue attention | BusinessExceptionDefinition/Exception; deterministic summaries and notices | 09 actions; 14 schedule; 16–18 commercial lifecycle; delivery failures | 04,06,07,08,10,14 |
| [20 — Quick Capture — Text and Proposal Review](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L837) | Revenue input | QuickCaptureRun/MutationProposal; review/confirm/apply workflow | 09,14–19 owning commands; structured AI adapter | 04,06,07,09,14,16 |
| [21 — Voice Quick Capture and Generated Job Brief — Deferred / Post-MVP](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L857) | Deferred Revenue slot | None in MVP; voice/transcription/Generated Job Brief reserved | No active MVP consumer | 16 (future only) |
| [22 — Review Requests and Lifecycle Automation](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L868) | Revenue lifecycle | ReviewRequest; scheduled delivery and deterministic follow-on jobs | 11 consent/sends; 17–19 completed work/outcomes/actions; 07 jobs | 04,06,07,08,09,10,14 |
| [23 — Expanded Robin Revenue Automations](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L888) | Robin policy/orchestration; Revenue integration expansion | Additional approved typed tools, automation outcomes and bounded coordination | 12–14 core; 15–19 and 22 owning services; 20 compatibility | 04,06,07,08,09,10,14,16 |
| [24 — Content Foundation and Strategy](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L907) | Smart Blog | ContentAsset; ContentStrategy; TopicCluster; strategy relationships | Shared PropertyService and geography; future page/target reference contracts | 03,11,15 (later references) |
| [25 — Article Editor and SEO Readiness](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L946) | Smart Blog | Editor/versioned document; SEO readiness; sanitized output; image relations | 24 content identity; 06 media | 05,11 |
| [26 — Internal Links, Publishing, and Playbook](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L986) | Smart Blog | ContentLink; PublicationRecord; publishing adapters/jobs; Playbook | 24–25 editor; page inventory contract; connection/credentials; 07 jobs | 03,05,06,07,09,11 |
| [27 — Integration Connections](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1028) | Shared integrations / Website data | IntegrationConnection; Google OAuth/resource selection/status; refresh/disconnect | Existing property authorization; shared provider/job infrastructure | 06,07,09 |
| [28 — Data Ingestion, Normalization, and Page Inventory](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1066) | Website data | WebsitePage; MetricSnapshot; import references; DataHealthCheck; normalized pipeline | 27 connections; GA4/GSC/GBP adapters; 07 jobs | 06,07,09,11 |
| [29 — Metric Engine and Baselines](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1111) | Shared web metrics | Derived metric/baseline queries and evidence sufficiency | 28 normalized page/period data; optional authorized Revenue facts | 11,14 |
| [30 — Findings Engine](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1151) | Shared intelligence / Website rules | FindingDefinition/Finding/FindingEvidence; versioned evaluation/dedup | 28–29 evidence/health; shared review-lifecycle contract | 06,07,11,12,13 |
| [31 — Website Intelligence Interface](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1200) | Website Intelligence; shared review owned by Work Management | Review/visibility/explanation UI and Finding disposition | 30 Findings; 29 drill-down; shared review/prescription contract | 06,07,08,11,12,13 |
| [32 — Article Scorecards](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1239) | Content Intelligence | Article/cluster scorecards; strategy-to-page evidence matching | 24 strategy; 26 managed publications; 28–29 data; optional Revenue | 11,14 |
| [33 — Content Findings](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1276) | Content Intelligence | Content-specific Finding rules/recommendations; shared Finding writes | 32 scorecards; 30 diagnostic infrastructure; 24 strategy | 11,12,13 |
| [34 — Work Packages and Tickets](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1314) | Work Management | WorkPackageTemplate/version; WorkTicket/Task; assignment/approval and evidence linkage | Shared Finding/review surface from 30–31; 06 attachments; 07 notices | 05,06,07,08,12,13 |
| [35 — Interventions and Before/After Measurement](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1353) | Work Management | Intervention; MeasurementReview; pinned periods; resolve/reopen | 34 normal work; 29 evidence; shared Finding state; D2 provenance | 06,07,08,11,12,13,15 (scope),14 (optional) |
| [36 — Search Program and Shared Vocabulary Foundation](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1395) | Search + shared property knowledge | SearchProgram/priorities; fulfillment/automation policy versions; shared BusinessLocation/ServiceArea if absent | 08 PropertyService; existing auth/jobs; approved shared geography | 03,06,07,09,15,16 |
| [37 — Page Semantic Classification and Search Graph](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1581) | Search | PageSearchProfile; SearchTopic; PageService/Location/TopicAssignment | 36 vocabulary/program; canonical WebsitePage substrate from 28 | 03,11,15 |
| [38 — Keyword Clusters and Search Targets](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1726) | Search | SearchKeyword/Cluster/Member; SearchTarget/PageAssignment/Support | 36–37; manual query/target entry; optional GSC | 03,11,15 |
| [39 — Market Coverage Workspace](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L1871) | Search | SearchCoverageAssessment; versioned explainable coverage history | 38 targets; available normalized GSC and page evidence | 11,15 |
| [40 — Search Provider and Usage Foundation](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2005) | Shared integrations + Search usage | SearchProviderUsageRecord; normalized provider capabilities/adapters and quota control | 36 policies; IntegrationConnection; 07 jobs | 06,07,09,15,16 (adapter boundary) |
| [41 — Organic and Local Ranking Evidence](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2126) | Search | SearchTrackedEntity; OrganicRankRun/Observation; LocalRankGridRun/Point | 38 targets; 40 adapters/quotas; BusinessLocation coordinates | 03,06,07,09,11,15 |
| [42 — Site Inspection and Technical Audit](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2268) | Search | SiteInspectionRun; PageTechnicalSnapshot; InternalLinkEdge; SearchAuditRun/CheckResult | 37 pages/semantics; 40 provider foundation; 30 Finding surface | 06,07,09,11,12,15 |
| [43 — Content Authority and Internal Linking](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2421) | Search consuming Smart Blog/Content Intelligence | Target-support/link recommendations; only required explicit bridges | 37–38; 42 actual link graph; 24–26 content; 32–33 findings | 03,11,12,13,15 |
| [44 — Local Presence and External Authority Signals](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2547) | Search | LocalPresenceSnapshot; ExternalListingObservation; AuthoritySnapshot; BacklinkObservation as needed | 36 locations; 40 adapters; 28 GBP; optional 41 ranks/tracked identity | 03,06,07,09,11,12,15 |
| [45 — Search Opportunity and Prioritization Engine](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2667) | Search diagnostics | Search rule families/prioritization in shared Findings; no SearchOpportunity model | 39–44 evidence families; 30 shared diagnostics; optional Revenue | 06,07,11,12,14,15 |
| [46 — Search Work Integration](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2813) | Search + Work Management | SearchInterventionScope; versioned Search WorkPackageTemplate data | 45 Finding; 34–35 work/provenance; Smart Blog content workflow | 05,06,07,08,11,12,13,15 |
| [47 — Fulfillment Cycles and Delivery Proof](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L2933) | Search fulfillment | SearchFulfillmentCycle/Requirement; SearchDeliverySummary | 36 policy; 46 work; required collection/evaluation producers | 06,07,08,11,12,13,14 (optional),15 |
| [48 — Portfolio Exception Operations](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3071) | Search portfolio | Rebuildable SearchProgramHealthSnapshot or equivalent; exception overview | 47 cycles; evidence/Findings/operations; later optimization state | 01 platform scope,06,07,08,09,12,13,15 |
| [49 — Bounded Optimization Execution](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3206) | Search execution | OptimizationAction; exact operation allowlist/policy and results | 46 Intervention scope; 36 policy; 40 adapter; 47–48 integration | 05 (if used),06,07,08,09,12,13,15,16 |
| [50 — Fleet Remediation](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3375) | Platform fleet + Search targets | FleetRemediation; property-scoped FleetRemediationTarget; verification | 49 capability/execution; 42 inspection; 35/46 provenance; managed deployment | 01 platform scope,06,07,08,09,13,15,16 |
| [51 — Search Measurement and Business Outcomes](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3488) | Search contribution to shared Work Management | Search measurement references/snapshots only as required; MeasurementReview contributions | 29 web metrics; 35 reviews; 41/46 evidence and scope; 47–50 integration; optional Revenue | 06,07,09,11,12,13,14,15 |
| [52 — Property Overview](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3659) | Shared property overview | Capability-aware summary queries/read projections; no new source truth | 19 Revenue; 29–35 Growth/work; 47–51 Search; Robin status | 03,04,06,07,08,09,10,11,12,13,14,15,16 |
| [53 — BTLS Cross-Property Overview](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3710) | Platform portfolio overview | Authorized cross-property aggregation/pagination and attention views | 52 source summaries; 48 Search portfolio; platform authorization | 03,04,06,07,08,09,10,11,12,13,14,15,16 |
| [54 — Security and Data Protection Review](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3759) | Platform security review | Security/privacy verification and required bounded remediations | All implemented domain/infrastructure surfaces; final integrated scope | 03,04,05,06,07,08,09,10,11,12,13,14,15,16 |
| [55 — Reliability, Performance, and Accessibility](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3804) | Platform reliability/accessibility | Performance/recovery/a11y verification; backup restore and operational readiness | Final integrated behavior, workloads and provider policies | 03,04,05,06,07,08,09,10,11,12,13,14,15,16 |
| [56 — Release Readiness](https://github.com/saybenn/BTLS-Command-Center/blob/7d211e2f9e6ee77755031674a2826a951ec65b10/context/build-plan.md#L3851) | Release integration | Controlled release, migrations/flags/rollback/runbook and staging evidence | 54–55 passed; all in-scope feature gates; explicit deferred boundaries | 03,04,05,06,07,08,09,10,11,12,13,14,15,16 |

### Mutation and cross-lane rules for the inventory

**Ownership versus construction lane:** Robin is a horizontal resident subsystem owning
core/runtime/policy and bounded evidence; Revenue owns its first adapter/integration and
all Revenue business truth. F12/F13 construct that Revenue-first integration; F14 has a
Revenue scheduling/time base followed by Robin scheduling; F23 expands Revenue integration,
not a horizontal platform milestone. Shared integrations owns AIModelGateway/OpenAI, and
other shared infrastructure retains its existing owners. This does not create a third
execution lane, cross-Studio adapters or parallel authorization.

Revenue09–23 writes Revenue-owned records through owning services; Robin12/13/23 orchestrates approved commands and owns only its policy and bounded state/evidence under SC-16. Feature20 always confirms proposals. Growth24–33 writes editorial/data/diagnostic truth according to SC-11/12. Work34–35 owns tickets, Intervention and MeasurementReview even when its consumers are Search. Search36–51 writes its own strategy/evidence/cycles/actions and submits authorized work/evidence to shared services. Features52–53 own projections only;54–56 review/integrate rather than gain general source mutation authority.

Cross-lane producers:08 shared service;09/16/17/18 authorized Revenue facts;28 page/period evidence;30 shared Findings;34–35 work/change/review;36 shared geography when not established earlier. Cross-lane consumers:12/24/36 shared knowledge;29/32/45/47/51 optional Revenue facts;09–10 optional page enrichment;31/33/42/45/46 shared diagnostics/work;52–53 both lanes. Exact directional edges and conditions are in §3; no symmetric write handoff is implied. Other features have no required Revenue↔Growth producer/consumer edge beyond shared infrastructure. Future private tables should not be promoted to shared models because they appear in this map.

## 3. Dependency graph

The ledger is a typed, directed graph. Lists denote the stated set of producers or consumers; scoped suffixes such as “base,” “path,” and “final convergence” are intentional. Transitive platform prerequisites are collapsed instead of repeating hundreds of edges.

**HARD:** the actual consumed runtime surface must exist for that path/full gate. **CONTRACT-ONLY:** private construction can proceed against an agreed exact surface before the producer’s entire feature is complete; this never means mocks satisfy runtime integration or the exit gate. **OPTIONAL / DEGRADABLE:** preserve absent/denied/failed versus real zero. **SEQUENCING / PRODUCT:** declared plan order remains binding unless separately changed. **INTEGRATION-LATER:** independently constructible pieces must later prove a real joint path. **SHARED-FOUNDATION:** one shared implementation; first-establishment review precedes independent reliance.

Where a plan gives a broad range, the technical classification is an analytical recommendation, not automatic permission to skip that range. Full-feature completion and the ability to start a private slice are deliberately separated. No active edge originates from21.

| Producer A | Consumer B | Dependency class | Reason / condition | Evidence |
|---|---|---|---|---|
| 03–05 authorization/tenant foundation | All active 09–56 | SHARED-FOUNDATION | Existing substrate; each new operation still needs its capability and RLS integration. No lane-local auth. | SC-01/02; schema; permissions |
| 06 media | 16,17,25,26,34;18 documents as used | SHARED-FOUNDATION | Immutable bytes and private access are reused through explicit owning relationships. | SC-05; BP16/17/25/34 |
| 07 events/jobs/notices/transport | Both lanes’ asynchronous and sending features | SHARED-FOUNDATION | Framework exists; new event families/handlers/subjects do not. Transport does not authorize sends. | SC-06–09; registries |
| 08 | 09 | HARD | Customer/person Contact, shared service, assignment and default foundations. | BP09 |
| 09 | 10 | HARD | Public intake invokes actual Lead creation and activity truth. | BP10 |
| 07–08 | 11 | HARD | Conversation needs real Customer/Contact, sender, transport and verified receipts. | BP11; SC-10 |
| 09 context | 11 | CONTRACT-ONLY | Lead is optional message context, not Conversation ownership; agree scoped references. | BP11; A19.3; SC-10 |
| 10 | 11 | SEQUENCING / PRODUCT | Plan explicitly orders intake first; human Customer communication is not technically created by intake. Keep declared order until revised. | BP11 exit gate |
| 09,11 | 12 | HARD | Full Shadow scenario needs actual Lead/communication context plus F12's own minimum gateway reasoning/validation and inspectable run/action evidence, suppressing effects. A settings-only slice is insufficient; no dependency on F13 live runtime. | BP12; SC-09/16 |
| 10 | 12 | SEQUENCING / PRODUCT | A real/test eligible scenario is allowed; public intake remains a declared earlier feature. | BP12 shadow gate |
| Shared geography normally listed at36 | 12,24 | SHARED-FOUNDATION | Earlier knowledge/strategy consumers must reuse shared business/location/area identity. First required implementation must pass SC-03 gate; whole36 is unnecessary. | BP12/24/36; A20A§5/27; SC-03 |
| 09,10,11,12 | 13 | HARD | Live public lead.created, communication, policy and typed business tools prove core response. | BP13 end-to-end gate |
| 08 | 14 base | HARD | Scheduling and time use property, Customer/workforce foundation. | BP14 |
| Cronofy/shared connection surface | 14 | CONTRACT-ONLY | Adapter/credential/availability/projection contract can precede full Google onboarding; actual adapter required at integration. | BP14; A13; SC-09 |
| 12–13 | 14 Robin slice | HARD | Mode, run/tool execution and communication exist before scheduling tool activation. | BP14 Robin slice |
| 17 | 14 base | INTEGRATION-LATER | Future JobVisit/TimeEntry links extend unified schedule; JobVisit is explicitly unnecessary for base exit gate. | BP14 |
| 08–09 | 15 | HARD | Draft composition and intended Lead/customer workflow; shared service references remain canonical. | BP15 |
| 13–14 | 15 | SEQUENCING / PRODUCT | Estimator needs identity/Lead, not Robin reasoning or calendar availability. | BP15 dependencies |
| 11,15;06–07 | 16 | HARD | Actual drafts, authorized sends, immutable evidence/media and artifact jobs. | BP16 |
| 14 base | 17 | HARD | Required JobVisit/unified scheduling capability consumes schedule truth even though each Job may omit visits. | BP17; A19.4/19.6 |
| 16 | 17 accepted-estimate path | HARD | Cannot claim accepted-estimate provenance without exact accepted revision. | BP17 |
| 16 | 17 manual-Job base | OPTIONAL / DEGRADABLE | Explicit authorized manual path avoids compulsory Estimate; does not waive ChangeOrder/advanced-scope gate. | BP17; A19.6 |
| 16 document/acceptance contract | 17 ChangeOrder path | CONTRACT-ONLY | Reuse governed immutable commercial/public evidence semantics; real required surface must exist before full integration. | BP16–17; SC-10/14 |
| 17 | 18 | HARD | Planned operational billing workflow consumes Job/work provenance. | BP18 |
| 11 + scoped document grant | 18 | HARD | Required Invoice delivery/public view needs consent/sending and grants; no generic provider-table substitute. | BP18; SC-10 |
| 16 | 18 Estimate-origin billing | OPTIONAL / DEGRADABLE | Only billing that originates in Estimate needs those source records. Grant substrate itself remains required. | BP18 |
| 16 grant/delivery substrate | 18 | CONTRACT-ONLY | Invoice can use owner-approved shared grant behavior without depending on all Estimate UI. | BP16/18 |
| 09,14,16–18 | 19 | HARD | Required rules inspect Lead, unscheduled accepted work, completed uninvoiced work and overdue net balances. | BP19 |
| 09,14–19 | 20 | HARD | Only real source commands can fulfill typed confirmed proposals and derived effects. | BP20 |
| Shared AIModelGateway / initial OpenAI adapter boundary (F12 evaluation minimum; F13 live integration) | 20 | CONTRACT-ONLY | Agree compatible provider use; exact interface remains feature architecture. Required runtime support must exist at integration; Quick Capture does not depend on Robin modes/live runtime. | BP12/13/20; SC-09/16 |
| 07,11,17–19 | 22 | HARD | Eligible work plus deterministic policies and consent-safe idempotent sending. | BP22 |
| 20 | 22 | SEQUENCING / PRODUCT | Review requests do not require natural-language capture. | BP22 |
| 12–14,15–19,22 | 23 supported tool set | HARD | Expanded automation delegates to existing approved services, preserving initial Robin milestone. | BP23 |
| 20 | 23 | SEQUENCING / PRODUCT | Declared dependency retained for compatibility; Quick Capture proposals do not execute Robin automation. | BP23; SC-16 |
| 08 PropertyService | 24,36 | SHARED-FOUNDATION | Already implemented shared service catalog; neither needs all Revenue09–23. | SC-03; implementation property-services.ts |
| 28 page identity/normalization surface | 24 money-page links;26 page search | CONTRACT-ONLY | Define durable page/URL linkage without building a competing page model. Actual inventory needed for full26 page-search workflow;24 does not require the full ingestion pipeline. | BP24/26/28; SC-11 |
| 24 | 25 | HARD | Editor/versioning operates on managed content/strategy. | BP24/25; A17 |
| 24–25 | 26 | HARD | Publishing/linking consumes real content and reviewed editorial state. | BP26 |
| 27 shared connection substrate | 26,40;14 when persisted connections used | CONTRACT-ONLY | Credentials and connection lifecycle have one owner; full Google UX is not required by WordPress/Cronofy. First earlier consumer may establish a reviewed subset. | A13; SC-09 |
| 27 | 28 | HARD | Real normalized imports need authorized connected resources and token lifecycle. | BP27/28 |
| 26 | 27 | SEQUENCING / PRODUCT | Google onboarding has no dependency on editorial publishing. | BP27 exit gate |
| 28 | 29 | HARD | Deterministic baseline metrics need normalized period/page observations and health. | BP28/29 |
| 28–29 | 30 | HARD | Finding rules require normalized evidence/sufficiency, not guessed scores. | BP30; A16 |
| Work-owned review contract | 30,31,34,35 | SHARED-FOUNDATION | Shared diagnostic and review states must be agreed before first schema/writer; later Work UI is not permission to duplicate review lifecycle. | SC-12/13; A21 |
| 30 | 31 | HARD | Review and explanation consume versioned Findings/evidence. | BP31 |
| 34 template/review service surface | 31 | CONTRACT-ONLY | Recommended WorkPackage and reviewed disposition must preserve Work ownership; whole ticket workflow can be integrated later. | BP31/34; A21 |
| 24,28–29 | 32 | HARD | Strategy-to-page scorecards require both editorial context and real web evidence. | BP32; A18 |
| 26 | 32 managed publication path | HARD | Exit gate matches published managed content via publication evidence. Imported existing articles remain a separate supported path. | BP32 |
| 30,32 | 33 | HARD | Content diagnosis reuses Finding infrastructure and scorecard evidence. | BP33 |
| 30 shared Finding substrate | 34 | HARD | Normal ticket must retain confirmed originating evidence; no empty Finding placeholder. | BP34; SC-13 |
| 31 review UI | 34 | CONTRACT-ONLY | Work review semantics/services can precede all Website presentation; creation still requires a confirmed Finding. | BP31/34; SC-12/13 |
| 33,45 | 34 | INTEGRATION-LATER | Generic shared work admits later Content/Search rule families; do not make34 wait for45 while46 waits for34. | BP34/46; SC-13 |
| 34,29 evidence surface | 35 | HARD | Normal completed work/change history and comparable measurements establish actual before/after loop. | BP35; A21 |
| 49–50 | 35 | INTEGRATION-LATER | Agree D2 provenance extensibility now; future producers are not prerequisite for normal ticket-based measurement. | SC-13 D2 |
| 27–35 | 36 | SEQUENCING / PRODUCT | Build plan says “as applicable”; activation requires shared vocabulary/priorities/policies/site mode, not every web/diagnostic workflow. Status reads require only their actual surface. | BP36 activation/exit |
| 36 | 37 | HARD | Semantic graph uses canonical business vocabulary and Search ownership. | BP37 |
| 28 canonical page substrate | 37 | HARD | A seeded equivalent may supply data, but must use the canonical WebsitePage schema/contract; seed does not authorize a clone. Full live imports not hard. | BP37; SC-11 |
| 36–37 | 38 | HARD | Target needs shared service/topic and keyword cluster; assignment/history uses semantic page graph. | BP38 |
| 28 GSC | 38 | OPTIONAL / DEGRADABLE | Manual targets are explicitly allowed without GSC data. | BP38 |
| 38 | 39 | HARD | Coverage is an assessment of accepted targets, not Cartesian fake targets. | BP39 |
| 28,41,42,44 evidence | 39 | OPTIONAL / DEGRADABLE | Use available compatible evidence and INSUFFICIENT_DATA; later rank/indexability/local data enriches same assessment. | BP39 |
| 36 policies +07 +connection substrate | 40 | HARD | Provider usage/cost/quota decisions need program policy and durable infrastructure. | BP40 |
| 38,40 +shared location coordinates | 41 | HARD | Dated organic/grid collection needs targets, normalized providers, cost control and actual local origin. | BP41; SC-15 |
| 37,40 +page substrate | 42 | HARD | Crawl/audit must normalize onto canonical pages and bounded adapters. | BP42 |
| 30 Finding surface | 42 | CONTRACT-ONLY | Inspection can be developed to a fixed diagnostic handoff; full high-value Finding feed needs working shared implementation. | BP42; SC-12 |
| 37–38,42 | 43 | HARD | Intended support + observed link graph underpin linking recommendations. | BP43 |
| 24–26,32–33 used content services | 43 | HARD | Full Content Authority feature consumes editorial strategy/publication and Content Intelligence rather than recreating scorecards. | BP43; A20A§27–28 |
| 39,41 | 43 | OPTIONAL / DEGRADABLE | Coverage/ranks improve prioritization; actual link gaps do not require successful rank collection. Broad declared37–42 order is not silently waived. | BP43 rules; SC-15 |
| 36,40;28 GBP normalized surface | 44 | HARD | Local/authority evidence uses shared location identity, connection adapters and existing GBP data. | BP44 |
| 41 rank results | 44 | OPTIONAL / DEGRADABLE | Local rank evidence is expressly reused when available. | BP44 |
| 41 SearchTrackedEntity identity subset | 44 | CONTRACT-ONLY | Competitor/authority reuse must establish the same identity surface; no need to wait for all grid collection UI. | BP44 data |
| 39–44 applicable producers | 45 | HARD | Each enabled initial rule needs its actual normalized evidence source; missing inputs suppress/qualify results rather than inventing them. Full planned rule scope integrates all families. | BP45 |
| 30 shared Finding engine | 45 | HARD | Search writes shared Findings, not a SearchOpportunity replacement. | BP45; SC-12 |
| 45,34–35 | 46 | HARD | Confirmed Search Findings become shared work, actual change and SearchInterventionScope. | BP46 |
| 24–26 Smart Blog | 46 content-ticket path | HARD | Required content work delegates editorial creation/publication to Smart Blog. Other work-package types need not publish content. | BP46; A20A§27 |
| 36,46 | 47 | HARD | Historical policy obligations and actual delivered work are cycle truth. | BP47 |
| 40–45 required collection/evaluation | 47 | HARD | Only policy-required sources block delivery if absent/failed; optional evidence is not a universal gate. | A20A§31.4–31.5; BP47 |
| 47 | 48 | HARD | Portfolio health is rebuildable from cycle/work/provider facts. | BP48 |
| 49 actions | 48 | INTEGRATION-LATER | Optimization approval/failure refreshes are attached once49 exists;48 cannot hard-depend on its declared successor. | BP48/49 |
| 36 policy,40 site adapter,46 shared work/provenance | 49 | HARD | Execution requires allowlist/capability/policy and durable Intervention ownership. | BP49; SC-13/16 |
| 47–48 | 49 | INTEGRATION-LATER | Cycle/health integration is required for complete declared feature; it is not execution authority. Keep declared order unless approved reslicing. | BP49 dependencies; SC-16 |
| 49,42 verification,35/46 provenance | 50 | HARD | Managed deployment fan-out must verify each property and retain independent Intervention. | BP50; A20A§38 |
| 29,35,46 +41 for rank/grid path | 51 | HARD | Reproducible reviews combine shared measurement, scoped changes and fresh comparable evidence. | BP51; A20A§42 |
| 47–50 | 51 final convergence | INTEGRATION-LATER | Integrate cycle summaries and all approved action/fleet provenance paths; normal review substrate can start before all producer UI. Declared full gate still includes47–50. | BP51; SC-13/15 |
| 09,16,17,18 Revenue facts | 29,32,45,47,51 | OPTIONAL / DEGRADABLE | Growth/Search depth increases when authorized outcomes exist; missing/denied/failed is never zero and never blocks visibility/fulfillment alone. | SC-14; handoff/degradation; BP29/32/45/51 |
| Revenue authorized export surface | 29,32,45,47,51 outcome-enabled slices | CONTRACT-ONLY | Agree exact source IDs/times/units/corrections/field permissions before independent implementation. Runtime outcomes remain optional. | SC-14; uncontracted details |
| 28 page evidence | 09–10 attribution enrichment | INTEGRATION-LATER | Captured source/landing URL remains Revenue-owned; intake has no mandatory WebsitePage FK. Matching is one-way evidence enrichment. | SC-11/14 |
| 38 strategy references | 24–26 | INTEGRATION-LATER | Attach SearchTarget/SearchTopic references where relevant without requiring Search for initial editorial lifecycle. | A20A§27; SC-11/15 |
| 19,29–35,51 | 52 | HARD | Full overview requires actual in-scope domain summaries; individual unavailable capability still degrades honestly. | BP52 |
| 12–14/23,47–49 | 52 | CONTRACT-ONLY | Stable authorized Robin/Search summaries can be consumed without moving source ownership to overview. Implemented sources required for final enabled cards. | BP52; SC-16 |
| 52 | 53 | HARD | Cross-property overview aggregates approved property summaries with explicit platform scope. | BP53 |
| 48 Search portfolio surface | 53 | CONTRACT-ONLY | Reuse Search program health; avoid second source-of-truth portfolio. | BP53 additions |
| All active release features | 54,55 final gates | INTEGRATION-LATER | Security/reliability work starts incrementally but final review must cover integrated release behavior. | BP54/55 |
| 54,55 +all active feature gates | 56 | HARD | Release requires integrated security, reliability, critical journeys and controlled migration/rollback evidence. | BP56; AGENTS completion |
| 54 | 55 | SEQUENCING / PRODUCT | Independent inspections can overlap; unresolved security fixes must be included in final performance/recovery evidence. | BP54/55 |

### Cycles that disappear when construction is separated from integration

34’s “Website, Content, and Search Findings use the same work system” defines a reusable contract and eventual integration obligation; it cannot mean Search45 must exist before34, because46 explicitly consumes34–35. Likewise48 anticipates49 optimization failures, and35 must support future49/50 provenance. Establish the shared shapes first, prove current paths, and attach real later producers when they arrive. Preserve deferred integration obligations; do not mark a mocked cross-feature journey passed.

26 before28 and12/24 before36 are different: they expose shared substrates needed earlier than their listed full-feature implementation. Resolve those narrow first-implementation boundaries through the Shared Change Gate, rather than invent private substitutes or pull entire later phases forward.

## 4. Per-feature readiness table

**R = REVENUE-INDEPENDENT; G = GROWTH/SEARCH-INDEPENDENT; B = SHARED-BLOCKER; X = CROSS-LANE-CONTRACT-DEPENDENT; C = CONVERGENCE-ONLY; S = SERIAL-REQUIRED.** “Independent” means independent of the other product lane once listed prerequisites/gates hold—not independent of central schema/auth files. X includes cross-domain shared owners inside Growth/Search.21 uses S only as an exclusion marker: no MVP scheduling is authorized, and it creates no serial predecessor. Every active row also requires its approved feature scope and resolution of new shared capabilities/FKs/events; omitted unchanged infrastructure is inherited.

These readiness classes are not ownership classifications. In particular, R on F13/F23
does not make Robin core Revenue-owned; it describes the Revenue-first construction path.
SC-16's explicit owner split and the Robin↔Revenue contract checkpoint govern reliance.

| Feature | Lane class | Hard prerequisites | Contract-only prerequisites | Optional / order-only dependencies | Shared blocker | Parallel-safe after |
|---|---|---|---|---|---|---|
| 09 | R | 08 | Lead event/source export; own shared references/capabilities | 28 page enrichment | Lead relations, capabilities and event definitions | Approved 09 boundary + existing 08 |
| 10 | R | 09, 07–08 | Public intake event/notice contract | 13 Robin dedup integration later | Public routing and new event/subject | 09 services and intake contract |
| 11 | R | 07–08; 09 where Lead context is wired | Communication/consent/delivery; property-number provisioning | 10 ingestion as upstream source | SC-10 first business implementation | Human messaging can be built without intake; declared order retains 10 |
| 12 | X | 08–09; 11 context; own minimum Shadow reasoning/validation/evidence foundation | SC-03 geography; shared gateway; Robin↔Revenue tool/policy/evidence/verification contracts | 14 scheduling disabled; no F13 live prerequisite | Shared geography, gateway and typed service reliance | Inspectable no-effect Shadow path; retain declared 10–11 order |
| 13 | R | 09–12, including 10 live intake | Typed tools, handoff notice and duplicate-awareness policy | 14 scheduling; later commercial services | New shared effects/events/notices | Live intake + communication + configuration |
| 14 | R | 08 + Cronofy adapter; 12–13 for Robin slice | Unified Appointment/JobVisit schedule; connection boundary | 17 JobVisit (future attachment) | Schedule and provider shared surfaces | Base scheduler independently; full gate after Robin core |
| 15 | R | 08–09 | Shared PropertyService relation and commercial export meaning | 14 scheduling | New shared FKs and future outcome surface | 09 + reviewed commercial references |
| 16 | R | 06–07, 11, 15 | Public document grant; signature retention; delivery/acceptance facts | Lead WON composition if eligible | Media/grant/delivery security | Drafting + human communication and grants |
| 17 | R | 06,08,14 base; accepted path needs 16 | Manual provenance and ChangeOrder/document boundaries | 16 accepted Estimate path only if manual path approved | Schedule extension/media/provenance | Base manual work can precede 16; complete advanced scope still gated |
| 18 | R | 07,17; 11 delivery service; reusable scoped grant | 16 document-grant surface if extracted; Revenue export | 16 Estimate-origin billing; processor deferred | Document grants/delivery + outcome contracts | Job, grants and billing services; no processor dependency |
| 19 | R | 09,14,16–18 for required rule set | Delivery-failure projection and sensitive outcomes | 22 review-request state later | Events/notices; no shared Finding write | Source lifecycle truth exists for every enabled rule |
| 20 | R | 09,14–19 owning services | Typed AI extraction and consequential confirmation | 13 Robin runtime not required | Approved source commands; AI adapter reuse | All supported command paths exist; no fabricated tools |
| 21 | S — deferred | None; not an MVP gate | None now | None | Post-MVP authorization only | Never select for MVP parallel work |
| 22 | R | 07,11,17–19 | ReviewRequest delivery/idempotency contract | 20 text capture; 21 excluded | SC-10 sends/notices | Eligible Job and deterministic policy; independent of Quick Capture |
| 23 | R | 12–14 plus 15–19/22 for exposed tools | New tool scopes and shared effects | 20 is compatibility/product-order, not automation engine | SC-16 tool approvals | Owning services + mode matrix; declared plan also lists 20 |
| 24 | X | 03–05 and PropertyService; geography substrate when referenced | SC-03 geography; SC-11 money-page relationship | 28 full ingestion; 38 SearchTarget later | First geography/page links not yet represented | Approved relationship design; required shared substrate live before integration |
| 25 | G | 24,06 | Explicit content-media references | 28 metrics; 38 targets | Media FK/access extension | Content identity and approved media relation |
| 26 | X | 24–25,07; real page substrate/search for full link workflow | SC-09 publishing connection; SC-11 page/link/publication | 28 automated imports; 38 SearchTarget | Connection/page first consumers may precede 27–28 | Approved shared substrate + real publisher adapters |
| 27 | B | 03–05,07 | IntegrationConnection and credential/disconnect/job interface | 09–23 Revenue; 36 geography | SC-09 first shared connection implementation | Connection contract/capabilities agreed; no Revenue feature required |
| 28 | B | 27,07 | URL/period normalization; page and metric exports | 24–26 managed content mapping | SC-11 first normalized data implementation | Connection + page/data contract |
| 29 | G | 28 | Normalized metric query and optional Revenue export | 09/16/17/18 outcomes | SC-14 only if outcome joins enabled | Web-only metrics independent; authorized outcomes later |
| 30 | B | 28–29 | Shared Finding schema/dedup/review lifecycle with Work Management | Revenue-specific optional evidence; 34 ticket workflow | SC-12 first shared diagnostics | Finding/review contract established; no ticket implementation needed |
| 31 | X | 30,29 | Work-owned review transitions; template recommendation surface | 34 ticket creation; 35 review measurement | First review-state writer must honor Work ownership | Review contract live; ticket integration later |
| 32 | G | 24,28–29; 26 for managed publication path | Content-to-page/publication matching and outcome queries | Revenue attribution; 38 Search targets | SC-11 matching/SC-14 when used | Real managed publication path + web evidence |
| 33 | G | 30,32 | Shared Finding rule extension/visibility | 34 work execution; 45 Search consumption | SC-12 rule/evidence extension | Shared diagnosis + scorecards |
| 34 | B | 30 Finding substrate; 06–07 | Work-owned review + prescription linkage | 31 UI; 33/45 rule families | SC-13 templates/tickets first implementation | Confirmed Finding flow, template versions and shared review contract |
| 35 | B | 34 normal path; 29 comparable web evidence | D2 persistence; measurement contribution/resolve-reopen | 49/50 alternative producers; Revenue evidence | SC-13 Intervention/review first implementation | Normal work + evidence; define alternatives without requiring future FKs now |
| 36 | B | 03–08 relevant shared foundation | Shared geography; policy/version contracts | 27 status; 28–35 later consumers | SC-03 geography if still absent | Reuse earlier shared entities; no blanket 27–35 runtime dependency |
| 37 | X | 36; canonical WebsitePage substrate | 28 owner-approved page surface (seeded equivalent allowed) | 28 full live ingestion; AI suggestions | SC-11 page identity and scoped links | Same canonical page model, never a Search clone |
| 38 | G | 36–37 | D1 identity/market contract; target assignment history | 28 GSC; keyword-volume providers | SC-15 new cross-domain strategy refs | Semantic graph + shared IDs; manual target creation works |
| 39 | G | 38 | Coverage rule/version and evidence availability | 28 GSC,41 ranks,42 indexability,44 authority | Shared evidence normalization | Targets exist; insufficient-data is valid |
| 40 | B | 36; shared IntegrationConnection;07 | BTLS provider interfaces/quotas/usage | 39 coverage; all vendors need not exist yet | SC-09 connection/capability expansion | Approved connection substrate and required provider choices |
| 41 | G | 38,40; shared BusinessLocation coordinates | Dated rank/grid result + market comparability | 39 coverage UI | Provider adapters and SC-15 evidence | Selected approved providers + quotas before calls |
| 42 | X | 37,40; canonical pages | 30 shared Finding/evidence producer surface | 41 ranks;29 tracking evidence where available | SC-11 normalization + SC-12 contribution | Inspection foundation; real Finding feed required for full gate |
| 43 | X | 37–38,42;24–26,32–33 used content paths | ContentStrategy↔Search references; shared rule handoff | 39 coverage;41 ranks | Cross-domain content bridge | Real link graph/content inputs; retain broad declared 37–42 sequence |
| 44 | G | 36,40;28 GBP path for full local scope | SearchTrackedEntity subset from 41 when competitor identity used | 41 rank/grid collection | Shared GBP/identity reuse | Shared local IDs + approved provider evidence |
| 45 | X | 30; enabled rule producers in39–44 | Finding fingerprint/priority extension | Revenue outcomes; unavailable optional evidence | SC-12 shared diagnostic extension | All initial rule families supported; missing data stays explicit |
| 46 | X | 45,34–35;24–26 content-ticket path | SearchInterventionScope and prescription/version linkage | 49 optimization later | SC-13 + content bridge | Finding/work/publication provenance contracts implemented |
| 47 | G | 36,46; producers required by cycle policy | Source-record completion queries + policy snapshots | Revenue;51 measured results pending | Cross-source fulfillment truth | Required producers exist; missing required collection blocks fulfillment |
| 48 | G | 47 + health source queries | Health refresh contracts and platform access | 49 optimization state (later) | Cross-property authorization + refresh events | Cycle/Findings/provider health; wire future actions later |
| 49 | X | 46,36,40; managed-site capability | D2 action provenance;47/48 result/health updates | 48 UI does not authorize execution | SC-13/16 exact allowlist and effects | Execution policy+Intervention; declared completion order retains47–48 |
| 50 | S | 49;42 verification;35/46 provenance | Platform deployment/fan-out and target identity | 48 portfolio UI | Cross-property execution/provenance | Approved managed deployment and property verification; one coordinated boundary |
| 51 | C | 29,35,46;41 for rank/grid measurement path | SC-14 outcomes when available;49/50 provenance contributions | Revenue,47 summaries,48 portfolio;49/50 optional producers | Shared MeasurementReview and evidence/permission joins | Base review before all producers possible; final convergence verifies47–50 |
| 52 | C | 19,29–35,51 required summary surfaces | Capability-aware summaries incl. Robin/47–49 | Unavailable capabilities degrade at runtime | Cross-domain query/cache/visibility | All in-scope summaries stable; no duplicated source lifecycle |
| 53 | C | 52; platform authorization;48 Search source | Cross-property aggregate/assignment access | Disabled studio data | Platform authorization and portfolio joins | Stable property summaries and scoped portfolio services |
| 54 | C | All release-scope implemented surfaces for final gate | Security acceptance across SC-01–16 | Review can start incrementally | Any remediation changing shared policy | Final integrated candidate; checks run throughout |
| 55 | C | All release-scope implemented workloads for final gate | Performance/recovery/a11y targets | Profiling can start incrementally | Shared operational tuning and storage/query changes | Final representative system; fixes before release |
| 56 | S | 54–55 pass; all active MVP feature gates | Release/migration/rollback and flag approvals | 21 remains deferred | One controlled integration/release point | Staging critical journeys and repeatable migration/release evidence |

## 5. Shared prerequisite map

**E** = consume existing implementation; **F** = first planned implementation; **Δ** = extension of shared surface. First implementer means the earliest required capability producer, not transfer of semantic ownership. A Shared Change Proposal is required for first establishment of an uncontracted shared surface or a new shared relationship/capability/security rule. An exact already-approved extension need not be approved twice. The inventory SC column, readiness blocker column and this table jointly specify every feature’s gate exposure.

| Contract | Current status | First / next producer | Consumers that wait, and what can proceed | Proposal boundary |
|---|---|---|---|---|
| SC-01 Identity/auth/RLS | E03–05/08 | Δ09 and each new feature capability | All active features: private domain work can proceed after agreed permission surface; integration waits for code/SQL parity | New permissions, role bundles, RLS and cross-property scope. Do not generalize Operator access. |
| SC-02 References/audit | E03–08 | Δ09 and all new scoped relations | All active features; audit pattern consumed unchanged | Shared FK/back-relation/deletion effects or replay/audit meaning; not every private helper. |
| SC-03 Property knowledge | E PropertyService; F geography | 08 service already done.12/24 may first require geography subset;36 explicit comprehensive consumer/producer if absent | 12 knowledge,24 strategy,36–44 search. Review before reliance on geography.09/15 reuse service without waiting for36 | BusinessLocation/ServiceArea schema, scoped identity, lifecycle, capabilities and references. No ServiceLocation substitute. |
| SC-04 Revenue identity | E08 | Δ09 then Revenue services | Robin and outcomes receive approved scoped facts; Growth does not need new Customer schema | Exported identity/references or promotions such as shared Tags; private Revenue fields remain owner work. |
| SC-05 Media | E06 | Δ16 commercial documents;25 editor or earlier approved consumer | 16–18,25–26,34 and later attachments wait only on their own explicit relation/access extension | Retention/sensitive access, relationships and document profiles; no MediaAssetReference invention. |
| SC-06 Events | E07 framework only | Δ09/10 Lead family;27/28 sync; later publishers | Producers/consumers wait on exact validated payload/version; handler rollout proves replay compatibility | Registry/payload meaning and first producer-consumer effects; no wildcard bus. |
| SC-07 Jobs | E07 framework only | Δ10/13/14/16;26–28 and later Search | One shared runner/attempt model; each domain supplies actual handler | Handler identity, retry/idempotency, trusted writes and manual replay allowlist. |
| SC-08 Notifications | E07 generic notices | Δ10 Lead awareness,13 handoff;31/34 and later Search | First concrete source/subject needs authorized resolver; no arbitrary URL | Source/subject, recipient scope, dedup and effect semantics. |
| SC-09 Integrations | E07 email/SMS/sender/dispatch; F connections | 27 explicit IntegrationConnection;14/26 may need approved earlier subset;40 Search usage/adapters | 28 needs real connection.14/26 need relevant credentials/adapter only.41/42 need40 quotas and selected adapters | First shared connection/credential/disconnect shape and new adapter contracts. New paid vendors approved at owning feature. |
| SC-09 AI gateway | F planned narrow shared boundary | F12 minimum evaluation support; F13 live integration | Robin;20 provider reuse without Robin runtime dependency; no whole27 prerequisite | Shared integrations owns gateway/OpenAI; exact interface/model stays feature design; no multi-provider routing. |
| SC-10 Business communication | F | 11 Conversation/Message;16 Estimate delivery/grants;18 Invoice;22 reviews | 13 needs11 actual sends;16/18/22 reuse consent/transport safely | Business delivery/consent, public grant, media and provider handoffs. No shared transport ownership takeover. |
| SC-11 Web/editorial identity | F | 24 content;26 publication;28 page/metric/health.24/26 may establish an owner-approved page-reference substrate earlier | 25 needs24;32 needs editorial + web evidence;37 needs canonical page, not whole Google import.09 intake remains independent | Page/URL normalization, content-page/publication links and exported normalized evidence. |
| SC-12 Diagnostics | F | 30 shared schema/rules;31 shared reviewed disposition;33/42/45 rules | 34 uses confirmed Finding contract.30/31 need Work-owned review agreement before writing lifecycle | Dedup/evidence/version/review ownership; domains retain diagnostic rule meaning. |
| SC-13 Work/change/measurement | F | 34 templates/tickets;35 Intervention/MeasurementReview;46 Search scope | 31 consumes review/prescription contract;46/49/50 wait for real change-recording surface;51 reuses review | D2 persistence, templates/tasks, change provenance, comparison windows and lifecycle. |
| SC-14 Revenue outcomes | F | 09 Lead facts;16 acceptance;17 work;18 net collection. Export implemented when first consumer arrives | 29/32/45/47/51 may proceed in web-only mode; enabled outcome joins wait on producer-owned exact queries/permissions | Field projection, provenance/times/currency, correction/reversal, availability and revenue.view boundary. No generic DTO is frozen. |
| SC-15 Search evidence/strategy | F | 36–42 identities/evidence;45 priorities;46 scope;51 review contribution | 24–26 later target/topic reference;35/51 measurement;47/52/53 summaries | D1 identity, dated market/provider context, scope/evidence exports; no rank scalar on keyword. |
| SC-16 Delegated actions | F; explicit Robin/Revenue/shared owner split | 12 policy/evaluation/evidence;13 live execution;14 scheduling;20 confirmed capture;23 Revenue expansion;49 Search optimization | Each tool waits on its owner. Robin↔Revenue requires Signals, Authorized Context, Approved Capabilities and Verification before reliance;50 reuses Search boundary | New authority/effects/allowlist and shared reliance; Robin controls do not grant platform permission or transfer domain truth; no Robin2.0/handoff engine. |

### Early substrate decisions to record in owning specifications

1. **Geography:** decide whether12 or24 is the first consumer of durable shared ServiceArea/BusinessLocation records, or whether its initial approved fields are bounded knowledge/strategy text without a canonical identity claim. The latter is not permission for a private location catalog, and this analysis does not approve cutting required relationships. Before a real reference is used, the canonical shared surface must exist. Full36 is not a prerequisite.
2. **Page links:**24’s money-page relationship needs an explicit SC-11 meaning.26’s full page-search/link workflow needs real canonical inventory access. Full scheduled Google imports can wait; an owner-approved canonical page subset/manual inventory may precede28. No stand-in Search/Blog page table.
3. **Connections:**14/26 may arrive before27. Establish the required shared connection/credential subset once, with27 reusing it; do not require Google OAuth for Cronofy or WordPress.
4. **Review state:**30/31 implement shared diagnostic/review behavior before34’s full ticket workspace. Work Management’s lifecycle authority already applies.
5. **Robin↔Revenue:** agree exact Signals, Authorized Context, Approved Capabilities and
   Verification contracts before dependent implementation. Revenue owns the business
   surfaces; Robin owns orchestration policy/evidence; shared integrations owns gateway
   support. F12 must satisfy its own Shadow gate, then F13 adds live execution. Conceptual
   agreement never substitutes for a real producer at an integration exit gate.

These are concrete prerequisite specifications under existing authority, not new product choices to escalate now. If an implementer proposes changing meaning, ownership or required feature behavior, the Shared Change Gate requires authorized resolution first.

## 6. Schema / file collision map

Paths below are verified existing files/directories unless labeled planned. Anticipated model changes are analysis, not an approved migration list. Separate domain folders reduce code overlap but do not remove integration collisions. Ownership can prevent semantic duplication; shared-file/migration integration still requires coordination. This table identifies that need without designing the later Git/migration protocol.

| Feature pair / zone | Likely collision | Avoid by owner boundary or sequence? | Necessary condition / risk |
|---|---|---|---|
| 09 ↔24 | `prisma/schema.prisma`: ClientProperty/AppUser/PropertyService back-relations; `src/server/auth/permissions.ts`; new SQL policies; shared navigation/tests | Owner boundaries + coordinated shared edits; geography/page substrate before24 references | Different Lead/Content models do not make concurrent central edits safe.09 must not acquire WebsitePage prerequisite. |
| 09 ↔27 | Same Prisma/auth/SQL, event registry, property settings/navigation; no shared Lead/Connection lifecycle | Owner boundaries; first contracts and migration integration coordinated | Lower domain overlap, but27 introduces shared credentials/connections; not a zero-risk pair. |
| 12 ↔24 ↔36 | BusinessLocation/ServiceArea schema, `src/server/properties/` shared services, PropertyService lifecycle | First shared implementation serialized; consumers can follow independently | Avoid three private geography catalogs.36 must reuse existing service implementation. |
| 12/13 ↔20 AI consumers | Planned AIModelGateway/OpenAI boundary under shared integrations; capability/schema/event/job/Notification extensions where used | Shared integrations owns provider contract; Robin owns policy/evidence; Revenue owns its adapter and confirmed Quick Capture | Exact interfaces and shared changes require coordinated review; no provider client or Robin authority cloned into Quick Capture. No concurrent execution authorized. |
| 14 ↔26 ↔27 ↔40 | IntegrationConnection, `src/server/integrations/`, token/status/disconnect semantics | Single shared contract/implementation; independent approved adapters afterward | Google OAuth, sending identity, Cronofy and publishing credentials are related infrastructure, not interchangeable records. |
| 09/16/18 ↔29/32/45/51 | Revenue source facts/export queries; sensitive capabilities; joins and correction semantics | Producer owns source; publish contract before consumer work; no need to serialize whole lanes | Never infer collection from acceptance/Invoice, expose unauthorized totals or duplicate source facts. |
| 09/10 ↔28/37 | Captured landing URL versus WebsitePage normalization/links | Integration-later; owner-defined evidence join | Page discovery cannot block intake or rewrite historical source. |
| 24/26 ↔28/37/38/43 | ContentStrategy/PublicationRecord/WebsitePage references, URL identity, target links | First page surface before dependent FK; owners govern each side | ContentAsset is not WebsitePage; SearchTarget preferred page is not observed landing page. |
| 30/31 ↔34/35 ↔42/45/46 | Finding state/evidence/dedup, review transitions, template lineage, planned `src/features/work-management/` | Agree shared lifecycle before first writer; independent rules after substrate | Cannot have Website-owned and Search-owned review state or duplicate tickets. |
| 35/46 ↔49/50/51 | Intervention provenance, SearchInterventionScope, MeasurementReview and deletion effects | Work-owned substrate first; later additive producers through reviewed contracts | D2 alternatives do not authorize arbitrary ticketless changes. Failed execution cannot report successful change. |
| Any concurrent event producers | `src/server/events/internal-event-registry.ts`, `event-outbox.ts`, jobs registry/handlers and integration tests | Coordinate registration/version acceptance; independent handlers under approved types | Additive changes may break strict validators; durable intent/replay must remain safe. |
| 10/13 ↔31/34/48 | `src/server/notifications/notification-contracts.ts`, destination resolver, central UI | Owner extensions + coordinated resolver changes | Baseline lead awareness and Robin handoff also need intra-Revenue noise control. Reads do not complete source work. |
| 16/17 ↔25/26/34 | MediaAsset back-relations, access/retention policy, `src/server/storage/` | Consumer-owned relations; sequence any media-lifecycle change | No generic attachment registry or cleanup regression. |
| 48 ↔50/53 | Cross-property auth, health source projections and fleet root visibility | Platform scope contract before queries/actions;53 reuses48 | An Operator portfolio view never grants fleet execution or access to every property. |
| All schema changes | `prisma/schema.prisma`, `prisma/migrations/`, `supabase/security-migrations/`, migration application scripts and generated Prisma types | Coordinated migration/schema integration is mandatory | Generated client is derived; never hand-merge generated types or rewrite applied migrations. Protocol is later work. |
| All feature UI / completion edits | `src/components/` shared primitives, app shell/navigation, `context/ui-registry.md`, progress tracker | Domain-local UI first; coordinate shared primitives/status edits | Do not globally redesign controls or claim another feature complete. |

## 7. Revenue lane sequence

The dependency-driven construction order has branches. These are analytical windows; the current numbered execution rule still governs until a later approved plan changes it.

- **08 →09 →10**, with11 human communication constructible from07/08 + scoped09 context; current plan nevertheless places11 after10.
- **09/11 →12 →13**, with10 required for13’s actual public-intake journey.12 also needs its shared-knowledge boundary settled.
- **12 foundation →13 live activation** preserves Robin core ownership within this
  Revenue-first construction sequence.12 supplies its own minimum reasoning/validation and
  inspectable Shadow evidence; the four-part Revenue contract precedes reliance. No reverse edge.
- **14 base** can be constructed from08 + Cronofy/shared schedule contract. **14 Robin scheduling** waits for12/13; full14 is the initial Robin1.0 milestone.
- **09 →15 →16**, with11/06/07 required for16.15 does not technically wait for Robin or scheduling.
- **14 →17 →18**, with16 needed for accepted-estimate provenance and reusable commercial/grant surfaces. Manual Job is an allowed path, not permission to remove ChangeOrders or other required advanced behavior.18 records manual/external Payments without a processor.
- **09/14/16–18 →19**. Enable only rules supported by source facts.
- **09/14–19 →20** and **11/17–19 →22** are separate branches;22 does not depend on20 or21.
- **12–14 + later owning services +22 →23**; keep20 compatibility/declaration obligations when revising sequencing.

There is no technical09→10→…→23 monolithic chain. There is also no Revenue requirement to wait for all Growth/Search, and no active Feature21.

## 8. Growth/Search lane sequence

**Editorial track:**24 →25 →26. Smart Blog can begin before full Website data ingestion:24/25 create durable strategy and drafts without GA4/GSC performance. Required shared geography/page relationships must still be resolved. Full26 page search/linking needs canonical page inventory; publishing needs real adapter/credential support.

**Web-data track:**27 →28 →29 →30 →31. It does not depend on completing Revenue09–23 or publishing26. Exact shared Finding/review contracts precede30/31.

**Content convergence:**24 +26 managed-publication path +28/29 →32;30 +32 →33. Thus Content Intelligence genuinely consumes both editorial strategy/publication and normalized web evidence; Revenue attribution only increases depth.

**Work track:**shared confirmed Finding substrate from30/31 →34;34 +comparable evidence →35. Full Content33/Search45 rule inventories need not precede generic work construction. Later integration proves all rule families use the same service.

**Search foundation:**36 can establish program/policy/vocabulary without treating27–35 as a blanket runtime gate.37 needs36 and canonical WebsitePage (28 or its approved seeded substrate).38 needs36/37 and supports manual targets.39 then assesses targets with truthful insufficient-data states.

**Search evidence branches:**36 +connection substrate →40;38 +40 +coordinates →41;37 +40 +shared Finding handoff →42.36 +40 +normalized GBP →44, with rank observations optional and tracked-identity reuse agreed.43 needs actual link graph42 plus Smart Blog/Content Intelligence and target semantics; it does not technically require every successful rank run.

**Search fulfillment:**available required evidence families39–44 +shared diagnostics →45;45 +34/35 +content-ticket handoff →46;36 +46 +policy-required producers →47 →48. Policies distinguish required scope from optional observations.

**Execution and measurement:**49 needs governed site capability/policy and shared work/change persistence; attach47/48 cycle/health outcomes before declaring the whole feature complete.49 +managed deployment +per-property verification →50.35/46 +fresh41/web29 evidence permits core51 measurement; full51 is the convergence test across47–50, with authorized Revenue optional. Preserve broad declared completion order until the later approved sequencing revision.

**Final convergence:**52 combines actual studio summaries;53 aggregates with explicit platform scope;54/55 examine the integrated system;56 releases only after required gates.

## 9. Parallel windows

No pair is approved by this report. “Low” means lower architectural collision after the listed preconditions; it does not certify effort, provider availability or implementation quality. All pairs share schema/auth/migration integration risk described in §6.

| Revenue feature | Growth/Search feature | Shared contracts touched | Schema / likely file overlap | Cross-lane dependence | Risk / required preconditions | Pilot assessment |
|---|---|---|---|---|---|---|
| 09 | 24 | 01/02/03;06 on09;11 on24;14/15 later | Property/AppUser/service back-relations; Prisma, permissions, SQL, navigation; domain records otherwise separate | No Lead→content dependency;24 has unresolved first geography/page-reference requirements | Medium now; lower after exact24 relationships and required shared substrate exist, central extensions agreed | Good product-facing candidate after prerequisites. Cannot assume24 is self-contained because it is numbered first in Growth. |
| 09 | 27 | 01/02/06/07/09;03/04/14 on09 | Prisma/capabilities/SQL/events/navigation; no direct Lead↔IntegrationConnection FK required | None: Google connection does not consume Lead lifecycle | Low-to-medium structural risk after connection/security contract approval; OAuth resources and credential handling add external verification risk | Strongest baseline candidate: no geography/page/Work prerequisite. Recommend only if real Google test configuration can satisfy27 gate. |
| 10 | 25 | 01/02;06/07/08 intake;05/11 editor | Central capabilities/schema/UI; media relation only25; public ingest isolated | None after09 and24 | Low-to-medium after09/24 and approved media/notification contracts | Strong later pilot/window; not available from current baseline without completing prerequisites. |
| 15 | 28 | 01/02/03/06/07/09/11/14 | Property/service refs, central schema/policies; separate commercial/import services | No mandatory metric outcome join yet | Medium: both schema-heavy; require09,27 and normalized data contract | Useful later throughput window; less attractive first pilot. |
| 14 | 29 | 01/02/06/07/09/11/14/16 | Provider/jobs/capabilities shared; Appointment versus derived metric services separate | 29 may omit Revenue outcomes;14 full scope waits12/13 | Medium; Cronofy/schedule contract and28 exist; metrics must not presume payments | Viable later, not a baseline pair. |
| 17 | 37 | 01/02/03/05/06/11/14/15 | Shared IDs/media/auth; Job versus PageSearchProfile schemas | No Job↔Search graph dependence | Medium:14 and required commercial services ready;36 +canonical pages ready | Good later pair with isolated domain models. |
| 18 | 41 | 01/02/06/07/09/14/15 | Central jobs/auth/schema; Payment versus rank evidence separate | 41 must not wait for Payment;41 can enrich future51 | Medium provider + financial correctness risk;17 and38/40/coordinates ready | Parallelizable but too consequential for first pilot. |
| 19 | 45 | 01/02/06/07/08/12/14/15 | Separate BusinessException versus Finding; potential shared notice/event files | Optional Revenue prioritization needs approved export, otherwise omitted | Medium/high drift risk; distinct rule systems and source contracts explicit | Not a first pilot despite superficially similar diagnostic work. |
| 20 | 49 | 01/02/06/07/09/13/16 | AI adapter/authorization/typed-effects contracts; different owning services | No direct input-engine dependence | High safety/consequential-effect burden; both mature prerequisites required | Reject as first pilot; separate authority models invite confusion. |

**Recommendation:** prefer09 +27 for the first dependency-based pilot review. It replaces an unresolved geography/page dependency with an explicit, bounded shared IntegrationConnection contract owned by integrations. Both features still introduce central capabilities/relations; those changes must be agreed and integrated under the later approved protocol. If Google verification resources are unavailable, do not mark27 complete using mocks; prepare the24 shared-reference substrate and reevaluate09 +24. The latter can be a smaller external-integration burden, but current evidence does not establish it as the strongest ready pair.

## 10. Convergence points

| Convergence | Producers → consumers | Must already be stable | Evidence of completion |
|---|---|---|---|
| Shared business vocabulary | 08 and first geography producer →12/24/36/38/41/44 | One canonical service/location/area identity, scope/lifecycle and reference behavior | Same-property IDs and deactivation/history tests; no private duplicate catalogs. |
| Captured source ↔ normalized web page | 09/10 +28 →29/32/51 | Revenue captured source/time; URL normalization/page history; authorized join and unavailable state | Late discovery/reassignment does not rewrite original attribution or block public intake. |
| Editorial ↔ Search strategy | 24/26 +37/38 →43/46 | ContentAsset/Strategy/Publication versus WebsitePage; target/topic IDs; publication authority | Search-origin content work uses Smart Blog editor/publishing and actual publication evidence. |
| Diagnostics → work | 30/31/33/45 →34/46 | Versioned evidence, confirmed disposition, template/version and work owner | Real Finding-to-ticket journey preserves prescription/evidence; no fake Findings. |
| Work / automatic / fleet → actual change | 34/46,49,50 →35 Intervention | D2 exactly: normal ticket lineage; governed FleetRemediationTarget; approved AUTO_GUARDED OptimizationAction; property scope | Normal and both alternative producers call Work-owned persistence; failed effects do not create fabricated successful Interventions. |
| Change → measured result | 35 +29/41 +46 scope →51 | Pinned before/after periods, target-page history, dated provider/market evidence, review states | Insufficient/unhealthy/incomparable evidence produces honest uncertainty, never automatic success. |
| Revenue outcomes → measurement | 09/16/17/18 →29/32/45/47/51 | Exact exported facts/time/currency, correction/reversal provenance, sensitive field permissions | Denied/unavailable/partial/zero tests; no double-counting; payments distinct from accepted/issued values. |
| Feature51 final loop | 47–50 +work/web/Search evidence →51 | All producer paths +measurement surface +optional Revenue handoff | Search Finding→work→actual change→fresh evidence→review; fleet and guarded paths included as implemented. |
| Search cycle delivery ↔ health | Collection/evaluation/work/actions →47/48 | Policy snapshot, required/optional obligations, source result identity and replay | Failed required collection blocks fulfillment; pending measurement or absent optional Revenue does not. |
| Property overview | 19 +29–35 +51 +Robin/Search summaries →52 | Owner-controlled capability-aware query contracts and cache invalidation | Cards preserve source truth and reveal only allowed detail; no duplicated studio. |
| Portfolio overview | 52 +48 →53 | Explicit cross-property capabilities, scoped summaries, pagination/visibility | Client denial and narrower Operator rules; no unrestricted fleet data. |
| Hardening/release | All active surfaces →54/55→56 | Integrated migrations, security, reliability, flags, approved provider/policy configuration | Staging journeys, replay/tenant/privacy checks, restore and rollback readiness;21 remains excluded. |

## 11. Critical path to safe parallelism

The shortest technically safe route does **not** require completing Revenue09–23, Work34–35 or all Search before splitting. It requires closing the selected pair’s shared boundaries and explicitly authorizing a different execution regime. The following is a dependency checklist, not the later execution plan or protocol.

| Stage | Required result | Can wait |
|---|---|---|
| BEFORE PARALLEL DEV | Canonicalize the reviewed dependency map. Complete the separately authorized ownership/execution/Git/migration preparation. Explicitly reconcile AGENTS one-numbered-feature-at-a-time and build-plan prior-phase/exit-gate rules for a bounded two-lane pilot. Approve each pilot feature specification and resolve only its affected Shared Change Proposals. | Whole future architecture/API specifications; all planned shared models. |
| BEFORE PARALLEL DEV —09 +27 candidate | Agree09 shared relations/capabilities and Lead source/event boundary; agree27 IntegrationConnection credentials, disconnect/refresh, scoped queries and job contract; ensure required real integration test resources. Establish any shared runtime prerequisite before the dependent integration. | Geography, WebsitePage, Findings, Intervention and Revenue outcome consumer DTOs are not required by this pair. |
| BEFORE PARALLEL DEV —09 +24 alternative | Resolve24 geography and money-page meaning, first shared implementer, required live subset and compatible relations. Do not approve a phantom canonical FK or a hidden private catalog to avoid dependency. | Full36 SearchProgram and full28 automated import pipeline. |
| AFTER LANE SPLIT | Private approved domain work; publish shared producer surfaces when the next consumer actually needs them; integrate each source before consumer exit gate. Build explicit missing-capability states. | Optional outcome joins and later Search/editorial handoffs. |
| INTEGRATION CHECKPOINT | Validate actual combined schema/security/registry changes, selected feature exit gates and shared tests. At later consumer arrival prove geography, page identity, diagnostics/work and outcome contracts with real producers. | Broader product convergence until corresponding features arrive. |
| LATE CONVERGENCE | Complete46/47–51 handoffs and52/53 overview; final54/55 gates;56 staging/release. | Post-MVP21, native mobile, Robin2.0, connected mailbox, payment processor. |

**Critical distinction:** contract agreement lets independent construction begin; it cannot substitute for an implemented service, migration or external provider at the consumer’s working exit gate. A shared prerequisite belongs before its first reliance, not automatically before the entire lane split. No extra permission is required to finish this read-only report; later pilot authorization is outside the current task.

## 12. Architecture conflicts / human decisions

**Robin reconciliation is approved; dependency-map adoption remains separate.** The
2026-10-02 amendment reflects the approved owner split, gateway and evaluation foundation.
D1/D2 remain binding; exact implementation detail stays with its feature and Shared Change
Gate. This supporting draft does not authorize its own canonicalization or reorder features.

| Issue | Exact sources | Resolution / smallest later action |
|---|---|---|
| Parallel candidates versus serial governance | AGENTS “Unit of Work” / “Current Implementation Target”; build-plan Core Principle and Phase Execution Pattern; SC Shared Change Gate | Real execution is still serial. A later authorized plan must explicitly permit the bounded lane split and reconcile these rules. This map does not grant it. |
| Geography listed at36 but referenced earlier | BP12 knowledge, BP24 related location; A20A§5 and §27; SC-03 | Shared ownership already decided. First required consumer specifies/establishes the minimal canonical surface through the gate; no need to ask whether a customer worksite can substitute—it cannot. |
|26 page search precedes28 page ingestion | BP26/28; SC-11 | Separate shared page substrate from full import workflow. Exact earliest page/relationship implementation needs a proposal if uncontracted; avoid a second page inventory. |
|31 review UI precedes34 Work feature | BP31/34; A21; SC-12/13 | Work Management owns review lifecycle from its first implementation. Earlier UI can consume that surface without owning a duplicate. |
|51 dependency list includes Revenue outcomes | BP51 Dependencies; A20A§30/42; SC-14 and explicit graceful degradation | Revenue evidence is optional depth, not universal Search prerequisite. Full shared measurement/provenance and applicable evidence readiness still required. |
|Broad37–42 /47–50 ranges versus specific runtime needs | BP43/49/51 | Preserve declared completion sequencing. The technical graph identifies independent construction slices and later integrations; any reordered full-feature execution is a later plan change. |
|Deferred21 appears in numbered range09–56 | BP21 and Core Principle | Exclude from all active dependency gates; no new decision. |
| Robin identity versus Revenue construction lane | Root architecture §20; SC-16; adopted Robin detail | Robin core/runtime/policy and Revenue adapter/domain operations have distinct owners; lane/readiness labels grant neither ownership nor parallel authority. |
| F12 Shadow evidence versus F13 live runtime | BP12/13; SC-09/16 | Minimum reasoning/validation/evidence exists for F12's gate; F13 extends it for live execution. Exact design remains feature architecture; no reverse dependency or weaker Shadow gate. |

Future feature-specific approvals remain: exact public/shared query and event shapes; new capabilities/relations; provider selections; Search thresholds/cadence/retention;49 allowlist and managed-site capability; D2 persistence and field-level Revenue projections. Architecture explicitly leaves these to owning specifications. Do not reopen all of them before a09+27 pilot, and do not implement them without the required gate when reached.

If adoption is intended to authorize concurrency immediately, the smallest missing decision is an explicit governance change permitting that concurrency, followed by the preparation artifacts the user has reserved for later. Adoption as a dependency reference alone needs no such implied permission.

## 13. Proposed dependency-map artifact

Recommended path: **`context/shared/dependency-map.md`**. This is a draft embedded below, not a repository file. On adoption, add it to discovery with authority limited to dependency reference; reconcile sequencing with the build/feature plans explicitly rather than create a competing lifecycle authority. Retain this report as the detailed evidence/edge register.

```markdown
# BTLS — Dependency Map

Status: PROPOSED. Evidence: main @ 7d211e2f9e6ee77755031674a2826a951ec65b10. Scope: Features09–56. Features01–08 complete; all active09+ unimplemented;21 deferred. Reverify HEAD and source contracts before implementation.

## Authority and use

Terminology: shared/ubiquitous-language.md. Cross-domain ownership/gates: shared/shared-contracts.md. Lifecycle/policy: architecture.md. Represented DB: Prisma and ordered migrations. Execution sequencing: build/feature plans. This map identifies prerequisite surfaces; it does not authorize parallel development or override one-feature-at-a-time governance.

H = runtime HARD; C = CONTRACT-ONLY construction boundary; O = OPTIONAL/DEGRADABLE; P = SEQUENCING/PRODUCT; I = INTEGRATION-LATER; F = SHARED-FOUNDATION. C requires exact approved contracts and real implementation before integration gates. Independent construction is not full-feature completion. Broad roadmap ranges remain declared sequencing until explicitly revised.

## Shared foundations

- Existing:03–05 tenant/auth;06 media;07 events/jobs/notices/transport;08 Customer/workforce and shared PropertyService.
- SC-03 geography: first required12/24 consumer may establish canonical BusinessLocation/ServiceArea through gate before full36. Never substitute ServiceLocation or create lane-private catalogs.
- SC-09 connections:27 is explicit IntegrationConnection feature;14/26 may need an approved earlier subset.40 reuses it and adds Search adapters/usage limits.
- SC-11:24 editorial;26 publication;28 page/normalized evidence. Agree24 money-page linkage and provide real canonical inventory for26 page search; full Google ingestion may follow.
- SC-12:30 diagnostics;31 review writer consumes Work-owned lifecycle. SC-13:34 work;35 Intervention/MeasurementReview;46 Search scope. Future consumer domains do not change those owners.
- SC-14:09/16/17/18 own Revenue facts. Export shape, permissions, corrections and availability agreed before consumer reliance; no generic outcome API exists today.
- SC-09 AI gateway: planned shared-integration boundary, initially OpenAI;12 evaluation minimum and13 live integration.20 may reuse it without Robin runtime/modes; no whole27 prerequisite.
- SC-16: Robin core/runtime/policy differs from Revenue adapter/domain ownership. Signals → Authorized Context → Approved Capabilities → Verification checkpoint precedes reliance. No cross-Studio Robin substrate or adapters.
- New capabilities/FKs/back-relations/deletion effects/events/provider/shared-query surfaces follow Shared Change Gate. Exact already-approved extensions need not be approved twice.

## Construction dependencies

| Feature(s) | Required surface / important exceptions |
|---|---|
|09|H08; O28 page enrichment. No Search prerequisite.|
|10|H09/07–08; intake independent of Robin.|
|11|H07–08; C09 message context; P10 before11 in current plan.|
|12|H09/11 context and own minimum reasoning/validation/inspectable Shadow evidence; C/F shared knowledge/geography/gateway; Revenue contract checkpoint; no13 dependency; future tools disabled.|
|13|H09–12, including live10 event and12 evaluation foundation; live response/approval/takeover/handoff through Revenue contracts; no scheduling tool yet.|
|14|H08 +Cronofy for base; H12–13 for Robin scheduling. I17 JobVisit; no JobVisit required for base.|
|15|H08–09; does not technically need13/14.|
|16|H15/11/06–07; real grant, delivery, immutable acceptance and media.|
|17|H14 base/08/06; H16 accepted path OR authorized manual path; C commercial/ChangeOrder surfaces.|
|18|H17/07, communication and scoped grant; O16 Estimate origin; processor deferred.|
|19|H09/14/16–18 for required rule set. BusinessException is not Finding.|
|20|H09/14–19 commands; confirmed input, not Robin.|
|21|Deferred. No active incoming/outgoing MVP dependency.|
|22|H07/11/17–19; no20/21 dependency.|
|23|H12–14 and implemented later services/22 for exposed tools; P20 compatibility/declaration.|
|24|Shared service/geography and money-page reference contracts; no full28/36 prerequisite.|
|25|H24/06; explicit media relations.|
|26|H24–25/07 +real canonical page/link access; C connection/credential substrate; full28 imports not universal.|
|27|Existing auth/jobs +first SC-09 connection contract; no Revenue09+ requirement.|
|28|H27; first canonical pages/metrics/health.|
|29|H28; O Revenue facts.|
|30|H28–29; F shared Finding/review contract.|
|31|H30/29; C Work review/template surface; I34 ticket UI.|
|32|H24/28–29; H26 managed-publication path; O Revenue attribution.|
|33|H30/32; I34 and later Search rule consumers.|
|34|H shared confirmed Finding substrate; C reviewed lifecycle; I33/45 rule-family integration.|
|35|H34 normal path +29 comparable evidence; C D2 persistence; I49/50 alternative producers.|
|36|Existing platform/service +shared geography/policies;27–35 only as applicable, not blanket H.|
|37|H36 +canonical WebsitePage; approved seeded equivalent allowed, no cloned page identity.|
|38|H36–37; manual targets allowed; O GSC. D1 key: propertyId+normalizedQuery+languageCode.|
|39|H38; O rank/indexability/local evidence; explicit INSUFFICIENT_DATA.|
|40|H36 policies/shared connection/jobs; approved provider contracts and quotas.|
|41|H38/40 +BusinessLocation coordinates +selected approved providers.|
|42|H37/40/pages; C30 Finding handoff; real shared feed for full gate.|
|43|H target semantics/42 link graph +Smart Blog/Content Intelligence paths; O rank/coverage enrichment; retain declared37–42 sequencing.|
|44|H36/40/GBP normalized path; O41 ranks; C41 tracked-identity subset as used.|
|45|H30 and applicable39–44 rule producers; O Revenue. No SearchOpportunity clone.|
|46|H45/34–35; Smart Blog for content-ticket path; SearchInterventionScope.|
|47|H36/46 and policy-required collection/evaluation; O Revenue/outcome measurement.|
|48|H47 and health source facts; I49 approval/failure refresh.|
|49|H policy/site capability/46 work provenance; I47–48 result/health; full declared order retained.|
|50|H49 +managed deployment/per-property verification and Work-owned Intervention.|
|51|H29/35/46 +41 rank/grid path; I47–50 full convergence; O authorized Revenue facts.|
|52|H19/29–35/51 plus stable enabled Robin/Search summaries.|
|53|H52 +platform authorization; C48 Search health reuse.|
|54–55|Incremental checks throughout; final gates need integrated release scope.|
|56|H54–55 and all active feature gates; controlled staging/release.|

## Convergence and non-negotiable rules

- Source/landing-page truth remains Revenue-owned; later page matching cannot block intake or rewrite capture history.
- Shared Findings feed Work templates/tickets. Search/Content do not create competing work engines.
- D2: all Interventions have durable provenance; normal Finding→template→ticket→Intervention; governed FleetRemediationTarget or approved AUTO_GUARDED OptimizationAction are the only approved alternative paths. Work Management owns all history.
- D1 excludes geography from keyword identity; targets and dated observations preserve market/provider distinctions.
- MeasurementReview owns outcomes. Fulfilled cycle, completed ticket, actual change, provider acceptance and measured improvement are distinct.
- Missing Revenue lowers measurement depth; absent/denied/failed is not zero. Sensitive fields require the owner-defined permission.
- Required policy collection/work can block fulfillment; pending measurement and optional outcomes do not automatically block it.

## Parallel candidate boundary

Strongest baseline candidate:09 +27 after exact shared connection/security and09 contracts are approved, real provider validation is available, and later execution governance explicitly authorizes a pilot.09 +24 is an alternative after geography/money-page prerequisites are resolved. Neither pair has zero shared-file overlap: Prisma, capability/SQL rules, events, navigation and migrations need coordinated integration.

Before any split: approved dependency reference, separately completed ownership/execution/migration preparation, reconciled serial rules, approved feature specifications and affected shared proposals. Later checkpoints cover real producer-consumer tests,51 measurement,52/53 overviews and54–56 release gates. This artifact starts none of that work.
```

## 14. Readiness verdict

All48 roadmap slots09–56 are accounted for, including deferred21; the typed edge register separates runtime, contract, optional, sequencing, shared-foundation and integration dependencies. Planned first implementers, per-feature blockers, collisions, candidate pairs and convergence gates are explicit.

The Robin consequences are now reconciled in this supporting analysis. Exact future
interfaces remain governed feature work. Review and separately authorize dependency-map
canonicalization against the then-current canonical documents; this adoption does not
create that artifact. No parallel pilot, skipped gate, shared implementation or new
cross-Studio Robin prerequisite is authorized. Governance enabling concurrency remains
separate future work.

SUPPORTING DRAFT UPDATED — DEPENDENCY-MAP CANONICALIZATION REQUIRES SEPARATE AUTHORIZATION
