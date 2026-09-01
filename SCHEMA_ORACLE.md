---
okf_version: "0.2"
type: Schema
title: Unified Wiki Schema (OKF v0.2 + Extensions)
description: Single shared frontmatter and convention standard for BOTH the Active Wiki and the Oracle Brain.
status: stable
---

# Unified Wiki Schema — OKF v0.2 + Extensions

This schema is the ONE standard for **both** the Active Wiki and the Oracle Brain.
Every page in either wiki MUST conform to it. Nothing here is optional for new pages.

## Domain

> **Active Wiki** — Josh's personal knowledge base: life, decisions, projects, systems,
> preferences, purchases, troubleshooting, household, travel, health, learning, and
> durable personal knowledge.
>
> **Oracle Brain** — Specialist reference vault: curated research, entity profiles, and
> domain expertise ingested from external sources.

## Conventions

- **File names:** lowercase, kebab-case, no spaces (e.g., `new-laptop-purchase.md`)
- **Every wiki page starts with YAML frontmatter** (see below)
- **One H1 per page**, predictable H2 sections
- **Use `[[wikilinks]]`** to link between pages when ambiguity is possible
- **Update existing pages before creating new pages**
- **Every action appended to `log.md`**
- **Preserve history** — archive, supersede, complete, or cancel rather than silently delete
- **Generated views live OUTSIDE the wiki** (e.g. `_views/`) to prevent Obsidian ingestion of operational state

## Frontmatter

### Required (every page MUST have these)

```yaml
---
okf_version: "0.2"
id: stable-id              # unique, stable, kebab-case
title: Human Readable Title
type: <page-type>          # see Allowed Page Types
status: <lifecycle-status>  # see Allowed Lifecycle Statuses
created: 2026-08-04
updated: 2026-08-04
---
```

### Recommended (use whenever relevant)

```yaml
description: One-line summary of the page
tags: []
sources: []
generated: {by: autognosia/orchestrator, at: 2026-08-04T00:00:00Z}
confidence: high          # high | medium | low
epistemic: fact           # see Allowed Epistemic Labels
wikilinks: []             # explicit outbound links for graph tooling / backlinks
aliases: []
```

### Optional

```yaml
review_after: 2026-12-01
related: []
supersedes: []
superseded_by: []
```

## Allowed Page Types

```
profile
person
project
decision
system
asset
purchase
trip
routine
idea
question
lesson
reference
incident
Index
```

## Allowed Epistemic Labels

```
fact
observation
explicit-preference
verified-inference
hypothesis
prediction
decision
```

## Allowed Lifecycle Statuses

```
draft          # OKF: work in progress, not yet validated
stable         # OKF: validated, safe to rely on
deprecated     # OKF: superseded, do not use
active
current
waiting
blocked
completed
cancelled
disputed
superseded
stale
unverified
archived
```

## Raw Sources

Raw captures in `inbox/raw/YYYY/MM/` are immutable after capture. Processing status
stored in organizer.db.

```yaml
---
source_id: unique-stable-source-id
capture_channel: web-clipper
captured_at: 2026-08-04T21:00:00-07:00
source_url:
title:
author:
published:
content_type:
content_hash:
why_saved:
---
```

## Page Thresholds

- **Create a page** when information is durable and personally relevant
- **Add to existing page** when a source mentions something already covered
- **DON'T create a page** for passing mentions or transient information
- **Split a page** when it exceeds ~200 lines and contains distinct topics
- **Archive a page** when superseded — move to `archive/`, update index

## Cross-References

- Use full vault-relative wikilinks when ambiguity is possible
- Use tags only when they support real filtering or browsing
- Do not duplicate `type`, `status`, or domain as redundant tags
- Prefer a few coherent hub pages over many tiny atomic notes

## Update Policy

When new information conflicts with existing content:
1. Check dates — newer sources generally supersede older ones
2. If genuinely contradictory, note both positions with dates and sources
3. Flag for review in `_queues/contradictions/`
4. Do not silently choose one side

## Log Rotation

When `log.md` exceeds 500 entries, rename to `log-YYYY.md` and start fresh.
