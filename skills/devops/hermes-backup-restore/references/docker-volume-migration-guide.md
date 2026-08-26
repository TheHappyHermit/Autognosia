# Docker Volume Migration Guide

Quick reference for evaluating Docker volumes when migrating services between servers.

## Volume Size Check

```bash
# List all volumes
docker volume ls

# Measure each volume size
for vol in $(docker volume ls --format "{{.Name}}"); do
  echo -n "$vol: "
  docker run --rm -v "$vol":/data alpine du -sh /data
done
```

## Database Inspection Patterns

### PostgreSQL / TimescaleDB
```bash
# List databases
docker exec <container> psql -U <user> -c "\l"

# List tables in a database
docker exec <container> psql -U <user> -d <db> -c "\dt"

# Count rows in key tables
docker exec <container> psql -U <user> -d <db> -c "SELECT COUNT(*) FROM agents; SELECT COUNT(*) FROM issues; SELECT COUNT(*) FROM messages;"
```

### Qdrant (Vector DB)
```bash
# List collections
curl -s http://localhost:6333/collections | jq .

# Get collection info
curl -s http://localhost:6333/collections/<name> | jq .
```

### Redis
```bash
# Key count
docker exec <container> redis-cli DBSIZE

# Keyspace info
docker exec <container> redis-cli INFO keyspace
```

### Meilisearch
```bash
# Requires master key
curl -H "Authorization: Bearer <MASTER_KEY>" http://localhost:7700/indexes
```

## Decision Matrix

| Volume Size | Data Present | Value | Migration Effort | Recommendation |
|-------------|-------------|-------|------------------|----------------|
| >100 MB | Production data | High | Full pg_dump/restore | Migrate |
| 10-100 MB | Dev/test data | Medium | Export key tables | Selective |
| <10 MB | Empty/minimal | None | Recreate on new server | Discard |
| Any | Only config (no user data) | Low | Copy config files | Discard volume |

## Common Stacks on This Machine

### Paperclip Stack
- **PostgreSQL (194 MB)**: 69 tables, ~60 issues, 14 agents, 5 projects — dev instance, disposable
- **Qdrant (20 KB)**: Empty (0 collections) — discard
- **Redis (16 KB)**: Empty (0 keys) — discard
- **Meilisearch (144 KB)**: Likely empty — discard

### Honcho Stack
- **PostgreSQL (66 MB)**: 35 messages, 3 peers, 3 sessions, 5 collections, 114 docs — moderate value (memory/preferences learned)
  - Peers: <username>, hermes, telegram (<telegram-chat-id>)
  - Sessions: global-session, <workspace>, agent-main-telegram-dm
  - Contains session summary with user preferences, model config, browser choice, Obsidian path

### Rebate Platform Stack
- **PostgreSQL (4 KB)**: Empty — discard
- **Redis (4 KB)**: Empty — discard

## Migration Commands

### Full PostgreSQL Dump (Honcho)
```bash
# Start database if needed
docker compose -f /path/to/honcho/docker-compose.yml up -d database

# Wait for readiness, then dump
docker compose -f /path/to/honcho/docker-compose.yml exec database pg_dump -U <username> -d honcho > honcho-backup-$(date +%Y%m%d).sql
```

### Restore on New Server
```bash
# Create database
docker exec -i <new_pg_container> psql -U <username> -d postgres -c "CREATE DATABASE honcho;"

# Restore
cat honcho-backup-*.sql | docker exec -i <new_pg_container> psql -U <username> -d honcho
```

### Minimal Export (Key Data Only)
```bash
# Export only peers, sessions, messages (skip embeddings/documents if large)
docker exec <container> pg_dump -U <username> -d honcho -t peers -t sessions -t messages > honcho-core-data.sql
```