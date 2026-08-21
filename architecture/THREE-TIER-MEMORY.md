# Three-Tier Memory Architecture

This document describes the three-tier memory system used by Autognosia — a cascade architecture where information flows downward through consolidation, never disappearing.

## Overview

```
HOT (persistent memory)  →  WARM (Honcho + Graphify)  →  COLD (wiki)
   Always loaded              On-demand retrieval          Archived
   ~2200 chars                Honcho: autobiographical    Unlimited
                              Graphify: knowledge graph
```

**Key principle:** Old ≠ wrong. Knowledge is consolidated by moving down tiers, never deleted. The wiki represents crystallized expertise — settled decisions and preferences preserved with full provenance.

---

## Tier 2: Warm Memory (Honcho + Graphify)

Warm memory has **two components**, each serving a different domain:

### Honcho — Autobiographical Warm Memory

**Capacity:** Unlimited (PostgreSQL + pgvector)
**Content:** Preferences, patterns, habits, user model

- User preferences and communication style
- Recurring goals and behavioral patterns
- Autobiographical context (who is this user?)
- Queried via Hermes's memory system

### Graphify — Knowledge Relationship Warm Memory

**Capacity:** Unlimited nodes and edges
**Content:** Relationship and connectivity knowledge extracted from the wiki

- Cross-references between wiki pages
- Semantic relationships between concepts
- Multi-hop connectivity (how does X connect to Y through Z?)
- Queried via Graphify semantic search (`graphify query`, `graphify path`, `graphify explain`)

### Why Two Warm Components?

Honcho answers "who is this user, what do they prefer?"
Graphify answers "how does my knowledge connect, what relates to what?"

They serve different retrieval needs and are queried in different contexts. Both are "warm" because they are not loaded every turn — only fetched on-demand when the current question requires that type of context.

---

## Tier 1: Hot Memory (Persistent Memory)

**Capacity:** ~2200 characters (always loaded in system prompt)
**Content:** Active preferences, current conventions, immediate context

### What Lives Here

- Active user preferences (model choices, coding style, naming conventions)
- Current project focus and immediate priorities
- Active system/environment conventions
- Recently learned corrections (highest priority)

### Characteristics

- Loaded into every conversation turn — zero latency
- Extremely limited capacity — every character counts
- Highest priority: corrections and friction signals
- Consolidated downward when capacity approaches 80%

### Threshold Trigger

When hot memory exceeds ~80% capacity (~1760/2200 characters), consolidation is triggered immediately. The `prompt-me` skill monitors this threshold.

---

## Tier 2: Warm Memory (Graphify Semantic Search)

**Capacity:** Unlimited nodes and edges
**Content:** Relationship and connectivity knowledge extracted from the wiki

### What Lives Here

- Cross-references between wiki pages
- Semantic relationships between concepts
- Multi-hop connectivity (how does X connect to Y through Z?)

### Characteristics

- Queried via Graphify semantic search (`graphify query`, `graphify path`, `graphify explain`)
- Not loaded every turn — only fetched on-demand
- Built from the wiki during Graphify ingestion
- Stale when wiki changes significantly (requires re-ingestion)

### Graphify Commands

```bash
# Build graph from wiki
graphify extract ~/.autognosia/active-wiki --out ~/.autognosia/graphify-main-out

# Query relationships
graphify query "How does X connect to Y?" --graph ~/.autognosia/graphify-main-out

# Explain a concept
graphify explain "concept name" --graph ~/.autognosia/graphify-main-out

# Find path between nodes
graphify path "NodeA" "NodeB" --graph ~/.autognosia/graphify-main-out
```

---

## Tier 3: Cold Memory (Wiki)

**Capacity:** Unlimited (filesystem-backed markdown)
**Content:** Archived knowledge, settled decisions, historical context

### What Lives Here

