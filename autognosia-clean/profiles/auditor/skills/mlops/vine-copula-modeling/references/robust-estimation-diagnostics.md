# Robust Estimation Diagnostics for Vine Copula Treaty Attribution

## Purpose

Detect when robust estimation (trimmed Kendall tau, M-estimators, MCD) disagrees significantly with standard MLE for treaty attribution correlation parameters, indicating model misspecification, contamination, or structural breaks.

## Core: Disagreement Index (DI)

Scalar per vine edge measuring robust-vs-MLE disagreement, normalized by combined estimator uncertainty:

```
DI = ||θ̂_robust - θ̂_MLE||₂ / sqrt(trace(Σ_robust + Σ_MLE))
```

**Thresholds:**
- DI < 0.5: Green — negligible disagreement; use MLE (more efficient)
- 0.5 ≤ DI < 1.5: Yellow — moderate disagreement; report both with weights
- DI ≥ 1.5: Red — significant disagreement; use robust estimates; flag for review

**Per-observation decomposition:**
```
DI_i = |log c(u_i,v_i; θ̂_robust) - log c(u_i,v_i; θ̂_MLE)| / DI
```
Rank by DI_i; top 5% flagged as contamination candidates.

## Five Diagnostic Layers

### Layer 1: Pearson/Deviance Residuals in Copula Space

**Pearson residual:**
```
r_P,i = (C(u_i,v_i; θ̂_robust) - C(u_i,v_i; θ̂_MLE)) / sqrt(Var[C])
Var[C] ≈ ∇C(θ̂)ᵀ Σ̂ ∇C(θ̂)  (delta method)
```

**Deviance residual:**
```
r_D,i = sign(Δℓ_i) × sqrt(2|Δℓ_i|)
Δℓ_i = log c(u_i,v_i; θ̂_robust) - log c(u_i,v_i; θ̂_MLE)
```
Sum of squared deviance residuals = likelihood ratio test statistic.

**Vine tree-wise:** Compute residuals tree-by-tree for conditional dependence divergence.

### Layer 2: Influence Diagnostics

**Leverage score:**
```
h_i = ∇_θ log c(u_i,v_i; θ̂)ᵀ I(θ̂)⁻¹ ∇_θ log c(u_i,v_i; θ̂)
```
Flag if h_i > 2p/n.

**DFFITS:**
```
DFFITS_i = (C(u_i,v_i; θ̂) - C(u_i,v_i; θ̂_{-i})) / sqrt(Var[C] × (1 - h_i))
```
Flag if |DFFITS_i| > 2.

**Cook's distance:**
```
D_i = (θ̂_{-i} - θ̂)ᵀ I(θ̂) (θ̂_{-i} - θ̂)
```
Compute for both MLE and robust; difference = contamination signal.

**Efficiency:** Use one-step Newton update for θ̂_{-i} instead of full re-estimation.

### Layer 3: Goodness-of-Fit Tests

**White's Information Matrix Test (per edge):**
```
IM_test = n × ||(∇log L_i)(∇log L_i)ᵀ + ∇²log L_i||_F²
```
Under H₀ (correct spec): IM_test ~ χ²(p(p+1)/2). P < 0.05 → flag for re-selection.

**Schepsmeier's vine GOF (tree-wise):** Extends White's test to R-vine copulas. Computed per edge per tree. 15 test variants in VineCopula R package.

**Conditional QQ-plot:** Plot empirical quantiles of u_i = C_{i|parent}(x_i | x_parent; θ̂) vs Uniform(0,1). Systematic tail deviation → tail dependence misspecification.

### Layer 4: Vine Tree-Wise Pattern Analysis

Monitor DI_k per tree level k:
- **DI increases with tree level:** Macro-level dependencies contaminated (geopolitical events)
- **DI concentrated in one subtree:** Localized contamination (same amendment group)
- **DI uniformly high:** Systemic contamination (global event like BEPS)

**Family selection diagnostic:** If BIC selects different top families for MLE vs robust → strong misspecification signal.

### Layer 5: Advisor-Facing Model Health Dashboard

Color-coded per treaty pair:
```
Treaty Pair: US-France Dividends
Overall Status: 🟡 CAUTION

Edge              | τ_MLE | τ_Robust | DI    | Status
US-FR Div (root)  | 0.58  | 0.42     | 1.82  | 🔴 FLAG
US-FR Int (L1)    | 0.31  | 0.28     | 0.73  | 🟡
US-FR Cap (L1)    | 0.22  | 0.20     | 0.41  | 🟢
```

## Data Model

```python
@dataclass
class EdgeDiagnostic:
    edge_id: str                    # e.g., "US-UK|Dividends"
    tree_level: int
    tau_mle: float
    tau_robust: float
    disagreement_index: float       # DI scalar
    pearson_residuals: List[float]  # Per-observation
    cook_distances: List[float]     # Per-observation
    leverage_scores: List[float]    # Per-observation
    im_test_stat: float
    im_test_pvalue: float
    best_family_mle: str
    best_family_robust: str
    flag_status: str                # "green", "yellow", "red"
    flag_reason: str

@dataclass
class VineDiagnosticReport:
    treaty_pair: str
    vine_type: str
    n_edges: int
    edges: List[EdgeDiagnostic]
    global_di: float
    contamination_rate: float
    recommendations: List[str]
```

## SEC Marketing Rule Alignment

- **Model validation evidence:** Documented monitoring of model health
- **Confidence disclosure:** Advisors disclose robust vs MLE basis to clients
- **Audit trail:** Historical DI values for model performance record

## Competitive Landscape

Zero wealth management platforms implement robust-vs-standard disagreement diagnostics for treaty attribution. Complete first-mover advantage.

## Key References

- Rousseeuw (1984) "Least Median of Squares Regression" — JASA 79(388)
- Rousseeuw & Van Driessen (1999) "Fast MCD Algorithm" — Technometrics 41(3)
- Schepsmeier (2013) "Goodness of Fit Tests for R-Vine Copulas" — Biometrical Journal 55(4)
- White (1982) "Maximum Likelihood Estimation of Misspecified Models" — Econometrica 50(1)
- Chen & Fan (2012) "Estimation under copula misspecification" — Econometric Theory 28(2)
- Arslan et al. (2025) "Minimum copula divergence for robust estimation" — arXiv:2502.16831
- Cribari-Neto & Vasconcelos (2019) "Cook's distance in copula modeling" — JSCS 89(5)
- VineCopula R package: https://cran.r-project.org/web/packages/VineCopula/VineCopula.pdf
- SEC Marketing Rule: https://www.sec.gov/rules/final/2020/34-88106.pdf
