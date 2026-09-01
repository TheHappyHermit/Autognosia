# Sparse Recursive Tukey Biweight M-Estimation

## Overview

Sparse recursive Tukey biweight M-estimator for treaty correlation — computes robust correlation estimates by only touching non-zero entries of the precision matrix, with dynamic forgetting factor adaptation to data quality.

## Core Algorithm

### Tukey Biweight Weight Function

```
w(z) = (1 - (z/k)²)²  for |z| < k
w(z) = 0                for |z| ≥ k
```

z = (xᵢ - μ̂) / σ̂ is the standardized residual, k = 4.685 (default tuning constant).

### Sparse IRLS Update

Instead of computing all p² weights, only compute for non-zero precision entries:

```
wᵢⱼ = (1 - (dᵢⱼ/k)²)² · 𝟙{Ωᵢⱼ ≠ 0}
```

### Recursive Covariance Update

```
Σ̂ₜ = λₜ Σ̂ₜ₋₁ + (1 - λₜ) · wₜ · (xₜ - μ̂ₜ)(xₜ - μ̂ₜ)ᵀ
```

Only update non-zero entries of Σ̂.

### Dynamic Forgetting Factor

```
λₜ = λ_min + (λ_max - λ_min) × ρₜ

where ρₜ = fraction of observations with non-zero biweight weights
λ_max = 0.95 (stable, long memory)
λ_min = 0.85 (adaptive, short memory)
```

| ρₜ (Data Quality) | λₜ | Effective Window |
|---|---|---|
| 1.0 (clean) | 0.95 | ~20 days |
| 0.5 (stress) | 0.90 | ~10 days |
| 0.2 (crisis) | 0.86 | ~7 days |

**Direction matters:** lower λ = faster forgetting = more weight on recent data. During stress, ρₜ drops → λₜ drops → the system forgets old (potentially stale) data faster.

### Performance

For p = 80, 15% sparsity:
- Dense biweight: ~518K ops/update
- Sparse recursive: ~83K ops/update
- **Speedup: 6.2x** (with block-diagonal + sparse Cholesky: ~13x)

## Data-Driven Tuning Constant

Fixed k = 4.685 assumes Gaussian data. For treaty rates (non-Gaussian, regime-dependent):

```
k = median(|Mᵢ|) × 1.4826 × k_factor

k_factor = 1.0 (stable), 1.5 (stress), 2.0 (crisis)
Mᵢ = Mahalanobis distance of observation i
```

## Robust Covariance Fallback Chain

When biweight fails, fall back progressively:

1. **Tukey biweight** (default) — full outlier rejection
2. **Huber M-estimator** — downweights only, never fully rejects
3. **FastMCD** — multivariate robust, handles p > n with Ledoit-Wolf shrinkage
4. **Pearson + glasso** — standard sparse estimation
5. **Fixed correlation matrix** — last resort, use historical average

## Positive Definiteness Monitoring

During recursive updates, Σ̂ can drift from positive definiteness:

1. **Eigenvalue check:** after each update, verify λ_min > 1e-10. If not, apply Ledoit-Wolf shrinkage.
2. **Determinant monitoring:** log log(det(Σ)). Flag when it drops below -p × log(p).
3. **Periodic reset:** every 30 days, re-compute from full window to eliminate drift.

## Edge Cases

1. **All observations rejected:** if < 20% of observations get non-zero weights → fall back to Huber with k = 6.0.
2. **Sparsity pattern drift:** monitor graph distance Dₜ = ||S^(t) - S^(t-1)||_F / sqrt(n(n-1)/2). When Dₜ > 0.05, trigger sparsity re-estimation.
3. **Cold start for new treaties:** use transfer learning from similar pairs (same region, same treaty type). After 30 days, switch to data-driven thresholds.
4. **Forgetting factor oscillation:** apply exponential smoothing: λ̃ₜ = 0.7 × λ̃ₜ₋₁ + 0.3 × λₜ. Clamp |λ̃ₜ - λ̃ₜ₋₁| < 0.02.
5. **p > n:** use Ledoit-Wolf shrinkage within the biweight estimator: Σ_shrunk = α × Σ_biweight + (1-α) × diag(Σ_biweight).

## Implementation

Core Python: `sklearn.covariance.MinCovDet` for MCD warm-start, custom sparse IRLS loop for biweight.

```python
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import spsolve

class SparseRecursiveTukeyBiweight:
    def __init__(self, p, Omega_sparse, k=4.685, lambda_max=0.95, lambda_min=0.85):
        self.p = p
        self.Omega = Omega_sparse
        self.k = k
        self.lambda_max = lambda_max
        self.lambda_min = lambda_min
        self.nonzero_mask = (Omega_sparse != 0).astype(bool)
        self.mu = None
        self.Sigma = None
        self.n = 0
        self.n0 = 60  # warm-up period
```

## Sources

1. Friedman, Hastie & Tibshirani (2008) — Graphical lasso for sparse precision estimation
2. hardin47/biwt (CRAN) — Tukey biweight multivariate implementation
3. Rousseeuw & Van Driessen (1999) — FastMCD algorithm
4. IEEE (2022) — Tukey biweight with conjugate gradient adaptive learning
5. MetricGate — M-estimator Tukey biweight documentation
6. skfolio — Exponentially weighted covariance with streaming updates
