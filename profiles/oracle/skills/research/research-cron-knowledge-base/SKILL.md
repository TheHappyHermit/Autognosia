---
name: research-cron-knowledge-base
description: Set up and manage recurring cron-based research that accumulates findings in a knowledge base over time. Each run picks the next un-researched topic from an agenda, deeply researches it, writes findings to a growing RESEARCH.md, updates progress, and delivers a summary.
tags: []
# formerly related_skills: ['automated-deep-research'] — now absorbed into this umbrella
category: research
---

# Research Cron Knowledge Base

Pattern for running recurring deep-research cron jobs that build a cumulative knowledge base over days/weeks. Each run is a fresh session that reads its own state from files on disk, eliminating the need for cross-session memory.

## When to Use

- You need to research a large domain (competitors, regulations, academic topics) over weeks
- Each research session should be independent (no conversational memory between runs)
- Progress must survive restarts, interruptions, and crashes
- The output should accumulate in a searchable, readable knowledge base
- You want a Telegram/Discord/Slack summary after each run

Do NOT use this for:
- One-shot research questions (just use web_search directly)
- Anything that needs code changes or execution (this is research-only)
- Tasks where a single deep dive suffices

## Dual-Stream Alternation (WealthForge Extension)

Some projects maintain TWO parallel research streams that alternate between runs. The WealthForge project uses this pattern:

```
EVEN runs (run_count % 2 == 0):    Employee role / cross-role deep-dive → EMPLOYEE-ROLES-RESEARCH.md
ODD runs  (run_count % 2 == 1):    Feature/topic deep-dive → RESEARCH.md
```

**State tracking** uses a counter file at `~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md`. Real production format includes a rich description of the last completed run:

```markdown
run_count: 108
last_stream: Odd-numbered run — feature research stream. Full comprehensive 12-section deep-dive: "Topic Name — Summary of findings". Key findings: (1) finding one. (2) finding two. ...
Status: COMPLETED
```

When updating after a research run:
1. Read the existing file to get `run_count`
2. Increment `run_count` by 1
3. Overwrite `last_stream` with a new multi-line description including: run parity, stream type, topic title, brief methodology summary, top 5-10 key findings in parenthetical format
4. Always end with `Status: COMPLETED` on the final line
5. Keep the description useful enough that someone skimming RUN_COUNTER.md can see what was accomplished each run without opening RESEARCH.md

When using dual-stream alternation:
- Read RUN_COUNTER.md at the START of every run to determine which stream
- After completing research, increment run_count by 1 and update last_stream
- Start with run_count=0 if file doesn't exist (even = employee role run first)
- NEVER skip a stream — alternate reliably between the two types
- Each stream has its own accumulator file (EMPLOYEE-ROLES-RESEARCH.md for roles, RESEARCH.md for features)
- Each stream has its own research format (see `wealthforge-employee-role-research` and `wealthforge-research-format` skills)

**Post-role-completion transition (Updated May 18, 2026 — confirmed all 26 individual + 6 XR = 32 total roles ✅):** All 26 individual employee roles AND all 6 XR cross-role items (XR-01 through XR-06) are ✅ completed as of Run 132. The accumulator file EMPLOYEE-ROLES-RESEARCH.md stands at 23,048 lines of comprehensive research covering every role with full daily/hourly task breakdowns, software inventories, widget designs, and automation opportunities. The remaining [⏳] items under the employee-role section are exclusively narrow sub-topics that consistently fail the marginal-value test — they cannot sustain a 2000+ word research entry with 10+ sources. **The employee-role research stream is fully exhausted.**

**Updated decision rule — feature stream is now the default for ALL runs:**

All employee roles are ✅ completed as of Run 132 (May 18, 2026). At each even-numbered run (formerly the employee role stream):

1. **Default to feature research stream** — Skip the employee-role section entirely. The feature format is the sole active research format.

2. **Exception — new major role discovery:** If a new top-level role appears (a `#### 🔴 <ROLE-CODE>: <Role Name> ⏳` entry added to AGENDA.md after May 2026), run that role's 9-section deep-dive using the employee-role stream slot. After completion, return to defaulting to feature stream.

3. **Exception — high-value cross-role subtopic:** If a subtopic sustains 2000+ words, 10+ sources, and 5+ dimensions, run it in the even slot using the 12-section feature research format. Do NOT use this to force narrow topics through.

**Run alternation practical logic — how to determine what to do on startup:**

1. Read `~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md` to get `run_count`
2. Determine parity: `run_count % 2 == 0` means even-numbered, `run_count % 2 == 1` means odd-numbered
3. **Both streams now resolve to feature research on the topic sections of AGENDA.md.** The employee-role stream no longer has active roles to research.
4. The `wealthforge-employee-role-research` skill's 9-section format remains available if a new role is ever discovered.
5. After completing research, increment `run_count` by 1 and write a rich `last_stream` description (see "State tracking" above for format).

**Research format for subtopics (when they pass the marginal-value test):** Role subtopics do NOT use the full 9-section employee role format (that is for complete roles). Use the format appropriate to the subtopic's content type:
- **Data model / architecture subtopics** (like mo-05-2, XR-01 subtopics): Use the cross-domain canonical data model format (see `references/canonical-data-model-research-format.md`)
- **Feature subtopics** (like spec-02-1, bo-03-2): Use the 12-section feature research format (see `wealthforge-research-format` skill)
- **Workflow / process subtopics** (like xr-02-1, mo-01-7): Use the cross-role workflow research format (7 sections, see `wealthforge-employee-role-research` skill)
- **Career / capacity subtopics** (like fa-03-6, bo-04-4): Use a condensed 5-section format (role overview, compensation benchmarks, certification roadmap, staffing model, sources)
When in doubt, default to the 12-section feature format — it is the most robust and covers the most ground.

## Architecture

```
files/AGENDA.md  ← state tracker: what's been researched, what's next
files/RESEARCH.md  ← accumulation: every finding appended with timestamp
cron job (every 15-60 min) → reads AGENDA → researches next topic → writes to RESEARCH.md → updates AGENDA → delivers summary
```

### ONE-JOB RULE

**Use exactly one research cron job per project.** Multiple overlapping cron jobs (deep research, backfill, research + etc.) cause write-path drift and split output across files. The user-visible symptom is checked-off agenda items with no corresponding entry in the canonical `RESEARCH.md` because a different cron wrote an abbreviated summary elsewhere.

When you see multiple research cron jobs for the same project:
1. **Consolidate them into one cron.**
2. **Delete the extras.**
3. Set the surviving cron's prompt path to one canonical accumulator only, usually under the `knowledge_base/research_outcomes/` directory rather than the legacy project root.
4. Verify the cron's output sinks back to the same target across subsequent runs before declaring success.

### Deduplication or recovery

When the canonical output is missing entries that were checked off in `AGENDA.md`:
1. Read the checked-off agenda items.
2. Search **only** cron output directories for those topic IDs.
3. Append the found content to the canonical `RESEARCH.md` if it is not already present there.
4. Do **not** move or rewrite `USED_RESEARCH.md`.

### Prevent append-target drift

A long-lived research cron prompt can drift over time and start pointing at auxiliary files like `suite-research-append.md`. After any prompt/state/chain change for a research cron, immediately grep both the live prompt and recent cron output for alternate target paths. If drift is found, redirect back to the canonical file and recreate the cron with a single authoritative append path encoded in the prompt. See recovery for reconstructing RESEARCH.md below.

The AGENDA.md is the source of truth for state. Each cron run:
1. Opens AGENDA.md to find the next `[⏳]` topic — **At current scale (680KB+), use grep via execute_code for navigation** (see "AGENDA.md large-file handling" pitfall below for technique)
2. Opens RESEARCH.md to avoid duplicating prior work
3. Deep-researches the topic
4. Appends findings to RESEARCH.md
5. Flips the topic from `[⏳]` to `[✅]` in AGENDA.md — and adds any new [⏳] subtopics discovered (agenda should grow faster than it shrinks)
6. Delivers summary to the configured home channel (auto-delivery via cron)

## Setup Steps

### 1. Create the knowledge base directory

```bash
mkdir -p ~/Documents/Hermes-Vault/<project>-roadmap/
```

### 2. Create AGENDA.md

The agenda file is the state tracker. Structure with a status line tracking progress:

```markdown
# <Project> Research Agenda

**Last Updated:** YYYY-MM-DD HH:MM
**Current Section:** <section-name>
**Status:** Phase N — <description> (N of M complete: topic1, topic2, ...)

## Status Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked

## <Phase or Section>

### Competitors
- [⏳] **Topic Name** — Brief description
- [⏳] **Another Topic** — Brief description (discovered via <source> research)
```

Each topic should be one session's worth of research (not too broad, not too narrow). Include "(discovered via <source>)" for topics added organically.

### 3. Create RESEARCH.md

The accumulation file. Starts with a Phase 1 summary, grows from there:

```markdown
# <Project> Research — Accumulated Findings

This file grows over time with every research run. Each entry is dated and topic-labeled.

---

## YYYY-MM-DD HH:MM — Phase 1: Initial Scan

**Completed the initial scan of:**
- <project name> — brief summary of what was found
- <second repo> — brief summary

**Key finding:** [summary paragraph]

---

## <cron runs will append below>
```

### 4. Create the cron job

```bash
# Example creation command:
hermes cron create \
  --name "<Project> Deep Research" \
  --schedule "*/15 * * * *" \
  --prompt "$(cat ~/prompts/research-prompt.md)" \
  --toolsets terminal,file,web
```

Or use the cronjob tool with action='create'.

### Cron Prompt Structure

The prompt must be fully self-contained since each run is a fresh session. Key elements to include:

