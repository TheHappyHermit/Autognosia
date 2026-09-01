# Social Security Optimization Engines — Competitive Landscape

**Last updated:** 2026-05-15
**Session:** WealthForge deep research run
**Context:** 9-tool competitive landscape analysis. 55% of advisors use SS software (T3 2025). No existing tool does simultaneous optimization of SS + withdrawals + Roth conversions + RMD timing.

## Market Structure: Two Tiers

| Tier | Type | Examples | T3 Rating |
|------|------|----------|-----------|
| Standalone Specialists | Purpose-built SS optimization | Income Lab SS, Horsesmouth Savvy SS, SSAnalyzer | 8.50-8.60 |
| Platform SS Modules | Embedded in comprehensive planning | MoneyGuidePro SS, RightCapital SS, eMoney SS | ~7.0-7.6 (estimated) |

## The 9-Tool Landscape

### 1. Income Lab Social Security Optimizer — Highest Satisfaction (8.60 T3 2026)
- **Best for:** Retirement income specialists
- **Key features:** Snap to Optimal (instant strategy identification), heat map visualization, risk modeling (longevity + mortality), benefit cut stress testing, Retirement Paycheck view, standalone or suite
- **Differentiator:** Connects SS optimization to the FULL retirement plan — sees how claiming strategy affects portfolio withdrawals, spending power, and overall plan risk
- **Architecture:** Guardrails-based retirement distribution engine with SS as integrated module
- **Relevance:** Closest existing architecture model for WealthForge to replicate

### 2. Horsesmouth Savvy Social Security Planning — #1 3 Consecutive Years (8.59 T3 2026)
- **Best for:** Advisor SS education + practice development
- **Key features:** Unified multi-calculator application, whole-family modeling (blended families, dependent benefits, surviving spouse), client-facing reports, education materials
- **Differentiator:** Education + calculation suite, not just a calculator. Makes advisors SS experts
- **T3 status:** Only SS tool with "Software All-Star" designation 3 years running
- **Pricing:** Part of Horsesmouth membership/education program
- **Relevance:** Confirms SS optimization is a knowledge-gap market where advisor confidence matters as much as algorithmic precision

### 3. T. Rowe Price SSAnalyzer — Free, Top-Ranked Standalone
- **Best for:** Lead generation for retirement income conversation
- **Key features:** Unlimited custom strategies, side-by-side comparison, complex scenarios (divorced, widowed, still working), Social Security Zone™ visualization (best strategy across all life expectancies), COLA/inflation/tax impact, client-ready reports, IMEA 2025 Star Award
- **Differentiator:** FREE to advisors. Now bundled with Income Solver at no extra cost
- **Distribution strategy:** Part of T. Rowe Price's "The Power of Social Security" educational program
- **Relevance:** Validates that standalone SS tools are commodity lead generators, not standalone revenue drivers

### 4. MoneyGuidePro SS Module — Highest Market Share (15.93%)
- **Best for:** MGP platform users who need basic SS comparison
- **Features:** Compare up to 6 strategies, automatic calculations, full plan context
- **Differentiator:** Bundled into MGP subscription — adopted via convenience, not features
- **Limitation:** Basic comparison, no advanced optimization algorithms
- **Relevance:** Market share ≠ feature quality — confirms bundling power

### 5. RightCapital Social Security Optimization Module — 700+ Filing Strategies
- **Best for:** Comprehensive planning platform users
- **Features:** Evaluates 700+ filing strategies, optimal strategy per client, cumulative income comparison across strategies, discount rate configuration, integrated with Roth conversions and Monte Carlo
- **Limitations:** Only 5 predefined strategies (Optimal, Current, Age 62, FRA, Age 70). No custom scenario creation. No spousal coordination optimization. No WEP/GPO handling.
- **Relevance:** Integrated with "Solve for Top Strategies" engine but SS is treated as separate pre-step

### 6. Maximize My Social Security / MaxiFi — Kotlikoff Consumption-Smoothing
- **Best for:** Economics-focused planners seeking lifetime spending optimization
- **Pricing:** MMSS: $109-$149/yr household, $395-$595/yr professional per person; MaxiFi: $109-$149/yr individual, $599/yr advisor
- **Key features:** Searches thousands of benefit collection date combinations. Handles all major benefits (spousal, survivor, dependent, divorced, widowed, WEP, GPO). MaxiFi includes comprehensive planning with SS maximization
- **Differentiator:** Uses economic consumption-smoothing theory (Nobel Prize framework). Optimizes for lifetime sustainable spending, not ending wealth
- **Gap:** No advisor portfolio integration, no UMA/UMH, no household-level rebalancing. Pure planning-only.
- **Relevance:** Alternative objective function (lifetime spending vs. ending wealth) is a design option WealthForge should evaluate

