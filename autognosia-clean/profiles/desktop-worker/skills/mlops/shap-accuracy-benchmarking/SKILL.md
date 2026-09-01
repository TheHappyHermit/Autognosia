---
name: shap-accuracy-benchmarking
description: Framework for benchmarking SHAP approximation accuracy across feature regimes, model types, and financial contexts. Covers ground truth computation, method registry, materiality thresholds, method selection, and competitive landscape for SHAP explainability in wealth management.
trigger: Load when researching SHAP approximation methods, explainability accuracy, feature importance reliability, XAI benchmarking, method selection for SHAP computation, or any topic involving accuracy verification of SHAP-based explanations in financial modeling contexts.
---

# SHAP Accuracy Benchmarking Framework

Framework for systematically comparing SHAP approximation methods against exact computation across feature regimes, model types, and financial modeling scenarios.

## Core Problem

SHAP approximation methods (FastTreeSHAP, QuadraSHAP, Sparse Fourier, Stratified KernelSHAP, LeverageSHAP) trade accuracy for speed. In wealth management advisory contexts, inaccurate SHAP explanations can violate FINRA 2111 suitability requirements and SEC Marketing Rule fair representation obligations. **Zero existing tools benchmark SHAP approximation accuracy across financial modeling scenarios** — academic literature benchmarks speed but not accuracy degradation.

## Benchmark Architecture

### 1. Ground Truth Engine

```python
class GroundTruthEngine:
    """Computes exact or near-exact SHAP values as reference."""
    
    def compute_exact(self, model, X_background, features):
        # Tree models: shap.TreeExplainer with algorithm='exact'
        # Non-tree <20 features: exhaustive enumeration
        # High-dimensional: Quasi-Monte Carlo with N=100,000+ samples
```

### 2. Approximation Method Registry

| Method | Speed vs TreeSHAP | Accuracy | Best Use |
|--------|-------------------|----------|----------|
| FastTreeSHAP v1 | 1.5x | Near-exact (tree) | General tree models |
| FastTreeSHAP v2 | 2.5x | Near-exact (tree) | Performance-critical |
| QuadraSHAP | 3x-5x | Exact (product games) | High-accuracy tree |
| Sparse Fourier | O(n log n) | Near-exact (sparse) | Very high-dim sparse |
| Stratified KernelSHAP | 2-3x | Good (sample-dependent) | Non-tree moderate |
| LeverageSHAP | Near-linear | Provably good | Non-tree with guarantees |

### 3. Feature Regime Classifier

Classifies data into regimes for targeted benchmarking:
- **Dimensionality**: low (<10), medium (10-50), high (>50)
- **Correlation structure**: independent, clustered, chain, dense
- **Sparsity**: dense, sparse, very_sparse
- **Feature type**: continuous, categorical, mixed
- **Distribution shift**: in_dist, mild_shift, severe_shift

### 4. Accuracy Metrics

| Metric | What It Measures |
|--------|-----------------|
| L1/L2 error | Point-wise accuracy vs exact |
| Spearman/Pearson correlation | Ranking preservation |
| Top-k accuracy | Fraction of correct top-k features |
| Sign accuracy | Fraction of preserved feature signs |
| Coefficient of variation | Stability across runs (stochastic methods) |
| Materiality status | GREEN/YELLOW/ORANGE/RED based on relative L1 error |

**Materiality thresholds:**
- GREEN: relative L1 error < 5% (no action)
- YELLOW: 5-15% (monitor)
- ORANGE: 15-30% (consider switching method)
- RED: >30% (must switch to more accurate method)

### 5. Benchmark Test Matrix

**Synthetic regimes:**
- Low-dim independent (5-10 features, r<0.1)
- Low-dim correlated (5-10 features, r>0.7)
- Medium-dim independent/clustered (10-30 features)
- High-dim sparse (30-100 features)
- Non-tree continuous/categorical (10-50 features)
- Distribution shift scenarios

**Financial modeling regimes:**
- Portfolio allocation (20-50 features)
- Client risk profiling (10-30 features)
- Withdrawal optimization (15-40 features)
- Asset allocation (30-100 features)
- Tax-loss harvesting (10-25 features)
- Compliance scoring (20-50 features)

## Expected Accuracy Profiles (Hypotheses)

