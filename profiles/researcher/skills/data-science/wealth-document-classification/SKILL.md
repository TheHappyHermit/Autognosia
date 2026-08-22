---
name: wealth-document-classification
description: "Document type auto-classification for wealth management platforms — taxonomy, model selection, training pipeline, drift monitoring, and capture guidance for OCR-aware document processing."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [Document-Classification, OCR, Wealth-Management, Confidence-Calibration, AI-ML]
    related_skills: [ocr-quality-metrics, synthetic-calibration-data]
---

# Document Type Auto-Classification for Wealth Management

## Core Principle: Confidence Is Meaningless Without Type

**The same confidence score means entirely different things depending on document type.** An 85% confidence score on a native PDF is a critical failure (should be 99%+). The same 85% on a phone photo is exceptional quality (typical range 50-70%).

**This is the foundational insight for all threshold selection in wealth management document processing.** Per-type confidence calibration is mandatory — not optional.

## 8-Class Taxonomy (Wealth-Specific)

| Class | Examples | Expected OCR Confidence | Threshold for Auto-Process |
|-------|----------|------------------------|---------------------------|
| Typed PDF (native) | eStatements, digital tax forms | 95-99% | ≥90% |
| Scanned document | Bank/brokerage scans, scanned W-2 | 70-85% | ≥75% |
| Email forward | Forwarded statements, email attachments | 60-80% | ≥65% |
| Phone photo | Mobile capture of any document | 40-70% | ≥45% |
| Handwritten | Hand-filled forms, signatures | 20-50% | Manual only |
| Multi-page bundle | Combined tax packages, trust docs | 50-75% | ≥55% |
| Image-only | Photos of checks, ID cards | 30-60% | ≥35% |
| Mixed quality | Partial OCR, partial native | 55-85% | ≥60% |

**Implementation note:** These thresholds must be calibrated per firm using ground-trust datasets. Start with these as priors, then adapt using the first 500-1,000 processed documents.

## Model Selection Path

### MVP: EfficientNet-B0 (Recommended Starting Point)
- ~5M parameters, runs on CPU in <50ms per document
- Accuracy: ~82% top-1 on wealth document types
- Pros: Fast, small footprint, easy to deploy
- Cons: Limited by pre-training domain gap (ImageNet ≠ financial docs)

### Upgrade Path: MobileNetV3-Small
- ~2.5M parameters, faster than EfficientNet-B0
- Better for mobile/edge deployment
- Accuracy: ~80-83% (comparable to EfficientNet-B0)

### Production: ViT-Small (Vision Transformer)
- ~22M parameters, requires GPU for <100ms inference
- Accuracy: ~87-90% on wealth document types
- Pros: Best accuracy, handles layout-aware classification
- Cons: Higher compute cost, slower cold start

### Fine-Tuning Strategy
1. **Start with pre-trained weights** (ImageNet for CNNs, LAION for ViTs)
2. **Domain adaptation**: Fine-tune on 10,000-50,000 labeled wealth documents
3. **Per-firm adaptation**: Further fine-tune on firm-specific document types
4. **Incremental learning**: Update with new document types as they appear

## Training Data Pipeline

### Automated Labeling (90% Accuracy Target)
1. **Known-type bootstrap**: Use file metadata (extension, MIME type, email headers) to create initial labeled set
2. **Confidence-assisted labeling**: High-OCR-confidence documents → auto-label as typed PDF; low-confidence → auto-label as phone photo
3. **Human-in-the-loop**: Flag uncertain predictions (<70% confidence) for manual review
4. **Active learning**: Prioritize human review for documents near classification boundaries

### Synthetic Data Augmentation
- Use `synthetic-calibration-data` skill for generating rare document types
- Apply controlled degradation (noise, blur, skew, compression) to expand training data
- **Critical**: Synthetic data weight must decay over time — never exceed 40% synthetic weight for more than 1,000 documents

### Class Imbalance Handling
- Wealth management firms have skewed document distributions (e.g., 40% bank statements, 15% tax forms)
- Use class-weighted loss or focal loss to prevent dominant classes from overwhelming minority types
- Track per-class accuracy; target ≥80% on all classes, not just majority classes

