# Paperclip Service Recovery Guide

When Paperclip won't start, diagnose in this order.

## 1. Check Service Status
```
systemctl status paperclip.service
journalctl -u paperclip.service --no-pager -n 30
```

## 2. Verify Docker Dependencies
Paperclip depends on these containers (all with `restart: unless-stopped`):
- `default-postgres-1` (TimescaleDB/pg16) → host port 5432
- `default-redis-1` → host port 6379
- `default-qdrant-1` → host port 6333
- `default-meilisearch-1` → host port 7700
- `default-api-1` → host port 8002

Check and start if needed:
```
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep default
docker start default-postgres-1 default-redis-1 default-qdrant-1 default-meilisearch-1 default-api-1
```

## 3. Error: ECONNREFUSED 127.0.0.1:5432
PostgreSQL container isn't running. Start it with the other deps (step 2).

## 4. Error: password authentication failed for user "paperclip"
The `paperclip` user's password in PostgreSQL doesn't match what's in the `.env` file.

To find the actual password, use `xxd` to read raw bytes (tools may redact it):
```
xxd ~/paperclip/.env | grep -A1 "DATABASE_URL"
```

Reset the database password to match `.env`:
```
docker exec default-postgres-1 psql -U postgres -c "ALTER USER paperclip PASSWORD '<password_from_env>';"
```

Also grant permissions (tables are owned by `postgres`, not `paperclip`):
```
docker exec default-postgres-1 psql -U postgres -d paperclip -c "
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO paperclip;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO paperclip;
  GRANT USAGE ON SCHEMA public TO paperclip;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO paperclip;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO paperclip;
"
```

## 5. Error: relation "X" already exists (Drizzle migration mismatch)
The database has tables but the `drizzle.__drizzle_migrations` journal is out of sync.

Compare applied vs expected:
```
docker exec -e PGPASSWORD='<pw>' default-postgres-1 psql -U paperclip -d paperclip \
  -c "SELECT count(*) FROM drizzle.__drizzle_migrations;"
```
vs total entries in `~/paperclip/packages/db/src/migrations/meta/_journal.json`.

If the database schema is current but journal is behind, mark all migrations as applied by inserting each journal entry into `__drizzle_migrations`.

## 6. Verify Recovery
```
curl -s http://127.0.0.1:3100/api/health
```
Look for: `"status": "ok"`, `"pendingMigrations": []`

## Key Locations
- Service: `/etc/systemd/system/paperclip.service`
- Working dir: `~/paperclip`
- Env files: `~/paperclip/.env` and `~/.paperclip/instances/default/.env`
- Database: Docker container `default-postgres-1`, database `paperclip`
- Instance config: `~/.paperclip/instances/default/config.json`

## Boot Persistence
After fixing, verify:
- `systemctl is-enabled paperclip.service` → `enabled`
- Docker containers have `RestartPolicy: unless-stopped`
