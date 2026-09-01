---
name: cross-document-transfer-learning
description: Transfer optimized tier boundaries, thresholds, or model parameters from a source document family to a similar target family to reduce validation data requirements and computation cost.
trigger: Load when adding a new document type that is structurally or semantically similar to an existing one, when reducing labeled data requirements for new document types, when accelerating optimization convergence for document types with limited validation data, or when designing transfer mechanisms between related document families.
---

# Cross-Domain Transfer Learning for Document Processing

Transfer optimized tier boundaries, thresholds, or model parameters from a source document family to a similar target family to reduce validation data requirements and computation cost.

## When to Use

- Adding a new document type that is structurally or semantically similar to an existing one (e.g., W-8BEN → W-8BEN-E, W-2 variants)
- Reducing labeled data requirements for new document types
- Accelerating optimization convergence for document types with limited validation data
- Any scenario where a source domain has been optimized and a related target domain needs similar parameters

## Step 1: Measure Document Family Similarity

Compute a composite similarity score across three dimensions:

### Structural Similarity (weight: 0.5)
- Compare field bounding box coordinates, field types, and field relationships using OCR layout analysis
- Score = aligned_fields / total_fields
- W-8BEN and W-8BEN-E share ~80% of fields

### Semantic Similarity (weight: 0.3)
- Taxonomic embedding of form purposes using IRS publication cross-references
- Measure purpose overlap (e.g., both establish tax residency), treaty relationships, withholding implications, compliance obligations
- Use regulatory classification hierarchies for embedding

### Complexity Similarity (weight: 0.2)
- Compare field count, dependency depth, conditional logic, cross-reference requirements
- Use complexity score from tier boundary optimization pipeline
- Normalize per family using min-max from complexity normalization

### Composite Score
```
similarity(F1, F2) = 0.5 * structural_sim + 0.3 * semantic_sim + 0.2 * complexity_sim
```

Calibrate weights empirically; initial values above are recommended defaults.

## Step 2: Select Transfer Mechanism

Three mechanisms of increasing sophistication:

### Mechanism 1: Boundary Initialization Transfer (Low Cost)
- Use source family's optimized boundaries as starting point with similarity-weighted perturbation
- High similarity (>=0.85): source boundaries + small noise (±2%)
- Medium similarity (0.5-0.85): interpolate between source and uniform (0.25/0.5/0.75)
- Low similarity (<0.5): random init with source as constraint bounds
- **Impact**: 20-40% reduction in optimization iterations

### Mechanism 2: Confidence-Gated Bayesian Transfer (Medium Cost)
- Transfer a distribution over boundaries with quantified uncertainty
- Uncertainty scales inversely with similarity: `uncertainty_scale = (1 - similarity) * 0.15 + 0.02`
- Bayesian update as validation data accumulates: precision-weighted combination of prior and observations
- **Impact**: Safe transfer with quantified confidence; natural fallback to full optimization

### Mechanism 3: Feature-Level Domain Adaptation (High Cost)
- Transfer feature representations via Maximum Mean Discrepancy (MMD)
- Align feature distributions between source and target domains
- Use RBF kernel for kernel two-sample test
- **Impact**: Handles layout-similar but distribution-different document pairs (different OCR quality, scanning resolution, form versions)

## Step 3: Apply Confidence Gates

Compute transfer confidence:
```
confidence = 0.5 * similarity + 0.3 * data_quality + 0.2 * opt_confidence
```

Decision rules:
| Confidence | Strategy |
|-----------|----------|
| >= 0.8 | Full transfer — use transferred boundaries as primary initialization |
| 0.5 - 0.8 | Partial transfer — warm start with wider search bounds |
| 0.3 - 0.5 | Constraint only — use as constraint hints only |
| < 0.3 | Full optimization — no transfer, optimize from scratch |

## Step 4: Validate

### Holdout Protocol
1. For each family with >1000 labeled samples: split train/validation/holdout (80/10/10)
2. Optimize on train+validation, test transfer from each other family
3. Measure: boundary accuracy, early-exit accuracy, computation savings

### Success Metrics
| Metric | Target |
|--------|--------|
| Transfer accuracy | >90% of full optimization (boundary distance within 5%) |
| Data reduction | >60% fewer labeled samples needed |
| Compute reduction | >40% fewer optimization iterations |
| Confidence calibration | Brier score <0.1 |

### A/B Testing
- Rotate document families between transfer and control groups
- Measure accuracy delta, compute savings, data savings per quarter

## Pitfalls

### Cascading Transfer Errors
- **Problem**: Error propagates through transfer chains (A → B → C → D)
- **Fix**: Limit transfer depth to 1 hop; each transfer must be validated before being used as a source

### Over-Transfer from Dissimilar Sources
- **Problem**: Transfer from a dissimilar source degrades target performance
- **Fix**: Enforce 0.5 confidence threshold for direct boundary transfer; below this, use only constraint hints

### Form Version Drift
- **Problem**: IRS updates form version, changing field layouts or requirements
- **Fix**: Detect version changes via field count/layout analysis; invalidate transfer priors when changes detected

### Data Quality Mismatch
- **Problem**: Source has poor validation data quality but high structural similarity inflates confidence
- **Fix**: Include data quality in confidence score; require minimum data quality threshold (>=0.7)

### Adversarial Similarity
- **Problem**: Document type designed to look similar but have different tier requirements
- **Fix**: Require minimum validation data (>=100 samples) before accepting transferred boundaries

## Multi-Source Transfer

When no single source is strong enough, combine top-3 sources with quadratic weighting:
```
weighted_boundary = Σ(similarity² * source_boundary) / Σ(similarity²)
```
