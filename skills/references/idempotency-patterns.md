# Experience Index Idempotency Patterns

Problem: Re-running the Experience Capture script duplicates data because the `INSERT OR IGNORE` constraint on the `target` field fails — JSON content includes timestamps and other variable data that differs between runs.

## The Correct Pattern

```python
# 1. Get already-processed session IDs from the operations table
processed_sessions = {
    row[0] for row in autognosia_conn.execute(
        "SELECT DISTINCT session_id FROM operations"
    ).fetchall()
}

# 2. Filter sessions to only new ones
new_sessions = [s for s in all_sessions if s[0] not in processed_sessions]

# 3. Only process new sessions
for row in new_sessions:
    ...
```

This works because `session_id` is stable and unique per session. The operations table already contains every operation from previous runs for those sessions.

## What Doesn't Work

- **INSERT OR IGNORE with variable target** — The `target` column contains full JSON of the tool call arguments. Timestamps, ordering, and other variable data means the same logical tool call looks like a new row.
- **DELETE then re-capture** — Too destructive. The session_id dedup approach is non-destructive.

## Empty Tool Names

Old Hermes sessions (from the pre-tool_name capture era) have `tool_calls` JSON where the `name` field is empty/null. These produce "unknown" actions that pollute the operations table.

```python
tc_name = tc.get("name", "")
if not tc_name:
    continue  # Skip empty tool names
```

## Schema Drift

If a column exists in the init script schema but not the existing table, the INSERT will fail silently or error. Always verify:

```python
conn.execute('PRAGMA table_info(table_name)')
# Returns columns as (cid, name, type, notnull, default, pk)
```
