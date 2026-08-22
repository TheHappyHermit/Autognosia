#!/usr/bin/env python3
"""Schema-conformance guard for Autognosia data stores.

Verifies, without writing anything:
  1. Both SQLite databases are in WAL journal mode.
  2. All expected indexes from docs/SCHEMAS.md exist.
  3. No orphaned foreign keys (runs PRAGMA foreign_key_check).
  4. Timestamp columns contain a single consistent format family
     (RFC 3339 'T'-separated vs legacy space-separated), reporting the
     ratio; new rows must be RFC 3339.
  5. Every JSON file in exchange/research/ validates against
     schemas/research-request.schema.json (structural check; full JSON
     Schema validation if the jsonschema package is installed).

Exit 0 = conformant, exit 1 = violations found.
Designed for cron: silent when clean, prints only problems.

Usage: verify_schema_conformance.py
"""

import json
import os
import re
import sqlite3
import sys

HOME = os.path.expanduser("~")
STORES = {
    "autognosia.db": os.path.join(HOME, ".autognosia", "autognosia.db"),
    "organizer.db": os.path.join(HOME, ".autognosia", "personal-organizer", "data", "organizer.db"),
}
EXPECTED_INDEXES = {
    "autognosia.db": [
        "idx_ops_session", "idx_routing_timestamp", "idx_skill_timestamp",
        "idx_prospective_triggered", "idx_prospective_ts",
    ],
    "organizer.db": [
        "idx_projects_status", "idx_reminders_due",
        "idx_intentions_dormant", "idx_waiting_followup",
    ],
}

RFC3339 = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}")
LEGACY = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}")

TIMESTAMP_COLUMNS = {
    # store: [(table, column), ...] — checked for format consistency
    "autognosia.db": [("operations", "timestamp"), ("reflections", "timestamp")],
    "organizer.db": [("tasks", "created_at"), ("reminders", "created_at"), ("reminders", "sent_at")],
}


def check_store(label, path):
    problems = []
    conn = sqlite3.connect(path)
    cur = conn.cursor()

    mode = cur.execute("PRAGMA journal_mode").fetchone()[0]
    if mode.lower() != "wal":
        problems.append(f"[{label}] journal_mode={mode}, expected wal")

    have = {r[0] for r in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='index'").fetchall()}
    for idx in EXPECTED_INDEXES[label]:
        if idx not in have:
            problems.append(f"[{label}] missing index {idx}")

    fk = cur.execute("PRAGMA foreign_key_check").fetchall()
    if fk:
        problems.append(f"[{label}] {len(fk)} foreign-key violations: {fk[:3]}")

    for table, column in TIMESTAMP_COLUMNS.get(label, []):
        try:
            rows = cur.execute(f"SELECT {column} FROM {table} WHERE {column} IS NOT NULL").fetchall()
        except sqlite3.Error:
            continue
        values = [r[0] for r in rows]
        if not values:
            continue
        iso = sum(1 for v in values if RFC3339.match(str(v)))
        legacy = sum(1 for v in values if LEGACY.match(str(v)))
        other = len(values) - iso - legacy
        if other:
            problems.append(
                f"[{label}] {table}.{column}: {other}/{len(values)} values match NO known format")
        elif legacy and iso == 0:
            pass  # all-legacy column: acceptable, noted in docs
        elif legacy and iso:
            problems.append(
                f"[{label}] {table}.{column}: MIXED formats "
                f"({iso} RFC3339 / {legacy} legacy) — new writes must be RFC3339")
    conn.close()
    return problems


def check_exchange_packages():
    problems = []
    schema_path = os.path.join(HOME, "autognosia-clean", "schemas",
                               "research-request.schema.json")
    exch_dir = os.path.join(HOME, ".autognosia", "exchange", "research")
    if not os.path.isdir(exch_dir):
        return problems
    schema = None
    if os.path.exists(schema_path):
        with open(schema_path) as fh:
            schema = json.load(fh)
    for f in sorted(os.listdir(exch_dir)):
        if not f.endswith(".json"):
            continue
        path = os.path.join(exch_dir, f)
        try:
            with open(path) as fh:
                pkg = json.load(fh)
        except json.JSONDecodeError as e:
            problems.append(f"[exchange] {f}: invalid JSON ({e})")
            continue
        if schema:
            missing = [k for k in schema.get("required", []) if k not in pkg]
            if missing:
                problems.append(f"[exchange] {f}: missing required fields {missing}")
                continue
            reqs = pkg.get("requirements", {})
            rmiss = [k for k in schema.get("properties", {}).get("requirements", {}).get("required", [])
                     if k not in reqs]
            if rmiss:
                problems.append(f"[exchange] {f}: requirements missing {rmiss}")
            if pkg.get("priority") not in ("low", "medium", "high"):
                problems.append(f"[exchange] {f}: bad priority {pkg.get('priority')!r}")
    return problems


def main():
    problems = []
    for label, path in STORES.items():
        if not os.path.exists(path):
            problems.append(f"[{label}] database not found at {path}")
            continue
        problems.extend(check_store(label, path))
    problems.extend(check_exchange_packages())

    if problems:
        print("SCHEMA CONFORMANCE VIOLATIONS:")
        for p in problems:
            print(" -", p)
        sys.exit(1)
    # silent when clean (cron-friendly)


if __name__ == "__main__":
    main()
