# Competitive Landscape Table Pattern

## Why This Exists

The COMPETITIVE LANDSCAPE section (Section 3) of WealthForge research entries frequently requires side-by-side vendor comparison. A structured table is more informative, scannable, and buildable than prose paragraphs listing competitor features. This file documents the table format, column conventions, and data-gathering methodology.

## The Standard Table Format

### Header Row

```
| Platform | Feature A | Feature B | Feature C | Feature D | Notes |
```

Use a short, recognizable vendor name as the row identifier (e.g., "eMoney Advisor" not "Fidelity eMoney Advisor Platform Suite").

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully supported — has the feature, well-implemented |
| ⚠️ | Partial support — has the feature but limited/weak/buggy |
| ❌ | Not supported — no evidence of the feature |
| ? | Unknown — couldn't verify from available sources |

### Column Types (choose from these)

Common feature-check columns:
- **Automatic Calculation** — Does the platform calculate it automatically or require manual entry?
- **Optimization/Suggestion** — Does it proactively suggest better options, or just display the calculation?
- **Multi-Year Projection** — Shows forward-looking trajectory (5-30 years)
- **Integration** — How well does it connect to other tools (custodial feeds, CRM, reporting)?
- **Client-Facing** — Is there a client portal view?
- **Advisor Workflow** — Is it integrated into advisor dashboards or a standalone tool?
- **Auto-Detection** — Does the platform PROACTIVELY detect and flag the condition from existing client data, or does the user need to manually configure/enter it? This is distinct from "Automatic Calculation" (which means the math is automated once inputs are provided). Auto-detection means the system surfaces the opportunity without being asked. A platform could calculate perfectly (calc = ✅) but be completely blind to auto-detection (detect = ❌). This dimension is the single biggest competitive gap in wealth management software — most platforms have zero auto-detection for life events, eligibility changes, or optimization opportunities, creating the "advisor must already know about it to use it" failure mode. See `references/ss-research-pattern.md` for an extended example in the Social Security context.

### Row Organization

Order platforms strategically:
1. **Tier 1: General planning platforms** — eMoney, RightCapital, MoneyGuidePro, Orion (most readers will know these)
2. **Tier 2: Specialized/niche tools** — Boldin, Pralana, MaxiFi, Income Lab
3. **Tier 3: Adjacent/fringe** — Wealth.com, Vanilla, robo-advisors

If the table is too wide (more than 7-8 columns), split into two tables by theme (e.g., "Core Features" and "Advanced Features").

## Data-Gathering Methodology

Do NOT fabricate feature claims. For each competitor-assertion pair, at least one of these must be true:

1. **Extracted from vendor docs**: You web_extract'ed pricing/features page and found the claim
2. **Sourced from advisor reviews**: T3 Advisor Survey, Kitces survey, Reddit r/CFP, or review sites
3. **Sourced from comparison articles**: White Coat Investor, Bogleheads, US News comparisons
4. **Third-party verification**: For critical claims (e.g., "Pralana has best Roth optimizer" vs "eMoney lacks optimizer"), search for user comparisons or feature matrix content

### Table-Specific Queries

When researching a competitive table for a specific feature class, use these query templates:

```
# For general planning tools
"{competitor_name}" {feature_name} financial planning software

# For specific feature comparison
eMoney vs RightCapital vs MoneyGuidePro vs Orion {feature_name} comparison

# For advisor sentiment on features
r/CFP {competitor_name} {feature_name} OR review

# For pricing context (important for competitive positioning)
{competitor_name} pricing 2025 2026 standalone OR bundle
```

## Markdown Table Template

```markdown
| Platform | Feature Calc | Optimization | Multi-Year | QCD/Charity | Roth Coord | Integration |
|----------|-------------|--------------|------------|-------------|------------|-------------|
| **eMoney Advisor** | ✅ Auto, accurate | ❌ Manual only | ✅ In cash flow | ✅ Manual entry | ✅ Manual scenario | ✅ Custodial feeds |
| **RightCapital** | ✅ Auto, alerts | ❌ No optimizer | ✅ Projection charts | ⚠️ Included | ✅ Side-by-side | ⚠️ Limited |
| **MoneyGuidePro** | ✅ Calculated | ❌ Static only | ⚠️ Limited | ✅ Included | ⚠️ Basic | ✅ Good |
| **Orion** | ✅ Auto | ❌ None | ✅ Good charting | ✅ Tracks QCDs | ✅ Integrated | ✅ Strong |
| **Pralana Online** | ✅ Strong | ✅ Best optimizer | ✅ Detailed 30yr | ✅ Integrated | ✅ Year-by-year | ❌ Standalone |
```

## The Gap Summary

After the table, write a brief gap analysis paragraph synthesizing what NO platform does well. This is the competitive opening for WealthForge. Example from the RMD research:

> **Key Gaps Across ALL Platforms:**
> 1. **No standalone "RMD optimizer"** — Every platform calculates RMDs but doesn't suggest strategies to reduce them.
> 2. **No "RMD-SWR collision detector"** — No platform automatically warns when future RMDs will exceed safe withdrawal rates.
> 3. **No pre-RMD "bridge year" planner** — No platform tells a 62-year-old "Here's exactly how much to convert each year before age 73."

Format as a numbered list. Each gap should be specific enough that a product manager could write a ticket from it.

## Variant: Multi-Metric Comparison

For topics where each platform has many different features to compare (not a binary check), use rows-within-rows:

```markdown
| Platform | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| **Tool A** | Feature X, Feature Y | No Feature Z, expensive | Large RIAs |
| **Tool B** | Feature Z, cheap | No Feature X | Small firms |
```

## Anti-Patterns

- ❌ **Vague rows**: "eMoney — good" / "Orion — fine". Every assertion needs a specific feature name.
- ❌ **Missing sources**: The table is only as credible as your research. If you're unsure about a feature, use `?` not `✅`.
- ❌ **Too many columns**: 8+ columns creates horizontal scroll. Split into thematic subtables.
- ❌ **Prose-only competitive section**: Without a table, readers can't scan differences at a glance. Always include a table if 4+ competitors are being compared.
