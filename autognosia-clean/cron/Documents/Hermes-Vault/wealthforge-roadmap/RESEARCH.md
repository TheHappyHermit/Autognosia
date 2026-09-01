
# Transition-model rule engine — state estate/inheritance tax grandfathering eligibility

**Topic ID:** `esta-2a-1-s2-s2`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## Background

State-level estate and inheritance tax compliance increasingly involves emergency retroactivity windows and temporary state surcharges or grandfathering rules. WealthForge's state registry already captures exemption tables and rate schedules, but determining client/trust-level eligibility for grandfathering requires an executable rules layer.

## What to build

A server-side rule engine that evaluates whether a trust, estate, or beneficiary qualifies for grandfathering, transition relief, or exemption windows.

- Inputs: irrevocability date, instrument type (revocable/irrevocable, ILIT/CRT/dynasty/etc.), election status, prior law exposure, beneficiary class, domicile.
- Outputs: eligibility determination, confidence score, required documentation checklist, representation/warning language.
- Change propagation: when a state enacts a retroactive window or temporary surcharge, ingest the rule and revise determinations for affected client cohorts automatically.

## Key components

1. Eligibility predicate library:
   - Irrevocability date comparator vs. legislative effective date.
   - Instrument taxonomy classification by statute.
   - Election-state tracking for QTIP, ADZ, portability, annual exclusion carryovers.
2. Cohort engine:
   - Map clients/entities to instrument profiles for bulk determination.
   - Track downstream substitution/timing events that could change eligibility.
3. Audit and validation:
   - Audit log showing legislative trigger, affected cohort, rule version, and final determination.
   - Validation suite preventing overlapping retroactivity windows from creating mutually exclusive results.

## Competitors/comparable approaches

- State tax research platforms in the legal tech space (Bloomberg Tax, CCH, Thomson Reuters) provide rule summaries but lack client-level eligibility execution and cohort tracing.
- Compliance automation vendors (Ontra, Revelio) handle document workflow, not statutory eligibility logic.

WealthForge can win with a client-data-native implementation: regular client records, instrument data, domicile history, and automated cohort identification without manual legal research.

## Regulatory considerations

- Estate/inheritance tax rules vary by state with minimal harmonization.
- Emergency/session bills frequently include retroactive effective dates.
- Fiduciary risk of incorrect eligibility determinations calls for confidence scoring, disclosure language, and advisor review prompts.

## Foundational context from existing WealthForge research

- RES-esta-2a-1 state exemption schema already versioned with effective-date fields.
- Estates/inheritance module already models beneficiary-class tax calculations.
- This rule engine should operate on top of the schema, not duplicate data modeling.

## Suggested subtopics

- `state-grandfathering-predicate-library`
- `cohort-eligibility-mapper`
- `retroactivity-audit-log`
- `advisor-review-gateworkflow`

# Grandfathering rule format design for state estate/inheritance tax transition engine

**Topic ID:** `grandfathering-rule-format-design`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

**Focus:** Canonical rule representation, validation approach, and audit design for trust/instrument grandfathering eligibility.

**What to build:**
- `grandfathering-rule-format-design` — Define a canonical decision-table format for grandfathering rules. Each rule should express: (1) eligibility conditions (instrument type, irrevocability date, election status, beneficiary class), (2) effective date windows (law effective date, retroactivity start/end), (3) outcome (grandfathered = old rates vs. subject to new rates = new rates), and (4) override metadata (legislative citation, effective date, sunset clause).
- Recommended representation: Decision Model and Notation (DMN) tables, versioned per state, exported to JSON for runtime engine consumption. Rationale: DMN is W3C-standard, auditable by non-developers, and maps cleanly to rule engine execution.
- JSON schema for a single rule block:
  - `rule_id` (string, e.g., `WA-2024-EST-1`)
  - `state` (2-letter code)
  - `tax_type` (`estate` | `inheritance`)
  - `effective_date` (ISO-8601)
  - `retroactive` (boolean)
  - `conditions` (array of condition objects with `field`, `operator`, `value`)
  - `outcome` (object with `grandfathered` boolean, `rate_schedule_id`)
  - `legislative_citation` (string)
  - `notes` (string)
- Edge cases to encode: (a) trusts with concurrent situs (multi-state), (b) partial-year grandfathered status, (c) QTIP/portability election timing, (d) amendments that revoke prior grandfathering.

**Competitive landscape:**
- Zero wealth management platforms provide state estate/inheritance tax grandfathering rule engines. The only comparable logic exists in niche estate-tax compliance tools (e.g., TaxYears, EstateGuru) which are manual calculators without API or decision-table workflows.
- Enterprise tax engines (Vertex, Sovos) model sales-tax transition rules but do not cover estate/inheritance tax.
- Legal document automation platforms (HotDocs, ContractExpress) can codify fixed templates but lack dynamic eligibility evaluation from client fact patterns.

**Regulatory / compliance considerations:**
- State legislatures may apply new estate/inheritance tax changes retroactively with or without grandfathering windows (e.g., Washington 2021 applied broadly retroactively; Connecticut 2023 provided limited grandfathering for irrevocable trusts).
- Rule authoring must track legislative version history and effective dates precisely; miscalculating grandfathering status can produce wrong tax liability and malpractice exposure.
- Audit trail must preserve: rule version, client facts hash, evaluation trace, and outcome, per SEC Marketing Rule accuracy requirements and fiduciary duty.
- State-specific nuances: some states use date-of-death tests; others use irrevocability date; some require affirmative election. The rule format must support all three.

**Validation strategy:**
- Automated regression tests per state: synthetic fact patterns with known outcomes from legislative counsel.
- Boundary testing: dates exactly on effective/retroactive boundaries, leap years, time-zone edge cases for electronic filings.
- Cross-state conflict testing: same client facts under competing state rules when domicile is disputed.

**Implementation priority:**
- Minimum Viable Format: JSON decision tables covering 5 high-churn states (WA, CT, NY, OR, MA) with 10-15 rules each.
- Authoring UI: YAML/JSON text editor with validation + visual decision-tree preview.

# Grandfathering decision audit format

**Topic ID:** `grandfathering-decision-audit-format`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# grandfathering-decision-audit-format

## Executive Summary
- Audit format purpose: immutable, queryable record of each grandfathering eligibility decision for compliance, replay, and adjudication.
- Design target: JSON + append-only log backend (event-store style) with REST + gRPC read paths and signed digest chain for integrity.

## Plain-English Findings
1. Eligibility decisions are state-dependent and multi-factor (irrevocability date, instrument type, election status, domicile history).
2. Auditors and advisors need inspectable provenance, not just pass/fail.
3. Same facts can change if underlying law changes; version correlation is required.
4. Automated appeals/disputes need structured evidence packets, not free text.

## What to Build
- **Decision envelope schema** per evaluation:
  - `decision_id`, `subject_id`, `policy_version`, `jurisdiction`, `effective_at`, `determined_at`
  - `input_facts_hash` (opaque commit to preserve privacy), `matched_rule_id`, `result`, `confidence`
- **Explanation block**: chain of rule hits, nullifiers, disambiguations, and override flags.
- **Evidence envelope**: source citations, effective-date references, manual override justification (if any).
- **Provenance chain**: `previous_decision_id`, `recomputed` flag, `schema_version`, `schema_valid`.
- **Compliance envelopes**:
  - SEC/RIA recordkeeping obligations: retention >= 6 years; searchable by client/jurisdiction.
  - AML/KYC tie-in: document decision data provenance if client profile changes after initial determination.
  - Data-minimization: store hashed input facts for scenarios where raw PII cannot persist.

