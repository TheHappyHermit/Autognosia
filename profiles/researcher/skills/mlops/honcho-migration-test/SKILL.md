---
name: honcho-migration-test
description: Test and migrate from custom SQLite memory to Honcho supported system
version: "1.0"
---

# Honcho Memory Migration

## User Preference
- User wants to TEST Honcho before committing to migration from sqlite memory system (${HOME}/.hermes/memory_enhancement/memories.db)
- Always verify basic operations (workspace, peer, session, message creation) before attempting migration
- User prefers methodical verification at each step

## Current SQLite Memory System
- Location: ${HOME}/.hermes/memory_enhancement/memories.db
- Contains user profile data, environment facts, preferences, and stable conventions
- User explicitly prefers this over Honcho due to its zero-dependency, offline-capable, private nature
- Do NOT suggest migration unless specifically requested

## Honcho Architecture
Honcho has TWO components — the Dockerfile only includes the FastAPI server. The **deriver** (background AI worker that extracts observations from messages) is a separate process and must be added manually.

### Docker Compose Requirements
1. **Database service** (pgvector)
2. **Server service** (FastAPI, runs migrations and serves API)
3. **Deriver service** (runs `python -m src.deriver` — processes message queue into memories)

## Setup Steps

### 1. Configure docker-compose.yml
Create a `deriver` service in addition to the server:
```yaml
  deriver:
    build: { context: ., dockerfile: Dockerfile }
    container_name: honcho_deriver
    depends_on:
      database: { condition: service_healthy }
    environment:
      - DB_CONNECTION_URI=postgresql://...
      - LLM_GEMINI_API_KEY=<your-real-key>
      - AUTH_USE_AUTH=false
      - SENTRY_ENABLED=false
      - DERIVER_FLUSH_ENABLED=true  # Process small messages immediately, not batched
    command: ["python", "-m", "src.deriver"]
    restart: unless-stopped
```

### 2. Fix config.py defaults before building
The `src/config.py` source has medium/high/max dialectic levels defaulting to "anthropic". Change them to "google" to work with Gemini:
```bash
cd ${HOME}/honcho && sed -i 's/PROVIDER="anthropic",/PROVIDER="google",/g' src/config.py
```
Note: The `config.py` file contains `***` values for THINKING_BUDGET_TOKENS — these are content-filter redacted in the source but actually valid integers. `config.py` loads fine despite appearing broken.

### 3. Run migrations
```bash
cd ${HOME}/honcho && docker compose exec server alembic upgrade head
```

### 4. Start all services
```bash
cd ${HOME}/honcho && docker compose up -d --build
```

## Testing Checklist
1. **Server health**: `curl -sf http://127.0.0.1:8000/openapi.json` → 200
2. **Create workspace**: `POST /v3/workspaces` with `{"name":"test"}` → returns `{"id":"test",...}`
3. **Create peer**: `POST /v3/workspaces/{wid}/peers` with `{"name":"user","metadata":{"role":"user"}}` → returns `{"id":"user",...}`
4. **Create session**: Use workspace-level endpoint `POST /v3/workspaces/{wid}/sessions` with `{"name":"test","peer_id":"user"}` (NOT the peer-level path)
5. **Post message**: `POST /v3/workspaces/{wid}/sessions/{sid}/messages` with `{"messages":[{"role":"user","peer_id":"user","content":"..."}]}` → returns message objects
6. **Read messages**: `POST /v3/workspaces/{wid}/sessions/{sid}/messages/list` with `{}` → returns `{"items":[...],"total":N}`
7. **Check queue**: `GET /v3/workspaces/{wid}/queue/status` → shows work units processing
8. **Peer card**: `GET /v3/workspaces/{wid}/peers/{pid}/card` → eventually returns extracted observations after deriver runs

## Critical Pitfalls
1. **Session creation path**: `POST /v3/workspaces/{wid}/peers/{pid}/sessions` returns a list (GET-like), NOT a creation endpoint. Use `POST /v3/workspaces/{wid}/sessions` with `peer_id` in body.
2. **Deriver not included in Dockerfile**: The FastAPI server stores messages to DB, but AI memory extraction requires a separate `python -m src.deriver` process. Add it as a compose service.
3. **Batch threshold blocking processing**: By default, the deriver only processes representation tasks when `REPRESENTATION_BATCH_MAX_TOKENS >= 1024`. Set `DERIVER_FLUSH_ENABLED=true` to process small messages immediately.
4. **Env var overrides break nested pydantic settings**: Setting `DIALECTIC__LEVELS__minimal__PROVIDER=openai` replaces the ENTIRE level dict, wiping required fields (model, thinking_budget_tokens). Change defaults in `config.py` instead.
5. **Auth placeholder `***` crashes config parsing**: The docker-compose.yml has `AUTH_USE_AUTH=***` as literal placeholder text. Must be set to `false` or a real boolean.
6. **Gemini API key must be valid**: The placeholder `***` was never a real key. LLM calls fail silently in retry loops.
7. **Message POST format**: Messages require `{"messages":[{"content":"...","peer_id":"<id>"}]}` — note the wrapper array and `peer_id` inside each message. Required fields are `content` and `peer_id`.
8. **Config.py `***` values are filtered, not broken**: The actual source has integer values for THINKING_BUDGET_TOKENS. The file loads and runs fine despite appearing to have invalid syntax in output.
9. **read_file secret masking corrupts docker-compose.yml**: The read_file tool silently replaces sensitive values (API keys, passwords) with `***`. If you read docker-compose.yml, then write it back (even via patch), the key becomes literally `***` bytes. ALWAYS use `terminal` with `hexdump -C` or `python3 -c` to verify actual file contents after any write operation to files with secrets. The fix is to use `.env` files and `docker-compose.example.yml` templates instead.
10. **Search endpoint needs Gemini API key on SERVER too**: The server (not just deriver) uses Gemini for search re-ranking. Both services need valid `LLM_GEMINI_API_KEY`.
11. **Docker-compose.yml API key ordering**: When API key is duplicated in docker-compose.yml (server + deriver), the first occurrence (server) may get corrupted while the second (deriver) is fine. Always verify both with hex dump.

