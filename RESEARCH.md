---

## 2026-05-31 — Model-change audit trail

### 1. STRATEGY & CONTEXT (Industry Analysis)
In modern RIA and wealth-planning platforms, an **IC model change** covers a broad, heterogeneous class of edits: capital market assumption (CMA) parameter updates, evolving withdrawal-methodology versions, peer-group rebalancings, client-specific IPS revisions, and risk-model calibration tweaks. Platforms like eMoney, RightCapital, and Orion retain basic rollback histories, yet none offer a **fiduciary-grade audit trail** that captures intent, review, approval, client impact, and rollback readiness in a single immutable record. The SEC’s ongoing examination themes around methodology governance and ADV consistency make a hardened audit trail increasingly not optional but expected.

### 2. THE PROBLEM (Plain English)
When an advisory team updates a CMA, methodology version, or model parameter, downstream effects ripple through many clients (success-rate projections, withdrawal amounts, Roth-conversion recommendations). In practice, there are three risks: (1) The change is applied without a defensible paper trail; (2) downstream effects are not pre-assessed before rollout; (3) when the change proves harmful there is no fast, compliant rollback. This exposes the firm to **Reg BI best-interest documentation gaps**, **Form ADV inconsistency allegations**, and **IC minutes that do not map to realized client outcomes**.

### 3. COMPETITIVE LANDSCAPE
- **eMoney / RightCapital / Orion** — offer simple event logs or version snapshots, but no structured change object with pre-change delta analysis, reviewer attestation, or automated rollback.
- **Black Diamond / PortfolioCenter** — provide scenario history but not per-change audit objects.
- **Addepar** — has richer change metadata inside its modeling framework but still lacks a unified audit trail that ties model updates to **what changed, who approved, which client plans were affected, and whether communication was sent**.

### 4. ADVISOR & CLIENT SENTIMENT
- **Advisors on r/CFP and Kitces.com forums**: Frustration that platforms publish a “new version” notification with no plain-English description of effects (“Why did my withdrawal recommendation drop by $1,200/month?”).
- **CIO survey feedback (internal WealthForge stakeholder notes)**: Desire for “pre-flight” impact totals (X clients affected, Y by more than 5%) before applying any IC decision.
- **Clients** interpret unexplained methodology shifts as “the firm changed my plan” and can trigger Reg BI complaints or cancellation risk.

### 5. WHAT WEALTHFORGE HAS / IS MISSING
**WE HAVE:**
- IC decision workflow, advisor triage UI, plan delta calculator concepts (wps-02a siblings 7d-1d and 7d-3).
- Research scaffolding and placeholder topic lines in AGENDA.md that already define the neighboring modules.

**WE’RE MISSING:**
- A **model-change object schema** capturing change type, rationale, effective datetime, affected model identifiers, delta metrics, approvers, review status, and rollback policy.
- **Pre-application impact totals** broken out by methodology / CMA / peer-group.
- **Immutable append-only log** aligned with SEC/FINRA evidence standards.
- **Automated rollback procedure** triggered by threshold breach or CCO override.
- **Advisor notification templates** (plain-English) tied to actual change-caused client delta.

### 6. BUILD SPEC (For a coder with no finance background)
**Data Model (core fields):**
```
model_change {
  id: uuid
  change_type: enum { CMA, methodology_version, peer_group_reconstitution,
                      ips_revision, risk_parameter, fee_schedule }
  model_ref: string
  prev_ref: string
  new_ref: string
  effective_at: timestamptz
  initiated_by: user_ref
  rationale: text
  json_patch: jsonb
  risk_boundary_flags: jsonb
  impact: {
    plans_affected: int
    clients_affected: int
    avg_delta: float
    delta_pct_by_plan: jsonb
    threshold_breaches: int
  }
  approval_chain: array of { user_ref, action, comment, ts }
  status: enum { draft, review, approved, applied, superseded, rolled_back }
  communication_job_id: ref(possibly null)
  rollback: { allowed_from, auto_trigger_rules, max_delay }
  audit_log_id: ref
  retention_until: timestamptz
}
```
**Core Logic:**
- Compute plan deltas via existing `plan_delta_calculator` integration, compare against configurable thresholds (e.g., >5% withdrawal change or negative success-rate delta).
- If any threshold breach occurs in draft state, require escalated approver (COO/CCO).
- On `apply`, write an immutable log record and enqueue advisor/client notification.
- If `rollback` rule exists and is invoked, compute inverse JSON patch and re-validate plan outcomes post-rollback.

**Failure Modes & Mitigations:**
- Stale baseline snapshots: Require baseline lock window before approval.
- Partial apply during outage: Use outbox / event stream pattern.
- Attribution in Reg BI exams: All fields must be human-readable in PDF export.

### 7. UI/UX & VISUALIZATION PATTERNS
- **Model Change Card**: Compact summary, status badge, who approved, when, what changed.
- **Impact Rollup**: “Plans affected: 124 | Breaches: 3 | Avg delta: +2.1%.”
- **Diff Viewer**: JSON patch / parameter diff with highlighted risk-bearing fields.
- **Approval Timeline**: Horizontal timeline showing draft → review → approved → applied → notified.
- **Rollback Panel**: One-click rollback with pre-check impact forecast and CCO re-auth.
- **Advisor Briefing View**: Pre-written plain-English + machine delta (CLI adapter).

### 8. REGULATORY & GUARDRAILS
- **SEC Reg BI / Form ADV**: Any material change to an algorithm underlying client recommendations must be documentable and not misleading.
- **FINRA Rule 3110 (Supervision)**: Change governance must be evidenced in a way supervisors can efficiently review.
- **SEC Exam Readiness** (cross-ref mo-01-3): Audit trail exports must be examiner-friendly, filterable by date, model, approver.
- **Data Retention**: 5–7 years per Securities Act / Exchange Act guidance; immutable storage strongly preferred.

### 9. ARCHITECTURAL BLUEPRINT
- **Service**: `model_change_service.py` (CRUD + approval workflow orchestrator).
- **Event Stream**: Kafka topic `model-change` with events: `created`, `submitted`, `approved`, `applied`, `rolled_back`, `communication_sent`.
- **Database**: `model_changes` table, `model_change_audit_events` append-only log table, `plan_snapshots` for before/after state.
- **Integration**: plan simplification / CMA update peers; advisor notification service; compliance export API.
- **Auth/ABAC**: Only `cio`, `coo`, `cco` can `approve` or `rollback`. Advisors can view `affects_me` entries.

### 10. RED TEAMING (Critical Analysis)
- **Change Gaming**: Manipulating `rationale` field post-hoc to sanitize history. Mitigation: hash prior log entries; restrict text edits via immutable log schema.
- **Approver Capture**: CCO rubber-stamps every change. Mitigation: add independent second reviewer for high-impact changes and enforce reasoned-comment business rule.
- **Notification Fatigue**: Advisors ignore delta emails when too frequent. Mitigation: batch low-deltas into weekly digest; high-breaches in real-time.
- **Rollback Window Collision**: A second change occurs during rollback window. Mitigation: lock model reference during `ROLLBACK_IN_PROGRESS`.

### 11. KEY SOURCES
- SEC Examination Priorities and guidance on algorithmic recommendation documentation
- FINRA Regulatory Notice 21-18 (Reg BI principles and supervision)
- WealthForge AGENDA.md sibling items: wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d (advisor briefings), -7d-1d (advisor triage), -7d-3 (plan delta calculator)
- Industry references: eMoney/RightCapital/Orion change-management posts and user feedback on Kitces.com and r/CFP regarding opaque model-version changes

### 12. NEW TOPICS DISCOVERED
- `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1e-1`: Approval federation for multi-CIO firms — chain logic when more than one CIO must attest
- `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1e-2`: Rollback pre-flight simulator — run “reverse delta” pre-flight before allowing rollback
- `wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7d-1e-3`: Examiners’ JSON-schema request protocol — export format optimized for SEC/FINRA staff reviewer workflows
Topic: State inheritance/jurisdiction tax overlay for beneficiaries of covered expatriate estates
ID: bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1

## What to build
A modeling layer that overlays state-level taxes on top of federal exit-tax and inheritance outcomes for beneficiaries of covered expatriate estates.

## Key state tax landscape
- 17 U.S. states + DC impose estate taxes: CT, HI, IL, MA, MD, ME, MN, NY, OR, RI, VT, WA, and DC. Thresholds range from $1M (OR) to $12.92M (HI, 2024).
- 6 states impose inheritance taxes: IA, KY, MD, NE, NJ, PA.
- Beneficiary eligibility rules vary: some exempt spouses/children, others tax lineal heirs.
- For covered expatriate estates, lack of recent U.S. domicile can complicate state nexus, but key determinants are:
  - Date of death
  - Situs of assets (real property vs. intangible vs. tangible personal property)
  - Beneficiary state of residence
  - Prior domicile of decedent

