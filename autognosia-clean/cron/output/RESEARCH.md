# WealthForge Deep Research


## wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-3: Disparate-impact test protocol

# Disparate-Impact Test Protocol

## Plain-English overview
A disparate-impact test measures whether a policy or algorithm disadvantages a protected group, even without discriminatory intent. In WealthForge's context, this applies to OBBBA-conformity segments, retirement-plan assumptions, and advisory models that produce materially different outcomes for clients based on income, race, gender, or geography.

## Key regulations and precedents
- **ECO A**: Equal Credit Opportunity Act prohibits discriminatory credit decisions.
- **FHA**: Fair Housing Act for mortgage-related products.
- **Regulation B**: Implements ECO A; covers adverse action.
- **SB 70** and state insurance rules for insurance-linked products.
- **AI/algorithm guidance**: CFPB and OCC have highlighted model-risk management around bias.

## What to build
1. **Uniform threshold test** — four-fifths rule, Fisher’s exact, or propensity-score matching comparing demographic buckets.
2. **Protected-class mapping** — income, race, gender, age, marital status, state, and plan type.
3. **Model-change audit trail** — every recalibration must allow retroactive disparate-impact review.
4. **OBBBA segment flags** — link exposure scoring to fairness flags; tax provisions may correlate with income/race.
5. **Remediation workflows** — reweighting, threshold adjustments, or exclusion of proxy variables.

## Competitor analysis
- ** black-box ESG scoring** tools have begun disparate-impact audits, but WealthForge would be first to embed it in tax-simulation workflows.
- No current wealth-planning competitor offers per-provision fairness review for legislative impacts.

## Regulatory considerations
- Advisors under fiduciary duty must monitor for discriminatory outcomes under multiple state laws.
- Documented testing protocol is required for compliance audits.

## Recommended protocol order
1. Define protected classes and sample sizes
2. Run four-fifths and chi-square tests on outcome distributions
3. Record demographic proxies for every OBBBA-tagged scenario
4. Schedule quarterly retraining/fairness audits
5. Maintain immutable audit records for regulators

## wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4: Integration with triage UI specs

## Executive Summary

WealthForge’s Disparate-Impact Test Protocol (wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-3) defines the statistical engine; this entry defines the **UI integration layer** that surfaces fairness signals to advisors and administrators. No competitor currently exposes an advisor-facing triage interface with embedded disparate-impact testing. The result is a differentiated UX: advisors resolve plan-risk signals inside the workflow instead of exporting CSVs to a compliance team.

**Key findings**
1. **White space.** Orion, Black Diamond, eMoney, RightCapital, and Envestnet have no comparable UI. Existing fair-lending dashboards are lender-only (Earnix, Zest AI) and not designed for wealth-plan triage.
2. **Regulatory precedent.** ECOA/Reg B require **adverse action notices** and record retention; the UI must log every triage result with machine-readable reason codes.
3. **Audience split.** Two personas consume the triage UI: (a) the advisor, who needs action buttons (approve with mitigation, request retrain, schedule exemption review), and (b) the compliance officer, who needs protected-attribute disclosure controls and audit log access.
4. **Tech readiness.** The test-protocol layer already exports JSON boundary packages; the integration work is purely presentation and orchestrating the existing API surface.

**Competitors**
- **Earnix, Zest AI** — lender fair-lending dashboards only, no wealth-plan context, no probability-weighted scenario coupling.
- **Tavant,fico Xpress** — credit risk fairness tools, consumer lending focus.
- **Infrage** — infrastructure-level bias testing, no user interface.

**Regulatory considerations**
- **ECOA / Reg B** — adverse action notice requirements map directly to triage-exit flows.
- **SEC Marketing Rule (2022)** — evidence-based methodology claims rely on documented mitigations surfaced in the UI.
- **State UPL / privacy laws** — protected-attribute handling must be defensible under CA, NY, and IL biometric/data privacy regimes.
- **ADA/WCAG 2.2 AA** — protected-attribute disclosure cards must be screen-reader accessible with sufficient color contrast.

---

## What to Build

### 4.1 Information Architecture

```
TriageWorkspace
├── BoundaryPackageViewer      (shows selected population, protected attributes, thresholds)
├── ScoreMatrix               (grid: scenario × client segment × fairness score)
├── ActionPanel               (advisor buttons: Approve / Mitigate / Retrain / Exempt)
└── AuditLogDrawer            (append-only, reason-code required)
```

### 4.2 JSON Schema for Boundary Package

```json
{
  "runId": "uuid",
  "population": { "segment": "...", "n": 1234, "baseline": "national" },
  "protectedAttributes": ["race","sex","age","disability","national_origin"],
  "thresholds": { "alpha": 0.05, "mdisc": 0.20 },
  "results": [
    {
      "scenario": "BTC-2026-UP",
      "segment": "HNW-500K-5M",
      "score": 0.83,
      "verdict": "clear",
      "pValue": 0.12
    }
  ],
  "exemptionsRequested": [],
  "audit": { "operatorId": "...", "timestamp": "ISO8601" }
}
```

### 4.3 Component Specs

| Component | Responsibility | Accessibility |
|-----------|----------------|---------------|
| **BoundaryPackageViewer** | Load, validate, display boundary package JSON | Full screen-reader semantics; data table for results grid |
| **ScoreMatrix** | Cell-level color coding; sort/filter by verdict | Color-blind palette; text badge for color-blind users |
| **ActionPanel** | Emit triage action events; require reason-code text | Keyboard-trappable; visible focus ring; error announcements live region |
| **AuditLogDrawer** | Render append-only audit trail with timestamps | High contrast; pagination with skip links |

### 4.4 State Flow

1. **Draft** — boundary package loaded from test engine.
2. **Open** — advisor can interact with actions.
3. **Resolved** — action committed, audit entry appended.
4. **Escalated** — exemption request routed to compliance.

### 4.5 Privacy & Disclosure Rules

- Protected-attribute counts must be suppressed when cohort size < 30.
- Reason-code taxonomy must mirror the sensitivity lookup table (7d-1b) so the same flag can trigger both mitigation and retrain.
- Client-identifying fields must never be transmitted to the UI; only aggregated cohort statistics are displayed.

---

## Recommended Implementation Approach

1. **Start with Draft 1 of `TriageWorkspace`** consuming an embargoed test-protocol stub that returns static JSON. UI work can proceed before the kernel is productionized.
2. **Design system alignment.** Use existing WealthForge component tokens; no new design system should be introduced.
3. **Action flows first.** Advisor experience is the highest-value path; compliance audit drawer can follow.
4. **Backlog.** Build the mitigation suggestion generator in a later sprint so the `Mitigate` button surfaces statistically grounded suggestions rather than a free text box.

---

## Open Items

- **7d-1c-4a:** Mock-run telemetry format and replay harness.
- **7d-1c-4b:** Protected-attribute suppression thresholds and geo-specific overrides.
- **7d-1c-4c:** Reason-code taxonomy alignment with sensitivity lookup (7d-1b).

## wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4b: Protected-attribute suppression thresholds and geo-specific overrides

Protected-attribute suppression thresholds and geo-specific overrides

Plain-English summary
- WealthForge should suppress protected-attribute signals by default and allow geo-specific overrides only with documented regulatory justification.
- This guards against disparate-impact risk and meets ECOA/FCRA (US), GDPR Article 9 (EU), UK Equality Act, Canadian Human Rights Act, and state/local fair-lending laws.

What to build
- Jurisdiction-aware suppression engine with per-rule defaults (attribute × region).
- Override workflow: analyst request → compliance attestation → signed justification → effective date/region → immutable audit log.
- Reason-code taxonomy mapping each override/deletion to a jurisdiction-specific code for UI display and audit export.

Competitors / reference implementations
- Fiddler: detects protected-attribute influence but isn’t enforcement-first.
- Arthur AI: bias/drift monitoring with pluggable fairness metrics; no built-in geo override workflow.
- IBM AIF360: libraries for threshold optimization and suppression utilities, not operational policy enforcement.
- Microsoft Fairlearn: constraint-based mitigation, not geo-aware.
- Google What-If Tool: interactive probing, no production override workflow.
- H2O Driverless AI: some fairness segments, focused on prediction.

Regulatory considerations
- US federal: ECOA/FCRA prohibit using race, color, religion, national origin, sex, marital status, age, disability, genetic information. State laws may add other classes (e.g., sexual orientation, gender identity, source of income).
- EU/EEA/UK: GDPR Article 9 strict rules on sensitive data; UK adds Equality Act protected characteristics.
- Canada: Canadian Human Rights Act prohibits similar grounds.
- Industry best practice: derive model features via lookup, not by passing raw protected attributes, plus record retention requirements.

Key decisions
- Default suppression list and allowed-attribute set must be sourced from legal per-jurisdiction and reviewed at least quarterly or on each new market launch.
- Override audit log must store: user ID, timestamp, jurisdiction, attribute, operation (suppress/include), justification code, and linked approval artifact reference.

New subtopics
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4b-1 (jurisdiction mapping schema/registry)
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4b.2 (override attestation workflow + audit schema)
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4b.3 (reason-code taxonomy per jurisdiction)

Blockers
- Legal/jurisdiction list should be confirmed before implementing geo-specific defaults.

## wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4c: Reason-code taxonomy alignment with sensitivity lookup

# wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c-4c: Reason-Code Taxonomy Alignment with Sensitivity Lookup

## Researched: 2026-05-31

## Key Findings

1. **Problem:** When financial planning algorithms produce disparate impact across protected classes (race, gender, age, etc.), regulators and internal compliance teams need standardized reason codes to explain why a particular client segment received different treatment. Sensitivity lookup tables quantify how much each assumption contributes to outcome differences, but there is currently no standardized taxonomy mapping sensitivity coefficients to explanation reason codes.

2. **Competitors:** 
   - **No existing wealth management platform** provides reason-code taxonomy aligned with sensitivity analysis. 
   - Closest analogs exist in:
     - **Fair Lending** (banking): ECOA/Reg B requires adverse action notices with specific reason codes (e.g., credit score, debt-to-income). The CFPB maintains a standardized reason-code taxonomy.
     - **Hiring/HR**: LinkedIn and other platforms use standardized reason codes for hiring decisions to defend against bias claims.
     - **Insurance**: NAIC maintains reason-code taxonomies for underwriting decisions.
   - **eMoney, RightCapital, MoneyGuidePro, Orion**: None provide disparity explanation frameworks coupled with assumption sensitivity.

3. **Regulatory Considerations:**
   - **ECOA/Reg B**: Prohibits discrimination in any credit transaction. Financial advice/plans with disparate impact may trigger fair lending scrutiny, especially if tied to credit products (mortgage, investment accounts).
   - **SEC Marketing Rule (2020)**: Requires that performance and hypothetical results not be misleading. Disparate outcomes across protected classes, unexplained, could be considered misleading.
   - **ADA / State AI Laws**: Emerging state legislation (NYC Local Law 144, Colorado SB 21-169, Illinois AI in hiring law) requires impact assessments and explanations for algorithmic decisions.
   - **SR 11-7 (Federal Reserve)**: Model governance guidance requires documenting model limitations and potential biases.
   - **FINRA Rule 2111 (Suitability)**: If outcomes differ systematically by demographic, suitability documentation must address why.

4. **What to Build:**
   - **Taxonomy schema**: A structured vocabulary of reason codes covering:
     - Economic factors (income, wealth, tax bracket)
     - Demographic factors (age, marital status, dependent count)
     - Geographic factors (state tax regime, cost of living)
     - Legislative factors (OBBBA exposure, TCJA sunset)
     - Behavioral factors (risk tolerance, time horizon)
     - Data-quality factors (missing fields, imputation confidence)
   - **Sensitivity lookup mapping**: For each reason code, define which sensitivity coefficients or assumption deltas are relevant.
   - **Explanation generator**: Given a disparate-impact flag, auto-populate explanation language citing specific sensitivity drivers and their weights.
   - **Compliance audit trail**: Record which reason codes were considered, which were selected, and the sensitivity evidence backing each.
   - **Multi-jurisdiction support**: Allow reason-code sets to vary by applicable regulatory regime.

5. **WealthForge-Native Innovation:**
   - Zero platforms connect assumption sensitivity to standardized explanation reason codes.
   - First-mover advantage in building a regulatory-compliant "explainability layer" for financial planning algorithms.

6. **Cross-Reference:**
   - Parent entry: `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1c` (Disparate-impact test protocol)
   - Related: `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1e` (Model-change audit trail)
   - Related: `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1f` (Disparate-impact fairness review)

## Sources
- ECOA/Reg B adverse action reason codes (CFPB)
- NAIC Insurance Underwriting Reason Codes
- SR 11-7 Model Governance Guidance
- NYC Local Law 144 Automated Employment Decision Tools Law
- Colorado SB 21-169 Insurance Discrimination Law

## esta-2b-1a-3-4-4-3-3-1-2: Immutability Enforcement Mechanism

- Researched: 2026-05-31
- Status: appended

# Immutability Enforcement Mechanism

## What this is about
Immutable workflow state: once a template, rule draft, or metadata record is finalized, it must not be silently overwritten or deleted. WealthForge needs an explicit immutability enforcement mechanism covering:
- stored record versions
- registry entries
- citation/authority bindings
- derivative artifacts

## Plain-English value
Prevents cases where a rule is edited after publication, a citation point is replaced unintentionally, or a stale reference is silently reused. For legal tooling, immutability directly preserves privilege and provenance.

## What to build
1. Append-only storage with tombstone delete markers, not physical delete.
2. Canonical content hash attached to every persisted record; reject writes that mismatching existing entries.
3. Versioned namespace where "finalize" step creates an immutable snapshot.
4. Configurable retention policy with sealed retention periods.
5. Audit surface linking who/when/why any mutation is requested.

## Competitors and benchmarks
- GitHub, Git: append-only commit history, but no enforced policy layer.
- Salesforce Auditing: field history tracking, but overwrite-allowed with history.
- Blockchain/Notarization: immutable ledger semantics, but introduces throughput/latency.
- Coda, Airtable: snapshot histories, no policy enforcement.
- Legaltech CLMs (e.g., Ironclad): versioning without cryptographic immutability.

## Regulatory and legal considerations
- Model Rules of Professional Conduct: modifying a rule draft after publication may trigger duty to correct in subsequent communications.
- ER 1.15 avoid commingling by having clean audit trails over client funds/records.
- FATCA/FBAR/FTC: recordkeeping requirements mean records must be preservable, not erasable.
- SOX §802 record-destruction prohibitions where applicable.
- Data retention circuits may require customer deletion requests; immutability needs a privacy escape hatch with explicit consent.
- EU Data Act: portability and deletion rights may conflict with absolute immutability; use pseudonymous archiving or legal hold workflows.

## Recommended architecture
- Event-sourced store plus projection with policy engine.
- Hash digest in metadata; sign provenance with internal keypair.
- Separate regularization job reconciles tombstones and live state.
- Retention exceptions modeled as competent, authorized overrides with audit capture.

## New subtopics recommended
- event-sourced-immutable-store (HIGH)
- tombstone-and-retention-policy (MEDIUM)
- hash-and-provenance-signing (HIGH)
- regulatory-compatibility-and-escalation-exceptions (MEDIUM)


## esta-2b-1a-3-4-4-3-3-1-1-3-1e-3-3-5-5: Provenance chain audit log schema

- Researched: 2026-05-31
- Status: appended

## esta-2b-1a-3-4-4-3-3-1-1-3-1e-3-3-5-5: Provenance chain audit log schema

- Researched: 2026-05-31
- Status: appended

This is a follow-on to the live-region/accessibility CI work already completed through `esta-2b-1a-3-4-4-3-3-1-1-3-1e-3-3-5-4-4`. The topic asks for a provenance chain audit log schema that can support legal defensibility, tamper detection, and cross-system query for a compliance-sensitive WealthForge module.

### What to build
- **Provenance JSON Schema for audit log entries**
  - Canonical event shape: `event_id`, `parent_event_id`, `actor_id`, `actor_role`, `action`, `target_resource`, `target_id`, `jurisdiction`, `timestamp`, `input_digest`, `output_digest`, `policy_version`, `signature_key_id`, `retention_class`.
  - Extensible `context` bag for module-specific fields (e.g., `template_id`, `reviewer_decision`, `upe_section`).
  - Use JSON Schema Draft 2020-12 with `unevaluatedProperties: false` in production, `true` in dev.
- **Hash chaining and Merkle tree verification**
  - Each event stores `prev_event_hash` plus its own `event_hash = SHA-256(prev_event_hash + canonicalized_payload)`.
  - Periodic Merkle root certificates written to immutable storage (e.g., append-only object storage with WORM) to detect backdated inserts.
  - Bundle verification tool that recomputes hashes from any start event to a given root and reports gap/alteration.
- **Integration with SIEM and compliance dashboards**
  - Expose read-only API endpoint returning filterable, paginated audit events (`actor`, `jurisdiction`, `date_range`, `action_type`).
  - Provide prebuilt Grafana/Splunk views for retention gaps, signature failures, and unusual replay patterns.
  - Implement OTLP/metrics export for alerting (e.g., >1% events missing `output_digest`).
- **Access controls and log redaction policy**
  - Role matrix: Compliance can read raw events; Engineering can read redacted fields only; Auditors can request time-boxed reveal via approval workflow.
  - Redaction rules by `retention_class` and jurisdiction (e.g., EU client identifiers masked unless GDPR Art. 9 lawful basis documented).

### Plain-English findings
- Provenance audit logs are a **regulatory hygiene baseline** rather than a product differentiator, but lack of one is a hard blocker for regulated jurisdictions and large RIAs.
- Existing WealthForge infrastructure already emits structured events; adding a schema boundary is lower cost than retrofitting after an SEC examination or state-bar inquiry.
- The highest-value capability is **cryptographic continuity** (hash chain), because it turns logs into admissible evidence without requiring platform-wide rethink.

### Competitors / alternatives
- OpenTelemetry + Elasticsearch provides queryable logs but no built-in tamper chain.
- Commercial GRC tools (AuditBoard, ConvergePoint) provide policy templates, not embeddable product audit logs.
- Blockchain-based audit trails (hyperledger, etc.) are overkill and create key-management complexity for a single-tenant SaaS model.

### Regulatory considerations
- SEC Marketing Rule and custody rule examinations increasingly review digital audit completeness, not just paper files.
- UPL risk: any automated recommendation returning to counsel must be replayable; without provenance, privilege analysis is indeterminate.
- Data residency laws (EU, some US states) may restrict where raw `actor_id` personal data can be stored; redaction + pseudonymization should be designed first.
- 5-year SEC retention requirement for communications maps cleanly to the retention classes in the schema.

## esta-2b-1a-3-4-4-3-3-2: Cross-Jurisdiction Admission Lookup Integration (Bar/Baz/R disadvantages)

- Researched: 2026-05-31
- Status: appended

# Cross-Jurisdiction Admission Lookup Integration (Bar/Baz/R disadvantages)

## Topic ID
esta-2b-1a-3-4-4-3-3-2

## Title
Cross-Jurisdiction Admission Lookup Integration (Bar/Baz/R disadvantages)

## Key Findings
- **LegalSifter**, **Fastcase (vLex)**, and **LexisNexis Verified Attorney** are vendors with U.S. bar status APIs that can replace 56+ state/mod scrapes.
- Most competitors embed third-party bar lookups (Clio ↔ Fastcase).
- Scraping state bar websites is usually TOS-restricted.
- Regulatory implication: inaccurate or outdated bar status may create UPL exposure if WealthForge renders admitted-attorney UI badges incorrectly.
- Immediate recommendation: contract Fastcase/LegalSifter, cache results, build UPL-safe fallback.

## Blockers
- No immediate blockers identified.

## esta-2b-1a-3-4-4-3-3-3: UPL disclosure text templates by badge tier

- Researched: 2026-05-31
- Status: appended

**Topic:** esta-2b-1a-3-4-4-3-3-3 — UPL disclosure text templates by badge tier
**Researched:** 2026-05-31

## Summary
This spec defines copy templates that display authority-badge disclaimers to template consumers, with tier-appropriate wording that satisfies unauthorized practice of law (UPL) guardrails while preserving discoverability. Badge tiers range from lowest evidentiary support (experimental) to highest (two-source, state-bar-reviewed authority). Each tier maps to distinct disclosure obligations: experimental/untested templates must surface a prominent disclaimer; authoritative templates may display a confidence badge with lighter notice. Jurisdictions vary materially in what constitutes impermissible legal advice; a single global template invites UPL exposure, so the system must support jurisdiction-aware composition.

## What to Build
- `tiered-disclaimer-copy-spec` — Authoritative markdown/i18n token sets for each badge tier, including plain-English render targets for DOM and dark-mode accessibility.
- `jurisdiction-concatenation-rules` — Composition runtime that appends or prepends jurisdiction-specific statutory bars (e.g., NY CPLR 4511, CA Business & Professions Code §6125) and the firm’s “not legal advice” gate.
- `copy-governance-workflow` — Staging/promotion policy with counsel review steps, edit freeze during review, rollback on UPL challenge, and change-notification schema.
- `legalese-review-checklist` — Checklist for counsel verifying disclosure sufficiency per jurisdiction before production promotion.
- `i18n-extraction-spec` — Token extraction/alignment rules for Spanish, Mandarin, Korean, and French, with culturally appropriate analogies where permissible.

## Competitors and Analogs
- Thomson Reuters Practical Law and Lexis+ show “authority” panels but do not model disclosure copy per evidentiary tier; no legal-AI research platform (Bloomberg Law, Westlaw Edge) currently gates template visibility by UPL badge taxonomy with jurisdiction-specific disclosure text. WealthForge has a first-mover window here.

## Regulatory Considerations
- State Bar / UPL exposure: disclosing templates without appropriate caveats can shift product characterization from attorney advertising/reference to unauthorized practice.
- NY CPLR 4511 and CA Bus. & Prof. Code §6125 impose authorship disclosure requirements; certain jurisdictions require attorney branding/approval display format.
- FTC/state consumer protection: disclaimers must be unambiguous, in close proximity to the content, and not buried in Terms.
- Privacy/accessibility: disclosure copy should be surfaced to assistive tech with the same priority as primary content (WCAG 2.1 AA).

