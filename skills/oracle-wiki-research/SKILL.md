---
name: oracle-wiki-research
description: "Dispatch researchers to populate the Oracle vault."
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Oracle Wiki Research Dispatch

Populate `${HOME}/.autognosia/oracle/brain/` with entity profiles, domain topics, and gap analyses.

## When to Use

- Adding new entity profiles (researchers, thinkers, scientists)
- Creating domain topic coverage
- Running gap analyses to find missing content
- Filling research gaps identified by the user or gap analysis

## Never Use web_search Directly

All internet research goes through `delegate_task` to leaf subagents.

## Multi-Round Research Pattern

NEVER dispatch single large tasks — they hit context limits. Instead:

1. Dispatch 3 small rounds per entity (5KB max, 1-2 searches each):
   - R1: Foundations / early work / background
   - R2: Major contributions / key ideas
   - R3: AI views / lessons / synthesis / criticisms
2. Write to temp-Subject-R1.md, temp-Subject-R2.md, temp-Subject-R3.md
3. Merge rounds into final Entities/Subject.md
4. Clean up: rm -f temp-*.md

## Single-Dispatch (When It Works)

For well-known figures, a focused single dispatch can succeed.

### ⚠️ Delegation Payload Token Limit (CRITICAL)

The `delegate_task` stream has a hard token limit on the combined prompt + context. Exceeding this causes stream timeouts.

**Hard rules:**
- **ONE entity per delegation call** — never bundle 2-3 entities in one call
- **Keep context minimal** — just the vault path, file limit, and frontmatter format
- **Keep goal concise** — bullet points for sections, not prose paragraphs
- **Single-file delegations complete in minutes** vs hours for oversized batches

## Wave Dispatching

- 1 researcher per call (one entity per delegation)
- Dispatch 2-3 independent calls in parallel when possible
- Wait for batch completion before next wave
- Never flood — if max_iterations, reduce wave size

## Gap Analysis Methodology

When asked to audit the Oracle vault for gaps, use this 5-dimension framework:

1. **Missing subtopics** — Enumerate all domain directories; check each for specific subtopics that should exist but don't
2. **Missing depth** — Measure line counts per directory; flag bimodal distribution (few deep dives vs many shallow entries). Sample actual content, not just file count
3. **Missing interdisciplinary bridges** — Look for neuroscience ↔ AI ↔ philosophy connections mentioned but not developed. Create explicit bridge documents
4. **Missing methods** — Theories without methods are untethered. Check for neuroscience methods, AI methods, cognitive science methods
5. **Missing recent breakthroughs** — Identify paradigm-shifting developments not yet documented

### Gap Analysis Workflow

```
1. Enumerate: find all .md files, count lines per directory
2. Sample: read 5-8 representative files across domains to assess depth quality
3. Compare: check against prior gap analyses to see what's been filled
4. Identify: for each dimension above, list specific missing items with priority
5. Write: organized by category, with actionable items and estimated effort
6. Prioritize: Phase 1 (critical depth) → Phase 2 (bridges) → Phase 3 (methods) → Phase 4 (entities) → Phase 5 (quality)
```

### Output Format

Write to `GAP-ANALYSIS-<LABEL>.md` in the vault root. Structure:
- Executive summary with current stats (entity count, domain count, file count)
- Parts: Depth Gaps, Missing Subtopics, Missing Bridges, Missing Methods, Missing Breakthroughs, Structural Gaps, Quality Issues, Prioritized Action Plan
- Each gap item: what's missing, why it matters, current coverage status, priority level

## Pitfalls

- Context overflow on write_file is the #1 failure mode — multi-round prevents this
- Verify entity exists before dispatching
- Clean orphaned temp files after merge failures
- Gap analysis files can grow large — use write_file directly, not multi-round dispatch
- When web_search fails, rely on file enumeration + content sampling + training knowledge
