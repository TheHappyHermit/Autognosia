# Product-Line and Market-Segment Deep Dives

When a competitor launches a **sub-product or derivative platform** targeting a different market segment, or when you need to map an **entire competitive market segment**, the standard single-company competitor analysis pattern (see `references/competitor-analysis-deep-dive.md`) is necessary but insufficient. This reference documents the additional patterns required.

## When to Use This Pattern

- A researched competitor launches a NEW platform product targeting a different segment (e.g., Advyzon → Auria for family offices)
- You need to map an entire market segment (e.g., "the family office software landscape") with multiple players across categories
- A sub-product has its own separate website, brand identity, or leadership team from the parent
- You discover during research that a specific market segment is fragmented and worth its own dedicated analysis

## Pattern 1: Sub-Product / Derivative Platform Analysis

### Goal
Research a product-line within a parent company that targets a fundamentally different customer segment, with its own feature prioritization and competitive set.

### Step 1: Establish the Parent-Child Relationship

Before diving into the sub-product, document:
- What is the parent company's core product and segment? (e.g., Advyzon = all-in-one platform for RIAs)
- Why did they create a separate sub-product? (e.g., Family office needs differ from RIA needs — entity mapping, alternatives, multi-gen permissions)
- What does the sub-product inherit from the parent? (e.g., Auria inherits Advyzon's CRM, portfolio management, trading, billing, document management — all from single codebase)
- What is genuinely NEW in the sub-product? (e.g., Blueprint entity mapping, alternatives management service, total balance sheet, family portal)

**Search strategy:**
```
"[parent company] [product name]" announcement launch
"[product name]" "purpose built" OR "designed for" [segment]
"[parent company]" institutional OR enterprise OR [segment]
"[product name]" vs [competitor]
```

### Step 2: Treat the Sub-Product as Its Own Entity

Research the sub-product as if it were a standalone company:

1. **Visit its own website** — Sub-products often have separate domains (auriaplatform.com vs advyzon.com). Extract all product pages.
2. **Map its full feature set** — Document each module (CRM, entity mapping, alternatives, reporting, portal, permissions, billing, trading). Note which features are inherited and which are new.
3. **Identify its SEGMENT competitors** — The sub-product competes against a different set than the parent. For Auria: competes against Addepar, FundCount, Eton Solutions, Masttro — NOT against Orion, Tamarac, Black Diamond.
4. **Identify its target buyer personas** — Auria targets three segments (RIAs with UHNW clients, single-family offices, institutions). Each may have different decision criteria.
5. **Document its known weaknesses** — Newer products have unproven market position, gaps vs. established segment leaders.

### Step 3: Map the Sub-Product Against Segment Competitors

Create a cross-comparison table with segment-relevant dimensions, NOT just parent-company dimensions. For family office software, the dimensions differ from RIA platform analysis:

| Dimension | Sub-Product | Competitor A | Competitor B | Competitor C |
|-----------|-------------|--------------|--------------|--------------|
| **CRM** | Built-in (inherited) | None (integration) | None | Built-in |
| **Entity Mapping** | Visual (Blueprint) | Basic modeling | Strong entity mgmt | Wealth mapping |
| **Alternatives Mgmt** | Managed service | AI-driven processing | AI document extraction | Basic tracking |
| **Accounting/GL** | None | None | Full GL (differentiator) | None |
| **Financial Planning** | None (parent has, coming) | Via integration | None | None |
| **Pricing** | Undisclosed | $229K avg/yr | $40K+/yr | Fixed (non-AUM) |
| **Multi-Currency** | No | Yes | Yes | Yes |
| **Year Founded** | 2025 | 2009 | 2009 | 2011 |

**Critical: The sub-product may dominate on some dimensions (the parent's strengths) while being weak on others (the segment's true needs).** Auria has excellent CRM (inherited from Advyzon's #1-rated CRM) but NO multi-currency support — a critical gap for global family offices.

### Step 4: Validate the Segment Thesis

Search for independent validation that the segment exists and is worth the investment:

- Industry analyst quotes about the segment (e.g., Will Trout at Datos Insights)
- Market sizing data (e.g., family office software market = $1.16B in 2026)
- Primary market research reports (e.g., J.P. Morgan Global Family Office Report, Forbes)
- Awards/recognition the sub-product has received (e.g., Family Wealth Report Awards finalist)
- Leadership hires into the segment division (signals investment)

**Key question:** Is the sub-product solving a real, underserved need, or is it a marketing expansion that won't gain traction?

### Step 5: Derive Implications for Your Project

The sub-product tells you about BOTH the parent company's strategy AND the target segment:

**What the sub-product reveals about the parent:**
- They see their core platform as extensible to adjacent segments
- They're investing in segment-specific hires and marketing
- They believe the segment is underserved by existing solutions
- They're willing to create separate brand identity for credibility in the new segment

**What the sub-product reveals about the segment:**
- Which features are segment-defining (entity mapping, alternatives, total balance sheet)
- What gaps persist even in the new entrant (no multi-currency, no planning, no accounting/GL)
- Pricing tolerance ($34K-$229K/yr for family office software vs. $5-15K for RIA platforms)
- Whether your project has a natural entry point (e.g., native financial planning as segment differentiator)

## Pattern 2: Market Segment Competitive Landscape Mapping

### Goal
Map an entire market segment (not just one competitor) to understand competitive dynamics, pricing, feature gaps, and positioning.

### When to Use
- A session's chosen topic is itself a market segment (e.g., "family office software," "account aggregation," "direct indexing platforms")
- During competitor research, you discover a segment is fragmented and worth a dedicated mapping
- You need to understand where your project fits in a segment before building features for it

### Step 1: Identify the Segment's Major Players

Start with broad searches to discover who competes in this space:

```
"best [segment] software 2026"
"top [segment] platforms 2026"
"[segment] comparison 2026"
"[segment] market report"
"[segment] software for [sub-niche]"
```

From the results, compile a list of 5-10 platforms that appear consistently. The Forbes/Simple annual "Family Office Software Roundup" and similar industry surveys are gold mines for competitor discovery.

### Step 2: Categorize by Sub-Category

Most market segments have sub-categories based on what they do best. Identify the natural groupings:

| Category | Description | Example Platforms |
|----------|-------------|------------------|
| **Accounting-grade** | Source of truth is the general ledger; reporting ties to the books | FundCount, Eton AtlasFive, Asset Vantage |
| **Analytics/Reporting** | Multi-asset data and analytics; flexible custom reporting | Addepar, Aleta |
| **Aggregation/Visibility** | Real-time wealth mapping across jurisdictions; holistic picture | Masttro, Asora, Altoo |
| **Platformized** | Unified CRM + portfolio + entity + reporting from single codebase | Auria, Archway |

**Why categorize?** A direct comparison across competitors is misleading when they solve fundamentally different problems. FundCount ($34K+, accounting-first) and Auria (CRM-first) are not selecting against each other — they serve different primary pain points in the same segment.

### Step 3: Map Each Sub-Category in Detail

For EACH sub-category, document:

1. **Primary strength** — The one thing this category does better than others
2. **Best use case** — Which buyer chooses this over alternatives
3. **Pricing model and range** — Entity-based vs. AUM-based vs. user-based
4. **Geographic scope** — US-only vs. global
5. **Years in market** — Incumbency matters in trust-sensitive segments
6. **Relevant market share/satisfaction data** — If available from T3, Kitces, or industry reports

### Step 4: Produce a Segment Positioning Map

Create a 2x2 or multi-dimensional positioning map showing where each platform sits:

```
                              HIGH
                               │
                               │
                    [Platform A] │ [Platform B]
                               │
             LOW COMPLEXITY ───┼─── HIGH COMPLEXITY
                               │
                    [Platform C] │ [Platform D]
                               │
                              LOW
```

Useful axes for wealth management segments:
- **Feature depth** (narrow vs. comprehensive) × **Integration openness** (walled garden vs. API-first)
- **Client segment** (mass affluent vs. UHNW) × **Automation level** (manual/advisor-led vs. fully automated)
- **Primary function** (accounting vs. analytics vs. operations) × **Deployment** (cloud-native vs. on-premise)

### Step 5: Identify Your Project's Segment Positioning

Given the segment map, identify:

1. **Where does your project naturally fit?** — Which sub-category does it most resemble?
2. **Where is the white space?** — Are there gaps (no integrated financial planning? no good solution for mid-market family offices?) that your project could fill?
3. **What would it take to compete?** — If your project doesn't currently serve this segment, what features are non-negotiable? (e.g., for family offices: entity mapping, alternatives management, multi-generational permissions)
4. **Pricing strategy** — What pricing model fits the segment? Can your project's existing pricing accommodate the segment's willingness to pay?

### Step 6: Create Rolling Comparisons Over Time

As segments evolve, update the positioning map. New entrants (like Auria) change the competitive dynamics. Track:

- **Year-over-year pricing changes** — Are prices compressing? (e.g., Adhesion Essentials' zero-platform-fee program in the TAMP segment)
- **New entrants and their positioning** — Are they offering something truly new or just entering an established slot?
- **Consolidation** — Are the segment's categories converging? (e.g., TAMPs buying planning platforms, analytics platforms adding entity management)
- **Technology shifts** — AI-driven automation, direct indexing, interval funds — do these create new categories or disrupt old ones?

## Pattern 3: Primary Market Research as Cross-Reference

### Goal
Use independently-produced market research reports (not vendor marketing) to validate findings, calibrate market sizing, and discover buyer motivations.

### Where to Find Primary Research

| Source | Type | Quality | Access |
|--------|------|---------|--------|
| **J.P. Morgan Global Family Office Report** | Annual survey (300+ FOs) | Very high (primary data) | Free download |
| **Forbes** (Francois Botha's Family Office Roundup) | Annual market survey | High | Free |
| **Cerulli Associates** | Institutional research | Very high (paywalled, but quoted in press) | Paywalled, but often summarized |
| **T3 / Inside Information Software Survey** | Annual advisor survey | Very high (industry standard) | Free PDF |
| **Kitces AdvisorTech Report** | Annual advisor survey | Very high | Free download |
| **Campden Wealth / RBC Family Office Report** | Annual survey | Very high | Free download |
| **Datos Insights** (formerly Aite-Novarica) | Specialist research | High | Paywalled, quotes in press |
| **Research and Markets** | Market sizing | Medium (aggregated) | Paywalled, free-to-quote data |
| **Mordor Intelligence** | Market sizing | Medium | Free-to-quote data |

### What to Extract

1. **Market sizing data** — Total addressable market, growth CAGR, segment breakdowns. Quote conservatively — size estimates vary widely by methodology.
2. **Buyer pain point rankings** — What do buyers say they need most? This is more valuable than feature lists on vendor websites.
3. **Adoption rates** — What % of firms have adopted a given technology? What's the growth trajectory? (e.g., "86% of FOs lack succession plans" → product opportunity)
4. **Spending patterns** — How much do buyers spend on technology? Operating costs? (e.g., "$6.6M+ annual operating costs for $1B+ FOs" → cost savings = value proposition)
5. **Competitive dynamics** — Which competitors do buyers mention in surveys? Who's gaining/losing share?

### When a Report Is a Discovery (Not Just Validation)

If a market report reveals information that contradicts your research from vendor sources, it's a discovery, not an error:

- **If buyers say they need X, but no vendor offers X** — This is an unserved opportunity, not vendor failure
- **If adoption rates are low despite vendor claims of market leadership** — The market is less mature than vendors claim
- **If spending is concentrated in a few areas** — The segment has real priorities and noise

**Example from this session:** J.P. Morgan's finding that "86% of FO succession plans are inadequate" is not something any family office software vendor mentions. It's a buyer-level pain point that creates the context for why entity mapping, multi-generational permissions, and governance tools matter.

## Combining All Three Patterns

For maximum value, combine all three patterns in a single research session:

1. **Start with Pattern 1** (sub-product/deep-dive) if your chosen topic is a sub-product
2. **When you discover the sub-product competes in a different segment, switch to Pattern 2** (market segment mapping) to understand the full competitive landscape
3. **Throughout, use Pattern 3** (primary market research) to validate and enrich findings

**Example flow from this session:**
1. Chose "Auria platform" as the topic (Pattern 1 — sub-product of Advyzon)
2. Discovered Auria competes in family office software, not RIA platform space
3. Mapped the entire family office software segment (Pattern 2 — 4 categories, 5+ platforms)
4. Cross-referenced with J.P. Morgan 2026 FO Report, Forbes, market sizing (Pattern 3)
5. Result: comprehensive analysis covering both the sub-product AND the segment, with primary sources validating the opportunity
