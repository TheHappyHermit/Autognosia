#!/usr/bin/env python3
"""
Graphify refresh for Active Wiki and Oracle Brain - incremental update.

Runs graphify update in-place on the active-wiki and oracle-brain directories.
Uses local llama.cpp server for semantic extraction.
Scheduled: Sundays at 4:00 AM via cron job "Graphify Refresh"

Note: graphify extracts/writes to <source>/graphify-out/ by default when run
from within the source directory. The --graph flag (for graphify commands like
path, explain, etc.) defaults to graphify-out/graph.json in the CWD.
"""

import subprocess
import sys
import os
import json
from pathlib import Path
from datetime import datetime, timezone

AUTOGNOSIA_HOME = Path.home() / ".autognosia"
ACTIVE_WIKI = AUTOGNOSIA_HOME / "active-wiki"
ORACLE_BRAIN = AUTOGNOSIA_HOME / "oracle" / "brain"
# graph.json is written in-place at <source>/graphify-out/graph.json
MAIN_GRAPH_FILE = ACTIVE_WIKI / "graphify-out" / "graph.json"
ORACLE_GRAPH_FILE = ORACLE_BRAIN / "graphify-out" / "graph.json"

def refresh_graph(name, source, graph_file):
    """Refresh a single graph using graphify update (in-place)."""
    if not source.exists() or not any(source.iterdir()):
        print(f"[graphify-refresh] {name}: source empty, skipping")
        return True

    env = os.environ.copy()
    env["OPENAI_API_KEY"] = "sk-local"
    env["OPENAI_BASE_URL"] = "http://10.1.1.10:18081/v1"
    env["OPENAI_MODEL"] = "/models/Qwen3.5-4B-UD-Q4_K_XL.gguf"
    env["GRAPHIFY_DISABLE_THINKING"] = "1"
    env["GRAPHIFY_MAX_OUTPUT_TOKENS"] = "98304"

    if not graph_file.exists():
        print(f"[graphify-refresh] {name}: graph.json not found at {graph_file}, running initial extract")
        cmd = ["graphify", "extract", str(source), "--max-concurrency", "1", "--api-timeout", "600"]
    else:
        with open(graph_file) as f:
            data = json.load(f)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        print(f"[graphify-refresh] {name}: current graph: {len(nodes)} nodes, {len(edges)} edges")
        # graphify update re-extracts code (no LLM) and updates existing graph.json
        cmd = ["graphify", "update", str(source)]

    print(f"[graphify-refresh] {name}: command: {' '.join(cmd)}")
    result = subprocess.run(
        cmd, capture_output=True, text=True, cwd=str(source),
        env=env, timeout=3600
    )

    for line in (result.stdout or "").splitlines():
        print(f"[graphify-refresh] {name}: {line}")
    if result.stderr:
        for line in (result.stderr).splitlines():
            print(f"[graphify-refresh] {name}: STDERR: {line}", file=sys.stderr)

    if result.returncode == 0 and graph_file.exists():
        with open(graph_file) as f:
            data = json.load(f)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        print(f"[graphify-refresh] {name}: SUCCESS: {len(nodes)} nodes, {len(edges)} edges")
        return True
    else:
        print(f"[graphify-refresh] {name}: FAILED: exit {result.returncode}")
        return False

def main():
    print(f"[graphify-refresh] {datetime.now(timezone.utc).isoformat()}")

    if not ACTIVE_WIKI.exists():
        print(f"[graphify-refresh] ERROR: Active Wiki directory not found: {ACTIVE_WIKI}")
        sys.exit(1)

    success = True
    # Refresh Main Graph (from Active Wiki) — in-place at active-wiki/graphify-out/
    success &= refresh_graph("Main Graph", ACTIVE_WIKI, MAIN_GRAPH_FILE)
    # Refresh Oracle Graph (from Oracle Brain) — in-place at oracle/brain/graphify-out/
    success &= refresh_graph("Oracle Graph", ORACLE_BRAIN, ORACLE_GRAPH_FILE)

    if success:
        print("[graphify-refresh] ALL GRAPHS REFRESHED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("[graphify-refresh] ONE OR MORE GRAPHS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
