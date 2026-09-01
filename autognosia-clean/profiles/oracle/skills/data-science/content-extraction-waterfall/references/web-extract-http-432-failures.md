# web_extract HTTP 432 Failure Patterns

## Problem

`web_extract` (Tavily-based) returns HTTP 432 errors on certain sites. This is a server-side rejection, not a timeout — the server actively refuses the request.

## Known Failing Sites (as of May 2026)

| Site | Error | Workaround |
|------|-------|------------|
| Reddit (r/Bogleheads, etc.) | HTTP 432 | Use web_search snippets; Reddit blocks automated extraction |
| AQR PDF documents | HTTP 432 | Use web_search to find summaries; PDFs often need direct fetch |
| Vanguard corporate pages | HTTP 432 | Use `browser_navigate` for full content |
| Dimensional.com | HTTP 432 | Use web_search snippets |
| BlackRock institutional pages | HTTP 432 | Use `browser_navigate` |

## Workaround Strategy

When `web_extract` returns HTTP 432:

1. **Check web_search results first** — Tavily search often succeeds where extract fails. The snippets may contain enough information.
2. **Use `browser_navigate`** — For sites that need JS rendering or block automated extractors, navigate directly with the browser tool.
3. **Accept snippet-only results** — For some sites (Reddit), web_search snippets are the only available source.

## Detection

HTTP 432 errors appear in web_extract results as:
```
"error": "Tavily extract failed: Client error '432' for url '...'"
```

When you see this pattern, immediately fall back to web_search or browser_navigate — don't retry the same extract.
