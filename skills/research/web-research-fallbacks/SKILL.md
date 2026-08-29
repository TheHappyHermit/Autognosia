---
name: web-research-fallbacks
description: Use when search is down; fetch primary sources directly.
version: 1
---

# Web Research Fallbacks (Search Backends Down)

Fallback ladder for research tasks when search infrastructure degrades:

1. `web_search` (Tavily) — first choice.
2. Private SearXNG JSON API — see the `searxng-search` skill.
3. **Direct primary-source fetching** (this skill) — skip discovery entirely; go straight to the known/likely URLs of authoritative sources (vendor engineering blogs, official docs, GitHub raw).

## Core technique: fetch + local text cache

Works from Windows git-bash via `execute_code` (Python urllib). Verified working 2026-08.

```python
import urllib.request, re, html as H, os

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
outdir = r"C:/Users/josh4/research_pages"   # cache dir, reuse across the session

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    txt = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", raw)   # strip script/style
    txt = re.sub(r"(?s)<[^>]+>", "\n", txt)                          # tags -> newlines
    txt = H.unescape(re.sub(r"\n{3,}", "\n\n", txt))                 # entities + blank lines
    name = os.path.join(outdir, re.sub(r"[^A-Za-z0-9._-]", "_", url.split("/")[-1]) or "page.txt")
    open(name, "w").write(txt)
    return name

fetch("https://www.anthropic.com/engineering/multi-agent-research-system")
```

Then work from the cache: `read_file` with offset/limit to page through, and keyword mining via `execute_code` (grep-style scans for "pitfall", "caveat", section headers) instead of re-fetching. Repeated reads are free; network calls are not.

## Pitfalls (observed in this environment)

- **SearXNG burst rate-limiting:** after rapid consecutive queries, ALL results come back empty — even a trivial `q=test` probe returns nothing, and it does not recover quickly. Space single queries out with delays; if the first 2–3 go empty, stop probing and move to direct fetching instead of burning calls on retries.
- **Bing HTML scraping mangles multi-word queries** (returns results for a garbled query string). DuckDuckGo's `html.duckduckgo.com/html/` endpoint returns an interstitial/CAPTCHA page in this environment. Do not spend time on either — go straight to primary sources.
- **JS-heavy doc sites:** if the fetched text is mostly nav chrome, try raw endpoints instead: `raw.githubusercontent.com/<org>/<repo>/HEAD/docs/...`, or known stable doc paths (e.g. `/docs/user-guide/features/<name>`).
- **Some pages 403 without a browser UA** — always send the Chrome User-Agent header above.

## Before delivering a report with citations

Verify every cited URL actually resolves (cheap, catches paraphrased/wrong URLs):

```python
for u in urls:
    r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20)
    print(r.status, u, "->", r.geturl())   # note redirects: cite the final URL
```

## When NOT to use this skill

If `web_search` works, just use it — direct fetching is slower and you lose discovery. This skill is for degraded-search conditions only.
