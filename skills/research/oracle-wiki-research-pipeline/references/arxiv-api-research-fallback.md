# arXiv API Research Fallback

When web_search is unavailable (Tavily HTTP 432, local model offline), use the arXiv API for current research on technical/AI topics.

## Basic Query

```bash
curl -sL "http://export.arxiv.org/api/query?search_query=all:%22QUERY+WORDS%22&sortBy=submittedDate&sortOrder=descending&max_results=10" \
  | grep -oP '<title>[^<]+</title>|<summary>[^<]+</summary>' | head -30
```

## Query Construction

- Use `all:` prefix for full-text search
- URL-encode spaces as `%20` and quotes as `%22`
- Use `AND`/`OR` for boolean logic
- `sortBy=submittedDate` for recency; `sortBy=relevance` for breadth

## Limitations

- Returns XML; parse with `grep -oP` for quick extraction
- No full text — titles and summaries only
- Best for technical/academic topics (AI, neuroscience, physics)
- Latency: 2-5 seconds per query vs instant for web_search

## When to Use

- Web search backend is down (HTTP 432 or timeout)
- Topic is academic/technical where arXiv has coverage
- Need paper-level citations and dates
- Use alongside existing vault content for synthesis

## Example: IIT + Neural Networks

```bash
# Integrated information + neural networks
curl -sL "http://export.arxiv.org/api/query?search_query=all:%22integrated+information%22+AND+all:%22neural+network%22&sortBy=submittedDate&sortOrder=descending&max_results=10"

# PCI + consciousness
curl -sL "http://export.arxiv.org/api/query?search_query=all:%22perturbational+complexity+index%22+AND+all:consciousness&sortBy=submittedDate&sortOrder=descending&max_results=5"
```
