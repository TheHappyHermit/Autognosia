#!/usr/bin/env python3
"""
Weekly GBrain doctor check.

PLATFORM: Cross-platform (Python 3)
  • gbrain CLI must be installed: bun install -g github:garrytan/gbrain
  • Must be on PATH — same on Linux, macOS, Windows
"""

import subprocess
import sys

GBRAIN = "gbrain"

def main() -> int:
    print("=== Weekly GBrain Doctor ===")
    print(f"Time: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}")
    
    try:
        result = subprocess.run(
            [GBRAIN, "doctor"],
            capture_output=True, text=True, timeout=120
        )
        print(result.stdout)
        if result.stderr:
            print(f"[stderr] {result.stderr[:500]}")
    except FileNotFoundError:
        print("[error] gbrain CLI not found on PATH")
        print("  Install: bun install -g github:garrytan/gbrain")
        return 1
    except Exception as e:
        print(f"[error] {e}")
        return 1
    
    print("=== Done ===")
    return 0

if __name__ == "__main__":
    sys.exit(main())
