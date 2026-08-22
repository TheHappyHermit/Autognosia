#!/usr/bin/env python3
"""
Config Backup — Daily Cron Script

Backs up Hermes configuration (profiles, skills, cron definitions)
to a local Git repository for disaster recovery.

Copies from ${HOME}/.hermes/ to the Autognosia repo and commits+pushes.

Usage:
  python3 scripts/backup_config.py
"""

import os
import sys
import shutil
import subprocess
from datetime import datetime

HERMES_HOME = os.path.expanduser("${HOME}/.hermes")
AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("${HOME}/.autognosia"))
LOG_FILE = os.path.join(AUTOGNOSIA_HOME, "logs", "config-backup.log")

# Items to back up from ${HOME}/.hermes/
BACKUP_ITEMS = [
    "config.yaml",
    "SOUL.md",
    "profiles",
    "skills",
    "cron",
]

# Items to NEVER back up (secrets, runtime state)
EXCLUDE_PATTERNS = [
    ".env",
    "*.db",
    "sessions",
    "cache",
    "logs",
    "state.db",
    "auth.json",
]

def log(msg):
    timestamp = datetime.now().isoformat()
    line = f"[{timestamp}] {msg}"
    print(line)
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def should_exclude(path):
    """Check if a path matches any exclusion pattern."""
    basename = os.path.basename(path)
    for pattern in EXCLUDE_PATTERNS:
        if pattern.startswith("*"):
            if basename.endswith(pattern[1:]):
                return True
        elif basename == pattern:
            return True
    return False


def copy_item(src, dst):
    """Copy a file or directory, respecting exclusions."""
    if should_exclude(src):
        return 0

    if os.path.isfile(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        return 1

    if os.path.isdir(src):
        count = 0
        for item in os.listdir(src):
            item_src = os.path.join(src, item)
            item_dst = os.path.join(dst, item)
            if not should_exclude(item_src):
                count += copy_item(item_src, item_dst)
        return count

    return 0


def main():
    log("=== Config Backup Started ===")

    if not os.path.exists(HERMES_HOME):
        log(f"Hermes home not found at {HERMES_HOME} — skipping backup")
        return 0

    # Determine backup destination
    backup_dir = os.path.join(AUTOGNOSIA_HOME, "backups", "config",
                              datetime.now().strftime("%Y-%m-%d"))
    os.makedirs(backup_dir, exist_ok=True)

    # Copy each item
    total_files = 0
    for item in BACKUP_ITEMS:
        src = os.path.join(HERMES_HOME, item)
        dst = os.path.join(backup_dir, item)
        if os.path.exists(src):
            count = copy_item(src, dst)
            log(f"  Backed up {item}: {count} files")
            total_files += count
        else:
            log(f"  Skipped {item} (not found)")

    # Try git commit if the backup dir is in a git repo
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--is-inside-work-tree"],
            capture_output=True, text=True, timeout=5,
            cwd=backup_dir
        )
        if result.returncode == 0:
            subprocess.run(["git", "add", "-A"], cwd=backup_dir, timeout=10)
            subprocess.run(
                ["git", "commit", "-m",
                 f"Config backup: {datetime.now().isoformat()}"],
                cwd=backup_dir, timeout=10
            )
            subprocess.run(["git", "push"], cwd=backup_dir, timeout=30)
            log("  Git commit and push complete")
    except Exception as e:
        log(f"  Git operations skipped: {e}")

    log(f"=== Config Backup Complete: {total_files} files backed up ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
