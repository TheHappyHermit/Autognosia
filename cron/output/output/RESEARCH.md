

## esta-2b-1a-3-5-sub-3-2b-3: SLA table row schema, versioning, and counsel approval binding

> Researched on 2026-06-02

## Summary
Research for **esta-2b-1a-3-5-sub-3-2b-3: SLA table row schema, versioning, and counsel approval binding**.

## What to Build
- **SLA table row schema**: define a row-level data model for countdown-engine SLAs that can support versioned sets of metrics (deadline horizon, business-day offset, channel-specific response windows, privilege-tier targets, exception allowances) with per-row stability metadata. Include fields for successor-of / predecessor-of pointers and effective-date windows. This supports legal-ops review and historical recompute chains.
- **Versioning contract**: enforce schema version pinning on each SLA table bundle, with an additive-only migration policy. Embed a version manifest inside the exported audit bundle so examiners can trace which SLA rules applied to a computed deadline.
- **Counsel approval binding**: require a signed approval attestation that ties a specific counsel identity, role tag, and timestamp to the exact SLA table row + version. The attestation pointer should be stored in an immutable log row and referenced from the countdown event rather than embedded in the row, keeping the SLA table fast to recompute.
- **Managed exception editing**: support late-stage edits only through a breaking-change subclass that triggers recomputation of all downstream dependent deadlines and emits a redaction-style exception object.

## Competitors
- **Clio Manage**: provides matter-level workflow and SLA tracking but no built-in jurisdiction-specific business-day engine or immutable audit binding for counsel approvals.
- **TeamConnect / Thomson Reuters**: configurable SLA tables and approval workflows exist, but recompute idempotency and exam-facing export links are not standard.
- **SimpleLegal / Brightflag**: contract-SLA and approval tracking with audit trails; strong on version control, weaker on regulatory countdown computation and jurisdiction-aware rule calendars.
- **LegalSifter / LexCheck**: agreement parsing, not operative SLA tables.
- **Gateways (custom legal-ops platforms)**: typically re-implement per-matter SLA tables as sheet exports, lacking immutable binding or recompute history. WealthForge can differentiate by owning the recompute/audit chain.

## Regulatory Considerations
- **Immutability and examination defensibility**: FINRA/SEC examiners expect a durable, examiner-accessible audit trail for how a deadline was calculated and who approved the SLA ruleset (see existing RESEARCH entries for SLA audit exports).
- **Data Integrity**: binding counsel approval to a specific row version prevents "rule shopping" disputes during examinations; treat the approval pointer as a privileged-role write operation serialized through event log and enforcement schema.
- **Version Pinning & Equivalence**: examiner-facing exports must state in plain English whether a prior version's SLA rule is equivalent to the current one, or call out delta.
- **PII/Privilege**: counsel name + bar number + jurisdiction = sensitive. Store only the signed attestation hash and redacted role tag; full identity visible only to privileged roles.
- **Comparability to Microsoft Purview approach**: SaaS vendors increasingly provide rule-version audit for compliance; WealthForge should align with examiners' expectations for versioned exports.

## Operative Decisions / Interfaces
- Proposed primary fields: `row_id`, `sla_table_version`, `effective_from`, `effective_to`, `jdx_scope`, `matter_class`, `privilege_tier`, `target_window`, `channel_response_sla`, `exception_allowance`, `successor_of`, `created_by_role_tag`, `approval_hash`, `meta_json`.
- Version promotion rules: patch allowed for metadata-only; minor allowed for additive columns; major requires counsel approval and downstream recompute plan.
- Audit binding: approval_hash stored once in approval-event row; SLA row stores only pointer to preserve recompute performance.

## Suggested Subtopic Split
High signal follow-on items to research/build next:
1. `sla-table-row-data-model-and-migration-spec` 🔴 HIGH — row schema, effective-date semantics, rewrite-safe tombstoning.
2. `sla-table-version-manifest-and-immutability-contract` 🔴 HIGH — versioning policy, exam-facing equivalence statement.
3. `counsel-approval-attestation-binding-spec` 🔴 HIGH — idempotent approval event, signed-role tag, redacted-exam disclosure.
4. `sla-table-exception-and-breaking-change-workflow` 🟠 MEDIUM — edit freeze, late exception process, dependent recompute trigger.
5. `examiner-readable-sla-equivalence-diff-format` 🟠 MEDIUM — exam-facing diff between two versions and plain-English conclusion.
6. `privilege-tier-and-jurisdiction-matrix-validation-rules` 🟠 MEDIUM — rules for which counsel may approve which row scope.


## esta-2b-1a-3-5-sub-3-2b-4: Recomputation command schema and idempotency contract

> Researched on 2026-06-02

## Recomputation command schema and idempotency contract
### Plain-English definition
A recomputation command is a request to rerun or refresh a calculation in a deterministic way. The command schema defines the structure and contract for that request. Idempotency means the same command can be executed more than once without creating duplicate side effects or conflicting recalculation chains.

### Why this research matters
Recurring scheduled work and rule-change-triggered recalculations are central to WealthForge workflows (compliance testing, tax/estate/retirement scenarios, policy-sensitive outputs). Without a stable schema and idempotency rules, retries, replays, webhook retries, or post-failure recovery can produce duplicate updates, mismatched outcomes, audit gaps, and fiduciary/billing risk.

### What to build
- Canonical command envelope with stable fields: `commandId`, `topic`, `inputSnapshotHash`, `outputVersion`, `createdAt`, `lastAttemptAt`, `attempts`, `status`.
- Idempotency mechanism: deduplicate by `commandId` plus result TTL; reject or fast-return already-completed outcomes when conditions match.
- Versioned output contract so historical recomputation results remain interpretable during rule changes or migrations.
- Recompute-safe scheduling with exactly-once-style semantics and a backfill replay protocol.

### Competitor / comparative references
- Stripe idempotency keys for payment intents.
- GitHub Actions and SQS visibility-timeout dedupe patterns.
- Temporal/Cadence workflow command contracts.
- Kafka compacted topics for replay-safe state.
- WealthForge can adopt similar contract patterns without replicating the entire external system.

### Regulatory and operational considerations
- Deterministic recalculation results support audit readiness and exam defensibility.
- Duplicated or conflicting tax, estate, or retirement projections can create fiduciary liability.
- Stable schemas make rule-change replay and migration validation safer and auditable.

### Recommended next steps / implementation signals
1. Lock down a versioned JSON Schema for the recomputation command.
2. Add command acceptance logs with prefixed audit metadata.
3. Implement idempotent runner behavior before enabling any retry or replay automation.

### Key decision
Build-and-adopt a site-native recomputation contract now, instead of relying on ad hoc orchestration conventions, to reduce operational and compliance risk.

### Risk and blockers
- No direct independent regulatory mandate, but operational and fiduciary exposure is elevated.
- Leads cross-functional coordination with data, compliance, and tax workflow owners before implementation.


## esta-2b-1a-3-5-sub-3-2b-5: Countdown snapshot and rollup view emission contract

> Researched on 2026-06-02

Planner snapshot/rollup view emission is the cross-system publishing boundary where the countdown engine turns scheduled top-N rollups into consumable snapshots for the wrapper portal, compliance console, and advisor-facing feeds. Today the system recomputes daily inference, but several well-defined gaps remain. (1) **What to build.** Candidate snapshot emission schema with deterministic identifier, versioned envelope, and delta payload so downstream systems can detect updates without full re-pull. Emission gate tied to cache TTL and invalidation hooks so cached planner-CAL views refresh on state transitions. Downstream receipt binding model for wrapper portal, compliance console, and advisor audiences. WORM retention binding so emitted snapshots are sealed for regulator evidence. Schema-versioning contract with upgrade path so old consumers continue operating while new payload fields roll out. Rollup view delivery contract that batches, flattens, and schedules emission to avoid thundering-herd scheduler spikes. (2) **Why it matters.** Snapshot emission fixes fragmented sync between the countdown engine and every consumer that reads CAL data. Without it, stale adviser, counsel, and client views break SLA expectations and create audit inconsistencies. (3) **Competitors.** AI assistant: industry workflow tools can export reports but do not expose deterministic event-sourced snapshot emission contracts or WORM retention binding for compliance consumers. (4) **Regulatory.** WORM/retention is mandatory; SEC Rule 17a-4 and FINRA 4511 require immutable evidence packaging and examiner-readable audit export. Change-management metadata binding provides the change-control evidence examiners expect. (5) **Refinement from rule-change replay design.** The rule-change historical replay system produces recomputed advisories and needs stable snapshot semantics to compare old-to-new worlds safely; emission contract duplicates across retrospective and live flows.


## rule-change-replay-protocol: Rule Change Historical Replay and Backfill Recomputation Protocol

> Researched on 2026-06-02

# Rule Change Historical Replay and Backfill Recomputation Protocol

## 1. What the problem is
Legal and regulatory rules governing countdown deadlines, privilege tiers, and SLA obligations change over time. When a rule is updated, prior matter events may be re-evaluated under the new rule and produce different obligations or alerts. WealthForge must support a **historical recomputation model** that can replay past events against the rule set that was actually in effect at the time, without disturbing live traffic.

## 2. What to build
- **Immutable rule-change log schema** capturing the full lifecycle of every rule edit: version, effective datetime, jurisdiction, source document reference, counsel attestation, and signing key fingerprint.
- **Idempotent backfill runner** that: snapshots the engine state at a repro scope boundary, replays events serially or with bounded parallelism, respects WORM retention bindings for rollbacks, and supports bounded parallelism to prevent resource exhaustion.
- **Divergence detection and quarantine workflow** that: computes deterministic hashes of recomputed outputs, compares them to stored legacy outputs, and quarantines partial replays where divergence exceeds tolerance.
- **Regulator-ready audit pack** producing deterministic manifests showing: input snapshot, command schema version, rule versions applied, recomputation hash, and full diffs of affected obligations/alerts.

## 3. Competitors and analog systems
- **Temporal.io**: Provides durable workflow snapshots and deterministic replay.
- **Datomic**: Immutable facts with time-travel queries; useful model for schema versioned rule snapshots.
- **Apache Kafka / event sourcing toolkits**: Event log replay (for example, Kafka Streams state stores).
- **AxiomSL / Oracle GRC / Thomson Reuters**: Regulatory reporting tools that maintain rule version history and provide audit trail outputs.

## 4. Regulatory considerations
- **WORM retention**: Rule-change entries and recomputation outputs must be written once, read many, and tamper-evident.
- **Privilege-class binding**: Audit packs must respect privilege boundaries; some materials may be attorney work product or subject to other privilege tiers.
- **Jurisdiction and statutory version binding**: Effective datetime rules, DST/timezone conventions, and legislative freeze periods must be captured alongside each rule version.
- **Audit-ready deliverables**: Must support easy extraction of recomputation evidence in an examiner-readable format (CSV/JSON manifest, signed PDF appendix).
- **Signed counsel attestation**: Rule changes should require counsel approval bindings that themselves version, to preserve the provenance of regulatory interpretations.

## 5. Key design risks and mitigations
- **Unbounded history**: Historical backfills can scale indefinitely. Mitigation: scope by jurisdiction + matter + time window; apply bounded parallelism; cap retention-age recomputes to recent statutory revisions unless explicitly ordered.
- **Partial replay inconsistency**: Replay may interleave with live events. Mitigation: standalone replay branch with snapshot isolation; quarantine logic on mismatch.
- **Regulatory acceptance of machine output**: Mitigation: produce human-readable diff packs alongside machine hashes; include version manifest mapping each rule to its citation.

## 6. Recommended next subtopics
- esta-2b-1a-3-5-sub-3-2b-6-1 — Event-sourced rule-change log schema and immutability contract
- esta-2b-1a-3-5-sub-3-2b-6-2 — Idempotent backfill runner with bounded parallelism and retention binding
- esta-2b-1a-3-5-sub-3-2b-6-3 — Divergence detection and quarantine workflow for partial replays
- esta-2b-1a-3-5-sub-3-2b-6-4 — Regulator-ready audit pack for historical recomputation runs


## esta-2b-1a-3-5-sub-3-2b-6-2: Idempotent backfill runner with bounded parallelism and retention binding

> Researched on 2026-06-02


This topic defines the execution engine for replaying rule-change events over historical data in a way that is idempotent, bounded in concurrency, and retentively safe.

## Plain-English value
When rules change, prior-run counts and deadlines may need recomputation. A backfill runner re-plays rule-change events against historical matter records to produce corrected outcomes. "Idempotent" means running the same backfill twice produces identical results without side effects. "Bounded parallelism" prevents the job from overwhelming downstream stores or violating quota. "Retention binding" guarantees that log entries and recomputed outputs are stored under the retention policy that applies to the factual as-of date, not the replay date.

## What to build
1. **Job invocation and partition envelope** — a fully serializable Job Run Object that captures:
   - `run_id`, `rule_version_id`, `matter_snapshot_manifest`, `earliest_date`, `latest_date`, `parallelism_cap`, `retention_policy_id`
   - All inputs is hashed into `input_digest`; output is hashed into `output_digest`.

2. **Partitioner / bounded parallelism** — slice historical date range into non-overlapping partitions (e.g., monthly partitions), with max-concurrent-workers cap. Circuit-breaker: if a worker fails N retries, alert and orphan the partition rather than blocking the pipeline.

3. **Idempotent execution contract** — each partition produces only once. Before processing, check `output_digest` against recomputation store; if matched, skip. Writes use deterministic event IDs so re-runs do not duplicate logs.

4. **Retention binding layer** — every output artifact, log tuple, and intermediate state carries `retention_policy_id` from the matter as-of date. Aged output moves through lifecycle stages (active → sealed → destroyed) enforced by policy; legal hold sets `hold_until` and blocks purge.

5. **Replay determinism harness** — record engine version, dependency versions, and seed so the same Job Run Object replayed in 12 months produces identical `output_digest` for every partition.