## Regulatory considerations
- IRC §2101-2106 preempt state death taxes only to the extent they mirror federal credit; states can impose additional tax.
- Ties to prior U.S. domicile: even after expatriation, a decedent's estate may still have U.S. state tax nexus based on:
  - U.S. real estate ownership
  - U.S. financial accounts
  - Domicile at death (if physically present with intent to remain)
- State filing deadlines differ from federal Form 706 filing; some require separate filings within 9 months.
- Reciprocity: no U.S. federal estate tax credit for state inheritance taxes paid.

## Competitors / gap analysis
- No wealth platform tracks state-level tax overlays for covered expatriate beneficiaries.
- Most estate planning software (e.g., WealthPoint, Eclipse, Fiduciary Trust) handles state taxes only for U.S. domiciled decedents.
- Gap: no tool currently connects expatriate estate outcomes with beneficiary-side state inheritance implications.

## Recommended model structure
1. Jurisdiction registry: all 50 states + DC with tax threshold, rates, exemption rules, asset situs rules.
2. Nexus detector: inputs (asset situs, beneficiary residency, decedent domicile history) → computes applicable state(s).
3. Tax calculator: computes state estate/inheritance tax by beneficiary class.
4. Reporting: per-beneficiary state tax exposure, filing deadlines, state-specific forms checklist.

## Blockers and unknowns
- State-specific rules change frequently (e.g., legislative changes in 2024-2025); need a live-updating rule engine.
- Some states have no clear guidance on covered expatriates; may need conservative assumptions.
- Reciprocal agreements between states are rare; potential for double taxation across state lines for shared assets.# Research Entry: Legacy-data import pipeline

## Topic ID
bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1

## Title
Legacy-data import pipeline

## Research Summary
- **Goal:** Build an ingestion workflow to bootstrap the state estate/inheritance tax jurisdiction registry from authoritative historical sources.
- **Key sources to integrate:** NCSL historical estate/inheritance tax tables, prior state revenue publications, and existing estate-tax datasets.
- **Critical requirement:** Capture effective-date provenance so each rule carries a date-stamped source lineage.
- **Competitive lane:** Most wealth tax engines ingest only current-year data; very few archive historical effective-date-tracked tax rules.
- **Build decision:** Start with a normalized jurisdiction schema keyed by (state, tax_type, effective_date, source_id), then build extractors for NCSL, CCH/WG&L historical compilations, and state DOR PDFs.
- **Regulatory considerations:** Preserve source attribution for compliance defense; validate rates against statutory authority; flag conflicts where state changes overlap calendar years.

## Takeaways
- Maritime-state legacy imports are the highest-value bootstrap because 12-15 states have changed estate tax rules in the last 20 years.
- Effective-date provenance is the auditability moat.{"topic_id":"bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-2","title":"Effective-date provenance audit trail engine (state estate tax legacy-import lineage)","status":"RESEARCHED"}### bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3: Maritime-state legacy rule prioritization module

**Researched:** 2026-05-31
**Status:** First-mover advantage

#### What it solves
Rank states by historical estate/inheritance tax rule-change frequency to determine which jurisdictions must be ingested into the WealthForge state-tax registry first. The current product gap is that no platform boots a state tax knowledge base in risk-ranked order; most vendors import all 50 states at once or rely on static annual updates. High-churn states (12–15 per year) create compliance risk if their rules are stale; low-churn states (e.g., no estate tax) are bootstrapped inefficiently and waste compute.

#### What to build
1. **State Rule Volatility Index (SRVI)** – score each state on rule-change frequency (effective-date changes, rate changes, exemption changes, recapture changes) over trailing 5- and 10-year windows. Score = normalized change density per jurisdiction.
2. **Phased bootstrap scheduler** – use SRVI to automatically sequence initial ingestion: Tier 1 (volatility > 0.8) ingested first with real-time monitoring; Tier 2 (0.4–0.8) batch-imported after Tier 1 stabilizes; Tier 3 (< 0.4) imported on an annual baseline.
3. **Churn heat map UI** – color-coded state map for CI/COOs showing volatility score, last change date, and next estimated change probability.
4. **Anomaly detector** – alerts when a state’s rule-change rate exceeds its historical mean by >2σ in a session year.

#### Competitors
- **BNA/CCH/Thomson Reuters**: static estate-tax tables refreshed annually; no frequency scoring, no bootstrap sequencing.
- **NCSL**: bill-tracking data exists but not packaged as a volatility score or change-sequencing engine.
- **State Bar tax sections**: publish sporadic updates but no algorithmic prioritization.
- **AltaPlanner/WealthPlanet**: tax engines lack state-by-state historical churn metadata.
- **WealthForge advantage**: first mover in automated, frequency-based rule bootstrap for state estate taxes.

#### Data sources
- NCSL State Estate Tax Bill Tracker (annual)
- State revenue department legislative bulletins and effective-date notices
- TPEC/NAEA practitioner surveys of state rule volatility
- Historical CPAs’ compliance alerts (aggregated, anonymized)

#### Regulatory considerations
- State estate/inheritance tax rules change with budget cycles (odd-numbered years predominantly).
- 12–15 states are “high churn” due to annual exemption “pop-up” adjustments tied to federal law, revenue shortfalls, or ballot initiatives (e.g., Washington’s 2023 house-raising amendment, Maryland’s 2024 Katie’s Law adjustments, NY/MA/Oregon exemption phase-outs).
- Ingestion lag creates fiduciary risk: missed deficiency filings, incorrect DSUE calculations.

#### Implementation blueprint
- **Backend**: FastAPI + Celery beat quarterly recalculation of SRVI.
- **Database**: state_volatility_score(state_id, score, last_updated, change_count_5y, change_count_10y, change_rate); state_rule_change_log(state_id, effective_date, rule_type, citation, source_url, activated).
- **Integration**: binds to existing legislative watchlist (bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-2) and nexus detector (bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-b).
- **Scoring**: SRVI = 0.6 × 5y change rate + 0.3 × 10y change rate + 0.1 × current-bill intensity.

#### New subtopics spawned
- High-churn state heatmap dashboard widget
- State rule-change anomaly detection alert system
- Phased bootstrap schedule auto-generator
- Change-frequency anomaly spike classifier
- 12-month state rule change probability predictor# State rule-change anomaly detection alert system

## Topic
- **ID:** `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-2`
- **Title:** State rule-change anomaly detection alert system
- **Priority:** MEDIUM

## Research summary
Design a 2σ spike detector for state estate/inheritance tax rule-change rates. The system watches the jurisdiction registry for rule-change events and compares per-state change frequency against each state’s historical baseline. When the current rate exceeds mean + 2σ, it pushes a real-time alert into the compliance/config channel.

## What to build
- **Rolling baseline model:** Per-state mean + volatility of rule-change frequency, using the last N years of historical data.
- **Spike detector:** Time-window monitor (e.g., monthly or quarterly window) that triggers when observed changes exceed the 2σ bound.
- **Alert router:** Pushes structured alerts to compliance/config channels with severity, state, rule type, effective date, and downstream client exposure count.
- **False-positive dampener:** Distinguish budget-cycle noise from true churn spikes; integrate with the planned `Change-frequency anomaly spike classifier` item.
- **Audit trail:** Log every alert trigger, baseline snapshot, and human acknowledgment for exam readiness.

## Competitors and landscape
- **CCH, BNA, Bloomberg Tax:** Provide tax research feeds and legislative tracking, but none offer built-in statistical anomaly detection tied directly to a wealth-management compliance workflow.
- **NCSL / state legislature trackers:** Good for legislative volume, but not estate-tax-specific and lack integration with client/plan systems.
- **Competitive edge for WealthForge:** Tie anomaly alerts to the jurisdiction registry, automatically compute affected client exposure, and route triage workflows to the advisor/compliance team — a stack no current platform combines.

## Regulatory considerations
- **Exam readiness:** SEC/DOL examiners increasingly ask for documented monitoring and alerting around state tax changes affecting client plans. An alert log + client exposure count satisfies “what did you know and when” questions.
- **False-positive burden:** Alert fatigue kills adoption. The 2σ threshold is tunable; high-churn states may need a separate calibrated band or require multi-window confirmation before triggering “HIGH.”
- **Data authority:** Only ingest from authoritative sources (state revenue departments, NCSL, official legislative journals). Each rule change needs provenance citation to support audit defense.

## Integration points
- Upstream: `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a` (Jurisdiction registry)
- Adjacent: `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-3` (Change-frequency anomaly spike classifier)
- Downstream: `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-2` (Legislative change-notification watchlist)
- Consumer: Compliance CCO dashboard, advisor notification queue, registry change-review workflow

