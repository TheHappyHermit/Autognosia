# Competitor Analysis — Deep Dive Methodology

Use this template when researching a wealth management / fintech competitor. It captures what sections to cover, what to search for, and how to structure findings for comparison against your own project.

## Competitor Product-Type Taxonomy

Before starting, classify the competitor into ONE of the following product-type categories. This determines the scope and structure of your research:

| Type | Description | Examples | Approx. Sources |
|------|-------------|----------|-----------------|
| **Pure-Play Planning Engine** | Single-product financial planning software (no execution, portfolio management, or custody) | eMoney, MoneyGuidePro, RightCapital | 15-20 sources |
| **Pure-Play Robo-Advisor** | Automated investing platform (portfolios + rebalancing + TLH, but no planning depth) | Betterment, Wealthfront | 15-20 sources |
| **TAMP (Turnkey Asset Management Platform)** | Outsourced investment platform: model portfolios, SMA/UMA administration, back-office support, open-architecture custody. Core value prop is delegating investment management operations. Often expanding into advisor tech. | AssetMark, Envestnet, SEI, Brinker Capital, Orion Portfolio Solutions | 15-25 sources |
| **Multi-Product** | Multiple related products serving different segments (robo + custody + banking) | Schwab Intelligent Portfolios + Schwab Advisor Services | 20-30 sources |
| **Conglomerate** | Vertically integrated financial services across 5+ distinct markets | Fidelity ($7.1T AUM: asset mgmt, robo, custody, 401k, HSA, crypto, banking) | 30-40+ sources |

### Architectural Archetype Classification (Beyond Product Type)

**Do NOT stop at product-type classification.** Competitors in the same product category often solve the same problem with fundamentally different architectures, leading to radically different strengths, lock-in, and integration compatibility. Identifying the architectural archetype is more predictive of partnership fit and competitive threat than the product type alone.

**When to add this dimension:** Any time you're comparing 2-3 competitors who appear to solve the same problem but you suspect they differ in HOW they do it — especially in data-heavy domains (alts management, reporting, aggregation, document processing).

**How to classify:**

| Archetype | Core Mechanism | Example | Strengths | Weaknesses |
|-----------|---------------|---------|-----------|------------|
| **Platform-Native** | Bundled feature within a larger platform ecosystem; only available to platform users | Addepar Alts Data Management (40% of $7T in alts, platform-only) | Deep integration, unified UX, data moat from platform assets | Ecosystem lock-in, cannot serve non-platform clients |
| **AI Extraction Pipeline** | Scrapes/APIs + ML/LLM extraction → structured data → delivers to downstream systems | Canoe Intelligence (44K+ fund training set, platform-agnostic API delivery) | Data moat from training data, platform-agnostic, 10-year AI head start | Operations/collaboration layer is thin; extraction-focused only |
| **Portal-of-Portals / Operations Layer** | Gets added as authorized signatory → auto-collects ALL fund correspondence → workflow + collaboration | Arch (800+ portals, "interested party" mechanism, $460B assets) | Stakeholder collaboration (CPAs, advisors, clients), complete correspondence visibility | GP cooperation required, AI extraction less sophisticated than pure-play AI |
| **ERP for Segment** | Full-stack module covering every operational need for a specific client type (accounting, GL, entity management, reporting, document processing) | Eton Solutions AtlasFive (ISO 42001 AI, 750+ families, GL + fund accounting) | Complete coverage, single source of truth for accounting | Expensive, heavy, slower to innovate; harder to justify for smaller clients |

**How to discover the archetype:** Look for answers to these questions in your research:
- Is this feature available standalone (via API or separate product) or only inside the platform? => Platform-native vs. modular
- How does data flow from source to user — is there a scraping pipeline, API integration, or manual upload? => Data infrastructure archetype
- Who are the stakeholders involved and how do they access the data? => Collaboration model
- What happens if the user doesn't use the platform at all — can they still get value? => Standalone vs. ecosystem-dependent

