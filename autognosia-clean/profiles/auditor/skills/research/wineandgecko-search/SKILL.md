---
name: wineandgecko-search
description: "Search wineandgecko SearXNG metasearch via POST API."
version: 1.0.0
author: Hermes Agent
license: MIT
dependencies: [curl, python3]
platforms: [linux]
metadata:
  hermes:
    tags: [search, metasearch, SearXNG, web, images, news, videos, science]
---

# Wine & Gecko Search (SearXNG) Skill

## Overview

Uses `https://search.wineandgecko.com/` — a SearXNG metasearch engine instance — to query multiple search engines (Google, Bing, DuckDuckGo, Brave, etc.) without tracking.

## Quick Reference

**Base URL:** `https://search.wineandgecko.com/search`
**Method:** POST
**Content-Type:** `application/x-www-form-urlencoded`
**Response:** JSON (set `format=json`)

### Basic Search

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json" | python3 -m json.tool
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | Yes | Search query |
| `format` | No | Response format: `json` (default HTML) |
| `categories` | No | Comma-separated: `general`, `images`, `news`, `science`, `it`, `videos`, `files`, `music`, `reports`, `maps` |
| `engines` | No | Comma-separated: `google`, `bing`, `duckduckgo`, `brave`, `yahoo`, `baidu`, `yandex`, `qwant`, `startpage`, `metager`, `wikipedia` |
| `language` | No | Language code: `en`, `de`, `fr`, `es`, `auto` (default) |
| `time_range` | No | `day`, `week`, `month`, `year` |
| `safesearch` | No | `0` (none), `1` (moderate), `2` (strict) |
| `pageno` | No | Page number (1-based) |
| `number_of_results` | No | Max results to return |

## Search Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| `general` | Standard web search | Most queries |
| `images` | Image results | Visual search |
| `news` | News articles | Current events |
| `science` | Academic/research | Papers, studies |
| `it` | IT/tech | Technology topics |
| `videos` | Video results | YouTube, etc. |
| `files` | File searches | Downloads |
| `music` | Music results | Audio searches |
| `reports` | Corporate reports | Business research |
| `maps` | Map results | Location search |

## Response Structure

```json
{
  "query": "search term",
  "results": [
    {
      "title": "Page Title",
      "url": "https://example.com",
      "content": "Snippet or description",
      "thumbnail": "image_url_or_empty",
      "engine": "brave",
      "score": 2.14,
      "category": "general",
      "publishedDate": "2024-01-01",
      "engines": ["brave", "duckduckgo"],
      "positions": [1, 5]
    }
  ],
  "answers": [],
  "corrections": [],
  "infoboxes": [],
  "suggestions": ["related search 1", "related search 2"],
  "unresponsive_engines": []
}
```

## Common Workflows

### Workflow 1: General Web Search

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json&categories=general&language=en"
```

### Workflow 2: News Search (Last Week)

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json&categories=news&time_range=week"
```

### Workflow 3: Academic/Science Search

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json&categories=science"
```

### Workflow 4: Image Search

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json&categories=images"
```

### Workflow 5: Multi-Engine Search

```bash
curl -s -X POST "https://search.wineandgecko.com/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q=your+query&format=json&engines=google,bing,duckduckgo"
```

### Workflow 6: Extract Results with Python

```python
import subprocess
import json

def searxng_search(query, categories="general", engines="", language="auto"):
    """Search SearXNG and return parsed results."""
    params = f"q={query}&format=json&categories={categories}&language={language}"
    if engines:
        params += f"&engines={engines}"
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", "https://search.wineandgecko.com/search",
         "-H", "Content-Type: application/x-www-form-urlencoded",
         "-d", params],
        capture_output=True, text=True
    )
    
    data = json.loads(result.stdout)
    return data.get("results", [])

# Usage
results = searxng_search("python programming", categories="general")
for r in results[:5]:
    print(f"- {r['title']}")
    print(f"  URL: {r['url']}")
    print(f"  Snippet: {r['content'][:100]}")
```

## Tips

- **JSON format is essential** for programmatic use (`format=json`)
- **Multi-category** search: use comma-separated categories like `general,news,science`
- **Score field** indicates relevance ranking (higher = better match)
- **Unresponsive engines** shows which search backends failed
- **Suggestions** field provides related search terms
- No API key or authentication required — completely open access

## When to Use

- When you need an alternative to web_search/Tavily
- When you want to aggregate results from multiple search engines
- For privacy-focused searching (no tracking)
- When you need specific categories (news, images, science, videos)
- As a fallback when other search APIs are rate-limited or unavailable

## Comparison with Built-in web_search

| Feature | web_search | wineandgecko-search |
|---------|-----------|---------------------|
| Rate limit | Provider dependent | None known |
| Result sources | Single engine | Multi-engine aggregation |
| Categories | General only | 10+ categories |
| Privacy | Tracked | No tracking |
| JSON API | Built-in | POST endpoint |
| Custom engines | No | Yes (select engines) |

## Troubleshooting

- **Empty results**: Try different engines (`engines=google,bing`)
- **Rate limited**: SearXNG instances can be rate-limited; add delays between rapid queries
- **No images**: Ensure `categories=images` is set
- **Wrong language**: Set `language=en` (or desired language code) explicitly
- **HTML response**: Ensure `format=json` parameter is included