## Competitors / Analogues
- **Camunda DMN audit log**: operational, not compliance-ready; lacks SEC-oriented retention/search.
- **Drools / Red Hat Decision Manager**: audit log is append-only but no standardized envelope; integration requires custom build.
- **PolicyAuthor / OneSpan**: policy audit is eval-centric, limited multi-state tax modeling.
- **ServiceNow GRC / LogicManager**: governance risk tooling; do not run tax decision logic, so no decision envelope schema.
- **Apex / Onit**: contract workflow audit, not tax-rule decision audit.
- **No direct competitor** currently offers integrated grandfathering decision envelopes tied to state tax registry + DMN + SEC-style retention.

## Regulatory Considerations
- **SEC Rule 204-2 / Advisers Act recordkeeping**: decisions affecting client investment advice or account management are records.
- **FINRA Rule 3110 / 4530**: depends on bank/BD affiliation; similar retention and supervisory obligations.
- **IRS Circular 230**: tax practice diligence requirements; audit trail supports due diligence defense.
- **State bar / CPA** professional standards: support workpaper requirements.
- **Privacy / data minimization**: use hashes and reference IDs; limit PII in audit payload.

## Pseudocode / Data Model Reference
```json
{
  "decision_id": "uuid",
  "subject_ref": "client_hash",
  "policy_version": "state-WA-2025Q3",
  "jurisdiction": "US-WA",
  "effective_at": "2026-01-01T00:00:00Z",
  "inputs": { "hash": "<sha256(serialized_facts)>" },
  "matched_rule": "WA-GRF-2025-04",
  "result": "grandfathered",
  "confidence": 0.94,
  "explanation": {
    "rule_chain": ["WA-GRF-2025-01","WA-GRF-2025-04"],
    "evidence_refs": ["DOC-REF:XXX"],
    "manual_override": null,
    "disambiguation_notes": null
  },
  "schema_version": "v1",
  "created_at": "2026-06-01T08:00:00Z"
}
```

## Implementation Notes
- Queue append path should be idempotent; use `decision_id` as primary key.
- Backfill pipeline must rehydrate historical decisions against newer rule versions when registry updates.
- Query API should support: subject timeline, jurisdiction cohort, rule impact, date-window anomaly report.

## New Subtopics / Follow-ups
- `grandfathering-decision-audit-api`
- `grandfathering-decision-digest-chain`
- `grandfathering-decision-rehydration-migration`

# Grandfathering Decision Digest Chain

**Topic ID:** `grandfathering-decision-digest-chain`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# Research: Grandfathering Decision Digest Chain

## Overview
A signed digest chain is a sequential integrity verification method for append-only audit logs, such as those used for eligibility decisions. By chaining cryptographic hashes together, the system can prove that any record has not been altered or reordered, which is critical for compliance and regulatory audit requirements in wealth management and estate planning.

## What to Build
- Deterministic digest over decision batches, including:
  - `batch_id`, `timestamp`, `policy_version`, `client/trust identifiers`, `eligibility outcome`, and `previous_digest`.
- Recommendations:
  - Use content-addressed immutable log storage (S3 with object lock, AWS QLDB, or equivalent).
  - Compute SHA-256 digests over JSON canonicalized payloads.
  - Store `previous_digest` with each record to form a linked chain.
  - Provide a `verify_chain(start,end)` API returning integrity status.

## Competitors / Ecosystem
- Notary services and blockchain-backed auditable logs, e.g., OpenZeppelin Defender, Hyperledger Fabric.
- AWS QLDB provides a built-in journal digest feature suitable for financial compliance.
- Commercial audit tools like Netwrix, Varonis, and compliance-grade event stores add change-detection but not typically eligibility-decision chaining.

## Regulatory Considerations
- SEC 17a-4 / CFTC 1.31: immutable recordkeeping requirements.
- IRS Circular 230 and fiduciary records: retain supporting documents and audit trails.
- State insurance department IT examination standards often require professional audit trail controls.
- GDPR erasure conflicts must be handled via pseudonymization or segmentation rather than deletion.

## Implementation Notes
- Key rotation plan is required: archived digests signed under old keys must remain verifiable.
- Include batched Merkle tree support if performance requires threshold verification for large cohorts.
- Ensure deterministic serialization (`sort_keys=True`, stable separators) across languages.

# DMN Engine Evaluation for Grandfathering Rules

**Topic ID:** `grandfathering-rule-format-dmn-engine-evaluation`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## Overview
For executable compliance decision tables that must evolve without code deploys, the leading options are:

- Camunda DMN runtime (includes the Zeebe engine): OMG-standard DMN execution with high-performance microservice orchestration, FEEL support, and decision-requirements diagrams. With the recent Zeebe deepening and local HTML tutorials, it remains the reference implementation for business-led decision tables.
- Drools + Kogito: Red Hat-backed rule/DMN engine that compiles decision tables to native executables (Quarkus/Kogito). Strong for embedding decision tables into Java microservices.
- Open-source lightweight DMN runners: e.g., `dmn-js` / `dmn-node` helpers for NodeJS, or Python packages like `dmn-python` if WealthForge needs serverless or data-science runtime.

## Build vs. Integrate considerations
- Advisory states already contain the rule model (eligibility facts + conditions), so a DMN engine works well as an abstraction layer.
- Open standards minimize vendor lock-in; OMG DMN guarantees future tooling portability.
- Operational: Camunda workflows include built-in audit/history, which aligns with compliance requirements.

## Competitor / incumbent landscape
No major wealth RIA platform exposes a public grandfathering/DMN engine. Existing provider portals use static PDF rulebooks or bespoke logic, so a DMN-first approach is itself an innovation wedge.

## Regulatory considerations
- Decision audit trails must capture input facts, evaluated table version, timestamp, and resulting eligibility decision.
- FEEL expressions used in tax rule conditions should be reviewed for numerical precision (avoid floating-point surprises).
- State-specific retroactivity windows require schema versioning; DMN semantics with explicit decision IDs ease provenance tracing.

## Recommendation
Start with Camunda DMN for modeling + REST execution; add Drools/Kogito only if JVM-native microservice requirements dominate later.

# Drools/Kogito vs Camunda DMN Runtime Alternative Analysis

**Topic ID:** `dmn-engine-drools-kogito-alternative-analysis`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# Drools/Kogito vs Camunda DMN Runtime Alternative Analysis

## Plain-English findings
- WealthForge should evaluate an alternative JVM-native DMN runtime because the current Camunda choice may be heavier than needed if the roadmap only requires standalone decision tables, not full BPMN orchestration.
- **Build complexity:** Drools/Kogito (Quarkus-based) offers simpler, lighter archetypes optimized for cloud-native services and GraalVM native images; Camunda 8 (via Zeebe) has a steeper operational footprint and learn-ing curve for pure-DMN use.
- **Image-native deployment:** Kogito/Quarkus native-image builds are first-class and production-hardened; Camunda’s native-image support improved recently, but historically requires more tuning and is secondary to its JVM deployment story.
- **Observability:** Both expose Micrometer metrics, but Kogito inherits Quarkus telemetry with lower boilerplate. Camunda’s observability is richer because of its broader process runtime.
- **FEEL parity:** Both engines support the FEEL spec well for grandfathering rule expressions. Cache/memory strategy differs: Kogito evaluates stateless decision tables with smaller memory profiles vs Camunda’s process-stateful runtime.
- **Competitor/platform position:** Camunda is favored when the roadmap needs BPMN + case management alongside DMN. Drools/Kogito is favored when you want lean decision services in Kubernetes with fast startup, lower MC/DC, and smaller image size.

## What to build
- Standalone DMN microservice container running grandfathering decision tables via REST/gRPC.
- Canary decision service: shadow Kogito evaluation against Camunda for the same rule set to validate FEEL parity and detect engine-specific behavior differences before an architectural decision.

## Regulatory considerations
- Executable decision table auditability: both engines emit evaluation trace/context logs. Drools/Kogito’s JSON out is simpler to store in an append-only audit log; Camunda’s operator logs are richer but heavier.
- JVM在王 WealthForge stack keeps both options within existing security boundary and secrets management posture—no new compliance surface beyond deployment pipeline hardening.

