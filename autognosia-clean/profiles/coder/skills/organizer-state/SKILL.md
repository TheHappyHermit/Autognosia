---
name: organizer-state
version: 2.0.0
description: >
  Manage organizer.db tasks, projects, subscriptions, and records.
  Use for CRUD operations on operational state.
---

# Organizer State Skill

## Purpose

Manage the organizer database for tasks, projects, subscriptions, and records.

## Database Path (Cross-Platform)

The organizer database path is resolved in this order:
1. `ORGANIZER_DB_PATH` environment variable (if set)
2. Default: `~/.autognosia/personal-state/data/organizer.db`

This works on Linux, macOS, and Windows because `~` expands to the user's home directory on all three platforms.

### Creating the Database Directory

```bash
# Cross-platform directory creation
mkdir -p ~/.autognosia/personal-state/data
```

### Custom Path Override

```bash
export ORGANIZER_DB_PATH="/custom/path/to/organizer.db"
```

## Workflow

### 1. Read State

Query the database for current state:
```python
import sqlite3
import os

db_path = os.environ.get("ORGANIZER_DB_PATH", 
                         os.path.expanduser("~/.autognosia/personal-state/data/organizer.db"))
conn = sqlite3.connect(db_path)
tasks = conn.execute("SELECT * FROM tasks WHERE status != 'completed'").fetchall()
```

### 2. Update State

Create, update, or complete records:
```python
conn.execute("INSERT INTO tasks (title, status, priority) VALUES (?, ?, ?)",
             ("New task", "next", "high"))
conn.commit()
```

### 3. Generate Views

Refresh markdown views from the database using `generate_views.py`.

### 4. Audit Changes

Log significant state changes in the audit log:
```python
conn.execute("INSERT INTO audit_log (action, details, timestamp) VALUES (?, ?, ?)",
             ("task_completed", "Task X completed", datetime.now().isoformat()))
conn.commit()
```

## Database Schema

Key tables:
- `tasks` — Tasks with status, priority, deadlines
- `projects` — Projects with status and definitions of done
- `subscriptions` — Active subscriptions with billing info
- `purchases` — Purchase records with receipts
- `shipments` — Tracking info for orders
- `warranties` — Warranty coverage records
- `audit_log` — Change history

## Security

- Never expose database credentials
- Use parameterized queries to prevent SQL injection
- Back up before bulk operations
