---
name: rss-content-waterfall
category: mlops
description: Pattern for building RSS content extraction waterfalls with FreshRSS API integration — multi-stage fallback chain for maximum article content retrieval, LLM summarization, and caching.
---

# RSS Content Waterfall

Pattern for extracting maximum article content from RSS feeds via a multi-stage fallback chain, with FreshRSS API integration and LLM summarization.

## When to Use

- Building automated newsletter digest systems from RSS feeds
- Extracting article content when RSS feeds are truncated
- Fetching content from sites that block or limit RSS output
- Any system needing robust content extraction with graceful degradation

## FreshRSS Google Reader API Integration

FreshRSS supports the Google Reader API — use it instead of generic RSS feed parsing:

### Authentication

```python
def get_freshrss_auth_token(freshrss_url: str, username: str, password: str) -> str:
    """Authenticate and return Auth token."""
    resp = requests.post(
        f"{freshrss_url}/api/greader.php/accounts/ClientLogin",
        data={"Email": username, "Passwd": password, "service": "reader"},
        timeout=30,
    )
    for line in resp.text.splitlines():
        if line.startswith("Auth="):
            return line[5:]
```

### Fetching Articles

```python
def fetch_articles(auth_token: str, freshrss_url: str, n: int = 25, stream_id: str = "user/-/state/com.google/reading-list"):
    """Fetch unread articles from FreshRSS."""
    resp = requests.get(
        f"{freshrss_url}/api/greader.php/reader/api/0/stream/contents/{stream_id}",
        params={"n": n, "output": "json"},
        headers={"Authorization": f"GoogleLogin auth={auth_token}"},
        timeout=60,
    )
    data = resp.json()
    return data.get("items", [])
```

**Stream IDs:**
- `user/-/state/com.google/reading-list` — all unread
- `user/-/label/Technology` — specific category/tag (use slug format)
- `user/-/state/com.google/starred` — starred items only

### Normalizing FreshRSS Items

```python
# FreshRSS API returns items with different structure than feedparser
for item in items:
    link = item.get("alternate", [{}])[0].get("href", "")
    content = item.get("content", {}).get("content", "")
    summary = item.get("summary", {}).get("content", "")
    # Categories are raw strings, NOT dicts with 'label' key
    categories = [str(c) for c in item.get("categories", [])]
```

**Pitfall**: FreshRSS API categories are returned as flat strings like
`"user/-/label/Technology"`, not as `{"label": "Technology"}` dicts.

### IP-Direct Connection (for DNS-less setups)

When the FreshRSS hostname doesn't resolve in DNS (e.g., on LAN but no DNS or `/etc/hosts` entry), use IP-direct with the `Host` header for virtual hosting:

```python
import requests

def get_auth_token_ip_direct(username, password, freshrss_ip, freshrss_host, freshrss_port=443):
    ip_base = f"https://{freshrss_ip}:{freshrss_port}/api"
    headers = {
        'Host': freshrss_host,
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Waterfall/1.0)'
    }
    resp = requests.post(
        f"{ip_base}/greader.php/accounts/ClientLogin",
        data={"Email": username, "Passwd": password, "service": "reader"},
        headers=headers,
        timeout=30,
        verify=False  # Self-signed cert
    )
    for line in resp.text.splitlines():
        if line.startswith("Auth="):
            return line[5:]
    raise ValueError(f"Auth failed: {resp.text[:200]}")

def api_get_ip_direct(auth_token, path, params, freshrss_ip, freshrss_host, freshrss_port=443):
    ip_base = f"https://{freshrss_ip}:{freshrss_port}/api"
    headers = {
        'Host': freshrss_host,
        'Authorization': f"GoogleLogin auth={auth_token}",
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Waterfall/1.0)'
    }
    resp = requests.get(
        f"{ip_base}/greader.php{path}",
        params=params,
        headers=headers,
        timeout=60,
        verify=False
    )
    return resp
```

**When to use**: The FreshRSS hostname is NXDOMAIN, not in `/etc/hosts`, or only resolves on a different network segment. Use the raw server IP (e.g., `10.1.1.10`) with the correct `Host` header (e.g., `freshrss.wineandgecko.com`).

## Content Extraction Waterfall

**Key insight**: With a Jina API key, Jina Reader becomes the PRIMARY extraction method.
Without one, it falls back to the traditional HTTP→trafilatura chain.

### Stage 1: RSS Content Check
```python
MIN_WORDS = 200  # NOT 300 — modern JS-heavy sites often yield 150-250 words via trafilatura
content = item.get("content", {}).get("content", "")
summary = item.get("summary", {}).get("content", "")
```