## Recommendation
- If WealthForge’s timeline stays decision-table-only, prefer Drools/Kogito. If business process orchestration is in the 12–24 month roadmap, stick with Camunda to avoid later migration cost.

# Decision-tree / rule-flow visualization for advisors

**Topic ID:** `grandfathering-rule-visualization-module`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## What to build
Build a first-class visualization module that renders eligibility logic from the grandfathering rule registry as an inspectable decision tree / rule-flow diagram.

- **Primary view:** Evaluated eligibility path for a given client, showing inputs, resolved rule branches, and final outcome.
- **Secondary view:** Full rule-flow diagram of the underlying decision table/model for compliance reviewers.

## Competitors and reference patterns
- **Camunda Modeler / DMN diagrams** provide standard DMN decision-requirements diagrams (DRD) and required-rule visualizations.
- **Drools Workbench / Kogito** includes decision graph views from Decision Model and Notation (DMN) tables.
- **Fintech compliance platforms** often expose rule-flow views tied to audit logs with highlighted active code paths.
- **Tax compliance research tools** such as CCH, Bloomberg Tax, and ONESOURCE provide decision-rule navigation; most are commercial and narrow.

## Visualization tools / libraries to consider
- **React Flow** / **X6** / **D3** for custom rule-flow and decision-tree rendering.
- **Mermaid** or **bpmn.io** models for lightweight, markdown-embeddable diagrams.
- **DMN visualization libraries** tied to the chosen DMN runtime for 1:1 fidelity.
- **Graphviz / Dagre** for deterministic, version-controllable layout of rule systems.

## Regulatory and compliance considerations
- **Evidence preservation:** Any rendered path must include a reference to the specific rule version applied and timestamp, typically via the existing audit-log linkage.
- **Tamper evidence:** Visualizations should be generated from immutable rule snapshots; runtime-cached images should be signed or logged.
- **Professional responsibility:** Advisors reviewing a visualization must still validate against underlying authoritative logic; do not treat the diagram as legal advice.
- **Disclosure:** In FINRA/RIA contexts, disclosures should clarify that rule-flow diagrams are explanatory aids and not guarantees.

## Plain-English implementation guidance
1. Render a read-only graph of the rule registry OR evaluate client-specific inputs to highlight the active branch.
2. Show rule metadata inline: effective date, exemption class, jurisdiction, and retroactivity flags.
3. Link each node/edge to audit record and source legislation citation.
4. Provide beforeEach/after-versions diff view when rules are updated.

## Suggested next subtopics
- **grandfathering-rule-visualization-module-1: Library and layout engine selection** HIGH
- **grandfathering-rule-visualization-module-2: Client-path evaluation renderer** HIGH
- **grandfathering-rule-visualization-module-3: Version-diff visualization mode** MEDIUM
- **grandfathering-rule-visualization-module-4: Advisor and compliance disclosure policy** MEDIUM

# Retroactivity audit log and validation suite

**Topic ID:** `esta-2a-1-s2-s3`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# esta-2a-1-s2-s3: Retroactivity audit log and validation suite

## Summary
Build a system to track legislative triggers, affected client cohorts, and enforce rules against overlapping unauthorized retroactivity windows.

## What to Build
1. Retroactivity Audit Log — Immutable append-only log capturing every legislative change, effective date, and retroactivity clause with full provenance metadata.
2. Cohort Engine — Map affected client populations to retroactivity triggers using dynamic eligibility criteria (age, residency, account type, transaction date).
3. Overlap Validator — Detect and prevent overlapping retroactivity windows that would create unauthorized double-counting or conflicting obligations.
4. Compliance Dashboard — Real-time view of pending retroactive changes, client exposure, and remediation status for advisors/compliance.

## Competitors / Landscape
- **Visible Alpha** / **State Street** — Provide legislative change tracking but not client-cohort retroactivity mapping.
- **Checkpoint** (RIA/compliance) — Tracks rule changes but lacks retroactivity-specific engine.
- **Clarity AI**, **RegTech solutions** — Focus on ESG or broad regulatory change; no estate/inheritance tax retroactivity domain model exists.

## Regulatory / Domain Context
- Estate/inheritance tax exemption rules and portability often include emergency session amendments with retroactive effective dates.
- State legislatures sometimes apply retroactive changes without grandfathering windows; advisors must advise clients before bill enactment.
- IRC §2010, §2053, §6018, §6324 interact with state-level elections and portability; retroactivity challenge grounds vary by state.

## Data Model Essentials
- `legislative_trigger`: session, bill_id, effective_date, retroactivity_start, source_document_hash
- `affected_cohort`: client_id_segment, eligibility_rule_ref, cohort_version, method (inclusion/exclusion)
- `retroactivity_window`: trigger_id, start, end, authorization_basis (e.g., supreme court precedent, statutory grant)
- `overlap_detection_result`: window_a, window_b, overlap_type, severity, recommended_action

## Build Priority Considerations
Highest value: Overlap Validator and Cohort Engine, because hidden retroactivity conflicts create liability. Audit log is foundational; dashboard is last.

## Related WealthForge References
- esta-2a-1-s4: Source parsing modules
- esta-2a-1-s5: Schema authoring validation suite
- esta-2a-1-s3: Authoring UI workflow

# Estate tax reversion stress testing

**Topic ID:** `uhnw-02`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

Modeled estate tax reversion triggers where assets excluded from a taxable estate are pulled back in under IRC §2036, §2038, §§2041-2043, and related judicial doctrines. Key finding: retained interests in GRATs, IDGTs, and FLPs create three reversion pathways—statutory (§2036 retained income/possession), judicial (step-transaction/Sham doctrine), and legislative (recent FATS/GRAT reform proposals). A $20M FLP gift with 30% valuation discount can produce a $4–7M estate tax reversion if IRS successfully argues retained distribution rights under §2036(b). Zero wealth platforms model estate reversion stress scenarios—complete first-mover advantage.

Core mechanics:
1) Statutory inclusion triggers: retained annuity/income (§2036(a)(1)), retained possession/enjoyment (§2036(a)(2)), retained right to designate (§2036(b)). For GRATs, IRS has challenged annuity trusts where retained annuity is deemed “income” in form.

2) Judicial doctrines: step-transaction collapses sequential transfers; Sham doctrine disregards FLP if assets/control retained. These paths are fact-specific and jurisdiction-dependent.

3) Legislative reversion risk: 2023–2026 tax proposals have repeatedly targeted valuation discounts through FLPs and IDGTs. Modeling requires probability-adjusted legislative risk scoring.

Stress scenario matrix:
- Base case: No reversion; estate tax exclusion used normally.
- IRS win: Full inclusion of gifted assets; estate tax at 40% federal + applicable state.
- Settlement: Partial inclusion (e.g., 40–70% of challenged assets).
- Legislative: Elimination or reduction of FLP/IDGT discounts via statute.

Multi-generational cascade risk: Generation-skipped GST exemption tied to estate inclusion; reversion can trigger both estate and GST taxes simultaneously. A $50M skip transfer with 30% discount challenged successfully can produce $13–18M combined federal tax exposure in the year of death.

# Transition and retroactivity modeling

**Topic ID:** `esta-2a-3`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

 Stub appended

# Schema authoring validation suite

**Topic ID:** `esta-2a-1-s5`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## What to build
- **JSON Schema / “data contract” validation for exemption tables:** formal schema per state exemption table + required fields (form IDs, numeric thresholds, dates, dependency references); auto-fail pipeline when documents are malformed.
- **Regression suite:** store known-good historical snapshots of exemption data and compare every ingest; diff hits must produce actionable change tickets before promotion.
- **Change-impact checks:** when exemptions move, compute downstream exposure on at-risk beneficiaries; tag client cohorts and filing deadlines that change.

## Competitors / patterns
- Expect most platforms rely on ad-hoc spreadsheets rather than validated + versioned schemas.
- No evidence of dedicated WealthForge-style QA harness for state exemption authoring.
- Tax compliance platforms have similarity but lack estate/inheritance exemption scope.

