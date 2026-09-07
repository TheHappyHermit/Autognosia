#!/usr/bin/env python3
"""Apply additive schema upgrades to Autognosia SQLite stores.

Idempotent: safe to run any time, no-op when everything is present.
Only CREATE INDEX IF NOT EXISTS and PRAGMA statements — no column changes,
no data rewrites. See docs/SCHEMAS.md for the full assessment.

Usage: apply_schema_upgrades.py [--dry-run]
"""

import argparse
import sqlite3
import os

UPGRADES = {
    os.path.expanduser("~/.autognosia/autognosia.db"): [
        "PRAGMA journal_mode=WAL;",
        "CREATE INDEX IF NOT EXISTS idx_ops_session ON operations(session_id);",
        "CREATE INDEX IF NOT EXISTS idx_routing_timestamp ON routing_events(timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_skill_timestamp ON skill_events(timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_prospective_triggered ON prospective_log(triggered);",
        "CREATE INDEX IF NOT EXISTS idx_prospective_ts ON prospective_log(timestamp);",
    ],
    os.path.expanduser("~/.autognosia/personal-organizer/data/organizer.db"): [
        "PRAGMA journal_mode=WAL;",
        "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);",
        "CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(remind_at) WHERE status = 'pending';",
        "CREATE INDEX IF NOT EXISTS idx_intentions_dormant ON intentions(status, created_at);",
        "CREATE INDEX IF NOT EXISTS idx_waiting_followup ON waiting_states(follow_up_date);",
    ],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    for db_path, statements in UPGRADES.items():
        if not os.path.exists(db_path):
            print(f"[skip] {db_path}: not found")
            continue
        label = db_path.split("/")[-1]
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for stmt in statements:
            if args.dry_run:
                print(f"[dry] {label}: {stmt[:70]}")
                continue
            try:
                cur.execute(stmt)
                kind = "journal" if stmt.startswith("PRAGMA") else "index"
                print(f"[ok] {label}: {kind} ensured ({stmt.split()[2] if not stmt.startswith('PRAGMA') else stmt.split()[1]})")
            except sqlite3.Error as e:
                print(f"[err] {label}: {e}")
        conn.commit()
        # verify WAL took effect
        mode = cur.execute("PRAGMA journal_mode").fetchone()[0]
        print(f"      {label} journal_mode={mode}")
        conn.close()

    print("done.")


if __name__ == "__main__":
    main()