1. **Opening:** Frame the task as `You are a deep research agent for <Project>...`
2. **Delivery notice:** Tell the agent it's a cron job (no user present, can't ask questions, final response is auto-delivered)
3. **Step 1:** Read AGENDA.md to find next [⏳] topic — **At current scale (680KB+), use grep via execute_code rather than read_file**, which truncates. See "AGENDA.md large-file handling" pitfall below for the grep navigation technique.
4. **Step 2:** Read RESEARCH.md to understand what's been covered
5. **Step 3:** Deep research — web_search + web_extract on competitor sites, docs, academic sources, regulatory pages
6. **Step 4:** Expand the agenda dynamically — while researching, actively add NEW [⏳] topics discovered. The agenda should grow faster than it shrinks.
7. **Step 5:** Write findings to RESEARCH.md with timestamp, sources, key findings, relevance, potential components, and new topics discovered
8. **Step 6:** Update AGENDA.md — flip researched topic to [✅], add new [⏳] topics, update status line
9. **Step 7:** Deliver summary — system auto-delivers; put content in final response. Use `[SILENT]` only if there's genuinely nothing new.

## Repository Windows and Accumulator File Selection

### WEALTHFORGE RESEARCH WORKFLOW

The WealthForge project's active research accumulator is:

```
~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
```

roadmap/RESEARCH.md` is an additional high-signal artifact but is not the sole canonical sink. backlog/RESEARCH.md is not a write target. **Do not treat `research-outcomes/` as write-only.**

**Default append target:** `knowledge_base/research_outcomes/RESEARCH.md` unless a run or agenda explicitly directs elsewhere. When uncertain, consult both accumulators and verify by:
- Topic ID headings
- Section date range
- `wc -l` and `wc -c` before any write
- Read all appended content before updating any lookup tables that will be used downstream

### Choosing the correct accumulator

| Signal | Result |
|--------|--------|
| `grep` for the topic ID only returns matches in `knowledge_base/research_outcomes/RESEARCH.md` | Append there |
| Topic appears first under `AGENDA.md` in the same-run section as a feature subtopic | Append to `knowledge_base/research_outcomes/RESEARCH.md` |
| Topic is a legacy employee-role / older domain run | Prefer `wealthforge-roadmap/RESEARCH.md` |
| Both files contain the same topic | Treat `knowledge_base/research_outcomes/RESEARCH.md` as authoritative |

**Do not append the same entry to both files.** Pick one, record the path in RUN_COUNTER.md, and verify with `grep -c` on each file.

### Recovery via `.bak` files

If the chosen accumulator is damaged during this session:
1. Look for `*.bak` in the same directory.
2. If no usable `.bak` exists, check trusted local copies (`Knowledge Base`). Verify by topic ID headings, section date range, and file size.
3. Prefer restoring a known-intact canonical copy over re-running writes.
4. Whenever restoring from an alternate source, preserve the existing append target and writer contract (e.g. `append_research.py`), and only replace the corrupted corpus, not the mechanism.
5. For fast restore of `RESEARCH.md` from an intact Obsidian/Vault copy, use `scripts/canonical_research_restorer.py`.
6. Re-append any missing checked-off entries only after the canonical file has been restored; add them to the end of the canonical file and avoid writing to `USED_RESEARCH.md`.
7. If necessary, cross-reference checks items from `AGENDA.md` and `RESEARCH.md` before writing; continue until there is 1:1 correspondence between checked-off topics and `## YYYY-MM-DD` sections.

## Append-only writer contract

A durable way to prevent overwrite bugs is to make the writer config a single exclusive append script under the cron output directory, for example:

```
~/.hermes/cron/output/<job-id>/append_research.py
```

The cron prompt should instruct the agent to use ONLY this script for writes to the canonical `RESEARCH.md`, never `write_file` or shell `>` or repos that git-commit the file. After any prompt change, verify the surviving job's prompt still points only to the canonical append path.

## Pitfalls

1. **Use actual newlines (not `\\n` escapes) when patching AGENDA.md with multi-line items** — When inserting multiple new `[⏳]` items via `patch`, the `new_string` must use ACTUAL line breaks between items, not `\\n` escape sequences. The `patch` tool treats `\\n` as literal characters, not newlines, causing all items to be concatenated on a single line separated by visible `\\n` text. Write the `new_string` with real line breaks (press Enter between items in the parameter value) — each line should start with the correct list marker (e.g., `- [⏳]`) on its own line. After inserting multi-line content, always verify the patched region with `read_file` to confirm items are on separate lines, not joined by literal `\\n`.

1. **AGENDA.md large-file handling (100K+ chars → 684KB+ at current scale)** — When AGENDA.md grows past 400KB (~1800+ lines as of May 2026), `read_file` without offset/limit fails with a safety-limit error, and even paginated reads are slow. Use these techniques:

**Preferred: `grep -n` via execute_code for targeted navigation** — Rather than reading sections of the file to find what you need, use `execute_code` with `subprocess.run` to grep for specific patterns:
```python
import subprocess
result = subprocess.run(['grep', '-n', '⏳', '/path/to/AGENDA.md'], capture_output=True, text=True)
print(result.stdout)  # See line numbers for all pending topics
```
This returns every matching line with its line number in <1 second regardless of file size. Combine with other grep patterns:
- Find topic by partial name: `grep -n "specific topic phrase" AGENDA.md`
- Count occurrences before patching: `grep -c "your anchor text" AGENDA.md` (return 0/1/>1)
- Filter for top-level topics (not deep subtopics): `grep -Pn '^[^|]*- ⏳' AGENDA.md`
- Extract the region around a match for context: `grep -n -B2 -A5 "target line" AGENDA.md`

**Also acceptable: `search_files` tool for line-level content verification** — The `search_files` tool works on AGENDA.md directly and doesn't require `execute_code` or Python. Use it for targeted verification after patches:
- Check for residue after a long-line patch: `search_files(pattern="<unique residue fragment>", path=AGENDA.md, output_mode="content")`
- Verify a patch was applied: `search_files(pattern="<unique string from new_string>", path=AGENDA.md, output_mode="content")`
- Count occurrences: `search_files(pattern="<phrase>", path=AGENDA.md, output_mode="count")`
The advantage over grep: no Python scripting needed, works as a single tool call. The disadvantage: output doesn't show line numbers (shows content with surrounding file context lines). Use grep when you need line numbers for a follow-up `read_file(offset=...)` call.

   **Fallback: read_file with offset/limit** works for reading specific line ranges once you know the line numbers from grep. Patch operations work fine on large files. The status line at the top is the most frequently updated area (topic count, date), so it often needs reads in the first 10-15 lines even when the file is 1800+ lines long.

**Match pipe prefix format when adding to AGENDA.md** — AGENDA.md uses inconsistent pipe prefixes depending on which section you're editing. Common patterns observed in production (WealthForge AGENDA.md, 333 lines):

| Pattern | Where Found | Example |
|---------|-------------|---------|
| `- [⏳]` | Competitors section, Phase 2 headings | `- [⏳] **Betterment** — Full platform analysis` |
| `|- [⏳]` | Portfolio Management, Tax, Planning Engine & AI | `|- [⏳] **Black-Litterman model** — Academic deep dive` |
| `||- [⏳]` | Strategic Lessons, Trading & Execution sections | `||- [⏳] **Bain Capital investment thesis** — Understanding...` |
| `|    |- [⏳]` | Nested under existing pipe-prefix items | `|    |- [⏳] Sub-topic nested beneath...` |

**Always read the destination section first to see the exact prefix format used** by viewing 3-5 items above and below your insertion point. Patching with the wrong prefix count (e.g., adding `-` items to a `||-` section, or `|-` items to an un-prefixed section) creates misaligned markdown that compounds with each edit. If items at your destination use mixed prefixes (possible in evolved files), use the most common pattern among nearby items. Verify the inserted block immediately with `read_file` — if items are on the wrong column, patch again with the corrected prefix.

2. **Avoid creating duplicate section headers** — When using `patch` to insert a completed `[✅]` item, do NOT include a section header like `### Strategic Lessons` in your `new_string` if that header already exists elsewhere in AGENDA.md. This creates duplicate sections — one with the new item and one with the old items — breaking the file structure. Instead, target your patch to insert AFTER the existing section header, or BEFORE the first item under it. Use `search_files` to check whether a section header already exists before patching.

3. **Never embed line numbers from read_file into patch strings** — `read_file` displays line numbers at the start of each line (`40|     content`). If you copy-paste `40|     content` into a patch `old_string`, those line numbers become literal file content. Always use ACTUAL file content (without the line number prefix) in patch strings. Re-read the affected area with `read_file(offset=..., limit=...)` to get fresh, accurate content before constructing a patch. If you accidentally embed line numbers, fix with a targeted `patch` that strips them.

4. **Verify AGENDA.md structure after every patch** — After each `patch` call on AGENDA.md, do a quick verification using `read_file` on the patched region (5 lines before and after) to confirm no artifacts. For PATCHES ON VERY LONG SINGLE LINES (1800+ chars), `read_file` truncates and hides residue — also run `search_files(pattern="<expected-residue-from-original-line>", path=AGENDA.md, output_mode="count")` to check for invisible leftovers. Fix immediately before moving to the next step. Small formatting errors compound over successive patches.

1. **Schedule format matters** — Use proper cron syntax (`*/15 * * * *`) not natural language (`"every 15 minutes"`) to ensure the job recurs forever. Natural language may schedule as "once" inadvertently.

5. **Keep topics session-sized** — Each run should be completable in ~10-15 min with web tools. Too broad = partial work. Too narrow = overhead dominates. A "Full platform analysis" of a major competitor is about right.

