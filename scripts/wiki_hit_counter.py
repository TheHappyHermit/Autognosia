#!/usr/bin/env python3
"""
Oracle → Active Wiki feedback mechanism.
When Oracle is queried and finds an answer in a research file,
increment a 'hit_count' in the front matter of that file.

Usage:
  python3 wiki_hit_counter.py increment <filepath>
  python3 wiki_hit_counter.py status <filepath>
  python3 wiki_hit_counter.py list --source active-wiki --sort hits
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

WIKI_PATHS = {
    "active-wiki": os.path.expanduser("~/.autognosia/active-wiki"),
    "oracle-brain": os.path.expanduser("~/.autognosia/oracle/brain"),
}

FRONT_MATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def parse_front_matter(content):
    """Extract YAML front matter from markdown content."""
    match = FRONT_MATTER_PATTERN.match(content)
    if not match:
        return None, content
    
    front_matter = {}
    for line in match.group(1).split("\n"):
        line = line.strip()
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            front_matter[key] = value
    
    body = content[match.end():]
    return front_matter, body


def update_front_matter(front_matter, body, updates):
    """Update front matter with new values."""
    updated = dict(front_matter)
    for key, value in updates.items():
        updated[key] = str(value)
    
    # Rebuild front matter YAML
    lines = ["---"]
    for key, value in updated.items():
        lines.append(f"{key}: {value}")
    lines.append("---")
    
    return "\n".join(lines) + "\n" + body


def increment_hit_count(filepath):
    """Increment hit_count for a wiki file."""
    filepath = Path(filepath)
    if not filepath.exists():
        print(f"File not found: {filepath}")
        return False
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        front_matter, body = parse_front_matter(content)
        if front_matter is None:
            print(f"No front matter found in {filepath}")
            return False
        
        current_hits = int(front_matter.get("hit_count", 0))
        new_hits = current_hits + 1
        
        updated = update_front_matter(front_matter, body, {
            "hit_count": new_hits,
            "last_accessed": datetime.now().strftime("%Y-%m-%d")
        })
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(updated)
        
        print(f"Hit count updated: {new_hits} (was {current_hits})")
        return True
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
        return False


def get_file_status(filepath):
    """Get hit count status for a file."""
    filepath = Path(filepath)
    if not filepath.exists():
        print(f"File not found: {filepath}")
        return
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        front_matter, body = parse_front_matter(content)
        if front_matter is None:
            print(f"No front matter found in {filepath}")
            return
        
        hits = int(front_matter.get("hit_count", 0))
        last_accessed = front_matter.get("last_accessed", "never")
        title = front_matter.get("title", filepath.name)
        
        print(f"File: {filepath}")
        print(f"  Title: {title}")
        print(f"  Hits: {hits}")
        print(f"  Last accessed: {last_accessed}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")


def list_files_by_hits(source, limit=20):
    """List wiki files sorted by hit count."""
    wiki_path = WIKI_PATHS.get(source)
    if not wiki_path or not os.path.exists(wiki_path):
        print(f"Wiki path not found: {wiki_path}")
        return
    
    files_with_hits = []
    for root, dirs, filenames in os.walk(wiki_path):
        dirs[:] = [d for d in dirs if d not in ["graphify-out", ".git"]]
        for fn in filenames:
            if fn.endswith(".md"):
                filepath = os.path.join(root, fn)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    front_matter, _ = parse_front_matter(content)
                    if front_matter:
                        hits = int(front_matter.get("hit_count", 0))
                        title = front_matter.get("title", fn)
                        files_with_hits.append((filepath, title, hits))
                except Exception:
                    continue
    
    # Sort by hits descending
    files_with_hits.sort(key=lambda x: x[2], reverse=True)
    
    print(f"{'Hits':>5}  {'Title'}")
    print(f"{'----':>5}  {'-----'}")
    for filepath, title, hits in files_with_hits[:limit]:
        print(f"{hits:>5}  {title[:50]}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Wiki hit counter feedback")
    subparsers = parser.add_subparsers(dest="command")
    
    # Increment command
    inc_parser = subparsers.add_parser("increment", help="Increment hit count")
    inc_parser.add_argument("filepath", help="Path to wiki file")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Get hit count status")
    status_parser.add_argument("filepath", help="Path to wiki file")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List files by hits")
    list_parser.add_argument("--source", choices=["active-wiki", "oracle-brain"], default="active-wiki")
    list_parser.add_argument("--limit", type=int, default=20, help="Max files to show")
    
    args = parser.parse_args()
    
    if args.command == "increment":
        success = increment_hit_count(args.filepath)
        sys.exit(0 if success else 1)
    elif args.command == "status":
        get_file_status(args.filepath)
    elif args.command == "list":
        list_files_by_hits(args.source, args.limit)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
