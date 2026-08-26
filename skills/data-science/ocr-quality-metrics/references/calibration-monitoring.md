# Automated Calibration Quality Monitoring

Research date: 2026-05-28 (WealthForge run 742).

## ECE Thresholds

| ECE Range | Status | Action |
|-----------|--------|--------|
| < 0.02 | Excellent | No action |
| 0.02-0.05 | Good | Monitor closely |
| 0.05-0.10 | Degraded | Alert, prepare recalibration |
| > 0.10 | Poor | Auto-recalibrate + alert compliance |

## MCE Thresholds

| MCE Range | Status | Action |
|-----------|--------|--------|
| < 0.03 | Acceptable | No action |
| 0.03-0.08 | Warning | Increase monitoring frequency |
| > 0.08 | Critical | Recalibrate immediately |

## KL Divergence Thresholds

| KL Range | Status | Action |
|----------|--------|--------|
| < 0.01 | Negligible drift | No action |
| 0.01-0.05 | Minor drift | Monitor |
| 0.05-0.10 | Moderate drift | Prepare recalibration |
| > 0.10 | Significant drift | Alert + recalibrate |

## Drift Detection Algorithms

### CUSUM (Gradual Drift)
Detects small, persistent shifts in confidence-to-accuracy relationship.
```
s_pos = max(0, s_pos + residual - target_shift/2)
s_neg = min(0, s_neg + residual + target_shift/2)
```
Alert when s_pos > threshold OR |s_neg| > threshold.

### Page-Hinkley (Sudden Shifts)
Detects abrupt changes (scanner upgrades, Tesseract version changes).
```
cumulative += r - delta
if cumulative - min_cumulative > threshold: CHANGE_POINT
```

## Auto-Recalibration Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| ECE | > 0.05 for 3 consecutive checks | Auto-recalibrate |
| MCE | > 0.08 | Auto-recalibrate + alert |
| KL | > 0.10 | Auto-recalibrate + flag |
| CUSUM | Drift detected | Auto-recalibrate |
| Page-Hinkley | Change point | Auto-recalibrate + alert |
| Document count | > 500 new verified docs | Weekly recalibration |
| Time-based | > 7 days since last | Weekly safety net |

## Auto-Recalibration Process

1. Save old calibration curve version (with compliance hash)
2. Refit on rolling window (isotonic regression)
3. Validate on held-out 20% of window
4. A/B test old vs new for 48 hours
5. Deploy new curve (version tag + audit trail)
6. Log compliance audit entry

## Red-Team Edge Cases

1. **Adversarial document quality** — Mitigate with Page-Hinkley pre-check, human approval for > 0.03 ECE change in 1 day, quality baseline pause.
2. **Calibration window poisoning** — Cross-validate with Brier score + reliability diagram slope; maintain held-out gold standard (500 docs).
3. **Multi-scanner firms** — Maintain per-source calibration curves; alert when per-source ECE diverges from overall ECE by > 0.02.
4. **Curve overfitting** — Minimum 500-doc window; cross-validate 80/20; Platt scaling fallback.
5. **Tesseract upgrade silent breakage** — Track version in metadata; KS test on confidence distributions; force recalibration if p < 0.01.
6. **Regulatory audit** — Compliance hash per version; full audit trail; exportable PDF report; SEC Marketing Rule alignment.

## Data Model

### calibration_health
Columns: id, firm_id, timestamp, ece, mce, brier_score, kl_divergence, cusum_status, page_hinkley_status, calibration_window_size, document_types (JSONB), alert_triggered, alert_action, created_at

### calibration_curve_versions
Columns: id, firm_id, version, curve_data (JSONB), ece, mce, brier_score, window_size, window_doc_types (JSONB), trigger_type, validated, rollback_available, created_at

### calibration_alerts
Columns: id, firm_id, timestamp, metric_type, metric_value, threshold, severity, action_taken, message, resolved, resolved_at, created_at

## Dashboard Design

- Overall status badge (green/yellow/red)
- ECE trend chart (30-day rolling)
- MCE trend chart (30-day rolling)
- Current calibration curve details (bins, method, samples, last fitted)
- Recent alerts with severity
- Quick actions: recalibrate, view history, disable auto-recalibration
- Embedded reliability diagram (confidence vs actual accuracy)

## Implementation Phases

1. **Basic Monitoring (2 weeks)** — ECE/MCE computation, time-series storage, simple alerting, trend chart dashboard
2. **Automated Recalibration (4 weeks)** — Trigger logic, isotonic refit, versioning/rollback, A/B testing, human-in-the-loop
3. **Advanced Drift Detection (3 weeks)** — CUSUM, Page-Hinkley, per-source monitoring, Tesseract upgrade detection, reliability diagram
4. **Compliance Integration (2 weeks)** — Exportable audit report, SEC Marketing Rule docs, compliance hash, exam export integration

## Competitive Position

Zero competitors offer automated calibration monitoring. Google Document AI provides calibrated confidence but is general-purpose, not wealth-management-tailored. First-mover advantage across all wealth management and compliance platforms.
