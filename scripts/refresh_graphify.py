#!/usr/bin/env python3
"""
Refresh Graphify knowledge graphs for Autognosia.

This script refreshes both Main Graph (from Active Wiki) and Oracle Graph (from Oracle Wiki).
Run via cron job weekly after wiki lint.

Prerequisites:
  uv tool install graphifyy
  graphify install
"""

import os
import subprocess
import sys
from datetime import datetime

AUTOGNOSIA_HOME = os.path.expanduser("~/.autognosia")
ACTIVE_WIKI = os.path.join(AUTOGNOSIA_HOME, "active-wiki")
ORACLE_BRAIN = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")
MAIN_GRAPH_OUT = os.path.join(AUTOGNOSIA_HOME, "graphify-main-out")
ORACLE_GRAPH_OUT = os.path.join(AUTOGNOSIA_HOME, "graphify-oracle-out")
LOG_FILE = os.path.join(AUTOGNOSIA_HOME, "logs", "graphify-refresh.log")

def ensure_dirs():
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    os.makedirs(MAIN_GRAPH_OUT, exist_ok=True)
    os.makedirs(ORACLE_GRAPH_OUT, exist_ok=True)

def log(msg):
    timestamp = datetime.now().isoformat()
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {msg}\n")
    print(msg)

def refresh_graph(name, source, output):
    """Refresh a single graph."""
    # Check if graphify is available
    try:
        import shutil
        if not shutil.which("graphify"):
            log(f"  {name}: graphify CLI not available, skipping")
            return True
    except Exception:
        pass
    
    if not os.path.isdir(source) or not os.listdir(source):
        log(f"  {name}: source empty, skipping")
        return True
    
    log(f"  Refreshing {name} from {source}...")
    result = subprocess.run(
        ["graphify", "update", source, "--graph", output],
        capture_output=True, text=True
    )
    
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
    
    if not os.path.isfile(os.path.join(MAIN_GRAPH_OUT, "graph.json")):
        log("  Main Graph not initialized. Run init_graphify.py first.")
        return 1
    
    success = True
    success &= refresh_graph("Main Graph", ACTIVE_WIKI, MAIN_GRAPH_OUT)
    success &= refresh_graph("Oracle Graph", ORACLE_BRAIN, ORACLE_GRAPH_OUT)
    
    if success:
        log("=== Graphify Refresh Complete ===")
        return 0
    else:
        log("=== Graphify Refresh Completed with Errors ===")
        return 1

if __name__ == "__main__":
    sys.exit(main())
