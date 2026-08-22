# LMStudio + api_key_env Mismatch Pattern

## The Bug

When the default model uses `provider: lmstudio` (local proxy, no API key needed) but has `api_key_env: OPENROUTER_API_KEY` set, cron jobs fail with:

```
RuntimeError: Error code: 401 - {'detail': 'Unauthorized'}
```

## Why It Happens

- Cron jobs run in a **fresh session** — they do NOT inherit shell environment variables
- The current shell may have `OPENROUTER_API_KEY` set, but the cron job's environment does not
- `env | grep API_KEY` in your interactive shell is **misleading** — it shows shell vars, not cron vars
- LMStudio is a local proxy that doesn't require any API key

## Diagnostic Steps

1. **Check if the env var exists in cron context:**
   ```bash
   env | grep OPENROUTER_API_KEY  # If blank, cron jobs won't have it either
   ```

2. **Check the default model config:**
   ```bash
   grep -A3 "model:" ${HOME}/.hermes/config.yaml | head -6
   ```
   If you see `provider: lmstudio` AND `api_key_env: ...`, that's the mismatch.

3. **Verify LMStudio is reachable:**
   ```bash
   curl -s http://<lmstudio-ip>:1234/v1/models | head -5
   ```

## Fix

Remove the `api_key_env` line from the default model in `${HOME}/.hermes/config.yaml`:

```yaml
model:
  default: qwen/qwen3.6-35b-a3b
  provider: lmstudio
  base_url: http://10.1.1.151:1234/v1
  # REMOVE: api_key_env: OPENROUTER_API_KEY
```

Then restart the gateway (it auto-restarts with `--replace` mode).

## When This Applies

- `provider: lmstudio` + any `api_key_env` → **always a bug** (LMStudio doesn't need a key)
- `provider: openrouter` + `api_key_env: OPENROUTER_API_KEY` → **only a bug if the env var isn't set**
- `provider: mistral` + `api_key_env: MISTRAL_API_KEY` → check if the env var exists in cron env

## Prevention

When configuring a new model:
- Local providers (lmstudio, ollama, vllm) → **no api_key_env**
- Cloud providers → **always verify the env var exists** with `env | grep <VAR_NAME>` before assuming it's set
