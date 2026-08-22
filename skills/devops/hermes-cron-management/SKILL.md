---
name: hermes-cron-management
description: Manage Hermes cron jobs — update model/provider via CLI.
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Hermes Cron Job Management

Hermes cron jobs run scheduled tasks (newsletter generation, research, maintenance) with configurable models, providers, and delivery targets.

## Key Workflows

### Update Model/Provider for Existing Cron Job

**Use `hermes cron edit` CLI command** — the `cronjob` tool's `update` action requires the full prompt to persist changes; you cannot update only `model`/`provider` in isolation.

```bash
# Correct approach
hermes cron edit <job_id> --model nvidia/nemotron-3-ultra-550b-a55b:free --provider openrouter

# Incorrect - fails with "No updates provided"
cronjob action='update' job_id='...' model='...' provider='...'
```

### Create New Cron Job

```bash
hermes cron create "0 6 * * *" --prompt "Run newsletter script" --model "anthropic/claude-sonnet-4" --provider anthropic --deliver telegram
```

### List and Inspect Jobs

```bash
hermes cron list           # enabled jobs
hermes cron list --all     # include disabled/paused
cronjob action='list'      # tool equivalent (returns full JSON)
```

## Current Cron Jobs (Aug 2026)

| Job ID | Name | Schedule | Model | Status | Notes |
|--------|------|----------|-------|--------|-------|
| `eebf16fd600a` | Morning Newsletter (6 AM) | `0 6 * * *` | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Active** | Uses `freshrss-integration` skill; delivers to Telegram; matches main agent's default model from config.yaml |
| `2fdcb131de85` | Evening Newsletter (9 PM) | `0 21 * * *` | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Active** | Uses `freshrss-integration` skill; delivers to Telegram; matches main agent's default model from config.yaml |

**Removed (Aug 14, 2026):**
| Job ID | Name | Schedule | Model | Status | Notes |
|--------|------|----------|-------|--------|-------|
| `f3a967f632f9` | WealthForge Research Cron | `*/5 * * * *` | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Removed** | 10,848 runs; output 29 MB; deleted with output dirs |
| `082b13bf66ea` | WealthForge Research Cron | `*/10 * * * *` | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Removed** | Erroring (502); output 444 KB; deleted with output dirs |

## Model Update (Aug 14, 2026)

Both newsletter jobs were hardcoded to `nvidia/nemotron-3-ultra-550b-a55b:free` — which **is** the main Hermes agent's configured default model (per `config.yaml`). The `newsletter_builder.py` script already reads the default model from `config.yaml` and falls back to Nemotron if the configured default is `tencent/hy3:free` (now unavailable on free tier). No change was needed beyond confirming alignment.

**Update attempted (reverted):** Temporarily switched both jobs to `openrouter/auto` (fallback chain: deepseek/deepseek-v3.2:free → qwen/qwen3-coder:free → openai/gpt-oss-120b:free → google/gemma-4-31b-it:free) but user clarified they want cron jobs to use the **main agent's configured default**, not a separate fallback chain. Reverted to `nvidia/nemotron-3-ultra-550b-a55b:free` via direct patch of `~/.hermes/cron/jobs.json`.

The `cronjob` tool cannot update `model`/`provider` in isolation — requires full job spec or CLI workaround. Use `hermes cron edit <job_id> --model ... --provider ...` for changes.

## WealthForge Cron Cleanup

The two paused WealthForge cron jobs (`f3a967f632f9`, `082b13bf66ea`) were removed along with their output directories (Aug 14, 2026):

```bash
# Remove cron jobs
hermes cron remove f3a967f632f9
hermes cron remove 082b13bf66ea

# Remove output directories (see hermes-disk-management skill)
rm -rf ~/.hermes/cron/output/f3a967f632f9/
rm -rf ~/.hermes/cron/output/082b13bf66ea/
rm -rf ~/.hermes/cron/output/07d03c5fa00a*/
rm -rf ~/.hermes/cron/output/weave-research/
rm -f ~/.hermes/cron/output/wf_s01_7_parse.py
```

**Result:** ~29 MB + 444 KB + small dirs freed. Jobs no longer appear in `hermes cron list --all`.

## Delivery Targets

- `telegram` — deliver to configured Telegram chat
- `local` — save output only, no delivery
- `origin` — deliver to originating chat/topic
- `all` — fan out to all connected channels

## Key Preference (Aug 2026)

