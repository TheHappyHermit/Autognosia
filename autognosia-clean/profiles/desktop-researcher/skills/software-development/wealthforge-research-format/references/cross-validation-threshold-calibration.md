# Cross-Validation for Threshold Calibration in Bayesian Models

## Context

KL divergence thresholds (strong/moderate/weak) classify prior informativeness to determine alpha-power-scaling allocation for sensitivity analysis. These thresholds are calibrated on the full calibration dataset. Cross-validation validates them on held-out data.

## Methodology

### Stratified k-Fold CV Protocol
- **Stratification keys:** prior concentration (very_low/low/medium/high), dimensionality (very_low ≤3 / low 4-6 / medium 7-10 / high >10), sample size (very_small <5 / small 5-9 / medium 10-49 / large 50-99 / very_large ≥100), data source category (firm_cma, provider_consensus, historical, academic)
- **Fold count:** n<30 → LOO, 30≤n<100 → 5-fold, n≥100 → 10-fold. Adjust ±2 for high dimensionality (d>10).
- **Minimum training set per fold:** n=20

### Classification Stability Metrics
- **Threshold variance:** std of each boundary across folds
- **Agreement rate:** % profiles classified same as full-data classification
- **Cohen's kappa:** between fold thresholds and full-data thresholds
- **Flip rate:** % profiles whose classification changes across folds
- **Stability score:** weighted (0.3 strong_var + 0.3 moderate_var + 0.4 agreement_rate), 0-100

### Recommendation Impact Consistency
- Track recommendation changes per profile across folds
- Coefficient of variation of recommendation changes per profile
- Overall consistency = mean(1 - min(CV, 1))
- Flag profiles with consistency < 0.7

### KL Estimation Reliability
- Converged: bridge sampling converged
- ESS > 300 = reliable
- MCSE < 0.01 = reliable
- R-hat < 1.05 = reliable
- Overall reliability = % profiles passing all 4 criteria

### Bootstrap Confidence Intervals
- n=1000 resamples with replacement
- 95% CI = [2.5th percentile, 97.5th percentile]
- CI width > 0.40 nats → trigger data collection review

### Optimal Fold Count
- n < 30: LOO (k=n)
- 30 ≤ n < 100: 5-fold
- n ≥ 100: 10-fold
- High dimensionality (d > 10): +2 folds
- Low dimensionality (d ≤ 3): -1 fold (minimum 3)

## Red-Team Attacks

1. **Threshold gaming** — Advisor manipulates calibration data to push thresholds → Monitor threshold variance, flag when variance exceeds baseline
2. **Fold composition bias** — One fold has disproportionate prior concentration → Stratified sampling prevents this; monitor per-fold threshold variance
3. **Small-sample instability** — n<30 causes unreliable CV → Minimum n=30 for automated CV; below 30 use LOO with explicit confidence reporting
4. **Correlated profiles** — Same CMA provider → Apply cluster-aware CV: group by provider, hold out entire clusters
5. **Temporal leakage** — Chronological data with standard k-fold → Use time-aware CV: fold k uses [0,k) training, [k,k+1) testing

## When to Use

- Before deploying new KL divergence thresholds to production
- When calibration dataset changes by >5%
- Quarterly scheduled validation
- When threshold CI width exceeds 0.40 nats
- When cross-validating multiple calibration methods (quantile-based vs expected-KL-based vs information-theory-based)

## SQL Schema

See RESEARCH.md entry wps-02a-1a-2a-1a-a-1-1-1c-1 for full schema (threshold_cv_results, threshold_cv_fold_results, threshold_cv_classifications, threshold_cv_bootstrap_results).

## Cross-References

- wps-02a-1a-2a-1a-a-1-1-1c: KL divergence threshold calibration
- wps-02a-1a-2a-1a-a-1-1-1b: Dimension reduction for KL computation
- wps-02a-2: Dynamic sensitivity recalibration engine
- priorsense R package: only known implementation (uses fixed grid, no CV)
