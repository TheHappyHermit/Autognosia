# Rising Equity Glidepath — Canonical Framework

> Foundational numerical results, algorithmic specification, and scenario framework from Pfau & Kitces (JFP 2014), Kitces & Pfau (SSRN 2497053), and Big ERN validation (2017).
> Created from 2026-05-15 full 12-section research entry in RESEARCH.md. Load when researching glidepath-related topics (bond tent, valuation-based allocation, withdrawal method interaction, any reg-\* topic).

## Core Numerical Results (4% Withdrawal, 30-Year Horizon)

| Strategy | Success Rate @ 4% WR | Worst-5%-tile Depletion | Avg Lifetime Equity |
|----------|---------------------|------------------------|---------------------|
| Declining 60→30 | ~91% | ~26 years | ~45% |
| Constant 60/40 | 92.2% | 27.7 years | 60% |
| Constant 50/50 | ~93% | ~28 years | 50% |
| **Rising 30→60 (Pfau-Kitces)** | **95.1%** | **Full 30 years** | **~45%** |
| Rising 30→70 | ~96% | Full 30 years | ~50% |
| Rising 20→50 | ~94% | ~29 years | ~35% |

**Key insight from table:** The 30→60 glidepath outperforms constant 60/40 with ~15% LOWER average equity lifetime allocation. Rising 30→60 has the same average equity as declining 60→30 but lasts 4 more years in worst-case scenarios.

## 30→60 Glidepath Annual Schedule (Linear)

| Retirement Year | Equity % | Age (retire @ 65) | Notes |
|----------------|----------|-------------------|-------|
| 1 | 30% | 65 | Maximum protection, bond tent |
| 2 | 31% | 66 | |
| 5 | 35% | 70 | |
| 10 | 40% | 75 | Past the SORR danger zone |
| 15 | 45% | 80 | |
| 20 | 50% | 85 | Average lifetime equity = ~45% |
| 25 | 55% | 90 | |
| 30 | 60% | 95 | End of retirement horizon |

**Step:** +1% equity per year, or +0.111%/month for smoother rebalancing.
**Rebalancing action:** Sell bonds, buy equities annually (or quarterly).

## Glidepath Shapes

```python
def get_annual_allocation(year, total_years, start_eq, end_eq, shape):
    progress = year / total_years  # 0.0 to 1.0

    if shape == "linear":
        eq_pct = start_eq + (end_eq - start_eq) * progress

    elif shape == "accelerated_early":
        # Fast rise in first 10 years (optimal for overvalued markets)
        eq_pct = start_eq + (end_eq - start_eq) * (1 - (1 - progress)**0.5)

    elif shape == "accelerated_late":
        eq_pct = start_eq + (end_eq - start_eq) * (progress**0.5)

    elif shape == "s_curve":
        # Logistic S-curve: slow start, fast middle, slow end
        k = 0.3  # steepness parameter
        midpoint = total_years / 2
        eq_pct = start_eq + (end_eq - start_eq) / (1 + math.exp(-k * (year - midpoint)))

    return eq_pct
```

## Monte Carlo Simulation Engine

```python
def simulate_glidepath(initial_value, withdrawal, years, start_eq, end_eq, shape):
    portfolio = initial_value
    equity_pct = start_eq
    bond_pct = 100 - start_eq
    withdrawal_adjusted = withdrawal

    for year in range(1, years + 1):
        target_eq = get_annual_allocation(year, years, start_eq, end_eq, shape)

        equity_return = sample_from_distribution(equity_params)
        bond_return = sample_from_distribution(bond_params)

        equity_value = portfolio * (equity_pct / 100) * (1 + equity_return)
        bond_value = portfolio * (bond_pct / 100) * (1 + bond_return)

        portfolio = equity_value + bond_value
        portfolio -= withdrawal_adjusted  # Pfau-Kitces convention: after returns, at start-of-year

        equity_pct = target_eq
        bond_pct = 100 - target_eq
        withdrawal_adjusted *= (1 + inflation_rate)

        if portfolio <= 0:
            return (False, year, 0.0)

    return (True, years, portfolio)
```

## Client Recommender Algorithm

