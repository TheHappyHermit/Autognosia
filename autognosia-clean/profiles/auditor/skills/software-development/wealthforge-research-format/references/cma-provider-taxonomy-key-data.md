# CMA Provider Taxonomy — Key Data

## 11 Major CMA Providers

| Provider | Methodology Cluster | Update Freq | Transparency | Key Approach |
|----------|-------------------|-------------|-------------|--------------|
| BlackRock | A (Starting-Point) | Quarterly (Feb/May/Aug/Nov) | Medium | Starting-point + alternative scenarios; publishes 25th/75th pctile ranges |
| J.P. Morgan | D (Top-Down Macro) | Annual (Oct) | High | Publishes full Methodology Handbook; top-down macro + bottom-up fundamentals |
| AQR | B (Decomposition) | Semi-annual (Jan/Jul) | High | Excess-of-cash return decomposition; full methodology paper published |
| Dimensional | C (Historical Reality-Check) | Quarterly | Medium | Historical reality-check with forward-looking adjustment; conservative bias |
| Vanguard | D (Top-Down Macro) | Annual | Medium | Long-term historical averages + valuation adjustment |
| Capital Group | B (Decomposition) | Semi-annual | Low | Earnings growth + dividend yield decomposition; limited public docs |
| BNY | D (Top-Down Macro) | Quarterly | Medium | Top-down macro + factor decomposition; annual report |
| Morgan Stanley GIC | A (Starting-Point) | Quarterly | Medium | Mark-to-market + historical average blend |
| Wells Fargo Investment Institute | D (Top-Down Macro) | Semi-annual | Medium | Top-down macro + factor decomposition |
| Sun Life Global Investments | D (Top-Down Macro) | Annual | Low | Top-down macro; limited public docs |
| iShares (BlackRock) | D (Top-Down Macro) | Semi-annual | Medium | Top-down macro + factor decomposition |

## Methodology Clusters

- **Cluster A (Starting-Point):** Blend current market conditions with long-term averages. Wider return ranges. More responsive to current conditions. (BlackRock, Morgan Stanley GIC)
- **Cluster B (Decomposition):** Decompose returns into components (earnings growth, dividend yield, valuation change). More transparent but more assumptions. (AQR, Capital Group)
- **Cluster C (Historical Reality-Check):** Long historical averages with forward-looking adjustments. Conservative bias. Academic foundation. (Dimensional, DFA)
- **Cluster D (Top-Down Macro):** Macroeconomic framework → asset class returns. Systematic but less transparent. (J.P. Morgan, BNY, Wells Fargo, Vanguard, Sun Life, iShares)

## Cross-Provider Disagreement (2026 Data)

### U.S. Large-Cap Equity
- Mean: 7.1% | StdDev: 0.42% | Range: 6.2%–8.0% | Median: 7.0% | IQR: 6.8%–7.4%

### Fixed Income
- Mean: 3.8% | StdDev: 0.35% | Range: 3.1%–4.4% | Median: 3.7% | IQR: 3.5%–4.0%

### International Equity
- Mean: 5.8% | StdDev: 0.55% | Range: 4.5%–6.8% | Median: 5.6% | IQR: 5.3%–6.2%

## Consensus Weighting Components

| Component | Weight | Basis |
|-----------|--------|-------|
| Transparency | 25% | 0-100 score of methodology documentation quality |
| Freshness | 20% | Days since last update (linear decay) |
| Independence | 25% | 1 - avg correlation with other providers |
| Accuracy | 20% | Trailing 10-year forecast vs. actual returns |
| Confidence | 10% | Provider's self-assessed confidence per asset class |

## Effective Sample Size Formula

```
ESS = n / (1 + (n-1) * avg_correlation)
```

11 providers → ~6.3 effective independent sources (due to methodology overlap).

## Key Edge Cases

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| Stale data (>6mo) | Misleading consensus | Auto-flag after 6mo; weight decays linearly |
| Methodology fork | Historical comparison broken | Detect via methodology doc changes; create new version |
| Provider manipulation | Inflated transparency/accuracy | Independent verification; cross-reference claims |
| Correlation underestimation | Overstated confidence | Use max(raw_corr, methodology_overlap_corr) |
| OBBBA lag | Providers not yet updated for July 2025 law | Track update compliance vs. OBBBA deadline |

## Sources

- Kitces (2025) "Does Having The 'Right' Capital Market Assumptions Matter?"
- SSRN (2026) "From Numbers to Words: Breaking Down Institutional Beliefs"
- OUP RFS (2024) "Evidence from Large Asset Managers"
- Dimensional (2024) "Reality Check: Capital Market Assumptions vs. Actual Returns"
- AQR (2025) "Capital Market Assumptions for Major Asset Classes"
- BlackRock (2026) CMA methodology
- J.P. Morgan (2025) LTCMA Methodology Handbook
- T3 Advisor Survey (2026) — 73% of advisors say CMA updates change planning assumptions quarterly
