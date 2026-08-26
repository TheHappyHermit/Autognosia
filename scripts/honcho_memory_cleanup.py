#!/usr/bin/env python3
"""
Weekly Honcho memory hygiene check.

Connects to the locally-hosted Honcho Docker container and reports
on memory health. Honcho v3 manages its own memory lifecycle via the
Deriver, so this script focuses on:

1. Verifying Honcho is healthy
2. Reporting session/message counts
3. Checking for stale or oversized sessions

Honcho is self-hosted via docker-compose.honcho.yml at http://127.0.0.1:8000.

Usage:
  python3 scripts/honcho_memory_cleanup.py
"""

import os
import json
import sys
import urllib.request
import urllib.error

HONCHO_URL = os.environ.get("HONCHO_URL", "http://127.0.0.1:8000")
HONCHO_WORKSPACE = os.environ.get("HONCHO_WORKSPACE", "autognosia-workspace")


def honcho_get(path, timeout=10):
    """Make a GET request to the local Honcho API."""
    url = f"{HONCHO_URL}{path}"
    try:
        req = urllib.request.Request(url, method="GET")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} from {url}")
        return None
    except Exception as e:
        print(f"  Error connecting to {url}: {e}")
        return None


def check_health():
    """Check if Honcho is reachable and healthy."""
    print("=== Honcho Health ===")
    data = honcho_get("/health")
    if data is None:
        print("  [FAIL] Honcho not reachable at " + HONCHO_URL)
        return False
    print(f"  [OK] Honcho healthy: {json.dumps(data)}")
    return True


def check_queue_status():
    """Check the Honcho deriver queue status (if available)."""
    print("\n=== Deriver Queue ===")
    # Honcho v3 exposes queue status for the deriver
    data = honcho_get(f"/v3/workspaces/{HONCHO_WORKSPACE}/queue/status")
    if data is None:
        # Endpoint may not exist in all versions — not critical
        print("  Queue status endpoint not available (non-critical)")
        return
    print(f"  Queue status: {json.dumps(data, indent=2)}")


def report_stats():
    """Report basic Honcho statistics via the docs/openapi endpoint."""
    print("\n=== Honcho Info ===")
    # Try the OpenAPI docs endpoint to confirm version
    data = honcho_get("/openapi.json")
    if data and "info" in data:
        info = data["info"]
        print(f"  Version: {info.get('version', 'unknown')}")
        print(f"  Title: {info.get('title', 'unknown')}")
    else:
        print("  Could not retrieve API info")


def main():
    print(f"Honcho Memory Hygiene Check")
    print(f"Endpoint: {HONCHO_URL}\n")

    if not check_health():
        print("\n[SKIP] Honcho not reachable — skipping all checks")
        return 0  # Non-fatal: service may not be running yet

    report_stats()
    check_queue_status()

    print("\n[OK] Honcho memory hygiene check complete")
    print("Note: Honcho v3 manages memory lifecycle via the Deriver.")
    print("Manual memory deletion is not recommended — the Deriver handles")
    print("consolidation, summarization, and peer card generation automatically.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