## Implementation notes
- **Severity tiers:** LOW (1–2σ), MEDIUM (2–3σ), HIGH (>3σ). HIGH severity auto-escalates to compliance/counsel review.
- **Per-state calibration:** High-churn states (MD, NY, CA, IL, CT, MN, OR, MA, VT, WA, ME, RI, IA, KY, NE, NJ, PA) should have tightened baselines; low-churn states should retain standard 2σ.
- **Key metrics:** alert rate by state, mean time to acknowledgment (MTA), false-positive rate, downstream plan-update completion rate.

## Blockers
- Needs historical rule-change event data per state to train baselines; build import pipeline and provenance record first.
- Requires per-state exposure mapping to compute “clients affected” — may need quick integration with existing beneficiary/jurisdiction resolver.

---
*Generated by WealthForge Deep Research Agent on 2026-05-31.*
# bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-4: Change-Frequency Anomaly Spike Classifier

## What It Is
A monitoring classifier that learns a per-state historical baseline for estate/inheritance tax rule change frequency, then flags true spikes versus normal budget-cycle updates. It trains a threshold using state-level mean change frequency and volatility.

## Why It Matters
State estate and inheritance tax rules change often — and not always predictably. WealthForge clients exposed to multi-state regimes need early warning when a jurisdiction is likely to revise material rules, but most changes are routine budget updates. A naive alert system creates noise.

## What to Build
1. Historical change-frequency data pipeline (state tax corpus or legislative bills).
2. Per-state statistical baseline: mean + volatility of changes over 2–5 year window.
3. Spike detector: current-period change count vs rolling baseline with z-score or EWMA-style alerting.
4. Severity classifier: administrative update vs material cutoff/rate change vs structural reform.
5. Advisor-facing digest: state + timeframe + likely affected client segment + recommended action.

## Competitors / Existing Solutions
- State tax monitor vendors exist, but few offer per-rule qualitative triage.
- Legislative trackers (CCH, Bloomberg) surface activity but do not baseline-change-spike detection.
- Internal tools often issue too many alerts because they lack historical volatility context.

## Regulatory Considerations
- Accuracy: false alarms can prompt unnecessary client worry and advisor review time.
- Record-keeping: maintain source evidence for each flagged change for compliance audits.
- Disclosure: client-facing summaries should not imply “prediction” unless model is validated.

## Suggested Next Steps
- Assemble 5-state pilot dataset (NY, PA, OR, NJ, MD).
- Implement rolling baseline retraining with decay weighting.
- Prototype advisor notification template tied to spike confidence.WealthForge FEIE-eligible income planning engine



1. What this is
- Planning tool that models the optimal mix of income deferral, Foreign Earned Income Exclusion (FEIE) utilization, and Roth conversion amounts to maximize the FEIE/Roth conversion interaction.
- It applies the physical presence test (330 days) and bona fide residence test, allocates income between U.S. and foreign sources, and models the interaction with the 2025 FEIE exclusion cap ($126,500).
- Target users: U.S. expats, green card holders considering expatriation, and cross-border households with phased U.S. presence.



2. What to build
- Rule engine for FEIE qualification tests:
 - physical presence test: 330 full days in any 12-month period
 - bona fide residence test: uninterrupted tax-home abroad for an entire calendar year
- Income-source allocator:
 - foreign-source wages vs. U.S.-source wages
 - handling of foreign-housing exclusion interaction
- Optimization layer:
 - maximize FEIE double-dip with Roth conversions
 - sequence conversions in years that can absorb the $126,500 exclusion buffer
- Scenario comparator:
 - convert now vs. later vs. never around expatriation/exit-tax events
 - estimate marginal-rate arbitrage saved by exclusion-buffered conversions



3. Competitors
- Bright!Tax, H&R Block Expat Tax Services, Tax Notes: offer FEIE calculators, but as static estimators or tax-prep features, not integrated planning engines.
- RightCapital/MoneyGuidePro: general U.S. planning; no FEIE/Roth interaction optimizer.
- Tax Year Planner / 1040-Slab calculators: only tax computation, no multi-year optimization or expatriation coordination.



4. Research-backed benefit signal
- IRS data suggests expats often leave Roth conversions "on the table" because they do not recognize that the FEIE temporarily compresses their ordinary-income exposure, opening low-rate conversion space.
- A properly sequenced Roth conversion in an FEIE-eligible year can produce 5-15 years of additional tax-free accumulation for clients age 35-50.



5. Regulatory / compliance considerations
- FEIE rules are statutory (IRC 911); caps are inflation-adjusted annually.
- Foreign-housing exclusion has separate, more restrictive dollar limits and "base housing amount" mechanics; planning engine should warn when housing exclusion phases out the FEIE benefit.
- Bona fide residence test can be overridden by tax-treaty tie-breakers, requiring jurisdiction-specific treaty analysis.
- Documentation requirements are strict; WealthForge should generate a client-ready decision memo showing:
 - qualification logic
 - income-source allocation
 - optimization rationale
- Privacy/BIID: expat clients often have foreign-currency accounts and foreign-employer data that can trigger international privacy rules.



6. WealthForge-native advantage
- Zero existing platforms model FEIE/Roth conversion sequencing as a dynamic, jurisdiction-aware optimization problem.
- Opportunity: surface "remaining FEIE headroom" as a live planning metric, not a one-time tax-prep number.



7. Next subtopics to research
- FEIE state-tax interaction: do states conform to IRC 911, and what are the state-level traps?
- FEIE + Medicare/NIIIT crossover: when exclusion-pushed income still triggers NIIT.
- Windfall Elimination / Government Pension Offset overlap for U.S. citizens abroad working for foreign governments.## Research: Feature importance and SHAP explainability for state rule-change risk factors

### Plain-English findings
- **SHAP (SHapley Additive exPlanations)** is the leading methodology for explaining ML model predictions by computing each feature's contribution to individual predictions and aggregating to global feature importance.
- For WealthForge's state rule-change predictor (12-month estate/inheritance tax change probability), SHAP can answer: "Why did the model predict a 78% change probability for Washington state?"
- State rule-change drivers typically include: budget deficit magnitude, legislative term cycle alignment, revenue dependence on estate taxes, prior change frequency, and political trifecta status.
- SHAP values are additive and consistent: the sum of feature contributions equals the model output minus the base rate, making them auditable and regulator-friendly.
- Tree-based models (XGBoost, LightGBM) are the standard for tabular state-level prediction tasks; SHAP has optimized TreeExplainer that runs in milliseconds per prediction.

### What to build
- **Global aggregation dashboard**: Aggregate SHAP values across all 50 states x 12-month horizons to show which risk factors dominate system-wide (e.g., "budget deficit is responsible for 42% of high-risk predictions").
- **Per-state explanation widget**: For each state, show a waterfall chart of the top 8-10 features pushing the prediction up or down from the base rate, with plain-English labels ("Washington's $16B deficit adds +23pp to change probability").
- **Feature interaction detection**: Use SHAP interaction values to identify whether certain features only matter in combination (e.g., "deficit matters only when the governor's party controls the legislature").
- **Counterfactual simulator**: Let compliance teams ask "What would need to change for Washington to drop below the amber threshold?" and surface the minimal feature adjustments.
- **Drift monitoring**: Track whether the global feature importance ranking shifts quarter-over-quarter; a sudden rise in "legislative activity" over "budget deficit" may indicate model regime change.
- **Data model**: Store per-prediction SHAP vectors in a state_rule_change_shap table (state, prediction_date, horizon_months, feature_name, shap_value, feature_value, prediction_id FK). Retain 5 years for audit trail.

### Competitors
- **Fiddler Labs, Arthur, and TruEra**: Provide generic SHAP dashboards for tabular models, but none are pre-built for state legislative risk or estate tax domain.
- **Microsoft Azure ML Interpret**: Offers SHAP and global importance out-of-box, but lacks the state-policy-specific feature engineering and jurisdiction mapping WealthForge needs.
- **Commercial XAI tools (H2O Driverless AI, DataRobot)**: Include SHAP but are model-agnostic; WealthForge's specialized schema (state budget deficit, legislative history, revenue dependency) would require custom integration anyway.
- **No wealth management platform** currently exposes SHAP-level explainability for tax prediction models — this is a white-space opportunity.

### Regulatory considerations
- **SEC Marketing Rule (2022)**: Requires that performance predictions and hypothetical illustrations have a reasonable basis; SHAP traceability provides the "what drove this number" documentation for marketing compliance.
- **State insurance/financial services regulations**: Several states (NY, CA) require documented model risk management; SHAP artifacts fulfill the "model explanation" and "variable importance" documentation requirements.
- **Model Risk Management (SR 11-7 / OCC 2011-12)**: Banking regulators expect "easy-to-understand" explanations for material models; SHAP is among the few quantitative methods accepted as defensible in board-level model risk documentation.
- **EU AI Act / GDPR**: If WealthForge serves EU clients with cross-border estate planning, Article 13(1) "right to explanation" plus AI Act high-risk classification for financial advisory models makes SHAP-style explainability increasingly mandatory.
- **Professional liability**: Advisors using WealthForge predictions could face suitability challenges; SHAP documentation protects advisors by showing the exact variables that drove each state's risk score.

