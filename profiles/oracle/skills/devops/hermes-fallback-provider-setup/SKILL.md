---
name: hermes-fallback-provider-setup
category: devops
description: Configure and troubleshoot Hermes Agent fallback providers (fallback_providers in config.yaml)
---

# Hermes Fallback Provider Setup & Troubleshooting

## When to Use
- Setting up or modifying `fallback_providers` in Hermes config
- Fallback providers not activating when primary fails
- Adding a new provider as fallback

## Config Format (CRITICAL)

The `fallback_providers` list requires **dict entries**, not strings. Wrong format silently produces an empty fallback chain.

**WRONG** (strings — silently filtered out, nothing ever falls back):
```yaml
fallback_providers:
- openrouter/nvidia/nemotron-3-super-120b-a12b:free
- gemini/gemini-2.5-flash-lite
```

**CORRECT** (dicts with provider + model):
```yaml
fallback_providers:
- provider: openrouter
  model: nvidia/nemotron-3-super-120b-a12b:free
  base_url: null
  api_key_env: OPENROUTER_API_KEY
- provider: gemini
  model: gemini-2.5-flash-lite
```

The code filters entries with: `isinstance(f, dict) and f.get(\"provider\") and f.get(\"model\")`. Any non-dict or missing-key entries are silently dropped.

## Provider Name Registry

Provider names must match exactly what's in `hermes_cli/auth.py:PROVIDER_REGISTRY`. Common mismatches:

| User thinks | Correct provider name | Notes |
|---|---|---|
| `dashscope` | `alibaba` | DashScope = Alibaba Cloud. Needs `DASHSCOPE_API_KEY` |
| `google` | `gemini` | Alias exists but use `gemini` |
| `glm` | `zai` | Alias exists but use `zai` |

Full supported provider list (from docs):
`openrouter`, `nous`, `openai-codex`, `copilot`, `gemini`, `zai`, `kimi-coding`, `minimax`, `deepseek`, `opencode-zen`, `opencode-go`, `alibaba`, `xiaomi`, `anthropic`, `custom`

## Debugging Steps

### 1. Verify config loads correctly
Parse the YAML and confirm all entries are dicts with both `provider` and `model` keys.

### 2. Test each provider/model individually
Make a simple chat completion call with `messages=[{"role": "user", "content": "Say OK"}]`, `max_tokens=5`, timeout 15s.

### 3. Check API keys exist in the env file
Look for the relevant key env vars in the Hermes `.env` file.

### 4. Check provider resolution code
- `agent/auxiliary_client.py:resolve_provider_client()` — central router
- `hermes_cli/auth.py:PROVIDER_REGISTRY` — all registered providers
- `agent/auxiliary_client.py:_PROVIDER_ALIASES` — name aliases

## Provider Base URLs & Key Env Vars

| Provider | Base URL | Key Env Var |
|---|---|---|
| openrouter | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` |
| gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | `GEMINI_API_KEY` or `GOOGLE_API_KEY` |
| zai | `https://api.z.ai/api/paas/v4` | `GLM_API_KEY` |
| opencode-zen | `https://opencode.ai/zen/v1` | `OPENCODE_ZEN_API_KEY` |
| alibaba | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` | `DASHSCOPE_API_KEY` |
| openai-codex | `https://chatgpt.com/backend-api/codex` | OAuth (hermes model) |

## Known Pitfalls

### Qwen CLI free tier discontinued (2026-04-15)
The Qwen CLI OAuth free tier was discontinued. To use Qwen as fallback, switch to Alibaba Cloud Coding Plan or set a paid `DASHSCOPE_API_KEY` with provider `alibaba`.

### OpenRouter credit limit
All OpenRouter models return 403 when credits are exhausted. Check at openrouter.ai/settings/keys.

### OAuth providers not all wired into fallback
Only `nous` and `openai-codex` have OAuth handlers in `resolve_provider_client()`. Other OAuth providers (`qwen-oauth`, `copilot-acp`) fall through to "not directly supported". Use `custom` provider with explicit `base_url` as workaround.

### Silent filtering
Invalid fallback entries are silently dropped — no warning at startup. Always verify after editing.
