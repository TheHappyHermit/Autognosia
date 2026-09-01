# Insurance Research Methodology (Life, LTC, Disability, Medicare, Annuities)

Insurance topics are fundamentally different from tax/retirement topics in terms of data sources, analytical patterns, and deliverable structure. This reference covers the research methodology specific to insurance domains within the WealthForge 12-section format.

## When to Load This Reference

Load this reference (via `skill_view(name='wealthforge-research-format', file_path='references/insurance-research-pattern.md')`) when researching ANY insurance topic: life insurance, LTC planning, disability insurance, Medicare, annuities, Medigap, hybrid policies, partnership programs, or property/casualty.

## Key Differences from Tax/Retirement Research

| Dimension | Tax/Retirement | Insurance |
|-----------|---------------|-----------|
| **Primary data sources** | IRS.gov, Kitces.com, SSRN | Genworth Cost of Care, AM Best, NAIC, carrier filings, state DOI |
| **Rule certainty** | Determinative (IRS code) | Probabilistic (actuarial tables, underwriting) |
| **Product landscape** | Standard financial assets | Highly varied (100+ products, 50+ carriers) |
| **State variation** | Moderate (federal > state) | Extreme (state-regulated, 50 different DOI) |
| **Regulatory framework** | SEC, FINRA, IRS | State insurance departments, NAIC model acts |
| **Key metrics** | Marginal rates, bracket thresholds | Premium, benefit pool, elimination period, rating |
| **Competitive tools** | eMoney, RightCapital, MGP, Income Lab | Waterlily, iPipeline, RiskMatch, Breeze |

## Life Insurance — Research Methodology

Life insurance is distinct from LTC and disability in that the core planning problem is **needs analysis**: determining how much death benefit a household requires, then comparing against existing coverage to reveal the gap. This differs from LTC (probability-of-care modeling) and disability (income-replacement-ratio analysis).

### Life Insurance Calculation Methodologies

There are exactly 4 established methodologies. Research must cover ALL 4 and their appropriate use cases:

**1. Multiple-of-Income Method (Simplest, lowest confidence)**
- Formula: `annual_income × multiplier (typically 7-10x)`
- Use case: Quick baseline, young families with simple finances
- Weaknesses: Ignores debt, assets, inflation, family size, college costs
- Pseudocode: `need = min(annual_income * 10, annual_income * years_to_retirement)`

**2. DIME Method (Debt + Income + Mortgage + Education)**
- Formula: `total_debt + (annual_income × replacement_years) + mortgage_balance + sum(college_costs) + final_expenses`
- Use case: Families with clear debts and college goals
- Weaknesses: Does not account for existing investable assets
- Pseudocode: see RESEARCH.md Life Insurance entry LIN-1 build spec

**3. Human Life Value (HLV) Approach (Economic value of future earnings)**
- Formula: `PV of (earnings_stream × (1 - tax_rate - consumption_rate)) + benefits_value`
- Discount rate: risk-free rate + equity premium (typically 4-6%)
- Use case: High-earning individuals with dependents, primary breadwinner
- Weaknesses: Complex, does not account for specific debts/expenses
- Pseudocode: see RESEARCH.md Life Insurance entry LIN-1 build spec

**4. Capital Needs Analysis (Most comprehensive)**
- Two sub-approaches:
  - **Earnings-Only**: `income_gap / safe_withdrawal_rate` (preserves principal)
  - **Liquidation**: `sum(income_gap / (1 + inv_return)^year for year in range(years))` (depletes)
- Components: immediate lump-sum needs (funeral, debt, mortgage, estate settlement) + income replacement capital + education funding
- Use case: Complex households, HNW, comprehensive planning
- Weaknesses: Most assumptions-intensive; requires careful documentation

**When each method should be primary:**
- Young family with one breadwinner: HLV or DIME
- Dual-income no dependents: Capital Needs (simplified: funeral + mortgage + 2yr transition)
- High income with complex estate: Capital Needs (estate-planning mode)
- Quick rule-of-thumb check: Multiple-of-Income (lowest confidence, use as sanity-check only)