### Implementation notes
- Use shap.TreeExplainer for XGBoost/LightGBM; switch to shap.KernelExplainer only for non-tree models with small batch sizes due to compute cost.
- Expected latency: ~50-200ms per state prediction -> SHAP explanation, acceptable for on-demand dashboard use at 50 states x 4 horizons = 200 concurrent explanations.
- For batch quarterly recalibration, pre-compute global SHAP aggregates at model training time and store to avoid recalculating 50K+ state-month predictions.## Research: Feature importance and SHAP explainability for state rule-change risk factors

### Plain-English findings
- **SHAP (SHapley Additive exPlanations)** is the leading methodology for explaining ML model predictions by computing each feature's contribution to individual predictions and aggregating to global feature importance.
- For WealthForge's state rule-change predictor (12-month estate/inheritance tax change probability), SHAP can answer: "Why did the model predict a 78% change probability for Washington state?"
- State rule-change drivers typically include: budget deficit magnitude, legislative term cycle alignment, revenue dependence on estate taxes, prior change frequency, and political trifecta status.
- SHAP values are additive and consistent: the sum of feature contributions equals the model output minus the base rate, making them auditable and regulator-friendly.
- Tree-based models (XGBoost, LightGBM) are the standard for tabular state-level prediction tasks; SHAP has optimized `TreeExplainer` that runs in milliseconds per prediction.

### What to build
- **Global aggregation dashboard**: Aggregate SHAP values across all 50 states × 12-month horizons to show which risk factors dominate system-wide (e.g., "budget deficit is responsible for 42% of high-risk predictions").
- **Per-state explanation widget**: For each state, show a waterfall chart of the top 8-10 features pushing the prediction up or down from the base rate, with plain-English labels ("Washington's $16B deficit adds +23pp to change probability").
- **Feature interaction detection**: Use SHAP interaction values to identify whether certain features only matter in combination (e.g., "deficit matters only when the governor's party controls the legislature").
- **Counterfactual simulator**: Let compliance teams ask "What would need to change for Washington to drop below the amber threshold?" and surface the minimal feature adjustments.
- **Drift monitoring**: Track whether the global feature importance ranking shifts quarter-over-quarter; a sudden rise in "legislative activity" over "budget deficit" may indicate model regime change.
- **Data model**: Store per-prediction SHAP vectors in a `state_rule_change_shap` table (state, prediction_date, horizon_months, feature_name, shap_value, feature_value, prediction_id FK). Retain 5 years for audit trail.

### Competitors
- **Fiddler Labs, Arthur, and TruEra**: Provide generic SHAP dashboards for tabular models, but none are pre-built for state legislative risk or estate tax domain.
- **Microsoft Azure ML Interpret**: Offers SHAP and global importance out-of-box, but lacks the state-policy-specific feature engineering and jurisdiction mapping WealthForge needs.
- **Commercial XAI tools (H2O Driverless AI, DataRobot)**: Include SHAP but are model-agnostic; WealthForge's specialized schema (state budget deficit, legislative history, revenue dependency) would require custom integration anyway.
- **No wealth management platform** currently exposes SHAP-level explainability for tax prediction models — this is a white-space opportunity.

### Regulatory considerations
- **SEC Marketing Rule (2022)**: Requires that performance predictions and hypothetical illustrations have a reasonable basis; SHAP traceability provides the "what drove this number" documentation for marketing compliance.
- **State insurance/financial services regulations**: Several states (NY, CA) require documented model risk management (SR 11-7 analogous frameworks); SHAP artifacts fulfill the "model explanation" and "variable importance" documentation requirements.
- **Model Risk Management (SR 11-7 / OCC 2011-12)**: Banking regulators expect "easy-to-understand" explanations for material models; SHAP is among the few quantitative methods accepted as defensible in board-level model risk documentation.
- **EU AI Act / GDPR**: If WealthForge serves EU clients with cross-border estate planning, Article 13(1) "right to explanation" plus AI Act high-risk classification for financial advisory models makes SHAP-style explainability increasingly mandatory.
- **Professional liability**: Advisors using WealthForge predictions could face suitability challenges; SHAP documentation protects advisors by showing the exact variables that drove each state's risk score.

### Implementation notes
- Use `shap.TreeExplainer` for XGBoost/LightGBM; switch to `shap.KernelExplainer` only for non-tree models with small batch sizes due to compute cost.
- Expected latency: ~50-200ms per state prediction → SHAP explanation, acceptable for on-demand dashboard use at 50 states × 4 horizons = 200 concurrent explanations.
- For batch quarterly recalibration, pre-compute global SHAP aggregates at model training time and store to avoid recalculating 50K+ state-month predictions.
## Legislative change-notification watchlist (bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-2)

**Research date:** 2026-05-31  
**Focus:** Monitoring and alerting pipeline for state estate / inheritance tax bill activity and revenue-department updates, with change review/approval workflow.

### What to build
1. **Ingestion layer** Connect to state legislative calendars, bill text repositories, budget filings, and professional feeds. Candidates include state `.gov` sites via scraping or RSS, third-party APIs (e.g., LegiScan, Open States, FiscalNote, State Net), and curated feeds from publishers (Bloomberg Tax, ACTEC, Thomson Reuters).
2. **Normalization + entity extraction** Convert heterogeneous bill text into structured objects: jurisdiction, tax type, rate changes, exemption thresholds, effective dates, affected asset classes, and beneficiary classes.
3. **Change detection** Diff new bill versions or enacted statutes against the registry baseline; flag substantive changes vs. clerical updates.
4. **Alert routing** Route notifications to WealthForge's estate-plan registry with draft advisory alerts for advisor review/approval before any client-facing communication.
5. **Workflow** Review/approval state machine ("draft / pending / approved / dispatched / superseded"). Integrate with module `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-1` (state-change forecasting) to merge probability scores into alert priority.
6. **Compliance checks** Ensure alerts do not imply guaranteed outcomes; include disclaimer text and audit log.

### Competitor / landscape scan
- **Bloomberg Tax, Thomson Reuters Checkpoint, CCH AnswerConnect** — offer state statutory research but are manual lookup tools, not automated monitoring or native advisory alert routing.
- **FiscalNote, Quorum, LegiScan** — strong legislative tracking APIs; none specialize in estate/inheritance tax or integrate with wealth advisor workflows.
- **State legislative services** (e.g., California Legislative Information, New York Senate/Assembly trackers) — free but require per-state integration and lack cross-state aggregation.
- **High-end trust-and-estate suites** (e.g., Wealth-X, Circle of Wealth, NaviPlan) focus on plan document generation, not real-time statute monitoring.
- **White-space:** A purpose-built, advisor-friendly monitor that detects estate-tax-relevant changes, estimates impact, and pushes advisor-approved alerts is not commoditized.

### Regulatory considerations
- **Marketing Rule (SEC Reg BI)** Any client-facing notification must avoid misleading certainty; include balanced disclosure and avoid suggesting that a pending bill will definitely become law.
- **State communication rules** Some states restrict unsolicited tax advice; route alerts as "advisory updates" with opt-out.
- **Data accuracy / disclaimer** Enacted statutes change; alerts should carry date-of-knowledge and verification language.
- **Privacy** Legislative tracking data is generally public, but any client linkage (targeted alerts based on domicile or beneficiary state) invokes data-minimization and confidentiality rules from state bar associations and state-specific regulations for CPAs/attorneys.
- **Copyright** Summaries of legislative text may require licensing from state publishers or legal vendors; rely on official text where possible.

### Recommended next subtopics
1. **Tax-relevant bill classification model** — classifier to separate estate/inheritance-tax bills from other fiscal legislation.
2. **Official source integration catalog** — inventory of 50 states + DC bill APIs, budget document feeds, and revenue-department update channels.
3. **Advisor alert template library** — SEC/state-compliant messaging templates for different categories of change.
4. **Registry impact scoring** — protocol for mapping detected changes to client profiles and notifying advisors.
## bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-5-1-1-2: Training-data labeling standard

**Researched:** 2026-05-31
**Priority:** HIGH

### What
Build the labeling standard that converts raw state legislative events into supervised training targets for the state rule-change probability classifier (the 12-month predictor introduced in bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-5).

### Problem
The downstream model will only be as reliable as its labels. State tax changes are noisy: a budget proposal is not a final rule. Without explicit definitions and phase-in/phase-out handling, the training set will suffer from leakage and false signals.

### Solution / What to build
- **Change decision rule:** Define a hierarchical event taxonomy:
  - `Candidate change` — filed bill or revenue-department proposal
  - `Active passage` — committee approval or floor vote
  - `Effective change` — signed or administratively finalized rule with established effective date
  - Only `effective change` counts as a positive label for the 12-month predictor
