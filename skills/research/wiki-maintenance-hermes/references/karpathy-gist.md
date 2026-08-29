# Karpathy LLM Wiki Gist (Source of Truth)

This is the original gist by Andrej Karpathy that defines the LLM Wiki pattern.

**URL**: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## Core Idea

Instead of RAG (rediscovering knowledge from scratch per query), the LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files that sits between you and the raw sources. When you add a new source, the LLM reads it, extracts key information, and integrates it into the existing wiki — updating entity pages, revising topic summaries, noting contradictions, strengthening the evolving synthesis.

**Key difference**: The wiki is a persistent, compounding artifact. Cross-references are already there. Contradictions have already been flagged. Synthesis already reflects everything ingested.

## Architecture: Three Layers

1. **Raw sources** — Immutable. Articles, papers, images, data files. LLM reads but never modifies.
2. **The wiki** — LLM-owned markdown files. Summaries, entity pages, concept pages, comparisons. LLM creates, updates, cross-references.
3. **The schema** — Document (CLAUDE.md, AGENTS.md, SCHEMA.md) telling the LLM structure, conventions, workflows.

## Operations

### Ingest
- Capture raw source to `raw/`
- Discuss takeaways with human
- Search existing pages for mentioned entities/concepts
- Write/update wiki pages with `[[wikilinks]]` and provenance `^[raw/...]`
- Update `index.md` and `log.md`

### Query
- Read `index.md` to identify relevant pages
- For 100+ pages, also search content for key terms
- Read relevant pages, synthesize answer with citations
- File valuable answers back to `queries/` or `comparisons/`

### Lint
- Orphan pages (zero inbound wikilinks)
- Broken wikilinks
- Index completeness
- Frontmatter validation
- Stale content (>90 days)
- Contradictions (`contested: true`)
- Quality signals (`confidence: low`)
- Source drift (`sha256` mismatch)
- Page size (>200 lines)
- Tag audit (tags not in taxonomy)
- Log rotation (>500 entries)

## Indexing and Logging

- **index.md** — Content-oriented catalog. One line per page: wikilink + summary. Organized by category.
- **log.md** — Chronological append-only record. Format: `## [YYYY-MM-DD] action | subject`

## Why This Works

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims, maintaining consistency across dozens of pages. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero."

## Division of Labor

| Human | LLM Agent |
|-------|-----------|
| Curates sources | Summarizes, extracts, files |
| Directs analysis | Cross-references, links |
| Asks good questions | Maintains consistency |
| Thinks about meaning | Bookkeeping, index, log |

## Optional CLI Tools

- **qmd** (github.com/tobi/qmd) — Local hybrid BM25/vector search for markdown, CLI + MCP server
- At scale: SQLite FTS5 + on-device embeddings, reciprocal-rank-fused