### Life Insurance Research Sources

**Industry stats and market sizing:**
- **LIMRA Insurance Barometer Study** (annual) — Uninsured/underinsured counts, cost perception data, consumer attitudes. Co-published with Life Happens. [limra.com]
- **LIMRA + Bain (2025)** — Consumer engagement strategies, closing the coverage gap [limra.com]
- **ACLI Fact Book** (annual) — Industry financial data, premium volumes, carrier market share. [acli.com]

**Needs analysis methodology:**
- **Ritter Insurance Marketing** — Best single source for the 4-method framework. Free worksheet available. [ritterim.com]
- **Kitces.com — Insurance Planning category** — 100+ articles on life insurance. Due diligence beyond illustrations (Barry Flagg/Veralytic), 1035 exchanges, policy reviews. [kitces.com/blog/category/3-insurance/]
- **RightCapital / eMoney** — How the big planning platforms implement life insurance analysis. eMoney has Life Insurance Gap Analysis (2019). RightCapital has HLV calculator.

**Regulatory and tax framework:**
- **IRC Sec. 7702** — Definition of life insurance for tax purposes (CVAT / GPT tests)
- **IRC Sec. 7702A** — Modified Endowment Contract (MEC) seven-pay test rules
- **IRC Sec. 1035** — Tax-free exchange rules for policy replacement
- **IRC Sec. 101(a)** — Death benefit exclusion from beneficiary income
- **IRC Sec. 2031-2042** — Estate inclusion of life insurance at death
- **NAIC Model #275** — Life insurance suitability model regulation
- **NY DFS Regulation 187** — Fiduciary rule for life insurance recommendations

**Carrier financial health:**
- **AM Best** — Financial strength ratings (mandatory citation for any carrier recommendation)
- **NAIC Complaint Index** — Consumer complaint ratio by carrier. Free. [content.naic.org/cis]
- **Comdex** — Composite ranking of all carrier ratings (1-100 percentile)

**Life settlement and policy exit:**
- **Kitces (2025)** — 1035 exchange to annuity for unneeded permanent policies
- **Harbor Life Settlements Industry Report (2025)** — Average payout 3-4x cash surrender value
- **Life Happens** — Consumer education on life settlements [lifehappens.org]

### Life Insurance Database Schema Pattern

Every life insurance research entry should include, at minimum, these table designs in Section 9:

1. **`life_insurance_policies`** — Carrier, policy number, type, face amount, cash value, annual premium, terms, issue date, in-force metrics
2. **`life_insurance_needs_analyses`** — Client ID, methodology used, assumptions snapshot (JSONB for audit), results across all 4 methods, recommended coverage, existing coverage at analysis
3. **`life_insurance_policy_riders`** — Rider type, benefit amount, cost, end date
4. **`life_insurance_recommendations`** — Analysis ID, recommendation type (new/increase/replace/1035/lapse/settlement), rationale, proposed policy details, net benefit projection
5. **`life_insurance_policy_type_library`** — Canonical reference data: term, whole, universal, IUL, VUL with cost index, best-for, pros/cons, surrender period

See RESEARCH.md (2026-05-16 Life Insurance Needs Analysis entry) for complete CREATE TABLE SQL for all 5 tables.

### Life Insurance Red-Teaming Patterns

Life insurance has edge cases that differ from LTC and disability:

1. **Stay-at-home parent ($0 income)** — HLV and multiple-of-income produce $0. Solution: Replacement Cost Method (childcare, housekeeping, management services → $80K-$150K imputed value)
2. **HNW client ($50M+)** — Minimal income need but estate tax liquidity needs. Solution: Add Estate Planning mode when NW > $10M
3. **DINKS** — No dependents → minimal traditional need. Solution: Income smoothing (2-year transition) + mortgage payoff
4. **Existing expensive permanent policy** — Sunk cost vs replacement conflict. Solution: 10-year cost-benefit comparison across keep/add-term, 1035 exchange, and surrender+new-term
5. **Pre-existing health conditions** — Table-rated or declined. Solution: Health rating dropdown, self-insure alternatives when uninsurable
6. **Business owner key person** — Business dependence not captured. Solution: Business Owner Mode (EBITDA × multiple, business debt guarantees, buy-sell funding)
7. **Unneeded policy (life settlement evaluation)** — Existing coverage >> need. Solution: Life settlement screening (3-4x cash surrender value vs lapse vs 1035 exchange)

