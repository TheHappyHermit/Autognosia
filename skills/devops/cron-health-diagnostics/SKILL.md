---
name: cron-health-diagnostics
description: Detect and fix cron-job health problems beyond plain external-dependency failures — duplicate identical crons amplifying API rate-limits (429), the "mutation verifier" over-claim message, and cadence tuning. Pair with troubleshoot-failed-cronjob-external-deps for the full layer model.
category: devops
---

# Cron Health Diagnostics (operational patterns)

Companion to `troubleshoot-failed-cronjob-external-deps` (manually maintained,
covers the DNS/connectivity/script/credential layers). This skill captures
operational patterns that surfaced from running crons in production.

## Pattern 1 — Duplicate identical crons amplify 429 rate-limits
If two+ cron jobs carry byte-identical prompts (e.g. two "WealthForge Research
Cron" both on `*/5 * * * *`, both `provider: nous`), they multiply API calls
against the same key and trip:
`RuntimeError: HTTP 429: Hold up for a bit, you've exceeded the rate limit on your API key.`
Every run then errors — a self-inflicted outage.

**Fix:**
1. `cronjob list` → diff the `prompt_preview` / open two job outputs to spot
   identical prompts.
2. `cronjob remove <redundant_job_id>` — keep ONE.
3. Reduce cadence on the survivor: `cronjob update <id> schedule "*/30 * * * *"`
   (a 6× drop in call volume usually clears the 429).

**Watch for:** the same agent running under multiple profiles/jobs is the usual
cause. Don't assume a single entry — always `list` before concluding "rate
limit is Nous's fault."

## Pattern 2 — "mutation verifier" message is NOT a file error
Cron output sometimes contains:
`mutation verifier: N file(s) were NOT modified this turn despite any wording above that may suggest otherwise.`
This is a SYSTEM message, not a disk/crash error. It means the agent CLAIMED it
edited files but the system confirmed they were unchanged — an over-claiming
signal (sibling of the tracker-corruption pattern in
`troubleshoot-failed-cronjob-external-deps`).

**Action:** if it recurs, the prompt instructs edits the agent isn't actually
performing. Tighten the prompt to verify-before-claim (read file → assert change
→ only then report). Do NOT treat it as a filesystem fault.

## Pattern 3 — Cadence vs. shared-key budget
Any cron that calls a rate-limited external key (Nous, OpenRouter free tier,
etc.) must have cadence set so the aggregate across ALL crons sharing that key
stays under quota. When adding a new frequent cron, `cronjob list` first and
check what else uses the same provider.

## Pattern 4 — Single pinned-model cron with NO fallback chain saturates a shared free key

Pattern 1 assumes TWO+ identical crons. A separate, equally common 429 cause is
a SINGLE cron hard-pinned to one free model (e.g. `provider: nous`, `model:
tencent/hy3:free`) that has **no fallback chain of its own**. That key is also
shared by your live chat session, newsletters, and any other cron firing near
the same time. When aggregate traffic against that one key exceeds quota, THIS
job gets `RuntimeError: HTTP 429: Hold up for a bit, you've exceeded the rate
limit on your API key.` before it does any work — a 1-in-3 failure rate is
typical, not an anomaly.

**Diagnosis (cron-level, no code):**
1. `cronjob list` → note each job's `provider`/`model` and `enabled` state.
   Confirm how many crons share the same provider/key.
2. Read the failed run: `~/.hermes/cron/output/<id>/<latest>.md` → check the
   `## Error` block for `HTTP 429`.
3. Establish recurrence: `search_files` grep `RuntimeError: HTTP 429` across
   `~/.hermes/cron/output/<id>/` to count failures vs. total runs. ~1/3 failing
   = key saturation, not a one-off.
4. Rule out Pattern 1 (duplication): if only ONE job of that class is enabled,
   duplication is NOT the cause — it's shared-key saturation from the pin.

**Fix (preferred — inherit the fallback chain):**
- `cronjob update <id> provider auto model auto` so the job inherits the
  global fallback chain instead of hard-pinning one free model. This spreads
  load across the chain and stops silent 429 failures. This matches how the
  sibling (paused) research cron was already configured.
- Alternative: reduce cadence (Pattern 1 step 3) if you must keep the pin.

**Why auto/auto beats a hardcoded free model for crons:** a cron has no live
operator to swap models when one is throttled. `auto`/`auto` lets the gateway
walk the fallback chain automatically. Hard-pinning a single free model
re-introduces the exact saturation that the chain exists to avoid.

See `references/cron-429-pinned-model-no-fallback.md` for the exact error
transcript and the recurrence-grep recipe from a real incident.

Support files:
- `references/graphify-progress-monitor-fix.md` — Case study of fixing
  transient verification scripts created by the Graphify Progress Monitor
  cron job (Pattern 6).

## Pattern 5 — Post-rename text reference drift (not just paths)

When a project is renamed (e.g., "Hermes Cortex" → "Autognosia"), scripts
often contain **hard-coded references to the old name** that survive the
rename — container names, comments, error messages, grep patterns, etc.

These are NOT path issues; the files are in the right place. But the content
still carries the old name.

**Symptoms:**
- `grep -ri 'old-name' repo/` finds references in scripts, configs, comments
- References appear in container names (`hermes-cortex-honcho-api-1`)
- References in comments/docstrings (`# Check for cortex naming convention`)
- References in fallback logic or error messages

**Fix:**
1. `grep -ri 'old-name' --include='*.py' --include='*.md' --include='*.yaml'
   --include='*.json' repo/`
2. For each match, decide:
   - Is it a reference to an old external resource? → Remove or update
   - Is it legacy fallback logic? → Remove if no longer needed
   - Is it in a comment? → Update to new name
3. **Also check assets/** — old image names may still be in the repo
4. Verify: `grep -ri 'old-name' repo/` returns zero results

**Example:** After renaming Hermes Cortex → Autognosia, `verify_stack.py`
still referenced `hermes-cortex-honcho-api-1` in its container detection
logic. Removed the old fallback block entirely.

**Watch for:** After any rename, always run a text search — not just a
path search. See Pattern 7 for script path drift.

## Pattern 6 — Transient verification scripts created by cron agents

Cron jobs that run with `no_agent=False` often trigger the agent to create
temporary verification/check scripts in `/tmp/` (e.g., `hermes-verify-*.py`,
`check_*.py`, `rechunk_*.py`). Each run creates new files, the agent reports
them as "cleanup pending approval," and they persist indefinitely.

**Symptoms:**
- `/tmp/hermes-verify-*.py`, `/tmp/check_*.py`, etc. accumulating
- Cron output repeatedly says "Cleanup temp file `/tmp/...` is pending
  approval to delete"
- Each run creates NEW temp scripts rather than reusing existing ones
- The temp scripts are actually the agent's way of executing a task it was
  instructed to do (e.g., "verify graph integrity," "rechunk files")

**Root cause:** The cron prompt instructs the agent to perform verification
or processing but doesn't point to a permanent script. The agent improvises by
creating temp scripts inline.

**Fix:**
1. Extract the logic from the temp scripts into a permanent script:
   `~/.autognosia/scripts/<name>.py`
2. Make it executable: `chmod +x ~/.autognosia/scripts/<name>.py`
3. Update the cron job prompt to reference the permanent script:
   ```
   Run: python3 ~/.autognosia/scripts/<name>.py
   If it exits 0, report success. If it exits 1, report which checks failed.
   Do NOT create temporary scripts.
   ```
4. Remove the old temp files: `rm -f /tmp/hermes-verify-*.py /tmp/check_*.py`

**Example:** The Graphify Progress Monitor cron was creating
`/tmp/hermes-verify-graphify-integrity.py` every hour. Fixed by creating
`~/.autognosia/scripts/verify_graphify_integrity.py` and updating
the cron prompt to call it directly.

**Watch for:** Any cron job whose agent creates temp scripts instead of
using existing ones. This wastes tokens, leaves stale files, and means
the logic is not version-controlled.

## Pattern 7 — Script path drift after project rename

After the project rename from "Hermes Cortex" to "Autognosia", scripts moved
from `hermes-cortex/scripts/` to `.autognosia/scripts/`. Script-only cron jobs
(`no_agent=True`) that reference these scripts will fail with `Script not found`
because the script no longer exists at the expected location.

**Symptom:** `last_error: "Script not found: ~/.hermes/scripts/autognosia_*.py"`
but `ls ~/.autognosia/scripts/autognosia_*.py` shows the file exists.

**Fix:** Copy the script to `~/.hermes/scripts/` so both locations have it:
```bash
cp ~/.autognosia/scripts/<script>.py ~/.hermes/scripts/
chmod +x ~/.hermes/scripts/<script>.py
```
This ensures the script works regardless of how the cron scheduler resolves
the path. Alternatively, set the job's `workdir` to
`~/.autognosia/scripts`.

**Watch for:** This affects all cron jobs with `no_agent=True` that reference
`autognosia_backup.py`, `autognosia_health.py`, or any other script that was
renamed/moved during the project rename. Always check both locations before
assuming the script is genuinely missing.

## Verification after a fix
- For Pattern 1: `cronjob list` shows the duplicate removed and cadence changed.
- For Pattern 4: `cronjob list` shows the job now `provider: auto`/`model: auto`.
- For Pattern 5: `grep -ri 'old-name' repo/` returns zero results.
- For Pattern 6: `ls /tmp/hermes-verify-*.py` returns no files.
- For Pattern 7: `ls ~/.hermes/scripts/<script>.py` confirms copy exists.
- Wait for the next scheduled run (or `cronjob run <id>`) and read
  `~/.hermes/cron/output/<id>/<latest>.md` — expect no `## Error`.
