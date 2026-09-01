# Algorithm Triangulation & Negative Space Analysis in Software Research

## When to Use

Any time you research a software product/feature and need to understand its algorithmic approach, technical architecture, or limitations — but the vendor doesn't publish technical documentation. This is the norm for B2B/SaaS competitor research.

## The Triangulation Method

### Step 1: Collect all available public signals

From a single research session, gather these signals in parallel:

| Signal Source | What It Reveals | Example from RightCapital "Solve for Top Strategies" |
|---|---|---|
| **Press release / announcement** | Framing language, claimed capabilities | "evaluates potential results and generates five scenarios" — combinatorial, not probabilistic |
| **Product help docs** | UX structure, options, constraints | 6 withdrawal sequences × 3 asset location strategies × N bracket fill = manageable combinatorial space |
| **Third-party reviews (Kitces, T3, Ezra Group)** | Performance characteristics, limitations | Kitces called out "speed" as a differentiator vs. batch-processing legacy tools |
| **Comparison articles** | What competitors explicitly lack | Income Lab comparison shows other platforms lack RightCapital's automated solver |
| **Release timeline** | Maturity of the feature | Launched Q3 2024 — still new, likely to have gaps |
| **Competitor analysis** | What's NOT mentioned by rivals | No competitor lists RightCapital's solver as a feature they match → implies gaps exist |

### Step 2: Infer algorithm type from behavioral evidence

| Signal | Inference |
|---|---|
| "Top 5 results ranked by X" | Deterministic search across combinatorial space. Result count is small (5), not 1000s of simulated paths. |
| "One-click solver" | Pre-computed or instant — implies finite scenarios, not Monte Carlo |
| "Evaluates potential results" without "simulates" or "10,000 scenarios" | Deterministic, not probabilistic |
| "Generates five scenarios" | Curated result set — suggests exhaustive enumeration of a bounded space, then ranking |
| Product's core calculation is fast (noted by reviewers) | Supports combinatorics — can run full tax model across dozens of combos instantly |
| Separate Monte Carlo module exists elsewhere in product | Confirms the solver is NOT Monte Carlo — they'd use the same module if it were |

### Step 3: Identify what's MISSING (Negative Space Analysis)

This is the most valuable part. After mapping what the tool DOES, systematically enumerate what it DOESN'T do:

**RightCapital Solve for Top Strategies — Negative Space:**

```
DOES:        Evaluate 6 withdrawal seqs × 3 asset location × N Roth bracket fills
DOES NOT:    Vary conversion amounts year-by-year (static bracket-fill only)
DOES NOT:    Optimize Social Security claiming age alongside withdrawal strategy
DOES NOT:    Coordinate QCD recommendations with withdrawal sequencing
DOES NOT:    Model ACA subsidy cliffs (applies only post-65 for Medicare)
DOES NOT:    Optimize for state tax minimization separately
DOES NOT:    Apply consistent terminal tax rate across optimizer and main planning engine
```

**Where to look for negative space:**

1. **Comb through the help docs for what parameters DON'T exist** — If there's no "SS claiming age" slider in the solver, it's not optimizing for it.
2. **Read the footnotes and "important notes" sections** — These often document what the tool doesn't handle. RightCapital's note about the Estimated Terminal Tax Rate slider "not impacting other areas" reveals a consistency gap.
3. **Compare against academic research (Pepperdine, FPA Journal, Journal of Accountancy)** — If academics identify 4-6 critical tax interactions (SS taxation, IRMAA, state tax, ACA subsidies, RMD compression, QCDs), count how many the tool handles vs. misses.
4. **Check the release timeline vs. competitor timelines** — A tool launched 18 months ago that hasn't added X yet implies X is either hard, low-priority, or out of scope.
5. **Look for the "separate module" pattern** — If RightCapital has a separate SS optimizer module and a separate Estate module, the solver probably doesn't integrate with them. Disconnected modules = integration gaps in the solver.

## Common Algorithm Archetypes in Planning Software

| Archetype | Products | Characteristics |
|---|---|---|
| **Combinatorial search** (deterministic, bounded) | RightCapital Solve for Top | Enumerates finite strategy combos, runs full model on each, ranks by single metric |
| **Consumption smoothing** (economic optimization) | MaxiFi/ESPlanner | Searches across variable conversion amounts per year, objective = lifetime spending, not ending wealth |
| **Guardrails + specialized optimizer** | Income Lab Tax Lab | Uses dynamic spending boundaries, then optimizes Roth conversions within guardrails |
| **Effective marginal rate analysis** (tax-cliff-focused) | Covisum Tax Clarity | Finds optimal single-year conversion amount by identifying hidden cliffs (SS taxation, IRMAA, NIIT) |
| **Manual bracket fill** (no automation) | eMoney, MoneyGuidePro | Advisor selects target bracket, software fills to that threshold. No multi-strategy comparison. |
| **Multi-variable concurrent optimization** | T. Rowe Price Income Solver | Coordinates withdrawals + SS + Medicare simultaneously. Emerging category. |

## Template: Negative Space Section

Use this structure in RESEARCH.md entries:

```
#### What [Tool] Does NOT Do

| Area | Status | Evidence |
|---|---|---|
| Year-by-year dynamic optimization | Missing | Docs describe static bracket-fill, no annual variation |
| SS claiming age coordination | Missing | Separate SS module exists, not connected to solver |
| QCD integration | Missing | No mention in solver docs, QCD module separate |
| State tax optimization | Missing | Help doc lists state tax as calculation input, not optimization target |
| ACA subsidy modeling | Missing | Solver targets IRMAA (post-65), no ACA (pre-65) option |
```

## Why This Pattern Matters

1. **Negative space is the product gap** — What a tool doesn't do defines your competitive differentiation opportunity. RightCapital's gaps (year-by-year dynamic optimization, SS coordination, QCDs) are exactly where WealthForge should build.
2. **Algorithm type determines build cost** — A deterministic combinatorial search (like RightCapital) is cheap to build — just a loop around existing computation. A consumption-smoothing optimizer (like MaxiFi) requires economic modeling and is architecturally more complex.
3. **Marketing tells you the opposite of the truth** — Vendors market their strengths; the absence of a claimed capability in their marketing is stronger evidence than any explicit limitation statement. If RightCapital doesn't claim "year-by-year dynamic optimization" anywhere, it doesn't do it.
