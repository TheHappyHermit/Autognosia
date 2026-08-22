# Document-Type-Specific Threshold Calibration for Polar Split Resolution

## Overview

Per-document-type threshold calibration for polar split resolution (0° vs 180° text direction detection) — computing optimal confidence thresholds per document type using validation set analysis and score distribution metrics.

## Core Methodology

### Score Distribution Analysis
- **KDE** (Kernel Density Estimation) for smooth score distributions per class
- **Overlap Coefficient (OVL)**: ∫ min(P(score|y=0), P(score|y=1)) — determines threshold selection method
- **AUROC**: Area under ROC curve for score discriminative power
- **Jensen-Shannon divergence**: Measure of distribution dissimilarity
- **Hartigan's Dip Statistic**: Test for bimodality in score distributions

### Three-Tier Threshold Selection
| OVL Range | Method | Use Case |
|-----------|--------|----------|
| < 0.1 | Youden's J statistic | Well-separated distributions (strong signal) |
| 0.1–0.3 | Cost-weighted threshold (default w_fn/w_fp = 10:1) | Moderate overlap, FN more costly than FP |
| 0.3–0.6 | ROC convex hull analysis | Poor discrimination — flag for pipeline upgrade |
| ≥ 0.6 | Global fallback threshold | Document type has poor direction discrimination |

### Calibration Methods
- **Beta calibration** (preferred): logit(P) = A·logit(score) + B — flexible, handles under/over-confident scores
- **Isotonic regression**: Non-parametric, requires 500+ samples
- **Platt scaling**: Sigmoid fit, requires 200+ samples

### Two-Stage Document Type Routing
1. Pre-threshold classification on rotation-invariant features (texture, color histogram, layout)
2. Apply per-type threshold if confidence > 0.8; weighted average of top-K thresholds if < 0.8; global fallback if < 0.5

## Competitive Landscape
**ZERO competitors** across Document AI (Adobe, Google Document AI, AWS Textract, Azure Document Intelligence, Docling, TableFormer), compliance (TeamMate+, Workiva, ONESOURCE), or wealth management (eMoney, RightCapital, AdviserHub, eFront) platforms implement per-document-type threshold calibration. All use single global thresholds or fixed confidence cutoffs.

## Validation Set Requirements
- Minimum 100 labeled documents per type for basic threshold computation
- 500+ for robust estimation with confidence intervals
- 1000+ for sub-type splitting
- Balanced 0°/180° split, multi-scanner coverage, temporal diversity

## Related Skills
- `validation-set-contamination-detection` — Cross-validation consistency, Huber outlier analysis, consensus labeling
- `ce-distribution-bimodality-detection` — Hartigan's Dip Statistic per document type with automatic sub-type splitting
- `ce-threshold-drift-monitoring` — Monitoring system for detecting significant CE threshold drift over time
- `bayan-shrinkage-low-volume` — Empirical Bayes shrinkage for sparse validation data

## Sources
- Sahoo et al. (2021) "Reliable Decisions with Threshold Calibration" — NeurIPS
- Kull et al. (2019) "Beta Calibration: A Well-Founded and Flexible Approach" — arXiv:1805.11047
- Guo et al. (2017) "On Calibration of Modern Neural Networks" — ICML
- scikit-learn: "Tuning the decision threshold for class prediction"
