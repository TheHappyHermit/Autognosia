#!/usr/bin/env bash
#
# Graphify extraction — Oracle Brain only
# Runs semantic extraction on ~/.autognosia/oracle/brain
# Parameters tuned for Qwen3.6-35B-A3B-Q4_K_M on V100 (10.1.1.10:8080)
#
# Usage: bash ~/.hermes/scripts/graphify_oracle_brain.sh
#

set -euo pipefail

SOURCE="$HOME/.autognosia/oracle/brain"

LOG_DIR="$HOME/.autognosia/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/graphify-oracle-brain.log"

# Rotate if too large
if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.1"
fi

{
echo "=== graphify-oracle-brain started at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Source: $SOURCE"
echo "Token budget: 5000 | Concurrency: 1 | API timeout: 900s"
echo "Max output tokens: 131072 | Max retries: 0"
echo ""

graphify extract "$SOURCE" \
  --token-budget 5000 \
  --max-concurrency 1 \
  --api-timeout 900 \
  --no-cluster

echo ""
echo "=== graphify-oracle-brain finished at $(date -u +%Y-%m-%dT%H:%M:%SZ) exit=$? ==="
} >> "$LOG_FILE" 2>&1
