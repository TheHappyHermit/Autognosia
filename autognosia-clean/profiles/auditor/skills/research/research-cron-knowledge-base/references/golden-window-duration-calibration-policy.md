# Window Duration Calibration Policy

Use this when selecting evaluation window lengths for model monitoring.

## Problem

Fixed windows fail across families: too short inflates noise; too long hides slow drift.

## Decision Factors

1. source frequency
2. business impact
3. recent outcome volatility
4. regulatory timing constraints

## Recommended Buckets

- daily: transaction-level public-source series
- weekly: high-volume treaty flows
- monthly: medium-volume aggregated families
- quarterly: audit-evidence cadence families
- annual: slow-moving treaty conventions

## Scoring Selector

DurScore = a*(inverse_frequency) + b*(impact) + c*(volatility) + d*(regulatory_timing)

Decision:
- < 0.35 weekly
- 0.35-0.65 monthly
- 0.65-0.85 quarterly
- > 0.85 annual

## Adaptive Stability

Use hysteresis before changing duration:
- shorten: 3 consecutive lower windows
- lengthen: 2 consecutive higher windows

## Edge Cases

- late data: close on schedule; buffer missing; do not delay
- spikes: keep short duration for one spike window only, revert after two calm windows
- regulatory override: manual approval + audit reason required

## Audit Requirements

Every WINDOW_SHORTEN and WINDOW_LENGTHEN event must be logged with justification and metrics.
