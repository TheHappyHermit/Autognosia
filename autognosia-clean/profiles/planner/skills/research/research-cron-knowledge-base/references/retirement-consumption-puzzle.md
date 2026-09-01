# Retirement Consumption Puzzle — Blanchett & Finke Research — Condensed Reference

**Source:** Deep research session 2026-05-15
**Full findings:** RESEARCH.md under "The Retirement Consumption Puzzle — Blanchett & Finke Research Literature"

## The Core Finding

**Retirees spend ~80% of lifetime income (SS, pensions, annuities) but only ~50% of savings.**

Actual withdrawal rate for 65-year-old married couples: **2.1%** (singles: **1.9%**).
This is roughly HALF the safe 4% rule — retirees spend far less than they safely could.

Source data: Health and Retirement Study (HRS), 10 waves, 7,498 observations of households with $100K+ in assets (Blanchett & Finke, 2025, Financial Planning Review / Retirement Income Institute #030-2025).

## Withdrawal Rates by Age (from HRS data)

| Age | Single | Married |
|-----|--------|---------|
| 65  | 1.9%   | 2.1%    |
| 75  | 4.4%   | 3.2%    |
| 80  | 4.6%   | 3.8%    |

**Key:** Withdrawal rates increase with age largely because RMDs force portfolio depletion, not because retirees become more comfortable spending. RMDs act as the single most effective behavioral intervention.

## The Three Behavioral Mechanisms Driving Underspending

### 1. Mental Accounting (Thaler)
Retirees create non-fungible mental accounts:
- **"Income money"** (SS checks, pension payments, annuity payments) — feels spendable → consumed at ~80%
- **"Wealth money"** (IRA, 401(k), brokerage) — feels like capital to preserve → consumed at ~50%

### 2. Loss Aversion (Prospect Theory)
Withdrawing from savings is psychologically coded as a "loss" against a reference point (peak portfolio value). The pain of seeing a portfolio decline outweighs the pleasure of spending.

### 3. Ambiguity Aversion (Ellsberg Paradox)
Retirees must assess at least four interacting unknowns simultaneously to determine a safe withdrawal rate:
- Longevity risk (how long will I live?)
- Market risk (what will returns be?)
- Inflation risk (what will things cost?)
- Healthcare cost risk (what will medical care cost?)

This complexity creates decision paralysis — it's easier to spend nothing from savings than to figure out the "right" amount.

## The "License to Spend" Concept (Blanchett & Finke, 2021/2024)

**Every dollar of assets converted into guaranteed lifetime income results in approximately DOUBLE the spending compared to non-annuitized wealth.**

Why: Guaranteed income removes both longevity uncertainty AND the complexity of estimating a safe withdrawal rate. Retirees with annuitized income are more likely to spend from their other savings too — the guaranteed income provides psychological "permission" to consume.

**Policy implication:** Default annuitization, managed payout funds, RMD frameworks, and income illustrations on statements all increase retiree spending and welfare.

**Blanchett direct quote (2024):** "I am concerned that many of the assumptions we use today in financial planning tools do not effectively demonstrate the value of lifetime income."

## The Retirement Spending Smile (Blanchett, 2014)

Real (inflation-adjusted) retiree spending declines approximately **1% per year** during retirement, forming a "smile" shape:
- **Early retirement (65-75):** Higher spending — travel, hobbies, discretionary
- **Mid retirement (75-84):** Declining real spending — retirees slow down
- **Late retirement (85+):** Rising spending — medical expenses increase

For a household starting with $100K/year: real spending troughs at $74,146 at age 84 (26% real decline).

**Planning implication:** The constant-inflation-adjusted-spending assumption leads to systematic over-saving. A spending-smile-aware approach supports a higher initial withdrawal rate (Pfau calculates 5.8% vs. 4% with constant spending).

**Guardrails implication:** The natural spending decline (~1%/yr real) creates a buffer that makes guardrails MORE forgiving — a 20% portfolio loss doesn't require a 20% spending cut if spending was already declining.

## The RMD Effect — Policy as Behavioral Intervention

RMDs raise withdrawal rates from 2.1% to 3.2-4.6%. This is a bigger effect than any advisory intervention. Retirees who face mandatory withdrawals perceive those distributions as income and spend them at higher rates.

**Planning tool implication:** Show RMDs as "future guaranteed income" rather than "future forced withdrawals" — this simple reframing may increase pre-RMD spending willingness.

## Advisors' Role — Overcoming Behavioral Barriers

Most advisors focus on the **mathematical problem** (portfolio construction, safe withdrawal rates). The research suggests the real value is solving the **psychological problem** — giving clients permission to spend.

**Practical strategies:**
- Create "paycheck" structures: systematic withdrawal plans, RMD automation, annuity income
- Reframe portfolio as "income capacity" rather than "wealth"
- Use guardrails to pre-commit to spending adjustments
- Show RMDs as projected income, not forced depletion
- Provide dollar-based spending capacity with clear guardrail triggers (Income Lab model)

## Relevance to WealthForge

1. **Objective function design:** The right objective function may not be "maximize safe spending" but "enable optimal spending behavior." This shifts the design from purely mathematical to behavioral + mathematical optimization.

2. **2.1% challenges the withdrawal-rate paradigm:** If actual retirees withdraw at 2.1%, the whole "optimal withdrawal strategy" industry is solving a problem most retirees don't actually face. The primary problem isn't "how to withdraw optimally" — it's "how to get retirees to spend what they can safely withdraw."

3. **Mental accounting as UX principle:** Show "Income" (SS, pension, annuity, RMDs) and "Spending Capacity from Savings" as visually distinct categories in the client portal.

4. **"Spending Confidence" positioning opportunity:** Positioning WealthForge as a "Spending Confidence Platform" (giving permission to spend) rather than a "Withdrawal Optimizer" (maximizing tax efficiency) creates a unique market position.

## Spending Smile Curve Specification (from SS-48 deep dive, 2026-05-18)

Three canonical spending smile models with Python pseudocode:

### Model 1: Blanchett Standard (JFP 2014, updated 2026)
```python
# Real spending declines ~1.2%/yr from 65 to 84, then rises ~0.5%/yr
# Total decline: ~26% from peak (age 65) to trough (age 84)
a = -0.012  # Linear decline rate
b = 0.00035  # Quadratic upturn
multiplier = 1.0 + a * years_since_baseline + b * (years_since_baseline ** 2)
```
Range floor: 0.60 (never below 60% of baseline). Ceiling: 1.15 (go-go above baseline).

### Model 2: T. Rowe Price Decoding Retiree Spending (2024)
```python
# -2%/yr real decline across all wealth levels
multiplier = 1.0 + (-0.02) * years_since_baseline
```

### Model 3: Kitces Age Banding (3-phase linear)
```python
# Go-Go (65-74): -1.5%/yr → Slow-Go (75-84): -1.0%/yr → No-Go (85+): -0.3%/yr + healthcare upturn
# Phase boundaries at age 75 and 85
if yr <= 10:    m = 1.0 - 0.015*yr
elif yr <= 20:  m = 0.85 - 0.010*(yr-10)
else:           m = 0.75 - 0.003*(yr-20) + 0.005*sqrt(yr-20)
```

### Income Quartile Adjustment
Higher-income households have steeper declines (more discretionary spending):
- low: +0.0%/yr adjustment (essential — flat curve)
- middle: +0.0%/yr (standard Blanchett)
- upper: -0.3%/yr additional decline
- high: -0.5%/yr additional decline

### Smile-Adjusted SWR
Base SWR (Morningstar 2026 3.9%) × 1.20× smile multiplier × equity factor = 4.7-5.0%
~20% more spending in go-go years with no increase in portfolio failure risk.

## Category-Level Age Banding

Seven spending categories with per-category decline rates (requires BLS CEX/HRS data):

| Category | Baseline % | Annual Decline/Rise | Notes |
|----------|:---------:|:-------------------:|-------|
| Housing | 32% | -0.8%/yr | Mortgage payoff |
| Transportation | 14% | -1.5%/yr | Less commuting |
| Food | 13% | -1.0%/yr | Less dining out |
| Healthcare | 12% | +0.5%/yr, accelerates +3%/yr after 80 | Dominant late-life cost |
| Leisure | 10% | -2.5%/yr | Biggest decline category |
| Clothing | 3% | -2.0%/yr | Less work wardrobe |
| Other | 16% | -0.5%/yr | Miscellaneous |

Healthcare transitions from 12% of spending at 65 to ~25% by 90+. Leisure drops from 10% to ~4%.

## Mental Accounting Calculator (Blanchett & Finke 2025)

```python
def calc_mental_accounting(ss, pension, annuity, portfolio):
    lifetime_income = ss + pension + annuity
    safe_portfolio_wd = portfolio * 0.04
    
    actual_lifetime = lifetime_income * 0.80  # 80% utilization
    actual_portfolio = safe_portfolio_wd * 0.50  # 50% utilization
    
    total_actual = actual_lifetime + actual_portfolio
    total_capacity = lifetime_income + safe_portfolio_wd
    
    gap = total_capacity - total_actual
    gap_pct = (gap / total_capacity) * 100
    
    return {"total_actual": total_actual, "gap_pct": gap_pct,
            "lifetime_util": "80%", "portfolio_util": "50%"}
```

Conservative recommendation: close 50% of the gap → `suggested_increase = gap * 0.5`

## Five Widgets Designed (SS-48, 2026-05-18)

### SB-1: Spending Trajectory Dashboard
Dual-line chart (flat assumption vs. smile trajectory). Age 65-95 X-axis. Shaded over-saving zone. Phase labels: Go-Go ★★★ / Slow-Go ★★ / No-Go ★. Key metric: "4.8% with smile vs. 3.9% without = $9K more/yr."

### SB-2: Mental Accounting Gap Gauge
Half-donut gauge — green (actual spending), yellow (safe gap), red (aggressive). Needle shows current. "58% of safe capacity. $18,400/yr gap." Three levers: Spend More, Gift, Give to Charity.

### SB-3: Category Spending Age-Banding Chart
Stacked area chart, 7 categories. Healthcare grows from 12%→25%, leisure shrinks 10%→4%. Category-level client override sliders.

### SB-4: Go-Go Phase Optimizer
Three colored phases on retirement timeline. Phase-aware withdrawal amounts: "Go-Go: $72K. Slow-Go: $58K. No-Go: $51K. You get $12K more in early retirement."

### SB-5: Consumption Puzzle Advisor Brief
Auto-generated FPA-10 behavioral insights section. "Client Mary, 68, has 2.1% withdrawal rate vs. 4.0% safe capacity. $14,300/yr gap. Recommendations: travel budget, grandchild gifts, DAF."

## Database Schema (5 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `spending_profiles` | Per-client smile config | profile_id, client_id, smile_type, baseline_spending, retirement_age, income_quartile |
| `spending_projections` | Per-age projected values | profile_id, age, total_spending, smile_multiplier, by_category JSONB |
| `mental_accounting_snapshots` | Actual vs. capacity tracking | client_id, snapshot_date, lifetime_income_actual, total_capacity, gap_percentage |
| `category_spending_baselines` | Per-category decline rates | client_id, category, baseline_pct, decline_rate, is_override |
| `spending_study_references` | Canonical research library | study_id, study_name, author, year, key_finding, parameters JSONB |

## Competitive Landscape Audit (SS-48, 2026-05-18)

| Platform | Spending Smile | Go-Go/Slow-Go | Age Banding | Consumption Puzzle |
|----------|:---:|:---:|:---:|:---:|
| eMoney | ✗ | ✗ | ✗ | ✗ |
| RightCapital | ✗ | ✗ | ✗ | ✗ |
| MoneyGuidePro | ✗ | ✗ | ✗ | ✗ |
| Income Lab | ✗ | Partial (Hatchet) | ✗ | ✗ |
| MaxiFi | ✗ | ✗ | ✗ | ✗ |
| Boldin | ✗ | ✗ | ✗ | ✗ |
| T. Rowe Price Solver | ✗ | ✗ | ✗ | ✗ |
| Vanguard F&C | ✗ | ✗ | ✗ | ✗ |

**Key finding: Zero platforms have a spending smile module — completely uncontested WealthForge innovation.**

## Key Red-Team Edge Cases (from SS-48)

1. **Healthcare explosion**: Chronic condition at 72 → 400% cost jump. Mitigation: WEIGHTED probability (20% chance 3x costs), show 10th/90th percentile bands
2. **Go-go never declines**: Active retiree, no mobility decline. Mitigation: health-adjusted fitness score input
3. **Mid-retirement wealth event**: Inheritance, house sale. Mitigation: recalculate smile from current age
4. **Asymmetric spousal health**: One active, one in care. Mitigation: weighted average of both trajectories
5. **Fully annuitized client**: 100% SPIA+SS. Mitigation: mental accounting still creates gap — must show capacity vs. actual

## Updated Sources (from SS-48, 2026-05-18 — 20 sources)

1. Blanchett (2014). "Estimating the True Cost of Retirement." JFP. https://www.kitces.com/blog/estimating-changes-in-retirement-expenditures-and-the-retirement-spending-smile/
2. Blanchett & Finke (2025). "Retirees Spend Lifetime Income, Not Savings." Financial Planning Review 8(3). https://onlinelibrary.wiley.com/doi/full/10.1002/cfp2.70010
3. Blanchett (2026). "Spending Smile Revisited: Cross-Sectional Patterns." SSRN. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6221058
4. Hurd & Rohwedder (2003). "Retirement-Consumption Puzzle." NBER WP 9586. 
5. Pfau (2025). "Slow and Steady Wins the Retirement Funding Race." Rethinking 65. https://rethinking65.com/slow-and-steady-wins-the-retirement-funding-race-pfau/
6. Kitces (2016). "Why Most Retirees Never Spend Their Retirement Assets." https://www.kitces.com/blog/consumption-gap-in-retirement-why-most-retirees-will-never-spend-down-their-portfolio/
7. Kitces (2016). "Age Banding To Model Retirement Spending Decline." https://www.kitces.com/blog/age-banding-by-basu-to-model-retirement-spending-needs-by-category/
8. Kitces (2014). "How Total Spending Declines Over Time In Retirement." https://www.kitces.com/blog/estimating-changes-in-retirement-expenditures-and-the-retirement-spending-smile/
9. Pfau (2016). "What Is The Retirement Spending Smile?" https://retirementresearcher.com/retirement-spending-smile/
10. T. Rowe Price (2024). "Decoding Retiree Spending." White paper. https://www.troweprice.com/.../Decoding_Retiree_Spending.pdf
11. EBRI (2024). "2024 Spending in Retirement Study."
12. BLS Consumer Expenditure Survey. https://www.bls.gov/cex/tables.htm
13. Vanguard (2025). "How America Retires." https://workplace.vanguard.com/insights-and-research/perspective/how-america-retires...
14. MetLife (2026). "Half of Retirees Fear Running Out of Money." https://www.metlife.com/about-us/newsroom/2026/february/...
15. Capital Group (2025). "Beyond the Nest Egg." https://www.capitalgroup.com/advisor/insights/articles/psychology-of-retirement-spending.html
16. Morningstar (2026). "State of Retirement Income 2026."
17. BofA Institute (2025). "Paychecks to Pensions." https://institute.bankofamerica.com/.../evolution-of-retiree-spending.pdf
18. Kiplinger (2026). "Average Retirement Withdrawal Rate by Age."
19. Retirement Success App (2026). "Go-Go, Go-Slow, No-Go." https://retirementsuccessapp.com/2026/03/10/retirement-spending-phases/
20. Hurd & Rohwedder (2011). "Spending Trajectories After Age 65." RAND. https://www.rand.org/.../RAND_RRA2355-1.pdf

## Potential Components to Build (expanded from SS-48)

1. **Spending Confidence Dashboard** — Gap visualization: current spending vs. safe capacity
2. **Behavioral-Enhanced Withdrawal Optimizer** — Toggle between "math optimal" and "behavior optimal" modes
3. **Mental Accounting UX Layer** — Separate visual treatments for income vs. spending capacity
4. **Pre-RMD Spending Simulator** — "What if RMD rules applied to you today?"
5. **Spending Personality Assessment** — Diagnose primary behavioral barrier, recommend interventions
6. **Guaranteed Income Integration Module** — Model "license to spend" effect of annuity purchases
7. **SB-1 Spending Trajectory Dashboard** (HIGH) — Dual-line flat-vs-smile chart for every plan
8. **SB-2 Mental Accounting Gap Gauge** (HIGH) — "You Can Spend $X More" behavioral nudge
9. **SB-3 Category Age-Banding Chart** (MEDIUM) — Stacked area by spending category
10. **SB-4 Go-Go Phase Bucket List Planner** (MEDIUM) — Goal-based 10-year visualization
11. **SB-5 Consumption Puzzle Advisor Brief** (MEDIUM) — Auto-generated FPA-10 section
12. **Smile × Withdrawal Optimizer Integration** (HIGH) — Universal adapter layer for all withdrawal strategies
13. **Smile × Monte Carlo Integration** (HIGH) — Correlated spending shocks on declining baseline

## Topics Discovered From This Research

- RMD-as-behavioral-intervention design pattern (Planning Engine & AI)
- Spending Confidence platform positioning thesis (Strategic Lessons)
- Guaranteed income psychology vs. accumulation psychology UX (Planning Engine & AI)
- Advisor-as-Spending-Coach model (Operations & Workflow)
- HRS spending microdata validation methodology (Planning Engine & AI)
- "Spending wage" concept — systematic withdrawal framing (Planning Engine & AI)
- **sb-1: Smile × Withdrawal Optimizer Integration** (HIGH) — Universal adapter layer for all decumulation strategies
- **sb-2: "You Can Spend More" Behavioral Nudge** (HIGH) — Monthly personalized recommendation
- **sb-3: Go-Go Bucket List Planner** (MEDIUM) — 10-goal retirement bucket list workspace
- **sb-4: Tri-Variable Sensitivity Explorer** (MEDIUM) — 3D smile × inflation × healthcare surface
- **sb-5: Category Spending Override UI** (MEDIUM) — Client-specific decline rate sliders
- **sb-6: EBRI/BLS Data Update Pipeline** (LOW) — Annual federal data ingestion
- **sb-7: Smile × Monte Carlo Integration** (HIGH) — Age-correlated spending shock probability tree"
