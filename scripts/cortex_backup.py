#!/usr/bin/env python3
"""
Daily backup for Autognosia.

Runs in no-agent cron (daily at 3 AM on this deployment).
Exits 0 always — never breaks the cron chain.

PLATFORM: Cross-platform (Python 3 + tar)
  • tar is available on Linux, macOS, and Windows (Git Bash, WSL, Cygwin)
  • On Windows without tar, install via: winget install GNU tar
  • The archive format (.tar.gz) is readable on all platforms

Linux-specific notes:
  • Works as-is — tar is standard on all Linux distros
  • Docker volume path is Linux-specific (see code comment)

macOS:
  • tar is included with Xcode Command Line Tools
  • If not available: xcode-select --install

Windows:
  • Requires tar (available via Git for Windows or winget install GNU tar)
  • The tar command syntax is the same — only the binary name matters
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# ── paths ────────────────────────────────────────────────────────────────
BACKUP_DIR = Path.home() / "backups"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

# Directories/files to back up (cross-platform paths)
BACKUP_TARGETS = [
    Path.home() / ".autognosia",
    Path.home() / ".hermes" / "config.yaml",
    Path.home() / ".hermes" / "config" / "architecture.yaml",
]

# Files/dirs to exclude
EXCLUDES = [
    "*.pyc",
    "__pycache__",
    ".git",
    "state.db",
    "state.db.*",
    "cache/",
    "*.db-wal",
    "*.db-shm",
    "*.log",
]

def _exclude_args() -> list[str]:
    """Build tar --exclude arguments."""
    return [f"--exclude={e}" for e in EXCLUDES]

def main() -> int:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    archive = BACKUP_DIR / f"autognosia-{TIMESTAMP}.tar.gz"

    print(f"Starting backup at {datetime.now()}")

    # Build tar command using HOME-relative paths to avoid tar warnings
    home = str(Path.home())
    relative_targets = []
    for t in BACKUP_TARGETS:
        t_str = str(t)
        if t_str.startswith(home):
            relative_targets.append(t_str[len(home)+1:])  # strip ${HOME}/
        else:
            relative_targets.append(t_str)

    # Change to HOME directory and run tar with relative paths
    import shutil
    work_dir = home
    cmd = ["tar", "czf", str(archive)] + relative_targets + _exclude_args()

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600, cwd=work_dir)
    # tar exit code 2 = warnings only (not errors), exit code 0 = success
    if result.returncode in (0, 2):
        print(f"Backup completed: {archive}")
    else:
        print(f"[warn] tar error (rc={result.returncode}): {result.stderr[:200] or 'unknown error'}")

    # Clean up old backups — keep last 7
    try:
        archives = sorted(
            BACKUP_DIR.glob("autognosia-*.tar.gz"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        for old in archives[7:]:
            old.unlink()
            print(f"[cleanup] Removed old backup: {old.name}")
    except Exception as e:
        print(f"[warn] Cleanup error: {e}")

    return 0

if __name__ == "__main__":
    sys.exit(main())