6. **`web_extract` consistently fails on financial content domains** — Kitces.com, Mezzi, TakeHomeTax, SmartFinance, Fidelity Learning Center, and other high-value financial content sites reliably return `"Tavily extract failed: Client error '432'"` from `web_extract`. Do NOT waste parallel extraction slots on these domains. Instead:
   - **Primary workaround:** Use iterative `web_search` with increasingly specific queries. The search result snippets and descriptions often contain sufficient information for competitive intelligence. Vary query angles: neutral factual → comparison → regulatory/sentiment.
   - **Secondary workaround:** Use `web_extract` on mirror/syndication sources. Some Kitces content is syndicated on Wealth Strategies Journal, Bogleheads, or Kitces member-only mirrors that may extract successfully.
   - **Tertiary fallback (high-effort):** Use `browser_navigate` + `browser_snapshot(full=True)` for critical content you absolutely need. The browser tool has a different HTTP stack and may succeed where Tavily fails. Be judicious — browser is slow and expensive.
   - **Cross-referencing:** When direct extraction fails, synthesize facts across 3+ search results (different sources, dates, and angles). Triangulate numbers, dates, and names. Note in the research entry that facts were synthesized from search snippets (not directly extracted).
   - **Do NOT retry `web_extract` more than 2 times on the same URL** during a session. The failure is deterministic for these domains and retries waste the parallel extraction slot.

   Known problematic domains (as of May 2026): kitces.com, mezzi.com, takehometax.com, smartfinance.fyi, fidelity.com, investopedia.com (some pages), legalclarity.org, fintechpulselab.com (some), wealthtender.com, ustechautomations.com, sharper.tax, arthataxes.com, taxbriefinvestor.com, westmountfundamentals.com, taxspecialty.com, thearcalabs.com, unclekam.com, taxharvest.ai, byronrileycpa.com, acmemarkets.com, financestrategists.com

3. **AGENDA is the state** — Don't rely on the cron session's memory. The agenda file IS persistence. If the agenda isn't updated, the next run will repeat the same topic. Always update the status line with progress count.

4. **Agenda self-expansion is critical** — Every run MUST actively look for new subtopics. Without this, the agenda eventually runs dry and the research stops. The rule is: the agenda should grow faster than it shrinks. If a run produces zero new topics, research is getting shallow — dig deeper into regulatory filings, academic papers, and technical documentation rather than just marketing pages.

   **Section creation for new topics:** When discovered subtopics don't fit any existing agenda section (e.g., a new category like "Strategic Lessons" or "Compliance Workflows" emerges), create a new section header rather than forcing them into an ill-fitting existing section. Use the same `### heading` format as existing sections. This keeps the agenda organized as it organically grows.

5. **Don't use write_file for AGENDA.md — use patch** — AGENDA.md is a small, frequently-updated state tracker. The `patch` tool is safer than `write_file` because it changes only the targeted lines without risking overwrite of the rest of the file. Use one `patch` call per change (mark topic ✅, update status line count, add new topics).

   **Patch duplicate-match failure:** When the same topic name or phrase appears in multiple agenda sections (e.g., "BlackRock's SMA/UMA model portfolio strategy" may exist under both Portfolio Management and Strategic Lessons), `patch` will fail with "Found 2 matches for old_string." The fix: include surrounding lines (3-4 lines of context above and below the target) to make the match unique, and re-read the file first to ensure the full content is loaded. Alternatively, use `replace_all=True` when you genuinely want to replace every occurrence. Don't keep trying smaller unique snippets — add more context lines instead.

   **Patch escaping failure fallback: use execute_code with Python writelines()** — When `patch` fails due to special characters in the old_string/new_string (quotes, XML-like content such as `</old_string>`, HTML entities like `&lt;`, or backslash-escaped characters), fall back to `execute_code` with Python's `writelines()` to insert lines at specific positions.

**Specific pitfall: escape-drift on escaped double quotes (`\"`)** — When AGENDA.md contains content with real double-quote characters like "7 years or $1M", and you copy that into an `old_string` or `new_string` parameter, the string serialization may auto-escape them to `\"` before the fuzzy matcher runs. The matcher then searches for literal `\"` in the file — which does not exist because the file has plain `"`. The error message says "Escape-drift detected: old_string and new_string contain the literal sequence '\\\"' but the matched region of the file does not."

**Fix:** Supply the `old_string`/`new_string` with plain double quotes `"` (not escaped `\"`). Read the exact region from the file with `read_file`, highlight the lines in your response, and manually retype them with literal `"` characters in the patch call. Do NOT copy from markdown-rendered tool outputs that might have invisible quote transformations.

**Lighter-weight fallback: `sed -i` for simple line insertions.** When patch fails with escape-drift and you only need to insert one or a few new lines after a known line number (e.g., inserting a new `[⏳]` topic item), use `sed -i` via terminal instead of Python `writelines()`:

- **Append after a line:** `sed -i 'LINEa\NEW LINE CONTENT' /path/to/file`
- **Replace a line by number:** `sed -i 'LINENUMBERc\NEW LINE CONTENT' /path/to/file`

Example (inserting a new agenda item after line 249):
```bash
sed -i '249a\
|- [⏳] **New topic** — description' /path/to/AGENDA.md
```

**When to choose `sed -i` vs. Python `writelines()`:**
- Use `sed -i` when: inserting 1-5 simple lines, you know the exact line number to insert after, content doesn't contain complex escaping (quotes, em-dashes handled by quoting).
- Use Python `writelines()` when: inserting/reordering many lines, content has complex special characters, you need to find the insertion point by content search rather than line number.
- Note: `sed -i` with unicode characters (emoji ✅/⏳, em-dashes) works fine — just ensure your shell properly handles the byte sequence. Single quotes around the sed expression prevent shell interpretation of special characters.

**⚠️ CRITICAL: `sed -i` with escaped `\n` inserts literal backslash-n, not line breaks.** If your replacement text uses `\\n` to represent line breaks (e.g., `sed -i '78a\\n### New Section...\\n||- item'`), sed writes the literal two-character sequence `\n` into the file instead of breaking the line. This pollutes the file with visible `\n` text between items and drops the line count far below what it should be. **Use Python `writelines()` instead whenever you need to insert multiple real lines.** The `sed -i` approach is only safe for single-line insertions with no escaped sequences.

**Recovery from sed literal-\n pollution — use Python writelines() to surgically replace:**

```python
lines = open("/path/to/corrupted.md").readlines()
result = []
skip_next = False
for i, line in enumerate(lines):
    if i == corrupted_line_index:  # Find the \n-polluted line from read_file output
        result.extend([
            "\n",                                      # blank line before section
            "### Correct Section Header\n",            # proper multi-line replacement
            "||- [⏳] **Item 1** — Description\n",
            "||- [⏳] **Item 2** — Description\n",
        ])
    elif i == next_line_index and skip_condition:      # Skip merged artifact
        continue
    else:
        result.append(line)
with open("/path/to/corrupted.md", "w") as f:
    f.writelines(result)
```

**Detection:** After `sed -i`, `read_file` shows items that should be on separate lines ON ONE LINE with visible `\\n` text between them. The file's line count drops far below expected (e.g., 5 new items should add 5+ lines but the count barely changes). Verify immediately after every `sed -i` call on AGENDA.md.

   ```python
   from hermes_tools import execute_code

   lines = open("/path/to/AGENDA.md").readlines()
   # Find insertion point by searching for a nearby anchor line
   for i, line in enumerate(lines):
       if "anchor text from nearby line" in line:
           insert_pos = i + 1  # or i to insert before
           break
   # Insert new items (in reverse order to maintain sequence)
   new_items = ["- [⏳] **New topic** — description\\n"]
   for item in reversed(new_items):
       lines.insert(insert_pos, item)
   open("/path/to/AGENDA.md", "w").writelines(lines)
   ```

   This is particularly useful when inserting items that contain quotes, em-dashes, or special characters that confuse patch's fuzzy matching. Always verify the result with `read_file` after using this approach.

**⚠️ CRITICAL: Avoid inline `python3 << 'PYEOF'` heredocs for AGENDA.md scripts containing Unicode.** If your Python script contains Unicode emoji characters (✅ ⏳ → —) or other non-ASCII characters in multi-line string literals, the inline heredoc approach (`python3 << 'PYEOF'`) can fail with `SyntaxError: invalid character` because shell heredoc injection plus Python's multi-line string parsing creates encoding conflicts. The character is perfectly valid Python in a `.py` file but fails when injected via heredoc due to shell → Python encoding pipeline issues.

**Fix — always use the temp-file pattern for complex AGENDA.md edits:**

1. Write the Python script to a temp file with `write_file`:
   ```
   write_file(path="/tmp/update_agenda.py", content="...your full script...")
   ```

2. Execute it with `terminal`:
   ```
   terminal(command="python3 /tmp/update_agenda.py")
   ```

3. Verify with `read_file` on the affected region and clean up with `terminal(command="rm /tmp/update_agenda.py")`.

