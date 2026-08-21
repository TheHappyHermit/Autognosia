# Troubleshooting — Web Stack (Firecrawl + CamoFox)

Common issues and fixes for the Firecrawl + CamoFox web search/scraping stack.

---

## Firecrawl API Issues

### "Port 3002 did not become available within 60000ms"
The main API process died because workers consumed all RAM/CPU.
- **Fix:** Ensure `NUM_WORKERS_PER_QUEUE=4` (or lower) in `.env.web-stack`
- **Fix:** Check RAM: `free -h`. Firecrawl needs 8GB+ RAM on a 2-CPU host.
- **Check:** `docker compose -f docker/docker-compose.web-stack.yml ps firecrawl-api`
- **Check:** `docker compose -f docker/docker-compose.web-stack.yml logs firecrawl-api --tail=50`
- **Fix:** `docker compose -f docker/docker-compose.web-stack.yml down && docker compose -f docker/docker-compose.web-stack.yml up -d`

### "Can't accept connection due to RAM/CPU load"
Workers are spawning faster than the system can handle them.
- **Fix:** Set `NUM_WORKERS_PER_QUEUE=2` in `.env.web-stack`
- **Fix:** On 2-CPU hosts, keep `MAX_CONCURRENT_JOBS=3` or lower
- **Check:** `docker stats --no-stream | grep firecrawl` to see actual usage

### "pg_cron extension not found" / NUQ PostgreSQL crashes
This is the most common setup failure. It occurs because:
- pg_cron must be created in the database named by `cron.database_name` (default: 'postgres')
- The NUQ schema must run in the 'firecrawl' database
- The official Dockerfile doesn't handle this mismatch

- **Fix:** Build the custom NUQ image from `docker/nuq-postgres-init.sh`:
  ```bash
  cd /tmp
  git clone https://github.com/mendableai/firecrawl.git
  cp /path/to/autognosia/docker/nuq-postgres-init.sh \
      /tmp/firecrawl/apps/nuq-postgres/docker-entrypoint-initdb.d/000-init.sh
  cd /tmp/firecrawl/apps/nuq-postgres
  docker build -t firecrawl/nuq-postgres:latest .
  ```
- **Verify:** `docker logs docker-nuq-postgres-1 | grep -E "pg_cron|nuq|extension|CREATE"`
- **Verify:** `docker compose -f docker/docker-compose.web-stack.yml ps nuq-postgres` should show `healthy`

### "Column already exists" errors on database initialization
A dirty volume or migration clash causes `ERROR: column "XXX" of relation "XXX" already exists`.
- **Fix:** Reset the volume (queue data is transient):
  ```bash
  docker compose -f docker/docker-compose.web-stack.yml down -v
  docker compose -f docker/docker-compose.web-stack.yml up -d
  ```

### API returns 502/504 or "Connection reset by peer"
The API is starting but not ready.
- **Wait:** The API takes 30-60s to fully initialize with all workers
- **Fix:** `sleep 30 && curl http://127.0.0.1:3002/`
- **Fix:** If still failing, check logs for OOM kills: `dmesg | tail -20`

### Firecrawl search returns no results
SearXNG integration may not be working.
- **Check:** `docker compose -f docker/docker-compose.web-stack.yml logs firecrawl-api | grep SEARXNG`
- **Fix:** Verify SearXNG endpoint: `curl http://172.22.0.2:8080/search?q=test&format=json`
- **Fix:** Check `.env.web-stack` has `FC_SEARXNG_ENDPOINT=http://<searxng-ip>:8080`
- **Fix:** Ensure the SearXNG Docker network is attached to the Firecrawl container:
  `docker network ls | grep searxng`
  `docker inspect docker-firecrawl-api-1 --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'`
  Both should show `autognosia-searxng_searxng-net`

### SearXNG not discoverable
The installer can't find your SearXNG container.
- **Fix:** Export `SEARXNG_ENDPOINT=http://<ip>:8080` before running the installer
- **Check:** `docker ps --format '{{.Names}}' | grep -i searx`
- **Check:** `docker network ls | grep searx`
- **Fix:** If SearXNG is on a different Docker network, add `autognosia-searxng_searxng-net` to the docker-compose.web-stack.yml networks section

