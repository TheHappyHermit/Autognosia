#!/usr/bin/env python3
"""
Generate markdown views from organizer.db.
Creates read-only projections of tasks, projects, subscriptions, etc.
"""

import sqlite3
import os
import sys
from datetime import datetime, timezone

# Cross-platform home directory
AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.join(os.environ["HOME"], ".autognosia"))

DB_PATH = os.environ.get("ORGANIZER_DB", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "organizer.db"))
VIEWS_DIR = os.environ.get("VIEWS_DIR", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "views"))


def utcnow():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def generate_tasks_view(conn):
    """Generate tasks.md view."""
    c = conn.cursor()
    c.execute("""
        SELECT t.id, t.title, t.status, t.priority, t.due_at, t.created_at
        FROM tasks t
        WHERE t.status != 'completed'
        ORDER BY
            CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
            t.due_at ASC
    """)

    rows = c.fetchall()
    lines = ["# Active Tasks", "", f"<!-- Auto-generated: {utcnow()} -->", ""]

    if not rows:
        lines.append("No active tasks.")
    else:
        lines.append("| # | Title | Status | Priority | Due Date |")
        lines.append("|---|-------|--------|----------|----------|")
        for row in rows:
            lines.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4] or 'N/A'} |")

    return "\n".join(lines)


def generate_projects_view(conn):
    """Generate projects.md view."""
    c = conn.cursor()
    c.execute("""
        SELECT id, name, status, description, created_at
        FROM projects
        WHERE status != 'archived'
        ORDER BY created_at DESC
    """)

    rows = c.fetchall()
    lines = ["# Active Projects", "", f"<!-- Auto-generated: {utcnow()} -->", ""]

    for row in rows:
        lines.append(f"## {row[1]}")
        lines.append(f"- **Status:** {row[2]}")
        lines.append(f"- **Description:** {row[3] or 'N/A'}")
        lines.append(f"- **Created:** {row[4]}")
        lines.append("")

    return "\n".join(lines)


def generate_subscriptions_view(conn):
    """Generate subscriptions.md view."""
    c = conn.cursor()
    c.execute("""
        SELECT id, name, amount, currency, billing_cycle, next_billing_date, status
        FROM subscriptions
        WHERE status = 'active'
        ORDER BY next_billing_date ASC
    """)

    rows = c.fetchall()
    lines = ["# Active Subscriptions", "", f"<!-- Auto-generated: {utcnow()} -->", ""]

    if not rows:
        lines.append("No active subscriptions.")
    else:
        lines.append("| Name | Amount | Cycle | Next Billing | Status |")
        lines.append("|------|--------|-------|-------------|--------|")
        for row in rows:
            lines.append(f"| {row[1]} | {row[2]} {row[3]} | {row[4]} | {row[5] or 'N/A'} | {row[6]} |")

    return "\n".join(lines)


def main():
    if not os.path.exists(DB_PATH):
        print(f"Database not found: {DB_PATH}", file=sys.stderr)
        return 1

    os.makedirs(VIEWS_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)

    try:
        tasks_md = generate_tasks_view(conn)
        projects_md = generate_projects_view(conn)
        subscriptions_md = generate_subscriptions_view(conn)

        with open(os.path.join(VIEWS_DIR, "tasks.md"), "w", encoding="utf-8") as f:
            f.write(tasks_md)
        print("[OK] Generated: tasks.md")

        with open(os.path.join(VIEWS_DIR, "projects.md"), "w", encoding="utf-8") as f:
            f.write(projects_md)
        print("[OK] Generated: projects.md")

        with open(os.path.join(VIEWS_DIR, "subscriptions.md"), "w", encoding="utf-8") as f:
            f.write(subscriptions_md)
        print("[OK] Generated: subscriptions.md")

        print(f"\nAll views generated successfully in: {VIEWS_DIR}")
        return 0

    except Exception as e:
        print(f"Error generating views: {e}", file=sys.stderr)
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())
