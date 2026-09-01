# OCR Confidence Calibration Methodology (v2)

## Core Problem

Tesseract's LSTM margin-based confidence scores are uncalibrated probabilities. A score of 80 does NOT mean 80% accuracy. This is a well-documented deep learning issue (Guo et al., 2017; Platt, 1999).

## Stratified Ground-Truth Dataset Construction

### Document Type Taxonomy (5 categories)

| Doc Type | Description | Expected Confidence Range |
|----------|-------------|--------------------------|
| Typed PDF (native text) | Documents with embedded text layer | 95-100 |
| Scanned document | High-quality scan (300+ DPI) | 70-90 |
| Scanned document (poor) | Low-quality scan (<200 DPI, noise) | 30-70 |
| Email forward | Text extracted from email formatting | 60-85 |
| Mixed quality | Combined types in single batch | varies |

### Sample Requirements

- **Minimum**: 1,000 samples per document type (5,000 total)
- **Recommended**: 3,000-5,000 per type (15,000-25,000 total)
- **Distribution**: Match expected real-world distribution, not uniform

### Manual Verification Protocol

1. Sample stratified by confidence bins (0-10, 10-20, ..., 90-100)
2. Verify character accuracy per sample against ground truth
3. Record: raw confidence, actual CER (character error rate), doc type, preprocessing applied
4. Build confidence → accuracy mapping table

## Calibration Algorithms

### Platt Scaling

Fit sigmoid: `P(accurate|confidence) = 1 / (1 + A*exp(B*confidence))`

- Parameters A, B optimized via maximum likelihood
- Best when calibration error is roughly sigmoid-shaped
- Fast to fit, smooth output

### Isotonic Regression

Non-parametric monotonic regression:
- Preserves order of confidence scores
- No functional form assumptions
- Better for complex calibration curves
- Risk of overfitting on small datasets

### Model Selection

- Cross-validate both methods on held-out calibration set
- Use Brier score or log-loss to select winner
- If tied, prefer isotonic (more robust)

## Firm-Specific Calibration

### Template System

1. Start with population-level calibration curve (all-firm aggregate)
2. Collect firm's first 500-1,000 processed documents
3. Manually verify accuracy on 100-200 representative samples
4. Fit firm-specific calibration on top of population curve
5. Store version with timestamp and sample count

### Calibration Drift Detection

- Monitor KL-divergence between calibration set distribution and live stream
- Alert when divergence exceeds threshold (e.g., 0.1)
- Trigger recalibration when drift detected

## Adaptive Calibration (Rolling Window)

### Architecture

- Maintain rolling 10,000-document calibration window per firm
- Each new verified document added; oldest removed when window full
- Recalibrate curve weekly or when >500 new documents added
- Version every calibration with rollback capability

### Benefits

- Automatically adapts to scanner upgrades, workflow changes
- Handles seasonal quality variations
- No manual intervention needed for normal quality shifts

## Competitive Landscape

**Zero competitors offer calibrated OCR confidence scoring:**
- Wealth management platforms: eMoney, RightCapital, MoneyGuidePro, Orion, Black Diamond, Addepar — none
- Enterprise compliance: Comply.com, Luthor.ai, SmarterCompliance — none
- Cloud OCR providers: Google Document AI provides calibrated scores (differentiator)

**First-mover advantage:** Any wealth management platform with calibrated OCR scoring has a significant competitive moat in the compliance document processing space.

## Sources

- Guo et al., 2017. "On Calibration of Modern Neural Networks"
- Platt, 1999. "Probabilistic Outputs for Support Vector Machines"
- Tesseract LSTM documentation — confidence is margin-based, not probability
- Industry research on OCR confidence calibration (various)
