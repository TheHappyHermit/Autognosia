#!/usr/bin/env python3
"""
Refresh Graphify knowledge graphs for Autognosia.

This script refreshes both Main Graph (from Active Wiki) and Oracle Graph
(from Oracle Brain) in-place using graphify extract (semantic, additive).
Run via cron job weekly after wiki lint.

Prerequisites:
  uv tool install graphifyy
  graphify install
"""

import os
import subprocess
import sys
import shutil
from datetime import datetime

AUTOGNOSIA_HOME = os.path.expanduser("~/.autognosia")
ACTIVE_WIKI = os.path.join(AUTOGNOSIA_HOME, "active-wiki")
ORACLE_BRAIN = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")
LOG_FILE = os.path.join(AUTOGNOSIA_HOME, "logs", "graphify-refresh.log")
# graphify writes to <source>/graphify-out/graph.json by default (in-place)
MAIN_GRAPH_FILE = os.path.join(ACTIVE_WIKI, "graphify-out", "graph.json")
ORACLE_GRAPH_FILE = os.path.join(ORACLE_BRAIN, "graphify-out", "graph.json")

def ensure_dirs():
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log(msg):
    timestamp = datetime.now().isoformat()
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {msg}\n")
    print(msg)

def refresh_graph(name, source, graph_file):
    """Refresh a single graph in-place."""
    if not shutil.which("graphify"):
        log(f"  {name}: graphify CLI not available, skipping")
        return True

    if not os.path.isdir(source) or not os.listdir(source):
        log(f"  {name}: source empty, skipping")
        return True

    env = os.environ.copy()
    env["OPENAI_API_KEY"] = "sk-local"
    env["OPENAI_BASE_URL"] = "http://10.1.1.10:11434/v1"
    env["OPENAI_MODEL"] = "qwen3.5:9b"
    env["GRAPHIFY_DISABLE_THINKING"] = "1"
    env["GRAPHIFY_MAX_OUTPUT_TOKENS"] = "98304"

    if not os.path.isfile(graph_file):
        log(f"  {name}: graph.json not found at {graph_file}, running initial extract")
        cmd = ["graphify", "extract", source, "--backend", "openai", "--max-concurrency", "1", "--token-budget", "24000", "--api-timeout", "600"]
    else:
        log(f"  {name}: graph.json found, running semantic extract (additive, in-place)")
        cmd = ["graphify", "extract", source, "--backend", "openai", "--max-concurrency", "1", "--token-budget", "24000", "--api-timeout", "600"]

    log(f"  Refreshing {name} from {source}...")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=source, env=env, timeout=3600)

    if result.returncode == 0:
        log(f"  {name}: refreshed successfully")
        return True
    else:
        log(f"  {name}: FAILED (code {result.returncode})")
        if result.stderr:
            log(f"    stderr: {result.stderr[:300]}")
        return False

def main():
    ensure_dirs()
    log("=== Graphify Refresh Started ===")

    success = True
    success &= refresh_graph("Main Graph", ACTIVE_WIKI, MAIN_GRAPH_FILE)
    success &= refresh_graph("Oracle Graph", ORACLE_BRAIN, ORACLE_GRAPH_FILE)

    if success:
        log("=== Graphify Refresh Complete ===")
        return 0
    else:
        log("=== Graphify Refresh Completed with Errors ===")
        return 1

if __name__ == "__main__":
    sys.exit(main())
