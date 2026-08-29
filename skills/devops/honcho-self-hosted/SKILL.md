---
name: honcho-self-hosted
description: Self-host Honcho memory system with Docker, PostgreSQL, and Google/Gemini LLM
trigger: When user wants to set up, debug, or use self-hosted Honcho for memory management
---

# Honcho Self-Hosted Setup

## Overview
Honcho is an open-source memory system for stateful AI agents. Uses FastAPI server + PostgreSQL/pgvector.

## Files
- `~/honcho/` - Honcho source (cloned from plastic-labs/honcho)
- `~/honcho/docker-compose.yml` - Docker config
- `~/honcho/src/config.py` - Patched to use "google" provider for all dialectic levels (also hardcodes model names — must be updated to change models)

## Architecture
```
honcho_db (PostgreSQL/pgvector) -> honcho_server (FastAPI :8000) -> honcho_deriver (background worker)
```

## Critical Rule: Model Changes Require TWO Edits + Rebuild
Changing the model is NOT just a docker-compose.yml edit. There are TWO places:

**1. `src/config.py`** (baked into Docker image at build time):
- Line ~252: `DeriverSettings.MODEL`
- Line ~363-393: `DIALECTIC.LEVELS` dict for all 5 reasoning levels
- These are hardcoded Python defaults, not env-var overrides

**2. `docker-compose.yml`** (runtime env vars):
- `LLM_DIALECTIC_MODEL`, `LLM_MODEL`, `OPENAI_MODEL_NAME` for both server AND deriver services

**3. Always rebuild:** `docker compose up -d --build server deriver`

**4. Verify inside container:**
```bash
docker exec honcho_deriver python -c "from src.config import settings; print(settings.DERIVER.MODEL)"
```

## Embedding Model Warning

### CRITICAL: Embedding Provider Must Be `gemini` (Not `google`)
`EMBEDDING_PROVIDER` accepts exactly three values: `'openai'`, `'gemini'`, `'openrouter'`
Using `google` causes a Pydantic validation crash and container restart loop.

Required env vars in docker-compose.yml for BOTH server AND deriver:
```
- LLM_EMBEDDING_PROVIDER=gemini
- LLM_EMBEDDING_MODEL=gemini-embedding-001
```

### Deprecated Models
- `text-embedding-004` is **deprecated** in v1beta API — returns 404.
- `gemini-3.1-flash-lite` (without `-preview` suffix) — returns 404. Must use `gemini-3.1-flash-lite-preview`.
- `gemini-3-flash-preview` — also available but different model than 3.1 variant.
- ALWAYS verify model names via the API's model list endpoint before configuring.
- `gemini-3.1-flash-lite` (without `-preview` suffix) — returns 404. Must use `gemini-3.1-flash-lite-preview`.
- `gemini-3-flash-preview` — also available but different model than 3.1 variant.
- ALWAYS verify model names via the API's model list endpoint before configuring.
</think>


To discover available embedding models:
```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=<KEY>" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(m['name']) for m in d.get('models',[]) if 'embedding' in m.get('name','').lower()]"
```
Known results: `models/gemini-embedding-001`, `models/gemini-embedding-2-preview`

## API Workflow (v3)
1. Create workspace: `POST /v3/workspaces` with `{"name": "workspace-name"}`
2. Create session: `POST /v3/workspaces/{w}/sessions` with `{"name": "session-name"}`
3. Add peer to session: `POST /v3/workspaces/{w}/sessions/{s}/peers` with `{"peer-name": {}}` (dict, NOT list!)
4. Send message: `POST /v3/workspaces/{w}/sessions/{s}/messages` with `{"messages": [{"content": "...", "peer_id": "peer-name"}]}` (array nested in "messages" key, NOT single object!)
5. Query peer: `GET /v3/workspaces/{w}/peers/{p}`
6. Search: `POST /v3/workspaces/{w}/peers/{p}/search` with `{"query": "..."}`

## Known Issues & Debugging

### "Observation content exceeds maximum token limit"
This error is **misleading**. It can mean either:
- The LLM generated observations too large for embedding (rare now with MAX_EMBEDDING_TOKENS=65536)
- **OR**: The embedding API returned a quota/rate-limit error. The code in `embedding_client.py` catches any exception with "token" in the string and re-raises as a token limit error. A Google quota error often contains the word "token" in its details.
- Fix: Check deriver logs for the actual Google API error. If it's a quota (429), switch models or wait.

### "Model is not found" / 404
The model name doesn't exist in the API. Always verify with:
```bash
## Troubleshooting: 'Observation content exceeds maximum token limit'
This error is **critically misleading** — it catches ANY failure in the embedding step and re-frames it. The real errors we've encountered that produce this same message:

- **Wrong model name** (404): `gemini-3.1-flash-lite` doesn't exist — needs `-preview` suffix
- **Wrong embedding provider**: `openai` instead of `gemini` — it tries to call OpenAI with a Google key
- **Deprecated embedding model**: `text-embedding-004` returns 404 from v1beta API
- **API key literally `***`**: The server's GEMINI_API_KEY was the literal string `***` causing `INVALID_ARGUMENT`
- **Genuine token overflow**: The LLM generated observations too large to embed (rare, now handled by MAX_EMBEDDING_TOKENS=65536)

**Diagnostic workflow:**
1. Check the embedding client provider: `docker exec honcho_deriver python -c "from src.config import settings; print(settings.LLM.EMBEDDING_PROVIDER)"` — must be `gemini`
2. Test embedding directly: `docker exec honcho_deriver python -c "import asyncio; from src.embedding_client import EmbeddingClient; async def t(): print(await EmbeddingClient().simple_batch_embed(['test'])); asyncio.run(t())"`
3. Check deriver logs for Google API errors: `docker compose logs --tail=80 deriver 2>&1 | grep -E "ClientError|404|NOT_FOUND|INVALID_ARGUMENT" | head -10`
4. Verify model exists: `curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY" | grep '"name"'`

