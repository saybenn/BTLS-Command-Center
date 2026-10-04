# BTLS Command Center — Shared Contracts

**Canonical governing artifact · Adopted 1 October 2026 · `context/shared/shared-contracts.md`.**

Evidence baseline: `saybenn/BTLS-Command-Center`, `main`, `db7f6d61bf21bc331a055548fea7559b8486f5c1`. Features 01–08 and Ubiquitous Language canonicalization are merged. Canonicalization establishes architectural boundaries; it grants no implementation or parallel-development authorization.

## Purpose and authority

Ubiquitous Language defines what a concept means. This document defines who controls its truth, what consumers may rely on, what they may extend, and what they must not duplicate. Two agents using these contracts must preserve compatible tenant boundaries, identifiers, lifecycles, and evidence even when their private implementation differs.

Follow current [AGENTS](../../AGENTS.md) and governing sources in their owned concerns: [Ubiquitous Language](ubiquitous-language.md) owns canonical terminology; Shared Contracts owns cross-domain ownership, consumer boundaries, shared invariants, and shared-change governance; [architecture](../architecture.md) owns product/domain lifecycle and intended relationships; Prisma plus ordered migrations owns represented database structure; build/feature plans own sequencing. Read order is not an earlier-file-wins hierarchy. Surface genuine conflicts on these concerns before affected implementation. [E01] [E02]

**Status:** I = implemented surface; P = planned boundary, not an available model/API; D = deferred or not contracted. A planned event name is not a registration. Contract numbers are references within this document, not new product entities.

**Classification:** PLATFORM-OWNED = identity/access foundation; SHARED-OWNED = common infrastructure or substrate with one owner; REVENUE-OWNED, SHARED-CONSUMED and GROWTH/SEARCH-OWNED, SHARED-CONSUMED retain their domain owner; LANE-LOCAL = private behavior under existing architecture; DEFERRED / NOT YET CONTRACTED = no permission to build or infer an interface. “Shared” never means everyone may write.

SC-16 states its mixed ownership explicitly: horizontal Robin identity is not a blanket
LANE-LOCAL classification or a transfer of every Robin component to shared infrastructure.
Construction lane and semantic owner are different concerns; no new classification registry
or parallel execution lane is established by this distinction.

## Rules inherited by every contract

1. **Truth and schema:** the named owner controls source-record lifecycle and source schema. Consumers use the owner's authorized application-service/query surface; they do not update foreign-domain tables or create a second authority. A shared database is not shared write permission. Exact new service/query signatures must be established by the owning feature before consumers implement against them.
2. **Scope:** authenticate, resolve an authorized property, check the operation's capability, validate input, and preserve property scope through queries, relations, events, jobs, and outputs. An ID, a feature flag, or access to one studio grants no other authority. Global reference data and platform fleet roots are explicit exceptions, never a shortcut for tenant data.
3. **Extension:** a lane may add its own private logic and approved domain-owned references without changing referenced meaning. A new FK, back-relation, deletion effect, shared field, uniqueness rule, capability, or exported contract requires the Shared Change Gate unless that exact extension is already approved. Merely sharing `schema.prisma` does not transfer model ownership.
4. **Evidence:** permitted immutable snapshots/read models retain source IDs, property, relevant time/version, provenance, and units. They remain evidence or projections, never mutable copies of source truth. Preserve missing, denied, partial, failed, and zero-result distinctions; do not expose unauthorized data while explaining them.
5. **Effects:** owning services enforce business policy and coordinate transactions/audit. Infrastructure records do not authorize the action or replace its business record. Provider calls remain outside long database transactions. Preserve existing durable dispatch, idempotency, and recovery behavior.
6. **Change authority:** the Shared Change Gate below governs changes to these boundaries. Routine private changes within an approved feature remain local. A technical subsystem owner is not automatically a human approval authority.

These are adopted governing rules consolidating approved boundaries. Planned contracts do not establish that their models, services, APIs, DTOs, events, permissions, providers, or tests already exist.

## SC-01 — Identity, property authorization, and RLS

**PLATFORM-OWNED · I. Owner:** Platform authentication/authorization. **Consumers:** every domain and shared infrastructure. **Schema:** AppUser, ClientAccount, ClientProperty, AccountMembership, PropertyAccess, pending invitation/grant records, FeatureFlag. [E03] [E04]

- **Input → output:** verified Supabase identity, requested property, required operation → active AppUser and `AuthorizedPropertyContext`, or explicit denial/unavailability. AppUser ID equals the Auth UUID; a Customer/EmployeeProfile is not a login.
- Normal client property entry requires active membership and explicit PropertyAccess; only `roleOverride` is optional. Preserve account/property/user suspension and durable revocation checks. Employee linking requires pre-existing eligible explicit access; it never provisions access.
- Platform exceptions are operation-specific: admins/operators have documented directory/media/foundation capabilities; operations reads restrict Operators to explicitly granted active properties; retry is Admin-only under the current allowlist. Notifications remain recipient-specific, including for Admin, and Operators require explicit active property access.
- RLS supplements service checks. Feature 08's nine foundation tables deny browser SELECT and CRUD and use `withFoundation` with restricted `btls_app` and transaction-time capability recheck. Provider-evidence writes use their distinct trusted server boundary; do not generalize this wrapper to every table or open new browser access to make it work.
- **Extension / gate:** introduce feature capabilities through the central capability and SQL policy mechanisms, with parity tests. Changing platform exceptions, auth resolution, grants, role bundles, or RLS is shared review. No lane-local authorization engine or service-role bypass for normal feature CRUD.
- **Failure prevented / tests:** a directory permission accidentally becomes universal authority; stale grants survive in cached context. T01 and T02.

## SC-02 — Shared references, transactions, and audit

**SHARED-OWNED · I. Owner:** platform identity contracts and shared audit; each domain owns the action it reports. **Consumers:** all services. **Schema:** AuditEvent and references to canonical identity records. [E03] [E05]

- **Input → output:** authorized actor/property, action, subject, bounded safe metadata → append-only AuditEvent coordinated with the owning mutation. Actor/account/property may be nullable for their documented scopes; do not invent actors for system work.
- Carry canonical IDs instead of matching by display name, slug, URL, phone, email, or provider ID. Where relations cross property/customer boundaries, validate the exact scoped relationship and use applicable database constraints. A valid UUID is not proof of ownership.
- Foundation optimistic `revision` detects stale writes; it is not historical content. Creation replay protects a request, not person identity. Retain fingerprints/conflict behavior rather than adding an independent deduplication scheme.
- **Extension / gate:** owners may append approved action/subject metadata using the existing audit pattern; changes to identity meaning, append-only behavior, replay use, or shared audit shape require review. No mutable shadow audit, event-bus substitution, or generic business-ownership graph built from audit subject strings.
- **Failure prevented / tests:** repeated writes produce duplicate effects, audit is mistaken for publication, or a cross-property ID is accepted. T01 and T02. RevenueActivity remains Revenue-owned operating history, not a replacement audit implementation.