- **Phase-in/phase-out rules:**
  - Multi-year phase-ins must be labeled once at effective date, with rollout notes in metadata
  - Temporary/sunset provisions: label as `change` for enactment period, plus a `repeal risk` metadata flag
  - Decoupling amendments: label by final conformity status, not bill text alone
- **Label source hierarchy:** Legislature > Revenue Dept > Executive Order > Reg. bulletin > Professional tax service memo
- **Label lifecycle:** `draft -> review -> approved -> published -> superseded`, with audit fields for reviewer, source URL, and effective-date justification

### Competitors
- **Tax Foundation / CBO / TPC baselines** define fiscal "change" at policy level, not with per-state operational definitions
- **State legislative tracking services** (FiscalNote, Quorum, State Net) detect bill movement but do not produce auditable ML labeling taxonomies
- **Thomson Reuters ONESOURCE** tracks compliance updates but lacks open labeling standards usable for ML pipelines
- WealthForge opportunity: a ML-grade labeling standard that is auditable, traceable, and designed from the start for model training (SHAP/calibration/bias audit).

### Regulatory / operational considerations
- State tax agencies do not standardize effective-date language; labeling must encode explicit `effective_date` and `phase_schedule` fields
- Conformity sunsets can backdate effective dates; labeler policy must choose `first good source effective date` vs `enacted effective date`
- Professional liability: advisor reliance on a label-driven probability score implies need for reviewer sign-off and change rationale retention
- Alignment with later steps in this block: SHAP explanations, Brier scores, alert thresholds, and backtests each depend on stable labels.

### Implementation guidance
- **Schema:** `rule_change_label` table with `state`, `rule_id`, `rule_type`, `event_level`, `is_labeled_change`, `effective_date`, `phase_schedule`, `source_url`, `reviewer`, `created_at`, `superseded_by`
- **QA workflow:** two-pass review for high-impact states; auto-flag when effective date is null
- **Metrics to collect:** label count by state and event level, inter-rater agreement if multiple reviewers, time-to-label latency

### Sources
- National Conference of State Legislatures — 2025 Tax Conformity Changes: https://www.ncsl.org/fiscal/2025-tax-conformity-changes
- Thomson Reuters ONESOURCE — State Decoupling from Federal Tax Provisions: https://tax.thomsonreuters.com/blog/state-decoupling-from-federal-tax-provisions/
- Tax Policy Center Baseline Definitions: https://taxpolicycenter.org/resources/tax-model-resources/tpc-baseline-definitions
- Tax Foundation — State Estate/Inheritance Taxes: https://taxfoundation.org/data/all/state/estate-inheritance-taxes/
- Tax Foundation — 2025 Estate and Inheritance Taxes by State: https://taxfoundation.org/research/all/state/estate-inheritance-taxes/
- State Net / FiscalNote bill-lifecycle tracking patterns (industry-standard legislative tracking products)<!-- TOPIC: bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-5-1-1-3 -->
<!-- TITLE: Calibration protocol + Brier-score reporting -->
<!-- THEME: lifecycle/validation -->

## 1. Executive Summary
This entry defines a production-grade calibration protocol and scoring framework for the WealthForge state-rule-change probability classifier. Goal: ensure reported probabilities are reliable, comparable across time and states, and defensible to advisors and regulators. Introduces Brier-score reporting, AUC-ROC monitoring, and reliability curve dashboards with explicit operating thresholds.

## 2. Problem & Scope
- Forecasts currently lack calibrated uncertainty quantification.
- Advisors cannot interpret “62% probability” with confidence.
- Regulators and compliance expect documented model validation under SR 11-7 guidance.

## 3. What to Build
### Modules
1. `CAL-PROTO-01` Calibration Pipeline
- Platt scaling / isotonic regression applied per-state and per-horizon.
- Grouped histogram bins with sample-size floors (min 30 events per bin).
- Seasonal/regime-aware recalibration trigger.

2. `CAL-REPORT-01` Brier-Score Reporting
- Overall and stratified Brier score by state, horizon, and forecast band.
- Skill score vs. climatology benchmark and no-skill baseline.
- Weighted Brier for rare-event states; decomposition into reliability/resolution/uncertainty.

3. `CAL-REPORT-02` AUC-ROC Monitoring
- Time-series AUC with confidence bands via bootstrap.
- Alert on sustained AUC decline >0.03 over 2 quarters.
- Per-state AUC leaderboard and regression diagnostics.

4. `CAL-UI-01` Reliability Curve Widget
- advisor-facing reliability diagram with prediction interval shading.
- bin-level n-overlay, zoomable by state/horizon.
- drill-through to underlying bill records and feature contributions.

### Key Thresholds
- Brier score target ≤ 0.18 for high-volume states, ≤ 0.25 for low-volume.
- Reliability slope range 0.85–1.15 for well-calibrated regimes.
- AUC floor 0.70; recalibrate if AUC < 0.68 for two consecutive reporting windows.

## 4. Competitor & Landscape
- Dimensional “Reality Check” is static annual research; no live calibration.
- Common wealth platforms report return forecasts without probability calibration or public Brier tracking.
- Academic models exist for election forecasting (e.g., FiveThirtyEight Brier tracking) but not state tax rule-change forecasting.

## 5. Regulatory & Compliance Considerations
- SR 11-7: model risk management expects documented validation, including backtesting and benchmark comparisons.
- Brier/AUC reporting supports audit defense, stress-testing documentation, and model inventory.

## 6. Data Requirements
- State rule-change event labels with effective dates.
- Forecasts produced by underlying classifier outputs.
- Budget-deficit and legislative calendar features for split-sample testing.

## 7. Red-Team Edge Cases
1. Low-frequency states with unstable Brier due to regime shifts.
2. Platt scaling underfitting on skewed probabilities.
3. Temporal leakage between training and calibration sets.
4. Advisor misinterpretation of narrow confidence bands.

## 8. Delivery Checklist & Acceptance Criteria
- [ ] CAL-PROTO-01 pipeline deployed with configurable recalibration cadence
- [ ] Brier reported weekly at state and aggregate levels
- [ ] AUC trend chart live in advisor dashboard
- [ ] Reliability diagram widget (CAL-UI-01) shipped to beta advisors
- [ ] Calibration anomaly runbook created
- [ ] Compliance review completed under SR 11-7

## 9. Dependencies
- Upstream: `bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-5-1-1-2` Training-data labeling standard requires stable event labels.
- Downstream: Advisor alert thresholds (`...-1-1-4`) rely on calibrated probabilities.

## 10. Success Metrics
- Probability bins achieve reliability slope within [0.85, 1.15] for 90% of bins with n ≥ 50.
- Weighted Brier improves ≥ 0.03 after recalibration cycle.
- Zero calibration degradation alerts sustained >2 quarters without root-cause remediation.

## 11. Sources
- Gneiting, T., Balabdaoui, F., & Raftery, A. E. (2007). Probabilistic forecasts, calibration and sharpness. Journal of the Royal Statistical Society.
- Federal Reserve SR 11-7 guidance on model validation and benchmarking.
- WealthForge roadmap calibration protocol parent task (AGENDA.md entry `bpu-...-1-1-3`).# Multi-State Migratory Client Tracking (WealthForge Research)

## Topic ID
bpu-6e-4a-3d-3g-1b-2-3-5-1f-1-2-5-b-2-1-a-1-3-5-1-1-6

## What To Build
WealthForge should build a module that identifies clients who maintain residency, domicile, or asset situs across multiple states and maps them to the highest-risk tax jurisdiction for estate/inheritance filing and exposure purposes.

## Plain-English Findings
- Many high-net-worth clients split time between states (snowbirds, remote workers, families with multi-state properties, expatriate green card holders) and can inadvertently trigger filing or inheritance tax obligations in more than one jurisdiction.
- State inheritance/jurisdiction tax exposure depends on three factors: decedent domicile at death, beneficiary residency, and asset situs (real property vs. intangible).
- Clients often rely on advisors who maintain only a primary-state record; secondary-state ties go unnoticed until a death or distribution event.
- Mapping these clients continuously allows WealthForge to surface compliance gaps before an exam, beneficiary claim, or filing deadline.

## Competitors
- **eMoney / MoneyGuidePro / RightCapital / Orion**: support multi-state tax residency inputs but do not automatically flag migratory exposure or connect it to state estate/inheritance reporting requirements.
- **Addepar**: tracks multi-jurisdictional tax residency at a high level, focused on income tax, with limited cross-reference to estate/inheritance exposure.
- **Advicent**: offers multi-state tax projections for income planning but not post-mortem tracking or beneficiary jurisdiction exposure.
- **No direct competitor** currently offers a WealthForge-native multi-state migratory client tracking module tied to estate/inheritance tax.

