#!/usr/bin/env python3
"""
decision_synthesis — cron job that scans the brain DB decisions table
for contradictions, stance drift, and entity promotion.

Designed to run as a Hermes cron job:
  hermes cron create "0 6 * * *" \
    --prompt "Run the decision synthesis job and write results to the brain DB." \
    --delivery telegram

Or standalone:
  python3 decision_synthesis.py

Env vars (all optional):
  DECISION_DB_HOST     Postgres host (default: localhost)
  DECISION_DB_PORT     Postgres port (default: 5433)
  DECISION_DB_USER     Postgres user (default: brain)
  DECISION_DB_PASS     Postgres password (default: brain)
  DECISION_DB_NAME     Postgres database (default: brain)
  DECISION_SYNTH_OUTPUT  dir to write synthesis report markdown (default: .)
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("decision_synthesis")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

DB_HOST = os.getenv("DECISION_DB_HOST", "localhost")
DB_PORT = int(os.getenv("DECISION_DB_PORT", "5433"))
DB_USER = os.getenv("DECISION_DB_USER", "brain")
DB_PASS = os.getenv("DECISION_DB_PASS", "brain")
DB_NAME = os.getenv("DECISION_DB_NAME", "brain")
OUTPUT_DIR = os.getenv("DECISION_SYNTH_OUTPUT", ".")

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------

def pg_conn():
    import pg8000
    return pg8000.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER,
        password=DB_PASS, database=DB_NAME, timeout=10,
    )


def fetch_all_decisions() -> List[Dict[str, Any]]:
    """Fetch every decision from the decisions table."""
    conn = pg_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, slug, topic, title, decision_text, rationale, status,
                   supersedes_id, superseded_by, created_by, created_at, metadata
           FROM decisions
           ORDER BY topic, created_at ASC"""
    )
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    cur.close()
    conn.close()

    results: List[Dict[str, Any]] = []
    for row in rows:
        d: Dict[str, Any] = dict(zip(columns, row))
        if isinstance(d.get("metadata"), str):
            d["metadata"] = json.loads(d["metadata"])
        if isinstance(d.get("created_at"), str):
            pass  # pg8000 returns datetime objects, but just in case
        results.append(d)
    return results


def fetch_active_by_topic() -> Dict[str, Dict[str, Any]]:
    """Return the latest active decision per topic."""
    conn = pg_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, topic, decision_text, created_at, metadata
           FROM decisions
           WHERE status = 'active'
           ORDER BY topic, created_at DESC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result: Dict[str, Dict[str, Any]] = {}
    seen_topics: set = set()
    for row in rows:
        topic = row[1]
        if topic not in seen_topics:
            seen_topics.add(topic)
            result[topic] = {
                "id": row[0],
                "topic": topic,
                "decision_text": row[2],
                "created_at": row[3],
                "metadata": json.loads(row[4]) if row[4] else {},
            }
    return result


# ---------------------------------------------------------------------------
# Synthesis passes
# ---------------------------------------------------------------------------

