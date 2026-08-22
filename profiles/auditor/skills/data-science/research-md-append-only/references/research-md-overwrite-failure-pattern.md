# RESEARCH.md Overwrite Failure Pattern

## Pattern Summary
Despite explicit documentation in 3+ skills, the agent repeatedly overwrites RESEARCH.md using `write_file` instead of appending. This is a persistent failure mode requiring active prevention.

## Incident History

### Run 788 — First Incident
- **Lines lost:** ~754
- **Cause:** `write_file` used to write a single research entry
- **Recovery:** Rebuilt from individual files in `research_outcomes/`

### Run 845 — Second Incident
- **Lines lost:** ~1,392
- **Cause:** `write_file` used to write a research entry
- **Note:** This happened AFTER a skill was created documenting the rule
- **Recovery:** Partial — some entries had to be reconstructed from AGENDA.md summaries

### Run 868 — Third Incident
- **Lines lost:** ~100
- **Cause:** Sibling subagent overwrote RESEARCH.md while main agent was writing
- **Note:** Concurrent write problem — not just the primary agent
- **Recovery:** Reconstructed from AGENDA.md summaries

### Run 875 — Fourth Incident (Current)
- **Lines lost:** 3 entries (Parameter Identifiability Diagnostics, Asymmetric CI Framework, ident-05)
- **Cause:** `write_file` used to write ident-06 entry
- **Note:** The `research-md-append-only` skill was loaded and read. The `wealthforge-research-format` skill has a "CRITICAL: RESEARCH.md Append Safety" section. Both were consulted. The agent STILL used `write_file`.
- **Recovery:** Individual files in `research_outcomes/` were preserved. RESEARCH.md rebuilt with ident-06 entry only.

## Root Cause Analysis

1. **Documentation exists but is ignored:** The rule appears in `research-md-append-only`, `research-append-safety`, and `wealthforge-research-format`. All loaded. All ignored.

2. **`write_file` is the default mental model:** When asked to "write content to a file," the agent's default is `write_file` — not `terminal` with `>>` or Python `open(file, 'a')`.

3. **No hard guard exists:** There's no mechanism preventing `write_file` from being called on RESEARCH.md. The skills are advisory only.

4. **Concurrent writes compound the problem:** Even when the primary agent appends correctly, sibling agents can overwrite.

## Prevention Strategies (Ranked by Effectiveness)

### 1. Write to Individual Files Only (MOST EFFECTIVE)
- Write each research entry to its own file: `research_entry_<topic-id>.md`
- RESEARCH.md is maintained as a derived view, not the primary artifact
- Eliminates both overwrite and concurrent write problems
- **This is the recommended pattern going forward.**

### 2. Pre-Write Verification (REQUIRED)
Before ANY write operation on RESEARCH.md:
1. Read current line count: `wc -l RESEARCH.md`
2. Read last 5 lines: `tail -5 RESEARCH.md`
3. Confirm the operation is append (not overwrite)
4. After write, verify line count increased

### 3. Use Temp File + Atomic Append (For Large Entries)
```python
write_file('/tmp/research_entry.md', content)
with open(RESEARCH_PATH, 'a') as f:
    f.write(open('/tmp/research_entry.md').read())
os.remove('/tmp/research_entry.md')
```

### 4. Periodic Rebuild from Individual Files
- After each run, verify RESEARCH.md matches the union of individual files
- If mismatch detected, rebuild immediately

## Recovery Procedure
1. Check individual files in `research_outcomes/` — these are the source of truth
2. Cross-reference with AGENDA.md to identify missing entries
3. Rebuild RESEARCH.md from individual files (see `research-md-append-only` skill)
4. Verify with `wc -l` and `grep` for expected entries

## Key Files
- `~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md` — combined log (APPEND ONLY)
- `~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/*.md` — individual research files (SOURCE OF TRUTH)
- `~/.hermes/skills/data-science/research-md-append-only/SKILL.md` — append-only pattern skill
- `~/.hermes/skills/wealthforge/research-append-safety/SKILL.md` — append safety protocol