### Firecrawl scrape fails on specific sites
Some sites block automated access or require JavaScript rendering.
- **Try CamoFox instead:** `curl -X POST http://127.0.0.1:9377/tabs -d '{"userId":"test"}'`
- **Fix:** For sites requiring JS, use CamoFox browser automation instead of Firecrawl's Playwright service
- **Check:** `docker compose -f docker/docker-compose.web-stack.yml logs playwright-service --tail=20`

---

## CamoFox Issues

### Health check fails
CamoFox container isn't responding on port 9377.
- **Check:** `docker ps | grep camofox`
- **Fix:** `docker compose -f docker/docker-compose.web-stack.yml restart camofox`
- **Check:** `docker logs autognosia-camofox --tail-30`
- **Fix:** If it keeps crashing, check RAM: `docker stats --no-stream autognosia-camofox`

### "tab creation failed" or "no tabId"
CamoFox isn't accepting connections or API key is wrong.
- **Fix:** Verify `.env.web-stack` has `CAMOFOX_API_KEY=...` set
- **Fix:** Verify the API key in the compose file matches: `docker inspect autognosia-camofox --format '{{json .Config.Env}}' | grep CAMOFOX`
- **Test:** `curl http://127.0.0.1:9377/health` should return `{"ok":true,...}`
- **Fix:** `docker compose -f docker/docker-compose.web-stack.yml down && docker compose -f docker/docker-compose.web-stack.yml up -d`

### Browser automation times out
The browser is taking too long to load pages.
- **Fix:** Increase timeout in your API calls (default is 15s, some pages need 30-60s)
- **Fix:** Check browser resource usage: `docker stats --no-stream autognosia-camofox`
- **Fix:** If browser is OOM-killed, increase `mem_limit: 4G` in the camofox service

---

## Docker/Network Issues

### Containers can't reach each other
Firecrawl API can't connect to Redis, RabbitMQ, or nuq-postgres.
- **Check:** `docker compose -f docker/docker-compose.web-stack.yml ps` — all should be `up` or `healthy`
- **Fix:** `docker compose -f docker/docker-compose.web-stack.yml down && docker compose -f docker/docker-compose.web-stack.yml up -d`
- **Check:** `docker network ls` — `firecrawl-internal` should exist
- **Check:** `docker network inspect firecrawl-internal --format '{{range .Containers}}{{.Name}} {{end}}'` — should list all services

### Port conflicts
Another service is using port 3002 or 9377.
- **Fix:** `ss -tlnp | grep -E '3002|9377'` to see what's using the ports
- **Fix:** Stop the conflicting service or change the port mapping in docker-compose.web-stack.yml

### Disk space full
Docker is consuming too much space.
- **Check:** `df -h`
- **Check:** `docker system df`
- **Fix:** `docker system prune -a --volumes` (careful — deletes all unused images and volumes)
- **Fix:** Clean Firecrawl logs: `docker compose -f docker/docker-compose.web-stack.yml logs --tail=0 firecrawl-api > /dev/null`

---

## Hermes Integration Issues

### Hermes can't reach Firecrawl
The Hermes config has the wrong URL or API key.
- **Fix:** In `~/.hermes/config.yaml`, verify:
  ```yaml
  browser:
    firecrawl:
      api_url: "http://firecrawl-api:3002"  # Docker internal name
      api_key: "<your-FC_API_KEY>"
    camofox:
      url: "http://camofox:9377"            # Docker internal name
      api_key: "<your-CAMOFOX_API_KEY>"
  ```
- **Fix:** Restart Hermes after config changes: `hermes gateway restart`
- **Note:** Hermes uses Docker internal names (firecrawl-api, camofox), not 127.0.0.1

### Hermes reports "web_scrape" or "web_extract" failures
The backend is down or timing out.
- **Fix:** Verify Firecrawl API: `curl http://127.0.0.1:3002/`
- **Fix:** Check Firecrawl logs: `docker compose -f docker/docker-compose.web-stack.yml logs firecrawl-api --tail=50`
- **Fix:** Temporarily disable Firecrawl in Hermes config:
  ```yaml
  web:
    search_backend: "searxng"   # fallback to direct SearXNG
    extract_backend: "native"   # fallback to basic HTML parser
  ```
