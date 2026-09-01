# curl-Based Research Fallback for Oracle Entity Creation

> When Tavily web search/extract returns HTTP 432 (or any web research tool is unavailable), use curl via terminal to gather source data directly.

## Confirmed Working Patterns (2026-08-10)

### GitHub Raw Files — READMEs and Docs
```bash
# README content (first N lines for overview)
curl -sL "https://raw.githubusercontent.com/owner/repo/main/README.md" | head -150

# Check if path exists (404 = wrong branch or renamed)
curl -sL -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/owner/repo/main/path/to/file"
```
Confirmed on: `hendrycks/test`, `SWE-bench/SWE-bench`, `web-arena-x/webarena`, `openai/evals`.

### arXiv Paper Lookup
```bash
# Get paper title (confirms correct arXiv ID)
curl -sL "https://arxiv.org/abs/2406.01574" | grep -oP '<title>.*?</title>' | head -1

# Get abstract (use og:description meta tag — more reliable than blockquote parsing)
curl -sL "https://arxiv.org/abs/2406.01574" | grep -i 'og:description' | head -1

# Get author list
curl -sL "https://arxiv.org/abs/2406.01574" | grep 'citation_author' | head -5
```
Note: arXiv IDs change over time — always verify the title before assuming content matches.

### SPA / JS-Rendered Sites
```bash
# Check if site is SPA (no useful content in HTML body)
curl -sL "https://example.com" | grep -c '<div id="root">'
# If > 0, the site is a React/Vue SPA — curl won't get content. Use browser_navigate instead.
```
Confirmed on: `livebench.ai` (React SPA, only returns `<div id="root">`).

### Wikipedia Raw Articles
```bash
# Raw wikitext — no HTML parsing needed
curl -sL "https://en.wikipedia.org/w/index.php?action=raw&title=Page_Name"
```

### General Meta-Tag Extraction
```bash
# Page description from meta tags
curl -sL "https://example.com" | grep -i 'description' | head -3

# Title
curl -sL "https://example.com" | grep -oP '<title>.*?</title>' | head -1
```

## When curl Fails Too
- **404 on raw.githubusercontent.com:** Check branch name (`main` vs `master`) or path.
- **Empty/redirect responses:** Add `-L` for follow-redirects, check for Cloudflare blocks.
- **SPA sites:** Fall back to `browser_navigate` + `browser_snapshot`.
- **All external sources blocked:** Write from internal knowledge for well-known topics (see SKILL.md Step 0).

## Key Lesson from Session 2026-08-10
Tavily returned HTTP 432 for ALL calls (web_search + web_extract). The curl fallback worked for GitHub raw, arXiv, and general HTML. Only SPA sites (LiveBench) required browser tools. Internal knowledge filled remaining gaps (HELM details, IFEval specifics, reasoning benchmark evolution).