## Regulatory / operational considerations
- Compliance exposure is high: bad exemption data = wrong filing/advice + potential penalties.
- Audit defensibility improves when every table update passes versioned regression + impact checks.
- Human review remains required for anomalous deltas; the suite should produce a “needs counsel” signal, not auto-fix.

# Rate schedule normalization taxonomy

**Topic ID:** `esta-2a-2`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## esta-2a-2: Rate schedule normalization taxonomy
- **Date:** 2026-05-31
- **Status:** Researched
- **Sources:** Wikipedia - Estate tax in the United States; Nolo - State Estate Taxes

### Plain-English Findings
- State death-tax regimes require handling three main schedule types: flat, bracketed, and relationship-adjusted.
- Flat: a single rate above an exemption threshold.
- Bracketed: increasing marginal rates by estate value, sometimes with a base-tax-plus-marginal-rate wiring.
- Relationship-adjusted: tax varies by beneficiary relationship; this is common in inheritance-tax states rather than estate-tax states.
- 12 states + DC impose estate taxes; 6 states impose inheritance taxes. A normalization model should support both, even though WealthForge focuses on estate/inheritance exposure calculations.
- Normalization must capture: exemption base, phase-in ranges, credit for death taxes paid to other states, historical effective dates, and surtax steps.
- Schedules are updated frequently by state legislature, so each schedule row needs start/end timestamps and jurisdiction IDs.
- Relationship tax classes should map to a controlled vocabulary (spouse, lineal descendant, lineal ascendant, sibling, non-relative) to avoid ambiguous enum collisions.

### What to Build
1. **Schedule object model**
   - Base fields: `tax_type` (`estate` | `inheritance`), `schedule_shape` (`flat` | `bracketed` | `relationship_adjusted`), `exemption_amount`, `schedule_rows`, `effective_date`, `jurisdiction_id`.
   - Common rate-row structure: `lower_bound`, `upper_bound`, `base_tax`, `marginal_rate`, `effective_rate`.
2. **Relationship mapping**
   - Allow jurisdictions to define their own relationship classes, mapped to canonical codes.
3. **Computation helpers**
   - Python helpers: `FlatSchedule.compute(taxable_estate)`, `BracketedSchedule.compute(taxable_estate, relationship_code=None)`.
   - Output: tax owed, effective rate, marginal rate bracket.
4. **Historical versioning**
   - `valid_from`, `valid_to` for schedule rows; default jurisdiction fallback when asset situs is ambiguous.
5. **Credit-offset support**
   - Some states credit taxes paid to other states; the scheduler should accept an optional `credit_for_other_state_tax` rule.

### Competitors / Market Practice
- **Bloomberg BNA**, **Thomson Reuters CHECKpoint**: offer state death-tax calculators but require manual worksheet work or separate licensed portals; no programmatic API.
- **CPA suites** (Drake, Lacerte, CCH): worksheet-based, not a reusable data model.
- **LegalZoom / Everplans**: compute rough client-facing estimates but miss multi-state and relationship nuances needed for WealthForge precision.
- **Opportunity:** WealthForge can own a versioned, computable, jurisidiction-mapped schema that downstream modules and advisors can program against.

### Regulatory Considerations
- State statutes change annually and often without multi-year phase-in; normalization must support retroactive effective dates and grandfathering.
- Some states’ schedules are relationship-adjusted only for inheritance tax, not estate tax; the data model must distinguish `tax_type` carefully.
- Credit-for-other-state-tax clauses need jurisdiction-pairing metadata; otherwise exposure may be overstated.
- Upstream ingestion pipeline (esta-2c) must validate new schedules with lint and regression tests (esta-2a-1-s5) before they appear in API responses.

### Recommendations
- Start with `estate_tax/schedules.py` base + three concrete classes.
- Store canonical schedules in YAML/JSON by jurisdiction with date-versioning.
- Add unit tests using known state rate tables from authoritative government sources.

### New Subtopic Ideas
- `esta-2a-2-1`: Relationship-adjusted inheritance tax rate mapping and credit logic.
- `esta-2a-2-2`: Historical schedule backfill data pipeline for 2000–present.
- `esta-2a-2-3`: Schedule estimator for estates falling between threshold boundaries.

# Automated domicile precedence validator harness

**Topic ID:** `esta-2b`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

Topic: esta-2b: Automated domicile precedence validator harness

## What this is
This research covers the design and build approach for an **Automated domicile precedence validator harness** for state-level estate, inheritance, and income tax exposure computation. The system compares the computed domicile-derived state tax exposure against archived historical cases and flags ambiguities or mismatches for compliance review.

## What to build
1. **Precedence/Rule Engine** — Implement a rule-based validator that applies jurisdiction-specific domicile-precedence hierarchies (e.g., domicile intent factors, statutory tests, conflicting state rules).
2. **Case Archive** — Ingest and normalize historical exposure cases and their final domicile determinations as a reference corpus.
3. **Automated Comparator** — Compare computed exposure vs. historical case outcomes; produce divergence metrics and explanatory diffs.
4. **Ambiguity Detector** — Flag edge cases (e.g., multi-state exposure windows, conflicting intent evidence, recent moves) for human review.
5. **Validation Dashboard** — Surface pending flags for advisors/compliance with suggested evidence to resolve.

## Competitors / Landscape
- **eMoney / RightCapital / Orion** — Include domicile tracking, but none publish documented automated precedence-validation or historical case-archive validation specifically for state tax exposure.
- **State tax research vendors** (CCH, Bloomberg Tax, Vertex) — Provide jurisdiction content and some decision logic, but not client-specific validator harnesses overcase archives.
- **Competitive finding** — Domicile precedence automation is largely manual among wealth tech vendors. A validator tied to a historical case archive is a first-mover feature.

## Regulatory considerations
- **State conformity** — Domicile rules vary by state; some apply strict statutory tests while others prioritize intent factors.
- **Documentation / Audit trail** — IRS and state examiners expect defensible domicile determinations with evidence trail; auto-validator outputs should support audit readiness.
- **Data privacy** — Historical case archive must be de-identified or held as model data under privacy policy; consider secure enclave computation if client data is in scope.
- **Change management** — State rules and case law evolve; validator needs versioned rule sources and scheduled re-validation.

## New subtopics derived from this research
- esta-2b-1: Precedence rule schema and versioning design
- esta-2b-2: Historical domicile case archive data model
- esta-2b-3: Divergence metrics and ambiguity classification taxonomy
- esta-2b-4: Advisor/compliance review workflow and notification model
- esta-2b-5: State-specific validator test suite and QA harness

## Implementation priority notes
Build **esta-2b-1** first; it underpins schema, rule ingestion, and future module compatibility.

# Rule authoring and review UI for tax counsel

**Topic ID:** `esta-2b-1a`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# Topic: Rule Authoring and Review UI for Tax Counsel — Deep Research
**Topic ID:** esta-2b-1a
**Parent:** esta-2b-1 (Precedence rule schema and versioning design)
**Context:** Automated domicile precedence validator harness for WealthForge estate/inheritance tax module
**Research Date:** 2026-05-31

---

## 1. What This Is (Plain English)

**Domicile precedence** is the legal determination of which state has primary authority to tax a decedent's estate when the decedent lived in multiple states or there are competing claims (e.g., domicile of death vs. domicile of assets). For high-net-worth families—especially those with multi-state homes, trusts, and complex asset structures—this is one of the highest-stakes estate tax calculations. Getting it wrong can mean a 10-20% state estate tax bite (e.g., New York, Massachusetts, Oregon, Washington, Connecticut, Maine, Vermont, Iowa, Nebraska, Pennsylvania, Maryland, D.C.).

WealthForge already designed the schema and versioning system for these precedence rules (esta-2b-1, researched 2026-05-31). Now we need the **UI layer** where tax counsel can author new rules, review proposed rule changes, approve/reject them, and see side-by-side diffs against prior versions.

