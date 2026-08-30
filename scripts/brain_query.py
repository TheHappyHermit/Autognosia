#!/usr/bin/env python3
"""
brain_query.py — hybrid BM25 + vector search with RRF fusion.

Usage:
  python3 scripts/brain_query.py "memory architecture"
  python3 scripts/brain_query.py "what did I decide about models" --source oracle-brain
  python3 scripts/brain_query.py "chunking strategy" --top 5

Environment (same as brain_sync.py):
  BRAIN_PG_HOST, BRAIN_PG_PORT, BRAIN_PG_USER, BRAIN_PG_PASSWORD, BRAIN_PG_DB
  BRAIN_OLLAMA_URL, BRAIN_EMBED_MODEL
"""

import argparse
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

import pg8000

# ── Configuration ───────────────────────────────────────────────────────

PG_HOST = os.environ.get("BRAIN_PG_HOST", "127.0.0.1")
PG_PORT = int(os.environ.get("BRAIN_PG_PORT", "5433"))
PG_USER = os.environ.get("BRAIN_PG_USER", "brain")
PG_PASSWORD = os.environ.get("BRAIN_PG_PASSWORD", "brain")
PG_DB = os.environ.get("BRAIN_PG_DB", "brain")

OLLAMA_URL = os.environ.get("BRAIN_OLLAMA_URL", "http://10.1.1.10:11434")
EMBED_MODEL = os.environ.get("BRAIN_EMBED_MODEL", "qwen3-embedding:8b")


def get_db():
    return pg8000.connect(
        host=PG_HOST, port=PG_PORT, user=PG_USER,
        password=PG_PASSWORD, database=PG_DB,
    )


def embed_query(text: str, dim: int = 2000) -> list[float]:
    """Embed a single query string via Ollama with dimension truncation."""
    data = json.dumps({"model": EMBED_MODEL, "input": text, "dimensions": dim}).encode()
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/embed", data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
        return result["embeddings"][0]


def hybrid_search(conn, query_embedding: list[float], query_text: str,
                  top_k: int = 10, source_filter: str = None,
                  fts_weight: float = 0.5, vector_weight: float = 0.5) -> list[dict]:
    """
    Perform hybrid search: full-text (ts_rank) + vector (cosine).
    Combine with Reciprocal Rank Fusion (RRF).
    """
    cur = conn.cursor()

    # Use the brain_search function from the schema
    cur.execute(
        "SELECT * FROM brain_search(%s, %s, %s, %s, %s, %s)",
        (str(query_embedding), query_text, top_k, fts_weight, vector_weight, source_filter)
    )

    results = []
    for row in cur.fetchall():
        results.append({
            "page_id": row[0],
            "chunk_id": row[1],
            "source": row[2],
            "slug": row[3],
            "title": row[4],
            "chunk_text": row[5],
            "chunk_index": row[6],
            "full_text_rank": row[7],
            "vector_rank": row[8],
            "rrf_score": row[9],
        })

    return results


def log_query(conn, query_text: str, query_embedding: list[float], results: list[dict]):
    """Log query to conversation_history for future reference."""
    cur = conn.cursor()
    results_json = json.dumps([{
        "page_id": r["page_id"],
        "chunk_index": r["chunk_index"],
        "score": r["rrf_score"],
        "slug": r["slug"],
    } for r in results[:5]])

    cur.execute("""
        INSERT INTO conversation_history (query_text, query_embedding, results, result_count, created_at)
        VALUES (%s, %s, %s, %s, %s)
    """, (query_text, str(query_embedding), results_json, len(results),
          datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")))
    conn.commit()


def format_results(results: list[dict]) -> str:
    """Format results for terminal output."""
    if not results:
        return "No results found."

    lines = []
    for i, r in enumerate(results, 1):
        # Truncate chunk text for display
        text = r["chunk_text"][:300].replace("\n", " ").strip()
        if len(r["chunk_text"]) > 300:
            text += "..."

        lines.append(
            f"{i}. [{r['source']}] {r['title']}\n"
            f"   Path: {r['slug']}\n"
            f"   Score: {r['rrf_score']:.4f} (FTS: {r['full_text_rank']:.4f}, Vec: {r['vector_rank']:.4f})\n"
            f"   {text}\n"
        )

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Search your brain (hybrid BM25 + vector)")
    parser.add_argument("query", help="Natural-language query")
    parser.add_argument("--source", choices=["active-wiki", "oracle-brain", "exchange-research"],
                        help="Filter by source")
    parser.add_argument("--top", type=int, default=10, help="Number of results (default: 10)")
    parser.add_argument("--fts-weight", type=float, default=0.5, help="Full-text weight (default: 0.5)")
    parser.add_argument("--vector-weight", type=float, default=0.5, help="Vector weight (default: 0.5)")
    parser.add_argument("--no-log", action="store_true", help="Don't log query to history")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    print(f"brain_query.py — Brain Search")
    print(f"  Query: {args.query}")
    print(f"  Source filter: {args.source or 'none'}")
    print()

    # Embed query
    print("Embedding query...", end=" ", flush=True)
    try:
        query_embedding = embed_query(args.query)
        print(f"{len(query_embedding)}-dim")
    except Exception as e:
        print(f"\n[error] Ollama embed failed: {e}")
        sys.exit(1)

    # Search
    try:
        conn = get_db()
    except Exception as e:
        print(f"[error] DB connection failed: {e}")
        sys.exit(1)

    try:
        results = hybrid_search(
            conn, query_embedding, args.query,
            top_k=args.top, source_filter=args.source,
            fts_weight=args.fts_weight, vector_weight=args.vector_weight,
        )

        if not args.no_log and results:
            try:
                log_query(conn, args.query, query_embedding, results)
            except Exception:
                pass  # Non-critical

        if args.json:
            print(json.dumps(results, indent=2, default=str))
        else:
            print(f"\nTop {len(results)} results:\n")
            print(format_results(results))

    except Exception as e:
        print(f"[error] Search failed: {e}")
        sys.exit(1)
    finally:
        conn.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
