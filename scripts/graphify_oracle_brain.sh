#!/usr/bin/env bash
# Graphify extraction for the ORACLE BRAIN wiki.
#
# V100-local, NO OpenRouter fallback (Josh's hard rule — graphify never leaves the
# local V100 at <V100_HOST>). 96k client-side output cap.
#
# WHY 98304 (96k): graphify defaults max_completion_tokens to 8192 (its own bug
# #1365, llm.py:1839). That truncates JSON mid-object, making it unparseable, so
# whole chunks get discarded as "LLM returned invalid JSON". The SERVER has no
# output cap at all (n_predict=-1) and n_ctx=262144, so there is plenty of
# headroom. GRAPHIFY_MAX_OUTPUT_TOKENS is the documented override (llm.py:305).
set -u

cd $AUTOGNOSIA/oracle/brain || exit 1

LOG=$AUTOGNOSIA/logs/graphify-oracle-brain.log

{
  echo ""
  echo "=== RESTART $(date -u '+%Y-%m-%dT%H:%M:%SZ') with GRAPHIFY_MAX_OUTPUT_TOKENS=98304 (96k) ==="
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