- Crystallized expertise and settled preferences
- Historical decisions with reasoning preserved
- Project archives (completed work)
- Reference documentation
- Domain-specific knowledge organized by topic

### Characteristics

- Full-text searchable via wiki index
- Linkable pages with `[[wikilinks]]` for cross-references
- Source references mandatory — every archived entry has provenance
- Structured with YAML frontmatter (id, title, type, status, dates, tags)

### Why Cold Memory Matters

Without cold memory, knowledge is lost when it leaves the hot tier. The wiki ensures:
1. **Auditability** — You can trace why a decision was made
2. **Continuity** — New sessions inherit crystallized expertise
3. **Reversibility** — Old decisions can be found and updated
4. **Growth** — The wiki grows as expertise crystallizes

---

## Cascade Consolidation

### The Flow

```
User learns something new
    ↓
Hot memory (if active/immediate)
    ↓ (when hot fills up)
Cold memory (wiki page with frontmatter + source refs)
    ↓ (periodic Graphify ingestion)
Warm memory (Graphify semantic relationships)
```

### Consolidation Steps

1. **Demote hot → cold:** Create wiki page for settled preference or decision
2. **Re-ingest wiki → warm:** Run Graphify extraction to update semantic graph
3. **Verify:** Check that demoted content is accessible in the new tier
4. **Log:** Record the consolidation in `wiki/system/memory-archive/log.md`

### User Approval

Consolidation requires user approval before writing to the wiki. The agent proposes the consolidation, explains what's being archived and why, and waits for confirmation.

---

## Source References: The "Road Back to Evidence"

Every piece of stored knowledge should preserve its origin:

```yaml
---
source: "User conversation, 2026-08-06"
source_type: conversation
verified: true
---
```

### Source Types

- `conversation` — Direct user statement
- `decision` — Explicit user decision
- `observation` — Agent observation confirmed by user
- `research` — Researcher findings (untrusted until verified)
- `oracle` — Oracle vault reference
- `file` — Imported from external file

### Why This Matters

Without source references, stored knowledge becomes dogma. With them, you can:
- Trace back to the original context
- Determine if a decision still applies
- Identify whose opinion a claim represents
- Spot stale information

---

## Persona Audit: Monthly Review

A monthly consolidation review audits all three tiers:

### What Gets Checked

1. **Hot memory:** Is everything still relevant? Remove stale entries.
2. **Wiki:** Do pages need updates, merges, or corrections?
3. **Graphify:** Is the semantic graph current? Re-ingest if stale.
4. **User model:** Does the agent's understanding of the user still match reality?

### The Monthly Review Process

1. Load current hot memory and identify stale entries
2. Check wiki for stale `review_after` dates
3. Compare Graphify stats vs wiki state (divergence = stale graph)
4. Compare stored preferences against current user behavior
5. Log all changes in the memory archive log
6. Update the user persona if needed

---

## Session Audit: Weekly Review

A weekly audit reviews recent sessions for missed knowledge:

### What Gets Checked

1. **Recent sessions:** Last 7 days of conversation history
2. **Missed decisions:** User decisions not saved to wiki
3. **Missed preferences:** Preferences expressed but not recorded
4. **Troubleshooting:** Results worth preserving for future reference
5. **Unresolved issues:** Sessions with open questions or incomplete work

### Output

- Recommendations for wiki entries to create
- List of sessions with unresolved issues
- Summary of knowledge gaps identified

---

## Why Three Tiers?

### Single-Tier Problems

- **All hot:** Context window fills up, costs explode, irrelevant info distracts the model
- **All warm:** Everything needs retrieval, latency increases, nothing is "always known"
- **All cold:** No active context, agent starts every session from zero

### Three-Tier Benefits

- **Hot:** Zero-latency access to what matters right now
- **Warm:** Scalable relationship queries via Graphify
- **Cold:** Unlimited archival with full provenance
- **Together:** Information flows naturally as relevance changes, nothing is truly lost
