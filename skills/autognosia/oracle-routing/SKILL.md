---
name: oracle-routing
description: Oracle retrieval protocol — semantic search first, ripgrep fallback, evidence-preserving.
---

# Oracle Routing

## Oracle Retrieval Order

1. **Semantic/hybrid retrieval** — best for concept-level questions
2. **Lexical/entity retrieval** — best for specific names/paths
3. **Literal ripgrep against Oracle Markdown** — best for exact text/UUID
4. **Direct page read** — best for known page slugs
5. **Raw-evidence search** — best for source verification
6. **MISS or STALE** — only when all methods exhausted

## Oracle Output Contract

```
STATUS: FOUND | PARTIAL | MISS | STALE
FRESHNESS: <date or "unknown">
ANSWER: <concise synthesis>
IMPORTANT_DETAILS: <bullet list>
SOURCE_PAGES: <list of page slugs>
RAW_EVIDENCE_REFERENCES: <citations>
EPISTEMIC_STATUS: <provenance class>
UNCERTAINTY: <high/medium/low>
NEEDS_RESEARCH: yes | no
```

## Important
A semantic search miss does NOT prove absence. Always try ripgrep fallback.

## Retrieval Depth
- Simple historical question: 8K-20K evidence if required
- Normal synthesis: up to ~25K
- Complex synthesis: 20K-40K
- Exceptional deep history: 40K-60K when justified
- Stop when sufficient evidence exists