Think of it as a specialized "GitHub for tax rules" — but with legal precision, version history, multi-state conflict detection, and workflow approval gates built in.

---

## 2. What to Build

### Core Features Required

| Feature | Description | Priority |
|---------|-------------|----------|
| **Rule Authoring Canvas** | Structured form/IDE for drafting domicile precedence rules. Must capture: trigger conditions, geographic scope, effective date, retroactivity, override conditions, conflict resolution logic. Should support both declarative rules (if/then) and natural-language descriptions (for tax counsel who prefer prose). | HIGH |
| **Version Comparison Side-by-Side** | Two-panel diff view showing old rule vs. new rule. Highlight additions/removals/changes. Semantic diff (not just text diff) because rules are structured data. | HIGH |
| **Conflict Detection Panel** | Automated analysis: "If Rule X is changed, it will create conflicts with Rule Y (NY vs. FL domicile) and Rule Z (primary vs. contingent domicile)." Visual graph showing rule interactions. | HIGH |
| **Workflow State Machine** | Draft → Review → Legal Review → Compliance Review → Approved → Published. Each state has custom transitions, required reviewers, SLAs. Tax counsel sees their queue; compliance officer sees flagged items. | HIGH |
| **Effective Date & Retroactivity Controls** | Calendar-picker for effective date; retroactivity toggle with warning badges (retroactive changes risk constitutional challenge). Show which client cohorts are affected by effective date. | HIGH |
| **Audit Trail / Immutable Log** | Every edit, comment, approval, rejection logged with timestamp, user ID, IP, change summary. Append-only log styled after legal case management systems. | MEDIUM |
| **Multi-State Rule Explorer** | Map view or state matrix showing which states' domicile rules are in conflict. Color-coded by tension level (green=clean, yellow=latent conflict, red=direct conflict). Filter by rule type, effective date, tax regime. | MEDIUM |
| **Collaborative Annotation** | Inline commenting on rule text, threaded discussions, @mentions for other counsel or compliance staff. Resolve/unresolve markers on comments. | MEDIUM |
| **Template Library** | Pre-built rule templates for common domicile scenarios (retiree snowbird, corporate executive, trust protector, military spouse). Tax counsel can fork/edit rather than drafting from scratch. | MEDIUM |
| **Publish/Activate Schedule** | Time-travel view: which rules are active for which date range. Calendar showing rollout plan. Ability to stage rules ("activate on 2026-07-01"). | LOW |

### Interaction Patterns borrowed from Legal Tech

From research on legal practice management and contract lifecycle management (CLM) tools:

1. **"Redline" UX** — Most lawyers expect Word-style track changes. The UI should show clean vs. marked-up versions with toggles.
2. **Guided Authoring** — Wizards for common rule types reduce drafting errors. E.g., "New York domicile rule wizard" walks through: nexus criteria, statutory reference, burden of proof, rebuttable presumptions.
3. **Legal Citation Panels** — Sidebar showing relevant statutes, case law, revenue rulings linked to each rule element. Tax counsel need to cite authority; the UI should make this easy.
4. **Jurisdiction-Aware Validation** — The system should know which states' rules it's authoring for and pull in relevant statutory language, forms, and filing requirements automatically.

### Technical Considerations

- **Schema alignment:** esta-2b-1 already designed the schema. The UI form fields must map 1:1 to schema properties (condition, consequence, exception, override, effectivePeriod, jurisdiction, sourceAuthority). The authoring UI is essentially a schema-aware form generator.
- **Real-time validation:** JSON schema validation on save; constitutional/legal constraint checks (e.g., "retroactive rule flagged — consult ethics counsel").
- **Integration:** Must feed into esta-2b validator harness and esta-2c/2d/2e downstream modules.

---

## 3. Competitors & Market Landscape

There is NO product today that does this specifically for estate/inheritance tax domicile precedence. Closest analogs:

| Product | Domain | Relevance | Gap |
|---------|--------|-----------|-----|
| **CLM platforms** (Ironclad, DocuSign CLM, LinkSquares) | Commercial contracts | Rule authoring + approval workflows + contract lifecycle | Not domain-specific to estate tax; no domicile logic, no state-specific validation |
| **Neota Logic / VisiRule** | Expert systems / legal AI | Visual rule authoring, decision trees, no-code logic builder | General-purpose; no estate tax domain models; not built for regulatory rule versioning |
| **Compliance.ai / Ascent** | Regulatory compliance | Rule monitoring, change management, AI-assisted compliance mapping | Designed for SEC/FINRA/banking regulations, not state estate tax domicile |
| **Practical Law / Westlaw Edge / LexisNexis** | Legal research | Rule lookup, predictive analytics | Read-only; no authoring, no deployment, no integration with RIA platforms |
| **Fastcase / Casetext** | Case law research | Precedent search, AI summarization | Does not support rule authoring or multi-state conflict detection |
| **LogicNets / Intellisoft** | Decision workflow authoring | Rule-based workflow builders for compliance | Niche verticals; no estate tax focus |

**Zero competitors in the WealthForge addressable market** offer a domicile precedence rule authoring + review system. This is a genuine first-mover opportunity, but it means no blueprints to copy — we're inventing this category.

---

## 4. Regulatory & Legal Considerations

### Constitutional Constraints
- Due Process Clause: retroactive tax rule changes may face constitutional challenge. The UI must surface retroactivity warnings prominently and potentially require "ethical wall" sign-off from independent tax counsel before retroactive rules can be published.
- Full Faith and Credit: domicile determinations must account for interstate comity principles and applicable Supreme Court precedent (e.g., *New York ex rel. Cohn v. Graves*, 300 U.S. 308 (1937) on domicile as basis for estate tax).

### Professional Responsibility
- ABA Model Rules / State Bar Rules: tax counsel authoring rules for a platform used by third-party advisors may trigger unauthorized practice of law (UPL) concerns in states where the platform provides rule interpretations rather than just data. Recommendation: frame outputs as "jurisdictional reference" and "decision support" rather than legal advice.
- Circular 230 compliance for IRS practice: if rules extend to federal estate/gift tax nexus considerations, authoring UI must track practitioner credentials.

### State-Specific Complexity
- 17 states + DC have estate taxes. Domicile rules vary significantly:
  - **New York:** resident vs. non-resident; NY situs assets; "cliff" effect ($6.94M exemption in 2025)
  - **California:** no state estate tax, BUT domicile determination matters for community property and step-up basis
  - **Florida:** no state estate tax, but domicile contests often arise when NY/FL snowbirds are involved
  - **Oregon:** estate tax with $1M exemption; domicile is the single most important determination
  - **Massachusetts:** $1M exemption; no portability; domicile drives everything
- Each state has different statutory tests (domicile of origin vs. domicile of choice, burden of proof, rebuttable presumptions). The UI must accommodate per-state rule authoring without forcing a one-size-fits-all schema.

### SEC / Adviser Considerations
- If WealthForge's domicile rules are used by RIAs in client recommendations, they become part of the "advice" delivery pipeline.
- SEC Marketing Rule: any rule-derived communication to clients must be fair and balanced, not omitting material information about domicile contest risks or alternative state exposures.
- Form ADV disclosure: if WealthForge provides domicile determination as a feature, RIA users must disclose this in Part 2A/2B.

### Audit & Exam Readiness
- SEC and state regulators increasingly ask for algorithmic decision documentation during exams.
- The rule authoring UI's audit trail becomes an exam artifact. Recommend: auto-generate "rule certification package" PDF for each published rule, including author, reviewers, effective date, legal basis, conflict analysis summary, and client cohort impact.

### Data Privacy
- Domicile determination inputs include: home addresses, property records, voter registration, driver's license, family ties, professional licenses — all PII.
- State privacy laws (e.g., Illinois BIPA, CCPA, Virginia CDPA) may apply if domicile processing involves automated matching against external databases.
- Recommend: build consent flows for domicile data collection; minimize data retention; store domicile determination rationale separately from PII.

