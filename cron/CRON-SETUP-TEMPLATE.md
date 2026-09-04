# Cron Jobs — Setup Template

`cron/jobs.json` is **runtime state, not source**. It is deliberately
untracked (see `.gitignore`) because it accumulates machine-specific values:
absolute home paths, a Telegram chat id, per-run timestamps, `next_run_at`
claims, and failure counters. Publishing it leaks PII and would hand a new
install another machine's schedule history.

This document is the portable replacement. It describes every job Autognosia
expects so a fresh Hermes can recreate the schedule correctly on the first try.

## How to create these

Do **not** hand-write `jobs.json`. Hermes owns that file's schema (there are
~35 fields per job, including scheduler bookkeeping). Create jobs through the
agent so the fields are generated correctly:

```
cronjob(action='create', name='...', schedule='...', prompt='...',
        script='...', no_agent=True, deliver='local')
```

Verify afterwards with `cronjob(action='list')`.

## Conventions that matter

- **`no_agent: true` when a script produces the final output.** The scheduler
  runs the script and delivers stdout verbatim, spending no tokens. Use it for
  every deterministic maintenance job below. Only use an LLM job when the task
  genuinely needs reasoning.
- **Empty stdout means silent.** A `no_agent` job that prints nothing sends
  nothing. Design watchdogs to stay quiet unless there is something to report.
- **Do NOT set `workdir` unless the job truly needs a project directory.**
  A `workdir` job takes the `TERMINAL_CWD` write lock and serialises cron. In
  this deployment a single job carrying an unnecessary `workdir` caused
  `TimeoutError: Timed out waiting for the TERMINAL_CWD read lock after 660s`
  on four unrelated jobs.
- **Never pin a model that differs from the global config.** Pinned jobs get
  skipped with `[drift_skip:silent]` once global inference config changes.
  Leave `model`/`provider` unset to inherit the fallback chain.
- **Scripts live in `$HOME/.autognosia/scripts/`** (or `$HOME/.hermes/scripts/`).
  A relative `script` value resolves against those directories.
- **Stagger heavy LLM jobs.** Local inference has limited slots; overlapping
  research batches cause request timeouts, not just slowness.

## Expected jobs

Times are local. `deliver: local` writes to `~/.hermes/cron/output/`;
`origin` returns to the chat that created the job.

### Health & backup (script-only, no tokens)

| Name | Schedule | Script | Deliver |
|---|---|---|---|
| Daily Backup | `0 3 * * *` | `autognosia_backup.py` | local |
| Database Backup | `0 2 * * *` | `backup_databases.py` | local |
| Integrity Check | `30 2 * * *` | `integrity_check.py` | local |
| Daily Health Check | `0 8 * * *` | `autognosia_health.py` | local |
| Autognosia Health Check | `*/30 * * * *` | `autognosia_health.py` | local |
| Config Backup | `0 1 * * *` | — (rsync prompt) | local |

### Knowledge base

| Name | Schedule | Script | Deliver |
|---|---|---|---|
| Brain Sync (active-wiki + exchange) | `every 60m` | `brain_sync_cron.py --sources active-wiki exchange-research` | local |
| Brain-Sync Oracle (monthly) | `0 2 1 * *` | `brain_sync.py --source oracle-brain` | origin |
| Oracle Index Rebuild | `30 3 * * *` | `oracle_index_rebuild.py` | local |
| Graphify Refresh | `0 4 * * 0` | `refresh_graphify.py` | local |
| Graphify Progress Monitor | `0 10 * * *` | `verify_graphify_integrity.py` | origin |
| Wiki Lint Daily | `0 4 * * *` | — | local |
| Wiki Lint Weekly Deep | `0 3 * * 0` | `wiki_maintenance.py` | local |
| Nightly raw inbox processing | `0 8 * * 1-5` | — (skills: capture-and-triage, wiki-maintenance) | local |
| Daily Gmail Subscription Scan | `0 7 * * *` | — (skill: google-workspace) | telegram |

### Memory

| Name | Schedule | Script | Deliver |
|---|---|---|---|
| Memory Consolidation Daily | `0 4 * * *` | — | local |
| Memory Consolidation Full Cascade | `0 4 * * 0` | — | origin |
| Experience Capture | `*/30 * * * *` | `capture_experience.py` | local |
| Session Export Weekly | `0 5 * * 0` | `export_sessions.py` | local |
| Session Audit | `0 6 * * 1` | — | origin |

### Personal ops

| Name | Schedule | Script | Deliver |
|---|---|---|---|
| Personal State Reminders | `*/15 * * * *` | `check_reminders.py` | local |
| Personal Ops Intention Check | `every 60m` | — | local |
| Daily Briefing | `0 7 * * *` | — (skill: organizer-state) | origin |
| Intention Check | `0 8 * * *` | — | origin |
| View Generation | `0 5 * * *` | `generate_views.py` | local |

### Research (heavy — stagger these)

| Name | Schedule | Deliver |
|---|---|---|
| Oracle Knowledge Expansion (batch 0–4) | `45 0,1,2,3,4 * * *` | local |
| Frontier Research Lane A | `0 * * * *` | local |
| Frontier Research Lane B | `30 * * * *` | local |
| Research Exchange Sync | `0 3 * * 3` | local |

Lanes A/B are **paused by default**. Enable only when the inference box has
spare capacity; they are the most likely source of request timeouts.

### Reviews & digests

| Name | Schedule | Deliver |
|---|---|---|
| Morning Newsletter | `0 6 * * *` | telegram |
| Evening Newsletter | `0 21 * * *` | telegram |
| Weekday Prompt-Me | `0 9 * * 1-5` | origin |
| Weekly Review | `0 9 * * 0` | origin |
| Monthly Systems Review | `0 10 1 * *` | origin |
| Persona Audit | `0 8 15 * *` | origin |
| Workflow Suggestion | `0 11 1 * *` | origin |

## Verifying a fresh setup

```bash
# every referenced script actually exists
python3 $HOME/.autognosia/scripts/audit_cron_scripts.py

# no job should carry an unnecessary workdir
python3 - <<'PY'
import json, pathlib
p = pathlib.Path.home() / ".hermes/cron/jobs.json"
d = json.loads(p.read_text())
for j in d.get("jobs", []):
    if j.get("workdir"):
        print("workdir set:", j["name"], j["workdir"])
PY
```

A healthy install reports zero missing scripts and no unexpected `workdir`.
