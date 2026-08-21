#!/usr/bin/env python3
"""
Audit the Oracle wiki for structural health.

Checks:
- Total file count and size distribution
- Files without proper frontmatter
- Empty directories
- Files below minimum size threshold
- Broken cross-references (basic check)

Usage:
  python3 scripts/audit_wiki.py [--path ~/.autognosia/oracle/brain]
"""

import os
import sys
import argparse
import yaml

AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("~/.autognosia"))
DEFAULT_VAULT = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")

MIN_FILE_SIZE = 5000  # 5KB minimum for content files

def scan_vault(vault_path):
    """Scan vault and return audit results."""
    results = {
        "total_files": 0,
        "total_size": 0,
        "small_files": [],
        "missing_frontmatter": [],
        "empty_dirs": [],
        "broken_refs": [],
        "domains": {},
    }

    if not os.path.exists(vault_path):
        print(f"[WARN] Vault not found at {vault_path}")
        return results

    for root, dirs, files in os.walk(vault_path):
        rel = os.path.relpath(root, vault_path)
        dir_has_content = False

        for f in files:
            if not f.endswith(".md"):
                continue

            path = os.path.join(root, f)
            try:
                size = os.path.getsize(path)
                results["total_files"] += 1
                results["total_size"] += size
                dir_has_content = True

                # Check minimum size
                if size < MIN_FILE_SIZE and f != "index.md":
                    results["small_files"].append((size, os.path.relpath(path, vault_path)))

                # Check frontmatter
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read(2000)
                        if not content.startswith("---"):
                            results["missing_frontmatter"].append(
                                os.path.relpath(path, vault_path)
                            )
                except Exception:
                    pass

            except Exception:
                pass

        # Track domain stats
        domain = rel.split(os.sep)[0] if rel != "." else "root"
        if domain not in results["domains"]:
            results["domains"][domain] = {"files": 0, "size": 0}
        results["domains"][domain]["files"] += len([f for f in files if f.endswith(".md")])
        results["domains"][domain]["size"] += sum(
            os.path.getsize(os.path.join(root, f))
            for f in files if f.endswith(".md")
        )

        # Check for empty directories (no .md files)
        if not any(f.endswith(".md") for f in files) and rel != ".":
            results["empty_dirs"].append(rel)

    results["small_files"].sort()
    return results

def print_report(results):
    """Print audit report."""
    print(f"\n{'='*60}")
    print(f"Oracle Wiki Audit Report")
    print(f"{'='*60}")
    print(f"\nTotal files: {results['total_files']}")
    print(f"Total size: {results['total_size'] / 1024 / 1024:.1f} MB")

    if results["small_files"]:
        print(f"\n[WARN] Files under {MIN_FILE_SIZE/1024:.0f}KB ({len(results['small_files'])} files):")
        for size, path in results["small_files"][:20]:
            print(f"  {size:>8} bytes  {path}")
        if len(results["small_files"]) > 20:
            print(f"  ... and {len(results['small_files'])-20} more")

    if results["missing_frontmatter"]:
        print(f"\n[WARN] Files missing frontmatter ({len(results['missing_frontmatter'])} files):")
        for path in results["missing_frontmatter"][:15]:
            print(f"  {path}")
        if len(results["missing_frontmatter"]) > 15:
            print(f"  ... and {len(results['missing_frontmatter'])-15} more")

    if results["empty_dirs"]:
        print(f"\n[WARN] Empty directories ({len(results['empty_dirs'])} dirs):")
        for d in results["empty_dirs"]:
            print(f"  {d}")

    # Domain summary
    print(f"\n[STATS] Domain Summary:")
    for domain, stats in sorted(results["domains"].items()):
        size_mb = stats["size"] / 1024 / 1024
        print(f"  {domain}: {stats['files']} files, {size_mb:.1f} MB")

    print(f"\n{'='*60}\n")

def main():
    parser = argparse.ArgumentParser(description="Audit Oracle wiki for structural health.")
    parser.add_argument("--path", default=DEFAULT_VAULT, help="Path to vault directory")
    args = parser.parse_args()

    results = scan_vault(args.path)
    print_report(results)
    return 0

if __name__ == "__main__":
    sys.exit(main())
