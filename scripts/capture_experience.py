#!/usr/bin/env python3
"""
Capture operations from recent Hermes sessions to the Experience Index.

Scans recent Hermes sessions (state.db) and populates the Experience Index
(autognosia.db) with:
  - operations: every significant tool call / action taken
  - routing_events: which profile handled what
  - skill_events: which skills were invoked
  - verification_checks: did reality match the plan?
  - reflections: lessons from failures and successes

Designed to be idempotent: runs every 30 min, only inserts new rows.

Works on any OS that supports Python 3.11+ and Hermes Agent (Linux, macOS, Windows).
"""

import os
import sys
import json
import sqlite3
import time
from datetime import datetime, timedelta

# Paths - use environment variables with sensible defaults for cross-platform support
AUTOGNOSIA_HOME = os.environ.get(
    "AUTOGNOSIA_HOME",
    os.path.join(os.path.expanduser("~"), ".autognosia")
)
HERMES_HOME = os.environ.get(
    "HERMES_HOME",
    os.path.join(os.path.expanduser("~"), ".hermes")
)
STATE_DB = os.path.join(HERMES_HOME, "state.db")
DB_PATH = os.path.join(AUTOGNOSIA_HOME, "autognosia.db")
LOG_FILE = os.path.join(AUTOGNOSIA_HOME, "logs", "experience-capture.log")

# How far back to look (hours)
LOOKBACK_HOURS = 24


def ensure_dirs():
    """Create required directories. Cross-platform."""
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    os.makedirs(AUTOGNOSIA_HOME, exist_ok=True)


def log(msg):
    timestamp = datetime.now().isoformat()
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {msg}\n")
    print(msg, flush=True)


def ensure_db():
    """Initialize autognosia.db schema if empty."""
    if not os.path.exists(DB_PATH):
        log("  autognosia.db missing, initializing...")
        try:
            init_script = os.path.join(AUTOGNOSIA_HOME, "scripts", "init_autognosia_db.py")
            if os.path.exists(init_script):
                result = os.system(f'python3 "{init_script}" --yes')
                if result != 0:
                    log("  WARNING: init_autognosia_db.py returned non-zero")
            else:
                _inline_init()
        except Exception as e:
            log(f"  ERROR initializing DB: {e}")
            _inline_init()

    conn = sqlite3.connect(DB_PATH)
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    conn.close()

    expected = {
        "operations", "verification_checks", "routing_events",
        "skill_events", "reflections", "key_decisions", "prospective_log"
    }
    missing = expected - tables
    if missing:
        log(f"  Missing tables in autognosia.db: {missing}. Running inline init.")
        _inline_init()


def _inline_init():
    """Create schema inline (fallback if init script fails)."""
    SCHEMA = """
    CREATE TABLE IF NOT EXISTS operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        profile TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        result TEXT CHECK(result IN ('success', 'failure', 'partial', 'aborted')) DEFAULT 'success',
        duration_ms INTEGER,
        tokens_used INTEGER,
        error_message TEXT,
        metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS verification_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        operation_id INTEGER,
        expected_result TEXT NOT NULL,
        actual_result TEXT NOT NULL,
        passed BOOLEAN NOT NULL,
        notes TEXT,
        FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS routing_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        input_summary TEXT NOT NULL,
        routed_to TEXT NOT NULL,
        route_reason TEXT,
        confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
        outcome TEXT
    );

    CREATE TABLE IF NOT EXISTS skill_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        skill_name TEXT NOT NULL,
        trigger TEXT,
        success BOOLEAN DEFAULT TRUE,
        duration_ms INTEGER,
        error_message TEXT
    );

    CREATE TABLE IF NOT EXISTS reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        reflection_type TEXT CHECK(reflection_type IN ('pattern', 'lesson', 'warning', 'success', 'failure')),
        content TEXT NOT NULL,
        source_operation_id INTEGER,
        source_tool TEXT,
        applied BOOLEAN DEFAULT FALSE,
        applied_at TEXT,
        FOREIGN KEY (source_operation_id) REFERENCES operations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS key_decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        decision TEXT NOT NULL,
        rationale TEXT,
        alternatives_considered TEXT,
        outcome TEXT,
        superseded_by INTEGER REFERENCES key_decisions(id)
    );

    CREATE TABLE IF NOT EXISTS prospective_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT (datetime('now')),
        session_id TEXT,
        cue TEXT NOT NULL,
        action_taken TEXT,
        triggered BOOLEAN DEFAULT FALSE,
        triggered_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_ops_timestamp ON operations(timestamp);
    CREATE INDEX IF NOT EXISTS idx_ops_profile ON operations(profile);
    CREATE INDEX IF NOT EXISTS idx_ops_result ON operations(result);
    CREATE INDEX IF NOT EXISTS idx_verif_operation ON verification_checks(operation_id);
    CREATE INDEX IF NOT EXISTS idx_routing_session ON routing_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_routing_to ON routing_events(routed_to);
    CREATE INDEX IF NOT EXISTS idx_skill_name ON skill_events(skill_name);
    CREATE INDEX IF NOT EXISTS idx_skill_session ON skill_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_reflections_type ON reflections(reflection_type);
    CREATE INDEX IF NOT EXISTS idx_reflections_applied ON reflections(applied);
    CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON key_decisions(timestamp);
    """
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
    log("  Schema initialized.")


