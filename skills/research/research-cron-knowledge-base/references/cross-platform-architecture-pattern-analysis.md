# Cross-Platform Architecture Pattern Analysis

## When to Use This Pattern

Use this when you need to analyze a **specific type of feature or capability** across multiple platforms simultaneously — not a single competitor's platform, but a specific architectural pattern that multiple competitors have built.

**Examples:**
- "AI intelligence layers in wealth management" — Every major platform (Orion, Advyzon, Addepar, Envestnet, TIFIN) built one in 2026, each with a different architecture
- "Direct indexing approaches" — How different platforms handle stock-level TLH, tax-alpha optimization
- "Client engagement / portal models" — What each platform offers for client-facing interfaces
- "Rebalancing engine architectures" — Comparison of how Orions, Tamaracs, Advyzons handle trading workflows

**Signals that this pattern is needed:**
- You notice the same capability name being used across 3+ competitors (e.g., everyone has "an AI layer," "direct indexing," "entity mapping")
- The topic is broader than any single competitor but narrower than an entire market segment
- The agenda has 2-3 separate [⏳] entries that naturally overlap (sub-topic sweep opportunity)
- You need to answer "what are the architectural approaches to X?" not "how does company Y do X?"

**DO NOT use this pattern when:**
- You're analyzing a single company's full platform (use `references/competitor-analysis-deep-dive.md`)
- You're mapping an entire market segment (use `references/product-line-and-market-segment-dives.md`)
- The feature is unique to one platform (there's no cross-cutting comparison to make)

## Core Methodology

### Step 1: Identify the Pattern Across Platforms

Start by searching for each major platform's version of the capability in parallel:

```
[platform 1] + "[capability]" + "features" OR "product" OR "launch"
[platform 2] + "[capability]" + "features" OR "product" OR "launch"
[platform 3] + "[capability]" + "features" OR "product" OR "launch"
```

Use **parallel web_search calls** (3-5 simultaneous) — each targets a different platform. This saves 3-5x wall-clock time.

Also do a broad landscape search:
```
"[capability]" + "wealth management" OR "advisor" OR "fintech" 2026
```

**Example from this session:** The searches `Advyzon AI agentic intelligence`, `Orion Denali AI enterprise intelligence`, `Addison AI Addepar portfolio analytics`, `Envestnet Insights AI decision intelligence` were all run simultaneously, and a broad `"agentic intelligence" wealth management 2026` search covered the landscape.

### Step 2: Classify Each Platform's Approach

For each platform, extract the **architectural philosophy** — not just what it does, but HOW it's organized and WHY:

| Question | What to extract |
|----------|-----------------|
| What is the **core philosophy**? | "AI as centralized hub" vs. "AI as agentic co-worker" vs. "AI grounded in portfolio data" |
| Who are the **primary users**? | Advisors? Investment teams? Operations? Firm leadership? |
| What's the **data foundation**? | Unified data layer? Knowledge graph? Portfolio data? |
| What's the **launch timing**? | Beta vs. GA, year/quarter — reveals who's first-mover vs. fast-follower |
| What **modules/features** does it include? | Meeting prep, notetaker, practice intelligence, document extraction, etc. |
| What's the **governance model**? | Single-tenant? Human-in-the-loop? Audit trails? Permissioned access? |
| What's the **proven ROI**? | Any published efficacy data? (Rare — most don't publish) |

**Search for each dimension individually.** Product pages give the philosophy; press releases give launch timing; in-depth interviews give architecture details; blog posts give governance models.

### Step 3: Build the Taxonomy (Find the "What's the Same, What's Different" Pattern)

The most important step. **Don't just list each platform's features. Find the organizing concept that explains WHY they differ.**

In the AI layer analysis, the organizing concept was "architectural archetype" — the answer to "what should AI do for advisors and how should it be organized?" Five distinct archetypes emerged:

1. **Enterprise Intelligence Platform** (Orion) — AI as centralized hub connecting all modules
2. **Agentic Orchestration** (Advyzon) — AI as intelligent co-worker moving work forward
3. **Portfolio Analytics** (Addison/Addepar) — AI grounded in portfolio data for analysis
4. **Decision Intelligence** (Envestnet) — AI as data-analytics decision support from knowledge graph
5. **Multi-Agent OS** (TIFIN.AI) — AI as cross-enterprise agentic operating system

**How to find the taxonomy:**
1. Read all platform descriptions — look for the CORE METAPHOR they use ("gravitational center," "intelligent co-worker," "think with you," "decision intelligence")
2. Identify the PRIMARY USER they serve — advisors vs. investment teams vs. operations
3. Note the DATA FOUNDATION — what data is AI grounded in? This reveals architectural constraints
4. Group platforms that share the same metaphor/user/foundation into clusters
5. Name each cluster by its organizing principle, not by a company name

**A good taxonomy passes this test:** Someone could describe it to an industry outsider and the categories make intuitive sense without knowing which companies belong to which category.

### Step 4: Build a Comparison Matrix

Create a table with **dimensions from Step 2 as rows** and **each platform as a column**:

