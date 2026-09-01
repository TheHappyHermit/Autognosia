# Social Security Research Pattern

## When to Load This Reference

Load this reference when researching ANY Social Security benefits topic: claiming strategies, spousal/divorced spouse benefits, survivor benefits, earnings test, COLA break-even, bridge funding, SS taxation, or SS×Roth conversion coordination. The SS domain has a distinct regulatory source hierarchy, unique competitive landscape patterns, and recurring auto-detection gaps that differ from tax or insurance research.

## Source Hierarchy for SS Research

### Tier 1 — Statutory & Regulatory Authority

These are the authoritative sources for SS rules. SSA.gov loads reliably via web_extract.

- **SSA Program Operations Manual System (POMS)** — The definitive internal policy manual SSA employees follow. Contains floor-level rules not published elsewhere. URL pattern: `https://secure.ssa.gov/poms.nsf/lnx/{section_code}`. Key POMS sections by topic:
  - **Divorced Spouse Benefits**: RS 00202.005 (basic eligibility), RS 00202.100 (independently entitled, ex hasn't filed yet), RS 00202.045 (remarriage rules), RS 00615.680 (divorced spouse disregard for family maximum)
  - **Spousal Benefits**: RS 00202.020 (benefit amounts/reductions), RS 00202.035 (deductions), RS 00202.040 (termination events)
  - **Survivor Benefits**: RS 00207.005 (widow conversion), RS 00207.001 (general survivor rules)
  - **Deemed Filing**: RS 00202.100 (post-BBA 2015 rules, IEDS criteria)
  - **Family Maximum**: RS 00615.600+ (benefit computation with family max)

- **SSA.gov Benefit Calculators** — Official calculation engines. `ssa.gov/oact/anypia/` (Detailed Calculator — full PIA computation), `ssa.gov/benefits/calculators/` (Online Calculator), `ssa.gov/benefits/retirement/planner/claiming.html` (filing rules with deemed filing explanation). SSA.gov is generally reliable for web_extract.

- **SSA Forms** — Official application documents. URL pattern: `ssa.gov/forms/ssa-{number}`. Key forms:
  - SSA-2: Application for Spouse's or Divorced Spouse's Benefits
  - SSA-10: Application for Widow's/Widower's/Surviving Divorced Spouse's Benefits
  - SSA-44: Medicare IRMAA Life-Changing Event Appeal
  - SSA-7004: Request for Social Security Statement
  - SSA-1372: Request for Benefit Estimate for Survivors

- **IRS Social Security Taxation** — IRC Sec. 86 (provisional income formula for SS benefit taxation), IRS Pub 915 (Social Security and Equivalent Railroad Retirement Benefits). For SS×tax topics, this is the bridge between POMS and tax analysis.

- **Bipartisan Budget Act of 2015, Section 831** — The law that eliminated file-and-suspend and restricted application for most cohorts. The key question for any SS feature: "Does this rule apply pre or post this act?"

- **Social Security Fairness Act (signed January 4, 2025)** — Repealed WEP and GPO. Retroactive to December 2023. Affects 3M+ public sector retirees. SSA processing retroactive payments through mid-2026. When researching any SS spousal/survivor benefit feature, check: "Does the WEP/GPO repeal affect eligibility for this feature?" If the feature involves government pension holders, the repeal creates a finite-time advisory opportunity for retroactive lump sums.

### Tier 2 — Practitioner & Academic Analysis

These sources interpret and extend the statutory rules with strategy recommendations.

- **Kitces.com** — The most comprehensive practitioner SS resource. Multiple articles on claiming strategies, divorcee benefits, deemed filing, bridge funding, earnings test, survivor optimization. **Pitfall**: Kitces.com articles frequently time out under web_extract (35K-60K chars, JS-heavy). Fallback: search for practitioner blogs citing Kitces (Hanover, Henningfield, Wealth Enhancement), or Bogleheads threads discussing the same topic.

- **Oblivious Investor / Mike Piper** — Author of Open Social Security calculator. Blog and book ("Social Security Made Simple") are essential for understanding SS optimization math. `obliviousinvestor.com` loads reliably. Piper's SS calculator is the open-source gold standard — its source code at `github.com/MikePiper/open-social-security` is the best available reference for SS optimization algorithms.

- **SSA.tools** — Free online calculator with guide pages. `ssa.tools/guides/` has topic-specific pages (divorced spouse, survivor, taxation, state taxes) that provide clean, reliable summaries. These pages load well via web_extract.

- **SocSecOptimizer (Bob O'Rourke)** — Advisor-focused SS optimization tool ($199/yr). Used in 300+ firms. Good competitor reference.

- **Social Security Solutions (William Reichenstein)** — Academic/practitioner SS optimization ($49/yr). Reichenstein's academic papers on SS claiming strategy are authoritative (numerous publications in JFP, AAII Journal).

- **Nationwide Retirement Institute Annual Survey** — Annual survey of advisor and consumer SS knowledge. Key stat to check: "What % of retirees/divorcees know about X benefit?" Used to quantify the "unclaimed benefits" opportunity.

### Tier 3 — Competitive Landscape Sources

For the COMPETITIVE LANDSCAPE table, evaluate these tools on the **Auto-Detection** dimension specifically:

| Tool | Type | Auto-Detection | Notes |
|------|------|----------------|-------|
| **Open Social Security** (Mike Piper) | Open-source calculator | ❌ — user must self-identify scenario | Gold standard once engaged; user must know about the benefit |
| **SSA.tools** | Free calculator | ❌ — manual input | Clean UI, good education, no detection |
| **SocSecOptimizer** | Advisor ($199/yr) | ❌ — advisor selects scenario | Emphasis on couples optimization |
| **Social Security Solutions** | Consumer ($49/yr) | ❌ — survey-based input | Reichenstein's research rigor |
| **eMoney Advisor** | Planning platform | ❌ — advisor manually enters ex-spouse data | Market leader, 7.95 T3 rating |
| **RightCapital** | Planning platform | ❌ — no marital-history-based detection | 8.40 T3 rating, best-rated |
| **MoneyGuidePro** | Planning platform | ❌ — advisor manually configures | Declining, 7.62 T3 rating |
| **BlackRock SS Estimator** | Advisor tool (free) | ❌ — advisor inputs scenario | No real benefit for divorced detection |
| **AARP Calculator** | Consumer (free) | ❌ — explicitly does NOT support divorced spouse benefits | Major gap for largest retiree org |

**Gap Pattern:** Every tool in the market requires the user to already KNOW about the benefit and ACTIVELY seek it out. Zero tools auto-detect eligibility from existing client data (age + marital history + earnings records). This is the defining competitive gap — it's not a technology problem, it's a workflow-design problem that no platform has solved.

## Recurring SS Research Patterns

### Pattern 1: The 10-Year Rule

Many SS benefits depend on a 10-year marriage threshold (spousal, divorced spouse, survivor). When researching any spousal/survivor benefit:
1. Check marriage duration against the 10-year rule
2. Document the exact day-counting methodology (SSA counts actual days from marriage date to divorce date)
3. Flag edge cases: 9yr-11mo marriages (close but ineligible), remarried-same-ex-within-1-year (combined duration counts), pre-Obergefell same-sex marriages (recognition date = June 26, 2015)

### Pattern 2: The Age 62 / FRA / Age 70 Triad

Every SS claiming feature must model three decision points:
- **Age 62** — Earliest claiming age, permanent reduction (~25-30% from FRA)
- **Full Retirement Age (FRA)** — 66-67 depending on birth year, full benefit amount
- **Age 70** — Maximum delayed retirement credits (8%/yr DRC), no benefit to waiting beyond 70

For spousal/divorced spouse benefits, the reduction schedule works differently than own benefits: at 62, divorced spouse benefit is reduced by ~32.5% (to ~35% of ex's PIA instead of 50%). For survivor benefits, claiming at 60 produces a 28.5% reduction. Always verify the specific reduction formula for the benefit type being researched.

### Pattern 3: The Birth Cohort Boundary (BBA 2015)

The Bipartisan Budget Act of 2015 created a hard cohort boundary:
- **Born BEFORE January 2, 1954**: Can still use restricted application (file for spousal/divorced spouse only, delay own benefit with DRCs to 70)
- **Born ON or AFTER January 2, 1954**: Deemed filing applies — filing for one benefit forces all benefits to be claimed simultaneously

This boundary matters for any feature that recommends optimal claiming strategies. For the post-1954 cohort (majority of current retirees), the "file and suspend" and "restricted application" strategies are unavailable. For the pre-1954 cohort (shrinking, age 72+ in 2026), restricted application creates incremental lifetime value of $50K-$100K+.

### Pattern 4: Auto-Detection from Client Data

The defining WealthForge-native innovation opportunity in SS benefits. For any SS benefit feature, ask:

> "What data does the system ALREADY have about the client that would reveal eligibility for this benefit?"

Common examples:
- **Divorced spouse benefits**: Client birth date + marital history (marriage dates, divorce dates, spouse names) + own PIA → eligibility check + best ex-spouse PIA estimation
- **Survivor benefits**: Client birth date + ex-spouse death event + marital history → survivor benefit eligibility  
- **Earnings test**: Client age (approaching FRA) + current work/earnings data → penalty calculation
- **Bridge funding**: Client age (62-70) + SS claiming decision + portfolio composition → bridge funding requirement

The data is typically scattered across CRM (marital status, spouse name), the planning database (PIA, birth date), and client-provided income history. The opportunity is in correlating data that was entered for different purposes.

### Pattern 5: Occupation-Based PIA Estimation

When the exact PIA of a spouse or ex-spouse is unknown (the common case), estimate from occupational data:

```
1. Obtain/estimate: years_of_earnings, highest_inflation_adjusted_income (or occupation + industry)
2. If years < 35: reduce effective AIME by (years/35), reduce confidence proportionally
3. Apply bend point formula: 90% of first bend, 32% of second bend, 15% above
4. Return: (estimated_PIA, confidence_score)
```

Confidence bands: ±15% with occupation+industry data, ±25% with industry-only, ±35% with no data but client estimate. This is ALWAYS better than $0 — the current state. Document confidence explicitly in UI and never present estimated PIAs as exact.

## Competitive Table Pattern for SS Features

When building competitive tables for SS benefit features, use at minimum these columns:

```
| Platform | Calc | Optimization | Multi-Year | Auto-Detect | Integration | Notes |
```

The **Auto-Detect** column is the most diagnostic. A ✅ means the platform surfaces the benefit without the user knowing to ask — which is virtually never the case today.

After the table, synthesize the gap as a concrete number: "No platform auto-detects [benefit] eligibility from client data. [N]M eligible [group] never claim average $[X]/yr — $[T]B/yr unclaimed pool."

## Common SS Research Pitfalls

- **❌ Assuming SSA notifies eligible individuals.** SSA does not proactively identify or contact eligible divorced spouses, survivors, or early retirees. The onus is entirely on the individual.
- **❌ Confusing spousal (50%) and survivor (100%) benefit formulas.** They have different eligibility ages (62 vs 60), different reduction schedules, and different remarriage rules. Always verify which benefit type you're modeling.
- **❌ Ignoring the 2-year rule.** For divorced spouse benefits, if the ex-spouse hasn't filed yet, the applicant must be divorced for 2+ years. This is a common trip point.
- **❌ Assuming ex-spouse notification.** SSA does NOT notify ex-spouses when a divorced spouse benefit is claimed, and divorce decrees cannot block benefits.
- **❌ Stale COLA/Wage data.** SSA updates bend points, wage bases, and COLA amounts annually. When building PIA estimators, tag all bend point values with their effective year.
- **❌ Forgetting the WEP/GPO repeal.** The Social Security Fairness Act (Jan 2025) repealed both provisions. For clients with government pensions, pre-2025 benefit calculations may be obsolete — create a re-evaluation workflow.