```python
def recommend_glidepath(age, portfolio_size, annual_spending, risk_tolerance, pension_income=0, ss_income=0):
    withdrawal_rate = annual_spending / portfolio_size
    income_coverage = (pension_income + ss_income) / annual_spending

    # Base on risk tolerance
    if risk_tolerance <= 3:      start_eq, end_eq = 20, 40
    elif risk_tolerance <= 6:     start_eq, end_eq = 30, 65
    else:                         start_eq, end_eq = 40, 80

    # Adjust for withdrawal rate
    if withdrawal_rate > 0.05:  start_eq -= 10
    elif withdrawal_rate < 0.03: start_eq += 10

    # Adjust for guaranteed income floor
    if income_coverage > 0.75:
        start_eq += 10
        end_eq += 10
        shape = "accelerated_early"
    elif income_coverage > 0.50:
        shape = "linear"
    else:
        shape = "s_curve"

    return {"start_equity": start_eq, "end_equity": end_eq, "shape": shape}
```

## The Four Economic Scenarios (Pfau Framework)

| Scenario | Early Returns | Late Returns | Winner | Glidepath Outcome |
|----------|--------------|-------------|--------|------------------|
| 1. Full boom | Good | Good | Any strategy works | OK. Slightly less legacy than aggressive |
| 2. Full bust | Bad | Bad | Nobody wins | Loses less than constant-high-equity |
| 3. Boom→Bust | Good | Bad | **Static/declining wins** | This is the "insurance cost" — glidepath underperforms |
| 4. Bust→Boom | Bad | Good | **Rising glidepath wins** | This is where the strategy shines. Worst-case for static |

**Scenario 4 is the reason the glidepath works.** It's the scenario that destroys constant-allocation portfolios (selling stocks at the bottom, missing the recovery). The glidepath protects principal during the bust and captures the recovery.

## Valuation-Based Overlay (CAPE/P/E10)

From Kitces & Pfau (SSRN 2497053):

| CAPE vs Historical Median | Equity Adjustment | Frequency |
|---------------------------|-------------------|-----------|
| CAPE < 67% of median (undervalued) | +15% equity boost | ~16% of years |
| CAPE = 67%-133% of median | Base allocation | ~63% of years |
| CAPE > 133% of median (overvalued) | -15% equity reduction | ~21% of years |

**Base allocation for valuation-based:** ~45% equity (center point). Adjust up/down by 15%.
**No-trade zone:** CAPE between 67% and 133% of historical median.

**2026 context:** CAPE ~35-38 (historical median ~16). This is well into overvalued territory (220%+ of median). The Pfau-Kitces findings suggest an ACCELERATED rising glidepath is optimal for retirees starting in this environment — start very conservative (20-25% equity), accelerate the rise to catch the eventual mean reversion.

## Big ERN Critique (Important Caveat)

Karsten Jeske (Early Retirement Now, Part 19-20, 2017) independently validated glidepaths and found:

| Metric | Pfau-Kitces Finding | Big ERN Finding |
|--------|---------------------|-----------------|
| SWR improvement (30yr) | ~0.3-0.5% | ~0.1-0.2% |
| Optimal pace | Linear 30→60 (0.111%/mo) | Faster: 0.3-0.4%/mo |
| 60-year horizon benefit | Not tested | Smaller, 4% still fails |
| Tail risk protection | Major benefit | Confirmed — this IS the benefit |

**Resolution:** The difference comes from data period (Pfau-Kitces used Monte Carlo 10K sims with historical parameters; Big ERN used historical bootstrapping) and horizon assumptions. Both agree ON THE DIRECTION; they differ on magnitude. The glidepath doesn't "save" the 4% rule — it provides meaningful tail-risk protection, reducing failure probability by ~3 percentage points at 4% WR.

## Related Topics That Build On This Framework

- **Bond tent vs rising glidepath** (reg-1): Compare concentrated bond holdings around retirement vs gradual rising glidepath
- **CAPE-based optimizer** (reg-2): Input current CAPE + client profile → optimal starting equity + shape
- **Glidepath × withdrawal method matrix** (reg-3): Does it help more with constant-dollar or percentage-of-portfolio withdrawals?
- **Tax-location-aware rebalancing** (reg-4): Selling bonds in taxable vs tax-advantaged accounts during glidepath execution
- **TDF industry disruption** (reg-5): $4T industry uses declining glidepaths despite contrary evidence
