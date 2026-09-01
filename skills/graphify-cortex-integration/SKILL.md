---
name: graphify-autognosia-integration
description: "Graphify as derived index in Hermes Autognosia with two graphs."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
tags: [graphify, hermes-autognosia, knowledge-graph, derived-index, retrieval-hierarchy]
metadata:
  hermes:
    related_skills: [graphify-semantic-ingestion, graphify-operations, wiki-ingestion, wiki-maintenance]
---

# Graphify Autognosia Integration

Patterns for integrating Graphify as a **derived relationship/connectivity index** (not a canonical memory store) into the Hermes Autognosia cognitive architecture.

## Core Principle

> **Graphify is a derived index — disposable, rebuildable, and optional. If deleted, corrupted, stale, or unavailable, ALL underlying knowledge remains intact in the Markdown wikis.**

## Two Separate Graphs (Never Merged)

| Graph | Source Wiki | Temperature | Queried By | Refresh Cadence |
|-------|-------------|-------------|------------|-----------------|
| **Main Graph** | `~/.hermes-autognosia/active-wiki/` | Hot/current | Main Hermes, Planner | Frequent (days/weeks) |
| **Oracle Graph** | `~/.hermes-autognosia/oracle/brain/` | Cold/historical | Oracle Profile | Infrequent (weeks/months) |

**Critical**: Main and Oracle graphs are **logically separate** and **never automatically merged**. This preserves the hot vs cold knowledge hierarchy.

## Retrieval Hierarchy (Graphify is Optional/Specialized)

```
1. Structured task/date/state query → Honcho/SQLite/Personal State
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
1. Ordinary wiki search (`ripgrep ~/.hermes-autognosia/active-wiki/`)
2. Direct Markdown/source inspection
3. Oracle (if appropriate)
4. Research Hermes

### Oracle Graph Fallback Order
1. Ordinary wiki search (`ripgrep ~/.hermes-autognosia/oracle/brain/`)
2. Direct Markdown/source inspection
3. GBrain semantic/hybrid retrieval (via Oracle profile)
4. Raw evidence search (`~/.hermes-autognosia/oracle/raw/`)
5. Research Hermes

**CRITICAL**: A Graphify failure or empty result MUST NOT be interpreted as proof that information does not exist. Never say "the knowledge does not exist" solely because Graphify failed to find it.

## Ingestion Pipeline

### Main Graph (Active Wiki)
```bash
# Full semantic run (cache clear MANDATORY)
rm -rf ~/.hermes-autognosia/graphify-main-out
graphify extract ~/.hermes-autognosia/active-wiki \
  --backend openai --model "your-model-id" \
  --token-budget 50000 --max-concurrency 4 --no-cluster --api-timeout 1200 \
  --out ~/.hermes-autognosia/graphify-main-out

# Incremental (AST only)
graphify update ~/.hermes-autognosia/active-wiki --graph ~/.hermes-autognosia/graphify-main-out
```

### Oracle Graph (Oracle Wiki)
```bash
# Full semantic run (cache clear MANDATORY)
rm -rf ~/.hermes-autognosia/graphify-oracle-out
graphify extract ~/.hermes-autognosia/oracle/brain \
  --backend openai --model "your-model-id" \
  --token-budget 50000 --max-concurrency 4 --no-cluster --api-timeout 1200 \
  --out ~/.hermes-autognosia/graphify-oracle-out

# Incremental (AST only)
graphify update ~/.hermes-autognosia/oracle/brain --graph ~/.hermes-autognosia/graphify-oracle-out
```

## Workspace Wrapper Pattern

Use the `graphify` CLI directly. Install via `uv tool install graphifyy` (or `pipx install graphifyy`).

```bash
# Extract
graphify extract ~/.hermes-autognosia/active-wiki --backend openai --model "your-model-id"

# Query
graphify query "How does X connect to Y?" --graph ~/.hermes-autognosia/graphify-main-out

# Update (incremental)
graphify update ~/.hermes-autognosia/active-wiki --graph ~/.hermes-autognosia/graphify-main-out

# Explain
graphify explain "concept-name" --graph ~/.hermes-autognosia/graphify-main-out

# Path
graphify path "node-a" "node-b" --graph ~/.hermes-autognosia/graphify-main-out
```

No wrapper scripts needed — the CLI handles environment variables and paths.

## LLM Backend Configuration

### Local (Recommended for Privacy)
```bash
export OPENAI_API_KEY="local"
export OPENAI_BASE_URL="http://localhost:1234/v1"
```

### Cloud (OpenRouter)
```bash
export OPENROUTER_API_KEY="<key>"
export GRAPHIFY_OPENROUTER_MODEL="your-model-id"
```

**Requires $10+ credits** for practical use (1,000 req/day vs 50/day free)

## Verification Protocol (DISK CHECK — Exit Code 0 ≠ Success)

> **⚠️ STALE-REPORT TRAP**: Graphify can leave `GRAPH_REPORT.md` with OLD mtime while re-extracting only a handful of files.

```bash
# 1. mtime must postdate run
ls -la --time-style=full-iso ~/.hermes-autognosia/graphify-main-out/GRAPH_REPORT.md

# 2. Semantic cache files in thousands
find ~/.hermes-autognosia/graphify-main-out/cache/semantic -type f | wc -l

# 3. Log shows semantic extraction on ~total files
grep "semantic extraction on" ~/.hermes-autognosia/graphify-main-out/*.log
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
graphify query "How does X connect to Y?" --graph ~/.hermes-autognosia/graphify-main-out
graphify explain "concept-name" --graph ~/.hermes-autognosia/graphify-main-out
graphify path "node-a" "node-b" --graph ~/.hermes-autognosia/graphify-main-out
```

### Oracle Graph (Oracle Profile)
```bash
graphify query "Trace compliance flow from A to B" --graph ~/.hermes-autognosia/graphify-oracle-out
graphify explain "historical-concept" --graph ~/.hermes-autognosia/graphify-oracle-out
graphify path "node-x" "node-y" --graph ~/.hermes-autognosia/graphify-oracle-out
```

## Related Skills

- `graphify-semantic-ingestion` — backend config, cache management, verification (in hermes-laptop/default)
- `graphify-operations` — query patterns, traversal, troubleshooting
- `wiki-ingestion` — feeds Active Wiki that Main Graph indexes
- `wiki-maintenance` — archives Active Wiki into Oracle Wiki

## References

- `references/graphify-api-analysis.md` — API modules, patterns, model selection, stale-report trap (in graphify-semantic-ingestion)
- Graphify repo: https://github.com/Graphify-Labs/graphify