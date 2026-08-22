---
name: hermes-provider-config
description: Configure custom LLM providers and the /model picker.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hermes, provider, config, llama-cpp, lmstudio, ollama, openai-compatible, custom-endpoint, model-picker]
---

# Hermes Provider Configuration

Configure custom LLM providers (llama.cpp, LM Studio, Ollama, OpenAI-compatible endpoints) and troubleshoot `/model` picker issues in Hermes Agent.

## When to use

- User wants to add a custom OpenAI-compatible endpoint as a provider
- User asks why a provider doesn't show up in `/model` picker
- User gets context window or provider resolution errors
- User wants to switch between local and cloud providers

## Provider Configuration

### Named Provider (Recommended)

Define a named provider in `config.yaml`:

```yaml
providers:
  llamaCPP:
    api: http://10.1.1.10:8080/v1
    default_model: Qwen3.8-27B-UD-Q4_K_XL
    transport: chat_completions

model:
  default: Qwen3.8-27B-UD-Q4_K_XL
  provider: llamaCPP    # Must match the providers: key exactly
```

**Critical:** `model.provider` must match the `providers:` key exactly. Do NOT use `custom:` prefix for named providers.

### Bare Custom Endpoint

For one-off endpoints without a named provider:

```yaml
model:
  default: my-model
  provider: custom
  base_url: http://localhost:8080/v1
```

## The /model Picker Pipeline

The interactive `/model` picker in Telegram/Discord calls:

1. `list_picker_providers()` in `hermes_cli/model_switch.py`
2. Which calls `list_authenticated_providers()`
3. Which checks:
   - Built-in providers (section 1) — env vars + credential pool
   - Hermes overlays (section 2) — Nous, Copilot, etc.
   - Canonical providers (section 2b) — catch-all
   - User-defined endpoints (section 3) — `providers:` in config.yaml
   - Custom providers (section 4) — `custom_providers:` in config.yaml

Providers are filtered out if:
- No credentials found
- Model list is empty AND not a custom endpoint with `api_url`
- Provider is in `model_catalog.excluded_providers`

## Common Pitfalls

### Context Window Too Small

Hermes requires **64,000 tokens minimum** context window. If your server reports less:

```yaml
model:
  context_length: 131072  # Set to your model's real context window
```

This is required when the model's metadata reports a smaller window than the model actually supports (common with quantized models).

### Provider Name Mismatch

```yaml
# WRONG — "custom:" prefix is for bare endpoints only
model:
  provider: custom:llamaCPP

# CORRECT — named providers use the bare key
model:
  provider: llamaCPP
```

### Provider Not Showing in Picker

If a configured provider doesn't appear in `/model`:

1. Check `list_authenticated_providers()` returns it:
   ```python
   from hermes_cli.model_switch import list_authenticated_providers
   results = list_authenticated_providers(
       current_provider=cfg.get('model', {}).get('provider', ''),
       current_base_url=cfg.get('model', {}).get('base_url', ''),
       user_providers=cfg.get('providers'),
       custom_providers=get_compatible_custom_providers(cfg),
       for_picker=True,
   )
   ```

2. Check gateway logs for errors:
   ```bash
   grep -i "error\|fail\|context" ${HOME}/.hermes/logs/gateway.log | tail -30
   ```

3. Verify the Telegram adapter has `send_model_picker` method

### Discovery vs. Explicit Models

By default, Hermes probes the endpoint's `/models` API to discover available models. To disable:

```yaml
providers:
  myprovider:
    api: http://localhost:8080/v1
    discover_models: false
    models:
      - model-id-1
      - model-id-2
```

## Troubleshooting

See [references/picker-troubleshooting.md](references/picker-troubleshooting.md) for detailed diagnostic steps and error transcripts.
