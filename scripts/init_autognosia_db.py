#!/usr/bin/env python3
"""
Initialize Autognosia Experience Index database.

The Experience Index tracks operations, verification outcomes, routing events, and reflections.

Usage:
  python3 scripts/init_autognosia_db.py [--yes]
"""

import os
import sys
from pathlib import Path
import sqlite3
import argparse

AUTOGNOSIA_HOME_STR = os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia"))
AUTOGNOSIA_HOME = Path(AUTOGNOSIA_HOME_STR)
DB_PATH = os.environ.get("AUTOGNOSIA_DB", str(AUTOGNOSIA_HOME / "autognosia.db"))

def ensure_directories():
    """Create all required directory structure. Cross-platform."""
    dirs = [
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
        AUTOGNOSIA_HOME / "secrets",
    ]
    created = []
    for d in dirs:
        if not d.exists():
            d.mkdir(parents=True, exist_ok=True)
            created.append(str(d))
    return created

SCHEMA = """
-- Drop any legacy temporary migration tables if present
DROP TABLE IF EXISTS operations_new;
DROP TABLE IF EXISTS routing_new;
-- Operations: what was done (every significant action)
CREATE TABLE IF NOT EXISTS operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
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

-- Verification Checks: did reality match the plan?
CREATE TABLE IF NOT EXISTS verification_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    operation_id INTEGER,
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    notes TEXT,
    FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
);

-- Routing Events: which profile handled what
CREATE TABLE IF NOT EXISTS routing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    session_id TEXT,
    input_summary TEXT NOT NULL,
    routed_to TEXT NOT NULL,
    route_reason TEXT,
    confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
    outcome TEXT
);

-- Skill Events: which skills were used and how
CREATE TABLE IF NOT EXISTS skill_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    session_id TEXT,
    skill_name TEXT NOT NULL,
    trigger TEXT,
    success BOOLEAN DEFAULT TRUE,
    duration_ms INTEGER,
    error_message TEXT
);

-- Reflections: what we learned from experience
CREATE TABLE IF NOT EXISTS reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    session_id TEXT,
    reflection_type TEXT CHECK(reflection_type IN ('pattern', 'lesson', 'warning', 'success', 'failure')),
    content TEXT NOT NULL,
    source_operation_id INTEGER,
    source_tool TEXT,
    applied BOOLEAN DEFAULT FALSE,
    applied_at TEXT,
    FOREIGN KEY (source_operation_id) REFERENCES operations(id) ON DELETE SET NULL
);

-- Key Decisions: important choices made
CREATE TABLE IF NOT EXISTS key_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    session_id TEXT,
    decision TEXT NOT NULL,
    rationale TEXT,
    alternatives_considered TEXT,
    outcome TEXT,
    superseded_by INTEGER REFERENCES key_decisions(id)
);

-- Prospective Memory Log: intentions and outcomes
CREATE TABLE IF NOT EXISTS prospective_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    session_id TEXT,
    cue TEXT NOT NULL,
    action_taken TEXT,
    triggered BOOLEAN DEFAULT FALSE,
    triggered_at TEXT
);

-- Create indexes for common queries
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

def main():
    parser = argparse.ArgumentParser(description="Initialize Autognosia Experience Index database.")
    parser.add_argument("-y", "--yes", action="store_true", help="Auto-confirm without prompting")
    args = parser.parse_args()

    # Ensure all directory structure exists (cross-platform)
    created = ensure_directories()
    if created:
        for d in created:
            print(f"  [created] {d}")
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
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
    if conn.execute("SELECT COUNT(*) FROM operations").fetchone()[0] == 0:
        conn.executescript("""
            INSERT INTO operations (id, timestamp, session_id, profile, action, target, result, duration_ms, metadata)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'default', 'setup', 'databases', 'success', 150, '{}');
            
            INSERT INTO verification_checks (id, timestamp, operation_id, expected_result, actual_result, passed, notes)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 1, 'all healthy', 'all healthy', 1, 'Initial verification passed');
            
            INSERT INTO routing_events (id, timestamp, session_id, input_summary, routed_to, route_reason, confidence, outcome)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'verify systems', 'oracle', 'reference query', 0.95, 'success');
            
            INSERT INTO skill_events (id, timestamp, session_id, skill_name, trigger, success, duration_ms)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'verify_stack', 'health_check', 1, 250);
            
            INSERT INTO reflections (id, timestamp, session_id, reflection_type, content, applied)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'pattern', 'Setup works reliably', 0);
            
            INSERT INTO key_decisions (id, timestamp, session_id, decision, rationale)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'Use SQLite for Personal Organizer', 'Deterministic, no external deps');
            
            INSERT INTO prospective_log (id, timestamp, session_id, cue, action_taken, triggered)
            VALUES (1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), 'setup-001', 'monthly billing', 'check dates', 0);
        """)
    
    conn.close()
    
    print(f"[OK] Experience Index database initialized at: {DB_PATH}")
    print(f"[OK] Tables: {', '.join(tables)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
