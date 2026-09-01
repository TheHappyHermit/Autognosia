# Search-First Problem Solving

When encountering problems or needing information, search before creating.

## Search Priority Chain (MANDATORY — Josh's explicit order)

Use this EXACT priority order. This is Josh's mandated chain (corrected 2026-08-26 — he pushed back when curl was used as the default). Do not reorder, and do not substitute Playwright for curl.

1. **CamoFox** (self-hosted browser backend, `127.0.0.1:9377`) — **PRIMARY**. Navigate and READ pages with the browser tool.
2. **Firecrawl** (self-hosted, `POST http://127.0.0.1:3002/v1/scrape` with `{"url":"U","formats":["markdown"]}`) — SECOND.
3. **SearXNG** (self-hosted metasearch, `GET http://127.0.0.1:8080/search?q=Q&format=json`) — THIRD.
4. **Tavily** — **DISABLED this month** (quota exhausted). DO NOT USE until explicitly re-enabled.
5. **curl** raw page fetch — **LAST RESORT ONLY**.

Key rules:
- Camofox is FIRST, not curl. curl is the final fallback — never the default.
- Do NOT use `web_search` / `web_extract` (external internet) when the self-hosted stack is available.
- Because Tavily is out, the *effective* chain right now is: **Camofox → Firecrawl → SearXNG → curl**.
- For the `desktop-researcher` profile, bake this chain into the profile SOUL.md so it is automatic — do not re-instruct it per task.

## General Search Process

1. **Check memory first** — see if I've seen this exact issue before in past conversations
2. **Search with self-hosted tools** (CamoFox → Firecrawl → Playwright → SearXNG) before any paid API
3. **Search the internet** — look for GitHub issues, Stack Overflow, Reddit, forums where others have solved this
4. **Look for the official docs** — check upstream documentation, release notes, known issues
5. **Only then** try to solve it myself from scratch

This saves time, tokens, and prevents reinventing the wheel. The internet already has the answers — use them.
