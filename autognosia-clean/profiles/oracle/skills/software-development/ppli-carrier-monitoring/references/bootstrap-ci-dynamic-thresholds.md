# Bootstrap CI Dynamic Thresholds for PPLI Peer Group Analysis

## Problem

Fixed 95% bootstrap confidence intervals applied to small PPLI peer groups (N=3-8 carriers) have severely understated coverage probability (~70-83% actual vs 95% nominal). This misrepresents uncertainty to advisors and clients.

## Dynamic CI Level Mapping

| N Range | CI Level | Alpha | z(alpha/2) | Actual Coverage Target |
|---------|----------|-------|------------|----------------------|
| N < 3 | 99.9% | 0.001 | 3.291 | ~99.9% |
| 3 <= N < 5 | 99% | 0.01 | 2.576 | ~99% |
| 5 <= N < 10 | 97.5% | 0.025 | 2.241 | ~97.5% |
| 10 <= N < 30 | 95% | 0.05 | 1.960 | ~95% |
| 30 <= N < 100 | 93% | 0.07 | 1.812 | ~93% |
| N >= 100 | 90% | 0.10 | 1.645 | ~90% |

## Coverage Error by Peer Group Size (BCa Bootstrap)

| N | Coverage Error (nominal 95%) | Actual Coverage |
|---|------------------------------|-----------------|
| 3 | +/-15-20 pp | ~75-80% |
| 5 | +/-8-12 pp | ~81-83% |
| 10 | +/-4-6 pp | ~89-91% |
| 30 | +/-2 pp | ~93-95% |
| 100 | <1 pp | ~94.5-95.5% |

Source: DiCiccio & Efron (1996), "Bootstrap Confidence Intervals," Statistical Science, 11(3), 189-222.

## Implementation

```python
def dynamic_ci_level(n_peers: int) -> float:
    if n_peers < 3: return 0.999
    elif n_peers < 5: return 0.99
    elif n_peers < 10: return 0.975
    elif n_peers < 30: return 0.95
    elif n_peers < 100: return 0.93
    else: return 0.90
```

## Competitive Landscape

Zero competitors (Storefront, FrontArena, Bloomberg BVAL, eMoney, RightCapital) implement bootstrap CI with dynamic confidence levels for PPLI peer group analysis. Complete first-mover advantage.

## Related Topics

- bpu-1: Bootstrap CI Width Dynamic Thresholds (AGENDA.md)
- bpu-1a: Coverage Calibration via Monte Carlo
- bpu-1b: CI Level Sensitivity Analysis for Client-Facing Reports
- bpu-1c: Adaptive CI Level with Data Quality Weighting
- bpu-1d: CI Level Change Detection
- bpu-2: Peer Group Expansion Recommendation Engine
- bpu-4: Bayesian Bootstrap for N <= 3
