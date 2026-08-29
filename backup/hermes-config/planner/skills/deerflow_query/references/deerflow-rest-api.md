# DeerFlow 2.0 REST API Reference

## Discovery (2026-05-29)

DeerFlow at `deerflow.wineandgecko.com` exposes a REST API, **not** an MCP endpoint.
Both `/mcp` and `/sse` return 404.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check (returns `{"status":"healthy"}`) |
| GET | `/api/mcp/config` | Internal MCP server config (filesystem, github, postgres) — not an external endpoint |
| POST | `/api/threads` | Create a new thread |
| POST | `/api/threads/{id}/runs/stream` | Start a streaming run (SSE) |
| POST | `/api/threads/{id}/runs/wait` | Start a blocking run |

## Streaming Run Payload

```json
{
  "assistant_id": "lead_agent",
  "input": {
    "messages": [{"role": "user", "content": "Your query here"}]
  },
  "config": {
    "configurable": {
      "thread_id": "{thread_id}",
      "thinking_enabled": false,
      "is_plan_mode": false,
      "subagent_enabled": false
    }
  }
}
```

Toggle `thinking_enabled` and `is_plan_mode` for different modes.

## Key Lesson

When evaluating DeerFlow for MCP integration: **check the REST API first**. The `/api/mcp/config` endpoint returns internal MCP servers but does not make them available externally. If you need MCP connectivity, you must configure DeerFlow to enable an external MCP endpoint — it is not on by default.
