---
name: llm-wiki-commands
description: "Slash commands for LLM Wiki: ingest, query, lint."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [wiki, llm-wiki, slash-commands, ingest, query, lint]
    related_skills: [llm-wiki]
---

# LLM Wiki Slash Commands

Provides three slash commands for easy wiki operations at `$HOME/.autognosia/active-wiki`.

## Commands

### `/wiki_ingest <source>`

Ingest a source into the wiki. Source can be:
- URL: `https://arxiv.org/abs/2402.03300`
- Local file: `~/paper.pdf`, `/path/to/file.md`
- Raw text: `"GRPO is a new RL algorithm..."`

**Automatically:**
1. Saves raw source to `raw/articles/`, `raw/papers/`, or `raw/transcripts/` with frontmatter
2. Extracts entities/concepts
3. Updates/creates pages in `entities/`, `concepts/`, `comparisons/`
4. Adds `[[wikilinks]]` and provenance `^[raw/...]`
5. Updates `index.md` and `log.md`
6. Reports every file changed

### `/wiki_query <question>`

Ask against the wiki's compiled knowledge.

**Automatically:**
1. Reads `index.md` + searches for key terms
2. Reads relevant pages
3. Synthesizes answer with citations
4. Files substantial answers to `queries/` or `comparisons/`
5. Updates `log.md`

### `/wiki_lint [full|quick]`

Health check. Default `full`.

- `full` — All 11 categories
- `quick` — Orphans, broken links, index only

## Implementation

These are Hermes slash commands invoking the `llm-wiki` skill.