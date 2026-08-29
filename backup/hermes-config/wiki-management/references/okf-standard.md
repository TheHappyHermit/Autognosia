# OKF v0.2 — Key Points for Wiki Management

**Source**: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md  
**Published**: June 2026, Google Cloud

## Bundle Structure

A knowledge bundle is a directory tree of markdown files:
```
bundle/
  index.md           # Optional directory listing (progressive disclosure)
  log.md             # Optional update history
  <concept>.md       # Individual knowledge concepts
  subdirectory/
    index.md
    <concept>.md
```

## Concept Documents

Each concept is a UTF-8 markdown file with two parts:
1. **YAML frontmatter** (delimited by `---`)
2. **Markdown body**

### Required Frontmatter
- `type`: Short string identifying concept kind (e.g., `BigQuery Table`, `Playbook`, `Reference`)
  - **Only always-required key** — a concept with just `type:` is fully conformant

### Recommended Frontmatter
- `title`: Human-readable display name
- `description`: Single sentence summary
- `resource`: URI identifying the underlying asset
- `tags`: YAML list of short strings for cross-cutting categorization

### Provenance, Trust & Lifecycle (Optional)

**Provenance** — `sources` records derivation material:
```yaml
sources:
  - id: source-id
    resource: https://example.com/source
    title: Source Title
```

**Trust** — `generated` and `verified`:
```yaml
generated: {by: producer/version, at: 2026-06-20T22:53:05Z}
verified:
  - {by: human:user-id, at: 2026-06-25T09:00:00Z}
```

Trust tiers: unverified → machine-confirmed → human-reviewed

**Lifecycle** — `status` and `stale_after`:
- `status`: `draft` | `stable` | `deprecated`
- `stale_after`: `YYYY-MM-DD` — absolute staleness date

## Index Files

- `index.md` files provide **progressive disclosure** — navigate one level at a time instead of loading entire bundle
- Consumer-generated index files list concepts in a directory
- Use standard markdown links: `[[/path/to/concept.md]]`
- Absolute links (starting with `/`) are recommended for stability
- Consumers MUST tolerate broken links (target may not exist yet)

## Cross-Linking

- Links between concepts express relationships
- Two forms: absolute (`/path/to/file.md`) and relative (`./file.md`)
- Graph consumers treat all links as directed edges
- Lineage expressed through links, not dedicated fields

## Actor Convention

Identity fields use format `<producer>/<version>`, `human:<id>`, or `process:<id>`

## Key Design Principles

- **Human- and agent-readable**: No SDK needed — `cat` a file, read it
- **Version-controllable**: Lives in git — diffs, blame, PRs
- **Portable**: Just a directory — tarball, repo, filesystem mount
- **Minimally opinionated**: Standardizes only what's needed for interoperability
- **Continuously maintained**: Agents write and maintain the corpus over time
