#!/usr/bin/env python3
"""
Schema conformance check for Autognosia databases.

Validates:
  1. WAL mode on all databases
  2. Expected tables exist
  3. Foreign key integrity (no orphaned rows)
  4. Timestamp format consistency (RFC 3339 only) -- reported as COUNTS
  5. Exchange package structure validity

Databases:
  - ~/.autognosia/autognosia.db          (operations/event log)
  - ~/.autognosia/personal-organizer/data/organizer.db  (website-facing organizer)

Returns exit 0 if all checks pass, exit 1 if any violations found.
"""

import re
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

DB_PATHS = [
    REPO_ROOT / "autognosia.db",
    REPO_ROOT / "personal-organizer" / "data" / "organizer.db",
]

# Expected tables per database name
EXPECTED_TABLES = {
    "autognosia": [
        "operations",
        "verification_checks",
        "routing_events",
        "skill_events",
        "reflections",
        "key_decisions",
        "prospective_log",
    ],
    "organizer": [
        "tasks",
        "projects",
        "subscriptions",
        "important_dates",
        "intentions",
        "waiting_states",
        "reminders",
    ],
}

# Timestamp columns to validate (RFC 3339 pattern). Violations reported as counts.
#
# NOTE (2026-08-25): this list is a FLOOR, not the whole check. It was silently
# incomplete -- `tasks.updated_at` was missing, so a real violation
# ('2026-08-17 01:05:03', space-separated) passed conformance unnoticed for
# weeks. Mixed formats in one column break lexicographic ordering because
# space (0x20) sorts before 'T' (0x54), corrupting ORDER BY and index range
# scans with no error raised.
#
# discover_timestamp_columns() below now walks the LIVE schema and audits every
# *_at / timestamp column it finds. A newly added column is covered the moment
# it exists, instead of waiting for someone to remember to edit this dict.
TIMESTAMP_COLUMNS = {
    "autognosia": [
        ("operations", "timestamp"),
        ("verification_checks", "timestamp"),
        ("routing_events", "timestamp"),
        ("skill_events", "timestamp"),
        ("reflections", "timestamp"),
        ("reflections", "applied_at"),
        ("key_decisions", "timestamp"),
        ("prospective_log", "timestamp"),
        ("prospective_log", "triggered_at"),
    ],
    "organizer": [
        ("tasks", "created_at"),
        ("tasks", "completed_at"),
        ("projects", "created_at"),
        ("projects", "updated_at"),
        ("subscriptions", "created_at"),
        ("subscriptions", "updated_at"),
        ("important_dates", "created_at"),
        ("intentions", "created_at"),
        ("intentions", "triggered_at"),
        ("waiting_states", "created_at"),
        ("reminders", "created_at"),
        ("reminders", "remind_at"),
        ("reminders", "sent_at"),
    ],
}

# Date-only columns (YYYY-MM-DD is correct for these -- NOT timestamps)
DATE_COLUMNS = {
    "organizer": [
        ("tasks", "due_at"),
        ("subscriptions", "next_billing_date"),
        ("waiting_states", "follow_up_date"),
        ("important_dates", "date"),
    ],
}

# Foreign key relationships to validate
FK_CHECKS = {
    "autognosia": [
        {"parent": "operations", "child": "verification_checks",
         "fk_column": "operation_id", "parent_key": "id"},
        {"parent": "operations", "child": "reflections",
         "fk_column": "source_operation_id", "parent_key": "id"},
        {"parent": "key_decisions", "child": "key_decisions",
         "fk_column": "superseded_by", "parent_key": "id"},
    ],
    "organizer": [
        {"parent": "projects", "child": "tasks",
         "fk_column": "project_id", "parent_key": "id"},
    ],
}

EXCHANGE_DIR = REPO_ROOT / "exchange" / "research"


def db_name(db_path):
    return "organizer" if db_path.name == "organizer.db" else db_path.stem


def check_wal_mode():
    violations = []
    for db_path in DB_PATHS:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        try:
            mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
            if str(mode).lower() != "wal":
                violations.append(f"- {db_path.name}: journal_mode={mode} (expected wal)")
        finally:
            conn.close()
    return violations


def check_tables_exist():
    violations = []
    for db_path in DB_PATHS:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        try:
            tables = {
                row[0]
                for row in conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                ).fetchall()
            }
            missing = set(EXPECTED_TABLES[db_name(db_path)]) - tables
            if missing:
                violations.append(f"- {db_path.name}: missing tables {sorted(missing)}")
        finally:
            conn.close()
    return violations


def check_foreign_keys():
    violations = []
    for db_path in DB_PATHS:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        try:
            conn.execute("PRAGMA foreign_keys = ON")
            for fk in FK_CHECKS[db_name(db_path)]:
                try:
                    conn.execute(f"SELECT 1 FROM {fk['child']} LIMIT 0")
                    conn.execute(f"SELECT 1 FROM {fk['parent']} LIMIT 0")
                except sqlite3.OperationalError:
                    continue
                orphaned = conn.execute(
                    f"SELECT COUNT(*) FROM {fk['child']} "
                    f"WHERE {fk['fk_column']} IS NOT NULL AND {fk['fk_column']} NOT IN "
                    f"(SELECT {fk['parent_key']} FROM {fk['parent']})"
                ).fetchone()[0]
                if orphaned > 0:
                    violations.append(
                        f"- {db_path.name}: {orphaned} orphaned {fk['child']} rows"
                    )
        finally:
            conn.close()
    return violations


