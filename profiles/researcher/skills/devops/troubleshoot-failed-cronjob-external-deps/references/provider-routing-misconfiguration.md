# Provider Routing Misconfiguration — Cron Jobs Using Wrong Provider Despite `provider: auto`

## Failure Pattern

Cron jobs configured with `model: "auto"` and `provider: "auto"` fail with **401 Unauthorized** errors, but manual testing with the same provider/model combo works perfectly.

## Root Cause

The `provider_routing.order` array in `~/.hermes/config.yaml` forces a specific provider as primary, **overriding** the `provider: auto` setting in cron jobs.

```yaml
# This OVERRIDES cron job "auto" selection
provider_routing:
  order: ["mistral", "openrouter", "nous"]  # mistral forced as primary
```

When the cron job runs `resolve_runtime_provider(requested="auto")`, the provider routing logic respects `provider_routing.order` and selects the first available provider in that list — even if it has no credentials.

## Symptoms

| Check | Result |
|-------|--------|
| Cron job output | `RuntimeError: Error code: 401 - {'detail': 'Unauthorized'}` |
| Gateway logs | `🌐 Endpoint: https://api.mistral.ai/v1/` followed by 401 |
| `resolve_runtime_provider(requested="auto")` | Returns `provider: "mistral"` (first in order) |
| `resolve_runtime_provider(requested="nous")` | Returns valid Nous credentials, works |
| Manual AIAgent with Nous | Works correctly |

## Diagnostic Steps

```bash
# 1. Check provider_routing in config
grep -A 5 "provider_routing:" ~/.hermes/config.yaml

# 2. Test what "auto" actually resolves to
HERMES_HOME=~/.hermes ~/.hermes/hermes-agent/venv/bin/python3 -c "
import os, sys
sys.path.insert(0, '~/.hermes/hermes-agent')
from hermes_cli.runtime_provider import resolve_runtime_provider
print('auto ->', resolve_runtime_provider(requested='auto').get('provider'))
print('nous ->', resolve_runtime_provider(requested='nous').get('provider'))
"

# 3. Verify the forced provider has no credentials
grep -i "MISTRAL_API_KEY" ~/.hermes/.env
# If empty/absent -> that's the problem
```

## Fix

**Option 1: Remove `provider_routing.order` entirely** (lets auto-detection work)
```yaml
# Delete or comment out:
# provider_routing:
#   order: ["mistral", "openrouter", "nous"]
```

**Option 2: Put the working provider first**
```yaml
provider_routing:
  order: ["nous", "openrouter", "mistral"]  # nous first
```

**Option 3: Add credentials for the forced provider** (if you want Mistral primary)
```bash
# Add to ~/.hermes/.env
MISTRAL_API_KEY=your_key_here
```

## Why This Happens

The provider resolution chain in `hermes_cli/runtime_provider.py:resolve_runtime_provider()`:

1. `resolve_requested_provider("auto")` → returns `"auto"`
2. `resolve_provider("auto")` → checks `provider_routing.order` from config, returns first provider in list that's "available"
3. Providers without credentials are still considered "available" — the credential check happens LATER in `resolve_runtime_provider()` when trying each provider
4. Mistral is first in order → selected → credential lookup fails → 401

## Verification After Fix

```bash
# Re-run the test
HERMES_HOME=~/.hermes ~/.hermes/hermes-agent/venv/bin/python3 -c "
import os, sys
sys.path.insert(0, '~/.hermes/hermes-agent')
from hermes_cli.runtime_provider import resolve_runtime_provider
print('auto ->', resolve_runtime_provider(requested='auto').get('provider'))
"  # Should now print "nous"

# Run cron job manually
hermes cron run <job_id>  # Should succeed
```

## Related

- `troubleshoot-failed-cronjob-external-deps` Layer 5 (Credentials & Authentication) — this is a **configuration** issue masquerading as a credential issue
- `hermes-fallback-provider-setup` — `provider_routing` is separate from `fallback_providers`; don't confuse them

---

## Additional Finding: `"auto"` String Bug in Cron Job Model Resolution (June 2024)

### Failure Pattern

Cron jobs configured with `model: "auto"` (string literal) fail with **404 Not Found** from the primary provider (e.g., Nous), then fall back to `fallback_providers` (e.g., Mistral) and fail with **401 Unauthorized**.

| Check | Result |
|-------|--------|
| Cron job output | `RuntimeError: Error code: 404 - Model 'auto' not found` then `401 Unauthorized` |
| Gateway logs | `provider=nous model=auto` → `provider=mistral model=mistral-small-latest` |
| Manual AIAgent with config.yaml default | Works correctly |

### Root Cause

In `cron/scheduler.py`, the model resolution logic only falls back to `config.yaml`'s `model.default` when `job.get("model")` is **falsy**:

```python
_model_cfg = _cfg.get("model", {})
if not job.get("model"):  # Only if falsy!
    if isinstance(_model_cfg, dict):
        model = _model_cfg.get("default", model)
```

Since `"auto"` is a **truthy string**, it bypasses the fallback and gets passed literally to the API → 404 → fallback chain triggers → 401 on mistral.

### Fix

Set cron jobs with **explicit model object** (not `"auto"` string):

```json
{
  "model": "nvidia/nemotron-3-ultra:free",
  "provider": "nous"
}
```

**Via cronjob tool:**
```bash
hermes cron update <job_id> --model '{"model": "nvidia/nemotron-3-ultra:free", "provider": "nous"}'
```

### Diagnostic Distinction

| Symptom | Root Cause | Fix |
|---------|------------|-----|
| `provider: mistral` forced despite `provider: auto` | `provider_routing.order` in config (OpenRouter only) | Reorder/remove `provider_routing.order` |
| `model=auto` sent to API → 404 → falls back to mistral → 401 | Cron job has `model: "auto"` string literal | Set explicit model object on the job |

### Note on `provider_routing`

The `provider_routing` section in `~/.hermes/config.yaml` **only applies when using OpenRouter**. It does NOT affect direct provider connections (Nous, Mistral, Anthropic, etc. used directly via their base URLs). For direct providers, cron jobs should explicitly specify `model` and `provider` to avoid the `"auto"` string bug.

## Verification After Fix

```bash
# Check cron job config
hermes cron list | grep -A 3 "model.*nvidia"

# Run cron job manually - should succeed without 404/401
hermes cron run <job_id>
```

## Related

- `troubleshoot-failed-cronjob-external-deps` Layer 5 (Credentials & Authentication) — this is a **configuration** issue masquerading as a credential issue
- `hermes-fallback-provider-setup` — `provider_routing` is separate from `fallback_providers`; don't confuse them