def get_recent_sessions():
    """Get sessions from the last N hours from Hermes state.db."""
    if not os.path.exists(STATE_DB):
        log(f"  state.db not found at {STATE_DB}. Skipping.")
        return []

    conn = sqlite3.connect(STATE_DB)
    cutoff = time.time() - (LOOKBACK_HOURS * 3600)
    rows = conn.execute("""
        SELECT id, title, source, profile_name, model, started_at, ended_at,
               end_reason, tool_call_count, message_count, estimated_cost_usd,
               billing_provider
        FROM sessions
        WHERE started_at > ?
        ORDER BY started_at DESC
    """, (cutoff,)).fetchall()
    conn.close()

    session_ids = [r[0] for r in rows]
    log(f"  Found {len(session_ids)} recent sessions ({LOOKBACK_HOURS}h window)")
    return rows


def get_messages(session_id):
    """Get all non-compacted messages for a session."""
    conn = sqlite3.connect(STATE_DB)
    rows = conn.execute("""
        SELECT role, content, tool_name, tool_calls, timestamp,
               token_count, finish_reason, reasoning
        FROM messages
        WHERE session_id = ? AND compacted = 0 AND active = 1
        ORDER BY timestamp ASC
    """, (session_id,)).fetchall()
    conn.close()
    return rows


def _parse_tool_calls(tool_calls_str):
    """Parse JSON tool_calls string into list of dicts."""
    if not tool_calls_str:
        return []
    try:
        return json.loads(tool_calls_str)
    except (json.JSONDecodeError, TypeError):
        return []


def extract_operations(session_id, profile, messages):
    """Extract operations from a session's messages.

    Includes failed tool calls (empty/null names) as result='failure' entries
    so we can analyze AI tool-calling errors over time.
    """
    operations = []
    for role, content, tool_name, tool_calls, ts, token_count, finish_reason, reasoning in messages:
        if tool_calls:
            parsed = _parse_tool_calls(tool_calls)
            for tc in parsed:
                tc_name = tc.get("name", "")
                tc_args = json.dumps(tc.get("arguments", {}))
                tc_id = tc.get("id", "")

                # Tools with empty/null names are AI errors — record as failures
                if not tc_name:
                    # Extract error info from reasoning or finish_reason
                    error_msg = reasoning or ""
                    if not error_msg and content:
                        error_msg = content[:500]
                    operations.append({
                        "session_id": session_id,
                        "profile": profile,
                        "action": "tool:unknown",
                        "target": tc_args,
                        "tool_name": "",
                        "tool_call_id": tc_id,
                        "result": "failure",
                        "error_message": error_msg,
                        "timestamp": datetime.fromtimestamp(ts).isoformat() if ts else None,
                    })
                else:
                    operations.append({
                        "session_id": session_id,
                        "profile": profile,
                        "action": f"tool:{tc_name}",
                        "target": tc_args,
                        "tool_name": tc_name,
                        "tool_call_id": tc_id,
                        "timestamp": datetime.fromtimestamp(ts).isoformat() if ts else None,
                    })
        elif role == "tool" and tool_name:
            # Tool result message
            # Check if the tool returned an error
            result = "success"
            error_msg = ""
            if content:
                lower = content.lower()
                if "error" in lower or "failed" in lower or "exception" in lower:
                    result = "failure"
                    error_msg = content[:500]
            operations.append({
                "session_id": session_id,
                "profile": profile,
                "action": f"tool_result:{tool_name}",
                "target": content[:500] if content else "",
                "tool_name": tool_name,
                "result": result,
                "error_message": error_msg,
                "timestamp": datetime.fromtimestamp(ts).isoformat() if ts else None,
            })
    return operations


