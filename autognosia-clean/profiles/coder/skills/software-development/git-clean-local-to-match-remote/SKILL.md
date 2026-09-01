---
name: git-clean-local-to-match-remote
category: software-development
description: Synchronize local GitHub repository with remote by removing untracked files and resetting to remote state.
---

## Trigger Conditions
- User wants local GitHub repository to exactly match remote state
- Local repository has extra files, directories, or commits not in remote
- Need to synchronize local workspace with origin/main branch

## Workflow Steps
1. **Check current status**: `git status` to see local changes and untracked files
2. **Fetch latest remote**: `git fetch origin` to update remote references
3. **Verify branch**: Ensure you're on the correct branch (usually `main`)
4. **Remove untracked files/directories**: 
   - List what will be removed: `git clean -n -d`
   - Actually remove: `git clean -f -d`
5. **Reset to remote state**: `git reset --hard origin/main` (or appropriate branch)
6. **Verify clean state**: `git status` should show clean working tree

## Safety Precautions
- **Always dry-run first**: Use `git clean -n -d` to see what will be deleted
- **Verify branch**: Confirm you're resetting to the correct remote branch
- **Backup important local work**: Stash or commit any wanted local changes first
- **External files**: This skill only affects the git-tracked workspace; external files (like compliance modules) are untouched

## Verification
- After completion: `git status` shows clean working tree
- Local branch should be identical to `origin/main`
- No untracked files remain

## Example Usage
```bash
# From repository root
git fetch origin
git clean -n -d  # Dry run - review output
git clean -f -d  # Actually remove untracked files/dirs
git reset --hard origin/main
git status  # Should be clean
```

## Notes
- This preserves git history and remote tracking
- Only removes files not tracked by git (untracked files/directories)
- Does not affect files outside the git workspace