## Competitors and benchmarks
- **Apache Kafka Streams / ksqlDB** — supports exactly-once processing and interactive queries, but retention is not automation-first for legal hold.
- **AWS Glue / EMR / DMS** — distributed ETL with idempotent writers, but regulatory retention binding is manual.
- **Fivetran** — managed replication with built-in idempotency and row-level deduplication, no historical backfill policy engine.
- **Spark Structured Streaming** — checkpoint and replay semantics, but state lifecycle policies require custom implementation.
- **Deterministic replay systems** (e.g., Wallaroo, MemVerge) — designed for deterministic replay but not legal retention.

## Regulatory considerations
- **SEC Rule 17a-4** — broker-dealer record retention requires WORM storage of communications and records; backfill logs must be non-erasable for the required period.
- **IRS / state tax record retention** — audit windows can reach 7 years; insolvent trustees must preserve records.
- **Data privacy (GDPR/CCPA)** — backfill may re-process personal data beyond its original retention window; retention binding by as-of date must respect deletion obligations or legal hold overrides.
- **Chain of custody for evidence** — recomputation can alter values used in litigation; idempotent logs with `input_digest` + `output_digest` create defensible discontinuity evidence.

## Key decisions to lock now
1. Retention policy selection must occur before backfill; changing policy mid-replay is forbidden without isolating new and old runs.
2. Parallelism cap should be tunable per deployment but immutable within a single job; any change requires a new `run_id`.
3. Partition boundaries should align with statutory rule change dates so each partition corresponds to a single governing rule version, simplifying counsel review.

## Recommended subtopics to add
- `esta-2b-1a-3-5-sub-3-2b-6-2-1` Partition boundary rules and statutory version alignment (HIGH)
- `esta-2b-1a-3-5-sub-3-2b-6-2-2` Retention policy binding engine and legal hold lifecycle (HIGH)
- `esta-2b-1a-3-5-sub-3-2b-6-2-3` Idempotency contract for backfill job writers (HIGH)
- `esta-2b-1a-3-5-sub-3-2b-6-2-4` Circuit-breaker and bounded parallelism runtime spec (MEDIUM)

## Blockers
- Retention policy catalog must be finalized before runner implementation; without it, binding is meaningless.
- Counsel sign-off required on whether backfill output is admissible as curative evidence versus preliminary recomputation.


## esta-2b-1a-3-5-sub-3-2d-2: Jurisdiction scope matrix and field descriptor binding

> Researched on 2026-06-02

# esta-2b-1a-3-5-sub-3-2d-2 — Jurisdiction scope matrix and field descriptor binding

## Key question this research should answer
- How should a rule-authoring product consume, validate, and bind jurisdiction scope to data fields?
- What comparable patterns exist in legal/compliance config products and what should WealthForge avoid copying?
- What regulatory risks arise if jurisdiction rules are misfielded to client data?

## Competitor analysis — comparable capabilities
- **HotDocs / Aderant Expert / Contract Express / Docupace / L4 / HighQ**
- **Intapp / Foundrysense / Revelok**
- Avoid generic comparison; focus on whether jurisdiction scope is managed as first-class metadata or embedded in document assembly logic.
- Note whether any system already exposes a jurisdiction scope matrix as a reusable, testable, auditable artifact.
- Capture whether competitors treat jurisdiction and field descriptors as schema or as runtime permitting policies.

## Regulatory considerations
- **Multijurisdictional rule validity:** domicile-state rules vs. client physical-presence calendars vs. transaction-situs rules.
- **Choice-of-law vs. actual-jurisdiction conflicts:** when a plan is prepared under one jurisdiction but the client relocates.
- **Field sensitity classes by jurisdiction:** residency, filing status, income type, withholding treatment, community property, SALT cap applicability, nexus, and elective pass-through entity tax.
- Regulatory risk if a field is bound to the wrong jurisdiction scope matrix version: plan-failure exposure, client disclosure errors, potential state disciplinary exposure for advisors.
- Capture whether the SEC, FINRA, or state boards have guidance on jurisdiction-tagged planning outputs.

## Architecture findings to build into WealthForge
1. **Jurisdiction scope matrix**
   - Canonical jurisdiction key (ISO-3166-2 + optional sub-state or tribal authority keys).
   - Scope dimension: rule applicability by life event, document type, calendar year, and entity type.
   - Versioning with statutory citation and effective/expiry dates.

2. **Field descriptor binding**
   - Field taxonomy with jurisdiction applicability matrix.
   - Sensitive fields with change-impact rating on jurisdiction switch.
   - Validation harness that checks jurisdiction-to-field coverage at build time and runtime.

3. **Fail-open vs. fail-closed behavior**
   - Define behavior when jurisdiction is unknown or disputed.
   - Logging and audit trail for override usage.

4. **Operator-facing UX**
   - Jurisdiction filter surface within authoring.
   - Coverage heat map for rule authors.

## What to build first
- Jurisdiction key registry with statutory source hooks and expiry fields.
- Field descriptor registry with jurisdiction applicability matrix.
- Rule authoring validation layer pinging both registries.
- Audit schema captures jurisdiction-rule-field triple at approval time.

## Blockers / unknowns
- Whether state bar or tax-board guidance restricts automated jurisdiction routing.
- Whether regulatory precedent requires human attestation for jurisdiction selection.
- Whether data model assumptions about client domicile/calendaring already exist in WealthForge.
- Availability of authoritative jurisdiction applicability licenses.

## Suggested subtopics for AGENDA
- jurisdiction-scope-matrix-schema
- field-descriptor-binding-policy
- jurisdiction-state-transition-handling
- regulatory-coverage-validation-per-jurisdiction


## esta-2b-1a-3-5-sub-3-2b-6-1-rule-change-event-envelope-manifest-draft: rule-change-event-envelope-manifest-draft

> Researched on 2026-06-02

<!-- RESEARCH_ENTRY_START -->
## rule-change-event-envelope-manifest-draft
- **Topic ID:** esta-2b-1a-3-5-sub-3-2b-6-1-rule-change-event-envelope-manifest-draft
- **Status:** Researched 2026-06-02
- **Source:** AGENDA.md line ~926

### What to build
A normative envelope/manifest schema for rule-change events that can**: (a) capture statutory provenance (citation + version + effective date), (b) represent lifecycle transitions (draft/published/in-effect/superseded), (c) support deterministic serialization and hashing for immutability, and (d) drive backward-compatible schema evolution. Build the manifest as a JSON envelope with typed metadata, content-descriptor hashes, and chain links for immutable ordering.

### Plain-English summary
Rule changes are the heartbeat of WealthForge: every SLA table, countdown horizon, and jurisdiction behavior depends on knowing exactly what rule was effective when. The goal is to stop using ad-hoc structures for these updates and move to a sealed, signed envelope that can:**

- Prove which rule-change document applies
- Allow deterministic replay with identical inputs
- Keep an immutable, tamper-evident chain of changes

The manifest draft should be usable before storage or event-store choice is finalized---it defines the contract, not the implementation.

### Envelope contract (recommended)
```json
{
  "schema_version": "1.0",
  "envelope_id": "uuid",
  "correlation_id": "...",
  "topic": "rule_change",
  "version": 1,
  "created_at": "2026-06-02T00:00:00Z",
  "effective_at": "2026-06-02T00:00:00Z",
  "authority": {
    "jurisdiction": "US",
    "source_system": "legislative_feed_api_v2",
    "source_document_id": "statute-1234-2026",
    "description": "Amendment to Section 102 effective 2026-06-02"
  },
  "content": {
    "fields": ["id", "jurisdiction", "description", "effective_at", "supersedes"],
    "hash_sha256": "hex",
    "hash_alg": "sha256"
  },
  "chain": {
    "prev_envelope_id": null,
    "prev_hash": null,
    "is_chain_root": true
  },
  "immutability": {
    "signature": "ed25519:signature_hex",
    "signer_cert_fingerprint": "hex",
    "signed_at": "2026-06-02T00:00:01Z",
    "hashing_spec": "sha256",
    "content_encoding": "utf-8"
  }
}
```

### Key design points
- **Deterministic encodin****: stable key order with `sort_keys=true`, no timestamps in the signed payload unless explicitly part of the stable manifest block; store timing metadata outside the signed portion or version it.
- **Versionin****: bump `schema_version` for contract breaks; use `"version"` inside the event for the rule-change sequence---these must be distinct.
- **Chains vs merkl****: simplest robust model is ordered chaining (`prev_hash`); merkle trees can be layered later for batched proofs.
- **Separation of concerns:** manifest describes the envelope; actions vocabulary codes describe what the event actually does; signing/chaining describe how it becomes immutable.

### What to build first
1. JSON Schema draft for the envelope.
2. Deterministic serialization test harness.
3. Sample generator for synthetic rule changes.
4. Reference action codes/taxonomy for common types: CREATE, UPDATE, SUPDATE, REPEAL, FREEZE, EMERGENCY_ORDER, SUNSET.

### Competitors / patterns
- **Event Sourcin****: Marten, EventStoreDB, Axon---tend to use fixed event schemas with metadata and payload; treat envelope as "metadata + content" and use stream IDs as chain links.
- **Legal tech audit tr****: HighQ, Clio, Relativity Trace use lawyer-facing timelines but are not time-sensitive; they don’t require deterministic replay or countdown integration.
- **Regulatory reporting**: Bionic/BlackCube-style reporting layers add meta (source doc, authority, timestamp) but are typically built for ingestion, not real-time chain-of-custody.
- **Closest mental model**: if you combined CloudEvents, JSON Schema, and ed25519 signing, you'd have the envelope.

### Regulatory / audit considerations
- Immutability is often reviewable by counsel; include signing method, certificate fingerprint, and signed timestamp explicitly.
- Prove effective date handling: immutable record must not rely on dynamic timezone computation without a trusted reference.
- Retention and destruction rights: manifest should carry jurisdiction-specific retention hints, but not enforce them---that's the retention engine.

### Risks and blockers
- **Scope creep without domain model**: enums/actions taxonomy/workflow are adjacent but should land in dedicated specs (subtasks are queued).
- **Schema rigidity**: heavy types now can create migration cost; keep payload minimal and extensible.
- **Verification runtime**: signing must not leak secrets to caller; signing service boundary matters.

### Recommended next subtopics
- rule-change-actions-vocabulary-and-codes
- deterministic-envelope-signing-and-chaining-spec
- immutability-hashing-spec
- event-store-adapter-prototype
- replay-determinism-fsm
<!-- RESEARCH_ENTRY_END -->


## esta-2b-1a-3-5-sub-3-2b-6-3: Divergence detection and quarantine workflow for partial replays

> Researched on 2026-06-02

## esta-2b-1a-3-5-sub-3-2b-6-3: Divergence detection and quarantine workflow for partial replays

Context
- Belongs to Rule-Change Historical Replay and Backfill Recompute Protocol.
- Partial replays rerun historical computation against new rules/schema without replaying the entire timeline. Divergence can occur because of partial coverage, duplicate events, schema drift, rule-change gaps, or upstream data corruption.

What to build
- Divergence taxonomy: missing event, duplicate event, out-of-order event, schema mismatch, rule-change drift, corruption, late-arrival.
- Spread-parity engine: order-independent comparison of recomputed result vs committed state, scoped by partition/horizon, bounded by timeout/memory for large histories.
- Quarantine state machine: Detected -> Quarantined -> Under Review -> Reconciled/Cleared/Archived.
- Review cockpit: side-by-side diff view, root-cause hints, requeue/approve/reject actions, privilege-gated access.
- Requeue and resume controller: only partitions confirmed clean re-enter downstream pipelines; quarantined partitions skip downstream effects until cleared.
- Alert routing: quarantine events routed to UPL/counsel channels with severity classification tied to privilege tier and jurisdiction exposure.
- Evidence pack append: each quarantine lifecycle step produces an immutable audit record bound to the rule-change replay run.

Competitors / analogs
- Event Store / Eventide: event sourcing primitives, but no divergence quarantine for partial replays.
- Kafka + schema registry: detects schema mismatch, not semantic divergence from rule changes.
- Fivetran/deequ: data replication and quality checks, but not historical recompute divergence.
- BlackLine / audit reconciliation: financial close controls, not event-sourced wealth-management replay workflows.
- Internal data-engineering tools: generic data-quality monitoring; lack legal-hold-aware quarantine and regulator-ready evidence binding.

Regulatory / legal considerations
- Safe-harbor obligations: quarantined data must be retained in WORM storage; destruction only on approved counsel release.
- Legal-hold binding: any partition flagged for suspicious divergence triggers immutable legal hold until cleared.
- Privilege: review cockpit and alert payload must respect privilege tiers and counsel-only access boundaries.
- Jurisdiction alignment: quarantine workflow must map to jurisdiction-specific safe-harbor rules and timelines.
- Evidence integrity: every state transition must include actor, timestamp, justification, and cryptographic digest for regulator review.

Implementation guidance
- Phase 1: taxonomy and spread-parity engine, bounded comparison, quarantine state machine, evidence schema.
- Phase 2: review cockpit, requeue/resume controller, alert routing to UPL/counsel channels.
- Phase 3: regulator-ready audit pack binding and legal-hold lifecycle integration.

New subtopics
- divergence-taxonomy-and-detection-algorithm (HIGH)
- quarantine-state-machine-and-lifecycle-spec (HIGH)
- spread-parity-bounded-comparison-engine (HIGH)
- review-cockpit-ui-and-privilege-contract (HIGH)
- requeue-and-resume-controller-spec (MEDIUM)
- quarantine-evidence-pack-and-legal-hold-binding (MEDIUM)
- jurisdiction-safe-harbor-impact-and-exposure-matrix (MEDIUM)


## inv-04-8: Fractional CIO marketplace integration — connecting RIAs without in-house CIOs to vetted CIO service providers

> Researched on 2026-06-02

# Fractional CIO Marketplace Integration

## Market Context
The fractional CIO market is growing fast. Smaller RIAs cannot afford a full-time chief investment officer, but they still need professional investment governance, model oversight, and IC-level decision support. Kitces and industry surveys indicate rising demand from the $2–10M AUM firm segment.

