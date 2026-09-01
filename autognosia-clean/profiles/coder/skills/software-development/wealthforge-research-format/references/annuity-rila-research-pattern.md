# Annuity & RILA Research Methodology

Annuities are structurally unique among WealthForge research domains: they are **SEC-regulated securities** (unlike life/LTC/disability insurance), have **product mechanics that require path-dependent Monte Carlo** (unlike fixed-income assets), and involve **carrier credit risk** (unlike retirement accounts). This reference covers the research methodology specific to annuity and RILA topics.

## When to Load This Reference

Load this reference (via `skill_view(name='wealthforge-research-format', file_path='references/annuity-rila-research-pattern.md')`) when researching ANY annuity topic: RILA/buffered annuities, FIAs, SPIAs, MYGAs, VAs, QLACs, DIA, annuity income riders (GLWB/GMWB), annuity taxation, 1035 exchanges, or annuity suitability analysis. Also load when the feature involves any income rider, buffer product, or structured product that maps stock index returns with downside protection.

## Key Differences from Insurance & Tax Research

| Dimension | Life/LTC/Disability Insurance | Annuities & RILAs | Tax/Retirement |
|-----------|-------------------------------|-------------------|----------------|
| **Regulator** | State Insurance DOI | SEC + FINRA + State DOI | IRS, Treasury |
| **License needed** | State insurance license | FINRA Series 7/6/66 + state license | CPA, EA |
| **Product register** | Policy contract | Prospectus (SEC filing) | N/A |
| **Fee model** | Commission, M&E charges, COI | 0% base (RILA), M&E (VA), rider fees | N/A |
| **Guarantee type** | Insurance company backing | Contractual + state guaranty assoc. | Statutory (IRS) |
| **Underwriting** | Medical/financial (life, LTC, DI) | None (annuities) or simplified (GLWB) | None |
| **Tax deferral** | Cash value growth | Yes (earnings tax-deferred until withdrawal) | 401k/IRA |
| **Market exposure** | Via separate accounts | Direct index-linked (RILA/FIA) or sub-accounts (VA) | Market |
| **Comparision methodology** | Dual lens (needs analysis + cash value IRR) | Path-dependent MC + product-structure comparison | Deterministic formulas + scenario analysis |

## The Four Annuity Product Categories

Every annuity research entry must classify products into the correct category before analysis:

### 1. Fixed Annuities (MYGA, Multi-Year Guaranteed Annuity)
- **Definition:** Insurance company pays fixed interest rate for defined term (3-10 years)
- **Key features:** Known rate, full principal protection, limited upside
- **Regulation:** State insurance only (NOT a security)
- **Upside mechanism:** None — fixed rate only
- **Downside protection:** 100% principal protected
- **Fee structure:** No M&E, no rider fees (bundle)
- **Best for:** Conservative investors, CD replacement, short- to medium-term tax deferral
- **Data sources:** AnnuityRateWatch, Blueprint Income, carrier rate sheets

### 2. Fixed Index Annuities (FIA)
- **Definition:** Insurance company credits interest based on stock market index, with full principal protection
- **Key features:** Cap rate or participation rate, 0% floor (never lose money), longer surrender (7-10yr)
- **Regulation:** State insurance only (NOT a security, per SEC Rule 151A exemption)
- **Upside mechanism:** Cap rate (max gain %), participation rate (% of index gain), spread/margin
- **Downside protection:** 100% principal protected (0% floor guaranteed)
- **Fee structure:** No explicit fees (built into cap/participation rate)
- **Best for:** Conservative-to-moderate risk, principal protection priority, long-term accumulation
- **Data sources:** MyAnnuityStore, AnnuityRateWatch, carrier websites

### 3. Registered Index-Linked Annuities (RILA / Buffered / Structured)
- **Definition:** Security that tracks market index with partial downside protection (buffer or floor) in exchange for higher caps than FIAs
- **Key features:** multiple index options per product, multi-year segments (1-6yr), buffer/floor/protection levels (10/20/30%), cap or participation rate, some have GLWB riders, step-up features
- **Regulation:** SEC-registered security (prospectus required) + FINRA + state insurance
- **Upside mechanism:** Cap rate (higher than FIA typically), participation rate (50-150%), trigger rate (binary)
- **Downside protection:** Partial — buffer absorbs first X% of loss, floor caps loss at X%
- **Fee structure:** 0% base fee (RILA) or low M&E (~0.50-0.75%/yr for VA-style RILA). Rider fees: GLWB 0.50-1.25%/yr, death benefit 0.15-0.35%/yr
- **Best for:** Moderate-risk investors, growth+guardrails, retirement accumulation within 5-15 years
- **Path-dependent modeling:** REQUIRED — RILA crediting cannot be modeled with independent annual draws
- **Data sources:** Carrier websites for cap rates, Retirement Income Journal, LIMRA market data

