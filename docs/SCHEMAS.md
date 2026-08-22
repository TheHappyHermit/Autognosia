# Autognosia Data Schemas — Assessment & Standards

Status assessment of every Autognosia datastore against common best practice
(SQLite pragmatics, event-log design, task/GTD models, inter-agent message
envelopes). Wikis are excluded — they follow OKF v2 (`SCHEMA` page in the
Active Wiki).

Audit date: 2026-08-22 · SQLite 3.53 · stores live under `~/.autognosia/`.

---

## 0. Cross-cutting standards (apply everywhere)

### S1 — Timestamps: one format, always UTC

Current state is **mixed** inside single columns:

```
tasks.created_at     "2026-08-17 01:05:03"        (space, no zone)
tasks.created_at     "2026-08-18T05:29:06Z"       (ISO, Z)
reminders.sent_at    "2026-08-20T00:47:02.562660" (ISO, micros, no zone)
```

String comparison — which every query and index relies on — silently breaks
across these forms. **Standard going forward:** RFC 3339 UTC,
`YYYY-MM-DDTHH:MM:SSZ` (SQLite's `strftime('%Y-%m-%dT%H:%M:%SZ','now')`),
second precision. Writers must emit this form; legacy rows sort correctly
among themselves and new ISO rows sort after all space-separated ones, so no
destructive migration is required — normalize opportunistically on update.

### S2 — Journal mode: WAL

Both databases ship `journal_mode=delete`. The Command Deck API reads these
files continuously from another process; WAL eliminates reader/writer blocking
and is persistent (set once):

```sql
PRAGMA journal_mode=WAL;
```

Applied by `scripts/apply_schema_upgrades.py` (idempotent).

### S3 — Foreign keys must be enforced by every writer

Orphaned `verification_checks` rows were found in production (FK enforcement
is per-connection in SQLite). Every connection must execute
`PRAGMA foreign_keys=ON` before writing. The dashboard server and all scripts
in `scripts/` do; keep it that way in any new writer.

### S4 — Additive-only migrations

SQLite cannot drop/add CHECK constraints without a table rebuild. This
project therefore treats schema changes as **additive only**: new columns,
new indexes, new tables. Constraint hardening lands at the next table
rebuild, never in-place.

---

## 1. autognosia.db — Experience Index (7 tables)

Overall verdict: **well-designed** — CHECK-constrained enums on
`operations.result`, sensible FKs (`reflections→operations SET NULL`,
`verification_checks→operations CASCADE`), useful indexes. Gaps below.

| Table | Rows | Verdict | Action |
|---|---|---|---|
| `operations` | 5.5k | good | add `(session_id)` index |
| `verification_checks` | 4 | ok | none (had 2 orphan rows, cleaned 2026-08-22) |
| `reflections` | 350 | good | none |
| `routing_events` | 660 | ok | add `(timestamp)` index |
| `skill_events` | 140 | ok | add `(timestamp)` index |
| `prospective_log` | 1 | weak | add `(triggered)` + `(timestamp)` indexes |
| `key_decisions` | 1 | ok | none |

Recommended additions (applied idempotently by `apply_schema_upgrades.py`):

```sql
CREATE INDEX IF NOT EXISTS idx_ops_session        ON operations(session_id);
CREATE INDEX IF NOT EXISTS idx_routing_timestamp  ON routing_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_skill_timestamp    ON skill_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_prospective_triggered ON prospective_log(triggered);
CREATE INDEX IF NOT EXISTS idx_prospective_ts     ON prospective_log(timestamp);
```

Next-rebuild candidates (documented, not applied):
`operations.metadata` is JSON-in-TEXT (acceptable); consider `json_valid(metadata)`
checks and generated columns for hot metadata keys if query pressure appears.

---

## 2. organizer.db — Personal Organizer (7 tables)

Overall verdict: **strong GTD-aligned model** — tasks carry status/priority
CHECKs, project + dependency FKs with `SET NULL`, due-date indexes;
subscriptions/reminders/intentions/waiting_states cover the prospective-memory
surface. Gaps below.

| Table | Verdict | Action |
|---|---|---|
| `tasks` | good | none (mixed timestamp *formats* handled by S1) |
| `projects` | ok | add `(status)` index |
| `reminders` | good | add partial index for the dispatch hot path |
| `intentions` | ok | add `(status, created_at)` index |
| `subscriptions` | good | none |
| `waiting_states` | ok | add `(follow_up_date)` index |
| `important_dates` | ok | none |

```sql
CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects(status);
CREATE INDEX IF NOT EXISTS idx_reminders_due        ON reminders(remind_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_intentions_dormant   ON intentions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_waiting_followup     ON waiting_states(follow_up_date);
```

Design notes kept deliberately simple: `recurring_rule` stays free-text until
a second recurrence consumer exists (premature RRULE parsing is worse than a
string); `intentions.cue` likewise — structured cue DSL arrives when the
matcher needs it.

---

## 3. exchange/research/*.json — Research Request Envelope

No formal contract existed; consumers trusted producers. Formalized as JSON
Schema draft 2020-12 (`schemas/research-request.schema.json`). Summary of the
contract:

- `id` — string, pattern `^[a-z0-9][a-z0-9-]{3,63}$`, unique
- `schema_version` — integer ≥ 1 (new, optional-but-recommended)
- `topic` — non-empty string ≤ 200 chars
- `context` — free text ≤ 1000 chars
- `priority` — enum `low | medium | high`
- `created_at` — RFC 3339 timestamp
- `source` — non-empty string
- `target_profile` — enum-ish string (`researcher` today)
- `deliver_to` — path fragment, default `exchange/research`
- `requirements` — object: `verify_citations` (bool),
  `synthesize` (bool), `target_wiki` (enum `active | oracle`),
  `max_pages` (int 1–20), `focus` (string)
- `metadata` — free-form object

Validation before processing prevents malformed packages from entering the
research pipeline; unknown fields allowed (`additionalProperties: true`) so
producers can extend without version bumps.

---

## Migration safety

All applied changes are `CREATE INDEX IF NOT EXISTS` / `PRAGMA` statements —
no column changes, no data rewrites, fully reversible by dropping the indexes.
Run `python3 scripts/apply_schema_upgrades.py` any time; it is a no-op when
everything is already present.
