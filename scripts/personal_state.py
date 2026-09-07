#!/usr/bin/env python3
"""
Personal State Check — single source of truth.

Checks organizer.db for due reminders, overdue tasks, active intentions,
waiting state follow-ups, and upcoming subscriptions.

Exit 0 = all clear, exit 1 = something needs attention.
"""

import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

DB_PATH = Path.home() / ".autognosia" / "personal-state" / "data" / "organizer.db"
WARNING_DAYS = 14  # Subscription warning window

def main() -> int:
    now = datetime.now(timezone.utc)
    today = now.date()
    warning_date = today + timedelta(days=WARNING_DAYS)

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    issues = []

    # ── Due reminders ─────────────────────────────────────────────────
    cur.execute("""
        SELECT id, title, remind_at, status, notes
        FROM reminders
        WHERE remind_at <= ?
          AND status NOT IN ('sent', 'expired', 'cancelled')
        ORDER BY remind_at
    """, (now.isoformat(),))
    for r in cur.fetchall():
        issues.append({
            "type": "REMINDER",
            "id": r["id"],
            "title": r["title"],
            "due": r["remind_at"],
            "detail": r["notes"] or ""
        })

    # ── Overdue tasks ─────────────────────────────────────────────────
    cur.execute("""
        SELECT id, title, due_at, priority, status
        FROM tasks
        WHERE due_at IS NOT NULL
          AND due_at < ?
          AND status NOT IN ('completed', 'cancelled')
        ORDER BY due_at
    """, (today.isoformat(),))
    for r in cur.fetchall():
        issues.append({
            "type": "OVERDUE TASK",
            "id": r["id"],
            "title": r["title"],
            "due": r["due_at"],
            "detail": f"priority={r['priority']}, status={r['status']}"
        })

    # ── Active intentions (not triggered in 30+ days) ─────────────────
    cur.execute("""
        SELECT id, title, cue, triggered_at
        FROM intentions
        WHERE status = 'active'
        ORDER BY created_at
    """)
    for r in cur.fetchall():
        triggered = r["triggered_at"]
        if triggered:
            try:
                t = datetime.fromisoformat(triggered.replace("Z", "+00:00"))
                stale = (now - t).days > 30
            except Exception:
                stale = False
        else:
            stale = True  # Never triggered
        if stale:
            issues.append({
                "type": "INTENTION",
                "id": r["id"],
                "title": r["title"],
                "due": triggered or "never",
                "detail": f"cue={r['cue']}"
            })

    # ── Waiting state follow-ups ──────────────────────────────────────
    cur.execute("""
        SELECT id, title, waiting_for, follow_up_date, status
        FROM waiting_states
        WHERE follow_up_date IS NOT NULL
          AND follow_up_date <= ?
          AND status NOT IN ('resolved', 'cancelled')
        ORDER BY follow_up_date
    """, (today.isoformat(),))
    for r in cur.fetchall():
        issues.append({
            "type": "FOLLOW-UP",
            "id": r["id"],
            "title": r["title"],
            "due": r["follow_up_date"],
            "detail": f"waiting_for={r['waiting_for']}"
        })

    # ── Upcoming subscriptions ────────────────────────────────────────
    cur.execute("""
        SELECT id, name, amount, next_billing_date
        FROM subscriptions
        WHERE status = 'active'
          AND next_billing_date <= ?
        ORDER BY next_billing_date
    """, (warning_date.isoformat(),))
    for r in cur.fetchall():
        issues.append({
            "type": "SUBSCRIPTION",
            "id": r["id"],
            "title": r["name"],
            "due": r["next_billing_date"],
            "detail": f"${r['amount']:.2f}"
        })

    conn.close()

    # ── Output ────────────────────────────────────────────────────────
    print(f"Personal State Check — {now.strftime('%Y-%m-%d %H:%M UTC')}")
    print("=" * 60)

    if not issues:
        print("✅ All clear — nothing needs attention.")
        return 0

    # Group by type
    by_type = {}
    for i in issues:
        by_type.setdefault(i["type"], []).append(i)

    for typ, items in by_type.items():
        print(f"\n{typ} ({len(items)})")
        print("-" * 40)
        for i in items:
            print(f"  [{i['id']}] {i['title']}")
            print(f"       due: {i['due']}  {i['detail']}")

    print(f"\n{len(issues)} item(s) need attention.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
