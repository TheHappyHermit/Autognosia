# Conceptual / Architectural Research Methodology

## When to Use This Pattern

Use when the research topic is an **abstract concept, framework, or design philosophy** — not a specific product, competitor, feature, or regulatory rule. Signals:

- The topic is described as a "philosophy," "paradigm," "pattern," or "archetype"
- The terminology itself may be proprietary or non-standard (e.g., "blank paper vs. coloring book" was coined by a single research report)
- You're researching a trade-off or spectrum (flexibility vs. structure, narrow vs. broad, open vs. guided)
- The topic spans multiple product/company implementations (e.g., "AI archetypes in wealthtech")
- You're building an original synthesis or taxonomy rather than documenting an existing one

## The "Terminology Discovery" Search Pattern

Conceptual topics often lack standard terminology. The search strategy must be iterative:

### Phase 1 — Terminology Probe (3-5 parallel searches)

Launch simultaneous searches using different phrasings of the concept:

```python
from hermes_tools import web_search

# Run 3-5 different angles in parallel
searches = [
    web_search("Addepar 'blank canvas' OR 'blank paper' platform design philosophy"),
    web_search("wealthtech flexibility vs structure 'open platform' vs 'guided workflow'"),
    web_search("Addepar custom reporting flexibility user experience philosophy"),
]
```

**Search shape:** Each query uses a DIFFERENT vocabulary set for the same underlying concept. If the first 3-5 searches don't yield the term, it may not be a standard industry term — it may be specific to one source.

### Phase 2 — Secondary Source Search

If the term doesn't appear in marketing pages or standard industry analysis, search for:

- **Research reports** (Contrary, CB Insights, T3, Kitces, Datos Insights)
- **User reviews / comparison articles** (G2, SourceForge, Investipal comparisons)
- **Reddit / advisor forums** (r/CFP, r/wealthmanagement)
- **Product documentation** (developer docs, API reference, "101" pages)

These secondary sources often contain candid user language that marketing pages sanitize.

### Phase 3 — Proxy Concept Sweep

When direct terminology can't be found, research the **underlying concept** through its observable effects:

- Which platforms offer drag-and-drop report builders vs. predefined templates?
- Which platforms have 8-16 week vs. 2-4 week implementations?
- Which platforms target family offices (complex structures) vs. RIAs (standardized workflows)?
- What do user reviews praise vs. complain about (flexibility vs. complexity)?

This "invert the problem" approach lets you reconstruct the framework from evidence even if the term isn't standard.

### Phase 4 — Synthetic Framework Construction

If no single source uses your target term, **you are discovering or naming the concept yourself**. This is expected for architectural/design philosophy research. Steps:

1. **Collect all evidence** — Extract user quotes, feature comparisons, pricing models, implementation timelines
2. **Identify the poles** — What are the extremes? (blank paper vs. coloring book, narrow vs. broad, guided vs. open)
3. **Find the spectrum** — Where do specific platforms/products fall on this spectrum?
4. **Identify gaps** — What space is unoccupied? (e.g., "guided blank paper" — no platform fully achieves this)
5. **Name your synthesis** — The new category or framework you've identified

The synthesis IS the finding. Document it clearly in the research entry.

## Competitive Intelligence Extraction Pattern

When researching a platform's philosophy, extract signals from:

| Signal | What It Reveals |
|--------|----------------|
| Implementation time (1 day vs 16 weeks) | Configuration complexity / flexibility offered |
| User quote: "blank canvas" vs "templates" | Self-image of flexibility |
| Pricing model (AUM-bps vs per-user vs flat) | Target segment (enterprise vs SMB) |
| Custom attribute support | Data model flexibility |
| API-first vs no-code-only | Extensibility philosophy |
| Acquisition history (built vs bought) | Platform consistency vs fragmentation |
| Drag-and-drop vs predefined reports | User empowerment vs hand-holding |
| "Guide beginners, empower experts" in design principles | Explicit philosophy statement |

## The "Synthesis Finding" Format

When your research produces an original framework (not just documented findings), use this structure:

```
### The Framework
[Name and describe the framework — e.g., "The Five AI Archetypes"]
  
### Evidence Base
[What data points, quotes, and observations support each pole/category]

### The Spectrum
[How platforms/products map across the spectrum, with evidence]

### The White Space
[What position is unoccupied — the original "synthesis" finding]

### Implications
[What this means for the project — e.g., WealthForge's opportunity]
```

## Real Example: Blank Paper vs. Coloring Book Research

The actual discovery path:

1. **Source found:** Contrary Research report on Addepar explicitly used the terms: "Some of Addepar's users have described its competitors as akin to a 'coloring book'... In contrast, these users believe Addepar can be thought of as a 'blank piece of paper'"
   
2. **Addepar's own language:** "You can pop open a blank canvas and drag a pie chart" (addepar.com/better-reporting)

3. **Corroborating evidence:** Implementation timelines from comparison articles (Investipal: 1 day, Orion: 2-4 weeks, Addepar: 8-16 weeks)

4. **Original synthesis:** The "guided blank paper" pattern — AI bridges the flexibility/usability gap. No existing platform achieves this.

5. **New research topics generated:** 5 subtopics added to agenda (AI as bridge, implementation timelines as moat, guided blank paper pattern, template marketplace, progressive disclosure UI)

## Common Pitfalls

### The term doesn't exist as a standard phrase
Some architectural concepts are described differently in every source. The phrase "coloring book" may be unique to one research report. Don't abandon the research if the exact term doesn't appear — focus on the concept.

### Marketing vs. reality mismatch
Platforms may claim flexibility while offering rigid data models, or claim ease-of-use while requiring expert configuration. Cross-reference platform claims with independent reviews, user forum complaints, and implementation timelines.

### The middle of the spectrum is more interesting than the poles
The most valuable finding is often the synthesis — what's possible when you combine the strengths of both approaches (e.g., "guided blank paper" combining Addepar's data model flexibility with Orion's workflow ease via AI). Document the middle ground, not just the extremes.

### One data point doesn't make a pattern
A single user quote about platform flexibility doesn't constitute a research finding. Look for corroborating evidence: multiple user quotes, implementation time data, pricing models, API vs. template UI patterns. The framework should be overdetermined — supported by multiple independent evidence streams.

## When to Use vs. Product Research

| Dimension | Conceptual/Architectural Research | Product/Feature Research |
|-----------|----------------------------------|-------------------------|
| **Topic** | Design philosophy, trade-off, paradigm | Specific product, feature, company |
| **Search target** | Terminology discovery | Product pages, docs, reviews |
| **Evidence type** | Qualitative signals, user quotes, design principles | Feature lists, pricing, screenshots |
| **Output** | Synthesis framework, taxonomy, white space analysis | Feature comparison, gap analysis |
| **Success metric** | Original insight / new framing | Comprehensive coverage |
| **Iterations needed** | 3-5 search rounds, each refining vocabulary | 1-2 search rounds, well-known terms |
