# Newsletter Model Runtime Resolver

Drop-in replacement so `newsletter_builder.py` / `newsletter_builder_v2.py` always use the
agent's configured default model instead of a hardcoded `openai/gpt-4o-mini`.

```python
import os

def _get_default_model(openrouter_key):
    """Read main default model + provider from Hermes config so the script
    follows the agent default instead of a hardcoded model."""
    try:
        import yaml
        with open(os.path.expanduser("${HOME}/.hermes/config.yaml")) as f:
            cfg = yaml.safe_load(f)
        m = cfg.get("model", {})
        model = m.get("default", "tencent/hy3:free")
        provider = m.get("provider", "nous")
        if provider == "nous":
            return model, os.getenv("NOUS_API_KEY") or openrouter_key, "https://inference-api.nousresearch.com/v1"
        return model, openrouter_key, "https://openrouter.ai/api/v1"
    except Exception:
        return "tencent/hy3:free", openrouter_key, "https://openrouter.ai/api/v1"
```

## Usage in `summarize_content(text, openrouter_key=None)`

**v1 (OpenAI client class):**
```python
from openai import OpenAI
model, api_key, base_url = _get_default_model(openrouter_key)
client = OpenAI(api_key=api_key, base_url=base_url)
response = client.chat.completions.create(model=model, messages=[...], max_tokens=300, temperature=0.2)
```

**v2 (module-level `openai`):**
```python
import openai
model, api_key, base_url = _get_default_model(openrouter_key)
openai.api_key = api_key
openai.base_url = base_url
response = openai.chat.completions.create(model=model, messages=[...], max_tokens=500, temperature=0.3)
```

## Pitfall
`_get_default_model` takes `openrouter_key` as a parameter. An early draft defined it
with NO args and called it as `_get_default_model()` — Pyright/Python errors at the call
site (`openrouter_key` undefined / missing argument). Pass `openrouter_key` through.

## Why this matters
- Hardcoding `gpt-4o-mini` bills OpenRouter even when a free default (`tencent/hy3:free`)
  is configured.
- Reading config at runtime means a future `hermes config set model.default ...` propagates
  to the newsletter automatically — no script edit needed.
