# Cron Job Setup Instructions — Autognosia

After deploying Autognosia, register these automated jobs with Hermes Agent.

## Prerequisites

- Hermes Agent installed and configured
- Autognosia repository cloned and initialized
- Required skills available (see `skills/` directory)
- Docker services running (SearXNG, Honcho, Personal Organizer)

---

## Quick Setup (Hermes Cron CLI)

Run these commands in your Hermes terminal session:

```bash
# 1. Config Backup (Daily 01:00)
hermes cron create \
  --name "Config Backup" \
  --schedule "0 1 * * *" \
  --script "scripts/backup_config.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 2. Database Backup (Daily 02:00)
hermes cron create \
  --name "Database Backup" \
  --schedule "0 2 * * *" \
  --script "scripts/backup_databases.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 3. Integrity Check (Daily 02:30)
hermes cron create \
  --name "Integrity Check" \
  --schedule "30 2 * * *" \
  --script "scripts/integrity_check.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 4. Oracle Knowledge Expansion (Daily 02:45)
hermes cron create \
  --name "Oracle Knowledge Expansion" \
  --schedule "45 2 * * *" \
  --script "scripts/fill_oracle_gaps.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 5. Oracle Index Rebuild (Daily 03:30)
hermes cron create \
  --name "Oracle Index Rebuild" \
  --schedule "30 3 * * *" \
  --script "scripts/rebuild_oracle_index.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 6. Wiki Lint Daily (Daily 04:00)
hermes cron create \
  --name "Wiki Lint (Daily)" \
  --schedule "0 4 * * *" \
  --prompt "Run wiki maintenance: find orphans, broken links, and stale pages in the Active Wiki. Report findings." \
  --skills wiki-maintenance \
  --enabled-toolsets file,terminal \
  --deliver local

# 7. Wiki Lint Weekly Deep (Sunday 03:00)
hermes cron create \
  --name "Wiki Lint (Weekly Deep)" \
  --schedule "0 3 * * 0" \
  --prompt "Run full wiki maintenance audit: orphans, broken links, stale pages (>90 days), and contradictions. Generate detailed report." \
  --skills wiki-maintenance \
  --enabled-toolsets file,terminal \
  --deliver local

# 8. Memory Consolidation Daily (Daily 04:00)
hermes cron create \
  --name "Memory Consolidation (Daily)" \
  --schedule "0 4 * * *" \
  --prompt "Run daily memory consolidation: check hot memory capacity, consolidate warm memory to wiki if >80% full, archive stale wiki pages to historical." \
  --skills wiki-ingestion,wiki-maintenance \
  --enabled-toolsets file,terminal,memory \
  --deliver local

# 9. Memory Consolidation Full Cascade (Sunday 04:00)
hermes cron create \
  --name "Memory Consolidation (Full Cascade)" \
  --schedule "0 4 * * 0" \
  --prompt "Run full three-tier memory cascade: Honcho autobiographical -> Active Wiki curated -> Oracle specialist -> Historical Knowledge archived. Generate cascade report." \\
  --skills wiki-ingestion,wiki-maintenance \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 10. View Generation (Daily 05:00)
hermes cron create \
  --name "View Generation" \
  --schedule "0 5 * * *" \
  --script "scripts/generate_views.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 11. Personal Organizer Reminders (Every 15 minutes)
hermes cron create \
  --name "Personal Organizer Reminders" \
  --schedule "*/15 * * * *" \
  --script "scripts/check_reminders.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 12. Autognosia Health Check (Every 30 minutes)
hermes cron create \
  --name "Autognosia Health Check" \
  --schedule "*/30 * * * *" \
  --script "scripts/health_check.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 13. Daily Briefing (Daily 07:00)
hermes cron create \
  --name "Daily Briefing" \
  --schedule "0 7 * * *" \
  --prompt "Generate daily briefing: check Personal Organizer for due tasks/deadlines, review calendar, summarize overnight research/wiki changes, check health alerts. Deliver concise briefing to user." \
  --skills organizer-state \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 14. Intention Check (Daily 08:00)
hermes cron create \
  --name "Intention Check" \
  --schedule "0 8 * * *" \
  --prompt "Check prospective memory for dormant intentions in organizer.db. Review cues and promote any actionable intentions." \
  --skills prompt-me,organizer-state \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 15. Weekday Prompt-Me (Mon-Fri 09:00)
hermes cron create \
  --name "Weekday Prompt-Me" \
  --schedule "0 9 * * 1-5" \
  --prompt "Use the prompt-me skill to ask one targeted question to optimize operations and eliminate execution friction." \
  --skills prompt-me \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 16. Weekly Review (Sunday 09:00)
hermes cron create \
  --name "Weekly Review" \
  --schedule "0 9 * * 0" \
  --prompt "Generate weekly review: summarize completed tasks, project progress, wiki changes, research completed, decisions made, upcoming deadlines, subscription renewals. Deliver to user." \
  --skills organizer-state,wiki-maintenance \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 17. Monthly Systems Review (1st of month 10:00)
hermes cron create \
  --name "Monthly Systems Review" \
  --schedule "0 10 1 * *" \
  --prompt "Run monthly systems audit: verify cron jobs, backup integrity, skill usage, memory tier health, Docker containers, and disk space." \
  --skills wiki-maintenance,organizer-state \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 18. Research Exchange Sync (Wednesday 03:00)
hermes cron create \
  --name "Research Exchange Sync" \
  --schedule "0 3 * * 3" \
  --prompt "Check research exchange directory (${HOME}/.autognosia/exchange/research) for completed research packages. For each: evaluate quality, verify citations, route approved packages to wiki-ingestion, archive rejected." \
  --skills wiki-ingestion,research-request \
  --enabled-toolsets file,terminal \
  --deliver local

# 19. Graphify Refresh (Sunday 04:00)
hermes cron create \
  --name "Graphify Refresh" \
  --schedule "0 4 * * 0" \
  --script "scripts/refresh_graphify.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 20. Experience Capture (Every 30 min)
hermes cron create \
  --name "Experience Capture" \
  --schedule "*/30 * * * *" \
  --script "scripts/capture_experience.py" \
  --no-agent \
  --enabled-toolsets terminal \
  --deliver local

# 21. Session Audit (Monday 06:00)
hermes cron create \
  --name "Session Audit" \
  --schedule "0 6 * * 1" \
  --prompt "Review the last 7 days of session history for missed knowledge: identify user decisions not saved to wiki, preferences not recorded, troubleshooting results worth preserving, and sessions with unresolved issues. Generate a concise report with specific recommendations." \
  --skills wiki-ingestion,wiki-maintenance \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 22. Persona Audit (15th of month 08:00)
hermes cron create \
  --name "Persona Audit" \
  --schedule "0 8 15 * *" \
  --prompt "Run monthly persona audit: read current stored preferences and user model, scan recent sessions for corrections and preference shifts, compare stored preferences against actual user behavior, check for stale or contradicted preferences. Report persona drift with evidence citations and recommend updates." \
  --skills wiki-maintenance \
  --enabled-toolsets file,terminal,memory \
  --deliver origin

# 23. Workflow Suggestion (1st of month 11:00)
hermes cron create \
  --name "Monthly Workflow Suggestion" \
  --schedule "0 11 1 * *" \
  --prompt "Conduct monthly workflow audit: scan past month sessions for repetitive patterns (repeated searches, recurring manual file operations, repeated status checks, questions asked more than once, manually compiled reports). Propose 3-5 concrete automations." \
  --skills wiki-maintenance,organizer-state \
  --enabled-toolsets file,terminal,memory \
  --deliver origin
```

---

## Verification

Verify registered jobs:

```bash
hermes cron list
```