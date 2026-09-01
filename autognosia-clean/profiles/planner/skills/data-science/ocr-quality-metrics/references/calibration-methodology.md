# OCR Confidence Calibration Methodology

Research date: 2026-05-28. Source: WealthForge deep research run 737.

## Why Calibration Is Required

Tesseract's confidence scores are **un-calibrated per-character values** (0-100 scale) that represent the engine's internal certainty about each character recognition. They do NOT map to actual character error rate (CER).

## Calibration Dataset Construction

### Step 1: Gather Ground Truth
- Collect 500-1000+ documents of each type (typed PDF, scanned, email, handwritten)
- Have human annotators verify correct text for each document
- This becomes your ground-truth reference

### Step 2: Run OCR and Collect Scores
- Run Tesseract (or Google Document AI) on each document
- Record per-page and per-character confidence scores
- Record actual CER (character errors / total characters)

### Step 3: Build Calibration Curves
- Plot confidence score vs. actual accuracy for each document type
- Fit a curve (logistic regression, piecewise linear, or spline)
- This maps raw confidence → calibrated accuracy probability

### Step 4: Validate
- Test on a held-out set of 100+ documents
- Verify that calibrated thresholds correctly route documents
- Adjust thresholds based on false positive/false negative rates

## Preprocessing Effectiveness Measurement

For each preprocessing step, measure:
1. Confidence score delta (before/after)
2. CER delta (before/after) — requires ground truth
3. Processing time overhead

Typical gains (from research):
- Deskew: +5-10 points confidence
- Noise reduction: +5-15 points
- Contrast enhancement: +5-10 points
- Adaptive binarization: +10-20 points (on poor scans)
- DPI upscaling: +5-15 points

**Total potential gain: 15-30 points on worst-case scanned documents.**

## Per-Document-Type Thresholds (Pre-Calibration Estimates)

| Document Type | High Threshold | Flagged Threshold | Manual Threshold |
|--------------|---------------|-------------------|-----------------|
| Typed PDF | ≥95% | 90-94% | <90% |
| Scanned (good) | ≥90% | 85-89% | <85% |
| Scanned (poor) | ≥85% | 75-84% | <75% |
| Email forward | ≥90% | 80-89% | <80% |
| Handwritten | ≥80% | 70-79% | <70% |

**These are initial estimates — must be calibrated per firm's scanning infrastructure.**