### 4. Variable Annuities (VA)
- **Definition:** Security with sub-account investment options (mutual fund-like), full market exposure, optional guarantees
- **Key features:** Sub-account selection, separate account assets, optional GMIB/GMWB/GLWB, death benefit, M&E fees 1-2%
- **Regulation:** SEC + FINRA (full prospectus)
- **Upside mechanism:** Full market exposure (min/max dependent on sub-account options, typically no cap)
- **Downside protection:** None (unless rider purchased separately)
- **Fee structure:** M&E 1.0-1.5% + sub-account fees 0.5-1.5% + rider fees 0.5-1.5% = total 2-4%/yr
- **Best for:** Clients who want market exposure with optional living benefit guarantees (declining market share)
- **Data sources:** Morningstar VA database, Milliman quarterly updates, Carrier prospectuses

### Comparison Summary Table (for BUILD SPEC Appendix)

| Feature | MYGA | FIA | RILA | VA |
|---------|------|-----|------|-----|
| Annual fee | 0% (bundled) | 0% (built into cap) | 0% (base) | 1.0-1.5% M&E |
| Upside potential | Low (fixed rate) | Medium (capped) | Medium-High (higher caps) | Full market |
| Downside protection | 100% principal | 100% floor at 0% | Partial (buffer or floor) | None (unless rider) |
| SEC/FINRA | No | No (SEC exempt) | Yes | Yes |
| GLWB available | Rare | Yes | Yes (growing) | Yes |
| Surrender period | 3-10yr | 7-10yr | 5-10yr | 6-10yr |
| Transparency | Most transparent | Opaque (cap reset risk) | Moderate (cap disclosure) | Most complex |
| Current growth | Mature | Plateauing at ~$126B | Fastest-growing (+20% YoY) | Declining |

## RILA Product Structure Reference

RILAs are the most complex annuity type and the fastest-growing. Every RILA research entry must model these product parameters:

### Structural Parameters (Per Term — 1 to 6 Years):

1. **Protection Method:**
   - `buffer` — Loss within buffer absorbed by carrier; loss beyond buffer passes through
   - `floor` — Loss capped at floor level (e.g., -10% floor = worst case -10%)
   - `dual_direction` — Symmetric participation both up and down (e.g., 85% of index gain AND 85% of loss)
   - `dual_step_up` — Like dual-direction but with step-up gain lock-in features
   - `trigger` — Binary outcome: if index positive, credit trigger rate; if negative, 0%

2. **Protection Level:**
   - Buffer: 10%, 20%, 30% (most common; absorbs losses up to that %)
   - Floor: 1%, 5%, 10% (most common; loss capped at this level)
   - Participation rate: e.g., 85% symmetric participation

3. **Crediting Method:**
   - `cap_rate` — Maximum gain percentage (e.g., 12% cap = max 12% return)
   - `participation_rate` — Percentage of index gain credited (e.g., 100% = full index return, capped if applicable)
   - `trigger_rate` — If index is positive, credit fixed amount (e.g., 7% trigger)

4. **Available Indices (per carrier):**
   - S&P 500 Price Return Index (SPX) — most common
   - S&P 500 Total Return Index (SPTR) — less common, includes dividends
   - Nasdaq 100 (NDX) — higher volatility, higher caps
   - Russell 2000 (RTY) — small cap exposure
   - MSCI EAFE (MXEA) — international developed markets
   - Custom multi-asset indices (carrier-specific)

5. **Term Length Options:**
   - 1-year, 2-year, 3-year, 5-year, 6-year (varies by product)
   - Shorter terms: more frequent cap resets, higher optionality
   - Longer terms: higher caps typically, less flexibility

6. **Step-Up Features:**
   - None — no gain lock-in during term
   - Annual — gains locked in each year, cap resets
   - Quarterly — more frequent step-up, lower caps typically
   - No-step-up — full term performance at term end

