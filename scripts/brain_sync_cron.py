#!/usr/bin/env python3
"""
brain_sync_cron.py — Cron wrapper for brain_sync.py.

Syncs each source separately with individual timeouts.
Exits 0 always (non-critical) — never breaks the cron pipeline.

Sources: active-wiki, exchange-research (oracle-brain handled by separate monthly job)
"""

import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_DIR = Path.home()
BRAIN_SYNC = REPO_DIR / "scripts" / "brain_sync.py"
PYTHON = REPO_DIR / ".hermes/hermes-agent/venv/bin/python3"
SOURCES = ["active-wiki", "exchange-research"]

# Ollama runs on the V100 server, not localhost
os.environ.setdefault("BRAIN_OLLAMA_URL", "http://<V100_HOST>:11434")

# Per-source timeout — oracle-brain excluded (handled by separate monthly job)
OVERALL_TIMEOUT = 10800
PER_SOURCE_TIMEOUT = OVERALL_TIMEOUT // len(SOURCES) - 60


def rfc3339_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sync_source(source: str) -> bool:
    """Sync a single source. Returns True on success."""
    try:
        result = subprocess.run(
            [str(PYTHON), str(BRAIN_SYNC), "--source", source],
            capture_output=True, text=True, timeout=PER_SOURCE_TIMEOUT,
            cwd=str(REPO_DIR),
        )
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()

        # Only print if there were changes or errors
        lines = stdout.split("\n")
        has_changes = any("New:" in line or "Updated:" in line for line in lines
                         if line.strip() and not line.strip().startswith("Stats:"))
        
        if result.returncode != 0:
            print(f"[brain_sync_cron] {source}: ERROR rc={result.returncode}")
            if stderr:
                print(f"  stderr: {stderr[:200]}")
            return False
        
        if has_changes:
            # Print only the summary lines
            for line in lines:
                if any(k in line for k in ["New:", "Updated:", "Scanned:", "Errors:"]):
                    print(f"  {line.strip()}")
        
        return True
    except subprocess.TimeoutExpired:
        print(f"[brain_sync_cron] {source}: TIMEOUT after {PER_SOURCE_TIMEOUT}s")
        return False
    except Exception as e:
        print(f"[brain_sync_cron] {source}: ERROR {e}")
        return False


def main() -> int:
    if not BRAIN_SYNC.exists():
        print(f"[brain_sync_cron] brain_sync.py not found at {BRAIN_SYNC}")
        return 0

    if not PYTHON.exists():
        print(f"[brain_sync_cron] Python venv not found at {PYTHON}")
        return 0

    print(f"[brain_sync_cron] Starting sync at {rfc3339_now()}")
    print(f"[brain_sync_cron] Overall timeout: {OVERALL_TIMEOUT}s, Per-source timeout: {PER_SOURCE_TIMEOUT}s")

    results = {}
    for source in SOURCES:
        results[source] = sync_source(source)

    # Summary — only show if there were failures
    failures = [s for s, ok in results.items() if not ok]
    if failures:
        print(f"\n[brain_sync_cron] FAILURES: {', '.join(failures)}")
    else:
        print("[brain_sync_cron] All sources synced (no changes)")

    return 0  # Always exit 0


if __name__ == "__main__":
    sys.exit(main())