## SC-03 — Shared property knowledge

**SHARED-OWNED · PropertyService I; BusinessLocation/ServiceArea P. Owner:** shared property knowledge. **Consumers:** Revenue, Robin, Smart Blog, Search. [E06] [E07]

- **Input → output:** authorized property and canonical service/location/area IDs → shared business identity. Current PropertyService entry points are `listPropertyServices`, `getPropertyService`, `savePropertyService`; input validation is authoritative, not the conceptual architecture sketch.
- Reuse PropertyService's property-scoped ID, normalized-name/slug uniqueness, hierarchy, active state, revision, and replay/audit behavior. Current edits serialize hierarchy changes, reject cycles and unavailable parents, and reject deactivation with active children. Do not derive a new identity from an editable name or slug.
- PricebookItem may reference services and snapshot commercial content; Search program strategy owns SEO priority. Neither pricing nor Search priority belongs on PropertyService. Deactivation does not authorize deleting consumers' history or marking their work complete.
- BusinessLocation means the business's own location; ServiceArea means served/target geography. Neither may reuse Revenue ServiceLocation. Their planned shared ownership remains shared even if Search introduces them first.
- **Schema / extension:** consumers may propose explicit scoped references in their own records. Shared fields, normalization, hierarchy/lifecycle, indexes, deletion effects, and first implementation of planned shared entities require owner review through the gate. Search's “establish if absent” instruction is already satisfied for PropertyService.
- **Forbidden / tests:** no RevenueService/SearchService private vocabulary, duplicated service table, or local write path bypassing shared invariants. T03.

## SC-04 — Revenue identity and local foundation boundaries

**REVENUE-OWNED, SHARED-CONSUMED · I. Owner:** Revenue Operations. **Consumers:** Revenue, authorized Robin and future outcome consumers. **Schema:** Customer, Contact, ServiceLocation, ServiceAsset, EmployeeProfile, RevenueOperationsSettings. **Tag/CustomerTag:** LANE-LOCAL Revenue catalog/assignment, not a platform tagging service. [E03] [E08]

- **Input → output:** authorized, validated Revenue commands/references → Customer/person Contact, optional worksite/equipment/workforce context, settings. Other domains receive only necessary authorized references or facts, not ownership of these records.
- Preserve same-property/same-customer relations, advisory duplicate review, primary/default constraints, request replay, revisions, and audit. Shared endpoints never silently merge people. Customer relationship state is not Lead Stage; workforce identity is not authentication.
- Revenue settings reference an eligible same-property shared SendingIdentity; they do not own sender verification or credentials. `Tag` does not establish a universal taxonomy or override lifecycle facts.
- **Extension / gate:** ordinary Revenue-private fields within approved feature scope stay Revenue work. Changes to exported identity, shared references, permissions, source semantics used by another domain, or promoting Tags to a shared system trigger review. No consumer-owned Customer/Contact/Employee clone or cross-domain mutation.
- **Failure prevented / tests:** Search uses Customer addresses as business locations, a worker gains login authority, or both lanes make Tags a different abstraction. T01, T02, T03, T07.

## SC-05 — Media bytes, access, and owning relationships

**SHARED-OWNED · I. Owner:** shared Storage/Media. **Consumers:** all media/attachment workflows. **Schema:** MediaAsset; explicit business relationships belong to the consuming domain. **MediaAssetReference:** D/absent, not a contracted generic model. [E09]

- **Input → output:** authorized property plus server-owned profile/target policy → upload reservation; verified bytes → READY asset; authorized access → permitted metadata/public URL or short-lived signed delivery. Use shared reserve/finalize/replacement/access/cleanup services.
- Finalized bytes are immutable. Replacement creates another MediaAsset and changes the explicit owning relationship. Library removal toggles visibility separately from byte deletion. Removing a relationship is not deletion permission. An orphan is an expired unfinalized reservation.
- Generic browser library operations are limited to ordinary CONTENT_IMAGE/ATTACHMENT assets. Evidence, generated documents, sensitive records, and trusted uploads keep owning-workflow checks. Shared media capability alone does not grant every commercial-document or evidence access. Preserve private delivery and sensitive-access audit.
- Storage owns validation, profiles, cleanup eligibility, claims, retry-safe deletion, and tombstones. Owning domains decide business retention; schedules reuse the existing cleanup service. Durable evidence cannot become temporary merely for cleanup convenience.
- **Extension / gate:** approved explicit foreign keys and contextual retention requirements may be added by consumers with relation review. New profile/bucket, byte lifecycle, access policy, retention/deletion behavior, or reference mechanism requires shared review. No lane-local uploader/cleanup system or polymorphic attachment registry.
- **Failure prevented / tests:** picker removal destroys legal/evidence history; one lane overwrites shared bytes. T04.

## SC-06 — Internal events and durable outbox

**SHARED-OWNED · I framework; domain event families P. Owner:** shared event infrastructure owns envelope/registry/dispatch; the producer domain owns each fact and payload meaning. **Consumers:** registered handlers in either lane. **Schema:** EventOutbox. [E10]

- **Input → output:** runtime-validated registered fact → durable outbox → dispatch/replay. Envelope includes eventId, occurredAt, propertyId, version, correlationId, and relevant subject references. Outbox metadata and parsed payload must agree.
- Preserve global eventId identity and property/event-name/deduplication-key uniqueness. Duplicate IDs with conflicting content are errors. Publishing does not replace the source transaction; record required follow-on intent durably with the mutation rather than relying on a transient post-commit send.
- Current names: `infrastructure.test_event.completed` v1/v2 and `operations.job.retry_requested` v1. Future `lead.stage_changed`, `payment.recorded`, Finding/Search events are not registered. The retry event records a request fact; it is not a business execution success.
- DISPATCHED is not consumer completion; interrupted send/mark may redispatch, so consumers are idempotent. Audit action names do not publish events.
- **Extension / gate:** add a producer-owned event/schema and consumers under an approved feature contract; never broaden the registry to arbitrary strings. Meaning, required fields, version acceptance, or key changes require review. A field addition is not automatically compatible with strict validators. Record the supported producer/consumer versions and replay compatibility before rollout; do not repurpose an existing version.
- **Failure prevented / tests:** incompatible payloads, lost follow-on work, duplicate effects, or listeners waiting for examples that never emit. T05.

