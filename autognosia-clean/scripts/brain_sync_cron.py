#!/usr/bin/env python3
"""
brain_sync_cron.py — Cron wrapper for brain_sync.py.

Runs brain_sync for all sources, exits 0 always (non-critical).
Designed for Hermes cron jobs with no-agent mode.

This script:
1. Calls brain_sync.py for all sources
2. Logs success/failure
3. Always exits 0 (never breaks the cron pipeline)
"""

import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
BRAIN_SYNC = REPO_DIR / "scripts" / "brain_sync.py"
PYTHON = REPO_DIR / ".venv" / "bin" / "python"


def rfc3339_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main() -> int:
    if not BRAIN_SYNC.exists():
        print(f"[brain_sync_cron] brain_sync.py not found at {BRAIN_SYNC}")
        return 0

    if not PYTHON.exists():
        print(f"[brain_sync_cron] Python venv not found at {PYTHON}")
        return 0

    print(f"[brain_sync_cron] Starting sync at {rfc3339_now()}")

    try:
        result = subprocess.run(
            [str(PYTHON), str(BRAIN_SYNC)],
            capture_output=True, text=True, timeout=3600,
            cwd=str(REPO_DIR),
        )
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()

        # Print last 20 lines of stdout
        lines = stdout.split("\n")
        for line in lines[-20:]:
            print(line)

        if result.returncode != 0:
            print(f"[brain_sync_cron] Sync exited with rc={result.returncode}")
            if stderr:
                print(f"[brain_sync_cron] stderr: {stderr[:500]}")

        return 0  # Always exit 0

    except subprocess.TimeoutExpired:
        print("[brain_sync_cron] Sync timed out after 600s")
        return 0
    except Exception as e:
        print(f"[brain_sync_cron] Error: {e}")
        return 0


if __name__ == "__main__":
    sys.exit(main())
