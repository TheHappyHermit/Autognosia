# Web Research Methodology for Deep Research Sessions

## Multi-Round Iterative Extraction Pattern

This is the core methodology for conducting deep research sessions autonomously. The pattern balances breadth (covering many angles) with depth (extracting actual content).

### Round 1 — Broad Discovery (parallel search)

Launch 2-3 `web_search` calls simultaneously, each from a different query angle:

| Angle | Example Query | Purpose |
|-------|--------------|---------|
| Company + funding | `Jump AI advisor "$80 million" Series B funding 2026` | Core metrics |
| Product + features | `Jump AI advisor platform features pricing integrations` | Product capabilities |
| Competitive position | `Jump AI Zocks comparison advisor notetaker 2026` | Competitive landscape |

**All three call in the same turn** — no waiting for sequential execution. The system handles parallelism.

### Round 2 — Content Extraction (parallel URLs)

From the search results, identify the 5-10 most promising URLs and launch `web_extract` on as many as possible simultaneously (up to 5 per call, make 2 calls if needed). Prioritize:

1. **Official press releases** (businesswire, prnewswire, company blog/press) — most authoritative for funding, metrics, product launches
2. **Analyst/critic coverage** (Kitces, InvestmentNews, WealthManagement.com, WealthTech Today) — strategic analysis and competitive framing
3. **Official product pages** (company.com/products/foo, company.com/pricing) — feature lists, pricing, integrations
4. **Official integrations/partnerships pages** — ecosystem depth

**Do NOT extract** from aggregator/content-farm sites. They add nothing original.

### Round 3 — Gap-Filling (iterative targeted search + extraction)

Review the extracted content. Identify gaps — specific claims needing verification, competitor comparisons, architectural details, pricing specifics. Launch targeted follow-up searches:

- Missing metrics: `Jump AI "5-15 hours" advisor time savings`
- Partnership details: `Jump AI Wealth.com integration estate planning`
- Security/compliance: `Jump AI security SOC2 compliance FINRA`
- Deeper competitor comparison: `kitces.com blog jump zocks advisor operating system`

Extract any single critical URL immediately. For analysis/opinion pieces (Kitces, InvestmentNews blog posts), extract and read — these contain the strategic framing that marketing pages omit.

### Round 4 (if needed) — Final Verification

Before writing findings, verify critical claims with one more targeted extraction. In particular:
- Independent verification of funding amounts (cross-reference Press Release vs. FinTech Global vs. Yahoo Finance)
- Product pricing from official source
- Enterprise client lists from official page vs. press release

## Source Quality Hierarchy

| Quality | Source Type | Examples | Trust |
|---------|------------|----------|-------|
| **Primary** | Official press releases | businesswire.com, company.com/press | Highest — direct from company |
| **Primary** | Official product pages | company.com/products, company.com/pricing | Highest — current feature state |
| **Secondary** | Analyst/critic analysis | kitces.com blog, wealthmanagement.com, investmentnews.com | High — independent, industry-savvy |
| **Secondary** | Industry publications | fintech.global, wealthtechtoday.com, ventureburn.com | Good — journalistic standards |
| **Tertiary** | Summary/repost sites | mlq.ai, pulse2.com, yahoo finance | Useful for quick summary but verify claims against primary sources |
| **Low** | Comparison pages | zocks.io/compare/zocks-vs-jump (competitor site) | Use with caution — competitive sites spin favorably |
| **Low** | SEO/content farms | Various "best X tools 2026" pages | Avoid unless they contain unique information |

## Research Note-Taking During Extraction

While extracting pages, mentally collect data for these research entry sections:

- **Sources consulted**: URL of every page extracted (not searched, extracted)
- **Key Findings**: Organized by theme (Company, Product, Competitive, Architecture, Gaps)
- **Relevance**: How findings connect to the project's strategic priorities
- **Potential Components to Build**: Concrete ideas for features, integrations, or modules
- **New Topics Discovered**: Subtopic that deserves its own dedicated research session

## What Sets Deep Research Apart from Surface Research

| Surface Research | Deep Research |
|-----------------|---------------|
| Reads 1-2 marketing pages | Reads 15-30 pages across sources |
| Repeats company claims | Cross-references claims across 3+ independent sources |
| Describes what product does | Analyzes what product does NOT do (competitive gaps) |
| Lists features | Traces architecture, pricing model, GTM strategy |
| Accepts marketing numbers | Disaggregates composite claims into verifiable components |
| Isolates the company | Maps the competitive landscape and industry dynamics |
| Ends with summary | Ends with new research questions (agenda self-expansion) |