## SC-07 — Background execution, attempts, and operations

**SHARED-OWNED · I. Owner:** shared jobs/operations; domain handler owns its business behavior. **Consumers:** either lane's durable work. **Schema:** JobExecution, JobExecutionAttempt. [E11]

- **Input → output:** registered typed payload, property, correlation, idempotency, origin, and handler → one execution with attempt history and safe operational failure visibility. Existing jobs: `infrastructure.test_job`, `infrastructure.contextual_proof`, `storage.media_cleanup`.
- Preserve `(propertyId, jobType, idempotencyKey)` execution identity and `(jobExecutionId, attemptNumber)` attempt identity. Validate stored context; retries retain original identity, apply bounded policy, recover expired claims, and fence late workers. Correlation is tracing, not a dedup key.
- Current manual retry is Admin-only, FAILED-only, for approved contextual-proof/media-cleanup v1 handlers and allowed failure evidence. Operator visibility requires explicit active property access; client access is denied. Do not infer retryability from FAILED alone.
- Business Job, WorkTicket, RobinRun, and OptimizationAction remain separate. A successful handler does not imply payment, delivery, completed service work, or measured improvement. Record sanitized failures without raw secrets/customer payloads.
- **Extension / gate:** domain handlers may use the shared runner after defining payload, idempotency, retry/max-execution expectations, authorization, logging, and escalation. New replay semantics, manual retry eligibility, shared statuses, or execution identity require review. No private queue/retry subsystem or in-request bulk provider work.
- **Tests:** T06; a provider UNCERTAIN outcome stays non-replayable under SC-09 even when a worker can retry.

## SC-08 — Notifications

**SHARED-OWNED · I. Owner:** shared notifications owns persistence, dedup, read state, and destination resolution; producer owns workflow meaning. **Consumers:** authorized recipients and both lanes' implemented producers. [E12]

- **Input → output:** trusted producer source, notice type, property, recipient, correlation, dedup key, validated subject, concise title/body → persisted notice. Current subjects: property.overview, media.asset, job_execution; sources: system, infrastructure.proof.
- Preserve `(propertyId, recipientUserId, deduplicationKey)`. Persist subject identity, never arbitrary destination URLs. Resolve destinations against implemented workflows and current recipient/subject authorization; unavailable subjects yield no destination.
- Reads/read mutations are recipient-specific, including for admins. Read state does not complete work, resolve an exception, or establish external delivery. Historical unknown source/correlation may remain null; new producers must not fabricate historical provenance.
- **Extension / gate:** approved features extend source/subject registration additively with runtime validation and resolver denial tests. A new subject resolver is not permission to weaken owning-record checks. Source meaning, dedup rules, recipient access, or workflow side effects on read trigger review.
- **Forbidden / tests:** no lane-local notification table, Message replacement, Robin HandoffPackage engine, or read-to-complete shortcut. T07.

## SC-09 — Provider interfaces, sender identity, and transport evidence

**SHARED-OWNED · I email/SMS/sender/dispatch/receipts; P broader connections/adapters. Owner:** shared integrations. **Consumers:** authorized owning workflows in both lanes. **Schema:** SendingIdentity, ProviderDispatch, WebhookReceipt; IntegrationConnection remains planned. [E13]

- **Input → output:** owning service's authorized normalized request → BTLS interface → adapter/SDK → validated normalized result and durable transport evidence. SDK types and secrets stay behind adapters. Current TransactionalEmailProvider/Postmark and SmsProvider/Twilio report acceptance, not destination delivery.
- Current database and adapter support BTLS_MANAGED sending only; CUSTOM_DOMAIN/CONNECTED_MAILBOX enum values do not enable them. Shared SendingIdentity owns From/display/Reply-To configuration; Revenue only references it. Reply-To is not authenticated From or mailbox OAuth.
- Dispatch identity is `(propertyId, channel, operationType, idempotencyKey)` with request fingerprint; only ACCEPTED resolves a duplicate successfully. Fresh PENDING waits; expired PENDING becomes UNCERTAIN without automatic resend. REJECTED/FAILED/UNCERTAIN are not success. Preserve same-property sender/job validation.
- Webhook uniqueness is `(provider, providerAccountKey, externalEventId)`. Verify provider origin at ingress and retain unresolved receipts without guessing Customer/property ownership. `processingStartedAt` fences processing; stale claim holders cannot finalize. Receipt processing is not business delivery.
- **Trust boundary:** dispatch helpers do not establish caller identity, business consent, or complete domain authorization. Only validated owning server workflows may invoke them. Existing Feature 07 provider tables deny browser writes and have a distinct trusted-server write path; neither lane may relax it or assume the Feature 08 transaction role can write them.
- **Extension / gate:** add adapters behind approved capability interfaces; changing shared signatures, result semantics/provider literals, sender mode, callback identity, or error/retry behavior requires review. New major/paid provider decisions remain governed by AGENTS. No lane-specific EmailProvider or credential store.
- **Tests:** T08. ConnectedMailboxProvider, integrated PaymentProvider, and exact future Search vendors remain deferred; absence does not authorize substitutes.

- **Planned AI boundary:** shared integrations owns the narrow BTLS `AIModelGateway` and
  initial OpenAI adapter. Approved consumers use normalized model interaction/structured
  output; authorization, Robin policy and domain execution remain outside the provider.
  The exact interface and model are not selected; multi-provider routing is not in scope.
  Reuse by Quick Capture does not import Robin modes or require Robin live execution.
  This adopted direction is not an implemented provider contract or package installation.

## SC-10 — Customer communication and business delivery

**REVENUE-OWNED, SHARED-CONSUMED · P. Owner:** Revenue communications/commercial workflows. **Consumers:** human Revenue UI, Robin through services, authorized reporting. **Schema:** Conversation, Message, owning Estimate/Invoice delivery and acceptance evidence when implemented. [E14]

- **Input → output:** authorized Customer/primary Contact, channel/route and operational context → communication or commercial delivery evidence. Conversation remains Customer-owned and requires a primary Contact; Lead/Job/Invoice/Robin never become its parent.
- Consent, opt-out, business hours, property-number routing, duplicate prevention, and domain delivery transitions are owning-service responsibilities before/after shared transport. A valid phone/email is not consent. Unmatched inbound SMS uses verified receipt evidence and bounded resolution, not guessed identity.
- Provider acceptance, customer delivery, document view, and exact-revision commercial acceptance are distinct claims. Robin uses the same services and does not own communication records. External sends cannot be undone by deleting local history.
- **Extension / gate:** Revenue may implement its approved lifecycle and explicit context relations. Cross-domain delivery semantics, public-access rules, provider handoffs, or exported evidence changes require review. Search may consume authorized outcomes, not send or mutate Revenue records by assuming infrastructure access is permission.
- **Forbidden / tests:** no transport table promoted into Message/EstimateDelivery truth, no inbound mailbox sync added through transactional email. T08 and T11 as workflows arrive.