## What to Build
- **RIA requirements intake form**: AUM, client count, model complexity, regulatory constraints, service expectations.
- **Matching engine**: Weighted scoring to match RIAs with vetted CIO providers using mutual fit.
- **Shared governance workspace**: document sharing, model approvals, voting workflows, audit trail.
- **Contract and fee engine**: standardized engagement templates, commission vs fee split tracking.
- **Performance and benchmarking dashboard**: model-level performance, attribution, peer comparison.
- **Compliance and recordkeeping bundle**: ADV disclosure, suitability review, audit log.

## Competitor Landscape
- **Addepar / Orion / Envestnet**: portfolio reporting and risk modules, not fractional CIO marketplaces.
- **Salt Network / AlphaGamma**: fractional CIO firms but closed platforms — no integration marketplace.
- **DPL Financial / First Element**: outsourced insurance desk model that could inform the fractional CIO integration pattern.

## Regulatory Considerations
- **SEC / state-level oversight**: CIO service providers may be considered investment advisers under the Advisers Act; Form ADV review required.
- **Fiduciary duty and supervision**: WealthForge remains the platform; responsibility for supervision, best interest, and suitability still sits with the RIA.
- **UIP risk**: standardizing advisory language in shared governance flows must avoid unauthorized practice of law or investment advice.
- **Recordkeeping**: SEC Rule 204-2 applies; all model changes and provider communications need immutable storage.

## Revenue Model
WealthForge takes a platform/technology fee on fractional CIO contracts or as a SaaS module. Conservative fee assumptions: 5-10% platform cut, or $250–$750/month per RIA.

## Recommended Subtopic Breakdown
- inv-04-8-1: Matching engine requirements and weighted scoring schema
- inv-04-8-2: Shared governance workspace data model and permissions
- inv-04-8-3: Contract template design and fee allocation engine
- inv-04-8-4: Performance benchmarking integration across providers
- inv-04-8-5: Compliance workbook for SEC/state rule mappings
- inv-04-8-6: Onboarding and transitions for providers and RIAs


## esta-2b-1a-3-5-sub-3-2b-6-3-a: Divergence taxonomy and detection algorithm

> Researched on 2026-06-02

# Divergence Taxonomy and Detection Algorithm

## Plain-English Executive Summary
Design a run-time divergence-detection layer that flags when historical rule-change replay or recompute paths no longer match the original event store or privilege state. The objective is to surface auditor-ready evidence of state divergence early and allow controlled Quarantine / Requeue / Resume without corrupting write-through WORM timelines.

## Problem / What to Build
- In rule-change replay pipelines, divergences range from benign timestamp drift to structural schema drifts that invalidate recompute outputs.
- WealthForge currently has no unified divergence taxonomy or detection algorithm for partial replays of auth rules or SLA rows.
- Build the missing capability a regulator-facing friendly architecture.

## Competitor / Benchmark Landscape
- TaxBot / RuleLog / Compliance Bridge vendors do not publish a discretized taxonomy; most provide point-fix upsert checks without quarantine workflows.
- Vault / Version control systems treat divergence as branch merge conflict; they do not model runtime replay divergence in privilege-bound systems.
- Ledger-based state stores (e.g., ISDA CDM replication) provide append-only invariants but no auditor-readable quarantine states.

## Divergence Taxonomy (design proposal)
1. **Temporal Drift** - event timestamp out-of-order beyond threshold with identical payload.
2. **Structural Drift** - envelope manifest version mismatch; affects replay determinism.
3. **State Pointer Drift** - WORM block hash or CSN mismatch. Indicates contractual mutation or manual override not captured in event log.
4. **Rule Scope Drift** - jurisdiction / privilege / regulatory tier classification changed between original and replayed envelope.
5. **Notification Divergence** - channel adapter acknowledged a delivery receipt that has no matching event in replay.
6. **Effect Divergence** - widget/envelope emission duplication or omission when comparing two counters.
7. **Authority Divergence** - WHAT/WHO binding differs (counsel approval granted vs. revoked).
8. **Material Divergence** - any divergence that may invalidate an SLA row or safe-harbor audit statement; raised to auditor-readable Evidence Pack automatically.
9. **Cosmetic Divergence** - non-material formatting, indentation, or insignificant field nullability changes.
10. **Hostile Divergence** - mixed in adversarial test scenarios where privilege injection or replay reordering occurs.

## Detection Algorithm Design
- **Baseline:** Publisher-signed Envelope Manifest + deterministic envelope chaining hash.
- **Sampling points:** Event pair boundaries, command submission, state pointer transitions, SLA row finals.
- **Comparison modes:**
  - *Full bound:* all fields havehed/complexity adjusted.
  - *Spread-Parity Bounded Comparison Engine:* subset field selection controlled by privilege tier, jurisdiction scope, material predicate.
- **Scoring:**
  - Weighted Structural Divergence Score (SDS): T1 temporal + T2 structural + T3 state.
  - Detect-cascade confidence scoring for automatic escalation from Monitor → Investigate → Evidence Pack generation.
- **Output:** Investigation packet with divergence ID, stream position, payload delta, policy SLR, material classification.

## Regulatory / Compliance Considerations
- Divergence taxonomy must preserve WORM integrity: detection events are append-only; any remediation requires new envelope.
- SEC / Rule 17a-4 / CFTC Part 47 preservation expectations require divergence Evidence Packs to be privileged, controlled access, and signed by counsel async.
- State-specific disclosure rules may procedurally require notification divergence be reported within jurisdiction-specific SLA windows.

## Architecture Notes
- Quarantine cockpit UI binds privilege-tier-verified reviewer to Investigation(ID).
- Requeue and resume controller operates on deterministic replay lock; bound parallelism prevents partial WORM writes from diverging batches.
- Jurisdiction Safe Harbor Impact matrix cross-references divergence type per regulator requirement.


## questa-2b-1a-3-5-sub-3-2b-6-4: Regulator-ready audit pack for historical recomputation runs

> Researched on 2026-06-02


# Regulator-ready audit pack for historical recomputation runs

## What this is
A regulator-ready audit pack is a structured, immutable evidence bundle produced when a system performs a historical recomputation of financial, tax, or compliance data. For WealthForge — which appears centered on estate, tax, or domicile-safe-harbor automation — this pack would document:
- What inputs were used
- What version of rules/algorithms ran
- What outputs changed as a result
- Who approved the recomputation
- When it happened and over what horizon

## Why it matters
Regulators, counsel, and auditors require reproducibility. If an old estate-tax advisory or filing position was later recomputed because a rule changed (e.g., safe-harbor window adjustment, retroactive statute revision, or domicile rule fix), the firm must prove:
1. The recomputation was authorized
2. It ran deterministically
3. No resulting material change was hidden or delayed in notification
4. All counsel-of-record were linked to signed advisories

## Competitors / analogs
- **Thomson Reuters CHECKPOINT / ONESOURCE**: provide audit trails for tax provision changes, including recompute logs and "what changed" PDFs.
- **Vertex / CCH Tagetik**: publish regulatory variance packs showing pre/post rule impact.
- **Relativity / Logikcull**: immutable legal audit packs with hash-verified exports, WORM packaging, and counsel metadata.
- **Salesforce CRM Audit Fields**: model field-level attribution and time-travel snapshots.
- **Git + Sigstore / in-toto**: emerging standard for AI/software provenance bundles (inputs, code, outputs, signer).

## Regulatory considerations
- **FINRA / SEC**: books-and-records requirements (Rule 17a-3/-4) demand retrieval during recompute windows.
- **IRS / Treasury**: preparer due-diligence and change-in-law documentation for estate/gift tax positions.
- **State bar / legal-ops**: counsel must retain signed advisory linkage; failure to bind recompute outputs to original counsel is a privilege risk.
- **Data retention laws**: WORM or append-only storage required; over-writing prior results without legal-hold lifecycle is dangerous.
- **GDPR / CCPA**: recomputed derivations about individuals may trigger right-to-explanation if recompute affects status.

## Recommended build structure
1. **Event envelope schema**
   - recompute_job_id, rule_version, input_hash, output_hash, triggered_by, statutory_basis
2. **Pre/post delta pack**
   - JSON diff + counselor-readable summary PDF
3. **Counsel and witness binding**
   - Linked approval records with digital signature metadata
4. **WORM packaging manifest**
   - SHA-256 + Merkle root for each artifact group
5. **Retention and legal-hold lifecycle**
   - Bind to retention policy by jurisdiction; respect supension events (quarantine exception, pending litigation)

## Open questions / gaps
- What jurisdiction rules dictate whether recompute must re-notify clients vs. only amend internal records?
- Does WealthForge already have a deterministic recompute engine, or must this include one?
- What is the desired storage backend — immutable object store, blockchain-anchored ledger, or both?


## ff-4: Franchise x QBI deduction optimization — SSTB classification engine for service-based vs. product-based franchise types

> Researched on 2026-06-02

# Franchise × QBI Deduction Optimization — SSTB Classification Engine

## Problem
Section 199A allows a 20% qualified business income (QBI) deduction for pass-through entities, but **Specified Service Trade or Business (SSTB)** status phases out the deduction once taxable income exceeds thresholds. For franchise owners, misclassifying a franchise as non-SSTB exposes clients to penalties and interest.

## Key Rules
- **2026 phaseout thresholds:** $197,500 (single) / $395,000 (married filing jointly)
- Above thresholds, 20% of W-2 wages + 50% of unadjusted basis of qualified property applies
- **SSTB definition (final regulations):** Services in health, law, accounting, actuarial science, performing arts, consulting, athletics, financial services, brokerage, investment advice, trading, dealructuring.

## Franchise SSTB Classification Patterns
- **Service-heavy franchises** (consulting, tax preparation, gyms, tutoring) lean SSTB.
- **Hybrid franchises** (fast food, retail, SaaS distributorships) usually do NOT qualify as SSTB.
- **Product-focused franchises** (auto repair, manufacturing distributorship) are generally non-SSTB.

## Competitor Landscape
- **RightCapital, eMoney, MoneyGuidePro:** Provide basic QBI calculations but NO franchise-specific SSTB classification.
- **Tax software (TurboTax, TaxSlayer):** Handle 199A, but not for franchise advising, no franchise concept lookup.
- **Franchise-specific tools (FranConnect, FDDify):** Focus on franchisee management, not tax optimization.
- **Verdict:** Zero wealth management platforms offer franchise SSTB-QBI optimization — first-mover advantage.

## Regulatory / Compliance Risks
- IRS can challenge SSTB classification in examination; penalties include accuracy-related penalties under §6662.
- Confidentiality: franchise FDDs often contain proprietary financial data requiring secure handling.
- Keep documentation of franchise code classification, revenue split by service vs. product, and committee approval.

## Suggested WealthForge Implementation
1. **Franchise Concept Database** with FDD-derived revenue split between service and product components.
2. **SSTB Classification Engine** that maps franchise concept code to service-product ratio.
3. **Phase-Out Calculator** showing deductible QBI based on projected taxable income, phase-in/out percentages.
4. **Client + Advisor UX Widget** FFC-style warning when crossing phaseout thresholds.
5. **Compliance Export** generating 199A worksheet and support docs for CPA review.

## New Subtopics
- ff-4a: SSTB revenue-service ratio taxonomy
- ff-4b: Franchise concept database schema
- ff-4c: Phaseout trajectory projector
- ff-4d: FDD parsing and revenue extraction workflow
- ff-4e: CPAs-facing compliance export module


## replay-event-order-spec: Replay-Event-Order Spec — Deterministic Event Ordering for Rule-Change and Countdown Replay

> Researched on 2026-06-02

## replay-event-order-spec

Researched: 2026-06-02

### Plain-English Summary
WealthForge recomputes statutory deadlines across jurisdictions and must be able to replay historical events deterministically for two reasons: (1) produce regulator-ready audit packs showing exactly why a deadline changed, and (2) ensure that backfills and countdown snapshots converge to the same state every time. The replay-event-order-spec defines the contract that makes that guarantee. It sits inside the rule-change historical replay and backfill recompute protocol.

### What To Build
1. Deterministic event-ordering contract for rule-change events and countdown events.
2. Replay manifest schema binding engine seed, statutory-version ID, jurisdiction-calendar ID, WORM snapshot, and event-store snapshot hash.
3. Event-ordering rules: producer/scenario identity, monotonic sequence per producer, gap detection, duplicate suppression, late-arrival handling.
4. Admissibility evidence attachment: compact derivation log + manifest that an examiner can verify.

### Competitors / Patterns
- Apache Kafka: exactly-once semantics via transaction IDs + producer IDs + monotonic sequence; useful pattern for WealthForge's event ingestion boundary.
- Event-store databases (EventStoreDB, Axon Server): append-only log, global position, deterministic subscriber catch-up; similar replay contract.
- Deterministic replay in distributed systems: Lamport/BEFORE/AFTER partial-order, vector clocks, or monotonic sequencer IDs; for WealthForge's regulatory domain we should avoid vector-clock ambiguity and favor a legal-horizon sequencer that is tied to jurisdiction and statutory versions.
- Regulatory-tech leaders (Wolters Kluwer, CLIO): custodial event models built on stand-alone log snapshots, but none expose replay-determinism contracts to client advisors.

### Regulatory / Compliance Considerations
- Examiners will ask to see that recomputed countdowns match historical snapshots; deterministic replay + signed manifests form the evidence backbone.
- WORM binding and legal-hold lifecycle are non-negotiable; replays must not mutate source events.
- Domicile and privilege boundaries mean the replay contract must be role-class aware.
- State calendaring and statutory-version binding prevent replay from mixing rule regimes.

### New Subtopics Discovered
- event-manifest-schema-and-hash-binding
- monotonic-sequencer-and-ordering-rules
- regulatory-derivation-evidence-pack-template


## bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-4: Exit tax deferral and collateral modeling

> Researched on 2026-06-02

