---
name: honcho-docker-setup
description: Deploy Honcho (AI memory server) via Docker Compose — Gemini-only config, provider patches, deriver worker, migrations
version: "3.0"
---

# Honcho Docker Setup

Deploy Honcho 3.x from source via Docker Compose.
Upstream: https://github.com/plastic-labs/honcho

## Architecture

Honcho requires **3 components** to work end-to-end:

1. **PostgreSQL** (pgvector) — database + vector store
2. **FastAPI Server** — REST API on port 8000
3. **Deriver Worker** — background process that extracts observations/memories from messages via LLM calls

The Dockerfile only builds ONE image. You must instantiate it twice with different CMDs.

## Manual Setup (from upstream)

If starting from `plastic-labs/honcho` upstream directly:

### Pre-flight Checks

1. **Verify Gemini API key is real** — not `***` (masking artifact)
2. **Verify db credentials match** — POSTGRES_USER/PASSWORD in compose must match DB_CONNECTION_URI
3. **Git clone is clean** — `***` in source config.py display are content-security redactions, not actual values

### Config Fix (Required)

The upstream `src/config.py` has medium/high/max dialectic levels defaulting to **anthropic**. If you only have Gemini credentials:

```bash
cd ${HOME}/honcho
sed -i 's/PROVIDER="anthropic",/PROVIDER="google",/g' src/config.py
sed -i 's/MODEL="claude-haiku-4-5",/MODEL="gemini-1.5-flash",/g' src/config.py
sed -i 's/MODEL="gemini-2.5-flash-lite",/MODEL="gemini-1.5-flash",/g' src/config.py
```

Also update `LLM_EMBEDDING_PROVIDER` from `openai` to `gemini` in config defaults.

### Model Selection (CRITICAL)

**Recommended models (free tier)**:
- Reasoning: `gemini-1.5-flash` — stable, 500 RPD quota, most reliable
- Preview: `gemini-3.1-flash-lite-preview` — may work but naming changes frequently
- Embedding: `gemini-embedding-001` — current stable

**Known broken model names**:
- `gemini-2.5-flash-lite` — DOES NOT EXIST, returns 404
- `gemini-3.1-flash-lite` — missing `-preview` suffix, returns 404
- `text-embedding-004` — deprecated, returns 404

### Secrets-Safe Pattern

**Use `.env` files — NEVER hardcode API keys in docker-compose.yml.**

If you must verify the API key in docker-compose.yml WITHOUT revealing it:
```bash
python3 -c "
with open('docker-compose.yml') as f:
    for i, line in enumerate(f, 1):
        if 'LLM_GEMINI_API_KEY' in line:
            val = line.split('=', 1)[-1].strip()
            print(f'Line {i}: key len={len(val)}, valid={len(val) > 10}')
"
```

**CRITICAL: The `***` masking bug** — file editing tools (write_file/patch) display sensitive values as `***` and if the displayed value is written back, the file literally contains `***`. Both the server AND deriver sections need real API keys. The hex value of `***` is `2a2a2a`, which you can verify:
```bash
python3 -c "
with open('docker-compose.yml','rb') as f:
    data = f.read()
    idx = 0
    while True:
        idx = data.find(b'LLM_GEMINI_API_KEY=', idx)
        if idx == -1: break
        end = data.find(b'\\n', idx)
        val = data[idx+len(b'LLM_GEMINI_API_KEY='):end].strip()
        print(f'Offset {idx}: raw bytes={val[:20]} (len={len(val)})')
        idx = end + 1
"
```

### docker-compose.yml Environment Variables

Both server and deriver need these env vars:
```yaml
- LLM_GEMINI_API_KEY=${LLM_GEMINI_API_KEY}
- LLM_DIALECTIC_MODEL=${LLM_DIALECTIC_MODEL:-gemini-1.5-flash}
- LLM_MODEL=${LLM_MODEL:-gemini-1.5-flash}
- LLM_EMBEDDING_PROVIDER=gemini
- LLM_EMBEDDING_MODEL=gemini-embedding-001
- MAX_EMBEDDING_TOKENS=65536
- DIALECTIC_MAX_OUTPUT_TOKENS=65536
- DIALECTIC_SESSION_HISTORY_MAX_TOKENS=100000
```

**CRITICAL**: `LLM_EMBEDDING_PROVIDER=gemini` — without this, it defaults to `openai` and embeddings fail.

