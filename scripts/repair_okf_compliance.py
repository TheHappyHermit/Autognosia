#!/usr/bin/env python3
"""Repair OKF (Obsidian Knowledge Format) v2 compliance across wiki directories.

For every directory containing .md files (excluding archives/inboxes):
  1. Missing index.md        -> generate one with OKF frontmatter + links
  2. Index lacks frontmatter -> prepend compliant frontmatter
  3. Index missing links     -> append missing links under a Contents section

Never deletes content. Idempotent. --apply to write, default is dry-run.

Usage: repair_okf_compliance.py <wiki_root> [--apply]
"""

import os
import re
import sys
from datetime import datetime, timezone

SKIP_DIRS = {".obsidian", ".git", ".meta", "graphify-out", "_meta", "node_modules", "__pycache__"}
SKIP_PATTERNS = ("_archive", "_queues", "inbox/raw", "/raw/", "/historical/")

FM_TEMPLATE = """---
type: Index
title: {title}
description: Index of the {title} knowledge domain.
tags: [index, {slug}]
generated:
  by: autognosia/okf-repair
  at: {now}
status: stable
---
"""


def should_skip(dirpath: str, wiki_root: str) -> bool:
    rel = os.path.relpath(dirpath, wiki_root)
    if rel == ".":
        return False
    parts = rel.split(os.sep)
    if SKIP_DIRS & set(parts):
        return True
    return any(pat in f"/{rel}/" for pat in SKIP_PATTERNS)


def md_files(directory: str) -> list:
    return sorted(f for f in os.listdir(directory)
                  if f.endswith(".md") and f != "index.md")


def existing_links(content: str) -> set:
    """Collect wiki-links and markdown links present in the index."""
    links = set(re.findall(r"\[\[([^\]|#]+)", content))
    links.update(re.findall(r"\]\(([^)]+\.md)\)", content))
    return {l.strip().lstrip("./") for l in links}


def link_matches(link: str, filename: str) -> bool:
    base = os.path.splitext(filename)[0]
    return link == base or link.endswith("/" + base) or link.endswith(filename)


def repair_dir(dirpath: str, wiki_root: str, apply: bool) -> list:
    changes = []
    files = md_files(dirpath)
    index_path = os.path.join(dirpath, "index.md")
    dir_name = os.path.basename(dirpath)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Frontmatter repair applies even when index.md is the only file present.
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8", errors="ignore") as fh:
            content = fh.read()
        if not content.lstrip("\ufeff").startswith("---"):
            fm = FM_TEMPLATE.format(title=dir_name.replace("-", " ").replace("_", " ").title(),
                                    slug=dir_name.lower().replace(" ", "-"), now=now)
            changes.append(("add-frontmatter", index_path))
            if apply:
                with open(index_path, "w", encoding="utf-8") as fh:
                    fh.write(fm + "\n" + content)

    if not files:
        return changes

    if not os.path.exists(index_path):
        rel = os.path.relpath(dirpath, wiki_root)
        lines = [FM_TEMPLATE.format(title=dir_name.replace("-", " ").replace("_", " ").title(),
                                    slug=dir_name.lower().replace(" ", "-"), now=now),
                 f"# {dir_name.replace('-', ' ').replace('_', ' ').title()}\n",
                 "## Contents\n"]
        for f in files:
            lines.append(f"- [[{os.path.splitext(f)[0]}]] — {os.path.splitext(f)[0].replace('-', ' ').replace('_', ' ')}")
        changes.append(("create-index", index_path))
        if apply:
            with open(index_path, "w", encoding="utf-8") as fh:
                fh.write("\n".join(lines) + "\n")
        return changes

    with open(index_path, "r", encoding="utf-8", errors="ignore") as fh:
        content = fh.read()

    # 2. missing frontmatter
    if not content.lstrip("\ufeff").startswith("---"):
        fm = FM_TEMPLATE.format(title=dir_name.replace("-", " ").replace("_", " ").title(),
                                slug=dir_name.lower().replace(" ", "-"), now=now)
        changes.append(("add-frontmatter", index_path))
        if apply:
            with open(index_path, "w", encoding="utf-8") as fh:
                fh.write(fm + "\n" + content)

    # 3. missing links
    have = existing_links(content)
    missing = [f for f in files if not any(link_matches(l, f) for l in have)]
    if missing:
        add = ["\n## Contents\n"] if "## Contents" not in content else []
        for f in missing:
            add.append(f"- [[{os.path.splitext(f)[0]}]] — {os.path.splitext(f)[0].replace('-', ' ').replace('_', ' ')}")
        changes.append((f"add-{len(missing)}-links", index_path))
        if apply:
            with open(index_path, "a", encoding="utf-8") as fh:
                fh.write("\n".join(add) + "\n")
    return changes


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    wiki_root = os.path.abspath(sys.argv[1])
    apply = "--apply" in sys.argv
    totals = {"create-index": 0, "add-frontmatter": 0, "add-links": 0}
    for dirpath, dirnames, filenames in os.walk(wiki_root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        if should_skip(dirpath, wiki_root):
            continue
        for kind, path in repair_dir(dirpath, wiki_root, apply):
            totals[kind.split("-")[0] + "-" + kind.split("-")[1]
                   if kind.startswith("add-") and "links" not in kind
                   else ("create-index" if kind == "create-index"
                         else "add-frontmatter" if kind == "add-frontmatter"
                         else "add-links")] += 1
            print(f"[{'APPLY' if apply else 'DRY'}] {kind}: {path}")
    print(f"\nSummary ({'applied' if apply else 'dry-run'}): {totals}")


if __name__ == "__main__":
    main()