## SC-11 — Website identity, normalized data, and editorial truth

**GROWTH/SEARCH-OWNED, SHARED-CONSUMED · P. Owners:** Website data foundation owns WebsitePage/MetricSnapshot; Website Intelligence/shared web data owns DataHealthCheck; Smart Blog owns ContentAsset, ContentStrategy, TopicCluster, ContentLink, PublicationRecord. **Consumers:** Website/Content Intelligence, Search, authorized Revenue attribution use. [E15]

- **Input → output:** property connection, external source evidence, normalized URL/period → page identity and normalized observations/health. Editorial workflow separately produces content strategy, managed content, and publication evidence. A discovered page is not automatically managed content.
- WebsitePage owns URL identity/broad role; Search attaches PageSearchProfile and strategy. Search does not take over the editor, duplicate article scorecards, or create its own GA4/GSC normalized store. Content Intelligence consumes existing ContentStrategy rather than inventing another brief.
- **Reverse handoff limit:** shared web page/source context can enrich authorized Revenue attribution where matching evidence exists. Revenue owns the Lead's captured source/landing-page truth; the repository does not specify a Search-to-Revenue mutation API or mandatory WebsitePage foreign key. Do not manufacture one. Page discovery must not become a prerequisite for valid lead intake.
- **Extension / gate:** owner-approved page links, SearchTarget references on strategy, and derived measurements are allowed under their feature scope; new cross-domain relations/exported normalization or page identity changes require review. Capture historical source evidence without replacing it when a current URL or preferred page changes.
- **Failure prevented / tests:** competing page inventories, search classifications on the wrong entity, publishing bypassing editorial authority, or current crawl data rewriting captured attribution. T09 and T11.

## SC-12 — Shared diagnostics

**SHARED-OWNED · P. Owner:** shared intelligence infrastructure for FindingDefinition/Finding/FindingEvidence; diagnostic domain owns rule meaning and evidence production; Work Management owns review progression. **Consumers:** Website Intelligence, Content Intelligence, Search and their work flows. [E16]

- **Input → output:** versioned domain diagnostic definition plus eligible scoped evidence → shared Finding and evidence, then reviewed disposition. Preserve rule version, thresholds/evidence used, and provenance instead of reinterpreting history with today's rule.
- Domain engines establish the condition; AI may explain or suggest, not invent evidence or establish unsupported causes. Confirmation is a work decision, not proof of improvement. SearchAuditCheckResult and DataHealthCheck are evidence, not parallel Finding systems.
- **Extension / schema:** intelligence domains may add approved rule definitions/evidence adapters; Work Management controls shared review lifecycle. Shared fields, states, dedup/resolution semantics, or owner reassignment trigger the gate and involve both diagnostic and review concerns.
- **Forbidden / tests:** Revenue BusinessException/AttentionFlag/NextRequiredAction remain Revenue-local meanings; no generic “problem” aggregate, SearchOpportunity clone, or Revenue exception implemented as a Finding. T10.

## SC-13 — Work Management and durable change provenance

**SHARED-OWNED · P. Owner:** Work Management. **Consumers:** Website/Content Intelligence, Search, approved system execution and measurement. **Schema:** WorkPackageTemplate/version, WorkTicket/Task, Intervention, MeasurementReview; Search owns its additive SearchInterventionScope. [E17]

- **Input → output:** confirmed Finding + template version → assigned work; actual change + durable provenance → Intervention; eligible before/after evidence → MeasurementReview. WorkPackage is display shorthand, not another model.
- **D2 is binding:** every Intervention has explicit durable provenance; a WorkTicket is not universal. Normal human work uses Finding → WorkPackageTemplate → WorkTicket → Intervention. Approved alternatives are governed FleetRemediationTarget → Intervention and approved AUTO_GUARDED OptimizationAction → Intervention. No empty Findings/tickets and no additional ticketless path are authorized.
- Work Management owns Intervention history under every path. SearchInterventionScope identifies affected targets/pages/keywords/areas; it never replaces Intervention. Fleet roots stay platform-restricted; property Interventions and verification remain scoped.
- Work completion, actual change, fulfillment, and measured improvement are different results. Retain source evidence, exact prescription version, changes, comparison periods, and uncertainty. A failed/partial execution cannot claim improvement; record supported actual-change evidence without fabricated success.
- **Extension / gate:** add approved domain prescriptions and scope/evidence contributions; changing shared lifecycle, provenance paths, task semantics, measurement outcomes, or relations requires Work Management and affected-domain review. Exact D2 persistence design is still future owning-feature work; agents must agree on that shared surface before producing/consuming it.
- **Forbidden / tests:** no Revenue JobTask substituted for WorkTicketTask, no Search-private change history or outcome-review engine. T10.

## SC-14 — Revenue outcome truth consumed by Growth/Search

**REVENUE-OWNED, SHARED-CONSUMED · P. Owner:** Revenue source domains. **Consumers:** authorized Growth metrics, Search measurement/priority, shared MeasurementReview. **Schema:** Lead, Estimate/revision/evidence, Job, Invoice, Payment; consumer snapshots remain consumer-owned evidence. [E14] [E18]

- **Input → output:** authorized property, requested source identities and period → owner-defined outcome facts/eligible evidence with provenance and availability. Use handoff requirements below; no generic outcome DTO/API is implemented or frozen here.
- Lead supplies source/landing-page, qualification and won/lost Stage; Estimate supplies issue/delivery/exact-revision acceptance; Job supplies authorized work/fulfillment; Invoice supplies document truth; valid net Payments supply collection. Preserve distinct amounts and temporal meaning. Manual/external Payment is valid without processor integration.
- Consumers do not mutate source lifecycle, infer Payment from Invoice/acceptance, or turn a tag/AI assertion into a financial fact. Corrections/reversals remain attributable; a dated snapshot must not masquerade as current truth after correction.
- Consume only authorized detail. Planned Search measurement access does not grant sensitive Revenue access: Feature 51 requires `revenue.view` for sensitive Revenue fields, a planned capability not present in today's permission registry. Preserve that boundary when its owner specifies field-level outputs.
- Missing Revenue capability/data lowers measurement depth; do not fabricate zero revenue, fake Leads, or require Revenue to exist for Search visibility/fulfillment. Evidence-health/measurement readiness rules still apply.
- **Extension / gate:** owner-published queries, approved immutable references/snapshots, and explicit source links are permitted. New exported facts, permissions, correction semantics, payloads, or cross-lane persistence require review before consumer reliance. No Search-owned Payment/Lead replicas as source records.
- **Tests:** T11.

