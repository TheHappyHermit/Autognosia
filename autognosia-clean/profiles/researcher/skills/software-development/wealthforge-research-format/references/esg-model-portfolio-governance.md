# ESG Model Portfolio Governance — Domain Knowledge

## When to Load
When researching any inv-05-5-* subtopic (ESG/SRI model portfolio governance), inv-05-5-1 through inv-05-5-6 subtopics, or ESG-related IC Chair topics.

## Market Context (as of 2026-05-23)
- **$30.7T global ESG AUM** (GSIA 2024)
- **30% of RIAs offer ESG options** (Schwab 2025), up from 18% in 2022
- **SEC $17.5M Invesco greenwashing penalty** (Nov 2024) — major enforcement precedent
- **WisdomTree AM greenwashing charges** — reinforces "say what you do, do what you say"
- **SEC ended defense of 2024 climate disclosure rule** (Mar 2025) — rescinded but scrutiny continues
- **SFDR 2.0** (EU) — expanded requirements for private markets
- **54% of IC Chairs** face ESG provider disagreements requiring IC resolution
- **55% of clients** ask about portfolio carbon footprint during onboarding
- **28% of clients** request values-based exclusions beyond standard screens

## ESG Methodology Types (governance requirements differ per type)
1. **Negative/Screening** — Excludes sectors (fossil fuels, tobacco, weapons) or companies below ESG score thresholds
2. **Positive/Best-in-Class** — Overweights high-ESG-score companies within each sector
3. **Thematic** — Focuses on specific ESG themes (clean energy, water scarcity, gender equality)
4. **Impact Investing** — Targets measurable real-world outcomes (tons of CO2 reduced, jobs created)
5. **ESG Integration** — Standard models with ESG factors as risk/return inputs (most common for RIAs)
6. **SRI/Values-Based** — Client-specific exclusions (abortion, guns, gambling, etc.)

## Provider Comparison Matrix

| Provider | Coverage | Key Metric | Scale | Cost (Annual) |
|----------|----------|-----------|-------|---------------|
| MSCI ESG | 9,000+ companies | ESG Score (AAA-CCC), Controversy Score | Global | $50K-$200K |
| Sustainalytics (Morningstar) | 16,000+ companies | ESG Risk Rating (0-100, lower=better), Management Status | Global | $30K-$150K |
| ISS ESG (RiskMetrics) | 12,000+ companies | ISS ESG Score, Pillar Scores (E, S, G) | Global | $30K-$150K |
| S&P Global CSA | 9,000+ companies | CSA Score, Industry Percentile | Global | $50K-$200K |
| FTSE Russell | 8,000+ companies | ESG Rating (AAA-CCC), Exposure Scores | Global | $30K-$100K |

**Key insight:** Provider disagreement on individual companies is common (20%+ score variance). IC Chair must have a resolution framework.

## Regulatory Framework

### U.S. Federal
- **SEC Marketing Rule (2023)** — Accurate ESG claims in marketing materials required
- **Investment Advisers Act 206(2) & (4)** — Fair/balanced ESG claims
- **Form ADV Part 2A, Item 6** — ESG methodology disclosure
- **WisdomTree AM charges** — "Say what you do, do what you say" standard

### State-Level
- **California AB 2659** (effective 2025) — ESG disclosure for large asset owners
- **New York DFS ESG guidance** (2024) — ESG fund governance requirements
- **Connecticut ESG disclosure** — ESG investment policy disclosure

### International (for RIAs with international clients)
- **SFDR** (EU 2019/2088) — Article 6/8/9 classification required
- **SFDR 2.0** — Expanded private markets requirements
- **EU Taxonomy Regulation** — Alignment disclosure
- **UK SDR** — UK equivalent of SFDR
- **TCFD** — Climate risk disclosure framework

## Greenwashing Risk Categories
- **Critical** — Claiming "carbon neutral" when footprint > 10 tCO2e/$M
- **High** — Impact claim without defined metrics; SFDR misclassification
- **Medium** — Provider coverage < 5,000 companies claimed as "broad"
- **Low** — Claims match underlying methodology

## Carbon Footprint Calculation
```
carbon_footprint = (total_emissions / total_invested) * 1e6  # tCO2e per $M
```
- **Scope 1** (direct): ~40% of portfolio emissions
- **Scope 2** (indirect electricity): ~60% of portfolio emissions
- **Scope 3** (value chain): Less reliable, optional with quality disclosure

## SFDR Classification Logic
- **Article 6** — ESG not primary driver (or financial materiality only)
- **Article 8** — Promotes environmental/social characteristics (screening, best-in-class, integration)
- **Article 9** — Sustainable investment objective (thematic, impact, carbon neutral)

## Widget Specs (from inv-05-5 research)
- ESG-1: ESG Governance Dashboard (landing screen)
- ESG-2: ESG Provider Comparison Studio
- ESG-3: ESG Methodology Editor
- ESG-4: Impact Measurement Dashboard
- ESG-5: Greenwashing Compliance Checker
- ESG-6: SFDR Classification Engine

## SQL Schema Tables (6 core)
1. `esg_model_portfolios` — ESG model definitions
2. `esg_provider_certifications` — Provider methodology/certification tracking
3. `esg_methodology_documents` — Structured methodology templates
4. `esg_impact_snapshots` — Periodic impact metric measurements
5. `greenwashing_compliance_checks` — Automated verification results
6. `esg_provider_comparison` — Multi-provider score comparison per company

## Key Edge Cases
1. Provider disagreement on critical holdings (>20 point variance)
2. Provider methodology change causing score shifts without company changes
3. Carbon footprint methodology variation (Scope 1+2 vs Scope 1+2+3)
4. Political headwinds (Texas/Florida RIA deregistration threats for ESG-focused firms)
5. Scope 3 data quality (less reliable than Scope 1+2)
6. Provider bankruptcy/acquisition causing data access loss
7. SFDR classification error for international clients
8. Impact measurement manipulation risk
9. ESG model retirement due to provider coverage changes
10. Values-based exclusion vs standard ESG screen conflicts

## Sources
1. GSIA Global Sustainable Investment Review 2024
2. SEC Press Release 2024-179 (Invesco $17.5M penalty)
3. SEC Press Release 2025-58 (Climate rule rescission)
4. ESG Fraud Dashboard (PlanetaryPL 2024-2025)
5. California AB 2659 (2025)
6. NY DFS ESG guidance (2024)
7. SFDR (EU 2019/2088) + SFDR 2.0
8. MSCI ESG Ratings Methodology
9. Sustainalytics ESG Risk Ratings
10. ISS ESG Methodology
11. S&P Global CSA Methodology
12. Resonanz Capital "ESG as Portfolio Framework" (Jul 2025)
13. Preqin ESG Solutions Methodology
14. Wharton Pension Research Council ESG Materiality (2021)
15. T3 Technology Hub 2026 Software Survey
16. Investment News Impact Investing TAMPs (Nov 2025)