**Strategic implications of archetype:**
- **Partnership strategy:** Alts data management reveals the clearest pattern. AI extraction pipelines (Canoe) and portal-of-portals (Arch) are complementary — they serve different parts of the data lifecycle. Platform-native solutions (Addepar ADM) compete with both but only for their captive user base. A downstream platform should partner with the extraction/operations layer, not the platform-native solution.
- **Competitive threat assessment:** Two competitors in the same product category but different architectural archetypes are NOT direct competitors — they serve different workflows, engagement models, and purchase motivations. The real competitive threat is the one with the same archetype serving the same user persona.
- **Integration cost:** Platform-native solutions are always easier to integrate (one vendor, one API, one support relationship) but create vendor dependency. Modular archetypes (AI extraction + operations + planning) require more integration effort but offer best-of-breed flexibility. This tradeoff is central to any "build vs. partner" decision.

**When to skip this analysis:** For pure financial planning engines (eMoney, MoneyGuidePro, RightCapital), the architectural differences are minor (all are web-based planning calculators with different UX/methodology). The product-type classification suffices. Save architectural classification for complex, data-intensive domains where integration architecture fundamentally changes the user experience.

**Critical: The product type determines what dimensions to research.** A planning engine and a robo-advisor may both be "pure-play" but compete on entirely different dimensions. A TAMP competes on a completely different axis than an all-in-one advisor platform — compare on outsourcing depth, not DIY features. See "Step 0: Choose Your Research Dimensions" below.

For **Pure-Play Planning Engines** (RightCapital, eMoney, MoneyGuidePro), the competitive differentiators are in:
- Planning methodology depth (cash flow vs. goals vs. hybrid)
- Client engagement tools (interactive scenarios, visualizations, mobile apps)
- Integration ecosystem breadth (compensates for missing execution features)
- Tax/deposition depth (the strongest differentiator among the Big 3)
- Prospecting/light-planning tools (Dash, RightExpress)
- Modular client education (MyBlocks)
- Workflow management (RightFlows)
- Data migration support (OCR imports from competitors → reduces switching costs)
- Regulatory compliance update velocity (SECURE Act 2.0, IRMAA, tax form updates)

For **Pure-Play Robo-Advisors** (Betterment, Wealthfront, Schwab IP), the competitive differentiators are in:
- Portfolio construction methodology (Black-Litterman, CVaR, MVO)
- TLH sophistication (ETF pairs, direct indexing, stock-level)
- Tax-coordinated portfolios / asset location
- Cash management / banking features
- Pricing and fee structure (zero-fee, cash sweep model)
- Direct indexing tiers and pricing
- Self-directed trading availability

For **All-in-One Advisor Platforms** (Orion, Tamarac, Advyzon, Portfolio Express, WealthForge), the competitive differentiators are in:
- End-to-end workflow coverage (planning + portfolio + trading + billing + compliance + CRM)
- Execution capabilities (trade, rebalance, TLH)
- Model management hierarchy (SMA/UMA/FSP)
- Compliance and operations depth (investment committee, IPS, audit trails)
- Custodial integration breadth (multi-custodial execution)
- Performance attribution (Brinson, multi-currency)
- Billing compliance and fee management
- Client portal and reporting

