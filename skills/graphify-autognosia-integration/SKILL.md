---
name: graphify-autognosia-integration
description: "Graphify as derived index in Autognosia with two graphs."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
tags: [graphify, autognosia, knowledge-graph, derived-index, retrieval-hierarchy]
metadata:
  hermes:
    related_skills: [graphify-semantic-ingestion, graphify-operations, wiki-ingestion, wiki-maintenance]
---

# Graphify Cortex Integration

Patterns for integrating Graphify as a **derived relationship/connectivity index** (not a canonical memory store) into the Autognosia cognitive architecture.

## Core Principle

> **Graphify is a derived index — disposable, rebuildable, and optional. If deleted, corrupted, stale, or unavailable, ALL underlying knowledge remains intact in the Markdown wikis.**

## Two Separate Graphs (Never Merged)

| Graph | Source Wiki | Temperature | Queried By | Refresh Cadence |
|-------|-------------|-------------|------------|-----------------|
| **Main Graph** | `$AUTOGNOSIA/active-wiki/` | Hot/current | Main Hermes, Planner | Frequent (days/weeks) |
| **Oracle Graph** | `$AUTOGNOSIA/oracle/brain/` | Cold/historical | Oracle Profile | Infrequent (weeks/months) |

**Critical**: Main and Oracle graphs are **logically separate** and **never automatically merged**. This preserves the hot vs cold knowledge hierarchy.

## Retrieval Hierarchy (Graphify is Optional/Specialized)

```
1. Structured task/date/state query → Honcho/SQLite/Personal Organizer
2. Main knowledge query → Active Wiki (ripgrep first)
3. Relationship/multi-hop question → Main Graphify (optional, specialized)
4. Need older/long-term knowledge → Oracle
5. Oracle relationship/multi-hop → Oracle Graphify (optional)
6. Still missing → Research Hermes
7. New durable knowledge → Canonical Wiki
8. Refresh derived graphs
```

**When to use Graphify**: Relationship/multi-hop questions ("What connects X to Y?", "How does this concept relate to others?", "Trace the flow from A to B through Z")

**When NOT to use Graphify**: Simple fact lookup, exact page retrieval, structured queries, autobiographical queries

## Fallback Behavior (NON-NEGOTIABLE)

If Graphify is unavailable, stale, returning no result, or returning incorrect results:

### Main Graph Fallback Order
1. Ordinary wiki search (`ripgrep $AUTOGNOSIA/active-wiki/`)
2. Direct Markdown/source inspection
3. Oracle (if appropriate)
4. Research Hermes

### Oracle Graph Fallback Order
1. Ordinary wiki search (`ripgrep $AUTOGNOSIA/oracle/brain/`)
2. Direct Markdown/source inspection
3. GBrain semantic/hybrid retrieval (via Oracle profile)
4. Raw evidence search (`$AUTOGNOSIA/oracle/raw/`)
5. Research Hermes

**CRITICAL**: A Graphify failure or empty result MUST NOT be interpreted as proof that information does not exist. Never say "the knowledge does not exist" solely because Graphify failed to find it.

## Ingestion Pipeline (V100-only — NO OpenRouter, NO desktop 3090)