This works for any script complexity: Unicode characters, multi-line strings with embedded quotes, em-dashes, long regex patterns — everything that breaks in inline heredocs works cleanly from a file. The `write_file` tool escapes nothing and writes bytes exactly as provided.

   **Status line count math:** When adding N new [⏳] topics to the agenda, the denominator in the status line (e.g., "10 of 18") increases by N — even if the numerator also advances by 1. For example: completing 1 topic and adding 5 new ones changes "10 of 18" to "11 of 23" (not "11 of 19"). This keeps the count accurate.
   
   **Self-expanding denominator convention:** When the agenda is designed to grow faster than it shrinks (the intended pattern), the exact total is always unknowable. Use a tilde prefix in the denominator — e.g., "44 of ~170+" — to signal that the estimate is organic, not a fixed endpoint being tracked toward. Update the approximate total when new sections or topic clusters are added, not on every individual addition. The `+` suffix signals continuous expansion is expected.
   
   **Status line truncation at scale:** As the agenda grows past ~50 completed topics, the status line listing EVERY topic name becomes a multi-line monster (3-5KB, 5+ terminal lines) that is fragile to patch (special characters, quotes, em-dashes, nested markdown). When it exceeds ~200 chars, transition to a truncated format: just the count and section-level rollups. E.g., `"66 of ~240+ complete: Tax (18), Retirement (14), Portfolio (11), Competitors (10), Strategic (8), Estate (5)"`. This keeps the status line patchable and readable. When truncating, move the full list of completed topic names to a `### Recently Completed` or `## Completed Topics Inventory` section at the bottom of AGENDA.md as a chronicle.
   
   **Patching the status line at large scale:** When the status line has grown to 3-5KB+ with 60+ topic names, do NOT try to match the full line in `old_string`. Instead, target a short unique substring at the very beginning — e.g., match `"59 of ~225+"` and replace with `"60 of ~230+"`. The rest of the status line stays in place because `old_string` only needs to be unique. If the rest of the line also needs updating (e.g., adding a new topic name to the list), make a SECOND patch targeting a different unique substring within the line (e.g., just before the closing parenthesis), or append the new name at the end. Two short, targeted patches on the same line are safer than one massive patch with the entire status line content.

**Mid-line patch residue on 1800+ char single lines (NEW — distinct failure mode):** When AGENDA.md items run 1800+ characters on ONE physical line (common for [✅] entries that pack key findings into a summary), and you patch with an `old_string` that captures only a PORTION of that line (not reaching the line break), the fuzzy matcher replaces the matched substring but leaves any trailing text on the same line as visible residue. This is invisible in `read_file` because the tool truncates output at ~200 chars per line with `[truncated]`, so the residual tail never appears in verification. You only discover it via `grep` / `search_files` on the residue pattern.

**Detection pattern:** After any AGENDA.md patch targeting a long single-line entry, run:
```python
import subprocess
# Check for common residue patterns
result = subprocess.run(['grep', '-n', 'Exception-first', '/path/to/AGENDA.md'], capture_output=True, text=True)
print(result.stdout)
# If there are more occurrences than expected (e.g., 2 instead of 1), 
# one is the correct reference and the other is residue.
```

**Fix:** Find the exact residue text with `search_files`, then a targeted follow-up patch that removes it:
```python
patch(path='AGENDA.md',
      old_string='<exact residue text including line prefix>',
      new_string='',
      replace_all=False)
```

**Why this happens:** The original single line (e.g., `|- [⏳] inv-04-1: ...` spanning 2500+ chars) has content like `...Peer Benchmarking (CIO-8), Research Aggregation Feed...`. If `old_string` ends mid-word at `Peer Benchma`, the fuzzy matcher replaces everything from the match start through the `old_string` boundary but does NOT delete the remaining text on the same line after the match — it appends the replacement at the match point and the original line's tail `.rking (CIO-8)...` survives as visible markdown.

**Prevention:** When patching very long single lines in AGENDA.md, either:
1. Include the ENTIRE line as `old_string` (from `|-` through the final period and newline), or
2. After patching, verify with `search_files` looking for unique suffix patterns from the original line — not just `read_file` which truncates long lines.

**Patch side-effect verification — verify 5-10 lines above AND below every AGENDA.md insertion:** After any `patch` that inserts a new section or block of items into AGENDA.md (e.g., inserting a "### New Subtopics" section between two existing sections), the fuzzy matcher can alter adjacent lines. This is NOT caught by verifying the patched region alone — the damage is often 3-5 lines BELOW or ABOVE the insertion boundaries.

**Real example from Run 83 (2026-05-16):** An insertion between the `rsc-7` entry and the `Bernstein` section used a `|` pipe character as part of the match boundary. The fuzzy matcher consumed the `|` separator character that belonged to the Bernstein entry's line, stripping its description text. The patched region looked correct on first check, but the Bernstein line 3 rows down was silently truncated from a full description to just a bare entry name.

**Fix:** After EVERY AGENDA.md `patch`, read a window spanning 5-10 lines ABOVE the matched point through 5-10 lines BELOW the matched point. Scan for:
- Lines that lost their trailing description (content truncated mid-line)
- Lines that gained extra pipe or dash prefixes they shouldn't have
- Lines whose pipe prefix count changed (e.g., `||-` became `|-` or vice versa)
- Blank lines that appeared or disappeared between section headers
- Any line that differs from what you expected in that file region

The most common failure pattern: the old_string's trailing pipe `|` or newline character gets consumed by the insertion point, and the line immediately AFTER the insertion loses its leading characters. Fix immediately with a targeted follow-up patch restoring the truncated content. If the truncation affected a `[✅]` or `[⏳]` entry, read the original entry from a secondary source (session_search, web_search for the topic) to reconstruct the exact description text.

**Mid-line residue scan AFTER every AGENDA.md patch on long single-line entries:** When patching a long single-line entry (`1800+ chars` on one physical line), the fuzzy matcher can leave trailing residue after the replacement point. This residue is invisible to normal `read_file` verification because the line is truncated in display, but it remains in the file. Detect it with:

```bash
grep -F "<unique phrase from the ORIGINAL line's trailing section>" ~/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md
```

If that phrase appears more than once, one occurrence is likely leftover residue from an incomplete line replacement. Fix with a targeted follow-up patch that removes exactly the stray chunk.

**Detection rule of thumb:** After any AGENDA update, know how many `[✅]` and `[⏳]` lines matching that topic should exist. `grep -c` gives the count; anything above the expected count implies residue. Fix before moving on — the residue will cause future patches to match twice and break again.
   
   **AGENDA.md entry format convention:** Pending (`[⏳]`) entries are concise — a single line with topic name and brief description. When marking a topic as completed (`[✅]`), expand the entry inline to include key findings (funding, metrics, product details, strategic significance). The ✅ entry should be 4-8 lines long — enough to serve as a quick-reference summary without needing to open RESEARCH.md. New entries added as discoveries should follow the same concise `[⏳]` format as existing pending items. This keeps AGENDA.md usable as a progress dashboard at a glance.

   **Verification defaults for AGENDA.md (terminal is safer than read_file for large files):**
   - Use `terminal(command=\"grep -n 'TARGET' AGENDA.md\")` for positional checks before and after patches.
   - Use `terminal(command=\"sed -n 'START,ENDp' AGENDA.md\")` for compact line-range inspection after insertion.
   - Use `terminal(command=\"wc -l AGENDA.md\")` to detect merge artifacts or deleted lines after patches.
   - Only fall back to `read_file` after the above confirm the exact section looks correct, and avoid combinations like `read_file(offset=800, limit=5)` after dozens of write operations.
   
   **Distributing new topics across sections:** A single research session often yields subtopics that belong in different agenda categories (e.g., one session on Wealth.com generated items for Competitors, Planning Engine & AI, and Strategic Lessons). Distribute them to their appropriate sections rather than dumping them all in one place. This keeps the agenda organized as it grows. Only create a new section if the topic truly doesn't fit any existing header.

6. **Deliver via auto-delivery** — The system delivers the final response automatically. Do NOT use `send_message`. Put the primary content in the final message. Use `[SILENT]` (and nothing else) to suppress delivery if there's truly nothing to report.

7. **Never use `clarify` or `send_message` in cron context** — Cron jobs run with no user present. The `clarify` tool hangs indefinitely with no one to answer. The `send_message` tool is a no-op when auto-delivery is configured (and the final response IS the delivery). Stick to tools available in the cron's toolset (typically terminal, file, web). If you need to make a decision, make a reasonable default choice — don't try to ask.

12. **Cron-induced tracker file corruption: validate state before mutating** — A cron prompt that instructs the agent to "Update AGENDA.md: mark the topic `[✅]`..." can run wild and corrupt the tracker file when no verification gate exists. The cron may process items in bulk, loop, or overwrite structured state without reading the current state first. **Protection rules:**
    - **Cron prompts must NEVER include unconditional "mark all/multiple items as [✅]" instructions** without requiring the agent to first read the current state and verify each item individually.
    - **State verification before mutation:** Before flipping ANY item from `[⏳]` to `[✅]` in a tracker file, the cron must re-read that section of the tracker in the same session and confirm the item is still `[⏳]`. If the state cannot be confirmed, the cron must skip that item and report the discrepancy.
    - **Ticker/counter files are auxiliary, not authoritative:** If a cron maintains its own progress counter (e.g., `ticker = 1`), that counter can drift from the actual tracker file state. **The tracker file (AGENDA.md) is the sole source of truth for what remains pending.** Progress counts derived from ticker files without cross-checking AGENDA.md will be wrong.
    - **Never trust a self-reported final state:** If a cron reports "completed all items" or "processed N topics", verify against the tracker file using `grep -c '\[⏳\]'` and `grep -c '\[✅\]'` BEFORE reporting success. Self-reported completion without file verification is the most common avenue for silent corruption.
    - **Recovery:** If a tracker file is corrupted (contents drastically changed from expected state), immediately check for recent `.bak` files in the same directory. If a backup exists from before the corruption, restore it. If not, stop all related cron jobs, report the corruption to the user, and request manual intervention before any further automation writes to the file.

7. **Skill attachment is optional** — The prompt is self-contained. Attaching skills only adds token overhead. The cron job has terminal + file + web tools, which suffice for pure research.

8. **Research is append-only** — RESEARCH.md should only grow. Never modify past entries. If you discover new info about a topic already marked [✅], add it as a follow-up section, don't edit the old one.

