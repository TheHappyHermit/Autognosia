#!/usr/bin/env python3
"""Consolidate fragmented Honcho human peers onto one canonical identity.

PROBLEM
-------
The same human is split across three Honcho peers:

    <telegram-chat-id>   97 msgs / 67 docs   <- platform numeric ID
    <canonical>          24 msgs / 13 docs   <- honcho.json peerName (the contract)
    <username>          2 msgs /  4 docs   <- stray

Honcho scopes retrieval per peer, so each identity only ever sees its own
slice. Semantic search from Telegram cannot find anything learned in the
desktop app and vice versa.

ROOT CAUSE (verified in source, not guessed)
--------------------------------------------
plugins/memory/honcho/session.py::_resolve_user_peer_id prefers a RUNTIME id
over the configured peer_name. Telegram supplies its numeric chat id as the
runtime id, so it wins over the configured `peerName` from honcho.json. The upstream
fix is the existing `pinUserPeer` flag, which forces the configured peer_name
and ignores runtime identity. No core code change is required.

WHAT THIS SCRIPT DOES
---------------------
Repoints every FK reference from the alias peers onto CANONICAL, inside a
single transaction:

    messages.peer_name
    session_peers.peer_name
    message_embeddings.peer_name
    documents.observer / documents.observed
    collections.observer / collections.observed   (if present)
    peer_card.peer_name / *.observer             (if present)

Merge, never drop: no row is deleted. Only the now-empty alias rows in `peers`
are removed at the very end, and only after every reference has moved.

Conflict handling: session_peers has a composite PK (workspace, session, peer).
If BOTH an alias and the canonical peer are in the same session, a blind UPDATE
would violate that PK. Those rows are deleted instead of updated, because the
canonical row already carries the membership.

SAFETY
------
- pg_dump backup written BEFORE any write; refuses to continue if it fails.
- Single transaction: any error rolls the whole thing back.
- Idempotent: re-running after success is a no-op.
- Verifies post-state by re-querying, and fails loudly if anything remains.

USAGE
  python3 honcho_merge_peers.py --dry-run
  python3 honcho_merge_peers.py
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime, timezone

CONTAINER = os.environ.get("HONCHO_DB_CONTAINER", "honcho-database-1")
DB_USER = os.environ.get("HONCHO_DB_USER", "postgres")
DB_NAME = os.environ.get("HONCHO_DB_NAME", "postgres")
WORKSPACE = os.environ.get("HONCHO_WORKSPACE", "default")

CANONICAL = os.environ.get("HONCHO_CANONICAL_PEER", "<canonical-peer>")

# Aliases to fold into CANONICAL, as (workspace, peer_name).
#
# Discovered the hard way: peers are scoped PER WORKSPACE, and the peers table
# has a composite FK (peer_name, workspace_name). A first attempt treated
# the stray peer as living in the main workspace, and the transaction aborted on
#   Key (peer_name, workspace_name)=(<canonical>, <other-workspace>) is not present
# because that peer actually lives in a SEPARATE workspace.
#
# Cross-workspace moves therefore need a canonical peer row created in EACH
# source workspace before any FK can be repointed there.
ALIASES = [
    # ("<workspace>", "<telegram-chat-id>"),  # platform numeric id
    # ("<other-workspace>", "<stray-peer>"),  # stray, different workspace
]

BACKUP_DIR = os.path.expanduser("~/backups")


def psql(sql, tuples_only=True):
    cmd = ["docker", "exec", "-i", CONTAINER, "psql", "-U", DB_USER, "-d", DB_NAME,
           "-v", "ON_ERROR_STOP=1"]
    if tuples_only:
        cmd += ["-t", "-A"]
    cmd += ["-c", sql]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"psql failed:\n{res.stderr.strip()[:1000]}")
    return res.stdout.strip()


def table_exists(name):
    out = psql(
        "SELECT 1 FROM information_schema.tables "
        f"WHERE table_schema='public' AND table_name='{name}';"
    )
    return out.strip() == "1"


def column_exists(table, column):
    out = psql(
        "SELECT 1 FROM information_schema.columns "
        f"WHERE table_schema='public' AND table_name='{table}' "
        f"AND column_name='{column}';"
    )
    return out.strip() == "1"


def counts(label):
    print(f"\n  {label}")
    rows = psql(
        "SELECT peer_name, count(*) FROM messages GROUP BY peer_name ORDER BY 2 DESC;"
    )
    for line in rows.splitlines():
        if line.strip():
            name, n = line.split("|")
            print(f"    messages  {name:<14} {n}")
    rows = psql(
        "SELECT observed, count(*) FROM documents GROUP BY observed ORDER BY 2 DESC;"
    )
    for line in rows.splitlines():
        if line.strip():
            name, n = line.split("|")
            print(f"    documents {name:<14} {n}")


def backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = os.path.join(BACKUP_DIR, f"honcho-premerge-{stamp}.sql")
    print(f"\n  writing backup -> {path}")
    with open(path, "wb") as fh:
        res = subprocess.run(
            ["docker", "exec", CONTAINER, "pg_dump", "-U", DB_USER, "-d", DB_NAME],
            stdout=fh, stderr=subprocess.PIPE,
        )
    if res.returncode != 0 or os.path.getsize(path) == 0:
        print(f"  BACKUP FAILED: {res.stderr.decode()[:400]}")
        return None
    print(f"  backup OK ({os.path.getsize(path) / 1024 / 1024:.2f} MB)")
    return path


def build_statements():
    """Build the ordered SQL for the merge, scoped per (workspace, alias).

    ORDERING IS LOAD-BEARING. Learned from two rolled-back attempts:

    1. `peers` has a composite FK (peer_name, workspace_name), and peers are
       scoped per workspace. The canonical peer row must exist in EACH source
       workspace first.
    2. `documents` has a composite FK to `collections` on
       (observer, observed, workspace_name), and `collections` has a UNIQUE
       constraint on that same triple. So collections must be reconciled
       BEFORE documents move, and merging can create duplicate triples
       (e.g. both (agent, alias) and (agent, canonical) collapse to the same
       pair). Duplicates are resolved by repointing documents onto the
       surviving collection, then deleting the redundant collection row.
    """
    stmts = []

    for workspace, alias in ALIASES:
        a = alias.replace("'", "''")
        w = workspace.replace("'", "''")

        # --- 1. canonical peer must exist in THIS workspace -----------------
        # peers.id is a NOT NULL text PK with no DEFAULT, so an id must be
        # supplied explicitly. Honcho uses ~21-char nanoids; a 21-char base-ish
        # slice of an md5 keeps the same shape and stays collision-safe here.
        stmts.append(
            f"INSERT INTO peers (id, name, workspace_name) "
            f"SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 21), "
            f"'{CANONICAL}', '{w}' WHERE NOT EXISTS "
            f"(SELECT 1 FROM peers WHERE name='{CANONICAL}' AND workspace_name='{w}');"
        )

        # --- 2. session_peers (composite PK: drop collisions, move rest) ----
        if table_exists("session_peers"):
            stmts.append(
                f"DELETE FROM session_peers sp WHERE sp.peer_name='{a}' "
                f"AND sp.workspace_name='{w}' AND EXISTS "
                f"(SELECT 1 FROM session_peers c WHERE c.peer_name='{CANONICAL}' "
                f"AND c.session_name=sp.session_name AND c.workspace_name=sp.workspace_name);"
            )
            stmts.append(
                f"UPDATE session_peers SET peer_name='{CANONICAL}' "
                f"WHERE peer_name='{a}' AND workspace_name='{w}';"
            )

        # --- 3. collections BEFORE documents -------------------------------
        # Ensure the post-merge target collection exists for every pair that
        # will collapse onto the canonical name, so documents always have a
        # valid FK target.
        if table_exists("collections"):
            # collections.id must be EXACTLY 21 chars (ck_collections_id_length),
            # same as peers/documents/sessions. md5() returns 32, so slice it.
            stmts.append(
                f"INSERT INTO collections (id, workspace_name, observer, observed) "
                f"SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 21), '{w}', "
                f"CASE WHEN observer='{a}' THEN '{CANONICAL}' ELSE observer END, "
                f"CASE WHEN observed='{a}' THEN '{CANONICAL}' ELSE observed END "
                f"FROM collections c1 WHERE c1.workspace_name='{w}' "
                f"AND ('{a}' IN (c1.observer, c1.observed)) "
                f"AND NOT EXISTS (SELECT 1 FROM collections c2 "
                f"WHERE c2.workspace_name='{w}' "
                f"AND c2.observer = CASE WHEN c1.observer='{a}' THEN '{CANONICAL}' ELSE c1.observer END "
                f"AND c2.observed = CASE WHEN c1.observed='{a}' THEN '{CANONICAL}' ELSE c1.observed END);"
            )

        # --- 4. documents: repoint onto the canonical pair ------------------
        # MUST be a SINGLE statement touching observer AND observed together.
        # The FK fk_documents_observer_observed_workspace_name_collections is
        # NOT DEFERRABLE (verified via pg_constraint), so every intermediate
        # row state is validated immediately. Updating the two columns in
        # separate statements briefly produces (canonical, alias), a pair
        # that has no collections row, and the transaction aborts.
        if table_exists("documents"):
            stmts.append(
                f"UPDATE documents SET "
                f"observer = CASE WHEN observer='{a}' THEN '{CANONICAL}' ELSE observer END, "
                f"observed = CASE WHEN observed='{a}' THEN '{CANONICAL}' ELSE observed END "
                f"WHERE workspace_name='{w}' AND '{a}' IN (observer, observed);"
            )

        # --- 5. now-orphaned alias collections can go ----------------------
        if table_exists("collections"):
            stmts.append(
                f"DELETE FROM collections WHERE workspace_name='{w}' "
                f"AND ('{a}' IN (observer, observed));"
            )

        # --- 6. remaining simple FK repoints -------------------------------
        for table, column in [
            ("messages", "peer_name"),
            ("message_embeddings", "peer_name"),
            ("peer_card", "peer_name"),
            ("peer_card", "observer"),
            ("queue", "peer_name"),
        ]:
            if table_exists(table) and column_exists(table, column):
                clause = f'"{column}"=\'{a}\''
                if column_exists(table, "workspace_name"):
                    clause += f" AND workspace_name='{w}'"
                stmts.append(
                    f'UPDATE "{table}" SET "{column}"=\'{CANONICAL}\' WHERE {clause};'
                )

        # --- 7. finally the empty alias peer -------------------------------
        stmts.append(
            f"DELETE FROM peers WHERE name='{a}' AND workspace_name='{w}';"
        )

    return stmts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    print("Honcho peer consolidation")
    print(f"  container : {CONTAINER}")
    print(f"  workspace : {WORKSPACE}")
    print(f"  canonical : {CANONICAL}")
    print(f"  aliases   : {', '.join(f'{w}/{a}' for w, a in ALIASES)}")

    counts("BEFORE:")

    stmts = build_statements()
    print(f"\n  {len(stmts)} statement(s) planned:")
    for s in stmts:
        print(f"    {s[:110]}{'...' if len(s) > 110 else ''}")

    if args.dry_run:
        print("\n  [dry-run] nothing written.")
        return 0

    if not backup():
        print("\n  Refusing to migrate without a verified backup.")
        return 1

    body = "\n".join(stmts)
    try:
        psql(f"BEGIN;\n{body}\nCOMMIT;", tuples_only=False)
    except RuntimeError as exc:
        print(f"\n  MIGRATION FAILED (rolled back): {exc}")
        return 1

    counts("AFTER:")

    alias_names = ", ".join(f"'{a}'" for _, a in ALIASES)
    leftover = psql(
        f"SELECT count(*) FROM messages WHERE peer_name IN ({alias_names});"
    )
    peers_left = psql(
        f"SELECT count(*) FROM peers WHERE name IN ({alias_names});"
    )
    docs_left = psql(
        f"SELECT count(*) FROM documents WHERE observer IN ({alias_names}) "
        f"OR observed IN ({alias_names});"
    )
    print(f"\n  alias messages remaining : {leftover}")
    print(f"  alias documents remaining: {docs_left}")
    print(f"  alias peers remaining    : {peers_left}")

    if any(v.strip() != "0" for v in (leftover, peers_left, docs_left)):
        print("\nRESULT: FAIL - alias references still present.")
        return 1

    print(f"\nRESULT: OK - all history consolidated under '{CANONICAL}'.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