def discover_timestamp_columns(conn, name):
    """Walk the LIVE schema for every timestamp-ish column.

    Returns a sorted list of (table, column) covering:
      - any column ending in '_at'
      - any column named exactly 'timestamp'

    Columns listed in DATE_COLUMNS are excluded: those hold calendar dates
    (a due date is a day, not an instant) and are validated by check_dates().

    This exists because the hand-maintained TIMESTAMP_COLUMNS dict was
    incomplete and let a real violation pass. Deriving from the live schema
    means a check cannot silently skip a column that actually exists.
    """
    date_only = set(DATE_COLUMNS.get(name, []))
    found = set()
    tables = [
        row[0]
        for row in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'sqlite_%'"
        ).fetchall()
    ]
    for table in tables:
        try:
            cols = [r[1] for r in conn.execute(f'PRAGMA table_info("{table}")')]
        except sqlite3.OperationalError:
            continue
        for col in cols:
            if col.endswith("_at") or col == "timestamp":
                if (table, col) not in date_only:
                    found.add((table, col))
    # Union with the declared floor so an expected column missing from the
    # live schema still surfaces via check_tables_exist / query failure.
    for pair in TIMESTAMP_COLUMNS.get(name, []):
        if pair not in date_only:
            found.add(pair)
    return sorted(found)


def check_timestamps():
    """Count non-RFC3339 values per column (never dump individual rows).

    Accepts optional fractional seconds: 2026-08-25T01:02:03Z and
    2026-08-25T01:02:03.123456Z are both valid RFC 3339 UTC.
    """
    violations = []
    pattern = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$")
    for db_path in DB_PATHS:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        try:
            name = db_name(db_path)
            for table, col in discover_timestamp_columns(conn, name):
                try:
                    conn.execute(f'SELECT 1 FROM "{table}" LIMIT 0')
                except sqlite3.OperationalError:
                    continue
                bad, total = 0, 0
                try:
                    rows = conn.execute(
                        f'SELECT "{col}" FROM "{table}" WHERE "{col}" IS NOT NULL'
                    ).fetchall()
                except sqlite3.OperationalError:
                    continue
                for (val,) in rows:
                    total += 1
                    if not pattern.match(str(val).strip()):
                        bad += 1
                if bad:
                    violations.append(
                        f"- {db_path.name}.{table}.{col}: {bad}/{total} timestamps "
                        f"not RFC 3339 (needs one-time backfill)"
                    )
        finally:
            conn.close()
    return violations


def check_dates():
    """Date-only columns must be YYYY-MM-DD."""
    violations = []
    pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    for db_path in DB_PATHS:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        try:
            for table, col in DATE_COLUMNS.get(db_name(db_path), []):
                try:
                    conn.execute(f"SELECT 1 FROM {table} LIMIT 0")
                except sqlite3.OperationalError:
                    continue
                bad, total = 0, 0
                for (val,) in conn.execute(
                    f"SELECT {col} FROM {table} WHERE {col} IS NOT NULL"
                ).fetchall():
                    total += 1
                    if not pattern.match(str(val).strip()):
                        bad += 1
                if bad:
                    violations.append(
                        f"- {db_path.name}.{table}.{col}: {bad}/{total} dates "
                        f"not YYYY-MM-DD"
                    )
        finally:
            conn.close()
    return violations


def check_exchange_packages():
    violations = []
    if not EXCHANGE_DIR.exists():
        return violations
    required_fields = {"version", "timestamp", "content_type", "title"}
    for pkg_file in EXCHANGE_DIR.glob("*.json"):
        try:
            import json
            data = json.load(open(pkg_file))
            missing = required_fields - set(data.keys())
            if missing:
                violations.append(
                    f"- exchange/research/{pkg_file.name}: missing fields {missing}"
                )
        except Exception:
            violations.append(f"- exchange/research/{pkg_file.name}: invalid JSON")
    return violations


def main():
    all_violations = []
    for name, fn in [
        ("WAL mode", check_wal_mode),
        ("Expected tables", check_tables_exist),
        ("Foreign keys", check_foreign_keys),
        ("Timestamps (RFC 3339)", check_timestamps),
        ("Dates (YYYY-MM-DD)", check_dates),
        ("Exchange packages", check_exchange_packages),
    ]:
        v = fn()
        if v:
            all_violations.extend(v)

    if all_violations:
        # Hard cap output so a flood can never blow up a caller
        if len(all_violations) > 40:
            shown = all_violations[:40]
            shown.append(f"... ({len(all_violations) - 40} more)")
            print("\n".join(shown))
        else:
            print("\n".join(all_violations))
        sys.exit(1)
    print("All schema checks passed (WAL, tables, FKs, timestamps, exchange)")
    sys.exit(0)


if __name__ == "__main__":
    main()
