#!/usr/bin/env python3
"""Remove tracked unwanted files from git index - v3."""
import os
import subprocess

os.chdir("/home/josh434")

# Get all files currently tracked in unwanted dirs
result = subprocess.run(
    ["git", "ls-files", "-z", "cron/", "output/", ".vscode/", "scheduled-orbit*"],
    capture_output=True, text=False
)
files = result.stdout.split(b"\0")
files = [f.decode() for f in files if f and f != b""]
print(f"Found {len(files)} tracked files to remove")

# Use git update-index --force-remove for files that don't exist on disk
# and git rm --cached for files that do
to_remove_via_rm = []
to_remove_via_update = []

for f in files:
    if os.path.exists(f):
        to_remove_via_rm.append(f)
    else:
        to_remove_via_update.append(f)

print(f"  {len(to_remove_via_rm)} exist on disk -> git rm --cached")
print(f"  {len(to_remove_via_update)} index-only -> git update-index --force-remove")

# Remove files that exist on disk
for i in range(0, len(to_remove_via_rm), 500):
    batch = to_remove_via_rm[i:i+500]
    result = subprocess.run(
        ["git", "rm", "--cached", "--"] + batch,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  Batch rm {i//500}: {result.stderr[:200]}")

# Remove files that are index-only
for i in range(0, len(to_remove_via_update), 500):
    batch = to_remove_via_update[i:i+500]
    result = subprocess.run(
        ["git", "update-index", "--force-remove"] + batch,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  Batch update {i//500}: {result.stderr[:200]}")

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
    
# Show what's actually in the index now
result2 = subprocess.run(
    ["git", "ls-files", "-z", "cron/", "output/", ".vscode/", "scheduled-orbit*"],
    capture_output=True, text=False
)
files2 = result2.stdout.split(b"\0")
files2 = [f.decode() for f in files2 if f and f != b""]
print(f"\nTotal unique tracked files in those dirs: {len(files2)}")
