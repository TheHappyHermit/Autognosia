# KL Divergence Estimation Convergence Diagnostics

## Purpose
Convergence diagnostics for KL divergence estimation in WealthForge's Bayesian calibration system. Determines when bridge sampling KL estimates are reliable enough for prior informativeness classification (strong/moderate/weak).

## Three Complementary Diagnostics

### 1. Effective Sample Size (ESS)
Kish's formula adapted for bridge sampling:
```
ESS = 1 / Σ(w_i²)
```
where w_i are normalized importance weights.

**Thresholds:**
- ESS < 100 → KL estimate unreliable
- ESS < 300 → KL estimate questionable
- ESS > 1000 → KL estimate reliable

### 2. R-hat (Gelman-Rubin adapted for KL)
Run 4 independent bridge sampling chains. Compare between-chain vs within-chain variance:
```
R-hat = sqrt((B/n_chains + W) / W)
```
where B = between-chain variance, W = within-chain variance.

**Thresholds:**
- R-hat < 1.01 → Excellent convergence
- R-hat < 1.05 → Good convergence
- R-hat < 1.10 → Acceptable convergence
- R-hat ≥ 1.10 → Poor convergence; increase samples

### 3. MCSE-based Confidence Interval
Compute Monte Carlo Standard Error via batch means:
```
MCSE = std(batch_means) / sqrt(n_batches)
```

**Classification reliability:** |KL_estimate - threshold| > 1.96 × MCSE

If confidence interval crosses nearest threshold (0.5 or 0.05), classification is unreliable regardless of R-hat.

## Adaptive Sampling Procedure

```
Iteration 1: 4 chains × 250 samples = 1,000 total
Iteration 2: 4 chains × 500 samples = 2,000 total
Iteration 3: 4 chains × 1,000 samples = 4,000 total
Iteration 4: 4 chains × 2,000 samples = 8,000 total
Iteration 5: 4 chains × 4,000 samples = 16,000 total
```

Exponential growth with convergence check after each iteration. Max 10 iterations.

## Minimum Sample Size Calculator

```
N > (z × d × σ_log_ratio / ε)²
```

Where:
- z = confidence quantile (1.96 for 95%)
- d = dimensionality of calibration prior
- σ_log_ratio = std of log(p(x)/q(x)) under P
- ε = desired half-width of confidence interval

**Example:** d=12, σ=1.5, ε=0.05 → N > 220K theoretical
With bridge sampling's 10-100x variance reduction: ~2.2K practical.

## SQL Schema

```sql
CREATE TABLE kl_divergence_convergence_diagnostics (
    id UUID PRIMARY KEY,
    calibration_id UUID NOT NULL,
    dimensionality INTEGER NOT NULL,
    n_samples_total INTEGER NOT NULL,
    n_chains INTEGER NOT NULL,
    kl_estimate FLOAT NOT NULL,
    kl_classification VARCHAR(20),
    rhat FLOAT NOT NULL,
    mcse FLOAT NOT NULL,
    ess FLOAT NOT NULL,
    ci_lower FLOAT NOT NULL,
    ci_upper FLOAT NOT NULL,
    converged BOOLEAN NOT NULL,
    convergence_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE kl_divergence_chain_results (
    id UUID PRIMARY KEY,
    diagnostic_id UUID NOT NULL,
    chain_index INTEGER NOT NULL,
    kl_estimate FLOAT NOT NULL,
    ess FLOAT NOT NULL,
    mcse FLOAT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Key Sources

1. Gelman & Rubin (1992) — R-hat diagnostic
2. Gelman & Meng (1998) — Bridge sampling foundations
3. Vehtari et al. (2024) — PSIS diagnostics, ESS, MCSE
4. Klossner & Nagel (2025) — Bridge sampling MCSE (arXiv:2508.14487)
5. Kraskov et al. (2004) — kNN KL/MI estimation
6. Wang et al. (2009) — kNN divergence minimax rates