**Cron jobs should use the main Hermes agent's configured default model** (read from `config.yaml`), not a separate fallback chain. The user explicitly clarified this: the newsletter cron jobs were temporarily set to `openrouter/auto` (with deepseek→qwen→gpt-oss→gemma fallback) but the user wants them aligned with whatever the main agent uses — currently `nvidia/nemotron-3-ultra-550b-a55b:free` via openrouter with Nous base URL `https://inference-api.nousresearch.com/v1`.

The `newsletter_builder.py` script already reads the default model from `config.yaml` (lines 395-412) and falls back to Nemotron if the configured default is `tencent/hy3:free` (now unavailable on free tier). This means both the cron job model AND the script's model resolution stay in sync with the main agent's config.

**Action:** When updating cron job models, verify `config.yaml` first:
```bash
grep -A5 "^model:" ~/.hermes/config.yaml
# Then set cron job to match
hermes cron edit <job_id> --model "nvidia/nemotron-3-ultra-550b-a55b:free" --provider openrouter
```

## Auto-Approval (Aug 2026)

**Cron jobs are configured for auto-approval** (`approvals.mode: auto` in config.yaml). They run without user gating or manual approval gates. If a cron job fails, investigate the cause but don't expect the user to approve re-runs — they should just run automatically.

## Script Path Resolution

Cron jobs expect scripts in `~/.hermes/scripts/`. Scripts live in the project repo at `/home/josh434/autognosia-repo/scripts/`. If a `no_agent=True` cron job reports `Script not found`, copy it:

```bash
cp /home/josh434/autognosia-repo/scripts/<scriptname>.py ~/.hermes/scripts/<scriptname>.py
chmod +x ~/.hermes/scripts/<scriptname>.py
```

**Common scripts:** `autognosia_backup.py`, `autognosia_health.py`, `verify_stack.py`, `gbrain_sync.py`

**Important:** `verify_stack.py` must also exist at `~/.autognosia/scripts/verify_stack.py` because the health check script looks there first before falling back.

## Cron Job Troubleshooting

### Cron job fails: "Script not found"
1. Check if the script exists in the repo: `ls /home/josh434/autognosia-repo/scripts/`
2. Copy to `~/.hermes/scripts/` and make executable
3. Update the cron job's `script` field via `jobs.json` edit if the filename doesn't match

### Cron job fails: "Script exited with code 1"
Run the script manually to see the output:
```bash
python3 ~/.hermes/scripts/<scriptname>.py
```

### Cron job references a missing skill
When a cron job's prompt says "Use the X skill" but `X` skill is not installed, the agent **improvises** — creating temporary Python scripts in `/tmp` and deleting them. This produces stale file accumulation and the "file mutation verifier" warning.

**Fix:** Create the missing skill in `~/.hermes/skills/` with inline procedures that do NOT write temp files. The skill must contain a "Critical Rule" section forbidding temporary script creation.

### Cron job skills not attached
When a cron job has `"skills": []` but references a skill in its prompt, the agent can't load it. Fix by editing `jobs.json`:
```python
import json
with open('/home/josh434/.hermes/cron/jobs.json') as f:
    data = json.load(f)
for j in data.get('jobs', []):
    if 'briefing' in j.get('name', '').lower():
        j['skills'] = ['organizer-state']
        break
with open('/home/josh434/.hermes/cron/jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
```

## Docker Container Naming (Autognosia)

Docker container names may differ between deployments. Health checks should detect multiple naming patterns. For example, Honcho containers may be named:
- `autognosia-honcho-api-1`, `autognosia-honcho-database-1`, `autognosia-honcho-deriver-1`
- `hermes-cortex-honcho-api-1`, `hermes-cortex-honcho-database-1`, `hermes-cortex-honcho-deriver-1`
- `honcho_server`, `honcho_db`, `honcho_deriver` (legacy)

When updating verification scripts, always check `docker ps --format '{{.Names}} {{.Status}}'` first to see actual container names.

## Cron Auto-Approval Configuration

Cron jobs are configured for auto-approval (`approvals.mode: auto` in config.yaml). They run without user gating or manual approval gates.

**Set via CLI:**
```bash
hermes config set approvals.mode auto
```

If a cron job fails, investigate the cause but don't expect the user to approve re-runs — they should just run automatically.

## Auto-Approval Configuration

Cron jobs are configured for auto-approval (`approvals.mode: auto` in config.yaml). They run without user gating or manual approval gates.

**Set via CLI:**
```bash
hermes config set approvals.mode auto
```

If a cron job fails, investigate the cause but don't expect the user to approve re-runs — they should just run automatically.

## References

- `references/cron-update-workaround.md` — detailed transcript of the partial-update failure and CLI workaround