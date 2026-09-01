# Adaptive GPU/CPU Routing for SHAP Computation

Dynamic routing algorithm for deciding GPU (GPUTreeShap) vs CPU (multi-threaded TreeSHAP) for each SHAP computation request in WealthForge.

## Performance Benchmarks (GPUTreeShap Paper, PMC9044362)

| Dataset Size | Features | CPU (40 cores) | GPU (V100) | Speedup |
|-------------|----------|----------------|------------|---------|
| 10,000 rows | ~50 | ~2.5s | ~0.13s | 19x |
| 1,000 rows | ~50 | ~0.3s | ~0.15s | 2x |
| 100 rows | ~50 | ~0.03s | ~0.15s | 0.2x (CPU wins) |
| 10,000 rows | ~500 | ~8s | ~0.4s | 20x |

**Crossover point:** ~500-1000 rows for 50-feature models on V100. For WealthForge's 10-50 features, crossover is at ~10-15 profiles.

## Warm-Pool Impact on Latency

| State | Single Profile | 10 Profiles | 100 Profiles |
|-------|---------------|-------------|--------------|
| GPU cold | ~800ms | ~900ms | ~1.5s |
| GPU warm | ~300ms | ~400ms | ~1.0s |
| CPU (any) | ~50ms | ~150ms | ~1.5s |

## Dynamic Threshold Formula

```
dynamic_threshold = base_threshold × gpu_load_factor × urgency_factor × cost_factor

base_threshold = 10 profiles (default)
gpu_load_factor = 1.0 + (0.5 × gpu_utilization_pct / 100.0)  [1.0 to 1.5]
urgency_factor = 1.0 / urgency_weight  [0.33 (real-time) to 2.0 (scheduled)]
cost_factor = max(1.0, gpu_hourly_rate / cpu_hourly_rate)  [2.05 to 29.4]
```

### Example Thresholds

| Scenario | Threshold | Routing |
|----------|-----------|---------|
| Idle GPU, batch, A10G | 31.5 | GPU if >= 32 profiles |
| Busy GPU, real-time, A10G | 12.4 | GPU if >= 13 profiles |
| Idle GPU, scheduled, Lambda | 42.0 | GPU if >= 43 profiles |
| Busy GPU, batch, A100 | 426.3 | GPU if >= 427 profiles |

## Cost Analysis (A10G on AWS)

| Scenario | Platform | Cost per Profile |
|----------|----------|-----------------|
| Single profile | CPU | ~$0.000004 |
| Single profile | GPU (warm) | ~$0.000084 (20x CPU) |
| 10 profiles | CPU | ~$0.0000011 |
| 10 profiles | GPU (warm) | ~$0.000011 (10x CPU) |
| 100 profiles | CPU | ~$0.00000112 |
| 100 profiles | GPU (warm) | ~$0.0000028 (2.5x CPU) |

**Breakeven for cost-per-profile:** ~200-300 profiles on A10G.

## GPU Pricing Reference (2025)

| Provider | GPU | On-Demand/hr | Spot/hr |
|----------|-----|-------------|---------|
| AWS | A10G (G5) | $1.01 | $0.30-0.40 |
| AWS | A10 (P4de) | $4.10 | $1.20-1.80 |
| AWS | A100 (P4d) | $9.87 | $3.00-4.00 |
| GCP | A100 (A2) | $3.75 | $1.10-1.50 |
| GCP | L4 (A2) | $2.07 | $0.60-0.90 |
| Lambda | A10G | $0.69 | — |
| RunPod | A10G | $0.40 | $0.15-0.25 |

## WealthForge Routing Profiles

| Use Case | Urgency | Batch | Platform |
|----------|---------|-------|----------|
| Real-time dashboard | real-time | 1-5 | CPU always |
| Portfolio rebalancing | batch | 50-500 | GPU |
| Nightly compliance | scheduled | 1K-10K | GPU (cheapest) |
| Client-facing reports | interactive | 1-20 | GPU if warm-pool <1s |

## GPU-CPU Reconciliation Checker

- Run on 1% random sample daily
- Flag divergence > 10⁻⁹ for normal, > 10⁻⁷ for compliance
- GPUTreeShap produces bit-identical results for standard inputs; divergence only with extreme values (NaN, Inf, outliers)
- Hardcode CPU fallback for known divergent patterns

## Per-Firm GPU Quota Management

- Run:ai memory fractions (1/8 GPU per firm) provide hardware isolation
- Need software-level quota enforcement per firm
- VRAM estimation before routing: `estimated_vram = model_size_bytes × batch_size × feature_count × 4 (float32)`
- Auto-fallback to CPU on OOM

## Learning Router

- Weekly re-optimization via grid search over threshold parameters
- Performance history buffer: 168 hours (1 week)
- Objective function: minimize weighted_latency + cost

## Competitive Landscape

No wealth management platform implements GPU-accelerated SHAP. Only ML platforms do: Databricks, DataRobot, H2O.ai. First-mover advantage for WealthForge.

## Sources

1. GPUTreeShap paper (PMC9044362 / arXiv 2010.13972)
2. XGBlog Part 6 (xgblog.ai, Feb 2025)
3. NVIDIA RAPIDS GPUTreeShap (github.com/rapidsai/gputreeshap)
4. Cast AI GPU Price 2025 Report (cast.ai/reports/gpu-price)
5. NVIDIA Developer Blog: GPU-Accelerated SHAP
6. SHAP Documentation performance comparison
