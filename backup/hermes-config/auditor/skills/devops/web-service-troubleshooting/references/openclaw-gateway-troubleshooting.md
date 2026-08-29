# OpenClaw Gateway Troubleshooting Reference

## Common Gateway Issues & Diagnosis

### 1. "Unknown Model" / FailoverError
**Symptoms:**
- `FailoverError: Unknown model: <provider>/<model-id>`
- Gateway starts but agent turns fail immediately
- Health endpoint OK but no responses

**Root Cause:** Model referenced in `agents.*.model` but missing from `models.providers.<provider>.models[]`

**Diagnosis:**
```bash
# Check referenced models
jq '.agents.defaults.models | keys' ~/.openclaw/openclaw.json
jq '.agents.list[].model.primary' ~/.openclaw/openclaw.json

# Check registered providers
jq '.models.providers | keys' ~/.openclaw/openclaw.json

# Check provider model registry
jq '.models.providers.google.models[].id' ~/.openclaw/openclaw.json
```

**Fix:** Add missing provider with correct `api` type and model registry entries.

### 2. Gateway Running But Not Processing Messages
**Symptoms:**
- Health endpoint returns `{"ok":true,"status":"live"}`
- Telegram shows "bot is typing..." but no response
- Gateway logs show activity but errors on model fetch

**Diagnosis:**
```bash
journalctl --user -u openclaw-gateway -n 100 --no-pager
```
Look for:
- `provider-transport-fetch` with status codes (429=quota, 401=auth, 404=model not found)
- `model fallback decision: candidate_failed` 
- `embedded run failover decision`

### 3. Auth/Quota Errors (429, 401)
**Symptoms:** Model routing works but provider returns 429/401
- 429: Rate limit / quota exceeded (billing issue)
- 401: Invalid API key (auth issue)
- These are NOT config problems - provider is correctly registered

### 4. Device Pairing / Scope Errors
**Symptoms:** `gateway connect failed: scope upgrade pending approval`
**Cause:** CLI/API calls need device approval in Telegram
**Fix:** Use Telegram for testing, or approve device pairing via `/pair` command

## Quick Health Check Script
```bash
#!/bin/bash
TOKEN="your-gateway-token"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:18789/health | jq .
```

## Valid Provider API Types
See `references/valid-api-types.md` in openclaw-model-switch skill.