## SC-15 — Search strategy, evidence, and measurement contribution

**GROWTH/SEARCH-OWNED, SHARED-CONSUMED · P. Owner:** Search Operations. **Consumers:** Search fulfillment, Smart Blog references, shared Findings/Interventions/MeasurementReview. [E07] [E18] [E19]

- **Input → output:** shared property/page identities, deliberate targeting/policies, provider observations → SearchTarget/strategy, normalized dated evidence, coverage assessments and Search measurement contributions. Search owns these, not shared property identity or Revenue outcomes.
- **D1:** SearchKeyword identity is exactly `propertyId + normalizedQuery + languageCode`. Geographic/provider market context belongs to SearchTarget and dated measurement/evidence; observations from different markets are not interchangeable. Exact evidence columns remain an owning-feature detail, not permission to discard context.
- Separate topic, query cluster, target, intended target-page assignment/history, and observed ranking URL. Preserve organic rank, local grid, GSC averages, technical, local/authority, and business evidence as distinct sources. Collection failure is not a negative rank/performance result; compare compatible contexts.
- Fulfillment policies/cycles prove scope delivery; coverage is versioned inference; health summaries are rebuildable; MeasurementReview owns outcome assessment. Snapshot historical obligations/policy evidence; no editable shared “SEO success” field.
- **Extension / gate:** Search-local collection/rule details remain local within approved feature scope. Shared identity meaning, page normalization, exported evidence/provenance, Interventions or Revenue handoffs require affected-owner review. No copied service/page catalog or attribution system that creates commercial truth.
- **Tests:** T09, T10, T11.

## SC-16 — Delegated action authority

**Explicit mixed ownership · P.** Robin owns its horizontal resident core/runtime/policy
and evidence. Revenue owns the first adapter/integration, source signals, authorized domain
context, business commands and business-result verification; it does not own Robin itself.
Revenue also owns Quick Capture. Search retains its optimization policy/actions. Shared
authorization, knowledge, audit, events, jobs, Notification, media and integrations retain
their respective owners. Domain-private integration/policy behavior can remain lane-local;
the Robin core boundary is not classified wholesale as Revenue-local or shared platform
infrastructure. Future cross-Studio Robin adapters remain deferred/not contracted. [E01] [E14] [E19]

- **Robin-domain contract:** Signals → Authorized Context → Approved Capabilities →
  Verification. Establish the narrow Revenue integration only where its real approved
  services exist. Signals retain producer ownership; context is purpose/property scoped;
  capabilities are implemented typed owning-service operations; verification uses the
  owner's evidence and recovery rules. Exact exported contracts still require review before
  independent reliance. No generic cross-Studio registry/framework is established.
- **Robin-owned state boundary:** configuration, runs, actions/proposals, approvals/takeover
  state, Shadow evidence, knowledge/configuration references, reasoning/action provenance
  and verification evidence. Never duplicate live domain truth. Schema, snapshots,
  retention and knowledge lifecycle remain F12/F13 design; shared audit/jobs/Notification
  are not Robin-owned replacements.
- **Execution and human controls:** Robin authority configuration cannot grant platform
  permissions. Revalidate authority, policy and preconditions at execution, including access,
  consent and takeover. Approval binds to the specific action/scope; material changes need
  a new decision. Takeover stops competing pending Robin work within its approved scope.
  Reconcile unknown external results before retry; verify effects through their owner and
  preserve partial results without repeating completed effects. Exact expiry/concurrency,
  release/in-flight handling and notification fallback remain feature architecture work.

- **Input → output:** proposed typed action → validation, property/capability, operating policy and business checks → owning-service result plus appropriate audit/history. AI never grants permissions or directly writes records/calls provider SDKs.
- Robin Off/Approval Required/Automatic are distinct from its Shadow evaluation overlay. Shadow suppresses business mutations, customer sends and intended handoff notices while retaining evaluation evidence. Quick Capture always shows before/after proposals and requires explicit confirmation; no automatic mode.
- Search AUTO_GUARDED requires supported BTLS-managed site, declared capability, allowlist, permitting property policy, deterministic validation, idempotency, traceability, conflict checks, required rollback/reversal, and no human strategy decision. APPROVAL_REQUIRED/HUMAN_ONLY/UNSUPPORTED remain distinct. Adapter capability alone grants nothing.
- Successful Search execution creates/links shared Intervention under D2. Publishing still follows Smart Blog editorial authority; source-domain authorization never moves to Robin/Search because they orchestrate it.
- **Extension / gate:** local prompts/explanations may change within approved behavior. New executable tool, shared service effect, authority mode, automatic operation allowlist, provenance path, or provider capability needs its owning approval and affected-contract review. Call-attribution metadata never authorizes Robin phone-call content ingestion.
- **Tests:** T12 and the service's own contract tests. No generalized automation/task/handoff engine is introduced by this boundary.

## Producer → consumer handoffs

All cross-domain relationships below are architectural contracts, mostly planned. Required references describe information that must be preserved **when that handoff is used**, not mandatory new fields on every model. Publish exact validated query/DTO/event shapes through the gate before independently implementing producer and consumer. Do not choose a new event bus, API service, or database view merely to fill this table.