| Method | Low-Dim | Medium-Dim | High-Dim | Correlated | Independent | Tree | Non-Tree |
|--------|---------|-----------|----------|-----------|-------------|------|----------|
| FastTreeSHAP v1/v2 | GREEN | GREEN | GREEN | YELLOW | GREEN | Exact | N/A |
| QuadraSHAP | GREEN | GREEN | GREEN | GREEN | GREEN | Exact* | N/A |
| Sparse Fourier | GREEN | YELLOW | GREEN | ORANGE | GREEN | Near-exact | Near-exact |
| Stratified KernelSHAP | GREEN | GREEN | YELLOW | YELLOW | GREEN | Approx | Approx |
| LeverageSHAP | GREEN | GREEN | GREEN | GREEN | GREEN | Approx | Approx |
| Standard KernelSHAP (N=2000) | GREEN | YELLOW | RED | RED | YELLOW | Approx | Approx |

*QuadraSHAP exact for product games; depends on how well product game approximates the model.

## Accuracy Degradation Patterns

1. **Correlation-driven**: Error increases with feature correlation, especially KernelSHAP-family methods
2. **Dimensionality-driven**: Beyond ~30 features, KernelSHAP accuracy degrades significantly
3. **Regime-transition**: Methods accurate in low-volatility may fail during market stress
4. **OOD degradation**: Explaining predictions far from training distribution increases error
5. **Model-architecture**: Tree-specific methods maintain accuracy across tree architectures

## Integration with Confidence Scoring

Benchmarks feed into the explanation confidence scoring system (er-03-4a-2-1c-1b-1b-1d-1-a-1-1-2b-4a-2a-2b-1l-4c-5c):

```python
def compute_approximation_quality_score(benchmark_results, current_method, current_regime):
    result = lookup_benchmark(current_method, current_regime)
    if result is None:
        return 0.0  # No data — penalize heavily
    score_map = {'GREEN': 1.0, 'YELLOW': 0.7, 'ORANGE': 0.4, 'RED': 0.1}
    return score_map.get(result['materiality']['status'], 0.0)
```

## Method Selection Engine

```python
def select_optimal_method(regime, accuracy_requirement='GREEN'):
    """Select fastest method meeting accuracy requirement."""
    candidates = benchmark_db.query(
        regime=regime,
        materiality_status='>=' + accuracy_requirement,
        order_by='wall_time_seconds ASC'
    )
    # Fallback: YELLOW if no GREEN, then most accurate if no YELLOW
```

## Dynamic Method Switching

1. Initial pass: Use fastest method (FastTreeSHAP v2 for tree models)
2. Accuracy check: Compare benchmark prediction vs. observed stability
3. Adaptive escalation: If observed stability < expected, switch to more accurate
4. Periodic re-evaluation: Re-benchmark at intervals or on data refresh

## GPU/CPU Platform Routing

For tree-based SHAP computation, the choice between GPU (GPUTreeShap) and CPU (multi-threaded TreeSHAP) depends on batch size, urgency, GPU load, and cost ratio.

### Crossover Point
- ~10 profiles is the default crossover for WealthForge's 10-50 feature models
- Below: CPU wins (GPU warmup ~300ms with warm-pool, ~800ms cold)
- Above: GPU wins (19x speedup for 10K rows on V100)

### Dynamic Threshold Formula
```
dynamic_threshold = base_threshold × gpu_load_factor × urgency_factor × cost_factor

base_threshold = 10 profiles
gpu_load_factor = 1.0 + (0.5 × gpu_utilization_pct / 100.0)  [1.0 to 1.5]
urgency_factor = 1.0 / urgency_weight  [0.33 (real-time) to 2.0 (scheduled)]
cost_factor = max(1.0, gpu_hourly_rate / cpu_hourly_rate)  [2.05 to 29.4]
```

### Pre-built Routing Profiles
| Use Case | Urgency | Batch | Platform |
|----------|---------|-------|----------|
| Real-time dashboard | real-time | 1-5 | CPU always |
| Portfolio rebalancing | batch | 50-500 | GPU |
| Nightly compliance | scheduled | 1K-10K | GPU (cheapest) |
| Client-facing reports | interactive | 1-20 | GPU if warm-pool <1s |

### Cost Analysis
- Single profile: GPU costs ~20x CPU per profile
- 10 profiles: GPU costs ~10x CPU per profile
- 100 profiles: GPU costs ~2.5x CPU per profile
- Breakeven on cost-per-profile: ~200-300 profiles on A10G

