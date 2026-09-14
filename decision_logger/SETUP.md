# Decision Logger — Setup Guide

This package adds structured decision tracking to the Autognosia brain DB.

## What it includes

| Component | File | Purpose |
|---|---|---|
| DB migration | `migrations/001_create_decisions.sql` | Creates `decisions` table + `decision_current` view in brain DB |
| Hermes plugin | `__init__.py` + `plugin.yaml` | Hooks into `agent:end`, detects decisions, writes to DB |
| Cron synthesis | `synthesis.py` | Periodic scan for contradictions, stance drift, entity promotion candidates |

## Prerequisites

- **brain-postgres** running on `localhost:5433` (or reconfigure via env vars)
- **pg8000** Python package (`pip install pg8000` — already installed in Hermes venv)
- **Hermes Agent** with plugin system enabled (default)

## Step 1: Create the decisions table

The migration is idempotent (`IF NOT EXISTS`).  Run it once:

```bash
# From the repo root:
psql -h localhost -p 5433 -U brain -d brain -f decision_logger/migrations/001_create_decisions.sql
```

Or if you prefer via Docker:

```bash
docker exec brain-postgres psql -U brain -d brain -f /path/to/001_create_decisions.sql
```

Verify:

```bash
psql -h localhost -p 5433 -U brain -d brain -c "\dt decisions"
psql -h localhost -p 5433 -U brain -d brain -c "SELECT * FROM decision_current LIMIT 5;"
```

## Step 2: Install the Hermes plugin

### Option A: copy from the repo

```bash
cp -r /path/to/repo/decision_logger ~/.hermes/plugins/decision_logger
```

### Option B: symlink (so updates from git pull are live)

```bash
ln -sf /path/to/repo/decision_logger $HOME/.hermes/plugins/decision_logger
```

### Option C: clone directly into plugins

```bash
git clone <repo-url> ~/.hermes/plugins/decision_logger
```

Hermes auto-discovers plugins on startup.  No extra config needed.

## Step 3: Configure environment variables (optional)

The plugin and synthesis script default to the brain DB on localhost with
the `brain` / `brain` credentials.  Override via environment variables if
your setup differs:

```bash
export DECISION_DB_HOST=10.1.1.10
export DECISION_DB_PORT=5433
export DECISION_DB_USER=brain
export DECISION_DB_PASS=brain
export DECISION_DB_NAME=brain
```

Add these to `~/.hermes/.env` if you want them persistent for Hermes runs.

Optional tuning:

```bash
# Scan more/fewer chars from the end of each agent response
export DECISION_SCAN_TAIL_CHARS=4000        # default

# Higher = fewer false positives, lower = more sensitive
export DECISION_CONFIDENCE_THRESHOLD=0.60   # default

# Optionally write a markdown page per decision to a directory
export DECISION_WIKI_OUTPUT_DIR=/home/josh434/Documents/Hermes-Vault/decisions
```

### Brain sync integration

Decisions are automatically synced into the brain DB's `pages` + `embeddings` tables by the existing `brain_sync.py` pipeline.  A new virtual source `decisions` reads from the `decisions` table and writes markdown pages that get chunked and embedded via Ollama (same pipeline as wiki pages).  This makes decisions searchable via vector similarity.

The `brain_sync_cron.py` wrapper includes `decisions` in its source list — every 60-minute sync run will pick up new/changed decisions and embed them.

## Step 4: Install the cron synthesis job (optional)

The synthesis job scans the decisions table periodically for contradictions,
stance drift, and entity promotion candidates.  Add it as a Hermes cron job:

```bash
hermes cron create "0 6 * * *" \
  --prompt "Run the decision synthesis job. Import and run decision_synthesis.main() from /path/to/repo/decision_logger/synthesis.py. Write the report to ~/decisions-synth/. Deliver the summary to telegram." \
  --delivery telegram
```

Or run it standalone for testing:

```bash
python3 decision_logger/synthesis.py
```

The report is written to `decisions-synth-YYYYMMDD-HHMMSS.md` in the current
directory (or `$DECISION_SYNTH_OUTPUT` if set).

