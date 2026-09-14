#!/usr/bin/env python3
"""Remove tracked unwanted files from git index in one process."""
import os
import subprocess

os.chdir("/home/josh434")

# Files/dirs to remove from tracking
targets = [
    "cron/.fire-*.lock",
    "cron/output/",
    "cron/executions.db",
    "cron/notepad.db", 
    "cron/catch_up_occurrences",
    "cron/usage_audit.jsonl",
    "cron/ticker_heartbeat",
    "cron/ticker_last_success",
    "cron/sleeper.sh",
    "cron/CRON-SETUP-TEMPLATE.md",
    "cron/jobs.json.bak-audit",
    ".vscode/",
    "scheduled-orbit*",
]

to_remove = []
for t in targets:
    if "*" in t:
        import glob
        to_remove.extend(glob.glob(t))
    elif os.path.isdir(t):
        for root, dirs, files in os.walk(t):
            for f in files:
                to_remove.append(os.path.join(root, f))
            for d in dirs:
                to_remove.append(os.path.join(root, d))
    else:
        to_remove.append(t)

to_remove = list(set(to_remove))
to_remove.sort()
print(f"Removing {len(to_remove)} files from git index")

# Batch into git rm calls (max 1000 args each)
batch_size = 1000
for i in range(0, len(to_remove), batch_size):
    batch = to_remove[i:i+batch_size]
    subprocess.run(["git", "rm", "--cached", "--"] + batch, check=False)

print("Done. Checking remaining...")
result = subprocess.run(["git", "ls-files", "cron/", "output/", ".vscode/"], capture_output=True, text=True)
remaining = [l for l in result.stdout.strip().split("\n") if l]
print(f"{len(remaining)} files still tracked")
for f in remaining[:10]:
    print(f"  {f}")
if len(remaining) > 10:
    print(f"  ... and {len(remaining)-10} more")
