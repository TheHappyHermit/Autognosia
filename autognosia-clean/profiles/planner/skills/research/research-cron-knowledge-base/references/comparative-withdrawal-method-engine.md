# Comparative Withdrawal Method Engine — Architecture Reference

Condensed reference for the 9-strategy unified comparison engine researched 2026-05-18. Load this before building or extending the CWE module.

## 9 Strategies (Standardized Interface)

Every strategy implements `WithdrawalMethod(ABC)` with three methods:
- `project(profile, scenario, params) -> StrategyProjection` — single 30-year run
- `monte_carlo(profile, engine, params, n_sims=10000) -> StrategyMetrics` — distribution
- `historical_backtest(profile, cohort_db, params) -> HistoricalMetrics` — 97-cohort backtest

| # | Strategy | Default Params | Key Reference |
|---|---|---|---|
| 1 | Fixed Real | initial_rate=0.039, inflation=True | Morningstar 2025 SORI |
| 2 | G-K Guardrails | initial_rate=0.050, cap_pres=1.20, pros=0.80, cut=0.10, inc=0.10 | Guyton & Klinger 2006 |
| 3 | Risk-Based G. | initial_rate=0.051, inc_pos=0.80, dec_pos=0.25, target=0.45, max=0.10 | Fitzpatrick/Tharp 2021 |
| 4 | Vanguard Dynamic | init=0.048, floor=0.70, ceil=1.05, cap=0.05 | Vanguard 2025 |
| 5 | Constant % | percentage=0.057 | Morningstar ceiling |
| 6 | Endowment | init=0.057, smoothing=0.70 | Harvard/Yale |
| 7 | VPW | AA-dependent table, cap=0.10 | Bogleheads Wiki |
| 8 | Modified RMD | smoothing=3yr, table="III" | Kitces/Woloch Feb 2026 |
| 9 | ABW | exp_return=0.045, trajectory=None | Bogleheads ABW Wiki |

## Standardized Metrics (StrategyMetrics @dataclass)

Every method produces these 10 canonical metrics for fair comparison:

| Metric | Definition | Unit |
|---|---|---|
| initial_spending | Year 1 annual spending | $ |
| spending_volatility | std_dev(annual_spending) / mean | % |
| success_probability | P(portfolio > 0 through horizon) | % |
| median_terminal_portfolio | Median ending value | $ |
| depletion_year_median | Year portfolio hits $0 (NaN if never) | year |
| depletion_rate | % of MC scenarios that deplete | % |
| max_spending_cut | Largest single-year reduction | % |
| avg_spending_efficiency | mean_spending / initial_portfolio | ratio |
| rmd_collision_flag | RMD > spending target in any year | bool |
| ss_torpedo_flag | SS taxable > 50% inclusion in any year | bool |

## RISA-Weighted Recommendation Algorithm

Four RISA quadrants map to different weight vectors:

| Quadrant | Spending W | Volatility W | Success W | Terminal W |
|---|---|---|---|---|
| Safety+Commitment | 0.15 | 0.35 | 0.35 | 0.15 |
| Safety+Optionality | 0.25 | 0.25 | 0.35 | 0.15 |
| Probability+Commitment | 0.30 | 0.20 | 0.30 | 0.20 |
| Probability+Optionality | 0.40 | 0.10 | 0.25 | 0.25 |

Score = w_spend * Z(spending) + w_vol * (1-Z(volatility)) + w_succ * success + w_term * Z(terminal)
where Z = min-max normalized across all 9 strategies.

## 5 UI Widgets

- **CME-1**: Strategy Selector Dashboard — comparison table + trophies + sparklines + shortlist mode
- **CME-2**: Multi-Strategy Spending Trajectory Chart — 9-line overlay, MC bands, smile/hatchet toggles
- **CME-3**: Risk-Return Scatter Plot — each strategy as dot at (volatility, starting spend)
- **CME-4**: Historical Cohort Heatmap — per-strategy x 97 cohorts, CAPE-conditioned filter
- **CME-5**: WPS Generator — 7-section auto-generated Policy Statement PDF

## Database Schema (7 tables)

1. `cwe_strategies` — canonical strategy definitions (seed: 9 rows)
2. `cwe_comparison_runs` — per-client runs (frozen profile, RISA quadrant)
3. `cwe_strategy_results` — per-strategy metrics (9 rows/run)
4. `cwe_cohort_results` — cached backtest per strategy x profile tier
5. `cwe_smile_profiles` — client-specific smile overrides
6. `cwe_wps_documents` — generated WPS records
7. `cwe_ensembles` — strategy blend configs

## API Endpoints

```
POST /api/v1/cwe/compare            — Run full comparison (9 strategies)
POST /api/v1/cwe/ensemble           — Create strategy blend
GET  /api/v1/cwe/runs/{id}          — Get results
GET  /api/v1/cwe/runs/{id}/wps      — Download WPS PDF
GET  /api/v1/cwe/strategies         — List available strategies
GET  /api/v1/cwe/historical/backtest — Run cohort backtest
```

## Integration Points

| Needs | Provider | Data Flow |
|---|---|---|
| Monte Carlo | FIX-04 engine | portfolio/spending -> PoS distribution |
| Historical cohorts | frd-1 cohort DB | profile -> cohort x results |
| After-tax | Withdrawal Optimizer (WO) | strategy metrics -> after-tax spendable income |
| RISA quadrant | RIS assessment | RISA quad -> strategy weights |
| Smile curve | SB research (Blanchett) | age -> spending factor |
| Hatchet phase | RH research | age -> pre/post flag -> rates |
| WPS archive | MO-01 Compliance | wps_id -> archive |

## 8 Remaining Subtopics (AGENDA.md cme-01 through cme-08)

- **cme-01**: Convergence detector (<2% variance → converge warning)
- **cme-02**: ABW return sensitivity explorer (CMA-anchored ±1%)
- **cme-03**: Strategy ensemble builder (weight sliders, real-time blend)
- **cme-04**: Early death scenario analyzer (per-strategy terminal at ages 70/75/80/85/95)
- **cme-05**: CWE x WO after-tax integration (SS torpedo + IRMAA + NIIT + state)
- **cme-06**: CAPE-conditioned strategy selector (cohorts similar to current market)
- **cme-07**: Personalized smile calibration (3-5yr spending history → per-client curve)
- **cme-08**: WPS compliance dashboard (advisor/firm metrics, methodology distribution)

## Key Sources

1. Morningstar State of Retirement Income 2025 (Benz, Ptak, Arnott)
2. Kitces.com Feb 2026 — Modified RMD (Kitces & Woloch)
3. Kitces.com Nov 2021 — Risk-Based Guardrails (Tharp & Fitzpatrick)
4. Guyton & Klinger 2006 — JFP Decision Rules
5. Bogleheads Wiki — VPW (bogleheads.org/wiki/Variable_percentage_withdrawal)
6. Bogleheads Wiki — ABW (bogleheads.org/wiki/Amortization_based_withdrawal)
7. FI Calc — Withdrawal Strategies Guide (guide.ficalc.app/withdrawal-strategies/)
8. Income Lab — Retirement Income Guardrails Guide (incomelaboratory.com)
9. Bellavia — GK Guardrails Explained (bellavia.app)
10. ERN SWR Series 62 parts (earlyretirementnow.com)
11. Pfau — Retirement Income Styles / RISA framework
12. Morningstar SORI + Pfau taxonomy — 8-method comparison framework
