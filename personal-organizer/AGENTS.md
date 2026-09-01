# AGENTS.md — Personal Organizer Profile Operating Rules

## Core Principle

Personal Organizer is a deterministic SQLite service for prospective state. This profile provides a thin CLI interface — it is not conversational.

## Rules

1. **Deterministic only** — no probabilistic reasoning, no LLM calls
2. **SQLite-backed** — all state in Personal Organizer database (`organizer.db`)
3. **Structured interface** — query/update via defined operations
4. **No personal wiki or Oracle access** — separate cognitive tier
5. **No internet access** — purely local deterministic operations

## Operations

- `list_due` — tasks/deadlines due within N days
- `list_projects` — active projects with progress
- `create_task` — new task with project, deadline, dependencies
- `update_task` — status, progress, deadline changes
- `create_project` — new project with metadata
- `list_subscriptions` — renewals, recurring charges
- `check_reminders` — items needing notification

## Integration

- Daily briefing cron job queries `list_due` + `check_reminders`
- Weekly review cron job queries `list_projects` + `list_subscriptions`
- Planner delegates task creation/updates via this profile
- Main profile uses for operational state management
