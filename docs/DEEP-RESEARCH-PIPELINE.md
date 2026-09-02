# Deep Research Pipeline — Self-Directed Knowledge Building

The Oracle Brain grows through an autonomous research loop that chooses its own
topics, researches them deeply on the live web, and writes permanent,
well-cited OKF v2 pages into long-term memory.

```
pick_next_wiki_topic.py          the nightlies + frontier cron
  │ (deterministic picker:            │
  │  exchange requests first,         │
  │  then the cognition frontier      │
  │  catalog; skips existing pages)   │
  ▼                                   ▼
research agent session  ──writes──▶  oracle/brain/<Domain>/<Topic>.md
                                     (OKF v2 frontmatter, 2500–5000 words)
  │
  ├─▶ brain_sync.py (hourly cron) ──▶ Brain Search index (searchable)
  └─▶ logs/deep_research.log       audit trail of every page built
```

## Topic selection (`pick_next_wiki_topic.py`)

Priority order:
1. Pending packages in `~/.autognosia/exchange/research/*.json` — moved to
   `archive/` when picked (consumed exactly once).
2. The built-in **frontier catalog**: ~40 topics across Memory Architecture,
   Prospective Memory, Metacognition, Executive Control, Attention, Learning,
   Predictive Processing, Distributed Cognition, Consolidation, Emotion &
   Salience, and Knowledge Representation — chosen because each one maps onto
   a concrete subsystem of a faithful AI cognitive architecture (memory tiers,
   intention engine, action gate, verifier, routing).

A topic is skipped if a substantially similar page already exists (fuzzy slug
match), so the loop never duplicates or overwrites.

## Page contract (OKF v2)

```yaml
---
title: "<Topic Title>"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
type: research_report
tags: [four_to_eight, lowercase_tags]
confidence: 0.80-0.95
sources: [primary URLs actually consulted]
---
```

Sections: Overview · Core Mechanisms · Key Research & Evidence ·
Computational & Agent Parallels · Overlaps & Tensions · Open Questions ·
Sources. Depth target **2,500–5,000 words** — these are permanent long-term
memories, not stubs.

## Operating jobs

| Job | Schedule | Role |
|-----|----------|------|
| Oracle Knowledge Expansion batch 0–4 | nightly, staggered | one deep page each |
| Frontier Research Trial | every 5 minutes (temporary) | accelerated build-out; silence on success |

Every job responds `[SILENT]` on success; failures go to
`logs/deep_research_failures.log`. Nothing is delivered to chat unless a human
asks.
