---
name: ocr-quality-metrics
description: "OCR confidence scoring, quality metrics, calibration, and threshold-based routing for document processing pipelines."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [OCR, Quality, Confidence, Calibration, Document-Processing]
    related_skills: [ocr-and-documents]
---

# OCR Quality Metrics & Confidence Scoring

Assesses OCR output quality, calibrates confidence scores, and implements threshold-based routing for document processing pipelines.

## Critical: Tesseract Confidence Is NOT Calibrated

**Tesseract's confidence value X does NOT equal X% accuracy.** A score of 80 does not mean 80% character accuracy. Research confirms OCR confidence has "at best a slight correlation with CER in the low range but is otherwise not indicative of accuracy."

**Always build firm-specific calibration curves** using ground-truth datasets before relying on confidence scores for routing decisions.

### Calibration Methodology (Production-Ready)

1. **Stratified ground-truth dataset**: 5 document types × 1,000-5,000 samples each (typed PDF, scanned doc, email forward, handwritten, mixed quality). Manual verification of character accuracy per sample.

2. **Calibration algorithms**: Apply both Platt scaling (sigmoid fit to confidence vs. empirical accuracy) and isotonic regression (non-parametric, preserves monotonicity). Select the better-fitting model via cross-validation on held-out calibration set.

3. **Firm-specific calibration via template system**: Start each new firm with the population-level calibration curve, then adapt using the firm's first 500-1,000 processed documents as warm-up data. Store calibration versions with rollback capability.

4. **Adaptive calibration**: Maintain a rolling 10,000-document calibration window per firm. As document quality shifts (new scanners, workflow changes), the curve auto-updates without manual intervention.

### Competitive Landscape

**Zero competitors offer OCR confidence scoring** in compliance/wealth management software:
- Comply.com, Luthor.ai, SmarterCompliance, Black Diamond, Addepar, eMoney, RightCapital, Orion — none provide per-document or per-page OCR quality metrics.
- Google Document AI provides calibrated confidence scores (unlike Tesseract) — prefer it when available.

This is a **first-mover advantage** for any platform building OCR-aware document processing.

### Emerging Sub-Topics (from Run 742)

- **Calibration quality monitoring** (HIGH priority, researched run 742) — full monitoring system with ECE/MCE metrics, KL-divergence drift detection, CUSUM/Page-Hinkley change point detection, auto-recalibration triggers. See `references/calibration-monitoring.md` for thresholds, data model, edge cases, and implementation roadmap.
- **Per-source calibration monitoring** (HIGH priority) — separate ECE/MCE tracking per scanner/source to handle multi-scanner firms where different scanners produce different confidence distributions
- **Calibration explainability** (MEDIUM priority) — generate natural language explanation of calibration quality for compliance reports and SEC examination documentation
- **Calibration SLA per regulatory tier** (MEDIUM priority) — define acceptable calibration quality thresholds per regulatory requirement (SEC vs. state), tying monitoring thresholds to specific compliance obligations
- **Calibration curve versioning and rollback** (HIGH priority) — track calibration versions, enable instant rollback on drift detection
- **Synthetic calibration data for rare document types** (MEDIUM priority, researched run 742) — see skill `synthetic-calibration-data` for full methodology: 6 generation techniques (SynthDoG, RIDGE, DocDjinn, TRDG, LLM-generated, seed-based), distribution matching (KL-divergence, EMD, Wasserstein), weight decay scheduling, fidelity scoring framework (4 dimensions), document-type-specific strategies, 5 key pitfalls.
- **Calibration transfer learning across firms** (MEDIUM priority) — leverage one firm's calibration to bootstrap another firm's curve

## Threshold Routing Design

| Tier | Confidence Range | Action |
|------|-----------------|--------|
| High | ≥95% | Auto-process, no review |
| Flagged | 90-94% | Route to light review queue |
| Conditional | 80-89% | Require additional verification step |
| Manual | <70-80% | Full manual review |

**Note:** Thresholds must be calibrated per document type and per firm's scanning infrastructure.

## Preprocessing Impact

Preprocessing techniques can swing confidence scores by **15-30 points** on scanned documents:
- Deskew: aligns pages, removes rotation artifacts
- Noise reduction: removes scan artifacts and speckle
- Contrast enhancement: improves text/background separation
- Adaptive binarization: handles uneven lighting
- DPI upscaling: improves character clarity for low-res scans

