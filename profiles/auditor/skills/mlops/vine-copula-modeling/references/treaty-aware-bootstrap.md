# Treaty-Aware Bootstrap Confidence

## Problem
Standard bootstrap for sparse correlation edges treats all time periods as exchangeable, failing when treaty amendments create structural breaks. Pre- and post-amendment data come from different distributions — averaging them produces meaningless confidence estimates.

## Core Methodology

### 1. Treaty Amendment Event Database
Track every amendment, protocol, MLI entry, termination, or replacement per treaty pair:
- `treaty_pair`, `event_type`, `effective_date`, `confidence` (in date), `affected_variables`, `pre_values`, `post_values`, `source`
- Populate from: OECD Double Taxation Convention Database, IRS Intergovernmental Agreements, EU Taxation Papers, BEPS documentation, Pillar Two tracking.

### 2. Regime-Stratified Bootstrap
For each treaty pair, identify regime boundaries from event DB (or Bai-Perron statistical detection if undocumented). Stratify bootstrap samples by regime:
```
For each replicate b:
    For each regime m:
        sample with replacement from regime m observations
    Combine sampled regimes to form bootstrap sample
```
Bootstrap weight per regime: `w_m = n_m / sum(n_k)` (proportional to regime size). Pool short regimes (<12 months) with adjacent ones.

### 3. Regime Transition Perturbation
For treaties amended within 24 months:
```
perturbation = multiply correlation by (1 + epsilon), epsilon ~ N(0, sigma_post_amendment)
```
sigma_post_amplitude estimated from post-amendment variance.

### 4. Bayesian Change Point Integration
For uncertain amendment dates:
- Prior: `p(tau) = Uniform(t_min, t_max)`
- Posterior: `p(tau|data) ∝ p(data|tau) * p(tau)` where `p(data|tau)` is two-regime likelihood
- Bootstrap: sample tau from posterior, then stratified bootstrap conditional on tau.

### 5. MLI and Pillar Two Special Handling
MLI affects 90+ treaties simultaneously → correlated structural breaks. Apply correlated perturbations across all MLI-affected pairs per replicate. Pillar Two creates global regime shift for treaties with effective tax rates below 15%.

### 6. Confidence Adjustment for Recent Amendments
```
months_since_amendment <= 6:  30% confidence reduction
months_since_amendment <= 12: 20% reduction (linear)
months_since_amendment <= 24: 10% reduction (linear)
months_since_amendment > 24:  no adjustment
```
Scale reduction by amendment severity (materiality of rate change).

## Confidence Tiers
| Tier | Confidence | Application |
|------|-----------|-------------|
| TIER-0 | > 0.95 | Portfolio optimization, regulatory reporting |
| TIER-1 | > 0.80 | Treaty attribution, standard allocation |
| TIER-2 | > 0.60 | Early warning, discretionary review |
| TIER-3 | < 0.60 | Exclude from optimization, flag for advisor |

## Integration with Existing Methods
```
Final Confidence = min(
    treaty_aware_confidence,
    impact_weighted_confidence,
    adaptive_bootstrap_confidence
)
```
Minimum used as conservative default. For stable treaties with no recent amendments, treaty-aware equals standard bootstrap.

## Performance
- Standard bootstrap: O(n_boot * n^3)
- Treaty-aware: O(n_boot * n^3 * R) where R = regimes per pair (typically 2-5)
- ~3x cost increase justified by accuracy improvement
- Mitigate with: parallel bootstrap, regime caching, adaptive n_boot

## Competitive Landscape
Zero wealth platforms implement treaty-aware confidence. Complete first-mover advantage.

## Sources
1. Perron (1989) — Structural breaks in time series
2. Bai & Perron (1998, 2003) — Multi-break detection
3. Politis & Romano (1994) — Stationary bootstrap
4. Scott & Schneider (2013) — Bayesian online change point detection
5. Ruggiero et al. (2020) — Multivariate Bayesian change points
6. OECD Double Taxation Convention Database
7. SEC Marketing Rule (2024) — Methodology disclosure requirements
