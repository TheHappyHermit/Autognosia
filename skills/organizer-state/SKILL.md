---
name: organizer-state
version: 2.1.0
description: >
  Manage organizer.db tasks, projects, subscriptions, and records.
  Use for CRUD operations on operational state and generate daily briefings.
category: productivity
---

# Organizer State Skill

## Purpose

Manage the organizer database for tasks, projects, subscriptions, and records.
Generate daily briefings from organizer state without creating temporary scripts.

## Database Paths

Two organizer databases exist at the same schema level:

| Database | Path | Extra Tables |
|----------|------|--------------|
| personal-organizer | `${HOME}/.autognosia/personal-organizer/data/organizer.db` | `reminders` |
| personal-state | `${HOME}/.autognosia/personal-state/data/organizer.db` | — |

Resolve the path as:
1. `ORGANIZER_DB_PATH` environment variable (if set)
2. Default: `${HOME}/.autognosia/personal-organizer/data/organizer.db`

### Custom Path Override

```bash
export ORGANIZER_DB_PATH="/custom/path/to/organizer.db"
```

## Database Schema (SQLite)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tasks` | Task items | `id`, `title`, `description`, `status`, `priority`, `due_at`, `completed_at`, `project_id` |
| `projects` | Projects | `id`, `name`, `description`, `status` |
| `subscriptions` | Billing | `id`, `name`, `amount`, `currency`, `billing_cycle`, `next_billing_date` |
| `important_dates` | Calendar events | `id`, `title`, `date`, `description` |
| `intentions` | Prospective memory | `id`, `title`, `cue`, `action`, `status`, `triggered_at` |
| `waiting_states` | Awaiting external | `id`, `title`, `waiting_for`, `follow_up_date`, `status` |
| `reminders` | Notification targets | `id`, `title`, `remind_at`, `channel`, `target_destination`, `status`, `recurring_rule` |

All tables have `created_at` and `updated_at` timestamp columns.

## Workflow

### 1. Read State

Query the database for current state:

```python
import sqlite3
import os
from datetime import datetime, timedelta

db_path = os.environ.get("ORGANIZER_DB_PATH",
                         os.path.expanduser("${HOME}/.autognosia/personal-organizer/data/organizer.db"))
conn = sqlite3.connect(db_path)

# Open tasks
tasks = conn.execute("""
    SELECT id, title, status, priority, due_at, project_id
    FROM tasks WHERE status != 'completed'
    ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
             due_at
""").fetchall()
```

### 2. Update State

Create, update, or complete records:

```python
conn.execute("""
    INSERT INTO tasks (title, status, priority, due_at, project_id)
    VALUES (?, ?, ?, ?, ?)
""", ("New task", "next", "high", "2026-09-01", 1))
conn.commit()
```

### 3. Generate Views

Refresh markdown views from the database using `generate_views.py` if available.

### 4. Audit Changes

Log significant state changes in the audit log:

```python
conn.execute("""
    INSERT INTO audit_log (action, details, timestamp)
    VALUES (?, ?, ?)
""", ("task_completed", "Task X completed", datetime.now().isoformat()))
conn.commit()
```

## Daily Briefing Generation

### When to Use

Use this workflow when generating a daily briefing (cron job at 07:00 daily, or ad-hoc request).
The briefing consolidates Personal State, overnight wiki changes, system health, and cron status.

### Briefing Procedure

**Step 1: Query Personal State from both databases**

```python
import sqlite3
import os
from datetime import datetime, timedelta

now = datetime.now()
yesterday = now - timedelta(hours=24)

dbs = [
    '${HOME}/.autognosia/personal-organizer/data/organizer.db',
    '${HOME}/.autognosia/personal-state/data/organizer.db',
]

for db_path in dbs:
    if not os.path.exists(db_path):
        continue
    conn = sqlite3.connect(db_path)
    
    # Active tasks (not completed)
    tasks = conn.execute("""
        SELECT id, title, description, status, priority, due_at
        FROM tasks WHERE status != 'completed'
        ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END
    """).fetchall()
    
    # Active projects
    projects = conn.execute(
        "SELECT name, description, status FROM projects WHERE status != 'completed'"
    ).fetchall()
    
    # Subscriptions (next 30 days)
    subs = conn.execute("""
        SELECT name, amount, currency, next_billing_date, billing_cycle
        FROM subscriptions
        WHERE next_billing_date IS NOT NULL
          AND next_billing_date <= date('now', '+30 days')
        ORDER BY next_billing_date
    """).fetchall()
    
    # Important dates (this week)
    dates = conn.execute("""
        SELECT title, date, description
        FROM important_dates
        WHERE date >= date('now') AND date <= date('now', '+7 days')
        ORDER BY date
    """).fetchall()
    
    # Intentions (active)
    intentions = conn.execute(
        "SELECT title, cue, action FROM intentions WHERE status = 'active'"
    ).fetchall()
    
    # Waiting states (active)
    waiting = conn.execute(
        "SELECT title, waiting_for, follow_up_date FROM waiting_states WHERE status = 'active'"
    ).fetchall()
    
    # Reminders (pending)
    reminders = conn.execute("""
        SELECT title, remind_at, channel, target_destination
        FROM reminders WHERE status = 'pending'
        ORDER BY remind_at
    """).fetchall()
    
    conn.close()
```

**Step 2: Check overnight wiki changes**

```python
from pathlib import Path
from datetime import timedelta

autognosia = Path("${HOME}/.autognosia")
active_wiki = autognosia / "active-wiki"
oracle_brain = autognosia / "oracle" / "brain"

# Files modified in last 24h
recent_wiki = [
    str(f.relative_to(active_wiki))
    for f in active_wiki.rglob("*")
    if f.is_file() and f.stat().st_mtime > yesterday.timestamp()
]

recent_oracle = [
    str(f.relative_to(oracle_brain))
    for f in oracle_brain.rglob("*")
    if f.is_file() and f.stat().st_mtime > yesterday.timestamp()
]
```

**Step 3: Check system health**

```python
import subprocess

# Disk space
disk = subprocess.run(["df", "-h", "/"], capture_output=True, text=True)

# Docker containers
docker = subprocess.run(["docker", "ps"], capture_output=True, text=True)

# GBrain status
gbrain = subprocess.run(["gbrain", "status"], capture_output=True, text=True)

# Recent cron logs
cron_log = Path.home() / ".hermes" / "cron.log"
```

**Step 4: Format the briefing**

Deliver as a structured markdown report with sections:
- Personal State (tasks, projects, subscriptions, intentions, waiting, dates)
- Overnight Activity (wiki changes, oracle updates)
- System Health (disk, Docker, GBrain, cron status)
- Recommended Actions (prioritized items)

### Critical Rule

**Never create temporary Python scripts (`check_*.py`, `briefing_*.py`, `tmp_*.py`) in `/tmp` or `~` to gather briefing data.**
All data gathering must be done inline within the skill using the procedures above.
This prevents stale file accumulation and the "file mutation verifier" warnings.

## Security

- Never expose database credentials or connection strings in output
- Use parameterized queries to prevent SQL injection
- Back up before bulk operations
- Do not write temporary scripts to disk — inline all queries

## Attribution

The Personal State database schema and organizer architecture are based on
**Google's Person Index / Personal State Management** concepts, where
personal data is organized into structured tables (tasks, projects, subscriptions,
intentions, waiting states) rather than unstructured notes or files.
This structured approach to personal information management draws inspiration
from Google's research into personal search and state management systems.
