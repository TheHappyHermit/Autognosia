---
name: content-extraction-waterfall
description: Multi-stage content extraction pipeline for news articles - ordered from cheapest/free methods to paid API fallbacks. Maximizes content retrieval while minimizing API costs.
category: data-science
---

# Content Extraction Waterfall

A multi-stage fallback pipeline for extracting full article content from URLs. Ordered from cheapest (free) to most expensive (API calls), so the cheapest method that succeeds is always used.

## Waterfall Stages (order matters)

### Stage 1: RSS Content (FREE - already fetched)
- Check if RSS feed has `content` or `summary` fields with ≥ 200 words
- Many feeds have content ≥ 200 words — use it directly, skip all other stages
- If both `content` and `summary` exist, pick whichever has more words
- **Cost: $0, Speed: instant**

### Stage 2: Direct URL Fetch + Trafilatura (FREE)
- Fetch the article URL directly with a realistic User-Agent header
- Run `trafilatura.extract()` with `include_comments=False`, `include_tables=False`
- If trafilatura returns ≥ 200 words, done
- If under 200 words, try BS4 paragraph extraction as a free fallback
- **Cost: $0, Speed: ~1s per URL**

### Stage 3: BS4 Paragraph Fallback (FREE)
- When trafilatura extracts too little content (< 200 words), the HTML may still have useful `<p>` content
- Parse HTML with BeautifulSoup, extract paragraphs with > 40 chars each
- Join them and check if result ≥ 200 words
- **Cost: $0, Speed: instant (HTML already fetched)**

### Stage 4: Playwright Headless Chromium (FREE)
- Uses system-installed Chromium via Playwright Python library
- Launches headless browser, waits for DOMContentLoaded + 3s JS render
- Strips boilerplate (nav, header, footer, aside) via JS evaluation
- Returns if body text ≥ 200 words (or > 50 if close)
- Uses `--no-sandbox --disable-gpu --disable-dev-shm-usage` flags
- Chromium path: prefers `/snap/bin/chromium`, falls back to `/usr/bin/chromium-browser`
- **Cost: $0, Speed: ~5-8s**
- **Caveat**: Cloudflare-protected sites (investing.com) still show "Just a moment..." — doesn't help here

### Stage 5: Wayback Machine (FREE)
- Query `https://web.archive.org/web/timemap/link/URL` for recent snapshot
- Fetch the snapshot URL, extract text via Jina Reader
- **Cost: $0, Speed: ~5-10s (two requests + processing)**

### Stage 6: FlareSolverr (FREE - bypasses Cloudflare)
- If `FLARESOLVERR_URL` env var is set (deployed at `flaresolverr.<oracle-server>:8191`), call POST `{url}/v1` with `{"cmd": "request.get", "url": url, "maxTimeout": 30000}`
- Parses returned HTML with BeautifulSoup, strips boilerplate (nav, header, footer, aside, script, style)
- Returns text ≥ 200 words (or > 50 if close)
- **Cost: $0, Speed: ~5-15s**
- **Purpose**: Bypasses Cloudflare protection that blocks investing.com and similar financial sites
- **Status**: LIVE and confirmed — successfully extracting 1,500-1,600+ word articles from investing.com
- **See also**: `references/web-extract-http-432-failures.md` — known sites that block web_extract with HTTP 432

### Stage 7: Jina Reader (API KEY - LIMITED USAGE, THRESHOLDED)
- **ABSOLUTE LAST RESORT** — only called if RSS summary has ≥ 500 words
- This threshold prevents burning API credits on articles without substantial RSS content
- Call `https://r.jina.ai/{url}` with Bearer token
- Use headers: `{"Authorization": "Bearer <key>", "X-With-Generated-Alt": "true"}`
- Returns extracted text for JS-heavy sites, paywalls, and blocked pages
- Timeout: 30s
- **Cost: API credits, Speed: ~2-5s**

### Stage 8: Fallback Summary
- Use RSS `summary` or article `title` as last resort
- Add note: "Note: Full article content could not be retrieved (paywall, network error, or blocked)."

## What Each Tool Can/Cannot Extract

### Tools That FAIL on JS-heavy sites:
- `trafilatura`: Gets raw HTML only, no JS execution. Fails on Times of India, many ad-heavy sites
- `web_extract`: Same — gets initial HTML shell, article body often renders later via JS
- Direct fetch + BS4: Same limitation as trafilatura

### Tools That SUCCEED on JS-heavy sites:
- `browser_navigate` / `browser_vision`: Full Chromium JS rendering ✅
- `Jina Reader (r.jina.ai)`: Server-side JS rendering ✅ (with API key)
- **Playwright headless Chromium**: Uses system browser, full JS rendering ✅ (free, but ~5-8s slower)

