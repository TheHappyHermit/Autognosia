---
name: asset-migration
description: Safely migrate assets (images, files) between repos or directories without overwriting newer versions or corrupting branding.
---

# Asset Migration

Use when moving images, docs, or other assets between repositories or directories. Common in README updates, logo replacements, or consolidating assets from legacy projects.

## Core Rule

**NEVER blindly copy files from a legacy repo into a target repo.** Legacy repos often contain older versions with outdated branding (e.g., "Hermes Cortex" vs "Autognosia"). Always verify versions before replacing.

## Workflow

1. **Inventory both sides**
   ```bash
   # List all assets in each location
   ls -la /path/to/source/assets/*.jpg | awk '{print $NF, $5}'
   ls -la /path/to/target/assets/*.jpg | awk '{print $NF, $5}'
   ```

2. **Identify new assets** — files present in source but NOT in target:
   ```bash
   for f in /path/to/source/assets/*; do
     base=$(basename "$f")
     if [ ! -f "/path/to/target/assets/$base" ]; then
       echo "NEW: $base"
     fi
   done
   ```

3. **Compare sizes** for files present in both — different sizes indicate different versions:
   ```bash
   for base in *.jpg; do
     if [ -f "source/$base" ] && [ -f "target/$base" ]; then
       src_size=$(stat -c '%s' "source/$base")
       tgt_size=$(stat -c '%s' "target/$base")
       if [ "$src_size" != "$tgt_size" ]; then
         echo "DIFFERENT: $base (src=$src_size, tgt=$tgt_size)"
       fi
     fi
   done
   ```

4. **Decide per file:**
   - **New files** → copy to target (safe)
   - **Different sizes** → DO NOT copy unless you've confirmed the source version is newer/correct. Check which has the correct branding, timestamps, or source of truth.
   - **Same size** → skip (no change)

5. **Copy only the new/confirmed-correct files.** Never copy from a legacy repo without manual verification of content.

## Pitfalls

- **Legacy repo contamination:** A legacy repo (e.g., the old `~/hermes-cortex/` directory) may contain old branded images. Copying them overwrites newer versions in the target repo (e.g., `autognosia-repo/`). The result is all images suddenly show the old brand name.
- **File size is a quick check, not proof:** Different sizes suggest different versions, but you must verify which is correct (check timestamps, visual content, or source of truth).
- **Git history corruption:** Once you commit the wrong images to the repo, reverting requires `git reset --hard` to the last clean commit. Keep a backup directory of correct versions.

## Recovery

If you accidentally overwrote correct images:
1. Find the last clean git commit: `git log --oneline`
2. Reset to it: `git reset --hard <commit-hash>`
3. Copy correct versions back from backup
4. Commit: `git add -A && git commit -m "Restore correct assets"`

## Related

- See `references/legacy-repo-trust.md` for the legacy repo → autognosia case study.