## Operational Notes
- Promotions: experimental -> draft -> authoritative require counsel sign-off and editor-policy activation toggles at runtime.
- Publication gate: authoritative templates without counsel sign-off fall back to experimental copy automatically.
- Rollback triggers: bar complaint flag, direct competitor challenge, regulatory guidance change.
- Telemetry per template: disclosure impression rate, advisor override count, bar-complaint flag count, jurisdiction where displayed.

## esta-2b-1a-3-4-4-4: Cross-encoder reranker integration and latency budget

- Researched: 2026-05-31
- Status: appended

## Topic: Cross-encoder reranker integration and latency budget

**What to build/look for**
- A top-N reranking layer that sits after the initial retrieval stage in WealthForge’s legal template/discovery pipeline. The goal is to score candidate templates, authorities, or snippets for each query before they surface to counsel.
- Latency targets should be explicit: benchmark end-to-end times per query. A common pattern emerges from industry practice: cap the rerank candidate set at 3–100 items depending on model size and hardware, and target <100–200ms for the rerank step. If the cross-encoder is slower, fallback to the lightweight first-pass ranker rather than blocking user-facing results.
- Evaluate ONNX/TensorRT or CPU kernels if running in-house; otherwise managed rerank APIs (Cohere Rerank, Together) make latency predictable.

**Competitors / alternatives**
- Cohere Rerank is the benchmark most papers compare against; Google Vertex/Search Generative Experience and OpenRouter rerank endpoints also exist.
- Open-source modeling routes: `cross-encoder/ms-marco-TinyBERT-L-6-v2` (small, fast), or English/ multilingual BGE-Reranker. Small models often balance latency and relevance adequately for legal corpus size.

**Regulatory / UPL considerations**
- Latency is not a legal ethics issue by itself, but reliability/availability is: if reranker outage causes stale, lower-quality template results to be shown first, there is potential client-harm risk where outdated authority or forms are acted upon.
- Counsel-adjacent products should treat reranker output as exactly that—reranking—not new content. Keep the privilege bubble: do not log full query text if it contains client facts. Log candidate IDs, scores, and a query hash for audit.

**Blockers / risks**
- Model drift. Cross-encoders are not monotonic in architectural changes. Prefer parameter-light models for the reranker so fine-tunes are cheap.
- Hard latency ceiling without a fallback ranker breaks user trust. No external vendor in this research addresses WealthForge’s specific “state-specific rule + client fact” retrieval, so a custom reranker trained on internal counsel feedback is likely required. Fraud/scam risk is otherwise irrelevant to this topic.

## esta-2b-1a-3-4-5: Discovery audit trail and UPL risk-neutral ranking policy

- Researched: 2026-05-31
- Status: appended

# Research: Discovery audit trail and UPL risk-neutral ranking policy
Generated: 2026-05-31
Source path ticked in AGENDA.md line 486

## Plain-English summary
Currently, the platform can recommend template variants without retaining an auditable reason for why one recommendation beat another. For compliance and for UPL defense, that is a liability. This research defines an append-only discovery audit trail and a ranking policy that does **not** use UPL exposure as a hidden demotion signal—preventing "burial" of newer or external templates without an explicit policy decision recorded.

## What to build
1. Recommendation-provenance event schema  
   Store per-query: template ID, source model, model version, reranker score, reranker rank, source juris authority tier, counsel-attestation flag, validation timestamp, hunts suggest state. All fields are immutable once written.
2. Neutral ranking policy engine  
   UPL status is captured for upstream approval routing, not as a ranking penalty. This prevents rank suppression as a de-facto UPL avoidance and produces a defensible audit explanation.
3. Daily Merkle root export  
   Hash the query log into a single commitment value stored in the compliance dashboard for verification during discovery.
4. Approval-state lookup cache  
   Link to the existing approval matrix and routing engine (esta-2b-1a-6) so rank changes caused by review transitions are recorded with actor and reason.

## Competitors and analogs
- Relativity Trace: document-level provenance and visual timelines, but no template-ranking rationale.
- Kira Systems / Luminance: what changed and why across contract variants, but focused on deal risk rather than regulatory fitness.
- There is no known competitor that publishes an explicit "risk-neutral ranking" policy for legal template discovery.

## Regulatory considerations
- Model Rule 5.5 (UPL) and analogous state provisions: systems must not enable non-lawyers to produce legal work, but must also not silently demote legitimate sources in ways that are undiscoverable.
- SEC Examination prioritizes communications and algorithmic decision-making in wealth-management tools; OCIE document production frequently asks for model rationale and human oversight records.
- State bar admission integration (esta-2b-1a-6) makes approval routing auditable; this item must reference it rather than re-implement admission logic.

## Recommended subtopics to add
- `esta-2b-1a-3-4-5-1` Provenance schema field spec — list of fields, data types, retention period  
- `esta-2b-1a-3-4-5-2` Risk-neutral ranking policy document — rules dictating how UPL status is treated during inference  
- `esta-2b-1a-3-4-5-3` Merkle-root daily digest export and verification routine  
- `esta-2b-1a-3-4-5-4` Query-level audit log consumer for compliance dashboard  
- `esta-2b-1a-3-4-5-5` Demo/replay tool for "show me why this recommendation ranked first"

## wps-02a-1a-2a-1a-a-1-1-1e-1.1-c: CCO Escalation Workflow Tied to Fallback Thresholds

- Researched: 2026-05-31
- Status: appended

# Research: CCO Escalation Workflow Tied to Fallback Thresholds

## Topic ID
wps-02a-1a-2a-1a-a-1-1-1e-1.1-c

## Executive Summary
A CCO escalation workflow for WealthForge's methodology engine should automatically raise compliance review when "fallback mode" in prior-update calculations exceeds a defined threshold (e.g., >5% of client runs). The goal is to provide defensible governance under the SEC fiduciary standard (ERISA §404(a)(1), SEC Reg Best, 206(4)-1 Marketing Rule), while avoiding advisor fatigue from over-notification.

## Findings
- Regulatory requirement: Reg Best, 17a-4 records, and 206(4)-1 require documentation showing that material methodology changes were reviewed, approved, and disclosed. Automated escalation creates a complete audit trail.
- Trigger design: automated when fallback_rate > 5% over a rolling 30-day window; additional tiers at >10% (URGENT) and >25% (CRITICAL) map to CCO review, general counsel notification, and board escalation.
- Escalation levels (1-3): Level 1 = CCO review and approval; Level 2 = general counsel + compliance; Level 3 = board risk committee. Each level should have SLA targets and notification channels.
- Advisor acknowledgment: include an advisor acknowledgment stage before CCO review to distinguish intentional override vs. missed review.
- Disclosure: for affected clients, design a plain-English template per the SEC Marketing Rule explaining that methodology confidence changed and that no recommendation changed unless disclosed.
- Competitor gap: eMoney, RightCapital, and MoneyGuidePro do not provide automated CCO escalation for methodology fallback; this is a first-mover advantage.
- Validation: design A/B tests for escalation timing and CCO workload; target CCO workload < 5% of all prior-update events.

## New Subtopics
- wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-1: Escalation trigger threshold calibration and rolling-window methodology
- wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2: CCO review UI/workflow and SLA enforcement
- wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-3: Advisor acknowledgment stage design and blind-acknowledgment detection
- wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-4: Client disclosure templates per SEC Marketing Rule
- wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-5: Level-based escalation policy and notification channels

## Blockers
- Needs finalized fallback detection model and 30-day window data before SLAs can be provisioned.
- Compliance sign-off on escalation policy and notification language before build.

## esta-2b-4: Advisor/compliance review workflow and notification model

- Researched: 2026-05-31
- Status: appended

Key findings:
- Purpose: Build a workflow and notification model that routes domicile/precedence rules from authoring to advisor/compliance review and onward to affected stakeholders. It should replace ad-hoc review with accountable, automated handoffs.
- Model-to-series fit: esta-2b sits inside the broader state-estate-tax / domicile-precedence system already being built in WealthForge. An advisor/compliance review layer is the natural next step after structured rule authoring and testing.
- Competitors / gaps:
  - No dedicated domicile-review module found for state estate/inheritance tax; dedicated adoption is carried manually in multi-state trust practice.
  - Closest analogues come from tax compliance platforms (Vertex, Sovos, CCH) for state change routing, but they lack advisor-side review and notification semantics.
  - Practice-management tools (Clio, MyCase) provide generic task assignment; none encode tax-specific review criteria, escalation, or client notification rules for domicile cases.
  - Financial-planning tools (eMoney, RightCapital) have advisor notifications, but not jurisdiction change review with compliance sign-off.
- Requirements / what to build:
  - Reviewer selection rules tied to rule/jurisdiction/service type, with SLA tracking and escalation if reviewers miss deadlines.
  - Status transition model: Submitted → In Review → Approved / Rejected / Returned, with audit log for each handoff.
  - Multi-channel notifications: in-app task, email, and SMS; include legal citations, linked change-set diff, structured rationale form, and approval checklist.
  - Integration with esta-2b-1a-1-x semantic diff engine so reviewers can review consequential rule changes with highlighted exceptions.
  - Compliance retention metadata: 5-year retention mode by default (state examination), plus redaction and access controls.
  - Client-facing notification policy: what is disclosed, when, and in what form; regulated by state-specific disclosure rules and the SEC Marketing Rule.
  - Correlation with esta-2b-1a-3-4 templates: published templates that create domicile risk events should auto-generate review tasks.
- Regulatory considerations:
  - State examination and privilege review: domicile precedence files can be privileged work product if prepared in anticipation of tax controversy; the system should support privilege tagging, limited access, and audit metadata.
  - Recordkeeping: retain all submissions, reviews, and approvals in case of state audit. SEC Marketing Rule requires fair and balanced communications if impact summaries are sent to clients.
  - Access controls: reviewers must be NY counsel for NY rules (per esta-2b-1a-6 matrix). Access policy must enforce routing and prevent unauthorized edits.
- Operational value:
  - Reduces back-and-forth time between counsel and advisors.
  - Creates auditable chain of custody for domicile rule changes.
  - Lowers compliance risk during state examinations by producing examiner-ready review history.
- New subtopics suggested:
  - esta-2b-4a: Notification channel policy and template design
  - esta-2b-4b: SLA and escalation matrix by rule type/jurisdiction
  - esta-2b-4c: Privilege tagging and work-product access controls
  - esta-2b-4d: Client disclosure generator for approved rule changes

## esta-2b-1a-3-5-sub-2: UPL risk classification schema and policy

- Researched: 2026-05-31
- Status: appended

**Topic ID:** `esta-2b-1a-3-5-sub-2`
**Researched:** 2026-06-04
**Focus:** Build a risk classification framework and operational policy for WealthForge's Unauthorized Practice of Law (UPL) exposure across domicile-rule authoring, template publication, and distribution workflows.

### Context in WealthForge
- WealthForge operates a structured domicile-rule editor where advisors and in-house counsel draft, publish, and distribute legal/regulatory templates.
- UPL risk arises when non-attorneys generate content that could be construed as legal advice, when automated systems rank or recommend rules across jurisdictions, or when distribution reaches clients in states with active enforcement.
- Research note: This subtopic is a direct successor to `esta-2b-1a-3-5`, which established template publish-time disclaimer injection and UPL enforcement gates. `esta-2b-1a-3-4-4-3-3-1-1-3` established badge evidentiary standards and reviewer attestation requirements.

### What to Build
- **Risk tier schema** mapping templates to RED / YELLOW / GREEN tiers based on jurisdiction aggressiveness, template function, and audience.
- **Publish-time UPL gate**: schema-driven blockers for RED-tier publications with state-specific override routing to counsel queues.
- **Distribution routing policy**: ties template tier + recipient jurisdiction + delivery channel to permitted actions.
- **Safe-harbor exemption registry**: evidence-based catalog of state statutory safe harbors.
- **Override protocol**: time-bound exception workflow with mandatory audit logging.
- **Daily compliance report** feed for `esta-2b-1a-3-5-sub-3`.

### Competitors
- **ClauseBase**: jurisdiction validation and publisher liability model, but UPL tiering is not configurable.
- **HotDocs / Exari**: approval workflows and jurisdiction checks exist; UPL classification is implicit and vendor-managed.
- **CoCounsel (Casetext)**: attorney-review gates and "not legal advice" badges, but no public template-authoring tier schema.
- **Workiva / ConvergePoint**: policy management without legal-practice area taxonomy.

### Regulatory Considerations
- UPL is defined by statute in some states (e.g., CA Bus & Prof Code § 6125) and court rule in others (e.g., NY CPLR 1205); schema must support jurisdiction-specific gate logic, not generic labels.
- Private right of action exists in several states, creating civil liability beyond bar discipline.
- Disclaimer adequacy must be jurisdiction-specific and template-specific; one-size-fits-all boilerplate increases exposure. See `esta-2b-1a-3-5-sub-1`.
- Retention: bar counsel may request publication logs, reviewer credentials, and approval timestamps; recommend 5–7 year retention.
- Cross-jurisdiction rule: a single template distributed to multiple states must satisfy the strictest applicable tier.

### New Sub-Topics Generated
- `esta-2b-1a-3-5-sub-2-1` (HIGH): Publish-time UPL gate automation and state-specific override routing
- `esta-2b-1a-3-5-sub-2-2` (HIGH): Distribution-channel routing policy tier x jurisdiction x delivery-channel rules
- `esta-2b-1a-3-5-sub-2-3` (MEDIUM): Safe-harbor exemption registry and evidence requirements
- `esta-2b-1a-3-5-sub-2-4` (MEDIUM): UPL incident taxonomy, audit log schema, and metrics dashboard
- `esta-2b-1a-3-5-sub-2-5` (LOW): Override protocol and exception SLA template for time-bound needs

### Blockers
- No public UPL enforcement dataset by template type; initial tier placement will be heuristic and must be validated by counsel.
- State-by-state private right of action mapping is not centralized; synthesis from bar opinions and case law required.
- Consensus on tier thresholds may differ among counsel reviewers; a governance body is needed before production deployment.
- Integration with state-bar admission APIs is desirable and may affect override eligibility.

## esta-2b-1a-3-5-sub-2-1: Distribution-channel routing policy tier x jurisdiction x delivery-channel rules

- Researched: 2026-05-31
- Status: appended

## Channel Routing Policy Research

### What to Build
WealthForge should build a matrix-driven routing engine that maps each document/rule output to:
- **Tier**: client segment, document sensitivity, or feature access level
- **Jurisdiction**: U.S. state or international region with specific regulatory regimes
- **Delivery channel**: web portal, mobile app, email, API, print, or encrypted document

The policy should decide in real time whether content is viewable, downloadable, or retrievable through a given channel. For example, certain attorney-client privileged forms must never be delivered via unencrypted channels or to users outside the retention jurisdiction. Tier rules can enforce feature-level access (e.g., only premium subscribers may export raw data); jurisdiction rules can enforce localization (language, mandatory disclosures, and advertising disclaimers per state bar rules).

### Core Components
1. **Routing Table Engine**: deterministic lookup combining `(tier, jurisdiction, channel)` with allow/deny/warn actions
2. **Channel Capability Registry**: declarative config per channel (encryption, MFA, auditability, file type restrictions)
3. **Policy Versioning**: treat rules as code so changes to advertising disclaimers or state regulations are tracked with effective dates
4. **Decision Audit Log**: required for defending routing decisions in regulatory reviews

### Competitors and Analogues
- **Thomson Reuters Westlaw Practical Guidance**: uses channel gating by subscription and firm tier; does not expose client-facing distribution routing.
- **Lexis+ Practical Guidance**: similar tier-based access but focused primarily on web/mobile; limited API exposure.
- **Bloomberg Law Checkpoint**: restricts content channels by firm size and jurisdiction of practice, with strong audit trails.
- **Compliance-as-a-Service platforms** (Navex Global, Convercent): manage policy-by-policy routing for training/compliance content across global jurisdictions and employee tiers.
- **Tax software providers** (CCH, Vertex): restrict certain filings/channels by jurisdiction and preparer tier.

None of these systems fully productize the 3-axis matrix with first-class client-tier configurability; WealthForge can differentiate by making this model explicit and programmable for clients.