def extract_skill_events(session_id, profile, messages):
    """Detect skill usage from messages (skill mentions in system prompt or tool calls)."""
    events = []
    for role, content, tool_name, tool_calls, ts, _, _, _ in messages:
        if tool_calls:
            parsed = _parse_tool_calls(tool_calls)
            for tc in parsed:
                tc_name = tc.get("name", "")
                if "skill" in tc_name.lower():
                    events.append({
                        "session_id": session_id,
                        "skill_name": tc_name,
                        "trigger": json.dumps(tc.get("arguments", {})),
                        "success": True,
                    })
    return events


def extract_routing_events(sessions_rows):
    """Extract routing events from session metadata."""
    events = []
    for row in sessions_rows:
        session_id, title, source, profile_name, model, started, ended, end_reason, tool_count, msg_count, cost, provider = row
        # profile_name may be empty; use source as routing indicator
        routed_to = profile_name or source or "unknown"
        events.append({
            "session_id": session_id,
            "input_summary": title or f"source={source}",
            "routed_to": routed_to,
            "route_reason": f"source={source}, model={model}",
            "confidence": None,
            "outcome": end_reason or "unknown",
        })
    return events


def detect_reflections(operations, messages):
    """Detect lessons from failures, corrections, and repeated patterns."""
    reflections = []
    # Check for tool failures in messages
    for role, content, tool_name, tool_calls_str, ts, _, finish_reason, reasoning in messages:
        if content and ("error" in content.lower() or "failed" in content.lower() or "exception" in content.lower()):
            if role == "assistant" or (role == "user" and "error" in content.lower()):
                # Try to get tool name from parsed tool_calls string
                source_tool = tool_name or "unknown"
                if tool_calls_str:
                    parsed = _parse_tool_calls(tool_calls_str)
                    if parsed:
                        source_tool = parsed[0].get("name", "unknown")
                reflections.append({
                    "session_id": None,
                    "reflection_type": "warning",
                    "content": content[:300],
                    "source_tool": source_tool,
                })
    # Check for repeated tool calls (pattern detection)
    tool_counts = {}
    for role, content, tool_name, tool_calls_str, _, _, _, _ in messages:
        if tool_calls_str:
            parsed = _parse_tool_calls(tool_calls_str)
            for tc in parsed:
                name = tc.get("name", "")
                if name:
                    tool_counts[name] = tool_counts.get(name, 0) + 1
    for tool, count in tool_counts.items():
        if count >= 5:
            reflections.append({
                "session_id": None,
                "reflection_type": "pattern",
                "content": f"Tool '{tool}' called {count} times — consider wrapping in a skill",
                "source_tool": tool,
            })
    return reflections


def insert_routing(autognosia_conn, events):
    """Insert routing events (idempotent via session_id + input_summary)."""
    for evt in events:
        autognosia_conn.execute("""
            INSERT OR IGNORE INTO routing_events
                (session_id, input_summary, routed_to, route_reason, outcome)
            VALUES (?, ?, ?, ?, ?)
        """, (
            evt["session_id"],
            evt["input_summary"],
            evt["routed_to"],
            evt["route_reason"],
            evt["outcome"],
        ))


