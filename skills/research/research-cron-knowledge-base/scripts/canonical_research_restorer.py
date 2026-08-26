#!/usr/bin/env python3
import shutil
import sys
from pathlib import Path


def restore_research_md(vault_relative_path: str, canonical_path: str) -> Path:
    """Replace a corrupted RESEARCH.md from a trusted Vault mirror."""
    src = Path.home() / "Documents/Hermes-Vault" / vault_relative_path
    dst = Path(canonical_path)
    if not src.exists():
        print(f"restore candidate missing: {src}")
        raise SystemExit(2)
    if not dst.exists() or not dst.is_file():
        print(f"destination missing or not a file: {dst}")
        raise SystemExit(3)

    src_size = src.stat().st_size
    src_lines = src.read_text(errors="ignore").count("\n")
    dst_size = dst.stat().st_size
    dst_lines = dst.read_text(errors="ignore").count("\n")

    backup_path = dst.with_suffix(".bak.pre-restorer")
    shutil.copy2(dst, backup_path)

    shutil.copy2(src, dst)
    print(f"restored {dst} from {src}")
    print(f"src size {src_size} bytes ({src_lines} lines)")
    print(f"old dst size {dst_size} bytes ({dst_lines} lines)")
    print(f"new dst size {dst.stat().st_size} bytes ({dst.read_text(errors='ignore').count(chr(10))} lines)")
    print(f"prior dst backed up to {backup_path}")
    return dst


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: canonical_research_restorer.py <vault-relative-path-to-canonical-RESEARCH.md> </absolute/canonical/RESEARCH.md>")
        raise SystemExit(1)
    restore_research_md(sys.argv[1], sys.argv[2])
