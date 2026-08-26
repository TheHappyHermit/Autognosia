#!/usr/bin/env python3
"""Normalize organizer.db tasks.updated_at to RFC 3339 UTC.

PROBLEM
-------
tasks.updated_at holds MIXED formats in one column:
    '2026-08-17 01:05:03'   <- space-separated, from sqlite datetime('now')
    '2026-08-18T05:29:06Z'  <- correct RFC 3339 UTC
Mixed formats in a single column silently break lexicographic sorting and
index range scans: '2026-08-17 01:05:03' < '2026-08-17T...' because space
(0x20) sorts before 'T' (0x54). Ordering by updated_at therefore returns
wrong results without raising any error.

WHAT THIS DOES
--------------
Rewrites only values that fail the RFC 3339 UTC pattern, converting
'YYYY-MM-DD HH:MM:SS' -> 'YYYY-MM-DDTHH:MM:SSZ'. The instant is preserved;
these values were already UTC, only the separator and zone marker differ.

NOT TOUCHED
-----------
tasks.due_at holds calendar dates ('2026-08-24') by design. A due date is a
day, not an instant; forcing a time onto it would invent precision. Left
alone deliberately.

SAFETY
------
- Backs up the database before writing.
- Idempotent: only rows failing the pattern are updated. Re-running is a no-op.
- Never deletes rows or columns.
- PRAGMA foreign_keys=ON per project convention for any writer.

USAGE
  python3 normalize_organizer_timestamps.py --dry-run
  python3 normalize_organizer_timestamps.py
"""

import argparse
import os
import re
import shutil
import sqlite3
import sys
from datetime import datetime, timezone

DB = os.path.expanduser("~/.autognosia/personal-organizer/data/organizer.db")

RFC3339 = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$")
SPACE_FORM = re.compile(r"^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?$")

# (table, column) pairs that must be RFC 3339 instants.
TARGETS = [
    ("tasks", "updated_at"),
    ("tasks", "created_at"),
    ("tasks", "completed_at"),
]


def normalize(value):
    """Return an RFC 3339 UTC string, or None if unconvertible."""
    if not isinstance(value, str) or not value.strip():
        return None
    if RFC3339.match(value):
        return None  # already correct
    match = SPACE_FORM.match(value.strip())
    if match:
        return f"{match.group(1)}T{match.group(2)}Z"
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.isfile(DB):
        print(f"Database not found: {DB}")
        return 1

    print("organizer.db timestamp normalization")
    print(f"  db: {DB}")

    conn = sqlite3.connect(DB)
    conn.execute("PRAGMA foreign_keys=ON")

    existing = {
        r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
    }

    planned = []
    for table, column in TARGETS:
        if table not in existing:
            continue
        cols = [r[1] for r in conn.execute(f'PRAGMA table_info("{table}")')]
        if column not in cols:
            continue
        rows = conn.execute(
            f'SELECT id, "{column}" FROM "{table}" WHERE "{column}" IS NOT NULL'
        ).fetchall()
        for row_id, value in rows:
            fixed = normalize(value)
            if fixed:
                planned.append((table, column, row_id, value, fixed))

    if not planned:
        print("\n  Nothing to change. All target timestamps already RFC 3339 UTC.")
        conn.close()
        return 0

    print(f"\n  {len(planned)} value(s) need normalization:")
    for table, column, row_id, old, new in planned[:20]:
        print(f"    {table}.{column} id={row_id}: {old!r} -> {new!r}")
    if len(planned) > 20:
        print(f"    ... and {len(planned) - 20} more")

    if args.dry_run:
        print("\n  [dry-run] no changes written.")
        conn.close()
        return 0

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = f"{DB}.bak-{stamp}"
    shutil.copy2(DB, backup)
    print(f"\n  backup written: {backup}")

    for table, column, row_id, _, new in planned:
        conn.execute(
            f'UPDATE "{table}" SET "{column}" = ? WHERE id = ?', (new, row_id)
        )
    conn.commit()

    # Verify by re-reading.
    remaining = 0
    for table, column, row_id, _, _ in planned:
        val = conn.execute(
            f'SELECT "{column}" FROM "{table}" WHERE id = ?', (row_id,)
        ).fetchone()[0]
        if not RFC3339.match(val or ""):
            remaining += 1

    conn.close()

    print(f"  updated: {len(planned)}")
    print(f"  still non-conforming: {remaining}")
    if remaining:
        print("\nRESULT: FAIL - some values did not normalize.")
        return 1
    print("\nRESULT: OK - all target timestamps are RFC 3339 UTC.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
