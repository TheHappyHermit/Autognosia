# Improvement Proposals

**Date:** 2026-08-13
**Auditor:** Hermes Agent
**Scope:** Memory deduplication, wiki friction, Obelisk vs SQLite, Freestyle vs backup, metadata simplification

---

## 1. Memory Deduplication Across Tiers

### The Problem

The same fact can exist in hot memory (persistent memory), warm memory (Graphify/Honcho), AND cold memory (wiki). When they conflict, Hermes has no way to know which is authoritative.

**Example:** User says "I prefer dark mode" → stored in hot. Later wiki page created with "User prefers light mode." Now two tiers disagree.

### The Solution: Tier Precedence + Conflict Detection

**Tier Precedence Rule:**
1. **Hot memory is authoritative** for preferences and corrections (most recent)
2. **Wiki is authoritative** for settled knowledge and decisions (most deliberate)
3. **Warm memory is derived** — it should never contradict hot or wiki, only supplement

**Conflict Detection Job (Weekly):**
```
Scan hot memory entries → compare against wiki pages
If conflict found → flag for user review
Format: "Hot says X, wiki says Y. Which is correct?"
```

**Implementation:**
- Add a `last_verified` timestamp to wiki frontmatter
- Weekly cron job scans hot memory against wiki, flags conflicts
- When user corrects, update BOTH tiers immediately

**Why This Works:**
- No deletion — all information preserved
- User is the arbiter, not the algorithm
- Conflicts are surfaced, not silently resolved

---

## 2. Wiki Entry Friction Reduction

### The Problem

Current schema requires filling out 10+ YAML fields plus source reference. Users skip filling them out, leading to inconsistent metadata.

### The Solution: Two-Tier Ingestion

**Quick-Insert Mode (default):**
```yaml
---
id: auto-generated
title: (required)
created: auto
updated: auto
---
```
Only `title` required. Everything else optional. Hermes auto-fills `id`, `created`, `updated`.

**Full Schema Mode (optional):**
When user wants full metadata, they can expand to complete schema (salience, knowledge_type, etc.) via command or prompt.

**Auto-Suggest Metadata:**
After quick-insert, Hermes can scan the content and suggest:
- `knowledge_type` (evergreen/temporal/historical)
- `tags` (from content analysis)
- `project_ids` (from folder location or content)

User confirms or edits → metadata enriched without friction.

**Why This Works:**
- Reduces entry from 10+ fields to 1 (title)
- Progressive disclosure — power users get full control
- Auto-suggest reduces typing, not thinking

---

## 3. Obelisk Engine vs SQLite

### Research Findings

**Obelisk Engine** (2026, pre-release):
- Open-source, WebAssembly-based workflow engine written in Rust
- Claims "SQLite beats cloud queues for AI agent orchestration"
- Designed for **workflow orchestration** — multi-step task DAGs with dependencies
- WASM sandboxing for isolation

**Autognosia's Current Approach:**
- SQLite + Python scripts + cron jobs
- Good for **state storage** and **scheduled execution**
- Not good for complex workflows (A→B→C with conditional branching)

### Recommendation

**Keep SQLite, add workflow patterns.**

Autognosia doesn't need Obelisk Engine. It needs two patterns that Obelisk provides:

1. **Task DAGs:** Dependencies between tasks (already partially supported in schema)
2. **Conditional branching:** "If X completes, start Y"

These can be added to the existing SQLite + organizer-state skill:

```python
# Pseudocode for task DAG execution
def on_task_complete(task_id):
    # Find tasks that depend on this one
    next_tasks = db.query("SELECT * FROM tasks WHERE dependency = ?", task_id)
    for task in next_tasks:
        if all_dependencies_met(task):
            execute_task(task)
```

**Why This Works:**
- No new dependency (keep SQLite)
- No Rust/WASM complexity
- Solves the actual problem (recurring tasks + dependencies)

---

## 4. Freestyle Git vs Current Backup

### Research Findings

