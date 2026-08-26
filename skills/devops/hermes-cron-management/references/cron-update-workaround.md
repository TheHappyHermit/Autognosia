# Cron Update Workaround — Partial Update Failure

## Problem

The `cronjob` tool's `action='update'` fails with `"No updates provided."` when attempting to update only `model` and `provider` fields.

```json
{
  "action": "update",
  "job_id": "eebf16fd600a",
  "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
  "provider": "openrouter"
}
```

**Result:**
```json
{"error": "No updates provided.", "success": false}
```

## Root Cause

The cronjob update endpoint requires the full job specification (`prompt`, `schedule`, `model`, `provider`, `skills`, etc.) to be resubmitted. It does not support partial/PATCH-style updates.

## Workaround

Use the `hermes cron edit` CLI command which handles the full update internally:

```bash
hermes cron edit <job_id> --model nvidia/nemotron-3-ultra-550b-a55b:free --provider openrouter
```

This command:
1. Reads the existing job configuration
2. Applies the specified changes (model, provider, schedule, etc.)
3. Writes the complete updated job spec back to the scheduler

## Verification

After running the CLI command, verify with:
```bash
cronjob action='list'
# or
hermes cron list
```

Both should show the updated `model` and `provider` fields.

## Session Transcript

**Initial state:** All 4 cron jobs used `tencent/hy3:free` via `nous` provider.

**Failed attempts via cronjob tool:**
- 3× `cronjob update` with only model/provider → "No updates provided"
- 3× `cronjob update` with model+provider+prompt+schedule → model still showed old value in list

**Successful approach:** `hermes cron edit` CLI for each job_id:
- `eebf16fd600a` (Morning Newsletter)
- `2fdcb131de85` (Evening Newsletter)
- `082b13bf66ea` (the client platform Research 10min)
- `f3a967f632f9` (the client platform Research 5min — paused)

All 4 now show `nvidia/nemotron-3-ultra-550b-a55b:free` / `openrouter`.