For **TAMPs** (AssetMark, Envestnet, SEI), the competitive differentiators are in:
- **Outsourcing depth** — What percentage of investment operations can be delegated? (trading, rebalancing, billing, reporting, tax management). A TAMP's value is inversely proportional to what the advisor must still do manually.
- **Model marketplace breadth** — Number and quality of third-party strategists/SMAs. A broader marketplace means more portfolio customization without the advisor building their own models.
- **UMA sophistication** — Sleeve-level management across SMAs, ETFs, mutual funds, individual securities, and interval funds. Single-account, single-tax-report consolidation.
- **Tax Management Services (TMS)** — Automated TLH across all accounts, tax-sensitive transitions, tax-alpha claims (e.g., AssetMark's 1.42% average savings).
- **Private markets access** — Interval fund availability (Apollo, Carlyle, KKR, StepStone), minimum investment thresholds, integration with UMA.
- **Planning integration** — Whether planning is native, acquired (Voyant, MoneyGuide), or absent. TAMPs without planning must partner or acquire.
- **Custody relationships** — Open architecture vs. captive custody. Number of custodians integrated. Trust accounting integration (e.g., AssetMark's Cheetah partnership).
- **RIA platform (vs. broker-dealer channel)** — Whether the TAMP has a dedicated RIA-facing platform (Adhesion Wealth by AssetMark) or just a legacy BD-facing one.
- **Pricing model** — Platform fee (bps of AUM), tiered pricing, zero-platform-fee basics (Adhesion Essentials), and how TAMP spreads compare to pure-tech subscription pricing.
- **Acquisition-based vs. organic architecture** — Whether the TAMP is unified (single-codebase) or multi-brand stitched from acquisitions. Directly impacts integration quality and development velocity.
- **PE ownership context** — Who owns the TAMP (GTCR, Bain, public) and the ownership horizon. PE owners may prioritize dividend recaps and leverage over R&D investment, creating windows for competitors.

For **Multi-Product** and **Conglomerate** competitors, you MUST research EACH major product line separately using the appropriate sub-template, then synthesize. The "Gaps Analysis" section also differs — a conglomerate's gaps exist WITHIN each product line, not across the entire firm.

## Research Workflow

### Step 1: Company Profile
Search for:
- Company name + "AUM", "revenue", "customers", "founded", "funding"
- Wikipedia entry for overview and history
- Crunchbase / Sacra for revenue trajectory and valuation

Capture:
- Founding year, founders, HQ
- Current CEO
- AUM ($B), customer count
- Revenue and growth rate
- Business model (B2C robo, B2B custody, both)
- Key milestones (e.g., launched advisor platform in 2014)

### Step 2: Core Platform Features
Search for:
- Company + "features", "platform", "products"
- Company + "account types" (IRAs, trusts, joint, 401k)
- Company + "portfolio types", "strategies", "asset allocation"

Capture:
- Investment philosophy (ETF-only, direct indexing, active/passive)
- Account types supported
- Portfolio construction methodology
- Asset classes and model types
- Goal-based investing framework (if any)
- Self-directed trading availability

### Step 3: Tax Features (Key Differentiator)
Search for:
- Company + "tax-loss harvesting" / "TLH"
- Company + "tax-loss harvesting methodology"
- Company + "tax-coordinated portfolio" / "asset location"
- Company + "tax-smart transitions" / "gains allowance"

For TLH specifically, capture:
- Algorithm name (e.g., "Parallel Position Management")
- Security substitution strategy (primary/alternate/tertiary)
- Wash sale prevention mechanism
- Threshold calibration method (e.g., Monte Carlo)
- Performance data (% of customers whose tax savings exceeded fees)
- Blackout conditions and suitability warnings

### Step 4: Rebalancing
Search for:
- Company + "rebalancing methodology", "rebalancing methods"
- Company + "drift threshold", "portfolio rebalancing"

Capture:
- Types of rebalancing (reactive, proactive, allocation change)
- Drift thresholds and monitoring cadence
- Tax-aware lot selection algorithm
- Cash flow rebalancing (uses deposits/withdrawals)
- Fractional share capabilities
- Advisor controls (enable/disable, custom thresholds)

### Step 5: Advisor Platform (B2B)
Search for:
- Company + "for advisors", "advisor solutions", "RIA custody"
- Independent reviews (e.g., "Betterment for Advisors review")
- Pricing pages for advisors

Capture:
- Positioning (RIA custodian, TAMP, overlay manager?)
- Pricing: platform fee, wrap fee, underlying fund expenses
- Model marketplace (internal, third-party, both)
- Client onboarding workflow (paperless, digital)
- Billing options (AUM, flat, tiered, on-demand)
- Client portal features
- Integration ecosystem and API availability
- Account types available to advisors

### Step 6: Retail Pricing
Search for:
- Company + "pricing"
- Company + "fees"
- NerdWallet / Investopedia / unbiased.com review for pricing verification

Build a fee table:
| Tier | Fee |
|------|-----|
| Low balance | $X/month or X% |
| Standard | X% |
| Premium/human advice | X% (min $X) |
| High balance discount | X% ($X+) |

### Step 7: Planning-Specific Engagement & Prospecting Features (Planning Software Competitors Only)

When researching a **financial planning engine competitor** (eMoney, MoneyGuidePro, RightCapital — NOT robo-advisors), you must look beyond portfolio/tax/rebalancing because these are pure planning tools. The competitive differentiators are in client engagement:

Search for:
- Company + "interactive", "client meeting", "what-if", "scenario"
- Company + "client portal", "client engagement", "client education"
- Company + "prospecting", "lead generation", "new clients"
- Company + "API", "developer", "embed"

**Engagement features to capture:**

1. **Live interactive client tools** — Real-time what-if modeling during meetings (e.g., MoneyGuide's Play Zone with sliders, eMoney's Decision Center, RightCapital's Snapshot/Blueprint). These are the #1 differentiator for planning tools. Capture: what parameters can be adjusted? Is it client-facing or advisor-only? How fast is the recalculation?

2. **Prospecting / light-planning pipelines** — Low-friction entry points for prospects who aren't ready for full planning. (e.g., MoneyGuide's Dash with 5 data points and smart defaults). These bridge the gap between a simple online calculator and a comprehensive financial plan. Capture: how many data points required? Does it flow into full planning? Is it self-serve or advisor-led?

3. **Modular client education and engagement** — Self-serve tools that allow clients to explore specific financial topics independently (e.g., MoneyGuide's MyBlocks with 40+ interactive blocks covering all life stages). These deepen engagement between meetings. Capture: number of modules available? Life stages covered? Advisor assignment workflow? Lead generation capabilities?

4. **API / embeddable planning** — Whether the planning engine exposes APIs for embedding in external systems (e.g., MoneyGuide's Play Zone API, eMoney Access API). Capture: what parameters can be modified programmatically? Real-time probability updates? Availability and documentation quality?

### Planning Methodology Flexibility (Planning Engine Competitors Only)

When researching pure-play planning engines (RightCapital, eMoney, MoneyGuidePro), capture the planning methodology options:

Search for:
- Company + "planning methodology", "planning method"
- Company + "cash flow", "goals-based", "hybrid"
- Company + "modified cash flow" (RightCapital's unique hybrid)

Capture:
- Available planning methods: goals-based, cash-flow-based, hybrid/modified
- Whether methods can be switched per client
- Default methodology and how it's explained to advisors
- How surplus/shortage cash flow is handled (savings control vs. automatic reinvestment)
- Withdrawal sequence options and customization
- Cash management method (sweep, hold, reinvest)
- Timing options (beginning/end of year, monthly)
- Whether the platform supports multiple methodologies within a single plan (e.g., cash flow for retirement phase but goals-based for education)

**Why this matters:** RightCapital's "modified cash flow" (their default) is a unique differentiator — it combines the precision of cash-flow planning with the simplicity of goals-based. This flexibility is often cited as a reason advisors switch from MoneyGuide (goals-only) to RightCapital.

### Regulatory Compliance Update Velocity

Planning engines and advisor platforms differentiate on how quickly they incorporate regulatory changes. This is especially important for tax-adjacent features:

Search for:
- Company + "SECURE Act", "SECURE 2.0", "Catch-up"
- Company + "IRS", "tax forms", "tax year"
- Company + "IRMAA", "Medicare surcharge"
- Company + "state tax", "state-specific"
- Company + "compliance update", "regulatory update"

Capture:
- How quickly the platform updated for SECURE Act 2.0 provisions (Roth catch-up for high-wage earners, RMD age changes)
- IRMAA visualization — whether the platform shows how Roth conversions impact Medicare premiums
- State-level tax modeling granularity
- Tax form update cadence
- Whether updates are automatic or require manual configuration

**Why this matters:** Platforms that embed regulatory changes automatically (vs. requiring manual advisor adjustment) reduce compliance risk and save advisor time. RightCapital's Q1 2026 update included automatic 2026 Roth catch-up rules, updated IRS forms, and federal/state tax parameters — this is a competitive differentiator.

### Data Migration / Switching Cost Reduction

A critical competitive dynamic in planning software is how easy it is to switch FROM other platforms. Capture the migration tools:

Search for:
- Company + "migrate from", "import from", "switch from"
- Company + "data import", "OCR", "report import"
- Company + "onboarding", "conversion"

Capture:
- Whether the platform supports automated data import from competitor platforms (e.g., RightCapital's OCR import from MoneyGuide and eMoney PDF reports)
- What data is captured (family info, goals, income, holdings)
- How the import process works (PDF upload → AI/OCR extraction → review → incorporate)
- Migration support documentation and dedicated onboarding
- Parallel-running period recommendations (e.g., 60-90 days recommended)
- Data quality guarantees

**Why this matters:** High switching costs are a moat for incumbents (eMoney's 3-6 month onboarding). Low switching costs via OCR/AI import are a competitive weapon for challengers (RightCapital's "days" onboarding with Smart Import OCR). If WealthForge plans to compete for advisors currently on eMoney or MoneyGuidePro, a low-friction migration path is essential.

### Step 8: Retirement & Income Features
Search for:
- Company + "retirement income", "retirement features"
- Company + "safe withdrawal", "withdrawal strategy"
- Company + "RMD", "required minimum distribution"

Capture:
- Retirement income goal type
- Safe withdrawal methodology (4% rule, dynamic, Monte Carlo)
- Glidepath post-retirement (stock/bond mix)
- Automatic recurring withdrawals
- Tax-efficient withdrawal ordering

### Step 9: Cash Management & Banking
Search for:
- Company + "cash management", "checking", "cash reserve"
- Company + "FDIC", "high yield"

Capture:
- Checking account features (fees, ATM, overdraft)
- Cash / savings account APY
- FDIC insurance details

### Step 10: Unfair Advantages & Competitive Moats

Search for:
- Company + "competitive advantage", "moat"
- Company + "patents", "proprietary"
- Products with zero fees or below-market pricing (context: Fidelity's ZERO funds with 0% expense ratio)
- Captive ecosystem advantages (e.g., largest 401k provider cross-selling to brokerage)

Capture:
- Technology moats (direct indexing algorithms, rebalancing engines)
- Scale moats (AUM, user base, data network effects)
- Pricing moats (zero-fee funds, subsidized by other revenue lines)
- Ecosystem moats (banking + brokerage + 401k + HSA lock-in)
- Regulatory moats (first-mover approvals, patents)
- Brand moats (trust, longevity, name recognition)

Document what WealthForge can and cannot replicate. Some moats (Fidelity's ZERO funds) are scale-dependent and not replicable. Others (direct indexing algorithms, tax optimization) are replicable with engineering.

### Step 11: Digital Assets, AI & Modern Innovations

Search for:
- Company + "crypto", "digital assets", "bitcoin"
- Company + "AI", "intelligence", "machine learning"
- Company + "innovation", "new products"

Capture if present:
- Crypto exposure (ETFs, direct trading, 401k integration)
- AI-powered features (client insights, automated categorization, robo-advisor logic)
- Emerging product lines (securities lending, bond ladders, home lending)
- Discontinued products and lessons (e.g., Fidelity Bloom shutdown, Schwab IP Premium discontinuation)
- Platform modernization efforts (e.g., Wealthscape Intelligence, Full View AI categorization)

Add any significant findings as new [⏳] topics under a "Digital Assets & Modern Innovations" section in AGENDA.md if they don't fit existing sections.

### Step 12: Gaps Analysis
For each feature category, ask: "Does my project already have this?"

Systematically identify:
- **Feature parity** — What they have that your project also has
- **Strength gaps** — What they do better that your project should study
- **Overlap** — What your project has that they don't (competitive moat)
- **Missing features** — What they have that your project doesn't (build candidates)

Key gap categories for wealth management:
- Comprehensive financial planning (cash flow, what-if scenarios)
- Direct indexing
- SMA/UMA management
- Estate planning tools
- Insurance needs analysis
- CRM
- Trade surveillance / compliance monitoring
- Performance attribution (Brinson, multi-currency)
- Billing compliance and audit trails
- Document management
- Investment committee workflow
- IPS generation
- Custom report builder

### Step 13: Dynamic Agenda Expansion

While researching, actively LOOK for new topics to add to the agenda. This is how the knowledge base self-expands.

**Examples of things worth adding:**
- A competitor feature you didn't know about that deserves its own deep dive
- A regulatory rule you encountered that needs separate research
- An adjacent domain (e.g., "retirement income guardrails methodology" as a subtopic of retirement)
- A workflow the project needs that you discover through competitor analysis
- A tangential product/service the competitor offers that's worth analyzing separately
- An API or integration pattern worth researching
- A modern innovation (crypto, AI, new product lines) discovered during research

**When adding new topics to AGENDA.md:**
- Place them under the MOST APPROPRIATE EXISTING section (e.g., tax topics under Tax, portfolio topics under Portfolio Management)
- Only create a NEW section if the topic genuinely doesn't fit any existing section
- Use the `[⏳]` marker format: `- [⏳] **Topic Name** — Brief description`
- Append a discovery note in parentheses: `(discovered via [company] research)`
- Tag the entry with the new section header if you create one

### Step 14: Document New Topics in RESEARCH.md

After adding new topics to the agenda, append a "New Topics Discovered" section to the RESEARCH.md entry:

```
### New Topics Discovered
The following topics were added to the agenda based on this research:
- **Topic Name** — Brief description of what it covers
- **Another Topic** — Brief description
```

This creates traceability — the user can see what new topics were spawned from each research session.

### Step 15: Cross-Comparison Tables (Meta-Analysis)

Once multiple competitors in the same category have been researched, produce a **cross-comparison table** in your findings. This is valuable meta-analysis that goes beyond a single competitor write-up.

Example structure:

```
### [Company] vs. [Company2] vs. [Company3] — Key Differentiators

| Dimension | Company A | Company B | Company C |
|-----------|-----------|-----------|-----------|
| **Advisory Fee** | X% or $0 | Y% | Z% |
| **AUM/Scale** | $XB / X clients | $YB / Y clients | $ZB / Z clients |
| **Key Feature** | Yes/No | Yes/No | Yes/No |
```

Good comparison dimensions:
- AUM and client count (market position)
- Pricing model and fee structure
- Feature depth (direct indexing, TLH, financial planning)
- Target audience (retail, advisor, both)
- Business model (B2C robo, B2B custodian, hybrid)
- Competitor type (pure-play, multi-product, conglomerate)
- Key differentiators (e.g., Black-Litterman, CVaR, goals-based framework)
- Digital assets / crypto offerings
- Unfair advantages / moats
- Missing features vs. comprehensive platforms

Include the comparison table as a section in the RESEARCH.md entry for the newly-researched competitor. It synthesizes findings across the research program.

### Step 15b: Adversarial Comparison (Strengths-&-Weaknesses Pairing)

When researching a direct #1-vs-#2 competitor pair (e.g., Wealth.com vs. Vanilla, eMoney vs. RightCapital), extend the cross-comparison table with an **adversarial comparison section** that explicitly lists each competitor's relative advantages:

```
**Where [Company A] is stronger than [Company B]:**
- [A's strength with context — don't just name the feature, explain why it matters]
- [A's other strength]

**Where [Company B] is stronger than [Company A]:**
- [B's strength with context]
- [B's other strength]
```

This format forces you to evaluate each competitor on its OWN terms rather than relative to a single ideal. It surfaces the key structural insight: **a market can sustain multiple leaders if they are strong on different dimensions.** Document when this "dual-coexistence" dynamic is observed — the strategic implication is that your own entry doesn't need to beat both; it needs to occupy a distinct position neither occupies.

### Step 15c: Competitive Dynamic Analysis

Beyond features, look for **market structure signals** that reveal how competitors relate to each other:

1. **Dual-vendor/vendor-agnostic channel choices** — When a distribution partner (advisor network, broker-dealer, bank) chooses BOTH competitors instead of picking one, it signals that the platforms are complementary rather than substitutable. This is a strong indicator of market structure. Example: Osaic chose both Wealth.com AND Vanilla for its advisor network — revealing that the two platforms serve different advisor personas or wealth tiers.

2. **Live strategic experiments** — When two competitors take fundamentally different approaches to the same problem (e.g., Vanilla partnering with Worthy for tax vs. Wealth.com building native tax planning), you have a real-time "build vs. partner" experiment running in the market. Document these as they provide direct evidence for your own architectural decisions.

3. **Overlap vs. exclusivity patterns** — Document which partnerships are exclusive vs. non-exclusive. Exclusive partnerships indicate stronger relationships but narrower distribution. Multi-vendor approvals indicate commoditization risk but broader reach.

### Step 15d: Multi-Source Triangulation

**Never trust a single source's claims about itself.** Always cross-validate competitor claims using at least two independent third-party sources:

| Source Type | What It Validates | Example |
|-------------|-------------------|---------|
| Independent software surveys (T3/Inside Information, Kitces AdvisorTech) | Advisor satisfaction, market share, user ratings | T3 rated Wealth.com 8.24/10 vs. Vanilla 7.23/10 |
| Third-party comparison pages (run by OTHER vendors) | Feature parity, pricing, claims verification | EncorEstate's comparison page revealed pricing and feature gaps in Wealth.com/Vanilla claims |
| Analyst coverage (Kitces, Cerulli, Datos Insights) | Strategic context, market sizing, trend validation | Kitces' analysis of Vanilla Starter's "unbundling" strategy |
| Journalist deep dives (InvestmentNews, RIABiz, Citywire, ThinkAdvisor) | Unvarnished strategy quotes, competitive positioning | Citywire's reporting on Vanilla's downstream strategy |
| Independent consumer surveys (own or third-party) | User sentiment, adoption drivers | Vanilla's 2026 State of Estate Planning (84% comfortable with AI) |

**Procedure:**
1. Extract the competitor's claimed metrics and positioning from their own site
2. Search for independent verification: `"[competitor] review"`, `"[competitor] vs [rival]"`, `"[competitor] T3 rating"`, `"[competitor] Kitces"`
3. Note any discrepancies — if a competitor claims high satisfaction but T3 ratings are low, investigate why
4. Use third-party comparison pages cautiously (they may favor the host company), but extract objective data points (pricing, feature lists) which are usually accurate

### Step 16: Write Findings
Append to RESEARCH.md with this structure:

```
---

## YYYY-MM-DD HH:MM — Company/Platform Name

**Research topic:** Name
**Sources consulted:** [list all URLs]

### Key Findings
[1-16 sections as discovered above]

### Relevance to [Project]
[Strategic positioning vs. your project, what to take from them, what your project does better]

### Potential Components to Build
[List specific build candidates with rationale, ordered by priority]
```

## Search Strategy Tips

- **Start broad**, then narrow: "Betterment features" → "Betterment tax-loss harvesting methodology"
- **Read primary sources** — betterment.com pages, not just review sites
- **Check multiple review sites** — NerdWallet, Investopedia, unbiased.com, WSJ, MarketWatch
- **Look for white papers** — companies often publish detailed methodology docs (search "whitepaper", "methodology", "research")
- **Check legal disclosures** — Form ADV, T&C pages, and legal/beta-disclosure pages contain operational details not found in marketing
- **Reddit and LinkedIn** can reveal user pain points and real experiences
- **Visit product pages directly** via web_extract, not just search result snippets