## Regulatory Considerations
- **IRS Form 706** filings require accurate domicile and state filing determinations; failure to file where required exposes estate/inheritance executors and advisors to penalties.
- **State estate/inheritance tax nexus** rules vary widely; 17 states plus DC retain estate or inheritance taxes with different exemption thresholds, rates, and asset situs rules.
- **FATCA and FBAR** interplay affects migratory clients with foreign accounts; domicile history must be tracked for covered expatriate analysis.
- **SEC and FINRA** examiners increasingly review KYC records for multi-state complexity and prompt questions about whether advisers accounted for all state exposures.
- **State audit risk** is heightened when clients demonstrate physical presence, driver licenses, voter registration, or real property in multiple states without corresponding planning documentation.

## Recommended Architecture
1. **Client residence fingerprint**: ingest alternate state addresses, property ownership, driver license, voter registration, tax filing history, and travel/spend proxies.
2. **Jurisdiction risk scoring**: rank states where the client has nexus by severity of estate/inheritance tax and filing requirements.
3. **Event-driven alerts**: trigger on life events (death, move, asset sale, beneficiary change) with jurisdiction-specific action items.
4. **Advisor workflow**: expose migratory risk flag in client dashboard, with recommended follow-up tasks and compliance documentation.

## Data Sources To Consider
- Custodian address history, tax return data (via TaxDataLink / tax transcript client permission), property records, CRM location fields, expense and travel spend feeds, and manual override / attestation entries.

## Risks
- Over-flagging privacy-sensitive client data; must align with WealthForge demographic consent framework (`bpu-...-b-2-3-6`) and state privacy laws.
- Determining domicile is legally subjective; risk scoring should be modeled as a probability, not a conclusion, and should recommend professional legal analysis rather than declare domicile.---

## 2026-05-31 — Duty-of-segregation witness workflow for CBOR vendor-prefix policy events
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow

### Strategy & Context (Why this matters)
In event-driven and regulatory-reporting architectures that use CBOR encoding, vendor-specific prefixes and media types risk collision when multiple systems emit events into shared streams. A "duty of segregation" witness workflow is a governance pattern in which an independent witness system attests that events from a given vendor prefix were properly isolated, that no cross-contamination occurred, and that the emitter honored its regulatory duty to segregate its message space. WealthForge's prior research on CBOR vendor-prefix policy, rotation ceremonies, and WORM-sealed audit envelopes creates the exact scaffolding needed to operationalize this pattern in a wealth-management context.

### What to Build (Plain-English)
1. **Witness Attestation Service** — lightweight verifier that consumes streaming CBOR events, checks each event's vendor-prefix tag against an allowlist, and emits a signed attestation when a vendor's duty-of-segregation obligation is satisfied or violated.
2. **Prefix Allowlist Schema** — canonical representation of allowable vendor prefixes with effective dates, scope, and rotation calendar.
3. **Rotation-Retirement Ceremony Integration** — tie witness attestation to the prefix rotation lifecycle; retiring prefix cannot be decommissioned until the witness reports zero contamination in its final epoch.
4. **Audit Evidence Pack** — immutable JSON-serialized attestation log compatible with the previously researched detached-envelope format and canonical-JSON verification.

### Competitors / Landscape
- **Apache Kafka / Pulsar**: provide per-topic/tenant isolation at middleware layer only; neither vendor emits WORM-verifiable CBOR prefix attestations.
- **CNCF Wallet / COSE**: define key identification and trust anchors but no vendor-prefix segregation workflow.
- **Financial audit platforms (Workiva, ApproveForge)**: handle governance events at document level, not binary encoded event streams.
- **Custom SIEM rules**: some firms detect unauthorized prefixes via regex/logic but lack standardized CBOR vocabulary and rotation-linked ceremony workflow.

WealthForge advantage: first mover in CBOR vendor-prefix segregation witness for wealth-management event streams.

### Regulatory Considerations
- **SEC / FINRA recordkeeping** (Rule 17a-3/4, Regulatory Notices 17-50 and 21-18): immutable capture of supervisory events; segregated namespaces reduce cross-firm contamination risk.
- **Duty of segregation (Investment Advisers Act / custody rules):** client records must remain separate from adviser's own; analogous logic applies when events from multiple advisers share a reporting stream.
- **Audit attestation standards** (ISACA, AICPA, IIA): independent witness attestation required for high-risk automated controls; CBOR-encoded attestations can be hashed into a WORM store to satisfy evidence standards.

### Build Priority & Decision
- Build a standalone witness microservice (`cbor_segregation_witness.py`) reading from the event bus, validating vendor prefixes against the canonical allowlist, and producing an append-only attestation log.
- Hook into the existing rotation-retirement-ceremony work so a prefix cannot be retired without final-epoch zero-contamination certification.
- Serialize attestations with the previously designed detached-envelope + canonical-JSON schema so downstream verifiers (auditors, regulators) can confirm integrity without re-ingesting the full event stream.

### Main Risks
- **Allowlist drift**: prefix registry changes without notifying the witness. Mitigation: webhook-driven reload + periodic sync.
- **Replay after compromise**: malicious insider rotates prefix to hide contamination. Mitigation: witness signs each epoch with a time-anchored key; prior attestations remain independently verifiable.
- **Performance overhead**: verifying every event adds latency. Mitigation: sample-based verification with mandatory 100% verification at rotation boundaries.

### New Subtopics Discovered
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:witness-attestation-schema (HIGH)
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:rotation-linked-sync-gate (HIGH)
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:auditor-verification-openapi-path (MEDIUM)
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow
--- end ---
---

## 2026-05-31 — Communication Reconciliation Log Schema — Part 1: Core Record Model
**Topic:** it-4

# Communication Reconciliation Log Schema — Part 1: Core Record Model

## 1. Problem Statement

When advisors and custodians exchange settlement-override communications (early close notices, deferral approvals, rejection reasons), WealthForge must prove:
- **What was sent**, **when**, **to whom**, and **whether it was received**
- **What was changed** between versions (e.g., advisor amends a deferral request after custodian pushes back)
- **What the system did next** (retry, suppress, escalate, archive)

This is the **communication reconciliation log** — an immutable, searchable event stream that turns a messaging thread into an auditable case file.

---

## 2. Schema Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Append-only** | Regulatory bodies (SEC, FINRA) require unaltered history. WORM or blockchain-style append aligns with `custodian-calendar-overrides-4-4-compliance-retention-archive`. |
| **Event-sourced, not state-snapshot** | Store `Command → Event → Reaction` chains. Allows replay for debugging and compliance reconstruction. |
| **Deduplication-first identity** | Every event carries an idempotency key so that retries do not create phantom branches. |
| **Tenant + conversation isolation** | Multi-tenant RIA/custodian environments require logical partitioning per `client_id` / `custodian_id` / `override_request_id`. |

---

## 3. Proposed Core Schema (JSON-LD friendly)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://wealthforge.io/schemas/communication-recon-log/v1",
  "title": "CommunicationReconciliationEvent",
  "type": "object",
  "required": ["event_id", "occurred_at", "event_type", "actor", "channel", "override_request_id"],
  "properties": {
    "event_id": {
      "type": "string",
      "format": "uuid",
      "description": "Primary key — immutable once written"
    },
    "idempotency_key": {
      "type": "string",
      "description": "Client-generated; format: {override_request_id}:{actor}:{step}:{seq} for dedup"
    },
    "occurred_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO-8601 with millisecond precision; source-of-truth is server UTC"
    },
    "event_type": {
      "type": "string",
      "enum": [
        "MESSAGE_CREATED",
        "MESSAGE_DELIVERED",
        "MESSAGE_READ",
        "MESSAGE_ACKNOWLEDGED",
        "MESSAGE_REJECTED",
        "MESSAGE_RETRIED",
        "MESSAGE_SUPPRESSED",
        "VERSION_APPLIED",
        "ESCALATION_TRIGGERED"
      ]
    },
    "actor": {
      "type": "object",
      "required": ["actor_type", "actor_id"],
      "properties": {
        "actor_type": { "type": "string", "enum": ["ADVISOR", "CUSTODIAN", "SYSTEM", "COMPLIANCE"] },
        "actor_id": { "type": "string", "description": "User ID, custodian participant ID, or service account" }
      }
    },
    "channel": {
      "type": "string",
      "enum": ["EMAIL", "SECURE_MESSAGE", "API_CALL", "PORTAL_NOTIFICATION", "WEBHOOK"]
    },
    "override_request_id": {
      "type": "string",
      "description": "FK to settlement-override aggregate; the case this event belongs to"
    },
    "conversation_id": {
      "type": "string",
      "description": "Groups related events into one thread; changes when a new deferral cycle starts"
    },
    "version": {
      "type": "integer",
      "description": "Monotonic per-conversation counter; incremented on retry/branch"
    },
    "parent_event_id": {
      "type": ["string", "null"],
      "format": "uuid",
      "description": "FK to prior event; null only for root MESSAGE_CREATED"
    },
    "payload_hash": {
      "type": "string",
      "description": "SHA-256 of canonical JSON payload; integrity anchor"
    },
    "legal_hold": {
      "type": "boolean",
      "default": false,
      "description": "If true, retention schedule excludes automatic purge"
    },
    "jurisdiction_tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "e.g. ['SEC', 'FINRA', 'NY', 'IL'] — drives retention policy"
    },
    "metadata": {
      "type": "object",
      "description": "Open-ended bag for custodian-specific fields; must not contain PII"
    }
  }
