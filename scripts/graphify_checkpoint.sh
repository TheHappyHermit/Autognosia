#!/usr/bin/env bash
# 25-minute checkpoint on the graphify re-run after the GRAPHIFY_MAX_OUTPUT_TOKENS fix.
LOG=/home/home_user/.autognosia/logs/graphify-oracle-brain.log
CACHE=/home/home_user/.autognosia/oracle/brain/graphify-out/cache/semantic

sleep 1500

echo "=== 25-MIN CHECKPOINT $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="
NOW=$(find "$CACHE" -type f 2>/dev/null | wc -l)
echo "semantic cache: $NOW  (was 766 at restart, delta $((NOW - 766)))"
echo "invalid JSON since restart: $(awk '/=== RESTART/{f=1} f' "$LOG" | grep -c 'invalid JSON')"
echo "max_tok truncations:        $(awk '/=== RESTART/{f=1} f' "$LOG" | grep -c 'max_completion_tokens')"
echo "chunks done:               $(awk '/=== RESTART/{f=1} f' "$LOG" | grep -cE 'chunk [0-9]+/[0-9]+ done')"

if pgrep -f 'graphify extract' >/dev/null; then
  echo "status: RUNNING"
else
  echo "status: STOPPED"
fi

echo "--- log tail ---"
tail -4 "$LOG"
