#!/usr/bin/env python3
"""
dashboard.backend.config — Shared configuration, paths, and database connections.
"""

import os
import sys
import sqlite3
from pathlib import Path

# Resolve root directories
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DASHBOARD_DIR = REPO_ROOT / "dashboard"
AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
ORGANIZER_DB = Path(os.environ.get("ORGANIZER_DB_PATH", str(AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db")))
AUTOGNOSIA_DB = AUTOGNOSIA_HOME / "autognosia.db"
ACTIVE_WIKI = AUTOGNOSIA_HOME / "active-wiki"
ORACLE_BRAIN = AUTOGNOSIA_HOME / "oracle" / "brain"
DOCKER_SOCKET = os.environ.get("DOCKER_SOCKET", "/var/run/docker.sock")
CONFIG_PATH = Path(os.environ.get("CONFIG_PATH", "/config/services.yaml"))

# Import local helper bridges
sys.path.insert(0, str(REPO_ROOT / "scripts"))
sys.path.insert(0, str(DASHBOARD_DIR))

import calendar_sync
import email_sync
import check_reminders
from notify_dispatcher import dispatcher
import hermes_interface
import integrations_backend


def _initialize_demo_databases():
    """Legacy no-op: demo data removed. Real databases only."""
    pass


def get_organizer_conn() -> sqlite3.Connection:
    """Connect to the real organizer database with concurrency protections."""
    db_path = ORGANIZER_DB
    if not db_path.exists():
        alternatives = [
            Path.home() / ".autognosia" / "personal-organizer" / "data" / "organizer.db",
            Path.home() / ".autognosia" / "organizer.db",
        ]
        for alt in alternatives:
            if alt.exists():
                db_path = alt
                break
    if not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
    except Exception:
        pass
    # Ensure persistent chat_messages table exists
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                bot_id TEXT NOT NULL,
                sender TEXT NOT NULL CHECK(sender IN ('user', 'bot', 'tool')),
                message TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_bot_session ON chat_messages(bot_id, session_id);")
        conn.commit()
    except Exception:
        pass
    return conn


def get_autognosia_conn() -> sqlite3.Connection:
    if not AUTOGNOSIA_DB.exists():
        import init_autognosia_db
        init_autognosia_db.init_autognosia_db()
    conn = sqlite3.connect(str(AUTOGNOSIA_DB))
    conn.row_factory = sqlite3.Row
    return conn