9. **"New Topics Discovered" footer** — Every research entry in RESEARCH.md should conclude with a bullet list of what new topics were added to the agenda from that session. This helps reviewers and the next run understand the research's impact.

   **Section-tagging convention for New Topics:** Each discovered topic in the footer should include its destination agenda section in parentheses — e.g., `(added to Tax)` or `(added to Strategic Lessons)`. This serves as both documentation and instruction: it tells future sessions where the topic lives in the agenda. New topics should also be physically added to their correct section in AGENDA.md (not dumped in one place). If a topic doesn't fit any existing section, create a new `### Section Name` header for it.

### Safe RESEARCH.md appending: NEVER use write_file — Pre-write checklist required before EVERY accumulator file operation

**Before writing to RESEARCH.md (or any accumulator file), run this mental checklist:**
- [ ] Did I read the file WITHOUT offset/limit this session? (If not, I only have a fragment — write_file truncates.)
- [ ] Am I using `write_file` (overwrite) or an append method (`cat >>`, Python `open(f, 'a')`)?
- [ ] **If a saved full draft exists in `/tmp`, I should use it with append, not regenerate from partial context.**
- [ ] If write_file: do I have the complete file content to pass as new_content, or am I reconstructing from partial reads? (Partial = truncation guaranteed.)
- [ ] Did I read the target file **without `offset`/`limit`** in this same session? If only a partial view is in context, do not call write_file on that file under any circumstances — read the full file first, or use append via temp-file+shell instead.
- [ ] Have I verified the file's current size with `wc -c` as a baseline? (If it shows drastically less than expected, the file was already damaged by an earlier operation.)
- [ ] Is write_file actually necessary? An append method is always safer for accumulator files.
- [ ] **If a saved full draft exists in `/tmp`, I should use it with append, not regenerate from partial context.**

**First-choice rule:** Default to Temp-file markdown then shell-append (`cat >>`). Only use `write_file` when explicitly replacing the entire file with known-complete content that was read without offset/limit.

**First-choice rule:** Default to Python append via `execute_code` with `open(file, 'a')`. Only use `write_file` when explicitly replacing the entire file with known-complete content that was read without offset/limit.

**DANGEROUS: Blind `write_file` after partial read** — NEVER use `write_file` to append to RESEARCH.md if you previously read the file with `offset`/`limit` (partial view). The tool will warn `"_warning": "...was last read with offset/limit pagination"` but the write STILL EXECUTES and TRUNCATES the file to just the fragment you had in context plus whatever new content you pass. This warning is advisory, not blocking — the data loss happens regardless.

**Real-world severity (May 2026):** A WealthForge cron session read RESEARCH.md with offset=1, limit=500 (file was 607 lines — lines 501-607 never entered context). Then called write_file with 23KB of new content. The file went from ~61KB to ~23KB on disk — three prior research entries were silently deleted. The warning displayed but the write executed anyway. The session continued normally and only the next run's status line would catch the loss. This is a destruction-in-production risk, not academic.

**File size alarm — pre-write AND post-write check** — Check file size BEFORE and AFTER every write:
- **Pre-write:** `wc -c /path/to/RESEARCH.md` via terminal. If this session's previous read showed ~72KB but `wc -c` shows ~16KB, the file was already truncated.
- **Post-write:** `wc -c` again. New size should be baseline + your new content. If it barely changed or decreased, the write truncated/overwrote.
- **Section count check:** After writing, count `## YYYY-MM-DD` section headers in RESEARCH.md vs. ✅ topics in AGENDA.md. Each ✅ topic should have a corresponding dated section. Missing = data loss.

Research files grow large (1728+ lines). `write_file` OVERWRITES the entire file. If you previously used `read_file` with `offset`/`limit` (partial read), you only have a fragment of the file in context — calling `write_file` next will TRUNCATE the file to just that fragment plus anything new. The `_warning` in the output ("Re-read the whole file before overwriting it") is advisory, NOT a block — the write still executes and destroys data. This is a destruction-in-production risk, not a theoretical concern. Use one of these safe approaches instead:

    **PREFERRED: Python append via execute_code** — Use `execute_code` with a plain Python `with open(file, 'a') as f: f.write(content)` statement. This is the MOST reliable approach — no heredocs, no shell escaping issues, no exit-code -1 failures, and handles arbitrary markdown content including backticks, dollar signs, and em-dashes. Example:

    ```python
    from hermes_tools import execute_code

    content = r'''your markdown content here'''
    with open('/path/to/RESEARCH.md', 'a') as f:
        f.write(content)
    ```

    IMPORTANT: Use a raw string (`r'''...'''`) or escape backslashes properly. The content preserves markdown structure naturally. No truncation risk because `'a'` mode is append-only.

**⚠️ CRITICAL LIMITATION: Python raw-string append BROKEN for code-block-rich content.** When the research entry contains Python code blocks with triple-quoted docstrings or multi-line string literals (`"""..."""` inside pseudocode), the `r'''...'''` raw-string marker conflicts with the embedded `"""` sequences, producing `IndentationError: unexpected indent`. This is common in research entries with optimizer algorithms, tax calculators, or RMD formulas in the BUILD SPEC section.

**Hard-won fallback: patch/raw-string failure → write temp file then shell append.** This pattern proved reliable when session began with a partial read context and direct append approaches failed. Use it whenever:
- Direct append encodes fail due length, escaping, or cursor insertion risk
- You need inserted content to appear without overwriting the rest of the accumulator
- A previous write resulted in partial content or corrupted tail state

Recovery sequence:
1. Back up current accumulator content and write-election base state.
2. Read the file at offset after last trusted section, keeping line numbers.
3. If corruption exists and you have trusted content in context, prefer reconstructing via temp file then appending rather than inlining edits.

**Fix — Temp-file markdown then shell-append (PREFERRED for large, code-block-rich entries):** Write the research entry as a markdown file directly, then append via shell.
Write the research entry as a markdown file directly, then append via shell. Avoids ALL Python escaping issues:
```
Step 1: write_file(path="/tmp/research_entry.md", content=r'''...full markdown...''')
Step 2: terminal(command="cat /tmp/research_entry.md >> /path/to/RESEARCH.md")
Step 3: terminal(command="wc -c /path/to/RESEARCH.md")  # verify
Step 4: terminal(command="rm /tmp/research_entry.md")    # clean up
```

**Why this is strictly better than the Python-script approach:** `write_file` writes bytes exactly as provided with zero escaping concerns — backticks, dollar signs, triple quotes, em-dashes, unicode, and pseudocode all survive verbatim. `cat >>` is a shell operation with no string processing. This pattern handles entries up to 50KB+ with code blocks (PFIC algorithms, tax calculators, SQL tables) without any `IndentationError` or quote-conflict issues. No Python execution needed at all.

**Also acceptable: Temp-file write then shell append** — When the markdown cat >> approach isn't feasible, use this two-step pattern:
    a) Write the new content to a temp file via `execute_code` with `write_file(temp_path, content)`
    b) Append it to RESEARCH.md via `terminal(command="cat temp_path >> RESEARCH.md")`
    c) Clean up: `terminal(command="rm temp_path")`

    **ACCEPTABLE: Footer-replacement patch (when RESEARCH.md has a stable footer)** — If RESEARCH.md ends with a predictable, unique footer section (e.g., `## TOPICS PENDING RESEARCH\n\n...\n\n---`), you can use `patch` to replace the entire footer with itself + new content + the same footer. This avoids both write_file truncation risk and shell escaping issues with heredocs:

Requirements:
- The footer must be UNIQUE in the file (no duplicate headers)
- You must have read the file WITHOUT offset/limit this session to get the exact current footer text
- After the patch, verify with `wc -c` and a section-count cross-check (every ✅ in AGENDA needs a matching `## YYYY-MM-DD` section header in RESEARCH.md)

Advantages: No truncation risk (patch is surgical), no shell escaping issues (patch handles quotes/backticks/dollar signs internally), no temp files to manage.

**ACCEPTABLE: Shell-based append via heredoc**
    ```bash
    cat >> /path/to/RESEARCH.md << 'HEREDOC_END'

    ---

    ## 2026-05-16 02:30 — Topic Name

    **Research topic:** Topic
    **Sources consulted:** [list URLs]

    ### Key Findings
    [findings]

    ### Relevance to Project
    [analysis]
    HEREDOC_END
    ```
    No risk of overwrite. The heredoc delimiter must be quoted (`'HEREDOC_END'`) to prevent shell expansion of variables in markdown (like `$` signs in portfolio values).

    **SPECIFIC PITFALL: `&` characters in markdown content trigger terminal's background detection.** If your research entry contains `&` characters (common in ASCII box art like `+---+`, mathematical notation, or any text with `&`), terminal's foreground command parser rejects the heredoc with `Foreground command uses '&' backgrounding`. This happens even with short content. **Fix:** switch to the Python raw-string append approach whenever your markdown contains `&`. The issue is terminal's pre-execution background check, not shell escaping — the quoted heredoc delimiter doesn't help here.

    NOTE: heredocs with very long multi-line content may also fail in certain terminal environments (exit code -1 from a separate cause). If this happens, fall back to the Python append approach.

    **Content preservation rule: if an entry draft exists in session context, always append it rather than regenerating.** Re-running generation risks losing details, sources, and wording already produced. If the draft needs structural changes, edit the saved draft directly, then append the revised version.

11. **Parallel web research pattern for efficiency** — Research runs benefit from parallel tool calls. Pattern: launch 2-3 `web_search` calls simultaneously (different query angles), then from the results, launch 2-5 `web_extract` calls simultaneously on the most promising URLs. This reduces wall-clock time for research from 5-10 sequential rounds to 2-3 parallel rounds. Use `delegate_task` with parallel `tasks` for extremely large research topics with many independent sub-sources.