### Regulatory Considerations
- **Attorney Advertising Rules**: every U.S. state bar restricts how legal service information is delivered and labeled to consumers. Channel routing must inject jurisdiction-specific disclaimers (e.g., California's "Not Legal Advice" requirements) and prevent web-to-email forms in states requiring firm disclaimers.
- **Data Privacy / CCPA / GDPR**: channel selection determines legal basis and disclosure requirements. Encrypted channels may be mandatory for sensitive personal data in certain jurisdictions.
- **Multi-State Practice of Law**: routing rules should surface jurisdiction conflicts (e.g., a user in state A modifying a rule applicable in state B where the firm lacks license) and can allow/deny accordingly.
- **Digital Asset and Securities Regulations**: if WealthForge distributes wealth or investment advice content, FINRA/SEC suitability and communication rules apply by channel (social media vs. private portal have very different archiving and supervision requirements).

### Recommended Next Steps
1. Draft the `(tier, jurisdiction, channel)` schema in the ESTA templates module.
2. Build a lightweight policy evaluator referencing a YAML/JSON ruleset with override hooks for rapid regulatory updates.
3. Integrate audit logging to satisfy potential state bar examinations and privacy regulators.

## esta-2b-1a-3-5-sub-2-4: UPL incident taxonomy, audit log schema, and metrics dashboard

- Researched: 2026-05-31
- Status: appended

## Plain-English Summary
Unauthorized Practice of Law (UPL) is the core compliance risk for WealthForge's rule authoring and advisory output capabilities. There is currently no publicly available "UPL incident taxonomy" in legal-tech/open source; practitioners rely on state bar advisories and common-law "practice of law" factors (advice, document preparation, confidence, fee). For WealthForge, a UPL incident can be modeled as an escalation hierarchy:
- `ADVISORY_BOUNDARY_BREACH`: system gives personalized legal conclusion instead of general information
- `DOCUMENT_GENERATION_OVERPREPARATION`: generated documents include substantive legal analysis
- `CITATION_MISUSE`: authority is applied outside permissible scope
- `CROSS_JURISDICTION_CONFLICT`: rule from State A is applied to client domiciled in State B
- `CLIENT_REPRESENTATION_SIGNAL`: UI/UX language implies attorney-client relationship

An audit log record schema should include: event_id, timestamp, rule_template_id, jurisdiction, user_role, query_type, output_type, risk_signals[], model_version, and sanitized_provenance[].

Metrics: publish gating rate, times-to-remediate, badge-expiry adherence, override frequency, reviewer SLA compliance, false-positive rate of validator, and incident-severity distribution.

## Competitors
- No documented UPL taxonomy exists from competitors. Closest comparables: Fastcase/Thomson Reuters Drafting Assistant use citation validation without public incident taxonomy; Paladin/Ooga have no public UPL dashboards.
- Legal tech compliance tooling vendors treat UPL as a policy, not a scored taxonomy.

## Regulatory Considerations
- 47+ states define UPL; ABA Formal Opinion 10-457 (2010) and several state ethics opinions warn against nonlawyer legal advice systems.
- Bates v. State Bar of Arizona (2016) and subsequent expansions of nonlawyer practice in UT, AZ, CA, FL, NY create patchwork permissions; need jurisdiction-specific UPL profile.
- Proposed ABA Resolution 100/ABA 2022 model rule changes to permit non-lawyer limited-scope representation may shift UPL basis rules by 2027.

## New Subtopic Candidates
- `upl-incident-severity-model`
- `upl-audit-log-schema-spec`
- `upl-metrics-dashboard-spec`

## wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-1: Escalation trigger threshold calibration and rolling-window methodology

- Researched: 2026-05-31
- Status: appended

## RESEARCH ENTRY
- **Topic ID:** wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-1
- **Title:** Escalation trigger threshold calibration and rolling-window methodology
- **Date:** 2026-05-31
- **Status:** Preliminary

## 1. Why This Topic Matters
The WealthForge fallback-rate >5% feature uses a KL-divergence and audit-exposure scoring model. When the fallback mode is triggered more than 5% of the time in any rolling window, the system should raise a calibrated escalation tier to the CCO workflow so compliance leadership can review methodology health before client harm or regulatory scrutiny occurs.

Calibrating those thresholds is not purely a statistical optimization problem. Thresholds must be defensible in:
- Regulatory examinations (SEC/FINRA)
- Internal risk committees
- Client-facing explanations (in partnership with `wps-02a-1a-2a-1a-a-1-1-1c-4`)
- Audit and operational continuity plans

## 2. Key Findings

### A. Regulatory and Compliance Landscape
| Authority / Guideline | Relevance |
|---|---|
| SEC Marketing Rule (2020) | Requires that any methodology used in client-facing materials be transparent and that material changes be disclosed. Escalation thresholds are therefore not just operational—they touch advertisement substantiation. |
| FINRA Rule 2111 (Suitability) | If prior-data conflict could reclassify recommended products, escalation thresholds must map to suitability review requirements. |
| CFA Institute Disciplinary Reviews | CFA internal case reviews often cite "threshold calibration based on heuristic rather than evidence" as a process gap. |
| OCC / FRB Model Risk Management (SR 11-7) | For wealth-tech operating as a bank service provider, model-validation standards require sensitivity analysis on thresholds against out-of-sample data. |

Regulators do not prescribe exact numerical thresholds, but they do expect:
1. A documented methodology for threshold selection
2. Validation data supporting the threshold
3. A process for periodic recalibration
4. Clear ownership for escalation decisions

### B. Rolling-Window Design Tradeoffs
| Window Type | Use Case | Risk | Recommendation |
|---|---|---|---|
| Fixed calendar window (e.g., 90 days) | Simpler reporting, deterministic audit windows | Catastrophic event skews threshold for entire quarter | Avoid as sole trigger |
| Trailing calendar (rolling) | Better operational signal | Harder to explain to clients/auditors | Use as operational trigger, freeze for quarterly reporting |
| Fixed-count window (last 500 decisions) | Statistically stable | Not aligned to calendar reporting | Use as internal model validation window |
| Hybrid: 30 + 90 calendar | Balances reactivity and stability | Slightly more complex | Recommended |

The rolling-window methodology should therefore:
- Track a 30-day fast-response window for near-real-time CCO notification
- Track a 90-day slow-response window for ICAAP-style quarterly compliance review
- Anchor a fixed quarterly freeze period for client disclosure reports

### C. Threshold Calibration Methodology
1. **Data:** Use a retrospective 12-month run to establish the baseline distribution of fallback frequency. A key reference in WealthForge materials is the >5% finding from `wps-02a-1a-2a-1a-a-1-1-1e-1.1-d`.
2. **Decision-theoretic framework:** Treat threshold as a binary classifier that trades Type I (false alarm → wasted CCO review) vs Type II (missed decline in model health → regulatory/compliance risk). Choose thresholds where expected cost is minimized.
3. **Sensitivity analysis:** Run bootstrap resampling of the 12-month dataset to derive threshold confidence intervals.
4. **Direction-aware triggers:** Since KL is asymmetric, thresholds should be set separately for KL(prior||likelihood) vs KL(likelihood||prior), because they measure different failure modes.
5. **Heuristic guardrails:** Escalation should not rely solely on statistical thresholds—add heuristic constraints like:
   - If fallback % above threshold AND CCO review queue already at capacity → deferred review with documented rationale
   - If fallback % above threshold AND market volatility regime change ≥ 2σ → auto-flag as market-driven, not model-driven

### D. Competitor / Industry Practices
| Firm / Tool | Approach to threshold calibration |
|---|---|
| BlackRock Aladdin Risk | Uses rolling 90-day VaR backtesting with yellow/red breach bands; thresholds tied to client mandate policy |
| MSCI Barra | Multi-horizon model testing windows: 1-day, 10-day, and 1-year model drift benchmarks |
| Orion Envestnet | Advisor-tooling platforms use fixed monthly review cadences; limited algorithmic escalation |
| Kitces / Jump annuity suitability engines | Use advisor workflow gates rather than automated rolling-window triggers |

Competitive insight: No advisory-technology platform appears to expose automated rolling-window recalibration tied to Bayesian fallback frequency. WealthForge can differentiate by providing:
- Transparent, regulatory-defensible calibration data
- Role-appropriate drill-downs (CCO vs IC vs advisor)
- Integration with `wps-02a-1a-2a-1a-a-1-1-1e-1.1` audit-exposure scoring

### E. What to Build (Ordered)
1. **Data-backfill pipeline** — Compute fallback frequency over the last 12–18 months and produce baseline charts.
2. **Threshold simulator** — A configurable "if-then" engine that allows CCO to vary thresholds and review before/after alert volume.
3. **Rolling-window engine** — 30/90 dual-window computation with configurable freeze periods.
4. **CCO escalation queue** — Stores triggered events, reviewer actions (acknowledge, dismiss, defer), and rationale codes.
5. **Audit trail export** — Structured JSON/csv export satisfying basic SR 11-7 / audit documentation requirements.
6. **SLA enforcement layer** — Links to `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2`; time-box first CCO acknowledgment within N business hours.

## 3. Recommendations
- Adopt the dual-window approach (30 + 90 days)
- Implement separate thresholds for KL-direction (prior||likelihood vs likelihood||prior)
- Run bootstrap confidence intervals around the >5% threshold annually
- Integrate the threshold engine with `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-5` level-based escalation policy notification channels
- Document methodology for exam readiness in `mo-01-3` exam prep assets
- Use this topic as the control layer for `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-6` (not yet created): "Automated threshold anomaly detection — when alert rates themselves change signficantly, recompute thresholds rather than alerting more."

## wps-02a-1a-4: Hierarchy and Cluster Analytics — Wealth Management Platform Innovation

- Researched: 2026-05-31
- Status: appended

# wps-02a-1a-4: Hierarchy and Cluster Analytics

**Researched:** 2026-05-31  
**Status:** appended

## Overview
Hierarchy and cluster analytics represent a WealthForge-native innovation layer for wealth management platforms: automated segmentation, cohort analysis, and relationship-aware data hierarchies that no current platform surfaces natively.

## Key Findings
1. **First-mover opportunity**: No major RIA platform today exposes a hierarchical clustering module as a core feature. The dominant tools cluster only by account type or AUM tier; none apply behavioral cohort clustering with dynamic hierarchy recalibration.
2. **Innovation target**: Build a self-organizing hierarchy engine that adapts clusters over time as client metrics drift. Retention risk is highest in "near-threshold" clusters: clients whose behavior sits just inside/outside target boundaries are most sensitive to service changes.
3. **Competitive gap**: Altruist and Orion show clustering primarily as reporting labels, not operational inputs. Only WealthForge can make cluster membership drive advice content, fee tier logic, and advisor action routing.

## What to Build
- `Hierarchy Engine`: module that ingests RTQ/outcome signals and produces ranked clusters with drift alerts.
- `Cluster Boundary Tuner`: fine-tune sensitivity for the 3.8-4.5 range cited in Baldwin-style optimization evidence — where small changes in void ratio or metric weight can flip a client into a different service tier.
- `Client Journey Lenses`: treat hierarchy as a multi-view structure (event view, goal view, service tier view) rather than single rigid segments.

## Competitors / Closest Patterns
- **Static reporting clusters**: Orion, Black Diamond.
- **Risk-profiling groups**: Schwab, Fidelity (one-directional, not adaptive).
- **Governance-grade hierarchies**: BoardEffect (public/corp only; no operational linkage).

## Regulatory / Compliance Considerations
- Service tier changes can trigger advisor recordkeeping obligations; avoid deterministic automated migrations without human review.
- Maintain explainability around hierarchy transitions to satisfy marketing-rule disclosures and client privacy standards.

## Business Impact
- Enables targeted service/tiering with measurable retention benefit.
- Reduces manual recategorization work or "label sprawl" in CRM.
- Provides third-party innovation arms: WealthForge API can license hierarchy-as-a-service to software vendors.

## Suggested Next Subtopic
- `wps-02a-1a-4-1`: Hierarchy transition audit trail for SEC/regulatory review.

## esta-2b-1a-3-5-sub-3: Daily UPL distribution compliance report

- Researched: 2026-05-31
- Status: appended

Topic: Daily UPL distribution compliance report

What to build
- Scheduled daily report aggregating all unauthorized-practice-of-law (UPL) gate events across jurisdictions and distribution channels.
- Auto-identification of missed SLAs, blocked publications, and unsafe-harbor expirations in the last 24 hours.
- Email/console alert routing to counsel, compliance, and operations with severity tiering.

Plain-English findings
- UPL checks are already logged via `upl-incident-severity-model`, but there is no native one-page "yesterday's compliance" digest.
- Jurisdictions change safe-harbor windows at different cadences; a nightly rollup is needed to avoid manual audits.
- Counsel expects two things in daily reporting: what got through, and what was blocked or pending review.

Competitors / benchmarks
- Most legal-ops/review-suite tools (e.g., online legal-info publishers) lack UPL-specific monitoring; typical workaround is custom dashboard queries or exported CSV.
- WealthForge can differentiate with a ready-to-use daily compliance letter for compliance officers.

Regulatory / risk considerations
- A false-negative block can trigger client-servicing delay; a false-positive pass creates UPL enforcement risk.
- Report should include audit references to safe-harbor evidence packages and signed counsel review artifacts.
- Data-retention policy must align with incident-audit-log schema already in roadmap.

## upl-daily-summary-data-model: UPL Daily Summary Data Model

- Researched: 2026-05-31
- Status: appended

# UPL Daily Summary Data Model Research

## Plain-English Findings

- The `upl-daily-summary-data-model` is a read-model / materialized-view design used to aggregate UPL (Unauthorized Practice of Law) metrics by jurisdiction and severity for nightly operational reporting and dashboard consumption.
- The summary supports both daily publication workflows and interactive UPL risk dashboards. It should be optimized for low-latency reads, with point-in-time correctness rather than strict transactional semantics.

## What to Build

- **Summary bucket schema:** One record per jurisdiction per severity per calendar date, storing counts for incidents, mitigated items, overdue SLAs, and coverage-gap strikes.
- **Derived metrics:** rolling-window severity trend, mean-time-to-suppress (MTTS), mean-time-to-mitigate (MTTM), safe-harbor coverage ratio, and pending-review backlog.
- **Timezone and calendar handling:** each bucket tied to the jurisdiction’s business-day calendar, not grid date. Aggregate exports should respect jurisdiction-specific cut-over times.
- **Retention:** Keep hot summaries for 90 days, warm summarized partitions for 3 years, detail-level UPL events permanently with rolling compression.
- **Storage options:** PostgreSQL + Redis read replica for low-latency queries, or ClickHouse if event cardinality is very high. Keep a JSON schema-validated event envelope in the canonical event store.
- **API surface:** `/upletl/v1/summary/{jurisdiction}?date=...&severity=...`, paginated aggregations, alerting predicates, and drill-down to incident list per bucket.
- **Idempotency and recovery:** Derived summary must survive partial reruns. The summary writer should be idempotent and reconcile nightly rollup inputs with previously published exposure values.

## Competitors and Patterns

| Approach / Tool | Trade-offs |
|-----------------|-----------|
| Postgres + materialized view + refresh schedule | Simple, transactional semantics, refresh cost at high ingest |
| ClickHouse aggregating merges | Very high throughput, eventual consistency, separate OLAP infra |
| Redis time-series / cache | Fast reads, TTL management complexity, durability depends on upstream |
| Kafka Streams / Flink state stores | Real-time stream processing, operational overhead, hard restart guarantees |

- For WealthForge, a primary OLTP store (Postgres) plus an OLAP cache layer (ClickHouse or Redis) gives the best balance of durability, query flexibility, and nightly rollup simplicity.

## Regulatory Considerations

- **Data residency and sovereignty:** Summaries may include PII for jurisdiction-party mapping. Avoid including bar-number or admission dates in summary buckets unless required; keep identities in the event store only.
- **Retention rules:** Legal hold is likely required for UPL incidents. Any deletion policy for old summaries must be replaced with a redshift/archive move, never hard delete.
- **Right to explanation:** Daily summaries can be disclosed in compliance responses. They should carry a schema version and generation timestamp, plus a checksum to prove integrity of the source rollup.
- **Audit linkage:** Each summary row should contain an `anchor_event_id` to the upstream nightly publication job and a `generated_by` audit pointer to the publication run’s chain-of-custody entry.

## Relevant Signals from Agents

- The `upl-metrics-dashboard-spec` research explicitly identified this as HIGH priority and generated this subtopic.
- The sibling research `publication-audit-log-and-chain-of-custody-spec` already specifies audit containment; the summary model should align with that schema so chain-of-custody verification spans publication gate → nightly rollup → dashboard.
- The `nightly-rollup-orchestrator-selection` topic will determine scheduling and retry semantics; the data model must expose an idempotent `run_id` consumed by that orchestrator.

## nightly-rollup-orchestrator-selection: Choose orchestrator/runner for scheduled nightly aggregation and publication

- Researched: 2026-05-31
- Status: appended

# Nightly-rollup orchestrator research

## Plain-English summary
For scheduled nightly aggregation and publication, the simplest reliable choice is a containerized scheduler that invokes a stateless Python aggregation job with explicit idempotency keys based on publication date + jurisdiction. The trade-space is mostly between (1) cron-in-container, (2) a workflow orchestrator (Temporal/Prefect/DBT Cloud-style), and (3) cloud-native schedulers.

## What to build
- A small orchestration facade: one configurable runner that handles retries, partial-run reconciliation, rerun idempotency, and publication run identifiers.
- Per-jurisdiction business-day calendars and timezone-aware dispatch.
- Emit a signed publication package plus a chain-of-custody audit record.
- Bridge internal SLA gates to overdue-item redispatch.

## Competitors / patterns
- Open-source cron schedulers: `systemd` timers, Kubernetes CronJobs, Apache Airflow.
- Commercial workflow platforms: Prefect, Temporal, Dagster, AWS Step Functions, GCP Cloud Scheduler + Cloud Workflows.
- Tax/legal publication stacks: Bloomberg Tax, CCH, ONESOURCE rely on batch windows tied to tax-calendar deadlines; most do not expose rerun idempotency hooks.

## Regulatory / operational considerations
- Published packages are examination evidence; chain-of-custody fields and signed outputs matter.
- Timezone/business-day errors can cause a jurisdiction to receive the wrong day's publication.
- Partial failures need an explicit reconciliation path to avoid duplicate or missing client records.

## Recommended subtopics
- [⏳] nightly-rollup-orchestrator-selection-1: retry/sidecar backup policy
- [⏳] nightly-rollup-orchestrator-selection-2: business-day calendar source-of-truth design
- [⏳] nightly-rollup-orchestrator-selection-3: rerun idempotency key schema

## upl-coverage-gap-report-and-alerting: UPL Coverage Gap Report and Alerting

- Researched: 2026-05-31
- Status: appended

## Topic: UPL Coverage Gap Report and Alerting

**Researched:** 2026-05-31  
**Source:** AGENDA.md line 500

---

### What This Is
A scheduled compliance report that lists **expired safe-harbor windows by jurisdiction**. In this context, "safe harbor windows" refer to time-bounded statutory periods during which certain actions carry reduced liability or presumptive compliance status. When a window expires, the jurisdiction may revert to stricter liability standards. The coverage gap report surfaces those expired windows proactively so that counsel can remediate before an outside event forces the issue under worse conditions.

---

### What to Build

1. **Safe-Harbor Window Data Model**
   - Store effective per-jurisdiction windows: `(jurisdiction, statute_or_rule_id, window_start, window_end, applicable_actions, safe_harbor_conditions, expiration_status)`.
   - Link to UPL incident taxonomy and existing jurisdiction-safe-harbor-citation-tracker.

2. **Scheduled Coverage Gap Pipeline**
   - Nightly/business-day job scans the registry for windows that have expired but still have outstanding open obligations or unmitigated exposures.
   - Outputs a jurisdiction-grouped report: expired windows, total affected rules, default exposure level after expiration.

3. **Alerting Strategy**
   - Multi-tier alerts:
     - **Green**: expiring in >30 days — add to next monthly review batch.
     - **Yellow**: expiring in 1–30 days — immediate counsel routing.
     - **Red**: already expired — P0 escalation, SLA-bridged event.
   - Alert payload should include: jurisdiction, expired rule, expiration date, fallback exposure level, recommended action, link to override protocol if applicable.

4. **Integration Points**
   - Hook into the existing upl-sla-event-bridge-and-redispatcher for redispatching overdue items.
   - Publish summary to the upl-metrics-dashboard-spec for CCO visibility.
   - Emit coverage-gap events to compliance audit log schema for chain-of-custody tracking.

5. **Report Formats & Retention**
   - PDF/csv for board/compliance committee distribution.
   - Retention mapped to jurisdiction's statutory minimum retention; store signed-counsel linkage per window for audit defense.

---

### Competitors and Analogues

| Provider / Approach | What They Do | Relevance |
|---------------------|--------------|-----------|
| **Thomson Reuters Regulatory Intelligence / Checkpoint** | Track rule effective dates, expiration dates, and legislative changes by jurisdiction. | Best-in-class regulatory horizon-scanning. WealthForge should match the granularity but add our UPL/action-specific exposure layer. |
| **Lexology / Practical Law / Black Letter** | State-by-state summaries of fiduciary and statutory change windows. | Good reference source; not predictive or integrated with operational UPL gates. |
| **ClauseBase / LegalSifter** | Contract-level safe-harbor tracking and expiration alerts for commercial terms. | Different domain, but the pattern of safe-harbor dashboards is directly transferable. |
| **Bloomberg Law / State Net** | Polysubscribed legislative change tracking with alerting by jurisdiction. | Existing procurement at many law firms; WealthForge should avoid re-implementing raw tracking by integrating via API or RSS where possible. |
| **Compliance.ai / Ascent** | Regulatory change management platforms with deadline tracking. | Heavy compliance focus. Their deadline/alert UX and retention handling are a model for the UPL coverage gap module. |
| **Internal Buckets (WealthForge-specific)** | The nightly-citation-validity-scan and jurisdiction-safe-harbor-citation-tracker already handle tracking active safe-harbor references. | The gap module is the natural complement: once a safe harbor expires, it stops being a positive citation and becomes a gap. |

---

### Regulatory Considerations

1. **Jurisdiction-Specific Variability**
   - States differ on what triggers a "safe harbor," how long it lasts, and what prior acts it covers. California's UPMIFA implementation treats charitable standard-of-care differently than many other states; Delaware has its own independent prudence exceptions for bank trustees.
   - Must store versioned treaty/statute effective dates, similar to the **treaty version history engine** design.

2. **Fiduciary Duty Conflicts**
   - An expired safe harbor can revert a trustee/manager to ordinary negligence or even strict liability for the same class of decisions. Counsel must be alerted before the window closes - some states require contemporaneous disclosure of reliance on a safe harbor *at the time of the action*, not after the fact.

3. **Audit & Examination Readiness**
   - SEC examiners increasingly look for systematic regulation-expiration monitoring. A missing expired-window alert can be framed as an unmanaged risk control deficiency.
   - Document retention must support: original window citation, expiration date evidence, counsel review timestamp, and any override decision.

4. **Cross-Jurisdictional Coordination**
   - Many trusts, funds, or estates span multiple jurisdictions. The module must avoid the common error of reporting one state's expiration as "covered" because another state's safe harbor is still active.

5. **Privilege Tagging**
   - Alert content may contain legal conclusions re: exposure classification; such items should be routed through the **privilege tagging** and work-product access controls so that internal alerts do not create discoverable admissions.

---

### Design Risks and Mitigations

- **Risk: Data staleness** — If jurisdictions amend statute calendars mid-window.
  - *Mitigation*: Tie to nightly-citation-validity-scan and expose a "re-evaluate" hook when state-registry ingestion detects updates.

- **Risk: Alert fatigue** — Counsel may start ignoring safe-harbor expirations if they are noisy.
  - *Mitigation*: Default alert level to Yellow, require explicit opt-in for Red escalation; let counsel tune thresholds by jurisdiction.

- **Risk: Over-reliance on window tracking** — Counsel might delay action waiting for "safe harbor" when independent prudence review is actually better.
  - *Mitigation*: Add a confidence/uptime metric in the alert: "This safe harbor provides nominal protection but higher actual protection comes from plain prudence review."

---

### Relevant Existing WealthForge Workstreams

- upl-dashboard-rbac-and-privilege-model — controls who sees gaps and who is responsible.
- nightly-citation-validity-scan — upstream source for expiration signal.
- jurisdiction-safe-harbor-citation-tracker — source of truth for current window data.
- upl-sla-event-bridge-and-redispatcher — downstream routing for expired items.
- esta-2b-1a-3-5-sub-3-4: Jurisdiction-safe-harbor expiration rollup — closely related sibling; likely shared substrate.


## upl-sla-event-bridge-and-redispatcher: UPL SLA Event Bridge and Redispatcher

- Researched: 2026-05-31
- Status: appended

## What it is
Auto-bridge UPL (Unauthorized Practice of Law) publication gates to SLA (Service Level Agreement) events, then redispatch overdue items so nothing falls through cracks across counsel review, publication windows, and renewal deadlines.

## Why it matters
Gaps between UPL safe-harbor windows and operational SLAs create compliance exposure: missed publication deadlines, expired overrides, and stale privilege tags that SEC examiners can cite. Bridging these two planes makes the jurisdiction-specific rules actionable, not just reference data.

## Competitors and analogues
- Legal SaaS policy engines (e.g., Lexology, Practical Law) provide status tracking but not native UPL-to-SLA bridging.
- ITSM tools (ServiceNow, Zendesk) handle SLA dispatch but lack legal-subject-matter routing.
- Wealth management compliance platforms focus on ADV/marketing surveillance, not jurisdictional publication gating.

## Regulatory considerations
- UPL rules vary by state; misstatements create state-bar exposure.
- Publication windows and override deadlines can trigger privilege lose if missed.
- SLA timers must respect counsel availability, jurisdiction business days, and signed-counsel linkage from existing ESTA artifacts.

## What to build
1. Event bridge: map UPL gate outcomes (pass/fail/override) to SLA event types (review, publish, renew).
2. Redispatcher: for overdue items, calculate allowable grace/exception windows, then route to backstop counsel or escalation channel.
3. Audit trail: tie bridge events back to jurisdiction rules and approval records.

## References for builders
- ABA/Baker McKenzie multi-jurisdiction publishing playbooks for basic date/holding concepts.
- ITSM SLA rerun/delivery patterns from atlassian-statuspage and AWS Step Functions.
- Existing WealthForge references: esta-2b-1a-3-5-sub-2-3 (safe-harbor evidence), esta-2b-1a-3-5-sub-3-3 (counsel escalation), esta-2b-1a-3-5-sub-3-5 (signed-counsel linkage).

## Proposed next subtopics
- [⏳] upl-sla-event-bridge-and-redispatcher-1: Event schema for UPL-to-SLA mapping
- [⏳] upl-sla-event-bridge-and-redispatcher-2: Redispatcher backstop and escalation matrix


## wps-02a-1b-1: Allocation-dependent methodology ranking engine

- Researched: 2026-05-31
- Status: appended

Topic: Allocation-Dependent Methodology Ranking Engine (wps-02a-1b-1)

## Plain-English findings
- Allocation materially changes which withdrawal methodology is optimal; a method that works at 60/40 may underperform at 90/10 because sequence risk and volatility drag shift with equity exposure.
- Advisors today often give static methodology recommendations that do not adjust to client-specific equity/bond splits, creating a mis-match between recommended method and actual portfolio risk.
- An allocation-dependent ranking makes the recommendation engine portfolio-aware, improving suitability and client outcomes.

## What to build
1. 6x6 allocation grid backtest runner
   - Grid equities/bonds from 0/100 to 100/100 in 20% steps (or finer 10% if compute allows).
   - For each grid point, run all 12 supported methodologies (4% Rule, Guyton-Klinger, VPW, Vanguard LA, etc.) against historical/Monte Carlo paths.
   - Capture success rate, median spending, worst-case spending, and sensitivity score at each point.

2. Ranking + top-2 selector
   - Rank methodologies per grid cell by primary metric (e.g., success rate) with tiebreaker on behavioral fit and withdrawal smoothness.
   - Output top-1 and top-2 with rationale, success-rate delta, and a confidence indicator.

3. Allocation migration advisory
   - For the client’s current allocation, show what the #1 method would be at a nearby allocation if the client shifted 10% equity/bond.
   - Surface the trade-off: 'If you moved to 70/30, the recommended method would change to X with an estimated Y% higher success rate.'

4. Integration points
   - Input from cluster-based recommendation (wps-02a-1a-1) and sensitivity profiles (wps-02a-1).
   - Output to strategy memo builder (FPA-10) and withdrawal optimizer (WO-1).
   - Cache precomputed rankings with invalidation tied to CMA updates or methodology library version changes.

## Competitor landscape
- eMoney, RightCapital, MoneyGuidePro, and Orion do not currently expose allocation-aware methodology ranking; they mainly provide static method comparisons or allocation 'buckets' without connecting backtest outcomes to withdrawal rules.
- Some RIA platforms (e.g., Immunize.io, MaxiFi) show spending sustainability by allocation but do not recommend methodology switches as allocation changes.
- Gap: no off-the-shelf module ranks 12+ withdrawal methodologies across an allocation grid for advisor presentation.
- First-mover advantage for WealthForge if delivered as a client-facing, explainable ranking.

## Regulatory / suitability considerations
- SEC/FINRA suitability: recommendation must be consistent with the client’s actual allocation; changing methodology without disclosure when allocation changes may raise suitability questions.
- Marketing Rule 206(4)-1: any performance or success-rate claim must be net of fees, with material assumptions disclosed.
- Best interest / Regulation Best Interest: if methodology recommendation changes the risk profile, document the rationale and client-specific factors.
- State insurance/annuity suitability: if ranking ties into annuitization or insurance-based strategies, state rules may impose additional disclosure requirements.
- Recordkeeping: capture grid version, methodology library version, CMA inputs, and advisor override reasons for exam readiness.

## Recommended next subtopics
- wps-02a-1b-1a: Grid granularity and path-count calibration
- wps-02a-1b-1b: Behavioral-fit crossover rules when allocation changes
- wps-02a-1b-1c: Client-facing allocation-recommendation explanation templates
- wps-02a-1b-1d: Cache invalidation rules for CMA/methodology updates

## upl-sla-event-bridge-and-redispatcher-2: Redispatcher Backstop and Escalation Matrix — UPL/SLA Event Bridge

- Researched: 2026-05-31
- Status: appended

Researched: 2026-05-31

## Executive Summary
When WealthForge events cross SLA boundaries or fail initial delivery, a deterministic redispatcher must safely replay, reroute, or escalate without duplication or data loss. The first verified implementation in this validation chain targets the **UPL/SLA event bridge** for nightly publication dependencies. Key controls: idempotent retry, bounded escalation, and clear audit ownership.

## Findings
- Problem: Scheduled outputs from nightly publication often depend on upstream state-rule or domicile results.
  A transient miss can create stale advisor-facing artifacts or missed regulatory windows.
- Competitor approach:
  - Modern orchestrators (Temporal, AWS Step Functions) offer built-in retries and dead-letter queues, but none couple SLA wording with wealth-management rule timelines.
  - FINRA-facing compliance stacks prioritize trail completeness over economic prioritization; WealthForge must own both.
- Build recommendation:
  1) Define an SLA contract per dependency: producer, consumer, timeout, retry, and max DLQ hops.
  2) Implement the **UPL Redispatcher** as a bounded-state machine to avoid duplicate publications or advisory spam.
  3) Add a segmentation layer that uses business-day calendars and state-specific hold windows for compliance constraints.
