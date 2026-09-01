---
name: firecrawl
description: Use when you need web scraping, search, or content extraction via Firecrawl Docker container. Scrapes URLs to markdown/HTML, searches the web via SearXNG.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [scraping, search, firecrawl, web-extraction]
---

# Firecrawl Web Scraping & Search

Firecrawl is a web scraping and search API running as a Docker container. It converts web pages to clean markdown and provides search capabilities via SearXNG.

## Status

- **Container**: `firecrawl-stack-firecrawl-api-1` (ghcr.io/firecrawl/firecrawl:latest)
- **Port**: `127.0.0.1:3002`
- **API Key**: `837a3b4ffbb633b4239fb79335a4e308` (from .env.web-stack)
- **Health**: `GET http://127.0.0.1:3002/v2/health`

## Quick Start

```bash
# Scrape a URL (markdown)
curl -s http://127.0.0.1:3002/v2/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 837a3b4ffbb633b4239fb79335a4e308" \
  -d '{"url":"https://example.com"}'

# Scrape with options
curl -s http://127.0.0.1:3002/v2/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 837a3b4ffbb633b4239fb79335a4e308" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": true
  }'

# Search the web (via SearXNG)
curl -s http://127.0.0.1:3002/v2/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 837a3b4ffbb633b4239fb79335a4e308" \
  -d '{"query":"latest AI news","limit":5}'
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v2/scrape` | Scrape URL to markdown/HTML |
| POST | `/v2/search` | Search the web |
| POST | `/v2/crawl` | Crawl entire website |
| POST | `/v2/map` | Get site map |
| GET | `/v2/health` | Health check |

## Scrape Options

```json
{
  "url": "https://example.com",
  "formats": ["markdown", "html", "links", "screenshot"],
  "onlyMainContent": true,
  "includeTags": ["p", "h1", "h2"],
  "excludeTags": ["nav", "footer"],
  "waitFor": 2000,
  "mobile": false,
  "skipTlsVerification": false
}
```

## When to Use

- Convert web page to clean markdown
- Extract article content (strips nav/ads)
- Search the web programmatically
- Crawl documentation sites
- Get structured data from pages

## Docker Stack

Firecrawl runs as part of the firecrawl-stack:
- `firecrawl-api` (port 3002) - Main API
- `playwright-service` - Headless browser for scraping
- `nuq-postgres` - Job queue database
- `redis` - Rate limiting / caching
- `rabbitmq` - Job queue transport
- `camofox` (port 9377) - Anti-detection browser

```bash
# Start entire stack
cd ~/firecrawl-stack && docker compose -f docker-compose.web-stack.yml up -d

# Stop
docker compose -f ~/firecrawl-stack/docker-compose.web-stack.yml down

# View API logs
docker logs firecrawl-stack-firecrawl-api-1
```

## Python Client

```python
# firecrawl SDK not installed, use requests:
import requests

def scrape(url, api_key="837a3b4ffbb633b4239fb79335a4e308"):
    resp = requests.post(
        "http://127.0.0.1:3002/v2/scrape",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"url": url, "formats": ["markdown"]}
    )
    return resp.json()["data"]["markdown"]
```

## Notes

- Requires SearXNG for search functionality (running on host)
- Localhost URLs (127.0.0.1, localhost) are blocked by Firecrawl v2
- For local services, use Playwright or CamoFox instead
