# Sparsity Pattern Confidence Intervals

## Problem
When estimating sparse correlation matrices for treaty networks via graphical lasso (glasso), the sparsity pattern (which edges are zero vs. non-zero) is inherently uncertain. Standard glasso produces a binary edge decision, but with finite data (36-120 months of treaty rate time series), this is unreliable. Some edges are "clearly present" (selected in 98% of bootstrap samples), others "borderline" (52%).

## Bootstrap Methods for Edge Selection Confidence

### 1. Parametric Bootstrap (Correlation Perturbation)
- Perturb sample covariance via Wishart: Sigma_b = Sigma + eps_b where eps_b ~ Wishart(0, Sigma/n * chi2(df=n-1))
- Run glasso on perturbed correlation S_b
- Track edge selection frequency across n_boot replications
- **Best for:** T >= 60, data approximately Gaussian
- **SE of P(edge):** ~sqrt(P*(1-P)/n_boot), so 200 bootstraps yield 3-5% SE
- **Cost:** ~32 seconds for n=80, n_boot=200

### 2. Non-Parametric Bootstrap (Case Resampling)
- Resample time periods with replacement from X (Txn matrix)
- Recompute correlation, run glasso, track edges
- **Best for:** T < 60, heavy-tailed or non-Gaussian treaty data
- Preserves distribution shape but may underestimate variance for short series

### 3. Gaussian Multiplier Bootstrap (Fast)
- Perturb: S_b = S o (I + Z_b / sqrt(n)) where Z_b ~ N(0, I)
- Run glasso on S_b, track edges
- **Best for:** Real-time needs, 5-10x faster than full bootstrap
- Assumes local Gaussianity; may underestimate variance for heavy tails

### 4. Bayesian Glasso (Spike-and-Slab Prior)
- Prior: Omega_ij ~ pi*delta_0 + (1-pi)*N(0, tau^2)
- MCMC sampling of inclusion indicators + Omega values
- **Best for:** Regulatory reporting, small sample sizes
- Provides full posterior, not just point estimates
- **Cost:** Minutes to hours for n=80

### 5. Variational Bayes (Scalable Approximation)
- Mean-field: q(Omega) = product q(Omega_ij)
- Maximize ELBO w.r.t. {pi_q, mu_ij, sigma^2_ij}
- **Best for:** Large n (>80), when MCMC is too slow

## Confidence Tiers for Treaty Networks

| Tier | Confidence Required | Application |
|------|-------------------|-------------|
| TIER-0 | P(edge) > 0.95 | Portfolio optimization, regulatory reporting |
| TIER-1 | P(edge) > 0.80 | Treaty attribution, standard allocation |
| TIER-2 | P(edge) > 0.60 | Early warning, discretionary review |
| TIER-3 | P(edge) < 0.60 | Exclude from optimization, flag for advisor |

## Confidence-Aware Portfolio Optimization

Standard mean-variance: min w'Sigma_hat w

Confidence-aware: min E[w'Sigma w] + lambda_conf * Var[w'Sigma w]
- Trades expected variance against variance-of-variance
- Penalizes reliance on low-confidence edges
- Adds "model uncertainty" penalty proportional to uncertain edges

Confidence-averse (worst-case): min max_{S in S_delta} w'Sw
- Safe even if some edges are incorrectly pruned

## Propagating Uncertainty Through Vine Copula Decomposition

Bootstrap each S_b -> decompose to V_b -> record tree structure, pair-copula families, parameters.

Output for advisors:
- "The (US,UK) pair-copula has 80% probability of being Gaussian, 15% t-copula"
- "Correlation parameter theta for (US,UK) has 90% CI [0.35, 0.52]"
- "R-vine Tree 1 structure is stable (same across 95% of bootstrap samples)"

CI width decision rules:
- < 0.05: "precise" -> use point estimate
- [0.05, 0.15]: "moderate uncertainty" -> report CI
- > 0.15: "high uncertainty" -> flag for advisor review

## Integration with Treaty Amendment Pipeline

1. Re-run glasso on updated data -> new Omega
2. Compare edge selection probabilities pre/post amendment
3. Flag edges where P(edge) changes by >15%
4. Update vine structure if >10% of edges changed confidence tier
5. Log changes for regulatory audit trail

## Red-Team Edge Cases

1. **Degenerate bootstrap:** Zero variance jurisdictions -> pre-check + Ledoit-Wolf fallback
2. **Pathological patterns:** High influence + low confidence = "critical uncertain edge" -> flag
3. **Scalability:** n > 100 -> use Gaussian multiplier or adaptive n_boot
4. **Non-stationary:** Compute per-regime, report regime-weighted confidence
5. **Latent factors:** Pre-glasso factor extraction; compare raw vs. factor-adjusted confidence

## Sources
1. Meinshausen & Buhlmann (2010) — Stability Selection
2. Rothman (2008) — stARS
3. Buhlmann & Mardia (2012) — Bootstrap consistency for glasso
4. Friedman et al. (2008) — Graphical Lasso
5. Smith et al. (2015) — Vine copula uncertainty propagation (PMC4989465)
6. Zhou et al. (2023) — Confidence interval fuzzification for copulas
7. Ledoit & Wolf (2004) — Shrinkage for degenerate samples