7. **GLWB Rider Parameters (when included):**
   - Roll-up type: simple (premium + annual %) or compound
   - Roll-up rate: typically 5-8% during deferral
   - Withdrawal percentage: 4-6% of benefit base for life
   - Step-up: greater_of(roll_up, actual_gain) on annual anniversaries
   - Rider fee: 0.50-1.25% of benefit base annually

### Cap Rate Behavior (For Renewal/Re-Evaluation Research):

RILA cap rates are NOT fixed — they change at each term start, driven by:
- **Interest rate environment** — Higher rates = higher caps (carriers earn more on bond backing)
- **Market volatility (VIX)** — Higher volatility = lower caps (option costs increase)
- **Competitive landscape** — New entrant carriers often offer higher caps for market share
- **Credit spreads** — Wider spreads = higher caps

Research implication: A client's RILA purchased in 2023 (low rates, low caps) may have significantly better terms on renewal in 2026 (higher rates, higher caps). The term renewal dashboard (RL-5 widget) must monitor current vs. purchase cap rates.

### Path-Dependent Monte Carlo Modeling

Standard portfolio Monte Carlo (independent annual draws) is INCORRECT for RILAs. The correct approach:

```python
# WRONG — treats each year independently
for year in range(30):
    return_i = sample_from_distribution()
    value *= (1 + return_i)  # No term structure, no step-up, no carryover

# CORRECT — path-dependent multi-term simulation
rila_terms = [
    {"term_length": 1, "buffer": 0.10, "cap": 0.12, "index": "SPX"},
    {"term_length": 3, "buffer": 0.20, "cap": 0.08, "index": "SPX"},
    # ... 30 years of term selections
]

account_value = initial_premium
benefit_base = initial_premium  # For GLWB tracking

for term in rila_terms:
    # Generate term-length returns
    term_returns = sample_returns(term['term_length'])
    
    # For each multi-year term, apply RILA crediting per year
    for yr_return in term_returns:
        if term['buffer'] and yr_return >= -term['buffer']:
            crediting = max(0, min(yr_return, term['cap']))
        elif term['buffer']:  # loss exceeds buffer
            crediting = yr_return + term['buffer']
        else:  # floor model
            crediting = max(-term['floor'], min(yr_return, term['cap']))
        
        account_value *= (1 + crediting)
    
    # Step-up (if applicable)
    if step_up_frequency == 'annual':
        benefit_base = max(benefit_base, account_value)
        benefit_base *= (1 + roll_up_rate)
```

**Key research consideration:** The path-dependent nature means that the ORDER of market returns matters, not just the distribution. A 3-year RILA term with good→good→bad years produces a different outcome than bad→good→good years, because step-ups lock in gains after good years. This is fundamentally different from portfolio MC where the order doesn't matter for the final value (only the geometric mean matters).

## Required Sources — Annuity/RILA Research

### Tier 1: Market Data & Industry Statistics

- **LIMRA U.S. Retail Annuity Sales Reports** (quarterly) — The definitive source for annuity sales by product type, carrier market share, and distribution channel. RILA sales data: $57.4B in 2025 (+20% YoY), $21.2B in Q1 2026 (30th consecutive quarter of growth). https://www.limra.com/en/newsroom/
- **Milliman Variable Annuity Market Update** (quarterly) — Detailed VA and RILA market data by carrier, including hedging metrics, AUM, and product feature trends. https://www.milliman.com/en/insight/milliman-variable-annuity-market-update
- **Morningstar Annuity Research** — Annuity product ratings, fee analysis, and carrier financial strength. Annual "State of Retirement Income" reports include annuity allocation analysis. https://www.morningstar.com/annuities
- **Retirement Income Journal** — The most authoritative independent source for annuity product deep-dives. Key series: "A Look at Nine RILA Income Riders" (Oct 2025 — GLWB comparison), "RILA Sales 2011-2025" (historical growth chart). https://retirementincomejournal.com/article-categories/annuities/
- **FA Magazine / Financial Advisor** — RILA industry analysis and advisor adoption trends. "RILAs Continue Their Wild Ride" (Sep 2025 — market growth and competition). https://www.fa-mag.com/

### Tier 2: Academic & Practitioner Research

