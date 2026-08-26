# Search-First Problem Solving

When encountering problems or needing information, search before creating.

## Search Priority Chain (MANDATORY)

When searching the web, use this priority order. Tavily is **LAST RESORT** — it has limited API calls per month and must only be used when all self-hosted options fail.

1. **CamoFox** (self-hosted Docker browser extraction) — primary, unlimited calls
2. **Firecrawl** (self-hosted Docker) — unlimited
3. **Playwright** (self-hosted Docker browser) — unlimited
4. **SearXNG** (self-hosted, free, unlimited)
5. **Tavily** — LAST RESORT only (limited API calls/month)

Tavily should be the final fallback, never the first choice.

## General Search Process

1. **Check memory first** — see if I've seen this exact issue before in past conversations
2. **Search with self-hosted tools** (CamoFox → Firecrawl → Playwright → SearXNG) before any paid API
3. **Search the internet** — look for GitHub issues, Stack Overflow, Reddit, forums where others have solved this
4. **Look for the official docs** — check upstream documentation, release notes, known issues
5. **Only then** try to solve it myself from scratch

This saves time, tokens, and prevents reinventing the wheel. The internet already has the answers — use them.
