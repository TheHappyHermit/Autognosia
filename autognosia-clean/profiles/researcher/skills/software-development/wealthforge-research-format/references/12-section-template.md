# 12-Section Research Template — Quick Reference

Use this template for EVERY WealthForge deep research entry. All 12 sections are required. The order is strict.

```
---

## YYYY-MM-DD HH:MM — Topic Name

### 1. STRATEGY & CONTEXT (Industry Analysis)
Full industry picture with proper terminology. Who are the players? What are the trends? Why does this matter? Cite actual sources with URLs.

**Covers:** Industry analysis, market trends, key players, strategic importance, data points.

### 2. THE PROBLEM (Plain English)
A real human situation with concrete numbers. "Sarah is 65 with $300k in a 401(k), $100k in a Roth IRA..."

**Covers:** Concrete scenario with fake-but-realistic names and dollar amounts. Shows why this matters to a real person.

### 3. COMPETITIVE LANDSCAPE
What do other platforms do (or fail to do)? Name specific competitors and their features.

**Tiers (if applicable):**
- Tier 1: General financial planning platforms (eMoney, RightCapital, MoneyGuidePro)
- Tier 2: Retirement-income specialists (Income Lab, Pralana, Income Solver)
- Tier 3: Direct-to-consumer (Wealthfront, Betterment, Schwab)

**Covers:** Specific features, gaps, market share data where available. Use a comparison table when possible.

### 4. ADVISOR & CLIENT SENTIMENT
What do actual advisors say? What do clients want? Search forums, Reddit, LinkedIn, Kitces comments.

**Covers:** Real quotes from r/CFP, r/RIA, Bogleheads, Morningstar Community, Kitces.com comments. Direct quotes with context.

### 5. WHAT WEALTHFORGE HAS / IS MISSING
WE HAVE: [exact tool/function/module names from the codebase]
WE'RE MISSING: [exactly what needs to be built]
ALREADY RESEARCHED: [file path in research_outcomes/ if applicable, and what's covered/not covered]

**Covers:** Honest assessment. Acknowledge what exists. Be specific about gaps. Cross-reference existing research_outcomes files.

### 6. BUILD SPEC (For a coder with no finance background)
What data inputs are needed? (include types)
What's the core logic/calculation? (show formulas, algorithms, or pseudocode)
What does the output look like?
What are the edge cases and failure modes?

**Covers:** Actual pseudocode, algorithm descriptions, input/output specs. This is the most important section for the user.

### 7. UI/UX & VISUALIZATION PATTERNS
What should this LOOK like on screen? Describe the chart, graph, dashboard element, or report in detail.

**Covers:** Data on each axis, colors (reference WealthForge Design Specs — Premium Ivory, Navy, Gold), interactivity, advisor view vs. client portal view. Component names if known.

### 8. REGULATORY & GUARDRAILS
SEC rules, FINRA requirements, IRS regulations, state laws that affect this feature.

**Covers:** Specific rule numbers (SEC Rule 2210, FINRA 3110, IRC Section 1091), disclosure requirements, compliance gates, recordkeeping requirements.

### 9. ARCHITECTURAL BLUEPRINT
What agents/services are needed? What database tables? What API endpoints? What's the data flow?

**Covers:** New agents with agent names (A14, A13b), rung assignments, database schemas (SQL), API endpoints with path patterns, data flow diagrams. Reference existing codebase architecture.

### 10. RED TEAMING (Critical Analysis)
What could go wrong? False positives, edge cases, failure modes. How to mitigate each.

**Covers:** At least 5-7 failure modes, each with a specific mitigation strategy. Proves you've thought about the hard parts.

### 11. KEY SOURCES
List all sources with URLs. At minimum 10-15 sources per topic.

**Covers:** Organized by category (foundational research, industry sources, competitive intel, regulatory sources). All sources must have URLs.

### 12. NEW TOPICS DISCOVERED
What new research rabbit holes did this topic reveal? Add them here to expand the agenda.

**Covers:** 3-6 new topics with brief descriptions. These become new entries in the research agenda.
```

## Quality Checklist

Before finishing, verify:

- [ ] All 12 sections present and in order
- [ ] Section 1 has specific URLs cited inline
- [ ] Section 2 has a named person with concrete dollar amounts
- [ ] Section 3 names 5+ specific competitors with feature analysis
- [ ] Section 4 has real quotations from public forums
- [ ] Section 5 checks the codebase for existing tools
- [ ] Section 6 has actual pseudocode or algorithm
- [ ] Section 7 describes charts, colors, and interaction
- [ ] Section 8 cites specific regulation numbers
- [ ] Section 9 has SQL schema and API endpoints
- [ ] Section 10 has 5+ failure modes with mitigations
- [ ] Section 11 has 10-15+ sources with URLs
- [ ] Section 12 has 3+ new topics
- [ ] Entry exceeds any existing research_outcomes file on the same topic