### 7. Covisum Social Security Timing — Deepest Standalone Features
- **Best for:** Advisors who want dedicated SS + tax tools
- **Features:** Add client SS data, strategy comparison with graphs, cash flow year-by-year view, break-even analysis, client-facing presentation mode. Data integration with Tax Clarity (EMR visualization, IRMAA, bracket fill)
- **Ownership:** Formerly Brentmark product, now Covisum-owned. Paired with Tax Clarity as two-product SS+tax ecosystem
- **Pricing:** $595/yr single initial license (via Brentmark retail)
- **Relevance:** The two-product approach (SS + tax separate) contrasts with all-in-one integrated approach

### 8. LifeYield Social Security+ — Enterprise Embedding with Income Layers
- **Best for:** Large enterprises wanting embedded SS optimization via API
- **Features:** Proprietary SS algorithm, spousal/survivor/divorced-spouse scenarios, Income Layers visualization (SS + pension + annuity + portfolio withdrawals as stacked income streams), client-ready SSA filing instructions
- **Deployment:** Enterprise API or out-of-box UI. Part of SEI Multi-Account Overlay ecosystem.
- **Ownership:** SEI (acquired Dec 2024) — future independent availability uncertain
- **Relevance:** Most deeply integrated with retirement income planning, but now SEI-owned and unavailable as independent embeddable service for competing platforms

### 9. Social Security Analytics (socsecan.com) — Free DTC Tool
- **Best for:** DTC users who want free, transparent analysis
- **Features:** Evaluates every possible claiming month using valuation-based approach. Transparent methodology (no black box). No subscription.
- **Relevance:** Validates basic SS optimization is commoditized and available for free. Value is in the broader integration.

## The Critical Gap: No Simultaneous Optimization

Every existing tool treats SS optimization as a DISCRETE "pick the filing age" step separate from withdrawal/Roth/RMD optimization:

| Tool | SS Opt. | Withdrawal Seq. | Roth Conv. | IRMAA | RMD | Connected? |
|------|---------|----------------|------------|-------|-----|-----------|
| LifeYield SS+ | ✅ Deep | ✅ Integrated | ✅ | ✅ | ✅ | ✅ Best (in RIS module) |
| Income Lab | ✅ Deep | ✅ Integrated | ✅ (Tax Lab) | ✅ | ✅ | ✅ Good |
| SSAnalyzer | ✅ Deep | ❌ Standalone | ❌ | ❌ | ❌ | ❌ Isolated |
| MoneyGuidePro SS | ⚠️ Basic | ⚠️ Partial | ⚠️ Partial | ⚠️ | ⚠️ | ❌ Weak |
| RightCapital | ✅ Deep | ✅ Integrated (Solve) | ✅ | ✅ | ✅ | ⚠️ SS not part of Solve |
| MaxiFi | ✅ Deep | ✅ Integrated | ✅ | ❌ | ✅ | ⚠️ No IRMAA |
| Horsesmouth | ✅ Deep | ❌ Education only | ❌ | ❌ | ❌ | ❌ Isolated |
| Covisum SST | ✅ Deep | ❌ Standalone | ❌ | ❌ (via TC) | ❌ | ❌ Separate products |

**Key insight:** Even the most integrated tools (LifeYield, Income Lab) handle SS optimization as a sequential pre-step rather than optimizing SS filing age SIMULTANEOUSLY with withdrawal sequencing, Roth conversion amounts, and RMD timing. This is WealthForge's product opportunity: a simultaneous solver for all four levers.

## WealthForge Build Recommendations

### Must-Build Components
1. **SS Benefit Calculation Engine** — PIA, FRA, delayed credits, reductions, spousal/survivor/divorced/spouse formulas, WEP/GPO, family maximum
2. **SS Present Value Optimizer** — Search across filing date combinations maximizing lifetime benefit present value
3. **SS + Withdrawal + Roth + RMD Simultaneous Solver** — The differentiator: optimize all four levers as one problem

### High-Value Visualizations
4. **SS Tax Torpedo Visualizer** — Shows the 0-50-85% inclusion formula creating 46.25%+ effective marginal rates
5. **SS + IRMAA Interaction Module** — Two-year lookback coordination preventing the Roth-conversion-at-63→IRMAA-surcharge-at-65 trap
6. **Social Security Zone™ Replicate** — Best strategy across all life expectancies (per T. Rowe Price pattern)
7. **Couples' Simultaneous SS Optimization** — Hundreds of thousands of filing date combinations for two-earner couples

### Quick Win Features
8. **SSA-44 Appeal Integration** — Check if SSA-44 appeal is available after optimal filing strategy identified

## Related Sources from This Session
- LifeYield Social Security+ one-pager (2025 PDF)
- T. Rowe Price SSAnalyzer product page
- Income Lab Social Security Optimizer page
- Maximize My Social Security pricing/how-it-works
- SmartAsset SS software comparison guide
- RightCapital SS module docs
- T3 2026 survey data
- Horsesmouth Savvy SS press release
- Covisum Social Security Timing product tour
