# arXiv curl Fallback Pattern

When `web_search` and `web_extract` both fail (Tavily HTTP 432), use curl to extract paper metadata from arXiv HTML pages.

## Why This Works

arXiv embeds paper metadata in HTML `<meta>` tags that are stable across page versions. No PDF parsing needed.

## Commands

### Extract paper title

```bash
curl -s "https://arxiv.org/abs/2305.18290" | grep -oP '(?<=<title>).*?(?=</title>)' | head -1
```

### Extract paper abstract

```bash
curl -s "https://arxiv.org/abs/2305.18290" | grep -oP 'citation_abstract.*?content="[^"]*"' | head -1
```

### Extract authors

```bash
curl -s "https://arxiv.org/abs/2305.18290" | grep -oP 'citation_author.*?content="[^"]*"'
```

### Batch: title + abstract for multiple papers

```bash
for id in 2305.18290 2212.08073 2403.07691; do
  echo "=== $id ==="
  curl -s "https://arxiv.org/abs/$id" | grep -oP '(?<=<title>).*?(?=</title>)' | head -1
  curl -s "https://arxiv.org/abs/$id" | grep -oP 'citation_abstract.*?content="[^"]*"' | head -1
done
```

## Reliability Notes

- These meta tags have been stable on arXiv for years
- Response times are fast (~500ms per paper)
- No rate limiting observed for reasonable batch sizes (<50 papers)
- Abstracts may contain HTML entities (`&#39;` for apostrophe) — strip with `sed "s/&#[0-9]*;//g"` if needed
