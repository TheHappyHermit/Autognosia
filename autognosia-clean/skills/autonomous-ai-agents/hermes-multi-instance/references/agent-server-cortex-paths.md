UPDATED 2026-08-23 (post-autognosia-migration, re-verified live on .37):
- Active Wiki: /home/josh434/.autognosia/active-wiki (WIKI_PATH in ~/.bashrc)
- Oracle brain: /home/josh434/.autognosia/oracle/brain
- organizer.db: /home/josh434/.autognosia/personal-organizer/data/organizer.db (tables: tasks, projects, subscriptions, important_dates, intentions, waiting_states, reminders — NO source_records)
- ~/.hermes-cortex now holds only cortex.db/exchange/logs/personal-organizer (stale path map below is history)

# Agent Server (10.1.1.37) — Hermes Cortex Path Map

Verified 2026-08-16. Repo: `~/hermes-cortex` (github.com/openclaw434/hermes-cortex). README is the design doc (~1900 lines): retrieval-cost hierarchy Honcho → Active Wiki → Oracle → GBrain; knowledge flows hot→cold, never deleted ("knowledge changes temperature").

## Canonical paths (`config/paths.yaml`)
- `cortex_home`: `~/.hermes-cortex`
- Active Wiki: `~/.autognosia/active-wiki` (subdirs: personal/projects/reference/system)
- Oracle: `oracle_path: ~/.autognosia/oracle`
- organizer.db: `~/.autognosia/personal-state/data/organizer.db`
- Backups: `~/.autognosia/backups`

## CRITICAL MISMATCH — what scripts actually read
`paths.yaml` says oracle root, but operational components read DEEPER. Dropping files at `~/.autognosia/oracle/` makes them **invisible to the entire pipeline**:

| Component | Actually reads/writes |
|---|---|
| `rebuild_oracle_index.py` (Oracle Index Rebuild cron) | indexes `active-wiki/` → writes into `oracle/brain/` |
| `audit_wiki.py` (Wiki Lint Daily + Weekly Deep crons) | `oracle/brain/` |
| `fill_oracle_gaps.py` (Oracle Knowledge Expansion cron) | `oracle/brain/` |
| `gbrain_sync.py` (hourly GBrain Sync cron) | `~/personal-agent/oracle/brain` — HARDCODED |
| `oracle_search.py` (literal ripgrep fallback) | `~/personal-agent/oracle/brain` — HARDCODED |
| graphify-cortex-integration skill | `oracle/brain/` + raw evidence in `oracle/raw/` |
| library-onboarding / capture-and-triage skills | `oracle/brain/` |
| installed wiki-maintenance skill | `active-wiki/` only |

**Rule:** vault content must live in `oracle/brain/` AND be copied to `~/personal-agent/oracle/brain` (GBrain + literal search). Both locations, no config edits needed.

## LLM Wiki location
- `WIKI_PATH` IS set in `~/.hermes/.env` (added 2026-08-16): `/home/josh434/.autognosia/active-wiki`. Backup of pre-edit .env: `~/.hermes/.env.bak-20260816`.
- Design intent per paths.yaml: hot wiki at `active-wiki/`; `rebuild_oracle_index.py` is the conveyor that copies active-wiki → oracle/brain.

## Cron self-provisioning behavior
The agent VM's own Hermes instance auto-created **23 cron jobs** at 21:29 on 2026-08-16 from `hermes-cortex/cron-jobs/definitions.md` (Config/Database Backup, Integrity Check, Oracle Index Rebuild, Wiki Lint Daily+Weekly, Memory Consolidation, View Generation, Briefing, Intention/Prompt-Me checks, Weekly/Monthly Reviews, Graphify Refresh, Experience Capture, Session/Persona Audit, Cortex Health Check, Research Exchange Sync). Total: 30 jobs. **Do not assume the job list is static — re-list before any audit.**

## Remediation executed 2026-08-16 (all verified)
1. Oracle Vault moved into `~/.autognosia/oracle/brain/` — 379 md; `oracle/` now contains only `brain/`.
2. Copied to `~/personal-agent/oracle/brain` — 379 md (GBrain Sync + oracle_search.py fallback now have content).
3. LLM wiki: 140 md copied into `~/.autognosia/active-wiki/`; old location preserved as `~/wiki.bak-20260816`; `WIKI_PATH` appended to `.env`.
4. Seven desktop skills pushed path-adapted (25 files, zero Windows paths remaining): oracle-query + hermes-troubleshooting (with nested cron-job-management) at top level; llm-wiki-commands, oracle-entity-creation, oracle-wiki-research-pipeline, wiki-maintenance-hermes under `research/`. Mapping used: Vault→`~/.autognosia/oracle/brain`, LLM_WIKI→`active-wiki`, Oracle\Incoming→`~/.autognosia/incoming` (dir created), Backups/Daily→`~/backups/`, AppData logs/cron/state.db→`~/.hermes/...`, `.hermes.md` enforcement ref→`SYSTEM-RULES.md`. Visible to the remote instance only after its gateway reloads.

## Data copied from Windows desktop (2026-08-16)
- Oracle Vault: 379 md → `~/.autognosia/oracle/brain/` (stray literal `~` dir excluded — accidental clone of the Oracle-Vault GitHub repo, 731 md; designed home if ever preserved: `oracle/raw/`)
- LLM_WIKI: 140 md → `~/.autognosia/active-wiki/` (originally dropped at `~/wiki`, moved same day)
