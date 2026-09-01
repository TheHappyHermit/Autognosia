---
name: wiki-management
category: data-science
tags: [wiki, okf, knowledge-graph, graphify, index-files, documentation]
---

# Wiki Management

Use when managing knowledge wikis that use the Open Knowledge Format (OKF) v0.2 standard, including OKF compliance verification, graphify ingestion, index file generation, and knowledge graph health monitoring.

## Trigger Conditions
- Managing a wiki directory with markdown documents organized in a hierarchy
- Needing to verify OKF compliance of index files
- Running graphify ingestion or verifying ingestion completeness
- Generating directory index files for progressive disclosure
- Checking for missing or stale wiki content

## Steps

### 1. Understand the OKF Standard
OKF (Open Knowledge Format) is a Google Cloud standard (v0.2) for representing knowledge as markdown files with YAML frontmatter in a directory hierarchy. Key requirements:
- Each directory should have an `index.md` for progressive disclosure/navigation
- `index.md` must contain YAML frontmatter with `type: Index`, `title:`, and `description:`
- Concepts reference each other using markdown links: `[[path/to/file.md]]`
- Reserved filenames: `index.md` (directory listing), `log.md` (update history)
- OKF URL: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf

### 2. Verify OKF Compliance
Use `verify_okf_compliance.py` to check all directories for:
- Presence of `index.md` with proper OKF frontmatter
- Links to all child markdown files
- Required frontmatter fields (type, title, description)

### 3. Generate Missing Index Files
When directories lack `index.md`:
1. Run `generate_okf_index_files.py` to create missing index files
2. Include OKF frontmatter with appropriate metadata
3. Link to all markdown files in the directory
4. Skip system directories: `.obsidian`, `.git`, `.meta`, `graphify-out`

### 4. Verify Graphify Ingestion
Graphify chunks use `nodes` with a `source_file` field (NOT a `files` list). To verify ingestion:
1. Check each chunk file for nodes with `source_file` metadata
2. Compare ingested files against all `.md` files in the vault
3. Identify missing files that exist but weren't ingested
4. Use `check_graphify_ingestion.py` for automated verification

### 5. Schedule Regular Checks
Create a daily cron job to verify:
- All directories have OKF-compliant `index.md` files
- Graphify ingestion is complete and current
- No orphaned or stale files

## Pitfalls
- **Chunk structure**: Graphify chunks store `nodes` with `source_file` field — don't look for a `files` list. The `source_file` contains the absolute path to the source document.
- **Path mismatches**: Ingested files use absolute paths; comparisons should normalize paths before checking.
- **OKF is real**: OKF (Open Knowledge Framework) is a real Google Cloud standard, NOT a dead reference. The URL `https://openknowledgeframework.org/` may not exist, but the standard itself is defined at the GoogleCloudPlatform/knowledge-catalog repository.
- **System directories**: Skip `.obsidian`, `.git`, `.meta`, `graphify-out`, and `_archive` directories when scanning or generating index files.

## Supporting Files
- `references/okf-standard.md` — OKF v0.2 specification summary with key fields and requirements
- `scripts/verify_okf_compliance.py` — Automated OKF compliance checker
- `scripts/generate_okf_index_files.py` — Generates missing OKF index.md files
- `scripts/check_graphify_ingestion.py` — Verifies graphify ingestion completeness
- `scripts/setup_hermes_vault_graphify.py` — Sets up graphify for new vaults
