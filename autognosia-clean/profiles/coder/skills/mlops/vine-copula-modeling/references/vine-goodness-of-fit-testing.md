# Vine Copula Goodness-of-Fit Testing

## Overview

Formal GOF testing for vine copula models is critical for treaty attribution uncertainty — you need to know when your dependence model is wrong before trusting treaty credit calculations. Zero wealth management platforms implement GOF testing for treaty models.

## Test Suite

### 1. Tree-wise Cramer-von Mises Tests
- **What**: Test uniformity of probability integral transform (PIT) residuals at each vine tree level.
- **Formula**: For tree k, compute CvM statistic on each node's bivariate copula residuals.
- **Bootstrap**: Critical values via bootstrap (Genest & Rémillard 2004) — parametric bootstrap using fitted copula.
- **Interpretation**: p < 0.05 → reject uniformity → model misfit at that tree level.

### 2. Schepsmeier's Information Matrix Test
- **What**: White (1982) information matrix test adapted for vine copulas (Schepsmeier 2013).
- **Mechanism**: Test orthogonality of score vectors — if model is correct, scores should be orthogonal.
- **Advantage**: Omnibus test — detects misfit in any dimension of the copula.
- **Implementation**: Compute score vectors for each vine parameter, test cross-product orthogonality.

### 3. Rosenblatt Transform Test
- **What**: Transform vine copula samples to independent uniform variables, then test uniformity.
- **Rosenblatt transform**: Sequential conditional CDF evaluation through vine structure.
- **Test**: Cramér-von Mises or Anderson-Darling on transformed residuals.
- **Advantage**: Captures global misfit — not limited to tree-level diagnostics.

### 4. Vuong Tests for Structure Comparison
- **What**: Compare non-nested vine structures (C-vine vs D-vine vs R-vine).
- **Vuong statistic**: V = (1/√n) × Σ [log f₁(xᵢ) - log f₂(xᵢ)] / √[variance estimate]
- **Decision**: V > 1.96 → model 1 preferred; V < -1.96 → model 2 preferred.
- **Use case**: Choose optimal vine structure for treaty dependence modeling.

## Bootstrap Critical Values

```python
def bootstrap_gof_pvalue(copula_fit, data, n_bootstrap=1000):
    """Parametric bootstrap for vine copula GOF p-values."""
    cvm_observed = compute_cvm(copula_fit, data)
    cvm_bootstrap = []
    for _ in range(n_bootstrap):
        sim_data = copula_fit.sample(len(data))
        sim_fit = fit_copula(sim_data)
        cvm_bootstrap.append(compute_cvm(sim_fit, sim_data))
    p_value = np.mean(cvm_bootstrap >= cvm_observed)
    return p_value
```

## Advisor-Facing Diagnostics

### QQ-Plots
- Plot empirical vs theoretical quantiles of PIT residuals.
- Deviation from 45° line = model misfit.
- Show per-tree QQ-plots (not just global) for actionable diagnostics.

### CvM Heatmap
- Tree × node heatmap of CvM statistics.
- Color scale: green (p > 0.10) → yellow (0.05 < p < 0.10) → red (p < 0.05).
- Helps advisors identify which treaty dependence relationships are poorly modeled.

### Vuong Forest Plot
- Compare all vine structures side-by-side.
- Show Vuong statistic with confidence intervals for each pair.
- Highlight preferred structure.

## Power Analysis

Key finding: CvM tests have moderate power (0.6-0.8) for N=500, declining to 0.3-0.5 for N=100. Information matrix test has higher power for misspecified pair-copula families (0.7-0.9 for N=500).

Power depends on:
- Sample size (N): critical for treaty data (often N < 200)
- Misspecification magnitude (how far from truth)
- Vine depth (deeper vines harder to test)

## Fallback Strategy

When GOF fails:
1. **Try alternative structure**: C-vine → D-vine → R-vine (use Vuong tests).
2. **Try alternative families**: Gaussian → t-copula → Clayton/Gumbel (check tail dependence).
3. **Sparsity**: Remove weakest pair-copulas (threshold pruning).
4. **Gaussian fallback**: If all vine structures fail, use Gaussian copula (conservative but honest).
5. **Document**: Record GOF failure and fallback in model risk file (SEC Marketing Rule).

## Automated Reporting

Generate plain-English GOF summary:
- "The [C/D/R]-vine structure [passes/fails] GOF testing (p = X.XX). The [tree k / Rosenblatt] test flagged misfit in treaty pairs involving [country A, country B]. We recommend [alternative structure / family / fallback]."

## Treaty-Specific Pair-Copula Families

Research needed on which families best model treaty-specific dependence:
- **Savings clause**: Creates asymmetric dependence between source and residence treaty rates.
- **Limitation articles**: Bounded dependence (upper tail truncation).
- **Residency tie-breaker**: Sequential dependence (step function in copula).
- **Credit limitation**: Lower tail dependence (both countries taxing).

## Key Sources

- Schepsmeier, U. (2013). "Goodness-of-fit tests for vine copula models."
- Genest, C. & Rémillard, J. (2009). "Goodness-of-fit procedures for copula models."
- Genest, C., Rémillard, J. & Beaudoin, D. (2009). "Goodness-of-fit for copulas."
- White (1982). "Maximum likelihood estimation of misspecified models."
- Aas, M., Czado, C., Frigessi, A. & Bakken, H. (2009). "Pair-copula constructions of multiple dependence."

## New Sub-Topics

1. `vine-gof-conditional-qq-plots` — Advisor-facing QQ-plot diagnostics for Rosenblatt residuals
2. `vine-gof-power-analysis` — Power analysis for CvM and information matrix tests under various sample sizes
3. `vine-gof-fallback-strategy` — Decision tree for when GOF fails (try alternative structure → alternative families → Gaussian fallback)
4. `vine-gof-automated-reporting` — Plain-English GOF summary generation for advisor communication
5. `vine-gof-treaty-specific-families` — Research which pair-copula families best model treaty-specific dependence patterns