**Freestyle Git** (2026):
- "Every agent workspace can be backed by a real Git repo and real branches"
- Designed for **workspace version control** — code, configs, artifacts
- Branching for experiments
- Screenshots, transcripts, summaries backed up

**Autognosia's Current Approach:**
- Git backup of config, profiles, skills, cron
- Single branch (main)
- Excludes runtime/cache/secrets

### Recommendation

**Autognosia's approach is sufficient. No change needed.**

Freestyle Git is for **agent workspaces** (code, artifacts, experiments). Autognosia backs up **configuration** (profiles, skills, cron). These are different problems.

**One improvement:** Add a pre-commit hook to prevent accidental secret commits.

```bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -qE '\.env|secrets/|auth\.json'; then
    echo "ERROR: Attempting to commit secrets. Aborted."
    exit 1
fi
```

**Why This Works:**
- Catches accidents before they reach GitHub
- No behavioral change needed
- One-time setup

---

## 5. Metadata Simplification

### The Problem

Current salience metadata has 6 fields:
- `user_importance` (low/medium/high/critical)
- `unresolved` (boolean)
- `conflict` (boolean)
- `novelty` (low/medium/high)
- `active_project` (boolean)
- `risk` (low/medium/high)

Plus frontmatter fields:
- `id`, `title`, `created`, `updated`
- `status`, `knowledge_type`
- `researched_at`, `valid_as_of`, `review_after`
- `project_ids`, `tags`
- `salience` (6 sub-fields)

**Total: 17+ fields.** Most users won't fill them out.

### The Solution: Minimal Schema + Progressive Enhancement

**Minimal (required):**
```yaml
---
id: auto
title: (user provides)
created: auto
updated: auto
---
```

**Standard (auto-suggested, user-confirmed):**
```yaml
---
id: auto
title: (user provides)
created: auto
updated: auto
type: evergreen | temporal | historical
tags: [auto-suggested]
source: session:YYYYMMDD_HHMMSS
---
```

**Full (optional, power users):**
```yaml
---
id: auto
title: (user provides)
created: auto
updated: auto
type: evergreen | temporal | historical
status: recent | active | pinned | archived
knowledge_type: evergreen | temporal | historical
researched_at: YYYY-MM-DD
valid_as_of: YYYY-MM-DD
review_after: YYYY-MM-DD
project_ids: []
tags: []
salience:
  user_importance: low | medium | high | critical
  unresolved: false
  conflict: false
  novelty: low | medium | high
  active_project: false
  risk: low | medium | high
---
```

**Auto-Suggestion Logic:**
- `type`: "evergreen" if no dates mentioned, "temporal" if dates in past, "historical" if all dates in past
- `tags`: Extract from content (noun phrases, project names)
- `project_ids`: Inherit from folder path if page is in `projects/X/`

**Why This Works:**
- 80% of entries use minimal schema (just title)
- 15% use standard (auto-suggested metadata)
- 5% use full (power users with specific needs)
- Metadata quality improves over time via auto-suggestion

---

## Summary

| Issue | Solution | Effort |
|-------|----------|--------|
| Memory duplication | Tier precedence + weekly conflict detection | Medium |
| Wiki friction | Quick-insert mode + auto-suggest metadata | Low |
| Obelisk vs SQLite | Keep SQLite, add task DAG pattern in organizer-state | Low-Medium |
| Freestyle vs backup | No change needed, add pre-commit hook | Low |
| Over-structured metadata | Three-tier schema (minimal/standard/full) | Low |

All solutions are additive — they don't break existing functionality. They can be implemented incrementally.

---

## Sources Consulted

- "SQLite Beats Cloud Queues for AI Agent Orchestration" (TechTimes, 2026)
- "Version Control for AI Agents" (Freestyle Blog, 2026)
- "AI Agent Memory 2026: Progress Benchmark Report" (Mem0)
- "AI Agent Delegation Patterns: Four Best Architectures for 2026" (Fast.io)
- Karpathy's LLM Wiki (GitHub, 20K+ stars)
