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

Crucially: the PAUSED sibling job of the same class was already set to
`provider: auto` / `model: auto` (inheriting the global OpenRouter free chain:
deepseek → qwen3-coder → gpt-oss → gemma). The active one diverged by being
hard-pinned. That divergence is the bug.

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

## Pattern 5 — Script path resolution with `workdir` (brain_sync_cron.py incident)

When a cron job has `script: "brain_sync_cron.py"` and `workdir: "/home/josh434/autognosia-clean"`, the Hermes cron system prepends `~/.hermes/scripts/` to the script path. This causes a **double-path** failure:

- **Expected**: `/home/josh434/autognosia-clean/brain_sync_cron.py`
- **Actual lookup**: `/home/josh434/.hermes/scripts/scripts/brain_sync_cron.py` (doesn't exist)

**Symptoms**: Cron fails with "Script not found" even though the file exists at the expected path.

**Diagnosis**:
1. Check the job's `script` and `workdir` fields: `cronjob list` → find the job
2. Check if the script exists at the workdir: `ls <workdir>/<script>`
3. Check if the script exists in `~/.hermes/scripts/`: `ls ~/.hermes/scripts/<script>`
4. If the script is in `~/.hermes/scripts/` but NOT at the workdir, the path is being prepended

**Fix**:
- If the script lives in `~/.hermes/scripts/`: set `workdir: "/home/josh434/.hermes/scripts"` and `script: "<bare_filename>"`
- If the script lives in the repo: use the full relative path from workdir (e.g., `script: "scripts/brain_sync_cron.py"`)

**Key insight**: The cron system resolves script paths relative to `~/.hermes/scripts/` when the file exists there, NOT relative to `workdir`. Always verify both locations.

## Pattern 6 — Researcher subagent fails to write output files

When dispatching researcher subagents via `delegate_task`, the subagent may complete its web searches and summarize findings but **fail to write the output file to disk**. This is a common failure mode with local models on limited context.

**Symptoms**: Subagent returns "completed" with a summary like "Let me compile my research findings" but no file exists at the target path.

**Prevention**:
1. Always include explicit write instructions in the researcher context:
   ```
   CRITICAL: You MUST write your research to /path/to/output.md using write_file
   Do NOT summarize without writing. The file must exist on disk.
   ```
2. After subagent completes, verify the file exists: `ls -la <target_path>`
3. If missing, re-dispatch with narrower scope and explicit write instructions

**Recovery**: If the subagent's transcript contains the research data, compile it yourself and write the file directly.

## Verification after a fix
- For Pattern 1: `cronjob list` shows the duplicate removed and cadence changed.
- For Pattern 4: `cronjob list` shows the job now `provider: auto`/`model: auto`.
- For Pattern 5: `cronjob run <id>` succeeds with "Script not found" no longer appearing.
- For Pattern 6: `ls -la <target_path>` confirms the file exists after subagent completion.