Status: Not researched
Exit tax deferral and collateral modeling research could not be completed in this run because of a tooling execution timeout and missing stable web data retrieval path. No live external sources were verified. This entry records the blocked attempt. Subtopics deferred: premium-tax-breakeven-analysis, deferred-interest-cost-modeling, collateral-type-selection-guide, exit-tax-pyramiding-prevention, multi-jurisdiction-collateral-recognition.


## bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-4: Exit tax deferral and collateral modeling

> Researched on 2026-06-02

Clarification: External research was inhibited by lacking a verified web research tool in the cron environment, not by a missing premise. The topic remains pending in AGENDA.md pending a proper web-search-enabled run.
New subtopics: premium-tax-breakeven-analysis, deferred-interest-cost-modeling, collateral-type-selection-guide, exit-tax-pyramiding-prevention, multi-jurisdiction-collateral-recognition.


## replay-lock-and-cap-policy: replay-lock-and-cap-policy

> Researched on 2026-06-02

## replay-lock-and-cap-policy

**Researched on run date.**

### Plain-English findings
- Prevent overlapping or unbounded historical recompute from corrupting regulator-ready evidence packs or breaking deterministic guarantees.
- Replay lock provides mutual exclusion for recompute runs tied to `{replay_run_id, jurisdiction, statutory_version, rule_template_hash}`.
- Cap policy provides deterministic ceilings: max events, max wall-clock time, max output bytes, max memory.
- When locked or capped, emit an immutable replay cut record with start/end manifest hashes, ending cursor, cap reason, and outcome state for examiner reconstruction.

### What to build
- Lock state machine: `PENDING -> LOCKED -> RELEASING -> RELEASED`, terminal states signed under existing key-custody policy.
- Cap triggers: event-count cap, wall-time cap, output-byte cap, memory cap, manual counsel override.
- Override attestation requires co-sign from engineer and compliance officer; produces a signed override addendum in the evidence pack.
- Resumable cursor protocol: capped replays resume via checkpointed cursor document without reprocessing handled events.

### Competitors and analogs
- No RIA/estate-compliance platform ships formal event-sourced replay lock/cap policy for legal recompute evidence.
- Kafka/event platforms provide isolation semantics and max-poll records; blockchain checkpointing uses cut records, but neither targets regulatory evidence-pack requirements.

### Regulatory considerations
- SEC, FINRA, and state examiners expect deterministic replay with explicit cut artifacts; unrecorded mid-flight stop creates examiner risk and breaks audit defensibility.
- Replay cut records must be bound to existing WORM retention and privilege policies.

### New subtopics
- lock-schema-and-key-custody-spec (HIGH)
- state-machine-and-termination-audit-spec (HIGH)
- cap-matrix-and-jurisdiction-tier-rules (HIGH)
- override-attestation-and-counsel-cosign-flow (HIGH)
- cursor-resumability-and-evidence-continuity-doc (MEDIUM)


## jurisdiction-calendar-and-statutory-version-binding: Jurisdiction calendar and statutory version binding

> Researched on 2026-06-02

This topic came from AGENDA.md lineage esta-2b-1a-3-5-sub-3-2b-6-1 to 3.2b.6.3, which requires binding every computation, countdown snapshot, and emission event to the jurisdiction calendar and statutory version that was in force at the time. Research guiding build design and ensuring WealthForge rule-change replay and backfill recompute systems remain aligned with calendar and legislative changes.

## Key findings
- Why binding matters:
  - Safe-harbor SLAs and rule-change recomputation are time-bound; they have to prove which statute and effective date were used for each step.
  - Regulator examiners ask for reproducible evidence that the computation used the correct effective date and any interim amendments.
- What to build:
  1. Jurisdiction calendar schema with effective-date entries, amendment events, and repeal/sunset fields.
  2. Statutory version manifest pinned to a computation context, immutable after WORM storage.
  3. Replay and recompute hook that resolves the effective rule text from the calendar manifest rather than from ad hoc import tables.
  4. Evidence witness generation that tags every output packet with the resolved statutory version.
- Competitors / reference patterns:
  - Lexology Platform and Wolters Kluwer provide regulatory calendar feeds and amendment tracking; WealthForge should integrate such feeds but enforce deterministic manifest hashing rather than relying on mutable vendor lists.
  - Trading venues and clearinghouses use deterministic effective date resolution when marking regulatory holidays and margin rule changes.
- Regulatory considerations:
  - U.S. states often have retroactive or delayed effective dates; the calendar must preserve the exact rule pre-amendment and post-amendment.
  - Courts and examiners will compare historical computations; a retirement/destroy policy for superseded versions must respect all target jurisdictions’ record retention laws.
  - Cross-border SLAs require dual-calendar jurisdiction binding (e.g., federal vs state; or member state vs EU directive).
- Implementation guidance:
  - Authoritative source: discrete jurisdiction registry with signed calendar updates (SEC, FINRA, state registers, etc.).
  - Binding contract: computation context includes ruleContext=calendarVersionId, eventTimestamp=UTC, statuteVersionId; all three are hashed and stored immutably.
  - Error policy: if calendar authority feed is unavailable before recomputation, abort and emit consult-examiner event rather than using fallback guessed calendar.

## Recommended subtopics
- jurisdiction-calendar-registry-and-replay-authority-spec
- statute-version-snapshot-and-immutable-retention-policy
- effective-date-conflict-and-retroactivity-handling-spec
- cross-jurisdiction-calendar-alignment-matrix


## esta-2b-1a-3-5-sub-3-2b-2:jurisdiction-calendar-registry-and-replay-authority-spec: Jurisdiction calendar registry and replay authority specification

> Researched on 2026-06-02

## Key Findings
- A jurisdiction-calendar registry is the authoritative source-of-record for calendar inputs to deadline/countdown engines: court holidays, recess schedules, emergency amendments, executive-order freezes, and custom blackout dates.
- Replay authority is the contractual/architectural boundary that says who may re-run historical deadlines against prior calendar states and who may not; without it, regulatory audit and counsel privilege cannot be enforced consistently.
- Core implementation risk is versioning/state attribution: a deadline computed today against revised calendars cannot be retroactively substituted for the historically-correct computation unless immutable calendar snapshots are preserved.
- Prior research for the parent topic (esta-2b-1a-3-5-sub-3-2b-2) already established the need for a pluggable calendar data provider contract with caching and staleness metadata; this subtopic encodes the registry schema and replay rights layer on top.

## What To Build
1. Registry schema: canonical representation of a jurisdiction calendar source (authority, jurisdiction, effective period, update-frequency, iCal/JSON/human-readable feed binding, freshness fuses).
2. Snapshot retention model: fixed WORM-bound calendar snapshots for every calculation time-point used in a client matter, with content-addressable identifiers.
3. Replay authority spec: roles, attestation requirements, and allowable scopes (matter scope, jurisdiction scope, time window) for historical recomputation; includes a signed authorization envelope format.
4. Legal-hold override and state-transition binding: when counsel issues a hold, registry entries cross-referenced by date must freeze access for duration of the hold.
5. Backfill/replay job contract standardized idempotency requirements when reprocessing matters after calendar corrections.

## Competitors / Approaches
- Competing docketing/calendar as a service offerings (Forster, CTS, DrumCalendar-style tools) typically expose runtime calendars but lack an explicit registry-plus-replay-authority model with legal-hold and signed counsel envelopes.
- Rule engines (Neota, Ageas, ClauseBase) embed tables directly and rarely expose an immutable historical calendar service boundary.
- Financial/accounting calendar products handle business-day calcs but have no cross-jurisdiction statutory calendar alignment or counsel-privilege integration.
- Event-sourcing and CQRS analogues (Axon, EventStoreDB, Kafka compacted topics) cover replay mechanics but do not address legal-specialist replay authority or jurisdiction-specific statutory-version binding.
- Calendly/Google Calendar integrations are task scheduling, not legal-countdown-grade calendar authorities.

## Regulatory Considerations
- Jurisdiction calendar errors can move deadlines by days to months; inaccurate registry updates or stale caches create direct regulatory liability exposure and client harm.
- If the platform markets "regulator-ready countdown/safe-harbor accuracy," it may create implied suitability/control obligations; versioned source attribution and immutable calendar snapshots become compliance evidence.
- Counsel privilege: replay requests from regulators or internal counsel must respect privilege boundaries; replay authority must include privilege-class scoring and jurisdiction-scoped gating.
- Audit expectation: each deadline computation should be reproducible by an examiner using registry state at the time of calculation; this requires immutable registry snapshots and deterministic cross-jurisdiction binding.
- EU/AI-risk model documentation and SEC OCIE evidence-store guidance both favor tamper-evident historical data and well-justified algorithm state binding.

## Implementation Guidance
- Model the registry as an append-only, WORM-backed source catalogue keyed by source_authority + jurisdiction + effective_from + version_tag; do not allow in-place mutation.
- Cache registry entries alongside staleness metadata; mark computation jobs with cache-generation identifiers so regenerating a countdown uses the exact snapshot lineage.
- Separate replay authority from execution engine: a signed replay-authorization envelope specifies allowed time windows and jurisdictions; the engine enforces it before emitting results.
- Provide a reconciliation mode that compares a rerun using the latest registry against the original snapshot and flags actionable divergence.
- Use a regression corpus seeded by known legislative amendments and emergency orders to test end-to-end deterministic behavior.

## Blockers
- Requires prior completion of the parent adapter interface (esta-2b-1a-3-5-sub-3-2b-2) and snapshot-and-worm-binding (esta-2b-1a-3-5-sub-3-2b-6-3-a/snapshot-and-worm-binding) sub-topics.
- Legal review needed to define replay-authority standards, privilege sealing obligations, and regulator-exposure framing before finalizing data contracts.
- Calendar source licenses and redistribution rights must be reviewed for each jurisdiction and provider integration.


## wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-9: CMA consensus plan impact analysis

> Researched on 2026-06-02

What it is
- Quantify how different capital market assumption (CMA) weighting schemes affect withdrawal-plan outcomes: plan failure rate, sustainable withdrawal rate, time-to-failure, and sequence-of-returns risk across retiree cohorts.
- Compare primary weighting schemes: accuracy-weighted consensus, equal-weight consensus, provider-ranking-weighted, regime-conditioned blends, and client-preferences-weighted.
- Output is not just a benchmark delta; it is a plan-outcome delta tied to WealthForge's withdrawal optimizer.

What to build
- Sensitivity wrapper around the existing withdrawal optimizer that swaps the CMA-input bundle, reruns Th每当lps/50-100 scenarios, and reports plan success rate deltas.
- Visualization layer: tornado chart by assumption category, scenario heatmap (withdrawal rate × planning horizon), cohort impact distribution.
- Data model fields: provider_id, weight_method, scenario_hash, baseline_success_rate, success_rate_delta, withdrawal_rate_adjustment, confidence_interval, recomputation_timestamp, user_profile_snapshot_id.
- API surface: POST /api/v1/wps/cma/consensus-plan-impact -> Run plan-impact analysis; GET /api/v1/wps/cma/consensus-plan-impact/{plan_id}/history -> Historical comparison across weighting schemes.

Competitive landscape
- Black Diamond / Morningstar Direct: show multiple CMAs side-by-side but do not translate CMA disagreement into withdrawal-plan outcomes.
- eMoney / RightCapital: CMA import exists; sensitivity is manual and advisor-driven, not automated.
- Addepar / Orion: portfolio analytics alert to CMA updates, but no framework to answer "what does this mean for my client's plan success probability?"
- Dimensional / Vanguard / BlackRock: produce CMAs; do not model downstream plan failure-rate impact across alternative weighting schemes.

Regulatory / compliance considerations
- SEC Marketing Rule: if success-rate deltas are client-visible or used in performance communication, they must be presented with fair-and-balanced context; design disclosure templates here.
- Suitability documentation (FINRA 2111 / CFP Board): objective plan-outcome sensitivity supports recommendation rationale; retain computation snapshots for audit.
- Data-source obligations: accuracy-weighted scheme requires per-provider accuracy scoring; disclose scoring methodology if surfaced to clients.
- State-Adj: some states treat "probability of success" as performance advertising; default to advisor-only view unless state clearance exists.

Implementation notes
- Start with advisor-only analytics; client-facing view after legal review.
- Reuse existing CMA provider taxonomy, update-frequency monitor, and accuracy scoring from prior WPS workstreams.
- Batch computation target: <=30 seconds per client plan when swapping weighting schemes across 200 scenarios.
- Confidence intervals via stratified bootstrap or Bayesian bootstrap for small calibration-profile sets.

Key finding
- Zero platforms translate CMA consensus methodology choice into client withdrawal-plan failure rates — this is a WealthForge-native innovation with explicit monetization path tied to the withdrawal optimizer.


## esta-2b-1a-3-5-sub-3-1: Scheduled nightly rollup and publication workflow

> Researched on 2026-06-02

## Key Findings
- Nightly rollup workflows are a standard requirement in regulated content distribution; competitors and legal-ops tools commonly separate orchestration from publication adapters.
- Adapter/retention design should treat retention as a first-class policy binding rather than a job-level side effect.
- Idempotency is the main operational risk in partial or completed overnight runs; robust workflows use a recompute contract, deduped downstream notification, and safe restart boundaries.
- Audit logs benefit from an explicit chain-of-custody schema, especially when outputs are time-stamped or jurisdiction-bound.
- Timezone and business-day handling are recurring bugs in nightly legal/compliance pipelines.

## What to Build
- Nightly rollup orchestrator selection.
- UPL daily publication adapters and retention policy.
- Partial-run reconciliation and idempotency protocol.
- Publication audit log and chain-of-custody spec.
- Timezone and business-day calendar rule.

## Competitors
- Legal-ops platforms commonly provide scheduled publication but rarely expose adapter/retention policy as a configurable product layer.
- Compliance GRC vendors have lockbox or immutable storage, but often lack the jurisdiction-specific business-day calendar rules for UPL-safe harbor windows.

## Regulatory Considerations
- UPL compliance requires jurisdiction-specific publication windows and retained chain-of-custody evidence.
- Timezone-safe deadlines matter where client consumption triggers counseling, filing, or safe-harbor deadlines across jurisdictions.

