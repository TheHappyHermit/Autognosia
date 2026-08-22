# Wealth Management Market Research: Source Hierarchy & Methodology

Pattern for researching the wealth management / managed account industry using Cerulli Associates data, MMI syndicated data, and cross-referencing with industry trade press.

## Source Hierarchy (Consult in Order)

### Tier 1: Cerulli Press Releases (Top-Level Data)

Most valuable sources for market sizing, growth rates, and program-type taxonomy without paying for the full report. Press releases typically publish 1-2 months after the full report.

**Managed Account Market Data:**
- URL pattern: `https://www.cerulli.com/press-releases/managed-account-assets-reach-...`
- Typically released annually in July (for prior year-end data)
- Contents: total AUM, YoY growth, net flows by program type, CAGR data (3/5/10 year), platform consolidation survey data, and tax optimization automation survey

**Tax Optimization / UMH Data:**
- URL pattern: `https://www.cerulli.com/press-releases/tax-optimization-tools-become-focal-point...`
- Published as "Cerulli Edge" quarterly editions
- Contents: automation adoption rates by feature type (TLH, tax-smart withdrawals, asset location), platform development priority rankings, UMH enabler survey data

### Tier 2: MMI-Cerulli Quarterly Data (Latest Figures)

The Money Management Institute (MMI) publishes quarterly syndicated data in partnership with Cerulli, available through the MMI website.

- URL pattern: `https://www.mminst.org/insight/mmi-cerulli-qN-20XX-advisory-solutions-data`
- Published ~2 months after quarter end (e.g., Q3 data published early January)
- Contents: Quarterly AUM ($15.8T Q3 2025), quarterly net flows by program type, two-year growth rates, SMA strategy breakdowns by asset class (direct indexing $1,099B, muni fixed income $695B, taxable fixed income $421B), platform sponsor vs. asset manager product priority surveys
- **Search keyword:** `"MMI-Cerulli Advisory Solutions Quarterly"`
- Useful for bridging the gap between annual Cerulli reports (which cover year-end data only) — gives in-year visibility on trends

### Tier 3: Parametric / Sponsored Research Blog Posts (Interpreted Data)

Parametric (Morgan Stanley) commissions Cerulli for the "Customized at Scale" white paper and publishes multiple blog posts interpreting the data. These are valuable because they:
- Interpret the raw data in context
- Provide advisor-facing takeaways
- Link to the full white paper for download (gated)
- Include Morgan Stanley sales messaging (awareness of bias is useful)

**Key blog posts:**
- "Integrating Ongoing Tax Management Is Key" (Feb 2026) — Systematic tax management patterns, fixed income TLH
- "Tax Customization Critical for HNW and Mass Affluent" (Dec 2025) — Customization scaling from HNW to mass affluent
- "Customized at Scale" white paper landing page: `https://www.cerulli.com/resource/customized-at-scale`

### Tier 4: Podcast Interviews with Cerulli Analysts (Qualitative Insights)

Cerulli analysts give podcast interviews that provide context, interpretation, and forward-looking statements not available in press releases.

**Key source:** WealthTech on Deck (SEI podcast) — Scott Smith interview episodes
- Search: `"WealthTech on Deck" "Scott Smith" Cerulli`
- Provides: qualitative context behind the numbers, advisor adoption challenges, platform consolidation tensions, forward-looking statements
- Example quote: "A lot of the advances in this industry are limited by advisor adoption" (Scott Smith, 2025)

### Tier 5: Industry Trade Press Cross-Reference

- **Connect Money** (`connectmoney.com`) — Good for concise news summaries of Cerulli reports with embedded data tables
- **InvestmentNews** — Edward Jones SMA expansion, Franklin Templeton Canvas launch coverage
- **Citywire** — UMA market share cable-length analysis
- **RIABiz** — Advisor perspective on model portfolios
- **ThinkAdvisor / FA Magazine** — Advisor-facing summaries of Cerulli data

## Parallel Research Pattern

For maximum efficiency in a single cron run (10-15 min):

**Round 1 (parallel searches):**
- Cerulli press release for the relevant year
- MMI-Cerulli quarterly data for the most recent quarter
- Parametric blog post on the Cerulli report
- Industry trade press coverage of the topic

**Round 2 (parallel extraction):**
- Extract top 3-5 most relevant URLs simultaneously via web_extract

**Round 3 (gap fill):**
- Targeted searches for any data points missing from Round 2
- Podcast transcript extraction if more context needed

## Sponsored Research Awareness

Parametric (Morgan Stanley) commissions Cerulli for the "Customized at Scale" white paper. This means:
- The data is real (Cerulli maintains independence in methodology)
- The framing favors Parametric's positioning (tax-aware SMA/DI)
- Consider complementing with non-sponsored sources (MMI data, Envestnet fee studies, internal surveys)
- Valid source for investor demand data (80% customization, 69% tax reduction) since methodology is standard
- Be skeptical of solution-specific claims (Parametric blog posts recommend Parametric solutions)

## Key Data Points to Always Collect

When researching Cerulli managed account data, collect these standardized data points:

1. **Total managed account AUM** (current year, prior year, multi-year)
2. **YoY growth rate** (current and prior year for trend)
3. **Net flows** by program type and total
4. **UMA market share** and whether it's overtaking RPM
5. **CAGR** by program type (3, 5, 10 year)
6. **Program type assets** (current and trajectory)
7. **Tax optimization automation rates** (TLH, transitions, withdrawals, asset location)
8. **Platform development priorities** (top-3 ranking, consensus percentage)
9. **Investor demand data** (customization %, tax reduction %, HNW AUM)
10. **Projections** (e.g., $21.8T by 2028)

## Alternative Sources When Cerulli Is Behind Paywall

- Envestnet | MoneyGuide Fee Study (annual, free download) — Advisor pricing trends
- Morningstar Model Portfolio Landscape (annual) — Model portfolio market sizing
- Datos Insights — UMH timeline analysis (behind paywall)
- T3 Advisor Software Survey (annual) — Market share and satisfaction ratings
- Schwab RIA Benchmarking Study — Advisor economics and tech spend
- Cerulli information packets (PDF infopack, free) — Overview of what the full report covers

## Cerulli Program Type Taxonomy

Six managed account program types tracked by Cerulli:

| Program | Code | Characteristics |
|---------|------|-----------------|
| Unified Managed Account | UMA | Multi-sleeve, vehicle flexibility, fastest growth (18.7% 5yr CAGR) |
| Separately Managed Account | SMA | Direct indexing, tax management, personalization (18.3% 5yr CAGR) |
| Rep-as-Portfolio-Manager | RPM | Advisor-managed, largest total AUM but declining share |
| ETF Advisory | ETF | Low-cost, tax-efficient, mass market |
| Mutual Fund Advisory | MF | Legacy, stable/declining |
| Rep-as-Advisor | RA | Non-discretionary, structural decline (3+ consecutive quarters of outflows) |
