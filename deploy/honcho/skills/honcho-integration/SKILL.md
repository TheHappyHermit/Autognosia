---
name: honcho-integration
description: Configure and use Honcho as a memory provider in Hermes Agent — setup, configuration, memory modes, peer management, CLI commands, and daily usage patterns
version: "1.0"
author: Hermes Agent
metadata:
  hermes:
    tags: [memory, honcho, integration, configuration, cross-session]
    related_skills: [honcho-docker-setup, honcho-deployment, memory]
---

# Honcho Integration — Hermes Agent

Honcho provides Hermes with **persistent cross-session memory and user modeling**. It complements local memory files (MEMORY.md, USER.md, SOUL.md) — Honcho handles semantic search and automatic observation extraction, while local files handle session-level context and system prompt.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Hermes Agent   │     │   Honcho Server  │     │   PostgreSQL     │
│   (CLI/Telegram) │◄───►│   (localhost:8000)│    │   + pgvector     │
└──────────────────┘     └────────┬─────────┘     └────────┬─────────┘
                                  │                        │
                                  ▼                        │
                            Honcho Deriver             Shared DB
                            (background)              (Docker volume)
                            Extracts & embeds
                            observations
```

**Dual-Peer Model:**
| Peer | Role | observe_me | observe_others |
|------|------|------------|----------------|
| User (`<username>`) | Tracks preferences, goals, communication style | `true` | `false` |
| Agent (`hermes`) | Tracks agent's own knowledge, identity, capabilities | `true` | `true` |

**Memory Flow:**
1. Hermes sends conversation messages → Honcho `session.addMessages()`
2. Deriver processes messages, extracts structured observations via Gemini
3. Observations are embedded (gemini-embedding-001) and stored in pgvector
4. Hermes retrieves context via `session.context()` + peer representations
5. Context is injected into Hermes system prompt for next turn

## Configuration

### File: `~/.honcho/config.json`

```json
{
  "apiKey": "not-needed",
  "baseUrl": "http://127.0.0.1:8000",
  "hosts": {
    "hermes": {
      "workspace": "<workspace>",
      "peerName": "<username>",
      "aiPeer": "hermes",
      "memoryMode": "hybrid",
      "userMemoryMode": "hybrid",
      "agentMemoryMode": "hybrid",
      "sessionStrategy": "global",
      "enabled": true,
      "saveMessages": true
    }
  }
}
```

### Key Configuration Options

**Memory Modes:**
| Mode | Effect |
|------|--------|
| `hybrid` | Write to both local files AND Honcho (default, recommended) |
| `honcho` | Honcho only — disable corresponding local file writes |
| `local` | Local files only — skip Honcho sync for this peer |

Resolution order: per-peer field wins → shorthand `memoryMode` → default `"hybrid"`

**Per-Peer Modes:**
- `userMemoryMode=local` → skip adding user messages to Honcho
- `agentMemoryMode=local` → skip adding agent messages to Honcho
- Both `local` → skip `session.addMessages()` entirely
- `userMemoryMode=honcho` → disable local USER.md writes
- `agentMemoryMode=honcho` → disable local MEMORY.md/SOUL.md writes

**Session Strategies:**
| Strategy | Session key | Use case |
|----------|-------------|----------|
| `per-directory` | basename of CWD | Each project gets its own session (recommended for coding) |
| `global` | fixed `"global"` | Single cross-project session (current setup) |
| manual map | user-configured per path | Directory-level overrides via `sessions` config map |

### Environment Variables (Hermes `.env`)

```bash
HONCHO_BASE_URL="http://127.0.0.1:8000"
```

### Hermes Config (`~/.hermes/config.yaml`)

```yaml
memory:
  memory_enabled: true
  memory_char_limit: 2200
  provider: honcho