## Classifier Drift Monitoring (Critical)

**Accuracy degrades 2-5% per quarter without retraining.** Monitor these metrics:

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| ECE (Expected Calibration Error) | >0.05 | Auto-recalibrate confidence thresholds |
| Per-class accuracy drop | >5% from baseline | Flag for retraining |
| New document type detection | >3 docs with <40% confidence | Create new class or add to existing |
| KL-divergence of prediction distribution | >0.15 from baseline | Check for workflow changes |
| User override rate | >10% | Review classifier performance |

### Auto-Retraining Triggers
- ECE > 0.05 for 7 consecutive days
- Any class accuracy drops below 70%
- New document type detected in >5 documents
- Quarterly scheduled retraining (minimum)

## Document Capture Guidance Engine

**Guided photo capture improves OCR confidence by 15-25%.** Real-time feedback during document capture:

### Guidance Types
1. **Orientation correction**: "Rotate 90° clockwise for best results"
2. **Distance warning**: "Move phone closer — text is too small"
3. **Lighting feedback**: "Too dark — add light source"
4. **Blur detection**: "Image appears blurry — hold steady"
5. **Edge detection**: "Document edges not fully captured"

### Implementation
- Use on-device ML (CoreML on iOS, ML Kit on Android) for real-time feedback
- Show live preview with overlay guides
- Auto-trigger capture when quality thresholds met
- **Key UX principle**: Guidance must be specific and actionable, not generic

## Competitive Landscape

**Zero wealth management platforms offer document type classification:**
- eMoney, RightCapital, MoneyGuidePro: Upload documents with no classification
- Orion, Black Diamond, Addepar: Document management without type-aware processing
- Comply.com, Luthor.ai, SmarterCompliance: Compliance-focused, no document classification
- Google Document AI: Offers document classification but not wealth-specific

**First-mover advantage:** Document type classification enables:
- Per-type confidence thresholds (more accurate processing)
- Smart preprocessing routing (apply correct enhancement per type)
- User guidance during capture (better quality documents)
- Automated routing to correct downstream processors

**Data network effect moat:** More firms → more document type data → better classifier → better thresholds → more firms. This compounds over time.

## Implementation Priority

| Priority | Component | Effort | Impact |
|----------|-----------|--------|--------|
| HIGH | 8-class taxonomy + EfficientNet-B0 classifier | 2-3 weeks | Core feature |
| HIGH | Per-type confidence calibration system | 1-2 weeks | Accuracy multiplier |
| HIGH | Classifier drift monitoring | 1 week | Quality assurance |
| MEDIUM | Document capture guidance engine | 2-3 weeks | User experience |
| MEDIUM | Synthetic data pipeline | 1-2 weeks | Training data |
| LOW | ViT-Small upgrade path | 2-3 weeks | Future accuracy gain |

## Key Pitfalls

1. **Confusing file type with document type:** A .pdf can be a native PDF or a scanned PDF — classification must use image content, not metadata
2. **Over-classifying:** More classes = harder to train. Start with 5-8 classes; expand only when data supports it
3. **Ignoring class imbalance:** Wealth documents are heavily skewed. Monitor per-class accuracy, not just overall accuracy
4. **Static thresholds:** Document quality changes over time (new scanners, workflow changes). Always use adaptive calibration
5. **Cross-language gap:** CJK documents require different quality thresholds and potentially different classifiers. Plan for this early

## Related Skills

- **`ocr-quality-metrics`** — OCR confidence scoring, calibration, and threshold routing. Document classification is a prerequisite for proper threshold selection.
- **`synthetic-calibration-data`** — Synthetic document generation for training data gaps. Use to augment rare document types.

## See Also

- `references/taxonomy-key-data.md` — Full taxonomy with per-class examples, confidence ranges, and threshold data
- `references/model-selection-comparison.md` — Detailed model comparison (EfficientNet, MobileNet, ViT) with benchmarks
- `references/drift-monitoring-implementation.md` — Drift monitoring system: ECE/MCE thresholds, auto-recalibration triggers, data model
- `references/capture-guidance-spec.md` — Capture guidance engine: real-time feedback types, implementation specs, UX patterns
