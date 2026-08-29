#!/usr/bin/env python3
"""
Demo database bootstrap for the Autognosia Command Deck.

When no organizer.db exists (fresh clone / first `docker compose up`), this
module creates a fully-populated demo database so the dashboard is usable
with zero manual setup. All sample content is generic — no personal data.
"""

import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path


def _utc(*, hours: float = 0, days: float = 0) -> str:
    """ISO-8601 UTC timestamp offset from now (keeps demo data looking fresh)."""
    dt = datetime.now(timezone.utc) + timedelta(hours=hours, days=days)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


ORGANIZER_SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    due_at TEXT,
    project_id INTEGER REFERENCES projects(id),
    created_at TEXT,
    updated_at TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS intentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    cue TEXT,
    action TEXT,
    status TEXT DEFAULT 'dormant',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    remind_at TEXT,
    channel TEXT DEFAULT 'all',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    sent_at TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS important_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    amount REAL,
    currency TEXT DEFAULT 'USD',
    next_billing_date TEXT,
    billing_cycle TEXT,
    status TEXT DEFAULT 'active'
);
"""


def _demo_projects() -> list:
    return [
        ("Homelab Migration", "Consolidate media and monitoring stack onto the new NAS.", "active"),
        ("Research Pipeline", "Keep ingestion, graphify and wiki sync running smoothly.", "active"),
        ("Garden Revamp", "Raised beds, drip irrigation and a tool shed.", "archived"),
    ]


def _demo_tasks(now: str) -> list:
    """(title, description, status, priority, due_at, project_index_or_None)."""
    return [
        ("Back up NAS before migration", "Full snapshot of media pool to cold storage.", "active", "critical", _utc(hours=6), 0),
        ("Rotate reverse-proxy TLS certs", "Certs expire soon; renew and reload Traefik.", "active", "high", _utc(days=1), 0),
        ("Tune graphify ingestion batch size", "Reduce memory spikes during nightly runs.", "active", "medium", _utc(days=2), 1),
        ("Write wiki page: backup strategy", "Document the 3-2-1 scheme for the team.", "blocked", "high", _utc(days=4), 1),
        ("Draft Q3 research reading list", "Shortlist papers on memory consolidation.", "active", "medium", _utc(days=7), 1),
        ("Order drip irrigation fittings", "Wait for price drop before ordering.", "active", "low", _utc(days=14), 2),
        ("Archive completed garden tasks", "Close out the revamp project cleanly.", "completed", "low", None, 2),
        ("Review monthly budget report", "Compare actuals against plan.", "completed", "medium", _utc(hours=-24), None),
    ]


def _demo_intentions() -> list:
    """(title, cue, action, status)."""
    return [
        ("IF disk usage high THEN alert", "NAS pool usage exceeds 85%", "Send a reminder to start cleanup and check backups", "active"),
        ("IF discussing GPUs THEN note bandwidth", "Conversation mentions GPU memory or PCIe lanes", "Surface the memory-bandwidth comparison notes from the vault", "dormant"),
        ("IF backup job fails THEN investigate", "Nightly backup job exits non-zero", "Open an incident task and check the NAS logs", "active"),
    ]


def _demo_reminders() -> list:
    """(title, remind_at, channel, notes, status)."""
    return [
        ("Review pending research papers", _utc(hours=1), "all", "Two papers are waiting in the reading queue.", "pending"),
        ("Water the raised beds", _utc(days=1, hours=-30), "desktop", "", "snoozed"),
    ]


def _demo_important_dates() -> list:
    """(title, date, description)."""
    return [
        ("Homelab cutover weekend", (datetime.now(timezone.utc) + timedelta(days=10)).strftime("%Y-%m-%d"), "Switch primary services to the new NAS."),
        ("Annual review checkpoint", (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d"), "Mid-year goals and budget review."),
    ]


def _demo_subscriptions() -> list:
    """(name, amount, currency, next_billing_date, billing_cycle)."""
    return [
        ("Cloud storage plan", 9.99, "USD", (datetime.now(timezone.utc) + timedelta(days=5)).strftime("%Y-%m-%d"), "monthly"),
        ("Domain renewal", 14.00, "USD", (datetime.now(timezone.utc) + timedelta(days=21)).strftime("%Y-%m-%d"), "yearly"),
    ]


def initialize_organizer_db(db_path: Path) -> None:
    """Create a fresh organizer database populated with demo data."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(ORGANIZER_SCHEMA)

        now = _utc()
        for name, description, status in _demo_projects():
            conn.execute(
                "INSERT INTO projects (name, description, status, created_at) VALUES (?, ?, ?, ?)",
                (name, description, status, now),
            )

        for title, description, status, priority, due_at, project_idx in _demo_tasks(now):
            project_id = None
            if project_idx is not None:
                row = conn.execute("SELECT id FROM projects WHERE name = ?", (_demo_projects()[project_idx][0],)).fetchone()
                project_id = row[0] if row else None
            completed_at = now if status == "completed" else None
            conn.execute(
                """INSERT INTO tasks (title, description, status, priority, due_at, project_id, created_at, updated_at, completed_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (title, description, status, priority, due_at, project_id, now, now, completed_at),
            )

        for title, cue, action, status in _demo_intentions():
            conn.execute(
                "INSERT INTO intentions (title, cue, action, status, created_at) VALUES (?, ?, ?, ?, ?)",
                (title, cue, action, status, now),
            )

        for title, remind_at, channel, notes, status in _demo_reminders():
            conn.execute(
                "INSERT INTO reminders (title, remind_at, channel, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (title, remind_at, channel, notes, status, now),
            )

        for title, date_str, description in _demo_important_dates():
            conn.execute(
                "INSERT INTO important_dates (title, date, description) VALUES (?, ?, ?)",
                (title, date_str, description),
            )

        for name, amount, currency, next_date, cycle in _demo_subscriptions():
            conn.execute(
                """INSERT INTO subscriptions (name, amount, currency, next_billing_date, billing_cycle, status)
                   VALUES (?, ?, ?, ?, ?, 'active')""",
                (name, amount, currency, next_date, cycle),
            )

        conn.commit()
    finally:
        conn.close()


AUTOGNOSIA_SCHEMA = """
CREATE TABLE IF NOT EXISTS operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    status TEXT DEFAULT 'ok',
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS verification_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id INTEGER REFERENCES operations(id),
    result TEXT DEFAULT 'pass',
    timestamp TEXT
);
"""


def initialize_autognosia_db(db_path: Path) -> None:
    """Create a minimal autognosia database so overview metrics work."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(AUTOGNOSIA_SCHEMA)
        now = _utc()
        ops = [
            ("wiki_sync", "ok"),
            ("graphify_ingest", "ok"),
            ("backup_snapshot", "ok"),
        ]
        for name, status in ops:
            cur = conn.execute(
                "INSERT INTO operations (name, status, timestamp) VALUES (?, ?, ?)",
                (name, status, now),
            )
            conn.execute(
                "INSERT INTO verification_checks (operation_id, result, timestamp) VALUES (?, 'pass', ?)",
                (cur.lastrowid, now),
            )
        conn.commit()
    finally:
        conn.close()