### Compliance: GPU-CPU Reconciliation
- Run on 1% random sample daily
- Flag divergence > 10⁻⁹ (normal), > 10⁻⁷ (compliance)
- GPUTreeShap produces bit-identical results for standard inputs
- Hardcode CPU fallback for known divergent patterns (NaN, Inf, extreme outliers)

See `references/gpu-cpu-routing.md` for full algorithm, cost tables, per-firm GPU quota management, learning router, and competitive landscape.

## Adaptive Quadrature Point Selection (Quadrature-TreeSHAP)

For SHAP methods using Gauss-Legendre quadrature (Quadrature-TreeSHAP, QuadraSHAP), the number of quadrature points must be selected based on tree depth and interaction order.

**Theorem 2 bound:** n >= ceil((d - s + 1) / 2) where d = tree depth, s = interaction set size.

**Practical sweet spot:** 8 fixed points achieve float32 machine precision (~10^-7 relative error) across all financial advisory benchmarks regardless of tree depth. The accuracy curve is extremely steep between 6 and 8 points (10^-4 -> 10^-7) and flattens rapidly after 8.

**Profile-based selection:**
- documentation/compliance: use Theorem 2 bound (exactness guaranteed)
- advisor-facing: use Theorem 2 bound + 2 safety points
- real-time/batch: use fixed 8 points (performance)
- d > 64: run convergence check (iterative refinement, capped at 32)

See `references/adaptive-quadrature-selection.md` for full algorithm, edge cases, and audit trail schema.

## Competitive Landscape

| Platform | SHAP Accuracy Benchmarking |
|----------|---------------------------|
| eMoney Advisor | None |
| Orion | None |
| RightCapital | None |
| BlackRock Aladdin | Limited (internal) |
| SHAP library (official) | Speed only, no accuracy |
| TruEra | Partial (accuracy/speed trade-off) |
| **WealthForge** | **Domain-specific accuracy profiles** |

**First-mover advantage:** Zero wealth management platforms provide SHAP accuracy benchmarking. WealthForge can establish domain-specific accuracy profiles, regulatory-ready documentation, and automated method selection.

## Key Pitfalls

1. **Regime transition blind spots**: Benchmarks in normal conditions miss stress-regime degradation. Include high-volatility test cases.
2. **Adversarial feature engineering**: Features engineered to maximize approximation error (high correlation with near-cancellation). Include adversarial test cases.
3. **Out-of-distribution catastrophe**: Error becomes unbounded far from training distribution. Include OOD detection.
4. **Benchmark overfitting**: Benchmarked regimes don't cover actual operating regimes. Measure coverage fraction.
5. **Method substitution attacks**: Contributors substitute less accurate methods without updating benchmarks. Require signed benchmark registry.

## Sources

1. Lundberg & Lee (2017) - Original SHAP paper, TreeSHAP
2. Yang (n.d.) - FastTreeSHAP v1 (1.5x) and v2 (2.5x) speedups
3. Gorji et al. (2024) - Sparse Fourier SHAP, O(n log n) computation
4. Musco & Witter (2024) - LeverageSHAP, provable error guarantees, ~50% error reduction vs KernelSHAP
5. QuadraSHAP (2026) - Exact SHAP via Gauss quadrature, 3x-5x faster than TreeSHAP
6. Covert et al. (2020) - Feature correlation effects on SHAP accuracy
7. Aas & Jullum (2019) - Conditional Shapley values with Monte Carlo CIs
8. SEC Marketing Rule (2023) - Fair and balanced representation requirements
9. FINRA Rule 2111 - Suitability requirements
10. SR 11-7 - Model risk management guidance

## References

- `references/shap-benchmark-regime-library.md` — Curated benchmark test cases for financial modeling regimes and stress scenarios
- `references/adaptive-quadrature-selection.md` — Adaptive quadrature point selection for Quadrature-TreeSHAP: Theorem 2 bound, 8-point sweet spot, profile-based selection algorithm, edge cases, and audit trail schema
- `references/gpu-cpu-routing.md` — Adaptive GPU/CPU routing for SHAP: dynamic threshold formula, performance benchmarks, cost analysis, routing profiles, reconciliation checker, per-firm GPU quotas, and learning router