### Life Insurance UI Widget Architecture

The canonical life insurance command center consists of 5 connected widgets. Future life insurance features (cash value analysis, second-to-die, PPLI) add to this framework:

- **LIN-1**: Needs Analysis Dashboard — 4-methodology comparison grid with sensitivity sliders
- **LIN-2**: Coverage Gap Visualization — Donut chart (inner ring = existing, outer = need, red gap) + stacked benefit allocation bar
- **LIN-3**: Policy Type Comparison — 6-column card grid (Term/WL/UL/IUL/VUL) with 12+ feature rows
- **LIN-4**: In-Force Policy Review — Existing policy performance analysis with recommendation options (keep/convert/1035/replace)
- **LIN-5**: Decision Tree / Strategy Selector — Interactive questionnaire → optimal strategy output

See RESEARCH.md (2026-05-16 Life Insurance Needs Analysis entry, Section 7) for complete widget prose specifications.

### Life Insurance Compliance Guardrails

Hard-code these checks for every life insurance recommendation:

```python
# 1. MEC test (IRC 7702A) — Required for all permanent life recommendations
if policy_type in ['whole_life', 'universal_life', 'variable_universal_life']:
    annual_premium_limit = seven_pay_test(age, face_amount)
    if proposed_premium > annual_premium_limit:
        WARNING: MEC classification — LIFO taxation on distributions

# 2. Premium affordability (Reg BI / NAIC Model #275)
if proposed_premium > household_income * 0.10:
    WARNING: Premiums exceed 10% of income

# 3. Replacement documentation (Reg BI)
if recommendation_type == 'replace':
    REQUIRE: 10-year cost comparison, surrender charge calc, 
             contestability notice, lost-benefit analysis

# 4. Over-insurance warning
if total_recommended_coverage > annual_income * 30:
    WARNING: Verify need is non-speculative
```

## Life Insurance Research Pitfalls

1. **Never recommend a single "right" amount** — Always show the range across methods. 4th Circuit Red Cave case established liability for single-number recommendations.

2. **Check for existing permanent policy before recommending new** — LIN-4 (in-force review) should be mandatory when a client already has cash value life insurance. The sunk cost fallacy cuts both ways.

3. **MEC compliance is easy to miss** — The seven-pay test (IRC 7702A) is triggered by cumulative premium-to-death-benefit ratio in the first 7 years. Any permanent policy recommendation must include MEC verification.

4. **1035 exchanges reset surrender periods** — A new 10-15 year surrender period starts when exchanging policies. Document this trade-off explicitly.

5. **Group life insurance is often overlooked** — Employer-provided group term may have conversion options, portability, or continuation rights. Check if client has group coverage before needs analysis.

6. **Term conversion deadlines** — Most term policies have a deadline to convert to permanent without new underwriting. If recommending term, check conversion options and deadlines.

7. **Life insurance in estate planning changes the analysis framework entirely** — For clients with >$10M estate, the primary driver shifts from "income replacement for survivors" to "liquidity for estate taxes" (up to 40% federal + state). Needs analysis must switch modes at this threshold.

---

## Cash Value Life Insurance — Investment/Accumulation Lens

The life insurance research above covers the **needs analysis** problem (how much death benefit does a client need). A separate, equally important lens is the **cash value as investment** problem (should a client use permanent life insurance as a tax-advantaged accumulation vehicle?).

