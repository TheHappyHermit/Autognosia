# Adaptive Quadrature Point Selection for Quadrature-TreeSHAP

Determines optimal number of Gauss-Legendre quadrature points for SHAP computation via Quadrature-TreeSHAP (Wettenstein, Mitchell & Yu, arXiv:2605.04497, May 2026).

## Core Principle: Theorem 2 Bound vs. Practical Sweet Spot

**Theorem 2 (Exactness Bound):** n >= ceil((d - s + 1) / 2)
- d = tree depth, s = interaction set size
- This is the mathematical minimum for exact quadrature

**Practical finding:** 8 fixed Gauss-Legendre points achieve float32 machine precision (~10^-7 relative error) across all financial advisory benchmarks, regardless of tree depth.

## Decision Algorithm

```
1. n_min = ceil((d - s + 1) / 2)  # Theorem 2 bound
2. n_floor = max(8, n_min)         # 8-point stability floor
3. n_max = min(32, d)              # Cap at 32 (diminishing returns)
4. Select based on profile_type:
   - documentation/compliance: n = n_floor (exactness guaranteed)
   - advisor-facing: n = min(n_floor + 2, n_max)
   - real-time/batch: n = 8 (fixed for performance)
5. If d > 64: run convergence_check(n_floor, n_max)
```

## Accuracy Curve (Empirical, Wettenstein et al. 2026)

| Points | Relative Time | Accuracy |
|--------|--------------|----------|
| 4 | 0.5x | ~10^-3 (insufficient) |
| 6 | 0.75x | ~10^-4 (borderline) |
| **8** | **1.0x** | **~10^-7 (sweet spot)** |
| 12 | 1.5x | ~10^-9 (marginal) |
| 16 | 2.0x | ~10^-11 (negligible) |
| 32 | 4.0x | ~10^-14 (exact) |

The accuracy curve is extremely steep between 6 and 8 points (10^-4 -> 10^-7) and flattens rapidly after 8 points.

## Why 8 Points Works Universally

1. **Integrand structure**: TreeSHAP integrands are products of bounded positive factors (path probabilities) with no cancellation
2. **Polynomial exactness**: 8-point Gauss-Legendre is exact for polynomials up to degree 15; financial advisory models' effective degree rarely exceeds 10
3. **Stability margin**: Below 8 points, precision degrades for deeper trees because Gauss-Legendre nodes cluster toward endpoints

## Edge Cases

| Case | Problem | Mitigation |
|------|---------|------------|
| d > 128 | Theorem 2 gives n >= 64; 8 may be insufficient | Cap at 32, trigger model complexity review |
| s > 4 | Gap between bound and 8 narrows | Use n = max(8, ceil((d-s+1)/2)) |
| d < 4 | 8-point floor is 4x the bound | No issue; floor provides stability margin |
| Near-zero path probs | t^k and (1-t)^k underflow in float32 | Use log-space computation |
| Non-tree ensembles | Quadrature-TreeSHAP designed for single-tree | Use max tree depth across ensemble |

## Convergence Check (for d > 64)

```
1. n = n_min
2. result_n = shap(n points)
3. result_n+4 = shap(n+4 points)
4. delta = |result_n - result_n+4| / |result_n+4|
5. If delta < tolerance: return n
6. If n+4 > n_max: return n_max
7. n += 4, repeat
```

## Competitive Landscape

No existing SHAP implementation in financial advisory uses adaptive quadrature:
- **Shap library**: Fixed 500-sample Monte Carlo (KernelSHAP) or exact TreeSHAP (no quadrature)
- **Quadrature-TreeSHAP**: Fixed 8 points (no adaptation)
- **QuadraSHAP**: Fixed configurable points (no adaptation)
- **WealthForge**: First adaptive quadrature for advisory use cases

## Audit Trail Schema

```sql
CREATE TABLE quadrature_audit (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL,
    tree_depth INTEGER NOT NULL,
    interaction_order INTEGER NOT NULL,
    num_points_selected INTEGER NOT NULL,
    theoretical_min INTEGER NOT NULL,
    profile_type VARCHAR(20) NOT NULL,
    convergence_verified BOOLEAN DEFAULT FALSE,
    effective_degree INTEGER,
    method VARCHAR(20) NOT NULL,
    integration_error_estimate FLOAT,
    computation_time_ms FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Sources

1. Wettenstein, R., Mitchell, R., & Yu, P. (2026). "Quadrature-TreeSHAP: Depth-Independent TreeSHAP and Shapley Interactions." arXiv:2605.04497.
2. QuadraSHAP (2026). "Stable and Scalable Shapley Values for Product Games via Gauss-Legendre Quadrature." arXiv:2605.05870.
3. Trefethen (2013). "Approximation Theory and Approximation Practice." SIAM, Thm. 19.3.
4. Higham (2002). "Accuracy and Stability of Numerical Algorithms." SIAM.
