# Market Regime Detection Framework

## Overview

Four primary market regimes that directly impact portfolio template scoring in financial planning. Used when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-4a-2a (market regime-aware template scoring) or CMA preference recommendation topics.

## Regime Taxonomy

### Regime A: Low-Rate Expansion (Bull)
- Federal Funds Rate: < 2.5%
- VIX (30-day): < 18
- 10Y Treasury yield: < 3.0%
- GDP growth: > 2.0% annualized
- Credit spread (Baa-10Y): < 150 bps
- *Favors:* Growth, Balanced, and Aggressive templates. Equities outperform.

### Regime B: High-Rate Contraction (Bear)
- Federal Funds Rate: > 4.0%
- VIX (30-day): < 22
- 10Y Treasury yield: > 4.5%
- GDP growth: < 1.5% annualized
- *Favors:* Conservative, Income, and Diversified templates. Fixed income becomes attractive.

### Regime C: High-Volatility Uncertainty (Stress)
- VIX (30-day): > 25
- VIX term structure: backwardated
- Credit spread: > 250 bps
- EPU Index: > 150 (normalized)
- *Favors:* Diversified, Defensive, and Cash-Plus templates. Flight to quality.

### Regime D: Recession (Crisis)
- NBER recession declared OR recession probability > 60%
- VIX: > 35
- Yield curve: inverted > 100 bps (10Y-3M)
- *Favors:* Conservative, Defensive templates. Long-duration Treasuries. Cash preservation.

## Data Sources (FRED-based, mostly free)

| Indicator | FRED Code | Update Frequency | Cost |
|-----------|-----------|-----------------|------|
| Federal Funds Rate | FEDFUNDS | Per FOMC (~6/yr) | Free |
| VIX | VIX | Real-time (market hours) | Paid (~$500/mo) or delayed free |
| 10Y Treasury | DGS10 | Daily | Free |
| 3M Treasury | DFII3M | Daily | Free |
| GDP Growth | GDPC1 | Quarterly | Free |
| Credit Spread | BAMLC0A1CBBY | Daily | Free |
| EPU Index | EPU_USA | Monthly | Free |
| Recession Prob | RECPROUSM156N | Quarterly | Free |
| Unemployment | UNRATE | Monthly | Free |
| PMI | PMI | Monthly | Free |

## Dynamic Scoring Formula

```
dynamic_score(T) = α × preference_score + β × regime_score + γ × goal_score

Where:
  α = 0.40 (client preference weight)
  β = 0.25-0.45 (regime weight, scales with regime confidence)
  γ = 1.0 - α - β (goal alignment weight)

Regime score = Σ(P_regime × template_performance(regime))
```

## Template Regime Performance Scores (0-100)

| Template | Regime A | Regime B | Regime C | Regime D |
|----------|----------|----------|----------|----------|
| Growth (90/10) | 95 | 35 | 20 | 15 |
| Balanced (60/40) | 85 | 65 | 55 | 50 |
| Conservative (30/70) | 40 | 85 | 75 | 80 |
| Diversified (40/40/20) | 75 | 70 | 70 | 65 |
| Income (20/80) | 30 | 90 | 60 | 75 |
| Defensive (10/90) | 20 | 75 | 80 | 90 |
| Cash-Plus (0/0/100) | 15 | 60 | 85 | 95 |

## Competitive Landscape

**Zero competitors offer market regime-aware template scoring.** eMoney, MoneyGuidePro, RightCapital, Orion, Advisor360, and all robo-advisors use static template rankings. WealthForge would be first-mover.

## Key Edge Cases

- **Regime oscillation:** Use delta threshold (0.15) and 30-day cooldown to prevent churn
- **Late detection:** Leading indicators (yield curve, EPU) can signal shifts before lagging indicators confirm
- **Stagflation:** Consider fifth regime (high rates + low growth + high inflation)
- **Data staleness:** Implement freshness monitoring and graceful degradation

## Academic Foundation

- Hamilton (1989) — Hidden Markov Models for regime detection
- Ang & Shiller (2002) — Regime-dependent risk premiums
- Baker, Bloom & Davis (2016) — EPU index methodology
- NY Fed (2022) — Recession probability model using financial variables
