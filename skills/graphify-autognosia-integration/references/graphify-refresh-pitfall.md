# Graphify Refresh Pitfall: AST-Only Produces 0-Edge Graphs

## Problem

The cron-based `refresh_graphify.py` script runs `graphify update` which performs **incremental AST-only extraction**. For markdown wiki corpora, this produces graphs with:

- **Nodes**: extracted from file structure/frontmatter
- **Edges**: **0** — no semantic relationships
- **Communities**: **0** — no clustering

The graph.json exists, has nodes, but is functionally useless for relationship queries because there are no edges connecting concepts.

**Evidence** (2026-08-23):
- Active Wiki: 60 nodes, 0 edges, 0 communities
- Oracle Brain: 29,053 nodes, 0 edges, 0 communities
- Both have semantic cache files but cache was never merged into graph.json

## Root Cause

`graphify update` is designed for code repos where AST extraction captures function calls, imports, and structural relationships. For markdown wikis, the meaningful content — relationships between concepts, semantic connections across pages — requires **semantic (LLM-based) extraction**, not structural extraction.

The refresh cron does:
```bash
graphify update <source> --graph <output>  # AST only for markdown
```

It never runs:
```bash
graphify extract <source> --backend openai --model <model> --no-cluster
```

The full extract with semantic backend is what builds edges and communities from document content.

## Solution

### Full Semantic Run (Required for Wikis)

```bash
rm -rf <output>/cache/semantic  # clear cache — MANDATORY for full re-extraction
graphify extract <source> \
  --backend openai \
  --model <model-id> \
  --token-budget 50000 \
  --max-concurrency 4 \
  --no-cluster \
  --out <output>
```

Model recommendation: use the same model used historically (Qwen 3.6-35B or Quinn 3.6-6). For local models, configure `OPENAI_API_KEY=local` and `OPENAI_BASE_URL`.

### Incremental (AST-only) — Acceptable Only for Code

`graphify update` is fine for code-heavy repos where AST captures the relationships. For wikis with predominantly markdown text, it produces useless graphs.

## Verification

After any refresh, verify:
```bash
python3 -c "
import json
d = json.loads(open('<output>/graph.json').read())
print(f'Nodes: {len(d.get(\"nodes\",[]))}, Edges: {len(d.get(\"edges\",[]))}, Communities: {len(d.get(\"communities\",{}))}')
assert len(d.get('edges',[])) > 0, 'Graph has no edges — extraction failed'
"
```

**Success indicators**: edges > 0, communities > 0, edge-to-node ratio > 0.1 for wikis.

## Cadence Recommendations

| Corpus | Size | Full Semantic | Incremental |
|--------|------|---------------|-------------|
| Active Wiki | ~226 files | Weekly | Daily |
| Oracle Brain | ~2,482 files | Monthly/Quarterly | Daily |
| Code repos | Any | On schema change | Every update |

The oracle brain at 2,482 files would take hours to days for a full semantic run with a local model. Monthly/quarterly is more realistic than weekly.
