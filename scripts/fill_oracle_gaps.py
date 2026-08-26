#!/usr/bin/env python3
"""
Oracle Knowledge Expansion — Identify gaps and create research request packages.

This script:
1. Scans the Oracle brain for topics with thin coverage
2. Identifies expansion directions (historical context, modern applications,
   critiques, related frameworks, competing theories)
3. Creates research request packages in the exchange/research directory
4. Only creates requests for genuinely missing content, not duplicates

Accepts --batch and --limit to enable distributed nightly execution:
  --batch N    which batch (0-4) to process — each batch picks one topic
  --limit N    max topics to create requests for (default 1)

Scheduled: 5 separate cron jobs at 0:00, 0:30, 1:00, 1:30, 2:00
"""

import argparse
import sys
import os
import json
from pathlib import Path
from datetime import datetime, timezone

ORACLE_BRAIN = Path.home() / ".autognosia" / "oracle" / "brain"
EXCHANGE_DIR = Path.home() / ".autognosia" / "exchange" / "research"


def list_topics():
    """Get all topic directories in the Oracle brain."""
    topics = []
    for dir_path in sorted(ORACLE_BRAIN.rglob("*")):
        if dir_path.is_dir() and not dir_path.name.startswith("."):
            files = list(dir_path.glob("*.md"))
            md_files = [f for f in files if f.name not in ("AGENTS.md", "index.md")]
            total_chars = sum(f.read_text().__len__() for f in md_files)
            topics.append(
                {
                    "path": str(dir_path),
                    "name": dir_path.name,
                    "file_count": len(md_files),
                    "total_chars": total_chars,
                }
            )
    return topics


def analyze_topics(topics):
    """Analyze topics for coverage gaps and expansion opportunities."""
    gaps = []

    for topic in topics:
        if topic["total_chars"] < 500:
            continue

        topic_path = Path(topic["path"])
        content = ""
        for md_file in topic_path.glob("*.md"):
            if md_file.name not in ("AGENTS.md", "index.md"):
                content += md_file.read_text() + "\n"

        expansions = []
        if "context" not in content.lower():
            expansions.append("historical_context")
        if "application" not in content.lower():
            expansions.append("modern_applications")
        if "critic" not in content.lower() and "limit" not in content.lower():
            expansions.append("critiques_and_limitations")
        if "related" not in content.lower() and "framework" not in content.lower():
            expansions.append("related_frameworks")
        if "vs" not in content.lower() and "comparison" not in content.lower():
            expansions.append("competing_theories")

        if expansions:
            gaps.append(
                {
                    "topic": topic["name"],
                    "path": topic["path"],
                    "current_chars": topic["total_chars"],
                    "current_files": topic["file_count"],
                    "expansions": expansions,
                }
            )

    return gaps


def create_research_request(gap, sequence_num):
    """Create a research request package in the exchange directory."""
    EXCHANGE_DIR.mkdir(parents=True, exist_ok=True)

    request_id = f"oracle-gap-{sequence_num:03d}"
    request_file = EXCHANGE_DIR / f"{request_id}.json"

    # Skip if already created
    if request_file.exists():
        existing = json.loads(request_file.read_text())
        if existing.get("status") in ("completed", "processing"):
            return None

    request = {
        "id": request_id,
        "created": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "type": "oracle_gap_expansion",
        "topic": gap["topic"],
        "topic_path": gap["path"],
        "current_coverage": {
            "chars": gap["current_chars"],
            "files": gap["current_files"],
        },
        "expansion_directions": gap["expansions"],
        "description": (
            f"The Oracle topic '{gap['topic']}' needs expansion "
            f"({gap['current_chars']} chars, {gap['current_files']} files). "
            f"Directions: {', '.join(gap['expansions'])}."
        ),
        "priority": "medium" if gap["current_chars"] > 1000 else "high",
    }

    with open(request_file, "w") as f:
        json.dump(request, f, indent=2)

    return request_id


def main():
    parser = argparse.ArgumentParser(description="Oracle Knowledge Expansion")
    parser.add_argument(
        "--batch", type=int, default=0, help="Batch number (0-4), picks topic at this index"
    )
    parser.add_argument(
        "--limit", type=int, default=1, help="Max topics to process per run"
    )
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    print(f"[oracle-expand] {now.isoformat()} batch={args.batch} limit={args.limit}")

    if not ORACLE_BRAIN.exists():
        print(f"[oracle-expand] ERROR: Oracle brain not found: {ORACLE_BRAIN}")
        sys.exit(1)

    topics = list_topics()
    print(f"[oracle-expand] Topics found: {len(topics)}")

    gaps = analyze_topics(topics)
    print(f"[oracle-expand] Topics with gaps: {len(gaps)}")

    if not gaps:
        print("[oracle-expand] No gaps found — all topics adequately covered")
        sys.exit(0)

    # Select topics based on batch offset
    start_idx = args.batch
    end_idx = start_idx + args.limit
    selected = gaps[start_idx:end_idx]

    if not selected:
        print(
            f"[oracle-expand] No topics remaining for batch {args.batch} "
            f"(offset {start_idx} into {len(gaps)} gaps)"
        )
        sys.exit(0)

    requests_created = 0
    requests_skipped = 0

    for gap in selected:
        request_id = create_research_request(gap, len(gaps))
        if request_id:
            requests_created += 1
            print(f"[oracle-expand] Created: {request_id}")
            print(f"  Topic: {gap['topic']} ({gap['current_chars']} chars)")
            print(f"  Directions: {', '.join(gap['expansions'])}")
        else:
            requests_skipped += 1
            print(f"[oracle-expand] Skipped (already exists): {gap['topic']}")

    print(f"\n[oracle-expand] Summary:")
    print(f"  New requests: {requests_created}")
    print(f"  Skipped: {requests_skipped}")
    print(f"  Batch {args.batch} processed {args.limit} topic(s)")
    print(f"  Remaining gaps for future batches: {len(gaps) - start_idx - args.limit}")


if __name__ == "__main__":
    main()