| Producer → consumer | Truth/references required | Allowed use | Forbidden inference / absent capability |
|---|---|---|---|
| Revenue Lead → Growth/Search | Authorized propertyId, Lead ID, owner-defined Stage/outcome and relevant time; existing source/landing-page evidence and real links when available | Qualified/won/lost counts and supported source associations | One inquiry equals one Customer; unknown source equals organic; missing Revenue equals zero Leads. |
| Revenue ↔ Robin (planned 1.0 integration) | Signals; authorized Customer/Contact/Lead/Conversation context; approved implemented capabilities; owner-defined verification, with property/source/result references | Robin proposes and orchestrates; Revenue services validate and mutate their own truth; Robin records its evidence | No foreign writes, platform permission grants, invented business effects or future tools. This conceptual contract freezes no DTO, event/job name or capability ID. |
| Revenue Estimate → Growth/Search | Property, Estimate ID, relevant revision/acceptance evidence IDs and time; amount/unit/currency if exposed | Distinguish issued/delivered/accepted proposals | Sent/viewed means accepted, accepted value means collected, or superseded revision is current. Unavailable evidence remains unavailable. |
| Revenue Job → Growth/Search | Property, Job ID, actual upstream references if present, authorization/fulfillment fact and time | Count supported authorized/completed work | JobExecution success means Job completion; every Job requires Estimate or visit. Do not invent missing links. |
| Revenue Invoice → Growth/Search | Property, Invoice ID, document lifecycle and relevant time; related records and amount basis if exposed | Invoice context and owner-calculated balances | Issued value is collected revenue. Distinguish missing/denied from a true zero balance. |
| Revenue Payment → Growth/Search/MeasurementReview | Property, Payment/source IDs or traceable aggregate provenance, period, receipt/reversal/correction basis, amount unit/currency, actual Invoice/Lead links where present | Authorized net collected revenue and explicitly supported attribution | Search creates Payment truth, requires a processor ID, loses reversals, double counts joins, or claims unsupported causation. |
| Shared property knowledge → both lanes | Property, shared PropertyService/BusinessLocation/ServiceArea IDs and owner lifecycle | Reference business vocabulary, attach lane-owned strategy/commercial context | Revenue produces PropertyService as its private data; Search recreates it if Revenue feature is unavailable. Shared substrate stands independently. |
| Website data/Smart Blog → Search and authorized Revenue attribution use | Property, WebsitePage/ContentAsset/Publication IDs where available; normalized source/URL/period evidence with provenance | Match compatible web evidence to captured Revenue source facts | Search directly rewrites Lead source; page discovery gates intake; a preferred target page is the observed landing page. No symmetric mutation handoff is established. |
| Diagnostics → Work Management | Property, Finding ID, definition version, evidence and confirmed disposition, selected template/version | Create governed work and review progression | Revenue operational exception becomes a Growth Finding. Missing work implementation is not permission to clone it. |
| Work Management ↔ Search | Property, Intervention/provenance, SearchInterventionScope references, comparison windows/evidence | Record actual change, supply Search evidence to shared MeasurementReview | Completed work/fulfilled cycle proves improvement. D2 applies to normal and approved alternative provenance. |

**Graceful degradation:** use available authorized visibility/web evidence; label missing Revenue/outcome linkage or insufficient comparison evidence. Do not block Search scope delivery solely because optional Revenue outcomes are absent. Do not imply a fulfilled cycle produced a measured business result. An unauthorized caller receives only the safe unavailable/denied result permitted by the owning surface, not hidden financial counts.

## Shared Change Gate

This is canonical shared-change governance, approved on adoption. It does not claim that a review automation already exists.

**Continue locally** when a change remains within an approved feature and owner, preserves exported contracts and invariants, and needs no new cross-domain reliance: private helpers, local UI, internal query optimization with unchanged results/security, domain-private tests, or an exact already-approved extension point. Multiple consumers or editing a central file alone does not require a fresh product decision.

**STOP the affected shared change → raise a Shared Change Proposal → wait for architectural resolution** when it alters or first establishes ownership/meaning, lifecycle responsibility, identifiers/normalization/uniqueness, tenancy/capabilities/RLS/security, shared schema/relationships/deletion effects, provider interface, event/API payload meaning/version acceptance, idempotency/retry/failure handling, or a handoff; creates an overlapping implementation; or first establishes an uncontracted shared producer/consumer surface. Additive changes can break strict consumers and therefore are not exempt merely because they add a field.

The proposal must state:

- Requested change and why it is needed.
- Owning contract and affected lanes/domain owners.
- Affected models, interfaces, events, and consumers.
- Schema, API/event, and migration impact, including “none” where applicable.
- Backward compatibility, existing records/in-flight work, and historical interpretation impact.
- Contract-test impact and proposed evidence of compatibility.
- Smallest recommended resolution and any genuine unresolved product choice.

The product owner or explicitly delegated architecture authority resolves genuine ownership/policy conflicts, informed by the contract owner and affected consumers. An agent cannot approve its own conflicting contract merely because it is implementing first. Record the resolution in governing context and update affected contract/tests before consumers depend on it. Existing approved feature decisions need not be re-approved when faithfully implementing their explicit extension.

Stop only the affected work; unrelated authorized local work may continue. Do not weaken tests, rewrite applied migrations, broaden privileges, or manufacture records to bypass the gate. This document defines review scope, not a migration, Git, worktree, sequencing, or parallel-execution protocol.

### 2026-10-02 — Robin architecture adoption: approved resolution

**Authority and status:** The product owner approved O1–O7, the repository-aware
reconciliation report, and controlled documentation adoption. This records that decision;
it is not implementation-agent approval of a conflicting contract. Evidence baseline:
canonical `main` at `7d211e2f9e6ee77755031674a2826a951ec65b10`.

**Requested change and reason:** Give Robin an explicit horizontal resident identity while
keeping Robin 1.0 Revenue-first. Reconcile product placement, SC-16's blanket LANE-LOCAL
classification, the AI provider boundary, human controls, and required UI/onboarding
surfaces without expanding the MVP.

**Owning contracts and affected owners:** SC-16 governs Robin delegated-action boundaries;
SC-09 governs the planned AI gateway and initial OpenAI adapter. Robin owns its
core/runtime/policy and evidence. Revenue owns its adapter/integration, source signals,
authorized domain context, business commands and business-result verification. Shared
authorization, knowledge, audit, events, jobs, Notification, media and integrations retain
their existing owners under SC-01–SC-10. Growth/Search and Work Management ownership is
unchanged; future Robin adapters for those domains remain deferred/not contracted.

**Approved resolution:**

- Robin is a first-class horizontal resident subsystem of Command Center, not a fourth
  Studio. Revenue is its first implemented integration in the planned build, not its
  owner; no Robin integration is implemented at this evidence baseline.
- The conceptual domain contract is **Signals → Authorized Context → Approved Capabilities
  → Verification**, established only for a real approved integration. This authorizes no
  generic cross-Studio framework or unrestricted access.
- Robin may own configuration, runs, actions/proposals, approvals/takeover state, Shadow
  evidence, knowledge/configuration references, reasoning/action provenance and
  verification evidence. It must not duplicate live domain truth.
- Shared integrations owns the narrow BTLS `AIModelGateway` boundary and initial OpenAI
  adapter. No exact interface, model choice or multi-provider routing is selected here.
- Revalidate authority, policy and preconditions before execution. Approval binds to the
  specific action/scope. Takeover stops competing pending Robin work within its approved
  scope. Unknown external outcomes require reconciliation before retry.
- Robin 1.0 uses contextual Revenue surfaces with activity, approval and handoff visibility;
  a dedicated `/robin` workspace/navigation is not required. No normalized cross-Studio
  Attention system or generalized HandoffPackage is adopted.