## Proven Working Config (2026-04-06)
Full pipeline confirmed end-to-end:
- **LLM**: `gemini-3.1-flash-lite-preview` (NOT `gemini-3.1-flash-lite` — returns 404!)
- **Embedding provider**: `gemini` (NOT `google` — crashes! NOT `openai` — wrong API key!)
- **Embedding model**: `gemini-embedding-001` (NOT `text-embedding-004` — deprecated/404!)
- **MAX_EMBEDDING_TOKENS**: 65536, **DIALECTIC_MAX_OUTPUT_TOKENS**: 32768

The pipeline successfully extracts, embeds, deduplicates, and stores observations.

## Critical Gotcha: Read/Write Masking
`read_file` and `patch` mask sensitive values as `***`. If you read docker-compose.yml that has `***` for API keys or token values, the `***` may be:
1. Just display masking (disk has real value) — check disk directly with `python3 -c` to read raw bytes
2. Literally `***` on disk — this happened when patches were applied using the masked display value

**Safe pattern**: Always use `sed -i` or `python3` to modify API keys on disk, never `patch` with values read from `read_file`.

## Rate Limit Quota Issue
All DIALECTIC level defaults must be set to `"google"` provider (PATCH done). The `DIALECTIC__LEVELS__...` env var approach doesn't work because Pydantic-settings replaces the entire level dict with just the provider string, losing model/thinking_budget fields.

## Rate Limits & Quota Strategy
- Quotas are **per-model, per-project, per-day** — completely independent buckets
- `gemini-2.5-flash-lite`: 20 RPD free tier (exhausts very fast during testing)
- `gemini-3-flash-preview`: separate quota bucket, currently has quota
- `gemini-2.5-flash`: separate bucket, may have quota
- Once one model is exhausted, other models may still have quota
- Strategy: use the highest-quality model available; if quota exhausted, fall back to lower-tier models (2.5-flash, 2.0-flash, etc.)
- Check available models: `curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=<KEY>" | grep '"name"'`

## Verification Steps
1. Edit `src/config.py` (all model references) AND `docker-compose.yml`
2. `cd ~/honcho && docker compose up -d --build server deriver`
3. Verify model: `docker exec honcho_deriver python -c "from src.config import settings; print(settings.DERIVER.MODEL)"`
4. Check server: `docker compose logs --tail=10 server` (should show Uvicorn on :8000)
5. Check deriver: `docker compose logs --tail=30 deriver` (look for PERFORMANCE metrics or errors)
6. Test ingestion: send message via API, watch deriver logs for observation generation and save results

## Fresh Database Setup (July 2026)

After creating a fresh database volume, you MUST run alembic migrations before the API will work:

```bash
docker compose up -d database
docker compose exec server alembic upgrade head
docker compose restart server deriver
```

The deriver will fail with `relation "public.active_queue_sessions" does not exist` until migrations complete.

### API v3 Endpoint Formats (Critical)

All v3 endpoints use POST (even list/search):

```bash
# List workspaces (POST, not GET!)
curl -X POST http://127.0.0.1:8000/v3/workspaces/list

# Create workspace
curl -X POST http://127.0.0.1:8000/v3/workspaces -H "Content-Type: application/json" -d '{"name": "my-workspace"}'

# Create peers (NOT /users - v3 uses peers)
curl -X POST http://127.0.0.1:8000/v3/workspaces/WS/peers -H "Content-Type: application/json" -d '{"name": "peer-name"}'

# Create session
curl -X POST http://127.0.0.1:8000/v3/workspaces/WS/sessions -H "Content-Type: application/json" -d '{"name": "session-name"}'

# Set peer observation config (dict keyed by peer_id, NOT list)
curl -X POST http://127.0.0.1:8000/v3/workspaces/WS/sessions/SESS/peers -H "Content-Type: application/json" -d '{"peer1": {"observe_me": true, "observe_others": false}, "peer2": {"observe_me": true, "observe_others": true}}'

# Send messages (BATCH format with peer_id, NOT single message with is_user)
curl -X POST http://127.0.0.1:8000/v3/workspaces/WS/sessions/SESS/messages -H "Content-Type: application/json" -d '{"messages": [{"content": "text", "peer_id": "peer-name"}]}'

# Search peer memories
curl -X POST http://127.0.0.1:8000/v3/workspaces/WS/peers/PEER/search -H "Content-Type: application/json" -d '{"query": "search term", "limit": 10}'

# Get peer representation (extracted observations)
curl -X POST http://127.0.0.0.1:8000/v3/workspaces/WS/peers/PEER/representation -H "Content-Type: application/json" -d '{}'

# Get session context (retrieves relevant messages + peer representations)
curl "http://127.0.0.1:8000/v3/workspaces/WS/sessions/SESS/context?query=search+term&peer_id=peer-name"
```

### Hermes Integration: `hermes memory setup` may cancel without saving

The interactive wizard `hermes memory setup` may cancel silently. Use the direct config command instead:

```bash
hermes config set memory.provider honcho
```

Then verify with `hermes memory status`.

### Port Conflicts (PostgreSQL 5432)

If port 5432 is already in use (TimescaleDB, LiteLLM, other Postgres), change the host port in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Host 5433 → Container 5432
```

**Then update the healthcheck user to match `POSTGRES_USER`:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U josh434 -d honcho"]
```

**CRITICAL**: The healthcheck `pg_isready -U honcho` will FAIL if `POSTGRES_USER=josh434`. The user in the healthcheck MUST match the `POSTGRES_USER` env var.