> **HARD RULE (Josh, 2026-08-26):** Graphify runs ONLY on the local V100 at
> `http://<V100_HOST>:8080/v1` (`/models/Qwen3.6-35B-A3B-Q4_K_M.gguf`). It must
> NEVER fall back to OpenRouter, and it must NEVER use the desktop 3090
> (`<DESKTOP_3090_HOST>:1234` / `<DESKTOP_3090_HOST>`) — that GPU is reserved for OpenCode /
> desktop-researcher. The launch scripts bake in this env and a 96k
> (`GRAPHIFY_MAX_OUTPUT_TOKENS=98304`) client-side output cap (graphify's default
> 8192 cap truncates JSON mid-object — bug #1365).

### Main Graph (Active Wiki)
```bash
# Full semantic run — uses the canonical script (V100-only, 96k cap)
bash ~/.hermes/scripts/graphify_active_wiki.sh
# Output lands in: $AUTOGNOSIA/active-wiki/graphify-out/
```

### Oracle Graph (Oracle Wiki)
```bash
# Full semantic run — uses the canonical script (V100-only, 96k cap)
bash ~/.hermes/scripts/graphify_oracle_brain.sh
# Output lands in: $AUTOGNOSIA/oracle/brain/graphify-out/
```

**Do not** hand-run `graphify extract` with `--out .../graphify-main-out` or
`--out .../graphify-oracle-out` — those paths are stale and the skill previously
pointed at them by mistake. Always use the two `.sh` scripts above; they set the
correct backend, model, output dir, and token cap.

## LLM Backend Configuration

### Local V100 (REQUIRED for this deployment)
```bash
export OPENAI_BASE_URL="http://<V100_HOST>:8080/v1"
export OPENAI_API_KEY="sk-local"
export OPENAI_MODEL="/models/Qwen3.6-35B-A3B-Q4_K_M.gguf"
export GRAPHIFY_MAX_OUTPUT_TOKENS="98304"   # 96k — avoids JSON truncation (bug #1365)
```
This is the only supported backend for Autognosia graphify. There is intentionally
**no OpenRouter fallback** and **no <DESKTOP_3090_HOST>:1234 (3090)** path — both are
forbidden for graphify.

## Verification Protocol (DISK CHECK — Exit Code 0 ≠ Success)

> **⚠️ STALE-REPORT TRAP**: Graphify can leave `GRAPH_REPORT.md` with OLD mtime while re-extracting only a handful of files.

```bash
# Active wiki graph
OUT=$AUTOGNOSIA/active-wiki/graphify-out
ls -la --time-style=full-iso "$OUT/GRAPH_REPORT.md"
find "$OUT/cache/semantic" -type f | wc -l
grep "semantic extraction on" $AUTOGNOSIA/logs/graphify-active-wiki.log

# Oracle brain graph
OUT=$AUTOGNOSIA/oracle/brain/graphify-out
ls -la --time-style=full-iso "$OUT/GRAPH_REPORT.md"
find "$OUT/cache/semantic" -type f | wc -l
grep "semantic extraction on" $AUTOGNOSIA/logs/graphify-oracle-brain.log
```

**Success indicators**: AMBIGUOUS > 0%, tokens > 0, INFERRED > 0%, node/edge counts > AST baseline

## Sync Schedule

**Every night** (or after significant changes):
- If Active Wiki changed → incremental Main Graph update (AST only)
- If Oracle Wiki changed → incremental Oracle Graph update (AST only)

**Weekly**:
- Full Main Graph semantic refresh (with cache clear)
- Full Oracle Graph semantic refresh (with cache clear)

Use Hermes no-agent cron. No LLM needed for incremental.

## Query Operations

### Main Graph (Main Hermes / Planner)
```bash
graphify query "How does X connect to Y?" --graph $AUTOGNOSIA/graphify-main-out
graphify explain "concept-name" --graph $AUTOGNOSIA/graphify-main-out
graphify path "node-a" "node-b" --graph $AUTOGNOSIA/graphify-main-out
```

### Oracle Graph (Oracle Profile)
```bash
graphify query "Trace compliance flow from A to B" --graph $AUTOGNOSIA/graphify-oracle-out
graphify explain "historical-concept" --graph $AUTOGNOSIA/graphify-oracle-out
graphify path "node-x" "node-y" --graph $AUTOGNOSIA/graphify-oracle-out
```

## Related Skills

- `graphify-semantic-ingestion` — backend config, cache management, verification (in hermes-laptop/default)
- `graphify-operations` — query patterns, traversal, troubleshooting
- `wiki-ingestion` — feeds Active Wiki that Main Graph indexes
- `wiki-maintenance` — archives Active Wiki into Oracle Wiki

## Pitfalls

### AST-Only Refresh Produces Useless Graphs
The `refresh_graphify.py` cron runs `graphify update` which does incremental AST extraction only. For markdown wikis this produces graphs with 0 edges and 0 communities — functionally useless. A full semantic run with `graphify extract --backend openai --model <model-id>` is required for wiki corpora. See `references/graphify-refresh-pitfall.md` for the detailed troubleshooting guide, verification steps, and cadence recommendations.

## References

- `references/graphify-api-analysis.md` — API modules, patterns, model selection, stale-report trap (in graphify-semantic-ingestion)
- `references/graphify-refresh-pitfall.md` — AST-only refresh pitfall (0 edges), full semantic run procedure, verification, cadence
- Graphify repo: https://github.com/Graphify-Labs/graphify