#!/usr/bin/env python3
"""Pre-write verification for RESEARCH.md operations.

Run this BEFORE any write operation on RESEARCH.md to:
1. Verify the file exists and has expected content
2. Record a snapshot for comparison after the write
3. Verify the write was successful (line count increased)

Usage:
    python3 verify_research_append.py              # Record pre-snapshot
    python3 verify_research_append.py --check       # Verify post-write
    python3 verify_research_append.py --rebuild      # Rebuild from individual files
"""

import os
import sys
import json
import subprocess
from pathlib import Path

RESEARCH_PATH = Path('$HOME/Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md')
RESEARCH_DIR = Path('$HOME/Vault/wealthforge-ai-local/knowledge_base/research_outcomes')
SNAPSHOT_PATH = Path('/tmp/research_snapshot.json')


def record_snapshot():
    """Record a snapshot of RESEARCH.md before write."""
    if not RESEARCH_PATH.exists():
        print("WARNING: RESEARCH.md does not exist!")
        return

    line_count = sum(1 for _ in RESEARCH_PATH.read_text().splitlines())
    last_lines = RESEARCH_PATH.read_text().splitlines()[-5:]

    snapshot = {
        'line_count': line_count,
        'last_lines': last_lines,
        'individual_files': sorted([
            f for f in RESEARCH_DIR.glob('*.md')
            if f.name != 'RESEARCH.md' and f.name != 'RESEARCH.md.bak'
        ])
    }

    SNAPSHOT_PATH.write_text(json.dumps(snapshot, indent=2))
    print(f"Snapshot recorded: {line_count} lines, last lines: {last_lines[-3:]}")
    print(f"Individual files: {len(snapshot['individual_files'])}")
    print("After writing, run: python3 verify_research_append.py --check")


def check_post_write():
    """Verify RESEARCH.md was appended correctly."""
    if not SNAPSHOT_PATH.exists():
        print("ERROR: No snapshot found. Run without --check first.")
        return

    snapshot = json.loads(SNAPSHOT_PATH.read_text())
    old_count = snapshot['line_count']

    if not RESEARCH_PATH.exists():
        print("ERROR: RESEARCH.md does not exist after write!")
        sys.exit(1)

    new_count = sum(1 for _ in RESEARCH_PATH.read_text().splitlines())
    diff = new_count - old_count

    if diff > 0:
        print(f"SUCCESS: RESEARCH.md appended correctly (+{diff} lines)")
        print(f"Old: {old_count} lines, New: {new_count} lines")
    elif diff == 0:
        print("WARNING: Line count unchanged — write may have failed")
    else:
        print(f"ERROR: Line count DECREASED by {abs(diff)} — file was OVERWRITTEN!")
        print("RESEARCH.md was overwritten, not appended to!")
        sys.exit(1)

    # Show last 10 lines
    content = RESEARCH_PATH.read_text()
    print("\nLast 10 lines:")
    for line in content.splitlines()[-10:]:
        print(f"  {line}")

    SNAPSHOT_PATH.unlink(missing_ok=True)


def rebuild_from_individual():
    """Rebuild RESEARCH.md from individual research files."""
    files = sorted([
        f for f in RESEARCH_DIR.glob('*.md')
        if f.name != 'RESEARCH.md' and f.name != 'RESEARCH.md.bak'
    ])

    header = "# WealthForge AI Research Log\n## APPEND-ONLY\n\n---\n\n"
    all_content = header

    for f in files:
        all_content += f"\n## File: {f.name}\n\n{f.read_text()}\n\n---\n\n"

    RESEARCH_PATH.write_text(all_content)
    print(f"RESEARCH.md rebuilt from {len(files)} individual files")
    print(f"Total lines: {len(all_content.splitlines())}")


if __name__ == '__main__':
    if '--check' in sys.argv:
        check_post_write()
    elif '--rebuild' in sys.argv:
        rebuild_from_individual()
    else:
        record_snapshot()