### Stage 2: Jina Reader (PRIMARY — requires JINA_API_KEY)
```python
jina_resp = requests.get(f"https://r.jina.ai/{url}", headers={
    "Authorization": f"Bearer {JINA_API_KEY}",  # CRITICAL — gets full content on blocked domains
    "Accept": "text/plain",
    "X-With-Generated-Alt": "true",
}, timeout=30)
# With API key: returns 3000-5000+ words even on JS-heavy sites
# Times of India: 5400+ words, Investing.com: 3400+ words
# Without API key: anonymous access blocked (451) for some domains
```

### Stage 3: Direct URL Fetch + Trafilatura (fallback)
```python
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
resp = requests.get(url, headers=headers, timeout=15, stream=True)
import trafilatura
text = trafilatura.extract(html, include_comments=False, include_tables=False, output_format="txt")
if text and len(text.split()) >= MIN_WORDS:
    return text, "trafilatura"
```

### Stage 4: Jina Reader (ANONYMOUS — rate limited, no API key)
```python
jina_resp = requests.get(f"https://r.jina.ai/{url}", headers={"Accept": "text/plain"}, timeout=30)
# WARNING: Some domains return 451 for anonymous access (abuse detection)
```

### Stage 5: Wayback Machine Fallback
```python
# Get most recent Wayback snapshot and fetch via Jina Reader
```

### Stage 6: RSS Summary Fallback + LLM
```python
# Strip HTML from RSS summaries before feeding to LLM
import re
clean = re.sub(r'<[^>]+>', ' ', raw_text)
clean = re.sub(r'\\s+', ' ', clean).strip()
if len(clean.split()) >= 30:
    summary = summarize_with_llm(clean, title)  # LLM can work with 30+ words
```

### Why Jina Reader with API Key is the Best Primary Method
| Method | Times of India | Investing.com | Post-Gazette |
|--------|---------------|---------------|--------------|
| RSS feed | 55-62 words (truncated) | 7 words | varies |
| Trafilatura | 221 words (server HTML only) | 403 blocked | varies |
| Jina (no key) | 451 blocked | 451 blocked | ✅ 2497 words |
| **Jina (with key)** | **✅ 5411 words** | **✅ 3468 words** | **✅ 2631 words** |

Jina with API key handles JS rendering, paywalls, and Cloudflare protection
that break both direct fetch, trafilatura, and even browser tools. It's the
single most reliable extraction method for automated pipelines.

### What DOESN'T Work (Confirmed Failures)
- **web_extract**: Gets initial HTML without JS execution → misses article body on JS-heavy sites
- **SearXNG API**: Self-hosted instances return 403 for programmatic search access
- **Investing.com via browser**: Even full browser with Cloudflare shows "Just a moment..." — Jina API key is the ONLY reliable bypass
- **trafilatura alone**: Gets 221 words from 294KB Times of India HTML (0.07% yield)

## Critical Pitfalls

### 0. OpenRouter Key Exhaustion → Swap to a Free Model
OpenRouter keys have a limited dollar balance and return `403 Key limit exceeded` when depleted.
The fix is NOT to get a new key — swap the summarization model to a **free OpenRouter model**:

```python
# In the newsletter builder script, replace the model:
model="openrouter/owl-alpha"  # Free, works for summarization
# Instead of:
model="openai/gpt-4o-mini"    # Paid, consumes key balance
```

Free models that work well for newsletter summarization: `openrouter/owl-alpha`.
The env var `SUMMARIZATION_MODEL` or equivalent script constant should prefer a free
model by default to avoid silent failures. Test-swap before deploying.

### 1. Shell `$(...)` Corrupts Passwords with `$`
When editing `.env` files, NEVER use `echo >>` for values containing `$`:
```bash
# BAD — $ in password gets interpreted as shell variable
echo "FRESHRSS_API_PASSWORD=secret$123" >> ~/.hermes/.env

# GOOD — use Python to write the file safely
python3 -c "
with open('~/.hermes/.env', 'a') as f:
    f.write('FRESHRSS_API_PASSWORD=secret$123\n')
"
```

### 2. Environment File Corruption
If a password contains `$` and `echo` was used without a trailing newline on the previous line,
the shell will merge lines. Always verify the raw bytes after editing env files:
```python
with open('~/.hermes/.env') as f:
    for line in f:
        if 'PASSWORD' in line:
            _, _, val = line.strip().partition('=')
            print(f'Length: {len(val)}, Raw: {val!r}')
```

