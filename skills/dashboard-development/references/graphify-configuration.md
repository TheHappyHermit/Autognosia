# Graphify Disable Thinking Configuration

**When:** Launching graphify extract on the Active Wiki or Oracle Brain to avoid excessive thinking tokens.

## Background

When using thinking-capable models with graphify, the model spends enormous tokens on chain-of-thought reasoning for structured extraction tasks that don't need it. This slows extraction and wastes tokens.

## Setup

Add `GRAPHIFY_DISABLE_THINKING=1` to the environment before running graphify extract:

```bash
# For Active Wiki
export OPENAI_BASE_URL="http://<V100_HOST>:8080/v1"
export OPENAI_API_KEY="sk-local"
export OPENAI_MODEL="/models/Qwen3.6-35B-A3B-Q4_K_M.gguf"
export GRAPHIFY_MAX_OUTPUT_TOKENS="98304"
export GRAPHIFY_DISABLE_THINKING=1

cd $HOME/.autognosia/active-wiki
python3 -c "..." # graphify extract command
```

## Verification

```bash
# Check the variable is set
env | grep GRAPHIFY_DISABLE_THINKING

# Check graphify output for thinking tokens
cat $HOME/.autognosia/logs/graphify-active-wiki.log | grep thinking
```

## When to Use

- Graphify semantic extraction on markdown wikis (docs only, no structured code)
- Any graphify run with thinking-capable models
- NOT needed for: AST extraction (deterministic, no LLM)

## When NOT to Use

- Graphify query/explain operations (need reasoning for natural language answers)
- Oracle brain extraction with non-thinking models

## Monitoring

```bash
# Watch progress
tail -f $HOME/.autognosia/logs/graphify-active-wiki.log

# Check extraction status
ps aux | grep graphify

# Verify output
ls -la $HOME/.autognosia/active-wiki/graphify-out/
```

## Related Scripts

- `~/.hermes/scripts/graphify_active_wiki.sh` - Active Wiki extraction
- `~/.hermes/scripts/graphify_oracle_brain.sh` - Oracle Brain extraction
- `~/.hermes/scripts/graphify_brain_extract.sh` - General brain extraction
