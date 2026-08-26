# SSA-44 IRMAA Appeal Workflow — Strategic Reference

**Source:** Deep research session 2026-05-15
**Full findings:** RESEARCH.md under "SSA-44 'Beyond the Torpedo' Filing Strategy"

## What SSA-44 Is

Form SSA-44 ("Medicare Income-Related Monthly Adjustment Amount – Life-Changing Event") allows Medicare beneficiaries to request an IRMAA recalculation based on **current (lower) income** rather than the standard two-year lookback.

**Cost range:** $1,148-$6,936/person/year saved. Couple: $2,297-$13,872/year.
**It's a "new initial determination" not an "appeal"** — per SSA POMS HI 01120.001, this is a new decision using beneficiary-provided data, not a reopening of a prior determination. No need to follow multi-level appeals process.

## The 8 Qualifying Events

1. **Marriage** — Changes filing status or combined MAGI
2. **Divorce/Annulment** — Splits high-earning household, reduces individual MAGI
3. **Death of Spouse** — Survivor's income typically drops; MFJ→Single threshold change
4. **Work Stoppage** — Retirement (most common for retirees)
5. **Work Reduction** — Reduced hours, transition to part-time
6. **Loss of Income-Producing Property** — Disaster, arson, fraud, theft (not voluntary)
7. **Loss of Pension Income** — Employer pension plan disruption/termination
8. **Employer Settlement Payment** — Bankruptcy-related settlement

**☠️ What does NOT qualify:** Roth conversion (voluntary), capital gain from sale, large IRA distribution, business sale, real estate sale. These are voluntary income events, not life-changing events.

## Filing Process

**Step 1:** Indicate life-changing event type + date on SSA-44
**Step 2:** Enter tax year income decreased AND estimated AGI + tax-exempt interest
**Step 3 (Optional):** Estimate next year's MAGI. If omitted, SSA uses same year's estimate
**Step 4:** Attach documentation (see below)
**Step 5:** Sign under penalty of perjury

**Timing:** File AFTER receiving IRMAA Determination Letter. ~60-day window but file ASAP.
**Per person:** EACH individual must file their own SSA-44.

## Critical POMS Discovery (from HI 01120.005)

> *"If the beneficiary attests under penalty of perjury that the LCE caused the significant reduction in income, we accept that statement. We do not develop the types of income that make up the MAGI, just that the MAGI decreased and that the LCE occurred."*

**Implication:** SSA does NOT scrutinize where the income reduction came from. They don't ask for a breakdown of income sources — just total estimated AGI. This has major implications for the "one big conversion" strategy (see below).

Additional POMS details:
- LCE **may have occurred at any time in the past** — no lookback limit on qualifying event
- "Significant reduction" = reduces or eliminates IRMAA for a specific tax year (binary test)
- Verbal request accepted — SSA-44 form itself is optional (but recommended for documentation)
- SSA does NOT extend findings to non-reporting spouse
- Good cause exception for late filing (GN 03101.020)

## Documentation Requirements

**What advisors recommend (best practice):**
- Employer retirement letter detailing change in status
- Final pay stub or severance statement
- W2 showing prior full income vs. current reduced income
- Income estimate spreadsheet

**What SSA legally requires (per POMS):**
- Perjury-attested statement on SSA-44
- Evidence the LCE occurred (can be self-written letter)
- The POMS states they "do not develop the types of income" — just verify LCE + MAGI decrease

**Gap:** The advisor best-practice documentation is heavier than legally necessary. Self-created income estimate spreadsheet is typically sufficient.

## The "One Big Conversion" Strategic Enabler

The conventional wisdom says: avoid large one-year Roth conversions because they trigger IRMAA. SSA-44 changes this calculus.

**The strategic opportunity:**
1. Retiree genuinely retires (work stoppage) — qualifies as LCE
2. Does large one-year Roth conversion, pushing MAGI into IRMAA territory
3. Files SSA-44 citing work stoppage, provides post-retirement baseline income estimate (~$80K)
4. SSA accepts the estimate — does not scrutinize income sources
5. IRMAA is eliminated despite the conversion

**Boundary conditions:**
- Works best when baseline income (after retirement, before conversion) is BELOW the first IRMAA threshold ($218K MFJ)
- The "safe harbor" limit: total MAGI (baseline + conversion) must be below the first IRMAA threshold for SSA-44 to fully eliminate IRMAA. If total still exceeds $218K, Tier 1 surcharge applies
- Strategy is most valuable in the first post-retirement year when bracket space is widest
- The Roth conversion itself NEVER qualifies as the LCE — the genuine work stoppage is the LCE

## SSA-44 vs. Phase 2 Saturation Strategy Integration

From the saturation point research: after the SS tax torpedo saturates (~$60K non-SS income for MFJ with $48K SS), Roth conversions are taxed at the mere bracket rate (22-24%). SSA-44 adds a safety valve:

- Without SSA-44: retiring advisors fear IRMAA and convert too little
- With SSA-44: converts can be aggressive in year 1, knowing the appeal exists
- **Two-phase roadmap:** Phase 1 (gap years 62-69) + Phase 2 (post-SS, post-saturation) + SSA-44 as "IRMAA insurance" for Phase 2 conversion years

## Denial Reasons (from advisor surveys)

1. Insufficient evidence of the LCE (~50% of failed appeals)
2. Incomplete or inaccurate SSA-44 form
3. Income reduction not "significant" (didn't change IRMAA tier)
4. Event doesn't qualify (e.g., trying to use the Roth conversion itself)
5. Unrealistic income estimates (don't match eventual tax return)
6. Filed too early (before receiving Determination Letter)

**Appeal path after denial:** Reconsideration → Administrative Law Judge hearing → Appeals Council

## Competitive Landscape: SSA-44 Automation

| Tool | SSA-44 Support | Details |
|------|---------------|---------|
| **Income Lab** | ⚠️ Best guide (April 2026) | Educational content only, no automation. Guide by founder Justin Fitzpatrick, PhD, CFA, CFP |
| **Covisum Tax Clarity** | ❌ | EMR Tax Map shows IRMAA spikes but no appeal workflow |
| **RightCapital** | ❌ | IRMAA-aware but no SSA-44 features |
| **eMoney** | ❌ | Basic IRMAA line item only |
| **MoneyGuidePro** | ❌ | No SSA-44 support |
| **IRMAA Group (startup)** | ⚠️ In development | Purpose-built IRMAA calculator (waitlist 2026). Multi-variable income, 2-year lookback, cliff alerts, Roth conversion modeler |
| **Michael Ryan Money** | ❌ Blog + interactive tool | Self-serve IRMAA appeal checklist tool (web, not integrated) |

**Key gap: NO major platform has native SSA-44 workflow automation.** Greenfield opportunity.

## 7 Components WealthForge Could Build

1. **IRMAA Exposure Forecast** — Multi-year projection by premium year (not current year), factoring 2-year lookback
2. **SSA-44 Eligibility Engine** — Scan: (a) lookback MAGI > current income ? (b) LCE in timeline? → "Save $X/yr by filing"
3. **SSA-44 Form Pre-Filler** — Auto-populate from client data → fillable PDF
4. **Documentation Workflow Assistant** — Per-LCE checklist generator
5. **Conversion-IRMAA Safety Calculator** — "Convert up to $X without crossing Tier 1"
6. **Annual Renewal Tracker** — Calendar tracking for annual SSA-44 re-filing
7. **Save vs. Cost Report** — "Without SSA-44: $9,200/yr × 2 yr = $18,400. With SSA-44: $0"

## Temporal IRMAA Modeling Requirement

Most platforms model IRMAA using CURRENT-year MAGI. This is WRONG. The correct approach:

- 2026 IRMAA is based on 2024 MAGI
- 2027 IRMAA will be based on 2025 MAGI (which may include this year's Roth conversion)
- 2028 IRMAA will be based on 2026 MAGI (which reflects post-retirement income)

**Error magnitude:** Using current-year MAGI instead of correct lookback year can overestimate IRMAA cost of conversions by 50-200%.

**Correct model:** For each premium year Y, IRMAA is a function of MAGI in year Y-2, not Y. The optimizer must "stagger": decision in year T affects IRMAA in years T-2, T-1, T, T+1, T+2 depending on when the conversion income falls in the lookback window.

## Topics Discovered From This Research

1. **IRMAA Group startup** — New purpose-built competitor in IRMAA planning niche
2. **Retirement event + voluntary income spike interaction** — When large conversion can coexist with successful SSA-44 appeal
3. **SSA-44 form field specificity gap** — SSA requirements vs. advisor best practice
4. **"One big conversion" IRMAA safety valve** — SSA-44 as strategic enabler for aggressive Phase 2 Roth conversions
5. **Temporal IRMAA modeling error mode** — How current-year MAGI modeling overestimates conversion cost by 50-200%

## Key Sources

- SSA Form SSA-44: https://www.ssa.gov/forms/ssa-44.pdf
- SSA POMS HI 01120.001: https://secure.ssa.gov/poms.nsf/lnx/0601120001
- SSA POMS HI 01120.005: https://secure.ssa.gov/poms.nsf/lnx/0601120005
- Income Lab SSA-44 Guide (April 2026): https://incomelaboratory.com/irmaa-appeal-ssa-44-guide/
- Income Lab IRMAA Brackets Guide: https://incomelaboratory.com/irmaa-brackets-2026-guide/
- IRMAA Group: https://www.irmaagroup.com/calculator
- CMS 2026 Premiums: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