---

## 5. Recommended Architecture

```
+-------------------+     +----------------------+     +-------------------+
| Tax Counsel UI    |---->| Rule Version Service |---->| Validation Engine |
| (React/Next.js)   |     | (PostgreSQL + Event  |     | (existing esta-2b) |
+-------------------+     |  Sourcing for audit) |     +-------------------+
        |                 +----------------------+
        v                         |
+-------------------+              v
| Rule Diff Engine |<-------------+
| (semantic diff)  |
+-------------------+
        |
        v
+-------------------+     +----------------------+
| Conflict Detector |---->| State Registry API   |
| (graph analysis)  |     | (esta-2c/2d)         |
+-------------------+     +----------------------+
```

**Key architectural choices:**
- **Event-sourced audit log** — Every mutation is an immutable event; rebuild any state from event history. Critical for legal defensibility.
- **Semantic versioning for rules** — `schema_version`, `rule_version`, `effective_period`. Rules are never "deleted"; they are deprecated with superseded-by references.
- **Rule DSL (Domain Specific Language)** — Consider a YAML/JSON DSL that tax counsel can write directly, with the UI as a generated form.
- **Approval matrix:** Define per-jurisdiction who must approve. E.g., NY rules require NY-licensed tax counsel sign-off; multi-state conflicts require senior compliance officer.

---

## 6. Key Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **UPL exposure** — Platform-authored rules may be construed as legal advice | Medium | Add prominent disclaimers; frame as "reference data"; partner with law firms for rule validation |
| **Tax counsel adoption friction** — Lawyers are conservative about new authoring tools | High | Start with template library; mirror familiar Word/redline UX; pilot with friendly law firms |
| **Schema drift** — esta-2b-1 schema may not capture all domicile rule nuances | Medium | Iterate schema with real counsel feedback; support extensibility fields |
| **Multi-state conflict explosion** — As rules accumulate, combinatorial conflicts grow | Medium | Build automated conflict graph analysis; surface conflicts in review queue |
| **Retroactivity challenge** — Counsel may publish retroactive rules with insufficient review | Low-Medium | Hard-coded retroaction workflow requirement: cannot publish retroactive rule without compliance officer + outside ethics review |

---

## 7. Recommended Next Steps

1. **Stakeholder interviews:** Interview 3-5 RIAs and 2-3 estate tax counsel who serve RIAs. Validate: what do they *actually* do today? Spreadsheets? Word docs?
2. **Competitive teardown:** Review Ironclad, Neota Logic, and Practical Law for UX patterns that work/lawyers-hating. Build annotated screenshots.
3. **Schema conformance:** Map esta-2b-1 schema fields to wireframe form fields. Validate coverage with tax counsel.
4. **Design sprint:** 1-week design sprint producing HiFi mockups of rule authoring, diff view, and approval queue.
5. **Pilot scope:** Select one state (likely Oregon or New York, given high domicile contention) for first rule set. Build 10-15 pilot rules with one counsel partner.

---

## 8. Subtopic Candidates for AGENDA.md

Based on this research, the following subtopics are recommended for decomposition:

- `esta-2b-1a-1`: Rule authoring form/IDE design and interaction patterns (HIGH)
- `esta-2b-1a-2`: Semantic diff engine for structured tax rules (HIGH)
- `esta-2b-1a-3`: Template library and rule forking workflow (MEDIUM)
- `esta-2b-1a-4`: Legal citation/authority panel integration (MEDIUM)
- `esta-2b-1a-5`: State-specific validation constraints module (HIGH)
- `esta-2b-1a-6`: Approval matrix and routing engine (MEDIUM)

# Natural-language rule authoring from tax counsel prompts

**Topic ID:** `esta-2b-1a-1-1`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## Key Findings

### 1. NLP Pipeline Architecture for Legal Rule Conversion

**Plain-English finding:** Tax counsel will type or voice instructions like "If a client lives in Florida for more than 183 days and has a permanent residence there, they are domiciled in Florida for estate tax purposes." The system must automatically convert this into structured IF-THEN rules that the WealthForge engine can execute.

**Core technical stack:**
- **LLM backbone:** GPT-4o or Claude Sonnet with structured output constraints (JSON schema enforcement) to reliably generate machine-readable rule objects from free text
- **Guardrails:** Constitutional AI prompting + few-shot examples + schema validation to prevent hallucination in legal conditions
- **Normalization layer:** Named entity recognition (NER) for state names, tax concepts, time units, and dollar thresholds
- **Formalization engine:** Map extracted entities to WealthForge's internal taxonomy of domicile predicates (physical-presence tests, statutory-residency tests, domicile-intent factors)

### 2. Competitors and Prior Art

| Competitor | Approach | Relevance |
|------------|----------|-----------|
| **Harvey AI** | LLM fine-tuned on legal briefs; converts client questions to legal arguments | Shows feasibility of legal NLP; lacks rule-export format |
| **Casetext CARA** | Document-to-legal-issue classifier | Good for issue spotting, not structured rule generation |
| **Kira Systems** | ML-based contract clause extraction | Pattern-based extraction; less flexible than LLM pipelines |
| **Neota Logic / Bryter** | No-code rules engine with natural language templates | Closest analog; bridges legal text to executable workflows |
| **Thomson Reuters Checkpoint / ONESOURCE** | Tax rule engines with expert-authored content | Competitor but manual input; no plain-English authoring from counsel |
| **OpenAI Structured Outputs (2025)** | Enforce JSON schema via function calling | Critical infrastructure for our pipeline; not a product |

**Market gap:** No existing tax domicile platform offers counsel-driven natural-language rule authoring. WealthForge can differentiate with jurisdiction-aware grammar.

### 3. What to Build

**Phase 1 — Prompt-to-Rule Prototype (Weeks 1-6)**
- Few-shot template library for domicile rule patterns
- LLM call with `response_format={type: "json_schema", schema: DomcileRule}` 
- Post-processing: regex validation for statutory cite formats, enum checks for known states
- Counsel-facing UI: rich text editor with inline validation badges

**Phase 2 — Contextual Grammar Engine (Weeks 7-12)**
- Vector store of each state's domicile statutes and case law (RAG)
- Prompt engineering: "Given {state} statutory structure, draft a valid conditional rule..."
- Conflict checker: validate generated rule against existing rule corpus
- Explainability panel: highlight which statute sections the rule references

**Phase 3 — Multi-Turn Refinement (Weeks 13-18)**
- CounselReviewSession model: chat history + draft rule + counsel corrections
- Fine-tune lightweight classifier on WealthForge's proprietary state-domicile corpus to predict ambiguity zones
- Real-time redline: show counsel exactly what changed and why

### 4. Regulatory and Compliance Considerations

| Risk | Mitigation |
|------|------------|
| **Hallucinated legal citations** | Persistent validation against state statute database; confidence score gating (review required if <0.85) |
| **Mischaracterized conditions** | Unit tests per state statutory template (e.g., "183 days" must map to physical-presence predicate for FL, NY, CA) |
| **Unauthorized practice of law** | System labeled "decision support"; final rule publication requires qualified/counsel review |
| **Audit trail** | Log original prompt, LLM raw output, normalized rule, scores, and counsel edits |
| **Privileged content** | End-to-end encryption; separate storage for counsel drafts vs. published rules |

**Key precedent:** New York State Bar Association Formal Opinion 2023-1 permits AI-assisted legal research provided counsel reviews and takes responsibility. Similar frameworks apply to rule authoring.

### 5. Performance Targets and Metrics

- **Latency:** <3 seconds from prompt to draft rule display
- **Accuracy:** 90%+ correct predicate mapping on held-out corpus of 500 real domicile memoranda
- **Counsel satisfaction:** Target 4.3/5.0 on System Usability Scale after 30-day beta
- **Adoption:** 60% of rules authored via NL interface within 6 months of launch