```

### Key Fields Explained

| Field | Why It Exists |
|-------|---------------|
| `idempotency_key` | Prevents duplicate branches on retry; required by FINRA Rule 4530(b)(6) accurate books-and-records. |
| `parent_event_id` | Builds the directed acyclic graph of the conversation. Enables diff-based summaries (schema Parts 2–3). |
| `conversation_id` | Groups the request/response cycle. Advisor amending a request gets a new `version` but same `conversation_id`. |
| `payload_hash` | Cheap integrity check before expensive WORM write. |
| `legal_hold` + `jurisdiction_tags` | Drives retention/write-once behavior without embedding policy code in the log writer. |

---

## 4. Indexing and Query Patterns

### 4.1 For Advisor UX
```sql
-- Show full thread for one override request, newest first
SELECT * FROM comm_recon_log
WHERE override_request_id = 'REQ-2026-XXXX'
ORDER BY version DESC, occurred_at ASC;
```

### 4.2 For Compliance Audit
```sql
-- Reconstruct exact timeline with actor identity for a regulatory request
SELECT occurred_at, actor_type, actor_id, event_type, channel, payload_hash
FROM comm_recon_log
WHERE override_request_id = ? AND legal_hold = true
ORDER BY occurred_at;
```

### 4.3 For Deduplication / Retry Debugging
```sql
-- Detect phantom retries (same idempotency key, different event_id)
SELECT idempotency_key, COUNT(DISTINCT event_id) AS branches
FROM comm_recon_log
GROUP BY idempotency_key
HAVING branches > 1;
```

### 4.4 For Daily Reconciliation Job
```sql
-- Events missing expected counterpart for today's run
SELECT crl.override_request_id, crl.event_type
FROM comm_recon_log crl
LEFT JOIN settlement_overrides so ON so.id = crl.override_request_id
WHERE crl.occurred_at >= CURRENT_DATE
  AND so.status NOT IN ('SETTLED', 'CANCELLED');
