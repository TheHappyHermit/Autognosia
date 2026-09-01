# Retirement Income Guardrails — Condensed Reference

**Source:** Deep research session 2026-05-15
**Full findings:** RESEARCH.md under "Retirement Income Guardrails Research Literature — Dynamic Spending Methodology"

## The Three Guardrail Approaches

### 1. Guyton-Klinger Withdrawal-Rate Guardrails (2006)
- Fixed guardrails based on **withdrawal rate changes** relative to *initial* rate (not current)
- Upper guardrail: if WR falls 20% below initial → INCREASE spending by 10%
- Lower guardrail: if WR rises 20% above initial → DECREASE spending by 10%
- Capital preservation rule: if WR rises 20% in a single year → cut 10%
- 5% initial withdrawal rate, rules-based adjustments

**Problems:** Over-corrects for losses (GFC 2008 → 28% cut vs. 3% for risk-based). Assumes steady withdrawals throughout retirement. Preserves far more capital than needed. Ignores full financial plan (SS, taxes, variable expenses).

### 2. Kitces Ratcheting Rule (2015)
- Asymmetric: spending can rise but never falls
- 4% rule baseline; if portfolio grows in real terms, re-base 4% on higher value
- "Weakly dominant" strategy — never worse than static 4%, often better
- Psychological insight: retirees tolerate flat + love increases but deeply hate cuts

**Problem:** Still withdrawal-rate-based. No guardrails for market losses. Can lead to overspending in worst-case sequences.

### 3. Risk-Based Guardrails (Fitzpatrick/Tharp, 2021-2024) ✅ RECOMMENDED
- Spending boundaries defined by **Monte Carlo probability-of-success thresholds**, not withdrawal rate bands
- Uses full financial plan context (SS, pensions, taxes, expenses, RMDs)
- Three core concepts:

| Concept | Definition |
|---------|-----------|
| **Spending capacity** | The "best guess" spending — level where plan is equally likely to overspend as underspend (50th percentile of MC distribution) |
| **Upper guardrail** | Portfolio threshold where underspending is likely → permission to increase spending |
| **Lower guardrail** | Portfolio threshold where overspending is likely → recommended cut |

## The Retirement Distribution Hatchet (Tharp & Fitzpatrick, 2021)

The 4% rule fails because real retirement spending has a **hatchet shape**:
- **Early years (pre-SS):** Heavy portfolio withdrawals fund 100% of expenses
- **Later years (post-SS):** Guaranteed income covers most expenses, portfolio burden drops sharply

Traditional Monte Carlo assumes steady inflation-adjusted withdrawals and systematically underestimates safe spending because it doesn't account for this shape.

**Fix:** Model the full distribution of all income sources and expenses at their actual timing, then derive spending capacity from the complete simulation distribution, not from a single withdrawal rate.

## Overspending/Underspending Framework (Fitzpatrick, 2024)

**The Monte Carlo bias:** "Probability of success" focuses only on minimizing risk of running out of money. 100% probability of success = 100% probability of **underspending**. The success framing encourages excessive conservatism.

**New framing:** Balance two opposing risks:
- **Risk of overspending** (running out of money) — traditional focus
- **Risk of underspending** (not living fully) — traditional blind spot

**Guardrail zones for a retiree:**
- **Spending target:** $8,200/month (the "retirement paycheck")
- **Upper guardrail:** Portfolio reaches $2.5M → increase to $9,100
- **Lower guardrail:** Portfolio drops to $1.6M → reduce to $7,400

## Income Lab's Implementation Architecture

| Feature | Implementation |
|---------|---------------|
| **Recalculation frequency** | Monthly (not annual) — full MC simulation with current portfolio values |
| **Guardrail derivation** | Full MC with complete plan data (SS, taxes, expenses, RMDs) |
| **Spending cut on lower breach** | Specific dollar reduction — not a percentage or withdrawal-rate change |
| **Client portal** | Simplified: spending capacity + guardrails only (no MC metrics) |

**Key architectural choices:**
- MC simulation at every recalculation (computationally intensive but accurate)
- Full plan context every time (not portfolio-only)
- Dollar-based communication, not withdrawal rates
- Intentionally wide lower guardrail to avoid false triggers

## Historical Validation

| Scenario | GK Cut | Risk-Based Cut | Difference |
|----------|--------|---------------|------------|
| Pre-GFC 2008 | 28% | 3% | 25% less pain |
| Stagflation 1970s | 54% | 32% | 22% less pain |
| Avg 15 bear markets | 22% | 8% | 14% less pain |

