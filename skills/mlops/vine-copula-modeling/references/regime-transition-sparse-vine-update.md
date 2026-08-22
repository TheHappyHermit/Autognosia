# Regime-Transition Sparse Vine Update

## Overview

When regime transition forecasting predicts a sparsity pattern change, the vine copula decomposition structure (variable ordering, pairings, copula family selection) may need to change. This reference documents the sparse recomputation methodology for regime-triggered vine updates.

## Why Vine Structure Changes with Regime

Each market regime has a characteristic correlation structure:

| Regime | Sparsity | Vine Pairing Pattern | Dominant Copula Family |
|--------|----------|---------------------|----------------------|
| Low volatility | 80–85% | Group related assets (equity indices, fixed income) | Gaussian (symmetric, no tail dep) |
| High volatility | 60–70% | Shift to safe-haven pairings (equity/JPY, equity/gold) | t-copula, Clayton (tail dep) |
| Crisis | 30–40% | Near-universal positive correlation | t-copula, heavy tail dep |
| Geopolitical | 50–65% | Jurisdiction-specific (commodity/currency, energy-producing) | Joe, Gumbel (asymmetric) |

## Sparse Recomputation Algorithm

```
Input: predicted_sparsity_change, current_vine_structure, regime_transition_probs
Output: updated_vine_structure, edges_to_recompute

1. Identify changed edges: ΔE = predicted_sparsity − current_sparsity
2. Compute vine transition cost: |ΔE| / |current_edges|
3. If vine_transition_cost < 0.20:
     - Recompute vine structure for affected edges only
     - Keep unaffected edges (pairings, copula parameters) frozen
   Else:
     - Flag for advisor review (full recomputation needed)
4. For each changed edge:
   - Recompute pair-copula family (AIC/BIC comparison)
   - Estimate new copula parameters (MLE)
   - Update vine tree structure if pairing changed
5. Validate: GOF test on updated vine (CvM < critical value)
6. If GOF fails: fallback to previous vine + partial update
```

## Vine Transition Cost Thresholds

| Cost | Action | Rationale |
|------|--------|-----------|
| < 10% | Automatic update | Minimal impact, low risk of instability |
| 10–20% | Advisor notification | Significant but manageable change |
| 20–40% | Advisor review required | Risk of overfitting to noise |
| > 40% | Full recomputation + validation | Likely regime shift, not minor fluctuation |

## Integration with Regime Transition Forecasting

The regime transition forecast feeds into the vine update pipeline:

1. **Regime detection** (HMM) produces current regime state + transition probabilities
2. **Leading indicators** (EPU, GPR, volatility) produce composite score
3. **Sparsity prediction** produces predicted regime-specific sparsity pattern
4. **Vine update engine** computes sparse recomputation for predicted change
5. **Decision layer** triggers update based on vine transition cost threshold

## Implementation Notes

- **Sparse Cholesky ordering**: Use AMD (approximate minimum degree) ordering to minimize fill-in during sparse vine recomputation
- **Edge pruning**: Remove edges with predicted weight < 0.05 from vine computation
- **Computational savings**: O(n²) → O(k²) where k = number of non-zero edges (typically 15–30% of n²)
- **GOF fallback**: If updated vine fails GOF test, revert to previous vine and apply partial update only

## Competitive Landscape

Zero wealth management platforms implement regime-aware vine copula updates. All existing platforms use static correlation matrices with no regime awareness. Complete first-mover advantage.

## Sources

- Kat, H., Kunst, R., & Pezer, M. (2005). "Regime Switching for Dynamic Correlations."
- Ang, A., & Bekaert, G. (2002). "International Asset Allocation with Regime Shifts."
- Sedira, S., & Li, X. (2019). "Regime-Switching Correlation Modeling for Portfolio Risk Management."
- Longin, F., & Solnik, B. (2001). "Extreme Correlation of International Equity Markets."
