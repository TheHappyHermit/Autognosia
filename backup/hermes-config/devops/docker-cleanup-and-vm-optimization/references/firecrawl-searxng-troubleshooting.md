# Firecrawl + SearXNG Integration Troubleshooting

## Symptoms and Fixes

### Symptom 1: Firecrawl Search Hangs/Times Out
```
curl POST http://127.0.0.1:3002/v2/search — hangs for 30+ seconds
```

**Root Causes (in order of likelihood):**

1. **SearXNG is down** — Firecrawl search depends on SearXNG. If SearXNG is stopped, search will hang until timeout.
   - Check: `docker ps -a | grep searxng`
   - Fix: `docker compose -f docker-compose.searxng.yml up -d`

2. **Stale IP in compose file** — The `SEARXNG_ENDPOINT` env var was hardcoded to `http://172.22.0.2:8080` instead of using the DNS-resolvable hostname.
   - Check: `docker inspect <firecrawl-container> --format '{{json .Config.Env}}' | jq .`
   - Fix: Use `${FC_SEARXNG_ENDPOINT:-http://searxng-core:8080}` in compose file, and ensure `.env` has `FC_SEARXNG_ENDPOINT=http://searxng-core:8080`

3. **Duplicate networks isolating services** — `docker_firecrawl-internal` and `autognosia-searxng_searxng-net` coexisting means Firecrawl's internal network may have stale routing.
   - Check: `docker network ls | grep firecrawl`
   - Fix: `docker network rm docker_firecrawl-internal` then `docker compose down && docker compose up -d`

4. **Wrong SearXNG network** — Firecrawl container not connected to SearXNG's network.
   - Check: `docker network inspect autognosia-searxng_searxng-net`
   - Fix: Ensure Firecrawl service has `autognosia-searxng_searxng-net` in its networks list in compose file.

### Symptom 2: SearXNG Crashes with "X-Forwarded-For nor X-Real-IP header is set!"
```
searx.botdetection ERROR: X-Forwarded-For nor X-Real-IP header is set!
[INFO] Shutting down granian
```

**Root Cause:** SearXNG's bot detection requires `X-Forwarded-For` header which is only set when running behind a reverse proxy (nginx, etc.). Running SearXNG directly without a proxy causes it to crash.

**Fix:** Add to `core-config/settings.yml`:
```yaml
server:
  unique_ip: false
  public_instance: false
  trusted_proxies: []
```

### Symptom 3: Firecrawl Scrape Works, Search Doesn't
```
POST /v2/scrape → 200 ✅
POST /v2/search → timeout ❌
```

**Root Cause:** Scrape uses local browser (Playwright), search depends on SearXNG. If SearXNG is down or unreachable, search hangs but scrape still works.

**Diagnosis path:**
1. `curl http://127.0.0.1:3002/` → confirms API is up
2. `curl http://127.0.0.1:8080/search?q=test&format=json` → test SearXNG directly
3. `docker exec firecrawl-container curl -sS http://searxng-core:8080/healthz` → test from inside Firecrawl
4. If SearXNG is unreachable from Firecrawl → network issue (see Pitfall 2)
5. If SearXNG is up but search still hangs → stale IP in env var

### Symptom 4: Container Restart Loop After Network Disconnect
```
ENOTFOUND nuq-postgres — container restarts
```

**Root Cause:** Disconnecting a container from a stale network breaks its DNS resolution. The container can't reach other services.

**Fix:** Always do `docker compose down && docker compose up -d` after removing stale networks, rather than disconnecting individual containers.

## Reference: Key Config Values

| Variable | Purpose | Correct Value |
|----------|---------|---------------|
| `FC_SEARXNG_ENDPOINT` | SearXNG URL (env var) | `http://searxng-core:8080` |
| `SEARXNG_ENDPOINT` | Compose env (from FC_*) | `${FC_SEARXNG_ENDPOINT:-http://searxng-core:8080}` |
| `SEARXNG_ENGINES` | Search engines | `google,bing,stackoverflow,duckduckgo,wikipedia,github,youtube` |
| `SEARXNG_NETWORK` | SearXNG Docker network | `autognosia-searxng_searxng-net` |
| `unique_ip` | Bot detection setting | `false` (when no reverse proxy) |

## Full Recovery Procedure

When the entire Firecrawl search stack is broken:

```bash
# 1. Stop everything
docker compose -f docker/docker-compose.web-stack.yml --env-file docker/.env.web-stack down

# 2. Remove stale networks
docker network rm docker_firecrawl-internal autognosia_firecrawl-internal 2>/dev/null || true

# 3. Ensure SearXNG is running
cd docker && docker compose -f docker-compose.searxng.yml down && docker compose -f docker-compose.searxng.yml up -d
cd ..

# 4. Verify SearXNG is healthy
curl -sS http://127.0.0.1:8080/healthz

# 5. Start web stack
docker compose -f docker/docker-compose.web-stack.yml --env-file docker/.env.web-stack up -d

# 6. Wait and verify
sleep 30
curl -sS http://127.0.0.1:3002/
curl -sS --max-time 15 http://127.0.0.1:3002/v2/search -H 'Content-Type: application/json' -d '{"query":"test"}'
```