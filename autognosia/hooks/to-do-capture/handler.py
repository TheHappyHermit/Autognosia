"""
to-do-capture — Hermes Agent gateway hook

Detects when a user asks the agent to add something to their to-do list
or organizer, and writes it to organizer.db. Runs on the agent:end event.

Design goals:
  - Zero configuration at run time
  - Never blocks the agent loop on DB write failure
  - Dedup: same title on the same day is skipped
  - Only fires for chat platforms (not cron/internal)
  - Fail-open: errors are logged, never crash the gateway
"""

from __future__ import annotations

import hashlib
import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ORGANIZER_DB_PATH = os.environ.get(
    "ORGANIZER_DB_PATH",
    str(Path.home() / ".autognosia" / "personal-organizer" / "data" / "organizer.db"),
)

# Phrases in the user's message that should trigger capture
_USER_TRIGGERS = re.compile(
    r"\b(add|put|drop|stick|file|note)\s+"
    r"(that|this|it|the\s+\w+)\s+"
    r"(to|on)\s+"
    r"(my\s+)?"
    r"(to-do|todo|todo\s+list|organizer|organizer\.db|task\s+list)"
    r"\b",
    re.IGNORECASE,
)

# Also match: "add X to my to-do list" where X is explicit
_USER_TRIGGERS_EXPLICIT = re.compile(
    r"\b(add|put|drop|stick|file|note)\s+"
    r"(?:that|this|it|the\s+\w+|\w+(?:\s+\w+){0,4})"
    r"\s+(to|on)\s+"
    r"(my\s+)?"
    r"(to-do|todo|todo\s+list|organizer|organizer\.db|task\s+list)"
    r"\b",
    re.IGNORECASE,
)

# Agent response phrases that confirm a to-do was acknowledged
_AGENT_ACK = re.compile(
    r"\b(I['’]ll\s+(?:add|put|drop|file|note)|"
    r"Added|Adding|"
    r"I['’]ve\s+noted|Noted|"
    r"I['’]ll\s+make\s+sure\s+(?:it|that|this)\s+goes\s+to)"
    r"\b",
    re.IGNORECASE,
)

# Chat platforms — skip cron/internal events
_CHAT_PLATFORMS = {"telegram", "discord", "slack", "whatsapp", "matrix"}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _slugify(text: str, max_len: int = 100) -> str:
    chunk = text.strip()
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", chunk.lower())
    slug = re.sub(r"^-|-$", "", slug)
    return slug[:max_len] if slug else "todo-" + datetime.now().strftime("%Y%m%d%H%M%S")


def _hash_entry(title: str, date: str) -> str:
    payload = f"{title}|{date}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def _extract_substance(user_message: str, agent_response: str) -> Optional[str]:
    """
    Try to extract what the to-do item is actually about.

    Strategy:
    1. Look in the agent's response first — if it restates the task,
       that's our best extractable title.
    2. Fall back to the user's message — extract the phrase between
       the trigger verb and "to/put my to-do list".
    3. Return None if nothing extractable.
    """
    # Try agent response first — look for "I'll add X" or "Added X" patterns
    ack_match = _AGENT_ACK.search(agent_response)
    if ack_match:
        # Grab a window after the acknowledgment
        start = ack_match.end()
        window = agent_response[start : start + 200]
        # Pull out the first sentence or clause
        sentences = re.split(r"[.!?\n]", window)
        for s in sentences:
            s = s.strip()
            if len(s) > 10 and len(s) < 150:
                return s
        # If no clean sentence, use the window as-is
        if window.strip():
            return window.strip()[:150]

    # Fall back to user message — extract what's between trigger and "to-do"
    explicit = _USER_TRIGGERS_EXPLICIT.search(user_message)
    if explicit:
        # Extract the noun phrase between the verb and "to/put"
        verb_end = explicit.start(1)  # end of first capture group (verb)
        to_pos = explicit.start(4) if explicit.lastindex and explicit.lastindex >= 4 else explicit.end()
        middle = user_message[explicit.end(1) : explicit.start(4) if explicit.lastindex and explicit.lastindex >= 4 else explicit.end()]
        middle = middle.strip()
        if middle and len(middle) < 150:
            return middle

    # Last resort: use the whole user message if it's short enough
    if user_message and len(user_message) < 200:
        return user_message.strip()

    return None


def _is_chat_platform(platform: Any) -> bool:
    if not platform:
        return False
    return str(platform).lower() in _CHAT_PLATFORMS


def _extract_context(event: Dict[str, Any]) -> Dict[str, str]:
    """Pull useful context from the event for the DB record."""
    platform = event.get("platform", "unknown") or "unknown"
    user_id = event.get("user_id", "unknown") or "unknown"
    session_id = event.get("session_id", "unknown") or "unknown"
    message = (event.get("message") or "")[:500]  # truncated by gateway
    response = (event.get("response") or "")[:500]  # truncated by gateway
    return {
        "platform": str(platform),
        "user_id": str(user_id),
        "session_id": str(session_id),
        "user_message": str(message),
        "agent_response": str(response),
    }


