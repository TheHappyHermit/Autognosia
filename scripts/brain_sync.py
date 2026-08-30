#!/usr/bin/env python3
"""
brain_sync.py — sync markdown knowledge bases into brain-postgres.

Scans Active Wiki, Oracle Brain, and Exchange Research for .md files.
Chunks content on headers, embeds via Ollama, upserts into PostgreSQL + pgvector.
Only re-embeds changed files (sha256 comparison).

PLATFORM: Cross-platform (Python 3.8+)
  • Requires: pg8000 (pure Python, no native deps)
  • Ollama must be reachable at BRAIN_OLLAMA_URL
  • Postgres must be reachable at BRAIN_PG_* env vars

Usage:
  python3 scripts/brain_sync.py                  # sync all sources
  python3 scripts/brain_sync.py --init            # init schema (assumes already applied via compose)
  python3 scripts/brain_sync.py --source active-wiki   # sync one source
  python3 scripts/brain_sync.py --dry-run         # don't write to DB
  python3 scripts/brain_sync.py --force           # re-embed all files (ignore hash)

Environment:
  BRAIN_PG_HOST     (default: 127.0.0.1)
  BRAIN_PG_PORT     (default: 5433)
  BRAIN_PG_USER     (default: brain)
  BRAIN_PG_PASSWORD (default: brain)
  BRAIN_PG_DB       (default: brain)
  BRAIN_OLLAMA_URL  (default: http://127.0.0.1:11434)
  BRAIN_EMBED_MODEL (default: qwen3-embedding:8b)
  BRAIN_CHUNK_TOKENS (default: 512)
  BRAIN_CHUNK_OVERLAP (default: 50)
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import pg8000

# ── Configuration ───────────────────────────────────────────────────────

AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))

SOURCES = {
    "active-wiki": AUTOGNOSIA_HOME / "active-wiki",
    "oracle-brain": AUTOGNOSIA_HOME / "oracle" / "brain",
    "exchange-research": AUTOGNOSIA_HOME / "exchange" / "research",
}

PG_HOST = os.environ.get("BRAIN_PG_HOST", "127.0.0.1")
PG_PORT = int(os.environ.get("BRAIN_PG_PORT", "5433"))
PG_USER = os.environ.get("BRAIN_PG_USER", "brain")
PG_PASSWORD = os.environ.get("BRAIN_PG_PASSWORD", "brain")
PG_DB = os.environ.get("BRAIN_PG_DB", "brain")

OLLAMA_URL = os.environ.get("BRAIN_OLLAMA_URL", "http://10.1.1.10:11434")
EMBED_MODEL = os.environ.get("BRAIN_EMBED_MODEL", "qwen3-embedding:8b")

CHUNK_TOKENS = int(os.environ.get("BRAIN_CHUNK_TOKENS", "512"))
CHUNK_OVERLAP = int(os.environ.get("BRAIN_CHUNK_OVERLAP", "50"))

# Approximate chars per token for markdown text
CHARS_PER_TOKEN = 3.5

# ── Database helpers ────────────────────────────────────────────────────

def get_db():
    """Create a new pg8000 connection."""
    return pg8000.connect(
        host=PG_HOST,
        port=PG_PORT,
        user=PG_USER,
        password=PG_PASSWORD,
        database=PG_DB,
    )


def rfc3339_now() -> str:
    """Return current time as RFC 3339 UTC string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ── Chunking ────────────────────────────────────────────────────────────

def estimate_tokens(text: str) -> int:
    """Rough token estimate for markdown text."""
    return int(len(text) / CHARS_PER_TOKEN)


