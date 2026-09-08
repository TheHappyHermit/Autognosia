#!/usr/bin/env python3
"""Wiki maintenance script - fixes structural issues in Oracle wiki.
Run weekly by the 'Wiki Lint Weekly Deep' cron job.
"""
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

HOME = Path.home()
ORACLE_WIKI = HOME / ".autognosia/oracle/brain"
ACTIVE_WIKI = HOME / ".autognosia/active-wiki"

log_lines = []

def log(msg):
    log_lines.append(msg)
    print(msg, flush=True)

def create_index_for_domain(domain_path):
    """Create index.md for a domain if missing."""
    index_file = domain_path / "index.md"
    if index_file.exists():
        return False
    
    md_files = sorted([f.name for f in domain_path.glob("*.md") if f.name != "index.md"])
    subdomains = sorted([d.name for d in domain_path.iterdir() if d.is_dir()])
    
    content = f"""# {domain_path.name.replace('-', ' ').title()}

## Overview

Knowledge domain: {domain_path.name}

## Contents

### Files
{chr(10).join(f"- [{f}]({f})" for f in md_files) if md_files else "No files yet."}

### Subdomains
{chr(10).join(f"- [{s}]({s}/index.md)" for s in subdomains) if subdomains else "No subdomains."}

## Tags

tags: [wiki/oracle, {domain_path.name.lower().replace('-', ' ').replace(' ', ', ')}]

## Status

status: active
"""
    
    index_file.write_text(content)
    return True

def main():
    log("=" * 70)
    log("Wiki Maintenance - Weekly Deep Check")
    log(f"Timestamp: {datetime.now().isoformat()}")
    log("=" * 70)
    
    # 1. Check for missing index.md files
    log("\n[1] Checking for missing index.md files...")
    created = 0
    for domain in ORACLE_WIKI.iterdir():
        if domain.is_dir() and not domain.name.startswith('.'):
            if create_index_for_domain(domain):
                created += 1
    
    # Also check domains subdirectory
    domains_dir = ORACLE_WIKI / "domains"
    if domains_dir.exists():
        for domain in domains_dir.iterdir():
            if domain.is_dir():
                if create_index_for_domain(domain):
                    created += 1
    
    log(f"   Created {created} new index.md files")
    
    # 2. Check for duplicate filenames (excluding _archive and domains duplicates)
    log("\n[2] Checking for duplicate filenames...")
    file_locations = defaultdict(list)
    
    for md_file in ORACLE_WIKI.rglob("*.md"):
        if md_file.name == "index.md":
            continue
        file_locations[md_file.name].append(str(md_file.relative_to(ORACLE_WIKI)))
    
    duplicates = {name: paths for name, paths in file_locations.items() if len(paths) > 1}
    if duplicates:
        for name, paths in duplicates.items():
            log(f"   DUPLICATE: {name}")
            for p in paths:
                log(f"     - {p}")
    else:
        log("   No duplicate filenames found")
    
    # 3. Check wiki structure integrity
    log("\n[3] Checking wiki structure...")
    total_files = len(list(ORACLE_WIKI.rglob("*.md")))
    total_domains = len([d for d in ORACLE_WIKI.iterdir() if d.is_dir() and not d.name.startswith('.')])
    total_domains += len([d for d in (ORACLE_WIKI / "domains").iterdir() if d.is_dir()]) if (ORACLE_WIKI / "domains").exists() else 0
    
    log(f"   Total markdown files: {total_files}")
    log(f"   Total domains: {total_domains}")
    
    # 4. Verify Agent Zero is in correct location
    log("\n[4] Verifying Agent Zero location...")
    az_oracle = ORACLE_WIKI / "_archive" / "agent_zero_kb_import"
    az_active = ACTIVE_WIKI / "_archive" / "agent_zero_kb_import"
    
    if az_oracle.exists():
        log("   [OK] Agent Zero in oracle/brain/_archive/")
        if az_active.exists():
            log("   [WARN] Duplicate Agent Zero in active-wiki/_archive/ - should be removed")
    else:
        log("   [FAIL] Agent Zero missing from oracle/brain/_archive/")
    
    # 5. Verify Welcome.md and HOW-TO-USE.md in oracle root
    log("\n[5] Verifying oracle root files...")
    oracle_root = HOME / ".autognosia/oracle"
    
    for fname in ["Welcome.md", "HOW-TO-USE.md"]:
        fpath = oracle_root / fname
        if fpath.exists():
            log(f"   [OK] {fname} in oracle/")
        else:
            # Check if it's still in brain/
            brain_path = ORACLE_WIKI / fname
            if brain_path.exists():
                log(f"   [WARN] {fname} still in brain/ - should be in oracle/")
            else:
                log(f"   [WARN] {fname} missing")
    
    # 6. Verify concepts folder moved to oracle/brain
    log("\n[6] Verifying concepts folder location...")
    concepts_oracle = ORACLE_WIKI / "concepts"
    concepts_active = ACTIVE_WIKI / "concepts"
    
    if concepts_oracle.exists():
        log("   [OK] concepts folder in oracle/brain/")
        if concepts_active.exists():
            log("   [WARN] Duplicate concepts folder in active-wiki/ - should be removed")
    else:
        log("   [FAIL] concepts folder missing from oracle/brain/")
    
# 7. Contradiction check
    log("\n[7] Running contradiction check...")
    import subprocess
    try:
        result = subprocess.run(
            [sys.executable, "/home/user/scripts/research_quality_check.py",
             "--source", "active-wiki", "--sample", "20", "--check-contradictions"],
            capture_output=True, text=True, timeout=120
        )
        if result.stdout:
            for line in result.stdout.strip().split("\n")[:20]:
                log(f"   {line}")
        if result.returncode != 0 and result.stderr:
            log(f"   Error: {result.stderr.strip()[:200]}")
    except Exception as e:
        log(f"   Contradiction check failed: {e}")

    # 8. Usage analytics
    log("\n[8] Running usage analytics...")
    try:
        result = subprocess.run(
            [sys.executable, "/home/user/scripts/wiki_hit_counter.py",
             "list", "--source", "active-wiki", "--limit", "15"],
            capture_output=True, text=True, timeout=60
        )
        if result.stdout:
            for line in result.stdout.strip().split("\n")[:20]:
                log(f"   {line}")
    except Exception as e:
        log(f"   Hit counter failed: {e}")

    # Summary
    log("\n" + "=" * 70)
    log("Summary:")
    log(f"  - Index.md files created: {created}")
    log(f"  - Duplicate filenames: {len(duplicates)}")
    log(f"  - Total wiki files: {total_files}")
    log(f"  - Total domains: {total_domains}")
    log("=" * 70)

if __name__ == "__main__":
    main()
