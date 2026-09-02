# Cron Job Definitions — Autognosia

These are the canonical cron job definitions for Autognosia. Each job is defined with its schedule, purpose, and implementation.

---

## 1. Config Backup (Daily 01:00)

**Purpose**: Git backup of config, profiles, skills, cron to GitHub (Autognosia INSTALL §6)

**Implementation**: Script job using `hermes-config-backup` skill

```yaml
name: "Config Backup"
schedule: "0 1 * * *"
script: "backup_config.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

**Script** (`backup_config.py`):
```python
#!/usr/bin/env python3
import subprocess
import os

AUTOGNOSIA_HOME = os.path.expanduser("${HOME}/.autognosia")
AUTOGNOSIA_REPO = os.path.join(AUTOGNOSIA_HOME, "..", "autognosia")

items = [
    "config.yaml",
    "SOUL.md",
    "profiles/",
    "skills/",
    "cron/",
]

if os.path.exists(AUTOGNOSIA_REPO):
    os.chdir(AUTOGNOSIA_REPO)
    for item in items:
        src = os.path.join(AUTOGNOSIA_HOME, item)
        dst = os.path.join(AUTOGNOSIA_REPO, item)
        if os.path.exists(src):
            subprocess.run(["rsync", "-a", "--delete", src + "/", dst + "/"])

    subprocess.run(["git", "add", "-A"])
    subprocess.run(["git", "commit", "-m", f"Auto-backup: {__import__('datetime').datetime.now().isoformat()}"])
    subprocess.run(["git", "push"])
```

---

## 2. Oracle Index Rebuild (Daily 03:30)

**Purpose**: Rebuild Oracle search index from Active Wiki

**Implementation**: Script job

```yaml
name: "Oracle Index Rebuild"
schedule: "30 3 * * *"
script: "rebuild_oracle_index.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 3. Wiki Lint (Daily 03:30, Weekly Deep on Sun 03:00)

**Purpose**: Find orphans, broken links, stale pages, contradictions in Active Wiki

**Implementation**: Agent job using `wiki-maintenance` skill

```yaml
name: "Wiki Lint (Daily)"
schedule: "30 3 * * *"
prompt: "Run wiki maintenance: find orphans, broken links, and stale pages in the Active Wiki. Report findings."
skills: ["wiki-maintenance"]
enabled_toolsets: ["file", "terminal"]
deliver: "local"
```

```yaml
name: "Wiki Lint (Weekly Deep)"
schedule: "0 3 * * 0"
prompt: "Run full wiki maintenance audit: orphans, broken links, stale pages (>90 days), and contradictions. Generate detailed report."
skills: ["wiki-maintenance"]
enabled_toolsets: ["file", "terminal"]
deliver: "local"
```

---

## 4. Oracle Knowledge Expansion (Daily 02:45)

**Purpose**: Actively expand Oracle's long-term knowledge by analyzing existing Oracle content and using Researcher to learn about related topics, adjacent domains, deeper context, critiques, historical background, and open problems. This is NOT about stale pages (Oracle knowledge like "what Einstein said" doesn't change in 90 days) — it's about knowledge expansion around existing Oracle anchors. Active Wiki content eventually decants to Oracle, so we focus purely on expanding Oracle's knowledge space.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Oracle Knowledge Expansion"
schedule: "45 2 * * *"
script: "fill_oracle_gaps.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

**Script** (`fill_oracle_gaps.py`):
- Extracts key topics/concepts from Oracle wiki (frontmatter tags, titles, Title Case entities)
- Identifies expansion directions: historical context, modern applications, critiques/limitations, related frameworks, key figures, open problems, case studies, prerequisites
- Creates research request packages in `${HOME}/.autognosia/exchange/research/` for Researcher profile
- Researcher picks up via `research-request` skill, researches externally via SearXNG
- Completed research flows to `wiki-ingestion` targeting Oracle wiki
- Max 5 research requests per night

---

## 5. Memory Consolidation (Daily 04:00, Full Cascade Sun 04:00)

**Purpose**: Three-tier cascade — Honcho → Active Wiki → Oracle → Historical Knowledge

**Implementation**: Agent job