- Regulatory considerations:
  - SEC review focuses on communication completeness and supervisory review logs. Escalation signals must be both machine-readable and human-reviewable.
  - Retry policies have to preserve chronological evidence suitable for exam defense.

## Architecture Notes
- Event schema must record: previous attempt summary, escalation channel, next legal contact owner, and final disposition.
- Idempotency key = [task_id, causal_event_hash, attempt_count].

## Blocker / Validation
- None for this pass. Requires cross-reference with nightly-rollup-orchestrator-selection and timezone-and-business-day-calendar-rule before wiring actual code.

## nightly-rollup-orchestrator-selection: Nightly Rollup Orchestrator Selection

- Researched: 2026-05-31
- Status: appended

## Plain-English findings

For WealthForge's scheduled nightly aggregation and publication, the orchestrator must reliably run batch jobs, handle partial failures, support idempotent reruns, and produce audit-ready logs. In practice, teams choose between:
- Managed workflow platforms (Apache Airflow, Prefect, Dagster)
- Container-native schedulers (Kubernetes CronJob + workflow engine)
- Lightweight approaches (systemd timers, cron wrappers)

For high-compliance, multi-jurisdiction pipelines with SLA dependencies, a workflow orchestrator is strongly preferred over raw cron. Airflow and Prefect dominate financial services; Dagster is gaining traction for asset-oriented pipelines.

## What to build

A thin orchestration layer that:
1. Reads from a job manifest (rules, jurisdictions, safe-harbor windows)
2. Triggers aggregation, validation, and publication steps in order
3. Emits structured logs and metrics per jurisdiction
4. Supports manual rerun of failed jurisdictions without re-running successes
5. Exposes a health/run dashboard for compliance reviewers

## Competitors / patterns

- Apache Airflow: mature, strong scheduling and backfill, heavier ops footprint
- Prefect 2.x: Python-first, cloud/self-hosted options, easier retry/deferral patterns
- Dagster: asset-centric, good for lineage/observability, newer ecosystem
- K8s CronJob + Python entrypoint: minimal, flexible, but requires custom retry/alerting
- Temporal: strong on durability and retries, steeper learning curve

## Regulatory considerations

- Immutable audit log per run (who/what/when/outcome)
- Run isolation between jurisdictions to avoid cross-contamination
- PII/secret handling (credentials for adapters must not land in logs)
- Consistent scheduling time per jurisdiction to satisfy business-day rules and safe-harbor calc windows
- Retention of failed run artifacts for regulator inspection

## Recommendation

Prefer Prefect or Dagster for this WealthForge pipeline:
- Prefect if the team values deploy speed and Python-native retry patterns
- Dagster if the team prioritizes asset lineage, testability, and observability from day one
If ops overhead is the primary concern and the load is modest, a Kubernetes CronJob + small Python runner can work, provided retry/alerting is built separately.

## communication-reconciliation-log-schema-3c — Breach notification path analysis and PII exposure scanner

**Researched:** 2026-05-31

#!/bin/bash
set -euo pipefail
# Usage:
#   bash -lc 'research_section_custodian-calendar-overrides-4-4-reconciliation-communication-reconciliation-log-schema-3c' \
#     > /tmp/research-3c-content.txt
#
# This script emits the research body for the append script.
# No file writes here; stdout is intended to be piped into $(cat).

cat <<'EOF'
# Research: communication-reconciliation-log-schema-3c

## Executive summary

When a suspected data compromise touches the reconciliation logs that WealthForge generates around custodian calendar overrides, two things must happen fast: figure out **what was exposed** and **when each regulator must be notified**. This research lays out a practical way to build that capability inside WealthForge without introducing a full-blown SIEM or incident-response suite.

## Plain-English summary

Every time a custodian confirmation override is sent, received, reconciled, or suppressed, WealthForge should retain a tamper-evident breadcrumb trail. If that trail ever contains unexpected fields — or if someone queries it in a suspicious pattern — an in-product "radar" should go off and calculate:
- Which PII fields were in scope (client names, account numbers, SSN fragments, etc.)
- How many records were touched
- Which clock starts ticking under which regulator (SEC/FINRA: "as soon as possible"; many states: 30–72 hours; GDPR: 72 hours; NY DFS: 72 hours; Illinois BIPA: "reasonable" pace; MiFID II: firm-level and operational event reporting paths)
- Whether the override communication itself was already retried, suppressed, or quarantined — because those status changes affect the calculation of the notification baseline

Because these rules live across SEC, FINRA, MiFID II, New York DFS 23 NYCRR 500, Illinois BIPA, GDPR, and CCPA/CPRA, the scanner should not hard-code a single jurisdiction's clock. Instead, it should translate each log event into a jurisdiction-neutral incident envelope and then apply a per-jurisdiction timeline rubric that counsel can update when rules change.

## What to build

### 1. Field-level sensitivity classifier
- A curated list of fields known to contain PII in WealthForge outputs (beneficiary name, SSN/TIN fragments, account/registration numbers, contact details, etc.).
- Each field is mapped to one or more regulatory sensitivity categories: `direct-identifier`, `financial`, `contact`, `quasi-identifier`, `non-sensitive`.
- Extensible via a structured file so legal can add newly discovered fields without a code deploy.

### 2. Reconciliation-breach event detector
- Reads the existing reconciliation log schema (family 3a/3b) for surprise patterns:
  - Single-user or single-account override patterns that look like exfiltration.
  - Retries from an endpoint after a suppression because retried messages may have been delayed and inspected.
  - Post-WORM or post-retention writes that are unusual.
- Emits a `PotentialIncident` event with enough context to begin the timeline analysis.

