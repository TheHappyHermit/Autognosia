#!/usr/bin/env python3
"""Audit Hermes cron jobs: does every referenced script actually exist?

Reads the live cron job table and extracts every filesystem path that jobs
reference, both the `script` field and any path mentioned inside the prompt
text. Reports each as EXISTS or MISSING.

A cron job pointing at a nonexistent script fails silently every tick and
shows only as last_status=error, which never says WHY. This names the file.
"""

import json
import os
import re
import subprocess
import sys

CRON_JSON_CANDIDATES = [
    os.path.expanduser("~/.hermes/cron/jobs.json"),
    os.path.expanduser("~/.autognosia/cron/jobs.json"),
]

SCRIPT_DIRS = [
    os.path.expanduser("~/.hermes/scripts"),
    os.path.expanduser("~/.autognosia/scripts"),
]

PATH_RE = re.compile(r"(/home/[^\s\"'|;)>]+\.(?:py|sh|bash))")


def load_jobs():
    for path in CRON_JSON_CANDIDATES:
        if os.path.isfile(path):
            try:
                with open(path) as fh:
                    data = json.load(fh)
            except (json.JSONDecodeError, OSError) as exc:
                print(f"  ! {path} unreadable: {exc}")
                continue
            if isinstance(data, dict):
                for key in ("jobs", "items", "data"):
                    if isinstance(data.get(key), list):
                        return path, data[key]
                return path, list(data.values())
            if isinstance(data, list):
                return path, data
    return None, []


def resolve_script(name):
    """A bare `script` name resolves against the known script dirs."""
    if os.path.isabs(name):
        return name if os.path.isfile(name) else None
    for directory in SCRIPT_DIRS:
        candidate = os.path.join(directory, name)
        if os.path.isfile(candidate):
            return candidate
    return None


def main():
    src, jobs = load_jobs()
    if not jobs:
        print("Could not load any cron job definitions.")
        return 1

    print(f"Cron job audit  (source: {src})")
    print(f"jobs found: {len(jobs)}")

    missing = []
    checked = 0

    for job in jobs:
        if not isinstance(job, dict):
            continue
        name = job.get("name") or job.get("job_id") or "<unnamed>"
        problems = []

        script = job.get("script")
        if script:
            resolved = resolve_script(script)
            checked += 1
            if not resolved:
                problems.append(f"script not found: {script}")

        prompt = job.get("prompt") or ""
        for path in sorted(set(PATH_RE.findall(prompt))):
            checked += 1
            if not os.path.isfile(path):
                problems.append(f"prompt path missing: {path}")

        if problems:
            missing.append((name, job.get("job_id"), problems))

    print(f"path references checked: {checked}")

    if not missing:
        print("\nRESULT: OK - every referenced script exists.")
        return 0

    print(f"\nRESULT: {len(missing)} job(s) reference missing files:\n")
    for name, job_id, problems in missing:
        print(f"  [{job_id}] {name}")
        for problem in problems:
            print(f"      - {problem}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
