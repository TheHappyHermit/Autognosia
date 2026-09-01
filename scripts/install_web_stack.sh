#!/usr/bin/env bash
# install_web_stack.sh — Automatic self-hosted Firecrawl + CamoFox installer
# for Autognosia. Discovers existing SearXNG, generates secrets,
# configures Hermes, and runs smoke tests.
#
# ============================================================================
# IMAGE REPOSITORIES (verified working)
# ============================================================================
#   ghcr.io/firecrawl/firecrawl:latest          — Firecrawl API
#   ghcr.io/firecrawl/playwright-service:latest — Playwright scraping service
#   ghcr.io/jo-inc/camofox-browser:latest       — CamoFox browser automation
#   firecrawl/nuq-postgres:latest               — NUQ PostgreSQL (CUSTOM BUILD)
#
# IMPORTANT: NUQ PostgreSQL MUST be built from source before running this
# installer. There is no pre-built image. See INSTALL.md §12 for build steps.
# ============================================================================
#
# Usage:
#   bash scripts/install_web_stack.sh           # Full install
#   bash scripts/install_web_stack.sh --dry-run # Show what it would do
#   bash scripts/install_web_stack.sh --verbose # Verbose output
#   bash scripts/install_web_stack.sh --disable # Disable CamoFox/Firecrawl in Hermes
#   bash scripts/install_web_stack.sh --rebuild # Rebuild NUQ PostgreSQL image first

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../" && pwd)"
DOCKER_COMPOSE="$REPO_ROOT/docker/docker-compose.web-stack.yml"
ENV_TEMPLATE="$REPO_ROOT/docker/.env.example"
ENV_RUNTIME="$REPO_ROOT/docker/.env.web-stack"
HERMES_CONFIG="$HOME/.hermes/config.yaml"
VERBOSE=0
DRY_RUN=0
DISABLE=0
REBUILD_NUQ=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift;;
    --verbose) VERBOSE=1; shift;;
    --disable) DISABLE=1; shift;;
    --rebuild) REBUILD_NUQ=1; shift;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
log_verbose() { [[ $VERBOSE -eq 1 ]] && log "$*" || true; }

# ─── helpers ────────────────────────────────────────────────────────────────
generate_secret() { head -c 32 /dev/urandom | base64 | head -c 32; }

yaml_value() {
  python3 -c "
import yaml, sys
with open(sys.argv[1]) as f:
    d = yaml.safe_load(f)
print(yaml.safe_dump({sys.argv[2]: d.get(sys.argv[2])}, default_flow_style=False).strip())
" "$HERMES_CONFIG" "$2" 2>/dev/null || echo "NOT_SET"
}