**RECOVERY SAFEGUARD: detect old runs before merge writes.** After reconstructing RESEARCH.md from chapter files, grep old file prefixes before removal, e.g., check `RESEARCH_732_BO_health_benchmarking.md`, `RESEARCH_append_entry.md`, etc., then apply a date/"Researched" check before deleting chapter files.

15. **Preflight: verify write permissions on all state directories BEFORE starting research** — The cron depends on AGENDA.md and RUN_COUNTER.md being writable in `~/Documents/Hermes-Vault/wealthforge-roadmap/`. Before deep research begins:
```bash
test -w ~/Documents/Hermes-Vault/wealthforge-roadmap/ && test -w ~/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md && test -w ~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md && echo OK || { echo BLOCKED; exit 1; }
```
If blocked, **stop research immediately**: acknowledge the block, skip all writes/RESEARCH updates, and report `[BLOCKED] directory write permission denied`. Do NOT waste compute on research that cannot be logged. This avoids partial runs leaving RESEARCH.md updated while AGENDA.md and RUN_COUNTER.md remain stale.

16. **Detect and escape read_file dedup loops before they block the run** — When a state file (especially `RUN_COUNTER.md`) has just been successfully read, a subsequent `read_file` may return the cached result with no new content. Repeated identical reads waste turns and can stall the workflow. If `read_file` appears unchanged twice in a row for the same path, **stop rereading** and verify true file state via terminal:
```bash
wc -l ~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md
tail -n 40 ~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md
```
Use the terminal output to confirm current run metadata and last-stream text. Only then decide whether the counter is safe to increment. Do not re-issue the same `read_file` call hoping for fresh output; switch to terminal for ground truth.

14. **Check previous runs** — Always read both AGENDA AND RESEARCH to avoid duplicating prior work. Fresh sessions have no concept of "done before."

13. **Web research: parallel extraction pattern** — Use the multi-round iterative methodology in `references/web-research-methodology.md`. Key takeaway: launch 2-3 `web_search` calls simultaneously from different angles (funding, product, competitive), extract all promising URLs in parallel, then gap-fill with targeted follow-up searches. Don't serialize research round-by-round — the system handles parallelism.

13. **No code changes** — This is pure research. Never modify source code, configuration files, or project structure outside the knowledge base files (AGENDA.md, RESEARCH.md).

### Recovery: reconstructing RESEARCH.md after accidental truncation — If `write_file` was used after reading with `offset`/`limit` and the file was truncated, recover with this concrete procedure:

    **CRITICAL: The write_file warning is advisory, not blocking.** The tool warns `"_warning": "...was last read with offset/limit pagination (partial view). Re-read the whole file before overwriting it."` but the write STILL EXECUTES and TRUNCATES the file. Do not assume the warning protected you — the file on disk is already damaged. Move immediately to recovery.

    ### Step 1: Extract new/uncommitted content before it's lost
    
    Use `execute_code` with `read_file` from hermes_tools to surgically extract the new entry that was partially written:
    
    ```python
    from hermes_tools import read_file
    corrupted = read_file("/path/to/RESEARCH.md")
    lines = corrupted["content"].split("\\n")
    # Find where your new content starts (look for your timestamp heading)
    apx_start = next(i for i, l in enumerate(lines) if "Your Topic Heading" in l)
    new_entry = "\\n".join(lines[apx_start-1:])  # From preceding --- separator
    print(f"Saved {len(new_entry)} chars of new content")
    print("---BEGIN NEW ENTRY---")
    print(new_entry)
    print("---END NEW ENTRY---")
    ```

    ### Step 2: Reconstruct the full file
    
    Use `write_file` with the COMPLETE historical content (from conversation context — the `read_file` outputs visible in earlier tool results) + the new entry extracted above. The conversation context still has the full file content from the earlier `read_file` calls at the start of the session.
    
    **Do NOT rely on `session_search` for reconstruction** — session_search returns LLM-generated summaries of past sessions, not the exact file content. The only reliable reconstruction source is the raw `read_file` output lines still visible in your current conversation context. If the conversation has scrolled far enough that those outputs are no longer visible, you cannot reconstruct from context — in that case, skip Step 2, note the loss, and the next cron run creates fresh entries.
    
    ### Step 3: Post-recovery verification checklist
    
    After reconstruction, verify with `terminal`:
    - `wc -l /path/to/RESEARCH.md` — should be many more lines than the truncated file
    - `wc -c /path/to/RESEARCH.md` — should be many more bytes (e.g., 72KB vs 16KB)
    - **Cross-check every ✅ topic in AGENDA.md against section headings in RESEARCH.md** — Read AGENDA.md's [✅] list and verify each has a corresponding `## YYYY-MM-DD — Topic Name` section in RESEARCH.md. If any [✅] topic is missing from RESEARCH.md, the reconstruction was incomplete.
    - Verify the last section is your newly researched entry, not truncated mid-way
    - Verify the file starts with `---` and each section separator is followed by a blank line (clean markdown structure, not embedded artifacts from the recovery)
    
    ### Step 4: Fix AGENDA.md if also damaged
    
    If AGENDA.md was also written over, use `patch` to restore the status line. The correct denominator = original count - 1 (removing the topic you just completed) + new topics added + 1 (adding back the topic you just completed). AGENDA.md is small enough to rebuild from scratch if needed.

## Absorbed Patterns (formerly automated-deep-research)

The following patterns were absorbed from `automated-deep-research` during consolidation. See the linked reference files for full methodology.

### AGENDA.md Anti-Bloat Management

When AGENDA.md grows past ~50KB or ~100 topics:

1. **Archive completed sections** — Cut entire 100% complete phases into AGENDA-ARCHIVED.md
2. **Prune stale [⏳] topics** — Remove items older than 3 months that haven't been picked up
3. **Degrade deeply nested topics** — Consolidate 7+ items under one narrow theme into one umbrella item
4. **Move subtopic descriptions out** — Shorten entries to title + source; full description stays in RESEARCH.md
5. **Keep the status line honest** — Update denominator after any operation

### Sub-Topic Sweep (Bonus Completer)

When a separate [⏳] sub-topic is naturally covered by a main research deep-dive, mark it as [✅] too with a reference note. Do NOT delete — mark with "COVERED IN [topic name]" to preserve traceability. This reduces agenda size without losing history.

### Cross-Platform Architecture Pattern Analysis

When 2-3+ agenda items share the same fundamental capability across different platforms (e.g., "AI intelligence layers" in Orion, Advyzon, Addepar), rebrand the session as a cross-platform analysis and sweep them together. Output is a taxonomy of archetypes, not a list of features. Full methodology: `references/cross-platform-architecture-pattern-analysis.md`.

### Announcement Cluster Detection

Discover adjacent research topics by checking what other companies announced on the same date/week as your primary target. Same-date search can reveal unsuspected competitive moves and produce 4+ new agenda topics. Full methodology: `references/announcement-cluster-detection.md`.

### Codebase Audit in Competitor Research

When researching a competitor feature, also audit your own project's codebase for existing modules. Map competitor features to codebase components, classify gaps as "UX/orchestration gaps" vs. "missing computation." Prevents redundant design work when you already have partial implementations. Full methodology: `references/codebase-audit-in-competitor-research.md`.

### Competitive Architecture Archetype Mapping

Group competitive products by architectural approach (not feature lists), map to a higher-order predictive framework, and synthesize actionable integration strategy. Full methodology: `references/competitive-architecture-archetype-mapping.md`.

### Deliverable artifact output from research corpora

When the task is to synthesize cron output into standalone deliverables, use a dated output directory outside the live research tree. A safe working contract is:

1. Reuse an existing timestamped folder like `.../research/<YYYY-MM-DD>-research-deliverables/` instead of creating new buckets every run.
2. Keep evidence-backed output files in that folder with names tied to the deliverable intent, e.g. `suite-to-do-additions-<date>.md` and `role-widget-report-matrix.md`.
3. Keep deliverable size and scope proportional to evidence scope during drafting — exclude placeholder or low-signal reports, then expand only after verifying actual file content.
4. End the task by reporting the exact output paths and a short inventory of what each file contains. Do not assume the user knows where the files were written.

### Templates

Two starter templates are available:

- `templates/agenda.md` — Reusable AGENDA.md starter with the standard format
- `templates/research-prompt.md` — Reusable cron job prompt template

## Related Skills

- `wealthforge-employee-role-research`: WealthForge-specific 9-section employee role research format (complements the feature research format). Use when researching roles in a wealth management firm — covers role overview, hourly task breakdown, complete software inventory, widget mapping, ideal GUI layout, automation opportunities, competitive landscape, and sources.
- `wealthforge-research-format`: WealthForge-specific 12-section feature research format (complements the employee role research format). Use when researching features, competitors, or domain topics for WealthForge.
- ~~`automated-deep-research`~~ (absorbed into this skill — see reference files below for its unique patterns)

- `plan`: For planning-mode equivalent (writing plans to a directory instead of research)
- `writing-plans`: For structured implementation plans based on research findings
- `newsletter-builder-troubleshooting`: Similar cron pattern but for content generation
- `wealthforge-ai-context`: Project-specific context for WealthForge AI research

## Linked References