```yaml
name: "Memory Consolidation (Daily)"
schedule: "0 4 * * *"
prompt: "Run daily memory consolidation: check hot memory capacity, consolidate warm memory to wiki if >80% full, archive stale wiki pages to historical."
skills: ["wiki-ingestion", "wiki-maintenance"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "local"
```

```yaml
name: "Memory Consolidation (Full Cascade)"
schedule: "0 4 * * 0"
prompt: "Run full three-tier memory cascade: Honcho autobiographical → Active Wiki curated → Oracle specialist → Historical Knowledge archived. Generate cascade report."
skills: ["wiki-ingestion", "wiki-maintenance"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 6. Personal Organizer Reminders (Every 15 minutes)

**Purpose**: Check due tasks, subscriptions, renewals → notify

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Personal Organizer Reminders"
schedule: "*/15 * * * *"
script: "check_reminders.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 7. Intention Check (Daily 08:00)

**Purpose**: Review dormant intentions (prospective memory) → promote if cued

**Implementation**: Agent job

```yaml
name: "Intention Check"
schedule: "0 8 * * *"
prompt: "Check prospective memory for dormant intentions in organizer.db. Review cues (dates, events, context changes) and promote any that are now actionable. Archive expired intentions."
skills: ["prompt-me", "organizer-state"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 7b. Weekday Prompt-Me (Daily 09:00 Mon–Fri)

**Purpose**: Ask one targeted question to sharpen plans, surface blind spots, or challenge thinking

**Implementation**: Agent job with `prompt-me` skill

```yaml
name: "Weekday Prompt-Me"
schedule: "0 9 * * 1-5"
prompt: "Use the prompt-me skill to ask one targeted question. Review recent sessions for context about what's currently at stake. Pick the most impactful single question that helps the user — something they haven't considered, a weak spot in a plan, a missing piece of context. Deliver the question directly to the user via the configured messaging service. Wait for a response before asking another."
skills: ["prompt-me"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 8. Autognosia Health Check (Every 30 minutes)

**Purpose**: Docker services, DB integrity, disk space, Honcho connectivity

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Autognosia Health Check"
schedule: "*/30 * * * *"
script: "health_check.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 9. Daily Briefing (Daily 07:00)

**Purpose**: Personal briefing delivered to user (Main Hermes)

**Implementation**: Agent job

```yaml
name: "Daily Briefing"
schedule: "0 7 * * *"
prompt: "Generate daily briefing: check Personal Organizer for due tasks/deadlines, review calendar, summarize overnight research/wiki changes, check health alerts. Deliver concise briefing to user."
skills: ["organizer-state"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 10. Weekly Review (Weekly Sunday 09:00)

**Purpose**: Weekly summary + project status

**Implementation**: Agent job

```yaml
name: "Weekly Review"
schedule: "0 9 * * 0"
prompt: "Generate weekly review: summarize completed tasks, project progress, wiki changes, research completed, decisions made, upcoming deadlines, subscription renewals. Deliver to user."
skills: ["organizer-state", "wiki-maintenance"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 11. Monthly Systems Review (Monthly 1st 10:00)

**Purpose**: Full systems audit + skill curation

**Implementation**: Agent job

```yaml
name: "Monthly Systems Review"
schedule: "0 10 1 * *"
prompt: |
  You are running a comprehensive monthly systems audit for Autognosia. This is a fresh audit — check everything systematically.

  ## What to Check

  ### 1. Cron Job Health
  - Use `cronjob(action='list')` to list all jobs
  - Check each job's: last_status, last_run_at, next_run_at, repeat.completed
  - Flag: jobs with last_status=error, jobs not run in 7+ days, disabled jobs

  ### 2. Backup Verification
  - Check ${HOME}/.autognosia/backups/ for recent backups
  - Verify backup files are growing and intact
  - Run integrity check script

  ### 3. Memory Tier Health
  - Active Wiki: count pages in ${HOME}/.autognosia/active-wiki/
  - Oracle Wiki: count pages in ${HOME}/.autognosia/oracle/brain/
  - Personal Organizer: query organizer.db for task/project counts
  - Graphify: check graph stats

  ### 4. Infrastructure
  - Docker container health
  - Disk space

  ## Output Format

  Generate a structured report:
  ```
  # Monthly Systems Review — [DATE]

  ## Summary
  - [X] cron jobs total, [Y] healthy, [Z] with issues
  - Backups: [status]
  - Memory tiers: Active Wiki [X] pages, Oracle [Y] pages, Personal Organizer [Z] tasks

  ## Issues Found
  | Severity | Component | Issue | Recommended Action |
  |----------|-----------|-------|-------------------|

  ## Recommendations
  - [ actionable items ]
  ```
skills: ["wiki-maintenance", "organizer-state"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 12. Daily Database Backup (Daily 02:00)

**Purpose**: Transactionally safe SQLite backups with retention

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Database Backup"
schedule: "0 2 * * *"
script: "backup_databases.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 13. Daily Integrity Check (Daily 02:30)

**Purpose**: Verify database integrity and schema

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Integrity Check"
schedule: "30 2 * * *"
script: "integrity_check.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 14. Daily View Generation (Daily 05:00)

**Purpose**: Refresh markdown views from organizer.db

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "View Generation"
schedule: "0 5 * * *"
script: "generate_views.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

---

## 15. Weekly Session Audit (Monday 06:00)

**Purpose**: Review recent sessions for missed knowledge

**Implementation**: Agent job

```yaml
name: "Session Audit"
schedule: "0 6 * * 1"
prompt: |
  Review the last 7 days of session history for missed knowledge:
  1. Identify user decisions not saved to the wiki
  2. Identify preferences expressed but not recorded
  3. Identify troubleshooting results worth preserving
  4. Identify sessions with unresolved issues
  5. Recommend wiki entries to create
  6. Flag sessions with incomplete work

  Generate a concise report with specific recommendations.
skills: ["wiki-ingestion", "wiki-maintenance"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 16. Monthly Persona Audit (15th of month 08:00)

**Purpose**: Verify agent's understanding of user still matches reality

**Implementation**: Agent job

```yaml
name: "Persona Audit"
schedule: "0 8 15 * *"
prompt: |
  Run a monthly persona audit to detect drift:
  1. Read current stored preferences and user model
  2. Scan recent sessions for corrections and preference shifts
  3. Compare stored preferences against actual user behavior
  4. Check if any stored preferences are stale or contradicted
  5. Report persona drift with evidence citations
  6. Recommend updates to the user model
skills: ["wiki-maintenance"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
```

---

## 17. Research Exchange Sync (Weekly 03:00 Wed)

**Purpose**: Sync completed research from exchange directory to wiki

**Implementation**: Agent job

```yaml
name: "Research Exchange Sync"
schedule: "0 3 * * 3"
prompt: "Check research exchange directory (${HOME}/.autognosia/exchange/research) for completed research packages. For each: evaluate quality, verify citations, route approved packages to wiki-ingestion, archive rejected."
skills: ["wiki-ingestion", "research-request"]
enabled_toolsets: ["file", "terminal"]
deliver: "local"
```

---

## 18. Monthly Workflow Suggestion (Monthly 1st 11:00)

**Purpose**: Scan past sessions for repetitive patterns, propose automations

**Implementation**: Agent job

```yaml
name: "Monthly Workflow Suggestion"
schedule: "0 11 1 * *"
timezone: user
prompt: |
  You are conducting a monthly workflow audit. Your job is to find ways to automate repetitive work.

  1. Scan the past month's sessions.
  2. Identify patterns where similar tasks were performed repeatedly:
     - Repeated searches or research on similar topics
     - Recurring manual file operations
     - Status checks done repeatedly
     - Questions asked more than once
     - Reports or summaries compiled manually
  3. Propose 3-5 concrete automations.
skills: ["wiki-maintenance", "organizer-state"]
enabled_toolsets: ["file", "terminal", "memory"]
deliver: "origin"
retry:
  max_attempts: 2
  backoff: [60, 300]
on_failure: "alert"
```

---

## 19. Wiki Lint Deep — Weekly Full Maintenance (Sunday 03:00)

**Purpose**: Comprehensive wiki maintenance: creates missing index.md files, detects duplicate filenames, verifies Agent Zero location, checks Welcome.md/HOW-TO-USE.md placement in oracle root, verifies concepts folder location.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Wiki Lint Deep"
schedule: "0 3 * * 0"
script: "wiki_maintenance.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

**Script** (`wiki_maintenance.py`):
- Creates missing `index.md` files for all wiki domains
- Detects duplicate filenames across wiki (excluding `_archive` and intentional `domains/` duplicates from Agent Zero)
- Verifies Agent Zero content is in `oracle/brain/_archive/agent_zero_kb_import/`
- Verifies `Welcome.md` and `HOW-TO-USE.md` are in `oracle/` root (not `oracle/brain/`)
- Verifies `concepts/` folder is in `oracle/brain/` (not `active-wiki/`)
- Reports total markdown file count and domain count

---

## 20. Session Export Weekly (Sunday 05:00)

**Purpose**: Export completed sessions older than 7 days to structured archival format. Preserves full conversation history with timestamps for long-term retrieval. No data is pruned.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Session Export Weekly"
schedule: "0 5 * * 0"
script: "export_sessions.py"
no_agent: true
enabled_toolsets: ["terminal"]
deliver: "local"
```

**Script** (`export_sessions.py`):
- Queries SessionDB for completed sessions where `ended_at` is >7 days ago and `archived=0`
- Creates export directory per session: `${HOME}/.hermes/archives/sessions/YYYY-MM-DD_{session_id}/`
- Writes `session_metadata.json` with session-level information
- Writes `messages.jsonl` with all messages in JSONL format (one JSON object per line)
- Each message includes: `id`, `role`, `content`, `timestamp`, `tool` (if applicable)
- Reports total sessions exported, total export count, and total archive size

---

## 21. Graphify Refresh (Weekly Sunday 04:00)

**Purpose**: Refresh both knowledge graphs after weekly wiki lint

**Implementation**: Script job

```yaml
name: "Graphify Refresh"
schedule: "0 4 * * 0"
no_agent: true
script: "refresh_graphify.py"
enabled_toolsets: ["terminal"]
deliver: "local"
retry:
  max_attempts: 1
  backoff: [120]
on_failure: "log"
```

---

## 20. Experience Capture (Every 30 min)

**Purpose**: Capture operations from recent sessions to the Experience Index

**Implementation**: Script job

```yaml
name: "Experience Capture"
schedule: "*/30 * * * *"
no_agent: true
script: "capture_experience.py"
enabled_toolsets: ["terminal"]
deliver: "local"
retry:
  max_attempts: 1
  backoff: [60]
on_failure: "log"
```

---

## 21. Autognosia Health & Services Check (Every 30 min)

**Purpose**: Probes Docker service containers, verifies HTTP endpoints (Honcho, Personal Organizer, SearXNG), checks database PRAGMA integrity on `organizer.db` and `autognosia.db`, and verifies disk storage.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Autognosia Health Check"
schedule: "*/30 * * * *"
no_agent: true
script: "health_check.py"
enabled_toolsets: ["terminal"]
deliver: "local"
retry:
  max_attempts: 1
  backoff: [60]
on_failure: "alert"
```

---

## 22. Daily Stack Verification (Daily 08:00)

**Purpose**: High-level morning stack sanity check. Runs `verify_stack.py` to ensure all profiles, CLI tools, and databases remain operational.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Daily Stack Verification"
schedule: "0 8 * * *"
no_agent: true
script: "autognosia_health.py"
enabled_toolsets: ["terminal"]
deliver: "local"
retry:
  max_attempts: 1
  backoff: [120]
on_failure: "alert"
```

---

## 23. Full System Archive (Daily 03:00)

**Purpose**: Creates compressed `.tar.gz` system snapshot of `${HOME}/.autognosia/` and Hermes configuration in `${HOME}/backups/` with rolling 7-day retention.

**Implementation**: Script job (`no_agent: true`)

```yaml
name: "Full System Archive"
schedule: "0 3 * * *"
no_agent: true
script: "autognosia_backup.py"
enabled_toolsets: ["terminal"]
deliver: "local"
retry:
  max_attempts: 1
  backoff: [120]
on_failure: "alert"
```