### Tools That FAIL even with browser:
- Cloudflare-protected sites (investing.com, some financial sites): "Just a moment..." blocks all approaches including browser + Playwright
- **Solution**: Deploy FlareSolverr (`flaresolverr.<oracle-server>`) — handles Cloudflare challenges automatically
- Until FlareSolverr is running, these fall to `rss_summary_short` — accept it

## What Percentage of Articles Need Each Stage (from real 20+ article samples):
- **Stage 1 (RSS ≥200w)**: ~30-40% — Hackaday, FoxNews, Yahoo Finance provide full content
- **Stage 2 (Trafilatura)**: ~30-40% — BBC, Seattle Times, Al Jazeera, ScienceAlert, NBC
- **Stage 3 (BS4)**: ~0% — rarely catches anything trafilatura misses
- **Stage 4 (Playwright)**: ~5% — CBS News, some BBC articles — free but slow (~8s)
- **Stage 5 (Wayback)**: ~0% — rarely triggers
- **Stage 6 (FlareSolverr)**: ~10% — investing.com exclusively — confirmed working at `flaresolverr.<oracle-server>:8191`
- **Stage 7 (Jina)**: ~0% — only if RSS ≥500w AND all free methods fail
- **Stage 8 (Fallback)**: ~5-10% — unrecoverable articles (Reddit cross-posts, title-only)

## Known Site Extraction Results (tested):
- 🟢 **Hackaday, FoxNews, NBC, Seattle Times, Al Jazeera, ScienceAlert, Slashdot, Tom's Guide, Yahoo Finance** — trafilatura ≥200w
- 🟢 **BBC** — Playwright gets 596w when trafilatura misses it
- 🟢 **Times of India** — trafilatura gets 250-300w (surprisingly good)
- 🟢 **Investing.com** — ONLY works with FlareSolverr (Cloudflare blocks everything else)
- 🔴 **Cloudflare-protected sites** — ONLY FlareSolverr helps; Playwright/browser/Jina all show CF challenge

## web_extract Tool Limitations

### HTTP 432 Rejection Pattern

`web_extract` (Tavily-based) returns HTTP 432 errors on certain sites — the server actively refuses the request. This is NOT a timeout; retrying the same URL will fail again.

**Known failing sites**: Reddit, AQR PDFs, Vanguard corporate pages, Dimensional.com, BlackRock institutional pages.

**Workaround**: When you see `"error": "Tavily extract failed: Client error '432'"`:
1. Fall back to `web_search` snippets (Tavily search often succeeds where extract fails)
2. Use `browser_navigate` for JS-heavy or bot-blocked sites
3. Accept snippet-only results for sites like Reddit

**Full reference**: See `references/web-extract-http-432-failures.md`

## Key Implementation Notes

### FlareSolverr Integration:
- Default URL: `http://flaresolverr.<oracle-server>:8191`
- Set in env as `FLARESOLVERR_URL` with `/v1` appended for the API call
- Response JSON: `{"status": "ok", "solution": {"url": "...", "status": 200, "response": "<html>..."}}`
- Extract text from `solution.response` HTML with BeautifulSoup
- If `FLARESOLVERR_URL` is empty, skip seamlessly to next stage

### Playwright Setup:
- Python `playwright` pip package installed in the newsletter venv
- System Chromium at `/snap/bin/chromium` (Ubuntu snap) — works reliably
- Playwright's own bundled chromium (in `~/.cache/ms-playwright/`) has version mismatches — DON'T use it
- Always specify `executable_path` to use system Chromium
- Multiline `page.evaluate()` strings cause "Invalid or unexpected token" errors — use single-line strings
- `page.evaluate('document.querySelectorAll("selector").forEach(el => el.remove())')` — keep inline, no newlines
- Add args: `--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-blink-features=AutomationControlled`

### Trafilatura:
- Works on most sites despite no JS execution
- `include_comments=False, include_tables=False, output_format="txt"`
- 200-word threshold is the sweet spot — catches most useful content without false positives

### Jina Reader:
- Anonymous (no API key) gets 451'd quickly due to rate limiting/"previous abuse"
- With Jina API key (`jina_xxx`): handles JS rendering, paywalls, Cloudflare bypass
- Headers: `{"Authorization": "Bearer <key>", "X-With-Generated-Alt": "true"}`
- Timeout: 30s (Jina can be slow on large pages)
- ALWAYS threshold: only call if RSS summary ≥ 500 words, to preserve API quota
- NEVER put it first — always after all free methods