```
| Dimension | Platform A | Platform B | Platform C | Platform D |
|-----------|------------|------------|------------|------------|
| Core Philosophy | X | Y | Z | W |
| Primary Users | Advisors | Investors | Ops | All |
| Data Foundation | Unified layer | Knowledge graph | Portfolio data | Multi-system |
| Launch | Q1 2026 | Q4 2025 | Q1 2026 | Q2 2026 |
| Key Modules | A, B, C | D, E | F, G | H, I |
| Governance | Single-tenant | Human-in-loop | Permissioned | Agent library |
| Proven ROI | No | ~20% growth | No | No |
```

This table is the single most valuable artifact of the research — it's where patterns emerge and gaps become visible.

### Step 5: Identify Gaps and White Space

**Gaps are more valuable than the table itself.** Every comparison reveals something NO platform is doing well:

- **Within-category gaps:** Even the best platform in each archetype has missing features (e.g., Addison has no AI notetaker, no practice intelligence)
- **Cross-category gaps:** What NO archetype does yet. In the AI layer analysis: no platform offers "Planning-First AI" — AI grounded in financial planning data rather than portfolio data. WealthForge could own this.
- **Industry inflection points:** Things WEALTHTECH ANALYSTS say that reveal where the puck is going (e.g., "AI is eating the advisor technology stack from every direction" = the death of fragmented software)

**How to find gaps:**
1. Apply YOUR project's unique lens to the matrix — what does your project do that no platform in the table can match?
2. Read analyst commentary (Kitces, WealthTech Today, Ezra Group) — they surface industry-level insights no single company can provide
3. Look for features that exist as STANDALONE products (Jump, Zocks) but not yet embedded in any platform — these are acquisition or build targets

### Step 6: Apply the Sub-Topic Sweep (Agenda Cleanup)

**This is the secret efficiency gain** of cross-platform analysis. If the agenda has 2-3+ separate [⏳] entries that are really sub-patterns of the same cross-cutting topic, you can mark multiple entries as [✅] with a single research session.

**Before:**
```
- [⏳] Advyzon AI / agentic intelligence layer
- [⏳] Denali AI / enterprise AI intelligence layer
- [⏳] Envestnet Insights AI architecture — the fourth AI pattern
- [⏳] Addison AI / portfolio-analysis-focused AI architecture
```

**After:**
```
- [✅] AI intelligence layer patterns (COMPREHENSIVE — covers Denali, Advyzon, Addison, Insights, TIFIN)
- [✅] Denali AI / enterprise AI intelligence layer — COVERED in cross-platform analysis
- [✅] Envestnet Insights AI architecture — COVERED in cross-platform analysis
```

When marking sub-topics as [✅], add a note: "COVERED in the 'X' cross-platform analysis (researched YYYY-MM-DD)." This preserves traceability in the agenda.

**Trigger to watch for:** When reading the agenda and the 3rd or 4th [⏳] item in a row is clearly a variant of the same pattern as the first, you're looking at a sub-topic sweep opportunity.

### Step 7: Write Synthetic Findings

The research appendix should include TWO sections that a single-company analysis wouldn't produce:

1. **The Architectural Taxonomy** — Explain the organizing framework you discovered. This is the most enduring finding; it helps future readers understand the landscape even as individual companies evolve.

2. **Strategic Implications for YOUR Project** — This is the payoff. What does this cross-platform analysis mean for your project's product strategy? Specifically:
   - Which archetype should your project pursue?
   - Is there WHITE SPACE no platform has claimed?
   - Which features are TABLE-STAKE vs. DIFFERENTIATING?
   - What DATA FOUNDATION does your project need to compete?

### Step 8: Expand the Agenda with New Architecture Variants

Cross-platform analysis often reveals MORE variants or sub-patterns than you knew existed. Each variant that deserves its own deep dive should become a new [⏳] entry.

**Examples from this session's AI layer analysis — entries added:**
- Jump AI Operating System ($80M Series B)
- Zocks AI ($45M Series B)
- Wealthbox AI counter-offensive
- TIFIN.AI agentic operating system
- Fidelity Wealthscape Intelligence
- Range AI-only advisor model
- Multi-agent AI orchestration architectures

These emerged because the cross-platform analysis revealed that the AI layer pattern had MORE variants than the original three entries captured.

## Common Pitfalls

### P1: Comparing apples to kale
Don't compare platforms that aren't in the same game. Addison AI (portfolio analytics) and Wealthbox AI (CRM defense) are both "AI" but shouldn't share the same matrix dimensions. If they don't share the same primary user and data foundation, they're in different categories — treat them as separate archetypes.

### P2: Taxonomy overload
A taxonomy with 8+ categories is not a taxonomy — it's a list. If you have more than 5-7 archetypes, look for a dimension you can collapse (e.g., "standalone AI tools" vs. "platform-native AI" as a higher-level grouping).

### P3: Missing the "efficiency hack" in the agenda
Cross-platform analysis is a META-TOPIC that may only exist as the sum of its parts in the agenda. Always scan the agenda for 2-3 similar-sounding topics before starting. If they share a core pattern, rebrand the session as cross-platform analysis and sweep them together.

### P4: Overlooking analysts
For cross-platform analysis, independent analysts (Kitces, WealthTech Today, Ezra Group) are MORE valuable than individual product pages. They've already done the work of comparing platforms against each other. Always search for their latest roundups before building your own from scratch.

### P5: Failing to extract the organizing concept
If you finish writing and your comparison is just a table of features with no taxonomy, you missed the value. The taxonomy IS the finding. Readers should finish your analysis with a clearer mental model of how the industry is organized, not just a list of who has what.
