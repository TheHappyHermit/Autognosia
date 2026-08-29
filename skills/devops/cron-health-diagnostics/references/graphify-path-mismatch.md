# Graphify Refresh Path Mismatch — Case Study (Pattern 8)

## Incident

The `Graphify Refresh` cron job (`refresh_graphify.py`, `no_agent: true`) failed
with exit code 1 after reporting:

```
=== Graphify Refresh Started ===
  Main Graph not initialized. Run init_graphify.py first.
```

This error recurred on every scheduled run (Aug 16, 17, 23; Aug 24) and was
logged at `~/.autognosia/logs/graphify-refresh.log`.

## Root Cause

The refresh script (the `autognosia-clean` version that was actually executing)
checked for `graph.json` at:

```
~/.autognosia/graphify-main-out/graph.json
```

But graphify's `extract` command writes to `<output>/graphify-out/graph.json`
(a subdirectory). The actual graph existed at:

```
~/.autognosia/graphify-main-out/graphify-out/graph.json
```

The script's path check was missing the `graphify-out/` segment, so it always
falsely reported "graph not initialized" — even though the graph was fully
populated (52 nodes at `graphify-main-out`, 68 nodes at `active-wiki`).

## Why NOT to re-run `init_graphify.py`

Re-running `init_graphify.py` would trigger a **full re-extraction** of the
entire wiki through the llama.cpp LLM backend — an operation measured in **hours**
(not minutes). The graph already exists; only the script's path check was wrong.
Re-initialization destroys the semantic cache and starts from scratch.

## The Fix

Two issues were fixed in `~/.hermes/scripts/refresh_graphify.py`:

1. **Path check:** Updated `graph_file` to include `graphify-out/` subdirectory,
   OR (preferred) run graphify **in-place** from the source directory and check
   `<source>/graphify-out/graph.json`.

2. **CLI correctness:** `graphify update` in the current version (0.46.x) does
   NOT accept `--graph <output_dir>`. It runs in-place from the source path.
   The correct invocation is:

   ```bash
   cd /home/josh434/.autognosia/active-wiki
   graphify update /home/josh434/.autognosia/active-wiki
   ```

   This re-extracts code files (AST, no LLM needed) and merges into the existing
   in-place `graphify-out/graph.json`.

## Corrected Script Behavior

The fixed `refresh_graphify.py`:
- Checks `<source>/graphify-out/graph.json` (correct in-place path)
- Runs `graphify update <source>` with `cwd=<source>` (in-place update)
- If graph.json doesn't exist, runs `graphify extract <source>` (initial creation)

## Verification

After the fix, running the script:

```
[graphify-refresh] Main Graph: current graph: 68 nodes, 0 edges
[graphify-refresh] Main Graph: command: graphify update .../active-wiki
[graphify-refresh] Main Graph: SUCCESS: 68 nodes, 0 edges
[graphify-refresh] Oracle Graph: current graph: 29053 nodes, 0 edges
[graphify-refresh] Oracle Graph: command: graphify update .../oracle/brain
[graphify-refresh] Oracle Graph: SUCCESS: 51153 nodes, 0 edges
[graphify-refresh] ALL GRAPHS REFRESHED SUCCESSFULLY
```

Exit code: 0

## Key Command Reference

```bash
# Find where graphify actually writes graph.json
find ~/.autognosia -name "graph.json" -path "*graphify-out*"

# Check graphify CLI options
graphify --help  # update takes <path>, no --graph flag
graphify update --help

# Run in-place update manually
cd ~/.autognosia/active-wiki && graphify update .

# Verify the graph loaded correctly
python3 -c "import json; g=json.load(open('graphify-out/graph.json')); print(len(g['nodes']), 'nodes,', len(g.get('links',g.get('edges',[]))), 'edges')"
```
