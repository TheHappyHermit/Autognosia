# IRIS+ Lite Framework — Impact Theme to Metric Mappings

**Source:** inv-05-6-1 research (Run 254, 2026-05-23)
**Load when:** Researching inv-05-6-1, inv-05-6-1-*, inv-05-6-4 (RIC evaluation), or any IRIS+ metric selection topic.

## IRIS+ Lite: 10 Impact Themes × 135 Metrics

IRIS+ Lite is a curated subset of GIIN's 2,500+ metric catalog, designed for RIA model portfolio use. Each theme gets 10-20 metrics via a 4-filter process: portfolio relevance → coverage >60% → cross-provider standardization → RIA actionability.

| # | Impact Theme | Core (mandatory) | Extended (optional) | Total Lite | Avg Coverage | Key Data Providers |
|---|-------------|-----------------|-------------------|-----------|-------------|-------------------|
| 1 | Climate | 10 | 5 | 15 | ~75% | MSCI, Sustainalytics, ISS, CDP |
| 2 | Climate Adaptation & Resilience | 8 | 4 | 12 | ~55% | MSCI, CDP, WRI |
| 3 | Financial Inclusion | 12 | 3 | 15 | ~40% | GIIN, CFI, World Bank Findex |
| 4 | Health | 10 | 5 | 15 | ~50% | WHO, World Bank, MSCI |
| 5 | Quality Jobs | 8 | 4 | 12 | ~45% | ILO, MSCI, Sustainalytics |
| 6 | Affordable Basic Infrastructure | 8 | 3 | 11 | ~35% | World Bank, ITU, UN-Habitat |
| 7 | Food & Agriculture | 10 | 5 | 15 | ~40% | FAO, World Bank, GIIN |
| 8 | Education | 8 | 4 | 12 | ~45% | UNESCO, World Bank, OECD |
| 9 | Equity, Inclusion & Diversity | 12 | 5 | 17 | ~55% | MSCI, Sustainalytics, ISS |
| 10 | Human Wellbeing & Social Services | 10 | 3 | 13 | ~35% | World Bank, OECD, GIIN |

**Totals:** 96 core + 39 extended = 135 Lite metrics across 10 themes.

## 4-Filter Selection Algorithm

```
For each IRIS+ Impact Theme:
  1. Portfolio Relevance: Keep only metrics applicable to RIC/ETF/mutual_fund
  2. Coverage Threshold: Keep only metrics with >60% public equity coverage
  3. Cross-Provider Standardization: Keep only metrics available from ≥2 providers
  4. Classification: Core (universally applicable), Extended (specialized), Lens (cross-cutting)
```

## Coverage Gap Thresholds

| Coverage | Classification | Action |
|----------|---------------|--------|
| ≥80% | Green — Ready for Core | Include in Lite set |
| 60-79% | Yellow — Monitor | Include as Extended |
| 40-59% | Orange — Gap Warning | Extended only with disclaimer |
| <40% | Red — Critical Gap | Exclude from Core; Extended with strong disclaimer |

## Governance Rules

- IC approval required for any Lite set >25 metrics
- Minimum 60% Core metric coverage before labeling portfolio "Impact" (below = "Impact-Oriented")
- Annual IC review of all Lite sets
- Any deviation from Lite metrics must be documented and justified
- Multi-provider requirement: minimum 2 providers per Core metric

## Related Topics

- inv-05-6-1-1: Data provider integration architecture (MSCI/Sustainalytics/ISS/CDP)
- inv-05-6-1-2: Theme overlap detection (Jaccard similarity >60%)
- inv-05-6-1-3: Coverage rate monitoring dashboard
- inv-05-6-1-4: Lens metrics (gender, Indigenous peoples)
- inv-05-6-1-5: GIIN catalog version management
