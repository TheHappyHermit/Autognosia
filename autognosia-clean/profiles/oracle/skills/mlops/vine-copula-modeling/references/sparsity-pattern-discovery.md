# Sparsity Pattern Discovery for Treaty Networks

## Problem
When estimating sparse correlation matrices for 50-100 country treaty networks (vine copula inputs), the sparsity pattern (which edges are zero vs. non-zero) evolves as treaties are amended, new treaties are signed, and geopolitical relationships shift. Fixing the pattern at estimation time causes stale dependencies and underestimated tail risk.

## Graphical Lasso Variants for Treaty Networks

### Standard Glasso
Estimates sparse precision matrix Ω = Σ^(-1) via:
    min_Ω { -log det(Ω) + tr(SΩ) + λ||Ω||_1 }
Precision matrix encodes conditional independence — correct target for vine decomposition.

### Adaptive Glasso (Zou, 2006)
Applies data-driven weights: w_ij = |Ω^(0)_ij|^(-γ) using previous period's Ω^(0).
Creates "sticky" patterns that evolve gradually — edges don't appear/disappear abruptly.

### Fused Glasso (Danaher et al., 2014)
Adds temporal smoothness: λ_2 Σ_t ||Ω^(t) - Ω^(t-1)||_1
Critical because treaty rates change discretely at amendment events, not daily.

### Condition-Adaptive Fused Glasso (CFGL)
Condition-specific weights map to economic regimes (low-vol, stress, post-amendment).
Captures "flight to quality" — during stress, cross-border correlations converge.

## Stability Selection for Edge Detection

### Framework
1. Draw B bootstrap samples (B = 100-500)
2. Run glasso on each with same λ
3. Compute edge selection frequency f_ij
4. Select edges with f_ij >= π_thr (typically 0.6-0.8)

### Theoretical Guarantee
E[V] <= π_thr * p * q / 2 where p = variables, q = allowed FDR.
For n=80, q=0.05, π_thr=0.7: E[V] ≈ 1.4 false edges.

### stARS (Rothman, 2008)
Automatically selects λ by finding stability plateau — removes manual tuning.

### MPGraph (Zheng, 2024)
Minipatch glasso adjusts for latent variable bias.
Draw random minipatches → run glasso → ensemble average → threshold.
Addresses pervasive latent factors (USD strength, developed market risk).

## Adaptive Thresholding

### EBIC-Tuned
EBIC(S) = -2 log L(S) + df(S)*log(n) + γ*|S|*log(p)
γ = 0 = BIC, γ = 2 = EBIC (favors sparsity for treaty networks).

### FDR Thresholding
Benjamini-Hochberg on precision matrix p-values. FDR < α (typically 0.05-0.10).

### Regime-Specific Thresholds
| Regime | Threshold Factor | Edge Density |
|--------|-----------------|-------------|
| Stable | 1.0x | ~15% |
| Elevated vol | 1.2x | ~10% |
| Stress | 0.7x | ~25% |
| Post-amendment | 0.85x | ~20% |
| Transition | 1.1x | ~12% |

## Pattern Evolution Tracking

### Edge-Level CUSUM
S_t = max(0, S_{t-1} + (Ω_ij^(t) - Ω_ij^(t-1)) - δ)
Flag when S_t > h. Set δ proportional to standard error of Ω_ij.

### Global Graph Distance
D_t = ||S^(t) - S^(t-1)||_F / sqrt(n(n-1)/2)
Alert thresholds: <0.01 normal, 0.01-0.05 monitor, >=0.05 alert.

### Spectral Gap Monitoring
Monitor condition number λ_max/λ_min. Flag when >50% increase from rolling median.

### Treaty Amendment-Triggered Re-estimation
Maintain amendment DB (BEPS, MLI, MAP, Pillar Two). When amendment takes effect:
1. Flag affected treaty pairs
2. Re-run glasso with reduced λ
3. Compare patterns — identify new/removed/stable edges
4. Update incrementally (don't discard entire pattern)

## Performance

For n=80 jurisdictions:
- Glasso single run: O(n^3), ~2s
- Stability selection B=200: O(B*n^3), ~400s
- Adaptive thresholding: O(n^2), <0.1s
- Daily optimization: only re-run stability selection if D >= 0.01

## Red-Team Edge Cases

1. **Sanctions**: Country with zero variance → degenerate covariance. Pre-glasso check + bypass list.
2. **Treaty churning**: Repeated amendments → oscillation. Pattern hysteresis (only update if D > 0.08 for 3 periods).
3. **Latent factor domination**: Phantom edges from USD/commodity factors. Use MPGraph + factor partialing.
4. **Small sample**: New treaty with <36 months history. Transfer learning from similar treaties.
5. **Circular dependencies**: A-B, B-C, C-A cycles. Post-glasso cycle detection + re-estimate with reduced λ.
6. **Non-stationary drift**: Monotonic edge increase over 12+ months. Drift-aware glasso with target density maintenance.

## Sources
1. Friedman et al. (2008) — Graphical lasso original paper
2. Meinshausen & Bulmann (2010) — Stability selection
3. Rothman (2008) — stARS method
4. Danaher et al. (2014) — Joint graphical lasso
5. Zhao et al. (2023) — CFGL
6. Zheng et al. (2024) — MPGraph
7. Chen & Bickel (2013) — EBIC for sparse graphical models
8. Zou (2006) — Adaptive lasso
