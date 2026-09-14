#!/usr/bin/env bash
set -euo pipefail

cd /home/josh434

echo "=== Removing 1086 tracked files from git index ==="

# Remove cron/ .fire-*.lock files
git rm --cached cron/.fire-*.lock 2>/dev/null || true

# Remove cron/ output/ transcripts
git rm --cached -r cron/output/ 2>/dev/null || true

# Remove cron/ database files
git rm --cached cron/executions.db cron/notepad.db cron/catch_up_occurrences cron/usage_audit.jsonl cron/ticker_heartbeat cron/ticker_last_success 2>/dev/null || true

# Remove .vscode
git rm --cached -r .vscode/ 2>/dev/null || true

# Remove remaining cron/ files
git rm --cached cron/CRON-SETUP-TEMPLATE.md cron/jobs.json.bak-audit 2>/dev/null || true

# Remove sleeper script if tracked
git rm --cached cron/sleeper.sh 2>/dev/null || true

# Remove scheduled-orbit files if tracked  
git rm --cached scheduled-orbit* 2>/dev/null || true

echo "=== Remaining tracked unwanted files ==="
REMAINING=$(git ls-files cron/ output/ .vscode/ 2>/dev/null | wc -l)
echo "$REMAINING files still tracked"

if [ "$REMAINING" -gt 0 ]; then
    echo "=== Force removing remaining ==="
    git ls-files cron/ output/ .vscode/ 2>/dev/null | xargs -r git rm --cached --
    echo "Done"
fi

echo "=== Final count ==="
FINAL=$(git ls-files cron/ output/ .vscode/ 2>/dev/null | wc -l)
echo "$FINAL files still tracked"
