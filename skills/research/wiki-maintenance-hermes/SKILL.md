---
name: wiki-maintenance-hermes
description: "Run a Karpathy LLM Wiki with Hermes as primary maintainer."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [wiki, llm-wiki, karpathy, maintenance, cron, ingestion, lint, obsidian-plugin]
    related_skills: [llm-wiki, hermes-agent, obsidian]
---

# Wiki Maintenance with Hermes

Operational guide for running a **Karpathy-pattern LLM Wiki** where **Hermes is the sole maintainer** (no plugin dependency).

## When This Skill Activates

Use this skill when the user wants to:
- Set up a new LLM Wiki from scratch with Hermes as maintainer
- Configure scheduled lint/ingestion via cron
- Fix tag taxonomy drift or plugin artifact issues
- Run manual or automated wiki health checks

## Prerequisites

- Hermes installed and configured (`hermes setup`, `hermes model`)
- Obsidian vault at wiki path (e.g., `C:\\Hermes\\LLM_WIKI`) — for viewing only
- `WIKI_PATH` env var or default `${HOME}/wiki` pointing to the vault
- User plugin `llm-wiki-commands` installed in `${HOME}/.hermes/plugins/llm-wiki-commands/` for slash commands

## Directory Structure (Standard)

```
wiki/
├── .obsidian/                    # Optional: for Obsidian viewing
├── _archive/                     # Superseded content
├── _meta/                        # topic-map.md at scale (>200 pages)
├── raw/
│   ├── articles/                 # Web articles, clippings
│   ├── papers/                   # PDFs, arxiv papers
│   ├── transcripts/              # Meeting notes, interviews
│   └── assets/                   # Images (attachmentFolderPath)
├── entities/                     # Entity pages (people, orgs, models, tools)
├── concepts/                     # Concept/topic pages
├── comparisons/                  # Side-by-side analyses
├── queries/                      # Filed query results worth keeping
├── SCHEMA.md                     # Conventions, tag taxonomy, operations
├── index.md                      # Sectioned content catalog
├── log.md                        # Chronological action log
├── HOW-TO-USE.md                 # Practical usage guide
└── Welcome.md                    # Entry point with quick links
```

## Operations (Hermes as Sole Maintainer)

| Operation | Command | Description |
|-----------|---------|-------------|
| **Ingest** | `/wiki_ingest <source>` or `hermes chat -q "Ingest <url|file>"` | Full skill, all tools, cron, delegation |
| **Query** | `/wiki_query <question>` or `hermes chat -q "question"` | Reads index, searches, cites pages |
| **Lint** | `/wiki_lint [full\|quick]` or `hermes chat -q "Lint the wiki"` | All 11 categories, cron-schedulable |
| **Schedule** | `hermes cron create "0 3 * * 0" "Lint the wiki..."` | Cron-schedulable |

**Slash commands** are provided by the `llm-wiki-commands` user plugin (`${HOME}/.hermes/plugins/llm-wiki-commands/`). They wrap the `llm-wiki` skill: `/wiki_ingest`, `/wiki_query`, `/wiki_lint`.

## Setup Checklist (New Wiki)

1. **Create structure**:
   ```bash
   mkdir -p wiki/{raw/{articles,papers,transcripts,assets},entities,concepts,comparisons,queries,_meta,_archive}
   ```

2. **Core files** (in order):
   - `SCHEMA.md` — domain, conventions, frontmatter, **tag taxonomy** (add tags BEFORE use)
   - `index.md` — catalog with sections: Entities, Concepts, Comparisons, Queries, Raw Sources, Meta
   - `log.md` — append-only, format `## [YYYY-MM-DD] action | subject`
   - `HOW-TO-USE.md` — ingest/query/lint cheatsheet
   - `Welcome.md` — entry point linking to SCHEMA, index, log, HOW-TO-USE

3. **Seed content**: 1-2 entities, 1-2 concepts, 1 comparison, 1-2 raw sources

4. **Create cron jobs**:
   ```bash
   # Weekly full lint (Sunday 3 AM)
   hermes cron create "0 3 * * 0" "Lint the wiki and report any orphans, broken links, contradictions, stale pages, source drift, tag issues, or index gaps. Check all 11 lint categories from SCHEMA.md."
   
   # Daily quick check (6 AM)
   hermes cron create "0 6 * * *" "Quick wiki health check: orphans, broken links, index completeness only."
   ```

5. **Start gateway** (required for cron):
   ```bash
   hermes gateway install    # Windows Scheduled Task
   # or
   hermes gateway run        # Foreground terminal
   ```

## Tag Taxonomy Management

**Rule**: Every tag on a page must exist in `SCHEMA.md` taxonomy BEFORE use.

When lint reports "tags not in taxonomy":
1. Open `SCHEMA.md`
2. Add missing tags to appropriate section (Core Domain / Entity / Concept / Meta)
3. Save — now the tags are valid

Common entity tags to include: `agent`, `multi-platform`, `skills`, `memory`, `delegation`, `framework`, `company`, `model`, `paper`, `benchmark`, `dataset`

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Orphan raw sources | Raw sources linked via `sources:` frontmatter, not wikilinks | Expected — no action needed |
| Tag taxonomy gaps | New tags used without adding to SCHEMA | Add to SCHEMA.md first, then use |
| Cron not firing | Gateway not running | `hermes gateway install` or keep `hermes gateway run` terminal open |
| Orphan pages | Pages with zero inbound `[[wikilinks]]` | Add cross-links from related pages or archive |
| Broken wikilinks | Links use short names but files in subdirectories | Use full wikilink paths or add to index.md |

## Lint Categories (11, in severity order)

1. **Orphans** — zero inbound `[[wikilinks]]`
2. **Broken links** — `[[links]]` to non-existent pages
3. **Index completeness** — every wiki page in `index.md`
4. **Frontmatter validation** — required fields, tags in taxonomy
5. **Stale content** — `updated` >90 days vs newest relevant source
6. **Contradictions** — `contested: true`, conflicting claims
7. **Quality signals** — `confidence: low`, single-source pages
8. **Source drift** — `sha256` mismatch in `raw/`
9. **Page size** — pages >200 lines (split candidates)
10. **Tag audit** — tags not in SCHEMA taxonomy
11. **Log rotation** — >500 entries in `log.md`

## Ingestion Workflow (Hermes)

```bash
# URL
hermes chat -q "Ingest https://arxiv.org/abs/2402.03300"

# Local file
hermes chat -q "Ingest ${HOME}/paper.pdf"

# Paste
hermes chat -q "Ingest this: [content]"
```

Hermes auto:
1. Saves raw source to `raw/{articles,papers,transcripts}/` with `source_url`, `ingested`, `sha256`
2. Extracts entities/concepts
3. Updates/creates pages in `entities/`, `concepts/`, `comparisons/`
4. Adds `[[wikilinks]]` (min 2/page) and provenance `^[raw/...]`
5. Updates `index.md` and `log.md`
6. Reports every file changed

## Reference Files

- `references/karpathy-gist.md` — Original Karpathy LLM Wiki gist (source of truth)
- `references/tag-taxonomy-template.md` — Starter tag taxonomy for AI/ML domain
- `references/cron-templates.md` — Ready-to-use cron job definitions
- `references/llm-wiki-commands-plugin.md` — User plugin providing `/wiki_ingest`, `/wiki_query`, `/wiki_lint` slash commands