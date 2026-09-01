# Example: WealthForge AI Deep Research Cron

This is the concrete cron job configuration used for ongoing WealthForge AI research. Adapt the paths, topic list, and deliver channel for other projects.

## Cron Job Config

```yaml
name: "WealthForge Deep Research"
schedule: "*/15 * * * *"   # Fires every 15 min
deliver: "telegram"         # Sends Telegram summaries (auto-detect in current config)
toolsets: ["terminal", "file", "web"]
```

## Knowledge Base Location

```
~/Documents/Hermes-Vault/wealthforge-roadmap/
├── AGENDA.md               # State tracker — which topics are done/pending
├── RESEARCH.md             # Accumulated findings — every run appends here
└── INITIAL_FINDINGS.md     # Phase 1 codebase deep-dive notes (static)
```

## Example AGENDA.md Structure

```markdown
# WealthForge Research Agenda

**Last Updated:** YYYY-MM-DD HH:MM
**Current Section:** Competitors
**Status:** Phase 2 — Competitor research in progress (N of M complete: ...)

## Status Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked

## Phase 1 — Codebase Deep Dive
- [✅] **wealthforge-ai** — Full codebase read
- [✅] **wealthforge-core** — Scanned, superseded

## Phase 2 — Research Topics

### Competitors
- [✅] **Betterment** — Full platform analysis
- [✅] **Wealthfront** — Full platform analysis
- [⏳] **eMoney** — Full analysis

### Portfolio Management
- [⏳] Rebalancing algorithms and methodologies
- [⏳] **Black-Litterman model for portfolio construction** — Academic deep dive (discovered via Wealthfront research)
...
```

## Research Methodology Per Run

Each run is a fresh autonomous session (no user present). Follow this flow:

### Step 1: Read state
Read both AGENDA.md and RESEARCH.md to find the next un-researched [⏳] topic and understand what's been covered.

### Step 2: Deep research
Spend serious effort on the chosen topic. Use `web_search` and `web_extract` to visit competitor websites, documentation, product pages, academic sources, IRS/SEC/FINRA sites. Take detailed notes on:
- What the feature/workflow does
- How competitors implement it
- Whether WealthForge already has this
- If missing, high-level notes on what would need to be built

### Step 3: Expand the agenda dynamically (CRITICAL)

While researching, actively look for NEW subtopics, adjacent domains, competitor features you didn't know about, regulatory requirements, or workflows worth their own dedicated session. Add them to AGENDA.md as new [⏳] items under the appropriate section. If they don't fit an existing section, create a new section.

**The agenda should grow faster than it shrinks.** Every research run should produce at least as many new topics as it consumes. If a run produces zero new topics, the research is likely getting shallow — dig deeper into regulatory filings, academic papers, and technical documentation rather than just product pages.

### Prospecting/light-planning and data-migration competitive dimensions
When researching planning engine competitors (RightCapital, eMoney, MoneyGuidePro), look beyond traditional financial features. Capture:
- **Prospecting pipelines** (low-friction tools like MoneyGuide's Dash, RightCapital's RightExpress)
- **Data migration support** (OCR imports from competitors — RightCapital's Smart Import reads MoneyGuide/eMoney PDF reports)
- **Regulatory compliance update velocity** (how quickly SECURE Act 2.0, IRMAA, tax form updates are incorporated)
- **Planning methodology flexibility** (goals-based vs. cash flow vs. hybrid/modified)
- **Client education tools** (modular blocks like MyBlocks)
- **API/embed capabilities** (Play Zone API, eMoney Access)

Examples of things worth adding:
- A competitor feature you didn't know about that deserves its own deep dive
- A regulatory rule you encountered that needs separate research
- An adjacent domain (e.g., "retirement income guardrails methodology" as a subtopic of retirement)
- A workflow the codebase needs that you discover through competitor analysis

### Step 4: Write findings to RESEARCH.md
Append findings in this format:

```
---

## YYYY-MM-DD HH:MM — Topic Name

**Research topic:** Name
**Sources consulted:** [list URLs]

### Key Findings
[detailed findings organized by subtopic]

### Relevance to WealthForge
[what this means for the project — strategic positioning, competitive threats, feature gaps]

### Potential Components to Build
[if applicable, high-level component ideas — not code, just concepts]

### New Topics Discovered
[list new [⏳] items added to the agenda from this session]
```

### Step 5: Update AGENDA.md
- Mark the researched topic as [✅]
- Add any new [⏳] topics discovered during research
- Update the status line to track progress (e.g., "5 of 16 complete: ...")

### Step 6: Report
The system auto-delivers your final response. Put the primary findings in the response — no need to use `send_message`. A brief summary works:
- What you researched
- Top 1-2 findings
- How many new topics were discovered
- What's next in the queue

## Key Lessons Learned

### Schedule format matters
Use proper cron syntax (`*/15 * * * *`) not natural language ("every 15 minutes"). Natural language may schedule as "once" inadvertently.

### AGENDA.md is the ONLY state
No cross-session memory. Each run reads AGENDA + RESEARCH from disk. If the agenda isn't updated, the next run will repeat the same topic.

### Each run must be self-contained
Fresh sessions have no concept of "done before." The cron prompt must include all instructions — it cannot reference skills or past context.

### Deliver summaries
The system auto-delivers. Put the primary content in your final response. If there's genuinely nothing new (shouldn't happen with proper agenda management), respond with exactly "[SILENT]" to suppress delivery.

### Topic size matters
Each topic should be completable in ~10-15 minutes of web research. Too broad = partial work. Too narrow = overhead dominates. A "Full platform analysis" is about right for a major competitor.

### Research is append-only
RESEARCH.md should only grow. Never modify past entries. If you discover new info about a topic already marked [✅], add it as a follow-up section, don't edit the old one.

## Avoiding Topic Exhaustion

The agenda self-expands naturally via Step 3. When a major domain (e.g., Competitors) runs out of top-level items, there should be enough subtopics in Portfolio Management, Tax, Operations, etc. to keep going. If a run produces zero new topics, the research is likely getting shallow — look harder at regulatory filings, academic papers, and deep-dive technical documentation rather than just product pages.
