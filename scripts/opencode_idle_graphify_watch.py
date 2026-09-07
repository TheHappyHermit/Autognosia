#!/usr/bin/env python3
"""
Overnight watchdog: restart graphify once OpenCode has been idle for 30 minutes.

Josh's instruction (2026-08-26):
    "Continue all night or until open code goes to sleep for 30 minutes
     the restart graphify on the remaining Oracle wiki skipping the
     previous problem files for now"

Design
------
Runs on a schedule (cron). Each tick:

  1. Is a graphify extract already running?      -> do nothing, exit quietly.
  2. Is an `opencode` process running right now? -> record "busy now", exit.
  3. OpenCode is idle. How long has it been idle?
       - Idle is measured from the last time this script SAW opencode running,
         persisted in a small state file. If we have never seen it, we fall
         back to the mtime of the most recent ~/oc-work/*.log, which is
         written by every opencode run.
       - If idle >= 30 min, restart graphify (skipping the problem files) and
         reset the state.
       - Otherwise exit quietly and wait for a later tick.

Silent by design: prints nothing unless it actually acts, so a no_agent cron
job stays quiet until there is something to report.

State file: ~/.autognosia/state/opencode_idle_watch.json
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

IDLE_MINUTES = 30

HOME = Path.home()
STATE_DIR = HOME / ".autognosia" / "state"
STATE_FILE = STATE_DIR / "opencode_idle_watch.json"
OC_WORK = HOME / "oc-work"
RESTART_SCRIPT = HOME / ".hermes" / "scripts" / "restart_graphify_skip_problem_files.py"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(s: str) -> datetime | None:
    try:
        return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None


def _real_procs(needle: str, must_also_contain: str | None = None) -> bool:
    """True if a REAL process matches, ignoring shell wrappers.

    `pgrep -af <x>` also matches the transient `bash -c ... eval 'pgrep -af <x>'`
    wrapper that Hermes' terminal tool creates, so a naive check reports a
    process that does not exist. Verified: this produced a false 'graphify
    running' reading. Filter on the executable path instead of the whole
    command line, and drop anything that looks like a wrapper.
    """
    res = subprocess.run(
        ["ps", "-eo", "pid=,args="], capture_output=True, text=True
    )
    me = Path(__file__).name
    for line in res.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            pid_s, args = line.split(None, 1)
        except ValueError:
            continue
        if int(pid_s) == os.getpid():
            continue
        # Shell wrappers and our own script are not the workload.
        if me in args:
            continue
        if "hermes-snap" in args or args.startswith("/usr/bin/bash -c"):
            continue
        if "eval " in args or args.startswith("pgrep") or args.startswith("ps "):
            continue
        if needle not in args:
            continue
        if must_also_contain and must_also_contain not in args:
            continue
        return True
    return False


def graphify_running() -> bool:
    return _real_procs("graphify", must_also_contain="extract")


def opencode_running() -> bool:
    return _real_procs("opencode")


def read_state() -> dict:
    if STATE_FILE.is_file():
        try:
            return json.loads(STATE_FILE.read_text())
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def write_state(state: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2))
    tmp.replace(STATE_FILE)


def newest_oc_log_mtime() -> datetime | None:
    """Fallback idle marker: newest ~/oc-work/*.log write time."""
    if not OC_WORK.is_dir():
        return None
    logs = list(OC_WORK.glob("*.log"))
    if not logs:
        return None
    newest = max(logs, key=lambda p: p.stat().st_mtime)
    return datetime.fromtimestamp(newest.stat().st_mtime, tz=timezone.utc)


def main() -> int:
    now = utc_now()

    # 1. graphify already going -- nothing to do.
    if graphify_running():
        return 0

    state = read_state()

    # 2. OpenCode busy right now -- note the time and wait.
    if opencode_running():
        state["last_seen_busy"] = iso(now)
        write_state(state)
        return 0

    # 3. Idle. Work out for how long.
    since = parse_iso(state.get("last_seen_busy", "")) or newest_oc_log_mtime()
    if since is None:
        # No evidence either way. Record now and wait a full window before acting,
        # rather than firing immediately on first run.
        state["last_seen_busy"] = iso(now)
        write_state(state)
        return 0

    idle_min = (now - since).total_seconds() / 60.0
    if idle_min < IDLE_MINUTES:
        return 0

    # Idle long enough -- restart graphify.
    if not RESTART_SCRIPT.is_file():
        print(f"WARNING: restart script missing: {RESTART_SCRIPT}")
        return 1

    res = subprocess.run(
        [sys.executable, str(RESTART_SCRIPT)], capture_output=True, text=True
    )
    out = (res.stdout or "").strip()
    err = (res.stderr or "").strip()

    state["last_restart"] = iso(now)
    state["last_seen_busy"] = iso(now)  # reset the window
    write_state(state)

    print(
        f"OpenCode idle {idle_min:.0f} min (>= {IDLE_MINUTES}); "
        f"restarted graphify on the remaining Oracle wiki."
    )
    if out:
        print(out)
    if err:
        print(f"stderr: {err}")
    return res.returncode


if __name__ == "__main__":
    sys.exit(main())
