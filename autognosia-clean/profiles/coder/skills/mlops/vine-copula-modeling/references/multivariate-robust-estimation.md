# Multivariate Robust Estimation for Vine Copula Correlation

## Overview

Extends pairwise robust methods (trimmed Kendall tau, M-estimators) to the full treaty correlation matrix using Minimum Covariance Determinant (MCD). Critical for capturing cross-treaty contagion patterns that pairwise methods miss.

## MCD Core Algorithm

The MCD estimator finds a subset of h observations whose covariance matrix has the smallest determinant:

```
MCD(X) = argmin_{S ⊂ {1,...,n}, |S|=h} det(SampleCov(X_i, i ∈ S))
```

### FastMCD Steps
1. **C-sweep initialization**: Draw C random subsets, compute covariance, select smallest determinant
2. **K-means refinement**: Use subset as cluster center, find h closest observations
3. **Covariance M-step**: Recompute covariance on new subset
4. **Convergence check**: If subset unchanged, stop; else repeat step 2
5. **Final reweighting**: Compute Mahalanobis distances, reweight observations below χ²(p, 0.975) threshold

### Breakdown Point
With h = floor((n + p + 1) / 2): breakdown point ≈ 50%. If 30% of treaty rate observations are contaminated, standard Pearson correlation is completely invalid while MCD maintains ~70% efficiency.

## Integration Pipeline

1. **Transform** treaty rates to uniform marginals: u_i = F_i(r_i), add jitter to avoid 0/1
2. **Probit transform**: z_i = Φ^{-1}(u_i) — converts to pseudo-Gaussian observations
3. **Run FastMCD** on Z: get robust location μ, covariance Σ, support mask, Mahalanobis distances
4. **Extract robust correlation**: R_mcd = correlation_matrix(Σ)
5. **Decompose R_mcd into vine structure**: extract partial correlations from R_mcd for each vine edge
6. **Convert partial correlations to copula parameters**: theta = 2 × tan(π × ρ_partial / 2) for Gaussian copula
7. **Bootstrap CI**: resample inliers, repeat steps 2-6, compute percentile CIs

## Optimal Support Fraction Selection

| Support Fraction | Breakdown Point | Efficiency (clean) | Robustness |
|-----------------|----------------|-------------------|------------|
| 0.50 | ~50% | ~85% | Maximum |
| 0.60 | ~40% | ~88% | High |
| 0.70 | ~30% | ~90% | Moderate |
| 0.80 | ~20% | ~93% | Low |
| 0.90 | ~10% | ~96% | Minimal |
| 0.95 | ~5% | ~98% | Negligible |

Default: h/n = 0.70. Adjust based on:
- Sample size n < 50: use h/n = 0.80
- Observed contamination > 30%: increase to 0.80
- Treaty count p > 50: increase by 0.01 × (p - 50)

## Multivariate Outlier Detection

Mahalanobis distance for observation i:
```
D_i = (Z_i - μ)^T Σ^{-1} (Z_i - μ)
```

P-value: `p_i = 1 - χ²_p(D_i²)` — observations with p_i < 0.025 flagged as multivariate outliers.

## Edge Cases

### p > n (more treaty pairs than observations)
MCD requires h > p for non-singular covariance. Use Ledoit-Wolf shrinkage within MCD:
```
Σ_shrunk = α × Σ_mcd + (1 - α) × diag(Σ_mcd)
```

### Perfect multicollinearity
Detect from standard correlation matrix, remove one pair, recover post-hoc via vine structure.

### All observations flagged as outliers
Fall back to pairwise trimmed Kendall tau with wider CIs. Flag as "insufficient data."

### Non-elliptical dependence
Check Q-Q plot of Mahalanobis distances vs χ²(p). Systematic deviations → use Gaussian mixture MCD instead of single MCD.

## Implementation

Core Python: `sklearn.covariance.MinCovDet`

```python
from sklearn.covariance import MinCovDet
mcd = MinCovDet(support_fraction=0.7, random_state=42)
mcd.fit(Z)  # Z = probit-transformed treaty rates
R_mcd = _cov_to_corr(mcd.covariance_)
```

## Competitive Landscape

Zero wealth management platforms (eMoney, Orion, RightCapital, Addepar) model treaty correlation robustness. Zero financial risk platforms (Bloomberg PORT, MSCI, Axioma) model treaty-specific correlation. Complete first-mover advantage.

## Related Sub-topics

- **gaussian-mixture-mcd**: Multi-modal treaty dependence (pre-BEPS vs post-BEPS regimes)
- **ledoit-wolf-shrinkage**: High-dimensional (p > n) treaty correlation estimation
- **robust-vine-selection**: Optimal vine structure selection from MCD correlation matrix
- **bias-correction**: MCD covariance downward bias correction for accurate CI construction
