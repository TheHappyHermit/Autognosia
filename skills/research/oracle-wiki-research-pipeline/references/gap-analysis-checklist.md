# Gap Analysis Checklist for Oracle Wiki

Use this checklist when auditing the Oracle wiki before declaring it comprehensive.
Run each category and record findings in `GAP-ANALYSIS-ROUND{N}.md`.

## 1. Enumerate Vault State

```bash
# File count
find ${HOME}/.autognosia/oracle/brain -name "*.md" -type f | wc -l

# Directory listing
find ${HOME}/.autognosia/oracle/brain -maxdepth 1 -type d | sort

# Total size
du -sh ${HOME}/.autognosia/oracle/brain
```

## 2. Sample Core Files for Depth

Read 8-12 representative files across domains. Check:
- Character count (minimum viable: ~5,000 chars; optimal: >10,000 chars)
- Structured subsections (not just walls of text)
- Citations/references to specific papers and dates
- AI-relevance mapping (does it connect back to agent design?)

## 3. Keyword Searches for Researchers/Topics

**Command pattern:**
```bash
# Find which files mention a topic
grep -rl -i "researcher_name" ${HOME}/.autognosia/oracle/brain --include="*.md"

# Count mentions per file (assess depth)
grep -c -i "researcher_name" ${HOME}/.autognosia/oracle/brain/path/to/file.md
```

**Researchers to check (minimum set):**
- Philosophers: Descartes, Locke, Hume, Kant, Wittgenstein, Russell
- Cognitive scientists: Minsky, Hofstadter, Clark (predictive processing), Barrett (constructed emotion), Seth (illusionism), Chalmers (hard problem)
- Neuroscientists: Kandel (synaptic plasticity), Koch (consciousness), Deisseroth (optogenetics)
- Developmental: Bowlby, Ainsworth (attachment), Spelke (core knowledge)
- AI pioneers: Turing, Simon, LeCun, Hinton, Hassabis, Sutskever

## 4. Keyword Searches for Domains

**Command pattern:**
```bash
grep -rl -i "domain_keyword" ${HOME}/.autognosia/oracle/brain --include="*.md"
```

**Domains to check:**
- `pain nociception nociceptor` — pain and nociception
- `microbiome gut-brain microbiota` — gut-brain axis
- `cortisol oxytocin neuroendocrine hormonal` — hormones
- `circadian chronobiology suprachiasmatic` — circadian rhythms
- `temporal cognition time perception chronesthesia` — temporal cognition
- `cross-cultural cultural neuroscience` — cultural cognition
- `aging cognitive decline healthy aging` — aging
- `gender sex difference` — sex differences
- `social neuroscience` — social neuroscience
- `causal reasoning causal inference Pearl` — causal AI
- `foundation model capabilities research` — foundation models
- `training dynamics loss landscape` — training dynamics
- `multimodal vision-language` — multimodal learning

## 5. Web Search for Cutting-Edge Research

Search for 2025-2026 research in suspected gap areas:
```
<topic> neuroscience 2025 2026
<topic> AI machine learning 2025 2026
```

## 6. Cross-Reference and Prioritize

For each gap found:
- **HIGH**: Entire domain missing; critical for "totality" goal; high research velocity
- **MEDIUM**: Partially covered but needs standalone treatment; moderate research velocity
- **LOW**: Mentioned but needs depth upgrade; established research with low velocity

## 7. Write Report

Output to `${HOME}/.autognosia/oracle/brain\GAP-ANALYSIS-ROUND{N}.md` with:
- Executive summary
- HIGH/MEDIUM/LOW priority gaps with justification
- Suggested document scope for each gap
- Cross-cutting themes assessment table
- Summary of recommended actions with estimated effort

## Pitfalls

- **search_files tool fails on Windows vault paths** — use `grep -rl` in terminal instead
- **Dedup may skip skill_view content** — if SKILL.md was loaded pre-compaction, content_returned=false; load a support file to break dedup
- **Don't skip the write_file step** — the gap analysis report IS the deliverable
- **Verify depth, not just existence** — a file existing doesn't mean the topic is covered adequately