```

**Note:** The `hermes memory setup` interactive wizard may cancel without saving. If so, use `hermes config set memory.provider honcho` directly. The `hermes honcho` subcommands (status, peers, sessions, etc.) referenced in this skill **do not exist** in current Hermes — use `hermes memory status` and the Honcho HTTP API directly instead.

## Initial Setup

### Prerequisites
- Honcho server running locally (use `honcho-docker-setup` skill)
- `honcho-ai` Python package installed (`pip install honcho-ai`)

### Setup Steps

1. **Create config directory:**
   ```bash
   mkdir -p ~/.honcho
   ```

2. **Create config.json** (see Configuration section above)

3. **Set up workspace and peers:**
   ```bash
   # Create workspace via Honcho API (v3)
   curl -X POST http://127.0.0.1:8000/v3/workspaces \
     -H "Content-Type: application/json" \
     -d '{"name": "<workspace>"}'
   
   # Create peers
   curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/peers \
     -H "Content-Type: application/json" \
     -d '{"name": "<username>"}'
   curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/peers \
     -H "Content-Type: application/json" \
     -d '{"name": "hermes"}'
   
   # Create session
   curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/sessions \
     -H "Content-Type: application/json" \
     -d '{"name": "global-session"}'
   ```

3. **IMPORTANT: All Honcho API endpoints are under /v3/ -- the legacy v1/v2 endpoints (/users/, /workspaces without v3 prefix) will return 404.**

4. **Set peer observation:**
   ```bash
   # POST to /v3/workspaces/{ws}/sessions/{sess}/peers with dict keyed by peer_id
   # CRITICAL: Body must be a dict (not a list) keyed by peer_id
   # WRONG: {"peers": ["<username>", "hermes"], "config": {...}}
   # RIGHT: {"<username>": {"observe_me": true, "observe_others": false}, "hermes": {...}}
   curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/sessions/global-session/peers \
     -H "Content-Type: application/json" \
     -d '{
       "<username>": {"observe_me": true, "observe_others": false},
       "hermes": {"observe_me": true, "observe_others": true}
     }'
   ```

5. **Upload initial context (batch messages):**
   - CRITICAL: The POST `/v3/workspaces/{ws_id}/sessions/{session_id}/messages` endpoint requires a **batch format**, NOT a single message with `{"content": "...", "is_user": true}`.
   
   ```bash
   # WRONG (returns 422 -- missing 'messages' field):
   curl -X POST http://127.0.0.1:8000/v3/workspaces/.../messages \
     -d '{"content": "some text", "is_user": true}'
   
   # RIGHT (batch of messages, each requires content + peer_id):
   curl -X POST http://127.0.0.1:8000/v3/workspaces/.../messages \
     -d '{
       "messages": [
         {"content": "User prefers Camofox browser", "peer_id": "<username>"},
         {"content": "User works on Ubuntu Linux", "peer_id": "<username>"}
       ]
     }'
   ```
   
   - Seed SOUL.md to AI peer via `session.addMessages()` with `<ai_identity_seed>` wrapper
   - Upload MEMORY.md and USER.md to user peer as initial context
   - Each message in the batch must include `peer_id` field (required by MessageCreate schema)

6. **Enable in Hermes (CRITICAL — provider must be set in config.yaml):**

   The `hermes memory setup` interactive wizard may cancel without saving. Set the provider directly:
   ```bash
   hermes config set memory.provider honcho
   hermes memory status   # Should show: Provider: honcho ← active
   ```

   **Pitfall**: `~/.hermes/config.yaml` cannot be edited via `patch`/`write_file` — it's security-protected. The agent will get a refusal error. Use `hermes config set memory.provider honcho` instead. Without this step, Hermes falls back to built-in memory only and Honcho is never consulted even if the server is running and `~/.honcho/config.json` is correct.

7. **Verify Honcho is actually receiving messages from Hermes:**

   Send a test message via the Honcho API and confirm the deriver processes it:
   ```bash
   curl -s -X POST "http://127.0.0.1:8000/v3/workspaces/<workspace>/sessions/global-session/messages" \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"content": "Testing Honcho memory integration", "peer_id": "hermes"}]}'
   docker compose -f ~/honcho/docker-compose.yml logs deriver --tail=20 | grep -E "(Embedded|observation)"
   ```

   Then do a cross-session recall test via a fresh Hermes CLI session:
   ```bash
   hermes chat -q "What do you know about my browser preferences?"
   # Should show honcho_se retrieval + Camofox/Chromium from memory
   ```

   **Both Telegram and CLI share the same Honcho workspace** — sessions appear under `agent-main-telegram-dm-<user_id>` for Telegram and `global-session` for CLI. Messages from both are stored in the same `<workspace>` workspace.

## Management CLI

**Note:** The `hermes honcho` subcommands documented below **do not exist** in current Hermes. Use these alternatives instead:

```bash
hermes memory status              # Show current memory provider config (replaces `hermes honcho status`)
# No CLI for peers/sessions/identity — use Honcho HTTP API directly:
curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/peers/list
curl -X GET "http://127.0.0.1:8000/v3/workspaces/<workspace>/sessions/global-session/context?query=browser&peer_id=<username>"
curl -X POST http://127.0.0.1:8000/v3/workspaces/<workspace>/peers/<username>/representation