## Setup Steps

```bash
cd ${HOME}/honcho

# 1. Fix config.py providers (step above)

# 2. Write docker-compose.yml (use .env pattern or heredoc, NOT write_file)

# 3. Start database first (must be healthy before migrations)
docker compose up -d database

# 4. Run DB migrations (REQUIRED before API works)
docker compose exec server alembic upgrade head

# 5. Start all services
docker compose up -d --build

# 6. Verify
docker compose ps  # All 3 containers running
curl -s http://127.0.0.1:8000/docs  # Swagger UI available
```

**Note**: Migrations MUST run on a healthy database container. The `depends_on: condition: service_healthy` in docker-compose.yml means the server/deriver won't start until the database healthcheck passes. Run migrations after starting the database but before starting server/deriver, or restart server/deriver after migrations complete.

## Port Conflicts (PostgreSQL 5432)

If port 5432 is already in use (common: TimescaleDB, LiteLLM, other Postgres instances), change the host port in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Host 5433 → Container 5432
```

**Then update the healthcheck user to match `POSTGRES_USER`:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U <username> -d honcho"]
```

**CRITICAL**: The healthcheck `pg_isready -U honcho` will FAIL if `POSTGRES_USER=<username>`. The user in the healthcheck MUST match the `POSTGRES_USER` env var.

**Verified coexistence (July 2025):**
| Container | Image | Port (host→container) | Network | Purpose |
|-----------|-------|----------------------|---------|---------|
| `honcho_db` | ankane/pgvector:latest | 5433→5432 | honcho_default | Honcho memory |
| `default-postgres-1` | timescale/timescaledb:latest-pg16 | 5432→5432 | bridge | General TimescaleDB |
| `litellm-postgres` | postgres:15-alpine | 5432 (internal) | lightllm_litellm-network | LiteLLM proxy DB |

Each runs on its own Docker network with isolated ports — Honcho on 5433 avoids collision with the other two on 5432.

## End-to-End Verification (v3 API — REQUIRED)

**The legacy v1/v2 endpoints (`/users/...`, `/workspaces` without `/v3/` prefix) return 404 or 422.** All current endpoints are under `/v3/`. HTTP methods matter: many are POST even when you'd expect GET.

```bash
BASE=http://127.0.0.1:8000

# 1. Create workspace (POST, not GET)
curl -s -X POST $BASE/v3/workspaces \
  -H "Content-Type: application/json" -d '{"name": "<workspace>"}'

# 2. Create peers (user + agent) — POST, body is {"name": "..."}
curl -s -X POST $BASE/v3/workspaces/<workspace>/peers \
  -H "Content-Type: application/json" -d '{"name": "<username>"}'
curl -s -X POST $BASE/v3/workspaces/<workspace>/peers \
  -H "Content-Type: application/json" -d '{"name": "hermes"}'

# 3. Create session (POST)
curl -s -X POST $BASE/v3/workspaces/<workspace>/sessions \
  -H "Content-Type: application/json" -d '{"name": "global-session"}'

# 4. Set peer observation config — body is a DICT keyed by peer_id, NOT a list
curl -s -X POST "$BASE/v3/workspaces/<workspace>/sessions/global-session/peers" \
  -H "Content-Type: application/json" \
  -d '{"<username>": {"observe_me": true, "observe_others": false}, "hermes": {"observe_me": true, "observe_others": true}}'

# 5. Send a message (batch format — requires messages[] array with peer_id per item)
curl -s -X POST "$BASE/v3/workspaces/<workspace>/sessions/global-session/messages" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"content": "I prefer SQLite as a local database fallback.", "peer_id": "hermes"}]}'

# 6. Wait for deriver to process (look for "Embedded N vectors" / observation lines)
docker compose logs --tail=30 deriver | grep -E "(observation|embedding|reconciled)"

# 7. Search memory (POST with JSON body, NOT GET with query string)
curl -s -X POST "$BASE/v3/workspaces/<workspace>/peers/<username>/search" \
  -H "Content-Type: application/json" -d '{"query": "database preferences", "limit": 10}'

# 8. Pull peer representation (POST with empty body {})
curl -s -X POST "$BASE/v3/workspaces/<workspace>/peers/<username>/representation" \
  -H "Content-Type: application/json" -d '{}'
```