- Client enablement is BTLS-assisted. Management/client approvers supply and approve
  knowledge and authority configuration, reusing SOPs/forms/spreadsheets/examples as
  inputs. Shadow-ready and live-ready are separate concepts; authority is capability-specific.
- Preserve F12 configuration/knowledge/evaluation, F13 live non-scheduling response,
  F14 scheduling integration and initial milestone, and F23 bounded Revenue expansion.
  F12 must supply the minimum reasoning/evidence foundation for its own Shadow gate;
  no reverse dependency on F13 or Robin 2.0 prerequisite is created.

**Affected artifacts and consumers:** Root architecture and the subordinate Robin detail,
AGENTS, overview, canonical terminology/contracts, F12/F13/F14/F23 descriptions, relevant
code/library/UI standards, supporting dependency analysis, tracker and memory. Planned
RobinConfiguration/BusinessKnowledgePack/RobinRun/RobinAction and gateway concepts are
affected at the architectural level only. Future Revenue consumers still need exact
approved service, event, job, capability and Notification contracts before implementation.

**Implementation and compatibility impact:** Documentation-only adoption now. No schema,
migration, runtime, API, event, job, capability registration or provider implementation
change; no package installation. Existing records, in-flight work, provider uncertainty
handling and historical evidence are unchanged. No foreign-domain mutation rule changes,
cross-Studio Robin substrate in MVP, or automatic parallel-development authorization.
Existing serial governance, feature numbering, D1/D2 and all MVP deferrals remain binding.

**Verification and remaining design:** Check documentation/ownership/authority consistency
and unchanged implementation files now. Future T12 and owning-service tests must cover
execution-time revocation/policy/precondition changes, action-bound approval, scoped
takeover, unknown-result reconciliation, owner-verified/partial results, tenant denial and
Shadow suppression. Exact schema, retention/deletion/redaction, snapshots, knowledge
lifecycle, approval expiry/concurrency, takeover release/in-flight behavior, gateway
signature/model, capability payloads, event/job names, evaluation thresholds, Shadow/OFF
semantics and notification recipient/fallback mechanics remain F12/F13 architecture work.
Remaining PROPOSED passages in the Robin source are not approved by this resolution.

## Minimum contract-test obligations

Reuse current suites rather than creating a parallel testing framework. I means relevant coverage exists, not that every future obligation is tested. P tests are required when their first owning/consuming feature arrives; they are not implemented by this document.

| ID / status | Protected invariant and why both lanes care | Run when |
|---|---|---|
| T01 — I | Cross-property/account/customer denial; suspension/revocation; capability/SQL parity; narrower Operator exceptions; no new browser foundation access. Every lane shares the security boundary. | Any auth/RLS/capability or shared relation change; cross-tenant case for each new consuming workflow. |
| T02 — I | Atomic mutation/audit, stale revision rejection, creation replay/fingerprint conflicts, no automatic person merge or workforce access grant. Prevent different lanes interpreting identity/replay differently. | Foundation/audit/replay changes and new reuse of those services. |
| T03 — I, extend | One PropertyService identity/hierarchy, normalization/uniqueness, same-property references; independent commercial/Search extensions. Prevent competing catalogs. | Shared vocabulary/service changes and first Pricebook/Search consumers. |
| T04 — I, extend | Verified immutable bytes, private/sensitive denial, explicit relationship access, removal ≠ deletion, cleanup fencing, durable evidence retention. Protect both lanes' assets. | Storage/policy/cleanup change and each new attachment/document consumer. |
| T05 — I, extend | Registered versions/invalid payload denial, source/outbox consistency, replay-safe consumers, producer-consumer compatibility. Prevent invisible contract drift. | Event producer/schema/registry/consumer changes, including additive ones. |
| T06 — I, extend | Same execution identity, attempt limits, interrupted recovery and late-worker fencing; authorized allowlisted manual retry. Prevent duplicate effects. | Job handler/retry/operations changes; new manual replay support. |
| T07 — I, extend | Recipient/property-scoped notice dedup/read, current subject authorization, no arbitrary URLs, no business mutation on read. Prevent cross-lane notice leakage. | Source/subject/resolver/read-policy change. |
| T08 — I transport; P business integration | Duplicate sends return only accepted outcome; uncertainty does not resend; fingerprint conflicts; callback origin/correlation/claim fencing; business consent and delivery remain separate. | Adapter/dispatch/webhook/sender changes; each first domain send/delivery workflow. |
| T09 — P | Shared page identity/normalization, healthy vs missing evidence, D1 identity with distinct market observations, compatible periods/grids. Prevent false joins and false performance claims. | Website/Search data surface changes and first cross-domain consumers. |
| T10 — P | Domain diagnostic + shared review; template-version lineage; D2's normal/two alternative paths; reject missing/ungoverned provenance; scoped fleet history; completed work ≠ improved outcome. | Finding/Work Management/provenance/measurement changes or new consumers. |
| T11 — P | Owner-only Revenue mutations; exact-revision acceptance; net Payment correction/reversal basis; no aggregate double counting; sensitive-field denial; unavailable ≠ zero; source joins retain provenance. | Outcome export/consumer/permission/attribution changes. |
| T12 — P | Robin/Quick Capture/Search preserve owning-service authority; Shadow suppresses effects; AUTO_GUARDED rejects missing safeguards; no arbitrary ticketless execution. Robin additionally tests execution-time revocation/policy/preconditions, specific-action approval, scoped takeover, unknown-result reconciliation, owner verification/partial results and tenant denial. | Tool/automation class/policy/shared effect changes; exact implementation contracts remain owning-feature work. |

Run affected fast tests during work and applicable database integration tests when persistence/security/durable behavior changes. At the owning feature's exit gate run the existing AGENTS-required suite, plus these affected contract cases; use browser tests for changed critical journeys. Do not broaden testing for unrelated private edits or create placeholder passing tests for unimplemented models.

## Explicitly uncontracted details

Exact future Revenue outcome DTOs/events/query names, new capability field projections, Intervention persistence shape, Search market-context columns, provider selections, and AUTO_GUARDED allowlists are not fixed by this contract. Their semantic owners and invariants are fixed. The first producer/consumer feature must establish the exact shared surface through the gate before independent reliance. Deferred connected mailboxes, voice/transcription/Job Brief, and integrated payment processing remain deferred; no parallel-development preparation step authorizes them.

## Evidence

Pinned links establish this contract's audited evidence baseline. Always reread current governing files before implementation; implementation names below are current evidence, not a promise that all future surfaces already exist.

