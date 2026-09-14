"""
decision_logger — Hermes Agent plugin

Registers an agent:end hook that scans the agent's final response for
decision-like statements and writes them to the brain DB decisions table.

Design goals:
  - Zero configuration at run time; everything is env-driven.
  - Never blocks the agent loop on a DB write failure.
  - Idempotent: a decision with the same slug+topic+decision_text+date
    is skipped (dedup on a hash column).
  - Passive: the plugin never prompts the user, never modifies the
    agent's output, and never raises an exception that would crash
    the agent loop.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import textwrap
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger("decision_logger")

# ---------------------------------------------------------------------------
# Configuration (env vars — no secrets, no PII)
# ---------------------------------------------------------------------------

DB_HOST = os.getenv("DECISION_DB_HOST", "localhost")
DB_PORT = int(os.getenv("DECISION_DB_PORT", "5433"))
DB_USER = os.getenv("DECISION_DB_USER", "brain")
DB_PASS = os.getenv("DECISION_DB_PASS", "brain")
DB_NAME = os.getenv("DECISION_DB_NAME", "brain")

# How many chars of the response to scan for decision patterns.
# The full response can be very long; we look at the tail first because
# conclusions and summaries tend to land there.
SCAN_TAIL_CHARS = int(os.getenv("DECISION_SCAN_TAIL_CHARS", "4000"))

# Minimum confidence (0.0–1.0) before a detected decision is written.
CONFIDENCE_THRESHOLD = float(os.getenv("DECISION_CONFIDENCE_THRESHOLD", "0.60"))

# If you want the plugin to also write a markdown page to the brain DB
# wiki (pages table), set this to a base directory.  Leave empty to skip.
WIKI_OUTPUT_DIR = os.getenv("DECISION_WIKI_OUTPUT_DIR", "")

# ---------------------------------------------------------------------------
# Detection patterns
# ---------------------------------------------------------------------------

# Phrases that strongly suggest a decision statement.
_DECISION_TRIGGERS = re.compile(
    r"\b(decided|decides|decision|going with|going to use|picked|"
    r"chosen|opt(?:ed|ing)? for|settled on|ruling out|rejecting|trial of|"
    r"experiment with|pause(?:d)? (?:the )?(?:work|lane|research)|"
    r"resume(?:d)? (?:the )?(?:work|lane|research)|switch(?:ing)? to|"
    r"migrat(?:ing|ed)? to|replaced by|supersedes|no longer using|"
    r"dropping|deprecat(?:ing|ed)?|adopt(?:ed)?|final(?:ized|ise|ize)|"
    r"agreement|conclusion|recommendation is|approach will be|"
    r"direction is|strategy is|plan is)\b",
    re.IGNORECASE,
)

# Split on sentence-ending punctuation followed by whitespace + capital letter.
# This avoids splitting on periods inside version numbers, file paths, initials, etc.
# re.DOTALL so \s+ matches newlines between sentences.
_SENTENCE_SPLIT = re.compile(
    r"(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\s*$", re.DOTALL
)


def _sentences(text: str) -> List[str]:
    """Split text into sentences, trimmed.  Filters out fragments that are
    too short or don't look like real sentences."""
    parts = _SENTENCE_SPLIT.split(text)
    result: List[str] = []
    for part in parts:
        s = part.strip()
        if len(s) <= 20:
            continue
        # Skip fragments that are continuations (don't start with capital
        # and don't contain any decision triggers).
        if not s[0].isupper() and not _DECISION_TRIGGERS.search(s):
            continue
        result.append(s)
    return result


def _looks_like_decision(sentence: str) -> bool:
    """Fast heuristic: does this sentence contain a decision trigger word?"""
    return bool(_DECISION_TRIGGERS.search(sentence))


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def _pg_conn():
    """Return a pg8000 connection to the brain DB."""
    import pg8000

    return pg8000.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        timeout=5,
    )


def _slugify(text: str, max_len: int = 80) -> str:
    """Make a machine-friendly slug from a piece of text."""
    # Take the first meaningful chunk
    chunk = text.strip()
    # Replace non-alphanumerics with hyphens
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", chunk.lower())
    slug = re.sub(r"^-|-$", "", slug)
    return slug[:max_len] if slug else "decision-" + datetime.now().strftime("%Y%m%d%H%M%S")