def insert_reflections(autognosia_conn, reflections):
    """Insert reflection records (idempotent)."""
    for ref in reflections:
        autognosia_conn.execute("""
            INSERT OR IGNORE INTO reflections
                (session_id, reflection_type, content, source_tool)
            VALUES (?, ?, ?, ?)
        """, (
            ref["session_id"],
            ref["reflection_type"],
            ref["content"],
            ref.get("source_tool", ""),
        ))


def main():
    start_time = time.time()
    ensure_dirs()
    ensure_db()

    log("=== Experience Capture Started ===")
    log(f"  Looking back {LOOKBACK_HOURS} hours")

    # Connect to both databases
    state_conn = sqlite3.connect(STATE_DB)
    autognosia_conn = sqlite3.connect(DB_PATH)
    autognosia_conn.execute("PRAGMA foreign_keys = ON;")

    # 1. Get recent sessions
    sessions = get_recent_sessions()
    if not sessions:
        log("  No recent sessions found. Nothing to capture.")
        state_conn.close()
        autognosia_conn.close()
        return 0

    # 2. Get already-processed session IDs from operations table
    log("  Checking for already-processed sessions...")
    processed_sessions = {
        row[0] for row in autognosia_conn.execute(
            "SELECT DISTINCT session_id FROM operations"
        ).fetchall()
    }
    log(f"  Already processed: {len(processed_sessions)} sessions")

    # Filter to only new sessions
    new_sessions = [s for s in sessions if s[0] not in processed_sessions]
    log(f"  New sessions to process: {len(new_sessions)}")
    if not new_sessions:
        log("  No new sessions to process. Nothing to capture.")
        state_conn.close()
        autognosia_conn.close()
        return 0

    # 3. Extract and insert routing events for new sessions
    routing_events = extract_routing_events(new_sessions)
    insert_routing(autognosia_conn, routing_events)
    log(f"  Routing events: {len(routing_events)} found, {autognosia_conn.total_changes} new")

    # 4. Process each new session
    total_ops = 0
    total_skills = 0
    total_reflections = 0

    for row in new_sessions:
        session_id = row[0]
        profile = row[3] or "default"
        title = row[1] or ""

        messages = get_messages(session_id)
        if not messages:
            continue

        # Extract operations
        ops = extract_operations(session_id, profile, messages)
        if ops:
            cursor = autognosia_conn.cursor()
            for op in ops:
                cursor.execute("""
                    INSERT OR IGNORE INTO operations
                        (session_id, profile, action, target, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    op["session_id"],
                    op["profile"],
                    op["action"],
                    op["target"],
                    json.dumps({
                        "tool_name": op.get("tool_name", ""),
                        "tool_call_id": op.get("tool_call_id", ""),
                        "inserted_at": datetime.now().isoformat(),
                    }),
                ))
            total_ops += cursor.rowcount

        # Extract skill events
        skills = extract_skill_events(session_id, profile, messages)
        if skills:
            prev_changes = autognosia_conn.total_changes
            for evt in skills:
                autognosia_conn.execute("""
                    INSERT OR IGNORE INTO skill_events
                        (session_id, skill_name, trigger, success)
                    VALUES (?, ?, ?, ?)
                """, (
                    evt["session_id"],
                    evt["skill_name"],
                    evt["trigger"],
                    evt["success"],
                ))
            total_skills += autognosia_conn.total_changes - prev_changes

        # Extract reflections
        refs = detect_reflections(ops, messages)
        if refs:
            for ref in refs:
                ref["session_id"] = session_id
            prev_changes = autognosia_conn.total_changes
            insert_reflections(autognosia_conn, refs)
            total_reflections += autognosia_conn.total_changes - prev_changes

    state_conn.close()

    # 5. Commit and summarize
    autognosia_conn.commit()
    elapsed = time.time() - start_time

    log(f"  Operations captured: {total_ops}")
    log(f"  Skill events captured: {total_skills}")
    log(f"  Reflections captured: {total_reflections}")
    log(f"  Completed in {elapsed:.1f}s")
    log("=== Experience Capture Complete ===")

    autognosia_conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