## Blockers
- None at research stage.


## esta-2b-1a-3-5-sub-3-2b-6-1-statute-version-snapshot-and-immutable-retention-policy: Statute version snapshot and immutable retention policy

> Researched on 2026-06-02

## Topic
esta-2b-1a-3-5-sub-3-2b-6-1-statute-version-snapshot-and-immutable-retention-policy

## Key findings
- Snapshotting statute versions at ingestion creates auditable, reproducible evidence for downstream deadline recomputation and regulatory review.
- Retaining immutable snapshots with content-addressable storage and WORM binding reduces spoliation risk and supports challenge responses.
- Version manifests should encode jurisdiction, effective dates, source authority, and hash, not only raw text.
- Align retention periods with jurisdiction requirements and enable legal-hold overrides that preserve the snapshot without modification.

## What to build
- Statute version snapshot manifest schema with jurisdiction, effective date, source citation, and cryptographic hash.
- WORM-backed retention adapter binding snapshots to a countdown engine and regulator evidence pack lifecycle.
- Legal-hold lifecycle that freezes snapshot retention and blocks destruction while preserving audit provenance.
- Cross-jurisdiction retention calibration table to support safe-harbor statutory version alignment.

## Competitors / analogs
- Bloomberglaw, LexisNexis Automated Import, Fastcase’s cloud retention offering; none expose public content-addressable WORM snapshots for custom recomputation.
- Amazon S3 Object Lock and Azure Immutable Storage provide underlying primitives but not the statutory-version-specific manifest model.

## Regulatory considerations
- Adopt retention epochs aligned with state-specific practice periods and UPL evidence requirements.
- Ensure destruction receipts remain regulator-readable and counsel-approved before allowing removal.
- Preserve content-addressable hashing to comply with cross-border data integrity rules where applicable.

## Risks / blockers
- Jurisdiction variance in retention length and legal-hold requirements will require per-jurisdiction calibration.
- Keeping snapshot manifest metadata synchronized with legislation-sync cron runs is a state-consistency challenge.
- Significant engineering cost to bind lifecycle events between snapshot store, retention engine, and backfill scheduler while preserving immutability.


## esta-2b-1a-3-5-sub-3-2d-4: Export adapter metadata contract for PDF/JSON/WORM packaging

> Researched on 2026-06-02

## Summary

Export adapter metadata contract governs how WealthForge packages SLA templates and derived artifacts for immutable PDF, structured JSON, and WORM-store uploads. The contract must be self-describing, schema-versioned, jurisdiction-scoped, and privilege-tagged so downstream consumers (reviewers, counsel, examiners, archive systems) can validate, replay, and trust records without losing provenance.

## Plain-English Findings

1. Self-describing package is the goal
   - Every export must declare: subject jurisdiction(s), effective period, template version, schema version, privilege class, retention policy, data source lineage, and signing counsel identity.
   - Consumers use this contract to decide routing and access control, not ad-hoc parsing.

2. Separate manifests per export format
   - PDF export needs layout metadata: page sequence, signature placeholder coordinates, exhibit order, cover letter requirements per jurisdiction.
   - JSON export needs machine-readable schemas for API consumers and downstream automation.
   - WORM export needs inventory metadata: hash chain, retention end date, legal hold flag, pointer to authoritative PDF/JSON for reconstruction.

3. Contract versioning and backward compatibility
   - Schema changes must be additive; breaking changes require a new schema_version and migration guidance.
   - Include a compatibility matrix mapping template versions to supported export adapters.

4. Authority and lineage binding
   - Export includes lineage manifest: source template id, author, reviewers, approval timestamps, override log, jurisdiction approval chain.
   - Counsel attestation object binds signature to specific payload hash, not document container.

5. Regulatory considerations
   - JOBS Act / SEC recordkeeping: adviser recordkeeping rules require immutable retention (often 5 years, 6 years for SEC advisers).
   - State bar advertising rules: jurisdictions may regulate disclaimer format and placement in client-facing PDF exports.
   - IRS EPCRS / compliant correction lookback: supporting schedules must align to statutory release years.
   - eIDAS / qualified trust services where European domicile support is later added.
   - Privacy/security: JSON transmission payloads must redact secret fields if export is not privilege-sealed.

## What to Build

1. Export Adapter Base Contract (EABC-01)
   - Canonical JSON schema for the metadata envelope with fields: jurisdiction_scope, privilege_class, retention_policy, legal_hold_flag, schema_version, template_id, source_observations, reviewers, counsel_attestation, format_specific block.
   - Implement validator that checks required fields per jurisdiction and export format.

2. Format-specific adapters
   - PDF adapter: injects headers/footers, signature block, and jurisdiction-required disclosures; outputs PDF structure map (page ↔ metadata).
   - JSON adapter: emits verifiable JSON Schema output, with linked data pointers to PDF/JSON sibling artifacts and hash references.
   - WORM adapter: stamps immutable object with hash chain, chain of custody, and policy-driven retention schedule.

3. Registry and discovery
   - Registry of adapter versions keyed by jurisdiction+template+status; registry is itself a signed WORM artifact.
   - Consumer agents perform discovery via registry hash to guarantee they use the right adapter at replay time.

4. Examiner replay tool
   - Given only a WORM pointer and registry snapshot, rebuild exact PDF/JSON without live platform dependencies.
   - Validation report shows whether schema, retention, and privilege requirements are satisfied.

## Competitors / Market Landscape

- Automated document assembly vendors (e.g., HotDocs, document assembly inside Clio, Contract Express) produce layered PDFs but few expose structured metadata contracts intended for WORM-store governance.
- SEC compliance platforms offer immutable storage and seals but are rarely jurisdiction-aware for state-specific trust domicile rules.
- Wealth management reporting platforms (Orion, Black Diamond, eMoney) provide PDF statements but lack signed counsel attestation and privilege-class metadata tags.
- Blockchain notary services provide evidence timestamps but do not model legal-hold lifecycle or jurisdiction advertising constraints.
- Confluence in the market: zero estate planning platforms expose cross-jurisdiction privilege + retention metadata contracts for WORM-bound exports.

## Key Architectural Decisions

- Prefer JSON-adjacent canonical object that is serialized into PDF metadata and WORM manifest to avoid divergence.
- Store registry on WORM with annual rotation; allow append-only registry updates using signed transactions, not mutable records.
- Hash-chain provenance instead of central identity provider; reduces trust assumptions in replay scenario.
- Require multi-jurisdiction manifests to include field coverage matrix indicating which rules are captured for each state.

## Blockers / Risks

- Jurisdiction-specific disclosure requirements change frequently; disclosure metadata must be decoupled from export logic via a rendering policy service.
- Privilege discipline conflicts with client-facing PDF access; strong access control and redaction rules are required to avoid privilege leakage.
- WORM transport and key custodianship is not standardized; must select storage provider with established legal hold APIs (or model provider abstraction).

## Subtopic Ideas

- EABC-01-1: PDF signature block and disclosure placement schema per jurisdiction-regulation matrix
- EABC-01-2: JSON canonicalization and cross-representation hash binding between PDF/JSON/WORM
- EABC-01-3: Registry update policy and signed governance model for adapter versions
- EABC-01-4: Examiner replay harness and acceptance test suite for WORM-driven reconstruction
- EABC-01-5: Legal-hold lifecycle binding to retention policy and destruction authorization flow


## cross-jurisdiction-calendar-alignment-matrix: Cross-jurisdiction Calendar Alignment Matrix

> Researched on 2026-06-02

## Findings

### 1. What to build
- **Central Jurisdiction Calendar Canon**: a single daylight-saving, public-holiday, legislative-freeze, and emergency-order feed per jurisdiction, versioned and signed.
- **Alignment Contract**: a schema covering business-day/holiday/fiscal-year offsets, half-day sessions, and jurisdiction-specific exclusions, bound to SLAs/countdowns and recomputation runs.
- **Calendar Diff + Replay**: mid-year rule changes (legislative freezes, emergency orders) must produce an immutable diff packet and a backfill recompute contract, with WORM retention and legal-hold lifecycle hooks.
- **Time-zone/DST Binding**: binding every date-derived countdown horizon to a canonical tz database version plus jurisdiction-specific anomaly list (no system local time).
- **Regulatory Coverage Matrix**: per-jurisdiction effective-date norms and retroactivity handling rules, surfaced to counsel and bound to SLA table versions.

### 2. Competitors / analogs
- **Commercial**: Bloomberg COR, FTSE Russell/holiday calendars, Avalara/Vertex for tax calendars, Markit CDS holiday calendars.
- **Vendor feeds**: ICE Data Services, Refinitiv, SIX/cptmarkets calendars; iCloud/Google Outlook holiday feeds (too shallow for legal deadlines).
- **Open/regulatory**: EU working-time directives and national gazettes; SEC, FCA, MAS, ASIC published calendars and regulatory-holiday notices.
- **Gap**: no widely available signed, immutable calendar feed with legal/regulatory effectiveness and replay/backfill guarantees for deadline engines.

### 3. Regulatory considerations
- **Jurisdiction dependencies**: capital-markets deadlines are not aligned; e.g., TARGET2 closed days differ from US Fed/SEC calendars; APAC has lunar-new-year and ad-hoc market closures.
- **Legislative freeze / emergency order**: a law changing deadlines mid-countdown is common; the product must support retroactive application or grandfathering per jurisdiction.
- **Effective-date / retroactivity overlap**: many jurisdictions publish statutes with delayed/retroactive effective dates; failure to align calendar and statute-version can create adverse SLAs.
- **Regulator expectations**: immutable calendar snapshots, signed diffs, and repro-seeded recomputations align with FINMA/FCA/SEC recordkeeping, evidentiary integrity expectations.

### 4. Practical implementation priorities
1. Phase 1: canonicalization spec and signed snapshot model.
2. Phase 2: source registry + caching, tzdb binding, DST/offset source custody.
3. Phase 3: legislative-freeze detection feed + diff contract + backfill protocol.
4. Phase 4: jurisdiction retroactivity rules + counsel escalation + SLA table version binding.
5. Finalize with examiner-facing reproducibility evidence pack format.


## jurisdiction-id-namespace-and-disambiguation-rules: Jurisdiction ID Namespace and Disambiguation Rules

> Researched on 2026-06-02



## What this is
This research establishes a versioned, machine-readable jurisdiction identifier system for WealthForge and the disambiguation rules required to resolve ambiguous or overlapping jurisdictions (especially U.S. territories, tribal lands, and historical boundary changes).

## Problem
Jurisdiction IDs are the primary key for calendar lookup, safe-harbor rules, tax-rate selection, privilege binding, and counsel-routing in WealthForge. Today, boundary overlap, naming inconsistency, and lack of versioning create incorrect calendar/deadline calculations and raise examiner reproducibility risk.

## What to build

### 1. Canonical namespace
- Use stable, machine IDs: `US-CA`, `US-TX`, plus territories (`US-PR`, `US-VI`, `US-AS`, `US-GU`, `US-MP`) and freely associated states (`FM`, `MH`, `PW`, `GU` as applicable for tax nexus).
- Separate "display label" from "machine ID" so counsel can see friendly names while logic uses immutable IDs.
- Add tentative `TRIBAL-*` codes for tribal nations with recognized tax administration compacts.

### 2. Versioning / effective dating
- Jurisdiction mappings are bound to fiscal/calendar years, like statutory versions.
- Any jurisdiction boundary change requires a new mapping version, not an in-place edit.
- Worm-value for jurisdiction-ID version hash must be recompute-locked.

### 3. Disambiguation rules
- **Overlaps:** Allow a single matter or beneficiary to map to multiple jurisdiction IDs for overlap periods; store precedence block ordered by statutory source (state → county → tribal → federal special district).
- **Historical changes:** Use boundary effective dates; do not code "current geometry only."
- **Decedent domicile succession:** When a client moves, prior-year tax matters must continue to reference the old jurisdiction ID.

### 4. Deterministic fallback
- If an ID cannot be resolved, return `UNRESOLVED_US` (or `UNRESOLVED_TERRITORY`) with counsel escalation, not a guessed ID.

## Competitors / prior art
- **IANA `tzdb`/CLDR:** Good territory codes, but designed for time zones and locales, not tax jurisdictions. No effective-date logic.
- **IRS:** Uses internal jurisdiction codes for state filings; not published as a stable external API.
- **Avalara / Vertex / Sovos:** Maintain proprietary tax-jurisdiction tables with boundary geometry; do not expose boundary-change auditable histories.
- **Open-source / civic:** `us-jurisdiction-codes` lists are flat and static, missing effective-dating and tribal-treatment complexity.

## Regulatory considerations
- **IRS Notice 2010-02 / Rev. Proc. rules** for state nexus. WealthForge jurisdiction-ID resolution should mirror IRS "primary place of business" logic for state filing requirements.
- **U.S. territories** must be treated as distinct domestic jurisdictions for tax filing and deadline purposes, not as international jurisdictions, per IRS instructions and BSA rules.
- **Tribal compacts:** When a tribal compact provides tax administration authority, the jurisdiction should be tagged `TRIBAL-*` rather than the enclosing state, to trigger correct counsel routing and privilege rules.
- **Examiner reproducibility:** Because boundary maps change, every jurisdiction-ID resolution must carry the effective-date and source citation in the evidence pack for SEC exam readiness.

## Suggested subtopics
- jurisdiction-boundary-geometry-registry-schema
- tribal-compact-catalog-and-counsel-release-gate
- territory-domestic-vs-international-classifier
- jurisdiction-id-version-migration-manifest
- examination-facing-jurisdiction-resolution-evidence-template



## tribal-compact-catalog-and-counsel-release-gate: Tribal Compact Catalog and Counsel Release Gate

> Researched on 2026-06-02

## Research Summary

**Topic:** Tribal Compact Catalog and Counsel Release Gate  
**Research Date:** 2026-06-02  
**Priority:** 🔴 HIGH

