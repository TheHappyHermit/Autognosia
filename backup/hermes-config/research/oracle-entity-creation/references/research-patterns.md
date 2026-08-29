# Research Patterns for Oracle Entity Creation

## Fallback Priority When Tavily Fails (HTTP 432)

Tavily web_search and web_extract both return HTTP 432 when the backend is degraded. This has occurred repeatedly across sessions (Rich Sutton, Thomas Metzinger, etc.). When it happens, follow this fallback order:

### 1. PRIMARY: browser_navigate → browser_snapshot(full=true) → read_file cache

For biographical entities, this is the fastest and most reliable path:

1. `browser_navigate("https://en.wikipedia.org/wiki/Page_Name")`
2. `browser_snapshot(full=true)` — returns full accessibility tree with all content
3. If truncated (>15K chars), `read_file` on the cache path shown in snapshot output
4. Synthesize directly — Wikipedia alone often covers all mandated sections

**Why this over curl:** Wikipedia's HTML is complex and changes frequently. The browser's accessibility tree gives clean, structured text without regex/HTML parsing. The `action=raw` wikitext endpoint also works but requires post-processing.

### 2. SECONDARY: curl for specific data points

Use curl when you need structured data from APIs or raw files:
- GitHub READMEs: `curl -sL "https://raw.githubusercontent.com/..."`
- arXiv abstracts: `curl -sL "https://arxiv.org/abs/..." | grep -i 'og:description'`
- Meta tags from any site: `curl -sL "..." | grep -i 'description'`

### 3. TERTIARY: Internal knowledge

For well-known entities (major researchers, established concepts), internal knowledge is reliable. Use when all external tools fail.

## Domain Repurposing / Redirect Trap

A subject's own website may have been repurposed, parked, or redirected to an unrelated site. Example: `metzinger.org` redirected to `mmconcepts.org` (a web design agency). Always verify the landing page matches expectations before treating it as a valid source. Wikipedia and institutional pages are more stable.

## What Wikipedia Provides for Entity Files

- Complete biography (education, positions, citizenship)
- Publications and contributions
- Awards and honors
- Views and positions
- Institutional affiliations and timeline
- Bibliography with dates and publishers
- External links and references

This single source often covers all mandated sections for a person entity file, making parallel web_search calls optional rather than mandatory.

## Size Trimming for Large Targets

For 15–25KB entity files, first drafts can reach 30KB+. Use `patch` → `wc -c` iteration. After each `patch`, re-read the affected region to verify no content corruption (especially LaTeX math — `\right]` can become `ight]`).

## LaTeX Math Corruption During `patch`

When trimming sections containing LaTeX math (`\left[`, `\right]`, `\nabla`, etc.), the backslash-`r` in `\right` can be silently dropped, producing broken output like `ight]`. Always re-read the patched region after any `patch` that touches math formulas.

## Frontmatter Convention

Oracle entity files use YAML frontmatter. Current convention (as of 2026-08-10):

```yaml
---
title: "Full Name"
created: "YYYY-MM-DD"
type: entity_profile
tags: [relevant, tags]
confidence: 0.9
---
```

Note: Earlier versions used `id:`, `status:`, `provenance:`, and `related:` fields. Newer files drop these in favor of a simpler schema. When updating existing entities, preserve their original frontmatter keys.