def _hash_decision(topic: str, decision_text: str, date: str) -> str:
    """Deterministic hash for dedup."""
    payload = f"{topic}|{decision_text}|{date}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def extract_decisions(response_text: str) -> List[Dict[str, Any]]:
    """
    Scan the agent's response for sentences that look like decisions.
    Returns a list of candidate decision dicts.
    """
    # Scan the tail first (most likely to contain conclusions)
    text = response_text
    if len(text) > SCAN_TAIL_CHARS:
        # Take the last N chars but also a bit of the middle if the
        # response is very long, so we don't miss mid-response decisions.
        head = text[:2000]
        tail = text[-SCAN_TAIL_CHARS:]
        text = head + "\n[...]\n" + tail

    candidates: List[Dict[str, Any]] = []
    seen_slugs: set = set()

    for sentence in _sentences(text):
        if not _looks_like_decision(sentence):
            continue

        # Heuristic topic extraction: take content before the trigger word
        # as the topic area.
        topic = _infer_topic(sentence)
        slug = _slugify(topic + "-" + sentence[:40])

        # Dedup within a single response
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        confidence = _confidence(sentence)

        if confidence < CONFIDENCE_THRESHOLD:
            continue

        candidates.append(
            {
                "slug": slug,
                "topic": topic,
                "title": sentence[:120],
                "decision_text": sentence.strip(),
                "rationale": "",  # Could be extended to capture preceding context
                "status": "active",
                "metadata": {
                    "detected_at": datetime.now(timezone.utc).isoformat(),
                    "confidence": round(confidence, 2),
                    "source": "agent:end hook",
                },
            }
        )

    return candidates


def _infer_topic(sentence: str) -> str:
    """
    Very simple topic inference from sentence content.
    Looks for common domain words; falls back to 'general'.
    """
    lower = sentence.lower()
    topics = {
        "gpu": "gpu-allocation",
        "cuda": "gpu-allocation",
        "v100": "gpu-allocation",
        "a100": "gpu-allocation",
        "h100": "gpu-allocation",
        "llamacpp": "gpu-allocation",
        "llama.cpp": "gpu-allocation",
        "model": "model-selection",
        "research": "research-lanes",
        "cron": "cron-jobs",
        "database": "database",
        "postgres": "database",
        "pgvector": "database",
        "pg": "database",
        "embedding": "database",
        "brain": "brain-db",
        "memory": "memory-system",
        "honcho": "honcho",
        "skills": "skills",
        "plugin": "plugins",
        "config": "configuration",
        "deployment": "deployment",
        "docker": "docker",
        "container": "docker",
        "network": "networking",
        "security": "security",
        "api": "api",
        "web": "web",
        "browser": "browser",
        "backup": "backup",
        "back up": "backup",
        "sync": "sync",
    }
    for keyword, topic in topics.items():
        if keyword in lower:
            return topic
    return "general"


def _confidence(sentence: str) -> float:
    """
    Rough confidence score for how decision-like a sentence is.
    1.0 = very likely a decision, 0.0 = not a decision.

    Any sentence with a clear decision trigger word starts at 0.50.
    Additional signals push it higher.  The default threshold (0.65)
    means: one strong trigger + one more signal, or a very strong
    combination, qualifies.
    """
    score = 0.0
    s = sentence.lower()

    # Decision words — strong indicators (a sentence with any of these is
    # very likely a decision or deliberate choice)
    strong = [
        "decided", "decision is", "settled on", "going with",
        "opted for", "opting for", "opting to", "chosen", "chosen to",
        "conclusion is", "recommendation", "plan is", "as decided",
        # Deliberate actions that are inherently decisions
        "adopting", "adopted", "adopt",
        "dropping", "dropped", "drop",
        "ruling out", "ruled out", "rejecting", "rejected",
        "switching to", "switch to", "switched to",
        "migrating to", "migrate to", "migrated to",
        "replacing", "replaced by", "replaced",
        "no longer using", "disabled", "enabled",
        "pausing", "paused", "resume", "resumed", "restarting",
        "deprecated", "deprecating", "deprecate",
        "will use", "we will", "going to use",
    ]
    # Medium signals — contribute but aren't decisive on their own
    medium = [
        "final", "finalizing", "finalized",
        "agreement", "agreed",
        "direction is", "strategy is",
        "pick", "picking", "choose", "choosing",
        "trial of", "experiment with",
        "going to", "will be",
    ]

    found_strong = False
    for word in strong:
        if word in s:
            score += 0.25
            found_strong = True

    for word in medium:
        if word in s:
            score += 0.10

    # Floor: if we found at least one strong signal, you're in the game
    if found_strong:
        score = max(score, 0.50)

    # Bonus: reasonable sentence length (not too short, not rambling)
    words = len(s.split())
    if 3 <= words <= 50:
        score += 0.10

    # Bonus: multiple strong signals
    strong_count = sum(1 for w in strong if w in s)
    if strong_count >= 2:
        score += 0.10

    return min(score, 1.0)


# ---------------------------------------------------------------------------
# DB write
# ---------------------------------------------------------------------------