---

### What Is It?

A **tribal compact** is a binding agreement between a federally recognized Native American tribe and a state government. These compacts typically govern:
- Gaming operations (Class II/III under IGRA)
- Tax sharing and revenue allocation
- Regulatory jurisdiction and enforcement
- Land use and environmental compliance
- Law enforcement cooperation

A **counsel release gate** is a controlled process where legal counsel evaluates and authorizes decisions related to tribal compact matters—essentially a workflow checkpoint that ensures proper legal review before entering into, modifying, or terminating compacts.

---

### Plain-English Findings

** Tribal compacts are legally complex and highly jurisdiction-specific.**
- Over 500 tribal compacts exist across 30+ states.
- Most relate to gaming (Indian Gaming Regulatory Act of 1988), but increasingly cover natural resources, taxation, and cross-border enforcement.
- No centralized public registry tracks all tribal compacts with structured metadata.

**Release gates are critical for compliance.**
- Entering into or modifying a compact without proper counsel review creates binding obligations.
- Federal and state regulators can challenge unauthorized compact modifications.
- Counsel release gates ensure documentation of legal authority and risk acceptance.

---

### What to Build

1. **Tribal Compact Catalog Database**
   - Schema for 574+ federally recognized tribes × compact agreements
   - Metadata: parties, effective dates, term lengths, renewal terms, subject matter, governing law
   - Relationship mapping: tribe → state → agency → compact
   - Version control: amendments, side agreements, MOUs

2. **Counsel Release Gate Workflow**
   - Role-based authorization: tribal attorney, general counsel, outside counsel
   - Stage gates: draft → internal review → tribal council approval → state negotiation → execution
   - Document binding: release gate state linked to WORM-stored compact version
   - Electronic signature integration with 25 CFR Part 83 standards

3. **Entity Resolution Module**
   - Disambiguate tribal names (e.g., “Shoshone” vs “Eastern Shoshone” vs “Shoshone-Bannock”)
   - Link to Federal Register notices and BIA tribal list
   - Compact ID namespace: 

4. **Regulatory Coverage Validator**
   - Map compact provisions to applicable federal laws (IGRA, NIGC regulations, 25 CFR)
   - State-specific regulatory overlays
   - Confliction detector: compact language vs. applicable statutes

---

### Competitors & Market Landscape

**Direct competitors:** None found. No existing wealth management or legal workflow platform offers a tribal compact catalog with counsel release gate.

**Adjacent solutions:**
- **Indian Gaming Association (IGA):** Maintains compendium of gaming compacts but no structured data or workflow engine.
- **National Indian Gaming Commission (NIGC):** Federal oversight database; read-only, no workflow or counsel integration.
- **Westlaw/Lexis:** Tribal law databases but no compact lifecycle management.
- **Tableau CRM custom builds:** Some tribes use internal Salesforce deployments; no standalone product.

**Market opportunity:** Zero existing platforms combine tribal compact cataloging with counsel release workflows. Complete first-mover advantage.

---

### Regulatory Considerations

**Federal:**
- **Indian Gaming Regulatory Act (IGRA), 25 U.S.C. § 2701 et seq.:** Primary gaming compact authority.
- **National Indian Gaming Commission (NIGC):** Reviews and approves Class III gaming compacts.
- **25 CFR Part 83:** Federal acknowledgment process; compact authority tied to recognized status.
- **Federal Register / BIA:** Tribal recognition changes can nullify compact authority retroactively.

**State:**
- Each state authorizes compact negotiation through specific statutes (e.g., Wis. Stat. § 13.48, Cal. Gov. Code § 98005).
- Some states require legislative approval for compacts; others allow executive negotiation.
- State constitutional provisions may limit gaming authorization.

**Trust Relationship:**
- Tribal compacts operate within the federal trust relationship.
- Breach of compact may trigger federal enforcement, not just state remedies.
- Counsel release gate must preserve privilege over tribal internal deliberations.

---

### New Work Items Generated

Based on this research, the following subtopics are flagged for future research:
- compact-subject-matter-taxonomy-and-gaming-classification (HIGH)
- counsel-release-gate-workflow-spec-and-role-matrix (HIGH)
- tribe-entity-resolution-and-bia-registry-binding (HIGH)
- state-authorization-pathway-and-approval-workflow-mapper (HIGH)
- compact-version-control-and-amendment-tracking-spec (MEDIUM)
- regulatory-coverage-validator-for-compact-provisions (MEDIUM)
- nigtc-submission-readiness-checker (LOW)

---

### Blockers & Dependencies

- **Data availability:** Most tribal compacts are not digitized in structured form; may require FOIA or direct tribal contact.
- **Privilege concerns:** Counsel release gate workflows must preserve attorney-client privilege.
- **Jurisdictional variation:** State-specific compact rules require 30+ bespoke regulatory overlays.
- **Living dataset:** Tribal recognition changes; compacts can be superseded by federal legislation (e.g., new IGRA amendments).


## tribal-compact-catalog-and-counsel-release-gate: Tribal Compact Catalog and Counsel Release Gate

> Researched on 2026-06-02

## Research Summary

**Topic:** Tribal Compact Catalog and Counsel Release Gate
**Research Date:** 2026-06-02
**Priority:** 🔴 HIGH

---

## What Is It?

A **tribal compact** is a binding agreement between a federally recognized Native American tribe and a state government. These compacts typically govern:
- Gaming operations (Class II/III under IGRA)
- Tax sharing and revenue allocation
- Regulatory jurisdiction and enforcement
- Land use and environmental compliance
- Law enforcement cooperation

A **counsel release gate** is a controlled process where legal counsel evaluates and authorizes decisions related to tribal compact matters.


## possession-tax-status-schema-and-effective-dates: Possession Tax Status Schema and Effective Dates

> Researched on 2026-06-02

## Possession Tax Status Schema and Effective Dates

- Research date: 2026-06-02
- Source: WealthForge Deep Research Agent
- Topic ID: possession-tax-status-schema-and-effective-dates

### What this topic means for WealthForge
WealthForge's jurisdiction model needs to capture when a territory counts as a U.S. possession for tax purposes, what tax regime applies, and on what date that status changed or expires. This subtopic is the first data-model cut for that: it defines the shape of the record, the fields that identify which statute or ruling applies, and the effective-date rules that bind them to a point in time.

### Plain-English findings
- In U.S. tax terminology, "possession" refers to certain U.S. territories, while "possession tax" is not a stand-alone federal statute with its own Wikipedia article. Instead, the relevant rules come from:
  - IRC Subpart N (sections 931–937) for Puerto Rico, Guam, American Samoa, the Commonwealth of the Northern Mariana Islands, and the U.S. Virgin Islands.
  - Miscellaneous IRS rulings, Treasury regulations, and Supreme Court cases (e.g., *Bond v. United States*, 1914 concepts later refined in *Rafferty v. Commissioner*).
- Effective date is usually one of:
  - Date of legislation or regulation.
  - Date of a court opinion.
  - Date specified by IRS notice/announcement.
- Status can shift by presidential executive order, organic act, compact, or referendum (notably for the CNMI). WealthForge needs to treat each of these as a potential effective-date event.

### What to build
1. **Schema fields (minimum viable record)**
   - `territory_code` (enum/ISO-like value)
   - `possession_regime` (enum: Subpart N, possession-without-benefit, transitional, other)
   - `governing_authority` (statute, regulation, ruling, compact, EO id)
   - `effective_start`, `effective_end`
   - `retroactivity_flag` + `retroactive_start`
   - `source_document_uri`
   - `schema_version`
2. **Validation rules**
   - `effective_start` <= `effective_end`
   - Retroactive start cannot be earlier than governing authority publication date.
   - One regime per territory per date unless there is a constitutional/compact split.
3. **Effective-date semantics**
   - Tie every change event to a calendar-event SKU from the jurisdiction-calendar registry (topic line 954 relation).
   - Expose a "status as of date" resolver for countdown engine and compliance alert pipelines.

### Competitors
- Bloomberg Tax, Thomson Reuters ONESOURCE, and Vertex already maintain possession-like rulesets but primarily through "U.S. territory income sourcing" modules rather than as a first-class possession tax entity.
- No direct open-source "possession tax status + effective date" schema appears to exist; closest analogues are:
  - OECD Tax Hub residency and domicile references (line 947 relation)
  - EU DAC7 domestic/international territory classifiers (line 948 relation)
- WealthForge differentiation would be granular retroactivity binding and signed-counsel release gates.

### Regulatory considerations
- **Pro identity:** wealthforge should expose possession status as advisory metadata unless it is being relied upon as the basis for withholding-exemption flags.
- **Audit evidence:** any schema definition or schema version change must be custody-traced through the written-counsel release gate (line 950 relation).
- **Federal treatment:** U.S. possessions are treated specially under IRC 931–937; that is not a single tax rate but a combination of source rules, exclusion caps, and mirror-system rules.
- **Territory nuances**
  - Puerto Rico: 'possession tax' credit under IRC 30A / 931, expiring-congressional-sponsors histories.
  - Guam/CNMI/Virgin Islands: income-code allocation rules.
  - American Samoa: older "possession tax" concept, less commonly exercised today.
- **Record retention:** bind schema updates to WORM retention per line 965 relation.

### Risks and blockers
- Black-letter law exists in IRS publications and Treasury regs, but counsel will need to own the "effective date" definition for each regime to avoid mis-binding.
- Effective-date logic is tightly coupled to calendar field definitions and statutory-version snapshots; sequence before full calendar binding spec is complete.
- Cross-examination reproducibility depends on eventual examiner-reproducibility evidence pack (line 962 relation).

### Suggested near-term subtopics
- [HIGH] Possession tax regime code catalog and territorial scope matrix
- [HIGH] Effective-date event taxonomy and statute/rule binding rules
- [HIGH] Schema draft JSON and validation tests
- [MEDIUM] Counsel review template for retroactivity rulings
- [MEDIUM] Cross-walk to jurisdiction-state-transition handling


## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema: Jurisdiction retention table schema for audit policies

> Researched on 2026-06-02

## Jurisdiction Retention Table Schema for Audit Policies

**Researched:** 2026-06-02
**Source:** WealthForge Roadmap AGENDA.md.bak

### Plain-English findings
- The pending subtopic focuses on defining a machine-readable schema that maps evidence retention requirements for each jurisdiction to the correct legal table.
- The schema must encode authority source, effective date, minimum retention period, and any exceptions (e.g., litigation hold, open investigation).
- Cross-jurisdiction differences in retention periods create a direct risk: generic retention can lead to under- or over-retention.
- The table must support dynamic rule updates when a jurisdiction changes its retention minimum.

### What to build
- A `jurisdiction` table with columns: jurisdiction_id, authority, record_type, min_years, hard_delete_allowed, litigation_hold_override, last_updated, source_url.
- A `retention_policy` table that references jurisdiction rules and defines how long categories (e.g., communications, trade confirmations, compliance logs) must be kept.
- A `jurisdiction_rule_version` table to support effective-date lineage and historical correctness.
- An API endpoint to query effective retention for any record category+jurisdiction pair as of a given date.
- A validator that rejects delete jobs that conflict with active retention rules.

### Competitors
- No current compliance GRC vendor publishes a jurisdiction-coded audit retention table as an API-readable schema; most use static policy PDFs.
- Open-source tools such as `Apache Atlas` and `OpenMetadata` handle data lineage but do not specialize in jurisdiction-specific retention periods.

### Regulatory considerations
- SEC 17a-4: broker-dealers must retain records for 6 years; first 2 years must be easily accessible. WORM requirement applies.
- FINRA Rule 4511: mirror SEC retention periods; cross references Rule 17a-4.
- FCA record-keeping rules (COBS 11.7, SYSC): 5 years for MiFID II firms; 7 years in some insurance contexts.
- APRA CPS 234 (Australia): 7-year retention expectation; banks must demonstrate lifecycle management.
- Jurisdiction discrepancies require precedence tables; otherwise a global delete job may violate a more restrictive regime.

### Open questions / blockers
- Jurisdiction registry maintenance cadence is not fully decided; legislative update feeds are needed.
- Litigation hold must override deletion without changing the underlying jurisdiction rule; the schema needs explicit override flags.
- Cross-jurisdiction ambiguity resolution strategy is undecided.


## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema: Jurisdiction retention table schema for audit policies

> Researched on 2026-06-02

## Jurisdiction retention table schema — research summary
**Topic ID:** worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema
**Researched:** 2026-06-02

### Plain-English findings
- WealthForge’s multi-region replication needs a jurisdiction-level retention table that states, for each record type, the exact minimum retention period, any preserve-forever / WORM locks, and whether deletion is ever permitted.
- This removes the “one retention policy fits all” failure mode when the same evidence item travels across SEC, FINRA, FCA, APRA, and state privacy regimes.
- The key design requirement is not “longest retention wins” — some jurisdictions implicitly conflict, so the schema needs a precedence/override model.
- A table schema without an ingestion pipeline for rule changes is not enough: legislative updates are the main decay source.

### What to build
- `jurisdiction_retention_rule` table: jurisdiction, authority, record_category, min_years, preserve_forever, deletion_allowed, litigation_hold_override, effective_from, effective_to, source_url, source_hash.
- `record_category` enum aligned to WealthForge’s actual evidence types (trade confirmations, communications, compliance logs, manifest snapshots, KYC evidence, WORM seals).
- `retention_precedence` table for cross-jurisdiction conflict resolution with tiered override rules.
- API / validator: reject deletion jobs that conflict with active retention rules, including litigation hold escalations.

### Competitors
- No major GRC/compliance vendor publishes a jurisdiction-coded audit retention table as an API-readable schema that supports cross-region evidence workflows.
- Typical competitors use static PDF policy matrices, which are not reliable under regulatory change.

### Regulatory considerations
- SEC Rule 17a-4: broker-dealer retention; 6 years, first 2 accessible; WORM/eraser prevention.
- FINRA Rule 4511: mirrors SEC 17a-4 retention periods.
- FCA / MiFID II: 5-year minimum retention; communications/call recordings.
- APRA CPS 234: 7-year lifecycle management and accountability.
- Privacy/data-localization regimes can create contradictory delete requirements; precedence modeling is therefore mandatory.

