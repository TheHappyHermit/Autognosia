# SETUP.md — Autognosia Detailed Configuration

This document details configuration of profiles, cron jobs, schemas, and memory tiers.

---

## 1. How Hermes Auto-Setup Works

When you tell Hermes to set up the Autognosia from the repository, Hermes follows this sequence:

1. **Clone** the repository to a temporary location
2. **Read** `config/paths.yaml` to understand the directory structure
3. **Create** all directories under `${HOME}/.autognosia/` (wiki, oracle, personal-organizer, backups, exchange, logs)
4. **Initialize databases** by running `scripts/init_db.py` and `scripts/init_autognosia_db.py` with `--yes`
5. **Copy** `docker/.env.example` to `docker/.env` and auto-fill Honcho LLM settings from Hermes's own provider config
6. **Generate** `SEARXNG_SECRET` using `openssl rand -hex 32`
7. **Start** Docker services in order: SearXNG → Honcho → Personal Organizer → GBrain
8. **Verify** each service with health check endpoints
9. **Register** cron jobs from `cron-jobs/definitions.md`
10. **Run** acceptance tests (`tests/run_tests.sh`)

If any step fails, Hermes stops and reports the issue. You can then fix it and resume.

---

## 2. Specialist Profiles

Autognosia implements cognitive division of labor across specialized profiles.

### Default (Main Hermes)
- **Role:** Executive workspace and metacognitive router.
- **Memory:** Uses Honcho for autobiographical memory and Active Wiki for crystallized facts.
- **Rule:** NEVER searches the internet directly; all search tasks are routed to the Researcher profile.

### Oracle
- **Role:** Long-term reference librarian, historian, and retrieval specialist.
- **Memory:** Queries GBrain graph/hybrid vector index and Oracle historical vault.
- **Rule:** Read-only for Personal Organizer tasks; returns compressed evidence packages with citations.

### Researcher
- **Role:** Internet research specialist operating via local SearXNG.
- **Rule:** All web findings are considered untrusted evidence until verified and synthesized.

### Planner
- **Role:** Strategic task decomposition, dependency planning, and pre-mortem analysis.
- **Rule:** Generates verifiable acceptance criteria and checkpoints for each milestone.

### Auditor
- **Role:** Ambiguous evaluation, claim verification, and epistemic dispute resolution.
- **Rule:** Reality outranks narration; observed postconditions are strictly required.

### Personal Organizer
- **Role:** Thin CLI interface to the deterministic SQLite `organizer.db`.
- **Rule:** Deterministic execution without probabilistic hallucinations.

---

## 3. Cron Jobs

See [`cron-jobs/definitions.md`](cron-jobs/definitions.md) for canonical specifications and [`cron-jobs/setup-instructions.md`](cron-jobs/setup-instructions.md) for registration commands.

| # | Time | Job | Type | Purpose |
|---|------|-----|------|---------|
| 1 | 01:00 | Config backup | Script | Git backup of config, profiles, skills |
| 2 | 02:00 | Database backup | Script | Transactional SQLite backup with retention |
| 3 | 02:30 | Integrity check | Script | PRAGMA check + foreign key validation |
| 4 | 02:45 | Oracle knowledge expansion | Script | Active expansion of Oracle long-term knowledge via Researcher |
| 5 | 03:30 | Oracle index rebuild | Script | Sync Active Wiki updates to Oracle vault |
| 6 | 04:00 (Daily) / 03:00 (Sun) | Wiki lint | Agent | Broken links, orphan pages, stale detection |
| 7 | 04:00 (Daily) / 04:00 (Sun) | Memory consolidation | Agent | Three-tier cascade pass (Hot -> Warm -> Cold) |
| 8 | 05:00 | View generation | Script | Generate markdown projections (`tasks.md`, `projects.md`) |
| 9 | 06:00 (Mon) | Session audit | Agent | Extract uncaptured decisions and preferences |
| 10 | 07:00 | Daily briefing | Agent | Deliver daily priorities and reminders |
| 11 | 08:00 | Intention check | Agent | Evaluate prospective memory triggers |
| 12 | 08:00 (15th) | Persona audit | Agent | Detect preference drift and update user model |
| 13 | 09:00 (Mon-Fri) | Weekday prompt-me | Agent | Socratic active learning question |
| 14 | 09:00 (Sun) | Weekly review | Agent | Weekly task and project retrospection |
| 15 | 10:00 (1st) | Monthly systems review | Agent | Comprehensive health and infrastructure audit |
| 16 | 11:00 (1st) | Workflow suggestion | Agent | Scan sessions and propose automations |
| 17 | 03:00 (Wed) | Research sync | Agent | Ingest completed research packages into wiki |
| 18 | 04:00 (Sun) | Graphify refresh | Script | Refresh semantic knowledge graphs (both Active Wiki and Oracle Wiki) |
| 19 | 03:00 (Sun) | Wiki lint deep | Script | Full wiki maintenance: missing index.md, duplicates, structural checks |
| 20 | 05:00 (Sun) | Session export | Script | Export completed sessions >7 days old to structured archival format |
| 21 | */15 min | Reminders | Script | Check due tasks and upcoming renewals |
| 22 | */30 min | Health check | Script | Check containers, disks, and databases |
| 23 | */30 min | Experience capture | Script | Log operations into Experience Index (`autognosia.db`) |

---

## 4. Active Wiki Structure

Active Wiki resides at `${HOME}/.autognosia/active-wiki/`:

```text
active-wiki/
├── projects/
├── reference/
├── system/
├── personal/
└── .meta/
    ├── ingestion-log.md
    └── content-hashes.json
```

### Frontmatter Schema (Standard Mode)

```yaml
---
id: auto-uuid
title: Descriptive Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: evergreen | temporal | historical
tags: [tag1, tag2]
source: session:YYYYMMDD_HHMMSS
---
```

---

## 5. Personal Organizer Database Schema (`organizer.db`)

Location: `${HOME}/.autognosia/personal-organizer/data/organizer.db`

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    due_at TEXT,
    completed_at TEXT,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    dependency_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT DEFAULT 'monthly',
    next_billing_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'paused')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

---

## 6. Experience Index Schema (`autognosia.db`)

Location: `${HOME}/.autognosia/autognosia.db`

Tracks operational traces, verification outcomes, routing accuracy, and reflections:
- `operations` — Discrete actions taken by agents.
- `verification_checks` — Objective checks comparing expected vs observed state.
- `routing_events` — Profile routing decisions and confidence.
- `skill_events` — Skill invocation outcomes and latencies.
- `reflections` — Learned operational lessons and heuristics.
- `key_decisions` — Architectural and strategic choices.
- `prospective_log` — Prospective intention trigger history.

---

## 7. Three-Tier Memory Architecture

The Autognosia uses a three-tier memory cascade. See [`architecture/THREE-TIER-MEMORY.md`](architecture/THREE-TIER-MEMORY.md) for the full architecture.

**Quick summary:**
- **Hot** (~2200 chars): Always-loaded persistent memory for active context
- **Warm** (Honcho + Graphify): On-demand autobiographical memory and semantic relationships
- **Cold** (wiki): Unlimited filesystem-backed markdown with full provenance

Information flows downward through consolidation, never disappearing. Old ≠ wrong.

---

## 8. Research Protocol

All internet research is delegated to the Researcher profile. See [`architecture/RESEARCH-PROTOCOL.md`](architecture/RESEARCH-PROTOCOL.md) for the full protocol.

**Key rules:**
1. Default profile NEVER searches the internet directly
2. Research results are untrusted evidence until verified
3. Every answer must be source-backed with citations
4. Researcher is isolated — no access to personal data