**Context/summary endpoints** are GET with query params:
- `GET $BASE/v3/workspaces/<workspace>/sessions/global-session/context?query=...&peer_id=<username>`
- `GET $BASE/v3/workspaces/<workspace>/sessions/global-session/messages/list` (POST with `{}`)

## Token Limits (All Must Be Set)

| Variable | Value | Purpose |
|----------|-------|---------|
| MAX_EMBEDDING_TOKENS | 65536 | Prevents embedding truncation errors |
| DIALECTIC_MAX_OUTPUT_TOKENS | 65536 | Allows deriver to produce full observations |
| DIALECTIC_SESSION_HISTORY_MAX_TOKENS | 100000 | Prevents 422 on search endpoint |

Defaults in upstream are too small (4096-8192) for Gemini's verbose output.

## Troubleshooting

### "429 Resource Exhausted"
Free tier limits: `gemini-1.5-flash` = 500 RPD, preview models = as low as 20 RPD, `gemini-embedding-001` = 1500 RPM.
**Fix**: Use `gemini-1.5-flash` (most stable free-tier model).

### Search returns errors or empty results
The **server** also needs a valid Gemini API key for hybrid search re-ranking. Verify BOTH server and deriver have the real key (not `***`).

### "Observation content exceeds maximum token limit"
Fixed by raising `MAX_EMBEDDING_TOKENS=65536`. Also ensure embedding provider is `gemini`, not `openai`.

### Container won't start / Pydantic errors
- `AUTH_USE_AUTH=***` crashes — must be `true` or `false`
- API key literally `***` — see hex check above

### After config.py changes
```bash
docker compose down && docker compose up -d --build
```

## Pitfalls

- **Deriver is separate** — without it, messages save but NO memory is extracted. Dockerfile CMD is `fastapi run src/main.py`, not the deriver.
- **DERIVER_FLUSH_ENABLED=true** — default batches until 1,024 tokens. Enable flush for small test messages.
- **`AUTH_USE_AUTH=***` is NOT valid** — crashes with Pydantic bool parse error. Use `false`.
- **DO NOT override dialectic levels via env vars** — `DIALECTIC__LEVELS__minimal__PROVIDER=google` replaces the entire level dict. Patch config.py instead.
- **write_file/patch mask secrets as `***`** — can write literal asterisks into files. Use heredoc or .env pattern.
- **No `/health` endpoint** — returns 404. Use `/docs` or `/v3/workspaces`.
- **All v3 endpoints require `/v3/` prefix** — `/workspaces` (no prefix) returns "Method Not Allowed" 405. Use `/v3/workspaces`.
- **HTTP method matters on v3** — `/v3/workspaces` and `/v3/workspaces/list` are POST (not GET). `/v3/workspaces/{id}/sessions/{id}/context` and `/peers/{id}/card` are GET. `/peers/{id}/representation` and `/peers/{id}/search` are POST with JSON body.
- **`/v3/workspaces/{id}/sessions/{id}/messages` is POST batch** — body must be `{"messages": [{"content": "...", "peer_id": "..."}]}`, NOT a single message object (returns 422 "missing 'messages' field").
- **Peer observation config is a dict** — `POST .../sessions/{id}/peers` body must be `{"peer_id": {"observe_me": bool, "observe_others": bool}}` keyed by peer_id, NOT `{"peers": [...]}`.
- **Config.py `***` display values are redactions** — the actual file has valid integers.
- **Both server AND deriver need valid Gemini key** — search/re-ranking happens on the server, not just the deriver.
- **`gemini-embedding-001` requires `LLM_EMBEDDING_PROVIDER=gemini`** — the default `openai` will silently fail.
- **Preview model names change** — Google frequently renames models. If `gemini-3.1-flash-lite-preview` stops working, check [Google AI docs](https://ai.google.dev/gemini-api/docs/models/gemini).

## Memory Modes (for Hermes Integration)

When connecting Hermes Agent, configure these in `${HOME}/.honcho/config.json`:

```json
{
  "hosts": {
    "hermes": {
      "memoryMode": "hybrid",
      "userMemoryMode": "hybrid",
      "agentMemoryMode": "hybrid",
      "sessionStrategy": "global"
    }
  }
}
```

| Mode | Effect |
|------|--------|
| `hybrid` | Write to both local files AND Honcho (default, recommended) |
| `honcho` | Honcho only — disable local file writes |
| `local` | Local files only — skip Honcho sync |
