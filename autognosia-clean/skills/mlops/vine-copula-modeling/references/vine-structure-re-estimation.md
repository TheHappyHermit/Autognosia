# Vine Copula Structure Re-Estimation Protocol

## When to Re-Estimate

Vine copula structure (the vine tree topology and edge connections) should be re-estimated **conditionally**, not on a fixed schedule. Three-tier protocol:

### Tier 1: Full Re-Estimation (ΔAIC > 10 AND structural distance > 0.10)
- Re-estimate all trees and all pair-copula families via Dissmann et al. (2013) algorithm.
- Structural distance: `d_struct = (1/(d-1)) × Σ_k |E_k_current Δ E_k_new|`
- Fires when both ΔAIC and structural distance exceed thresholds simultaneously.

### Tier 2: Family-Only Re-Estimation (ΔAIC 4–10)
- Keep vine structure (edge connections) fixed.
- Re-select best copula family per edge by AIC.
- Captures dependence-type shifts (e.g., Gaussian → Clayton) without structural instability.

### Tier 3: Annual Forced Re-Estimation (Safety Net)
- Hard maximum interval: 12 months regardless of ΔAIC.
- Exception: skip if ΔAIC < 1 AND d_struct < 0.02 (structure demonstrably stable).

## Data Windowing

- **6-year rolling window** for structure selection (~24 quarterly observations for reliable Kendall's τ).
- Below 20 observations (5 years), use previous structure and flag as "low confidence."
- After a structural break, switch to post-break window to avoid pre-break data bias.

## Computational Complexity

- Full re-estimation: O(d⁴) for d variables.
- For d > 15: use hierarchical clustering to group structurally similar variables, then re-estimate within groups.
- Family-only re-estimation: O(d²) per edge — cheap.

## ΔAIC Threshold Calibration

- ΔAIC > 10: strong evidence for re-estimation.
- ΔAIC 4–10: positive evidence; consider re-estimation if other triggers fire.
- ΔAIC < 4: weak evidence; keep current structure.
- Threshold should be calibrated per treaty group (OECD vs. non-OECD stability differs).

## Edge Cases

1. **Over-re-estimation (churning):** Impose 6-month minimum interval between re-estimations. Require two triggers to fire simultaneously.
2. **Under-re-estimation (stale structure):** Annual forced re-estimation prevents this. Monitor ΔAIC trend (steadily increasing ΔAIC = leading indicator of impending break).
3. **Small sample size:** Minimum 20 observations required for reliable τ estimation.
4. **Pathological treaty data:** Near-zero correlation pairs produce unstable MST. Add tie-breaking rule: when |τ| values within 0.05, prefer edge maximizing log-likelihood.
5. **Large d (>15):** Use hierarchical variable grouping before vine estimation.

## Implementation Schema

```python
@dataclass
class VineStructure:
    version_id: str
    created_at: datetime
    tree_levels: List[List[Tuple[int, int]]]
    pair_copula_families: List[List[str]]
    aic_score: float
    stability_score: float  # d_struct from last comparison

@dataclass
class StructureChangeLog:
    event_id: str
    trigger: str  # "aic", "structural_distance", "temporal_decay"
    delta_aic: float
    structural_distance: float
    edges_changed: int
    re_estimation_type: str  # "family_only", "tree_partial", "full"
```

## Competitive Landscape

Zero wealth management platforms automate vine structure re-estimation. All existing platforms (eMoney, Orion, RightCapital, MoneyGuidePro) use fixed correlation matrices or simple rolling correlations.

## Sources

- Dissmann, J., Brechmann, E., Czado, C., & Kurowicka, D. (2013). "Selecting and Estimating Regular Vine Copulae." Computational Statistics & Data Analysis, 59, 52-69.
- Czado, C. & Nagler, T. (2022). "Vine Copula Based Modeling." Annual Review of Statistics, 9, 451-474.
- Fink, A., Krueger, H., & Czado, C. (2019). "Flexible Dynamic Vine Copula Models." Econometrics and Statistics, 12, 181-197.
- Akaike, H. (1974). "A New Look at the Statistical Model Identification." IEEE TAC, 19(6), 716-723.
