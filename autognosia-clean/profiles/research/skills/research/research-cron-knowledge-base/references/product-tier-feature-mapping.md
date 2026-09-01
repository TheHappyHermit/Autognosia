# Product-Tier Feature Mapping Research Method

A generalizable research pattern for analyzing a competitor's feature by examining how it's implemented across their product/pricing tiers.

## When to Use

Use this pattern when researching a specific competitor feature where:
- The competitor offers multiple product tiers (e.g., Plus, Pro, Premier)
- The feature of interest exists in some tiers but not others, or varies in depth
- You want to understand which capabilities they consider differentiating (higher tiers only) vs. baseline (all tiers)

## Method

### Step 1: Identify the tier structure
Search for "[company] products" or "[company] pricing" to find the tier breakdown. Look for official product pages, not third-party pricing aggregators.

### Step 2: Map the feature across tiers
Visit each product tier's page and note what version of the feature is available. Key questions:
- Is the feature present in all tiers? (core capability)
- Is it present only in higher tiers? (differentiator)
- Does it vary in depth? (e.g., "Foundational Planning" vs. "Advanced Planning")
- Is it explicitly called out as the "do X with Y" differentiator?

### Step 3: Extract tier-specific descriptions
Each tier page may describe the same feature differently:
- **Lower tier**: "Simple, streamlined version" — signals the baseline UX
- **Higher tier**: "Explore complex strategies," "model advanced scenarios" — signals the differentiating depth
- The language gap reveals what the company considers its moat

### Step 4: Cross-reference with case studies
Case studies often reveal which tier real firms use and why. Look for:
- Firm size/AUM buying each tier
- Which features from that tier they cite as most valuable
- Whether they mention "started on lower tier, upgraded" — reveals expansion path

### Step 5: Synthesize the feature taxonomy
From the tier mapping, construct:
- **Core capabilities** (available in all tiers) — likely table stakes / mature
- **Differentiating capabilities** (higher tiers only) — the company's competitive moat
- **Gated capabilities** (highest tier only) — enterprise features, may be monetizable
- **Missing capabilities** (no tier mentions it) — gaps to exploit

## Example: eMoney Decision Center Research

| Tier | Decision Center Version | What It Says |
|------|-----------------------|-------------|
| Plus (~$1,860/yr) | Foundational Planning | "Goals-based, streamlined, side-by-side comparisons" |
| Pro (~$2,760/yr) | Advanced Planning (Cash Flow) | "Techniques, What-If Scenarios, Multi-View, Solvers" |
| Premier (~$3,600/yr) | ALL capabilities | "Everything in Plus + Pro + Premium Client Portal + CoPlanner" |

**Synthesis:**
- **Core:** Basic what-if scenario modeling (all tiers)
- **Differentiator:** Multi-View, Solvers, Techniques abstraction (Pro+)
- **Gated:** CoPlanner AI integration, Presentation View to Client Portal (Premier)
- **Missing:** None explicitly — this IS eMoney's moat

## Pitfalls

1. **Pricing aggregators are unreliable** — G2, Software Advice, and similar sites often show outdated prices or conflate tiers. Always go to the company's own product pages first.

2. **Tier names change** — Companies rename tiers during rebranding. Search both current AND past names. eMoney had "emX" as its prior brand before the Plus/Pro/Premier naming.

3. **Feature descriptions are aspirational** — Product pages describe ideal-state features, not what works well in practice. Cross-reference with G2 reviews, case studies, and user forums for real-world assessment.

4. **Some features are implicit** — A feature may exist in a lower tier without being advertised there (e.g., basic what-if exists in all tiers but is only described on the high-tier page). Be thorough.
