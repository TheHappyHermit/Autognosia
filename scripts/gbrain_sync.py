#!/usr/bin/env python3
"""
GBrain sync — syncs the Oracle brain repo into GBrain.

Runs in no-agent cron (every 1h on this deployment). Exits 0 always.

PLATFORM: Cross-platform (Python 3)
  • gbrain CLI must be installed: `bun install -g github:garrytan/gbrain`
  • The gbrain binary must be on PATH
  • If gbrain is not installed, the script exits 0 silently (non-critical)

Linux-specific notes:
  • Bun is the recommended installer for gbrain on Linux
  • If using a package manager for bun, adjust the PATH accordingly

macOS:
  • Works identically to Linux — install Bun + gbrain CLI
  • PATH must include the Bun bin directory

Windows:
  • Bun is available via `winget install Oven.Bun` or from bun.sh
  • On Windows, gbrain.cmd may need to be called explicitly
  • The gbrain sync command is the same cross-platform
"""

import subprocess
import os
import sys
from pathlib import Path

AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
BRAIN_DIR = AUTOGNOSIA_HOME / "oracle" / "brain"

# ── helpers ──────────────────────────────────────────────────────────────
def _find_gbrain() -> str | None:
    """Find the gbrain CLI executable on PATH."""
    # Try direct name first
    gbrain = subprocess.run(
        ["which", "gbrain"], capture_output=True, text=True
    )
    if gbrain.returncode == 0:
        return gbrain.stdout.strip()
    # Check Windows variant
    if os.name == "nt":
        gbrain_win = subprocess.run(
            ["where", "gbrain"], capture_output=True, text=True
        )
        if gbrain_win.returncode == 0:
            return gbrain_win.stdout.strip().splitlines()[0]
    # Check common Bun locations
    home_bun = str(Path.home() / ".bun" / "bin")
    for candidate in [
        os.path.join(home_bun, "gbrain"),
        os.path.join(home_bun, "gbrain.cmd"),  # Windows
    ]:
        if os.path.isfile(candidate):
            return candidate
    return None

def main() -> int:
    # Check brain dir exists
    if not BRAIN_DIR.exists():
        print(f"[skip] Brain dir not found: {BRAIN_DIR}")
        return 0

    # Count markdown files
    try:
        md_files = list(BRAIN_DIR.rglob("*.md"))
    except PermissionError as e:
        print(f"[skip] Permission error accessing brain dir: {e}")
        return 0

    if not md_files:
        print("[skip] No .md files in brain dir")
        return 0

    # Find gbrain CLI
    gbrain_path = _find_gbrain()
    if gbrain_path is None:
        print("[skip] gbrain CLI not found on PATH")
        print("  Install: bun install -g github:garrytan/gbrain")
        return 0

    # Run sync
    try:
        result = subprocess.run(
            [gbrain_path, "sync", "--repo", str(BRAIN_DIR)],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print(f"[ok] Synced {len(md_files)} markdown files to GBrain")
            return 0
        else:
            stderr = result.stderr.strip()
            print(f"[warn] Sync failed (non-critical): {stderr[:200] or 'unknown error'}")
            return 0
    except subprocess.TimeoutExpired:
        print("[skip] Sync timed out after 120s")
        return 0
    except Exception as e:
        print(f"[skip] Sync error: {e}")
        return 0

if __name__ == "__main__":
    sys.exit(main())
