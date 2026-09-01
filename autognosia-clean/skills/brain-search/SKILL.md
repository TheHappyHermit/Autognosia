---
name: brain-search
description: >
  Search your personal knowledge base (Active Wiki, Oracle Brain) using hybrid BM25 + vector semantic search
  with RRF fusion. Use when the user asks to "find notes about X", "search my brain for X", "what do I have on X",
  or any variation of searching their knowledge base. Trigger phrases: "find me notes", "search my brain",
  "what do I have on X", "brain search", "do I have any notes about X", "what did I write about X".
  Also triggers PROACTIVELY when: an entity is the subject of the message, a name you don't recognize appears,
  you're about to assert a non-trivial detail, or you're about to write new notes (check first).
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

**Also trigger proactively** (don't wait for the user to ask "search my brain"):
- An entity (person/company/project/place) is the **subject** of the message
- A name or term appears that you **don't recognize** and looks notable
- You're about to **assert a non-trivial detail** about an entity (attribution, status, history) — verify against the brain first
- You're about to **write new notes** — query first to find existing content and avoid duplication
- A brain-page pointer appears in context (the deterministic layer told you the page exists) — open it before relying on details

**Skip** trivial passing mentions, logistics pings, and anything already loaded in context.

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

## Retrieval Depth (Escalate Only As Needed)

1. **Pointer / metadata** — if a pointer is already in context (slug + one-line summary) and the task only needs identity, stop there.
2. **Full page** — when the entity is the subject or details matter, read the full page from the source wiki.
3. **Linked neighbors** — only when relationship context is needed, pull related pages via graphify or backlinks.

**Resolve only the name(s) the current task needs, use them, drop them.** No bulk-loading.

## Miss ≠ Absence (CRITICAL)

**A Brain Search miss does NOT prove that knowledge does not exist.** If brain search returns nothing:

1. **Don't say "I couldn't find anything"** — instead say "Brain Search didn't return results, let me check the source"
2. **Fall back to ripgrep:**
   ```bash
   rg -i "query" ~/.autognosia/oracle/brain/
   rg -i "query" ~/.autognosia/active-wiki/
   ```
3. **Fall back to direct page read** if you know the slug
4. **Only report absence** after exhausting all fallback methods

## Output Format

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

**Always show the source** (`[active-wiki]` or `[oracle-brain]`) so the user knows where the result came from. Always show the file path so the user can open the full page if needed.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Cannot connect to Postgres" | `docker compose -f docker/docker-compose.brain.yml up -d` |
| "Ollama embed failed" | Check Ollama: `curl http://localhost:11434/api/tags` |
| "No results found" | Run sync first: `.venv/bin/python scripts/brain_sync.py` |
| Empty database | Run sync: `.venv/bin/python scripts/brain_sync.py --source active-wiki` |
| Large files timing out | Sync runs in background; wait for completion |

## Architecture

Brain Search uses:
- **Ollama** for embedding (server-side truncation to 2000 dimensions via `dimensions` parameter)
- **PostgreSQL + pgvector** for vector storage (HNSW index) and full-text search (GIN index)
- **RRF fusion** (Reciprocal Rank Fusion) to combine BM25 and vector results
- **Conversation history** table logs queries for future recall

The database is a **derived index** — if it breaks, it can be rebuilt from the canonical Markdown corpus at any time.
