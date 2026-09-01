## Content Extraction Waterfall (Updated)

The newsletter builder uses a 5-stage waterfall in `extract_content_with_waterfall()`:

1. **Stage 1 - FreshRSS content/summary**: Check `item.content.content` first, fall back to `item.summary.content`. **Clean HTML tags and entities** with regex patterns:
   - Entities: `&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);` (named: `&copy;`, numeric: `&#169;`, hex: `&#xA9;`)
   - Tags: `<[^<]+?>`
   - Minimum 200 chars raw / 150 chars cleaned

2. **Stage 2 - Direct URL fetch**: Fetch original article URL with proper User-Agent. Try trafilatura first (if available), fall back to raw HTML text extraction with same entity/tag cleaning. Minimum 100 chars.

3. **Stage 3 - Jina Reader**: Use `https://r.jina.ai/http://{url}` with Bearer token if available. Note: Jina frequently returns 402 (Payment Required) under batch load — do not rely on it as primary.

4. **Stage 4 - RSS summary fallback**: Return cleaned summary with note `*Note: Full content extraction failed, showing RSS summary*`

5. **Stage 5 - Ultimate fallback**: Return `[Unable to extract content for: {title}]`

## Jina Reader Rate Limiting

- Jina's `r.jina.ai` endpoint returns 402 when:
  - API key is missing/invalid
  - Batch requests are made in quick succession
  - Free tier quota is exceeded
- **Do not rely on Jina as a primary extraction method.** It is a last-resort fallback.
- When Jina fails, the next step should be `web_extract` or direct fetch, not another Jina attempt.

## web_extract Usage Pattern

```python
# web_extract accepts up to 5 URLs per call
# Returns markdown with full article text for most news sites
results = web_extract(["https://www.theguardian.com/...", "https://www.bbc.com/..."])
for r in results.get("results", []):
    if r.get("error"):
        print(f"Failed: {r['url']}")
    else:
        content = r["content"]  # Full markdown article text
```

**Sites that work well:** Guardian, NYT, BBC, SCMP, Fox News, Al Jazeera, Japan Times, Times of India, Independent, Seattle Times, CBS News, The Hill, France24, RT, Hackaday, Motley Fool

**Sites that fail (404 or paywall):** Investing.com (requires JS), some SeekingAlpha articles, Telemundo (URL mismatch)

## Key Lesson

When building a newsletter from FreshRSS feeds, expect to use `web_extract` on the original URL for every article. Budget for 1-2 `web_extract` calls per article (5 URLs per call). The FreshRSS content fields alone are never sufficient.