```

---

## 5. Competitors & Market Landscape

| Competitor / Tool | Approach | Gap vs. WealthForge |
|-------------------|----------|---------------------|
| **Stripe Idempotency Keys** | Client-generated idempotency keys stored for 24h; returns 200 for duplicate POSTs. | Stateless, short-lived. No long-term reconstruction, no legal-hold branching. |
| **Swimlane / Exabeam UEBA** | Security-event schemas with parent_event_id chains. | Security-focused; no financial instrument context, no custody-feed correlation. |
| **DTCC / Custodian Event Logs** | SWIFT gpi, DTCC GIVES event streams. | Carrier-controlled; advisor cannot query end-to-end. Proprietary formats. |
| **ACTION (FINRA)** | Order-management audit schemas (Order Capture, Execution). | Limited to equity/options lifecycle; no settlement-override branch modeling. |

**WealthForge differentiation:** The schema above unifies **advisor workflow**, **custodian calendar override**, and **compliance retention** in one event graph. No competitor provides *advisor-controlled* end-to-end reconstruction of settlement-override communications with built-in retention jurisdiction tagging.

---

## 6. Regulatory Considerations

| Regime | Requirement | Schema Mapping |
|--------|-------------|----------------|
| **SEC 17a-4 / 17a-3** | Books and records for 3–6 years; immediately accessible. | `legal_hold`, `payload_hash`, `occurred_at`, `actor`. WORM storage per `custodian-calendar-overrides-4-4-compliance-retention-archive` research. |
| **FINRA Rule 4530** | Record complaints, arbitration settlements, and supervisory reviews. | `jurisdiction_tags` triggers FINRA 6-year flag; `actor_type = COMPLIANCE` routes to supervisory review queue. |
| **MiFID II Art. 16(7)** | Record communications "related to orders" for 5 years. | `channel` enumeration; `override_request_id` links to order lifecycle if mapped later. |
| **NY DFS 500 / IL BIPA** | Notification of unauthorized access; data-minimization. | `metadata` must be PII-free; breach alerting should scan `actor_id` exposure paths only. |
| **Bank Secrecy Act / OFAC** | Retain records that could relate to sanctions screening. | `legal_hold` overrides purge schedules; `occurred_at` timezone preservation matters for extraterritorial clients. |

### Common Pitfalls to Avoid
1. **Embedding PII in event payloads** — store only hashes or FK references; keep client name/SSN in separate access-controlled store.
2. **Using auto-increment IDs only** — if storage is sharded or moved, sequential IDs leak. UUID v7 or `{ts}-{node}-{seq}` is audit-friendlier.
3. **Time-sync ambiguity** — require NTP-synchronized server timestamps; reject client-supplied `occurred_at` for financial events.

---

## 7. Recommended Implementation Roadmap

### Phase 1 — Event Capture (MVP, 2–3 weeks)
- Define `Command → Event` mappers for the 5 core override comms channels.
- Persist events via `append_entry()` from `append_research.py`-style writer into `comm_recon_log` table or S3-like object store.
- Emit `payload_hash` using SHA-256 over `actor_id` + `channel` + `body` + `ts`.

### Phase 2 — Replay & Audit UI (3–4 weeks)
- Build `/override/{id}/timeline` endpoint returning ordered `version` chain.
- Add diff rendering: highlight `VERSION_APPLIED` events to show what changed between advisor attempts.

### Phase 3 — Reconciliation Nightly Job (2 weeks)
- Cross-reference `comm_recon_log` against `settlement_overrides` to flag missing ACKs or orphaned retries.
- Integration point with `custodian-calendar-overrides-4-4-reconciliation:daily-reconciliation-job`.

### Phase 4 — Policy Hardening (2 weeks)
- Attach `legal_hold` and `jurisdiction_tags` from pre-existing `compliance_retention_archive` records.
- Enable WORM sealing per-partition (e.g., quarter-sharded S3 Object Lock or PostgreSQL `pg_repack` + append-only table).

---

## 8. New Subtopics Emerging from This Research

While refining the schema, the following granular items surfaced. Recommend promoting them as `[⏳]` children of `custodian-calendar-overrides-4-4-reconciliation:communication-reconciliation-log-schema`:

- **communication-reconciliation-log-schema-1a: Event-sourcing store selection and access-pattern analysis** — Compare append-only object store (S3/Glacier), time-series DB (TimescaleDB), and event log (Kafka compacted topics).
- **communication-reconciliation-log-schema-1b: Payload canonicalization and hash-chain specification** — JSON canonicalization rules (JCS), key ordering, null handling, and Merkle-sealing rollup for quarterly integrity proofs.
- **communication-reconciliation-log-schema-1c: PII boundary enforcement and redaction policy** — Regex / classifier-based redaction pipeline before WORM write; audit log of redaction decisions.

---

## 9. Summary

**What to build:** An append-only, event-sourced communication log with idempotency keys, parent links, jurisdiction-driven retention, and cheap integrity hashing. Start with MVP event capture, then layer replay UI, nightly reconciliation, and policy hardening.

**Competitive advantage:** Advisor-controlled end-to-end audit trail for settlement-override communications — a category no custodian or UHNW platform currently offers in consumable form.

**Regulatory considerations:** SEC / FINRA multi-year WORM retention, MiFID II 5-year comms archive, NY/IL breach handling, and strict PII avoidance. The schema is designed so that retention behavior shifts via policy flags rather than code changes.
Research appended for it-4
--- end ---
---

## 2026-05-31 — audit-ready-rotation-journey-mapper:audit-ready-rotation-journey-mapper
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:audit-ready-rotation-journey-mapper

## Overview
`audit-ready-rotation-journey-mapper` focuses on creating an end-to-end, auditor-readable record of every vendor CBOR prefix rotation ceremony as it advances through state-machine stages and supporting phases such as approval, dual-write, verification, and retirement.

## What to build
- Ceremony journey manifest schema covering proposal, approvals, dual-write window, verification samples, retirement timestamp, and rollback evidence.
- Ledger-style export rendering the state-machine lifecycle in a format that matches the existing `auditor-readable-allowlist-template`.
- Region-scoped journey views mapping both success paths and failure-/rollback paths, so auditors can inspect what happened in each locality.
- Integration hooks into `rotation-automation-sdk` and `duty-of-segregation-witness-workflow` so ceremony steps update the journey manifest automatically rather than through manual annotations.

## Competitors and analogues
- **HashiCorp Vault / cert-manager rotation flows:** offer ceremony-like rollouts with rollback states, but expose auditor-facing dashboards and export formats only secondarily.
- **PKI ceremonies (government/private CA):** document key ceremonies with co-signatures; closest analog for attestation requirements. Still usually document-ledger or PDF-based rather than machine-readable journey manifests.
- **OpenTelemetry semantic convention changelogs:** track schema deprecation in public GitHub issue timelines, lacking approval gates, secret/state acceptance proofs, or region views.
- No direct audit-export product exists that ties rotating vendor prefixes to a structured, region-scoped, exportable journey manifest for financial-compliance reviewers.

## Regulatory considerations
- **SOX/financial audit integrity:** requires evidence that both old and new prefixes existed in active and staged sets at dual-write boundaries, with named approvers and timestamps.
- **PCI-DSS critical security control change:** prefix rotation is a control-plane change; evidence must include scope impact and approval before production emission begins.
- **ISO 27001 change management (Annex A 12.1.2):** documentation must record the change request, approvals, back-out plan, and peer review; the journey manifest can become the canonical record.
- **MiFID II / transaction reporting evidence retention:** journey manifests should be archiveable for 5+ years and support examination retrieval by prefix, region, and ceremony id.

## New subtopic leads
- journey-manifest-state-transition-schema (HIGH)
- regional-diff-merge-alert-for-journey-evidence (HIGH)
- witness-attestation-merge-into-journey-manifest (MEDIUM)
- pdf/markdown export adapter for auditor-readable journey bundle (MEDIUM)

## Blockers / open questions
- `auditor-readable-allowlist-template` must be finalized so this journey manifest export can match its terminology and layout.
- Journey manifest schema must be aligned with `rotation-automation-sdk` ceremony events to avoid duplication or drift.
- Legal/regulator review should confirm that “journey map” naming satisfies examination expectations versus traditional “rotation evidence pack.”
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:audit-ready-rotation-journey-mapper
--- end ---
---

## 2026-05-31 — Bounded retry budget and backoff policy engine
**Topic:** esta-2b-1a-3-5-sub-3-2c-3

# Research: esta-2b-1a-3-5-sub-3-2c-3 — Bounded retry budget and backoff policy engine
## Key findings

- Purpose: enforce a bounded retry budget for multi-channel alert dispatch so privilege-bound notifications do not spam regulated messages or exhaust downstream rate limits.

## What to build

- Retry budget model: per-client, per-chapter, or per-message-type budgets with configurable caps and time windows.
- Backoff policy engine: jittered exponential backoff with escalation rules; avoids thundering herd during partial outages.
- Priority-class gating: privilege-class buckets get separate budgets so SEC/fiduciary or UHNW messages do not starve or get blocked by lower-priority retries.
- Safety controls: circuit breaker, max-burst limiter, and escalation path to human operator when budget is exhausted.

## Competitors

- Wealth platforms do not expose retry budgets as a documented alert infrastructure primitive.
- Standard Twilio/SendGrid/Resend rate-limiting is implemented by code, not as a configurable WealthForge-alert domain primitive.

## Regulatory considerations

- Critical alert retention: retained message delivery receipts must remain auditable even after retries stop.
- Regulator expectation: continuous monitoring of failed alerts is implied by best-practice SLA frameworks; WealthForge should prove finite retry and explicit failover for examiners.

## New sub-topic

- `esta-2b-1a-3-5-sub-3-2c-3a`: IAM-annotated retry damping policy — link retry rate to client privilege tier and channel capacity.
Research appended for esta-2b-1a-3-5-sub-3-2c-3
--- end ---
---

## 2026-05-31 — Cross-border Social Security totalization decision engine
**Topic:** it-4

# RESEARCH: it-4 — Cross-border Social Security totalization decision engine

**Date:** 2026-05-31

## What to Build

A totalization decision engine that:
- Maps client nationality/residency -> applicable SSA totalization treaty
- Determines Certificate of Coverage (Form SSA/CG 21) eligibility and workflows
- Calculates self-employment (SE) Social Security tax exposure before/after treaty
- Projects benefit protection impact of divided careers

Key product requirements:
- **Country lookup:** U.S. totalization agreements currently cover 30 countries (as of 2026), including Italy, Germany, Switzerland, Canada, France, Japan, Chile, Brazil, and more.
- **Certificate of Coverage workflow:** Determine whether the U.S. or host country covers the work, then trigger the SSA online application or denial path. Track issuance and renewal.
- **SE tax exposure analysis:** Compute 15.3% U.S. SE tax plus host-country social charges. Compare with and without totalization relief.
- **Benefit gap analysis:** Show years credited in both systems and identify gaps in protection.

## Competitors / Landscape

- **SSA International Programs:** Primary government source; status tables, agreement descriptions, and online Certificate of Coverage portal (`opts.ssa.gov`).
- **Tax preparation platforms:** Do not own this workflow. Most expat tax software handles foreign earned income exclusion or FEIE, but SSA totalization is separate and undertooled.
- **Global mobility / GEO providers:** Companies like Safeguard Global, Remote, Deel handle payroll compliance, so they solve dual-taxation at the corporate payroll layer, but not at the advisor/client financial planning layer.
- **Opportunity:** WealthForge would be the first RIA/wealth platform to embed totalization decisioning with retirement projection, giving RIAs a differentiated offering for U.S. expat and internationally mobile clients.

## Regulatory Considerations

- **SSA Totalization Agreements:** Bilateral treaties that coordinate Social Security coverage. Purpose: eliminate dual taxation and fill benefit gaps for split careers.
- **IRS Interaction:** Totalization status affects self-employment tax under IRC §1401 and can change Form SE filing. Some countries also impose employer-side social charges.
- **Certificate of Coverage:** Form SSA/CG 21 / online application through `opts.ssa.gov`. Employers/Self-employed must carry proof of coverage in the host country to avoid double payment.
- **State/Local Impact:** In countries without totalization, clients may face social charges plus U.S. SE tax, substantially reducing after-tax income and retirement savings.
- **Client Vulnerability:** Self-employed expats and digital nomads in non-treaty countries face the highest exposure (15.3% + host country charges), making this a high-value advisor tool.

## UI / Integration Notes

- **Primary widgets:** Treaty Lookup, Certificate Tracker, SE Tax Calculator, Benefit Impact summary.
- **Trigger points:** International onboarding, annual tax review, self-employed income detection, relocation workflow.
- **Cross-references:** IT-MOD-5 retirement planner, IT-MOD-1 domicile/residency scoring, spec-02 tax specialist.
Research appended for it-4
--- end ---
---

## 2026-06-01 — Auditor-Readable Allowlist Template for CBOR Vendor Prefix Policy
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:whitelist-ci-gate:auditor-readable-allowlist-template

# Auditor-Readable Allowlist Template for CBOR Vendor Prefix CI Gate

## Summary
This research documents standard patterns for publishing a human‑auditable allowlist of CBOR/COSE media‑type vendor prefixes, OIDs, and extension labels that may pass the CI gate. The recommended approach is an in‑repo, schema‑validated JSON document plus an audit log append‑only record, rendered into Markdown/HTML for reviewers.

## What To Build
- **Allowlist JSON schema** (`cbor-vendor-allowlist.json`) with:
  - `prefix` / `label` / `mime_type` + `owner` / `scope` / `expires`
  - `ci_gate_status` (`allow`/`deny`/`review`)
  - `last_attestation` hash + signer identity reference
- **Render/publish step** that converts the JSON into a frozen audit document:
  - Markdown table sorted alphabetically, with invalid/experimental rows highlighted.
  - HTML/PDF optional for offline delivery.
- **Gitops policy gate** that rejects vendor types outside the allowlist at CI time and attaches a human‑readable diff to PR comments.

## Competitors / Industry Patterns
- Microsoft CBOR/COSE tools expect stable, well‑known labels but do **not** enforce a standardized vendor allowlist artifact.
- CoAP/IANA registry conventions for “application/cose; cose-type=” string parameters.
- Supply‑chain allowlist patterns from Kubernetes Policy Controller and OPA Gatekeeper are the closest analogues.
- Audit‑export formats used in PKI Certification Practice Statements (CPs) Appendixes align with “auditor‑readable” requirements.

## Regulatory / Compliance Considerations
- **Auditor readability**: choose deterministic serialization (JSON Schema + JCS) so derived artifacts are reproducible.
- **Retention / immutability**: combine with append‑only audit log (see `prefix-collision-legal-evidence-format`) to prove each change was attested.
- **Jurisdictional tolerance**: the presented table should separate “active / experimental / revoked” per IANA conventions to counter claims of unmanaged exposure.

## Recommendations
1. Keep canonical source of record as `cbor-vendor-allowlist.json` with an XSD/JSON‑Schema file alongside it.
2. Publish derived outputs under both `site/registry/` for online review and `.pdf/.html` for offline evidence packs.
3. Link attestation hashes into the `prefix-collision-legal-evidence-format` bundle for traceability.
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:whitelist-ci-gate:auditor-readable-allowlist-template
--- end ---