def detect_contradictions(decisions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Find pairs of active decisions on the same topic with conflicting
    decision_text.
    """
    flags: List[Dict[str, Any]] = []
    by_topic: Dict[str, List[Dict[str, Any]]] = {}

    for d in decisions:
        if d["status"] != "active":
            continue
        by_topic.setdefault(d["topic"], []).append(d)

    for topic, group in by_topic.items():
        if len(group) < 2:
            continue
        # If there are multiple active decisions on the same topic,
        # that's a contradiction.
        for d in group[1:]:
            flags.append(
                {
                    "type": "contradiction",
                    "severity": "high",
                    "topic": topic,
                    "decision_id": d["id"],
                    "message": (
                        f"Topic '{topic}' has multiple active decisions. "
                        f"ID {group[0]['id']} ({group[0]['created_at']}) and "
                        f"ID {d['id']} ({d['created_at']}) are both active."
                    ),
                    "detail": f"Decision {group[0]['id']}: {group[0]['decision_text'][:100]}"
                              f" | Decision {d['id']}: {d['decision_text'][:100]}",
                }
            )

    return flags


def detect_stance_drift(decisions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect when a topic's decision stance has shifted across superseded
    decisions without an explicit change record.
    """
    flags: List[Dict[str, Any]] = []
    by_topic: Dict[str, List[Dict[str, Any]]] = {}

    for d in decisions:
        by_topic.setdefault(d["topic"], []).append(d)

    for topic, chain in by_topic.items():
        if len(chain) < 2:
            continue

        # Sort by created_at
        chain.sort(key=lambda d: d["created_at"])

        for i in range(1, len(chain)):
            prev = chain[i - 1]
            curr = chain[i]

            if curr["status"] == "superseded" and prev["status"] == "superseded":
                continue

            # Simple check: if the current decision doesn't reference
            # the previous one via supersedes_id, flag it.
            if curr["supersedes_id"] != prev["id"] and curr["status"] == "active":
                # Only flag if the decision text looks substantively different
                prev_text = prev["decision_text"].lower()
                curr_text = curr["decision_text"].lower()
                # Skip if very similar
                if prev_text[:30] == curr_text[:30]:
                    continue

                flags.append(
                    {
                        "type": "stance_drift",
                        "severity": "medium",
                        "topic": topic,
                        "decision_id": curr["id"],
                        "message": (
                            f"Topic '{topic}' stance may have drifted. "
                            f"Active decision {curr['id']} does not explicitly "
                            f"supersede previous decision {prev['id']} "
                            f"({prev['created_at']})."
                        ),
                        "detail": f"Previous: {prev['decision_text'][:120]}"
                                  f" | Current: {curr['decision_text'][:120]}",
                    }
                )

    return flags


def detect_entity_promotion(decisions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect recurring patterns across decisions that might warrant
    promotion to a higher-level principle or policy.
    """
    from collections import Counter

    flags: List[Dict[str, Any]] = []

    # Count topics
    topic_counts = Counter(d["topic"] for d in decisions if d["status"] == "active")

    # Topics with 3+ decisions might warrant a policy
    for topic, count in topic_counts.items():
        if count >= 3:
            flags.append(
                {
                    "type": "entity_promotion",
                    "severity": "low",
                    "topic": topic,
                    "decision_count": count,
                    "message": (
                        f"Topic '{topic}' has {count} active/superseded decisions. "
                        f"Consider promoting to a standing policy or principle."
                    ),
                }
            )

    return flags


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

def generate_report(
    contradictions: List[Dict[str, Any]],
    drift_flags: List[Dict[str, Any]],
    promotions: List[Dict[str, Any]],
) -> str:
    """Generate a markdown synthesis report."""
    now = datetime.now(timezone.utc).isoformat()
    lines: List[str] = []
    lines.append(f"# Decision Synthesis Report")
    lines.append("")
    lines.append(f"- **Generated:** {now}")
    lines.append(f"- **Total flags:** {len(contradictions) + len(drift_flags) + len(promotions)}")
    lines.append("")

    for label, flags, severity_order in [
        ("Contradictions", contradictions, ["high"]),
        ("Stance Drift", drift_flags, ["medium"]),
        ("Entity Promotion Candidates", promotions, ["low"]),
    ]:
        lines.append(f"## {label}")
        lines.append("")
        if not flags:
            lines.append("_None._")
        else:
            for f in flags:
                sev = f.get("severity", "unknown")
                lines.append(f"### [{sev.upper()}] {f.get('topic', 'N/A')}")
                lines.append("")
                lines.append(f"{f['message']}")
                if f.get("detail"):
                    lines.append("")
                    lines.append(f"```")
                    lines.append(f"{f['detail']}")
                    lines.append(f"```")
                lines.append("")

    lines.append("---")
    lines.append(f"*Auto-generated by decision_synthesis cron job.*")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Metadata write-back
# ---------------------------------------------------------------------------

def mark_synthesis_run(flags_count: int) -> None:
    """Write a synthesis event into the decisions table metadata."""
    try:
        conn = pg_conn()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO decisions
               (slug, topic, title, decision_text, status, metadata, created_by)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                "synth-run-" + datetime.now().strftime("%Y%m%d%H%M%S"),
                "synthesis",
                "Synthesis run",
                f"Synthesis completed with {flags_count} flag(s).",
                "archived",
                json.dumps({
                    "type": "synthesis_run",
                    "flags_count": flags_count,
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                }),
                "decision_synthesis",
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Recorded synthesis run in decisions table")
    except Exception as exc:
        logger.error("Failed to record synthesis run: %s", exc)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    logger.info("Starting decision synthesis run...")

    decisions = fetch_all_decisions()
    logger.info("Fetched %d total decisions", len(decisions))

    contradictions = detect_contradictions(decisions)
    drift_flags = detect_stance_drift(decisions)
    promotions = detect_entity_promotion(decisions)

    total_flags = len(contradictions) + len(drift_flags) + len(promotions)
    logger.info(
        "Synthesis complete: %d contradictions, %d drift, %d promotion candidates",
        len(contradictions), len(drift_flags), len(promotions),
    )

    report = generate_report(contradictions, drift_flags, promotions)

    # Write report to file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    report_path = os.path.join(OUTPUT_DIR, f"decisions-synth-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md")
    with open(report_path, "w") as f:
        f.write(report)
    logger.info("Wrote report: %s", report_path)

    # Record the run
    mark_synthesis_run(total_flags)

    return 0 if total_flags == 0 else 1  # non-zero if there are flags to review


if __name__ == "__main__":
    sys.exit(main())