- **Fix:** Use CamoFox instead: tell Hermes "Do not use web_scrape. Use the browser tool to fetch the page."

### API key authentication failures
The Firecrawl API returns 401 Unauthorized.
- **Fix:** Verify `.env.web-stack` has `FC_API_KEY=<key>`
- **Fix:** Verify the key in docker-compose matches: `grep BULL_AUTH_KEY docker/.env.web-stack`
- **Fix:** Restart: `docker compose -f docker/docker-compose.web-stack.yml restart firecrawl-api`

---

## Performance Issues

### Firecrawl is slow
The workers are under-provisioned for the workload.
- **Fix:** On hosts with 4+ CPUs, increase `NUM_WORKERS_PER_QUEUE=8`
- **Fix:** Increase `MAX_CONCURRENT_JOBS=10` for batch operations
- **Check:** `docker stats --no-stream` to see actual CPU/RAM usage
- **Note:** Firecrawl is RAM-heavy. Each worker can use 400-600MB.

### Memory usage too high
The stack is consuming too much RAM.
- **Check:** `docker stats --no-stream` — firecrawl-api should be the largest consumer
- **Fix:** Reduce worker counts: `NUM_WORKERS_PER_QUEUE=2`, `BROWSER_POOL_SIZE=2`
- **Fix:** Reduce `MAX_CONCURRENT_JOBS=3`
- **Check:** `free -h` — ensure you have 8GB+ available

### CPU throttling
The host is overloaded with 2 CPUs.
- **Check:** `top` or `htop` to see overall system load
- **Fix:** If other services are hungry, reduce Firecrawl resource limits in docker-compose.web-stack.yml
- **Note:** The default limits (2 CPU, 10GB RAM) are appropriate for a dedicated 2-CPU host. On shared hosts, reduce to 1 CPU.

---

## Image Repository Reference

**Verified image repositories and tags:**

| Service | Image | Notes |
|---------|-------|-------|
| Firecrawl API | `ghcr.io/firecrawl/firecrawl:latest` | Official Firecrawl API |
| Playwright Service | `ghcr.io/firecrawl/playwright-service:latest` | Official Playwright headless browser |
| CamoFox | `ghcr.io/jo-inc/camofox-browser:latest` | CamoFox stealth browser automation |
| NUQ PostgreSQL | `firecrawl/nuq-postgres:latest` | **CUSTOM BUILD** — must be built from source |

**NUQ PostgreSQL Build:**
```bash
cd /tmp
git clone https://github.com/mendableai/firecrawl.git
cp /path/to/autognosia/docker/nuq-postgres-init.sh \
    /tmp/firecrawl/apps/nuq-postgres/docker-entrypoint-initdb.d/000-init.sh
cd /tmp/firecrawl/apps/nuq-postgres
docker build -t firecrawl/nuq-postgres:latest .
```

The custom build fixes the pg_cron extension placement bug described above.

---

## Quick Diagnostic Checklist

When something isn't working, run these in order:

```bash
# 1. Are all containers healthy?
docker compose -f docker/docker-compose.web-stack.yml ps

# 2. Can you reach the API?
curl -sS http://127.0.0.1:3002/

# 3. Is SearXNG accessible?
curl -sS http://172.22.0.2:8080/search?q=test&format=json | head -20

# 4. Is CamoFox healthy?
curl -sS http://127.0.0.1:9377/health

# 5. Check for errors
docker compose -f docker/docker-compose.web-stack.yml logs --tail=30

# 6. Check system resources
free -h && docker stats --no-stream

# 7. Run the full smoke test suite
bash scripts/smoke_test_web_stack.sh
```

---

## Getting Help

If the issue isn't here:
1. Run the diagnostic checklist above
2. Check the service container logs: `docker compose -f docker/docker-compose.web-stack.yml logs <service>`
3. Check the docker-compose file for configuration
4. Consult the upstream docs:
   - Firecrawl: https://docs.firecrawl.dev
   - CamoFox: https://github.com/jo-inc/camofox-browser
   - NUQ PostgreSQL: https://github.com/mendableai/firecrawl (build from source)
5. Search Hermes session history: `session_search(query="firecrawl", limit=5)`