<!-- evidence-index -->
- **E01 — Authority and change stops:** [AGENTS.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/AGENTS.md); [context/code-standards.md#L372](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/code-standards.md#L372)
- **E02 — Canonical terminology, D1 and D2:** [context/shared/ubiquitous-language.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/shared/ubiquitous-language.md)
- **E03 — Implemented identity, constraints and source models:** [prisma/schema.prisma](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/prisma/schema.prisma); [prisma/migrations/20260914120000_revenue_foundation/migration.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/prisma/migrations/20260914120000_revenue_foundation/migration.sql)
- **E04 — Authorization, operation scope and foundation security:** [src/server/auth/session.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/auth/session.ts); [src/server/auth/permissions.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/auth/permissions.ts); [src/server/properties/property-context.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/property-context.ts); [src/server/properties/foundation-database.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/foundation-database.ts); [supabase/security-migrations/20260914180000_revenue_foundation_server_access.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/supabase/security-migrations/20260914180000_revenue_foundation_server_access.sql)
- **E05 — Service/audit/replay boundaries:** [context/code-standards.md#L456](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/code-standards.md#L456); [src/server/properties/foundation-database.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/foundation-database.ts); [src/server/properties/creation-replay.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/creation-replay.ts)
- **E06 — Shared offered-service implementation:** [src/server/properties/property-services.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/property-services.ts); [context/feature-08-plan.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/feature-08-plan.md); [tests/integration/revenue-foundation.test.ts#L323](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/tests/integration/revenue-foundation.test.ts#L323)
- **E07 — Search ownership and shared business vocabulary:** [context/architecture.md#L2247](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2247); [context/architecture.md#L2721](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2721)
- **E08 — Revenue foundation constraints and services:** [context/feature-08-plan.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/feature-08-plan.md); [prisma/migrations/20260914120000_revenue_foundation/migration.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/prisma/migrations/20260914120000_revenue_foundation/migration.sql); [supabase/security-migrations/20260914123000_employee_link_property_guard.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/supabase/security-migrations/20260914123000_employee_link_property_guard.sql); [src/features/revenue-operations/services/workforce-settings.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/features/revenue-operations/services/workforce-settings.ts)
- **E09 — Media lifecycle, access and cleanup:** [context/architecture.md#L1239](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1239); [src/server/storage/media-lifecycle.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/storage/media-lifecycle.ts); [src/server/storage/media-library-boundary.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/storage/media-library-boundary.ts); [src/server/storage/media-access.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/storage/media-access.ts); [src/server/storage/media-cleanup.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/storage/media-cleanup.ts)
- **E10 — Event registry, outbox and replay:** [src/server/events/internal-event-registry.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/events/internal-event-registry.ts); [src/server/events/event-outbox.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/events/event-outbox.ts); [context/architecture.md#L1363](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1363); [tests/unit/server/feature-07-contracts.test.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/tests/unit/server/feature-07-contracts.test.ts)
- **E11 — Execution and operations contracts:** [src/server/jobs/job-contracts.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/jobs/job-contracts.ts); [src/server/jobs/job-execution.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/jobs/job-execution.ts); [src/server/operations/operations.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/operations/operations.ts); [tests/integration/job-execution-recovery.test.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/tests/integration/job-execution-recovery.test.ts); [tests/integration/operations-rls.test.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/tests/integration/operations-rls.test.ts)
- **E12 — Recipient notifications and subject resolution:** [src/server/notifications/notification-contracts.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/notifications/notification-contracts.ts); [src/server/notifications/notifications.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/notifications/notifications.ts); [tests/integration/notification-context.test.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/tests/integration/notification-context.test.ts)
- **E13 — Provider boundaries, evidence and write security:** [context/architecture.md#L1276](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1276); [src/server/integrations/provider-dispatch.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/integrations/provider-dispatch.ts); [src/server/integrations/email/transactional-email-provider.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/integrations/email/transactional-email-provider.ts); [src/server/integrations/sms/sms-provider.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/integrations/sms/sms-provider.ts); [src/server/integrations/webhooks/webhook-receipts.ts](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/integrations/webhooks/webhook-receipts.ts); [supabase/security-migrations/20260911121000_provider_infrastructure_server_writes.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/supabase/security-migrations/20260911121000_provider_infrastructure_server_writes.sql); [prisma/migrations/20260907120000_events_jobs_notifications_operational_records/migration.sql](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/prisma/migrations/20260907120000_events_jobs_notifications_operational_records/migration.sql)
- **E14 — Revenue source-domain lifecycle and communication truth:** [context/architecture.md#L1611](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1611); [context/architecture.md#L1979](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1979)
- **E15 — Web data, editorial ownership and attribution joining:** [context/architecture.md#L1512](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1512); [context/architecture.md#L3817](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L3817); [context/build-plan.md#L1066](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/build-plan.md#L1066)
- **E16 — Shared diagnostic record and domain rule concerns:** [context/architecture.md#L2247](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2247); [context/architecture.md#L3777](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L3777); [context/build-plan.md#L1153](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/build-plan.md#L1153)
- **E17 — Shared Work Management and approved provenance:** [context/architecture.md#L5081](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L5081); [context/shared/ubiquitous-language.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/shared/ubiquitous-language.md); [context/build-plan.md#L1314](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/build-plan.md#L1314)
- **E18 — Revenue outcome consumption, measurement and authorization:** [context/architecture.md#L3894](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L3894); [context/architecture.md#L4426](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L4426); [context/build-plan.md#L3488](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/build-plan.md#L3488)
- **E19 — Search strategy, execution and deferred decisions:** [context/architecture.md#L2543](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2543); [context/architecture.md#L4087](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L4087); [context/architecture.md#L5023](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L5023)
- **E20 — Implementation/canonicalization status and recorded verification:** [context/progress-tracker.md#L11](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/progress-tracker.md#L11); [context/feature-08-completion.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/feature-08-completion.md); [memory.md](https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/memory.md)

[E01]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/AGENTS.md
[E02]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/shared/ubiquitous-language.md
[E03]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/prisma/schema.prisma
[E04]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/auth/session.ts
[E05]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/code-standards.md#L456
[E06]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/properties/property-services.ts
[E07]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2247
[E08]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/feature-08-plan.md
[E09]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1239
[E10]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/events/internal-event-registry.ts
[E11]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/jobs/job-contracts.ts
[E12]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/src/server/notifications/notification-contracts.ts
[E13]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1276
[E14]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1611
[E15]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L1512
[E16]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2247
[E17]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L5081
[E18]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L3894
[E19]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/architecture.md#L2543
[E20]: https://github.com/saybenn/BTLS-Command-Center/blob/db7f6d61bf21bc331a055548fea7559b8486f5c1/context/progress-tracker.md#L11
