---
name: research-md-append-only
category: data-science
description: Prevents accidental overwrite of the monolithic RESEARCH.md combined log file. Use cat >> to append, not write_file.
---

# RESEARCH.md Management — Append-Only Pattern

## CRITICAL RULE: NEVER use write_file on RESEARCH.md

RESEARCH.md is the monolithic combined research log. It must only be APPENDED to.

## FAILURE HISTORY (4 incidents, all caused by write_file)

| Run | Lines Lost | Cause |
|-----|-----------|-------|
| 788 | ~754 | write_file overwrote RESEARCH.md |
| 845 | ~1,392 | write_file overwrote RESEARCH.md |
| 868 | ~100 | Sibling subagent overwrote RESEARCH.md |
| 875 | 3 entries | write_file overwrote RESEARCH.md |

**Lesson: The rule is documented in multiple skills. The agent still breaks it. A PRE-WRITE VERIFICATION STEP is now mandatory.**

## MANDATORY PRE-WRITE VERIFICATION (Run 875 lesson)

Before ANY write operation targeting RESEARCH.md:

1. **Confirm the operation is append, not overwrite using terminal, not read_file, after dedup warnings:** When the same `read_file` call returns unchanged content twice in a row, the tool cache may be stale. Use terminal commands for ground truth:
   ```bash
   wc -l ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
   tail -5 ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
   ```
   Only after confirming file state with terminal should you decide whether append is safe.

2. **Use ONLY these append methods:**
   ```bash
   # Method A: Terminal append (preferred for small entries)
   cat << 'EOF' >> ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
   [content]
   EOF
   ```
   ```python
   # Method B: Python append (preferred for large entries)
   with open('~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md', 'a') as f:
       f.write(content)
   ```
   ```python
   # Method C: Write to temp file first, then append (for entries >25KB)
   write_file('/tmp/research_entry.md', content)
   with open('~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md', 'a') as f:
       f.write(open('/tmp/research_entry.md').read())
   os.remove('/tmp/research_entry.md')
   ```

3. **Post-write verification (MANDATORY):**
   ```bash
   # Verify line count increased
   wc -l ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
   # Verify new entry is present
   tail -10 ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
   ```

## If RESEARCH.md Gets Overwritten

1. Rebuild from individual files:
```python
import os
research_dir = '~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes'
files = sorted([f for f in os.listdir(research_dir) if f.endswith('.md') and f != 'RESEARCH.md'])
header = "# WealthForge AI Research Log\n## APPEND-ONLY\n\n---\n\n"
all_content = header
for f in files:
    with open(os.path.join(research_dir, f)) as fh:
        all_content += f"\n## File: {f}\n\n{fh.read()}\n\n---\n\n"
with open(os.path.join(research_dir, 'RESEARCH.md'), 'w') as fh:
    fh.write(all_content)
```

2. Cross-reference with AGENDA.md to verify no entries were missed.

## Key Files

- `~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md` — combined log (APPEND ONLY)
- `~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/*.md` — individual research files (safe to read/write)
- `~/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md` — working memory with [⏳]/[✅] topics
- `~/Documents/Hermes-Vault/wealthforge-roadmap/RUN_COUNTER.md` — stream alternation tracker
