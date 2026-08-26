# Cron 429: pinned single free model, no fallback chain (real incident 2026-07-23)

## Symptom
WealthForge Research Cron (`082b13bf66ea`, `*/30 * * * *`) failing ~1 in 3 runs.
Last failed run `2026-07-23_10-04-24.md` showed:

```
RuntimeError: HTTP 429: Hold up for a bit, you've exceeded the rate limit on your API key.
```

Agent died before doing any work — no `## Response`, only `## Error`.

## Recurrence check (grep across all output files for the job)
```
search_files pattern="RuntimeError: HTTP 429" path="~/.hermes/cron/output/082b13bf66ea"
```
Result: 14 of ~46 runs across 07-22→07-23 failed with the identical 429.
Successful runs worked fine → script is healthy; the key is the problem.

## Root cause
Job pinned to `provider: nous` / `model: tencent/hy3:free` (single free model,
NO fallback chain). That key is also used by: the live chat session (same
hy3:free/nous), the 6 AM + 9 PM newsletters, and any other cron near the same
time. Aggregate traffic tripped the quota.

The sibling research cron `f3a967f632f9` (paused) was already `provider: auto`
/ `model: auto` — inheriting the OpenRouter free chain. The active one diverged
by being hard-pinned. THAT divergence is the bug.

## Fix applied
Switch the active job to inherit the fallback chain:
```
cronjob update 082b13bf66ea provider auto model auto
```
Spreads load across deepseek → qwen3-coder → gpt-oss → gemma and stops silent
429s. A cron has no live operator to swap models, so auto/auto is the correct
design for headless jobs sharing a free key.

## Recurrence grep recipe (reusable)
To grade any cron's 429 rate:
1. Get job id: `cronjob list`
2. Count failures: `search_files` grep `Cron Job: ... (FAILED)` header in
   `~/.hermes/cron/output/<id>/` → total failed runs
3. Count 429s: `search_files` grep `RuntimeError: HTTP 429` in same dir
4. If 429s ≈ failures AND rate ≥ ~20%, it's key saturation (Pattern 4), not
   a transient network blip.
