---
name: camofox
description: Use when you need anti-detection browser automation via CamoFox Docker container. Human-like browsing, accessibility snapshots, element interaction, cookie import, stealth mode.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [browser, automation, camofox, stealth, anti-detection]
---

# CamoFox Browser Automation

CamoFox is an anti-detection browser automation server running as a Docker container. It provides human-like browsing sessions with stealth features, accessibility snapshots, and element interaction.

## Status

- **Container**: `autognosia-camofox` (ghcr.io/jo-inc/camofox-browser:latest)
- **Port**: `127.0.0.1:9377`
- **API Key**: `7919e37716cd294684c9f497014fb103` (from .env.web-stack)
- **Health**: `GET http://127.0.0.1:9377/health`

## Quick Start

```bash
# Check health
curl -s http://127.0.0.1:9377/health

# Create a tab
curl -s -X POST http://127.0.0.1:9377/tabs \
  -H "Content-Type: application/json" \
  -d '{"userId":"agent","sessionKey":"default","url":"https://example.com"}'

# Navigate a tab
curl -s -X POST http://127.0.0.1:9377/tabs/{tabId}/navigate \
  -H "Content-Type: application/json" \
  -d '{"userId":"agent","url":"https://example.com"}'

# Get accessibility snapshot
curl -s "http://127.0.0.1:9377/tabs/{tabId}/snapshot?userId=agent"

# Click element
curl -s -X POST http://127.0.0.1:9377/tabs/{tabId}/click \
  -H "Content-Type: application/json" \
  -d '{"userId":"agent","ref":"e3"}'

# Type text
curl -s -X POST http://127.0.0.1:9377/tabs/{tabId}/type \
  -H "Content-Type: application/json" \
  -d '{"userId":"agent","ref":"e5","text":"hello"}'

# Take screenshot
curl -s "http://127.0.0.1:9377/tabs/{tabId}/screenshot?userId=agent"

# Close tab
curl -s -X DELETE "http://127.0.0.1:9377/tabs/{tabId}?userId=agent"
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/tabs` | Create new tab (requires userId, sessionKey) |
| GET | `/tabs?userId=` | List tabs for user |
| POST | `/tabs/{tabId}/navigate` | Navigate to URL |
| GET | `/tabs/{tabId}/snapshot` | Accessibility tree with element refs |
| POST | `/tabs/{tabId}/click` | Click by ref/selector/coordinates |
| POST | `/tabs/{tabId}/type` | Type text into element |
| POST | `/tabs/{tabId}/press` | Press keyboard key |
| POST | `/tabs/{tabId}/scroll` | Scroll page |
| POST | `/tabs/{tabId}/back` | Go back |
| POST | `/tabs/{tabId}/forward` | Go forward |
| POST | `/tabs/{tabId}/refresh` | Refresh page |
| GET | `/tabs/{tabId}/screenshot` | Base64 PNG screenshot |
| GET | `/tabs/{tabId}/links` | Extract page links |
| GET | `/tabs/{tabId}/images` | Extract page images |
| POST | `/tabs/{tabId}/evaluate` | Run JavaScript |
| POST | `/tabs/{tabId}/extract` | Structured data extraction via JSON Schema |
| DELETE | `/tabs/{tabId}` | Close tab |
| DELETE | `/sessions/{userId}` | Destroy all user sessions |

## When to Use

- Websites with bot detection / CAPTCHA
- Need human-like browsing patterns
- Accessibility tree snapshots for UI automation
- Cookie import for authenticated sessions
- Anti-detection scraping

## Docker Management

```bash
# Start
cd ~/firecrawl-stack && docker compose -f docker-compose.web-stack.yml up -d

# Stop
docker compose -f ~/firecrawl-stack/docker-compose.web-stack.yml down

# View logs
docker logs autognosia-camofox
```
