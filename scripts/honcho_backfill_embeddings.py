#!/usr/bin/env python3
"""Backfill missing embeddings in Honcho's documents table.

WHY THIS EXISTS
---------------
The July 2026 memory port inserted 114 observation rows directly into
`documents`, bypassing Honcho's embedding pipeline. Those rows carry
sync_state='synced' with embedding IS NULL, so Honcho's own reconciler
considers them done and will never retry them. Effect: they are
permanently invisible to semantic search (honcho_search / recall) even
though they show up in raw representation dumps.

This script finds rows with NULL embeddings, computes vectors using the
SAME embedding endpoint the running containers use, and writes them back.

DESIGN NOTES
------------
- Endpoint/model/dimensions are read from the running container's own env
  by the caller and passed in, so this cannot silently drift from the
  deployed config.
- Embeddings go to Ollama (:11434), NOT llama.cpp (:8080). llama.cpp
  serves chat only. Sending embedding requests there returns garbage or
  404 depending on build.
- Idempotent: only touches rows WHERE embedding IS NULL. Safe to re-run.
- Never deletes or rewrites content. Only populates the embedding column.
- Commits in batches so an interruption keeps completed work.

USAGE
  python3 honcho_backfill_embeddings.py            # real run
  python3 honcho_backfill_embeddings.py --dry-run  # count only
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

DB_CONTAINER = os.environ.get("HONCHO_DB_CONTAINER", "autognosia-honcho-database-1")
DB_USER = os.environ.get("HONCHO_DB_USER", "postgres")
DB_NAME = os.environ.get("HONCHO_DB_NAME", "postgres")

EMBED_URL = os.environ.get(
    "EMBED_URL", "http://127.0.0.1:11434/v1/embeddings"
)
EMBED_MODEL = os.environ.get("EMBED_MODEL", "qwen3-embedding:8b")
EMBED_KEY = os.environ.get("EMBED_KEY", "ollama-local")
EMBED_DIMS = int(os.environ.get("EMBED_DIMS", "1536"))

BATCH_COMMIT = 10


def psql(sql, tuples_only=True):
    """Run SQL in the Honcho database container."""
    cmd = ["docker", "exec", "-i", DB_CONTAINER, "psql", "-U", DB_USER, "-d", DB_NAME]
    if tuples_only:
        cmd += ["-t", "-A"]
    cmd += ["-c", sql]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"psql failed: {res.stderr.strip()[:400]}")
    return res.stdout.strip()


def embed(text):
    """Get one embedding vector from the Ollama-compatible endpoint."""
    payload = json.dumps(
        {"model": EMBED_MODEL, "input": text, "dimensions": EMBED_DIMS}
    ).encode()
    req = urllib.request.Request(
        EMBED_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {EMBED_KEY}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode())
    vec = data["data"][0]["embedding"]
    if len(vec) != EMBED_DIMS:
        raise ValueError(
            f"dimension mismatch: got {len(vec)}, column expects {EMBED_DIMS}"
        )
    return vec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="count only, no writes")
    args = ap.parse_args()

    print("Honcho embedding backfill")
    print(f"  db        : {DB_CONTAINER} ({DB_USER}/{DB_NAME})")
    print(f"  embed url : {EMBED_URL}")
    print(f"  model     : {EMBED_MODEL} @ {EMBED_DIMS} dims")

    total = psql("SELECT count(*) FROM documents;")
    missing = psql("SELECT count(*) FROM documents WHERE embedding IS NULL;")
    print(f"\n  documents total   : {total}")
    print(f"  missing embedding : {missing}")

    if missing == "0":
        print("\nNothing to backfill. All documents embedded.")
        return 0

    if args.dry_run:
        print("\n[dry-run] no changes made.")
        return 0

    # Verify the endpoint before touching the database.
    print("\n  probing embedding endpoint...")
    try:
        probe = embed("probe")
        print(f"  probe OK, vector length {len(probe)}")
    except (urllib.error.URLError, KeyError, ValueError, OSError) as exc:
        print(f"  PROBE FAILED: {exc}")
        print("  Aborting without writing anything.")
        return 1

    rows = psql(
        "SELECT id, replace(content, E'\\n', ' ') FROM documents "
        "WHERE embedding IS NULL ORDER BY created_at;"
    ).splitlines()

    done = 0
    failed = 0
    for line in rows:
        if not line.strip():
            continue
        doc_id, _, content = line.partition("|")
        if not content.strip():
            print(f"  skip {doc_id}: empty content")
            continue
        try:
            vec = embed(content)
        except Exception as exc:
            print(f"  FAIL {doc_id}: {exc}")
            failed += 1
            continue

        literal = "[" + ",".join(repr(float(x)) for x in vec) + "]"
        safe_id = doc_id.replace("'", "''")
        try:
            psql(
                f"UPDATE documents SET embedding = '{literal}'::vector "
                f"WHERE id = '{safe_id}' AND embedding IS NULL;",
                tuples_only=False,
            )
            done += 1
            if done % BATCH_COMMIT == 0:
                print(f"  ...{done} embedded")
        except RuntimeError as exc:
            print(f"  DB FAIL {doc_id}: {exc}")
            failed += 1

    still = psql("SELECT count(*) FROM documents WHERE embedding IS NULL;")
    print(f"\n  embedded this run : {done}")
    print(f"  failures          : {failed}")
    print(f"  still missing     : {still}")

    if still == "0":
        print("\nRESULT: OK - every document now has an embedding.")
        return 0
    print(f"\nRESULT: {still} document(s) still missing embeddings.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
