---
name: deerflow_query
category: research
description: Interface to interact with DeerFlow 2.0 instance using curl commands to communicate with DeerFlow Gateway and LangGraph APIs
---

# DeerFlow Query Skill

## Description
This skill provides a simple interface to interact with the DeerFlow 2.0 instance using curl commands to communicate with the DeerFlow Gateway and LangGraph APIs.

## Base URLs
- Base URL: https://deerflow.<oracle-server>
- Gateway URL: https://deerflow.<oracle-server>

## ⚠️ No MCP Endpoint
DeerFlow does **not** expose an MCP or SSE endpoint. Both `/mcp` and `/sse` return 404. Use the REST API below instead.

## REST API Endpoints
- Thread creation: `POST /api/threads`
- Streaming run: `POST /api/threads/{thread_id}/runs/stream`
- Wait run: `POST /api/threads/{thread_id}/runs/wait`
- Health: `GET /health`
- Internal MCP config: `GET /api/mcp/config` (returns internal servers only, not external)

## Available Operations
1. Health check: GET /health
2. Thread creation: POST /api/threads
3. Wait run: POST /api/threads/<thread_id>/runs/wait
4. Streaming runs: POST /api/threads/<thread_id>/runs/stream

## Usage Examples

### Health Check
```bash
curl -X GET https://deerflow.<oracle-server>/health
```

### Create Thread
```bash
curl -X POST https://deerflow.<oracle-server>/api/threads \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Start Streaming Run (Fast Mode)
```bash
curl -X POST https://deerflow.<oracle-server>/api/threads/{thread_id}/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "lead_agent",
    "input": {
      "messages": [{"role": "user", "content": "Summarize today\\\\'s major global and geopolitical news"}]
    },
    "config": {
      "configurable": {
        "thread_id": "{thread_id}",
        "thinking_enabled": false,
        "is_plan_mode": false,
        "subagent_enabled": false
      }
    }
  }'
```

### Start Streaming Run (Pro Mode)
```bash
curl -X POST https://deerflow.<oracle-server>/api/threads/{thread_id}/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "lead_agent",
    "input": {
      "messages": [{"role": "user", "content": "Summarize today\\\\'s major global and geopolitical news"}]
    },
    "config": {
      "configurable": {
        "thread_id": "{thread_id}",
        "thinking_enabled": true,
        "is_plan_mode": true,
        "subagent_enabled": false
      }
    }
  }'
```

## Pitfalls
- **Response has no `.output` wrapper.** The `/runs/wait` endpoint returns the messages array at the root level: `.messages[-1].content[0].text` — NOT `.output.messages[-1].content[0].text`. Using `.output` will return `null`.
- **Content is an array of blocks**, not a string. Always access `.content[0].text`, not `.content` directly.

## Notes
- The streaming endpoint returns Server-Sent Events (SSE) format
- For non-streaming responses, you may need to adjust the endpoint or parameters
- Replace {thread_id} with the actual thread ID obtained from thread creation
- The assistant_id may need adjustment based on your DeerFlow configuration