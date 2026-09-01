# Impact-Weighted Bootstrap for Sparse Correlation Confidence

## Problem
Standard bootstrap confidence treats all bootstrap samples equally: an edge selected in 70% of samples gets 70% confidence. But bootstrap samples have wildly different impacts on portfolio optimization. An edge present in high-impact samples deserves more weight than one present in low-impact samples.

## Core Method

### Portfolio Impact Weight
For each bootstrap sample b:
1. Compute S_b → glasso → Omega_b → vine_decompose → w_b
2. Impact: I_b = ||w_b - w_hat||_2 / ||w_hat||_2

### Impact-Weighted Confidence
P_IW(e) = sum_b I_b * 1{e in Omega_b} / sum_b I_b

This is a weighted average where high-impact samples contribute more.

### Edge Importance Score
Importance(e) = sum_b I_b * |Omega_b[i,j] - Omega_hat[i,j]|

Captures both how much the edge changes the portfolio AND how far it deviates from the base estimate.

### Impact-Weighted CI
- Weighted median and quantiles using I_b as weights
- Only computed for bootstrap samples where the edge is present

## Key Findings
- Edges can differ dramatically: an edge with 50% standard but 85% IW confidence is reliably present WHEN IT MATTERS
- An edge with 80% standard but 40% IW confidence is confidently present but only in negligible-impact scenarios
- Edge importance ranking enables prioritized advisor review

## Alternative Weightings
- **Objective function sensitivity**: I_b = |f(w_b) - f(w_hat)| / |f(w_hat)| (captures decision metric impact, not just weight changes)
- **Log-impact**: I_b' = log(1 + I_b) — prevents degenerate zero-impact samples
- **Rank-based**: I_b' = rank(I_b) / B — robust to outlier impacts

## Hierarchical (Cascade) Confidence
Weight at multiple levels:
1. Tree-level: which vine trees are most affected?
2. Pair-copula-level: which families change most?
3. Edge-level: which correlation edges drive the most change?

## Red-Team Edge Cases
- **Degenerate weights**: add epsilon (1e-6) or use log/rank weighting
- **High-importance, low-confidence**: flag as CRITICAL UNCERTAINTY, require manual review
- **Bootstrap sample correlation**: use block bootstrap for short series (T < 60)
- **Optimization sensitivity artifacts**: use smooth barrier methods; complement with analytical dw/dSigma
- **Computational cost**: ~5 min for n=80, B=500; use Gaussian multiplier bootstrap (10x faster) for screening

## Institutional Precedents
- JPMorgan RiskMetrics: component VaR, marginal VaR (market risk)
- Fermat Capital: impact-weighted stress testing (hedge funds)
- MSCI Barra: risk factor decomposition with marginal contributions
- None adapted for wealth management treaty networks — first-mover advantage

## Sources
1. Chen, Buhlmann & Samworth (2013) — Optimal weighted bootstrap for sparse covariance
2. Friedman, Hastie & Tibshirani (2008) — Sparse inverse covariance estimation (glasso)
3. Meinshausen & Buhlmann (2006) — Stability Selection
4. Shao & Tu (1995) — The Jackknife and Bootstrap
5. Ledoit & Wolf (2004) — Well-conditioned estimator for large-dimensional covariance matrices