### 3. Trafilatura Returns Less Than 300 Words
Many modern sites (Times of India, investing.com, etc.) are heavily JS-rendered.
Trafilatura extracts only the server-rendered HTML, yielding 150-250 words from
200KB+ HTML files. Default MIN_WORDS was lowered from 300 to 200.

### 4. Jina Reader Blocks Abused Domains (Without API Key)
Jina Reader returns 451 for anonymous access to domains flagged for abuse. Common blocked domains:
- `timesofindia.indiatimes.com`
- Financial news sites (investing.com, etc.)
These return "SecurityCompromiseError: Anonymous access blocked..."

**FIX**: Use a Jina API key (get at https://jina.ai/reader/). With a key, ALL
previously-blocked domains work — Times of India returns 5400+ words,
investing.com returns 3400+ words. Get the key and set `JINA_API_KEY` in `.env`.

### 6. FreshRSS Has No Username-Free Auth
The Google Reader API endpoint requires both `Email` (username) and `Passwd`.
The `/p/{api_password}/` RSS output endpoint is a different system — it requires
an API token generated in FreshRSS settings, not the login password.

## Environment Variables

```bash
# Required
FRESHRSS_URL=https://freshrss.example.com
FRESHRSS_API_PASSWORD=your_password  # May contain $ — be careful with shell quoting
FRESHRSS_USERNAME=your_username
OPENROUTER_API_KEY=sk-or-...
JINA_API_KEY=jina_...                # CRITICAL — bypasses 451 blocks on many domains

# Optional
MAX_ARTICLES=25              # Articles per run (default)
LOOKBACK_HOURS=24            # Time window for articles
FRESHRSS_TAG=Technology      # Filter by FreshRSS category
SUMMARIZATION_MODEL=openrouter/owl-alpha  # Default; use free models to avoid key exhaustion
```

### OpenRouter Key Limits & Free Model Fallback

OpenRouter keys have a **$10 limit** by default. When `limit_remaining` hits 0, the API returns 403 `"Key limit exceeded (total limit)"`. The newsletter pipeline should handle this:

- **Primary model**: `openrouter/owl-alpha` (free tier on OpenRouter, no cost per token)
- **Avoid**: `openai/gpt-4o-mini` or other paid-only models — these burn through the $10 limit quickly
- **Detection**: Poll the key status with `curl -s https://openrouter.ai/api/v1/auth/key -H "Authorization: Bearer $OPENROUTER_API_KEY"`
- **Fallback**: When the LLM call fails, the script should truncate raw text (first 500 chars) and continue rather than aborting the newsletter

Set `SUMMARIZATION_MODEL` in the script or env to the free model. The change is in the `summarize_content()` function — swap `model="openai/gpt-4o-mini"` to `model="openrouter/owl-alpha"`.
```

## Cron Job Delivery (Hermes Agent)

Best approach: use the cron tool with `deliver: telegram` for automated delivery:

```json
{
  "name": "Morning Newsletter (6 AM)",
  "schedule": "0 6 * * *",
  "prompt": "Run ~/.hermes/newsletter_venv/bin/python3 ~/.hermes/scripts/newsletter_builder.py and deliver the output as your final response.",
  "deliver": "telegram",
  "toolsets": ["terminal", "file"]
}
```

The cron agent runs in a fresh session, executes the script, and delivers the
formatted newsletter to the user's Telegram. No wrapper scripts needed — the
script produces a clean text output that the cron agent forwards as-is.

**Key insight**: Don't use hybrid approaches where the cron agent selectively
improves failed articles. With a Jina API key, the script handles 100% of
articles successfully in one pass. Keep the cron prompt simple.

## SQLite Caching

Use a cache to:
- Avoid re-fetching/summarizing the same URLs within 24h
- Support crash recovery (process previously-fetched but unsummarized articles via `--process-cache` flag)
- Track content source statistics

```python
import sqlite3
conn = sqlite3.connect("~/.hermes/newsletter_cache.db")
conn.execute("""
    CREATE TABLE IF NOT EXISTS article_cache (
        url_hash TEXT PRIMARY KEY, url TEXT, title TEXT, summary TEXT,
        content_source TEXT, processed INTEGER, created_at REAL, expires_at REAL
    )
""")
```

## Rate Limiting

Use `time.sleep(1.5)` between fetches. With Jina API key, each article takes
~2-5 seconds (Jina fetch + LLM summarization). For 25 articles: ~2-3 minutes total.