## Architecture

```
Hermes Agent session
  │
  ├─ agent:end hook fires
  │   └─ decision_logger plugin:
  │       1. Scans response tail for decision-like sentences
  │       2. Scores each candidate (confidence heuristic)
  │       3. If confidence > threshold → write to brain DB decisions table
  │       4. Optionally writes a markdown wiki page
  │
  └─ (optional cron, every 6h)
      └─ synthesis.py:
          1. Fetches all decisions from brain DB
          2. Detects contradictions (multiple active on same topic)
          3. Detects stance drift (active decision doesn't link to predecessor)
          4. Detects entity promotion candidates (3+ decisions on same topic)
          5. Writes a markdown report
```

## Querying decisions

```sql
-- Current binding decision on a topic
SELECT * FROM decision_current WHERE topic = 'gpu-allocation';

-- Full decision tree for a topic (oldest first)
SELECT id, topic, decision_text, status, supersedes_id, created_at
FROM decisions
WHERE topic = 'gpu-allocation'
ORDER BY created_at ASC;

-- All active decisions
SELECT * FROM decision_current;

-- Decisions that were superseded (and what replaced them)
SELECT
  d.id, d.topic, d.decision_text AS old_decision,
  COALESCE(ns.decision_text, '(none)') AS new_decision,
  d.created_at AS decided_at
FROM decisions d
LEFT JOIN decisions ns ON d.superseded_by = ns.id
WHERE d.status = 'superseded'
ORDER BY d.created_at DESC;
```

## How the detection heuristic works

The plugin scans the tail of the agent's response (last 4000 chars by default)
for sentences containing decision trigger words:

- **Strong signals** (weight 0.25 each): "decided", "decision is", "going with",
  "chosen", "settled on", "final"
- **Medium signals** (weight 0.15): "opted for", "conclusion", "recommendation",
  "plan is"
- **Weak signals** (weight 0.05): "going to", "will be", "approach", "strategy"
- **Bonus** (weight 0.10): sentence is 5–40 words (declarative, likely a statement)

A sentence needs confidence >= 0.65 (configurable) to be written.  This keeps
false positives low while catching real decisions.

## Data model

```
decisions
  id              BIGSERIAL PK
  slug            TEXT       — machine-friendly identifier
  topic           TEXT       — grouping key (e.g. "gpu-allocation")
  title           TEXT       — short label
  decision_text   TEXT       — what was decided
  rationale       TEXT       — why (optional)
  status          TEXT       — active | superseded | archived
  supersedes_id   BIGINT     — FK to the decision this replaces (if any)
  superseded_by   BIGINT     — FK to the decision that replaced this (if any)
  created_by      TEXT       — agent profile or "user"
  source_session  TEXT       — session identifier
  metadata        JSONB      — tags, dedup_hash, confidence, etc.
  created_at      TIMESTAMPTZ

decision_current (view)
  — one row per topic: the latest active decision
```

## Privacy note

This package intentionally contains **no secrets, API keys, hostnames, IPs, or
PII** in its source files.  All connection parameters are env-driven with
localhost/brain-brain defaults.  No user data is included in the package.

Before pushing to a public repository, run:

```bash
grep -rEn '(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})' decision_logger/
```

Expected result: no matches.

## Troubleshooting

**Plugin not firing:** check Hermes logs for "decision_logger" entries.
The plugin logs at INFO level when it detects candidates and at ERROR level
when DB writes fail.

**No decisions being captured:** the confidence threshold may be too high for
your agent's writing style.  Lower it: `export DECISION_CONFIDENCE_THRESHOLD=0.5`.

**DB connection errors:** verify the brain DB is reachable and the env vars
(if set) match your setup.  The plugin never crashes the agent loop on DB
errors — it logs and continues.

**Synthesis job finding too many flags:** contradictions require two active
decisions on the same topic — that's a real issue worth reviewing.  Stance
drift flags are lower severity and may be false positives for topics where
the decision evolved naturally.  Review and adjust as needed.