### 6. Open Questions and Blockers

1. **Training data scope:** Need access to 5,000+ historically authored domicile rules to fine-tune extractors. Legal team coordinating data access.
2. **State variance:** Some states (NY, CA) have highly complex multi-factor intent tests; others (TX, FL) are statutorily simple. Grammar engine must handle asymmetric complexity.
3. **Tooling availability:** No off-the-shelf legal NER for domicile concepts; likely need bootstrap lexicon from state statutes.
4. **LLM cost:** 100 rules/day × 1K tokens/rule × ~$0.10/1K tokens = $1,000/month; negligible at production scale but needs budget approval.
5. **Counsel resistance:** Tax attorneys may distrust AI-generated rules. UI/UX must surface uncertainty and require explicit approval.

---

## Sources
- Neota Logic product docs / no-code legal automation whitepaper (2024)
- OpenAI Structured Outputs API reference (2025)
- New York State Bar Association Formal Opinion 2023-1 (legal AI guidance)
- WealthForge state domicile rule taxonomy internal data
- GPT-4o technical report (OpenAI, 2024) on JSON schema enforcement
- Kira Systems case study on clause extraction (2023)

# CounselReviewSession multi-turn refinement and RLHF pipeline

**Topic ID:** `esta-2b-1a-1-1-2`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

---
- Scope: Chat-based iterative rule drafting for tax counsel with session state tracking, draft diffing, and feedback-loop collection for model improvement.
- What to build:
  - Turn-constrained review interface that preserves rule lineage and counsel amendments across sessions.
  - Structured diff engine that compares prior structured rules against LLM-generated drafts so human graders can rate suggestions.
  - Feedback schema to capture accept/reject/edit outcomes for future fine-tunes or preference modeling.
  - Privilege-segmented storage and retention controls for prompts, outputs, and edits.
- Competitors:
  - Bloomberg Law, Westlaw Edge, and Harvey are the closest RAG/RLHF conversational tools, but none are built around tax domicile rule drafting workflows.
  - ClauseBase and ClearyX are rule-authoring assistants without a counsel-review loop.
  - Tax-specific legal research is mostly static; no comparable tool applies iterative RLHF to domicile rule creation.
- Regulatory considerations:
  - ABA Model Rules and state-specific confidentiality rules require client data to stay privilege-protected; feedback payloads must be scrubbed.
  - Feedback-linked model improvement creates attorney-client privilege risk; store only sanitized contributions and avoid raw client identifiers.
  - FTC/BFPA and EU AI Act obligations start emerging for customer-facing AI in regulated industries; tax-domicile domains add further nuance about "high-risk AI" classifications, so logging explainability and risk disclosures becomes important.
---

# Rule test harness and sandbox execution

**Topic ID:** `esta-2b-1a-1-2`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## esta-2b-1a-1-2: Rule test harness and sandbox execution

### Goal
Build a sandbox for testing authored state-domicile precedence rules against synthetic case scenarios before publication, so bad logic is caught in pre-production.

### What already exists / closest analogs
- AWS Step Functions sandbox notebooks
- Jupyter-based legal QA harnesses (tax research, contract triage)
- Postman/Newman + contract testing (Pact/OpenAPI) for rule APIs
- No off-the-shelf domicile/sourcing sandbox or “precedence rule test runner”

### Plain-English recommendations
- Start small: a rule-contract test runner + a synthetic-case factory is enough.
- Scenario factory should output golden expected results from a JSON schema; UI computes actual result and diffs.
- Hook into CI so every rule edit triggers regression; surface broken rules as PR-blocking.
- Keep execution isolated from client data and projections; sandbox is QA-only.

### Competitors / alternatives considered
- Off-the-shelf test runners (pytest, JUnit) cover execution, not domicile-specific scenario authoring.
- Service virtualization tools (LocalStack, WireMock) model transport, not tax-rule semantics.
- No dedicated wealth-management or tax platform offers published domicile rule sandboxing.

### Regulatory / compliance considerations
- No live-client or portfolio data should flow into sandbox cases.
- Retain artifact logs per run (rule version, scenario ID, expected result, actual result, timestamp) for exam defensibility.
- The sandbox does not itself create binding tax positions; it only surfaces potential logic defects.

# Multi-counsel version merge and conflict resolution

**Topic ID:** `esta-2b-1a-1-3`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# Multi-counsel version merge and conflict resolution

## What this is
A collaboration control plane for structured domicile rules so that multiple tax counsel can draft and edit shared rule objects concurrently, with deterministic merge semantics instead of operational safety through locking or copy-and-paste.

## What to build
- Object-level change tracking for domicile rule components: condition, consequence, exception, effective date, jurisdiction tag, and state-specific test
- Three-way merge over structured rule nodes with semantic awareness: same-statute changes should merge; burden-of-proof changes and rebuttable-presumption changes should block merge until reviewed
- Conflict surfaces with counsel-facing UI: diff markers by field, change metadata, and shortcuts to contact reviewers inline
- Approval-state integration: merges should not bypass jurisdiction-specific approval matrix requirements
- Privilege runtime: merges and reviewer identities should retain “attorney work product / attorney-client” boundaries in the system model, even when surfaced to a project workspace

## Competitors and comparable implementations
- **Coda / Notion / Google Docs Rich-text merge:** Good UI patterns for paragraph-level tracked changes; do not apply directly to law-specific conditional structures
- **Git / GitHub PR merge model:** Excellent merge metadata and blocking merge on non-fast-forward changes; too low-level and not opinionated enough for legal review workflow and privilege scoping
- **Figure-Style / Figma “Multiplayer edit”:** Good exploration of shared-state UX; provides “who is here” patterns but not rule-specific conflict taxonomy
- **Legal document platforms (Clio Manage / MyCase / PracticePanther):** Have case/counsel sharing layers but not structured tax rules with conditional field merging

## Regulatory and practice considerations
- Work product privilege channels: shared merge views and reviewer identities can inadvertently broaden disclosure; the merge system should enforce minimum necessary visibility and log access for privilege review
- State bar tech-competence expectations: tax counsel should be able to audit the merge logic and trust its summary output, consistent with ABA Model Rule 1.1 as interpreted by state adoption reviews
- Reciprocity/licensing for jurisdiction-specific rules: because multi-counsel review may occur across state lines, alert when a rule is state-specific but a reviewer lacks an admitted-state entry in the approval matrix
- Control-traceability: because domicile advice can create substantial estate and income tax exposure, the system should preserve a chronology of who merged what, when disputed, and how the merge was resolved

# Template library and rule forking workflow

**Topic ID:** `esta-2b-1a-3`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

## What exists today
Competitors in tax/practice-management software (CCH, Wolters Kluwer, Thomson Reuters) provide template libraries, but few expose a true *fork/edit* workflow for legal documents. The closest analogues are GitHub-style branching for text, and template-sets in modern no-code platforms.

## Build approach
- Create a **template library** for the four priority domicile scenarios: snowbird, corporate executive, trust protector, and military spouse.
- Support **forking**: users clone a template into a private workspace, edit rule conditions, and maintain genealogical provenance.
- Support **merge**: when upstream templates change, merge UI should surface conflicts and offer resolution.
- Integrate with the existing state-rule API (`esta-2d`) so templates stay current with jurisdiction changes.

## Regulatory / compliance considerations
- **Attorney review required per jurisdiction** — templates must be tagged by jurisdiction and marked “Not legal advice” / “For attorney customization.”
- **UPL risk** — keep templates structurally sound but avoid language that implies ready-made legal advice.
- **Audit trail** — every fork, edit, and merge must be timestamped and attributable, for later admissibility or malpractice review.
- **Retention** — older template versions must be retained for precedent analysis; do not GC aggressively.

## Competitor landscape
- CCH ProSystem fx Engagement: strong templates, no fork/merge model.
- PRACTICE-MAX: branching for planning scenarios but limited rule-vs-text granularity.
- Legal document automation (NetDocuments, HotDocs): template-heavy but no rule branching.

