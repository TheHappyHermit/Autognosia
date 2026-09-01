# CMA Provider Cadence Anomaly Detection

## Overview

Statistical anomaly detection for CMA provider update patterns. Three complementary methods detect different failure modes: z-score for individual interval anomalies, EWMA for trend detection, and CUSUM for sudden change point detection.

## Three Detection Methods

### 1. Z-Score (Primary — requires 5+ data points)

```
z_score = (interval_current - mean_interval) / std_interval
```

**Provider-specific thresholds** (critical — universal thresholds produce too many false positives):

| Provider Type | Mild | Moderate | Severe |
|--------------|------|----------|--------|
| Quarterly (stable) | z>1.0 | z>2.0 | z>3.0 |
| Quarterly (volatile) | z>1.5 | z>2.5 | z>3.5 |
| Semi-annual (stable) | z>1.0 | z>1.8 | z>2.8 |
| Annual (stable) | z>0.8 | z>1.5 | z>2.5 |
| Annual (volatile) | z>1.2 | z>2.0 | z>3.0 |

**Volatility classification:** CV = σ/μ. CV < 0.15 = stable, 0.15-0.30 = moderate, ≥ 0.30 = volatile.

### 2. EWMA (Trend Detection — requires 2+ data points)

```
EWMA_t = α * interval_t + (1 - α) * EWMA_{t-1}
ewma_deviation = (interval_current - EWMA) / EWMA * 100
```

- α = 0.3 (volatile) or 0.15 (stable)
- Alert when interval > UCL or < LCL (control limits at ±3σ_ewma)
- Detects cadence drift that z-score misses

### 3. CUSUM (Change Point Detection — requires 3+ data points)

```
S_t = max(0, S_{t-1} + (interval_t - μ - k))
k = 0.5 * σ, H = 5 * σ
```

Dual CUSUM detects both slowdowns and speedups. Most sensitive to sudden cadence shifts.

## Combined Anomaly Score (0-100)

```
anomaly_score = 0.40 * z_norm + 0.30 * ewma_norm + 0.30 * cusum_norm
```

| Score | Severity | Response |
|-------|----------|----------|
| 0-20 | Normal | None |
| 20-40 | Mild | Monitor |
| 40-60 | Moderate | Investigate 48h |
| 60-80 | High | Investigate 24h |
| 80-100 | Critical | Immediate |

## Provider Baselines (as of May 2026)

| Provider | Cadence | Mean | Std | CV | Class |
|----------|---------|------|-----|-----|-------|
| BlackRock | Quarterly | 90d | 12d | 0.13 | Stable |
| Invesco | Quarterly | 90d | 15d | 0.17 | Moderate |
| PGIM | Quarterly | 90d | 18d | 0.20 | Moderate |
| Vanguard | Semi-annual | 180d | 30d | 0.17 | Moderate |
| Capital Group | Annual | 365d | 45d | 0.12 | Stable |
| J.P. Morgan | Annual | 365d | 30d | 0.08 | Stable |
| Northern Trust | Annual | 365d | 50d | 0.14 | Stable |
| AQR | Annual | 365d | 80d | 0.22 | Moderate |
| Amundi | Annual | 365d | 60d | 0.16 | Moderate |
| State Street | Annual | 365d | 40d | 0.11 | Stable |
| Voya | Annual | 365d | 55d | 0.15 | Moderate |
| Verus | Annual | 365d | 45d | 0.12 | Stable |
| Lombard Odier | Semi-annual | 180d | 20d | 0.11 | Stable |
| Dimensional | Irregular | N/A | N/A | N/A | Unknown |

## Key Edge Cases

1. **Cold start (< 5 data points):** Z-score unreliable. Use EWMA + CUSUM only. Display "low confidence" badge.
2. **Major revision disguised as delay:** Semantic analysis of provider announcements for keywords like "methodology overhaul." Suppress alert for 30 days, flag for review.
3. **Seasonal patterns:** Phase 2 — STL decomposition. Phase 1 — calendar-based detection for CV < 0.05 providers.
4. **Provider M&A:** Monitor Crunchbase press releases. Auto-suspend detection, flag for manual review.
5. **Scrape failure → false anomaly:** Cross-reference with scraping health metrics. Suppress if scrape errors detected.
6. **Revision cycles (rapid successive publications):** Treat publications within 30 days as single event.
7. **Fixed-calendar providers:** Z-score near zero even when late. Use calendar window detection.

## Competitive Landscape

ZERO existing wealth platforms monitor CMA provider update cadence statistically. First-mover advantage.

## Manual Override System

Providers legitimately change cadence (methodology overhauls, mergers, restructuring). Override workflow:
1. Analyst investigates anomaly alert
2. If legitimate cadence change found → create override with start/end date, reason, evidence URL
3. Anomaly alerts suppressed during override period
4. If no legitimate reason → escalate to senior analyst

## Cross-References

- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c: CMA monitoring dashboard
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-1: Automated CMA publication detection
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-3: Update impact on withdrawal plan stability
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-4: Client notification workflow
- wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7c-5: Historical frequency analysis

## Future Research Topics

- Seasonal cadence pattern detection (STL decomposition)
- Provider cadence correlation matrix
- Anomaly confidence scoring
- Bayesian change point detection
- M&A event monitoring integration
