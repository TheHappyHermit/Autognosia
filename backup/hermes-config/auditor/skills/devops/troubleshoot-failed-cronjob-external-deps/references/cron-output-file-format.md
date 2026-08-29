# Cron Output File Format & Duration Tracking

## What's in the Output Files

Cron output files in `~/.hermes/cron/output/<job_id>/` contain:
- **Start time** (e.g., `2026-05-22_08-41-21.md`)
- The assembled prompt
- The agent's response/output
- Error details if failed

**They do NOT contain:**
- Run duration
- Token counts
- API call timing
- End time

## How to Check Cron Job Status

```bash
# Count successful vs failed runs in a date range
grep -c "FAILED" ~/.hermes/cron/output/<job_id>/2026-05-22_*.md  # failed count
grep -L "FAILED" ~/.hermes/cron/output/<job_id>/2026-05-22_*.md  # list successful files
```

## Estimating Run Duration (Workaround)

Since output files don't log duration, estimate from gaps between consecutive runs:

```python
# Calculate gaps between consecutive cron runs (from filename timestamps)
# A gap > cron interval (e.g., >20 min for */20) suggests the previous run took longer
# A gap < cron interval suggests runs are stacking up (previous run didn't finish before next fired)
```

**Caveats:**
- Gaps between runs ≠ run duration. The cron scheduler fires on schedule regardless of whether the previous run finished.
- If a run takes longer than the interval, runs will queue up.
- The actual duration can only be measured by modifying the cron job to log its own timing.

## Adding Duration Tracking to a Cron Job

To get actual duration data, modify the cron job's prompt to include a timing step:

```
At the start of each run, record: echo "START: $(date +%s)" > /tmp/cron-timestamp
At the end, compute: echo "DURATION: $(( $(date +%s) - $(cat /tmp/cron-timestamp) ))s" >> /tmp/cron-timestamp
```

Or better: add a `duration` field to the output template in the cron job config (requires Hermes config change).

## Key Files to Know

- `~/.hermes/cron/output/<job_id>/` — raw output files per run
- `~/.hermes/cron/<job_id>.yaml` — cron job config (schedule, model, etc.)
- Cron job status via `cronjob action='list'` — shows last_status, last_run_at, next_run_at