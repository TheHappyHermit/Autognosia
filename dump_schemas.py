#!/usr/bin/env python3
"""Dump complete schema + samples from both Autognosia SQLite DBs (read-only)."""
import sqlite3, json, os

DBS = {
    "autognosia.db": os.path.expanduser("~/.autognosia/autognosia.db"),
    "organizer.db": os.path.expanduser("~/.autognosia/personal-organizer/data/organizer.db"),
}
OUT = os.path.expanduser("~/schema_dump.md")

def trunc(v, n=300):
    if isinstance(v, str):
        return v if len(v) <= n else v[:n] + f"...[{len(v)} chars total]"
    return v

lines = []
for label, path in DBS.items():
    lines.append(f"\n\n# ===== {label} ({path}) =====")
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    # SQLite version + journal mode for context
    lines.append(f"sqlite_version={sqlite3.sqlite_version}")
    try:
        jm = cur.execute("PRAGMA journal_mode").fetchone()[0]
        lines.append(f"journal_mode={jm}")
    except Exception as e:
        lines.append(f"journal_mode=ERR {e}")
    tables = [r[0] for r in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
    lines.append(f"TABLES: {tables}")
    views = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name")]
    if views:
        lines.append(f"VIEWS: {views}")
    for t in tables:
        lines.append(f"\n## TABLE {t}")
        try:
            cnt = cur.execute(f"SELECT COUNT(*) FROM \"{t}\"").fetchone()[0]
            lines.append(f"row_count={cnt}")
        except Exception as e:
            lines.append(f"row_count=ERR {e}")
        lines.append("\n-- PRAGMA table_info --")
        cols = cur.execute(f'PRAGMA table_info("{t}")').fetchall()
        for c in cols:
            # cid, name, type, notnull, dflt_value, pk
            lines.append(f"  {c[0]:2d} {c[1]:28s} {c[2] or '':12s} notnull={c[3]} default={c[4]} pk={c[5]}")
        lines.append("\n-- CREATE statement --")
        sqlrow = cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
        lines.append(sqlrow[0] if sqlrow and sqlrow[0] else "(none)")
        idxs = cur.execute(f'PRAGMA index_list("{t}")').fetchall()
        lines.append(f"\n-- indexes ({len(idxs)}) --")
        for ix in idxs:
            iname = ix[1]; unique = ix[2]; origin = ix[3]
            icols = [r[2] for r in cur.execute(f'PRAGMA index_info("{iname}")')]
            lines.append(f"  {iname} unique={unique} origin={origin} cols={icols}")
        fks = cur.execute(f'PRAGMA foreign_key_list("{t}")').fetchall()
        if fks:
            lines.append("-- foreign keys --")
            for fk in fks:
                lines.append(f"  {dict(zip([d[0] for d in cur.description], fk))}")
        lines.append("\n-- sample rows (up to 2) --")
        try:
            rows = cur.execute(f'SELECT * FROM "{t}" ORDER BY rowid DESC LIMIT 2').fetchall()
            for r in rows:
                d = {k: trunc(r[k]) for k in r.keys()}
                lines.append(json.dumps(d, default=str, ensure_ascii=False))
        except Exception as e:
            lines.append(f"(sample error: {e})")
    con.close()

with open(OUT, "w") as f:
    f.write("\n".join(lines))
print(f"WROTE {OUT}, {sum(len(l) for l in lines)} chars, {len(lines)} lines")
