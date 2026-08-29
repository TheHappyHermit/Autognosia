---
name: cron-job-management
description: "Manage cron jobs: model pin, scheduling, troubleshooting."
category: hermes-troubleshooting
created: 2026-08-07
---

# Cron Job Management

Use when creating, debugging, rescheduling, or auditing Hermes cron jobs. Covers model routing failures, config drift, backup verification, and diagnostics.

## Triggers

- Cron job fails or routes to wrong model
- Need to create or modify a scheduled job
- Config drift blocks job execution
- Verifying backup cron health
- Auditing schedules against model availability

## Model Routing Gotcha

The `cronjob` tool does not accept a `model` parameter on create or update. When `model: null` in `jobs.json`, the system activates a hardcoded OpenRouter fallback even if a local model is online.

### Fix: Pin model in jobs.json directly

```python
import json, pathlib
jobs = json.loads(pathlib.Path("~/.hermes/cron/jobs.json").expanduser().read_text())
for job in jobs:
    if job.get("prompt"):  # agent-based jobs only
        job["model"] = "qwen/qwen3.6-27b"
        job["enabled_toolsets"] = ["web", "terminal", "file", "delegation"]
pathlib.Path("~/.hermes/cron/jobs.json").expanduser().write_text(json.dumps(jobs, indent=2))
```

Always set `enabled_toolsets` alongside `model` to reduce token overhead.

### Verify pinning

```python
import json, pathlib
jobs = json.loads(pathlib.Path("~/.hermes/cron/jobs.json").expanduser().read_text())
for j in jobs:
    if j.get("prompt"):
        print(f"  {j['name']}: model={j.get('model', 'NULL')}")
```

## Schedule Alignment

Local model runs Mon-Fri 07:30-14:00 PT only. Jobs outside this window fail silently.

Examples: `30 7 * * 1-5` (7:30 AM), `0 13 * * 1-5` (1:00 PM).

## Config Drift Safety Guard

Jobs created under an old config can be blocked by a config drift check. Fix: delete and recreate the job so it inherits the current config baseline.

## Backup Verification

Daily backup cron writes to `~/backups/`. Check:

```bash
ls -lt ~/backups/ | head -5
```

Both `holographic_*.db` and `organizer_*.db` should appear.

## Emergency Backup Pruning

State.db emergency backups at `~/.hermes/state.db.pre-update-emergency-*.bak` (~34 MB each). Keep only the latest:

```bash
ls -t ~/.hermes/state.db.pre-update-emergency-*.bak | tail -n +2 | xargs rm
```

## Memory Vacuum Safety

Session vacuum/prune only affects `state.db` (conversation history, 90-day retention). Never touches holographic.db, fact_store.db, or organizer.db. These are separate databases with their own daily backup cron.

## Diagnostic Checklist

1. Job not running? Check schedule vs model availability window
2. Wrong model? Check jobs.json for null model and pin explicitly
3. Config drift error? Delete and recreate the job
4. Tool timeout? Split large payloads into smaller calls
5. Backup missing? Check `~/backups/`
6. Script-only job silent? Empty stdout means no delivery

## Pitfall: Cron Prompt References Missing Skill

When a cron job's prompt says "Use the X skill" but no skills are attached (`skills: []` in jobs.json), the agent will **improvise** — creating temporary Python scripts in `/tmp` to do the work, then deleting them. This produces a recurring trail of stale temp files like:

```
/tmp/hermes-verify-briefing.py
/tmp/check_organizer.py
/tmp/briefing_data.py
/tmp/briefing_wiki.py
```

Each day's cron run generates different script names because the agent is guessing at implementation.

**Diagnosis:**
1. `cronjob list` → check a job's `skills` field (should be empty only when the prompt doesn't reference skills)
2. Read the cron prompt — does it say "Use the X skill"?
3. Check `/tmp/` and `~/.hermes/` for stale `*.py` files with recent timestamps that match the cron schedule
4. Search cron output for patterns like "temporary scripts I created and deleted", "Cleanup pending approval", "ad-hoc data-gathering scripts"

**Fix options (pick one):**
- **A. Attach the skill:** If the referenced skill exists in the library, `cronjob update <id> skills="[skill-name]"` so the cron gets proper instructions.
- **B. Update the prompt:** Rewrite the cron prompt to not reference a missing skill. Use direct terminal commands instead of "Use the X skill" language.
- **C. Create the skill:** If the skill doesn't exist, create `organizer-state/SKILL.md` (or whatever skill is referenced) with clear step-by-step instructions the cron agent can follow.
- **D. Pause the job:** If the job is producing noise without value, pause it with `cronjob pause <id>`.

**Prevention:** Before creating a cron job, verify that any skills it references actually exist in `~/.hermes/skills/`. A cron with `skills: []` but a prompt referencing a skill is a recipe for daily temp file creation.