**Spending improvement:** ~30% more lifetime income vs. total-return-with-rebalancing (WCI analysis).
**Blanchett research:** Real spending declines ~1-2%/year naturally — guardrails accommodate this; static rules force underspending.

## Competitive Landscape

| Platform | Guardrails | Recalc | Full Plan | T3 Share |
|----------|-----------|--------|-----------|----------|
| **Income Lab** | ✅ Risk-based | Monthly | ✅ | ~9% retirement |
| **IncomeConductor** | ⚠️ Time-segmented | Annual | Partial | Smaller |
| **Income Solver** | ⚠️ Algorithmic | Per-plan | Yes | ~3% |
| **Pralana** | ⚠️ WR-based | Annual | Yes | Niche |
| **eMoney** | ❌ None | N/A | Yes | 35.62% |
| **RightCapital** | ❌ None | N/A | Yes | 21.37% |
| **MGP** | ❌ None | N/A | Yes | 34.17% |

**Greenfield opportunity:** No comprehensive planning platform has native guardrails. Income Lab proves demand (~9% share, ~$2K/yr) but is standalone.

## Why Monthly Recalculation Matters

Income Lab recalculates monthly. Industry standard is annual. This is a **30x computational multiplier**:
- Requires sub-second Monte Carlo simulation
- Incremental computation to reuse prior results
- State management across ~400,000 simulated retirement months per plan
- Cost-optimized infrastructure for cloud compute

This architectural bar is the primary reason competitors haven't added guardrails.

## Client Communication Benefits

Pre-committed guardrails (specific dollar adjustments at specific portfolio thresholds) reduce anxiety vs. probabilistic projections:
- Non-articulated guardrails = "no plan at all" in client's eyes
- Pre-commitment removes emotional decision-making during downturns
- Dollar amounts > percentage probabilities for client understanding
- "Uncommunicated guardrails" = missed opportunity

**The double whammy:** Clients watching MC probability of success decline during a downturn experience anxiety from TWO sources (portfolio decline + declining MC metric). Removing MC metrics from client view and replacing with dollar-based guardrails reduces this.

## Relevance to WealthForge

1. **Risk-based guardrails are the correct methodology** — adopt the overspending/underspending framework, not withdrawal-rate-based approaches
2. **Greenfield opportunity** — no comprehensive planning platform has guardrails
3. **Monthly recalculation is a high architectural bar** — needs fast MC engine
4. **Guardrails + UMH execution is the killer combo** — guardrails trigger spending changes, UMH engine executes them (no existing tool connects recommendations to execution)
5. **The hatchet validates plan-awareness requirement** — guardrail system must account for SS timing, RMDs, taxes

## Topics Discovered From This Research
1. Overspending/underspending framework vs. probability of success (client communication paradigm)
2. Monthly recalculation architecture (30x performance requirement)
3. Income Lab's product/market fit (why comprehensive platforms haven't matched)
4. The retirement distribution hatchet (mathematical constraint on all WR-based rules)
5. Behavioral finance of pre-committed guardrails
6. Guardrail width optimization research (optimal band sizes)

## Key Sources
- https://www.kitces.com/blog/risk-based-monte-carlo-probability-of-success-guardrails-retirement-distribution-hatchet/ — Hatchet paper (Fitzpatrick & Tharp, Nov 2021)
- https://www.kitces.com/blog/retirement-income-risk-monte-carlo-probability-sucess-over-under-spend/ — Overspending/Underspending framework (Fitzpatrick, 2024)
- https://incomelaboratory.com/retirement-income-guardrails-complete-guide/ — Definitive advisor guide (Fitzpatrick, April 2026)
- https://www.kitces.com/blog/guyton-klinger-guardrails-retirement-income-rules-risk-based/ — Why GK is too risky
- https://help.incomelaboratory.com/methodology/how-are-a-plans-guardrails-and-spending-capacity-calculated — Income Lab methodology docs
- https://www.morningstar.com/retirement/how-retirement-income-guardrails-can-ease-clients-worries — Tharp on guardrail communication (May 2024)
- https://www.kitces.com/blog/the-ratcheting-safe-withdrawal-rate-a-more-dominant-version-of-the-4-rule/ — Kitces Ratcheting Rule (June 2015)
