"""
GBrain sync script — syncs ~/.autognosia/oracle/brain into GBrain.
Runs in no-agent cron (every 15 min). Exits 0 if nothing changed.
"""

import subprocess
import os
import shutil
import sys
import time
from pathlib import Path

AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
BRAIN_DIR = AUTOGNOSIA_HOME / "oracle" / "brain"

def main():
    if not BRAIN_DIR.exists():
        print(f"[skip] Brain dir {BRAIN_DIR} not found")
        return 0
    
    # Check if any markdown files changed recently
    md_files = list(BRAIN_DIR.glob("**/*.md"))
    if not md_files:
        print("[skip] No .md files in brain dir")
        return 0
    
    # Try to sync (will fail silently if gbrain not configured)
    try:
        bun_bin = shutil.which("gbrain") or shutil.which("gbrain.cmd")
        if not bun_bin:
            candidates = [
                str(Path.home() / ".bun" / "bin" / "gbrain"),
                str(Path.home() / ".bun" / "bin" / "gbrain.cmd"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    bun_bin = c
                    break
        
        cmd = [bun_bin or "gbrain", "sync", "--repo", str(BRAIN_DIR)]
        result = subprocess.run(
            cmd,
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print(f"[ok] Synced {len(md_files)} markdown files to GBrain")
            return 0
        else:
            # Non-critical - brain may not be ready
            print(f"[warn] Sync failed: {result.stderr[:200] or 'unknown error'}")
            return 0
    except Exception as e:
        print(f"[skip] Sync error: {e}")
        return 0

if __name__ == "__main__":
    sys.exit(main())
