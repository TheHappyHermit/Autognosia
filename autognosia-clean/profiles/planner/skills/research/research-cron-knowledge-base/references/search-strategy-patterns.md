# Search Strategy Patterns for Deep Research

This reference documents effective search workflows discovered through practice. Use these patterns when the standard single-topic search isn't enough.

## Multi-Phase Parallel Search Pattern

### When to Use
- Researching a complex competitor or topic with multiple dimensions (company profile, product features, strategic context)
- Any research task where information spans corporate, product, and industry contexts
- Topics where no single search will capture the full picture

### Pattern Overview

```
Phase 1: Parallel Discovery (3-5 simultaneous searches)
  ↓
Phase 2: Deep Extraction (extract top 3-4 results)
  ↓
Phase 3: Targeted Drill-Down (2-3 specialized searches)
  ↓
Phase 4: Synthesis & Write
```

### Phase 1: Parallel Discovery

Run 3-5 `web_search` calls simultaneously, each targeting a different aspect:

| Search Slot | Target | Example Query |
|-------------|--------|---------------|
| 1 | Company profile + market position | `"[company] wealth management platform [year] [strategy]"` |
| 2 | Product/feature deep dive | `"[company] platform features [product name] [year]"` |
| 3 | Strategic moves | `"[company] acquisition OR partnership OR strategy [year]"` |
| 4 | AI / innovation | `"[company] AI OR intelligence OR innovation [year]"` |
| 5 | Financial/market data | `"[company] revenue AUM employees [year]"` |

**Why parallel?** Each search call is independent and takes full wall-clock time. Running them sequentially wastes 3-5x the time. The system runs them in parallel because you declared them in the same `<invoke>` block — take advantage of this.

### Phase 2: Deep Extraction

From the Phase 1 results, pick the 3-4 most information-dense URLs and extract them with `web_extract`.

Pick preferentially:
- **Official press releases** (newsroom.company.com) — contain quarterly update details, feature launches, strategic statements
- **In-depth interviews / profiles** (wealthadvisor.com, riabiz.com) — contain strategy quotes, competitive positioning, future roadmaps
- **Product pages** (company.com/products) — contain feature listings not found in marketing

Avoid (unless nothing else exists):
- Aggregator pages (g2.com, capterra.com) — too thin
- Wikipedia — good for facts, bad for current strategy

**Example from Envestnet research:**
Phase 1 produced press releases, a strategic roadmap page, an interview with head of platform strategy, and analyst coverage. Extracting those 4 pages (Q1 2026 release, Q4 2025 release, 2025-2026 roadmap, and the WealthAdvisor interview) yielded **80% of all usable content** in the final write-up.

### Phase 3: Targeted Drill-Down

Based on what Phase 2 reveals, do 2-3 more targeted searches on specific topics you discovered:

| Trigger | Drill-Down Query |
|---------|-----------------|
| A specific product or feature name mentioned | `"[company] [specific feature name]"` |
| A partnership or integration mentioned | `"[company] [partner name] partnership"` |
| A strategic claim you want to verify | `"[company] [claim topic] [year]"` |
| A competitor comparison mentioned | `"[company] vs [competitor]"` |

**Example from Envestnet research:**
Phase 2 revealed "Insights AI," "Interval Funds," and "BillFin." Phase 3 searched: `Envestnet "Insights AI" agentic architecture`, `Envestnet interval funds UMA`, `Envestnet BillFin billing RIAs`. These yields were essential for the AI architecture comparison and the private markets strategy sections.

### Phase 4: Synthesis

By now, you should have enough to write the full research entry. If a critical gap remains, do one more targeted search. Otherwise, synthesize.

## Sub-Topic Sweep Pattern

### When to Use
- A sub-topic listed in the agenda was already fully covered by a broader research session
- You realize during research that you've already answered a separate agenda item

### How to Handle
If during a research deep-dive you naturally cover all the material for a separate [⏳] sub-topic (e.g., researching a full company analysis covers an ecosystem subtopic), mark that sub-topic as [✅] too:

1. Note in your findings: "The [sub-topic name] agenda item is fully covered by this analysis."
2. Update AGENDA.md: change that sub-topic from [⏳] to [✅]
3. Reference the coverage in your write-up's "New Topics Discovered" section

**Example:** The `automated-deep-research` skill's SKILL.md already had a "bonus completer" concept, but didn't explicitly describe this pattern. During the Envestnet full analysis, the "Envestnet ecosystem strategy (Bain Capital era)" sub-topic was naturally covered — the Bain acquisition, Yodlee divestiture, $1B R&D plan, and Adaptive WealthTech rebranding were all documented in the main write-up. The sub-topic was marked [✅] as a bonus.

This reduces the agenda faster and avoids redundant future work.

## File Size Growth Awareness

### Problem
Research accumulator files grow over time. A multi-week research engine can produce files of 100KB-200KB+. Reading and writing these files carries risk:
- `read_file` with offset/limit gives partial view — reconstructing from partial reads causes truncation
- `write_file` overwrites the entire file — if you only saw a partial read, you'll truncate
- Shell `cat >>` append is the safest approach but requires careful escaping

### Best Practices
1. **Track file size each run.** After writing, check with `wc -c` and compare to the previous run's size. A file that barely grew (stayed same or shrank) indicates a write problem.
2. **Prefer shell append** (`cat >> /path/file.md << 'HEREDOC'`) for accumulator files over 50KB. This avoids the risk of `write_file` overwriting with a partial read. Use quoted heredoc delimiters to prevent shell expansion of `$` signs in content.
3. **Don't re-read what you already wrote.** If you just appended content, you know what was there. Trust the append result — don't re-read to "verify" unless the write command returned an error.
4. **Anchor patches at known-unique markers.** When using `patch` to update AGENDA.md or other files, anchor your old_string in content you've seen recently (the top or bottom of the file), not content that may have shifted due to prior patches in the same session.
