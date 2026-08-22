# Web Search Backend Configuration Reference

## Backend Availability Checks

Each backend has a specific availability check. The auto-detect system tests them in priority order and picks the first match.

### Per-backend requirements

| Backend | Env var / check | Source |
|---------|-----------------|--------|
| `firecrawl` | `FIRECRAWL_API_KEY` or `FIRECRAWL_API_URL` or managed Nous gateway | `tools/web_tools.py` |
| `parallel` | `PARALLEL_API_KEY` | `tools/web_tools.py` |
| `tavily` | `TAVILY_API_KEY` | `tools/web_tools.py` |
| `exa` | `EXA_API_KEY` | `tools/web_tools.py` |
| `searxng` | `SEARXNG_URL` | `tools/web_tools.py` |
| `brave-free` | `BRAVE_SEARCH_API_KEY` | `tools/web_tools.py` |
| `ddgs` | `ddgs` Python package importable | `tools/web_tools.py` |

## Install ddgs

```bash
pip install ddgs
```

Or via the Hermes venv:
```bash
${HOME}/.hermes/hermes-agent/venv/bin/pip install ddgs
```

## Config file

Located at `${HOME}/.hermes/config.yaml`:

```yaml
web:
  backend: ''           # Shared fallback for both search and extract
  search_backend: ''    # Per-capability override for web_search
  extract_backend: ''   # Per-capability override for web_extract
```

## How backend resolution works

From `tools/web_tools.py::_get_search_backend()`:

1. If `web.search_backend` is set to a known backend name → use it
2. Else if `web.backend` is set to a known backend name → use it
3. Else → auto-detect from env vars in the priority order above

Same logic for `_get_extract_backend()` but reads `web.extract_backend` first.

## Capability matrix

| Backend | Search | Extract | Crawl |
|---------|--------|---------|-------|
| firecrawl | ✓ | ✓ | ✓ |
| parallel | ✓ | ✓ | ✓ |
| tavily | ✓ | ✓ | ✗ |
| exa | ✓ | ✓ | ✗ |
| searxng | ✓ | ✗ | ✗ |
| brave-free | ✓ | ✗ | ✗ |
| ddgs | ✓ | ✗ | ✗ |

## Recommended config for Tavily quota conservation

```yaml
web:
  search_backend: ddgs      # Free, unlimited search
  extract_backend: ''       # Auto-detects to Tavily (only for content extraction)
```

This way Tavily is only used for `web_extract` calls (fetching URL content), not for search queries. The research cron job's `web_search` calls go through ddgs instead.
