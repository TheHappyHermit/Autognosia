---
name: wealthforge-research-format
description: Research entry format for WealthForge AI — write comprehensive, buildable research entries that exceed existing codebase research quality. Format has evolved from 12 to 15 sections to accommodate complex UHNW topics.
category: software-development
---

# WealthForge Research Format

## The Evolved Research Entry Format

Every research entry must follow this structure. The format has evolved from a rigid 12-section format to a flexible 12-15 section structure. **Section count is determined by topic complexity.** Use all 15 sections for UHNW complex topics (PPLI, QSBS stacking, deferral strategies, legislative risk). Use 12 sections for simpler topics (retirement planning, state tax, competitive analysis).

### 12-Section Core (always present)

| # | Section | Purpose |
|:-:|:--------|:--------|
| 1 | Topic Overview | Industry landscape, key players, market data, why this matters for WealthForge |
| 2 | Problem / Gap | Specific gap in current solutions — what existing platforms fail to address |
| 3 | Core Analysis | Key data, formulas, benchmarks, regulatory thresholds — the facts |
| 4 | Competitive Landscape | Which platforms address this, how, and where they fall short (use `competitive-table-pattern.md`) |
| 5 | Design / Build Spec | Pseudocode, data models, algorithms — what to BUILD, not what exists |
| 6 | UI/UX Design | Widget designs, component specs, user flows |
| 7 | Regulatory & Compliance | Legal requirements, SEC/FINRA rules, fiduciary implications |
| 8 | Architecture / Data Model | Database schema, API design, integration points |
| 9 | Edge Cases / Red Teaming | Edge cases, failure modes, adversarial scenarios |
| 10 | Implementation Priorities | Priority table (HIGH/MEDIUM/LOW) with effort and impact estimates |
| 11 | Key Sources | 15-18 minimum. Prioritize: primary sources (SSA, IRS, SEC) > industry reports > practitioner analysis > vendor docs |
| 12 | New Topics Discovered | 3-5 new `[⏳]` topics to add to AGENDA.md |

### Sections 13-15 (add for complex UHNW / legislative / multi-strategy topics)

| # | Section | When to Add | Purpose |
|:-:|:--------|:----------|:--------|
| 13 | Quantitative Example | When the topic involves financial modeling, tax alpha, or numerical analysis | Walk through a concrete client scenario with numbers |
| 14 | Integration with Existing Modules | When the feature connects to other WealthForge systems | Document how this integrates with prior research entries |
| 15 | Summary | Always include | Key findings (numbered), competitive advantage statement, priority assessment |

### When to Use 12 vs 15 Sections

- **12 sections:** Simple topics (state tax conformity, competitive analysis, single-strategy research)
- **15 sections:** Complex topics (UHNW strategies, legislative risk, multi-strategy interactions, PPLI/QSBS/QOF)
- **Rule of thumb:** If the entry has a quantitative example, integration section, or needs a summary, use 15 sections.

#### Exception for full-stack operational topics
When the topic is an API, event contract, audit/schema, or broker/infrastructure boundary, also use the full 15-section format even if the subject is not UHNW. The same requirements apply: concrete API/data-model detail, red-team edge cases, implementation priority table, integration map, quantitative sizing, and competitive statement. Do not downgrade operational/system topics to 12 sections.

## New Topic Discovery Method (Section 12)

When generating new `[⏳]` topics, use these 5 decomposition angles:

1. **Sub-feature breakdown** — What sub-capabilities exist within this feature? (e.g., Roth conversion → backdoor, mega backdoor, on-plan, in-plan)
2. **Edge case expansion** — What special cases exist? (e.g., military pensions, dual domicile, part-year residents)
3. **Cross-role impact** — Which other employee roles touch this? (e.g., compliance officer, investment committee)
4. **Competitor gap** — What do competitors NOT do here? (the pure WealthForge opportunity)
5. **Adjacent domain** — What related area should be researched next? (e.g., LTCG harvesting → bracket-filling → tax-loss harvesting)

Each new topic gets: `||||- [⏳] **topic-id: Short Description** — One-sentence context. Cross-ref: related topics. Priority.`

## Writing Quality Standards

