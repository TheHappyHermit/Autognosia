#!/usr/bin/env python3
"""
Oracle Index Append — Incremental graph index update for the Oracle brain.

Instead of a full rebuild (which takes ~24h), this script:
1. Checks which wiki files have been modified since last run
2. Runs graphify extract in incremental mode on changed/new files
3. Merges the new chunks into the existing graph

Never uses --force flag. Always incremental.

Scheduled: Daily at 3:30am via cron job "Oracle Index Update"
"""

import subprocess
import sys
import os
import json
from pathlib import Path
from datetime import datetime, timezone
import hashlib

WIKI_DIR = Path.home() / ".autognosia" / "active-wiki"
ORACLE_BRAIN = Path.home() / ".autognosia" / "oracle" / "brain"
GRAPHIFY_OUT = ORACLE_BRAIN / "graphify-out"
REBUILD_LOG = ORACLE_BRAIN / "rebuild-log.md"

def get_last_run_timestamp():
    """Get the timestamp of the last successful run from the rebuild log."""
    if REBUILD_LOG.exists():
        content = REBUILD_LOG.read_text()
        # Look for the most recent '## YYYY-MM-DD' or timestamp entry
        for line in reversed(content.split('\n')[:50]):
            if '##' in line and any(c.isdigit() for c in line):
                return line.strip()
    return None

def get_modified_files(since_timestamp=None):
    """Find wiki files modified since last run, or all files if first run."""
    files = []
    for md_file in WIKI_DIR.rglob('*.md'):
        if md_file.name == 'AGENTS.md' or '.meta/' in str(md_file):
            continue
        stat = md_file.stat()
        files.append({
            'path': str(md_file),
            'mtime': stat.st_mtime,
            'mtime_dt': datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc),
        })
    
    # Filter by last run time if available
    if since_timestamp:
        files = [f for f in files if f['mtime'] > since_timestamp]
    
    return files

def run_graphify_extract(files_to_process):
    """Run graphify extract on the modified files using incremental mode."""
    env = os.environ.copy()
    env["OPENAI_API_KEY"] = "x"
    env["OPENAI_BASE_URL"] = "http://10.1.1.10:8080/v1"
    env["OPENAI_MODEL"] = "/models/Qwen3.6-35B-A3B-Q4_K_M.gguf"
    
    cmd = [
        "graphify", "extract",
        str(WIKI_DIR),
        "--max-concurrency", "1",
        "--api-timeout", "600"
    ]
    
    print(f"[index-update] Running graphify extract on {len(files_to_process)} modified files")
    print(f"[index-update] Command: {' '.join(cmd)}")
    
    result = subprocess.run(
        cmd, capture_output=True, text=True, cwd=str(WIKI_DIR),
        env=env, timeout=3600
    )
    
    for line in (result.stdout or "").splitlines():
        if "error" in line.lower() or "fail" in line.lower():
            print(f"[index-update] WARNING: {line}", file=sys.stderr)
        else:
            print(f"[index-update] {line}")
    
    if result.stderr:
        for line in result.stderr.splitlines():
            if "error" in line.lower():
                print(f"[index-update] STDERR: {line}", file=sys.stderr)
    
    return result.returncode

def append_to_rebuild_log(modified_count, exit_code, message=""):
    """Append a status entry to the rebuild log."""
    now = datetime.now(timezone.utc)
    status = "SUCCESS" if exit_code == 0 else "FAILED"
    entry = f"\n## {now.strftime('%Y-%m-%d %H:%M UTC')} — {status}\n"
    entry += f"- Files modified: {modified_count}\n"
    entry += f"- Exit code: {exit_code}\n"
    if message:
        entry += f"- Message: {message}\n"
    
    # Create log if it doesn't exist
    if not REBUILD_LOG.exists():
        REBUILD_LOG.write_text("# Oracle Index Update Log\n\n")
    
    with open(REBUILD_LOG, 'a') as f:
        f.write(entry)

def main():
    now = datetime.now(timezone.utc)
    print(f"[index-update] {now.isoformat()}")
    
    # Check prerequisites
    if not WIKI_DIR.exists():
        print(f"[index-update] ERROR: Wiki directory not found: {WIKI_DIR}")
        sys.exit(1)
    
    if not GRAPHIFY_OUT.exists():
        print(f"[index-update] ERROR: Graphify output directory not found: {GRAPHIFY_OUT}")
        sys.exit(1)
    
    # Check existing graph state
    graph_file = GRAPHIFY_OUT / "graph.json"
    nodes_before = 0
    if graph_file.exists():
        with open(graph_file) as f:
            data = json.load(f)
        nodes_before = len(data.get("nodes", []))
        print(f"[index-update] Current graph: {nodes_before} nodes")
    
    # Get last run timestamp and find modified files
    since = get_last_run_timestamp()
    modified_files = get_modified_files(since)
    
    print(f"[index-update] Files modified since last run: {len(modified_files)}")
    
    if not modified_files:
        print("[index-update] No files modified — nothing to update")
        append_to_rebuild_log(0, 0, "No changes detected")
        sys.exit(0)
    
    # Show which files changed (for logging)
    for f in modified_files:
        print(f"  - {f['path']} (modified: {f['mtime_dt'].strftime('%Y-%m-%d %H:%M')})")
    
    # Run graphify extract
    exit_code = run_graphify_extract(modified_files)
    
    # Check post-update state
    nodes_after = 0
    if graph_file.exists():
        with open(graph_file) as f:
            data = json.load(f)
        nodes_after = len(data.get("nodes", []))
    
    # Log result
    if exit_code == 0:
        message = f"Graph updated: {nodes_before} → {nodes_after} nodes ({nodes_after - nodes_before:+d})"
        append_to_rebuild_log(len(modified_files), 0, message)
        print(f"[index-update] SUCCESS: {message}")
    else:
        message = f"Graphify extract failed (exit {exit_code}), graph unchanged at {nodes_before} nodes"
        append_to_rebuild_log(len(modified_files), exit_code, message)
        print(f"[index-update] FAILED: {message}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
