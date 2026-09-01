# WealthForge Deep Research Methodology

## Workflow Pattern (Cron-Driven, Autonomous)

This document captures the standard operating procedure for WealthForge competitive/industry deep research sessions, which run as autonomous cron jobs with no user present.

### Step-by-Step Process

1. **Read the Agenda** — Open `AGENDA.md` to find the next unresolved topic ([⏳]). Read both AGENDA.md and RESEARCH.md to understand what's been covered and avoid duplication.

2. **Select the Right Topic** — Choose a well-defined, impactful topic. Prefer topics with good discoverability (competitor features, regulatory requirements, specific technical workflows) over vague topics. If discovering a deep sub-topic during research, consider making it the main research focus when it has enough substance.

3. **Deep Research (10-20+ sources)** — Use `web_search` with multiple search angles per topic. Follow up with `web_extract` on actual product pages, white papers, documentation, and news sources. Key pattern: 3 parallel initial searches → extract promising results → 2-3 follow-up searches for gaps → extract deeper sources.

4. **Organize Findings** — Structure into:
   - Architecture/approach taxonomy (identify 3-5 distinct patterns)
   - Performance benchmarks and metrics (with sources)
   - Competitive comparison (how each platform implements)
   - Key insights and unexpected findings

5. **Assess WealthForge Relevance** — Always include a "Relevance to WealthForge" section that:
   - Audits existing codebase capabilities (look at actual agent files in `projects/wealthforge-ai-local/backend/app/agents/`)
   - Identifies gaps between current and needed functionality
   - Proposes build-vs-partner decision framework
   - Quantifies effort estimates when possible

6. **Identify New Research Topics** — While researching, actively look for:
   - Competitor features you didn't know about
   - Regulatory rules that need separate research
   - Adjacent domains discovered through competitor analysis
   - Workflow patterns the codebase needs
   - These become new [⏳] items in AGENDA.md

7. **Write to RESEARCH.md** — Append safely using one of these methods (never write_file after partial read):
   - **Python append (preferred):** Use `execute_code` with `with open(file, 'a') as f: f.write(content)` using a raw string `r'''...'''` for the content.
   - **Shell heredoc (reliable fallback):** `cat >> /path/to/RESEARCH.md << 'HEREDOC_END'` — quoted delimiter prevents shell expansion.
   - **Temp-file + cat (last resort):** Write temp file, then `cat tmp >> RESEARCH.md`, clean up.

   **ONE FORMAT** for the written output — the cron job prompt now enforces a comprehensive 12-section template. Use this structure for ALL WealthForge research entries:

   **12-Section Template (current standard — supersedes all legacy formats):**
   Every entry MUST cover ALL 12 sections, in this order:

   ```
   1. STRATEGY & CONTEXT (Industry Analysis) — Full industry picture, players, trends, sources
   2. THE PROBLEM (Plain English) — A real human situation with concrete numbers
   3. COMPETITIVE LANDSCAPE — What other platforms do/fail to do. Name specific competitors.
   4. ADVISOR & CLIENT SENTIMENT — What advisors and clients say. Forums, Reddit, quotes.
   5. WHAT WEALTHFORGE HAS / IS MISSING — Codebase audit with specific tool names
   6. BUILD SPEC — Data inputs, core logic, pseudocode, output, edge cases
   7. UI/UX & VISUALIZATION — What it looks like, colors, interaction, advisor vs. client view
   8. REGULATORY & GUARDRAIDS — SEC, FINRA, IRS rules. Specific regulation numbers.
   9. ARCHITECTURAL BLUEPRINT — Agents, DB tables, API endpoints, data flow
   10. RED TEAMING — Failure modes with mitigations (5-7 minimum)
   11. KEY SOURCES — 10-15+ sources with URLs
   12. NEW TOPICS DISCOVERED — 3-6 new rabbit holes for the agenda
   ```

   The 12-section format expanded the original dual-format (2 sections → 12 sections) to add competitive landscape, advisor/client sentiment, UI/UX, regulatory, architectural blueprint, red teaming, sources, and new topics — sections that were missing from the earlier format.

   **Legacy formats (still found in RESEARCH.md but no longer used for new entries):**
   - Format A — Plain-English User-Facing Research (old standard, pre-2026-05-16)
   - Format B — Competitive/Industry Deep Research (old standard, pre-2026-05-16)
   - Dual Format (STRATEGY & CONTEXT + BUILDABLE SPEC) — (standard from 2026-05-16 to ~2026-05-15)
   
   New entries use the 12-section template above. Old entries can remain in their original format.

8. **Write to research_outcomes/** — Append to the project's knowledge base at `knowledge_base/research_outcomes/` using the 12-section template (see step 7). Name the file with a clear topic prefix and date: `research_NOVEL-13_topic_name.md`.

   For cron-job research runs, the output file is the primary artifact. Use `write_file` to create it — it's a new file each time, not an append to an existing one (unlike the old RESEARCH.md pattern).

   **Output file naming convention:** `research_{PREFIX-NUM}_{topic-slug}.md`
   - Prefix: ADD (missing workflow), FIX (core fix), NOVEL (differentiator), SKILL (skill improvement)
   - Place in: `knowledge_base/research_outcomes/`

9. **Update Research_and_Roadmap.md** — If the project uses Research_and_Roadmap.md instead of RESEARCH.md, update the status of the researched topic. Mark `[⏳]` → `[RESEARCHED]` and link to the research_outcomes/ file.

### Pitfalls

- **RESEARCH.md safety**: NEVER use `write_file` after partial `read_file` — the warning is advisory, not blocking; the write truncates regardless. Always append, never overwrite.

- **AGENDA.md pipe prefix trap**: File has inconsistent prefixes (`|-`, `||-`, `|`). Always read 5 surrounding lines before patching.

- **Patch fallback chain**: When patch fails (duplicate matches, escape drift):
  1. Add more surrounding context lines to disambiguate.
  2. Use `sed -i` with pattern addressing: `sed -i '/PATTERN/s/OLD/NEW/'` or `sed -i 'LINENUMBERc\\\\TEXT'`.
  3. Use Python `writelines()` via execute_code for complex multi-line changes.

- **Duplicate topic entries**: Same topic may appear in multiple agenda sections. Find all with `grep -n`. Consolidate duplicates into single [✅] entry and remove/mark extras.

- **Cron context**: User cannot clarify. Make reasonable decisions autonomously. Never ask questions.

- **Ident-XX topics may already be complete in RESEARCH.md**: When the next [⏳] item is an identifiability topic (ident-11, ident-12, etc.), check `knowledge_base/research_outcomes/RESEARCH.md` first. If the exact topic already has a comprehensive entry there, don’t append duplicate research. Instead: mark AGENDA.md [✅] with a 2-line completion summary, note verified sub-topics, and advance RUN_COUNTER.md. Only generate new research if RESEARCH.md is missing or the prior entry is materially incomplete for the current focus.
