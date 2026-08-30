#!/usr/bin/env bash
# Graphify extraction for the ORACLE BRAIN wiki.
#
# iGPU-local (Ollama), NO OpenRouter fallback (Josh's hard rule — graphify never leaves the
# local iGPU at 10.1.1.10:11434).
#
set -u

cd /home/josh434/.autognosia/oracle/brain || exit 1

LOG=/home/josh434/.autognosia/logs/graphify-oracle-brain.log

{
  echo ""
  echo "=== ORACLE-BRAIN GRAPHIFY $(date -u '+%Y-%m-%dT%H:%M:%SZ') — iGPU Ollama, qwen3.5:9b ==="
} >> "$LOG"

export OPENAI_BASE_URL="http://10.1.1.10:11434/v1"
export OPENAI_API_KEY="sk-local"
export OPENAI_MODEL="qwen3.5:9b"
export GRAPHIFY_DISABLE_THINKING="1"
export GRAPHIFY_MAX_OUTPUT_TOKENS="98304"

exec graphify extract . \
  --backend openai \
  --max-concurrency 1 \
  --token-budget 24000 \
  --api-timeout 3600 >> "$LOG" 2>&1