- **Concrete over abstract:** Every recommendation must specify exact formulas, thresholds, or data structures
- **Buildable:** Section 5 (Build Spec) must contain pseudocode or data models that a developer can implement without further research
- **No fluff:** Every sentence must answer "what would we build?" or "what data do we need?"
- **Source hierarchy:** Government > peer-reviewed > practitioner > vendor > blog
- **Length:** Minimum 3,000 words per entry for complex UHNW topics; minimum 2,000 words for simpler topics. If shorter, you haven't dug deep enough
- **Cross-references:** Link to related entries in RESEARCH.md and AGENDA.md
- **Competitive advantage statement:** Every entry must explicitly state what existing platforms (eMoney, MoneyGuidePro, RightCapital, Orion, Addepar) do NOT do here

### When NOT to Use This Format

- When the topic is a person (use the researcher deep-dive pattern in `references/researcher-deep-dive-pattern.md`)
- When researching a specific article (use the standard format but focus on extracting the article's unique contribution)
- When the topic is purely technical infrastructure (use the `spike` skill for proof-of-concept work)

## REQUIRED SOURCES by Domain

These are the source hierarchies for each research domain. See the corresponding reference file in `references/` for the full methodology:

### Retirement & Tax Planning
- **Primary:** IRS publications, SSA POMS, DOL regulations, SEC filings
- **Secondary:** Kitces.com, Morningstar, CFA Institute, Journal of Financial Planning
- **Tertiary:** Industry reports (Investment Company Institute, Federal Reserve Survey), academic papers
- **Reference:** `ss-research-pattern.md`, `50-state-tax-research-pattern.md`, `stealth-tax-crossover-zone-pattern.md`

### Insurance & Annuities
- **Primary:** State DOI regulations, NAIC reports, carrier financial statements (AM Best)
- **Secondary:** Annuity.org, ValuePenguin, White Coat Investor, Kitces
- **Tertiary:** Academic papers on annuity pricing, carrier dividend history
- **`references/state-insurance-premium-tax-ppli.md`** — 50-state life insurance premium tax rates for PPLI, key domicile states, monitoring framework, competitive landscape (zero platforms provide this). Load when researching any PPLI, uhnw-01d-1a-1-2c-7*, or insurance tax topic.
- **`ppli-carrier-monitoring` skill (domain: PPLI carrier health monitoring)** — Load this skill for Bermuda PPLI carrier CSM/DAC monitoring, SAC-level analysis, and UHNW insurance wrapper research. Includes CSM floor proximity metrics (CFPR/CDR/CFD/SCCS), alert tiers, data sources, and competitive landscape. Load when researching any uhnw-01d-1a-1-2c-7e-4b-* topic or PPLI carrier health.

### State Estate Tax & Cliff Detection
- **Primary:** ACTEC State Death Tax Chart, state DOI announcements, Key Bank State Summary
- **Secondary:** State tax attorney analysis, Kiplinger, SmartAsset state guides
- **Tertiary:** CRS reports, Forbes, Wealthspire
- **Reference:** `state-estate-tax-cliff-key-data.md` — 2026 canonical dataset: 14 cliff states with exemption amounts, cliff types (FULL/PARTIAL_105), rates, portability status, gift clawback rules, and planning implications. Load before sdli-4, spec-01-5, or any survivorship policy sizing research.

### Education Planning (529)
- **Primary:** IRS Code Section 529, state 529 plan documents, SECURE 2.0 text
- **Secondary:** 529.com, SavingForCollege, college board, state treasurer pages
- **Tertiary:** FAFSA documentation, CSS Profile requirements
- **Reference:** `529-plan-key-data.md`

### Relocation & State Tax
- **Primary:** State tax codes, PL 104-95 (4 U.S.C. § 114), IRS publications
- **Secondary:** State tax board guidance, tax attorney analysis
- **Tertiary:** Relocation industry reports, cost-of-living databases
- **Reference:** `pl10495-state-tax-relocation.md` — PL 104-95 rules for military and multi-state tax relocation
- **Reference:** `state-domicile-optimization-key-data.md` — Dual-track residency system (domicile intent + 183-day statutory test), tiebreaker rules (10-step hierarchy), 50-state tax burden database (origin/destination states), breakeven NPV calculator, compliance documentation timeline, aggressive audit state data sources, competitive landscape. Load when researching any uhnw-01d-1a-1-2c-5 topic or state domicile optimization.
- **`references/obbba-cma-provider-impact-data.md`** — OBBBA impact on CMA provider assumptions: 13-provider responsiveness tracker (who updated, who didn't, who updated implicitly), withdrawal plan impact quantification (-0.3% to -0.5% for 60/40 portfolios), staleness alert thresholds, withdrawal strategy sensitivity matrix. Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7 topic or CMA provider governance.
- **`references/obbba-state-decoupling-tracker.md`** — OBBBA state-by-state decoupling status (17+ states as of May 2026). Use when researching state tax topics to determine if client's domicile state conforms to federal OBBBA provisions.
- **`references/obbba-scenario-toggle-system.md`** — OBBBA scenario toggle system (wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7a): 3 legislative scenarios, 16 toggleable provisions, delta analysis engine, 5 client-facing widgets, competitive landscape (zero competitors offer this). Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7* topic.

### Competitive Landscape
- **Primary:** Vendor documentation, product demos, G2/Capterra reviews
- **Secondary:** Advisor blogs, Kitces blog, Morningstar advisor articles
- **Tertiary:** Industry analyst reports (Brendan McGoldrick, David Wood)
- **Reference:** `wealthtech-competitive-analysis-pattern.md`

### Legislative / Deferral Strategy Research
- **Primary:** Congress.gov, JCT scorecards, CBO budget projections, CRS reports
- **Secondary:** Tax Foundation, Katten, Sidley, Grant Thornton practitioner analysis
- **Tertiary:** Legislative tracking (LegiScan, StateScape), advocacy group statements
- **Reference:** `legislative-correlation-matrix.md` — LCM domain knowledge: 4-package taxonomy, 6x6 correlation matrix, systemic risk formula, dynamic adjustments, 2026 legislative events. Load when researching uhnw-01d-1a-1-2a-* or legislative risk topics.
- **Reference:** `legislation-monitoring-data-sources.md` — 3-layer monitoring stack data sources (LegiScan API, state direct feeds, professional services), competitive legislative tracking platforms (BillTrack50, GovHawk, State Net, MultiState), implementation priority tiers, and WealthForge competitive gap analysis. Load when researching uhnw-01d-1a-1-2c-2 or any legislative monitoring architecture topic.
- **Reference:** `wyden-ppli-abuse-act-data.md` — S.4279 key data: no grandfathering, 180-day transition, 25-investor carve-out, FATCA expansion, state IPT rates, passage probability (~66.5%), tax impact modeling, competitive landscape. Load when researching any uhnw-01d-1a-1-2c-7e-2* or Wyden PPLI topic.

### Peer-to-Peer Lending
- **Primary:** SEC Regulation crowdfunding rules, state securities regulations
- **Secondary:** Fundera, LendingClub docs, industry reports (IBISWorld)
- **Tertiary:** Academic papers on P2P lending risk models
- **Reference:** `novel-domain-research-pattern.md`

### Private Equity / Venture Capital
- **Primary:** SEC Reg CF/Reg A+/Reg D rules, IRS rules for K-1 taxation
- **Secondary:** Preqin, PitchBook reports, industry whitepapers
- **Tertiary:** Academic papers on private markets performance
- **Reference:** `novel-domain-research-pattern.md`

### Employee Role Research
- **Primary:** O*NET, BLS Occupational Outlook Handbook, industry job descriptions
- **Secondary:** Professional association standards (CFP Board, CFA Institute)
- **Tertiary:** Software vendor claims, competitor feature matrices
- **Reference:** Use `wealthforge-employee-role-research` skill (9-section format)
- **`references/ria-advisor-onboarding-workflow.md`** — The 7-step client onboarding workflow, RIA tech stack architecture (8-15 tools per firm), planning software competitive landscape (eMoney 35.6%, MoneyGuidePro 24.2%, RightCapital 21.4%), WealthForge integration opportunities (RightCapital plugin priority), and regulatory considerations. Load when researching any er-* Employee-Roles topic, RIA advisor workflow, financial planning software competitive analysis, or advisor technology stack.
- **`references/ria-advisor-reporting-workflow.md`** — RIA reporting workflow domain knowledge: quarterly performance reporting, tax reporting, exit tax tracking (§877A), PPLI reporting gap (zero competitors), competitive landscape of RIA reporting platforms (Orion, Black Diamond, Addepar, RightCapital, eMoney), WealthForge reporting architecture (6 modules), and regulatory considerations (SEC Marketing Rule, FINRA 2111, state insurance). Load when researching any er-03 or RIA client reporting topic.

## Critical Pitfalls

### OBBBA Change Matrix (MUST CHECK FIRST)
Before researching ANY tax, retirement, or charitable topic, check `references/obbba-change-matrix.md`. The One Big Beautiful Bill Act (July 2025) changed rules across 10+ domains. Producing stale findings is the #1 error.

### AGENDA.md Update Patterns
AGENDA.md is now 1,800+ lines. Use the patterns in `references/agenda-update-patterns.md` for line-based insertion. The `patch` tool cannot reliably handle files this large. See `wealthforge-research-run` skill for the full procedure.

### Unicode / Emoji Pitfalls
Unicode emoji characters (`✅`, `⏳`, `🔴`, `🟠`, `🟢`) in Python strings within `execute_code` cause `SyntaxError`. See `references/unicode-pitfalls-python.md` for escape sequences. Never embed these emojis in Python string literals.

### Code-Block Writing Pitfalls
When writing research entries containing code blocks, JSON, or complex markdown to RESEARCH.md or EMPLOYEE-ROLES-RESEARCH.md via `execute_code`, triple-quoted strings exceeding ~25KB may fail. See `references/unicode-pitfalls-python.md` and `wealthforge-research-run` skill for the temp-file pattern.

### CRITICAL: RESEARCH.md Append Safety (Run 845 lesson)
`write_file` ALWAYS overwrites — it does NOT append. This has caused 3+ data loss incidents (Runs 788, 845, Run 868). Even after skills were created documenting this, the agent still used `write_file` on RESEARCH.md in Run 845, losing ~1,392 lines. In Run 868, a sibling subagent overwrote RESEARCH.md while this agent was writing, losing the prior identifiability diagnostics entry (~100 lines) that had to be reconstructed from AGENDA.md summaries.

**Never use `write_file` on any RESEARCH.md file.** Always use:
```python
# Safe append via Python
with open('/home/josh434/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md', 'a') as f:
    f.write(content)
```
or
```bash
cat << 'EOF' >> ~/path/to/RESEARCH.md
[content]
EOF
```

### Concurrent Write Protection (Run 868 lesson)
When running as a cron job or in parallel with other agents, RESEARCH.md can be overwritten by sibling agents. Mitigations:
1. **Read before write**: Always read the current content of RESEARCH.md before appending to verify nothing changed
2. **Use temp files**: Write your entry to a temp file first, then append in one atomic operation
3. **Check file timestamps**: If the file was modified by another process, your write may silently overwrite their work
4. **Prefer `write_file` for your OWN entries**: Write new entries to their own files in `research_outcomes/` (e.g., `research_entry_<topic-id>.md`) rather than appending to the monolithic RESEARCH.md — this avoids the concurrent write problem entirely

### Large Content Append Pattern (RESEARCH.md)
For research entries exceeding 25KB, do NOT use triple-quoted strings in `execute_code`. Instead:
1. Write content to a temp file: `write_file('/tmp/research_entry.md', content)`
2. Append via Python: `open(RESEARCH_PATH, 'a').write(open('/tmp/research_entry.md').read())`
3. Delete temp file: `os.remove('/tmp/research_entry.md')`
This avoids Python string size limits and is the only reliable method for full 12-section research entries.

### File Size Monitoring
AGENDA.md > 500KB: use offset/limit for reads. RESEARCH.md and EMPLOYEE-ROLES-RESEARCH.md are multi-MB — NEVER use `write_file` on them, only Python `open(file, 'a')` for append. See `wealthforge-research-run` skill for the full size monitoring table.

### web_extract Failures
Tavily extract fails on PDFs, heavy JS pages, and anti-bot sites. See `references/web-extract-total-outage-protocol.md` for the full outage protocol. Always have a fallback: `web_search` for alternative URLs, or `browser_navigate` for JS-rendered pages.

### Parallel Research
When researching a topic that spans multiple domains (e.g., tax + insurance + retirement), run parallel `web_search` queries for each domain simultaneously rather than sequential. This is critical for topics that touch IRMAA + LTCG + SS taxation (the "triple interaction").

## Reference Files Index

### Research Patterns (load before starting research in that domain)
- `12-section-template.md` — Full template with quality checklist
- `competitive-table-pattern.md` — Competitive landscape table format
- `contested-topic-handling.md` — When credible sources disagree
- `canonical-data-model-research-pattern.md` — Synthesizing data models from APIs
- `canonical-data-product-research-pattern.md` — Populating production databases
- `cross-role-xr-research-pattern.md` — Cross-role (XR) research format
- `novel-domain-research-pattern.md` — Zero-existing-software coverage topics
- `short-file-improvement-pattern.md` — Replacing undersized entries
- `apparent-equivalence-trap.md` — Avoiding false-equivalence analysis

### Competitive Landscape References (load when researching software gaps)
- **`references/ria-ai-memo-generation-competitors.md`** — No RIA platform offers AI-powered investment memo generation. Competitor profiles: DiligenceVault (institutional allocators, alternatives-focused), Tentt (PE/VC, general-purpose AI), AlphaSense (research-only). WealthForge white space opportunity. Load when researching inv-03 (Investment Analyst) or any RIA software gap topic.
- **`references/impact-investing-model-portfolio-framework.md`** — Impact investing domain knowledge: GIIN market data ($1.164T AUM, 21% CAGR), IRIS+ framework (2,500+ metrics), SDG alignment methodology, BlueMark/MSCI/Sustainalytics comparison, RIC impact evaluation framework, impact-return frontier visualization, client-impact matching algorithm, SEC greenwashing enforcement for impact claims, INV-05-6 widget specs. Load when researching inv-05-6, inv-05-6-*, or any impact investing topic at RIAs.

### Quick-Reference Data (load when relevant to current topic)
- **`references/fls-validation-methodology.md`** — FLS (Financial Literacy Score) three-phase validation framework (known-group, outcome-based, convergent), psychometric benchmarks (Cronbach's alpha ≥0.70, test-retest r≥0.70), A/B testing framework comparing FLS vs AUM tiering across 1,000+ clients. Load when researching any fLS-related topic, client sophistication tiering, or financial literacy assessment.
- **`references/qbss-stacking-domain-knowledge.md`** — QSBS stacking strategies, OBBBA changes ($15M per-issuer cap, $75M asset threshold, new exclusion percentages), IRC §643(f) trust aggregation limits, competitive landscape (ZERO platforms track QSBS). Load when researching any qbss- or business-exit tax planning topic.
- **`references/uhnw-client-archetype-framework.md`** — Five UHNW client archetypes (business exit founder, multi-gen family, international holder, PE investor, philanthropic builder) with trust types, CMA modifications, liquidity constraints, and competitive white space. Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-4a-2c-* topic or UHNW client planning.
- **`references/ria-service-tier-it-analysis.md`** — RIA service model (fee-only vs fee-based vs commission-based) IT analysis framework: 6-tier classification, tech stack complexity scores, compliance cost multipliers ($2.5K-$8.5K/employee/yr), dual-registration penalty (1.3×, $50K-$150K/yr add-on), MSP pricing by tier, service model transition cost calculator. Load when researching any bo-01-14-* (IT staffing), IT infrastructure, or compliance technology topic where the firm's service model affects the answer.
- `buy-sell-trigger-event-detection.md` — Trigger event types with probability tables, market data (33M businesses, 65% have agreements), detection lag analysis, competitive landscape (ZERO platforms provide automated detection), revenue opportunity ($20K-$80K per event), post-Connelly impact, IRC sections. Load when researching any bp- (business protection) topic related to trigger events, succession planning, or business owner exit strategies.
- `2026-irmaa-bracket-reference.md` — 2026 IRMAA brackets all filing statuses
- `529-plan-key-data.md` — 529 financial thresholds and rules
- `cash-value-life-insurance-key-data.md` — Carrier dividend rates and CEV framework
- `irs-rmd-life-expectancy-tables.md` — IRS life expectancy divisor tables
- `ltcg-harvesting-key-data.md` — 2026 LTCG bracket thresholds
- `ltcg-plateau-width-key-data.md` — LTCG bump zone × SS torpedo interaction
- `obbba-change-matrix.md` — OBBBA tax law changes (CHECK FIRST for tax/retirement)
- `ratcheting-swr-key-data.md` — Kitces ratcheting parameters and pseudocode
- `rising-equity-glidepath-framework.md` — Pfau & Kitces glidepath numerical results
- `ss-bridge-funding-key-data.md` — SS bridge funding foundational data
- `stealth-tax-crossover-zone-pattern.md` — Crossover zone framework for all stealth taxes
- `sorr-unified-simulator-architecture.md` — 5-dimension SORR architecture
- **`references/withdrawal-methodology-sensitivity-profiles.md`** — 12-methodology sensitivity matrix
- **`references/kl-divergence-high-dimensional-calibration.md`** — KL divergence estimation for high-dimensional Bayesian calibration priors: bridge sampling (primary), control variates (fallback), QMC, nearest-neighbor methods. Uncertainty-aware classification thresholds (KL > 0.5+1.96*SE → strong, KL < 0.05-1.96*SE → weak). SQL schema for KL estimates table. Key edge cases (degenerate priors, sparse likelihood, KL underflow/overflow). Zero competitive landscape. Load when researching any wps-02a-1a-2a-1a-a-1 (WPS sensitivity analysis, Bayesian calibration, prior informativeness) topic.
- **`references/kl-divergence-convergence-diagnostics.md`** — Convergence diagnostics for KL divergence estimation: ESS thresholds (<300 unreliable), R-hat for KL (<1.05 good convergence), MCSE-based confidence intervals, minimum sample size calculator. Adaptive sampling procedure (4 chains, exponential growth). SQL schema for convergence tracking. Load when researching any wps-02a-1a-2a-1a-a-1-1-1 (KL convergence, bridge sampling reliability) topic.
- **`references/cma-provider-data-source-cross-reference.md`** — Provider Independence Score (PIS) framework (4-dimension scoring), 4-tier data source classification, cross-provider data source overlap matrix (14 data sources mapped across 15 providers), 5 cross-reference detection algorithms, provider-by-provider data source details. Load when researching wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-3 (data source cross-reference) or any CMA provider data provenance topic.
- **`references/cma-provider-update-frequency-data.md`** — CMA provider update frequency data: 12+ providers, claimed vs actual update schedules, staleness tracking thresholds, Dimensional Reality Check staleness example (17 months). Load when researching wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-2 (update frequency compliance) or any CMA governance topic.
- **`references/cma-provider-taxonomy-key-data.md`** — CMA provider taxonomy: 11 major providers, 4 methodology clusters, cross-provider disagreement metrics (equity/fixed income/international), consensus weighting components, effective sample size formula. Load when researching wps-02a-1a-2a-1a-a-1-1-1c-1-1-1 (provider taxonomy) or any CMA methodology comparison topic.
- **`references/market-regime-detection-framework.md`** — 4-regime classification (low-rate bull, high-rate contraction, high-vol stress, recession), FRED data source mapping, dynamic template scoring formula (α/β/γ weights), template regime performance scores, competitive landscape (zero competitors offer regime-aware scoring), edge cases (oscillation, late detection, stagflation). Load when researching wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-4a-2a (market regime-aware template scoring) or any CMA preference recommendation topic.
- **`references/cma-accuracy-tracking-methodology.md`** — CMA provider accuracy tracking methodology: 6 accuracy metrics (MAE, MAPE, RMSSE, directional, bias, regime-adjusted), composite scoring formula, consensus weighting by accuracy, validation lag handling, 11 provider profiles with methodology/horizon/frequency, key competitive finding (zero platforms provide this). Load when researching wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-1 (accuracy tracking) or any CMA accuracy scoring topic.
- **`references/cma-update-significance-filter.md`** — Four-component CMA update significance filter (CMS, CPSS, PMS, RCS) for determining when CMA updates warrant withdrawal plan recalculation. Includes delta analysis approximation (∂SR/∂μ × Δμ + ∂SR/∂σ × Δσ), withdrawal strategy sensitivity matrix, batch recalculation windows, crisis mode design, and net portfolio impact scoring. Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-3 topic or CMA update impact analysis.
- **`references/cma-preference-management-domain-knowledge.md`** — CMA preference management domain: 13+ provider landscape (Tier 1/2/3), Provider Independence Score (PIS) framework, preference model (global/asset-class/horizon layers), preference resolution algorithm, competitive landscape (zero existing platforms offer client CMA preferences), regulatory considerations (SEC Marketing Rule, Reg BI, FINRA 2111, CFP Board), UX design patterns, and behavioral economics findings. Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-4a topic or CMA preference management.
- **`references/cross-validation-threshold-calibration.md`** — Cross-validation protocol for KL divergence threshold validation: stratified k-fold CV, classification stability metrics, recommendation impact consistency, KL estimation reliability, bootstrap CI, optimal fold count. Red-team attacks (threshold gaming, fold bias, correlated profiles). Load when researching any wps-02a-1a-2a-1a-a-1-1-1c (threshold calibration) or wps-02a-1a-2a-1a-a-1-1-1c-1 (cross-validation) topic.
- **`references/iris-lite-framework.md`** — IRIS+ Lite framework: 10 GIIN impact themes mapped to 135 curated metrics (10-20 per theme) with coverage rates, data providers, 4-filter selection algorithm, and governance rules. Load when researching inv-05-6-1, inv-05-6-1-*, inv-05-6-4 (RIC evaluation), or any IRIS+ metric selection topic.
- **`references/esg-model-portfolio-governance.md`** — ESG model portfolio governance domain knowledge: 5 provider comparison matrix (MSCI/Sustainalytics/ISS/S&P/FTSE), ESG methodology types (screening/best-in-class/thematic/impact/integration/SRI), regulatory framework (SEC Marketing Rule, California AB 2659, NY DFS, SFDR 2.0), greenwashing risk categories, carbon footprint calculation, SFDR classification logic, 6 widget specs, 6-table SQL schema, 10 key edge cases. Load when researching inv-05-5 or any inv-05-5-* subtopic.
- **`references/prior-update-scheduling-domain-knowledge.md`** — Prior update scheduling: GREEN/YELLOW/RED tier thresholds, impact forecasting metrics, client communication templates, rollback protocol, IC briefing structure, advisor fatigue detection, scheduling optimization. Load when researching any wps-02a-1a-2a-1a-a-1-4 (prior update scheduling) topic.
- **`references/referral-value-scoring.md`** — Referral Value Score (RVS) framework: formula, source weights, decay model, TCV tier classification, competitive landscape (ZERO platforms provide referral value scoring). Load when researching fa-01-10b-1 through fa-01-10b-1e or any client profitability + referral analysis topic.
- `ss-bridge-funding-key-data.md` — SS bridge funding foundational data
- `spia-payout-rates-and-guaranty-data.md` — SPIA payout rates (May 2026), mortality credit framework, state guaranty association limits, rate data sources, SPIA vs DIA comparison. Load when researching any annuity (ann-*, at-*, rila-*, SPIA, DIA, income floor) topic.
- `fee-structure-optimization-pattern.md` — 4-dimension fee comparison framework
- `bernstein-retirement-data.md` — Bernstein LMP framework data
- `assumption-sensitivity-waterfall.md` — Monte Carlo sensitivity analysis

### Domain Research Patterns (load before researching in that domain)
- `50-state-tax-research-pattern.md` — State-specific tax methodology
- `annuity-rila-research-pattern.md` — Annuity taxonomy and MC methodology
- `insurance-research-pattern.md` — Insurance topic source hierarchy
- `medicare-enrollment-research-pattern.md` — Medicare enrollment research
- `pl10495-state-tax-relocation.md` — PL 104-95 state tax relocation
- `ss-research-pattern.md` — Social Security benefits source hierarchy
- `state-ltcg-tax-treatment.md` — State LTCG tax treatment patterns
- `wealthtech-competitive-analysis-pattern.md` — Platform competitive intelligence

### Failure-Mode Protocols
- `web-extract-total-outage-protocol.md` — When ALL web tools fail
- `unicode-pitfalls-python.md` — Unicode/emoji pitfalls in execute_code
- `agenda-update-patterns.md` — Five patterns for updating AGENDA.md

### Worked Example
- `example-entry.md` — Complete worked-through example (tax lot selection algorithm)

### Researcher Deep Dive (for person-specific research)
- `references/researcher-deep-dive-pattern.md` — Adapted structure for researching individual researchers' bodies of work (Pfau, Bernstein, Benz, etc.)