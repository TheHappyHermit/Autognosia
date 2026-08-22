# Git Credential Helper Pattern for Non-Interactive GitHub Pushes

Use `gh auth token` with a local credential helper to enable scripted/CI pushes without SSH keys or interactive prompts.

## Pattern

```bash
# After cloning the repo (HTTPS URL)
cd /path/to/repo
git config --local credential.helper '!f() { echo "username=<GITHUB_USER>"; echo "password=$(gh auth token)"; }; f'
git push origin main
```

## Why This Works

- `gh auth token` outputs the current GitHub CLI OAuth token
- The credential helper shell function returns username + password on demand
- `--local` scopes it to this repo only (no global config pollution)
- Works in cron, CI, background scripts, or any non-interactive context

## Security Notes

- Token has same scopes as `gh auth login` (repo, workflow, admin:org, etc.)
- Token is never written to disk (only in memory during push)
- HTTPS URL required (not SSH `git@github.com:`)
- Token expires per GitHub policy; `gh auth refresh` if needed

## Variants

### With explicit username (if not inferrable from remote)
```bash
git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
```

### In a script with error handling
```bash
#!/bin/bash
set -euo pipefail
REPO_DIR="/tmp/my-backup"
cd "$REPO_DIR"
git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
if ! git push origin main; then
    echo "Push failed - check gh auth status and repo permissions"
    exit 1
fi
```

### For multiple remotes (origin + myfork)
```bash
# Configure for all remotes
git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
git push origin main
git push myfork master
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| `fatal: could not read Username` | Remote is SSH URL (`git@github.com:...`). Change to HTTPS: `git remote set-url origin https://github.com/user/repo.git` |
| `Permission denied (publickey)` | Same as above — SSH URL triggers SSH auth. Use HTTPS. |
| `could not read Password` | Credential helper not invoked. Ensure `--local` scope and function syntax is correct (single quotes around whole function). |
| `gh auth token` fails | Run `gh auth login` first, or `gh auth refresh` if token expired. |

## When to Use

- Cron jobs that push backups
- CI/CD pipelines without SSH keys
- Background agent scripts
- Any non-interactive context where you have `gh` CLI authenticated

## When NOT to Use

- Interactive development (SSH keys are fine there)
- Environments without `gh` CLI installed
- When you need fine-grained token scopes different from your `gh` login