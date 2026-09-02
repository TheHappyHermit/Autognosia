# Cron Job Architecture

Cron jobs are the heartbeat of the Autognosia system. They run automated maintenance, backups, health checks, and memory consolidation on a schedule.

## Design Principles

- **Retry logic:** Agent jobs retry up to 2 times on failure with exponential backoff (1min, 5min). Script jobs retry once immediately. After max retries, alert the user.
- **Timezone awareness:** All agent jobs use the user's configured timezone (`TZ` env var or `timezone` field). Server time is only for script jobs.
- **Silent on success:** Jobs that succeed don't notify the user. Only failures or actionable output triggers notification.
- **User-facing jobs deliver** — Briefings and reviews deliver to the user. Maintenance jobs save locally.
- **Retention policies** — Backups and reports auto-prune old files.
- **Staggered schedule** — Jobs are spaced to avoid resource collisions.

## Retry Logic

### Agent Jobs (LLM-powered)
- **Max retries:** 2
- **Backoff:** 1 minute, then 5 minutes
- **After max retries:** Alert user with failure details and suggestion to run manually

### Script Jobs (deterministic)
- **Max retries:** 1 (immediate)
- **After max retries:** Log error; if critical (backup, health), alert user

### Retry Configuration Example
```yaml
name: "Memory Consolidation (Daily)"
schedule: "0 4 * * *"
retry:
  max_attempts: 2
  backoff: [60, 300]  # seconds
on_failure: "alert"  # alert | ignore | log
```

---

## Cron Job Schedule

| Time | Job | Type | Script / Implementation | Purpose |
|------|-----|------|-------------------------|---------|
| 01:00 | Config backup | Script | `backup_config.py` | Git backup of config, profiles, skills, cron |
| 02:00 | Database backup | Script | `backup_databases.py` | Granular SQLite retention backup (14 daily, 8 weekly, 12 monthly) |
| 02:30 | Integrity check | Script | `integrity_check.py` | Verify DB consistency, foreign keys, and schema |
| 03:00 | Full system archive | Script | `autognosia_backup.py` | Compressed `.tar.gz` system archive in `${HOME}/backups/` (7-day retention) |
| 03:30 | Oracle index rebuild | Script | `rebuild_oracle_index.py` | Rebuild Oracle search index |
| 03:00 (Sun) | Wiki lint (deep) | Agent | `wiki-maintenance` | Full wiki audit: orphans, broken links, stale pages |
| 04:00 | Memory consolidation | Agent | Built-in | Three-tier cascade consolidation pass |
| 05:00 | View generation | Script | `generate_views.py` | Refresh markdown views from organizer.db |
| 06:00 (Mon) | Session audit | Agent | `wiki-ingestion` | Review recent sessions for missed knowledge |
| 07:00 | Daily briefing | Agent | Built-in | Personal briefing delivered to user |
| 08:00 | Stack verification | Script | `autognosia_health.py` | Daily morning verification |
| 08:00 (15th) | Persona audit | Agent | `wiki-maintenance` | Verify agent's understanding matches reality |
| 09:00 (Mon–Fri) | Prompt-me | Agent | `prompt-me` | Ask one targeted question to sharpen plans |
| 09:00 (Sun) | Weekly review | Agent | Built-in | Weekly summary with task/project status |
| 10:00 (1st) | Monthly systems review | Agent | `wiki-maintenance` | Full systems audit |
| 11:00 (1st) | Workflow suggestion | Agent | `organizer-state` | Scan sessions, propose automations |
| 04:00 (Sun) | Graphify refresh | Script | `refresh_graphify.py` | Refresh knowledge graphs |
| */30 | Experience capture | Script | `capture_experience.py` | Capture operations to Experience Index |
| */30 | Health check | Script | `health_check.py` | Probes Docker containers, HTTP endpoints, SQLite integrity, disk |
| */15 | Reminders | Script | `check_reminders.py` | Check due tasks, subscriptions, renewals |
| 08:00 | Intention check | Agent | `prospective-memory` | Review dormant intentions |
| 03:00 (Wed) | Research sync | Agent | `research-request` | Sync research exchange with wiki |

## Key Patterns

### Agent Jobs
Use `enabled_toolsets` to limit tools. Example:
```yaml
enabled_toolsets: ["file", "terminal", "memory"]
```

### Script Jobs
Use `no_agent: true` for pure automation. Example:
```yaml
script: backup_databases.py
no_agent: true
enabled_toolsets: ["terminal"]
```

### Delivery
- `"origin"` — Delivers back to the user's chat
- `"local"` — Saves to files only (silent)
- `"all"` — Fans out to all connected platforms

---

## Where to Find Cron Job Definitions

- **Job specifications:** [`definitions.md`](./definitions.md) — Full YAML definitions for all 23 cron jobs
- **Setup instructions:** [`setup-instructions.md`](./setup-instructions.md) — Step-by-step registration commands
- **Schedule overview:** [`SETUP.md`](../SETUP.md) — Table of all cron jobs with timing and purpose
