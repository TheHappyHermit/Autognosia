# Cron Output File Analysis Patterns

When diagnosing cron job failures, the output files in `~/.hermes/cron/output/<job_id>/` contain structured markdown with status and error details. Use these patterns to quickly assess health.

## Quick Health Check

```bash
JOB_ID=<job_id>
DIR=~/.hermes/cron/output/$JOB_ID

# Total runs and failure count
TOTAL=$(ls $DIR/*.md 2>/dev/null | wc -l)
FAILED=$(grep -rl "FAILED" $DIR/ 2>/dev/null | wc -l)
echo "Total: $TOTAL | Failed: $FAILED | Rate: $(echo "scale=1; $FAILED * 100 / $TOTAL" | bc)%"
```

## Categorize by Content Heuristics (when no consistent marker)

Some cron jobs don't use a "FAILED" marker — they just contain the raw LLM output. Use content heuristics:

```bash
# Success = has "Key Findings" section (well-formed research output)
# Fail = shorter files (<80 lines) or contains error indicators
DIR=~/.hermes/cron/output/$JOB_ID
success=0; fail=0
for f in $(find $DIR -name "*.md" | sort); do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 80 ] && grep -q "Key Findings" "$f" 2>/dev/null; then
    success=$((success+1))
  else
    fail=$((fail+1))
  fi
done
echo "Successful: $success | Failed: $fail"
```

Alternatively, grep for error keywords:

```bash
grep -rlqi "error\|failed\|exception\|traceback" $DIR/ 2>/dev/null | wc -l
```

## Categorize Failure Modes

```bash
# Error code patterns (HTTP/status codes)
grep -rh "Error code:" $DIR/ 2>/dev/null | sort | uniq -c | sort -rn

# Timeout errors
grep -rl "timed out" $DIR/ 2>/dev/null | wc -l

# Injection scanner blocks
grep -rl "BLOCKED" $DIR/ 2>/dev/null | wc -l

# Non-401 failures (likely script/env issues)
grep -rl "FAILED" $DIR/ 2>/dev/null | sort | while read f; do
  grep -q "Error code: 401" "$f" || basename "$f"
done
```

## Time-Window Analysis

Find when failures started and if they correlate with service outages:

```bash
# First failure of each type
grep -rl "Error code: 401" $DIR/ 2>/dev/null | sort | head -1
grep -rl "timed out" $DIR/ 2>/dev/null | sort | head -1
grep -rl "BLOCKED" $DIR/ 2>/dev/null | sort | head -1

# Last failure of each type
grep -rl "Error code: 401" $DIR/ 2>/dev/null | sort | tail -1
grep -rl "timed out" $DIR/ 2>/dev/null | sort | tail -1
```

## Common Patterns to Look For

| Pattern | Likely Cause |
|---------|-------------|
| 401 Unauthorized | Provider down, API key expired, or `api_key_env` on local provider (LMStudio) |
| 403 Forbidden | Rate limit, banned IP, or wrong credentials |
| Timeout | Provider slow/down, large model loading, or network issue |
| BLOCKED | Cron injection scanner flagged prompt content |
| Empty error block | LLM produced no structured output (model hallucination or context overflow) |
| Import/module error | Missing package in cron's venv or wrong Python path |

## Session Example: WealthForge Deep Research (May 2026)

- **1,067 total runs, 593 failures (55.6%)**
- **580 were 401 Unauthorized** — started May 16, persisted ~9 days. LMStudio at `10.1.1.151:1234` was down.
- **13 were timeouts** — clustered on May 19 and May 23–24.
- Job uses `provider: lmstudio` with **no** `api_key_env` (correct config), so 401s mean the service was unreachable.

## Session Example: WealthForge Deep Research (May 27, 2026)

- **417 runs in 48h**, **230 successful, 186 failed (44.6%)**
- Failures concentrated 00:00–07:00 PDT — LMStudio auth token expired / service unavailable during overnight hours.
- Successful runs produced 800+ lines of research each, appending to RESEARCH.md.
- **Note:** Output files still show old schedule (`*/5`) — cron output files are not retroactively updated when schedule changes.
