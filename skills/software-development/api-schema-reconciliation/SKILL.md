---
name: api-schema-reconciliation
description: Systematically test API endpoints to discover schema mismatches between ORM models and actual database tables. Use when code compiles but endpoints return 500s, empty responses, or column-not-found errors.
version: 1.0.0
tags: [debugging, sqlalchemy, postgresql, api-testing, orm, fastapi]
related_skills: [systematic-debugging, test-driven-development]
---

# API Schema Reconciliation

## When to Use

- ORM models were written separately from the database schema (e.g., init.sql creates tables, models.py defines different columns)
- API endpoints return 500 errors with `UndefinedColumn`, `UndefinedTable`, or `ProgrammingError`
- Endpoints return empty body / "Expecting value" errors (silent SQLAlchemy failures)
- You inherited a codebase where models and DB were never in sync

## The Problem

SQLAlchemy models that don't match the actual database schema cause:
- `ProgrammingError: column "X" does not exist` — model has columns the DB doesn't
- Empty responses — async/sync session mismatch causes silent failures
- `InvalidRequestError: Query.order_by() after LIMIT/OFFSET` — query construction order matters
- `UndefinedTable` — model references tables that don't exist in the DB

## Step 1: Map the Actual Database Schema

Run `\d tablename` for every table your models reference:

```bash
# Get all tables
docker exec wf-postgres psql -U $DB_USER -d $DB_NAME -c "\dt"

# Get column details for each table
docker exec wf-postgres psql -U $DB_USER -d $DB_NAME -c "\d clients"
docker exec wf-postgres psql -U $DB_USER -d $DB_NAME -c "\d accounts"
docker exec wf-postgres psql -U $DB_USER -d $DB_NAME -c "\d tasks"
```

**Record the actual column names, types, and constraints.** These are the source of truth — the ORM must match the DB, not the other way around.

## Step 2: Write a Comprehensive Test Script

Create a Python script that tests every endpoint systematically using `requests`.

Key principles:
- Get auth token once, use for all requests
- Test in dependency order (create parent before child)
- Check both status code AND response body
- Clean up test data after
- Print a pass/fail summary table

Run it on the server: `python3 /tmp/test_api.py`

## Step 3: Fix Model-DB Mismatches

For each failing endpoint, check Docker logs:

```bash
docker logs wf-api --tail 50 2>&1 | grep -i "error\|exception"
```

### Wrong column names
```python
# Model has: first_name, last_name
# DB has: full_name
# Fix: Change model to match DB
class Client(Base):
    full_name = Column(Text, nullable=False)  # not first_name/last_name
```

### Async session used with sync engine
```python
# BROKEN: get_db() returns sync Session, but route uses AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession
async def list_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(query)  # FAILS SILENTLY

# FIX: Use sync Session
from sqlalchemy.orm import Session
def list_clients(db: Session = Depends(get_db)):
    result = db.execute(query)
    clients = result.scalars().all()
```

### order_by after offset/limit
```python
# BROKEN: SQLAlchemy raises InvalidRequestError
clients = query.offset(skip).limit(limit).order_by(Client.name).all()

# FIX: order_by FIRST
clients = query.order_by(Client.name).offset(skip).limit(limit).all()
```

### Missing tables
```python
# If table doesn't exist in DB but code references it:
# Option A: Create the table (if needed)
# Option B: Remove/comment out the router import (if feature isn't needed yet)
# Option C: Use try/except around the import in main.py
```

## Step 4: Rebuild and Re-test

After fixing models:

```bash
# Rebuild Docker image
cd /opt/the client platform-ai
docker build -t wf-api:latest ./backend

# Restart
docker restart wf-api
sleep 6

# Re-run seed if needed
docker exec wf-api python3 /app/app/seed.py

# Re-run test script
python3 /tmp/test_api.py
```

## Common SQLAlchemy Pitfalls

| Issue | Symptom | Fix |
|-------|---------|-----|
| Wrong column name | `UndefinedColumn` error | Align model to DB schema |
| Async session with sync engine | Empty response, 500 | Use `Session` not `AsyncSession` |
| order_by after limit | `InvalidRequestError` | Move order_by before offset/limit |
| Missing table | `UndefinedTable` | Create table or disable router |
| Model tablename mismatch | `UndefinedTable` | Fix `__tablename__` to match DB |
| JSON field name `metadata` | Conflict with SQLAlchemy reserved name | Use `metadata_` with Column("metadata", ...) |
| Enum values don't match DB | `InvalidTextRepresentation` | Check DB constraints with `\d tablename` |

## Verification Checklist

- [ ] All tables from `\dt` have matching ORM models
- [ ] All model columns match `\d tablename` output
- [ ] No `AsyncSession` used with sync engine
- [ ] All queries use `order_by()` before `offset()`/`limit()`
- [ ] Test script passes 100%
- [ ] Docker logs show no errors
- [ ] Seed data loads without errors
