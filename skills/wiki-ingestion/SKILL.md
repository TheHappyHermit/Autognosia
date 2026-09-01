---
name: wiki-ingestion
version: 3.0.0
description: >
  Ingest raw content into Active Wiki with dedup, formatting, and source tracking.
  Supports quick-insert (minimal), standard (auto-suggested), and full schema modes.
  Use when processing captured content, research results, or user-provided material.
---

# Wiki Ingestion Skill

## Purpose

Process raw content and ingest it into the Active Wiki with proper formatting, deduplication, and source references.

## Wiki Location

- **Active Wiki**: `~/.hermes-autognosia/active-wiki/`
- **Categories**: `projects/`, `reference/`, `system/`, `personal/`
- **Metadata**: `.meta/` directory for ingestion logs and content hashes

## Workflow

### 1. Receive Raw Content

Content can come from:
- User-provided URLs or text
- Researcher profile results
- Web clippings
- Documents

### 2. Compute Content Hash

Use SHA-256 to hash the content and check against existing wiki pages for duplicates.

### 3. Choose Schema Mode

**Quick-Insert Mode (default):**
Use when user wants fast entry with minimal friction. Only `title` required.

```markdown
---
id: auto
title: Descriptive Title
created: auto
updated: auto
---

# Title

Content here...

Source: session:YYYYMMDD_HHMMSS / url:https://... / user-provided
```

**Standard Mode (auto-suggested):**
Use when user wants structured metadata. Auto-suggest fields from content analysis.

```markdown
---
id: auto
title: Descriptive Title
created: auto
updated: auto
type: evergreen | temporal | historical
tags: [auto-suggested]
source: session:YYYYMMDD_HHMMSS
---

# Title

Content here...

Source: session:YYYYMMDD_HHMMSS
```

**Full Mode (power user):**
Use when user wants complete metadata control.

```markdown
---
id: auto
title: Descriptive Title
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
future_cues:
  - alternate search terms for this content
future_scenarios:
  - situations where this content would be relevant
---

# Title

Content here...

Source: session:YYYYMMDD_HHMMSS / url:https://... / user-provided
```

### Auto-Suggest Logic

When using Standard or Full mode, auto-suggest these fields from content analysis:

- **`type`**: 
  - "evergreen" if no dates mentioned
  - "temporal" if dates in past and present
  - "historical" if all dates in past
- **`tags`**: Extract noun phrases, project names, key concepts
- **`project_ids`**: Inherit from folder path if page is in `projects/X/`
- **`knowledge_type`**: Same as `type` if not explicitly set

### 4. Determine Category

Route content to the appropriate wiki category:
- `system/` — System configuration and memory
- `personal/` — Personal knowledge and decisions
- `projects/` — Project documentation
- `reference/` — Reference material

### 5. Write to Wiki

Create the formatted page in the appropriate category under `~/.hermes-autognosia/active-wiki/`.

### 6. Log the Ingestion

Record the ingestion in the wiki log:
```markdown
YYYYMMDD-HHMMSS: Ingested [title] into [category]/[slug].md | Source: [source] | Mode: quick|standard|full
```

Update `~/.hermes-autognosia/active-wiki/.meta/ingestion-log.md`.

## Source Reference Standards

Every ingested page must include a `Source:` field:
- `session:YYYYMMDD_HHMMSS` — Session where content was created
- `url:https://...` — URL where content was found
- `user-provided` — User provided the content directly
- `researcher:package-id` — From a researcher package
- `oracle:vault-page-id` — From Oracle vault

## Deduplication

- Hash new content and compare against existing pages
- If duplicate found, log it and skip ingestion
- If similar but not identical, create a new page with a cross-reference link

## Prospective Retrieval Indexing

When an important knowledge page is created or materially updated, add **retrieval cues**:
```yaml
future_cues:
  - alternate search term 1
  - alternate search term 2
future_scenarios:
  - situation where this would be relevant
```

These cues are not new facts — they are alternate ways future queries may refer to the same knowledge. Store them in the page's frontmatter.

## Salience Controls

Salience controls retrieval priority and hotness:
- `user_importance` — How important is this to the user?
- `unresolved` — Is there an open question here?
- `conflict` — Does this conflict with other knowledge?
- `novelty` — How new is this information?
- `active_project` — Is this tied to an active project?
- `risk` — What's the risk if this is wrong or missing?

Salience does NOT authorize deletion — only prioritization.

## Related Bundled Skills

- **`llm-wiki`** — For advanced wiki architecture (schema, index, log, provenance markers). Use when setting up a new wiki or restructuring an existing one. This skill provides the three-layer pattern (raw sources → wiki pages → schema) that makes wikis useful long-term.
- **`grounded-citations`** — For citation-backed research integrity. Use when ingesting sources that need verifiable provenance.
