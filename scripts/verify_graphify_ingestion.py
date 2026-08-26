#!/usr/bin/env python3
"""Verify graphify ingestion coverage for both wikis.

Reports, per wiki, how many source files graphify has actually ingested.

Resolution order for "what has been ingested" (first usable source wins):
  1. manifest.json        - graphify's own authoritative per-file record,
                            keyed by path relative to the scan root.
  2. cache/semantic/**    - one cache entry per successfully extracted file.
                            Count only; cannot name files.
  3. graph node provenance - scrape source/file/path fields off graph nodes.

WHY THIS REWRITE (2026-08-25):
  The previous version reported "Main Graphify ingested: 0 files" because:
    a) graphify_main_out pointed at '$HOME/oracle/brain/graphify-out',
       missing the '.autognosia' path segment, so it read a directory that
       does not exist and silently returned an empty set;
    b) it scraped '.graphify_chunk_*.json' looking for a 'source_file' key on
       each node. Those chunk files exist but carry no such key, so even the
       correct Oracle path yielded 0 named files;
    c) a missing/empty output dir was indistinguishable from "nothing ingested".

  Paths are now derived from a single ROOT constant, and an unreadable or
  absent output directory is reported as UNKNOWN rather than silently as 0.
  A check that can pass via fallback is not verifying anything.

Exit codes:
  0 - both wikis fully ingested
  1 - work remains, or coverage could not be determined
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(os.environ.get("AUTOGNOSIA_HOME", Path.home() / ".autognosia"))

WIKIS = [
    {
        "label": "Active Wiki",
        "source": ROOT / "active-wiki",
        "out": ROOT / "active-wiki" / "graphify-out",
    },
    {
        "label": "Oracle Brain",
        "source": ROOT / "oracle" / "brain",
        "out": ROOT / "oracle" / "brain" / "graphify-out",
    },
]

SKIP_DIRS = {
    ".obsidian",
    ".graphify",
    "__pycache__",
    "graphify-out",
    ".git",
    "node_modules",
}

# Counted as real source files. graphify also ingests .py as "code".
SOURCE_SUFFIXES = {".md"}


def find_source_files(directory: Path):
    """Return sorted relative paths of ingestable source files."""
    found = []
    if not directory.is_dir():
        return found
    for dirpath, dirnames, filenames in os.walk(directory):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if Path(name).suffix.lower() in SOURCE_SUFFIXES:
                rel = Path(dirpath, name).relative_to(directory)
                found.append(str(rel))
    return sorted(found)


def from_manifest(out_dir: Path):
    """Preferred source: graphify's manifest.json, keyed by relative path."""
    manifest = out_dir / "manifest.json"
    if not manifest.is_file():
        return None
    try:
        data = json.loads(manifest.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        print(f"    ! manifest.json unreadable: {exc}")
        return None
    if not isinstance(data, dict) or not data:
        return None
    return {k.replace("\\", "/") for k in data}


def semantic_cache_count(out_dir: Path):
    """Count cached extractions. Proves work happened; cannot name files."""
    cache = out_dir / "cache" / "semantic"
    if not cache.is_dir():
        return 0
    return sum(1 for _ in cache.rglob("*.json"))


def from_graph_nodes(out_dir: Path, source_dir: Path):
    """Last resort: scrape provenance fields off graph nodes."""
    graph = out_dir / "graph.json"
    if not graph.is_file():
        return None
    try:
        data = json.loads(graph.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        print(f"    ! graph.json unreadable: {exc}")
        return None

    nodes = data.get("nodes") if isinstance(data, dict) else None
    if not isinstance(nodes, list):
        return None

    keys = ("source_file", "source", "file", "path", "filepath", "rel_path")
    base = str(source_dir)
    ingested = set()
    for node in nodes:
        if not isinstance(node, dict):
            continue
        for key in keys:
            raw = node.get(key)
            if not isinstance(raw, str) or not raw:
                continue
            val = raw.replace("\\", "/")
            if val.startswith(base):
                val = str(Path(val).relative_to(base))
            ingested.add(val.lstrip("./"))
            break
    return ingested or None


def report(wiki):
    label = wiki["label"]
    source_dir = wiki["source"]
    out_dir = wiki["out"]

    print(f"\n{label}")
    print("-" * len(label))
    print(f"  source: {source_dir}")
    print(f"  output: {out_dir}")

    if not source_dir.is_dir():
        print(f"  [UNKNOWN] source directory does not exist")
        return None

    source_files = find_source_files(source_dir)
    total = len(source_files)
    print(f"  source files: {total}")

    if not out_dir.is_dir():
        print(f"  [UNKNOWN] output directory missing - never extracted?")
        return None

    cache_n = semantic_cache_count(out_dir)

    ingested = from_manifest(out_dir)
    method = "manifest.json"
    if ingested is None:
        ingested = from_graph_nodes(out_dir, source_dir)
        method = "graph node provenance"

    if ingested is None:
        # No nameable record. Report honestly instead of implying zero.
        print(f"  [UNKNOWN] no manifest.json and no usable node provenance")
        print(f"  semantic cache entries: {cache_n}")
        if cache_n:
            print(
                f"  -> {cache_n} extraction(s) are cached, so work HAS happened;"
                f" this run cannot name which files."
            )
            print(
                "  -> A completed run writes manifest.json. Its absence means the"
                " last run was interrupted before finalizing."
            )
        return None

    known = set(source_files)
    covered = sorted(known & ingested)
    missing = sorted(known - ingested)
    extra = sorted(ingested - known)

    print(f"  ingested (via {method}): {len(ingested)}")
    print(f"  semantic cache entries: {cache_n}")
    pct = (len(covered) / total * 100) if total else 0.0
    print(f"  COVERAGE: {len(covered)}/{total} ({pct:.1f}%)")

    if extra:
        print(f"  stale manifest entries (source deleted): {len(extra)}")
        for path in extra[:5]:
            print(f"    - {path}")
        if len(extra) > 5:
            print(f"    ... and {len(extra) - 5} more")

    if missing:
        print(f"  MISSING ({len(missing)}):")
        for path in missing[:20]:
            print(f"    - {path}")
        if len(missing) > 20:
            print(f"    ... and {len(missing) - 20} more")

    return len(missing)


def main():
    print("=" * 64)
    print("GRAPHIFY INGESTION VERIFICATION")
    print("=" * 64)
    print(f"root: {ROOT}")

    results = [report(w) for w in WIKIS]

    print("\n" + "=" * 64)
    if any(r is None for r in results):
        print("RESULT: INCOMPLETE - coverage unknown for at least one wiki.")
        print("        See [UNKNOWN] above. Not reporting success on a guess.")
        return 1

    outstanding = sum(r for r in results if r is not None)
    if outstanding == 0:
        print("RESULT: OK - both wikis fully ingested.")
        return 0
    print(f"RESULT: {outstanding} file(s) still need ingestion.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