### 3. Exposure scoping engine
- Determines:
  - `recordsAtRisk` count and identifiers
  - `fieldCategoriesAtRisk` set
  - `custodianInScope` and `messageStatus` (sent, retried, quarantined, canceled)
  - Whether the communication was end-to-end encrypted or not (affects some state regulators' breach definitions).
- Produces a JSON incident envelope that downstream stages can consume.

### 4. Regulatory timeline mapper
- Turns each incident envelope into jurisdiction-specific notification deadlines.
- Rules of thumb (from general regulatory guidance, to be confirmed by counsel):
  - SEC/FINRA: report "promptly" — often interpreted as "same business day" for custody-related incidents.
  - MiFID II: operational incident events have firm-level reporting timelines managed by compliance.
  - NY DFS: 72 hours from determination of a cybersecurity event under 23 NYCRR 500.17.
  - GDPR: 72 hours to supervisory authority where likely to result in risk to rights and freedoms.
  - Illinois BIPA: no fixed statutory clock for notification, but case law suggests "reasonable" time.
  - California CCPA/CPRA: "reasonable" timeframe; often coordinated with attorney general notification.
- The timeline is computed from the **first suspected compromise event timestamp**, not from when humans notice, if the scanner runs within normal custody feed refresh cadences.

### 5. Notification path router
- Maps detected fields and jurisdictions to the correct:
  - Counsel / compliance recipient list
  - Template generator (see Step 3 in downstream work)
  - Escalation ladder if deadlines are missed
- Considers message status: a suppression may mean no customer impact while an unsuppressed retry may change the analysis.

### 6. Retry/suppression-aware recalculation
- If a message was retried after suppression, the new transmission event overwrites the offended delivery event, but legal may want both records kept for the incident envelope.
- The translator rebuilds the timeline envelope whenever a status transition occurs.

## Competitors and market context

| Vendor | Positioning | Relevance to WealthForge 3c |
|---|---|---|
| Vanta / Drata | Continuous compliance and evidence management | Good breadcrumb trail, but not tailored to our reconciliation-log schema or the financial override use case. |
| OneTrust | Privacy management and breach notification workflows | Strong DPI/RPA; heavy onboarding cost and not aware of custodian override semantics. |
| Proofpoint / Mimecast | Email and communications archiving with DLP | Good PII detection patterns that can be reverse-engineered. |
| BigID | Enterprise data classification and PII discovery | Library of classifiers; useful templates for field-level sensitivity lists. |
| IBM Guardium / Imperva | Database activity monitoring | SIEM-class capability; overkill for an in-product breadcrumb scanner. |

**Conclusion:** Every competitor solves a broader problem. None understands the WealthForge remediation, retry, and WORM context inside the reconciliation log. The right play is to build a focused, schema-aware scanner and integrate with a standard incident-response template engine rather than replace one.

## Regulatory considerations

- Finance-specific breach statutes are still state-driven and get layered on top of SEC/FINRA obligations.
- NY DFS 23 NYCRR 500.17 directly requires cybersecurity event reporting; the definitions are broad enough to cover unauthorized access to regulated data.
- GDPR still applies when EU residents are affected; the 72-hour rule is strict and failures are publicly fined.
- MiFID II operational resilience rules require operational event reporting; a communications override compromise can qualify as a relevant operational event.
- Illinois BIPA creates liability for biometric and PII handling; settlement precedent supports prompt notification even before litigation.
- CCPA/CPRA: private right of action only for certain breach types, but regulatory enforcement (AG filing) is broader.

**Actionable takeaway:** Build the scanner so it can be turned on by jurisdiction in a configuration table per project/custodian. Legal should be able to flip "apply GDPR rules" or "apply NY DFS rules" by moving a toggle from false to true.

## Architecture sketch

```
Custodian-calendar-overrides reconciliation log
    --> communication-reconciliation-log-schema 3a/3b
    --> 3c detector
        --> cycle: scan PII-sensitive fields?
        --> if yes: build PotentialIncident envelope
            --> timeline mapper
                --> jurisdiction-specific deadlines + notification recipients
                    --> template generator (ESTA-2b-4d)
                        --> compliance/counsel review queue
        --> if no: metric increment, no escalation
```

- Detector runs as part of the reconciliation pipeline or as a lightweight async job after reconciliation finishes.
- Incidents are versioned in WORM storage (same as 3a) so the envelope becomes part of the regulator archive.
- Retry and suppression state changes always emit a `PotentialIncidentReevaluation` event so the timeline can be corrected.

## Recommended implementation phases

### Phase 1: Detection and exposure scoping
- PII field classifier data structure.
- First pass at automatic breach detection using field presence and status-change rules.
- Incident envelope format.

### Phase 2: Timeline and routing
- Jurisdiction timeline mapper with configurable rules.
- Notification path router using existing message context and recipient config.
- Escalation integration with daily reconciliation exception UI.

### Phase 3: Policy enforcement and governance
- Retry/suppression-aware recalculation fully implemented.
- Counsel review queue, signed-counsel linkage (ties to ESTA work).
- Audit trail for the scanner itself, satisfying FINRA Books and Records.

## Key artifacts and decisions

- Field sensitivity list should live in a versioned JSON file so it evolves with product.
- Incident envelopes should be retained in WORM storage even if no regulator notification is required; this preserves the ability to demonstrate due diligence.
- The mapper should be rule-based rather than machine-learned at first; rules are auditable and explainable to regulators.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| False positives trigger unnecessary notifications | Stage 1 should produce "review items," not automatic notifications, until confidence levels are tuned. |
| Jurisdictions change rules frequently | Keep mapper rules in a data-driven format; consider nightly validation jobs. |
| Performance impact on reconciliation | Run detection asynchronously on the WORMed log after it is sealed; do not block the live sequence. |
| Sensitive fields leaking in scanner logs | Treat scanner output as sensitive as original data; store under the same WORM/retention policy as 3a. |

## Open questions for legal/compliance and engineering

1. Should encrypted or hashed-only-override logs trigger the classifier, or are they outside the breach definition?
2. Does the selected retention schedule in 3a cover scanner audit logs in all target jurisdictions?
3. Does the existing foundation vault / key-management design protect the potentially-sensitive incident envelope the same way it protects raw messages?
4. For MiFID II operational event reporting, is the communications path outside normal business hours counted differently?
5. Should NY DFS 72-hour clock restart if new affected records are discovered post-initial-notification?
EOF
---

## communication-reconciliation-log-schema-3c:potential-incident-detector — Potential incident detector for communication reconciliation — cybersecurity and regulatory considerations

**Researched:** 2026-05-31

# Research: communication-reconciliation-log-schema-3c:potential-incident-detector

## Overview
Build a module that ingests communication reconciliation log events and detects potential security incidents automatically. It sits downstream of `communication-reconciliation-log-schema-3c:field-classifier` and applies real-time and batch patterns to flag anomalous access, exfiltration behavior, or policy breaches tied to communications records.

## What to build
- Incident pattern library: whitelist/blacklist rules plus anomaly detectors (e.g., bulk export after hours, unusual retry storms, repeated PII-scoped queries).
- Scoring/prioritization layer: tier incidents by severity using regulatory impact, data sensitivity, recurrence, and affected scope.
- Alerting integration: route incidents to counsel/compliance (`esta-2b-1a-3-5-sub-3-3`) and incident response runbooks.
- Retention + evidence binding: produce court-ready evidence packets tied to WORM archives.

## Competitors and analogs
- SIEM vendors (Splunk, Microsoft Sentinel, IBM QRadar) offer rule-based and ML anomaly detection; WealthForge should complement rather than replace these.
- TCR/archive vendors (Smarsh, Wall Street Systems) provide incident-ready export but limited integrated advisor communication context.
- Dedicated small-RIA cyber tools (Safeguard Cyber, Kaleidescape) focus on frameworks but not communication reconciliation logs.

## Regulatory considerations
- SEC Cybersecurity Guidance (2023/2024): requires policies to detect, respond to, and report incidents involving customer information.
- Reg SCI (Regulation Systems Compliance and Integrity): mandates reporting to the SEC for regulated entities when systems integrity is materially compromised.
- MiFID II / GDPR / NYDFS: impose breach notification windows; combining with communication logs improves forensic accuracy and timeline fidelity.
- State privacy laws (IL Biometric, CPA, etc.): dictate retry/suppression logic; retry-suppression-recalculator must keep detector outcome compatible.

## Success criteria
- Reduce dwell time for potential security incidents tied to communication failures from hours to minutes.
- Produce auditable evidence packets automatically for regulator inquiries.
- Coordinate seamlessly with retry/suppression and breach notification routing.
---

## communication-reconciliation-log-schema-3c:regulatory-timeline-mapper — Regulatory Timeline Mapper for Breach Notification Paths

**Researched:** 2026-05-31

# Regulatory Timeline Mapper for Breach Notification Paths

## What this is
A module that converts a detected PII breach event into the correct set of regulator-facing notifications and internal SLA countdowns across multiple jurisdictions (SEC, FINRA, MiFID II, NYDFS/23 NYCRR 500, and other state/federal regimes). It is the "clock rule engine" for the communication-reconciliation log: given an incident severity, exposure scope, and data classification, it decides when and to whom notification must be sent and what evidence pack must accompany it.

## What to build
- **Jurisdiction rule table**: a versioned configuration that maps incident attributes (state, data type, sector, estimated records) to notification deadlines, channel requirements, and content obligations.
- **Countdown engine**: computes remaining time in each active rule, handles business-day calendars, and emits near-miss and expired timers into the alert pipeline.
- **Evidence-pack generator**: assembles the supporting artifacts required by each regime (forensic summary, exposure description, remedial steps, contact points).
- **Notification dispatcher contract**: a typed interface that downstream channels (email, API portal upload, regulator web form) implement, so new regimes can be added without touching core rules.

## Competitors / analogues
- **OneTrust/BitSight**: broad privacy management platforms with breach notification workflows. Useful for pattern, but not tailored to wealth-management communication archives.
- **ReliaSoft/Guidelines (FINRA/SEC rulebooks)**: static guidance; no automated timer or routing integration.
- **Field-level privacy tools (BigID, ComplyAdvantage)**: strong on data classification and resident risk scoring; gap is the SLA-to-action pipeline for advisor/firm notification.
- **Niche regtech (Ascent, ClauseBase)**: good at rule ingestion but do not own the downstream communication-reconciliation runtime.

## Regulatory considerations
- **SEC / FINRA**: No explicit breach-notification rule in 17a-4, but Regulation S-P expects prompt notification to customers and regulators when unencrypted customer records are compromised. Timers should default to "reasonable promptness" unless a firm has an internal approved SLA.
- **NYDFS 23 NYCRR 500**: 72 hours for "material" cybersecurity events; mapper should support both 3-business-day and 72-hour interpretations and allow legal override.
- **MiFID II / GDPR**: Article 33/34 standards allow for 72 hours to supervisory authority with bait for delayed notification if personal data encrypted. Data residency and delegated-contract interpretation matter.
- **Retroactive override**: State legislatures occasionally shorten deadlines after an event starts; mapper should expose a "legal hold / override" path and emit a quarantine exception case.

## Implementation rules
- Treat every rule as immutable once active; overrides create a new versioned rule with `effective_from`.
- All event decisions must be signed by legalUserId for audit.
- Timers must be idempotent and replay-safe from the verdict event store.
- Dispatcher errors must not drop timers; retry suppression must consult the same rule version that fired.

## Takeaway
This mapper makes the archive actionable: it converts a passive thread record into a compliance task with a countdown and a forensics-ready evidence pack, unifying the many disparate breach timelines into one auditable state machine.
---

## communication-reconciliation-log-schema-3c:notification-path-router — notification-path-router

**Researched:** 2026-05-31

# notification-path-router Research
**Researched:** 2026-05-31

## Purpose
Once a reconciliation event is detected and potentially classified as an incident, WealthForge needs to route the notification to the correct people, in the correct format, with the correct context. This research covers output channels (email, SMS, in-app, webhook), recipients (CCO, compliance analyst, advisor, client), and the routing rules that govern who gets what.

## What to build
- **Output-channel adapter layer**: email, SMS, in-app notification, webhook, and optional voice call adaptable for RIA compliance workflows.
- **Recipient-resolution service**: maps event, severity, client, adviser, and jurisdiction context to required recipients from ACL-compliant routing tables.
- **Template store**: jurisdiction-aware message templates with placeholders for timeline deadlines, exposure data, and requested actions.
- **Retry/backoff transport**: honor suppression/recalculation rules from the sister `retry-suppression-recalculator` topic and provide transport-level resilience (DLQ, redrive).
- **Configuration UI**: routing table editor, test send, event simulator for compliance testing before regulatory exam season.
- **Audit trail**: immutable log proving who was notified, when, and with what content to satisfy SEC/FINRA discovery requirements.

## Competitor landscape
- **Apto/Smarketing** and **Smarsh** do communication surveillance but do not provide outbound breach notification routing — their products are ingestion-side.
- **OneTrust** and **Convercent** have privacy incident notification workflows, but their audience map is consumer-marketing rather than RIA-specific fiduciary/regulatory audiences.
- **PagerDuty/Opsgenie** provide on-call routing but lack fiduciary-aware event taxonomy and jurisdiction-calibrated templates.
- **Gap**: no platform combines compliance surveillance with breach-specific routing and SEC/FINRA-targeted templates for RIAs.

## Regulatory considerations
- **SEC 206(4)-7 compliance rule**: routing must deterministically notify the CCO and the compliance officer for covered regulatory events.
- **State privacy breach notification laws (50+ laws)**: routing rules must account for: (1) state of client residence, (2) exposure type (PII vs SPII), (3) number of affected records, and (4) required deadline (some impose 72-hour windows).
- **FINRA Rule 4511/17a-4**: notification proof must be immutable, searchable, and retained for 6 years.
- **Testimonial/endorsement waiver concerns**: outbound notification copy must not imply endorsement of third-party services or vendors.
- **Privacy and security**: recipient lists and message templates must be access-controlled; exposure data in transit should be encrypted.

## Recommended next subtopics
- communication-reconciliation-log-schema-3c:notification-path-router:channel-adapter-spec
- communication-reconciliation-log-schema-3c:notification-path-router:recipient-resolution-schema
- communication-reconciliation-log-schema-3c:notification-path-router:template-metadata-and-variables
- communication-reconciliation-log-schema-3c:notification-path-router:retry-and-dlq-transport
- communication-reconciliation-log-schema-3c:notification-path-router:audit-and-discovery-schema
---

## wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2c-2-b — PDF/A-2b vs PDF/A-3 long-term compatibility analysis for cloud WORM storage

**Researched:** 2026-05-31

# PDF/A-2b vs PDF/A-3 long-term compatibility analysis for cloud WORM storage

## Overview
PDF/A-2b allows embedded files; PDF/A-3 extends that to any file format. For audit exports driven by SEC/FINRA, long-term compatibility and examiner expectations matter more than format flexibility. Research focused on regulatory, cloud storage tier, and practice implications.

## What to build
1. **Format-selection policy engine:**
   Default to PDF/A-2b for audit exports; allow PDF/A-3 only when legal/compliance confirm acceptance and metadata capture is complete.

2. **Embedded-files audit tracker:**
   Record exact birth certificates, CSV exports, or receipts embedded so the derivative trail is reconstructible.

3. **WORM validation harness:**
   Test that PDF/A-2/3 objects remain byte-identical on S3 Glacier Deep Archive and Azure Archive; assert hash stability job after every retention cycle.

4. **Fallback converter pipeline:**
   PDF/A-3 from niche tools often embeds XML/CSV with non-compliant date fields; converter normalizes metadata before storage.

## Competitors
- **veraPDF/pdfaPilot** are validators, not cloud archival managers.
- **Zixi/ExaGlobe:** focus on non-WORM pipelines.
- **Axway:** strong in digital vault compliance but not audit-specific export validation for wealth management.
- **Amazon S3 Glacier / Azure Archive:** compliant for WORM but do not validate PDF/A conformance.

## Regulatory considerations
- FINRA Rule 4511 and SEC 17a-4 require immutable, retrievable records for 3–6 years.
- SEC/FINRA guidance accepts PDF/A as a preservation standard but does not explicitly bless PDF/A-3 for cross-compatibility.
- Some examiners prefer plainness that survives viewer migration: embedded non-PDF content risks being treated as opaque binary.
- If metadata inside embedded files matters (client SSNs, GUIDs), implement redaction before embedding rather than protected PDF layer.

## Key finding
PDF/A-2b has broader examiner familiarity and lower burden; PDF/A-3 is viable when metadata completeness and legal review confirm acceptance. Use PDF/A-2b as the default and add PDF/A-3 capability only with an explicit exception workflow and validation gate.

## Blockers
- No definitive regulatory statement favoring PDF/A-3 for wealth management audit exports.
- Some third-party archival tools misreport PDF/A conformance; validator selection matters.
---

## nightly-job-deferral-flow-1-1-4 — Mixed-criticality cancellation DAG algorithm

**Researched:** 2026-05-31

## nightly-job-deferral-flow-1-1-4: Mixed-criticality cancellation DAG algorithm
Researched 2026-05-31.

### What it is
In wealth-management nightly operations (reconciliation, CMA, tax, reporting), jobs often form a directed acyclic graph (DAG) of upstream/downstream dependencies. When a precondition fails or a custodian feed is stale, not all downstream work should be cancelled: some jobs are critical (e.g., regulatory filing deadlines) and others are non-critical (e.g., analytics refresh). A mixed-criticality cancellation DAG algorithm decides which tasks to cancel, which to continue with degraded data, which to retry, and how to surface the impact to users and compliance systems.

### Plain-English summary
Think of the nightly pipeline as a branching tree. A failure at one branch should not necessarily bring down the whole tree. The algorithm assigns each task a criticality tier (e.g., `critical`, `high`, `medium`, `low`). When cancellation is triggered, the system:
1. Walks the DAG from the failure point.
2. Honors "cancellation boundaries" — certain tasks are protected from cancellation because missing their output would break compliance.
3. Computes a blast radius: which reports, clients, or SLA timers are affected.
4. Emits events for audit trails and alerting so ops and counsel can intervene.

### Key implementation concerns
- **Deterministic traversal speed**: DAGs with thousands of nodes must still compute cancellation scope in milliseconds. Use incremental memoization (criticality max-per-subtree) rather than full recomputation.
- **Partial failure semantics**: Distinguish between "safe to skip" and "must retry." Encapsulate this in per-edge policies, not only per-node tags.
- **State cleanup**: Even cancelled tasks should write a "cancelled" marker event to the audit log; do not simply discard them silently.
- **Deadlines and SLAs**: Some cancellations must be reversible within a configurable grace period before an SLA clock expires. The algorithm should expose a reversible-cancellation window.

### Competitors and libraries
- **Apache Airflow**: Has `TriggerRule`, `depends_on_past`, and `skip` / `clear` semantics. Airflow 3 adds improved task hardening and `airflow tasks state` management. However, cancellation of sub-DAGs with mixed criticality currently requires custom `BranchPythonOperator` patterns and downstream state gating.
- **Dagster**: Supports ` AssetMaterialization` and `auto-materialize` policies with selective execution. Dagster 1.13+ emphasizes job dependencies and partitioning, but mixed-criticality cancellation is largely delegated to user-written `hook` / `op` wrappers rather than a system-wide algorithm.
- **Prefect**: Provides `state` objects and `Result` handling; `mapping` and `task_runner` allow partial completion, but no built-in multi-criticality cancellation DAG traversal.
- **Temporal**: Uses activity cancellation with `cancel_externally` and `heartbeat` deadlines. Cancellation propagates along workflow branches, but mixing protected and cancellable branches still requires explicit coding.
- **Dask Distributed**: Offers `cancel` on Futures with `cancellable=False` per task, which is conceptually close but lacks compliance audit hooks and SLA-aware blast-radius reporting.
- **Netflix Conductor / Cadence**: Both support workflow cancellation; Conductor 8+ adds `terminate` with retry policies. Enterprises often extend them with a governance layer.

For WealthForge, the gap is a **compliance-aware cancellation policy engine** combined with a **blast-radius reporter**, which none of the orchestrators provide out-of-the-box.

### Real-world usage patterns
- **Banking**: Mortgage pipeline orchestration cancels non-essential valuation tasks when credit-decision deadlines loom, while preserving AML and KYC branches.
- **Insurance claims**: Catastrophe modeling batches cancel non-priority peril models but keep statutory reserve calculations.
- **Asset management**: Reconciliation jobs defer FX reconciliation when prime-broker feeds are delayed, yet continue cash reconciliation for client reporting.

### Regulatory and compliance considerations
- **Auditable cancellation events**: FINRA Rule 4530 and SEC Rule 17a-4 require exchanges and broker-dealers to retain records of exceptions and corrective actions. Cancellation decisions must be immutable and signed.
- **WORM / immutability**: Retain cancellation DAG events in WORM storage with jurisdiction-specific retention schedules (SEC / FINRA / MiFID II / NY / IL).
- **Client impact disclosure**: If cancellation defers a time-bound client obligation (e.g., safe-harbor notifications), counsel must be alerted under privilege.
- **Data lineage**: Show which inputs were unavailable vs. which were cancelled, so downstream reports can flag downgraded confidence.
- **Operational resilience**: Regulators expect financial firms to understand blast radius. The cancellation algorithm should produce a human-readable impact statement suitable for incident reports.

### Recommended next steps
1. Prototype a tiered-cancellation DAG executor as a plugin for nightly jobs.
2. Add an `affected_scope` field to cancellation events: tasks, SLAs, reports, clients, jurisdictions.
3. Integrate with existing deferral precondition registry (`nightly-job-deferral-flow-1-1-*`).
4. Design reversible cancellation windows with configurable grace periods.
5. Submit to counsel for review of event schema against existing WORM and retention policies.
---

## nightly-job-deferral-flow-1-3 — Dependency DAG and Cancellation Semantics for Mixed Criticality Jobs

**Researched:** 2026-05-31

# Research: Dependency DAG and Cancellation Semantics for Mixed Criticality Jobs

**Researched:** 2026-06-07  
**Source:** WealthForge Deep Research Agent (cron run)  
**Related topics:** nightly-job-deferral-flow (parent), nightly-job-deferral-flow-1-1-4 (cancellation DAG algorithm), nightly-job-deferral-flow-1-3 (this entry)

## Context
Mixed-criticality nightly jobs (reconciliation, CMA, tax, reporting) run on shared compute and custody data. When a precondition fails or a deferral occurs, downstream jobs must be selectively cancelled while protected jobs continue. WealthForge needs a dependency-graph driven cancellation protocol.

## 2 findings
1. Industry-standard modeling approach: Directed Acyclic Graph (DAG) with job-level criticality tags. Modern job orchestrators (Temporal, Dagster, Airflow) already implement this concept in production. WealthForge does NOT need to invent the framework; priority is financial-deadline-aware blast-radius scoring and compliance-window-aware cancellation behavior.
- Source types: AWS Step Functions family docs on DAG semantics; Temporal.io docs on failure + cancellation cascade; Dagster docs on asset-level soft/hard dependencies; Netflix Conductor docs on task cancellation modes; O'Reilly 2022/2024 "Modern Data Stack" references on DAG failure modes.
2. The three most dangerous failure modes for wealth-management nightly jobs are: partial cancellation (e.g., tax runs cancel but reconciliation continues with stale corpus), deadline slips (reopening compliance windows), and audit-gap creation (cancellation events not idempotent or not retained). A job-cancellation design without jurisdiction-specific retention rules creates new compliance risk rather than reducing it.
- Evidence sources: FINRA and SEC general-purpose enforcement patterns on retention and reconstructability (Rule 17a-4 and successor guidance for systems records); NIST IR 8473 on digital chain-of-custody; AWS whitepaper on IT orchestration patterns; common failure-mode references in INFOQ reports on microservice cancellation; academic analysis of consistency vs. availability tradeoffs in Terry 2022 Distributed Systems notes (cancellation = partial availability event).

## What this means for WealthForge
- Build: a jurisdiction-aware cancellation policy layer on top of an existing DAG runtime (e.g., Temporal or Dagster), not a new DAG engine.
- Competitors/networks: Mixed-criticality cancellation exists only in general software pipelines; zero dedicated wealth-management/retirement-compliance implementations. (No known RIA/retail platform exposes cancellation semantics.) WealthForge owns this narrow.
- Regulatory: Retention of cancellation events must satisfy FINRA/SEC recordkeeping (WORM/lock-in for event log) and MiFID II record-keeping if EU retail flow expands. Post-deadline quarantines (esta-2b-1a-3-5-sub-3-2e) should be coupled to cancellation outcomes.

## Recommended next subtopics to research
- nightly-job-deferral-flow-1-3-1: blast-radius computation schema
- nightly-job-deferral-flow-1-3-2: protected-jobs policy model
- nightly-job-deferral-flow-1-3-3: reversible cancellation window and SLA grace period configuration
---

## wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2c-3 — Cross-platform hash chain verification tool for FINRA/SEC audit trail

**Researched:** 2026-05-31

**Researched:** 2026-05-31

## 1. What the Gap Is

- Topic identifier: `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2c-3`.
- No WealthForge competitor offers an external, independent audit trail integrity verifier.
- SEC/FINRA examiners now routinely ask for hash-chain evidence of immutability for communications, billing, and compliance documentation.
- Current market practice uses internal-only WORM storage with vendor-managed hashing; there is no independent cross-platform verification tool.

## 2. Status of Rules-RegTech Landscape

- FINRA Rule 4511 and SEC Exchange Act Rule 17a-4 require retention and immutability, but do not mandate a specific hashing standard.
- Regulatory expectation is shifting toward SHA-256 Merkle-style audit evidence, particularly after 2024-2025 exam deficiencies around document alteration risk.
- The SEC’s 2025 exam priorities and FINRA’s 2025 report both highlight technology-assisted review and documentation pedigree verification.

## 3. Product Shape

- Treat `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2c-3` as a standalone verifier, not just a subsystem.
- Input: export bundle containing record hashes, prior-hash links, timestamps, signer identity, and chain metadata.
- Output: pass/fail integrity report, broken-link map, timestamp anomaly list, and a printable examiner summary.
- Build as a CLI + library so advisors and CCOs can run spot checks.

## 4. Competitor Landscape

- On-premises audit archive vendors have closed-form APIs, but zero provide a standalone verifier.
- Blockchain ledger vendors offer chain verification, but not against WealthForge’s compliance event schema.
- Opportunity: first mover in a compact, regulation-focused verifier built for wealth management audit records.

## 5. Regulatory Considerations

- PII exposure risk: examiner exports must preserve redaction state.
- Retention and legal hold: verifier metadata should be itself retained for the same 3-6 year window.
- Cryptographic agility: design to allow SHA-256 today and migration path if NIST postquantum standards are required.

## 6. Next Actions as New Subtopics

- `hash-chain-schema-contracts` 🔴 HIGH
- `pii-preserving-verification` 🔴 HIGH
- `cryptographic-agility-spec` 🟠 MEDIUM
- `examiner-printable-report-template` 🟠 MEDIUM
- `wps-audit-test-corpus` 🟡 MEDIUM
---

## esta-2b-1a-3-5-sub-3-2a-2 — Primary/fallback provider integration architecture and data-contract standardization

**Researched:** 2026-05-31

# Research: Primary/Fallback Provider Integration Architecture and Data-Contract Standardization

## What This Is About
This topic addresses the technical design of integrating primary and fallback providers in WealthForge's data ingestion pipeline—likely related to calendar feeds, regulatory deadlines, or external event data streams. When one provider fails or returns bad data, the system needs to fail over cleanly to a backup without breaking downstream workflows.

## Findings

### 1. Problem Space
- **Single point of failure**: Relying on one external data provider creates outage risk.
- **Data contract drift**: Each provider uses different schemas, rate limits, auth methods, and event formats.
- **Reconciliation complexity**: After failover, matching events from provider A vs. provider B requires normalization.
- **SLA compliance**: Calendar/deadline data is time-critical; gaps in coverage cause downstream SLA breaches.

### 2. Industry Approaches
- **Circuit breaker + retry**: Primary provider gets N attempts; on failure, circuit opens and fallback activates.
- **Data contract standardization**: Adopt an internal canonical schema that all provider adapters translate into/out of.
- **Shadow mode testing**: Run fallback provider in shadow mode (parallel, non-serving) to validate data parity before cutover.
- **Consensus validation**: For high-importance events (legal deadlines), fetch from both providers and require agreement before acting.

### 3. Competitors & Precedents
- **Bloomberg, Refinitiv**: Multi-vendor data feeds with canonical internal models.
- **Stripe**: Multi-processor routing for payments (primary/fallback processors) with idempotency keys.
- **Government calendar APIs**: Multiple state legislature feeds often have inconsistent schemas; aggregators normalize to iCalendar/JSON Feed standards.

### 4. Recommended Architecture Patterns
- **Adapter pattern**: One adapter per provider; all normalize to a single `CalendarEvent` / `DeadlineEvent` canonical model.
- **Contract-first design**: Define the canonical schema in OpenAPI/JSON Schema first, then build adapters.
- **Heartbeat + freshness checks**: Detect provider degradation before total failure.
- **Automatic failover with sticky state**: After failover, keep fallback active until primary is healthy for X consecutive cycles.
- **Event deduplication**: When switching providers, deduplicate by `event_id` or `(source, date, title)` tuple.

### 5. Regulatory / Compliance Considerations
- **Auditability**: Log which provider supplied each deadline/event for liability and audit defense.
- **Data retention**: Retain raw provider payloads for at least 7 years (securities record-keeping analogy).
- **Accuracy liability**: If WealthForge uses provider data to drive client tax/deadline compliance, inaccurate feeds could create professional liability.
- **Change notification**: If a provider changes its API schema, WealthForge must detect this and update adapters before data quality degrades.

### 6. Implementation Recommendations
1. Define canonical `CalendarEvent` schema: `{ provider_event_id, event_type, jurisdiction, deadline_date, description, source_url, ingested_at, provider_name }`
2. Build provider adapter SDK with standardized interfaces: `fetch_events(start, end)`, `health_check()`, `get_schema_version()`.
3. Add daily reconciliation job comparing primary vs. fallback event counts; alert if divergence > threshold.
4. Store raw provider JSON in object storage for 90 days for anomaly investigation.
5. Document provider SLA tiers (e.g., Provider A = 99.9%, Provider B = 99.5%) and publish runbooks for manual failover.

### 7. Open Questions
- Which specific providers are primary/fallback for WealthForge's use case? (State legislature calendars? Court feeds? Tax authority deadlines?)
- Is there a compliance window requirement for detecting and switching providers?
- Should fallback be warm-standby (pre-synced) or cold-start on failover?
---
## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-canonicalization-rules:diff-layout-and-human-audit-format:human-audit-template: Human audit template for JSON manifest divergence review
Researched: 2026-06-01 04:41:34 UTC

# Human audit template for JSON manifest divergence review

## Context
- Cross-region WORM manifest dual-write ensures consistency across sovereign storage domains.
- This audit template transforms structured diffs into a reviewable artifact for finance and compliance officers.
- Supports regulatory evidence packs and regulator acceptance testing.

## What to build
- **Report schema**: define JSON Schema for audit report structure (header, summary, divergence table, signature map, remediation, approver block, retention footer).
- **Renderer**: Jinja2-based engine supporting HTML, Markdown, PDF, and CSV outputs.
- **Diff annotator**: JSON Patch / JCS diff paragraph generator with severity tags.
- **Annotations library**: jurisdiction-specific rule mappings to SEC/FINRA/MiFID/ILD/NY terminology and field emphasis.
- **Fixtures and CI**: sample manifests, divergences, and golden-file snapshot tests.

## Proposed report structure
1. Header (report ID, generation timestamp, regions compared, WORM retention tier)
2. Executive summary (total records, divergent counts, highest severity)
3. Divergence table (manifest path, change type, before/after, signature delta, regulator impact flags)
4. Signature chain map (key IDs, trust anchors, verification result per region)
5. Remediation recommendation (freeze / reconcile / escalate / defer)
6. Approver block (name, role, jurisdiction, attestation timestamp)
7. Retention footer (schedule, legal hold status, destruction instructions)

## Competitor landscape
- General diff tools (Git diff, jsondiff, diff-so-fancy) provide raw view but no regulatory context.
- No dedicated WORM-manifest divergence auditor found in open-source or commercial compliance tooling.

## Regulatory considerations
- **SEC 17a-4(b)**: audit trail must be capable of examination; template reduces interpretation errors.
- **FINRA 4511**: records retention and format requirements.
- **MiFID II Article 3(1)**: communication recording and accessibility; template highlights comms-impact records.
- **NYSE / Illinois / NYDFS**: jurisdiction-specific retention and accessorship flags for retained artifacts.

## Implementation guidance
- Use JSON Patch with JCS canonicalization for consistent diff presentation.
- Annotate each divergence with `regulator_tag`, `severity`, and `remediation_role`.
- Support template overrides by firm or legal entity for customized approver fields.

## Testing and release strategy
- Golden fixtures for known divergence patterns (no-op, schema change, signature mismatch, full cross-region rebuild).
- Render-against-schema snapshot tests in continuous integration.
- Manual QA with compliance officer review for readability and legal sufficiency.
## worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-canonicalization-rules:diff-layout-and-human-audit-format:human-audit-template:jurisdiction-terminology-and-annotation-library: Human-Audit-Format: Jurisdiction Terminology and Annotation Library
Researched: 2026-06-01 04:46:26 UTC

## Human-Audit-Format: Jurisdiction Terminology and Annotation Library

## What to build
Create a controlled, treaty-level taxonomy and annotation library that standardizes how compliance and audit evidence are labeled across jurisdictions for human-readable WORM replication evidence packs. The library should act as a shared metadata dictionary for terms, authorities, and ambiguity flags, referenced by renderers and reviewers.

### Core components
- Jurisdiction-specific term dictionary: canonical terms, synonyms, and deprecated aliases used in domicile, tax, and cross-border compliance contexts.
- Annotation tags: structured tags for evidence sensitivity, regulator-visible vs privileged content, translation status, and review status (e.g., `needs-counsel`, `overridden`, `pending-custodian`).
- Authority mapping: links between annotation terms and statutes, revenue rulings, and case citations.
- Cross-border equivalence table: maps same concept across jurisdictions (e.g., US `state`, EU `Member State`, offshore `competent authority`).
- Localization hooks: human-language preferences for report rendering while preserving canonical machine-readable IDs.

### Recommended data model (plain English)
- Term ID + regime (e.g., `US-FED`, `EU-DAC7`, `UK-FATCA`)
- Status: active / deprecated / superseded
- Sensitivity tier: `PUBLIC`, `INTERNAL`, `PRIVILEGED`, `PERSONAL`
- Source authority reference
- Synonyms and legacy term IDs
- Review workflow state tags

## Competitors / analogues
- Wolters Kluwer CCH Tagetik and Integrated Tax authority tables for jurisdiction-specific tax terminology and reporting metadata.
- Bloomberg Tax comprehensive regulatory reference data jurisdiction classifiers.
- ISO 20022 and FI authority dictionaries for terminology harmonization across market infrastructure.
- Legal Ontology initiatives: Cambridge - `LKIF`, `LKIF-Core`, and similar for semantic interoperability of legal terms.
- Custom internal implementations by financial institutions, often in combination with internal WORM and evidence manifests.

## Regulatory Considerations
- Domicile-safe-harbor expiration regimes term definitions must track effective, repealed, and sunset provisions.
- Duplicate or ambiguous terms must be versioned to avoid false-positive matches during regulatory review.
- EU AI Act, UK FCA, and SEC risk retention / segmentation rules require that annotations preserve `human-in-the-loop` signatures and privilege indicators.
- Cross-border custody and transfer laws may restrict how terms describing beneficial ownership can be rendered or transmitted.
- Evidence retention rules require immutable dictionary snapshots tied to report timestamps and SHA-256 hash.

## Implementation Guidance
- Store the library as a versioned JSON-LD document keyed by term ID, with at least one English baseline and optional translations.
- Build reference validation into the CI pipeline so reports fail if they contain deprecated or unmapped terms.
- Include term CRUD permissions and review SLAs in the annotation workflow engine.
- Support runtime term resolution fallback to previous schema version for historical report re-rendering.
- Tie annotation validation to the same WORM ledger used for evidence manifests.

## Risks / Sensitivities
- **No secrets or credentials should be stored in annotations.** Remove any embedded keys, passwords, or credentials before distribution.
- Maintain separation between privileged annotations and regulator-visible output using redaction pipeline hooks.
- Avoid hardcoding jurisdiction assumption tables that could become quickly outdated; schedule dictionary refreshes to coincide with statutory updates.
- Audit trails for annotation edits must themselves be WORM-locked for regulator review defensibility.
- Cross-region synchronization of terminology libraries must be designed to handle divergent regulatory updates (requirement for divergence threshold and alerting).

## Recommended next steps
1. Draft the term registry JSON schema and authority mapping model.
2. Select seed jurisdictions (e.g., US-Estate, EU-DAC7, UK-FATCA) and publish initial seed dictionary.
3. Instrument CI fixtures and snapshot tests to validate term coverage and authority linkage.
4. Integrate with the existing redaction pipeline and jurisdiction terminology annotations in the evidence manifest renderer.
5. Publish internal governance process for adding, reviewing, and retiring terms.

## Open questions / blockers
- Need to align on whether the dictionary should be embedded with the renderer or provided as a separate registry service.
- Determine whether privileged-domestic terms may be included in multi-jurisdiction reports or must be cabined by region.
- Decide precedence when two jurisdictions define the same term with conflicting meanings for the same evidence pack.
## pii-preserving-verification: pii-preserving-verification
Researched: 2026-06-01 04:56:45 UTC

-
## report-schema-and-diff-annotator:versioned-schema-migration-rules: Versioned schema migration rules for report_schema_version
Researched: 2026-06-01 05:01:40 UTC

## Plain-English Summary

This topic defines the rules for upgrading `report_schema_version` in WealthForge's human-audit report manifests, while keeping historical diffs readable and WORM attestation intact. The goal is a repeatable migration path that never rewrites sealed records.

## What to Build

1. **Version policy**
   - Define semver-like rules for `report_schema_version`: `MAJOR.MINOR.PATCH` bucketed into `COMPATIBLE` vs `BREAKING` moves.
   - Additive-only changes (new optional fields, new enum values) = `COMPATIBLE`.

2. **Migration manifest**
   - Every schema change emits a migration event with:
     - `from_version`, `to_version`
     - `compatibility` (`COMPATIBLE`/`BREAKING`)
     - `transformations` (field additions, defaults, renames, splits)
     - `requires_reannotation` (bool)
   - Migration manifests are themselves WORM sealed and included in the diff chain.

3. **Historical diff re-annotation protocol**
   - When rendering a historical diff, annotator reads the lineage of migrations applied between the two versions and re-annotates fields consistently with current taxonomy.
   - Protocol ensures that a `MODIFIED` diff under v1 remains semantically identical when viewed through v2.

4. **Deprecation/sunset policy**
   - Fields may be marked `deprecated_at` and `removal_version`.
   - During the sunset window, the schema returns deprecation warnings but still accepts old fields.
   - After removal, canonicalizer strips deprecated fields unless `preserve_legacy=true`.

5. **Migration CI gate**
   - CI pipeline fails if a migration is `BREAKING` without upgrade path tests:
     - backward-compat fixture tests
     - golden diff invariance tests
     - WORM chain validation tests

## Competitors / Prior Art

| Vendor / Approach | Relevance / Gap |
|---|---|
| **JCS RFC 8785 + JSON Patch versioning** | Provides canonical serialization, but no built-in schema migration manifest or attestation rules. |
| **Atlas / Hasura schema registry** | Supports Postgres/GraphQL migrations with "breaking" detection, but lacks WORM sealing and multi-region diff re-annotation. |
| **AWS Glue / Iceberg schema evolution** | Colossus-scale table schema evolution; not suited to legal evidence manifests. |
| **Kafka / Confluent Schema Registry** | Schema compatibility checks (`BACKWARD`/`FORWARD`/`FULL`) are a close conceptual match. |
| **GNU Global's libgit2 merge driver patterns** | Structured merge tooling; not specialized for sec/reg record diffing. |

## Regulatory Considerations

- **SEC Rule 17a-4(b)**: Records must be "not modifiable." Schema migrations must therefore be *append-only*; old manifest blobs cannot be altered.
- **FINRA Rule 4511**: Retention period requirements imply schema history must be queryable across years.
- **GDPR / data residency**: Migration metadata cannot contain PII moved across jurisdictions without same-lawful transfer checks.
- **PCI/SSAE considerations**: Attestation chain must include schema migration events to demonstrate continuous integrity.

## Implementation Notes

- Store schema versions in `manifest.report_schema_version`; store migration lineage in `manifest.migration_chain` (array of signed events).
- Additive schema fields should have non-breaking defaults; do not require consumers to upgrade before producers deploy.
- Protect WORM chain by hashing both the original manifest bytes AND the migration event bytes together when computing `content_hash` for a version upgrade.
- Keep migrations idempotent; replaying the same migration chain must produce identical manifest state.

## New Subtopics Suggested

- **report-schema-and-diff-annotator:versioned-schema-migration-rules:backward-compatibility-test-gate** (HIGH)
- **report-schema-and-diff-annotator:versioned-schema-migration-rules:migration-event-worm-seal-spec** (HIGH)
- **report-schema-and-diff-annotator:versioned-schema-migration-rules:historical-diff-reannotation-protocol** (HIGH)
- **report-schema-and-diff-annotator:versioned-schema-migration-rules:deprecation-and-sunset-policy** (MEDIUM)
## report-schema-and-diff-annotator:versioned-schema-migration-rules:backward-compatibility-test-gate: Backward Compatibility Test Gate for Versioned Schema Migration
Researched: 2026-06-01 05:06:33 UTC

# Backward Compatibility Test Gate for Versioned Schema Migration

## Summary
Design a CI test gate that evaluates every proposed report schema change against historical diffs and existing annotation rules, and blocks releases when a change would break backward compatibility, WORM readability, or regulator-facing audit rendering.

## What To Build
- Pull request-level schema diff detector: flag removed fields, renamed fields, type narrowing, and required-to-optional reversions.
- Regression corpus: versioned snapshots of representative diffs annotated under prior taxonomy classes.
- Gate thresholds: MAJOR breaking changes fail the build; MINOR/PATCH changes may pass with reviewer override.
- Fix-auto-suggestion engine: propose backward-compatible alternate representations (deprecation fields, widened JSON types, compatibility wrappers).

## Competitors / Existing Patterns
- Conventional SemVer tooling for schemas.
- Data contract linters.
- API diff tools.
- JSON Schema compatibility validators.

## Regulatory / Compliance Considerations
- Regulators may demand the *same* diff remain legible across schema generations; the gate should verify human-readable diff output does not regress.
- Signatures or hashes over previous artifacts must remain independently verifiable when schema evolves.
- WORM attestations should continue to validate across soft migrations; hard migrations need an explicit review/approval workflow.
- Keep an audit trail of gate outcomes tied to PR/build IDs.

## New Subtopics / Next Items
- backward-compat-gate:breaking-change-taxonomy
- backward-compat-gate:adapter-generation
- backward-compat-gate:jurisdiction-specific grace-period rules
## backward-compat-gate:adapter-generation: Adapter generation for backward compatibility gates
Researched: 2026-06-01 05:10:58 UTC

- Purpose
  - Generate compatibility adapters so older schema versions and contract consumers can continue operating after a schema migration.
- What to build
  - Adapter generator that emits thin transformation layers between historical schema versions and current canonical schema.
  - Version-aware routing in the diff annotator/report pipeline with adapter discovery and selection rules.
  - Tests proving migrated historical artifacts remain readable and attestation-signable after adapter translation.
- Competitors / analogous approaches
  - GraphQL federation gateway adapters.
  - Avro/Protobuf schema evolution tooling with generated compatibility shims.
  - Database view/alias layers used to shield consumers from schema changes.
- Regulatory considerations
  - Adapters must preserve provenance and original values so regulated attestation packages remain auditable.
  - Adapter behavior should be captured in schema migration documentation for regulator inspection.
  - Deployment of adapters may require change-control documentation under financial services regulatory policies.
## backward-compat-gate:jurisdiction-specific-grace-period-rules: backward-compat-gate:jurisdiction-specific grace-period rules
Researched: 2026-06-01 05:16:29 UTC

# Research: backward-compat-gate:jurisdiction-specific grace-period rules
Date: 2026-06-11
Status: DRAFT

## Topic Definition
Define jurisdiction-specific grace periods for schema version migrations so that new report schema versions do not instantly invalidate in-flight or historical attestation flows. Grace periods bridge backward-compatibility windows for regulator submissions, internal retained evidence, and WORM attestations.

## Plain-English Summary
When WealthForge introduces a new report schema version, customers and regulators often need time to consume updated outputs before old format support is withdrawn. This research identifies regulatory and vendor grace-period patterns, defines a model for deferring deprecation based on jurisdiction, and maps how those windows interact with signature/WORM chains.

## Key Regulatory Findings
- SEC EDGAR modernization: incremental version rolling with no fixed 24-48h global cutoff; actual adoption curves show multi-month overlap (public statements and product docs).
- ESMA ESEF: iXBRL taxonomy updates are annual with a transition group; national competent authorities may set additional national layer effective dates.
- FCA SDR / STR mix: regime changes typically include explicit transition and dual-running windows for reporting entities.

## What to Build
1. Jurisdiction grace-period registry (`grace_periods/{jurisdiction}/{schema_family}/{old_ver}->{new_ver}` with `effective_date`, `dual_run_until`, `deprecation_cutoff`).
2. Migration coach: unit-test-time validation that uses jurisdiction-specific calendar and grace windows.
3. WORM evidence extension: seal requires `approved_gp_until` and validator rejects aggregated packets after cutoff only if `jurisdiction` does not extend grace.

## Competitors / Reference Models
- APT-ONE/Swift PACM: migration notices include explicit dual-running dates.
- Workiva ESG: vendor portal publishes schema deprecation calendar with regional staggered end-of-support.

## Regulatory Considerations
- Some jurisdictions treat hung reporting as “no filing” — withholding old schema during regulator grace may create non-compliance risk.
- WORM policies conflict with rapid deletion of old formats; requirements may require archived historical schema versions for audit windows.

## Open Questions / Blockers
- Need final legal review of regulator-required dual-write periods per jurisdiction.
- WORM key-rotation must align with schema archive duration.
## jurisdiction-gp-worm-evidence-binding: Jurisdiction Grace-Period Registry: WORM Evidence Binding
Researched: 2026-06-01 05:20:56 UTC


## jurisdiction-gp-worm-evidence-binding: Jurisdiction Grace-Period Registry: WORM Evidence Binding
Researched: 2026-06-01 05:21:18 UTC

# Jurisdiction Grace-Period Registry: WORM Evidence Binding
_Appended: 2026-05-31_

## 1. Strategy & Context (Why this matters)
This research sits inside WealthForge’s **ESTA (Estate & State Tax Architecture) / jurisdiction-registry** effort. Jurisdictions periodically change domicile rules, exit-tax formulas, or filing deadlines. To remain compliant across laws, WealthForge supports **grace periods** — windows where older schema versions or older jurisdiction rules remain valid for **open cases** while new law applies to **new filings**.

A schema version `deprecation_cutoff` or `dual_run_until` is meaningless unless it can be **attested to regulators**: *“On date X, the CCO approved that schema Y would remain active until Z for state N.”*

This makes it a **WORM (Write-Once-Read-Many) evidence binding problem**, not just a schema field problem.

## 2. What WealthForge Should Build
1. **Governance governance artifact:** Every grace-period decision triggers a WORM-sealed artifact:
   - `approved_gp_until` date.
   - `jurisdiction_code`, `schema_family`, `schema_version`.
   - `approved_by` (CCO / jurisdiction-domain counsel).
   - `approval_rationale_md` (plain-English + citation).
   - `artifact_hash` (SHA-256).

2. **WORM adapter contract:** A cross-region WORM write path that accepts **grace-period evidence manifests** as a distinct record type, with its own hash chain and index keyed by `(jurisdiction, schema_family, valid_until)`.

3. **Validator enforcement:** Any runtime validator that processes a jurisdiction rule must:
   - Accept the candidate schema.
   - Reject it if:
     - No governing manifest entry exists, **OR**
     - The current date is past `approved_gp_until` (unless an override token is presented).
   - Emit a structured event: `grace_period.manifest.matched` or `grace_period.manifest.missing`.

4. **Seal and annotation:** The human-audit renderer must surface:
   - Current manifest for every active rule.
   - Approval date + approver + rationale.
   - Countdown to `approved_gp_until` end-of-life.
   - Option to re-issue a new manifest if the jurisdiction extends the window.

5. **Dual-evidence registry:** A materialized view joining **schedule-driven grace-period calendar** (static rule changes) with **evidence-driven certificates** (manual CCO approval).

## 3. Competitor / Comparable Landscape
| Provider | Approach | Gaps for WealthForge |
|---|---|---|
| **AWS QLDB** | WORM ledger for general ledger data | No built-in schema-version deprecation logic; no jurisdiction semantic layer |
| **Cloudflare R2 Object Lock** | WORM object lock + legal hold | Lock is bucket-level; no record-level `approved_gp_until` semantics |
| **IronCore Cloaked Search / VGS** | Data-control planes | Focus on encryption/access, not deprecation lifecycle |
| **DuckDB + Object Lock** | Analytics WORM | No runtime validator hook |
| **Insurtech platforms (Guidewire, Applied Systems)** | Policy versioning + audit | Narrow vertical; no financial-planning jurisdiction registry |
| **CFPB / state regulator reporting portals** | Submit-and-lock | Manual; no real-time enforcement; no grace-period state machine |

**Zero wealth-management platforms expose schema versioning with jurisdiction-bound grace-period manifests and automated validator enforcement tied to WORM records.**

## 4. Regulatory / Compliance Considerations
- **FINRA Rule 3110 / SEC Regulation Best Interest:** Compliance artifacts must be retrievable upon examination. A WORM-sealed grace-period approval satisfies this better than a signed PDF email.
- **State-specific retention rules:** E.g., NY DFS 500 may require records supporting cybersecurity/risk decisions be retained for 5+ years. WORM binding aligns with those mandates.
- **GDPR Art. 5 / Art. 17:** Right-to-erasure conflicts with WORM. Must isolate **PII-containing audit evidence** from **non-PII schema-versions** or maintain a jurisdiction-allowed-traffic-light model.
- **Cross-border evidence admissibility:** For WealthForge advisors/cal clients across U.S. states plus offshore trusts, WORM seals must use standards regulators recognize (NIST + ISO 27001 audit evidence).
- **Audit reproducibility:** WORM attestation of *“schema X was valid for state Y until Z”* must be machine-verifiable without a custom WealthForge runtime.

## 5. Honor WORM without breaking regulators’ habits
Regulators prefer:
1. **Signed PDF export** (human-readable).
2. **Hash-chain integrity** (assurance no record was altered).
3. **Human-readable approver + rationale**, not just hashes.

Design principle: **WORM seal is append-only metadata, not obfuscation.** Include:
- `provenance.statement_md` field.
- `artifact.sha256`.
- `witness.signing_key_id`.
- Cross-reference: jurisdiction citation URL + statutory section.

## 6. What to Build (Prioritized)
### High
1. `approved_gp_until-enforcement-policy`
   - Runtime contract: validator rejects or flags out-of-window schema version.
   - Override escape hatch (Emergency CCO override).
2. `worm-seal-format-spec`
   - Canonical JSON for grace-period evidence manifests.
   - Deterministic hash rules.

3. `grace-period-evidence-registry`
   - Immutable index by jurisdiction schema version + valid-until window.
   - Daily reconciliation job ensuring registry entries match calendar events.

### Medium
4. `jurisdiction-gp-human-audit-template`
   - Renderer sidecar showing current grace-period manifest + expiry countdown.

5. `reference-implementation` (pseudocode + library)
   - Reusable Python module `wealthforge.worm.grace_period`.

## 7. New Subtopics Discovered from Research
- `approved_gp_until-enforcement-policy`
- `worm-seal-format-spec`
- `grace-period-evidence-registry-and-retention-policy`

## 8. Blockers / Risks
- **Performance:** Real-time validator check against an unbounded registry could add latency; keep manifest cache in front of WORM read path.
- **Regulatory novelty:** No precedent for presenting code-level grace-period manifest as audit evidence; expect regulators to still ask for the human-readable PDF (renderer builds this).
- **Over-reliance on custody:** Key rotation for WORM seals must align with audit-evidence retention timing.
## jurisdiction-gp-worm-evidence-binding:worm-seal-format-spec: WORM seal format spec research
Researched: 2026-06-01 05:26:21 UTC

# Research: worm-seal-format-spec

## Topic overview
- Topic ID: jurisdiction-gp-worm-evidence-binding:worm-seal-format-spec
- Context: WORM evidence binding for schema version deprecation.
- Goal: Define a standard seal format for WORM-bound evidence artifacts so downstream validators can prove immutability and derive a trust anchor from metadata alone.

## What the research says
- WORM guarantees depend on storage-level immutability (cloud object lock, hardware write protection).
- A deterministic seal record must contain: schema version, region, timestamp, hash of evidence payload, key identifier for custody, and policy effective date.
- Canonical serialization and stable sorting are required for reproducible hashes across regions.
- Competitor/operator patterns differ by vertical:
  - Finance: SEC 17a-4 and CFTC recordkeeping use immutable object storage plus checksum manifests.
  - Public sector: NIST-based hashing and signature envelopes.
  - Health: immutability plus expiration/retention extensions via policy tags.
- Regulatory angles:
  - Evidence must survive auditor re-derivation: separation of sealed witness from schema metadata.
  - Cross-jurisdiction sync needs schema version + regulation code + grace period fields in the seal.
  - Key custody and signature algorithm stability are audit items.

## What to build
1. `worm-seal-header.json` spec (canonical JSON): `schema_version`, `jurisdiction`, `envelope_id`, `payload_hash`, `key_ref`, `effective_date`, `sealed_ts`.
2. `sealed-manifest.sha256` sidecar with hex hash.
3. Migration event seal spec + old/new hash + approved GP until.
4. Protobuf/JSON performance benchmark for high-throughput regions.
5. Regional divergence alert comparing canonical hashes.

## Competitors and analogs
- Cloud archive object lock APIs (vendor-specific, not standardized).
- Git tree/commit seal metadata (not WORM but canonical serialization lessons).
- PDF timestamp + signature blocks (Adobe, ETSI).
- Blockchain anchoring approaches (not actively referenced in WealthForge roadmap).

## Regulatory considerations
- Key algorithm stability: document algorithms and rotation policy for audit.
- Geographic key residency: some jurisdictions require keys to remain local.
- 17a-4 successor records: replacement files need linked witness.
- Escrow and third-party custody: m-of-n ceremony recommended for long-term verification.
- Verifier access: auditors need sample manifests and validation CLI.
## grace-period-evidence-retention-vs-worm-evidence-binding: Grace-period evidence retention vs WORM evidence binding
Researched: 2026-06-01 05:31:28 UTC

## Research: grace-period-evidence-retention-vs-worm-evidence-binding
- Date: 2026-05-31
- Source: AGENDA.md

### Summary
Compare two retention mandates for deprecating evidence:
1) Grace-period retention (regulator-allowed window keeping old format valid)
2) WORM evidence binding (immutable log after deprecation attestation)

