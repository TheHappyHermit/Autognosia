#!/usr/bin/env python3
"""
brain_sync_cron.py — Cron wrapper for brain_sync.py.

Syncs each source separately with individual timeouts.
Exits 1 on failure so the cron system can track job health.

Sources: active-wiki, exchange-research (oracle-brain handled by separate monthly job)
"""

import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_DIR = Path("/home/user")
BRAIN_SYNC = REPO_DIR / "scripts" / "brain_sync.py"
PYTHON = Path("/home/user/.hermes/hermes-agent/venv/bin/python3")
SOURCES = ["active-wiki", "exchange-research"]

# Embeddings via llama.cpp on :18082 (server), not localhost
os.environ.setdefault("BRAIN_OLLAMA_URL", "http://10.x.x.x:18082")
# Use OpenAI-compatible API (llama.cpp) instead of native Ollama
os.environ.setdefault("BRAIN_API_MODE", "openai")

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

        # Only print if there were actual changes (values > 0) or errors
        lines = stdout.split("\n")
        has_changes = False
        for line in lines:
            if not line.strip() or line.strip().startswith("Stats:"):
                continue
            # Check for "New: N" or "Updated: N" where N > 0
            for key in ["New:", "Updated:"]:
                if key in line:
                    try:
                        val = int(line.split(key)[1].strip().split()[0])
                        if val > 0:
                            has_changes = True
                            break
                    except (ValueError, IndexError):
                        pass
        
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

    results = {}
    for source in SOURCES:
        results[source] = sync_source(source)

    # Run verification after sync
    print("\n[brain_sync_cron] Running post-sync verification...")
    verify_script = Path("/home/user/scripts/verify_brain_sync.py")
    if verify_script.exists():
        for source in SOURCES:
            try:
                verify_result = subprocess.run(
                    [str(PYTHON), str(verify_script), "--source", source],
                    capture_output=True, text=True, timeout=60,
                    cwd=str(REPO_DIR),
                )
                if verify_result.returncode == 0:
                    print(f"  {source}: ✓ verified")
                else:
                    print(f"  {source}: ✗ verification failed")
                    if verify_result.stderr:
                        print(f"    {verify_result.stderr.strip()[:200]}")
            except Exception as e:
                print(f"  {source}: verification error: {e}")
    else:
        print(f"  verify_brain_sync.py not found, skipping verification")

    # Summary
    failures = [s for s, ok in results.items() if not ok]
    if failures:
        print(f"\n[brain_sync_cron] FAILURES: {', '.join(failures)}")
        return 1
    else:
        print(f"\n[brain_sync_cron] All sources synced OK ({len(SOURCES)} sources)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
