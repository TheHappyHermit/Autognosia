# Reconstructing Lost Research Entries from Cron Output + AGENDA.md

When a cron job's full research entry is lost (due to context compaction, accidental truncation, or file damage), reconstruct from two partial sources:

## When This Works

- AGENDA.md has a detailed [✅] entry with key findings (4-8 lines, not a one-liner)
- Cron output log has a summary with structured findings (run count, stream type, key findings, files updated)
- The AGENDA.md entry includes section-level detail (strategy, problem, competitive landscape, etc.)

## When It Does NOT Work

- AGENDA.md entry is a one-liner (e.g., `[✅] topic — researched`)
- Cron output only has a brief "researched X topics" summary
- Both sources lack section-level breakdown

## Reconstruction Procedure

### Step 1: Extract available content

```python
# From cron output log
with open('$HOME/.hermes/cron/output/<job_id>/<date>.md') as f:
    cron_content = f.read()
    # Look for the "summary" or "What was researched" section

# From AGENDA.md
import subprocess
result = subprocess.run(['grep', '-A', '50', 'topic-code', 'AGENDA.md'], capture_output=True, text=True)
agenda_content = result.stdout
```

### Step 2: Cross-reference findings

Map cron summary bullet points to AGENDA.md findings:
- Cron: "43 states had notable tax changes" → AGENDA: "43 states had notable tax changes effective Jan 1, 2026"
- Cron: "Michigan pension tax phase-out completed" → AGENDA: "Michigan pension tax phase-out completion"
- Cron: "17+ states decoupled from OBBBA" → AGENDA: "17+ states decoupled from OBBBA creating state MAGI ≠ federal MAGI compliance nightmare"

### Step 3: Reconstruct section-by-section

Use the AGENDA.md condensed entry as a table of contents. Each parenthetical section number maps to a 12-section heading:

| AGENDA.md parenthetical | 12-section heading |
|------------------------|-------------------|
| (1) | Strategy & Context |
| (2) | The Problem |
| (3) | Competitive Landscape |
| (4) | Advisor & Client Sentiment |
| (5) | WealthForge Has/Missing |
| (6) | Build Spec |
| (7) | UI/UX |
| (8) | Regulatory |
| (9) | Architecture |
| (10) | Red Teaming |
| (11) | Sources |
| (12) | New Topics |

### Step 4: Fill in details from both sources

- **Strategy/Problem:** Pull from AGENDA.md's (1) and (2) summaries
- **Competitive Landscape:** Cron summary often has competitor names; AGENDA may have more detail
- **Build Spec:** AGENDA.md typically has the most technical detail (SQL tables, algorithms)
- **Sources:** Cron output often lists source names; AGENDA may have URLs
- **New Topics:** Both sources usually have the full list

### Step 5: Write to temp file, then append

```bash
# Write to temp file (avoids escaping issues)
write_file(path="/tmp/reconstructed_entry.md", content="<full reconstructed markdown>")

# Append to RESEARCH.md
cat /tmp/reconstructed_entry.md >> /path/to/RESEARCH.md

# Verify
wc -c /path/to/RESEARCH.md
rm /tmp/reconstructed_entry.md
```

### Step 6: Post-recovery verification

- `wc -l RESEARCH.md` — should be significantly more lines than the damaged file
- Cross-check every [✅] in AGENDA.md against section headings in RESEARCH.md
- Verify the reconstructed entry has all 12 sections

## Real Example: str-1 Reconstruction (May 23, 2026)

- **Cron output log:** Had a detailed 10-bullet summary with key findings (43 states, Michigan phase-out, 17+ OBBBA decoupling, 4 SQL tables, 3-phase pipeline, 10 red-team vectors, 18 sources)
- **AGENDA.md:** Had a condensed [✅] entry mapping all 12 sections with key findings per section
- **Reconstruction:** Used AGENDA.md as the table of contents, filled each section's content from the cron summary + AGENDA.md condensed details
- **Result:** Full 12-section entry (~19.6 KB, 355 lines) successfully reconstructed and appended to RESEARCH.md
- **Note:** The reconstruction was slightly more concise than the original cron output (which had 630 lines), but all key findings, sources, and technical details were preserved

## Key Insight

AGENDA.md entries for [✅] topics are designed to be quick-reference summaries — they contain the skeleton of the full entry. Cron output logs contain the flesh (detailed findings, source lists, numbers). Together they form a complete reconstruction source. The AGENDA.md entry is the table of contents; the cron summary fills in the paragraphs.
