# Document Type Taxonomy — Wealth Management

## 8-Class Taxonomy with Per-Class Data

### 1. Typed PDF (Native)
- **Examples:** eStatements (Fidelity, Schwab), digital tax forms (1040, W-2), digital 1099s, digital brokerage confirmations
- **Characteristics:** Native text layer, selectable text, no OCR needed
- **Expected OCR confidence:** 95-99%
- **Auto-process threshold:** ≥90%
- **Preprocessing:** None needed
- **Downstream:** Direct text extraction, no OCR pipeline

### 2. Scanned Document
- **Examples:** Bank statement scans, scanned W-2, scanned brokerage statements, scanned insurance policies
- **Characteristics:** Image of printed text, moderate quality, consistent layout
- **Expected OCR confidence:** 70-85%
- **Auto-process threshold:** ≥75%
- **Preprocessing:** Deskew, noise reduction, adaptive binarization
- **Downstream:** Standard OCR pipeline

### 3. Email Forward
- **Examples:** Forwarded statements, email attachments (mixed quality), forwarded tax documents
- **Characteristics:** Mixed content (email body + attachments), variable quality, includes email headers
- **Expected OCR confidence:** 60-80%
- **Auto-process threshold:** ≥65%
- **Preprocessing:** Header removal, content extraction, then standard OCR
- **Downstream:** Content extraction → OCR → classification

### 4. Phone Photo
- **Examples:** Mobile capture of any document type, point-and-shoot photos
- **Characteristics:** Variable quality, perspective distortion, lighting issues, blur, compression artifacts
- **Expected OCR confidence:** 40-70%
- **Auto-process threshold:** ≥45%
- **Preprocessing:** Perspective correction, perspective-aware OCR, aggressive noise reduction
- **Downstream:** Capture guidance → enhanced OCR pipeline

### 5. Handwritten
- **Examples:** Hand-filled tax forms, handwritten signatures, hand-noted investment memos
- **Characteristics:** Variable handwriting styles, low OCR accuracy, requires different processing
- **Expected OCR confidence:** 20-50%
- **Auto-process threshold:** Manual review only
- **Preprocessing:** Stroke enhancement, handwriting-specific preprocessing
- **Downstream:** Handwriting recognition (different model from OCR)

### 6. Multi-Page Bundle
- **Examples:** Combined tax packages, trust document bundles, multi-statement packages
- **Characteristics:** Multiple document types in single file, page-level variation
- **Expected OCR confidence:** 50-75%
- **Auto-process threshold:** ≥55%
- **Preprocessing:** Page-level classification, per-page preprocessing
- **Downstream:** Page splitting → per-page classification → per-page processing

### 7. Image-Only
- **Examples:** Photos of checks, ID cards, photos of printed charts/graphs
- **Characteristics:** No text or minimal text, visual content dominant
- **Expected OCR confidence:** 30-60%
- **Auto-process threshold:** ≥35%
- **Preprocessing:** Image enhancement, object detection
- **Downstream:** OCR + visual content analysis

### 8. Mixed Quality
- **Examples:** Partially scanned documents, hybrid native/scan documents, degraded PDFs
- **Characteristics:** Inconsistent quality within document, some pages high quality, some low
- **Expected OCR confidence:** 55-85%
- **Auto-process threshold:** ≥60%
- **Preprocessing:** Page-level quality assessment, per-page preprocessing
- **Downstream:** Page-level classification → per-page processing

## Per-Class Distribution (Typical RIA Firm)

| Class | Typical Frequency | Calibration Samples Needed |
|-------|------------------|---------------------------|
| Typed PDF | 30-40% | 1,000 |
| Scanned document | 20-30% | 1,000 |
| Phone photo | 15-25% | 1,500 (high variance) |
| Email forward | 5-10% | 500 |
| Multi-page bundle | 5-10% | 500 |
| Image-only | 3-5% | 500 |
| Handwritten | 2-5% | 500 |
| Mixed quality | 5-10% | 500 |

## Cross-Language Considerations

CJK (Chinese, Japanese, Korean) documents require:
- **Separate classifier:** Different character set, different layout patterns
- **Different OCR engine:** Tesseract CJK models, or Google Document AI with CJK support
- **Different quality thresholds:** CJK OCR confidence scores have different calibration curves
- **Different preprocessing:** CJK text density is much higher; binarization thresholds differ

## Implementation Notes

- **Start with file metadata** as a weak signal (extension, MIME type, email headers)
- **Classification must use image content** — never rely solely on metadata
- **Page-level classification** for multi-page documents (Class 6 and 8)
- **Confidence calibration** must be done per-class, not globally
- **Monitor per-class accuracy** separately — overall accuracy masks per-class issues
