# Estate Planning Document AI Extraction: Tool Landscape & Technology Stack

Condensed reference on the estate planning document AI extraction competitive landscape and underlying technology options. Covers 7 competing tools, 5 key gaps, and the Docling+Mistral OCR dual-path architecture. Relevant for wealth management platforms building trust document AI extraction, estate plan analysis, or AI document ingestion features.

## Competitive Landscape (7 Tools)

| Tool | Trust-Specific? | Trust Type Classify? | EDB Detection? | Beneficiary w/ Role? | Structured Output? | API Available? |
|------|----------------|---------------------|----------------|---------------------|-------------------|---------------|
| **Holistiplan Estate** (2025) | Partial (general docs) | No | No | Basic names only | Human summary | Limited |
| **Vanilla V/AI** (2024-2025) | Partial (general docs) | No | No | Basic names | Human summary | Yes |
| **FP Alpha** | Partial (estate+tax) | No | No | No | Human summary | Limited |
| **Trust & Will for Attorneys** (Jan 2026) | Partial (attorney focus) | No | No | Beneficiaries+trustees | Human summary | No |
| **Luminary** (2025) | Yes (trust+estate) | Partial (trust vs will) | No | Beneficiaries | Human summary | No |
| **Affinda** | Yes (trust deeds) | Partial | No | Partial | Structured JSON | Yes (REST) |
| **Wealth.com Ester** (2025) | Partial (estate focus) | No | No | Basic names | Human summary | Yes |

### Key Gaps Across ALL Tools

1. **EDB status extraction** — The SECURE Act's most important innovation (Eligible Designated Beneficiary classification per IRC Sec 401(a)(9)(E)) is entirely unaddressed. No tool classifies beneficiaries as spouse/minor/disabled/chronically_ill/not_much_younger vs. non-EDB.
2. **Trust type classification** — Conduit vs. accumulation vs. grantor vs. QTIP vs. CRT vs. SNT — these determine completely different tax treatments (49:1 bracket compression ratio, DNI optimization, 10-Year Rule compliance), but no automated classifier exists.
3. **Trust-specific powers** — Decanting power, trust protector, power to remove trustee — essential for trust administration but invisible to current tools.
4. **Structured data for downstream engines** — Every existing tool produces human-readable summaries (not structured JSON/JSONB). Cannot feed into tax calculators, RMD engines, DNI optimizers, or 10-Year Rule compliance dashboards.
5. **Wealth management planning software integration** — Extracted data stays in the extraction tool. Does not flow into withdrawal optimizers, Roth conversion calculators, or estate planning engines.

## Technology Stack

### Docling (IBM Research, Nov 2024 — Present)

- **github.com/docling-project/docling** — Open-source document understanding layer
- **Capabilities:** Layout analysis, table structure recognition, reading order detection, image classification. Processes PDF/DOCX/PPTX/XLSX/images.
- **IBM Granite-Docling-258M VLM** (Sep 2025): Ultra-compact VLM for self-hosted document conversion
- **Accuracy:** 94%+ on table extraction (Procycons Benchmark 2025)
- **Cost:** $0 (GPU compute only: ~$0.01 per document)
- **Self-hosted:** 100% open-source — no client data leaves the firm. Preferred for financial services data privacy.

### Mistral OCR (Mistral AI, Mar 2025 — Present)

- **mistral.ai/news/mistral-ocr** — State-of-the-art OCR API
- **Capabilities:** "Doc-as-prompt" structured JSON extraction, handwriting support, multilingual (89.55%)
- **Benchmarks:** 94.89% overall vs Google Document AI (83.42%) and Azure OCR (89.52%). Scanned doc accuracy: 98.96%.
- **OCR 3 (Dec 2025):** $2/1000 pages, 97% cheaper than AWS Textract
- **Cost:** ~$0.08 per 40-page trust document
- **Requires DPA/BAA** for financial services use

### Dual-Path Selection Logic

```
if scanned_page_ratio > 30%:
    use Mistral OCR (scanned/handwriting fallback)
else:
    use Docling (electronic PDFs, self-hosted)
```

## Key Sources

1. **Docling Project:** github.com/docling-project/docling
2. **Mistral OCR:** mistral.ai/news/mistral-ocr
3. **Procycons Benchmark (2025):** procycons.com/en/blogs/pdf-data-extraction-benchmark/
4. **IBM Granite-Docling (Sep 2025):** ibm.com
5. **Kitces.com (Sep 2024):** "Digital Estate Planning Platforms" — extraction still largely manual
6. **Kitces.com (Nov 2024):** Holistiplan estate doc extraction launch
7. **Vanilla V/AI (May 2025):** justvanilla.com
8. **Trust & Will for Attorneys (Jan 2026):** trustandwill.com
9. **Luminary (2025):** withluminary.com
10. **Affinda Trust Deed:** affinda.com/documents/trust-deed/
11. **Wealth.com Ester (2025):** wealth.com
12. **ACTEC:** actec.org — AI and trust/estate law
13. **IRS Final Regs TD 10001 (July 2024):** SECURE Act 10-Year Rule
14. **IRS Pub 590-B:** RMD tables, trust-as-beneficiary
15. **T3 2026:** 94% of RIAs need better trust tax modeling
