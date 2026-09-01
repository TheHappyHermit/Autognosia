# Tail Risk Attribution Decomposition for Vine Copulas

## Purpose

Decompose portfolio tail risk (VaR, Expected Shortfall) into contributions from each pairwise edge in a vine copula structure. Answers: "Which treaty relationships are driving joint tail risk?"

## Core Methods

### 1. Marginal Attribution (Replacement Method)
Replace edge (j,k) with independence copula → measure ΔES:
```
ES_marginal^(j,k) = ES_portfolio - ES_portfolio_with_independence_edge
```
Additive: Σ ES_marginal^(j,k) = ES_total - ES_independence.

### 2. Component Attribution
Weight by tail dependence coefficient × marginal exposure:
```
ES_component^(j,k) = λ_U^(j,k) × |∂L/∂u_i| × |∂L/∂u_j| × σ_i × σ_j
```

### 3. Shapley Value Attribution
Guaranteed additive decomposition. O(2^d) exact, Monte Carlo approximate for d ≤ 30.

## Recursive Conditional Tail Dependence (Aumann, 2010)
```
λ_U^(1) = λ_U^{C_12}  (first tree, unconditional)
λ_U^(j) = λ_U^{C_ij|D}(λ_U^(j-1))  (recursive conditional)
```

## Vine Structure-Specific Insights

- **C-vine**: Tree 1 edges have highest contributions (unconditional). Root-edge ratio >60% = concentrated tail risk.
- **D-vine**: Adjacent vs. distant pair classification reveals local vs. systemic contagion.
- **R-vine**: Constrain related treaties into natural clusters for treaty-specific attribution.

## Edge Categories for WealthForge Portfolios
1. Inflow edges (treaty income streams)
2. Asset class edges (cross-asset tail dependence)
3. Currency edges (FX tail dependence)
4. Jurisdiction edges (cross-jurisdiction tail dependence)
5. Regime edges (regime-specific tail dependence)

## Tail Risk Concentration Index (HHI)
```
HHI_tail = Σ(VaR_alpha^(k) / VaR_alpha)^2
```
- HHI < 0.1: Well-diversified
- HHI 0.1-0.25: Moderate concentration
- HHI > 0.25: High concentration → flag for review

## Edge Cases & Mitigations
- **Degenerate trees (d>30)**: Use truncated vine copulas, validate omitted edges <1% of total
- **Asymmetric tail dep**: Track λ_L and λ_U separately, flag λ_L ≠ λ_U
- **Estimation error**: Bootstrap CIs, Bayesian shrinkage, require n>50 tail observations
- **Non-stationary tail dep**: Rolling 3-year window with exponential weighting, regime detection
- **Non-additivity**: Report both marginal and Shapley attribution, flag edges where |marginal - Shapley| > 10%

## Competitive Landscape
Zero wealth platforms offer vine copula edge-level tail risk attribution. Institutional platforms (Aladdin, Bloomberg PORT, MSCI) only provide factor-level attribution.

## Sources
- Aumann (2010) J. Multivariate Analysis — recursive conditional tail dependence
- Brechmann & Schepsmeier (2012) JSS — C/D-vine algorithms
- Brechmann (2014) PhD thesis — truncated vine copulas
- Czado (2019) Springer — vine copula theory
- Nagler & Vatter (2023) JSS — rvinecopulib R package