# ---------------------------------------------------------------------------
# Organizer DB
# ---------------------------------------------------------------------------

def _ensure_db(db_path: str) -> bool:
    """Make sure the DB and tasks table exist."""
    try:
        parent = Path(db_path).parent
        parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute(
            """CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'next',
                priority TEXT NOT NULL DEFAULT 'medium',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                source TEXT,
                source_session TEXT,
                source_user TEXT,
                metadata TEXT
            )"""
        )
        conn.commit()
        conn.close()
        return True
    except Exception as exc:
        print(f"[to-do-capture] DB init failed: {exc}")
        return False


def _write_task(
    title: str,
    description: str,
    context: Dict[str, str],
    db_path: str,
) -> Optional[int]:
    """Insert a task into organizer.db. Returns the new ID or None on failure."""
    today = _today()
    dedup_hash = _hash_entry(title, today)
    now = _now_iso()

    metadata = json_dumps_safe(
        {
            "dedup_hash": dedup_hash,
            "detected_at": now,
            "source": "to-do-capture hook",
            "platform": context["platform"],
            "user_id": context["user_id"],
        }
    )

    try:
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys=ON")

        # Dedup check — same title today
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM tasks WHERE title = ? AND created_at >= ? LIMIT 1",
            (title, today),
        )
        if cur.fetchone():
            conn.close()
            return None  # duplicate

        # Check for existing 'next' task on similar topic — mark superseded
        slug_base = _slugify(title)
        cur.execute(
            """SELECT id FROM tasks
               WHERE title LIKE ? AND status = 'next'
               ORDER BY created_at DESC LIMIT 1""",
            (f"%{slug_base[:30]}%",),
        )
        existing = cur.fetchone()
        supersedes_id: Optional[int] = None
        if existing:
            supersedes_id = existing[0]
            cur.execute(
                "UPDATE tasks SET status = 'superseded' WHERE id = ?",
                (supersedes_id,),
            )

        conn.execute(
            """INSERT INTO tasks
               (title, description, status, priority, created_at, updated_at,
                source, source_session, source_user, metadata)
               VALUES (?, ?, 'next', 'medium', ?, ?, ?, ?, ?, ?)""",
            (
                title,
                description,
                now,
                now,
                "to-do-capture hook",
                context["session_id"],
                context["user_id"],
                metadata,
            ),
        )
        new_id = cur.lastrowid

        if supersedes_id:
            cur.execute(
                "UPDATE tasks SET superseded_by = ? WHERE id = ?",
                (new_id, supersedes_id),
            )

        conn.commit()
        conn.close()
        return new_id

    except Exception as exc:
        print(f"[to-do-capture] DB write failed: {exc}")
        return None


def json_dumps_safe(obj: Any) -> str:
    """JSON dumps that never crashes."""
    try:
        import json
        return json.dumps(obj)
    except Exception:
        return "{}"


# ---------------------------------------------------------------------------
# Hook handler
# ---------------------------------------------------------------------------

def handle(event_type: str, context: Dict[str, Any]) -> None:
    """
    Called by the gateway for each agent:end event.
    Detects to-do requests and writes them to organizer.db.
    """
    # Only fire for chat platforms
    platform = context.get("platform")
    if not _is_chat_platform(platform):
        return

    user_message = context.get("message", "") or ""
    agent_response = context.get("response", "") or ""

    if not user_message:
        return

    # Check if user triggered a to-do request
    if not (_USER_TRIGGERS.search(user_message) or _USER_TRIGGERS_EXPLICIT.search(user_message)):
        return

    # Extract the substance of what to-do item should be
    substance = _extract_substance(user_message, agent_response)

    if substance:
        title = substance if len(substance) <= 100 else substance[:97] + "..."
        description = (
            f"Captured from {context.get('platform', 'chat')} session. "
            f"User said: \"{user_message[:300]}\"\n\n"
            f"Agent responded: \"{agent_response[:300]}\""
        )
    else:
        title = "To-do item from chat — review needed"
        description = (
            f"User requested a to-do item be added during {context.get('platform', 'chat')} session. "
            f"Original message: \"{user_message[:300]}\"\n"
            f"Agent response: \"{agent_response[:300]}\"\n\n"
            f"Substance could not be auto-extracted — review the session to fill in details."
        )

    context_info = _extract_context(context)

    # Ensure DB exists
    if not _ensure_db(ORGANIZER_DB_PATH):
        print(
            f"[to-do-capture] WARNING: could not init organizer DB at {ORGANIZER_DB_PATH}"
        )
        return

    task_id = _write_task(title, description, context_info, ORGANIZER_DB_PATH)

    if task_id:
        print(
            f"[to-do-capture] Wrote task #{task_id} to organizer.db: {title[:60]}"
        )
    else:
        print(
            f"[to-do-capture] Skipped duplicate or failed: {title[:60]}"
        )