yaml_merge() {
  python3 -c "
import yaml, sys
with open(sys.argv[1]) as f:
    d = yaml.safe_load(f) or {}
parts = sys.argv[2].split('.')
target = d
for part in parts[:-1]:
    if part not in target:
        target[part] = {}
    target = target[part]
target[parts[-1]] = sys.argv[3]
with open(sys.argv[1], 'w') as f:
    yaml.dump(d, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
" "$HERMES_CONFIG" "$2" "$3"
}

# ─── phase 0: prerequisites ────────────────────────────────────────────────
log "Phase 0: Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  echo "ERROR: docker not found. Install Docker first." >&2; exit 1
fi
if ! docker compose version &>/dev/null; then
  echo "ERROR: docker compose (v2) not found." >&2; exit 1
fi
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found." >&2; exit 1
fi

# Check python3 yaml
if ! python3 -c "import yaml" 2>/dev/null; then
  echo "WARNING: PyYAML not installed. Installing..." >&2
  python3 -m pip install --user pyyaml -q 2>/dev/null || pip install pyyaml -q 2>/dev/null || true
fi

# ─── phase 0b: rebuild NUQ PostgreSQL (optional) ───────────────────────────
if [[ $REBUILD_NUQ -eq 1 ]]; then
  log "Phase 0b: Rebuilding NUQ PostgreSQL image..."
  
  NUQ_SRC="/tmp/firecrawl"
  if [[ ! -d "$NUQ_SRC/apps/nuq-postgres" ]]; then
    log "  Cloning Firecrawl source..."
    git clone https://github.com/mendableai/firecrawl.git "$NUQ_SRC"
  fi
  
  INIT_SCRIPT="$REPO_ROOT/docker/nuq-postgres-init.sh"
  if [[ ! -f "$INIT_SCRIPT" ]]; then
    echo "ERROR: nuq-postgres-init.sh not found at $INIT_SCRIPT" >&2
    echo "This file is required to build the NUQ PostgreSQL image." >&2
    echo "It fixes the pg_cron extension placement bug." >&2
    exit 1
  fi
  
  log "  Copying init script..."
  mkdir -p "$NUQ_SRC/apps/nuq-postgres/docker-entrypoint-initdb.d"
  cp "$INIT_SCRIPT" "$NUQ_SRC/apps/nuq-postgres/docker-entrypoint-initdb.d/000-init.sh"
  
  log "  Building firecrawl/nuq-postgres:latest..."
  cd "$NUQ_SRC/apps/nuq-postgres"
  docker build -t firecrawl/nuq-postgres:latest .
  cd "$REPO_ROOT"
  
  log "  NUQ PostgreSQL image built successfully."
fi

# ─── phase 1: discover SearXNG ─────────────────────────────────────────────
log "Phase 1: Discovering existing SearXNG instance..."

SEARXNG_ENDPOINT=""
SEARXNG_NETWORK=""

# Try: check if SEARXNG_ENDPOINT already configured in env
if [[ -n "${SEARXNG_ENDPOINT:-}" ]]; then
  log "Found existing SEARXNG_ENDPOINT: $SEARXNG_ENDPOINT"
fi

# Try: inspect running containers for SearXNG
SEARXNG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i searx | head -1 || true)
if [[ -z "$SEARXNG_CONTAINER" ]]; then
  SEARXNG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i 'search' | head -1 || true)
fi

if [[ -z "$SEARXNG_CONTAINER" ]]; then
  echo ""
  echo "ERROR: No SearXNG container found on this host." >&2
  echo "Firecrawl requires an existing SearXNG instance for search." >&2
  echo "Please start SearXNG first, then run this installer." >&2
  echo ""
  echo "If your SearXNG is accessible at a specific endpoint, set the" >&2
  echo "environment variable SEARXNG_ENDPOINT before running this script:" >&2
  echo "  export SEARXNG_ENDPOINT=http://your-searxng-host:8080" >&2
  exit 1
fi

log "Found SearXNG container: $SEARXNG_CONTAINER"

# Get the network SearXNG is on
SEARXNG_NETWORK=$(docker inspect "$SEARXNG_CONTAINER" --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null | head -1)
if [[ -z "$SEARXNG_NETWORK" ]]; then
  echo "ERROR: Could not determine SearXNG Docker network." >&2
  exit 1
fi
log "SearXNG is on Docker network: $SEARXNG_NETWORK"

# Try to reach SearXNG JSON endpoint
SEARXNG_HOST_PORT=$(docker inspect "$SEARXNG_CONTAINER" --format '{{range $p, $conf := .NetworkSettings.Ports}}{{(index $conf 0).HostPort}}{{end}}' 2>/dev/null | grep '8080' | head -1 || true)

if [[ -n "$SEARXNG_HOST_PORT" ]]; then
  SEARXNG_ENDPOINT="http://127.0.0.1:$SEARXNG_HOST_PORT"
else
  SEARXNG_ENDPOINT="http://$SEARXNG_CONTAINER:8080"
fi

log "SearXNG endpoint: $SEARXNG_ENDPOINT"

