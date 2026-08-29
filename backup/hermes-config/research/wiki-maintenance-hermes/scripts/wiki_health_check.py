#!/usr/bin/env python
"""
Wiki Health Check Script
Scans the LLM_WIKI for orphans, broken wikilinks, index completeness, and frontmatter issues.
Usage: python wiki_health_check.py [wiki_path]
Default wiki path: C:/Hermes/LLM_WIKI

This implements the "quick check" lint (categories 1-3 from SCHEMA.md).
For full 11-category lint, use the llm-wiki skill's lint operation directly.
"""
import os
import re
import sys
from collections import defaultdict

WIKI = sys.argv[1] if len(sys.argv) > 1 else "C:/Hermes/LLM_WIKI"

# ── Collect pages ──────────────────────────────────────────────────────────────
wiki_pages = []
for root, dirs, files in os.walk(WIKI):
    rel = os.path.relpath(root, WIKI)
    if "_archive" in rel or rel.startswith("raw"):
        continue
    for f in files:
        if f.endswith(".md"):
            wiki_pages.append(os.path.join(root, f))

content_pages = [p for p in wiki_pages if os.path.basename(p) not in
                 ("index.md", "log.md", "SCHEMA.md", "AGENTS.md")]
meta_slugs = {"SCHEMA", "index", "log"}

# Build slug set and filename→slug map for Obsidian-style resolution
page_slugs = set()
filename_to_slugs = defaultdict(list)
for p in wiki_pages:
    rel = os.path.relpath(p, WIKI).replace(".md", "")
    rel = rel.replace("\\", "/")
    page_slugs.add(rel)
    fname = os.path.splitext(os.path.basename(p))[0]
    filename_to_slugs[fname].append(rel)

def resolve_link(target):
    """Obsidian-style: [[target]] matches if target equals any filename in the wiki.
    CRITICAL: Do NOT use full-path matching — Obsidian resolves by filename, not path.
    This means [[wikilinks]] in documentation text about wikilinks will NOT resolve
    to actual pages unless a file is literally named 'wikilinks.md'."""
    if target in page_slugs:
        return True
    if target in filename_to_slugs:
        return True
    target_lower = target.lower()
    for fname in filename_to_slugs:
        if fname.lower() == target_lower:
            return True
    return False

# ── Scan wikilinks ────────────────────────────────────────────────────────────
all_wikilinks = defaultdict(set)
resolved_targets = defaultdict(set)

for p in content_pages:
    try:
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        continue
    rel = os.path.relpath(p, WIKI).replace(".md", "").replace("\\", "/")
    links = re.findall(r"\[\[([^\]]+)\]\]", content)
    for link in links:
        target = link.split("|")[0].strip()
        all_wikilinks[rel].add(target)
        if target in page_slugs:
            resolved_targets[target].add(rel)
        elif target in filename_to_slugs:
            for s in filename_to_slugs[target]:
                resolved_targets[s].add(rel)
        else:
            for fname, slugs in filename_to_slugs.items():
                if fname.lower() == target.lower():
                    for s in slugs:
                        resolved_targets[s].add(rel)

# ── Broken wikilinks ──────────────────────────────────────────────────────────
broken = []
for source, targets in sorted(all_wikilinks.items()):
    for target in sorted(targets):
        if not resolve_link(target):
            broken.append((source, target))

# ── Orphan pages ──────────────────────────────────────────────────────────────
orphans = []
for slug in sorted(page_slugs):
    if slug in meta_slugs:
        continue
    if slug not in resolved_targets or len(resolved_targets[slug]) == 0:
        orphans.append(slug)

# ── Index completeness ────────────────────────────────────────────────────────
idx_path = os.path.join(WIKI, "index.md")
with open(idx_path, "r") as f:
    index_content = f.read()
index_links = set(re.findall(r"\[\[([^\]]+)\]\]", index_content))
missing_from_index = []
for slug in sorted(page_slugs):
    if slug in meta_slugs or slug.endswith("/AGENTS") or slug.endswith("AGENTS"):
        continue
    found = False
    for il in index_links:
        il_clean = il.split("|")[0].strip()
        if il_clean == slug or il_clean in filename_to_slugs or il_clean.lower() == slug.lower():
            found = True
            break
    if not found:
        missing_from_index.append(slug)

# ── Frontmatter validation ────────────────────────────────────────────────────
required_fields = ["id", "title", "type", "status", "created", "updated"]
fm_issues = []
for p in content_pages:
    try:
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        continue
    rel = os.path.relpath(p, WIKI).replace("\\", "/")
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not fm_match:
        fm_issues.append((rel, "No YAML frontmatter"))
        continue
    fm = {}
    for line in fm_match.group(1).split("\n"):
        line = line.strip()
        if ":" in line and not line.startswith("#"):
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    if not fm:
        fm_issues.append((rel, "Empty frontmatter"))
        continue
    for field in required_fields:
        if field not in fm:
            fm_issues.append((rel, f"Missing: {field}"))

# ── Report ────────────────────────────────────────────────────────────────────
print("=" * 50)
print("WIKI HEALTH CHECK")
print("=" * 50)
print(f"Wiki: {WIKI}")
print(f"Content pages: {len(content_pages)}")
print()

if broken:
    print(f"✗ BROKEN WIKILINKS ({len(broken)})")
    for src, tgt in broken:
        print(f"    {src} -> [{tgt}]")
else:
    print("✓ Broken wikilinks: none")

if orphans:
    print(f"\n⚠ ORPHAN PAGES ({len(orphans)})")
    for o in orphans:
        sev = "MEDIUM" if not o.startswith("AGENTS") and "memory-archive" not in o and "_template" not in o else "LOW"
        print(f"    [{sev}] {o}")
else:
    print("\n✓ Orphan pages: none")

if missing_from_index:
    print(f"\n✗ MISSING FROM INDEX ({len(missing_from_index)})")
    for m in missing_from_index:
        print(f"    {m}")
else:
    print("✓ Index completeness: all pages present")

if fm_issues:
    print(f"\n⚠ FRONTMATTER ISSUES ({len(fm_issues)})")
    for rel, issue in fm_issues:
        print(f"    {rel}: {issue}")
else:
    print("✓ Frontmatter: all valid")

total = len(broken) + len([o for o in orphans if not o.startswith("AGENTS") and "memory-archive" not in o and "_template" not in o]) + len(missing_from_index) + len(fm_issues)
print()
print("=" * 50)
if total == 0:
    print("STATUS: ✓ HEALTHY")
elif total <= 5:
    print(f"STATUS: ⚠ MINOR ({total} issues)")
else:
    print(f"STATUS: ✗ NEEDS ATTENTION ({total} issues)")
print("=" * 50)
