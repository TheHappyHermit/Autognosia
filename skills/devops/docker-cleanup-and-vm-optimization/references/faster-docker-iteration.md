# Faster Honcho Iteration: Manual `docker run` vs `docker compose`

## The Problem

`docker compose up -d --build` takes 2+ minutes to build the image each time. For quick config testing, this is too slow.

## Root Cause

The Honcho Dockerfile builds a single image (`honcho-deriver:latest`) that contains both the FastAPI server and the deriver worker. The only difference is the CMD:
- Server: `fastapi run --host 0.0.0.0 src/main.py`
- Deriver: `python -m src.deriver`

## Faster Workflow

### 1. Build ONCE (caches layers)
```bash
docker compose build
# Takes ~2 min, but only needed once after source changes
```

### 2. Start database (must be healthy before migrations)
```bash
docker compose up -d database
# Takes ~10 sec
```

### 3. Run migrations using built image (NOT the db container!)
```bash
docker run --rm --network honcho_default \
  -e DB_CONNECTION_URI='postgresql+psycopg://josh434:J1234osh$@database:5432/honcho' \
  honcho-deriver:latest alembic upgrade head
# Takes ~5 sec
```

### 4. Start server and deriver manually (instant, no rebuild)
```bash
# Server
docker run -d --name honcho_server \
  --network honcho_default \
  -p 8000:8000 \
  --env-file .env \
  honcho-deriver:latest fastapi run --host 0.0.0.0 src/main.py

# Deriver
docker run -d --name honcho_deriver \
  --network honcho_default \
  --env-file .env \
  --restart unless-stopped \
  honcho-deriver:latest python -m src.deriver
# Each takes ~2 sec
```

### Total Time
- **First run (with build)**: ~2 min 30 sec
- **Subsequent config changes**: ~20 sec (no build needed)
- **vs `docker compose up -d --build` every time**: ~2 min 30 sec each

## Key Insight

The built image `honcho-deriver:latest` contains BOTH entrypoints. The Dockerfile CMD is just the default; you can override it at runtime.

## When You Still Need `docker compose`

- Production deployments (orchestration, restart policies, depends_on)
- When Dockerfile/source code changes (need rebuild)
- When you want declarative config management

## Verification

```bash
# Check both are running
docker ps --filter "name=honcho" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test API
curl -s http://localhost:8000/docs | head -1

# Check deriver logs
docker logs honcho_deriver --tail=10
```