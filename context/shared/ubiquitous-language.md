# BTLS Command Center — Ubiquitous Language

**Canonical terminology — 29 September 2026. Repository path: `context/shared/ubiquitous-language.md`.**

Verified against `saybenn/BTLS-Command-Center`, default branch `main`, commit `7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7`. Repository HEAD was rechecked at canonicalization and matches this approved baseline. Features 01–08 are complete and Feature 08 is merged. Implementation status below describes this commit, not production deployment.

## 1. Purpose and authority

**Robin terminology amendment — 2026-10-02:** The approved reconciliation adopts horizontal
Robin identity, Revenue-first scope and the planned AIModelGateway term. Reviewed against
`main` at `7d211e2f9e6ee77755031674a2826a951ec65b10`; Features 01–08 remain complete and
Robin remains unimplemented. See the dated resolution in [Shared Contracts](shared-contracts.md#2026-10-02--robin-architecture-adoption-approved-resolution)
and [subordinate Robin detail](../robin/architecture.md). Earlier pinned links remain
historical implementation evidence, not a competing terminology authority.

This document prevents semantic drift when humans and AI agents work across sessions, narrow feature contexts, and eventually parallel lanes. Use one meaning for each shared term; preserve distinctions even when a local implementation could collapse them. This is a semantic reference, not permission to build a planned concept or begin parallel development.

This document follows the current [AGENTS.md](../../AGENTS.md) and the canonical context it names. Ubiquitous Language owns canonical terminology. Architecture governs lifecycle and business policy; Prisma/schema, ordered migrations, validators, and services establish what currently exists. Feature plans establish sequencing; UI labels establish presentation, not new domain entities. This document does not overrule those sources in their respective concerns or introduce a new global precedence hierarchy. Their reading order does not silently settle contradictions. Search remains governed by the integrated Search sections of `context/architecture.md` and Phase 11 of `context/build-plan.md`.

**Approved decisions D1 and D2 below govern their specific meanings**, superseding the audit's unresolved discussions and conflicting recommendations. Current canonical context has been narrowly reconciled with these decisions and the approved Lead Stage terminology. Historical evidence retains its original wording.

**Status:** **I** = implemented model, type, or service; **P** = planned canonical concept, not currently implemented; **D/P** = planned derived meaning, not an independently editable source fact; **X** = absent, reserved, or deferred as stated. A planned interface example is not an available API. Lifecycle words below are semantic constraints; use the owning source for complete enums and transitions. Do not invent missing transitions or infer a database enum from prose.

“Owner” means the subsystem that defines the concept's truth. “Consumers” identifies important uses, including planned ones; it does not grant access. Every property-owned use retains server authorization, capability checks, and tenant scope.

## 2. Must not confuse

| Distinction | Rule |
|---|---|
| `ClientAccount` / `ClientProperty` / `Customer` / `Contact` | Subscriber / tenant workspace / end customer / person. These are separate identities. |
| `AppUser` / `EmployeeProfile` / `PropertyAccess` | Login identity / workforce identity / authorization grant. None implies the others. |
| `PropertyService` / `PricebookItem` | Shared offered-service identity / Revenue drafting content and price. Reuse the service identity across studios. |
| `ServiceLocation` / `BusinessLocation` / `ServiceArea` | Customer worksite / subscribing business's location / served or targeted geography. |
| `NextRequiredAction` / `AttentionFlag` / `BusinessException` / `Finding` | Next work / contextual concern / deterministic Revenue condition / Growth diagnostic. |
| `Job` / `JobVisit` / `JobTask` / `JobExecution` / `WorkTicket` | Customer service work / field visit / service checklist / background execution / BTLS improvement work. |
| `Event` / `AuditEvent` / `RevenueActivity` / `Notification` / `Message` | Follow-on fact / accountability / operating history / recipient notice / customer communication. |
| `MediaAsset` / `ServiceAsset` / `ContentAsset` | Stored bytes / customer equipment / editorial content. |
| `ProviderDispatch` acceptance / delivery / commercial acceptance | Provider accepted a send / destination delivery evidence / customer accepted an exact commercial revision. |
| `WebsitePage` / `PageSearchProfile` | Discovered URL identity / Search semantics attached to it. |
| `TopicCluster` / `SearchTopic` / `SearchKeywordCluster` / `SearchTarget` | Editorial grouping / subject / query grouping / strategic search objective. |
| `WorkPackageTemplate` / `WorkTicket` / `Intervention` / `MeasurementReview` | Prescription / assigned work / actual change / subsequent outcome. |
| Revenue outcome / Search attribution | Revenue owns money and business facts; Search interprets supported associations without creating those facts or claiming unsupported causation. |

## 3. Canonical vocabulary

### Platform, identity, and authorization

Sources: [tenancy and authorization][tenancy], [authorization decision][authdecision], [schema][schema], [capabilities][permissions], [property context][propertycontext], [Feature 08 decisions][f8].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **ClientAccount — I model** | Organization subscribing to BTLS; groups properties. It is not that business's end customer. | Platform → authorization, all studios | Use `Customer` for the end customer. Account `ACTIVE/SUSPENDED` is not Customer relationship state. |
| **ClientProperty — I model** | Website and operating tenant workspace under a ClientAccount; the property boundary for domain data. Not a physical worksite or one page. | Platform → all studios/infrastructure | Carry property scope through reads, mutations, events, jobs, and relationships. A browser ID alone is never authority. |
| **AppUser — I model** | Application identity linked to the corresponding Supabase Auth user. Authentication establishes who is acting. | Authentication/platform → authorization, workforce linkage | `ACTIVE/DISABLED` concerns application identity; creating an employee or Contact does not provision a login. |
| **AccountMembership — I model** | User's account relationship and baseline account role. | Authorization → property access, administration | Active membership alone does not grant client access to every account property. `ACTIVE/SUSPENDED` is membership state. |
| **PropertyAccess — I model** | Explicit same-account membership-to-property grant; `roleOverride` may be absent. | Authorization → client services, employee linking | For client entry, the grant is required; only the override is optional. Honor documented platform exceptions without generalizing them. |
| **Capability / role — I types and mappings** | Permission for an operation / a bundle of permissions. Platform and property scopes differ. | Authorization → protected services | Check the exact capability and scope. Operator directory/foundation access does not imply unrestricted operations or notification access. |
| **AuthorizedPropertyContext — I service result** | Server-resolved actor, authorized property, and permissions. Not a persisted entity or trusted browser object. | Authorization → property services | Resolve through the authorized server path and preserve transaction-time rechecks. A stale context is not perpetual authorization. |
| **PendingAccountInvitation / PendingPropertyAccess — I models** | Intended account role and property grants awaiting verified acceptance. | Authorization → invitation workflow | Pending intent is not active access. Acceptance applies authorization idempotently; cancellation/expiry do not activate it. |
| **FeatureFlag — I model** | Global/account/property rollout control. | Platform → feature availability | Enabled means available for evaluation, not authorized. It cannot bypass capabilities or domain policy. |

Application services own business validation and authorized mutations; Prisma is the server database layer and RLS adds protection. Feature 08's nine foundation tables deny direct browser reads and writes and use the restricted `btls_app` service path. Read migrations in order: an earlier permissive policy is not current authorization. [Feature 08][f8] [Current foundation security migration][foundationsecurity]

### Shared business identity and Revenue foundation

Sources: [Revenue architecture][revenue], [shared property knowledge][sharedknowledge], [Feature 08][f8], [schema][schema], [foundation services][foundation], [shared service implementation][propertyservice].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **Customer — I model** | Durable, property-scoped end customer of the subscribing business. Current creation also establishes a named primary person Contact. | Revenue → commercial, field, communication, Robin consumers | `PROSPECT/CURRENT/INACTIVE` describes the relationship, not a Lead stage. Do not create a new Customer for each opportunity or silently merge endpoint matches. |
| **Contact — I model** | One person associated with a Customer; email/phone may be absent or shared. | Revenue → routing, future consent and communications | A person is not an organization, Customer, or AppUser. Endpoint normalization proves neither identity nor permission to message. Active/primary flags are separate from consent. |
| **EmployeeProfile — I model** | Property workforce identity, optionally linked to an AppUser with existing active explicit property access. An unlinked employee is valid. | Revenue workforce → assignments, time, directory | Linking never invites a user or grants access. `isActive` concerns workforce availability, not authentication status. |
| **PropertyService — I shared model/service** | What the business offers; shared service identity and hierarchy. | Shared property knowledge → Revenue, Robin, Smart Blog, Search | Reuse its ID. Revenue's first implementation does not make it Revenue-only. Prices belong to PricebookItem; Search priorities belong to Search strategy. |
| **ServiceLocation — I model** | Customer-owned place where service may occur; optional work context. | Revenue → Customer detail, assets, future scheduling/jobs | Not ClientProperty, BusinessLocation, or ServiceArea. Do not require a location for every Customer or simple workflow. Default/active flags are conveniences, not tenant identity. |
| **BusinessLocation — P model** | Subscribing business's own operating location, optionally associated with a Google Business Profile. | Shared property knowledge → local Search, Revenue/Robin consumers | A customer's address is not the business's GBP identity. Do not manufacture branches for target cities. |
| **ServiceArea — P model** | Property-scoped geography the business serves or targets. | Shared property knowledge → Search, content, Robin, Revenue consumers | A target market need not contain a BusinessLocation. It is not a customer worksite. |
| **ServiceAsset — I model** | Basic customer equipment or item being serviced; optional same-customer ServiceLocation. | Revenue → customer context, future work history | Not stored media or an inventory system. Keep optional context optional. |
| **Tag / CustomerTag — I catalog and join** | Property label and explicit assignment to a Customer. | Revenue → customer classification | Tags classify; they cannot establish paid, won, overdue, or SearchTopic truth. No generic polymorphic assignment is implied. |
| **RevenueOperationsSettings — I model** | Revenue defaults; currently review timing and nullable reference to an eligible shared sender. | Revenue → workflow services/settings | Reference SendingIdentity. Never store sender verification, provider credentials, or mailbox OAuth here. Later defaults remain planned. |
| **Duplicate review / creation replay — I workflows** | Human review of possible identity matches / protection against repeating the same creation request. | Revenue foundation/shared helpers → foundation creates | Ambiguous people are not automatically merged. Request replay returns the prior result or a conflict; it is not person deduplication. |
| **Revision — I concurrency token** | Integer used to reject stale edits to a mutable foundation record. | Owning service → editors | Incrementing a revision does not preserve old content. It is not an EstimateRevision, event-schema version, or policy snapshot. |

### Revenue operations, commercial truth, and attention

All terms in this subsection are **planned**, except where identified as derived. Sources: [Revenue architecture §§19.1–19.11][revenue] and [build plan][buildplan]. Revenue owns these meanings; Robin and Growth/Search consume only authorized facts or services.

| Term / form | Meaning and boundary | Important consumers | Drift guard / lifecycle |
|---|---|---|---|
| **Lead — P aggregate** | One commercial opportunity for a Customer; sales-stage truth only. | Revenue workspace, Robin, outcome reporting | Stages: `NEW → CONTACTED → QUALIFIED → WON`, with `LOST` from supported open stages. Never add scheduling, estimate delivery, overdue, or Job progress to a master Lead lifecycle. |
| **Lead Stage — P lifecycle** | Sales-stage truth for one Lead; future machine-facing lifecycle fields use `stage`. | Revenue workspace, Robin via services, event consumers | Prefer `lead.stage_changed`; never introduce it alongside `lead.status_changed` for the same business fact. Preserve an already-established implementation contract where required; conceptual examples are not such contracts. |
| **RevenueActivity / RevenueNote — P records** | Cross-lifecycle operating history / human-authored internal business context. | Customer timeline, Robin context | Activity spans the Customer journey; it is not Lead-only. Notes are not customer Messages. Neither substitutes for AuditEvent. |
| **NextRequiredAction — P record** | What should happen next for a supported Revenue subject. | Action workspace, Robin via services | At most one primary open action per supported subject. `OPEN → COMPLETED/DISMISSED`. Do not create a competing Robin follow-up task system. |
| **AttentionFlag — P record** | Contextual concern raised by a human, rule, or AI. | Revenue attention, Robin | `OPEN → RESOLVED/DISMISSED`. Preserve source and uncertainty; a concern does not prove a deterministic condition or assign work. |
| **BusinessException / BusinessExceptionDefinition — P records** | Deterministic operating condition and stable versioned rule, including historical occurrence. | Revenue attention, reporting, Robin | Open/snooze/resolve/dismiss preserves history. Not a Growth Finding. “Revenue Leak” names a rule family, not another model. |
| **Appointment — P schedule record** | Sales, evaluation, or consultation event. | Schedule UI, approved Robin scheduling | `SCHEDULED/CONFIRMED/COMPLETED`, with `CANCELLED/NO_SHOW`. Not field fulfillment or a provider calendar identity. |
| **Pricebook / PricebookItem — P catalog** | Reusable commercial content and pricing used while drafting; an item may reference PropertyService. | Estimate drafting | Snapshot content into commercial documents. Editing the catalog must not rewrite issued or accepted history. |
| **Estimate / EstimateRevision — P aggregate/version** | Stable proposal identity / exact version of its commercial content. | Customer presentation, authorized Job creation | Draft mutable; issued immutable; a new issue supersedes rather than rewrites; accepted revision terminal and immutable. Not Invoice or Lead stage. |
| **EstimateLineItem / EstimateAgreementSnapshot / AgreementTemplate — P records** | Historical revision-owned line/agreement content / reusable drafting agreement text. | Commercial presentation and acceptance | Templates provide provenance, not live historical content. Retain what the customer actually accepted. |
| **EstimateDelivery / EstimateViewEvent / EstimateAcceptance — P evidence** | Per-attempt send evidence / a document view / valid acceptance of the exact current revision. | Estimate intelligence, Job authorization | Sending, viewing, and accepting are different facts. A provider result or page view cannot establish signature truth; artifact failure cannot erase database acceptance. |
| **CustomerDocumentAccessGrant — P authority record** | Scoped, expiring/revocable public access to a commercial document/version. | Public Estimate/Invoice access and acceptance | A route ID or signed storage URL does not authorize commercial acceptance. Revalidate the grant and current revision. |
| **Job — P aggregate** | Authorized Customer service work, with accepted-Estimate or authorized manual provenance. | Field operations, billing, reporting | `AUTHORIZED → SCHEDULED → IN_PROGRESS → WORK_COMPLETE → CLOSED`; simple work need not schedule a visit. Work complete does not mean paid or closed. Not JobExecution or WorkTicket. |
| **JobVisit / JobTask — P child records** | Scheduled field visit / narrow service checklist item. | Field scheduling and employees | Visits are optional for simple work. Visit completion is not Job closure. JobTask is not WorkTicketTask or a general task system. |
| **ChangeOrder / ServiceIssue — P records** | Material post-acceptance scope/price change / callback or service-quality concern. | Field work, commercial evidence, customer service | Preserve original accepted history. ServiceIssue is not automatically a Finding or BusinessException; use its own resolution workflow. |
| **TimeEntry — P record** | EmployeeProfile's factual clock-in/out record, optionally contextualized by Job/JobVisit. | Self clock, authorized correction/export | `OPEN → CLOSED`; at most one open per employee under current policy. Corrections retain actor/reason/history. Not payroll, pay calculation, or compliance automation. |
| **Invoice — P document** | Amount due, with immutable issued line content and separate delivery attempts. | Billing, Payment recording, reporting | Document lifecycle `DRAFT → ISSUED → VOID`. Issuing an Invoice is not receiving money. |
| **Payment — P factual record** | Money actually received, with explicit reversal/compensation for mistakes. Manual methods are valid; processor IDs are optional. | Balances, Revenue reporting, authorized measurement | Never infer money from an Estimate, provider attempt, AI guess, or paid toggle. Correct with preserved history, not deletion. |
| **Payment state / overdue / collected revenue — D/P** | Reproducible summaries of Invoice and valid net Payment facts. | Revenue, Growth/Search outcome consumers | `UNPAID/PARTIALLY_PAID/PAID` derives from net collection. Overdue requires issued, past due, positive balance. Quoted, accepted, invoiced, and collected amounts are distinct. |
| **ReviewRequest — P workflow** | Basic post-work review-request communication with its own delivery evidence. | Customer communications | Sending failure does not reopen a completed Job or gate closure. Not a reputation-management platform. |

### Communications, providers, and Robin

Sources: [Revenue communications][revenue], [Robin architecture][robin], [integration architecture][infrastructure], [email contract][email], [dispatch implementation][dispatch], [schema][schema], [AGENTS communication/AI rules][agents].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **Conversation — P aggregate** | Customer-owned, channel/route-scoped thread with required primary Contact. | Revenue communications → human messaging, Robin | Lead, Estimate, Appointment, Job, Invoice, and Robin never own the thread. Operational context may be attached to messages/activity without reparenting. |
| **Message — P record** | One inbound/outbound customer communication in a Conversation. | Revenue communications → timeline, delivery workflows, Robin | Not Notification, RevenueNote, or ProviderDispatch. Consent, routing, opt-out, business hours, and delivery evidence remain application-service concerns. |
| **SendingIdentity — I shared model** | Authorized From/display-name/Reply-To configuration for outbound sending. | Shared integrations → Revenue defaults and send workflows | Verified BTLS From and client Reply-To are different roles. Current sends support `BTLS_MANAGED`; reserved mode names do not enable custom-domain or mailbox capabilities. |
| **TransactionalEmailProvider — I interface/adapter** | BTLS outbound transactional email boundary, currently Postmark. | Shared integrations → authorized domain sends | No inbox synchronization or reply ingestion is implied. Do not rename it generic EmailProvider and merge mailbox responsibilities. |
| **ConnectedMailboxProvider — X deferred boundary** | Intended connected-mailbox capabilities, separate from transactional delivery; no current implementation. | Shared integrations → future approved communication consumers | An enum member or Reply-To address is not an authenticated mailbox connection. Do not implement it through the transactional interface. |
| **SmsProvider — I interface/adapter** | SMS transport boundary, currently Twilio. | Shared integrations → planned Revenue communications/Robin | Transport availability is not completed consent, inbound ownership resolution, or Conversation support. Never guess Customer ownership for unmatched inbound SMS. |
| **TransactionalEmailResult / SmsProviderResult — I result types** | Provider request acceptance evidence, including provider message ID and acceptance time. | Shared integrations → dispatch and owning send workflows | Accepted is not delivered. Current provider-name literals are implementation constraints, not universal business vocabulary. |
| **ProviderDispatch — I model/service** | Durable outbound request, idempotency/fingerprint, and transport outcome. | Shared integrations → sends, operations | `PENDING/ACCEPTED/REJECTED/UNCERTAIN/FAILED`. Only ACCEPTED supplies duplicate success. An expired pending send may be UNCERTAIN: never automatically resend an unknown effect. |
| **WebhookReceipt — I model/service** | Provider callback receipt and processing evidence, deduplicated by provider/account/external event; property may await resolution. | Shared integrations → callback handlers, domain services | `RECEIVED/PROCESSING/PROCESSED/FAILED` concerns processing, not business delivery. Validate and correlate; only the current fenced claim finalizes. |
| **IntegrationConnection — P shared record** | Authorized external connection, scopes, health, and credential references. | Shared integrations → data, publishing, Search/Revenue | Not SendingIdentity or tenant authorization. Keep credentials server-side; do not create lane-local copies of shared connection identity. |
| **Calendar projection — P integration** | External availability/synchronization through Cronofy around BTLS Appointment/JobVisit truth. | Shared integration; Revenue owns schedule → schedule/Robin | Sync failure does not erase valid BTLS bookings. Confirm through BTLS scheduling, not provider availability alone. |
| **Robin / RobinConfiguration — P subsystem/policy** | First-class horizontal resident subsystem of Command Center; Robin 1.0 is the bounded Revenue Response Sidekick. Configuration selects behavior within existing permissions. | Robin core/runtime/policy → Revenue-first integration; Revenue owns the adapter/domain operations | Not a fourth Studio or cross-Studio MVP substrate. Expose only implemented, enabled tools. Off / Approval Required / Automatic are capability-specific; Robin cannot grant platform permission or directly write domain truth. |
| **AIModelGateway — P provider boundary** | Narrow BTLS-owned model interaction/structured-output abstraction with initial OpenAI adapter. No exact signature or model is selected. | Shared integrations → Robin and approved AI consumers such as Quick Capture | Not Robin policy, domain execution, or multi-provider routing. Reusing it does not make Quick Capture a Robin runtime consumer. |
| **BusinessKnowledgePack — P versioned knowledge** | Approved property facts and bounded guidance used by Robin. | Robin → reasoning/validation | Reuse shared PropertyService and business identity. Knowledge is not authorization or a parallel business catalog. |
| **RobinRun / RobinAction — P history** | Reasoning evaluation and proposed/executed/failed/suppressed action evidence, including approval/takeover, provenance and verification context. | Robin → approvals, diagnosis, audit context | Model completion does not prove a business effect. Retain owning-service evidence and configuration/knowledge references without duplicating live domain truth. Not JobExecution; physical persistence and retention remain open. |
| **Shadow Mode — P overlay** | Evaluates what Robin would do while suppressing business mutations, customer sends, and intended handoff notices; evaluation evidence may persist. | Robin policy → evaluation/review | Not a fourth authority mode. A dry run must not call real effect-producing services. |
| **Shadow-ready / live-ready — P readiness concepts** | Readiness for authorized evaluation / readiness for specifically enabled live capabilities after required human review. | Robin enablement → BTLS-assisted onboarding and management/client approvers | Separate concepts, not new enums. Shadow readiness never grants live authority; exact criteria and OFF simulation remain feature design. |
| **Lightweight Robin handoff — P workflow** | Stopped/waiting/takeover context in Robin history plus shared Notification and owning-record links. | Robin + shared notifications → authorized staff | Not a generalized HandoffPackage model or new task system. Shadow suppresses the handoff notice. |
| **Quick Capture — P Revenue workflow** | Text extraction into typed source-mutation proposals with before/after preview and explicit human confirmation. | Revenue → authorized human users | Always show the proposal window. No automatic mode; not Robin. Normal services derive state and preserve correction history. Voice/transcription/Generated Job Brief are deferred. |

Call-attribution metadata may support Search evidence. It does **not** authorize Robin phone-call listening, recording, transcription, or call-content ingestion. A human-reported outcome uses normal Revenue input. [Robin][robin]

### Storage and shared execution infrastructure

Sources: [schema][schema], [infrastructure architecture][infrastructure], [media lifecycle][media], [cleanup][cleanup], [event registry][events], [job contracts][jobs], [notification contracts][notifications], [dispatch][dispatch].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **MediaAsset — I model/service** | Property-scoped shared metadata and lifecycle for verified file bytes. Finalized bytes are immutable. | Shared storage → media UI and domain attachments | Reuse it; replacement creates a new asset. `PENDING_UPLOAD/READY/DELETION_PENDING/DELETED` describes bytes; `removedAt` separately controls library visibility. |
| **Media profile / visibility / sensitivity / durability — I classifications** | Independent server-owned storage treatment, not business ownership. | Shared storage → upload/access/cleanup | A profile is not a Revenue entity or permission grant. Owning-record authorization and retention remain additional constraints. |
| **Media attachment relationship — P per consuming feature** | Explicit domain association to an existing MediaAsset. | Consuming domain → its own records; storage owns bytes | No generic `MediaAssetReference` model is established. Do not create a polymorphic registry or infer deletion eligibility from missing generic references. |
| **Event / InternalEventEnvelope — I types/registry** | Versioned fact for registered follow-on consumers; producer owns its business meaning. No generic Event model exists. | Shared events + producer → registered jobs/consumers | Event examples and audit action names are not registrations. Current registry contains infrastructure proof and operations retry, not future Revenue events. |
| **EventOutbox — I model** | Durable event awaiting dispatch. | Shared events → dispatcher/jobs | `PENDING/DISPATCHED/FAILED` is dispatch state. DISPATCHED does not prove the downstream business effect completed. |
| **JobExecution / JobExecutionAttempt — I models** | Durable background operation and one run attempt; retries retain execution/idempotency identity. | Shared jobs → handlers, operations UI | Not Customer Job, WorkTicket, or RobinRun. `SUCCEEDED` means that handler succeeded, not that business outcomes improved. |
| **Notification — I model/service** | Recipient-specific in-app notice with producer source, notice kind, and validated subject. | Shared notices; producer owns workflow meaning → recipient | Persist subject identity; resolve destination with fresh authorization. `readAt` is read state, not external delivery, work completion, or resolution. |
| **AuditEvent — I append-only model** | Durable accountability for who did what, in its applicable actor/account/property scope. | Shared audit; owning service produces → authorized audit readers | Not a log line, RevenueActivity, event bus, or polymorphic domain ownership system. Transactional audit does not publish a domain event. |
| **Correlation / idempotency / deduplication — I mechanics** | Trace related work / prevent repetition of one intended effect / suppress duplicates under a defined scope. | Infrastructure + operation owner → jobs, sends, notices, creates | One correlation can contain many valid effects. Use the operation's scoped key and reject mismatched fingerprint reuse. |
| **Lease / fencing / retry — I mechanics** | Temporary execution ownership, stale-worker protection, and controlled replay. | Jobs/integrations/storage → durable workers/operations | Only the current claim holder finalizes. Timeout does not prove no effect occurred; retry only where the owning operation permits safe replay. |

**Media verbs:** finalize verifies uploaded bytes; replace creates another asset; remove hides a READY asset without deleting it; restore reverses visibility removal; delete records eligible physical removal. An orphan is an expired unfinalized reservation, not every unlinked durable asset. [Media lifecycle][media] [Cleanup][cleanup]

### Web Growth and shared Work Management

All concepts below are **P**. Sources: [Web Growth architecture][growth], [shared Work Management][work], [Search integration with Work Management][searchwork].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **ContentAsset / ContentStrategy** | Managed editorial item / durable brief explaining question, intent, service, CTA, and purpose. | Smart Blog → publishing, Content Intelligence, Search | Neither is a crawled URL or media bytes. Capture strategy once; consumers do not maintain competing strategy copies. |
| **TopicCluster** | Editorial grouping organizing content production/support. | Smart Blog → Content Intelligence, Search mappings | Not SearchTopic or SearchKeywordCluster. Map deliberately rather than merge identities. |
| **ContentLink / PublicationRecord** | Editorial link relationship / evidence of publishing content to a target and version. | Smart Blog → publishing, intelligence | Planned/confirmed editorial intent is not an observed crawl edge. Published does not mean improved. |
| **WebsitePage** | Durable normalized identity of a discovered website URL, with broad page role. | Website data foundation → Website/Content Intelligence, Smart Blog, Search | Not every discovered page is managed ContentAsset. Search classification and dated measurements live in related records. |
| **MetricSnapshot / DataHealthCheck** | Period-specific metric evidence / evidence of source or tracking health. | Web data/Website Intelligence → Growth/Search analysis | Missing or unhealthy data is not a measured decline; aggregate metrics are not person-level conversion proof. |
| **FindingDefinition / FindingEvidence** | Versioned diagnostic rule / facts supporting the condition. | Shared diagnostic substrate; intelligence domain owns rule → Finding/review | Preserve rule version and triggering evidence. AI explanations cannot substitute for rule passage or historical evidence. |
| **Finding** | Evidence-backed Website, Content, or Search diagnostic. | Intelligence defines condition; Work Management owns review lifecycle → Growth/Search work | Reuse the shared concept. Review/confirm/defer/dismiss/resolve/reopen are distinct from measured improvement. Not BusinessException or a separate SearchOpportunity system. |
| **WorkPackageTemplate** | Versioned prescription selected to turn a Finding into work. | Work Management → Website/Content/Search execution | Retain template/version provenance on resulting work. “Work Package” is display shorthand, not a second WorkPackage entity. |
| **WorkTicket / WorkTicketTask** | Assigned BTLS improvement work from a confirmed Finding / its narrow checklist item. | Work Management → Growth/Search execution/reporting | Retain Finding evidence and template version. Completing work does not prove improvement. Not Revenue Job/JobTask or general project management. |
| **Intervention** | Durable record of what actually changed, where, and when, with explicit provenance. | Work Management → measurement, fulfillment, optimization/fleet | Apply D2 below. It is actual-change history, not a proposal, ticket, execution status, or success claim. Preserve corrections and scope. |
| **MeasurementReview** | Review of what happened after an Intervention, using pinned comparison periods and sufficiently healthy evidence. | Work Management → Growth/Search outcomes/client views | Improved, partially improved, no measurable change, worsened, inconclusive, and insufficient data remain distinct. Ticket completion is not measurement; temporal association is not causation. |

#### D2 — Intervention provenance: approved

Every Intervention **MUST have explicit, durable provenance**. A WorkTicket is **not universally required**.

Normal Finding-driven human work uses `Finding → WorkPackageTemplate → WorkTicket → Intervention`, retaining the template version and evidence.

Approved alternative provenance is permitted for explicitly governed system execution:

- `FleetRemediationTarget → Intervention`.
- Approved `AUTO_GUARDED OptimizationAction → Intervention`.

Do not manufacture empty Findings or WorkTickets merely to satisfy provenance. Do not infer that any caller, arbitrary automated action, or every ticketless OptimizationAction is therefore authorized. Alternative provenance does not bypass property authorization, execution policy, verification, audit, or required reversal safeguards. Additional provenance paths need explicit governance; this decision authorizes no additional ticketless provenance path.

**Work Management owns Intervention history regardless of provenance.** Record actual changes and their evidence without converting a failed/partial execution into a claim of successful improvement. Search may add contextual scope, not a competing change-history system. D2 settles the semantic invariant; it does not prescribe a new schema or generic provenance engine.

### Search strategy, evidence, and fulfillment

All named Search records below are **P**; assessments and summaries marked **D/P** are derived. Sources: [Search ownership/shared identity][sharedknowledge], [page/query/target architecture][searchstrategy], [program and evidence][searchevidence], [fulfillment/optimization][searchfulfillment], [fleet/measurement][searchmeasurement].

| Term / form | Meaning and boundary | Owner → consumers | Drift guard / lifecycle |
|---|---|---|---|
| **PageSearchProfile** | One-to-one Search semantic classification of a WebsitePage: structure, purpose, desired indexing, and assignments. | Search → strategy, coverage, audits | Not page identity, rank history, coverage result, or AI recommendation. Classification source/confidence does not establish observed performance. |
| **SearchPageType / SearchPagePurpose / IndexingIntent** | Page structure / strategic purpose / desired indexing behavior. | Search → profile/coverage | “Money page” means purpose, not a new entity. Desired INDEX is not observed indexability. `SERVICE_LOCATION` page type is not Revenue ServiceLocation. |
| **PageServiceAssignment / PageLocationAssignment / PageTopicAssignment** | Explicit targeting links to PropertyService / ServiceArea / SearchTopic. | Search → classification/coverage | At most one active PRIMARY per category. Location assignment targets ServiceArea, not a customer worksite; geography may be absent. |
| **SearchTopic** | Property-scoped Search subject spanning pages, queries, and evidence. | Search → targets/pages; editorial mappings | Not an editorial TopicCluster or query set. Preserve distinct identities even when labels match. |
| **SearchKeyword** | Normalized query identity within a property and language. | Search → query groups, demand/rank evidence | Apply D1 below. `ACTIVE/PAUSED/ARCHIVED` is research/tracking state; metrics and market context are not keyword identity. |
| **SearchKeywordCluster / SearchKeywordClusterMember** | Related queries normally served by one search intent and primary ranking asset, with explicit membership roles. | Search → targets/research | Not TopicCluster or SearchTopic. Avoid competing active targets for the same query without an explicit cannibalization exception. |
| **SearchTarget** | Deliberate strategic search objective combining required keyword cluster, service/topic, intent, and optional geography. | Search → coverage, evidence, Findings, work | `ACTIVE/PAUSED/RETIRED`. Not a keyword or page, and not an automatically generated service×city matrix. Commercial priority is a human/business input. |
| **SearchTargetPageAssignment / SearchTargetSupport** | Historical intended ranking-page assignment / strategic support relationship. | Search → alignment, content, measurement | At most one active PRIMARY page per target; retain assignment dates. Observed ranking URL may differ. Intended support does not prove a hyperlink exists. |
| **KeywordMetricSnapshot** | Dated provider evidence of demand, CPC, and related metrics, with market context required by D1. | Search evidence → research/prioritization | No mutable volume on SearchKeyword. Preserve provider/date/market/units; `cpcMicros` is not commercial cents or collected money. |
| **SearchCoverageAssessment — D/P** | Immutable, versioned assessment of how well a target is covered. | Search rules → workspaces/Findings/program | Coverage is derived, not an editable page label. No assessment means unresearched; insufficient data differs from weak coverage. Retiring a target is strategy, not coverage state. |
| **SearchTrackedEntity** | Property-scoped self business or deliberately selected competitor being measured. | Search evidence → rank/local/authority analysis | One SELF per property. A tracked competitor is not another tenant or permission for cross-client benchmarking. |
| **OrganicRankRun / OrganicRankObservation** | Provider collection context / observed organic result for a tracked entity. | Search evidence → trends, Findings, measurement | Retain geography, language, device, depth, provider, and date. Not-found differs from partial/failed collection; not GSC average position or local-pack grid rank. |
| **LocalRankGridRun / LocalRankGridPoint** | Local-pack visibility across recorded geographic points, with business location, keyword, tracked entity, and time context. | Search evidence → local coverage/measurement | Compare compatible grids and contexts; preserve geometry and per-point found/failure evidence. Not a Customer ServiceLocation map. |
| **SiteInspectionRun / PageTechnicalSnapshot** | Collection process / observed technical state of a page. | Search technical evidence → audit/link analysis | Observations are not desired page semantics or rule conclusions. No complete historical HTML archive is implied. |
| **InternalLinkEdge** | Observed hyperlink in the normalized site graph. | Search → link analysis/audits | Not ContentLink or SearchTargetSupport. Use observed edges for link facts and explicit strategy records for intent. |
| **SearchAuditRun / SearchAuditCheckResult** | Versioned SEO rule evaluation / individual check evidence. | Search rules → shared Findings/fulfillment | Inspection collects facts; audit evaluates them. Unknown is not fail. Actionable diagnostics use shared Finding, not another issue/task system. |
| **SearchProgram** | One property's recurring SEO fulfillment program; one active program per property for MVP. | Search → cycles, portfolio, priorities, usage | Program scope/policy is not shared business identity, subscription billing, or Revenue settings. |
| **SearchFulfillmentPolicyVersion / SearchAutomationPolicyVersion** | Versioned delivery obligations / versioned execution authority. | Search → cycles/usage and OptimizationAction | What is owed and what may run automatically are separate policies. Retain historical policy meaning; editing current policy must not rewrite past obligations or authority evidence. |
| **SearchFulfillmentCycle / SearchCycleRequirement** | Delivery period and snapshotted obligations. | Search → portfolio/client proof | `FULFILLED` means agreed work delivered. Waivers must be explicit; neither fulfillment nor waiver proves rankings/revenue improved. Measurement may remain pending. |
| **SearchDeliverySummary / SearchProgramHealthSnapshot — D/P** | Client-safe delivery proof / rebuildable program-health view. | Search → approved client reporting/operators | Summaries derive from durable records. Approval/visibility is not outcome success; a portfolio exception is not automatically Revenue BusinessException. |
| **OptimizationAction** | Proposed/approved/executing/completed/failed/reversed/cancelled site-change workflow with policy and execution evidence. | Search → adapter execution, shared Intervention | Not Intervention or JobExecution. Successful execution creates or links an Intervention. Nullable workTicketId is not blanket ticketless authority; D2 governs permitted provenance. |
| **FleetRemediation / FleetRemediationTarget** | Restricted cross-property shared-defect remediation / per-property verification and change linkage. | Search/platform remediation → authorized operators, property-specific history | Keep root access restricted; preserve per-property Intervention and measurement. D2 permits governed target provenance, not an unscoped global Intervention. |
| **SearchProviderUsageRecord** | Program/property provider units and estimated cost. | Search → quota/cost control | Not Invoice, Payment, or collected revenue. Estimated provider spend does not create billing truth. |

#### D1 — SearchKeyword identity: approved

`SearchKeyword` identity is exactly **`propertyId + normalizedQuery + languageCode`**.

Locale/geographic market does **not** participate in identity. Geographic/provider market context belongs to **SearchTarget and dated measurement/evidence records**. Market-specific observations must never be treated as interchangeable. Sharing a keyword ID does not make two markets' demand or rank evidence comparable. A place name within the query remains part of the query text; D1 excludes an additional geographic identity dimension.

The existing KeywordMetricSnapshot sketch does not fully express normalized market context. Its incompleteness does not permit dropping context or adding market to keyword identity. The owning implementation must preserve the approved meaning; this document does not invent its fields.

#### Search execution authority

`AUTO_GUARDED`, `APPROVAL_REQUIRED`, `HUMAN_ONLY`, and `UNSUPPORTED` are **Search execution classes**, not Robin operating modes or OptimizationAction statuses. A provider/site adapter's capability does not itself authorize execution.

AUTO_GUARDED requires a supported BTLS-managed site, declared adapter capability, explicit operation allowlist, permitting property policy, deterministic validated input, idempotency, traceability, conflict checks, required rollback/reversal, and no human strategy decision. Record applicable policy evidence. AI may propose or explain; it cannot grant itself authority. The concrete allowlist remains an owning-feature decision. [AGENTS][agents] [Search execution rules][searchfulfillment]

## 4. Actions and truth claims

| Say | Only when | Never infer |
|---|---|---|
| **Authenticate / authorize** | Identity is verified / the particular scoped action is permitted. | A valid session grants every property or capability. |
| **Issue / accept** | Commercial content is frozen / valid acceptance binds the exact current revision. | A send, view, signature-image upload, or AI proposal is acceptance. |
| **Start work / Work done / Close** | Owning Job service authorizes the corresponding business transition. | A visit, checklist, photo, or payment is always required; work complete automatically means closed. |
| **Record payment / reverse** | Factual receipt is recorded / an explicit compensating correction preserves history. | An editable paid flag or deletion is equivalent. |
| **Dispatch / deliver / read** | Transport request outcome / owning delivery evidence / recipient read evidence exists. | These are interchangeable or establish workflow completion. |
| **Publish / complete ticket / record Intervention** | Approved editorial delivery / assigned work finished / actual change recorded. | Performance improved. |
| **Fulfill / measure improvement** | Delivery obligations are satisfied / eligible outcome evidence supports improvement. | Fulfillment guarantees rankings, leads, or revenue. |
| **Attributed / assisted / unknown** | Evidence supports the stated relationship and confidence. | Temporal sequence or aggregate analytics proves individual or multi-touch causation. |

Revenue owns Lead, acceptance, Job, Invoice, and Payment facts. Growth/Search consumes those facts for supported measurement; it never synthesizes collection truth. Collected Payment, quoted value, accepted value, Invoice amount, provider cost, and keyword CPC retain their separate meanings and units. [Revenue reporting][revenue] [Search measurement][searchmeasurement]

Normalize observations without erasing their source. Organic rank, local grid visibility, Search Console averages, technical observations, local listings/backlinks, and business outcomes remain distinct evidence. Missing/partial/failed collection must remain distinguishable from a valid negative result. Comparison needs compatible market, period, source, and collection context. [Search evidence][searchevidence]

## 5. Aliases, legacy wording, and prohibited substitutions

Aliases are reading aids, not new identifiers. Do not rename an existing API, model, or event merely to make its wording match this table; reconcile the owning source first.

| Encountered wording | Interpret / use instead | Do not introduce |
|---|---|---|
| “Client” or “property” without context | Specify ClientAccount, ClientProperty, Customer, BusinessLocation, or ServiceLocation. | One overloaded client/location entity. |
| “Opportunity” | Lead in Revenue; evidence-backed opportunity Finding in Growth; SearchTarget for strategy. | A shared universal Opportunity model or separate SearchOpportunity model. |
| “Work Package”, `WorkPackage` shorthand | WorkPackageTemplate and selected version. | A second WorkPackage entity. |
| `LeadActivity`, `FollowUpTask`, `PaymentRecord` in old snapshots | RevenueActivity, NextRequiredAction, Payment according to current owner semantics. | Competing legacy models or mechanical renames without checking scope. |
| Lead “status” / `LeadStatus` / `lead.status_changed` examples | **Lead Stage**, `LeadStage`, `stage`, and future `lead.stage_changed` when they mean sales stage, unless an established implementation contract requires otherwise. | A universal Lead lifecycle, competing stage/status events for the same fact, or an event registration inferred from an example. |
| `EmailProvider`, `EmailDeliveryResult` | TransactionalEmailProvider, current TransactionalEmailResult; acceptance only. | Mailbox capabilities or delivery truth inferred from a stale example. |
| `MediaAssetReference` | No established current model; consuming features define approved explicit associations. | A generic polymorphic attachment registry. |
| “Job”, “task”, “issue”, “event”, “success” | Qualify by the owning domain and operation. | Interchangeable Jobs/tickets, Findings/exceptions, or one universal success state. |
| “Money page”, “rank map”, “SEO program” | Search page purpose, local grid presentation, SearchProgram respectively. | New entities or merged evidence merely because UI labels differ. |
| `CUSTOM_DOMAIN`, `CONNECTED_MAILBOX`, voice/Job Brief | Reserved/deferred capabilities as currently specified. | Availability inferred from enum names, storage compatibility, or older Project copies. |

## 6. Rule for new terms and conflicts

Before introducing a noun, state, event name, or alias, search canonical context, schema, migrations, types, and services for an existing meaning. Reuse the owning concept and identity where the meaning matches; similarity of spelling is not enough to merge concepts.

For a genuinely new shared term, establish its owner, meaning, implementation status, consumers, explicit exclusions, and source evidence in the governing context before another lane depends on it. A local variable, UI label, or provider field must not become global architecture by repetition.

If sources conflict, identify both locations and the concern each governs, stop the affected implementation, and request the smallest unresolved decision. Do not silently choose precedence, redesign the system, or reopen approved D1/D2. Preserve historical records and applied migrations.

**Agent Handoff Test:** Could a fresh agent use this definition without inventing, merging, renaming, or redefining something important? If not, strengthen the boundary or surface the unresolved decision before handoff.

## Evidence references

Evidence links below are pinned to the verified commit so implementation claims are reproducible; they are historical evidence, not substitutes for current canonical context. For current policy and sequencing, read [architecture](../architecture.md) and [build plan](../build-plan.md) through the current [AGENTS.md](../../AGENTS.md) read path. On future updates, recheck the corresponding repository files; this baseline does not prove future implementation status.

[agents]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/AGENTS.md
[tenancy]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L511
[authdecision]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L5431
[schema]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/prisma/schema.prisma
[permissions]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/auth/permissions.ts
[propertycontext]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/properties/property-context.ts
[f8]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/feature-08-plan.md
[foundationsecurity]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/supabase/security-migrations/20260914180000_revenue_foundation_server_access.sql
[foundation]: https://github.com/saybenn/BTLS-Command-Center/tree/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/features/revenue-operations/services
[propertyservice]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/properties/property-services.ts
[sharedknowledge]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L2247
[revenue]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L1611
[buildplan]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/build-plan.md
[robin]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L1979
[infrastructure]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L1239
[email]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/integrations/email/transactional-email-provider.ts
[dispatch]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/integrations/provider-dispatch.ts
[media]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/storage/media-lifecycle.ts
[cleanup]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/storage/media-cleanup.ts
[events]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/events/internal-event-registry.ts
[jobs]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/jobs/job-contracts.ts
[notifications]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/src/server/notifications/notification-contracts.ts
[growth]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L1512
[work]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L5079
[searchwork]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L3775
[searchstrategy]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L2543
[searchevidence]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L2919
[searchfulfillment]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L3916
[searchmeasurement]: https://github.com/saybenn/BTLS-Command-Center/blob/7cbcb3243d0d326fee90fa4a98ee24fe24d0ada7/context/architecture.md#L4242
