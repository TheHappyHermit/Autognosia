---
name: sqlalchemy-schema-debug
description: Debugging SQLAlchemy model-to-database schema mismatches in FastAPI/Flask applications
tags: [sqlalchemy, postgres, fastapi, debugging, orm]
triggers: [500 error, UndefinedColumn, sqlalchemy model mismatch, schema does not match]
---

# SQLAlchemy Schema Debugging

When SQLAlchemy ORM queries return 500 errors or empty responses, the model likely doesn't match the actual database schema. This is common when models were written before (or separately from) the DB init.sql.

## Diagnosis Steps

1. **Get actual DB schema:**
```sql
\d table_name       -- psql
```

2. **Get SQLAlchemy model columns:**
```bash
grep -A20 "class ModelName" app/models/file.py
grep "__tablename__" app/models/*.py  # list all tables
```

3. **Compare column by column.** Common mismatches:
   - Column names differ (`first_name`/`last_name` vs `full_name`)
   - Missing columns (model has `household_id`, DB doesn't have `households` table)
   - Extra columns (model expects columns that don't exist)
   - Wrong types (model uses `Enum`, DB uses plain `text`)

## Common Fixes

### Async/Sync Mismatch
The database engine might be sync (`create_engine`) but routes import `AsyncSession`:
```python
# BROKEN: async route with sync engine
from sqlalchemy.ext.asyncio import AsyncSession
async def list_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(query)  # Fails silently, returns empty

# FIXED: sync route matching sync engine
from sqlalchemy.orm import Session
def list_items(db: Session = Depends(get_db)):
    result = db.execute(query)
```

### Query Ordering
SQLAlchemy requires `order_by()` BEFORE `offset()`/`limit()`:
```python
# BROKEN: order_by after offset/limit
query.offset(skip).limit(limit).order_by(Model.name).all()
# Error: "Query.order_by() being called on a Query which already has LIMIT or OFFSET applied"

# FIXED: order_by first
query.order_by(Model.name).offset(skip).limit(limit).all()
```

### Duplicate Table Names
Two models mapping to the same `__tablename__` causes SQLAlchemy mapping conflicts. Ensure each table is mapped by exactly one model class.

## Workflow

1. Hit 500 error on API endpoint
2. Check Docker logs: `docker logs wf-api --tail 50`
3. Find the SQLAlchemy error (UndefinedColumn, ProgrammingError, InvalidRequestError)
4. Run `\d table_name` on the actual DB
5. Compare with the model definition
6. Rewrite model to match actual schema
7. Fix route imports (async→sync if needed)
8. Fix query ordering (order_by before offset/limit)
9. Rebuild Docker container, restart, test