This lens is appropriate for clients who:
- Already max out 401(k), Roth IRA, HSA, and 529 plans
- Are in the 32%+ federal tax bracket (37% + NIIT = 40.8% marginal)
- Have a 20+ year investment horizon
- Have excess surplus savings ($50K+/year after all tax-advantaged contributions)
- Need life insurance (have dependents, estate tax exposure, or business succession needs)

For research methodology specific to this lens, see `references/cash-value-life-insurance-key-data.md` under this skill.

### Key Analytical Difference: Needs Analysis vs. Cash Value Analysis

| Dimension | Needs Analysis Lens | Cash Value Investment Lens |
|-----------|-------------------|---------------------------|
| **Primary question** | "How much death benefit?" | "Should I fund this policy?" |
| **Primary metric** | Coverage gap ($) | IRR, capital equivalent return (%) |
| **Time horizon** | Current death benefit need | 20-30 year accumulation |
| **Key data** | Income, debt, expenses, dependents | Dividend rates, COI, loan rates, MEC limits |
| **Comparison** | Term vs permanent death benefit | Policy IRR vs taxable bond/stock after-tax |
| **Carrier selection** | AM Best rating, cost | Dividend history, recognition type, policy design |
| **Exit strategy** | Term conversion, replacement | Policy loans, 1035 exchange, life settlement |

### When This Lens Applies (Use Cases)

1. **High-earner tax shield** — Client has maxed all tax-advantaged accounts. Policy provides tax-deferred growth at competitive rates (4-6% IRR net of costs). After-tax comparison via CEV framework shows policy outperforming taxable bonds by 100-300 bp.

2. **Volatility buffer in retirement** (Pfau 2019) — Cash value used to fund withdrawals during market downturns, allowing investment portfolio to recover. Found to increase sustainable withdrawal rates from 2.87% to 4.02% (Pfau/Finke 2019).

3. **ACA-subsidy MAGI management** — Policy loans from non-MEC policies are NOT taxable income (IRC Sec. 72(e)). For early retirees on ACA, this is the only asset class providing spending without increasing MAGI — worth $5K-$15K/year in preserved subsidies.

4. **PPLI for UHNW** — Alternative assets (hedge funds, PE) wrapped in PPLI avoid annual tax drag of 1.5-3.5%, producing +300 bp after-tax improvement (Colva Services 2026).

### When NOT to Use This Lens

- Client below the 22% tax bracket (minimal tax deferral benefit)
- Client has available 401(k)/IRA/HSA space (use those first)
- Client has <10 year investment horizon (surrender charges dominate)
- Client has no life insurance need (buying insurance solely for investment)
- Policy design is commission-heavy or poorly structured for cash value

### UI Design Difference

Needs analysis widgets (LIN-1 through LIN-5) focus on gap visualization and policy type comparison.
Cash value investment widgets (CV-1 through CV-5) focus on:
- Year-by-year cash value projection (3 lines: premiums, cash value, surrender value)
- After-tax comparison with taxable portfolio (capital equivalent value gauge)
- Policy loan impact visualization
- MEC compliance bar
- 1035 exchange decision matrix

For complete widget specs, see the RESEARCH.md entry "Cash Value Life Insurance as Investment" (2026-05-16).

## Insurance-Specific Research Source Hierarchy

### Tier 1: Foundational Data Sources

**Cost data (LTC):**
- **Genworth Cost of Care Survey** — Annual national + ZIP-code LTC cost data. Published Jan/Feb. Gold standard for nursing home, assisted living, home health aide costs. https://www.genworth.com/aging-and-you/finances/cost-of-care
- **Milliman LTC Index** (2025+) — New benchmark for lifetime LTC cost at age 65 ($135K avg). Gender- and state-disaggregated. https://www.milliman.com/en/insight/2025-milliman-long-term-care-index
- **CareScout Cost of Care** — Daily rates by state. https://www.carescout.com/cost-of-care
- **SeniorLiving.org / myLifeSite** — Aggregated average lengths of stay, probability data.
- **CRR (Boston College Center for Retirement Research)** — Academic lifetime LTC probability data. https://crr.bc.edu