def chunk_markdown(text: str, source: str, slug: str) -> list[dict]:
    """
    Split markdown into chunks respecting structure.
    Split on ## headers. Keep ~CHUNK_TOKENS tokens per chunk with overlap.
    Never split inside a fenced code block.
    
    Returns list of {"index": int, "text": str, "token_count": int}
    """
    chunks = []
    current_chunk_lines = []
    current_tokens = 0
    in_code_block = False
    chunk_index = 0

    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]

        # Track code blocks
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            current_chunk_lines.append(line)
            i += 1
            continue

        # If we're in a code block, always append
        if in_code_block:
            current_chunk_lines.append(line)
            i += 1
            continue

        # Check if this line is a header (## or #)
        is_header = re.match(r'^#{1,6}\s', line)

        # If we hit a header and current chunk is large enough, flush
        if is_header and current_tokens > CHUNK_TOKENS // 2:
            chunk_text = "\n".join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append({
                    "index": chunk_index,
                    "text": chunk_text,
                    "token_count": estimate_tokens(chunk_text),
                })
                chunk_index += 1
                # Keep overlap
                overlap_lines = []
                overlap_tokens = 0
                for cl in reversed(current_chunk_lines):
                    cl_tokens = estimate_tokens(cl)
                    if overlap_tokens + cl_tokens > CHUNK_OVERLAP:
                        break
                    overlap_lines.insert(0, cl)
                    overlap_tokens += cl_tokens
                current_chunk_lines = overlap_lines
                current_tokens = overlap_tokens

        current_chunk_lines.append(line)
        current_tokens += estimate_tokens(line)

        # If chunk is big enough, flush
        if current_tokens >= CHUNK_TOKENS:
            chunk_text = "\n".join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append({
                    "index": chunk_index,
                    "text": chunk_text,
                    "token_count": estimate_tokens(chunk_text),
                })
                chunk_index += 1
                # Keep overlap
                overlap_lines = []
                overlap_tokens = 0
                for cl in reversed(current_chunk_lines):
                    cl_tokens = estimate_tokens(cl)
                    if overlap_tokens + cl_tokens > CHUNK_OVERLAP:
                        break
                    overlap_lines.insert(0, cl)
                    overlap_tokens += cl_tokens
                current_chunk_lines = overlap_lines
                current_tokens = overlap_tokens

        i += 1

    # Flush remaining
    if current_chunk_lines:
        chunk_text = "\n".join(current_chunk_lines).strip()
        if chunk_text:
            chunks.append({
                "index": chunk_index,
                "text": chunk_text,
                "token_count": estimate_tokens(chunk_text),
            })

    return chunks


# ── Embedding ───────────────────────────────────────────────────────────

def get_embedding_dimension() -> int:
    """Get the embedding dimension by probing Ollama."""
    try:
        data = json.dumps({
            "model": EMBED_MODEL,
            "input": "test"
        }).encode()
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/embed",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return len(result["embeddings"][0])
    except Exception:
        return 4096  # Default fallback


def embed_texts(texts: list[str], dim: int = 2000) -> list[list[float]]:
    """Embed a batch of texts via Ollama /api/embed with dimension truncation."""
    data = json.dumps({
        "model": EMBED_MODEL,
        "input": texts,
        "dimensions": dim,
    }).encode()
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/embed",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
        return result["embeddings"]


# ── File scanning ───────────────────────────────────────────────────────

def compute_file_hash(filepath: Path) -> str:
    """Compute sha256 hash of file content."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def scan_source(source_name: str, source_dir: Path) -> list[dict]:
    """
    Scan a source directory for .md files.
    Returns list of {"path": Path, "slug": str, "content": str, "hash": str, "title": str}
    """
    files = []
    if not source_dir.exists():
        print(f"[warn] Source dir not found: {source_dir}")
        return files

    for md_file in source_dir.rglob("*.md"):
        # Skip hidden dirs, .git, graphify-out
        parts = md_file.relative_to(source_dir).parts
        if any(p.startswith(".") or p == "graphify-out" for p in parts):
            continue

        try:
            content = md_file.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue

        # Extract title from first H1 or filename
        title = md_file.stem
        for line in content.split("\n"):
            if line.startswith("# "):
                title = line[2:].strip()
                break

        # Slug = relative path from source
        slug = str(md_file.relative_to(source_dir))

        files.append({
            "path": md_file,
            "slug": slug,
            "content": content,
            "hash": compute_file_hash(md_file),
            "title": title,
        })

    return files


# ── Database operations ─────────────────────────────────────────────────

def ensure_hnsw_index(conn, dim: int):
    """Ensure the HNSW index exists for the correct dimension."""
    cur = conn.cursor()
    # Check if index exists
    cur.execute("""
        SELECT indexname FROM pg_indexes 
        WHERE indexname = 'idx_embeddings_hnsw' AND tablename = 'embeddings'
    """)
    if cur.fetchone() is None:
        print(f"  Creating HNSW index for dim={dim}...")
        # Ensure the vector column has the correct dimension
        cur.execute(f"ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector({dim});")
        cur.execute(f"""
            CREATE INDEX idx_embeddings_hnsw ON embeddings
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64)
        """)
        conn.commit()
        print("  HNSW index created.")


def upsert_page(conn, source: str, slug: str, title: str, content: str,
                file_hash: str, metadata: dict, chunk_count: int, embedding_model: str) -> int:
    """Insert or update a page. Returns page_id."""
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO pages (source, slug, title, content, metadata, file_hash, chunk_count, embedding_model, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (source, slug)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            metadata = EXCLUDED.metadata,
            file_hash = EXCLUDED.file_hash,
            chunk_count = EXCLUDED.chunk_count,
            embedding_model = EXCLUDED.embedding_model,
            updated_at = %s
        RETURNING id
    """, (source, slug, title, content, json.dumps(metadata), file_hash, chunk_count,
          embedding_model, rfc3339_now(), rfc3339_now(), rfc3339_now()))
    return cur.fetchone()[0]