**Always measure per-step effectiveness** — don't apply preprocessing blindly. Document type auto-classification should guide which preprocessing steps to apply.

## Document Type Auto-Classification

**Document type auto-classification is a prerequisite for proper threshold selection.** Before applying confidence thresholds, classify the document type — the same confidence score means entirely different things depending on type.

**See `wealth-document-classification` skill** for the complete 8-class taxonomy, model selection, training pipeline, drift monitoring, and capture guidance engine.

### Quick Reference

| Type | Expected Confidence | Auto-Process Threshold |
|------|-------------------|----------------------|
| Typed PDF (native) | 95-99% | ≥90% |
| Scanned document | 70-85% | ≥75% |
| Email forward | 60-80% | ≥65% |
| Phone photo | 40-70% | ≥45% |
| Handwritten | 20-50% | Manual only |

## Key Considerations

1. **Google Document AI** provides calibrated confidence scores (unlike Tesseract) — prefer it when available
2. **Cross-firm benchmarking**: anonymized OCR quality comparison can identify firms with scanning infrastructure issues
- **OCR quality-aware NLP**: downstream NLP processing should adapt based on OCR confidence levels — see `ocr-quality-aware-nlp-pipeline` skill for the full 5-tier confidence-stratified pipeline design, per-token confidence propagation, adaptive α/β weighting, cross-validation extraction, regulatory considerations, and 9 red-team edge cases
- **Regulatory angle**: SEC/FINRA may require audit trails of document processing quality for compliance workflows

## See Also

- **`calibration-method-selection`** — Automated selection of optimal calibration methods (isotonic, Platt, beta, temperature scaling) based on validation set characteristics (n_eff, score distribution shape, document specificity). Covers decision trees, effective sample size calculation, edge cases, and implementation patterns for multi-model ensemble calibration.
- **`wealth-document-classification`** — Document type auto-classification for wealth management: taxonomy, model selection, training pipeline, drift monitoring, and capture guidance. Prerequisite for proper threshold selection.
- **`ocr-quality-aware-nlp-pipeline`** — Confidence-stratified NLP processing pipeline: 5-tier pipeline, per-token confidence propagation, adaptive α/β weighting, cross-validation extraction, uncertainty-aware LLM prompting, regulatory considerations, 9 red-team edge cases. **Zero competitors offer this — first-mover advantage for WealthForge.**
- **`per-region-orientation`** — Per-region text direction analysis for mixed-layout documents: weighted circular mean aggregation with type-weighted voting, circular variance disagreement detection, per-region correction pipeline, cross-page consistency, adaptive VLM fallback. **Zero competitors offer this — first-mover advantage.**
- `references/competitive-analysis.md` — competitor OCR quality feature analysis
- `references/calibration-monitoring.md` — automated calibration quality monitoring: ECE/MCE thresholds, KL-divergence/CUSUM/Page-Hinkley drift detection, auto-recalibration triggers, data model, dashboard design, 6 red-team edge cases, implementation roadmap
- **Related skill: `synthetic-calibration-data`** — Synthetic document generation for OCR calibration data: 6 generation techniques, distribution matching, weight decay scheduling, fidelity scoring framework, document-type-specific strategies
- `references/osd-confidence-calibration.md` — Tesseract OSD (orientation detection) confidence calibration: document-type-specific thresholds, rotation angle patterns, adaptive threshold formula, special character effects, zero-competitor white space
- `references/pls-multi-output-calibration.md` — PLS2 multi-output calibration for OSD confidence: feature engineering (cell_area, text_density, DPI), two-stage calibration architecture (Platt → PLS2), cross-validation strategy, model selection criteria
- `references/ce-threshold-calibration.md` — CE (Consensus Entropy) threshold calibration for OSD ensemble disagreement: percentile-based per-document-type thresholds, exponential weighting, bimodality detection, competitive white space (ZERO platforms offer ensemble disagreement detection)
- `references/polar-split-threshold-calibration.md` — Document-type-specific threshold calibration for polar split resolution (0° vs 180° text direction): score distribution analysis (KDE, OVL, AUROC), three-tier threshold selection (Youden's J, cost-weighted, ROC convex hull), beta calibration, two-stage routing. **Zero competitors implement per-document-type threshold calibration — complete white space.**
