# Subagent Schema Audit — Chunk Extraction Consistency Analysis

## Context

During a full 27-chunk graphify extraction of the Oracle Brain wiki (~598 markdown files), subagents were dispatched to extract knowledge graphs from each chunk. After completion, the output was audited for schema compliance with the graphify extraction-spec.

## Findings

### Compliance Rate: 11/27 chunks (41%) fully compliant

**Compliant chunks (proper graphify spec):**
01, 02, 03, 04, 14, 15, 16, 20, 22, 25, 26 — these used the graphifyy library extract() or received the full extraction-spec prompt.

**Non-compliant chunks (16/27, 59%):**

Each non-compliant chunk used a DIFFERENT custom schema, often with its own `extract_chunk_XX.py` script.

### Schema Formats Found

| Format | Chunks | Nodes | Edges | Deviations from Spec |
|--------|--------|------:|------:|---------------------|
| Custom 10-field | 00 | 110 | 581 | `name` not `label`, `entity_type` not `file_type`, `source_path` not `source_file`, `confidence` instead of separate `confidence`+`confidence_score`, missing `hyperedges`/tokens |
| Standard 9/8 | 01,03,04,14,15,16,20,22,25,26 | 49,959 | 231,392 | ✅ Compliant |
| 7/6 field | 02 | 24 | 43 | Missing `source_url`, `author`, `contributor`, `source_location` on edges |
| 4/4 field | 05,06,10,11 | 185 | 242 | `type` not `file_type`, `properties` dict dump, no `source_file`, no `confidence` |
| 5/3 field | 07 | 27 | 26 | `type` not `file_type`, `source_path` not `source_file`, no confidence |
| 3/3 field | 08 | 1,205 | 1,816 | Bare `type`, `label`, `id` — no source_file at all |
| 5/4 field | 09 | 42 | 54 | `properties` dict, no structured fields |
| 5/3 field | 12,13,17,18,19 | 3,701 | 5,155 | `name` not `label`, `source_paths` array not `source_file`, `metadata` not structured |
| 4/0 field | 21 | 12 | 0 | Topic listing only, no graph structure |
| 6/4 field | 23 | 24 | 12 | `title`, `domain`, `line_number`, `file` — custom format |
| 4/3 field | 24 | 12 | 24 | `files` array — directory structure |

### Key Deviations Observed

1. **Field name mismatches:** `type` → should be `file_type`; `name` → should be `label`; `source_path`/`source_paths` → should be `source_file`
2. **Missing required fields:** No `source_file`, no `confidence`/`confidence_score`, no `source_location`
3. **Custom fields:** `properties` (dict dump), `description`, `tags`, `entity_type`, `metadata`, `facts`, `body_summary`, `confidence` (instead of separate confidence+confidence_score)
4. **Missing top-level keys:** No `hyperedges`, no `input_tokens`, no `output_tokens`
5. **Invalid values:** `confidence_score: 0.5` (forbidden by spec); invalid confidence values
6. **Custom relation names:** `related_to`, `mentored`, `co-organized_Dartmouth_Conference_with`, `built_on_place_cell_discovery`, `has_section`, `has_tag`, `related_via`
7. **Format drift:** Even within the same pipeline run, different subagents used different schemas

### Root Cause

Subagents that didn't receive the full `extraction-spec.md` prompt wrote their own extraction scripts. Each script had its own schema. The graphifyy Python library's `extract()` function produces correct schema automatically — that's what the compliant chunks went through.

### Impact

- The graphifyy merge step (`graphify.merge()` or manual merge) expects the standardized schema
- Non-compliant chunks cannot be merged into a usable graph
- Schema validation must run AFTER each chunk is produced and BEFORE merging
- 59% schema failure rate means most subagent-based extraction runs will produce unusable output without post-hoc normalization

### Fix Pattern

For non-compliant chunks, a normalization pass can map field names:
```python
# Common mappings:
node['file_type'] = node.pop('type', node.get('file_type', 'document'))
node['label'] = node.pop('name', node.get('label', node.get('id', '')))
node['source_file'] = node.pop('source_path', node.get('source_file', ''))
# If source_paths exists (array), take first element
if 'source_paths' in node:
    node['source_file'] = node['source_paths'][0] if node['source_paths'] else ''
edge['relation'] = edge.get('relation', edge.get('relationship', ''))
edge['confidence_score'] = edge.get('confidence_score', 1.0 if edge.get('confidence') == 'EXTRACTED' else 0.75)
```

But prevention is better than normalization: always dispatch the full extraction-spec prompt to every subagent.
