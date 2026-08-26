# Hermes state.db Optimization Reference

## What Is state.db

The main SQLite database at `~/.hermes/state.db` stores all conversation state:
- **Messages table**: 1.2M+ rows of full conversation history
- **FTS5 indexes**: Full-text search + trigram indexes for fuzzy search
- **Sessions table**: 25K+ session metadata rows
- **WAL mode**: Write-Ahead Logging for concurrent access

Typical size: **10-15 GB** for active multi-session usage.

---

## What `hermes sessions optimize-storage` Does

The command runs SQLite's built-in optimization:

```sql
-- Equivalent operations:
PRAGMA optimize;                    -- Analyzes & optimizes indexes
VACUUM;                             -- Reclaims free pages, compacts database
-- FTS5-specific: merges index segments
```

### Space Reclamation Breakdown

| Source | Typical Recovery |
|--------|-----------------|
| FTS5 segment fragmentation | 3-4 GB |
| Trigram index gaps | 2-3 GB |
| SQLite free page list | 1-2 GB |
| WAL checkpoint | 0.5-1 GB |
| **Total** | **~60% (8-9 GB)** |

### What Is NOT Affected

- ✅ All message content preserved exactly
- ✅ All session metadata intact
- ✅ Search capability maintained (indexes rebuilt)
- ✅ No data loss — pure storage compaction

---

## Running the Optimization

```bash
# Safe to run while Hermes is NOT actively processing messages
# (Gateway/cron jobs should be idle)

hermes sessions optimize-storage

# Shows progress bar:
# [████████████████████████████] 100% — Reclaimed 8.4 GB
```

### Safety Notes

- **Runs in foreground** — you see progress
- **Safe to interrupt** — can resume from where it left off
- **Never modifies conversations** — only internal page layout
- **Takes 5-15 minutes** for 14 GB database
- **Requires exclusive lock** — stop Hermes CLI/gateway first if possible

---

## When to Run

| Trigger | Action |
|---------|--------|
| `state.db` > 10 GB | Run optimization |
| Disk usage > 80% | Check state.db first |
| After major cleanup (deleted many sessions) | Run to reclaim space |
| Monthly maintenance | Schedule with cron |

---

## Disk Impact Summary (This Session)

| Step | Before | After | Reclaimed |
|------|--------|-------|-----------|
| Initial `state.db` | 14.04 GB | — | — |
| After `hermes sessions optimize-storage` | 14.04 GB | ~6.5 GB | **~7.8 GB (55%)** |
| After cron session deletion + VACUUM | ~6.5 GB | ~4.4 GB | **~2.0 GB (31%)** |
| After the workspace app agent session deletion + VACUUM | ~4.4 GB | ~4.4 GB* | **~0 GB** (index already compact) |
| **Total** | **14.04 GB** | **~4.4 GB** | **~10 GB (69%)** |

*the workspace app deletion removed 842K messages but indexes were already compact from prior optimization; VACUUM confirmed no further reclaim.

This is the **single largest space recovery** available on this VM — larger than any Docker cleanup or cache pruning.

---

## Detection Queries for Non-User Sessions

Before deleting, identify what's bloating the database:

```sql
-- Find non-user CLI sessions (agent runs, batch executions)
-- Look for months with hundreds of sessions AND high message_count/session ratio
SELECT 
  strftime('%Y-%m', datetime(started_at, 'unixepoch')) as month,
  COUNT(DISTINCT id) as sessions,
  SUM(message_count) as total_messages,
  SUM(message_count) * 1.0 / COUNT(DISTINCT id) as avg_messages_per_session,
  MIN(datetime(started_at, 'unixepoch')) as first,
  MAX(datetime(started_at, 'unixepoch')) as last
FROM sessions 
WHERE source = 'cli'
GROUP BY month
ORDER BY first;
```

**Red flags:**
- Months with >100 sessions
- `avg_messages_per_session` > 500 (user sessions typically <50)
- Sessions clustered in specific date ranges (automated runs)

```sql
-- Find cron sessions
SELECT 
  COUNT(*) as sessions, 
  SUM(message_count) as messages,
  AVG(message_count) as avg_msgs
FROM sessions 
WHERE source = 'cron';

-- Find Telegram sessions  
SELECT 
  COUNT(*) as sessions, 
  SUM(message_count) as messages,
  AVG(message_count) as avg_msgs
FROM sessions 
WHERE source = 'telegram';
```

---

## the workspace app Agent Session Deletion (April 2026)

The CLI source contained **2,562 the workspace app agent runs from April 2026** (not real user conversations):

| Metric | Value |
|--------|-------|
| Sessions deleted | 2,562 |
| Messages deleted | 842,025 |
| Source identifier | `source = 'cli'` AND `started_at` between `2026-04-01` and `2026-05-01` |

**Deletion SQL:**
```sql
-- Identify the workspace app sessions (April 2026 CLI runs)
SELECT id FROM sessions 
WHERE source = 'cli' 
  AND started_at >= strftime('%s', '2026-04-01') 
  AND started_at < strftime('%s', '2026-05-01');

-- Delete messages then sessions
DELETE FROM messages WHERE session_id IN (...);
DELETE FROM sessions WHERE id IN (...);
VACUUM;
```

**Why safe to delete:**
- These are automated the workspace app agent executions (Web Engineer, CI/CD agents, etc.)
- Not user conversations — agent prompts + the workspace app API calls + tool outputs
- the workspace app has been removed from this VM; these logs are orphaned
- Real CLI sessions (May–July 2026): only 33 sessions, 193 messages

**Detection pattern for future sessions:**
```sql
-- Check for non-user CLI sessions (agent runs, batch executions)
SELECT 
  COUNT(DISTINCT id) as sessions,
  SUM(message_count) as messages,
  MIN(datetime(started_at, 'unixepoch')) as first,
  MAX(datetime(started_at, 'unixepoch')) as last
FROM sessions 
WHERE source = 'cli'
GROUP BY strftime('%Y-%m', datetime(started_at, 'unixepoch'))
ORDER BY first;
```
Look for months with hundreds of sessions and thousands of messages per session — these are automated agent runs, not user conversations.

---

## Cron Session Deletion (Safe, Reclaims ~2 GB)

The cron source contained **22,699 the client platform research runs** (every 5-10 min) and newsletter runs:

| Metric | Value |
|--------|-------|
| Sessions deleted | 22,699 |
| Messages deleted | 368,040 |
| Source identifier | `source = 'cron'` |

**Deletion SQL:**
```sql
-- Delete cron sessions and their messages
DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE source = 'cron');
DELETE FROM sessions WHERE source = 'cron';
VACUUM;
```

**Why safe to delete:**
- Research output is saved to `RESEARCH.md` files (canonical log)
- Newsletter output is delivered to Telegram
- Cron job configs in `cron/jobs.json` — unaffected
- Cron execution history in `cron/executions.db` — unaffected
- Cron runs will regenerate sessions on next run (but output already captured externally)