### Key findings
- Retention should not end at deprecation cutover; regulators often require post-cutover retention periods.
- WORM binding should apply at the moment of deprecation attestation, not after the grace period starts, or dual-run evidence may become unverifiable.
- Retain dual-run evidence under both formats until the latest of:
  - grace-period end + regulatory evidence retention
  - WORM reconciliation completion for each jurisdiction.
- Record the transition event in a registry with fields:
  `regulation_id`, `schema_version`, `dual_run_until`, `approved_gp_until`, `worm_attestation_ts`, `retention_deadline`.

### Competitor / industry references
- FINRA Rule 4511 and SEC Rule 17a-4: WORM storage required for broker-dealer records; retention 6 years with 2-year first 2 years in immediate access.
- MiFID II / FCA record-keeping: 5 years; some firms separately archive serialized snapshots rather than mutate live records.
- GDPR data retention: minimization suggests retaining only necessary fields; annotate why grace-period artifacts still exist.

### Regulatory considerations
- Ensure grace-period retention is documented in an explicit policy with jurisdiction variances.
- Tie WORM seal creation to regulator-notifiable schema versions to defend audit proofs.
- Add reconciliation job to verify WORM seals for grace-period artifacts on cadence.

### What to build
- `retention-decision-registry` mapping each schema family and jurisdiction to retention deadlines.
- `reconciliation-validator` confirming WORM-bound evidence remains accessible and intact during grace periods.
- Audit API endpoint returning current retention status and evidence-binding provenance for a given deprecation ID.

### Open questions / blockers
- Confirm regulator stance on whether WORM-bound deprecated evidence can be deleted at `approved_gp_until` or later.
- Define MDM for fields whose values differ across the older/newer schema families before fully decommissioning old maps.
## worm-seal-format-spec:canonical-serialization-and-hash-binding: Canonical Serialization and Hash Binding for WORM Seals
Researched: 2026-06-01 05:36:21 UTC

# Canonical Serialization and Hash Binding for WORM Seals

## What this is
Canonical serialization means converting structured data into a single, deterministic byte representation so that two systems can independently reproduce the exact same bytes from the same logical data. Hash binding then computes a cryptographic digest over those bytes and embeds or publishes the digest as an immutable reference point: if anything changes, the hash will differ.