- `references/wealthforge-example.md` — Example research agenda and findings structure
- `references/wealthtech-business-models.md` — Condensed reference on bootstrapped vs. PE vs. VC wealthtech business model archetypes (four archetypes, key metrics, strategic lessons)
- `references/conceptual-research-methodology.md` — Methodology for researching abstract concepts, architectural design philosophies, and frameworks where terminology discovery is part of the task.
- `references/disability-insurance-research-sources.md` — Condensed reference on the disability insurance domain for wealth planning research: source hierarchy (SSA, CDIA, WCI, Kitces, carrier data), key data points (1-in-4 prevalence, SSDI 62% denial rate, 2.1-3.2yr average duration), 2026 SSDI bend point formula ($1,286/$7,749), Big 5 carrier landscape (Guardian, MassMutual, Principal, Standard, Ameritas), occupation class system (4A through B), essential riders with cost/pryority matrix, IRC tax treatment rules (employer-paid=§105(a) taxable, individual=§104(a)(3) tax-free), and common research blind spots. Load when research encounters disability insurance, income protection, own-occupation coverage, physician disability planning, SSDI estimation, or employer LTD group policy analysis.
- `references/retirement-income-guardrails.md` — Condensed reference on retirement income guardrails: three approaches (Guyton-Klinger, Kitces Ratcheting, Risk-Based), the retirement distribution hatchet, overspending/underspending framework, Income Lab's implementation architecture, monthly recalculation requirements, and WealthForge's greenfield opportunity. Load when research encounters retirement spending, dynamic withdrawal strategies, guardrails methodology, or Income Lab competitive analysis.
- `references/retirement-consumption-puzzle.md` — Condensed reference on the retirement consumption puzzle (Blanchett & Finke, 2014-2025): why retirees spend only ~2.1% from savings (vs. 4% rule), the "license to spend" concept, mental accounting biases, RMD as behavioral intervention, the spending smile, and implications for planning engine objective functions. Load when research encounters retiree underspending, behavioral economics of decumulation, the spending smile, guaranteed income psychology, or designing planning tools for the decumulation mindset. Complements `retirement-income-guardrails.md` — guardrails solve the mathematical withdrawal problem; this research shows the real problem is psychological.
- `references/blackrock-model-portfolio-dominance.md` — Condensed reference on BlackRock's model portfolio strategy ($300B+ models, $250B+ SMA platform, multi-channel distribution, three-acquisition buildout, private markets in 401(k)). Load when research encounters model portfolio market sizing, BlackRock competitive analysis, or private-markets-in-retirement planning topics. Complements `references/alts-in-uma-execution-architecture.md` and `references/wealthtech-pricing-models.md`.
- `references/comparative-withdrawal-method-engine.md` — Condensed reference on the 9-strategy unified comparison engine architecture: strategy parameter tables, standardized metrics schema, RISA-weighted recommendation algorithm, 5 widget specs, 7-table schema, API endpoints, integration points, and 8 remaining subtopics. Load when building or extending the Comparative Withdrawal Engine (CWE) module, or when researching withdrawal method comparison features for WealthForge.
- `references/golden-window-duration-calibration-policy.md` — Golden-window duration policy for WealthForge calibration monitoring. Covers selection factors, bucket catalog, scoring selector, hysteresis, and audit requirements. Load when researching evaluation window calibration or golden-window policies.
See `references/web-research-methodology.md` — Multi-round iterative web research methodology for deep research sessions. Covers parallel search/extraction pattern, source quality hierarchy, research note-taking conventions, and the difference between surface and deep research. Load before starting any deep research campaign if unfamiliar with the parallel extraction workflow.
- `references/canonical-data-model-research-format.md` — 14-section research format for cross-domain data model / architecture topics (entity catalog, identity resolution, system-of-record, API design, competitive landscape, red teaming, data governance, implementation roadmap). Use when researching canonical data models, enterprise schemas, or unified data layers for RIA platforms. Covers 6 common pitfalls (over-modeling, competitive over-claiming, identity over-promising, SOR assumptions, CQRS scope creep, partition key selection).
- `references/reconstructing-lost-research-entries.md` — Procedure for reconstructing lost 12-section research entries when both the full RESEARCH.md entry and the cron output are partially available. Uses AGENDA.md [✅] entries as table of contents and cron output summaries as detail source. Covers cross-referencing, section mapping, temp-file append pattern, and post-recovery verification.
See `references/product-tier-feature-mapping.md` — Research method for analyzing a competitor feature across product/pricing tiers to distinguish core capabilities from differentiators and gated features. Use when researching a specific feature that varies across company tiers (e.g., eMoney's Decision Center in Plus vs. Pro vs. Premier). Covers tier structure identification, tier-specific description extraction, case study cross-referencing, and feature taxonomy synthesis.
See `references/regulatory-enforcement-research.md` — Methodology for researching SEC enforcement actions, regulatory history, and compliance posture of competitors. Covers source types (SEC IAPD, admin proceedings, press releases), enforcement action taxonomy (AI washing, marketing violations, contract violations), and competitive analysis framework. Use when researching any SEC-registered competitor to find claims-vs-reality gaps and regulatory risk indicators.
- `references/ss-crowding-out-formula.md` — Synthesized mathematical model for how Social Security benefits reduce effective Roth conversion bracket space ("crowding out" formula). Three-zone model (x=1.0, 1.5, 1.85 multipliers), Effective Bracket Compression Ratio, saturation point formula, and first-dollar step cost insight. Load when researching Roth conversion optimization, SS tax torpedo, planning engine tax calculations, or the SS-RMD-Roth interaction algebra.
- `references/sei-lifeyield-api-architecture.md` — Condensed reference on SEI LifeYield's API overlay architecture for Unified Managed Household (UMH) capabilities: six API modules, Taxficient Score methodology, key metrics/validation, enterprise integration patterns, and comparison with Smartleaf. Load when research encounters UMH, household tax optimization, or overlay API architecture topics.
- `references/software-algorithm-triangulation.md` — Methodology for inferring a competitor software tool's algorithmic approach from public documentation, marketing, and reviews. Covers the "negative space analysis" pattern — systematically identifying what a tool explicitly does NOT do as the primary discovery pathway for competitive gaps. Use when researching any planning/tax/engine software to understand both what it does and what it reveals about architectural gaps through its omissions. Covers iterative search patterns, competitive intelligence extraction, original synthesis construction, and the terminology discovery pattern. Use when researching platform philosophies, design trade-offs, or emerging archetypes rather than specific products/features.
- `references/managed-data-environments.md` — Condensed reference on the emerging managed data environment product category in wealthtech (Addepar ADX, iCapital Data Solutions, SS&C Accord). Covers architecture patterns (Financial Graph, medallion architecture), competitive landscape, and implications for WealthForge's data platform strategy. Load when research encounters data platform/infrastructure topics.
- `references/treaty-monitoring-domain-knowledge.md` — Condensed reference on bilateral tax treaty monitoring for wealth management: zero-competition competitive landscape (Orbitax has rates but no monitoring; eMoney/RightCapital have manual config only), treaty event taxonomy (rate change, protocol signing, MLI, mutual amendment), materiality tier framework (TIER-0 to TIER-4), key treaty networks to monitor (US-Germany, US-France, US-UK, India-Mauritius), data sources (OECD, IRS, PwC, Bloomberg Tax, Legal Clarity), regulatory drivers (Reg BI, Marketing Rule, FINRA 2111, CFP Board), and treaty change impact statistics. Load when researching any er-03 treaty monitoring topic or bilateral tax treaty features.
- `references/conversation-context-reconstruction.md` — (from wealthforge-research-run skill) When RESEARCH.md is corrupted and the current session still has raw read_file output lines visible in conversation context. This is the MOST reliable recovery method. Load when data loss is detected and conversation context is still available. See also `reconstructing-lost-research-entries.md` for cron output + AGENDA.md reconstruction.
- `references/recovering-missing-research-from-checked-off-agenda.md` — Procedure for recovering checked-off AGENDA.md entries that never made it into the canonical RESEARCH.md. Covers cron output searching, safe append-back, verification, and avoid `USED_RESEARCH.md` mutation.
- `references/wealthtech-pricing-models.md` — Condensed reference on the six wealthtech platform pricing models (AUM-based, fixed SaaS, per-user, custodian-subsidized, per-household premium, planning retainer) with competitive pricing matrix, fee study data, and key takeaways for WealthForge's monetization strategy. Load when research encounters pricing, business model, or monetization topics.
- `references/t-rowe-price-income-solver.md` — Condensed reference on T. Rowe Price Income Solver (Jan 2026, $1,900-$5K/yr, Retiree Inc. subsidiary, "7 years or $1M" claim, T3 ~3% share). Key findings: three-pillar simultaneous optimization, competitive positioning vs. Income Lab (technical problem vs. practice problem), critical gaps (no AI, no continuous monitoring, no client portal), and WealthForge opportunity. Load when research encounters retirement decumulation software, asset-manager-owned planning tools, or Income Lab comparisons.
- `references/social-security-optimization-engines.md` — Condensed reference on the Social Security optimization software competitive landscape (9 tools: Income Lab, Horsesmouth Savvy SS, SSAnalyzer, MoneyGuidePro SS, RightCapital SS, MaxiFi/MMSS, Covisum SST, LifeYield SS+, SS Analytics). Covers T3 2026 satisfaction ratings, market shares, pricing, architecture, the critical simultaneous-optimization gap (no tool optimizes SS + withdrawals + Roth + RMD together), and WealthForge build recommendations. Load when research encounters Social Security planning, retirement decumulation tools, or tax-efficient withdrawal sequencing topics.
- `references/irmaa-threshold-planning.md` — Condensed reference on IRMAA threshold planning: 2026 bracket table, Roth conversion-IRMAA trap (effective marginal rate 58.7%), SSA-44 appeal process (zero-competition feature opportunity), software competitive landscape (6 tools compared with IRMAA support levels), WealthForge implementation status (foundation ~30% built, 9 critical gaps identified), six planning strategies, and OBBBA senior deduction phaseout interaction. Load when research encounters Medicare surcharges, IRMAA-aware withdrawal sequencing, Roth conversion optimization, or tax-efficient retirement planning topics.
- `references/aca-irmaa-multi-threshold-optimization.md` — Condensed reference on the three-zone multi-threshold optimization framework for early retirees (50-65): ACA subsidy cliff ($86,560 MFJ HARD CLIFF), OBBBA senior deduction phaseout ($150K-$250K, 6%/$), IRMAA cliffs ($218K/$274K/$342K/$410K), SS tax torpedo interaction, and HSA bridge strategy. Covers 2026-specific data (OBBBA did NOT extend enhanced ACA subsidies), the three-zone lifecycle planning framework (Pre-Medicare/Early Medicare/Post-RMD), and the competitive gap analysis showing zero tools handle all four systems. Load when research encounters early retiree tax planning, ACA cliff, Roth conversion with IRMAA, or multi-threshold optimization topics.
- `references/crt-charitable-remainder-trust.md` — Domain reference on Charitable Remainder Trusts (CRT/CRAT/CRUT/NIMCRUT/Flip-CRUT/T-CRUT): core types, Section 7520 rate mechanics, 4-tier WIFO distribution model, NIIT exemption ($182K savings on $5M), wealth replacement ILIT strategy, state tax non-conformity (NJ/PA/CA), competitive landscape (eMoney/Wealth.com/Vanilla/Valur), and 12 key sources. Load when research encounters concentrated stock positions, NIIT avoidance, CRTs, charitable trust modeling, or ILIT wealth replacement strategies. Added after Run 66 CRT deep-dive.
- `references/enterprise-bank-gtm.md` — Condensed reference on how wealthtech platforms (Addepar, Advyzon) go to market with enterprise private banks: the Addepar bank playbook (HSBC, JPM, LGT, Itau, MS), the Advyzon Citi Wealth breakthrough (global UMA deal, Andy Sieg transformation), the four bank tech strategy archetypes (JPMorgan build, Citi partner, MS hybrid, GS custody-first), the bank-readiness certification/architecture checklist, and viable paths for WealthForge's enterprise distribution. Load when research encounters bank partnerships, enterprise sales, or distribution strategy topics.
- `references/ss-tax-torpedo.md` — Condensed reference on the SS tax torpedo: provisional income formula, 40.7% effective marginal rate mechanics, five optimization strategies (Roth bridge years, QCDs, withdrawal sequencing, SS delay, muni bond awareness), OBBBA senior deduction triple-interaction zone, 8-state taxation landscape, MFS filing trap, and the You Earned It/You Keep It Act legislative wildcard. Load when research encounters SS taxation, retirement income planning, tax-efficient decumulation, or the intersection of SS with IRMAA/ACA.
- `references/hsa-optimization-aca-magi.md` — Condensed reference on HSA optimization as the primary ACA MAGI reduction lever for early retirees.
- `references/qlac-optimization-research.md` — Condensed reference on QLAC (Qualified Longevity Annuity Contract) optimization for RMD reduction. Covers: SECURE 2.0 rules ($210K indexed limit, 25% cap eliminated), top 8 carriers with AM Best ratings, Kitces counterargument and 2026 re-evaluation, RMD reduction math with worked example, decision framework, competitive landscape (no platform has QLAC modeling). Load when research encounters QLACs, RMD reduction strategies, or deferred income annuity planning topics. Added 2026-05-16 after Run #67 QLAC deep-dive. Covers: IRS Notice 2026-5 Bronze/Catastrophic plan HSA eligibility (7.25M newly eligible), HSA contribution MAGI reduction mechanics ($8,750 family + $1,000 catch-up), HSA distributions as stealth withdrawal vehicle (do NOT count toward ACA MAGI), HSA bridge lifecycle strategy, HSA for Medicare premiums post-65, shoebox/receipt strategy, the 91% HSA investment gap, CA/NJ state tax exceptions, and HSA-first withdrawal ordering during ACA years. Load when research encounters HSA planning, ACA subsidy preservation, or early retiree tax optimization.
- `references/bridge-years-roth-conversion.md` — Condensed reference on bridge-year Roth conversion optimization (ages 62-72/75): six algorithmic approaches compared (Pralana bracket iteration, Income Lab integrated, MaxiFi consumption-smoothing, RightCapital combinatorial, Vanguard BETR, Holistiplan projections), the multi-constraint optimization problem (IRMAA cliffs, SS crowding out, widow penalty, OBBBA senior deduction, state tax), conversion-value hierarchy by age, BETR framework details, competitor gap matrix, and algorithm recommendation (dynamic programming). Load when research encounters Roth conversion optimization, retirement tax planning, or decumulation algorithm design.
- `references/ssa-44-appeal-workflow.md` — Condensed reference on the SSA-44 IRMAA appeal workflow: filing mechanics, 8 qualifying life-changing events, SSA POMS discovery (SSA does NOT develop types of income — only verifies LCE + MAGI decrease), "one big conversion" strategic enabler, documentation requirements, denial reasons, competitive landscape (no major platform has native SSA-44 automation), and 7 component builds for WealthForge. Load when research encounters IRMAA appeals, Roth conversion safety valves, or Medicare premium surcharge avoidance strategies.
- `references/standard-deduction-trap-charitable-giving.md` — Condensed reference on the standard deduction trap (~90% of retirees get $0 tax benefit from charitable donations), the QCD alternative ($80K-$120K lifetime savings), the three OBBBA 2026 constraints (non-itemizer deduction capped at $1K/$2K, 0.5% AGI floor applied in reverse order, 35% cap for top bracket), DAF bunching under OBBBA, and the planning software modeling gap. Load when research encounters charitable giving, QCD optimization, retirement tax projections, OBBBA tax law changes, or the intersection of charitable deductions with IRMAA/SS taxation.
- `references/obbba-senior-deduction.md` — Condensed reference on the OBBBA senior deduction ($6K/$12K per person 65+, 2025-2028): phaseout mechanics ($60/$1K at 6% rate, $150K-$250K MFJ phaseout range), three-layer deduction stack ($47,400 total tax-free), the "Senior Deduction Trap" (hidden ~1.3pp marginal cost of conversions in the phaseout zone), three-way interaction with SS torpedo and IRMAA, "One Big Conversion" strategy, temporal expiration after 2028, and MFS ineligibility. Load when research encounters Roth conversion optimization, IRMAA-aware planning, the SS tax torpedo, or retirement tax planning.
- `references/value-of-decumulation-methodology.md` — Condensed reference on the three value claim archetypes (Extra Years, Lifetime Savings, Multi-Metric Improvement), baseline strategy sensitivity problem, competitor methodology details (Income Solver, Mezzi, LifeYield/EY), academic foundation (WER, Blanchett & Finke 2025), five common accounting challenges, and WealthForge's recommended three-tier quantification approach. Load when research encounters quantified value claims about retirement income optimization from competing tools or when building WealthForge's own quantified value proposition for investor narrative or advisor sales enablement.
- `references/wealth-management-market-research.md` — Domain-specific research source hierarchy and methodology for wealth management market data.
- `references/estate-planning-doc-extraction.md` — Competitive landscape (7 tools) and technology stack (Docling+Mistral OCR dual-path) for AI-powered trust document and estate plan extraction. Covers 5 key gaps across ALL tools: EDB detection, trust type classification, trust-specific powers, structured output, and wealth management integration. Load when researching estate document AI tools, trust document extraction pipelines, or AI-powered OCR for financial documents. Covers the Cerulli press release -> MMI-Cerulli quarterly data -> Parametric/Cerulli sponsored research -> podcast interview -> trade press cross-reference pipeline. Documents the six Cerulli program types (UMA/SMA/RPM/ETF/MF/RA), the parallel research pattern for efficient cron runs, key data points to standardize across sessions, and alternative sources for data behind paywalls. Load when researching managed account market sizing, platform consolidation trends, tax optimization automation gaps, or any topic requiring Cerulli/wealth management industry data.
- `references/search-strategy-patterns.md` — Multi-phase parallel search patterns, sub-topic sweep patterns, and file size management techniques. From absorbed automated-deep-research.
- `references/competitor-analysis-deep-dive.md` — Comprehensive deep-dive methodology for competitor analysis: competitor taxonomy, research dimensions, and dynamic agenda expansion. From absorbed automated-deep-research.
- `references/product-line-and-market-segment-dives.md` — Sub-product/derivative platform analysis (e.g., Auria from Advyzon), market segment competitive landscape mapping (4+ categories), and primary market research cross-reference validation. From absorbed automated-deep-research.
- `references/cross-platform-architecture-pattern-analysis.md` — Analyzing a specific feature/architecture pattern across multiple platforms simultaneously (AI intelligence layers, direct indexing approaches). From absorbed automated-deep-research.
- `references/announcement-cluster-detection.md` — Discovering adjacent research topics by checking same-date announcements from other companies. From absorbed automated-deep-research.
- `references/codebase-audit-in-competitor-research.md` — Auditing your own project's codebase as part of competitor feature research: inventorying existing modules, mapping competitor features, classifying gaps. From absorbed automated-deep-research.
- `references/competitive-architecture-archetype-mapping.md` — Grouping competitive products by architectural approach, mapping to a predictive framework, and synthesizing actionable integration strategy. Real example: 4 CRM AI camps (Legacy+AI, AI-Native, Full-Stack+AI, Agentic OS). From absorbed automated-deep-research.
- `references/umbrella-liability-research-pattern.md` — Condensed reference on umbrella/excess liability insurance for wealth planning: carrier hierarchy (4 tiers from standard to ultra-HNW), underlying limit requirements (250/500/100 auto, $300K home), recommended limit formula (net worth + 3x income × risk factors × jury climate), state jury climate adjustment tiers, nuclear verdict trends (17% CAGR 2019-2025), common exclusions, and WealthForge integration points. Load when research encounters umbrella liability, excess liability, personal umbrella, P&C insurance, or nuclear verdict risk topics. Added after Run 155 umbrella liability deep-dive.
