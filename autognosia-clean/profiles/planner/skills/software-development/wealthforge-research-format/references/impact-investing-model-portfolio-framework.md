# Impact Investing Model Portfolio Framework — Domain Knowledge

**Source:** inv-05-6 research (Run 252, 2026-05-23)
**Load when:** Researching inv-05-6, inv-05-6-*, inv-05-5 (ESG adjacent), or any impact investing topic at RIAs.

## Market Data

| Metric | Value | Source |
|--------|-------|--------|
| Global impact AUM | $1.164T (EOY 2021) | GIIN 2022 Sizing Report |
| Impact AUM CAGR | ~21% | GIIN 2024 Report |
| RIAs with clients asking about impact | 70%+ | Schwab 2025 RIA Benchmarking |
| HNW clients wanting impact allocation | 30% | Schwab 2025 RIA Benchmarking |
| Largest impact theme | Energy transition (21% of impact AUM) | GIIN 2024 |
| TAM for RIA impact tools | $21M-$63M/yr (~4,200 RIAs × $5K-$15K) | Derived |

## IRIS+ Framework

- 2,500+ standardized metrics for social/environmental outcomes
- Metrics organized by impact themes: climate, healthcare, financial inclusion, smallholder agriculture, etc.
- RIAs cannot measure all metrics — need "IRIS+ Lite" selection framework
- Each metric has: metric_id, value, unit, frequency, data quality

## SDG Alignment

- 17 SDGs, 169 targets (UN Sustainable Development Goals)
- Each holding contributes per-SDG: positive, negative, or neutral
- **Directionality matters:** A clean energy company (positive SDG 7) may have poor labor practices (negative SDG 8)
- Cannot aggregate to single "SDG score" — must show per-SDG breakdown
- SFDR 2.0 requires SDG alignment disclosure for EU-marketed funds

## Key Impact Measurement Frameworks

| Framework | Provider | Focus | RIAs? |
|-----------|----------|-------|-------|
| IRIS+ | GIIN | 2,500+ metrics catalog | ✅ Primary standard |
| SDG Impact Standards | UN | 17 goals, 169 targets | ✅ Classification |
| BlueMark | BlueMark | Fund-level impact ratings | ⚠️ RIC evaluation |
| MSCI Impact | MSCI | Impact scoring | ⚠️ Institutional |
| Sustainalytics Impact | Morningstar | Impact risk scoring | ⚠️ Institutional |

## RIC (Regulated Investment Company) Impact Evaluation

RICs are the primary vehicle for retail impact investing (iShares ESG ETFs, Vanguard Sustainable Funds). Evaluation dimensions:

1. **BlueMark impact rating** — IRIS+-aligned fund-level rating
2. **SDG alignment** — Which SDGs addressed, contribution type
3. **IRIS+ metrics coverage** — How many metrics measured
4. **Transparency score** (0-100) — Has thesis (25%) + measurement (25%) + reporting (25%) + verification (25%)
5. **Greenwashing risk** — low/medium/high/critical

## Impact-Return Frontier

- Scatter plot: impact score (x-axis) vs. expected return (y-axis)
- Bubble size = AUM allocation
- Benchmark lines for traditional portfolios
- **Key insight:** No existing platform visualizes this for RIAs

## Client-Impact Matching Algorithm

Match score = theme_alignment × 0.40 + sdg_match × 0.30 + tradeoff_fit × 0.30

Where:
- theme_alignment: How well portfolio themes match client priority themes
- sdg_match: How well portfolio SDG alignment matches client SDG focus
- tradeoff_fit: Client's return comfort vs. portfolio's impact-per-dollar ratio

## Greenwashing Risk in Impact Claims

- SEC's $17.5M Invesco/WisdomTree greenwashing penalty applies to impact claims
- Impact claims are harder to verify than ESG claims (forward-looking predictions)
- Verification dimensions: IRIS+ data match, SDG alignment consistency, historical results, peer comparison
- Claim types: 'impact', 'esg', 'sri' — each with different verification requirements

## Regulatory Framework

| Regulation | Requirement |
|------------|-------------|
| SEC Marketing Rule (2024) | Substantiate all impact claims with data |
| SEC Greenwashing Rule (2023) | No misleading ESG/impact claims |
| SFDR 2.0 (EU) | SDG alignment disclosure (Article 8 vs. 9) |
| California AB 2659 (2025) | IRIS+ preferred for public pension funds |
| FINRA 2111 | Impact-return tradeoff must be disclosed for suitability |

## Widget Design — INV-05-6 Impact Portfolio Command Center

| Widget | Purpose |
|--------|---------|
| Impact Dashboard | KPI tiles: total impact AUM, avg impact score, SDG coverage, client satisfaction |
| Impact Score Card | Composite score (0-100) with theme breakdown |
| SDG Alignment Map | Sunburst chart: per-SDG contribution type |
| Impact-Return Frontier | Scatter plot: impact vs. return, bubble = AUM |
| Client Match Engine | Input preferences → ranked portfolios |
| RIC Impact Screener | Search RIC → impact rating, transparency, greenwashing risk |
| Impact Claim Verifier | Input marketing text → verification + risk score |
| Impact Performance Report | Automated quarterly impact report |

## Key Edge Cases

1. **Impact data gaps** — IRIS+ metrics missing for 40%+ of holdings. Show data quality score.
2. **IRIS+ metric conflicts** — Providers map same holding to different metrics. Flag for IC review.
3. **SDG ambiguity** — Single company, multiple SDG contributions. Show per-SDG breakdown.
4. **Impact-return misestimation** — Historical tradeoffs may not predict future. Use scenarios + confidence intervals.
5. **RIC rating conflicts** — BlueMark vs MSCI vs Sustainalytics disagree. Show provider comparison.
6. **SFDR classification errors** — Automated classification may misclassify. Require IC review.