## What to build
- **Schema-first canonical form**: Choose a base format (JSON, CBOR, or Protobuf) and define ordering, whitespace, date formatting, number precision, and key ordering rules so the output is reproducible regardless of implementation language.  
- **Deterministic encoder**: Implement a serializer in each supported language (Python, TS/JS, Rust) that respects the canonical rules.  
- **Hash binding layer**: On seal creation, compute SHA-256 or SHA3-256 over the canonical bytes and store the digest in the `worm_seal` header. On verification, recompute the digest and compare before trusting the payload.  
- **Format version marker**: Embed `serialization_format_version` and `hash_algorithm` fields to allow future upgrades without invalidating historical records.  
- **Hash-chain linkage**: Include `prev_manifest_hash` or `prev_evidence_hash` so compliant artefacts form an immutable chain.  

## Reference standards and competitors
- **JCS (RFC 8785)** is the most practical ready-made JSON canonicalization spec; it handles key ordering, number encoding, and date formatting. Adoptable with minimal custom code.  
- **JSON Canonicalization Scheme (JCS)** libraries exist for major languages and are already used in digital-signature workflows.  
- **Canonical XML C14N** and **JSON Web Signature (JWS/JWT)** provide proven deterministic serialization patterns, but are heavier than needed for WealthForge’s manifest payloads.  
- **Protobuf "well-known types"** offer deterministic binary serialization with lower payload size, but binary diffs are less auditable by humans than canonical JSON.  
- **Code signing / SBOM ecosystems** (e.g., in-toto, SLSA) already solve similar hash-binding and provenance problems and can guide artifact envelope design.  

## Regulatory considerations
- **FinCEN / SEC / FINRA WORM expectations**: regulators expect that advisers and broker-dealers cannot rewrite historical records. Deterministic hashing gives external examiners an independent way to verify that retrieved files are identical to originally sealed evidence.  
- **Evidence admissibility**: courts and arbitrators are more likely to accept timestamped digital evidence when its hash can be independently recomputed from published canonicalization rules.  
- **Algorithm renewal policy**: SHA-256 remains broadly accepted today, but state regulators may eventually require NIST-post-quantum transition. Include algorithm agility fields now and document a rotation playbook.  
- **Cross-border enforcement**: if multi-jurisdiction evidence packs must be sealed under different local e-signature frameworks, canonical serialization minimizes format divergence and keeps the same hash binding valid across territories.  
- **Data minimization / privacy**: canonical forms must avoid embedding raw PII unless required; any EMetadata inclusion needs explicit consent review because canonical bytes become deterministically repeatable and linkable.  

## Open questions / next subtopics to explore
- Do we need JSON digit-set minimization rules beyond JCS (e.g., no trailing exponent `e+00` vs `e0`)?  
- Should the sealed header be a detached sidecar or an inline envelope?  
- What is the maximum manifest size for which SHA-256 binding remains efficient on object storage?  
- How do migration events reference both old and new manifest hashes in one seal?  
- What key custody model and algorithm rotation cadence should govern signing keys, especially for cross-region replication?  

## Recommended starting point
Start with JCS for JSON payloads plus an extension slot for a future format version. Implement SHA-256 now, design the manifest header with explicit `hash_algorithm` and `prev_evidence_hash` fields, and validate the entire flow against the existing `worm-seal-format-spec` parent.
## worm-seal-format-spec:key-custody-and-algorithm-stability-memo: Key Custody and Algorithm Stability Memo
Researched: 2026-06-01 05:41:25 UTC

## Worm Seal Format Spec: Key Custody and Algorithm Stability Memo

**Plain-English purpose**
We need a concise policy record for how WORM audit seals keep their cryptographic keys and signing algorithm choices stable over long retention periods. This memo is meant for auditors, regulators, and internal engineering so it is clear how keys are generated, where they live, who can touch them, why we avoid algorithm changes inside an active WORM chain, and what we do when a rotation is unavoidable.

## What to build
1. Envelope encryption model and key lifecycle
   - Treat every seal payload as encrypted under a per-chain data encryption key (DEK).
   - The DEK stays inside the WORM chain; a separate key encryption key (KEK) is used to wrap the DEK for distribution.
   - KEK uses non-extractable key material on an HSM-backed key management service.
   - Lifecycle rules: generate on chain creation, rotate on forced migration or suspected compromise, archive old wrapped DEKs under WORM for the retention period, publish rotation hashes to internal audit log.

2. Signature algorithm stability and rotation policy
   - Lock algorithm family for a chain on creation (RSA-4096 / P-256 / Ed25519 / post-quantum algorithm palette).
   - Treat algorithmID as part of canonical sealed-header bytes; changing it without migration breaks historical audit verification.
   - Saturday Rule: do not silently upgrade algorithm mid-chain. When an algorithm is sunset or weakened, prefer dual-signing windows or backward-compatible sealed-headers with explicit legacy markers.
   - Define algorithm health matrix (security margin, NIST status, hardware HS_{NP,K, signature performance, quantum readiness).

3. Key material segregation and access governance
   - Create three layers: operational signing keys (live), archive verification keys (read-only), and recovery/break-glass keys (quorum + justifications).
   - Require M-of-N approval to activate break-glass roles; log all approvals into WORM-attested audit trail.
   - Provision keys by jurisdiction/region; allow region-specific algorithms where regulator acceptance differs; do not allow cross-region decryption without explicit permit.

4. Regulatory evidence-pack key-binding
   - Each exported evidence pack binds keys via: sealed-header `key_id`, `algorithm_id`, `wrapped_dekid`, `chain_timestamp`, `manifest_hash`.
   - For regulator review, include a "key provenance appendix" that lists key creation time, custody service, and HSM attestation references, without exposing the raw key material.
   - Keep plaintext private keys never emitted from KMS; if a regulator requests raw keys, redirect to custodian-generated sign-on-demand instead.
   - For multi-region chains, bind evidence packs with per-region key envelopes plus a cross-region reconciliation signature.

## Competitors / existing practice
- No current wealth-platform or audit evidence product exposes a public-facing WORM seal specification with explicit key-custody or algorithm-stability policies.
- Closest analogues are ad-hoc legal-hold and eDiscovery storage providers, but they usually treat keys as proprietary black boxes, not as auditable guarantees.

## Regulatory cautions
- FINRA and SEC expect retained records to be tamper-evident and retrievable; WORM + key custody strengthens defensibility if the auditor asks how the firm proves integrity.
- A weak key lifecycle is a bigger compliance risk than a strong one: lost or shared keys undermine any later challenge.
- Some regulators may ask for plaintext key access; WealthForge should train staff to redirect to signing attestations or custodian cooperation rather than raw-key disclosure.
- Post-quantum algorithms will be relevant before the end of typical multi-generation trust/retention windows; keep migration policy future-proof now.

## Implementation lookahead
- Phase 1: document the policy and align engineering/quasi-KMS design.
- Phase 2: envelope-encryption integration with current WORM adapter and region key partitions.
- Phase 3: evidence-pack key-binding feature + regulator-facing key-provenance appendix template.
- Phase 4: global algorithm health monitoring, forced-rotation runbook.
## worm-seal-format-spec:migration-event-seal-spec: WORM Migration Event Seal Spec
Researched: 2026-06-01 05:46:13 UTC

# WORM Migration Event Seal Spec

## What it is
A migration event seal is a write-once-read-many (WORM) bound record that cryptographically locks a schema, protocol, or data contract transition point. It covers: canonical event payload, immutable seal header, binding hash chain, and cross-region attestation metadata. This spec closes the gap between "schema changed" and "change is provably sealed and auditable".

## What to build
- **Migration event envelope** – fixed schema with fields: `eventId`, `prevSealHash`, `newCanonicalHash`, `timestamp`, `region`, `actor`, `rationale`, `jurisdictionTags`, `attestationRefs`.
- **Seal binding rule** – compute `migrationSealHash = SHA3-256( canonicalize(prevSealHash || newCanonicalHash || timestamp || region || jurisdictionTags) )`.
- **Chain check** – each new seal must verify against the latest stored seal in the WORM store.
- **Dual-run binding** – during a grace period, bind old and new canonical forms together so diff tools can see "before/after" atomically.
- **Cross-region propagation** – seal is signed, then broadcast to mandated regions; each region writes its own `regionSealReceipt` referencing the same `eventId`.
- **Alert trigger** – if `newCanonicalHash` does not match the expected next hash from the rollout plan, raise a regional-divergence alert.

## Competitors / Artifacts
- **OpenTelemetry Collector migration events** – useful model for immutable transition envelopes.
- **GitHub CODEOWNERS/merge queue semantic** – seal approval-before-merge pattern.
- **CFTC/SEC audit-trail patterns** – regulatory expectation of signed, ordered, tamper-evident change records in derivatives reporting contexts.
- **IPFS/Filecoin sealed block models** – content-addressed event headers and hash-linked block structures.

## Plain-English findings
1. A migration event should be a first-class object, not a comment in a README or a Slack message.
2. Atomic dual-run is the key requirement: seal must connect old and new canons so regulators can see "same truth, version boundary."
3. Replay/premature-seal risk: guard against multiple migration events for the same version slot using monotonic counters or contract-level mutex.
4. Regional receipts prove the seal was accepted everywhere; divergence alerts detect out-of-sync adoption before it becomes non-compliance.
5. The seal format should be jurisdiction-agnostic payload + jurisdiction-specific annotation library.

## Regulatory considerations
- **Time-ordering** is evidence; clocks must be synchronized (NTP with leap-smear) and timestamp fields must use ISO 8601 with UTC offset.
- **Retention** – keep seal, receipts, and divergence alerts for the same duration as the underlying evidence manifest.
- **Identity** – `actor` should map to a regulated role (e.g., `systemAdmin`, `jurisdictionRegistrar`) rather than a personal username.
- **Auditor access** – design the seal so a regulator can verify it end-to-end without extracting private keys; include `verificationNonce` and public verification method refs.

## Implementation priority
- Implement migration-event seal spec first, then build regional-divergence hashing/alert spec on top of it.

## 2026-06-01 — worm-adapter-multi-region-replication:failover-runbook-and-attestation: WORM multi-region: failover runbook and attestation

## What to build
A runbook and attestation flow that defines how a WealthForge WORM store fails over between regions while preserving regulatory-grade immutability. Key outputs: ordered failover steps, evidence manifest, signed attestation document, and rerun checklists.

## Plain-English findings
- Regulators and audit frameworks usually want a repeatable failover process that proves no data was modified during handoff.
- The runbook should cover: pre-failover validation, read-only freeze window, replicated evidence pack verification, region handoff, post-failover consistency checks, and operator sign-off.
- Attestation should be signed by two independent operators or an HSM-backed signer, with timestamps and tamper-evident chain references.
- Cross-region replication lag must be measured and bounded; if divergence exceeds threshold, failover should be paused and investigated.

## Competitors / patterns
- AWS: S3 Block Public Access + Versioning + S3 Object Lock references; failover guidance is in AWS Storage docs but not a single attestation runbook.
- Azure: Immutable Blob Storage with time-based retention; Regional failover via GRS with access-tracking but custom attestation logic is user-built.
- Cloudflare R2: Object Lock with multi-region replication; missing formalized regulatory attestation artefact out of the box.
- Custom enterprise: financial services and LTSSP/LSE firms often publish internal runbooks; WealthForge can differentiate with regulator-specific manifest schema and automated attestation generation.

## Regulatory considerations
- SEC Rule 17a-4 and CFTC 1.31 require records to be immutable for defined periods; failover documentation is a key part of regulator examinations.
- FINRA and FCA expect operational resilience documentation. An attestation that names every operator, timestamp, and verification step supports answering examiners.
- GDPR / data-sovereignty: any region switch must preserve jurisdiction tagging and audit metadata, and produce a cross-border access log.
- CPMA / Canadian regulations: expect non-destructive transfer logs and tamper evidence.

## Suggested next steps
1) Draft `failover-runbook.md` and `failover-attestation-schema.json`.
2) Add replication divergence threshold tests and incident scenarios.
3) Include regulator-formatted operator hand-off checklist and sig-chain.

---
## What to build
A policy and alerting specification that defines when replication divergence is too high, how to compute the divergence threshold, and which alert channels are triggered.

## Plain-English findings
- Divergence is the difference between source-of-truth evidence manifests across two regions; typically expressed as manifest checksum delta or missing manifest IDs.
- A useful model: compute divergence score per time window, compare to rolling SLA, alert when score > threshold for N consecutive windows.
- Thresholds should be tiered: P1 (halt + page on-call), P2 (warn + create incident), P3 (record + trend).

## Competitors / patterns
- Aurora Global Database: divergence measured by replication lag; alerting via RDS events.
- CockroachDB: MVCC consistent multi-region; divergence detection via follower read staleness.
- Custom BaaS: many vendors only expose lag seconds, not manifest-level evidence divergence.

## Regulatory considerations
- Regulators care that divergence is tracked as part of evidence integrity. Alert logs are audit artifacts in SEC/FINRA exams.
- If alerting fails, exhibit a documented, monitored alert pipeline and retry budget to show due diligence.

## Suggested next steps
1) Define divergence scoring model and schema.
2) Build alert policy with SLO tier table and on-call routing.
3) Add evidence manifest diff service and renderer for regulators.

---

## 2026-06-01 — esta-2b-1a-3-5-sub-3-2a-3-2: Event canonicalization and timezone normalization contract: Event canonicalization and timezone normalization contract

Research summary

This entry focuses on how to canonicalize cross-jurisdiction calendar events and normalize timezones for the WealthForge reconciliation workflow that ingests external calendar feeds.

1. Problem
- Calendar feeds use many datetime representations: floating local times, offsets, zoned datetimes, historic DST transitions, and obsolete tzids.
- Reconciliation needs deterministic equality, hashing, and versioning, otherwise the same event can appear to change on each feed refresh.
- Jurisdictions keep changing tz database entries; historic offsets for tax events can differ by years, creating latent false positives in anomaly detection.

2. Canonicalization contract (recommended)
- Canonical schema: RFC 3339 with mandatory UTC offset. Do not use floating times; always store local_time + offset, then convert to UTC for comparison and hashing.
- Event ID = SHA-256 of canonical bytes formed from sorted keys and utc-trimmed components. Include feed source, event type, authority ref, occurrence start, end, and jurisdiction.
- Acceptable input shapes: ISO 8601 date-only (treat as start-of-day local), date-time with named zone (resolve via tz database), times with implicit zone (resolve using feed metadata).
- Reject ambiguous shapes without explicit zone/offset before entering the canonicalization pipeline.

3. Timezone normalization and tzdata audit
- Use a pinned tzdata version (ICU or CLDR provides vendor-neutral references); record the exact tzdata version in every manifest lifecycle.
- For each jurisdiction feed, precompute offsets for all event datetimes from the feed's effective tzdata. If the tz library returns Ambiguous or Skipped, apply a jurisdiction rule: prefer earlier instance for civil events, later instance for procedural deadlines unless statute says otherwise.
- Maintain a dimension table of jurisdictions with tzid, dst_rules_version, political_transition_probability, and override_reason_code.
- Retain historical tz snapshots for past events; never recompute a prior-year event using current tzdata if the original feed's effective offset differs. Store both original offset and normalized-now offset with a tzdata_version tag.

4. What to build
- Canonicalizer service with idempotent transform and stable serialization order.
- Manifest schema extension with canonical_datetime_utc, source_datetime_raw, tzid, offset_seconds, and tzdata_version.
- tzdata audit job that diffs ICU/CLDR versions weekly and flags jurisdiction DST or zone-boundary changes older than 90 days.
- Reconciliation diff model that compares canonical IDs and key-value equality rather than raw strings.

5. Competitors and analogs
- Calendly and Cronofy normalize feeds into UTC and expose free-busy endpoints, but do not publish deterministic canonical forms or preserve jurisdiction-specific historical offsets.
- Google Calendar and Outlook event APIs handle zone resolution for users, but they are optimized for UI display, not auditable financial/compliance reconciliation.
- Tax/court calendar vendors often publish PDF or iCal without deterministic identifiers; none expose signed manifest schemas with tzdata versioning.

6. Regulatory considerations
- Preserve raw and normalized representations to satisfy evidentiary audit trails and reconstruction requirements.
- Document tzdata version in signed manifests to avoid disputes about whether a deadline was interpreted with the correct rule set.
- For cross-border matters, respect each jurisdiction's official gazette publication timezone; if a statute requires receipt before midnight local, preserve local semantics in addition to UTC.
- Legal-hold rules should treat source_datetime_raw and tzdata versions as immutable evidence fields.

---

## 2026-06-01 — diff-schema-and-rowspec: Reconciliation diff model and state machine: diff schema and row spec

# Diff Schema and RowSpec

## What this is
This subtopic defines the structure and serialization format for reconciliation differences — the rows/records produced by the daily calendar feed reconciliation workflow. It is the contract between the diffing engine, audit renderer, anomaly detector, and downstream alert routers.

## What to build
- A canonical diff schema for a single reconciliation record, including: item key, baseline/current values, change type, timestamp, rule version, matter ID, and compensation class.
- A row spec that controls which fields are emitted, padded, or masked based on context and privilege class.
- Deterministic ordering rules so that identical diffs serialize identically across regions (important for WORM adapters and content-address storage).
- Version field for the diff schema itself, plus breaking-change handling (additive-only growth, deprecation warnings for removed fields).
- A JSON and Protocol Buffers binding, with a cross-language equivalence test harness.

## Competitors / analogs
- IBM OpenPages / RSA Archer diff record formats (financial services governance risk).
- SQL Server Change Data Capture (CDC) row diff model (source/target/value).
- OpenTelemetry resource diff conventions (attribute concatenation and semver schema).
- Apache Kafka compacted topics with schema registry (Avro schema evolution is the closest analog for backward/forward-compatible growth).

## Regulatory considerations
- Immutability: Because diffs feed legal-hold WORM storage, they must be append-only and tamper-evident. Dropped/repadded rows alter the audit trail and must be disallowed in production builds.
- Privilege masking: RowSpec must enforce attorney-client protection at the field level when rendering client-facing or shared-counsel channels.
- Retention tagging: Each diff should inherit retention metadata from its parent matter/jurisdiction so cross-jurisdiction retention tables can purge expired records safely.
- Evidence integrity: Schema versions and canonical key orders should be covered by the regulator-acceptance test cases already in scope.
- Recommendation: Keep diff schema additive-only for at least 18 months after first regulatory submission in each jurisdiction to ease audit defense.

---

## 2026-06-01 — esta-2b-1a-3-5-sub-3-2a-3: Daily reconciliation and anomaly-detection workflow for calendar feed ingestion

## RESEARCH
- **Chosen from AGENDA.md first unchecked item:** `esta-2b-1a-3-5-sub-3-2a-3: Daily reconciliation and anomaly-detection workflow for calendar feed ingestion`
- **Pending subtopics identified:** `idempotency-and-deduplication-rules`, `baseline-window-calculation-and-holdoff-policy`, `anomaly-severity-taxonomy-and-routing`, `evidence-pack-and-retention-policy`

## Key findings / what to build
- Build a dependency map before touching the reconciliation logic, because the real blockers are upstream: who already collects the calendar feeds, who can approve rule changes, and whether the alert/review workflow exists elsewhere.
- Use a single reuse signal score: if a source already owns the feeder, has authority-level permissions for the same entities, and already routes alerts through counsel/compliance workflows, it should be the primary integration target instead of duplicating ingestion.
- Treat the four `[⏳]` children as implementation-layer details only after the ownership/authority/workflow graph is confirmed—otherwise the schema may model the wrong privilege boundary or the wrong baseline window.

## Competitors / analogs
- Calendar/form calendar integrations in tax and legal tech are usually splintered: one team owns data collection, another owns reconciliation, and a third owns compliance routing. WealthForge’s advantage is being able to own all three in one evidence-linked system.
- Closest analog work: the already-researched `esta-2b-1a-3-5-sub-3-2a-3-3` reconciliation diff model provides the diff schema and state machine; the new research is about what authority and workflow dependencies that diff flow requires.

## Regulatory / operational considerations
- Ownership ambiguity is a compliance risk, not just an engineering risk. If ingested calendars can be changed by a feeder that lacks proper data-owner authority, later alert routing may surface “false” anomalies that are actually unauthorized source edits.
- Baseline window policy must be tied to jurisdiction-specific filing deadlines and safe-harbor clocks already modeled elsewhere in AGENDA; otherwise the holdoff policy may create evidence that conflicts with counsel escalation timelines.
- Evidence-pack retention rules interact with the jurisdiction retention table and litigation-hold workflows already in scope under sibling topics; do not finalize retention schema until that interaction is mapped.

## Architecture / product implications
- Add a lightweight “calendar feed ownership manifest” to the reconciliation pipeline: source system, data owner, allowed privilege class, update cadence, and complaint/rectification path.
- Design `idempotency-and-deduplication-rules` around natural keys from that manifest rather than ad-hoc event IDs, otherwise rename/key rotation on the feeder side will break dedup.
- Design `baseline-window-calculation-and-holdoff-policy` to consume jurisdiction deadline data from the same rule registry used by safe-harbor expiration rollup, ensuring a single source of truth for calendar arithmetic.
- Keep `anomaly-severity-taxonomy-and-routing` minimal until the counsel/compliance escalation protocol and channel capability registry are finalized downstream.

## Blockers / open questions
- Blocking: has a prior owner for calendar feed data been assigned, or is this feed still a shared/unowned integration?
- Blocking: do feeder authority levels already map to the client privilege tiers used elsewhere in WealthForge?
- Blocking: will exception handling reuse the existing `esta-2b-1a-3-5-sub-3-2e` quarantine state machine, or does it need a separate case type?

---

## 2026-06-01 — cryptographic-agility-spec: cryptographic-agility-spec

# Cryptographic Agility Spec

## Summary
This note is scoped specifically to WealthForge's audit-export and hash-chain verification workflow, not to the full platform identity layer. It captures why algorithm agility matters here, the minimum viable spec, the phased migration path, and a short map to related WealthForge research.

## Why It Matters
Regulatory audit exports and examiner-facing hash-chain verifiers are long-lived services. Attackers or industry deprecation can force algorithm changes on years-old records. Regulators expect verifiability, not reissuance. Without agility, a future SHA-256 collision scare or SHA-3 mandate would require invalidating prior exports, wallet-key rotation ceremonies, or examiner retraining.

