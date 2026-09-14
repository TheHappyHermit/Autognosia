#!/usr/bin/env python3
"""Remove tracked unwanted files from git index - v2."""
import os
import subprocess

os.chdir("/home/josh434")

# Get all files currently tracked in unwanted dirs
result = subprocess.run(
    ["git", "ls-files", "-z", "cron/", "output/", ".vscode/", "scheduled-orbit*"],
    capture_output=True, text=False
)
files = result.stdout.split(b"\0")
files = [f.decode() for f in files if f]
files = [f for f in files if f]  # remove empty strings
print(f"Found {len(files)} tracked files to remove")

# Get list of files that actually exist on disk
existing = []
for f in files:
    if os.path.exists(f):
        existing.append(f)

print(f"{len(existing)} exist on disk, {len(files) - len(existing)} only in index")

# Remove all from index (both existing and index-only)
for i in range(0, len(files), 500):
    batch = files[i:i+500]
    result = subprocess.run(
        ["git", "rm", "--cached", "--"] + batch,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        # Some files may already be removed - that's ok
        errors = [l for l in result.stderr.split("\n") if "did not match" in l]
        if errors:
            print(f"  {len(errors)} files already removed from index (ok)")
        else:
            print(f"  Batch {i//500}: {result.stderr[:200]}")

# Verify
result = subprocess.run(
    ["git", "ls-files", "cron/", "output/", ".vscode/", "scheduled-orbit*"],
    capture_output=True, text=True
)
remaining = [l for l in result.stdout.strip().split("\n") if l]
print(f"\nFinal: {len(remaining)} files still tracked")

if remaining:
    print("Remaining files:")
    for f in remaining[:20]:
        print(f"  {f}")
    if len(remaining) > 20:
        print(f"  ... and {len(remaining)-20} more")