**Carrier and product data:**
- **AM Best** — Financial strength ratings for insurance carriers (A++, A+, A, A-, B++, etc.). https://www.ambest.com
- **NAIC Complaint Index** — Consumer complaint ratios by carrier. Free. https://content.naic.org/cis
- **AALTCI** (American Association for Long-Term Care Insurance) — Industry stats, pricing guides. https://www.aaltci.org
- **LIMRA** — Insurance industry market share and sales data. https://www.limra.com

**Regulatory:**
- **NAIC Model Regulations** — Model #640 (LTC Insurance), #641 (LTC Model Regulation). https://content.naic.org/model-laws
- **State Department of Insurance websites** — Rate filings, consumer guides, partnership program details. Google "state DOI [state name] insurance rate filings".
- **Deficit Reduction Act 2005** — Authorized state LTC partnership programs with dollar-for-dollar asset disregard.

### Tier 2: Practitioner & Advisor Sources

- **Wade Pfau / Retirement Researcher** — Best academic-practitioner bridge for LTC, annuity, and insurance planning. https://retirementresearcher.com
- **Kitces.com** — Life insurance due diligence (Barry Flagg), policy-based planning, LTC topics. Often unreachable via web_extract — see main skill's Primary Source Failure Fallback.
- **Forbes Advisor / WSJ Buy-Side** — Product comparison articles (hybrid LTC, annuity riders, term vs whole life). Up-to-date market analysis.
- **NCOA** (National Council on Aging) — Consumer-level LTC insurance cost guides. Good for premium averages by age. https://www.ncoa.org
- **Jackson National** — Annual retirement cost perception studies showing the LTC underestimation gap.

### Tier 3: Product-Specific Sources

- **iPipeline / RiskMatch** — Carrier API gateways for real-time quotes. Evaluate for build-vs-buy decisions.
- **Waterlily** — Dedicated LTC planning platform ($49/mo). The closest competitor to what WealthForge would build. Research for feature parity analysis.
- **Annuity.org / The Annuity Man / Stan the Annuity Man** — LTC rider and product details.
- **LTCTree / CompareLongTermCare.org** — Side-by-side product comparisons.

## Insurance Research Unique Sections

### The 4-Way Funding Strategy Comparison

For LTC and life insurance topics, the BUILD SPEC must include a **strategy comparison engine** that compares these four approaches:

1. **Self-fund** (do nothing, pay from savings)
   - Data: portfolio value, expected return, state cost multiplier
   - Formula: opportunity cost = funds_set_aside × expected_return
   - Risk: worst-case cost (5+ years in high-cost state = $665K-$1M+)

2. **Standalone insurance**
   - Data: premium (age × health × benefit parameters), benefit pool
   - Key variables: daily/monthly benefit, benefit period, elimination period, inflation protection (3%/5%/CPI)
   - Risk: rate increases of 8-25%/yr, 50-150% lifetime
   - Note: Use-it-or-lose-it (no death benefit if LTC not used)

3. **Hybrid life+LTC**
   - Data: single premium ($50K-$200K) or annual, LTC pool = 2-4x death benefit
   - Key variables: LTC benefit reduces death benefit dollar-for-dollar (most policies)
   - Tax treatment: LTC benefits tax-free (PPA 2006), death benefit tax-free
   - Advantage: "Use it or keep it" — death benefit if LTC never needed

4. **Annuity+LTC rider**
   - Data: single premium, LTC multiplier (2-3x income boost)
   - Different from #3: provides additional income, not a benefit pool
   - Best for clients who want guaranteed income + LTC protection
   - Tax: LTC-enhanced payments partially tax-free via exclusion ratio

**Wealth thresholds** (from Retirement Researcher/Pfau):
- Net worth < $250K → Medicaid planning, not LTC insurance
- $250K-$1M → Strong hybrid life+LTC candidate
- $1M-$3M → Standalone or hybrid (depends on health, preference)
- > $3M → Generally self-fund; hybrid for tax-efficiency

### State Partnership Programs

