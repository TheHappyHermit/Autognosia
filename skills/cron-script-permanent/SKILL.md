---
name: cron-script-permanent
description: Manage Hermes cron jobs — convert transient temp-file scripts to permanent ones, and maintain them in ~/.hermes/scripts/ and the repo.
---

# Cron Script Management

Use when creating or maintaining Hermes cron jobs that execute scripts. This covers both local cron jobs (`~/.hermes/scripts/`) and repo scripts (`autognosia-repo/scripts/`).

## The Problem with Transient Scripts

Cron jobs that generate scripts at runtime (e.g., `/tmp/hermes-verify-graphify-integrity.py`) waste tokens and create stale artifacts:
- Each cron tick regenerates the script from scratch in the agent's prompt
- Temp files accumulate in `/tmp/` and are rarely cleaned up
- No version history or review capability
- Script logic is invisible until the cron job runs

## The Right Way

1. **Write the script to a permanent location:**
   - Local scripts: `~/.hermes/scripts/<name>.py`
   - Repo scripts: `<repo>/scripts/<name>.py`

2. **Update the cron job to reference the permanent script:**
   ```python
   # Update the cron job definition
   job['prompt'] = f"Run the verification script: python3 $HOME/.hermes/scripts/{name}.py"
   ```

3. **Test the script manually before relying on it:**
   ```bash
   python3 $HOME/.hermes/scripts/<name>.py 2>&1
   ```

4. **Clean up any temp files** from previous transient runs:
   ```bash
   rm -f /tmp/hermes-verify-*.py /tmp/check_*.py /tmp/update_cron*.py
   ```

5. **Commit repo scripts** and push, so the script is versioned and reviewed.

## Pitfalls

- **Cron jobs may error before the script is installed.** If a cron job references a script that doesn't exist in `~/.hermes/scripts/`, it fails silently. Always check `last_status` after updating.
- **Heredoc quoting in execute_code is fragile.** Use `write_file()` instead of inline heredocs when creating scripts. Heredocs often fail due to Python string escaping issues.
- **Don't leave temp files.** After converting a transient script to a permanent one, delete any `/tmp/` remnants.

## Workflow

1. Identify the cron job creating transient scripts (check `~/.hermes/cron/output/` for recent runs)
2. Extract the script logic from the cron job's prompt or temp files
3. Write it as a permanent script
4. Update the cron job definition
5. Test manually
6. Clean up temp files
7. Commit to repo if appropriate

## Related

- See `references/cron-verify-stack.md` for the verify_stack.py pattern.