- **Moenig, Thorsten. "RILAs in the Decumulation Phase"** (Journal of Risk and Insurance, Jan 2026) — First academic study of RILAs in retirement spending. Found buffer RILAs extend portfolio sustainability by 1-3 years. doi:10.1111/jori.70039. Search for abstract via Semantic Scholar or Wiley Online Library.
- **Moenig, Thorsten. "It's RILA Time: An Introduction to Registered Index-Linked Annuities"** (Journal of Risk and Insurance, 2022) — Definitive academic introduction. Citations: 30+. Available on SSRN.
- **Pfau, Wade D. "Protection as an Asset Class"** (2023, Equitable-funded research) — Framework for treating RILAs as explicit asset classes in portfolio construction. RILA-efficient frontier concept. Available at protectedincome.org.
- **Pfau, Wade D. "Shifting the Efficient Frontier"** (CFP Board CE, Sep 2024) — Empirical demonstration that 10-30% RILA allocation improves risk-adjusted portfolio returns.
- **Blanchett, David. "RILAs: Buffers are Still Much Better than Floors"** (Advisor Perspectives, Sep 2023) — Head of Retirement Research at Morningstar. Buffer structures dominate floor structures across most scenarios.
- **Blanchett, David & Finke, Michael. "The Role of Annuities in an Optimal Retirement Portfolio"** (2021, LIMRA) — Framework for annuity allocation in retirement portfolios.
- **Ellis, Moenig, Volkman-Wise. "Registered Index-Linked Annuities in Qualified Retirement Plans"** (Journal of Risk and Insurance) — RILA pricing in 401(k)/IRA context.

### Tier 3: Product & Rate Data (For BUILD SPEC)

- **MyAnnuityStore** — Best current source for RILA rate data and carrier comparisons. Updated regularly for 2026 products. Search "[carrier name] RILA review 2026". https://myannuitystore.com/annuities/registered-index-linked-annuity-rila/
- **GoodAnnuity.com** — Side-by-side comparison of 500+ annuity products. Consumer-facing but advisor-useful for rate comparisons. https://goodannuity.com/
- **Charles Schwab RILA Rates** — Schwab offers RILAs through their platform; their rate page is a reliable market reference. https://www.schwab.com/annuities/indexed-annuities/registered-index-linked-annuity-rates
- **AnnuityRateWatch** — Professional annuity rate data platform for advisors. https://www.annuityratewatch.com/variable-annuity-rila-rates
- **DPL Financial Partners** — Fee-only RILA marketplace. Good for understanding the RIA channel product landscape. https://www.dplfp.com/advisor/products-annuities/registered-index-linked-annuity

### Tier 4: Regulatory Sources

- **SEC Investor.gov — RILA Definition** — Official SEC description and regulatory classification. https://www.investor.gov/introduction-investing/investing-basics/glossary/registered-index-linked-annuity-rila
- **SEC Investor Testing Report on RILAs** (Sep 2023) — Congressional mandate under SECURE 2.0 §508. Tested RILA disclosure effectiveness. https://www.sec.gov/files/rila-report-092023.pdf
- **FINRA Rule 2330** — Members' Responsibilities Regarding Deferred Variable Annuities. Applies to RILAs. Requires suitability determination, principal review, 7-day letter.
- **NAIC Suitability in Annuity Transactions Model Regulation #275** — Best-interest standard for annuity recommendations. Adopted in most states.
- **NAIC Annuity Disclosure Model Regulation** — Disclosure requirements for annuity contracts.

### Tier 5: Advisor Sentiment & Competitive Intelligence

- **Reddit /r/CFP** — Advisor discussions on RILA recommendations, suitability concerns, and product preferences. Search "rila OR buffered annuity OR buffer annuity site:reddit.com/r/CFP"
- **Kitces.com comments** — Advisor comments on article discussions about annuities. Search "site:kitces.com annuity RILA"
- **LinkedIn advisor posts** — Insurance specialists and advisors sharing RILA case studies. Search "RILA annuity" posts on LinkedIn

## Insurance Company Financial Health — Required Citation

Every annuity recommendation requires carrier financial strength citation. Include AM Best, S&P, Moody's, and Fitch ratings for every carrier in a product comparison. Required fields:

```python
carrier_financials = {
    "am_best": "A+ (Superior)",
    "am_best_outlook": "Stable",
    "s_and_p": "AA- (Very Strong)", 
    "moodys": "A1 (Upper Medium)",
    "fitch": "A+ (Strong)",
    "comdex_score": 90,  # 1-100 percentile of all ratings agencies
    "total_assets": 95_000_000_000,  # e.g., Jackson $95B
    "state_guaranty": 250_000,  # State guaranty limit
    "market_share_pct": 0.10,  # e.g., 10% RILA market share
}
```

## Annuity Tax Treatment Reference

