#!/usr/bin/env bash
#
# Graphify extraction — Active Wiki only
# Runs semantic extraction on ~/.autognosia/active-wiki
# Parameters tuned for Qwen3.6-35B-A3B-Q4_K_M on llama.cpp (10.1.1.10:8080)
#
# Usage: bash ~/.hermes/scripts/graphify_active_wiki.sh
#
# NOTE: This script is superseded by graphify_active_wiki_py.py which uses
# a Python wrapper that sets env vars internally (more reliable). The cron job
# uses the Python wrapper. This shell script is kept for manual runs.
#

set -euo pipefail

SOURCE="$HOME/.autognosia/active-wiki"

LOG_DIR="$HOME/.autognosia/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/graphify-active-wiki.log"

# Rotate if too large
if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.1"
fi

{
echo "=== graphify-active-wiki started at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Source: $SOURCE"
echo "Token budget: 5000 | Concurrency: 1 | API timeout: 900s"
echo "Max output tokens: 131072 | Max retries: 0"
echo ""

graphify extract research \
  --token-budget 5000 \
  --max-concurrency 1 \
  --api-timeout 900 \
  --no-cluster \
  --no-gitignore \
  --force \
  --backend openai

echo ""
echo "=== graphify-active-wiki finished at $(date -u +%Y-%m-%dT%H:%M:%SZ) exit=$? ==="
} >> "$LOG_FILE" 2>&1
