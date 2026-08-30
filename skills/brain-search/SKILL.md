---
name: brain-search
description: Search your personal knowledge base (Active Wiki, Oracle Brain) using hybrid BM25 + vector semantic search with RRF fusion. Use when the user asks to "find notes about X", "search my brain for X", "what do I have on X", or any variation of searching their knowledge base. Trigger phrases: "find me notes", "search my brain", "what do I have on", "brain search", "find in my notes".
platforms: [telegram, cli]
tags: [knowledge, search, brain, wiki, notes]
---

# Brain Search — Hybrid BM25 + Vector Search

Search your personal knowledge bases (Active Wiki + Oracle Brain) using hybrid full-text and semantic search with Reciprocal Rank Fusion.

## When to Use

Trigger when the user asks variations of:
- "Find me notes about X"
- "Search my brain for X"
- "What do I have on X?"
- "Brain search: X"
- "Do I have any notes about X?"
- "What did I write about X?"

## Prerequisites

1. `brain-postgres` Docker container running on port 5433
2. Brain schema applied (`docker compose -f docker/docker-compose.brain.yml up -d`)
3. Brain synced (`python3 scripts/brain_sync.py`)
4. `.venv/bin/python` in the autognosia-clean repo (for pg8000)
5. Ollama running with the embedding model (`qwen3-embedding:8b`)

## How to Search

```bash
cd ~/autognosia-clean && .venv/bin/python scripts/brain_query.py "query here"
```

With source filter:
```bash
cd ~/autognosia-clean && .venv/bin/python scripts/brain_query.py "query" --source oracle-brain
```

With custom top-k:
```bash
cd ~/autognosia-clean && .venv/bin/python scripts/brain_query.py "query" --top 5
```

## Formatting Results for the User

Each result includes:
- `source`: which knowledge base (`active-wiki` or `oracle-brain`)
- `title`: page title
- `slug`: file path within the source
- `chunk_text`: relevant text snippet
- `rrf_score`: combined relevance score

Format results concisely:

```
1. [oracle-brain] AI Safety and Alignment (AI-Safety/Alignment.md)
   Score: 0.0164
   <relevant snippet text>

2. [active-wiki] Homelab Infrastructure (homelab/infrastructure.md)
   Score: 0.0079
   <relevant snippet text>
```

**Important:**
- Always show the source (`[active-wiki]` or `[oracle-brain]`) so the user knows where the result came from
- Truncate long snippets to ~200 chars unless the user asks for more
- If no results, say "I couldn't find anything about X in your knowledge bases"

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Cannot connect to Postgres" | `docker compose -f docker/docker-compose.brain.yml up -d` |
| "Ollama embed failed" | Check Ollama: `curl http://localhost:11434/api/tags` |
| "No results found" | Run sync first: `.venv/bin/python scripts/brain_sync.py` |
| Empty database | Run sync: `.venv/bin/python scripts/brain_sync.py --source active-wiki` |