## Key Drivers
1. **Regulatory longevity:** FINRA/SEC audit records commonly require 3–6 year retention, and some longitudinal studies require more. A spec that only supports SHA-256 today locks WealthForge into one answer for that horizon.
2. **Risk posture:** Hash chain integrity is only as strong as the hash plus the secret-key wrapping model. Agility lets us upgrade hashes and signatures independently.
3. **Examiner trust:** Independent verification tools delivered to examiners must identify the algorithm used, not just assert it.
4. **Competitive position:** No wealth management platform has an examiner-grade, multi-algorithm hash-chain verifier. WealthForge can differentiate on transparency + forward compatibility.

## Scope and Non-Goals
**In scope:**
- Hash chain record schema with explicit algorithm identifier
- Algorithm registry with canonical names, OIDs, and parameter sets
- Backward compatibility during algorithm transitions
- Examiner-facing rerun tool that verifies historic chains under the algorithm that was active at creation time
- Operational procedures for introducing a new algorithm without breaking old exports

**Out of scope:**
- End-to-end identity key agility for advisor login (covered elsewhere)
- Transport-layer TLS agility
- Change of hash on existing records (allowed as a planning exercise, but not in normal operations)

## Minimum Viable Specification
### 1. Algorithm Identifier
Include `alg_id` on every chain manifest and node:
```json
{
  "version": 1,
  "alg_id": "sha256",
  "params": {},
  "nodes": [...]
}
```
Use a stable registry entry rather than free text. Canonical short names: `sha256`, `sha3-256`, `blake2s-256`, `blake3-256`.

### 2. Algorithm Registry
Store registry in a versioned, reviewable table with:
- canonical name
- OID or standardized identifier
- parameter requirements
- minimum supported key length
- deprecation status (draft / active / deprecated)
- effective date for new exports
- sunset date for acceptance in verifier
- review owner team

The registry itself must be immutable once published: corrections create a new registry version, not modifications to an old one.

### 3. Transition Protocol
- A newly introduced algorithm must run in **parallel** for at least two release cycles before the prior algorithm is deprecated.
- Deprecated algorithms MAY still verify old exports, but the verifier must emit a warning that the algorithm is deprecated and should prompt the examiner to request a current-format re-export for long-term use.
- There is no in-place migration of historic records. New exports use the new algorithm.

### 4. Examiner Verifier Behavior
The standalone tool shipped to examiners returns:
- algorithm used
- verification result
- any deprecation warnings
- output format with explicit algorithm fields

This matches `examiner-printable-report-template` and feeds `wps-audit-test-corpus`.

### 5. Documentation and Training
For each algorithm added, publish:
- plain-English one-paragraph rationale
- comparison table: speed, hardware acceleration, collision status
- examiner guidance: what changes, what stays the same, what red flags to watch

## Build vs. Competitor Notes
WealthForge competitors either ignore hash-chain verifiability or provide opaque assertions. Zero competitors offer an examiner-level tool with algorithm transparency across multiple hashes. The spec is therefore uncontested domestically. Crypto agility in payments/banking standards is common; in wealth management audit exports, it is novel.

## Regulatory Notes
No federal wealth-management regulation mandates a specific hash algorithm, but SEC/FINRA examiners are increasingly aware of cryptographic degradation risk. A well-documented algorithm-rotation plan is defensive. NIST guidance on cryptographic agility (SP 800-57 and SP 800-175B) supports keyed and unkeyed hash lifecycle management.

## Blockers and Questions
1. Who owns the algorithm registry review? Crypto team? CTO? Engineering?
2. Do examiners accept tool updates automatically, or do we need a board-approved policy before changing the shipped verifier version?
3. What is the minimum examined export corpus size where changing hash algorithm becomes cost-bearing rather than cost-saving?
4. What is the interaction with `pii-preserving-verification`: should redaction happen before or after hashing?

## Related WealthForge Research
- `wps-02a-1a-2a-1a-a-1-1-1e-1.1-c-2c-3` Cross-platform hash chain verification tool
- `pii-preserving-verification`
- `examiner-printable-report-template`
- `wps-audit-test-corpus`
- `redaction-strategy-enum`

---

## 2026-06-01 — esta-2b-1a-3-5-sub-3-2b: Countdown engine SLA table schema and recomputation plan

## esta-2b-1a-3-5-sub-3-2b: Countdown engine SLA table schema and recomputation plan\n- [[2026-06-01]] Initial review for WealthForge countdown/SLA design.\n\n### What to build (plain-English summary)\nThis topic is about making the "countdown engine" explicit: what deadlines exist, how they are measured, who/what is served, and how the deadline changes if an exception or retry occurs. Build a canonical SLA table for WealthForge workflows and a recomputation plan so the countdown value stays lawful and operational.\n\nSuggested components:\n- SLA Table schema: per-workflow rule with workflow ID, deadline definition, clock source, pause/resume/extension rules, jurisdiction exceptions, escalation thresholds, retention/audit requirements.\n- Recomputation triggers: retry attempt, jurisdiction change, privilege class change, court order/regulatory extension, system halt/resume, calendar rule change.\n- State model: deadline states like pending/active/paused/quarantined/expired/excepted/satisfied.\n- Operations: clock authority, legal-timezone policy, audit event emission, countdown precision requirements.\n\n### Competitors / ecosystem examples\n- RegTech / compliance staleness trackers (Roberts, OCE): mostly episodic; few show live recomputation on exceptions.\n- Legal matter management: countdowns exist but rarely expose a versioned recomputation policy.\n- WealthForge differentiator: regulator-facing immutable countdown provenance (recomputation rationale, actor, authority, timestamp).\n\n### Regulatory / compliance considerations\n- Deadline accuracy is a compliance liability in DOL/SEC exam contexts.\n- Cross-jurisdiction rules frequently differ: federal vs state holidays, court-specific extensions, emergency orders.\n- If countdown drives automated client notices, maintain enough audit trail to defend timing if challenged.\n\n### Recommended starting shape\n- Use a workflow-scoped SLA table with stable topic IDs and deterministic recomputation source ordering.\n- Capture writable exception fields as signed audit events.\n- Publish a countdown contract that defines capture precision, latency tolerance, and display rounding policy.

---

## 2026-06-01 — baseline_window_schema: Baseline Window Schema

# Baseline Window Schema

## Overview
Designed a schema for defining and managing baseline windows used in peer group reconstitution, anomaly detection, and holdoff policy enforcement within WealthForge's state-rule and domicile modules.

## What to Build
Core table `baseline_windows` with:
- window_id
- peer_group_id
- window_start / window_end
- baseline_version
- effective_date
- status (ACTIVE / SUPERSEDED / HOLD / QUARANTINED)
- severity_class (HIGH / MEDIUM / LOW)
- holdoff_until
- created_by
- created_at
- superseded_by
- retention_until

Supporting views:
- active_window_for_peer_group
- overlapping_window_detector
- retention_policy_evaluator
- seasonal_calendar_integration

## Competitors
No competitor tracks baseline windows with holdoff and versioning tied to anomaly severity. Existing platforms treat baselines as opaque configuration without auditability or quarantine semantics.

## Regulatory Considerations
- State-specific safe-harbor holdoff must be enforceable.
- Suspected baseline compromise requires quarantine with immutable audit trail.
- Versioning and retention must meet state examination and legal-review requirements.

## New Subtopics
- baseline_window_retention_policy
- cross_severity_holdoff_triggers
- anomaly-severity-taxonomy-and-routing

---

## 2026-06-01 — public_holiday_ingestion_pipeline: public_holiday_ingestion_pipeline



---

## 2026-06-01 — public_holiday_ingestion_pipeline: public_holiday_ingestion_pipeline

## public_holiday_ingestion_pipeline

### What to build
Automated ingestion pipeline for public holiday calendars used in deadline/compliance counting (safe-harbor periods, filing deadlines, training days). Should normalize across jurisdictions, support yearly updates, and feed the reconciliation/countdown engine.

### Competitors / landscape
- No wealth-management platform exposes a jurisdiction-level public-holiday feed with signed provenance.
- Calendar providers (Google, Microsoft) cover countries but not jurisdiction-specific court holidays or state-specific fiscal calendars.
- Legal tech vendors track court holidays in narrow jurisdictions; none offer multi-state, multi-country, signed manifest updates suitable for compliance evidence.

### Regulatory / operational considerations
- Calendar errors can shift safe-harbor and deadline calculations; must be treated as compliance-critical data.
- Needs signed update manifest with tsz/3161 timestamping and WORM retention to satisfy audit requirements.
- Must handle fiscal-year boundaries, daylight-saving transitions, and emergency holiday declarations.

### Implementation notes
- Maintain canonical holiday tables per jurisdiction with effective-date ranges.
- Ingest via authoritative APIs where available; fallback to web scraping with adversarial checksums and review workflow.
- Emit immutable holiday-manifest events for downstream countdown engines.



---

## 2026-06-01 — fiscal_year_definition_table: fiscal_year_definition_table

## fiscal_year_definition_table research

## Topic
- ID: fiscal_year_definition_table
- Severity: HIGH
- Source queue: AGENDA.md line 854

## What to build
- A canonical fiscal year definition table is a reference dataset that maps each jurisdiction to its standard government fiscal year start and end dates, plus any widely used alternatives.
- For WealthForge, this table should support:
  - normalized fiscal year begin/end dates per jurisdiction
  - fiscal year numbering conventions (e.g., FY2026 meaning calendar 2026 vs. year ending in 2026)
  - special rules for tax/fiscal calendars that differ from general government fiscal year
  - change flags and manifest references so updates can be audited

## Competitors / reference sources
- OECD and IMF publish fiscal calendar reference data for macro projections.
- Avalara, Vertex, and Thomson Reuters ONESOURCE maintain tax-year/fiscal-year mapping tables for tax automation.
- Open source libraries such as python-fiscalyear or fiscal-year packages encode fixed rules, but usually not jurisdiction-specific full calendars.
- Government statistical agencies publish fiscal year tables for budget data.

## Regulatory / compliance considerations
- Reporting deadlines for government fiscal data sources often use definitions that differ from tax years.
- In regulated financial contexts, relying on an outdated fiscal year definition can misstate reporting periods.
- Source attribution and update governance matter for evidentiary reliability.

## Recommended next subtopics
- fiscal_year_definition_table: jurisdiction row schema
- fiscal_year_definition_table: edition and versioning rules
- fiscal_year_definition_table: source attestation and manifest requirements

---

## 2026-06-01 — fiscal_year_definition_table:edition-and-versioning-rules: Fiscal Year Definition Table: Edition and Versioning Rules

## Topic: fiscal_year_definition_table:edition-and-versioning-rules

### Executive Summary
Editioning and versioning rules determine how fiscal year definitions change over time without breaking historical compliance calculations. For WealthForge, this is a controls surface: bad versioning can silently corrupt prior-year tax, dividend, and deadline logic.

### What to Build
- **Edition model**: Distinguish data editions from jurisdiction releases. Treat each fiscal year rule set as an immutable edition, with a signed manifest.
- **Semantic versioning policy**: Use a coarse policy such as `jurisdiction:major.edition` plus `content:patch.minor`, not only CalVer, because incompatible row-schema changes can break downstream recomputation.
- **Activation rules**: Rules should not activate retroactively unless explicitly flagged for backfill. Default stance is new editions apply forward-only.
- **Recomputation linkage**: Each edition should be tagged with the compatible recomputation engine/baseline rules to prevent bias drift when historical calendars shift.
- **Deprecation and lineage**: Preserve superseded editions in read-only form for evidence-pack and audit requirements.

### Plain-English Findings
- Multiple jurisdictions update fiscal year calendars irregularly (e.g., US federal vs. Japan corporate vs. Australia).
- Commercial tax suites solve this with “data packs” that are versioned separately from the engine.
- A fiscal year edition must not be edited in place after any calendar date has passed; otherwise audit reproducibility breaks.

### Competitors / Patterns
- **Avalara AvaTax**: Uses rate table editions with jurisdiction-specific activation dates and compatibility metadata.
- **Thomson Reuters ONESOURCE**: Fiscal year definitions are tied to tax-year “magic dates” with explicit rule versions.
- **SAP Tax Service**: Calendar tables are versioned and frozen once a reporting period closes.

### Regulatory Considerations
- Historical accuracy is a compliance requirement, so versions must be retained with tamper-evident manifests.
- If a rule update requires retroactive correction, it should be in a new edition with a documented amendment reason.
- Regulators may request the rule edition in effect on a specific event date; linking transaction records to fiscal year edition IDs is best practice.

### Recommended Subtopics to Surface
- edition-schema-version-and-compat-policy
- activation-and-backfill-criteria
- fiscal-year-edition-to-transaction-binding

---

## 2026-06-01 — fiscal_year_definition_table:edition-and-versioning-rules: Fiscal Year Definition Table: Edition and Versioning Rules

## Topic: fiscal_year_definition_table:edition-and-versioning-rules

### Executive Summary
Editioning and versioning rules determine how fiscal year definitions change over time without breaking historical compliance calculations. For WealthForge, this is a controls surface: bad versioning can silently corrupt prior-year tax, dividend, and deadline logic.

### What to Build
- **Edition model**: Distinguish data editions from jurisdiction releases. Treat each fiscal year rule set as an immutable edition, with a signed manifest.
- **Semantic versioning policy**: Use a coarse policy such as `jurisdiction:major.edition` plus `content:patch.minor`, not only CalVer, because incompatible row-schema changes can break downstream recomputation.
- **Activation rules**: Rules should not activate retroactively unless explicitly flagged for backfill. Default stance is new editions apply forward-only.
- **Recomputation linkage**: Each edition should be tagged with the compatible recomputation engine/baseline rules to prevent bias drift when historical calendars shift.
- **Deprecation and lineage**: Preserve superseded editions in read-only form for evidence-pack and audit requirements.

### Plain-English Findings
- Multiple jurisdictions update fiscal year calendars irregularly (e.g., US federal vs. Japan corporate vs. Australia).
- Commercial tax suites solve this with “data packs” that are versioned separately from the engine.
- A fiscal year edition must not be edited in place after any calendar date has passed; otherwise audit reproducibility breaks.

### Competitors / Patterns
- **Avalara AvaTax**: Uses rate table editions with jurisdiction-specific activation dates and compatibility metadata.
- **Thomson Reuters ONESOURCE**: Fiscal year definitions are tied to tax-year “magic dates” with explicit rule versions.
- **SAP Tax Service**: Calendar tables are versioned and frozen once a reporting period closes.

### Regulatory Considerations
- Historical accuracy is a compliance requirement, so versions must be retained with tamper-evident manifests.
- If a rule update requires retroactive correction, it should be in a new edition with a documented amendment reason.
- Regulators may request the rule edition in effect on a specific event date; linking transaction records to fiscal year edition IDs is best practice.

### Recommended Subtopics to Surface
- edition-schema-version-and-compat-policy
- activation-and-backfill-criteria
- fiscal-year-edition-to-transaction-binding

---

## 2026-06-01 — daylight_saving_time_transition_table: Daylight saving time transition table

## daylight_saving_time_transition_table: What to build, competitors, and regulatory considerations

### What it is
A governed lookup table that captures every daylight saving time transition by jurisdiction and year. In WealthForge, date/time arithmetic is not optional — countdown engines, baseline windows, reconciliation pipelines, and anomaly detection all depend on knowing whether a local hour is duplicated, skipped, or unchanged. The daylight_saving_time_transition_table exists to eliminate temporal ambiguity for regulators and internal calculations alike.

### What to build
- **Schema**: Key by (jurisdiction_code, year). Fields should include:
  - dst_start_utc, dst_start_local
  - dst_end_utc, dst_end_local
  - offset_before, offset_after
  - spring_forward boolean + clock_repeat_hours
  - tzdata_version (pinned IANA release, e.g. tzdata2024b)
  - citation_url (national gazette or government decree)
  - effective_years range
  - supersedes (hash of previous entry) and manifest_hash for chaining
- **Update cadence**: Sync with IANA tzdata releases and relevant national gazettes at least annually; ad-hoc processes for emergency rule changes such as legislative amendments to DST dates.
- **Integration touchpoints**:
  - Event canonicalization pipeline: resolve skipped/repeated local timestamps before diffing.
  - Countdown/baseline engines: calendar-aware hour counting.
  - Evidence-pack and WORM seal: include tzdata version + DST context so a regulator can recompute the deadline.
  - Historical replay: snapshot prior table versions to maintain back-cast integrity.

### Competitors and market gap
- **FIS, SS&C Advent, and broad ERP tools** rely on OS-level timezone libraries. They do not expose a signed, auditable DST transition manifest.
- **Court e-filing systems** often use a single server timezone or strict UTC, which causes practitioner confusion around DST boundaries.
- **WealthForge differentiator**: No current WM platform publishes a cryptographically signed, governed DST table with historical retention and manifest chaining. This reduces litigation and audit risk for clients.

### Regulatory considerations
- **Record integrity**: SEC, FCA, and similar regimes require unambiguous records. A timestamp in a repeated or missing hour must resolve to a single canonical UTC moment; the DST table provides the proof.
- **Litigation defense**: If a client claims a deadline was met during an ambiguous hour, the signed DST table, paired with manifest-chaining evidence, settles whether 11:30 PM was the first or second occurrence on fall-back night.
- **Cross-border**: APAC has no DST; EU, US, certain South American and Oceanic nations do. A unified table prevents cross-jurisdiction contamination.
- **Version integrity**: tzdata is patched multiple times yearly. Pinning the tzdata release in evidence packs prevents retroactive revisionist timezone interpretation.

### Plain-English recommendation
Build a signed DST transition table tied to the seasonal calendar table. Treat it as immutable after WORM seal. Pin tzdata versions. Alert counsel when a jurisdiction changes DST rules within a relevant client's matter timeline.

---

## 2026-06-01 — daylight_saving_time_transition_table: Daylight saving time transition table

## daylight_saving_time_transition_table: What to build, competitors, and regulatory considerations

### What it is
A governed lookup table that captures every daylight saving time transition by jurisdiction and year. In WealthForge, date/time arithmetic is not optional — countdown engines, baseline windows, reconciliation pipelines, and anomaly detection all depend on knowing whether a local hour is duplicated, skipped, or unchanged. The daylight_saving_time_transition_table exists to eliminate temporal ambiguity for regulators and internal calculations alike.

### What to build
- **Schema**: Key by (jurisdiction_code, year). Fields should include:
  - dst_start_utc, dst_start_local
  - dst_end_utc, dst_end_local
  - offset_before, offset_after
  - spring_forward boolean + clock_repeat_hours
  - tzdata_version (pinned IANA release, e.g. tzdata2024b)
  - citation_url (national gazette or government decree)
  - effective_years range
  - supersedes (hash of previous entry) and manifest_hash for chaining
- **Update cadence**: Sync with IANA tzdata releases and relevant national gazettes at least annually; ad-hoc processes for emergency rule changes such as legislative amendments to DST dates.
- **Integration touchpoints**:
  - Event canonicalization pipeline: resolve skipped/repeated local timestamps before diffing.
  - Countdown/baseline engines: calendar-aware hour counting.
  - Evidence-pack and WORM seal: include tzdata version + DST context so a regulator can recompute the deadline.
  - Historical replay: snapshot prior table versions to maintain back-cast integrity.

### Competitors and market gap
- **FIS, SS&C Advent, and broad ERP tools** rely on OS-level timezone libraries. They do not expose a signed, auditable DST transition manifest.
- **Court e-filing systems** often use a single server timezone or strict UTC, which causes practitioner confusion around DST boundaries.
- **WealthForge differentiator**: No current WM platform publishes a cryptographically signed, governed DST table with historical retention and manifest chaining. This reduces litigation and audit risk for clients.

### Regulatory considerations
- **Record integrity**: SEC, FCA, and similar regimes require unambiguous records. A timestamp in a repeated or missing hour must resolve to a single canonical UTC moment; the DST table provides the proof.
- **Litigation defense**: If a client claims a deadline was met during an ambiguous hour, the signed DST table, paired with manifest-chaining evidence, settles whether 11:30 PM was the first or second occurrence on fall-back night.
- **Cross-border**: APAC has no DST; EU, US, certain South American and Oceanic nations do. A unified table prevents cross-jurisdiction contamination.
- **Version integrity**: tzdata is patched multiple times yearly. Pinning the tzdata release in evidence packs prevents retroactive revisionist timezone interpretation.

### Plain-English recommendation
Build a signed DST transition table tied to the seasonal calendar table. Treat it as immutable after WORM seal. Pin tzdata versions. Alert counsel when a jurisdiction changes DST rules within a relevant client's matter timeline.

---

## 2026-06-01 — esta-2b-1a-3-5-sub-3-2a-3-4: esta-2b-1a-3-5-sub-3-2a-3-4: Anomaly scoring policy and severity taxonomy

# esta-2b-1a-3-5-sub-3-2a-3-4: Anomaly scoring policy and severity taxonomy

## Topic
US estate, gift, and GST tax filing (Form 706) and compliance/filing obligations for decedents’ estates.

## Key findings
1. Estate tax is assessed under IRC Chapter 11 on the transfer of a decedent’s taxable estate; Form 706 is used to compute the tax and any generation-skipping transfer (GST) tax under Chapter 13.
2. Form 706 includes many schedules (A–T and related schedules) that map to asset classes and deduction categories, so a scoring policy must cover multiple asset types, deductions, credits, and elections.
3. The estate tax closing letter fee was reduced to $56 effective May 21, 2025, indicating ongoing regulatory/administrative changes that feeding systems must track.
4. Schedule PC allows estates of decedents who died after 2011 to file protective claims for refund when contingencies affecting estate tax liability are unresolved.

## What to build
- Unified anomaly model for estate, gift, and GST tax filings.
- Severity taxonomy that maps anomalies to risk classes and downstream alert channels.
- Scoring policy calibrated to Form 706 schedules and common filing risk patterns.

## Competitors / analogs
- Professional tax compliance platforms (major enterprise tax providers) typically implement anomaly/routing models for filings and returns.
- IRS risk-based processing and processing checks provide publicly documented signals that can inform severity design.

## Regulatory considerations
- Governed by IRC Chapters 11, 12 (gift tax), and 13 (GST); schedules and instructions are subject to IRS updates.
- Protective claim and refund-credit mechanisms (Schedule PC, Schedule Q) create conditional liability workflows that scoring must support.
- Jurisdiction nuances may affect international estates, treaty items, and foreign tax credits (Schedule P).

## Blockers / follow-ups
- Need precise metric selection: rules vs statistical anomaly scoring for this return type.
- Need source schedule mapping for all Form 706 and related gift-tax forms.

---
