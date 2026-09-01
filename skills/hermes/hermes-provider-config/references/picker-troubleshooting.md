# /model Picker Troubleshooting

Diagnose and fix issues with custom providers not appearing in the `/model` interactive picker (Telegram/Discord).

## Error Transcripts

### ValueError: Model has a context window below minimum

```
ValueError: Model Qwen3.8-27B-UD-Q4_K_XL has a context window of 32,768 tokens, which is below the minimum 64,000 required by Hermes Agent.
```

**Cause:** The model's metadata reports a context window smaller than Hermes requires (64K minimum). Common with quantized models that report 32K when they actually support 128K.

**Fix:** Add `model.context_length` to config.yaml with the real context window:

```yaml
model:
  default: Qwen3.8-27B-UD-Q4_K_XL
  provider: llamaCPP
  context_length: 131072  # Real context window
```

**Finding the real value:**
- Check llama-server startup logs for `ctx_size` or `n_ctx`
- Check the model's Hugging Face page under `?local-app=llama.cpp`
- For Qwen3.8-27B-UD-Q4_K_XL, the UD (unsloth dynamic) variant typically supports 128K

### Provider shows in CLI but not Telegram picker

**Symptoms:** `hermes model` works, but `/model` in Telegram doesn't show the provider.

**Diagnostic steps:**

1. Verify provider discovery returns it:
   ```python
   from hermes_cli.model_switch import list_authenticated_providers
   from hermes_cli.config import get_compatible_custom_providers
   import yaml, os
   
   cfg = yaml.safe_load(open(os.path.expanduser('~/.hermes/config.yaml')))
   custom_provs = get_compatible_custom_providers(cfg)
   
   results = list_authenticated_providers(
       current_provider=cfg.get('model', {}).get('provider', ''),
       current_base_url=cfg.get('model', {}).get('base_url', ''),
       user_providers=cfg.get('providers'),
       custom_providers=custom_provs,
       for_picker=True,
   )
   
   for p in results:
       print(f"{p['slug']}: {p.get('total_models', 0)} models, user_defined={p.get('is_user_defined')}")
   ```

2. If the provider IS returned but still doesn't show in Telegram:
   - Check gateway logs for runtime errors during `/model`
   - Verify the Telegram adapter has `send_model_picker` method
   - Restart gateway with `/restart`

### Provider name mismatch

```yaml
# WRONG — "custom:" prefix is for bare endpoints
model:
  provider: custom:llamaCPP

# CORRECT — named providers use bare key
model:
  provider: llamaCPP
```

When `provider: custom:llamaCPP`, the picker compares against `current_provider` which becomes `custom:llamaCPP`, but the provider slug is `llamaCPP` — they don't match, so it may be filtered.

### Empty model list for custom endpoint

By default, Hermes probes the endpoint's `/models` API. If that fails or returns empty:

```yaml
providers:
  myprovider:
    api: http://localhost:8080/v1
    discover_models: false  # Don't probe /models
    default_model: my-model  # Use this model
    models:
      - my-model
      - my-other-model
```

### Copilot token validation failed

```
Copilot token validation failed: Token from `gh auth token` is a classic PAT (ghp_*). Classic Personal Access Tokens (ghp_*) are not supported by the Copilot API.
```

This is a non-fatal warning — it doesn't prevent other providers from showing. Fix with `copilot login` or `hermes model`.

## Diagnostic Commands

```bash
# Check gateway logs for errors
grep -i "error\|fail\|context" ~/.hermes/logs/gateway.log | tail -30

# Verify gateway is running
ps aux | grep "gateway run" | grep -v grep

# Check Telegram adapter capabilities
/home/<USER>/.hermes/hermes-agent/venv/bin/python -c "
import hermes_plugins.telegram_platform.adapter as a
print('has send_model_picker:', hasattr(a, 'TelegramAdapter') and getattr(a.TelegramAdapter, 'send_model_picker', None) is not None)
"
```
