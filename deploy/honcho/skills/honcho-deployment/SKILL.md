---
name: honcho-deployment
description: Set up, start, and troubleshoot Honcho AI memory server (port 8000).
---

# Honcho Deployment

## Quick Start

```bash
cd ${HOME}/honcho && docker compose up -d
```

Docs available at: `http://127.0.0.1:8000/docs`

**Note:** There is no `/health` endpoint — it returns 404. Use `/docs` or `/openapi.json` to verify the server is up.

## Docker Compose Configuration

The repo at `${HOME}/honcho` includes a `docker-compose.yml` with two services:
- **honcho_db**: PostgreSQL with pgvector on port 5432
- **honcho_server**: FastAPI server on port 8000

Required environment variables in docker-compose.yml:
- `LLM_GEMINI_API_KEY`: Your real Gemini API key
- `AUTH_USE_AUTH`: Must be `true` or `false` (see below)
- `DB_CONNECTION_URI`: Already configured with postgres credentials

## Troubleshooting: Server Crashes on Startup

### Symptom: Server container exits immediately, container not listed in `docker ps`

```bash
cd ${HOME}/honcho && docker compose logs server --tail=80
```

### Issue 1: `ValueError: Missing client for X: <provider>`

**Cause:** A provider (Summary, Deriver, Dialectic levels) is set to a provider whose client isn't instantiated. This happens when:
- `PROVIDER="anthropic"` but no `LLM_ANTHROPIC_API_KEY`
- `PROVIDER="google"` but no `LLM_GEMINI_API_KEY`

**Fix:** Either set the required API key, OR change the provider defaults in `src/config.py`. The simplest approach is changing the defaults directly:

```python
# In src/config.py, change all DialecticLevelSettings PROVIDER values
# from "anthropic" to "google" (or whichever provider you have credentials for)
sed -i 's/PROVIDER="anthropic",/PROVIDER="google",/g' src/config.py
sed -i 's/MODEL="claude-haiku-4-5",/MODEL="gemini-2.5-flash-lite",/g' src/config.py
```

Then rebuild: `docker compose down && docker compose up -d --build`

### Issue 2: `ValidationError: AUTH_USE_AUTH - Input should be a valid boolean`

**Cause:** The docker-compose.yml has `AUTH_USE_AUTH=***` (placeholder/redacted value).

**Fix:** Change to `AUTH_USE_AUTH=false` (or `true` if you have auth configured):
```bash
sed -i 's/AUTH_USE_AUTH=.*/AUTH_USE_AUTH=false/' docker-compose.yml
```

### Issue 3: `DIALECTIC.LEVELS.* fields missing` via env var overrides

**Cause:** Setting `DIALECTIC__LEVELS__minimal__PROVIDER=google` etc. as env vars DOES NOT merge with defaults — it replaces the entire nested dict, wiping out required fields like `model`, `thinking_budget_tokens`, and `max_tool_iterations`.

**Fix:** Do NOT use `DIALECTIC__LEVELS__*` env vars in docker-compose. Instead, change the defaults directly in `src/config.py` (see Issue 1 above).

## Pitfalls

- **Redacted values in config.py display as `***`**: The `THINKING_BUDGET_TOKENS` and `MAX_OUTPUT_TOKENS` values appear as `***` when viewing the file through content security filters, but they are real Python integers in the actual file. The file loads fine locally.
- **docker-compose.yml placeholders**: If `LLM_GEMINI_API_KEY` or `AUTH_USE_AUTH` show `***`, these are literal placeholder values that need to be replaced with real values.
- **Both GEMINI and OPENAI keys may be needed**: The native `google` client requires `LLM_GEMINI_API_KEY`. The `openai` provider (with OpenAI-compatible base URL) requires `LLM_OPENAI_API_KEY`. If using Gemini via both clients, set both to your Gemini key.
- **No `/health` endpoint**: The server doesn't implement `/health`. Use `/docs` (Swagger UI) or `/openapi.json` to verify.

## Diagnostic Commands

```bash
# Check if containers are running
docker ps | grep honcho

# Check server crash logs
cd ${HOME}/honcho && docker compose logs server --tail=80

# Verify server is up
curl -s http://127.0.0.1:8000/docs | head -5

# Check available API routes
curl -s http://127.0.0.1:8000/openapi.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.get('paths',{}).keys()))"
```