# Cron cron vault path permission failure

## Symptom
Cron job attempts to write under a synced/vault-style path under user home such as `~/Documents/...` and `patch`/`write_file` fails with `Permission denied` on a temp file created next to the target. `cp`/`cp --backup` may also fail. The target file itself may still be readable.

## Likely cause
The agent process runs with a different effective UID/GID than the path owner, or the mount/remote-filesystem blocks create/rename operations even though owner/group look correct.

## Reproduction pattern
1. Confirm mismatch: `stat -c '%U %G %a %F' <dir> <file>` from the cron/shell context.
2. Verify workspace permissions separately from project repo permissions.
3. Verify ownership with `ls -ld <dir>` and effective identity in the shell.
4. Try creating a hidden file in the same directory.

## Detection checklist
- Read succeeds, append/write fails
- `cp` and backup copy fails with the same permission error
- Parent directory ownership differs from current effective user
- Path is under cloud-synced/vault-managed locations

## Fix pattern
1. Use a writer with the correct effective user/group context.
2. If escalation is unavailable, fail fast with explicit permission error instead of attempting partial state changes.
3. If the environment allows, prefer an explicitly owned staging directory outside the vault and sync via the vault manager.
