# CMA Provider Data Source Cross-Reference Engine

## Purpose
Domain knowledge for researching CMA provider data provenance, independence claims, and cross-referencing methodology. Load when researching any wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-* (CMA provider data source) topic.

## Provider Independence Score (PIS) — Scoring Framework

Quantifies how independent a provider's CMA data sources are (0-100):

```
PIS = (S_data + S_methodology + S_transparency + S_diversity) / 4
```

| Dimension | 100 | 75-99 | 50-74 | 0-49 |
|-----------|-----|-------|-------|------|
| **S_data** (data collection independence) | Fully proprietary data collection | Proprietary modeling + named third-party data | Proprietary modeling + unnamed third-party data | Minimal independence (shared sources, no differentiation) |
| **S_methodology** (methodology uniqueness) | Unique methodology not shared by others | Partially unique | Partially shared with 1-2 providers | Widely shared across providers |
| **S_transparency** (disclosure transparency) | Full disclosure of all sources/vendors/frequencies | Named sources + partial vendor disclosure | Partial data source disclosure | Minimal or vague disclosure |
| **S_diversity** (source diversity) | 5+ distinct data sources | 3-4 distinct sources | 2 distinct sources | 0-1 sources (highly dependent) |

## Provider Independence Scores (as of May 2026)

| Provider | S_data | S_method | S_transp | S_diversity | **PIS** |
|----------|--------|----------|----------|-------------|---------|
| Tamarix | 95 | 85 | 40 | 30 | **63** |
| AQR | 70 | 95 | 90 | 50 | **76** |
| BlackRock | 50 | 80 | 95 | 40 | **66** |
| PIMCO | 45 | 75 | 70 | 70 | **65** |
| J.P. Morgan | 40 | 70 | 60 | 50 | **55** |
| Amundi | 45 | 65 | 60 | 20 | **48** |
| Vanguard | 40 | 70 | 55 | 35 | **50** |
| Capital Group | 35 | 50 | 30 | 20 | **34** |
| Morgan Stanley GIC | 30 | 55 | 30 | 25 | **35** |
| PGIM | 30 | 45 | 25 | 20 | **30** |
| Invesco | 25 | 40 | 20 | 45 | **33** |
| Lombard Odier | 35 | 60 | 25 | 20 | **35** |
| Dimensional | 30 | 50 | 20 | 25 | **31** |
| KKR | 40 | 55 | 50 | 45 | **48** |
| Verus | 35 | 50 | 30 | 30 | **36** |

## Data Source Classification (4 Tiers)

| Tier | Classification | Characteristics | Examples |
|------|---------------|-----------------|----------|
| 1 | Fully Proprietary Data Collection | Own primary data, not third-party feeds | Tamarix (GP-direct), AQR (researcher-driven) |
| 2 | Proprietary Modeling on Named Third-Party Data | Named commercial feeds + proprietary models | BlackRock (Bloomberg/Refinitiv), PIMCO (Bloomberg/Compustat/Capital IQ/MSCI) |
| 3 | Proprietary Modeling on Unnamed Third-Party Data | Claims proprietary but doesn't fully disclose | Vanguard (partial), Morgan Stanley GIC, PGIM, Invesco, Lombard Odier |
| 4 | Vague/Minimal Data Source Disclosure | Minimal or generic source info | Capital Group, Dimensional |

## Cross-Provider Data Source Overlap (as of May 2026)

| Data Source | Providers Using It |
|------------|-------------------|
| Bloomberg | BlackRock, PIMCO, Vanguard (EUR), Capital Group, KKR |
| Refinitiv Datastream | BlackRock |
| Morningstar | Capital Group |
| Compustat | PIMCO |
| Capital IQ (S&P Global) | PIMCO |
| MSCI | PIMCO |
| CBOE | J.P. Morgan |
| HFRI | J.P. Morgan |
| Eurostat | Vanguard (EUR) |
| IMF | Vanguard (EUR) |
| Burgiss | KKR (private markets) |
| Cambridge Associates | KKR (private markets) |
| Robert Shiller data | AQR |
| CASM/POwR (proprietary) | Amundi |

**Key finding**: Bloomberg is the most widely used data source across CMA providers (6+ providers). Many "independent" CMAs share the same underlying data.

## Five Cross-Reference Detection Algorithms

1. **Return Signature Matching** — Extract numerical return forecasts, compare across providers for identical asset classes. High correlation in niche asset classes may indicate shared data sources.
2. **Methodology Cross-Reference** — Parse methodology descriptions, look for shared methodological language/formulas/approaches.
3. **Data Date Alignment** — Track "data as of" dates across providers. Identical data dates for identical datasets indicate shared feeds.
4. **Chart Attribution Analysis** — Extract chart source attributions from CMA PDFs. Cross-reference with claimed independence.
5. **Update Pattern Correlation** — Track update timing patterns. Correlated update cadences suggest shared data sources.

## Provider Data Source Details

### BlackRock Investment Institute
- Claimed: Moderate independence
- Named sources: Refinitiv Datastream, Bloomberg
- Disclosure: High — methodology tab explicitly lists data sources
- Key: Most transparent about using third-party data; CMA is proprietary modeling on commercial feeds