def write_decisions(decisions: List[Dict[str, Any]], profile_name: str = "unknown") -> List[int]:
    """
    Write detected decisions to the brain DB decisions table.
    Returns list of inserted IDs.  Skips duplicates silently.
    """
    if not decisions:
        return []

    inserted: List[int] = []
    now = datetime.now(timezone.utc).isoformat()

    try:
        conn = _pg_conn()
        cur = conn.cursor()

        for d in decisions:
            dedup_hash = _hash_decision(d["topic"], d["decision_text"], now[:10])
            metadata = json.dumps({**d.get("metadata", {}), "dedup_hash": dedup_hash})

            # Check for duplicate within the same day
            cur.execute(
                """SELECT id FROM decisions
                   WHERE metadata::text LIKE %s
                   AND created_at >= NOW() - INTERVAL '1 day'
                   LIMIT 1""",
                (f'%{dedup_hash}%',),
            )
            existing = cur.fetchone()
            if existing:
                logger.debug("Skipping duplicate decision: %s", d["slug"])
                continue

            # Check if there's an existing active decision on the same topic
            cur.execute(
                """SELECT id FROM decisions
                   WHERE topic = %s AND status = 'active'
                   ORDER BY created_at DESC LIMIT 1""",
                (d["topic"],),
            )
            existing_active = cur.fetchone()

            supersedes_id: Optional[int] = None
            if existing_active is not None:
                # Mark the old one as superseded
                cur.execute(
                    "UPDATE decisions SET status = 'superseded' WHERE id = %s",
                    (existing_active[0],),
                )
                supersedes_id = existing_active[0]

            cur.execute(
                """INSERT INTO decisions
                   (slug, topic, title, decision_text, rationale, status,
                    supersedes_id, created_by, source_session, metadata)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id""",
                (
                    d["slug"],
                    d["topic"],
                    d["title"],
                    d["decision_text"],
                    d.get("rationale", ""),
                    d.get("status", "active"),
                    supersedes_id,
                    profile_name,
                    "",  # source_session — filled in by the agent if available
                    metadata,
                ),
            )
            new_id = cur.fetchone()[0]
            inserted.append(new_id)

            # Now set superseded_by on the old row
            if supersedes_id:
                cur.execute(
                    "UPDATE decisions SET superseded_by = %s WHERE id = %s",
                    (new_id, supersedes_id),
                )

        conn.commit()
        cur.close()
        conn.close()
        logger.info("Wrote %d decision(s) to brain DB", len(inserted))

    except Exception as exc:
        logger.error("decision_logger DB write failed: %s", exc)

    return inserted


# ---------------------------------------------------------------------------
# Optional wiki page output
# ---------------------------------------------------------------------------

def write_wiki_page(decision: Dict[str, Any], dest_dir: str) -> None:
    """Write a human-readable markdown page for a decision (optional)."""
    if not dest_dir:
        return
    os.makedirs(dest_dir, exist_ok=True)

    safe_slug = re.sub(r"[^\w-]", "-", decision["slug"])[:60]
    path = os.path.join(dest_dir, f"{safe_slug}.md")

    content = textwrap.dedent(f"""\
        ---
        okf_version: "0.2"
        id: {decision['slug']}
        title: "{decision['title']}"
        type: decision
        status: {decision['status']}
        topic: {decision['topic']}
        created_by: "decision_logger plugin"
        created_at: "{decision['metadata'].get('detected_at', '')}"
        source: "agent:end hook"
        ---

        # {decision['title']}

        **Topic:** {decision['topic']}

        **Decision:**

        {decision['decision_text']}

        **Rationale:**

        {decision.get('rationale', '(not captured)')}

        ---

        *Auto-captured by decision_logger Hermes plugin.*
        """)

    with open(path, "w") as f:
        f.write(content)
    logger.info("Wrote wiki page: %s", path)


# ---------------------------------------------------------------------------
# Plugin registration
# ---------------------------------------------------------------------------

def register(ctx: Any) -> None:
    """
    Called by Hermes when the plugin is loaded.
    Registers the agent:end hook.
    """

    def handle_agent_end(event: Dict[str, Any]) -> None:
        response = event.get("response", "")
        if not response or not isinstance(response, str):
            return

        profile = event.get("profile", "unknown")
        if isinstance(profile, dict):
            profile = profile.get("name", "unknown")

        decisions = extract_decisions(response)
        if not decisions:
            return

        logger.info(
            "decision_logger: detected %d candidate(s) in agent:end",
            len(decisions),
        )

        ids = write_decisions(decisions, profile_name=profile)

        # Optional wiki pages
        if WIKI_OUTPUT_DIR and ids:
            for d in decisions:
                write_wiki_page(d, WIKI_OUTPUT_DIR)

    ctx.register_hook("agent:end", handle_agent_end)
