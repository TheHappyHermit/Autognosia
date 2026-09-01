# LLM Wiki Commands Plugin

User plugin providing slash commands for the LLM Wiki at `/home/josh434/.autognosia/active-wiki`.

## Location
`~/.hermes/plugins/llm-wiki-commands/`

## Files
- `plugin.yaml` — manifest with 3 commands
- `__init__.py` — command implementations

## Commands

### `/wiki_ingest <source>`
Ingest a source into the LLM Wiki.

**Source types:**
- URL: `https://arxiv.org/abs/2402.03300`
- Local file: `~/paper.pdf`, `/path/to/file.md`
- Raw text: `"GRPO is a new RL algorithm..."`

**Auto-operations:**
1. Saves raw source to `raw/articles/`, `raw/papers/`, or `raw/transcripts/` with frontmatter (`source_url`, `ingested`, `sha256`)
2. Extracts entities/concepts
3. Updates/creates pages in `entities/`, `concepts/`, `comparisons/`
4. Adds `[[wikilinks]]` and provenance `^[raw/...]`
5. Updates `index.md` and `log.md`
6. Reports every file changed

### `/wiki_query <question>`
Ask against the wiki's compiled knowledge.

**Auto-operations:**
1. Reads `index.md` + searches for key terms
2. Reads relevant pages
3. Synthesizes answer with citations
4. Files substantial answers to `queries/` or `comparisons/`
5. Updates `log.md`

### `/wiki_lint [full|quick]`
Health check. Default `full`.

- `full` — All 11 categories (orphans, broken links, index completeness, frontmatter validation, stale content, contradictions, quality signals, source drift, page size, tag audit, log rotation)
- `quick` — Orphans, broken links, index completeness only

## Implementation Notes

The plugin wraps the `llm-wiki` skill via `hermes chat -q` with `-s llm-wiki`. It uses `subprocess.run` with a 5-minute timeout.

The plugin must be enabled in `plugins.enabled` config:
```yaml
plugins:
  enabled:
    - llm-wiki-commands
```

## Registration

```python
ctx.register_command(
    "wiki_ingest",
    wiki_ingest,
    description="Ingest a source (URL, file, or text) into the LLM Wiki",
    args_hint="<url|file|text>",
)

ctx.register_command(
    "wiki_query",
    wiki_query,
    description="Ask a question against the LLM Wiki's compiled knowledge",
    args_hint="<question>",
)

ctx.register_command(
    "wiki_lint",
    wiki_lint,
    description="Health check the LLM Wiki (full or quick)",
    args_hint="[full|quick]",
)
```