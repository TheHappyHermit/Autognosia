# KL Divergence for High-Dimensional Bayesian Calibration

## Core Problem

When the calibration prior has >10 dimensions, standard Monte Carlo KL estimation becomes noisy and inconsistent due to the curse of dimensionality. Variance grows as O(d²/N), making classifications unreliable.

## Recommended Methods (Ranked)

### 1. Bridge Sampling (Gelman & Meng 1998) — PRIMARY
- Reduces variance 10-100x vs standard Monte Carlo
- Uses a "bridge" distribution B(x) connecting P and Q
- Optimal among all importance sampling methods
- Stable for dimensions up to ~30
- Implementation: `D_KL(P||Q) = log(mean_Q[q/B]) - log(mean_P[p/B])`

### 2. Control Variates — FALLBACK
- Simple to implement, works when P and Q are close
- Subtract correlated auxiliary variable with known expectation
- Variance reduction depends on correlation between log(p/q) and q/p

### 3. Quasi-Monte Carlo (Sobol/Halton) — ALTERNATIVE
- O(N^(-2)) convergence vs O(N^(-1)) for standard MC
- Degrades beyond d ≈ 15 without dimension weighting
- No natural uncertainty quantification

### 4. Nearest-Neighbor (Kraskov et al. 2004) — HIGH-DIMENSIONAL
- Model-free, scales to ~50 dimensions
- k-nearest-neighbor density estimation
- Less accurate when P and Q have different support

## Uncertainty-Aware Classification

```
KL > 0.5 + 1.96*SE → 'strong' (prior is definitely too strong)
KL < 0.05 - 1.96*SE → 'weak' (prior is definitely too weak)
Otherwise → 'moderate' (uncertain — use default α allocation)
```

## SQL Schema

```sql
CREATE TABLE kl_divergence_estimates (
    id UUID PRIMARY KEY,
    calibration_id UUID NOT NULL,
    prior_version VARCHAR(50) NOT NULL,
    kl_estimate FLOAT NOT NULL,
    kl_se FLOAT NOT NULL,
    kl_ci_lower FLOAT,
    kl_ci_upper FLOAT,
    classification VARCHAR(20) NOT NULL,
    method VARCHAR(20) NOT NULL,
    n_samples INTEGER NOT NULL,
    effective_dimension INTEGER NOT NULL,
    n_effective_samples INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Key Edge Cases

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| Prior degenerate (near-zero variance) | Bridge sampling fails | Detect and use analytical KL |
| Likelihood sparse (n < 10) | KL dominated by few samples | Require min n=10; default "moderate" below |
| KL ≈ 0 (nearly identical) | Numerical underflow | Detect KL < 0.01; flag for review |
| KL → ∞ (nearly orthogonal) | Estimate blows up | Cap at 10.0; report as "strong" |
| Dimension > 30 | All methods degrade | PCA dimension reduction before KL |
| Adversarial prior manipulation | Advisor gaming classification | Audit trail; CCO approval for >10% impact |

## Competitive Landscape

Zero wealth management platforms implement KL-based prior informativeness classification. All competitors (eMoney, Orion, RightCapital, Moment AI, Tamaraic, Addepar) use fixed or deterministic sensitivity analysis.

## Sources

1. Gelman & Meng (1998) "Simulating Normalizing Constants" — Statistical Science 13(2)
2. Cover & Thomas (2006) Elements of Information Theory, Ch. 8
3. Kraskov et al. (2004) "Estimating mutual information" — Phys Rev E 69(6)
4. Vehtari et al. (2024) PSIS-LOO-CV — JMLR 25(38)
5. Kallioinen et al. (2023) Power-scaling sensitivity analysis — Bayesian Analysis 18(3)
