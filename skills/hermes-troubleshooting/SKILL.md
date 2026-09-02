---
name: hermes-troubleshooting
description: "Desktop freezes, update blocks, context overflow on Hermes."
version: 1.0.0
author: Hermes Agent (curator)
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [hermes, troubleshooting, debugging, desktop-app, updates, context-overflow]
---

# Hermes Troubleshooting

## Desktop App Freezes / Stalling

**Symptom:** GPU spikes briefly then drops to zero. Desktop shows no response for 20+ minutes.

**Root cause:** Usually context overflow — the conversation exceeded the LLM server's context window.

### Diagnostic Steps

1. **Check agent logs** — `~/.hermes/logs/agent.log`
   ```
   grep "platform=desktop" ~/.hermes/logs/agent.log | tail -20
   ```

2. **Look for these errors:**
   - `Context size has been exceeded.` (code 500) — LM Studio context window too small
   - `Engine protocol predict request failed: fetch failed` — connection dropped mid-stream
   - `[WinError 10058] socket had already been shut down` — server closed stream partway through

3. **Check compression status:**
   ```
   grep "context compression" ~/.hermes/logs/agent.log | tail -10
   ```
   Compression can take 7+ minutes on a 27B model. During that time, desktop shows nothing.

4. **Verify LM Studio context window:**
   - Open LM Studio → Server settings → Context length
   - Default is often 32K. Hermes expects 110K+ (check `model.context_length` in config.yaml)
   - **Mismatch = freezes.** Increase LM Studio context to match or exceed Hermes config

5. **Check session token count:**
   ```
   grep "history=" ~/.hermes/logs/agent.log | grep "platform=desktop" | tail -5
   ```
   High history counts (100+) mean the session is approaching context limits.

### Fixes

- **Increase LM Studio context window** to 64K minimum, 128K if VRAM allows
- **Start a new chat** in desktop app to reset context
- **Lower compression threshold** in config.yaml (`compression.threshold: 0.3`) to compress earlier

## Hermes Update Blocked on Windows

**Symptom:** Update aborts with "venv-blocked: N process(es) hold the install" pointing to a Python process.

**Root cause:** The Hermes dashboard (or any Python process using the Hermes venv) holds `.pyd` files open, blocking the update.

### Diagnostic Steps

1. **Find what's holding the venv:**
   ```
   netstat -ano | grep "8765"  # dashboard port
   ps aux | grep "hermes_dashboard" | grep -v grep
   ```

2. **Stop the blocking process:**
   ```
   taskkill /PID <pid> /F
   ```

3. **Retry update:**
   ```
   hermes update
   ```

### Alternative

Use `hermes update --force-venv` to bypass the guard. Risk: the blocked process may need a restart afterward anyway.

### Prevention

- Stop the dashboard before clicking update
- The dashboard is on port 8765 by default
- Hermes auto-pause handles gateway processes but NOT standalone scripts like the dashboard

## Common Error Patterns

| Error | Meaning | Fix |
|-------|---------|-----|
| `Context size has been exceeded` | LM Studio context window too small | Increase context in LM Studio settings |
| `fetch failed` | LLM server dropped connection | Check server health, increase timeout |
| `socket had already been shut down` | Stream closed mid-response | Same as above |
| `venv-blocked: N process(es)` | Python process holding venv open | Stop the process or use `--force-venv` |
| `Hermes backend exited (SIGTERM)` | Backend killed during boot | Check for stale processes, restart |

## Diagnosing Your Execution Context: Desktop GUI vs. Remote Agent Server

**Symptom:** Tooling that reports a host/IP that doesn't match the machine you're *looking at* in the GUI.

**Root cause:** The Hermes desktop app can be SSH-tunneled or gateway-remoted to a *different* host than the one running the GUI. `uname -a`, `hostname`, `ip addr`, and `$HERMES_REAL_HOME` will reveal the host where tool calls actually *execute*, which may be a remote server while the desktop GUI runs on a different machine.

This is NOT a bug — it's the intended multi-frontend topology. Do not confuse "where the GUI runs" with "where the tools execute."

### Diagnostic Steps

