---
name: oracle-entity-creation
description: Create new Oracle entity/reference files from web research.
---

# Oracle Entity File Creation

Create new entity or reference pages for the Oracle vault (`${HOME}/.autognosia/oracle/brain\`) from scratch via web research, rather than importing existing files. Distinct from `library-onboarding` (importing files) and `wiki-ingestion` (bulk wiki imports).

## When to Use

- Creating a new entity page (person, organization, concept, technology) for `${HOME}/.autognosia/oracle/brain\Entities\` or domain pages under `${HOME}/.autognosia/oracle/brain\domains\`
- User specifies mandated topics/sections and a size constraint
- Content must be sourced from live web research, not existing files

## Workflow

### 0. Fallback: Browser-Based Research

When `web_search` fails (432 errors, rate limits, API degradation), do NOT fall back to internal knowledge immediately. Try browser-based research first — it produces sourced, current data:

```
browser_navigate("https://en.wikipedia.org/wiki/Page_Name")
browser_snapshot(full=true)
read_file("<cache_path_from_snapshot_output>")
```

The `browser_snapshot(full=true)` returns the accessibility tree with all page content. The cached snapshot file path is shown in the tool output — read it with `read_file` for the full text. This works reliably even when `web_search` is completely down.

### 0.5. Internal Knowledge (First-Class or Fallback)

**Primary path** when the user explicitly says "write from domain knowledge" or "keep research minimal" — skip web research entirely. This works well for established researchers (Turing Award winners, major AI figures), well-known concepts, and historical entities. Draft generously, then trim to size.

**Fallback path** when web tools are unavailable (rate limits, API errors, browser failures) — same approach for well-known entities. Reserve web research for obscure, current, or rapidly-evolving topics.

### 0.5. Read SCHEMA.md and Existing Entity Files

**Always read `${HOME}/.autognosia/oracle/brain\SCHEMA.md`** before writing. It contains authoritative conventions that override any defaults in this skill:

```
read_file("${HOME}/.autognosia/oracle/brain\SCHEMA.md")
```

Key conventions from SCHEMA.md (verify current values each session):
- **Tags:** 2–6 controlled tags per page; no deeply nested YAML
- **Page size:** Typical 50–250 lines; review for split over 200 lines; strong split candidate over 400 lines
- **ID prefixes:** Domain-specific prefixes (e.g., `entity-`, `ai-`, `sec-`, `xd-`) — check SCHEMA.md for current list
- **Provenance values:** `complete`, `partial`, or `missing` — set honestly based on source coverage
- **Wikilinks:** Use `[[wikilinks]]` for vault-relative links; standard Markdown links for external sources

Then search the vault for related entity files to use as format/style reference:

```
search_files(pattern="entity_topic", path="${HOME}/.autognosia/oracle/brain", output_mode="files_only")
read_file(existing_entity.md)
```

Look for: domain documents, related entity profiles, methodology files, and archived research. Vault files provide authoritative context that supplements (or substitutes for) web research — especially when web tools degrade. Cross-reference related entities (co-authors, collaborators, shared institutions) to enrich the profile.

### 1. Parallel Research

Fire all independent searches simultaneously — they don't depend on each other:

```
web_search(topic_1)
web_search(topic_2)
web_search(topic_3)
```

For deep content, supplement with `curl` + inline Python:

```bash
# Wikipedia raw article (avoids HTML parsing)
curl -sL "https://en.wikipedia.org/w/index.php?action=raw&title=Page_Name"

# Official site paragraph extraction
curl -sL "https://example.org/page" | python -c "
import sys, re
html = sys.stdin.read()
for t in re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)[:40]:
    clean = re.sub(r'<[^>]+>', '', t).strip()
    if clean: print(clean)
"
```

### 2. Write the File

- Use `write_file` with complete content
- Structure around mandated sections with clear headings and `---` separators
- Include: key facts, contributions, positions/views, institutional roles, publications, and `[[Related Entities]]` cross-links (wiki-style double-bracket links to other vault pages)
- **Write slightly over the size limit** — it's faster to trim than to write concisely on the first try

### 3. Enforce Size Constraints

- Quick check: `wc -c /path/to/file` (returns bytes). Note: 12KB = 12 × 1024 = 12,288 bytes.
- **Reconcile user's size constraint with SCHEMA.md:** SCHEMA.md says typical pages are 50–250 lines (review for split over 200, strong split candidate over 400). If the user's stated size target would produce a page exceeding SCHEMA.md's split threshold, note this and write the file anyway (user constraint takes precedence) but flag it in the summary.
- If over limit, use targeted `patch` calls to trim verbose sections. Prioritize cutting biographical fluff over technical content.
- Iterate `patch` → `wc -c` until under limit.

### 4. Verify

- Confirm all mandated sections are present
- Confirm file size is within bounds (use `wc -c`)

## Entity File Structure

```markdown
# Entity Name

**Key facts:** (birth/formation, nationality/location, affiliations, awards)

---

## 1. [First Mandated Topic]

[Subsections as needed]

---

## 2. [Second Mandated Topic]

...

---

## Key Works

- [Core publications, ordered by significance]