### Non-Qualified Annuities (After-Tax Money):
- **LIFO taxation:** Earnings come out first (taxed as ordinary income); basis is recovered after all earnings distributed
- **1035 exchange:** Tax-free exchange to another annuity contract (different carrier, different type, same owner allowed)
- **Death benefit taxation:** Beneficiary pays ordinary income on earnings above basis (no step-up in basis at death per IRC Sec. 72)
- **Exclusion ratio (annuitization):** Portion of each payment = basis / expected return, tax-free; remainder taxed as ordinary income
- **Early withdrawal penalty:** 10% penalty on earnings withdrawn before age 59½ (IRC Sec. 72(q))

### Qualified Annuities (Inside IRA/401k):
- **100% taxable:** All withdrawals taxed as ordinary income (no basis component)
- **RMDs apply:** Annuity in IRA treated as part of IRA for RMD calculation
- **RMD coordination:** RILA segments in IRA may conflict with RMD timing — staggering strategy required
- **No 1035 out of IRA:** Cannot 1035-exchange from IRA annuity to non-qualified contract

## Path-Dependent RILA MC — When to USE vs When NOT TO USE

### USE path-dependent MC when:
- Modeling RILA with multi-year terms (2-6 years) where buffer resets every term
- RILA has step-up features (annual/quarterly gain lock-in)
- GLWB rider with benefit base tracking is included
- Research questions: "What's the distribution of account values at age 85?" with RILA allocation

### DO NOT USE (standard MC sufficient) when:
- Modeling MYGA or fixed annuities (known rate, no market linkage)
- Modeling SPIA or DIA (known income stream, no account value volatility)
- Modeling FIA with annual reset (each year independent, 0% floor each year)
- Question is about immediate income, not long-term accumulation
- The RILA has a 1-year term with no step-up (each year independent, can use standard MC per-year draws)

## RILA-GLWB Rider Fee Economic Evaluation Pattern

The GLWB rider is the most complex and most often misunderstood annuity feature. Research must answer: "Is paying 0.85%/yr for a guaranteed lifetime withdrawal benefit economically rational for this client?"

### The Three Regimes:

1. **Regime A: Rider is net positive** — Client lives to or beyond life expectancy, market returns are low or negative, and the benefit base > account value for a significant period. Guaranteed withdrawals exceed what the account value alone would have supported.

2. **Regime B: Rider is net neutral** — Client dies near life expectancy with account value approximately equal to benefit base. The rider fee was effectively a waste (paid guarantees that were never used).

3. **Regime C: Rider is net negative** — Client dies early (before 75-80), or market returns are so strong that account value far exceeds the benefit base. The rider fee was pure cost.

**Research output:** Probability distribution across Regimes A/B/C for a given client profile. Typical finding: For a 65-year-old healthy male, the GLWB rider has ~35-45% probability of being net positive (Pfau 2024, Moenig 2026).

## Annuity Red Teaming — Patterns Beyond General 12-Section

In addition to the 10 red-team edge cases from the RILA research entry, these failures are common across all annuity types:

| Failure Mode | Risk | Mitigation |
|---|---|---|
| **Cap rate bait-and-switch** — Carrier quotes high intro cap, drops it at renewal | Medium | Show contract: cap rate not guaranteed beyond current term. Include renewal dashboard. |
| **Surrender charge locking** — Client needs funds but locked for 7+ years | High | Always show liquidity schedule. Recommend laddered terms (some maturing each year). |
| **Carrier financial failure** (smaller insurers, B++ ratings) | Medium-High | Required: state guaranty coverage display. Warn if premium > state limit. |
| **GLWB over-optimization** — Client assumes roll-up rate = actual return | High | Show BOTH account value AND benefit base. Mark the gap as "protection insurance value." |
| **RMD coordination failure** — RILA term doesn't allow RMD access | High | Required: RILA+RMD coordination analysis (rila-4 feature) — stagger terms for annual RMDs. |
| **Rider fee drag on modest accounts** — 0.85% fee on $100K = $850/yr | Medium | Fee-to-benefit ratio: "You're paying $X/yr for a guarantee that has Y% chance of mattering." |
| **Tax deferral vs. step-up tradeoff** — LIFO taxation on non-qualified RILA | Medium | Tax comparison: non-qualified annuity growth vs. taxable account at client's bracket. |
| **1035 exchange resetting surrender clock** — New 7-year surrender period | High | Show surrender schedule overlap analysis: remaining vs new surrender. |
