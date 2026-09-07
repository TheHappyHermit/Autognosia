#!/usr/bin/env bash
# Daily backup for Autognosia
set -euo pipefail

BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Backup personal-agent and .hermes (excluding heavy/irrelevant files)
tar czf "$BACKUP_DIR/autognosia-$TIMESTAMP.tar.gz" \
  "$HOME/personal-agent/" \
  "$HOME/.hermes/config.yaml" \
  "$HOME/.hermes/config/architecture.yaml" \
  --exclude='*.pyc' \
  --exclude='__pycache__' \
  --exclude='.git' \
  --exclude='state.db' \
  --exclude='cache/' \
  2>&1 || echo "[warn] Some files may have been excluded"

# Backup honcho database
if [ -d "$HOME/honcho" ]; then
  tar czf "$BACKUP_DIR/honcho-db-$TIMESTAMP.tar.gz" \
    /var/lib/docker/volumes/ 2>/dev/null || echo "[warn] Could not backup Docker volumes"
fi

echo "Backup completed: $BACKUP_DIR/autognosia-$TIMESTAMP.tar.gz"

# Clean up old backups (keep last 7 daily)
cd "$BACKUP_DIR"
ls -t autognosia-*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