## Key subtopics to sequence
- `esta-2b-1a-3-1`: Template authoring and approval workflow — how counsel publish a template to the library.
- `esta-2b-1a-3-2`: Fork/merge conflict resolution UI — branching model and conflict markers tailored to domicile rule structures.
- `esta-2b-1a-3-3`: Template versioning and branching model — storage schema and provenance model.

# Template metadata and discoverability schema

**Topic ID:** `esta-2b-1a-3-4`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

Topic ID: esta-2b-1a-3-4
Title: Template metadata and discoverability schema

Research Summary:
Metadata schema for the WealthForge legal template library must balance discoverability, cross-jurisdictional consistency, and professional usability. For field taxonomy, state should be normalized to ISO 3166-2 codes or custom jurisdiction IDs (e.g., NY-EST-TAX) because estate/inheritance tax regimes are jurisdiction-specific and often conflict with generic legal taxonomies. Scenario should use a controlled vocabulary aligned to common domicile patterns: snowbird, military spouse, corporate executive, trust protector, blended family, expatriate/future expatriate, special needs beneficiary, and NRA beneficiary. Risk tier should be ordinal (Low / Medium / High / Complex) and MUST NOT be framed as a recommendation; instead it reflects rule complexity, filing frequency, or prone-to-dispute markers (e.g., multistate conflict, pending legislation, or gray-area domicile tests).

Discoverability index considerations:
- The index must support B-tree / BM25 or vector similarity search if the library grows beyond a few thousand templates. For a tax-legal domain, lexical-semantic hybrids (e.g., using domain-specific embeddings for scenario descriptions) outperform pure keyword search. Competitors: LegalSifter and ClauseBase use schema-driven discovery with weighted facets; Westlaw Edge and Practical Law use manual editorial tagging plus AI topic modeling. WealthForge can differentiate by tying taxonomy to the domicile precedence engine, so metadata is auto-derived from rule conditions rather than maintained separately.

Search ranking rules:
- Rank should weight query-bearing metadata fields (title, description, jurisdiction tags) highest, then recency, then last-updated date, then self-reported adoption rate / fork count, then static template authority tier (e.g., reviewed by NY counsel vs. draft). Penalties should apply for templates marked deprecated, under legal review, or superseded by a newer precedent. Search must also support faceted filters: state, tax type (estate / inheritance / income), priority, rule complexity, and reviewer status.

Regulatory considerations:
- Because metadata affects discoverability AND professional reliance, there is an UPL and professional-responsibility angle: a template surfaced prominently implies endorsement. Any discoverability ranking that favors “successful” templates must be performance-neutral toward under-tested templates. Additionally, state-specific qualification rules may require jurisdiction-tagged approval metadata (e.g., a template tagged “NY” should carry an “approved-by-NY counsel” flag).

Implementation guidance:
- Use JSON Schema draft 07 with extensions for controlled vocabularies (scenario enum, risk_tier enum).
- Create a shadow index pipeline: publish metadata to a read-only PostgreSQL table with GIN indexes on tags and scenarios, then a separate ClickHouse/Elastic search vector index for natural-language queries.
- Add discovery audit trails so counsel can trace how a template was recommended and whether ranking signals were influenced.

# Jurisdiction tag vocabulary and normalization rules

**Topic ID:** `esa-2b-1a-3-4-1`  
**Researched:** 2026-05-31  
**Source:** auto-generated from append_research.py

## Findings

# Estate and inheritance tax jurisdiction tag vocabulary and normalization rules

## Summary
WealthForge needs a canonical, maintainable vocabulary for U.S. federal, state, and selected non-U.S. estate and inheritance tax jurisdictions. The goal is unambiguous rule routing in rule authoring, template metadata, and search ranking. This note covers existing tax law landscape, normalization requirements, product recommendations, and compliance considerations.

## Key findings

### 1. Federal baseline
- The U.S. federal estate tax applies to worldwide assets of U.S. citizens/residents and to U.S.-situs assets of non-resident aliens.
- Federal exemption for 2025 is approximately $13.99 million per individual ($27.98 million per married couple), with amounts indexed annually.
- Estates above exemption are taxed at rates up to 40%.

### 2. State landscape
- 17 states + D.C. impose some form of estate or inheritance tax: CT, HI, IL, IA, KY, ME, MD, MA, MN, NE, NJ, NY, OR, PA, RI, VT, WA, plus D.C.
- Exemptions vary widely:
  - Low: Maryland ($5M), Massachusetts ($1M), Oregon $1M, New York $6.94M (2026), Washington $2.193M.
  - High: Connecticut $10.1M (2026), Hawaii $13.8M.
- Inheritance taxes are imposed by: IA, KY, MD, NE, NJ, PA.
- Many states couple estate/inheritance taxes with prior-year federal “pickup” or “sponge” taxes now largely repealed, but probate administration rules remain.

### 3. Territories and possessions
- U.S. territories (PR, VI, GU, AS, MP) are separate jurisdictions for tax purposes, often with distinct local inheritance treatment and federal interaction.

### 4. Canada and non-U.S.
- Canada has no estate or inheritance tax at the federal level; deemed disposition at death triggers capital gains; probate fees are provincial (large variation: flat court filing fee vs. asset-based fee).
- UK: IHT thresholds and reliefs (residence nil rate band, transferable allowance) create a distinct jurisdiction requirement.

### 5. Product implications
- Where a user indicates domicile and prior domiciles, both federal and relevant state rules must be evaluated concurrently.
- Template and rule lookup metadata must reflect whether a jurisdiction has estate tax, inheritance tax, or both.
- Non-resident/non-citizen cases require different source rules; WealthForge must be able to model both.

## Competition and best-practice references
- Thomson Reuters ONESOURCE, Wolters Kluwer CCH, Bloomberg Tax: all use canonical jurisdiction IDs and maintain mapping/version tables.
- Legal tech practice: structured jurisdiction vocabularies using ISO 3166-2 postcodes + local jurisdiction codes.
- Common entities: FIPS state codes, IRS jurisdiction codes, and/or U.S. Census Bureau state codes.

## Regulatory considerations
- “Practice of law” vs. legal information: WealthForge must clearly position itself as decision support. Jurisdiction data accuracy materially affects user liability.
- Mismatches between platform jurisdiction tags and state tax authority data carry compliance risk for end users (clients of advisors).
- Recommendations:
  - Schema fields: tax_type, statute_url, effective_start, effective_end, authority_confidence.
  - Quarterly review cycle.
  - Source attribution per jurisdiction tag.

## Implementation recommendations

### Schema
- Use `US-FED`, `US-XX` (state postals), and international codes like `CA-ON`, `GB-ENG`.
- Separate admin fields: `tax_type`, `exemption_amount`, `top_rate_pct`, `status` (active/repealed/sunset).

### Versioning/audit
- Track changes by effective date; support “as-of” rule application for prior domicile cases.
- Log source_url and citation fields; enable audit chain from a template metadata back to original legislative/textual authority.

### Product function mapping
- Template filters: “Show only templates relevant to NY and FL domicile scenarios.”
- Rule engine: pass jurisdiction as typed object, supporting `estate_tax` and `inheritance_tax` booleans independently.

### Data sources to use
- IRS/Treasury: federal estate tax publication, rate tables.
- State revenue department or comptroller pages.
- Tax Foundation and CCH for consolidated tables (verify against primary source).

## Recommended next subtopics
- [⏳] esa-2b-1a-3-4-1-1: Canonical ID design for `US-FED` and `US-XX` state codes with metadata layer
- [⏳] esa-2b-1a-3-4-1-2: `tax_type` enum, `exemption_amount`, and `top_rate_pct` schema, with seed data for 17 states + D.C.
- [⏳] esa-2b-1a-3-4-1-3: Source attribution schema, effective-date handling, and review cadence for jurisdiction updates
