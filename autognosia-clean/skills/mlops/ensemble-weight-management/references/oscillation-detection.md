# Weight Oscillation Detection and Damping

## Dual-Metric Detection System

### Oscillation Frequency Metric (OFM)
Counts direction changes in weight time series over a rolling window:
```
OFM(t) = count of sign(w(t-k) - w(t-k-1)) ≠ sign(w(t-k-1) - w(t-k-2))
         for k = 0 to window_size - 1
```

**Thresholds (30-day window):**
| Alert | OFM | Action |
|-------|-----|--------|
| GREEN | ≤ 3 | Normal |
| AMBER | 4-5 | Log advisory |
| YELLOW | 6-7 | Damping α = 0.02 |
| ORANGE | 8-9 | Strong damping α = 0.008 + compliance notification |
| RED | ≥ 10 | Freeze weights, manual review |

### Amplitude-Weighted Oscillation Score (AWOS)
Penalizes large-amplitude swings:
```
AWOS(t) = Σ_k |Δw(t-k)| × |Δw(t-k) - Δw(t-k-1)|
```

**Thresholds:**
| Alert | AWOS |
|-------|------|
| GREEN | < 0.002 |
| AMBER | 0.002-0.005 |
| YELLOW | 0.005-0.015 |
| ORANGE | 0.015-0.030 |
| RED | > 0.030 |

### Periodicity Detection
Autocorrelation of weight time series: if |ρ(τ)| > 0.5 for any τ in [5, 30], flag as potentially periodic. Periodic oscillation suggests feedback loops or external periodicity.

## Damping Mechanism

### Adaptive Exponential Smoothing
```
w_smoothed(t) = α × w_raw(t) + (1 - α) × w_smoothed(t-1)
```
Applied to the update, not raw weight:
```
w(t+1) = w_smoothed(t) + α × [w_raw(t+1) - w_smoothed(t)]
```

### Baseline-Attraction Stabilization
```
w_damped(t) = w_smoothed(t) + β × (baseline(t) - w_smoothed(t))
β = min(0.1, OFM / 20)
```

### Release Criteria
- OFM drops below 3 for 15 consecutive updates → α returns to 1.0
- AWOS drops below 0.002 for 15 consecutive updates → β returns to 0
- Regime change detected → suspend detection during warm-up (10 updates)

## Sparse Data Handling
- Minimum 10 calibration events required for OFM computation
- Below threshold: switch to trend-based oscillation metric (linear regression slope)
- Confidence-weighted OFM adjusts by inverse of event count

## Edge Cases
1. **Genuine performance shift masquerading as oscillation** → Large-amplitude swings trigger RED freeze (manual review), not damping
2. **Adversarial pacing** → AWOS secondary trigger + periodicity detection catches deliberate low-frequency large-amplitude oscillation
3. **Correlated methods oscillating together** → Correlation-aware scoring merges oscillation scores for ρ > 0.7
4. **Damping creates latent instability** → Accumulation tracking delays release; gradual α ramp on release
