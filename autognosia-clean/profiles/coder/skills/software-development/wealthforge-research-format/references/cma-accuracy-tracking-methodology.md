# CMA Provider Accuracy Tracking Methodology

## Purpose

Domain knowledge for building CMA (Capital Market Assumptions) provider historical accuracy tracking — a WealthForge feature that tracks how well each major CMA provider's past forecasts aligned with actual market outcomes.

## Major CMA Providers (11 tracked)

| Provider | Methodology | Horizon | Update Frequency | Key Differentiator |
|----------|-------------|---------|-----------------|-------------------|
| BlackRock | Building blocks + interest rate model | 10yr + 30yr | Quarterly | Downloadable Excel CMA data; AI productivity adjustments |
| Vanguard | VCMM (proprietary probabilistic model) | 10yr + 30yr | Quarterly | Probabilistic ranges (not point estimates); March 31 update |
| J.P. Morgan | Building blocks + companion Methodology Handbook | 10yr | Annual (Oct) | 30th edition (2026); David Kelly/JBilton led; institutional standard |
| AQR | Building blocks, explicit no mean reversion | 5-10yr | Annual (Jan) | "Do not bank on reversion" philosophy; private credit coverage |
| Dimensional | Empirical/decomposition approach | 10yr | Annual (Dec) | Publishes "Reality Check" comparing past forecasts to actuals |
| Capital Group | Building blocks (equity: dividend yield + real EPS growth + inflation) | 10yr | Annual | "Building blocks" formula transparency |
| Northern Trust | Top-down macro | 10yr | Annual | Global yield curve normalization focus |
| Fidelity | Top-down + bottom-up hybrid | 20yr | Annual | Longest horizon (20yr vs 10yr standard) |
| Schwab | Building blocks | 10yr | Annual | Widely used by financial planners; accessible format |
| Capital Management | Decomposition | 10yr | Annual | Regional focus |
| iShares/BlackRock | Investment Directions | 10yr | Annual | ETF-focused perspective |

**Also tracked (private markets):** Tamarix, Preqin, Cambridge Associates (separate taxonomy — see wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-6)

## Accuracy Metrics (6)

1. **MAE** — Mean Absolute Error: `MAE = (1/n) * Σ|forecast_i - actual_i|`. Most intuitive for planners.
2. **MAPE** — Mean Absolute Percentage Error: `MAPE = (1/n) * Σ|error_i / actual_i| * 100`. Use SMAPE fallback when actual near zero.
3. **RMSSE** — Root Mean Squared Scaled Error: Normalized by naive benchmark error. Enables cross-asset comparison.
4. **Directional Accuracy** — % of forecasts with correct sign (positive/negative). Critical for CMA because direction matters more than magnitude.
5. **Bias Score** — Systematic over/under-forecasting: `Bias = mean(forecast - actual)`. Positive = optimistic. Not necessarily bad in financial planning.
6. **Regime-Adjusted Accuracy** — Break down by: Bull (S&P >10%), Bear (S&P <-10%), High Rate (10Y >4%), Low Rate (10Y <2%).

## Composite Score Formula

```
Composite = 0.30 * MAE_5y + 0.25 * MAE_10y + 0.20 * Directional + 0.15 * Bias_Penalty + 0.10 * Regime_Robustness
```
- Score range: [0, 100]
- MAE scores normalized to [0, 100]
- Bias penalty: `min(abs(bias) * 10, 25)` (max 25 point penalty)
- Regime robustness: `100 - regime_std * 20` (penalizes regime dependence)

## Consensus Weighting by Accuracy

```
raw_weight = exp(score / 50.0)  # temperature = 50
weight = min(raw_weight / sum(all_raw), 1.0)
weight = max(weight, 0.05)  # 5% minimum floor
weight = weight / sum(all_weights)  # renormalize
```

## Validation Lag Handling

10-year forecasts can't be fully validated for 10 years. Use partial validation:
- `confidence = min(validation_progress * 2, 1.0)` where progress = years_validated / total_horizon
- Return score with confidence bounds and interpretation text
- Example: "Score based on 2.5 of 10 years of validation (confidence: 50%)"

## Key Competitive Finding

**Zero platforms provide CMA provider accuracy tracking.** Dimensional's "Reality Check" paper is the only industry effort (annual, static). Morningstar's annual forecast comparison is a cross-sectional snapshot, not longitudinal. This is a completely uncontested WealthForge innovation opportunity.

## Key Data Points

- US equity forecast spread across providers: 5.5%-7.7% annualized (2.2pp range)
- Vanguard non-US equity range (Q1 2026): 4.9%-6.9% (down from 6.9%-8.9% in Q4 2024)
- Dimensional's Reality Check covers 10 providers over 2014-2023
- BlackRock publishes 30-year forecasts (unlike most competitors' 10-year)
- J.P. Morgan's LTCMA is in its 30th edition (started ~1996)

## Sources

- Dimensional "Reality Check" (Dec 2024): https://www.dimensional.com/us-en/insights/reality-check-capital-market-assumptions-vs-actual-returns
- Morningstar "Experts Forecast" (Jan 2026): https://www.morningstar.com/markets/experts-forecast-stock-bond-returns-2026-edition
- BlackRock CMA (Feb 2026): https://www.blackrock.com/institutions/en-us/insights/thought-leadership/capital-market-assumptions
- J.P. Morgan LTCMA (2026): https://am.jpmorgan.com/us/en/asset-management/institutional/insights/portfolio-insights/ltcma/
- Vanguard VCMM (Q1 2026): https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html
- AQR CMA (Jan 2026): https://www.aqr.com/Insights/Research/Alternative-Thinking/2026-Capital-Market-Assumptions-for-Major-Asset-Classes
- Capital Group CMA (2026): https://www.capitalgroup.com/intermediaries/es/en/investments/capabilities/capital-market-assumptions.html
- Northern Trust CMA (2026): https://ntam.northerntrust.com/content/dam/northerntrust/investment-management/global/en/documents/thought-leadership/2026/cma/2026-capital-market-assumptions-report.pdf
- DePamphilis (2018) "Examining models for Capital Market Assumptions"
- White (2000) "The Reality Check: A Unified Test of Nested Hypotheses"
