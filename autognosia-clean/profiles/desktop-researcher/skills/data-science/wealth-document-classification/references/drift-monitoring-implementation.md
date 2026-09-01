# Classifier Drift Monitoring — Implementation Guide

## Why Drift Monitoring Matters

Document type classifier accuracy degrades **2-5% per quarter** without retraining. Causes include:
- New document formats (e.g., new IRS form layouts)
- Scanner upgrades (higher resolution → different visual features)
- Workflow changes (more phone photos vs. scans)
- Seasonal patterns (tax season document mix changes)
- Software updates (e.g., Fidelity changes statement format)

## Monitoring Metrics

### 1. Expected Calibration Error (ECE)
Measures gap between predicted confidence and actual accuracy.

```python
def compute_ece(predictions, confidences, n_bins=15):
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    for i in range(n_bins):
        mask = (confidences > bin_boundaries[i]) & (confidences <= bin_boundaries[i+1])
        if mask.sum() == 0:
            continue
        bin_acc = predictions[mask].mean()
        bin_conf = confidences[mask].mean()
        ece += abs(bin_acc - bin_conf) * mask.sum() / len(predictions)
    return ece
```

**Threshold:** ECE > 0.05 triggers auto-recalibration.

### 2. Per-Class Accuracy Tracking
Track accuracy per document class separately. Overall accuracy masks per-class degradation.

```sql
CREATE TABLE classifier_accuracy_tracking (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    document_class VARCHAR(32) NOT NULL,
    total_docs INTEGER NOT NULL,
    correct_docs INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    baseline_accuracy REAL NOT NULL,
    accuracy_drop REAL NOT NULL,
    FOREIGN KEY (document_class) REFERENCES document_types(name)
);
```

**Threshold:** Any class accuracy drop > 5% from baseline triggers retraining flag.

### 3. Prediction Distribution Shift (KL-Divergence)
Monitor the distribution of predicted document classes. A shift indicates workflow changes.

```sql
CREATE TABLE prediction_distribution (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    document_class VARCHAR(32) NOT NULL,
    proportion REAL NOT NULL,
    baseline_proportion REAL NOT NULL,
    kl_divergence REAL NOT NULL
);
```

**Threshold:** KL-divergence > 0.15 from baseline triggers investigation.

### 4. User Override Rate
Track how often users change the auto-classified document type.

```sql
CREATE TABLE user_overrides (
    id INTEGER PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    auto_class VARCHAR(32) NOT NULL,
    user_class VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Threshold:** User override rate > 10% triggers performance review.

### 5. New Document Type Detection
Detect when documents don't match any known class.

```sql
CREATE TABLE low_confidence_docs (
    id INTEGER PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    max_confidence REAL NOT NULL,
    top_class VARCHAR(32) NOT NULL,
    second_class VARCHAR(32) NOT NULL,
    confidence_gap REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Threshold:** > 3 documents with max confidence < 40% in 7 days triggers investigation.

## Auto-Recalibration System

### Trigger Conditions

| Condition | Frequency | Action |
|-----------|-----------|--------|
| ECE > 0.05 for 7 consecutive days | Daily check | Auto-recalibrate confidence thresholds |
| Any class accuracy drop > 5% | Daily check | Flag for retraining |
| KL-divergence > 0.15 | Weekly check | Investigate workflow changes |
| New document type detected | Real-time | Create new class or add to existing |
| User override rate > 10% | Weekly check | Review classifier performance |
| Quarterly scheduled | Every 90 days | Full retraining |

### Recalibration Procedure

1. **Collect calibration data:** Last 10,000 documents with ground truth (user corrections + manual review)
2. **Compute new calibration curve:** Apply Platt scaling or isotonic regression
3. **Validate:** Compare new curve against held-out calibration set
4. **Deploy:** Replace old calibration curve; maintain rollback capability
5. **Monitor:** Watch ECE for 7 days post-deployment

### Rollback Protocol

```sql
CREATE TABLE calibration_versions (
    id INTEGER PRIMARY KEY,
    version VARCHAR(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ece REAL NOT NULL,
    accuracy_per_class JSON NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE
);
```

**Rule:** Keep last 10 calibration versions. Instant rollback on ECE spike > 0.08 post-deployment.

## Implementation Priority

| Priority | Component | Effort | Impact |
|----------|-----------|--------|--------|
| HIGH | ECE monitoring | 2-3 days | Core quality metric |
| HIGH | Per-class accuracy tracking | 2-3 days | Detect per-class degradation |
| HIGH | User override tracking | 1-2 days | Direct quality signal |
| MEDIUM | Prediction distribution shift | 2-3 days | Detect workflow changes |
| MEDIUM | Auto-recalibration | 3-5 days | Reduce manual maintenance |
| LOW | New document type detection | 2-3 days | Edge case handling |