1. **Check environment variables** — the `HERMES_*` family reveals the session source and real home:

   ```bash
   env | grep -iE 'HERMES_SESSION_SOURCE|HERMES_DESKTOP|HERMES_GATEWAY|HERMES_REAL_HOME'
   ```

   Key indicators:
   - `HERMES_SESSION_SOURCE=desktop` — the interface is the desktop GUI app (does NOT mean the GUI host = the execution host).
   - `HERMES_DESKTOP=1` — a desktop session is active (same caveat).
   - `HERMES_REAL_HOME=/home/<USER>` — the persistent home path. Compare this to the local filesystem layout.
   - `_HERMES_GATEWAY=1` — the in-process gateway is active (could be the desktop's embedded gateway or a tunneled remote one).

2. **Verify the execution host** directly:

   ```bash
   hostname && uname -a && ip -4 addr show | grep inet
   ```

   - If `hostname` returns a *server* name (e.g. `JoshAgent`) while you're *looking at* a desktop GUI, you are remoted into the server.
   - The IP returned (e.g. `<AGENT_SERVER_IP>`) is the **execution host** — where all terminal/tool calls land — not necessarily the desktop machine.

3. **Check for SSH tunneling indicators** — if the desktop app is remoted:

   ```bash
   ps aux | grep -i 'ssh' | grep -v grep   # an active tunnel
   echo $SSH_CONNECTION $SSH_CLIENT         # set if tunneled
   ```

4. **Confirm via filesystem** — if `/home/<USER>` resolves to the same path on a remote Ubuntu host and the desktop is Windows, the tools execute on the remote Linux host.

### Correct Mental Model

```
[Windows desktop] —(GUI + SSH tunnel)→ [Ubuntu agent server <AGENT_SERVER_IP>]
   ↑ Hermes desktop app                 ↑ tools execute here
   ← profiles / sessions flow back
```

The agent server at `<AGENT_SERVER_IP>` is the persistent backend shared across frontends (desktop app, Telegram, etc.). The desktop app's profile list showing server profiles confirms the link is healthy. When you run `ip addr` from a tool call, the `<AGENT_SERVER_IP>` address is the **agent server**, not the desktop.

### Common Mistake to Avoid

Do NOT assume the IP returned by `ip addr` in a terminal call is the machine you're sitting in front of GUI. In a remoted desktop topology, it is the *gateway's execution host*. To discover the desktop machine's own LAN address, use `read_window_below` (which reports the frontmost non-Hermes window) or ask the user.

## Cron Job Scripts Failing Silently (no_agent=True)

**Symptom:** Script-only cron job (`no_agent=True`) reports `error` status even though the same script works when run manually from the terminal.

**Root cause:** Hermes copies the script to `~/.hermes/scripts/` and runs it from that directory as CWD. Two common failures:

1. **`script` field contains a shell command** (e.g., `python "C:/path/to/script.py"`) instead of just a filename. The `script` field expects a **filename only** — Hermes runs it via `python filename` from `~/.hermes/scripts/`.

2. **Script uses relative paths based on `__file__`** (e.g., `os.path.dirname(os.path.abspath(__file__))`). When Hermes copies the script to `~/.hermes/scripts/`, those relative paths resolve to the wrong location.

3. **Script path drift (Autognosia migration):** Scripts were moved from `hermes-autognosia/scripts/` to `.autognosia/scripts/` as part of the project rename from "Hermes Autognosia" to "Autognosia". The cron job's `script` field may point to a missing path. If the script exists at `~/.autognosia/scripts/` but the job reports `Script not found`, set `workdir` to `/home/<USER>/.autognosia/scripts`.

### Fix

Use absolute paths in scripts, anchored to `HERMES_ROOT` or a hardcoded absolute path:

```python
# WRONG — breaks when script is copied to ~/.hermes/scripts/
HERMES_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "Hermes")

# CORRECT — works from any directory
HERMES_ROOT = os.environ.get("HERMES_ROOT", "C:/Hermes")
```

For jobs that need to run multiple scripts, create a **wrapper script** in `~/.hermes/scripts/` that calls the real scripts via absolute paths:

```python
#!/usr/bin/env python3
import subprocess, sys, os
HERMES_ROOT = os.environ.get("HERMES_ROOT", "C:/Hermes")
script = os.path.join(HERMES_ROOT, "Personal", "Automation", "integrity_check.py")
result = subprocess.run([sys.executable, script], capture_output=True, text=True)
print(result.stdout)
sys.exit(result.returncode)
```

Then set the cron job's `script` field to just the wrapper filename (e.g., `integrity_and_views.py`).

### Verification

Test from the correct directory before trusting the fix:
```bash
cd ~/.hermes/scripts && python your_script.py
```
If it works here, it will work as a cron job.

### Autognosia Path Migration Checklist

After the project rename from "Hermes Autognosia" to "Autognosia", verify:
- [ ] All scripts in `.autognosia/scripts/` have no references to `hermes-autognosia` paths
- [ ] All cron jobs with `no_agent=True` and script references have `workdir` set to `/home/<USER>/.autognosia/scripts` if the script lives there
- [ ] The script file `check_autognosia_dbs.py` has been renamed to `check_autognosia_dbs.py` with all "autognosia" references replaced with "autognosia"

## Cron Jobs Fail Closed After Changing Global Model

**Symptom:** You changed the global default model/provider and cron jobs that previously had `model: null` / `provider: null` (dynamic inheritance) now report `error` status on their next run. Common errors include "Key limit exceeded" (falling back to OpenRouter) or "global inference config drifted."

**Root cause:** Hermes stores an internal snapshot of the active model/provider at the time each cron job was last updated. When the global changes, the snapshot diverges and Hermes refuses to run the job silently with a different model — it fails closed as a safety measure. If the local model is offline, unpinned jobs fall back to OpenRouter (which may have key limits).

### Fix — Pin the model explicitly (recommended)

Edit `jobs.json` directly to pin agent-based jobs to the local model. This is the most durable fix:

```python
import json
with open('jobs.json', 'r') as f:
    data = json.load(f)

for job in data['jobs']:
    if not job.get('no_agent', False):  # agent-based jobs only
        job['model'] = 'qwen/qwen3.6-27b'          # your local model
        job['provider'] = 'custom'
        job['base_url'] = 'http://127.0.0.1:1234/v1'

with open('jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
```

After editing, verify with `cronjob(action="list")` — pinned jobs show the model name instead of `null`.

### Alternative — Delete and recreate

If you prefer not to edit config files:

1. List jobs: `cronjob(action="list")` — note the job IDs of affected agent-based jobs (skip `no_agent=True` script-only jobs — they don't use an LLM)
2. Remove each: `cronjob(action="remove", job_id="<job_id>")`
3. Recreate with the same prompt, schedule, skills, and delivery settings

The recreated jobs inherit the current global model/provider snapshot and run normally.

### Why `action=update` alone doesn't fix drift

The drift guard stores the original model/provider at job creation time in a separate internal field that `action=update` does not reset. Only a fresh creation or a direct edit of `jobs.json` clears it.

### Prevention — Always pin agent-based cron jobs

**User preference:** All agent-based cron jobs should be explicitly pinned to the local primary model (`qwen/qwen3.6-27b` via `custom` provider at `http://127.0.0.1:1234/v1`). This prevents:
- Config drift errors after global model changes
- Accidental fallback to OpenRouter when the local model is offline
- Unexpected costs or key limit errors

Script-only jobs (`no_agent=True`) do NOT need pinning — they don't use an LLM.

When creating new agent-based cron jobs, pin the model in `jobs.json` immediately after creation rather than relying on dynamic inheritance.

## Known Expected Errors on Windows Desktop (Sleep Artifacts) — Do NOT Fix

**User policy (2026-08-16):** The desktop host goes to sleep, and the error classes below are *expected artifacts*. The user wants them left in logs for reference. **Do not fix, edit, or re-flag them as problems.** When auditing logs, report them as known/expected and only escalate genuinely new failure classes:

| Error | Where it appears | Why it happens |
|-------|------------------|----------------|
| OpenRouter `403 Key limit exceeded (total limit)` | errors.log / agent.log when the local model is unreachable | Fallback path fires while host is asleep; fallback key has no budget |
| `Script not found: .../scripts/token_tracker.py` | cron job "Daily Token Usage Report" (`ce1980eb3539`) fails daily | Script does not exist at that path (intentionally left) |
| `RuntimeError: Context length exceeded (N tokens). Cannot compress further.` | cron jobs "Quick wiki health check", "Monthly systems review" | Prompt loads too much for the local model's effective window |

## Diagnosing Cron Job Failures — Per-Run Output Files

Each cron run writes a full report to `~/.hermes/cron/output/<job_id>/<YYYY-MM-DD_HH-MM-SS>.md` containing the prompt, schedule, and (on failure) the exact error block. This is where you find the real failure reason — faster than digging through agent.log:

```bash
ls -t ~/.hermes/cron/output/<job_id>/ | head -3   # latest runs
tail -20 "$(ls -t ~/.hermes/cron/output/<job_id>/* | head -1)"
```

## Quick Reference Commands

```bash
# Check what's running
ps aux | grep -i "hermes_dashboard\|hermes" | grep -v grep

# Check dashboard port
netstat -ano | grep "8765"

# Stop dashboard by port
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":8765"') do taskkill /PID %a /F

# View recent desktop session logs
grep "platform=desktop" ~/.hermes/logs/agent.log | tail -20

# Check for context overflow
grep "Context size\|fetch failed\|compression" ~/.hermes/logs/agent.log | tail -10
```