hermes memory setup               # Memory provider selection wizard (selects "honcho")
```

The following are **not available** as CLI commands:
- `hermes honcho status`, `peers`, `sessions`, `map`, `peer`, `mode`, `tokens`, `identity`, `migrate`, `enable`, `disable`, `sync`

## Memory Types Stored in Honcho

Honcho automatically extracts observations from conversations. Useful patterns to remember:

**User Preference Memory** — When user corrects or specifies preferences:
- Communication style (concise, verbose, formatted)
- Technical depth (beginner explanations vs expert shorthand)
- Tool preferences (browser choices, CLI tools)
- Working patterns (methodical verification, step-by-step)

**Environment Fact Memory** — Discoveries about user setup:
- OS, tools, package managers, installed software
- Service endpoints (MCP servers, APIs, webhooks)
- Credentials and authentication methods
- Infrastructure details (servers, containers, networks)

**Procedural Knowledge Memory** — Lessons learned from working together:
- Successful approaches to common tasks
- Error patterns and their fixes
- Gotchas and pitfalls discovered
- Workflow optimizations

**Relational Memory** — Honcho's dual-peer model also captures:
- How the user interacts with the agent
- Agent's self-knowledge and capabilities
- Conversation patterns and interaction history

## Integration Points

**When to expect Honcho to be useful:**
1. **After user corrections** — Agent learns and stores preference
2. **After environment discovery** — New tool or service is documented
3. **After completing complex tasks** — Lessons learned are retained
4. **Before new tasks** — Agent retrieves relevant past context
5. **Across sessions** — User preferences persist without manual file edits

## Verification

**Cross-Session Recall Test:**
1. Session A: Tell Hermes "Remember that my test phrase is velvet circuit"
2. Session B (new): Ask "What is my test phrase?"
3. Should recall "velvet circuit" from Honcho

**Writeback Test:**
1. Tell Hermes "Remember that I prefer terse answers"
2. Start new session, ask "How should you respond to me?"
3. Should recall the preference

**Status Check:**
```bash
hermes honcho status
# Should show: Connection... OK
# Active AI peer representation with observed facts
```

## Troubleshooting

### Connection fails
```bash
# Check Honcho server is running
docker compose -f ~/honcho/docker-compose.yml ps
curl -s http://127.0.0.1:8000/v3/workspaces

# Verify config
cat ~/.honcho/config.json | python3 -c "
import json, sys; c = json.load(sys.stdin)
print(f'baseUrl: {c.get(\"baseUrl\")}')
print(f'workspace: {c[\"hosts\"][\"hermes\"][\"workspace\"]}')
print(f'enabled: {c[\"hosts\"][\"hermes\"][\"enabled\"]}')
"
```

### Memories not being extracted
```bash
# Check deriver is processing
docker compose -f ~/honcho/docker-compose.yml logs deriver --tail=30 | grep -E "(observation|embedding|reconciled)"

# Check deriver is running
docker compose -f ~/honcho/docker-compose.yml ps deriver
```

### API issues
```bash
# Test Honcho API directly
curl -s http://127.0.0.1:8000/v3/workspaces/list | python3 -m json.tool
curl -s http://127.0.0.1:8000/v3/workspaces/<workspace>/peers/list | python3 -m json.tool
```

### Database port conflict
If port 5432 is already in use by another PostgreSQL instance (e.g., TimescaleDB, pgvector, LiteLLM), change the Honcho database port in `~/honcho/docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Host 5433 → Container 5432
```

Then update the healthcheck user to match `POSTGRES_USER`:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U <username> -d honcho"]
```

Each runs on its own Docker network with isolated ports — change the host port if 5432 is already in use.

### Missing database tables (alembic migration required)
After fresh database creation, run migrations on the server container:
```bash
cd ~/honcho && docker compose exec server alembic upgrade head
```
Then restart deriver and server:
```bash
docker compose restart deriver server
```

The deriver will fail with `relation "public.active_queue_sessions" does not exist` until migrations complete.

### Session strategy issues
- `per-directory` — each directory gets isolated session memory
- `global` — all conversations share one session (current setup)
- Change with: edit `sessionStrategy` in `~/.honcho/config.json`

### Disable Honcho temporarily
```bash
hermes config set memory.provider ''
# or
hermes memory off   # Falls back to local memory only
```

**Note:** `hermes honcho disable` / `hermes honcho enable` do NOT exist. The memory provider is controlled via `hermes config set memory.provider <name|''>` or `hermes memory off`.

## Migration from Legacy SQLite Memory

The old memory system (`~/.hermes/memory_enhancement/memories.db`) has been replaced by Honcho. Migration was performed:

1. Extracted unique memories from SQLite (5 unique from 25 raw entries)
2. Combined with config.yaml persistent memory facts (13 entries)
3. Sent all unique memories as batch to Honcho workspace `test-workspace`
4. Deriver extracted 23 granular observations with semantic embeddings
5. All memories now searchable via Honcho search API

**Migration test queries that work:**
- Search "browser preferences" → returns Camofox/Chromium preferences
- Search "MCP server authentication" → returns n8n MCP details
- Search "newsletter RSS" → returns FreshRSS and delivery schedule