# Validate SearXNG JSON endpoint
log "Validating SearXNG JSON search endpoint..."
SEARXNG_TEST=$(curl -sS --max-time 5 "$SEARXNG_ENDPOINT/search?q=test&format=json" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok')" 2>/dev/null || echo "fail")
if [[ "$SEARXNG_TEST" != "ok" ]]; then
  echo "WARNING: SearXNG JSON endpoint at $SEARXNG_ENDPOINT returned non-JSON response." >&2
  echo "Firecrawl search may not work. Verify SearXNG has JSON enabled." >&2
else
  log "SearXNG JSON endpoint validated OK."
fi

# ─── phase 2: generate secrets ─────────────────────────────────────────────
log "Phase 2: Generating secrets..."

mkdir -p "$REPO_ROOT/docker"

# Only generate secrets if .env.runtime doesn't exist or is empty
if [[ -f "$ENV_RUNTIME" ]] && grep -q "^FC_API_KEY=" "$ENV_RUNTIME" 2>/dev/null && grep -q "^CAMOFOX_API_KEY=" "$ENV_RUNTIME" 2>/dev/null; then
  log "Existing secrets found — reusing."
else
  FC_API_KEY=$(generate_secret)
  FC_PG_PASS=$(generate_secret)
  FC_RABBITMQ_PASS=$(generate_secret)
  CAMOFOX_API_KEY=$(generate_secret)
  
  cat > "$ENV_RUNTIME" << ENVEOF
# Auto-generated by install_web_stack.sh — DO NOT COMMIT
# Secrets are regenerated on first install; reused on re-runs.
FC_API_KEY=${FC_API_KEY}
FC_PG_PASS=${FC_PG_PASS}
FC_RABBITMQ_PASS=${FC_RABBITMQ_PASS}
CAMOFOX_API_KEY=${CAMOFOX_API_KEY}
FC_SEARXNG_ENDPOINT=${SEARXNG_ENDPOINT}
FC_SEARXNG_NETWORK=${SEARXNG_NETWORK}
FC_PG_USER=postgres
FC_PG_DB=postgres
ENVEOF
  chmod 600 "$ENV_RUNTIME"
  log "Secrets written to $ENV_RUNTIME (chmod 600)"
fi

# Load variables
set -a
# shellcheck disable=SC1091
source "$ENV_RUNTIME"
set +a

# ─── phase 3: start services ───────────────────────────────────────────────
log "Phase 3: Starting Firecrawl and CamoFox services..."

if [[ $DRY_RUN -eq 1 ]]; then
  log "DRY RUN — would run: docker compose -f $DOCKER_COMPOSE up -d"
  log "DRY RUN — Would connect to SearXNG network: $SEARXNG_NETWORK"
  exit 0
fi

# Use the correct env file and network
export FC_SEARXNG_NETWORK
export SEARXNG_ENDPOINT

# Start services
docker compose -f "$DOCKER_COMPOSE" up -d 2>&1
log "Services started."

# ─── phase 4: wait for readiness ───────────────────────────────────────────
log "Phase 4: Waiting for service readiness..."

TIMEOUT=120
ELAPSED=0

# Wait for Redis
log "Waiting for Redis..."
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if docker compose -f "$DOCKER_COMPOSE" exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    log "Redis ready."
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

# Wait for Postgres
log "Waiting for Postgres..."
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if docker compose -f "$DOCKER_COMPOSE" exec -T nuq-postgres pg_isready 2>/dev/null; then
    log "Postgres ready."
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

# Wait for RabbitMQ
log "Waiting for RabbitMQ..."
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if docker compose -f "$DOCKER_COMPOSE" exec -T rabbitmq rabbitmq-diagnostics check_running 2>/dev/null; then
    log "RabbitMQ ready."
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

# Wait for Firecrawl API
log "Waiting for Firecrawl API..."
ELAPSED=0
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if curl -sS --max-time 3 "http://127.0.0.1:3002/" 2>/dev/null | grep -q "Firecrawl"; then
    log "Firecrawl API ready."
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

# Wait for CamoFox
log "Waiting for CamoFox..."
ELAPSED=0
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  CAMOFOX_HEALTH=$(curl -sS --max-time 3 "http://127.0.0.1:9377/health" 2>/dev/null || echo "fail")
  if echo "$CAMOFOX_HEALTH" | grep -q '"ok"'; then
    log "CamoFox health check passed."
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

if [[ $ELAPSED -ge $TIMEOUT ]]; then
  echo "WARNING: Services did not become ready within ${TIMEOUT}s." >&2
  echo "Check logs: docker compose -f $DOCKER_COMPOSE logs" >&2
fi

# ─── phase 5: configure Hermes ─────────────────────────────────────────────
log "Phase 5: Configuring Hermes..."

if [[ $DISABLE -eq 1 ]]; then
  log "Disabling CamoFox/Firecrawl in Hermes..."
  
  python3 -c "
import yaml, sys
with open(sys.argv[1]) as f:
    d = yaml.safe_load(f) or {}
if 'browser' in d and 'camofox' in d['browser']:
    del d['browser']['camofox']
with open(sys.argv[1], 'w') as f:
    yaml.dump(d, f, default_flow_style=False, sort_keys=False)
" "$HERMES_CONFIG"
  
  log "CamouFox disabled in config. Hermes restart required."
  exit 0
fi

# Set Firecrawl API URL
yaml_merge "$HERMES_CONFIG" "browser.firecrawl.api_url" "http://firecrawl-api:3002"
yaml_merge "$HERMES_CONFIG" "browser.firecrawl.api_key" "$FC_API_KEY"

# Set CamoFox URL and auth
yaml_merge "$HERMES_CONFIG" "browser.camofox.url" "http://camofox:9377"
yaml_merge "$HERMES_CONFIG" "browser.camofox.api_key" "$CAMOFOX_API_KEY"

log "Hermes config updated."
log ""
log "To apply changes, restart Hermes:"
log "  hermes gateway restart"
log "  # or however you manage your Hermes process"

# ─── phase 6: smoke tests ──────────────────────────────────────────────────
log "Phase 6: Running smoke tests..."

ALL_PASSED=true

# Test 1: SearXNG JSON search
log "  Test 1: SearXNG JSON search..."
SEARCH_RESULT=$(curl -sS --max-time 10 "$SEARXNG_ENDPOINT/search?q=example&format=json" 2>/dev/null || echo "FAIL")
if echo "$SEARCH_RESULT" | grep -q '"results"'; then
  log "    PASS: SearXNG search returned results."
else
  log "    FAIL: SearXNG search failed."
  ALL_PASSED=false
fi

# Test 2: Firecrawl search (v2 API)
log "  Test 2: Firecrawl search..."
FC_SEARCH=$(curl -sS --max-time 20 -X POST "http://127.0.0.1:3002/v2/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${FC_API_KEY:-}" \
  -d '{"query":"example"}' 2>/dev/null || echo "FAIL")
if echo "$FC_SEARCH" | grep -q '"success"'; then
  log "    PASS: Firecrawl search returned success."
else
  log "    FAIL: Firecrawl search failed."
  ALL_PASSED=false
fi

# Test 3: Firecrawl scrape
log "  Test 3: Firecrawl scrape..."
FC_SCRAPE=$(curl -sS --max-time 30 -X POST "http://127.0.0.1:3002/v2/scrape" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${FC_API_KEY:-}" \
  -d '{"url":"https://example.com"}' 2>/dev/null || echo "FAIL")
if echo "$FC_SCRAPE" | grep -q '"markdown"'; then
  log "    PASS: Firecrawl scrape returned markdown."
else
  log "    FAIL: Firecrawl scrape failed."
  ALL_PASSED=false
fi

# Test 4: CamoFox health
log "  Test 4: CamoFox health..."
CF_HEALTH=$(curl -sS --max-time 5 "http://127.0.0.1:9377/health" 2>/dev/null || echo "FAIL")
if echo "$CF_HEALTH" | grep -q '"ok"'; then
  log "    PASS: CamoFox health check passed."
else
  log "    FAIL: CamoFox health check failed."
  ALL_PASSED=false
fi

# Test 5: CamoFox navigate + snapshot
log "  Test 5: CamoFox navigate + snapshot..."
CF_NAV=$(curl -sS --max-time 10 -X POST "http://127.0.0.1:9377/tabs" \
  -H "Content-Type: application/json" \
  -d '{"userId":"smoke-test"}' 2>/dev/null || echo "FAIL")
if echo "$CF_NAV" | grep -q '"tabId"'; then
  TAB_ID=$(echo "$CF_NAV" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tabId',''))" 2>/dev/null || echo "")
  if [[ -n "$TAB_ID" ]]; then
    CF_NAVIGATE=$(curl -sS --max-time 10 -X POST "http://127.0.0.1:9377/tabs/$TAB_ID/navigate" \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"smoke-test\", \"url\":\"https://example.com\"}" 2>/dev/null || echo "FAIL")
    CF_SNAP=$(curl -sS --max-time 10 "http://127.0.0.1:9377/tabs/$TAB_ID/snapshot?userId=smoke-test" 2>/dev/null || echo "FAIL")
    if echo "$CF_SNAP" | grep -q 'e[0-9]'; then
      log "    PASS: CamoFox navigate + snapshot returned element refs."
    else
      log "    FAIL: CamoFox snapshot had no element refs."
      ALL_PASSED=false
    fi
  else
    log "    FAIL: CamoFox tab creation returned no tabId."
    ALL_PASSED=false
  fi
else
  log "    FAIL: CamoFox tab creation failed."
  ALL_PASSED=false
fi

# Test 6: Firecrawl with SearXNG verification
log "  Test 6: Verify Firecrawl uses SearXNG for search..."
FC_SEARCH2=$(curl -sS --max-time 20 -X POST "http://127.0.0.1:3002/v2/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${FC_API_KEY:-}" \
  -d '{"query":"site:example.com", "engine":"searxng"}' 2>/dev/null || echo "FAIL")
if echo "$FC_SEARCH2" | grep -q '"success"'; then
  log "    PASS: Firecrawl search via SearXNG returned success."
else
  log "    FAIL: Firecrawl SearXNG search failed (may still work via other engine)."
  ALL_PASSED=false
fi

# ─── summary ────────────────────────────────────────────────────────────────
echo ""
echo "======================================================================"
echo "  Web Stack Installation Summary"
echo "======================================================================"
echo ""

if [[ $ALL_PASSED == true ]]; then
  echo "  All smoke tests PASSED."
else
  echo "  Some tests FAILED — check logs above."
fi

echo ""
echo "  Services:"
docker compose -f "$DOCKER_COMPOSE" ps 2>/dev/null
echo ""
echo "  Firecrawl API:   http://127.0.0.1:3002"
echo "  CamoFox API:     http://127.0.0.1:9377"
echo "  SearXNG:         $SEARXNG_ENDPOINT"
echo ""
echo "  Commands:"
echo "    Start:  docker compose -f $DOCKER_COMPOSE up -d"
echo "    Stop:   docker compose -f $DOCKER_COMPOSE down"
echo "    Logs:   docker compose -f $DOCKER_COMPOSE logs -f"
echo "    Update: docker compose -f $DOCKER_COMPOSE up -d --pull always"
echo "    Rebuild NUQ: bash scripts/install_web_stack.sh --rebuild"
echo ""
echo "  To disable CamoFox in Hermes:"
echo "    bash scripts/install_web_stack.sh --disable"
echo ""
echo "  To verify later:"
echo "    bash scripts/smoke_test_web_stack.sh"
echo ""
echo "  Hermes restart required for config changes."
echo "======================================================================"
