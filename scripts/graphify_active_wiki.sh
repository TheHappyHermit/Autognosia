#!/usr/bin/env bash
# Run graphify extraction on the ACTIVE WIKI only.
# V100-local, NO OpenRouter fallback (per Josh's hard rule). 96k client-side output cap.
set -u

cd $AUTOGNOSIA/active-wiki || exit 1

LOG=$AUTOGNOSIA/logs/graphify-active-wiki.log

{
  echo ""
  echo "=== ACTIVE-WIKI GRAPHIFY $(date -u '+%Y-%m-%dT%H:%M:%SZ') — V100 only, 96k cap ==="
} >> "$LOG"

export OPENAI_BASE_URL="http://<V100_HOST>:8080/v1"
export OPENAI_API_KEY="sk-local"
export OPENAI_MODEL="/models/Qwen3.6-35B-A3B-Q4_K_M.gguf"
export GRAPHIFY_MAX_OUTPUT_TOKENS="98304"
export GRAPHIFY_DISABLE_THINKING=1

exec graphify extract . \
  --backend openai \
  --max-concurrency 1 \
  --token-budget 24000 \
  --api-timeout 1800 >> "$LOG" 2>&1
