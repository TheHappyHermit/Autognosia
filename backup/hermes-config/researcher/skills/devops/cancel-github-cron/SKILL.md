---
name: cancel-github-cron
description: Remove a scheduled GitHub cron job that runs a synchronization workflow.
category: devops
---
# Cancel GitHub Cron Job

## Description
Remove a scheduled GitHub cron job that runs a synchronization workflow.

## When to Use
When you need to disable a nightly or scheduled GitHub Actions cron job that is no longer needed.

## Steps
1. Identify the cron job name (e.g., `github-sync-nightly`).
2. Use the GitHub CLI to delete the workflow schedule or disable the workflow.
   - If using a cron schedule in `.github/workflows/*.yaml`, remove the `schedule:` block or set it to an empty list.
   - Alternatively, delete the workflow file if the entire workflow is no longer needed.
3. Commit and push the change to the repository.
4. Verify that the job no longer appears in the Actions tab under scheduled workflows.

## Example
```bash
# Edit the workflow file
nano .github/workflows/sync.yml
# Remove or comment out the schedule block:
# schedule:
#   - cron: '0 3 * * *'
# Save and exit.
git add .github/workflows/sync.yml
git commit -m "Disable nightly GitHub sync cron"
git push
```

## Verification
- Go to the repository's Actions page.
- Check that the workflow is no longer triggered on a schedule.
- Ensure manual runs still work if desired.

## Pitfalls
- Forgetting to push changes will leave the cron active on the remote.
- Removing the wrong workflow file can break other automations.
- If the workflow is used for other triggers (e.g., push, pull_request), consider only removing the schedule block instead of deleting the file.