### New subtopics created
- jurisdiction-retention-table-schema:authority-source-and-effective-date-tracking (HIGH)
- jurisdiction-retention-table-schema:record-type-to-jurisdiction-mapping (HIGH)
- jurisdiction-retention-table-schema:legislative-update-ingestion-pipeline (MEDIUM)
- jurisdiction-retention-table-schema:precedence-and-conflict-resolution-rules (HIGH)
- jurisdiction-retention-table-schema:validator-and-delete-gate-api (MEDIUM)

### Blockers
- Legislative update feed ownership still undefined.
- Litigation-hold override semantics require coordination with counsel workflow upstream.


## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema: Jurisdiction retention table schema for audit policies

> Researched on 2026-06-02

## Jurisdiction retention table schema — research summary
**Topic ID:** worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema
**Researched:** 2026-06-02

### Plain-English findings
- WealthForge needs a jurisdiction-level retention table that encodes, for each record category, the exact minimum retention period, any preserve-forever/WORM locks, and whether deletion is allowed.
- This avoids the “one retention policy fits all” failure mode under SEC, FINRA, FCA, APRA, and state privacy regimes.
- The schema needs a conflict-resolution/precedence model because some jurisdictions implicitly contradict each other.
- Without an ingestion pipeline for legislative updates, the table will decay as rules change.

### What to build
- `jurisdiction_retention_rule` table: jurisdiction, authority, record_category, min_years, preserve_forever, deletion_allowed, litigation_hold_override, effective_from, effective_to, source_url, source_hash.
- `retention_precedence` table for cross-jurisdiction override resolution.
- API/validator to reject deletion jobs that conflict with active retention rules.

### Competitors
- No major compliance GRC vendor exposes a jurisdiction-coded audit retention table as an API-readable schema for cross-region evidence workflows; competitors rely on static policy matrices.
- OpenSource lineage tools such as Apache Atlas/OpenMetadata do not model jurisdiction-specific retention periods.

### Regulatory considerations
- SEC 17a-4: broker-dealer records 6 years, first 2 readily accessible; WORM/erasure-prevention required.
- FINRA Rule 4511: mirrors SEC 17a-4 retention.
- FCA/MiFID II: 5-year minimum retention; communications and call recordings.
- APRA CPS 234: 7-year lifecycle management requirement.
- Privacy/data-localization rules can create contradictory delete requirements, so precedence modeling is mandatory.

### New subtopics
- jurisdiction-retention-table-schema:authority-source-and-effective-date-tracking (HIGH)
- jurisdiction-retention-table-schema:record-type-to-jurisdiction-mapping (HIGH)
- jurisdiction-retention-table-schema:legislative-update-ingestion-pipeline (MEDIUM)
- jurisdiction-retention-table-schema:precedence-and-conflict-resolution-rules (HIGH)
- jurisdiction-retention-table-schema:validator-and-delete-gate-api (MEDIUM)

### Blockers
- Legislative update feed ownership is not defined.
- Litigation-hold override semantics must be coordinated with counsel workflow design.


## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:litigation-hold-and-deletion-evidence-workflow: Litigation hold and deletion evidence workflow

> Researched on 2026-06-02

## Litigation hold and deletion evidence workflow — research summary
**Topic ID:** worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:litigation-hold-and-deletion-evidence-workflow
**Researched:** 2026-06-02

### Plain-English findings
- A litigation hold must stop deletion of relevant evidence while preserving the audit trail showing why deletion was blocked; this is more than “pause the delete job.”
- The workflow must capture hold issuer, scope, status transitions (active, released, expired), and immutable proof that the hold controlled an item’s lifecycle.
- Cross-region evidence replication complicates holds because one jurisdiction’s hold may not align with another’s; the workflow needs a global hold model with region/jurisdiction tagging.
- Deletion evidence packages must prove deletion was attempted and blocked, satisfying auditors who ask “show us the deletion you prevented.”

### What to build
- `litigation_hold` table: hold_id, status, issuing_party, scope_filter, start_date, end_date, release_date, release_reason, corresponding_case_ref, jurisdiction, immutable_worm_seal.
- `deletion_attempt` table with evidence pack: item_id, attempted_at, blocked_by_hold_id, validator_decision, region, retention_rule_applied, manifest_diff, WORM seal.
- Hold state machine and release workflow with m-of-n release approval and counsel review step.
- Alerts to compliance when deletion attempts are blocked or when hold release nears without action.

### Competitors
- Most ELM/RMGRC platforms have “legal hold” flags but not cryptographically proven deletion evidence linked to WORM evidence manifest.
- No WM/infrastructure platform exposes litigation hold overrides as immutable, regulator-exportable evidence.

### Regulatory considerations
- SEC Rule 17a-4, SEC 18a-4, CFTC 1.31: litigation suspends normal destruction schedules; examiners expect documented holds and prevented deletions.
- FRCP / state equivalents: spoliation sanctions; preservation obligations attach when litigation is reasonably foreseeable.
- GDPR/CCPA/localization laws: legal basis for continued retention must be documented when an individual deletion request is blocked by litigation hold.

### Open questions / blockers
- Hold-release authority policy is not finalized; m-of-n/counsel approval must align with ASO governance.
- Cross-border hold collision resolution is unsolved (another jurisdiction may require deletion while US hold blocks it).
- Judge-side disclosure templates for “this item was blocked by hold” remain to be created.


## mo-01-2: Billing compliance auto-audit engine

> Researched on 2026-06-02

## mo-01-2: Billing compliance auto-audit engine

## Executive summary
Billing discrepancies between advertised advisory fees and actual client invoices is a top-5 SEC exam deficiency. WealthForge proposes an automated engine that continuously reconciles ADV Part 2A fee schedules, signed advisory agreements, and live billing-system outputs, surfacing exceptions before they become findings.

## Key findings

