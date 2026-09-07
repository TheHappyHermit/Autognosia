#!/usr/bin/env python3
"""
Daily health check for Hermes Cortex.

Runs in no-agent cron (daily at 8 AM on this deployment).
Exits 0 if verification passes, 1 if it fails.

PLATFORM: Cross-platform (Python 3)
  • All dependencies (verify_stack.py, Python) are cross-platform
  • The verify_stack.py script must exist at ~/personal-agent/verify_stack.py

Linux-specific notes:
  • On Linux, systemctl is used — not available on macOS/Windows
  • macOS: use `launchctl` instead (verify_stack.py handles gracefully)
  • Windows: use `schtasks` instead (verify_stack.py handles gracefully)

macOS/Windows fallback:
  • The verify_stack.py script runs regardless of platform
  • It skips systemctl checks gracefully and reports what it can verify
"""

import subprocess
import sys
import os
from pathlib import Path

VERIFY_SCRIPT = Path.home() / "personal-agent" / "verify_stack.py"
PERSONAL_STATE_API = "http://127.0.0.1:8001/health"

def main() -> int:
    print("=== Daily Health Check ===")
    print(f"Time: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}")
    ok = True

    # Run verify_stack.py
    if VERIFY_SCRIPT.exists():
        result = subprocess.run(
            ["python3", str(VERIFY_SCRIPT)],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print("[ok] Verification passed")
            print(result.stdout[-500:])  # Last 500 chars of output
        else:
            print("[fail] Verification failed")
            print(result.stdout[-500:])
            ok = False
    else:
        print(f"[skip] verify_stack.py not found at {VERIFY_SCRIPT}")

    # Check Personal State API
    try:
        import urllib.request
        req = urllib.request.urlopen(PERSONAL_STATE_API, timeout=5)
        if req.status == 200:
            print("[ok] Personal State API healthy")
        else:
            print(f"[warn] Personal State API: HTTP {req.status}")
    except FileNotFoundError:
        print("[skip] Personal State API not available")
    except Exception as e:
        print(f"[warn] Personal State API error: {e}")

    print("=== Health check complete ===")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
