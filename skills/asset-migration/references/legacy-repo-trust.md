# Case Study: hermes-autognosia → autognosia Image Migration

## Problem
The user uploaded new images to the `hermes-autognosia/` repo that were meant to replace text boxes in the `autognosia-repo/` README. Instead of adding the new images, I blindly copied ALL files from hermes-autognosia/assets/ into autognosia-repo/assets/, overwriting the user's newer "Autognosia"-branded images with older "Hermes Autognosia"-branded versions.

## What Went Wrong
- Assumed files in hermes-autognosia were newer versions of the same content
- Didn't compare file sizes or verify content before copying
- Didn't check which images were actually new vs. existing
- Replaced 9 images with older versions (different sizes confirmed different versions)
- The result: images in the README all showed "Hermes Autognosia" branding instead of "Autognosia"

## Resolution
1. Found `autognosia-clean/` directory that had the correct versions (created as a backup)
2. Copied correct versions from `autognosia-clean/assets/` back to `autognosia-repo/assets/`
3. Reverted bad git commits with `git reset --hard 4810638`
4. Force-pushed to restore clean state: `git push origin main --force`

## Key Files Involved
- Source (legacy, DO NOT blindly copy): `/home/<USER>/hermes-autognosia/assets/`
- Target: `/home/<USER>/autognosia-repo/assets/`
- Backup of correct versions: `/home/<USER>/autognosia-clean/assets/`
- README before changes: `git show 4810638:README.md`

## Lesson
Always inventory both sides, compare file sizes, and verify content before any cross-repo copy. New images should be ADDED, not used to overwrite existing ones.
