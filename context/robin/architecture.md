# Robin Architecture — Adopted Subordinate Detail

**Repository location:** `context/robin/architecture.md`  
**Date:** 2026-10-02  
**Status:** ADOPTED ARCHITECTURAL DIRECTION — O1–O7 and the bounded repository reconciliation were approved on 2026-10-02. Documentation adoption does not authorize implementation. Remaining PROPOSED, OPEN and DEFERRED material retains those limits.  
**Contents:** Architecture §§1–25; source/decision appendix A; verified reconciliation/adoption appendix B.

**Authority:** This document is subordinate to [root architecture](../architecture.md),
[Ubiquitous Language](../shared/ubiquitous-language.md), [Shared Contracts](../shared/shared-contracts.md)
and [build plan](../build-plan.md) in their respective concerns. It is neither a separate
terminology authority nor an implementation/parallel-development plan. The approved
[Shared Change Gate resolution](../shared/shared-contracts.md#2026-10-02--robin-architecture-adoption-approved-resolution)
records the adopted boundary. Appendix source history is evidence, not competing authority.

## Evidence and status conventions

| Key | Source | Role |
|---|---|---|
| S1 | Robin — Consolidated Architecture Source Pack (`Pasted text(5).txt`), §§1–50 | Status-labeled architecture source |
| S2 | Robin — Consolidated Architecture Source Extraction (`Pasted text (2)(1).txt`), §§1–84 | Product vision, current boundaries and future direction; not a finalized specification |
| S3 | BTLS Command Center — Current-State Handoff for Robin Architecture Track (`Pasted text (3).txt`), §§1–10 | Reported canonical state and governance |
| R | Owner rulings on O1–O7, 2026-10-02 | Approved direction and explicit limits; recorded in §25 |
| A | Owner-approved repository reconciliation and controlled documentation adoption, 2026-10-02 | Verified current repository evidence and bounded canonical amendments; Appendix B and Shared Change Gate resolution |
| I | Draft instruction (`Pasted text(8).txt`) | Task requirements and proposed direction |

Repository reconciliation and adoption preflight independently verified canonical `main`
at `7d211e2f9e6ee77755031674a2826a951ec65b10`, matching S3's pinned commit; no intervening
main commits existed. Governing documents, source registries, schema and relevant ordered
security migrations were inspected. Features 01–08 are complete; F09+ and Robin remain
unimplemented. This is repository evidence, not a live-database or production deployment
claim. Recheck current authorities before later implementation. The reviewed source is
retained as [historical evidence](architecture-draft.md), not a governing alternative.

**APPROVED** means direction adopted under R/A within §25's limits, not implemented.
**SETTLED** retains established constraints reconciled with the governing sources, not an
implementation claim. **PROPOSED** remains a recommendation awaiting approval; **OPEN**
identifies unresolved design; **DEFERRED** is outside Robin 1.0. A PROPOSED passage cannot
override governing files or become mandatory through this document's adoption. Specific
paragraph labels take precedence over section labels.

## 1. Purpose

**SETTLED.** Robin 1.0 is the Revenue Response Sidekick. It prevents opportunities from being lost through slow responses, missing information, forgotten next actions, scheduling friction and poor handoffs. It helps people respond, understand, qualify, schedule and continue work with useful context. [S1 §§1,5; S3 §6]

**PROPOSED enduring purpose.** Robin reduces what humans must remember, enter, search for, coordinate and reconstruct. Operational memory asks what remains unresolved; orchestration asks what should happen next and who or what may carry it. In 1.0 this uses bounded knowledge, Robin evidence and Revenue-owned `NextRequiredAction`, not a generalized memory engine. [S2 §§3–9,16–17]

## 2. Product Identity

**APPROVED — O1.** Robin is a first-class resident subsystem of BTLS Command Center and its horizontal operational-intelligence and action layer. Robin is not a fourth Studio and does not own Studio/domain truth. Robin 1.0 implements this architecture narrowly through Revenue Operations as the Revenue Response Sidekick.

Robin receives dedicated architectural attention for knowledge, reasoning, authority, evaluation, orchestration and interaction. It remains inside one application, repository, database, authorization system and deployment. It is not a separate CRM, task manager, unrestricted agent or generic chatbot. Conversation is one interface, not its product definition. [S1 §§2,34,49; S2 §§63–66,83; I]

## 3. Relationship to Command Center

| Area | Responsibility | Robin relationship |
|---|---|---|
| Command Center | Human operating environment | Robin resides in its workflows and governance |
| Revenue Operations | Revenue business truth and operations | First integration in the planned build; not implemented at the verified baseline |
| Web Growth | Website/content evidence, specialist diagnostics and editorial operations | Future authorized consumer relationship |
| Search Operations | Search evidence, strategy and fulfillment | Future authorized consumer relationship |
| Shared Work Management | Work execution, Intervention history and MeasurementReview | Future use through owning services |
| Shared/platform | Authorization, events, jobs, notifications, integrations and audit | Existing infrastructure reused |

**SETTLED authority.** Authority follows concern. Ubiquitous Language governs terminology; Shared Contracts govern cross-domain ownership, consumer boundaries, invariants and the Shared Change Gate; root architecture governs product/domain relationships and business policy; Prisma and ordered migrations represent database structure; root build plan governs feature sequence. Per-feature plans cannot invent architecture. This Robin document is subordinate where concerns overlap. [S3 §§2–3]

**APPROVED — O1:** Robin is a horizontal resident subsystem. Robin owns core/runtime/policy;
Revenue owns its first adapter/integration, not Robin itself. SC-16 states this mixed
ownership explicitly; shared infrastructure keeps its existing owners. A future Ownership
Matrix must preserve this separation but is not started by adoption. Horizontal identity
does not make every component shared platform infrastructure or create another build lane.

## 4. Current Scope and Evolution

| Horizon | Scope | Boundary |
|---|---|---|
| **SETTLED: 1.0, planned** | Revenue Response Sidekick, Features 12–14 | Bounded Revenue workflow and lightweight handoff |
| **SETTLED direction: 1.x, planned** | Additional bounded Revenue capabilities, including Feature 23 | Only when owning services and feature authority exist |
| **DEFERRED: 2.0+** | Organizational memory, richer field experiences and cross-system/cross-Studio orchestration | Separate architecture and roadmap approval required |

Robin 1.0 centers on `Customer → Contact → Lead → Conversation / Message → NextRequiredAction → Appointment`. This describes a workflow, not a new schema.

Planned capabilities include eligible lead activation; bounded knowledge; summarization; missing-information detection; supported Q&A; qualification; SMS acknowledgment and bounded follow-up; approved Lead field/stage changes; NextRequiredAction; scheduling through owning services; contextual notification/handoff; Shadow Mode; authority controls; approvals; takeover; typed tools; provenance and failure handling. Revenue policy governs allowed transitions and follow-up limits. [S3 §6; S2 §§67–74]

S3 reports Features 01–08 complete and all Robin implementation still planned. Horizontal identity does not authorize horizontal MVP implementation. Future examples involving Jobs, Invoices or Search do not enter 1.0 by appearing in a source pack.

## 5. Ownership and Sources of Truth

**SETTLED: Robin consumes truth; owning domains retain truth.** [S3 §§2,6,8]

| Truth or operation | Authority | Robin boundary |
|---|---|---|
| Customer, person-only Contact, Lead, Conversation, Message | Revenue | Authorized reads and owning commands |
| Appointment, Estimate, Job, Invoice, Payment | Revenue | No duplicate state or unimplemented tools |
| NextRequiredAction, AttentionFlag, BusinessException, ReviewRequest | Revenue | No competing Robin task/exception system |
| Website/content evidence and diagnostic meaning | Web Growth | Explain owner-produced evidence; do not replace diagnosis |
| SearchProgram, SearchKeyword, SearchTarget, Search evidence/policy | Search | Consume authorized specialist truth |
| Finding substrate | Shared diagnostics; producing domains own diagnostic meaning | No parallel Robin Finding |
| WorkPackageTemplate, WorkTicket, Intervention, MeasurementReview | Work Management | Work execution and history remain owner-controlled |
| ClientProperty, access, capabilities, PropertyService | Shared/platform | Canonical scope, permissions and identities |
| Events, jobs, Notification, audit, provider transport, MediaAsset | Shared/platform | Existing contracts and lifecycle |

Provider receipts and model output are evidence, not automatic business truth. Shared consumption never means shared mutation authority. Robin references the owning record rather than creating a second live representation of it.

## 6. Robin-Owned State

**SETTLED planned concepts:** `RobinConfiguration`, bounded `BusinessKnowledgePack` versions, `RobinRun`, `RobinAction`, proposals, approval/review and takeover state, Shadow evidence, knowledge/configuration references and action provenance. These are planned concepts, not claims about existing tables. [S3 §§6–7]

**APPROVED boundary — O3:** Robin may own configuration, runs, actions/proposals,
approvals/takeover state, Shadow evidence, knowledge/configuration references,
reasoning/action provenance and verification evidence, without duplicating live business
truth. Robin authority configuration selects behavior within platform/domain permission;
it cannot grant access. **PROPOSED physical evidence design:** Source references and limited
snapshots may support explanations; whether and how to persist snapshots remains for
F12/F13. Any retained snapshots are historical evidence, never competing current truth.

`RobinRun` describes a Robin episode; `JobExecution` supplies background execution. `RobinAction` records a proposal/attempt; Message or Appointment establishes the actual domain effect. `AuditEvent` remains canonical audit infrastructure.

**OPEN — F12/F13 architecture:** Physical schema, retention/deletion/redaction, snapshots
versus references, knowledge-review mechanics and approval/takeover granularity. The
ownership boundary above is approved; physical design is not. This adoption creates no
table, enum, permanent capability ID or event name.

## 7. Operating Lifecycle

**PROPOSED normalization of established boundaries.** [S1 §§3,21; S3 §6]

| Step | Responsible mechanism | Outcome |
|---|---|---|
| Observe | Registered signals and deterministic eligibility | Authorized trigger/source; duplicate handling |
| Understand / Reason | AI over authorized context and approved knowledge | Grounded interpretation, uncertainty and missing facts |
| Prioritize | Approved policy with bounded interpretation | Explain why attention is needed |
| Propose | AI selecting exposed typed capabilities | Specific action, arguments and intended result |
| Authorize | Deterministic checks and human approval where required | Permit, deny, defer or suppress |
| Execute | Owning application services and platform infrastructure | Recorded attempt and normalized result |
| Verify | Owner-defined state/receipt checks | Successful, pending, failed or unknown outcome |
| Record | Robin evidence, domain history and audit | Traceable result, suppression, correction or handoff |

Evidence is recorded throughout, not only after success. Humans supply judgment for ambiguity, consequential approvals, corrections and takeover. A trigger does not necessarily warrant action or notification.

## 8. Studio-to-Robin Contract

**APPROVED — O2.** The standard Robin-domain contract is `Signals → Authorized Context → Approved Capabilities → Verification`, implemented only where an actual domain integration exists. Each participating domain exposes four conceptual surfaces. S1 §4 supplies the first three; verification is made explicit using S1 §27 and I.

| Surface | Domain provides | Robin obligation |
|---|---|---|
| Signals | Registered/versioned event or eligible condition with property/source reference | Consume only authorized enabled triggers |
| Authorized Context | Purpose-scoped records, source versions, freshness and access rules | Retrieve only relevant permitted data |
| Approved Capabilities | Implemented typed operation and permitted transitions | Use owning service; no direct mutation |
| Verification | Success criteria, pending/failure evidence and reconciliation method | Report only evidence-supported outcomes |

Implement the pattern narrowly for Revenue 1.0 and existing platform dependencies. Future domains require separately approved contracts. This document does not establish a generic integration framework or register example event names from the source packs.

## 9. Capability Invocation

**SETTLED flow:** Model proposes typed action → runtime/Zod validation → property/capability check → Robin configuration/mode → Shadow suppression → consent, duplicate, business-hours and domain-policy checks → owning application service → result/audit → handoff when appropriate. [S3 §§6–7]

**APPROVED direction — O2:** `Robin → typed capability → validation → authorization/policy → owning service → domain truth → verification → audit`. The final service enforces its own invariants even when earlier checks succeeded.

A future capability registry should specify identity under agreed BTLS naming, owner, implementation status, triggers, context/access needs, input/output contracts, execution service, allowed modes, approval requirements, consent/business rules, idempotency, Shadow behavior, verification, failure/recovery, takeover behavior and audit evidence. This is a proposed registry contract, not a completed registry.

Only implemented approved capabilities may be exposed. Validate model arguments and human-edited arguments. No unrestricted SQL, provider SDK or arbitrary domain writes.

**APPROVED principles — O5:** Recheck access, consent, authority, takeover and relevant business preconditions at execution. Approval binds to the specific action/scope; material changes require a new decision. Replayed jobs cannot repeat a completed business effect. Unknown external outcomes require reconciliation before retry. Exact expiry times, concurrency and release behavior, and fallback routing remain OPEN for F12/F13 architecture.

## 10. AI vs Deterministic Logic

| AI may assist | Deterministic BTLS code owns |
|---|---|
| Natural-language understanding, summarization, extraction | Tenant/property scope, identity and access |
| Missing-information detection and interpretation | Permissions, authority, consent and required approval |
| Grounded Q&A and communication drafts | Business hours, service areas and policy enforcement |
| Selecting already-allowed capabilities | State machines and approved field transitions |
| Context synthesis and explanations | Idempotency, duplicates and retry eligibility |
| Qualification interpretation | Final qualification rules and scheduling eligibility |
| Clarification suggestions | Calculations, validation and final business mutations |

**SETTLED boundary; PROPOSED explicit allocation.** AI output is untrusted input. Plausibility is not fact, extracted instructions are not policy, and confidence does not create authority. Uncertainty can reduce action within permissions, never increase permissions. [S1 §22; S2 §§46,78; I]

## 11. Knowledge Architecture

**SETTLED.** Use a property-scoped, bounded, approved, versioned `BusinessKnowledgePack`: identity, services, areas, hours, FAQs, qualification, workflow, scheduling, escalation and approved response knowledge. Reuse PropertyService identities and agreed geography contracts; no private Robin catalogs. [S3 §§7–8]

Knowledge supports answers but cannot override live domain truth or executable policy. Availability comes from scheduling, consent from its authority, and Lead state from Revenue. Unsupported business facts must be omitted, clarified or escalated.

**PROPOSED lifecycle:** Existing business material becomes draft structured knowledge/configuration; an authorized approver reviews it; an approved version is activated. Corrections produce traceable proposed updates rather than silent policy learning. Past run evidence retains the versions actually used. Stale/conflicting knowledge restricts affected capabilities, not unrelated valid ones.

**APPROVED launch model — O7:** Management/client approvers provide and approve business knowledge and authority configuration; BTLS assists conversion of existing SOPs, forms and files into structured configuration. **OPEN — F12/F13:** Detailed knowledge-review mechanics, maintainer assignment, freshness, activation/rollback and shared-fact references versus Robin response knowledge. Universal automated document ingestion is not implicitly an F12 deliverable. **DEFERRED:** Knowledge Ocean, ontology learning and generalized memory.

## 12. Authority and Shadow Mode

**SETTLED.** Execution modes are per capability: `OFF`, `APPROVAL_REQUIRED`, `AUTOMATIC`. These document labels do not introduce a schema enum. [S3 §§6–7; I]

| Mode | Live execution |
|---|---|
| OFF | Capability cannot execute |
| APPROVAL_REQUIRED | Authorized human approval plus all other checks |
| AUTOMATIC | No per-action approval, but every other control still applies |

Shadow is a separate evaluation overlay. Authorized observation, reasoning and proposals may run; operational mutations, sends, appointments and handoffs are suppressed. Robin evaluation records may persist so there is evidence to review. They do not establish business effects.

**PROPOSED clarification:** Shadow cannot bypass read permissions or turn OFF into permission. A denied candidate may be recorded as denied; precise OFF-capability simulation policy remains OPEN. Evaluation visibility must not dispatch the proposed operational notification or customer message.

Evaluation evidence informs an authorized person's mode changes. Robin cannot promote itself. Readiness and promotion criteria must be explicit before live automation; no numerical threshold is invented here.

## 13. Human Approval, Takeover and Handoff

**SETTLED.** People can approve, edit, reject and take over. Missing knowledge, uncertainty, unsupported requests, policy ambiguity, consent restrictions, scheduling ambiguity or failed execution can require a stop. [S1 §§10–11; S3 §6]

1.0 uses RobinRun/RobinAction, handoff state/reason/context, shared Notification, Customer/Lead/Conversation links and an optional recipient. No generalized HandoffPackage domain.

Handoffs carry what happened, what Robin learned and already did, what remains unknown, why it stopped, the recommended next step, and relevant records/evidence. Recipient access applies to every included detail or attachment. Recommendations remain distinct from completed work.

**APPROVED principle — O5:** Takeover stops competing pending work within its agreed scope. **OPEN — F12/F13 mechanics:** Scope and release behavior must be designed; deliberate release with renewed eligibility checks is a proposed approach. Already-dispatched effects cannot be assumed cancelled; show actual/unknown status. Exact scope, release behavior and no-recipient fallback remain OPEN. Notification delivery is not acceptance, transfer of ownership or resolution.

## 14. Provenance and Explainability

**SETTLED direction; PROPOSED evidence contract.** Trace trigger/source, property/actor context, records and freshness, knowledge/configuration versions, prompt/model configuration, proposal, authority/policy outcome, approval/edit/reject, attempt/owner result, Shadow suppression, verification, failure, correction and takeover. Correlate with domain history and AuditEvent. [S1 §20; S3 §7]

| Category | Meaning |
|---|---|
| Observed | Identified system supplied evidence; source validity still matters |
| Reported | Human/customer stated it |
| Inferred | Robin interpreted evidence; uncertainty stays visible |
| Derived | Approved deterministic calculation produced it |

Do not silently promote an inference into a fact. Provider webhooks require owning-service validation before establishing business state. Explain decisions with concise evidence-linked summaries, policies and results; private model chain-of-thought is not required. Minimum evidence retention, redaction, access and deletion rules remain OPEN.

## 15. Verification

**APPROVED direction — O2.** Calling a tool is not achieving the intended business result. Each consequential capability needs owner-defined verification before live enablement. [S1 §27; S3 §7; I]

| Action | Evidence | Insufficient conclusion |
|---|---|---|
| Send SMS | Message/dispatch result and delivery receipt when available | Accepted means received/read |
| Update Lead | Owner-confirmed persisted valid transition | Model returned new value |
| Maintain NextRequiredAction | Owner-confirmed relevant record/state | Summary mentioned a task |
| Schedule Appointment | Appointment and required scheduling/integration state | Suggested slot means reserved |
| Handoff | Recorded handoff/Notification result; separate takeover evidence | Delivered means accepted |

Separate partial results: an Appointment can exist while its notification fails. Report pending, accepted, delivered, failed or unverified according to evidence; these distinctions are not a new mandatory enum. Recovery follows owner policy; do not duplicate or automatically undo a valid domain effect because a later step failed.

## 16. Interaction and Attention Principles

**SETTLED direction.** Action first, context second, detail on demand. Routine work becomes quiet; decisions and exceptions stay visible. Correction is cheap; conversation is one interface alongside summaries, approvals, activity and handoffs. Use factual measures such as attempts, delivery, latency, appointments, failures, edits and Shadow corrections, not an opaque Robin Score. [S2 §§21,54,62–71]

> Never make the human remember what the system can remember.  
> Never make the human enter what the system can reliably infer.  
> Never make the human search for what the system can surface.  
> Never make the human coordinate what the system can safely coordinate.  
> Never let the system decide what the human must decide.

These principles do not remove necessary confirmation. Robin must disclose perceptual limits: stale integration data cannot prove no reply exists.

**APPROVED conservative option — O6:** Robin 1.0 appears contextually in Revenue workflows, with activity, approval and handoff surfaces. It uses Revenue-owned action/attention concepts. A dedicated `/robin` workspace and a normalized cross-Studio Attention system are not 1.0 requirements; both remain later decisions. Cross-Studio attention infrastructure is DEFERRED.

## 17. AI Provider Boundary

**Verified repository direction:** OpenAI is approved; the provider/runtime remains
unimplemented. Shared integrations owns the planned gateway/adapter. F12 supplies minimum
reasoning support for its Shadow gate; F13 completes live integration. No exact model or
generalized provider framework is selected. This retains S3's narrowing of S1's earlier
provider-open statement. [S1 §23; S2 §47; S3 §7; A]

**APPROVED — O4:** `Robin → BTLS AIModelGateway → OpenAI adapter` initially. Use a narrow
BTLS-owned abstraction; do not build multi-provider routing or bind architecture to a
specific model. Exact interface design remains F12/F13 architecture. Model interaction and
structured output belong behind the boundary; authorization and domain execution remain
in BTLS. Model/prompt/configuration changes are traceable and evaluated. Quick Capture may
reuse the gateway without inheriting Robin modes/runtime. No exact model or API feature is
selected here.

## 18. Security, Privacy and Consent

**SETTLED.** Robin is not a superuser. Context and actions remain scoped by property, actor/role, capability, authority, purpose, consent, policy, validation, provider constraints and audit. Background work observes the same boundaries as interactive work. [S3 §§6–8; I]

**Hard product boundary:** No ordinary phone-call listening, recording, transcription, analysis, ambient listening or call-content dependency. A person may deliberately report relevant facts afterward through an approved workflow. Attribution metadata does not authorize call-content ingestion. This is prohibited across versions, not postponed. [S2 §40; S3 §1]

**Direction / deferred capability:** Future email intelligence uses deliberately entrusted business accounts or designated folders/labels, never broad personal-inbox surveillance. Future field sensing assists workers; no covert tracking, employee spying, personality scoring or productivity rankings. Deliberate capture is distinct from listening to calls. [S2 §§30,39–41,59–60]

**PROPOSED safeguards:** Treat messages, attachments, SOPs and retrieved text as data, not instructions overriding policy. Minimize provider-bound context; enforce access when retrieving and displaying evidence. No credentials or unrelated property data in prompts. Document ingestion cannot elevate text into execution authority. Retention and provider-data handling need approval before live use.

## 19. Failure Behavior

**PROPOSED normalization of established safe-stop rules.** [S1 §41; S3 §§6–7]

| Condition | Response |
|---|---|
| Missing knowledge | Ask or hand off; never invent |
| Uncertainty/contradiction | Reduce action; surface source conflict |
| Unauthorized/unsupported action | Deny; no alternate bypass route |
| Model/provider failure | Record and use approved recovery/escalation |
| Duplicate request | Reuse/reconcile prior result; no duplicate effect |
| Unknown tool/send result | Reconcile before retry; no success claim |
| Failed verification | Show unresolved/partial result |
| Stale integration | Disclose freshness and pause dependent action |
| Stale approval/material edit | Revalidate and renew approval as required |
| Takeover | Stop pending competing action; show in-flight state |
| Shadow | Record suppression, not business completion |
| No recipient | Keep unresolved state visible; use approved fallback |

Reuse platform job/provider retries. Do not create another queue or assume exactly-once external execution. Capability/owner contracts must set retry limits, routing, escalation and compensation rights before live enablement; none are invented here.

## 20. Platform Dependencies and Integrations

**Repository-verified baseline — 2026-10-02:** source/schema/registry inspection confirms
the implementation distinctions below at `7d211e2f…`; this is not provider or deployment testing.

| Dependency | Verified repository status | Reuse |
|---|---|---|
| Property authorization/capabilities/RLS | Implemented | Existing access enforcement |
| AuditEvent | Implemented | Canonical audit |
| EventOutbox/event registry | Implemented | Registered versioned signals |
| JobExecution/attempts/fencing | Implemented | Background execution/retry |
| Notification | Implemented | Recipient-safe notifications |
| ProviderDispatch/WebhookReceipt | Implemented | Transport evidence |
| SmsProvider/Twilio | Implemented transport | Revenue communication services own meaning |
| TransactionalEmailProvider/Postmark | Implemented | System email, not mailbox intelligence |
| MediaAsset | Implemented | Existing lifecycle and explicit domain relationships; no generic MediaAssetReference assumed |
| Customer/Contact/PropertyService | Implemented foundations | Canonical identities |
| Lead; Conversation/Message | Planned F09/F11 | Prerequisites for relevant Robin actions |
| Appointment/Cronofy boundary | Planned F14 | Scheduling owner first, Robin tool second |
| BusinessLocation/ServiceArea | Planned shared boundary | Reconcile geography prerequisites |
| IntegrationConnection | Planned | Reuse when supplied; no silent new prerequisite |
| Robin configuration/runs/actions and shared AIModelGateway/OpenAI adapter | Planned F12–F13 | F12 evaluation foundation; F13 live integration; no implementation claimed |

Reuse application services, validation and observability patterns. Contract agreement does not replace producer implementation when a consumer exit gate requires it.

## 21. Client Enablement Requirement

**SETTLED requirement from I; APPROVED launch model and readiness separation — O7.** A future `context/robin/client-enablement-guide.md` must explain setup and use plainly. Clients supply existing material; they do not write technical context files or design schemas.

| Input | Purpose | Required/optional treatment |
|---|---|---|
| Identity, services, areas, hours | Correct responses/eligibility | Required for dependent capabilities |
| FAQs and customer policies | Grounded answers | Missing topics go to a human |
| Qualification/workflow rules | Needed facts and next steps | Required before corresponding actions |
| Appointment types, scheduling rules/connection | Eligible actual availability | Required for scheduling only |
| Routing/escalation/takeover contacts | Continue unresolved work | Required for dependent handoffs |
| Authority choices, channel setup and consent | Lawful configured execution within product rules | Required before live actions |
| SOPs, forms, spreadsheets and examples | Reduce re-entry | Accepted inputs; automatic ingestion not promised |

The guide must explain why each input matters, acceptable existing files, optional versus required items, conversion to reviewed configuration, the approver/maintainer, updates, missing/stale behavior, readiness, Shadow onboarding and each authority mode.

**APPROVED — O7:** BTLS-assisted onboarding is the launch model. Management/client approvers provide and approve business knowledge and authority configuration, with BTLS converting existing SOPs/forms/files into structured configuration. Shadow-ready and live-ready are separate readiness states; authority is granted per capability rather than globally.

**PROPOSED detailed readiness criteria for feature design:** approved/versioned facts; healthy needed integrations; configured rules/routing; valid permission/consent; reviewed Shadow evidence; verified failure/takeover behavior; and deliberate live-mode selection. Shadow-ready differs from live-ready. Optional future systems must not block unrelated safe capabilities. Initial conversion is BTLS-assisted; universal autonomous ingestion is not an implied deliverable.

## 22. Robin 1.0 Architecture and Evaluation

**APPROVED sequencing clarification:** F12 supplies configuration, bounded knowledge,
capability controls and enough reasoning/validation/run-action evidence for its inspectable
Shadow gate. F13 extends that foundation into live non-scheduling response, approvals,
takeover and lightweight handoff. F14 supplies Revenue Appointment/time services before
Robin scheduling and the 1.0 milestone. F23 remains bounded Revenue expansion, not a Robin
platform milestone. No F13→F12 reverse dependency, whole-F27/F36 prerequisite or Robin 2.0
dependency is created. Root build plan retains sequencing authority. [A]

Flow: Revenue inquiry intake → eligible `lead.created` → authorized context/configuration/knowledge → interpretation and typed proposal → policy/authority/Shadow gates → owning service → verified result/history → contextual handoff when necessary. Intake identity matching stays Revenue-owned.

**SETTLED separation:** Text Quick Capture requires human confirmation. Robin Automatic mode does not override it. Voice Quick Capture and advanced field runtime remain post-MVP. [S2 §§74–75]

**PROPOSED evaluation obligations:**

| Scenario | Expected behavior |
|---|---|
| Eligible lead and permitted SMS | Grounded response; distinct attempt/delivery evidence |
| Shadow with otherwise automatic mode | Evaluation writes only; no operational side effects |
| Consent revoked after proposal | Execution blocked |
| Duplicate trigger or ambiguous send result | Reconcile; no blind resend |
| Unsupported price/promise | Abstain and hand off |
| Wrong property/unauthorized record | Deny retrieval/action without leaking evidence |
| Takeover before dispatch | Pending competing work stops |
| Stale calendar/unavailable slot | No invented availability or confirmation |
| Appointment succeeds, notification fails | Partial result; no duplicate Appointment |
| Customer text tries to override policy | Data cannot elevate authority |

Evaluate factual grounding, interpretation and safe abstention alongside deterministic enforcement. Human behavior in Shadow comparison is evidence, not automatically correct. A later evaluation artifact must define promotion criteria and thresholds; no fabricated pass rate is supplied here.

## 23. Future Architecture / Explicit Deferrals

**DEFERRED:** Business Knowledge Ocean; generalized Business Graph; company vocabulary/ontology intelligence; Commitment Engine; Operational Registers; context restoration; advanced Handoff Packages; role-specific companions; entrusted mailbox intelligence; natural voice/photo field capture; advanced entity resolution and wrong-job protection; offline sync; cross-system identity/orchestration; cross-Studio attention/orchestration. [S2 §§72–76]

Future designs retain domain ownership, evidence categories, explicit authority and human control. Registers need ownership/versioning decisions. Knowledge is not permission to ingest everything into one vector store. Integrate mature external systems where appropriate without assuming their records automatically define BTLS truth.

Field direction includes glove-friendly large controls, simple capture and understandable offline status with preserved history. These are not Revenue-first prerequisites. Broader bounded automation needs future approval. Unrestricted autonomy, surveillance and silent policy rewriting remain prohibited, not deferred.

## 24. Architectural Invariants

1. **SETTLED:** Domain owners retain truth; Robin uses their services.
2. **SETTLED:** No unrestricted model-to-database/provider mutation.
3. **SETTLED:** Platform authorization remains authoritative; Robin cannot grant access.
4. **SETTLED:** Intelligence/confidence never creates execution authority.
5. **SETTLED:** Modes are capability-specific; Shadow is separate.
6. **SETTLED:** Shadow preserves evaluation evidence and suppresses operational effects.
7. **SETTLED:** Knowledge is bounded, approved and versioned; unsupported facts are not invented.
8. **SETTLED:** Human correction, takeover and useful handoff remain available.
9. **SETTLED:** Proposals, attempts, outcomes and suppression remain distinguishable.
10. **APPROVED — O2:** Consequential outcomes require owner-defined verification.
11. **SETTLED:** Reuse communication, scheduling, task/action, notification, event, job and audit owners.
12. **SETTLED:** Lightweight handoff only in 1.0; Quick Capture confirmation remains separate.
13. **SETTLED:** No call-content monitoring or ambient listening.
14. **SETTLED task boundary:** Horizontal identity does not authorize horizontal MVP scope.
15. **SETTLED:** No competing terminology, Shared Operations registry, generic implementation plan or roadmap.
16. **APPROVED — O5:** Approvals/queued actions are revalidated before dispatch.
17. **SETTLED requirement:** Intentional client enablement without requiring software architecture from clients.

## 25. Owner Decisions and Remaining Feature Design

O1–O7 are local review labels, not permanent registry IDs. The owner approved these rulings
and their bounded repository reconciliation/adoption on 2026-10-02 [R/A]. Architectural
direction is adopted; explicitly reserved feature design remains open. This grants no
implementation, Ownership Matrix or parallel-development authorization.

| Decision | Approved ruling | Remaining work / boundary |
|---|---|---|
| O1 — Identity and policy ownership | Robin is a horizontal resident subsystem. Revenue owns the first integration, not Robin itself. | SC-16 now states mixed ownership; future Ownership Matrix preserves core/runtime/policy versus Revenue adapter/integration. No matrix or parallel lane is started. |
| O2 — Domain/capability contracts | Adopt `Signals → Authorized Context → Approved Capabilities → Verification` as the standard Robin-domain contract. | Implement only where an actual domain integration exists; detailed interfaces and registry entries follow feature architecture. |
| O3 — State and knowledge | Robin may own configuration, runs, actions/proposals, approvals/takeover, Shadow evidence, knowledge/configuration references, reasoning/action provenance and verification evidence; never duplicate live business truth. | Physical schema, retention, snapshots and knowledge-review mechanics belong in F12/F13 architecture. |
| O4 — AI gateway | Shared integrations owns narrow BTLS `AIModelGateway`, initially backed by OpenAI; architecture is not bound to a specific model. | No multi-provider routing; exact interface remains F12/F13 design, with minimum F12 evaluation support and F13 live integration. |
| O5 — Execution/human controls | Revalidate before execution; takeover stops competing pending work; reconcile unknown results before retry; bind approvals to a specific action/scope. | Exact expiry times, concurrency, release behavior and fallback routing belong in F12/F13 design. Remaining Shadow OFF simulation semantics also require feature design. |
| O6 — UI/attention | Contextual Revenue workflows plus activity, approval and handoff surfaces for 1.0. | Dedicated `/robin` workspace and normalized cross-Studio Attention remain later decisions, not launch requirements. |
| O7 — Enablement/trust | BTLS-assisted onboarding at launch. Management/client approvers provide and approve knowledge and authority configuration; BTLS helps structure existing material. Separate Shadow-ready and live-ready states; per-capability authority. | Detailed review/maintenance mechanics, readiness criteria and evaluation thresholds remain feature/onboarding design; no global grant of authority. |

Adoption of these principles does not settle physical schema, detailed controls or all other
proposals in this document. Unapproved PROPOSED passages remain recommendations. Feature
plans must follow the reconciled root/shared authorities and resolve their exact contracts
through the Shared Change Gate before consumers rely on them.

---

# Appendix A — Architecture Decision Appendix

## A1. Decisions treated as already settled

| Decision | Evidence | Qualification |
|---|---|---|
| Revenue Response Sidekick 1.0 | S1 §§1,5; S3 §6 | Planned, not implemented |
| Owning-service operations/domain truth | S3 §§2,6,8 | Horizontal identity transfers no domain ownership |
| Concern-based authority/Shared Change Gate | S3 §§3–4; A | Subordinate detail cannot override root/shared concern owners |
| Approved/versioned bounded knowledge | S3 §7 | Details in O3 remain open |
| Capability modes, Shadow separation, human control | S3 §§6–7 | Exact execution semantics in O5 |
| Lightweight handoff plus Notification | S3 §§6,8 | Full HandoffPackage excluded |
| F12–14 milestone; F23 expansion | S3 §6 | Root sequence governs |
| Initial OpenAI adapter | S3 §7 | No model chosen |
| No call-content ingestion | S2 §40; S3 §1 | Permanent boundary |
| Quick Capture confirmation | S2 §74 | Robin authority does not apply |
| Platform infrastructure reuse | S3 §§7–8 | Real producer required where exit gate depends on it |
| Client enablement requirement | I | Guide itself is future work |

## A2. Direction-level approvals and qualified proposals

| Proposal | Sections | Adjudication |
|---|---|---|
| Horizontal resident identity, narrow initial integration | 2–4 | O1 |
| Eight-step lifecycle; explicit verification surface | 7–8,15 | O2 |
| Capability registry contract | 9 | O2 |
| Evidence/state boundary and governed corrections | 6,11,14 | O3 |
| Narrow provider-independent gateway | 17 | O4 |
| Revalidation, takeover protection, unknown-result recovery | 9,13,19 | O5 |
| Untrusted input isolation and minimum context/evidence | 14,18 | O3/O5 |
| Capability-specific readiness/evaluation | 21–22 | O7 |

O1–O7 now carry the owner rulings in §25. This table traces the original proposals to those decisions; it does not expand the approval beyond §25. Detailed lifecycle normalization, evidence fields, correction mechanics, safeguards and evaluation criteria retain their local PROPOSED labels unless explicitly covered by a ruling.

## A3. Source disagreements and recommended disposition

| Tension | Evidence | Disposition |
|---|---|---|
| Revenue-local canonical placement versus horizontal vision | S3 §§2,6; S1 §2; S2 §1 | O1 adopted; root/shared authority reconciliation recorded in Appendix B |
| Cross-Studio MVP exclusion versus horizontal identity | S3 §1; I | Separate identity from runtime scope; no horizontal substrate now |
| Provider open in S1, OpenAI approved in S3 | S1 §23; S3 §7; A | Reconciled root/shared direction governs: initial OpenAI through gateway; exact interface remains feature design |
| Three-part domain contract versus verification | S1 §§4,27; I | Fourth surface approved under O2; no existing API implementation claimed |
| Rich notification packages versus canonical lightweight handoff | S1 §11; S2 §18; S3 §§6,8 | Preserve useful context; defer generalized package state/ownership |
| Website Intelligence “owns Findings” versus shared substrate | S2 §1; S3 §§2,8 | Domain owns diagnostic meaning; shared substrate remains authoritative |
| Robin UL/generic implementation-plan suggested | S2 §§81–82; S3 §3; I | Do not create competing authorities |
| Call listening appears in deferral list | S1 §48; S2 §40; S3 §1 | Prohibited, not future scope |
| S2 lists narrow re-engagement in 1.0 | S2 §67; S3 §6; A | Current root plan includes bounded configured follow-up/re-engagement; exact limits remain feature design, not scope expansion |
| Full history versus minimization | S2 §§59,68; S1 §47 | Sufficient evidence, not unlimited raw retention; O3 |
| Later Guarded Operator versus 1.0 Automatic | S1 §36; S3 §6 | Narrow automatic actions can exist now; broader orchestration deferred |

## A4. Remaining design and adoption work

No O1–O7 direction-level decision remains awaiting approval. Repository reconciliation has
been approved and its documentation adopted under the Shared Change Gate. F12/F13 must
settle reserved physical state, knowledge review and execution controls. Detailed readiness,
evaluation criteria and maintenance responsibilities remain open before live activation.
Dedicated workspace and normalized cross-Studio Attention remain later decisions. This
document does not authorize implementation or change root sequencing.

## A5. Deferred versus prohibited

**Deferred:** Knowledge Ocean, generalized Graph, Commitments, Registers, ontology learning, advanced packages, mailbox intelligence, role companions, voice-first/offline field runtime, cross-system and cross-Studio orchestration.

**Prohibited:** Call-content monitoring, ambient listening, unrestricted mutation/autonomy, covert surveillance, silent policy invention and duplicate domain truth. Future capabilities still obey these constraints.

---

# Appendix B — Repository Reconciliation and Adoption Evidence

## B1. Verified baseline and authority

The repository-aware review and adoption preflight verified remote `main` at
`7d211e2f9e6ee77755031674a2826a951ec65b10`, exactly S3's pinned commit. No changes after
that handoff required reconciliation. The former checkout was `f4b46ff…`; the only tree
difference from remote main was the historical Shared Contracts draft rename. Adoption
was prepared on `codex/adopt-robin-architecture` from verified main, preserving the source
inputs. These are evidence bookmarks, not substitutes for checking current Git state.

AGENTS, root/shared authorities, build plan, standards, tracker/memory, provider/auth code,
event/job/Notification registries, schema and relevant ordered security migrations were
reviewed. Features 01–08 remain complete; F09+ remains unimplemented. No live database,
production deployment or provider behavior was certified by this documentation review.

The owner confirmed `architecture-draft.md` as the supplied timestamped draft. Its reviewed
SHA-256 was `21DE51E8092F5A89FF35AA3F8AE63C49040DF7B896515E30469D8AABF75ED2C1` before adding
the historical-source banner. The dependency analysis source hash was
`C76CE7DE5F05AC4CD81F5FC187963C404C637E6C15E4BD359FE488A733D0A462` before its bounded update.
These identify reviewed inputs; they are not checksums of the amended adopted files.

## B2. Reconciled governing boundaries

| Concern | Adopted disposition | Governing source |
|---|---|---|
| Robin identity | Horizontal resident subsystem; Revenue-first 1.0; no fourth Studio | Root architecture §20, overview and AGENTS |
| Core versus adapter | Robin core/runtime/policy; Revenue adapter/domain commands and verification; existing shared infrastructure owners | Shared Contracts SC-16 |
| Conceptual integration | Signals → Authorized Context → Approved Capabilities → Verification, only for real approved integrations | SC-16 and root architecture §20 |
| Evidence and controls | Bounded Robin state; no duplicate business truth; execution revalidation, action-bound approval, scoped takeover, unknown-result reconciliation | SC-16 and dated Shared Change Gate resolution |
| AI gateway | Planned narrow shared-integration boundary with initial OpenAI adapter; no signature/model/routing implementation | SC-09, root architecture §13 and library guidance |
| UI and enablement | Contextual Revenue surfaces; dedicated workspace deferred; assisted onboarding; separate Shadow/live readiness | Root architecture, overview, UI rules and F12/F13 |
| Sequencing | F12 evaluation foundation; F13 live response; F14 scheduling milestone; F23 Revenue expansion | Build plan; no renumbering or reverse dependency |

This detail document is discoverable from AGENTS and root architecture and remains
subordinate to concern owners. Historical source disagreements in Appendix A explain the
review; they do not override adopted governing statements or approve residual proposals.

## B3. Dependency and implementation limits

The [supporting dependency analysis](../shared/dependency-analysis-draft.md) already named
Robin as an owner separate from Revenue and distinguished F14's scheduling slice. Its
Revenue construction lane was not proof that Revenue owned Robin wholesale. The bounded
update separates lane from ownership, names the shared gateway boundary, identifies F12's
minimum evaluation/evidence foundation, and adds the Robin↔Revenue contract checkpoint and
shared-file coordination implications. It does not replace declared build sequencing.

Dependency-map canonicalization remains separately authorized future preparation; no
`context/shared/dependency-map.md` is created by this adoption. Ownership Matrix, execution
protocols, parallel pilot and parallel development have not started. Existing 09+27 pilot
analysis is unaffected and remains an unapproved analytical candidate.

No application/provider/runtime code, package, Prisma schema, migration, API, event/job or
capability registration is changed. There is no cross-Studio Robin substrate, Attention
model, generalized HandoffPackage, competing Ubiquitous Language or Shared Operations
registry. Foreign-domain writes, call-content ingestion and unrestricted authority remain
prohibited. Existing MVP deferrals and all owning-domain boundaries are preserved.

## B4. Remaining work

The adopted direction does not select schema, retention/deletion/redaction, snapshots,
knowledge lifecycle mechanics, approval expiry/concurrency, takeover release/in-flight
behavior, gateway signature/model, capability IDs/payloads, event/job names, evaluation
thresholds, Shadow/OFF behavior or notification recipient/fallback mechanics. Resolve these
in approved F12/F13 architecture, with F14 defining concrete scheduling integration.

The completed documentation diff requires owner approval before commit/push. Future
numbered implementation still follows the JSM loop, one-feature rule and approved exit
gates; Feature 09 remains the next unstarted implementation target.