## Related Entities

- [[Cross-reference]] (wiki-style double-bracket links to other vault entity pages)
```

## Update Workflow (Existing Entities)

Many tasks involve **updating** an existing entity file rather than creating one from scratch:

1. `read_file` the existing entity — assess what's already covered
2. Research ONLY the gaps: new positions, recent awards, new companies, updated views
3. Use `write_file` to replace with enriched content (preserving good existing sections)
4. Write generously, then trim to 12KB using iterative `patch` → `wc -c` cycles
5. Prioritize cutting biographical fluff over technical/substantive content when trimming

### YAML Frontmatter

Oracle entity files DO use YAML frontmatter. Include:

```yaml
---
id: <prefix>-entity-name-here
title: Full Name
domain: domain-name
type: entity
status: current
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - tag-1
  - tag-2
  - tag-3
aliases: []
related:
  - entities/Other-Entity-Name
sources:
  - Source name and year
provenance: complete|partial|missing
---
```

**Key conventions from SCHEMA.md (verify each session):**
- **id prefix:** Use domain-specific prefix from SCHEMA.md's ID Prefixes list (e.g., `entity-`, `ai-`, `sec-`). Add new prefix if domain is new.
- **domain:** Required field — matches the domain of the vault subdirectory
- **tags:** 2–6 controlled tags; do NOT duplicate `domain`, `type`, or `status` as tags
- **provenance:** `complete` (full source coverage), `partial` (some gaps), or `missing` (internal knowledge only)
- **sources:** List actual sources used (Wikipedia, official sites, publications)
- **Keep properties flat** — no deeply nested YAML

## Pitfalls

- **Wikipedia API schema changes:** The `action=query&prop=revisions` JSON API has changed over time. Use `action=raw` for reliable raw wikitext.
- **Overly verbose first drafts:** Write generously, then trim with targeted `patch` calls. Don't try to be concise on the first pass.
- **Large size targets (20KB+):** When the user requests a large entity (20–30KB), first drafts routinely land 40–50% over (40–50KB for a 30KB target). Plan for 10–15 trim passes. Strategy:
  1. Write generously on the first pass — it's faster to trim than to write concisely initially.
  2. After writing, check with `wc -c`. If over, use `patch` with `mode=replace` to target 2–3 verbose sections per pass (biographical narrative, transition paragraphs, redundant explanations).
  3. Check `wc -c` after each round of patches. Repeat until under limit.
  4. **Always prioritize cutting:** biographical fluff, transitional paragraphs, redundant restatements, verbose section introductions. **Never cut:** technical content, key findings, mandated topic coverage.
  5. For very large overages (15KB+), combine multiple targeted patches in a single round rather than trimming one section at a time — this reduces tool-call overhead.
  6. Typical reduction per pass: 1–3KB. Budget accordingly.
- **Table of Contents:** Existing vault entity files (Chomsky, Dennett) include a Table of Contents after the header block. Include one when the page has 6+ sections.
- **Stale data:** Entity pages on active researchers should note current positions. Verify with recent sources, not just Wikipedia.
- **Size trimming:** The `patch` → `wc -c` iteration pattern is reliable. Each `patch` call targets a specific verbose section; check byte count after each pass. Typical first drafts run 13–16KB and need 3–5 trim passes.
- **YAML frontmatter:** Always include YAML frontmatter (id, title, domain, type, status, created, updated, tags, aliases, related, sources, provenance) — even when writing from internal knowledge or under tight constraints. Omitting frontmatter is a common mistake when rushing. Set `provenance: partial` when using internal knowledge without web-sourced verification.
- **Frontmatter drift under pressure:** When writing large entities (20KB+) from internal knowledge under size constraints, agents tend to use a simplified frontmatter (missing `id`, `domain`, `status`, `sources`, `provenance`). Always use the full template from this skill regardless of time pressure — the frontmatter is ~20 lines and does not meaningfully affect size targets.
- **Multi-patch (V4A) unreliability:** The `patch` tool with `mode=patch` (V4A multi-file format) is unreliable for entity trimming — it frequently fails to match context. Always use `mode=replace` with explicit `old_string`/`new_string` for targeted section edits.
- **Parallel patching on the same file is unsafe:** When sending multiple `patch` calls with `mode=replace` on the same file in a single turn, later patches can fail because earlier patches already changed the file content, shifting context. If you need 3+ patches on the same file, either: (a) send them sequentially, checking `wc -c` between rounds, or (b) if sending in parallel, use `old_string` values that are far apart in the file and include enough surrounding context to remain unique after earlier patches land. When a patch fails, re-read the file with `read_file` before retrying — don't guess at the current content.
- **Domain topic files use the same workflow:** The entity-creation workflow (write generously → trim with patches → enforce size) applies equally to domain topic files (e.g., `AI_ML/Alignment-Debate.md`) and methodology files, not just entity profiles. Use the same frontmatter conventions, same trimming strategy, and same cross-referencing patterns.
- **Internal knowledge scope:** Internal knowledge works well for historical figures, established concepts, and well-documented entities. For living researchers, current events, or niche topics, web research is still needed to avoid stale or inaccurate claims.