### Vanguard Capital Markets Model (VCMM)
- Claimed: High — "proprietary financial simulation tool"
- Named sources: Eurostat, IMF, Bloomberg (EUR version)
- Disclosure: Medium — describes methodology broadly
- Key: "Proprietary" refers to modeling methodology, not raw data

### AQR Capital Management
- Claimed: High — "proprietary methodology"
- Named sources: Robert Shiller's CAPE data, proprietary calculations
- Disclosure: High — detailed methodology appendix
- Key: Publishes yield-based forecast formulas; quarterly update cadence

### J.P. Morgan Asset Management
- Claimed: High — "cornerstone of objective global forecasting"
- Named sources: CBOE, HFRI, J.P. Morgan
- Disclosure: Medium — describes methodology but not all data feeds
- Key: 30-year running CMA series; uses HFRI (third-party hedge fund data)

### PIMCO
- Claimed: High — proprietary PIMCO analysis
- Named sources: Bloomberg, Compustat, Capital IQ, MSCI
- Disclosure: Medium — names data sources in charts
- Key: Names most data sources of any provider; uses multiple commercial vendors

### Capital Group (American Funds)
- Claimed: High — "long-term, structural approach"
- Named sources: Morningstar (partial)
- Disclosure: Low — vague descriptions
- Key: 20-year horizon (unique among major providers); partnership model (bottom-up)

### Morgan Stanley GIC
- Claimed: High — proprietary GIC analysis
- Named sources: Morgan Stanley Wealth Management GIO, MS & Co. (proprietary)
- Disclosure: Low — high-level methodology only
- Key: Committee-driven (7 thought leaders) vs. model-driven; 7yr + 20yr horizon

### PGIM (Prudential)
- Claimed: High — proprietary PGIM analysis
- Named sources: PGIM (proprietary)
- Disclosure: Low — no detailed methodology
- Key: Quarterly updates (most frequent among major providers)

### Invesco
- Claimed: High — proprietary Invesco analysis
- Named sources: None explicitly named
- Disclosure: Low
- Key: Most comprehensive breadth (170 asset classes, 20 currencies) — at cost of depth

### Lombard Odier (Rethink CMA)
- Claimed: High — proprietary Rethink analysis
- Named sources: None explicitly named
- Disclosure: Low
- Key: "Carry method" focuses on income/carry components — fundamentally different philosophy

### Amundi Research Center
- Claimed: Moderate — proprietary CASM model
- Named sources: CASM model simulations, POwR optimiser
- Disclosure: Medium — names proprietary models but not raw data sources
- Key: Names proprietary models (more transparent than most), but CASM input data undisclosed

### Dimensional (Reality Check)
- Claimed: Moderate — "derived from sources believed to be reliable"
- Named sources: None (generic language)
- Disclosure: Low
- Key: Unique meta-analysis of CMA accuracy (not a CMA itself); 17 months stale as of May 2026

### Tamarix (Private Markets CMA)
- Claimed: High — direct GP data collection
- Named sources: GP notifications, structured GP data (direct collection)
- Disclosure: Low
- Key: Collects data directly from GPs — closest thing to "independent data" in private markets

### KKR (Private Markets CMA)
- Claimed: Moderate — KKR analysis
- Named sources: Bloomberg, BofA, Burgiss, Cambridge Associates
- Disclosure: Medium — names specific data sources
- Key: Names Burgiss and Cambridge Associates — third-party private markets data providers

### Verus Capital
- Claimed: High — proprietary methodology
- Named sources: Bloomberg (partial)
- Disclosure: Low
- Key: Conducts "in-depth review of methodology" each year, analyzing new industry research

## Competitive Landscape

Zero existing wealth management platforms provide data source transparency for CMA providers:
- **eMoney Advisor**: No transparency; CMA providers are black boxes
- **MoneyGuidePro**: Same as eMoney
- **RightCapital**: No transparency
- **eFront**: Private markets focus, no public market CMA transparency
- **BlackRock Aladdin**: Own CMA transparency only, not other providers
- **Addepar**: No CMA transparency

## Regulatory Alignment

- **SEC Marketing Rule**: Data provenance graph serves as audit documentation for data source claims
- **FINRA 2111**: Provider Independence Score provides quantitative reliability measure for suitability files
- **CFP Board Standards**: Cross-reference engine enables objective data source reliability evaluation

## Key Takeaways

1. Bloomberg is the most widely used data source (6+ providers) — many "independent" CMAs share underlying data
2. AQR leads on independence (76/100) due to unique methodology, detailed transparency, researcher-driven approach
3. Most wealth management providers score below 40 on independence — significant data source dependency
4. Zero competition provides data source transparency — clear first-mover opportunity
5. Independence ≠ Accuracy — must integrate with accuracy tracking system for full picture
6. Private markets CMAs are fundamentally different (direct GP data vs. market feeds)
7. Provider non-disclosure is the norm — inferred attributions are best available evidence