46 states have LTC Partnership Programs (all except HI, AK, UT, MS as of 2026). These are critical for clients with $250K-$1M net worth.

**Research approach:**
1. Check `medicaidplanningassistance.org/partnerships-for-long-term-care/` for state list
2. Verify client's state has a program
3. Dollar-for-dollar asset disregard: every $1 insurance pays protects $1 of assets from Medicaid spend-down
4. Must include inflation protection (5% compound if ≤60, 5% simple if 61-75)
5. Policy must be "qualified" under DRA 2005 standards

### Actuarial Probability Tables

Unlike tax bracket thresholds (deterministic), insurance planning requires probabilistic modeling. The canonical LTC probability distribution (from Milliman 2025 LTC Index + CRR):

| Duration | Men | Women | Notes |
|----------|-----|-------|-------|
| No paid care | 47% | 40% | Most common outcome |
| < 1 year | 24% | 19% | Short-term rehab/home care |
| 1-3 years | 18% | 19% | Typical assisted living stay (28mo avg) |
| 3-5 years | 8% | 8% | Nursing home transition |
| 5+ years | 3% | 14% | **Women: 14% need 5+ yrs ($665K avg cost)** |

**Key insight for WealthForge widgets:** The 14% tail risk for women (5+ years, $665K) is the most important number to surface. Clients intuitively guess 2-3 years, but the real risk for women is much longer durations.

### Red Teaming — Insurance-Specific Failure Modes

Insurance has unique failure modes not covered by the general 12-section red teaming:

| Failure Mode | Risk | Mitigation |
|---|---|---|
| **Probability myopia** — 47% no-care probability feels like "I probably won't need it" | High | Always show BOTH majority outcome AND tail risk cost |
| **Cost projection conservative** — 4% growth may understate healthcare inflation | Medium | Show range: 4% vs 6% scenarios |
| **Hybrid double-counting** — Client counts death benefit AND LTC pool as separate | High | Clear UI: "LTC benefits reduce death benefit dollar-for-dollar" |
| **Stale cost data** — Genworth data is 6-12 months old | Medium | Show data vintage prominently |
| **Quotes without underwriting** — Population averages differ from actual premiums | High | Mandatory disclaimer about individual underwriting |
| **Rate increase cascade** — Standalone LTCi rates rise 100% by age 80, client lapses | High | Rate sensitivity analysis: "Can you afford at +50%/100%/150%?" |
| **Annuity rider confusion** — Client thinks rider = LTC insurance when it's income boost | Medium | Comparison chart showing fundamental differences |
| **Partnership over-sold** — Client thinks partnership = free Medicaid | Medium | "Partnership protects assets from spend-down. You still must meet other Medicaid eligibility rules." |

## Insurance Research Pitfalls

1. **Outdated cost data** — LTC costs rise 3-5%/yr. Genworth data is 6-12 months stale when published. Use most recent year available and note vintage.

2. **Carrier exit risk** — Many major carriers have exited LTC insurance (MetLife, Prudential, Unum, Genworth). Remaining market is concentrated in ~8 carriers. Always check AM Best rating and note carrier viability.

3. **State-specific regulation** — Insurance is state-regulated. A policy legal in NY may not be available in TX. Research state DOI rules for each client's state.

4. **Underwriting changes** — Carriers change underwriting criteria frequently. Real-time quotes require API integration (iPipeline/RiskMatch/Waterlily). Population averages are directional only.

5. **Hybrid policy complexity** — Hybrid life+LTC policies have complex benefit reduction mechanisms. Some reduce death benefit proportionally, some dollar-for-dollar, some on a "pool of money" basis. Research each carrier's specific mechanism.

6. **Partnership program variation** — The four original partnership states (CA, CT, IN, NY) have different rules than the 42 DRA states. Original states may have more favorable terms but different requirements. Check state-specific rules.

7. **Medicaid interaction complexity** — Partnership protects assets but Medicaid eligibility still requires meeting income limits, functional need criteria, and state-specific requirements. Partnership is NOT "Medicaid without qualification."
