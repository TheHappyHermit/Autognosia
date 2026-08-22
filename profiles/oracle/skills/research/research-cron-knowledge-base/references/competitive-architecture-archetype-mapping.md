# Competitive Architecture Archetype Mapping

## When to Use

Use this pattern when researching a competitive space where products/platforms are converging on the same capability from different architectural foundations. This is common in fast-moving categories where incumbents, startups, and adjacent players all enter the same space simultaneously.

Signals that trigger this pattern:
- 3+ competitors all launching the same feature category in the same 6-month window
- Incumbents building AI into existing platforms vs. startups building AI-first from scratch
- Different product categories all converging on the same workflow (e.g., CRMs, portfolio platforms, and notetakers all adding planning features)
- A research topic description says "... debate" or "... competitive dynamic" — this is a strong signal that archetypes exist

## The Three-Step Mapping Process

### Step 1: Identify the Competitive Camps

Don't just list competitors alphabetically. Group them by **architectural approach** — how they were built, not just what they do. Common dimensions:

| Dimension | Question to Ask |
|-----------|----------------|
| **Origin story** | Was this built as a standalone feature or extended from an existing platform? |
| **Data ownership** | Does the product own its own data or orchestrate data from other systems? |
| **Execution model** | Does it execute actions within its own system or via API across systems? |
| **AI integration** | Is AI the foundation (AI-native) or a layer on top (bolt-on)? |
| **Scope** | Is it a single-product play or a platform play? |

**Real example from CRM AI research (May 2026):**

Instead of listing 8 CRM AI tools alphabetically, group by architectural approach:

| Camp | Examples | Architecture | Key Argument |
|------|----------|-------------|--------------|
| **Legacy CRM + Embedded AI** | Wealthbox, Practifi | AI layers on existing system of record | "AI must live where execution liability is governed" |
| **AI-Native CRM** | Slant, Altitude | AI framework first, CRM features built on top | "Current-state data layer is architecturally impossible on legacy data" |
| **Full-Stack Platform + AI** | Advisor360, Altruist | Unified platform (CRM+portfolio+ops) with integrated AI | "One data layer across all capabilities" |
| **Agentic OS (AI-first, no CRM)** | Jump, Zocks | AI orchestration layer above all systems | "The meeting transcript is the new system of record" |

Three to four camps is ideal. Two is too few (misses nuance). Five+ suggests you're over-splitting.

### Step 2: Map to an Overarching Framework

Find a higher-order framework that explains WHY these camps exist and what their trajectories are. A good framework:

- **Predicts** which camp will win in which segment, not just describes current state
- **Explains** why engineering choices lead to different outcomes
- **Creates a timeline** — when will the decision be forced?

**Real example:** Ezra Group's "Great Bifurcation" (2026 Strategic Buyer's Guide) — every firm will land on either Legacy Platform Embedded AI or Agentic OS by 2028. Neither path works by accident. This framework explains the camps AND predicts the deadline.

Sources to check for frameworks:
- Industry analyst reports (Ezra Group, Cerulli, Aite-Novarica, Celent, Datos Insights)
- Counter-positioning blog posts (each camp publishes "Why our approach is better")
- Academic/trade journal frameworks
- Kitces.com analysis (often surfaces the underlying thesis)

### Step 3: Synthesize Implications for Your Project

For each camp, answer:
1. **Integration path** — How does our project connect to this camp? API? MCP? White-label? Embed?
2. **Risk** — Does this camp's success threaten our project? Create dependency? Lock us out?
3. **Opportunity** — Does this camp need what our project provides? (e.g., all four CRM AI camps need a planning engine)
4. **Timeline** — When must we decide which camp to align with?

**Real example output from CRM AI research:**

| Camp | Integration Path | Risk | Opportunity | Timeline |
|------|-----------------|------|-------------|----------|
| Legacy CRM + AI | CRM API or MCP | High if CRM locks out third-party agents | CRM needs planning data to power its AI | Now |
| AI-Native CRM | API or MCP | Low — architecture is open | Planning data enriches AI-native data model | Now |
| Full-Stack + AI | MCP or none | High — full-stack may build planning natively | Bundle pricing unlikely to match planning depth | 12-18 months |
| Agentic OS | MCP or API | Low — open architecture by design | Need a System of Advice they orchestrate | Now |

The synthesizing statement should be a single sentence that captures WealthForge's strategic position relative to all camps. Example: *"WealthForge should NOT build a CRM — it should be the System of Advice that any winning CRM/OS platform integrates with."*

## Pitfalls

### Don't just describe — predict
Listing camps without a predictive framework is journalism, not competitive intelligence. The framework must create a falsifiable prediction about who wins, when, and why.

### Don't over-split
If you find yourself with 6+ camps, step back. You're probably splitting on minor feature differences rather than architectural foundations. Merge smaller camps under the nearest architectural parent.

### Don't forget the "None" camp
Some competitors will decide NOT to enter the space. The Redtail AI gap (Redtail has no native AI notetaker despite being #1 CRM) is a strategic choice worth analyzing, not an oversight. Inaction by the market leader creates opportunities.

### Look for the "current state vs. historical record" data architecture insight
One of the most valuable findings from any analysis is understanding how different architectures handle the **time dimension of data**. A CRM storing chronological artifacts (notes, activities) requires AI to reconstruct "what is true right now." An AI-native system maintaining a separate current-state layer can answer "what is true now" directly. This architectural distinction often explains why performance gaps persist even as bolt-on features catch up in demos.

### The framework must fit the specific competitive space
Don't force a generic "innovator vs. incumbent" narrative. The Ezra Group "Great Bifurcation" is specific to the AI meeting-intelligence space — it doesn't apply to portfolio management AI or estate planning AI. Build or find a framework that fits the specific competitive dynamics of the category you're researching.

## Example: Real Application (Wealthbox CRM AI Research, May 2026)

The complete application of this pattern is documented in RESEARCH.md under "2026-05-15 23:50 — Wealthbox AI Counter-Offensive / System of Record vs. System of Action Debate" for the WealthForge project. Key output: 4 new research topics discovered, a synthesized strategic recommendation ("System of Advice, not CRM"), and a CRM AI compatibility prioritization matrix for future integration decisions.
