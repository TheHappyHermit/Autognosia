# SORR Unified Simulator Architecture — Reference Pattern

## Purpose

Quick-reference for the Sequence of Return Risk (SORR) unified simulator architecture. Use this when researching ANY retirement withdrawal feature (guardrails, glidepaths, bucket strategies, flexible retirement dates, valuation-based allocation). The 5-dimension decomposition is a generalizable pattern for modeling interacting financial strategies.

## The 5 Interacting Strategy Dimensions

| # | Dimension | What It Controls | Key Sources |
|---|-----------|-----------------|-------------|
| 1 | **Asset Allocation Glidepath** | How equity/bond mix changes over time around retirement | Kitces Oct 2016 (bond tent), Kitces/Pfau SSRN 2014 (rising glidepath) |
| 2 | **Dynamic Spending Rules** | How spending adjusts based on portfolio performance | Guyton-Klinger JFP 2006, Kitces Mar 2024, Vanguard 2024, NOVEL-13 |
| 3 | **Bucket Strategy** | Portfolio partitioned by spending time horizon (cash/bonds/growth) | Kitces Nov 2014 (critique), Kitces Oct 2015 (mirage) |
| 4 | **Flexible Retirement Date Window** | Range of acceptable retirement dates with trigger conditions | Kitces Apr 2026 (cohort risk vs pure sequence risk) |
| 5 | **Valuation-Based Allocation Overlay** | Market-valuation-driven equity adjustments atop glidepath | Kitces Sep 2014 (CAPE overlay + rising glidepath optimal) |

## Architecture: Unified Simulator Engine

The engine runs ALL dimensions simultaneously, not independently:

```
Client Profile (portfolio, income, expenses, age)
    ↓
SORR Strategy Config (all 5 dimensions enabled/disabled + parameters)
    ↓
Unified SORR Simulator
    ├── Monte Carlo Engine (Student-t/bootstrapped returns)
    ├── Glidepath Calculator (5 types: static/declining/rising/bond-tent/v-shape)
    ├── Spending Rule Engine (7 strategies from NOVEL-13)
    ├── Bucket Simulator (3 buckets, refill logic, cash drag accounting)
    ├── Retirement Window Evaluator (trigger conditions, cohort risk)
    └── Valuation Overlay (CAPE/Q-ratio driven allocation shift)
    ↓
Multi-Scenario Results
    ├── Per-strategy comparison (with vs without)
    ├── Named historical scenarios (2008, 2000, 1966, 2022, 1929)
    ├── SORR Narrative (JSON timeline with spending/portfolio/guardrail events)
    └── Strategy Rationale Doc (compliance)
```

## Per-Dimension Architecture

### Dimension 1: Glidepath Engine

```
function computeGlidepathAllocation(age, retirementAge, config):
    type ∈ {static, declining, rising_glidepath, bond_tent, v_shape}
    
    bond_tent pattern: equity decreases pre-retirement (builds tent),
    minimum at retirement, increases post-retirement (unwinds)
    
    rising_glidepath: equity flat pre-retirement, increases post-retirement
    (Kitces/Pfau SSRN 2497053)
```

**Key parameters**: min_equity_pct (0.35), max_equity_pct (0.80), tent_duration_pre (5yr), tent_duration_post (10yr)

### Dimension 2: Spending Rule Engine

See `research_NOVEL-13_retirement_withdrawal_guardrails.md` for full 7-strategy interface.

### Dimension 3: Bucket Strategy

```
Bucket 1 (Cash):     2yr of spending → cash/short-term bonds
Bucket 2 (Income):   7yr of spending → intermediate bonds  
Bucket 3 (Growth):   Rest → equities

Refill: B1 < 50% → sell from B2. B2 < 50% → sell from B3.
```

**Behavioral note**: Buckets are mathematically suboptimal (~0.5%/yr drag, Kitces 2014) but behaviorally superior. Present total-return maths, visualize as buckets.

### Dimension 4: Retirement Window

```
Window: [earliest_date, latest_date]
Triggers ∈ {portfolio_reached, cape_below_threshold, spending_covered, date_reached}

Retire when ANY trigger fires. Each year of delay improves SORR outcome.
```

**Cohort risk** (Kitces Apr 2026): Separates overall market environment (cohort) from order of returns (sequence). A bad cohort overwhelms any sequence protection.

### Dimension 5: Valuation Overlay

```
CAPE < 15: +15% equity (cheap stocks)
CAPE 15-30: linear interpolation
CAPE > 30: -15% equity (expensive stocks)

Overlay sits ON TOP of glidepath: effective_equity = glidepath_equity * cape_factor
```

## Named Historical Scenarios for Stress Testing

| Scenario | Years | Equity Return | Bond Return | Inflation | Best For Testing |
|----------|-------|--------------|-------------|-----------|------------------|
| 2000-2003 Tech Wreck | 4yr | -49% cum | +31% cum | Low | Rising glidepath protection |
| 2008-2009 GFC | 2yr | -51% cum | +12% cum | Low | Bucket strategy + dynamic spending |
| 1966-1982 Stagflation | 17yr | +6.8% nom (0% real) | High | 8-12% | Inflation hedge + fixed-vs-variable spending |
| 1973-1974 Oil Crisis | 2yr | -37% cum | +6% | 8-9% | Equity-heavy glidepath failure |
| 2022 Rate Shock | 1yr | -18% S&P | -13% Agg | 8% | Bond tent failure (bonds crashed too) |
| 1929-1932 Depression | 4yr | -83% cum | +5% | -6% | Extreme SORR / total portfolio collapse |

## Common Pitfalls

1. **Buckets and glidepaths interact non-trivially**: Bucket partitioning affects the effective asset allocation. A 60/40 portfolio hidden inside a bucket strategy is not the same as a straightforward 60/40 — the refill timing changes the realized allocation path.

2. **Bond tent in taxable = tax problem**: Unwinding means selling bonds (gains) and buying equities for 10-15 years. In taxable accounts, this generates capital gains. The SORR benefit may be offset by tax cost. Always run a tax-adjusted comparison.

3. **CAPE can be wrong for a decade**: The Shiller CAPE was above 30 from 2017-2022 (5+ years). A CAPE-based strategy would have kept allocation defensive through a bull market. Mitigation: use multiple metrics, cap the overlay shift at 15%.

4. **The "2022 blind spot":** 2022 proved bonds and stocks can crash simultaneously. This breaks the bond tent assumption that bonds protect during equity drawdowns. The 2022 scenario is the hardest test for any SORR strategy.

5. **Flexible retirement date is hard to model**: It's a real-options problem, not a linear projection. The main benefit is giving the portfolio 1-3 more years of compound growth while SS delayed credits accumulate. Simple approximation: model retirement at earliest, target, and latest date; show the difference.

## When to Use This Pattern

Load this reference when researching:
- Any retirement withdrawal feature (guardrails, spending rules, withdrawal sequence)
- Asset allocation strategy near retirement (glidepath optimization)
- Bucket strategy design or critique
- Flexible retirement date / phased retirement
- Valuation-based tactical allocation
- Any feature where strategy dimensions interact (the 5-dimension decomposition approach generalizes)

## Related Files

- `research_NOVEL-13_retirement_withdrawal_guardrails.md` — Full 7-strategy spending rule engine
- RESEARCH.md SORR entry 2026-05-15 — Full 12-section research with 20 sources
- `references/rising-equity-glidepath-framework.md` — Glidepath-specific numerical results