def delete_embeddings(conn, page_id: int):
    """Delete all embeddings for a page (before re-inserting)."""
    cur = conn.cursor()
    cur.execute("DELETE FROM embeddings WHERE page_id = %s", (page_id,))


def insert_embedding(conn, page_id: int, chunk_index: int, chunk_text: str,
                     embedding: list[float], token_count: int):
    """Insert a single embedding row."""
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO embeddings (page_id, chunk_index, chunk_text, embedding, token_count, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (page_id, chunk_index) DO UPDATE SET
            chunk_text = EXCLUDED.chunk_text,
            embedding = EXCLUDED.embedding,
            token_count = EXCLUDED.token_count
    """, (page_id, chunk_index, chunk_text, str(embedding), token_count, rfc3339_now()))


def record_sync_state(conn, source: str, files_synced: int, chunks_created: int,
                      duration_ms: int, status: str, error_message: str = ""):
    """Record sync state."""
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO sync_state (source, last_run_at, files_synced, chunks_created, duration_ms, status, error_message)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (source, rfc3339_now(), files_synced, chunks_created, duration_ms, status, error_message))


def get_stored_hash(conn, source: str, slug: str) -> str | None:
    """Get the stored file_hash for a page, or None if not found."""
    cur = conn.cursor()
    cur.execute("SELECT file_hash FROM pages WHERE source = %s AND slug = %s", (source, slug))
    row = cur.fetchone()
    return row[0] if row else None


# ── Main sync logic ─────────────────────────────────────────────────────

def sync_source(conn, source_name: str, force: bool = False, dry_run: bool = False) -> dict:
    """
    Sync a single source directory.
    Returns stats dict.
    """
    source_dir = SOURCES[source_name]
    stats = {"source": source_name, "scanned": 0, "new": 0, "updated": 0, "unchanged": 0, "errors": 0, "chunks": 0}

    print(f"\n=== Syncing: {source_name} ({source_dir}) ===")

    files = scan_source(source_name, source_dir)
    stats["scanned"] = len(files)
    print(f"  Scanned {len(files)} .md files")

    # Embedding dimension is fixed at 2000 (pgvector HNSW max)
    # Ollama truncates server-side via "dimensions" parameter
    dim = 2000
    print(f"  Embedding dimension: {dim}")

    if not dry_run:
        ensure_hnsw_index(conn, dim)

    # Process files
    for file_info in files:
        slug = file_info["slug"]
        file_hash = file_info["hash"]

        # Check if unchanged
        if not force:
            stored_hash = get_stored_hash(conn, source_name, slug)
            if stored_hash == file_hash:
                stats["unchanged"] += 1
                continue

        # Determine if new or updated
        stored_hash = get_stored_hash(conn, source_name, slug)
        if stored_hash is None:
            stats["new"] += 1
        else:
            stats["updated"] += 1

        # Chunk
        chunks = chunk_markdown(file_info["content"], source_name, slug)
        if not chunks:
            continue

        # Embed chunks (batch)
        embeddings = []
        batch_size = 16
        for i in range(0, len(chunks), batch_size):
            batch = [c["text"] for c in chunks[i:i + batch_size]]
            try:
                batch_embeddings = embed_texts(batch)
                embeddings.extend(batch_embeddings)
            except Exception as e:
                print(f"  [error] Embed failed for {slug} batch {i}: {e}")
                stats["errors"] += 1
                continue

        if len(embeddings) != len(chunks):
            print(f"  [error] Embedding count mismatch for {slug}: {len(embeddings)} vs {len(chunks)}")
            stats["errors"] += 1
            continue

        if dry_run:
            stats["chunks"] += len(chunks)
            continue

        # Upsert page
        try:
            # Parse frontmatter if present
            metadata = {}
            if file_info["content"].startswith("---"):
                parts = file_info["content"].split("---", 2)
                if len(parts) >= 3:
                    # Simple YAML-ish parse (good enough for metadata)
                    for line in parts[1].split("\n"):
                        if ":" in line:
                            key, val = line.split(":", 1)
                            metadata[key.strip()] = val.strip()

            page_id = upsert_page(
                conn, source_name, slug, file_info["title"],
                file_info["content"], file_hash, metadata, len(chunks), EMBED_MODEL
            )

            # Delete old embeddings and insert new
            delete_embeddings(conn, page_id)
            for chunk, embedding in zip(chunks, embeddings):
                insert_embedding(conn, page_id, chunk["index"], chunk["text"], embedding, chunk["token_count"])

            conn.commit()
            stats["chunks"] += len(chunks)
            print(f"  [ok] {slug}: {len(chunks)} chunks")

        except Exception as e:
            print(f"  [error] Upsert failed for {slug}: {e}")
            conn.rollback()
            stats["errors"] += 1

    print(f"  Stats: {stats}")
    return stats


def main():
    parser = argparse.ArgumentParser(description="Sync markdown knowledge bases into brain-postgres")
    parser.add_argument("--init", action="store_true", help="Initialize schema (no-op if already done via compose)")
    parser.add_argument("--source", choices=list(SOURCES.keys()), help="Sync a specific source")
    parser.add_argument("--force", action="store_true", help="Re-embed all files (ignore hash)")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to DB")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    print(f"brain_sync.py — Native Brain Search Sync")
    print(f"  Ollama: {OLLAMA_URL}")
    print(f"  Model: {EMBED_MODEL}")
    print(f"  PG: {PG_HOST}:{PG_PORT}/{PG_DB}")

    # Check Ollama
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            models = json.loads(resp.read())
            model_names = [m["name"] for m in models.get("models", [])]
            if EMBED_MODEL not in model_names:
                print(f"[warn] Embed model {EMBED_MODEL} not found in Ollama. Available: {model_names[:5]}...")
    except Exception as e:
        print(f"[error] Ollama not reachable at {OLLAMA_URL}: {e}")
        sys.exit(1)

    # Connect to DB
    try:
        conn = get_db()
    except Exception as e:
        print(f"[error] Cannot connect to Postgres: {e}")
        sys.exit(1)

    # Init mode
    if args.init:
        dim = get_embedding_dimension()
        ensure_hnsw_index(conn, dim)
        print("Schema initialized.")
        conn.close()
        return

    # Determine sources to sync
    sources = [args.source] if args.source else list(SOURCES.keys())

    total_stats = {"scanned": 0, "new": 0, "updated": 0, "unchanged": 0, "errors": 0, "chunks": 0}
    start_time = time.time()

    for source_name in sources:
        try:
            stats = sync_source(conn, source_name, force=args.force, dry_run=args.dry_run)
            for k in total_stats:
                total_stats[k] += stats.get(k, 0)
            # Record sync state
            if not args.dry_run:
                record_sync_state(
                    conn, source_name,
                    stats["new"] + stats["updated"],
                    stats["chunks"],
                    int((time.time() - start_time) * 1000),
                    "success" if stats["errors"] == 0 else "partial"
                )
                conn.commit()
        except Exception as e:
            print(f"[error] Sync failed for {source_name}: {e}")
            total_stats["errors"] += 1
            if not args.dry_run:
                record_sync_state(conn, source_name, 0, 0, 0, "error", str(e)[:500])
                conn.commit()

    duration_ms = int((time.time() - start_time) * 1000)
    print(f"\n=== Sync Complete ===")
    print(f"  Duration: {duration_ms}ms")
    print(f"  Scanned: {total_stats['scanned']}")
    print(f"  New: {total_stats['new']}")
    print(f"  Updated: {total_stats['updated']}")
    print(f"  Unchanged: {total_stats['unchanged']}")
    print(f"  Chunks: {total_stats['chunks']}")
    print(f"  Errors: {total_stats['errors']}")

    conn.close()
    return 0 if total_stats["errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
