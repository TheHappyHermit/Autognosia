#!/usr/bin/env python3
"""
Initialize the Personal Organizer organizer.db database.

Usage:
  python3 scripts/init_db.py [--yes]
"""

import os
import sys
from pathlib import Path
import sqlite3
import argparse

AUTOGNOSIA_HOME_STR = os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia"))
AUTOGNOSIA_HOME = Path(AUTOGNOSIA_HOME_STR)
DB_PATH_STR = os.environ.get("ORGANIZER_DB", str(AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db"))
DB_PATH = Path(DB_PATH_STR)

def ensure_directories():
    """Create all required directory structure. Cross-platform."""
    dirs = [
        DB_PATH.parent,  # personal-organizer/data/
        AUTOGNOSIA_HOME / "active-wiki" / "projects",
        AUTOGNOSIA_HOME / "active-wiki" / ".meta",
        AUTOGNOSIA_HOME / "oracle" / "brain",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "research",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "documents",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "articles",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "transcripts",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "conversations",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "imports",
        AUTOGNOSIA_HOME / "oracle" / "raw" / "assets",
        AUTOGNOSIA_HOME / "personal-organizer" / "backups",
        AUTOGNOSIA_HOME / "personal-organizer" / "data" / "views",
        AUTOGNOSIA_HOME / "personal-organizer" / "data" / "integrity-reports",
        AUTOGNOSIA_HOME / "backups",
        AUTOGNOSIA_HOME / "secrets",
    ]
    created = []
    for d in dirs:
        if not d.exists():
            d.mkdir(parents=True, exist_ok=True)
            created.append(str(d))
    return created

SCHEMA = """
-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    due_at TEXT,
    completed_at TEXT,
    project_id INTEGER,
    dependency_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (dependency_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT DEFAULT 'monthly',
    next_billing_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'paused')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Important dates
CREATE TABLE IF NOT EXISTS important_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Prospective intentions
CREATE TABLE IF NOT EXISTS intentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    cue TEXT,
    action TEXT NOT NULL,
    status TEXT DEFAULT 'dormant' CHECK(status IN ('dormant', 'active', 'expired', 'completed')),
    created_at TEXT DEFAULT (datetime('now')),
    triggered_at TEXT
);

-- Waiting states
CREATE TABLE IF NOT EXISTS waiting_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    waiting_for TEXT,
    follow_up_date TEXT,
    status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'resolved', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Reminders (Multi-Channel Timed Alerts)
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    channel TEXT DEFAULT 'all' CHECK(channel IN ('all', 'telegram', 'discord', 'email', 'sms', 'desktop', 'gui')),
    target_destination TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'cancelled', 'snoozed')),
    recurring_rule TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    sent_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_dates ON important_dates(date);
CREATE INDEX IF NOT EXISTS idx_intentions_status ON intentions(status);
CREATE INDEX IF NOT EXISTS idx_waiting_status ON waiting_states(status);
CREATE INDEX IF NOT EXISTS idx_reminders_status_time ON reminders(status, remind_at);
"""

def main():
    parser = argparse.ArgumentParser(description="Initialize Personal Organizer database.")
    parser.add_argument("-y", "--yes", action="store_true", help="Auto-confirm without prompting")
    parser.add_argument("--seed", action="store_true", help="Insert sample data")
    args = parser.parse_args()
    
    ensure_directories()
    
    if os.path.exists(DB_PATH) and not args.yes:
        if sys.stdin.isatty():
            response = input(f"Database already exists at {DB_PATH}. Re-apply schema? (y/N): ")
            if response.lower() != 'y':
                print("Aborted.")
                return 0
        else:
            print(f"Database exists at {DB_PATH}. Applying schema updates.")
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.executescript(SCHEMA)
    conn.commit()
    
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    
    # Insert sample data (only if tables are empty)
    if conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 0:
        conn.executescript("""
            INSERT INTO tasks (id, title, description, status, priority, created_at)
            VALUES (1, 'Setup verification', 'Verify all systems are working after setup', 'active', 'high', datetime('now'));
            
            INSERT INTO projects (id, name, description, status, created_at)
            VALUES (1, 'Autognosia Setup', 'Initial setup and configuration of Autognosia', 'active', datetime('now'));
            
            INSERT INTO subscriptions (id, name, amount, billing_cycle, next_billing_date, status)
            VALUES (1, 'Example Subscription', 9.99, 'monthly', date('now', '+30 days'), 'active');
            
            INSERT INTO important_dates (id, title, date, description)
            VALUES (1, 'System Review', date('now', '+7 days'), 'Weekly system health check');
            
            INSERT INTO intentions (id, title, cue, action, status)
            VALUES (1, 'Review subscriptions', 'monthly billing', 'Check billing dates', 'active');
            
            INSERT INTO waiting_states (id, title, waiting_for, follow_up_date, status)
            VALUES (1, 'Awaiting feedback', 'User review on setup', date('now', '+3 days'), 'waiting');

            INSERT INTO reminders (id, title, remind_at, channel, status)
            VALUES (1, 'Review Autognosia Command Deck Metrics', datetime('now', '+2 hours'), 'all', 'pending');
        """)
    
    conn.close()
    
    print(f"[OK] Personal Organizer database initialized at: {DB_PATH}")
    print(f"[OK] Tables: {', '.join(tables)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
