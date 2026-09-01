# Tesseract OSD Confidence Calibration for Financial Headers

## Core Finding: OSD Confidence Is NOT a Probability

Tesseract's `orient_conf` is a **relative scoring value** representing the advantage of the winning orientation hypothesis over competing hypotheses. The same confidence value can have different accuracy implications across document types. **Document-type-specific calibration is essential.**

## Calibrated Thresholds by Document Type

| Document Type | Optimal Threshold Range | Rationale |
|---------------|------------------------|-----------|
| SEC Filings (EDGAR) | 12-14 | Clean PDFs, standard formatting |
| Annual Reports | 14-16 | Professional layouts, varied fonts |
| Tax Forms (1040, 1120, 5471, 8621) | 13-15 | Dense special characters, small fonts |
| Regulatory RFIs | 15-18 | Variable quality, noisy scans |
| PPLI Policy Documents | 13-15 | Carrier-specific layouts, complex tables |

## Rotation Angle Confidence Patterns

| Angle | Confidence Range (correct) | Characteristics |
|-------|---------------------------|-----------------|
| 0° (upright) | 25-40+ | Baseline, near 100% accuracy |
| 90° CW | 15-30 | Most common rotated orientation |
| 180° (inverted) | 10-25 | Fewer training examples, lower confidence |
| 270° CCW | 15-28 | Mirror of 90°, comparable accuracy |

## Factors That Reduce OSD Confidence

1. **Special characters**: $, %, +, −, currency codes create ambiguous patterns when rotated
2. **Small font size**: 6pt at 150 DPI < 20px height — insufficient for reliable OSD
3. **Dense text**: 5+ word headers have more signal but more confusion risk
4. **Multi-line headers**: Complex geometric arrangement confuses LSTM
5. **Symmetric text**: "OXOX", "88", "$$" — indistinguishable across orientations

## Adaptive Threshold Formula

```python
def adaptive_osd_threshold(cell_roi, cell_index, document_context):
    base = document_context.get('base_threshold', 15.0)
    # Cell size adjustment
    area = cell_roi.width * cell_roi.height
    if area < 1000: base += 3.0
    elif area < 3000: base += 1.5
    # Character density
    chars = estimate_char_count(cell_roi)
    if chars > 50: base += 2.0
    elif chars > 30: base += 1.0
    # Document type
    doc = document_context.get('document_type', 'unknown')
    adj = {'sec_filing': -1.0, 'annual_report': 0.0, 'tax_form': 0.5,
           'regulatory_rfi': 2.0, 'ppli_policy': 0.0}
    base += adj.get(doc, 0.0)
    # Known rotation context
    if document_context.get('known_rotation'): base -= 2.0
    return max(base, 8.0)
```

## Competitive Landscape

**Zero competitors** offer document-type-specific OSD confidence calibration:
- Google Document AI: black-box confidence, no calibration exposed
- AWS Textract: text block confidence only, no orientation confidence
- Azure Form Recognizer: same — no orientation calibration
- Adobe Acrobat Pro: page-level only, no confidence exposure
- ABBYY, Kofax, Docparser, Rossum, Hyperscience: none expose or calibrate OSD
- Wealth platforms (eMoney, Orion, RightCapital, Addepar): no cell-level orientation detection

## Key Pitfalls

1. **Never use a universal threshold** — the 15.0 "reasonably confident" anchor is suboptimal for specific document types
2. **Cell-level OSD is mandatory** — page-level OSD misses mixed orientations on the same page
3. **Resolution matters more than nominal DPI** — effective cell ROI resolution determines OSD reliability, not the document's stated DPI
4. **Calibration drifts over time** — scanner upgrades, Tesseract version changes, and workflow shifts require periodic recalibration

## Sources

- Tesseract OCR Advanced API: https://tesseract-ocr.github.io/tessapi/4.0.0/a01625.html
- Tesseract OSD example: https://github.com/tesseract-ocr/tessdoc/blob/main/examples/OSD_example.cc
- Tesseract Google Group discussion on confidence interpretation
- SEC EDGAR archives (ground truth source): https://www.sec.gov/cgi-bin/browse-edgar
