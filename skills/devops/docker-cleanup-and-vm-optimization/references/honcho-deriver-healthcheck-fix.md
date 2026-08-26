# Honcho Deriver Healthcheck Fix

## The Problem

The Honcho Dockerfile has a healthcheck that tests the FastAPI server endpoint:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/openapi.json')" || exit 1
```

But the `deriver` service runs `python -m src.deriver` (background worker), NOT the FastAPI server. The healthcheck fails because there's no HTTP server on port 8000 in the deriver container.

## Solution: Override in docker-compose.yml

```yaml
deriver:
  build: ...
  container_name: honcho_deriver
  # Override the Dockerfile healthcheck
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U <username> -d honcho"]  # Test DB connectivity instead
    interval: 30s
    timeout: 10s
    retries: 3
```

## Alternative: Remove Healthcheck Entirely

```yaml
deriver:
  build: ...
  container_name: honcho_deriver
  healthcheck:
    disable: true
```

## Verification Commands

```bash
# Check deriver logs for success indicators
docker compose logs deriver --tail=30 | grep -E "(Starting deriver queue processor|ReconcilerScheduler started|Vector reconciliation cycle completed)"

# Test DB connectivity from deriver container
docker exec honcho_deriver python3 -c "import socket; s = socket.socket(); s.settimeout(2); print(s.connect_ex(('database', 5432)))"
# Returns 0 = connected

# Check deriver status (will show unhealthy due to healthcheck, but logs show it's working)
docker compose ps deriver
```

---

## Session Update: Complete Working Configuration (August 2026)

This session confirmed the deriver works correctly despite the "unhealthy" status. The complete working stack:

### Running Containers
| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| `honcho_db` | `ankane/pgvector:latest` | ✅ Healthy | 5433→5432 |
| `honcho_server` | `honcho-deriver:latest` | ✅ Healthy | 8000 |
| `honcho_deriver` | `honcho-deriver:latest` | ⚠️ Unhealthy* | 8000 (internal) |

*Deriver healthcheck fails because it expects FastAPI server on port 8000 (runs in separate container). Deriver itself is working — processing messages, running reconciler, connecting to DB.

### Verified Working (Despite "Unhealthy" Status)
- API at `http://localhost:8000/docs` — ✅ Accessible
- Peers: `<username>`, `hermes`, `7791814261` — ✅ Present
- Message ingestion → deriver processing — ✅ Working
- Peer representations — ✅ Retrievable
- DB connectivity from deriver container — ✅ Returns 0

### Root Cause Confirmed
The deriver image contains BOTH the FastAPI server AND the deriver worker — they're the same binary (`honcho-deriver:latest`), just different CMDs:
- **Server**: `fastapi run --host 0.0.0.0 src/main.py`
- **Deriver**: `python -m src.deriver`

The Dockerfile healthcheck is only appropriate for the server container, not the deriver container.

### Fix Applied in This Session
Used `docker run` directly with `--env-file` to bypass docker-compose healthcheck issues:

```bash
# Start server
docker run -d --name honcho_server --network honcho_default -p 8000:8000 --env-file .env honcho-deriver:latest fastapi run --host 0.0.0.0 src/main.py

# Start deriver (no healthcheck override needed with docker run)
docker run -d --name honcho_deriver --network honcho_default --env-file .env --restart unless-stopped honcho-deriver:latest python -m src.deriver
```

Both containers now run and function correctly. The server shows "healthy", the deriver works but would show "unhealthy" if run via docker-compose with the default healthcheck.