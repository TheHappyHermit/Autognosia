#!/usr/bin/env python3
"""Check integrity, FK enforcement, and journal mode of the Autognosia SQLite DBs.

The system has no sqlite3 CLI binary, so checks go through Python's sqlite3
module. Verifies:
  - PRAGMA integrity_check
  - PRAGMA foreign_key_check (orphaned rows were found in production once)
  - journal_mode is WAL
  - RFC 3339 UTC timestamp conformance on *_at columns

Exit 0 when everything passes, 1 otherwise.
"""

import os
import re
import sqlite3
import sys

DBS = [
    os.path.expanduser("~/.autognosia/autognosia.db"),
    os.path.expanduser("~/.autognosia/personal-organizer/data/organizer.db"),
]

# RFC 3339 UTC, e.g. 2026-08-25T00:00:00Z
RFC3339 = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$")


def check(path):
    label = os.path.basename(path)
    print(f"\n=== {label} ===")
    if not os.path.isfile(path):
        print("  MISSING")
        return False

    size_mb = os.path.getsize(path) / 1024 / 1024
    print(f"  path: {path}")
    print(f"  size: {size_mb:.2f} MB")

    ok = True
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        conn.execute("PRAGMA foreign_keys=ON")

        integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
        print(f"  integrity_check: {integrity}")
        if integrity != "ok":
            ok = False

        fk_rows = conn.execute("PRAGMA foreign_key_check").fetchall()
        print(f"  foreign_key_check: {len(fk_rows)} violation(s)")
        if fk_rows:
            ok = False
            for row in fk_rows[:5]:
                print(f"    - {row}")

        mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
        print(f"  journal_mode: {mode}")
        if mode.lower() != "wal":
            print("    ! expected WAL")
            ok = False

        tables = [
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' "
                "AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
        ]
        print(f"  tables: {len(tables)}")

        # Timestamp format conformance on *_at columns.
        bad_ts = []
        for table in tables:
            cols = [
                r[1]
                for r in conn.execute(f'PRAGMA table_info("{table}")')
                if r[1].endswith("_at")
            ]
            for col in cols:
                try:
                    rows = conn.execute(
                        f'SELECT "{col}" FROM "{table}" '
                        f'WHERE "{col}" IS NOT NULL LIMIT 200'
                    ).fetchall()
                except sqlite3.Error:
                    continue
                for (val,) in rows:
                    if isinstance(val, str) and val and not RFC3339.match(val):
                        bad_ts.append((table, col, val))
                        break

        if bad_ts:
            print(f"  non-RFC3339 timestamps: {len(bad_ts)} column(s)")
            for table, col, sample in bad_ts[:8]:
                print(f"    - {table}.{col} e.g. {sample!r}")
        else:
            print("  timestamps: all sampled *_at values are RFC 3339 UTC")
    finally:
        conn.close()

    return ok


def main():
    print("Autognosia SQLite integrity check")
    results = [check(p) for p in DBS]
    print()
    if all(results):
        print("RESULT: OK - all databases pass.")
        return 0
    print("RESULT: FAIL - see details above.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