## Secrets-Safe Deployment Pattern

### NEVER hardcode secrets in docker-compose.yml
1. Create `.env.example` template with placeholder values
2. Create `docker-compose.example.yml` using `${VAR}` substitution
3. In `.gitignore`: `.env`, `docker-compose.yml`
4. User copies `.env.example` → `.env` and fills in real keys
5. docker-compose.yml references `${LLM_GEMINI_API_KEY}` etc.

### Docker compose example structure
```yaml
services:
  server:
    environment:
      - LLM_GEMINI_API_KEY=${LLM_GEMINI_API_KEY}
  deriver:
    environment:
      - LLM_GEMINI_API_KEY=${LLM_GEMINI_API_KEY}
```

## Memory Migration from SQLite to Honcho

### Process
1. Extract unique memories: `SELECT DISTINCT content FROM memories ORDER BY content`
2. Combine with persistent YAML memory facts
3. Deduplicate (remove exact matches)
4. Create workspace, peer, and session in Honcho v3 API
5. Send as batch: `POST /v3/workspaces/{wid}/sessions/{sid}/messages` with `{"messages":[{"content":"...","peer_id":"..."}]}`
6. Wait for deriver to process and embed (check with `docker compose logs deriver`)
7. Verify searchable: `POST /v3/workspaces/{wid}/search` with `{"query":"test","peer_id":"..."}`

### API Confirmed Patterns (v3)
- **Create workspace**: `POST /v3/workspaces` → `{"name":"workspace-name"}`
- **List workspaces**: `POST /v3/workspaces/list` → `{"name_include":"filter"}`
- **Create peer**: `POST /v3/workspaces/{wid}/peers` → `{"name":"peer-name"}`
- **Create session**: `POST /v3/workspaces/{wid}/sessions` → `{"name":"session-name"}`
- **Batch messages**: `POST /v3/workspaces/{wid}/sessions/{sid}/messages` → `{"messages":[{"content":"...","peer_id":"..."}]}`
- **Search**: `POST /v3/workspaces/{wid}/search` → `{"query":"text","peer_id":"..."}` (returns ranked results)
- **Deriver status**: `docker compose logs deriver | grep -E "(observation|embedding|reconciled)"`

## Model Configuration

### Stable vs Preview Models
- **Preferred**: `gemini-1.5-flash` — stable, 500 RPD free tier quota, works consistently
- **Alternative**: `gemini-3.1-flash-lite-preview` — must include `-preview` suffix, may have naming changes
- **Embedding**: `gemini-embedding-001` (current stable, `text-embedding-004` is deprecated → 404)
- **Token limits**: `MAX_EMBEDDING_TOKENS=65536`, `DIALECTIC_MAX_OUTPUT_TOKENS=65536`

### ⚠️ Common Model Name Errors
- `gemini-2.5-flash-lite` does not exist (404)
- `gemini-3.1-flash-lite` missing `-preview` suffix (404)
- `gemini-2.5-flash-lite` is not a real model
- Free tier quotas: preview models as low as 20 RPD, `gemini-1.5-flash` at 500 RPD

## Migration Considerations
- Current memory is ~97% full at 2,146/2,200 chars
- Memory contains user preferences, environment facts, tool quirks, conventions
- Need to test that Honcho can:
  - Ingest existing facts as observations
  - Provide context via dialectic API
  - Maintain persistence across sessions
  - Support the hermes-agent integration pattern
- Keep SQLite as backup during transition

## Migration Considerations
- Current memory is ~97% full at 2,146/2,200 chars
- Memory contains user preferences, environment facts, tool quirks, conventions
- Need to test that Honcho can:
  - Ingest existing facts as observations
  - Provide context via dialectic API
  - Maintain persistence across sessions
  - Support the hermes-agent integration pattern
- Keep SQLite as backup during transition