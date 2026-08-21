#!/usr/bin/env python3
"""
Integrity checker for organizer.db.
Runs foreign key checks, integrity checks, and schema validation.
"""

import sqlite3
import os
import sys
import json
from datetime import datetime, timezone

# Cross-platform home directory
AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("~/.autognosia"))

DB_PATH = os.environ.get("ORGANIZER_DB", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "organizer.db"))
REPORTS_DIR = os.environ.get("INTEGRITY_REPORTS", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "integrity-reports"))


def utcnow():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def check_integrity(conn):
    """Run SQLite integrity check."""
    c = conn.cursor()
    result = c.execute("PRAGMA integrity_check").fetchone()
    return result[0] == "ok" if result else False


def check_foreign_keys(conn):
    """Check foreign key violations."""
    c = conn.cursor()
    violations = c.execute("PRAGMA foreign_key_check").fetchall()
    # Format tuple (table, rowid, parent_table, fkid)
    formatted = []
    for v in violations:
        formatted.append({
            "table": v[0],
            "rowid": v[1],
            "parent_table": v[2],
            "fkid": v[3]
        })
    return formatted


def check_tables(conn):
    """Verify all expected tables exist."""
    expected = [
        "tasks", "projects", "subscriptions",
        "important_dates", "intentions", "waiting_states"
    ]

    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing = {row[0] for row in c.fetchall()}

    missing = [t for t in expected if t not in existing]
    return missing


def main():
    if not os.path.exists(DB_PATH):
        print(f"Database not found: {DB_PATH}", file=sys.stderr)
        return 1

    os.makedirs(REPORTS_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")

    report = {
        "timestamp": utcnow(),
        "database": DB_PATH,
        "checks": {}
    }

    integrity_ok = check_integrity(conn)
    report["checks"]["integrity"] = "PASS" if integrity_ok else "FAIL"

    violations = check_foreign_keys(conn)
    report["checks"]["foreign_keys"] = "PASS" if not violations else f"FAIL ({len(violations)} violations)"
    if violations:
        report["checks"]["fk_violations"] = violations

    missing = check_tables(conn)
    report["checks"]["tables"] = "PASS" if not missing else f"FAIL (missing: {missing})"

    report["status"] = "HEALTHY" if (
        integrity_ok and not violations and not missing
    ) else "UNHEALTHY"

    report_path = os.path.join(REPORTS_DIR, f"integrity_{utcnow().replace(':', '-')}.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    print(f"\nReport saved to: {report_path}")

    conn.close()

    return 0 if report["status"] == "HEALTHY" else 1


if __name__ == "__main__":
    sys.exit(main())
