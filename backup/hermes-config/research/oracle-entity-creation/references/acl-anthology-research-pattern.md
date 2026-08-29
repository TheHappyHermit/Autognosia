# ACL Anthology as Research Source

## When to Use

For active NLP/ML researchers, the ACL Anthology provides up-to-date publication lists that internal knowledge may not cover (especially 2024–2026 papers).

## Pattern

```
browser_navigate("https://aclanthology.org/people/<name>/")
```

The page returns structured data: year-grouped publications with titles, co-authors, and venue info. This is reliable even when Tavily/web_search return HTTP 432 errors.

## Session Evidence

- Kathleen McKeown's ACL page returned 25+ publications from 2025–2026 (iBERT, AdvSumm, DEFREASING, StyleDistance, etc.) that were not in the pre-compaction internal knowledge.
- The browser_navigate snapshot format makes it easy to parse publication titles, venues, and co-authors without HTML parsing.

## Size Target Note

User regularly requests 15–25KB for specialist-grade entity profiles (not the 12KB default). When the task specifies a higher target, write to that target and trim with iterative `patch` → `wc -c` cycles.