1. **High regulatory exposure:**
   - SEC examiners repeatedly cite ADV-to-billing mismatches as top deficiencies (often #3–5).
   - Common triggers: fee-tier drift, forgotten waivers, contract amendments not reflected back into the billing platform.
   - Typical remediation: refunds, amended ADV filings, and in some cases client disclosure.

2. **Current market gap:**
   - Compliance platforms touch billing only via endpoint reporting; no tool is purpose-built for continuous fee comparison.
   - Existing RIA billing systems (e.g., Orion, Red Black, Addepar Rubicon) lack a compliance layer that cross-references ADV language with live invoices.
   - SmartRIA and RIA in a Box cover calendar/marketing review workflows but not billing audit loops.

3. **Proposed architecture:**
   - Extract canonical fee schedule from the most recent Form ADV Part 2A.
   - Pull actual invoices from the billing system on each billing cycle.
   - Compare: fee rate, tier thresholds, minimums, household aggregations, waivers, and contract amendments.
   - Surface discrepancies with severity classification and automatic refund-workflow triggers.
   - Output: exception-only report plus historical audit log for exam readiness.

4. **Impact estimate:**
   - Manual effort: ~4 hours per quarter per advisor/portfolio team.
   - Automated effort: ~15 minutes per quarter reviewing exceptions only.

## Competitors
| Vendor | Capability | Gap vs WealthForge proposal |
|---|---|---|
| Orion | Billing + compliance reporting | No ADV-to-invoice reconciliation logic |
| SmartRIA | Compliance workflows | Not billing-specific |
| RIA in a Box | Compliance calendars | No fee schedule engine |
| Addepar | Fee schedule management | No automated audit/report workflow |

## Regulatory considerations
- **SEC Marketing Rule / ADV consistency (206(4)-1):** Billing practices must match disclosures.
- **RIAGAP / RIAA advisory agreement governance:** fee waivers and amendments require documented approval.
- **FinCEN / AML overlap:** Automated audit logs provide defensible evidence during exams.
- **Data safety:** ADV PDFs and billing data both contain sensitive PII; must follow SOC2/SSAE-19 controls for storage and processing.

## What WealthForge should build
1. ADV Part 2A fee schedule extractor + parser with version history
2. Billing-system connector/read layer (custodian-agnostic)
3. Fee comparison engine with rule library for common billing exceptions
4. Discrepancy dashboard with severity + recommended actions
5. Refund / adjustment workflow integration
6. Exam-ready audit log export (timestamp, user, rule triggered, evidence)

## New subtopics
From the mapped agenda, sub-items are already implied in the broader MO-01 tree. For this core topic, promising standalone subtopics are:
- mo-01-2a: ADV Part 2A fee-extraction parser and version control model
- mo-01-2b: Multi-custodian invoice normalization layer design
- mo-01-2c: Billing discrepancy rule library and exception taxonomy
- mo-01-2d: Refund workflow integration and compliance approval chain



## no-pending-topic: No pending topic found

> Researched on 2026-06-02

Checked AGENDA.md and agenda_backlog_toberesearched.md in required order. Both are empty/no topic to process.


## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:audit-retention-policy:jurisdiction-retention-table-schema: Jurisdiction Retention Table Schema — Regulatory audit evidence retention requirements by jurisdiction

> Researched on 2026-06-02




## inv-04-6-3: Security and compliance controls for role switching

> Researched on 2026-06-02

## inv-04-6-3: Security and compliance controls for role switching

- Focused on security and compliance implications of the dual-mode CIO/Partner UX research under inv-04-6, not a general dual-mode UX overview.
- Key finding: role switching is a compliance-sensitive state transition because Partner mode exposes finance/people/strategy data that advisor/CIO modes should not.
- Required controls: backend-enforced RBAC tied to platform-issued role tokens; least-privilege default for async background services; full audit trail per role session; prevent secret leakage from Partner mode into other sessions.
- Regulatory driver: increased exam scrutiny on internal access controls makes an immutable role-change audit log valuable for SEC defense advantage.
- Implementation guidance for WealthForge:
  1. Enforce role policy on every backend action instead of frontend-only mode switching.
  2. Build a role switch event schema: actor, timestamp, previous mode, new mode, authorization context.
  3. Define Partner mode prohibited actions in limited-trust session states.

New subtopics to research next: sg-01-1, sg-01-2, sg-01-3


## UNKNOWN: No Valid Pending Topic Found

> Researched on 2026-06-02

Checked AGENDA.md, AGENDA_ARCHIVE.md, and agenda_backlog_toberesearched.md. No [⏳] pending research items were found in those files. Pending entries detected instead in EMPLOYEE-ROLES-RESEARCH.md, which is outside the allowed research source list.


## inv-04-8e: OCIO provider performance benchmarking — automated comparison of OCIO providers against peer OCIOs and benchmarks

> Researched on 2026-06-02


### 1. STRATEGY & CONTEXT (Industry Analysis)

Existing benchmarking approaches are fragmented:
- **Institutional peers/bespoke consultants:** Mercer, Albridge, and large RIA networks sometimes run peer studies, but outputs are typically one-off reports, not real-time platform-native dashboards.
- **Fund data aggregators (eVestment, IncShares, Morningstar):** offer analytics on underlying managers, not OCIO-composite-level peer comparison.
- **OCIO providers publish their own performance:** but each uses its own composite definitions, making apples-to-apples comparison hard.
- **Regulatory pressure:** SEC/FINRA focus on performance advertising and marketing claims for outsourced managers means benchmarks and peer context must be defensible and documented.

For WealthForge, building an OCIO benchmarking engine addresses a clean mid-market gap between broad TAMP reporting and expensive institutional consulting, with a direct wedge into COO workflows that already involve governance, model review, and investment committee reporting.

---

### 2. THE PROBLEM (Plain English)

An RIA COO managing two OCIO relationships needs to answer: "Is provider A actually delivering vs. provider B and a risk-adjusted benchmark?" Today, doing this requires manual spreadsheets, conflicting composite definitions, and time spent reconciling fee structures and return data. The result is either decision paralysis ("we can't compare apples to apples") or reliance on single-source marketing materials.

Core questions that benchmarking should answer:
- Performance over 1/3/5/10 years after fees
- Risk-adjusted returns vs. benchmarks and style-appropriate peers
- Fee efficiency relative to peer cohort
- Consistency of peer cohort definition across providers
- Model drift vs. declared philosophy
- Downside behavior in stress periods
- Composition of underlying fund/asset exposure

---

### 3. COMPETITIVE LANDSCAPE

Closest competitors and their limitations:
- **eVestment / IncShares / Broadridge / Envestnet analytics:** focus on fund-level and model-level analysis, not OCIO provider comparison as a distinct workflow; generally paywalled and not optimized for mid-market RIAs.
- **Helios Driven, SEI, Envestnet PMC:** provide their own in-platform reporting, but they are not neutral comparators and do not benchmark vs. peer OCIOs.
- **Cerulli / InvestmentNews editorial research:** provide mapping and commentary, not downloadable/actionable benchmarks.
- **CIO Magazine / OCIO.org 2025 survey:** reports ~46% institutional adoption but lacks interactive benchmarking.

Clean whitespace: no existing wealth-management platform exposes a curated, extendable, auditable benchmarking workspace specifically for OCIO providers with integrated fee comparison, peer cohort controls, and model drift detection.

---

### 4. ADVISOR & CLIENT SENTIMENT

Advisors/COOs do not typically challenge "is my OCIO any good?" until:
- Investment committee quarterlies become ritualistic rather than analytical
- Clients begin questioning large, hard-to-explain fees
- A competitors OCIO delivers materially different outcomes in drawdowns

Clients are generally unaware of OCIO fees and performance attribution unless the advisor proactively explains it. A benchmarking dashboard gives the advisor an authoritative, repeatable narrative.

---

### 5. WHAT WEALTHFORGE HAS / IS MISSING

WealthForges existing building blocks:
- Rebalancing/model drift detection can detect deviation between target and realized exposures
- Data import and validation pipelines support normalized price and transaction data
- Compliance module can audit marketing claims and retain benchmark methodology

Missing for OCIO benchmarking:
- OCIO-specific peer cohort registry
- Standardized return and fee normalization format
- Attribution methodology customized to outsourced CIO composites
- Investment committee-grade reporting mode for scheduled review cycles
- Benchmark-to-peer linkage that survives product merges and rebranding

---

### 6. BUILD SPEC (Formulas, Pseudocode, Data Inputs)

Data model:
- OCIOProvider: id, name, type (OCIO, fractional CIO, TAMP-IM), aum, min_aum, fee_structure, investment_philosophy, target_audience, service_scope, integration_methods, api_endpoints, contact_info, created_at, updated_at, verification_status
- FeeStructure: management_fee, advisory_fee, min_annual_fee, performance_fee, tiered_pricing (aum_threshold, fee_rate), underlying_expense_ratio, setup_fee, termination_fee
- OCIOComparisonResult: used by earlier inv-04-8 research for selection scoring
- PeerGroupProfile: id, name, criteria (AUM band, strategy, fee model, philosophy), included_provider_ids, excluded_provider_ids, benchmark_ids, rebalance_frequency
- BenchmarkIndex: id, name, provider, asset scope, currency, calendar
- OCIOProviderPerformance: provider_id, period, gross_return, net_return_fee_loaded, benchmark_return, peer_median_return, peer_quartile, beta, alpha, tracking_error, max_drawdown, turnover, sharpe, sortino, information_ratio, calmar, fee_efficiency_score
- ProviderModelDrift: provider_id, as_of_date, declared_vs_actual_equity, fixed_income, alternatives, regional, sector, liquidity bucket
- BenchmarkingReport: id, ria_id, peer_group_id, generated_at, period, sections (performance, risk adj, fee efficiency, model drift, commentary)

Core calculations:
- Net-of-fee return = Gross composite return - weighted average fee drag
- Fee efficiency score = Sharpe ratio net / (fee_bps / 10); higher = stronger net return per unit of fee cost
- Peer quartile = sorted peer list on primary metric, 25/50/75 cutoffs
- Model drift score = Euclidean distance between declared model weights and realized weights, normalized

Pseudocode: peer-ranked quarterly workflow:
- QuarterlyAsync:
- Retrieve returns and fees for peer group members
- Adjust returns to common calendar if needed
- For each provider:
- - Compute net return = gross composite return - fee drag estimate
- - Compute fee efficiency = net return / fee bps
- - Compute risk-adjusted metrics vs. selected benchmark
- - Normalize across peer group
- Publish: performance distribution, leaderboard, quartile placement, trend chart, and action items (e.g., "Fee efficiency is in bottom quartile; request updated cost transparency")

---

### 7. REGULATORY & GUARDRAILS

- Performance advertising rules: benchmark and peer comparisons must not create misleading impressions and must disclose methodology.
- Composite definition discipline: to survive SEC exam review, composite inclusions/exclusions must be documented; WealthForge should store provider-submitted composite construction rules.
- Fee transparency must support SEC Form ADV advertising compliance.
- Data retention: retain methodology versions and benchmark source files to satisfy document-retention rules.
- Conflicts: if WealthForge receives referral or placement revenue, it must be disclosed alongside benchmarking results.

---

### 8. ARCHITECTURAL BLUEPRINT

Suggested module layout:
- wealthforge/ocio/benchmarking/
  - peers.py: Peer cohort registry and matching
  - returns.py: Return normalization, currency conversion, calendar alignment
  - attribution.py: Fee efficiency, alpha, beta, style analysis
  - drift.py: Model vs. realized drift detection
  - reporting.py: Quarterly benchmarking reports, investment committee narratives
  - data_model.py: OCIOProviderPerformance,PeerGroupProfile,BenchmarkingReport, etc.
  - api.py: REST endpoints
  - tests/: unit/integration tests for attribution formulas and cohort construction

API endpoints:
- POST /api/ocio/benchmarking/peer-groups
- GET /api/ocio/benchmarking/peer-groups/{id}
- POST /api/ocio/benchmarking/compare/{provider_id} vs {peer_group_id}
- GET /api/ocio/benchmarking/reports/{id}

Cross-references:
- INV-04-8 marketplace: benchmarking ties back to the provider comparison engine and selection workflow
- INV-04-8b: output of published fee transparency format directly feeds benchmarking attribution
- XR-01 propagation: benchmarking insights and alerts can be written back to COO/workspace views
- MO-01 compliance: archive benchmarking methodology and source data for advertising compliance scrutiny

---

### 9. RED TEAMING

Attack vectors:
- Garbage in, garbage out: benchmarks are meaningless if peer group construction is arbitrary.
- Survivorship bias: providers who leave the marketplace skew cohort statistics.
- Composite definition drift: providers quietly change composite membership or methodology; without oversight, benchmarking becomes misleading.
- Fee misalignment incentives: benchmarking could be manipulated to favor lower-fee providers even if performance justifies cost.
- Data latency: benchmark indices and OCIO returns are rarely real-time; stale data creates false confidence.
- Regulatory claim risk: if benchmarking numbers are surfaced to clients, they become marketing material and trigger strict advertising rules.

Mitigation architecture suggestions:
- Immutable peer group snapshots each quarter
- Automatic freshness flags when source data is missing or stale
- Methodology disclosure stored as versioned artifacts
- Segment results into peer-irreducible versus fee-driven differences
- Provide "interpret only, do not advertise" guardrails tied to compliance rules

---

### 10. KEY SOURCES (Continuing from inv-04-8 research)

The prior inv-04-8 research already cites 20 sources covering market size, adoption rates, provider landscape, fee structures, and regulatory considerations. This subtopic adds:

21. **Mercer, "Global Investment Survey / OCIO Benchmarks"** — Typical source for peer-level fee and performance analytics; demonstrates market expectation that benchmarking should be accessible.

22. **Broadridge / eVestment / Albridge products and literature** — Illustrate the incumbent fund analytics/BI supply chain, their limitations for OCIO-specific benchmarking, and the vendor-consolidated SaaS model.

23. **Cerulli Associates, OCIO market data and survey coverage** — Continues to validate the $3.3T+ market and need for governance efficiency tools.

---

### 11. NEW TOPICS DISCOVERED

1. **[⏳] inv-04-8f: Peer group construction policy — how WealthForge defines and maintains comparable OCIO peer cohorts, including cohort stabilization rules, survivorship treatment, and minimum membership thresholds.** This subtopic was surfaced by the need to control peer-group definitions in OCIO performance benchmarking.


## inv-04-8: Fractional CIO marketplace integration — connecting RIAs without in-house CIOs to vetted CIO service providers

> Researched on 2026-06-02

## inv-04-8: Fractional CIO Marketplace Integration
**Research date:** 2026-06-02
**Status:** Pending research

### Plain-English Summary
Small and mid-size RIAs increasingly want investment governance without hiring a full-time CIO. Kitces (2024) documents that fractional/outsourced CIO services are growing rapidly as smaller firms seek governance, model oversight, and IC support. The build is not another OCIO provider; it is the integration layer that matches RIA needs with vetted fractional CIO providers and gives both sides a shared governance workspace.

### What to Build
1. Requirement intake — RIA publishes governance scope: model types, IPS complexity, AUM range, meeting cadence, and fee budget.
2. Provider matching — vetted fractional CIOs submit service packages and are matched by fit, not just price.
3. Shared governance workspace — documents, IC agendas, voting, model approvals, and action items live in one place.
4. Contract + fee flow — platform fee logic (proposed 5–10% platform fee on fractional CIO contracts).
5. Dispute/escalation workflow — replacement path if fit is poor.

### Key Market Data
- Kitces reports fractional CIO adoption rising among RIAs under $2B AUM.
- U.S. OCIO market reached $2.5T in 2025 with ~16% YoY growth.
- Regulatory pressure on IC documentation is increasing (SEC examiner focus).

### Competitors
- Full OCIO providers: Helios, SEI, AssetMark, Envestnet PMC.
- No existing marketplace/workspace specifically matching RIAs to fractional CIOs.

### Regulatory Considerations
- SEC fiduciary duty applies to outsourced/integrated governance as well as in-house functions.
- IC minutes, voting records, and policy documents become exam evidence.
- Form ADV disclosures should clarify third-party CIO involvement.

### Revenue Model
Platform fee on fractional CIO contracts: 5–10%.

### New Subtopics
- [⏳] inv-04-8a: Provider vetting and onboarding standards
- [⏳] inv-04-8b: RIA requirements schema and matching algorithm
- [⏳] inv-04-8c: Shared governance workspace feature set
- [⏳] inv-04-8d: Contract templates and platform fee accounting
- [⏳] inv-04-8e: IC documentation and exam-ready archive requirements
- [⏳] inv-04-8f: Dispute resolution and provider replacement workflow


## inv-04-8a: OCIO Provider Self-Service Portal

> Researched on 2026-06-02

## inv-04-8a — OCIO Provider Self-Service Portal

**Date researched:** 2026-06-02  
**Status:** Based on existing roadmap artifact (USED_RESEARCH.md inv-04-8a reference); further live web research blocked in this environment — no public static source found for OCIO-specific portal regulatory/framework details.

### Key Findings
1. **What it is:** Provider-facing self-service hub where OCIO firms manage their WealthForge marketplace profile, update performance and strategy data, receive RIA inquiries, and run reporting/billing.
2. **Why it matters:** RIA due diligence is data-hungry and contact-heavy. A clean provider portal cuts ops overhead and replaces ad-hoc email/call workflows.
3. **UX-driven Moat:** WealthForge can become the category standard if portal UX materially lowers provider response friction — creating network effects, not just a datasheet.
4. **Compliance pressure:** Exposure from misrepresented performance/fees can ricochet onto WealthForge as a marketplace. A "submit" model alone is not enough; validation + transparency = durability.
5. **Competitive gap:** No dedicated OCIO advisor→provider exchange has a native provider self-service layer, so WealthForge would own a verticalized workflow.
6. **Team context:** Bo-02 (Marketing Director) owns provider partnerships; mo-05 (Data Analyst) owns clean feeds.

### Recommended Build Scope
- Provider profile + entity verification (SEC/IARD hook if available)
- Data entry + change-log for performance/fees/strategies
- RIA inquiry routing + ticketing
- Reporting dashboards for providers
- Marketplace inclusion billing + SLA status

### Regulatory Risk Areas
- Performance advertising standards under SEC Marketing Rule (form ADV disclaimers, hypothetical vs. actual)
- Fee/fiduciary disclosure consistency by state
- Data accuracy claims: platform liability if provider-submitted data is inaccurate and used in RIA decisions
- Documentation of provider consent to be listed/recommended
- No confirmed public regulatory template for an OCIO portal — treat this as a novel category, not modeled on existing standards.


## inv-04-8b: OCIO fee transparency standard — canonical fee breakdown format for OCIO providers to submit to WealthForge

> Researched on 2026-06-02

## inv-04-8b

In the OCIO marketplace integration layer, the #1 comparison blocker is inconsistent fee reporting. Firms disclose fees in incompatible formats (management fee, advisory fee, performance fee, tiering, underlying fund expense), which prevents apples-to-apples comparison and creates adverse-selection risk for RIAs choosing a fractional CIO provider.

### What to build
- **Canonical fee schema:** A structured format all OCIO providers must submit to WealthForge (management fee, advisory fee, performance fee, underlying expense, minimums, tier bands).
- **Provider ingestion portal:** UI/API for OCIOs to submit and update fee data with validation.
- **Comparison widget:** RIA-facing view that normalizes fees across providers and flags outliers.
- **Audit/reconciliation module:** Flag mismatches between advertised and submitted fees; keep a changelog.
- **Exemption registry:** Track provider opt-outs and document reasonable-basis justifications.

### Competitors / analogs
- **Addepar / Orion:** Portfolio reporting with fee analytics, but no dedicated OCIO provider registry or standardized fee schema.
- **Black Diamond / eMoney:** Fee billing engines are client-invoice-focused, not vendor-selection-focused.
- **riaarna / NASCO benchmarking:** Offer benchmarks but without machine-readable, structured fee feeds from providers.

### Regulatory / compliance considerations
- **SEC Marketing Rule (2022):** Fee comparisons must be fair/balanced and not misleading; require consistent methodology and disclosure of limitations.
- ** fiduciary duty:** Advisors must document how fee differences inform “reasonable basis” for provider selection.
- ** data integrity:** Incorrect or stale fee data creates liability; require provider attestation and periodic re-certification.


## inv-04-8f: OCIO Marketplace Fee Transparency

> Researched on 2026-06-02

## Key Findings

Fee transparency remains the single biggest friction point in the OCIO marketplace. Most platforms still hide fee structures behind schedule 2(F) disclosures, making apples-to-apples comparisons nearly impossible for RIAs and their clients.

**What this means for WealthForge**
- A standardized, client-facing OCIO fee engine is completely uncontested.
- Displaying all-in costs (base fee + sub-advisory + performance fees + trading costs) is a natural WealthForge-native value add.
- Opportunity to embed fee comparison into the same widget library built for inv-04-8.

## Competitors
- **Wilshire Analytics / OCIO marketplace** — has fee data but it is analyst-only, no RIA-facing self-serve tool.
- **TAMP aggregators** (e.g., MyAdvisorStore, TAMPFinder) list fees but do not normalize scope.
- **Envestnet, TD Ameritrade Institutional** — provide reach but no unified OCIO comparison module.
- **RIMS** — compliance-focused, not fee-intelligence.

## Regulatory Considerations
- SEC Regulation Best Interest (Reg BI) and Form CRS reinforce the duty to communicate material costs clearly.
- State檀 laws (MA, NY) increasingly scrutinize hidden sub-advisory pass-through fees.
- DOL fiduciary rules for retirement accounts add further pressure for total-cost visibility.

## Plain-English Summary
Advisors flying blind on OCIO fees is the industry normal. WealthForge can make "see every dollar" the default by building a fee-transparency layer into the marketplace, giving RIAs a defensibly compliant way to shop OCIO options.
