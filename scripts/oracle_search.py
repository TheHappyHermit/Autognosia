#!/usr/bin/env python3
"""
Oracle Search — literal text search against ${HOME}/personal-agent/oracle/brain
using ripgrep. Read-only.
"""

import sys
import subprocess
import os

AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("${HOME}/.autognosia"))
BRAIN_DIR = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")

def search(query: str, case_sensitive: bool = False, title_only: bool = False,
           limit: int = 20) -> list:
    """Search Oracle brain with ripgrep."""
    if not os.path.isdir(BRAIN_DIR):
        return []
    
    cmd = ["rg", "--line-number"]
    if not case_sensitive:
        cmd.append("-i")
    if title_only:
        cmd.extend(["-g", "*.md", "-t", "title"])
    
    cmd.extend(["-n", "--max-count", str(limit * 3)])  # extra for dedup
    cmd.extend([query, BRAIN_DIR])
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    
    if result.returncode != 0 and result.returncode != 1:
        return []
    
    # Parse and deduplicate results
    seen = set()
    matches = []
    for line in result.stdout.split("\n"):
        if ":" in line:
            parts = line.split(":", 2)
            if len(parts) == 3:
                file_path = os.path.basename(parts[0])
                if file_path not in seen:
                    seen.add(file_path)
                    matches.append({
                        "file": parts[0],
                        "line": int(parts[1]),
                        "content": parts[2].strip()
                    })
        if len(matches) >= limit:
            break
    
    return matches

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: oracle_search.py <query> [--case-sensitive] [--title-only] [--limit N]")
        sys.exit(1)
    
    query = sys.argv[1]
    case_sensitive = "--case-sensitive" in sys.argv
    title_only = "--title-only" in sys.argv
    limit = 20
    
    for i, arg in enumerate(sys.argv):
        if arg == "--limit" and i + 1 < len(sys.argv):
            try:
                limit = int(sys.argv[i + 1])
            except ValueError:
                pass
    
    results = search(query, case_sensitive, title_only, limit)
    
    if results:
        for r in results:
            print(f"{r['file']}:{r['line']}: {r['content'][:120]}")
    else:
        print(f"No matches for: {query}")
