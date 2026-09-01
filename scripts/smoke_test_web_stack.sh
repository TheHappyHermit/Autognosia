#!/usr/bin/env bash
# smoke_test_web_stack.sh — Verify Firecrawl + CamoFox integration
#
# Usage:
#   bash scripts/smoke_test_web_stack.sh
#   bash scripts/smoke_test_web_stack.sh --verbose

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../" && pwd)"
ENV_FILE="$REPO_ROOT/docker/.env.web-stack"
VERBOSE=0
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --verbose) VERBOSE=1; shift;;
    *) shift;;
  esac
done

log() { echo "[$(date '+%H:%M:%S')] $*"; }
log_pass() { echo "  ✓ $*"; TESTS_PASSED=$((TESTS_PASSED + 1)); }
log_fail() { echo "  ✗ $*"; TESTS_FAILED=$((TESTS_FAILED + 1)); }
log_test() { echo "  Testing: $*"; TESTS_RUN=$((TESTS_RUN + 1)); }

# Load runtime env if available
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE" 2>/dev/null || true
fi

SEARXNG_ENDPOINT="${FC_SEARXNG_ENDPOINT:-http://127.0.0.1:8080}"
FC_API_KEY="${FC_API_KEY:-}"
CAMOFOX_API_KEY="${CAMOFOX_API_KEY:-}"

echo "======================================================================"
echo "  Web Stack Smoke Tests"
echo "======================================================================"
echo ""

# ─── Test 1: SearXNG discovery ─────────────────────────────────────────────
log_test "SearXNG JSON endpoint reachable at $SEARXNG_ENDPOINT"
SEARXNG_TEST=$(curl -sS --max-time 10 "$SEARXNG_ENDPOINT/search?q=example&format=json" 2>/dev/null || echo "FAIL")
if echo "$SEARXNG_TEST" | grep -q '"results"'; then
  RESULTS_COUNT=$(echo "$SEARXNG_TEST" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('results',[])))" 2>/dev/null || echo "0")
  log_pass "SearXNG returned $RESULTS_COUNT results."
else
  log_fail "SearXNG JSON endpoint unreachable or returned non-JSON."
fi

# ─── Test 2: Firecrawl API reachable ────────────────────────────────────────
log_test "Firecrawl API at http://127.0.0.1:3002"
FC_API_TEST=$(curl -sS --max-time 5 "http://127.0.0.1:3002/is-production" 2>/dev/null || echo "FAIL")
if echo "$FC_API_TEST" | grep -q '"isProduction"'; then
  log_pass "Firecrawl API is reachable."
else
  log_fail "Firecrawl API not responding at http://127.0.0.1:3002"
  echo "    Check: docker compose -f $REPO_ROOT/docker/docker-compose.web-stack.yml ps"
fi

# ─── Test 3: Firecrawl search via SearXNG ───────────────────────────────────
log_test "Firecrawl search (query: 'test query')"
if [[ -z "$FC_API_KEY" ]]; then
  log_fail "FC_API_KEY not set in $ENV_FILE"
else
  FC_SEARCH=$(curl -sS --max-time 20 -X POST "http://127.0.0.1:3002/v0/search" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $FC_API_KEY" \
    -d '{"query":"test query"}' 2>/dev/null || echo "FAIL")
  
  if echo "$FC_SEARCH" | grep -q '"success"'; then
    FC_SUCCESS=$(echo "$FC_SEARCH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',''))" 2>/dev/null || echo "unknown")
    log_pass "Firecrawl search returned success=$FC_SUCCESS."
  else
    log_fail "Firecrawl search failed: $(echo "$FC_SEARCH" | head -c 200)"
  fi
fi

# ─── Test 4: Firecrawl scrape ───────────────────────────────────────────────
log_test "Firecrawl scrape (URL: https://example.com)"
if [[ -n "$FC_API_KEY" ]]; then
  FC_SCRAPE=$(curl -sS --max-time 30 -X POST "http://127.0.0.1:3002/v0/scrape" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $FC_API_KEY" \
    -d '{"url":"https://example.com"}' 2>/dev/null || echo "FAIL")
  
  if echo "$FC_SCRAPE" | grep -q '"markdown"'; then
    MD_LEN=$(echo "$FC_SCRAPE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',{}).get('content','')))" 2>/dev/null || echo "0")
    log_pass "Firecrawl scrape returned $(echo "$MD_LEN" | head -c 10) chars of markdown."
  else
    log_fail "Firecrawl scrape failed: $(echo "$FC_SCRAPE" | head -c 200)"
  fi
else
  log_fail "FC_API_KEY not set."
fi

# ─── Test 5: Firecrawl with explicit SearXNG engine ─────────────────────────
log_test "Firecrawl search with engine=searxng"
if [[ -n "$FC_API_KEY" ]]; then
  FC_SEARXNG=$(curl -sS --max-time 20 -X POST "http://127.0.0.1:3002/v0/search" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $FC_API_KEY" \
    -d '{"query":"test", "engine":"searxng"}' 2>/dev/null || echo "FAIL")
  
  if echo "$FC_SEARXNG" | grep -q '"success"'; then
    log_pass "Firecrawl search via SearXNG engine returned success."
  else
    log_fail "Firecrawl search via SearXNG engine failed."
  fi
else
  log_fail "FC_API_KEY not set."
fi

# ─── Test 6: CamoFox health check ───────────────────────────────────────────
log_test "CamoFox health at http://127.0.0.1:9377/health"
CF_HEALTH=$(curl -sS --max-time 5 "http://127.0.0.1:9377/health" 2>/dev/null || echo "FAIL")
if echo "$CF_HEALTH" | grep -q '"ok"'; then
  ENGINE=$(echo "$CF_HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('engine',''))" 2>/dev/null || echo "unknown")
  BROWSER=$(echo "$CF_HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('browserConnected',''))" 2>/dev/null || echo "unknown")
  log_pass "CamoFox healthy (engine=$ENGINE, browserConnected=$BROWSER)."
else
  log_fail "CamoFox health check failed."
fi

# ─── Test 7: CamoFox tab creation + navigate ────────────────────────────────
log_test "CamoFox tab creation and navigation"
if [[ -n "$CAMOFOX_API_KEY" ]]; then
  CF_CREATE=$(curl -sS --max-time 10 -X POST "http://127.0.0.1:9377/tabs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAMOFOX_API_KEY" \
    -d '{"userId":"smoke-test"}' 2>/dev/null || echo "FAIL")
  
  if echo "$CF_CREATE" | grep -q '"tabId"'; then
    TAB_ID=$(echo "$CF_CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tabId',''))" 2>/dev/null || echo "")
    if [[ -n "$TAB_ID" ]]; then
      CF_NAV=$(curl -sS --max-time 15 -X POST "http://127.0.0.1:9377/tabs/$TAB_ID/navigate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAMOFOX_API_KEY" \
        -d '{"userId":"smoke-test", "url":"https://example.com"}' 2>/dev/null || echo "FAIL")
      
      if echo "$CF_NAV" | grep -q '"ok"'; then
        log_pass "CamoFox navigated to https://example.com."
      else
        log_fail "CamoFox navigate failed: $(echo "$CF_NAV" | head -c 100)"
      fi
    else
      log_fail "CamoFox tab creation returned no tabId."
    fi
  else
    log_fail "CamoFox tab creation failed."
  fi
else
  log_fail "CAMOFOX_API_KEY not set."
fi

# ─── Test 8: CamoFox snapshot ───────────────────────────────────────────────
log_test "CamoFox accessibility snapshot"
if [[ -n "$CAMOFOX_API_KEY" ]]; then
  # Create a fresh tab for snapshot test
  CF_SNAP_TAB=$(curl -sS --max-time 10 -X POST "http://127.0.0.1:9377/tabs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAMOFOX_API_KEY" \
    -d '{"userId":"smoke-snap"}' 2>/dev/null || echo "FAIL")
  
  if echo "$CF_SNAP_TAB" | grep -q '"tabId"'; then
    SNAP_TAB_ID=$(echo "$CF_SNAP_TAB" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tabId',''))" 2>/dev/null || echo "")
    if [[ -n "$SNAP_TAB_ID" ]]; then
      # Navigate to example.com
      curl -sS --max-time 15 -X POST "http://127.0.0.1:9377/tabs/$SNAP_TAB_ID/navigate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAMOFOX_API_KEY" \
        -d "{\"userId\":\"smoke-snap\", \"url\":\"https://example.com\"}" >/dev/null 2>&1 || true
      sleep 2
      
      CF_SNAP=$(curl -sS --max-time 15 "http://127.0.0.1:9377/tabs/$SNAP_TAB_ID/snapshot?userId=smoke-snap" 2>/dev/null || echo "FAIL")
      
      if echo "$CF_SNAP" | grep -q 'e[0-9]'; then
        ELEM_COUNT=$(echo "$CF_SNAP" | grep -o 'e[0-9]\+' | sort -u | wc -l || echo "0")
        log_pass "CamoFox snapshot returned $ELEM_COUNT element refs."
      else
        log_fail "CamoFox snapshot had no element refs (eN format)."
      fi
    else
      log_fail "No tabId for snapshot test."
    fi
  else
    log_fail "CamoFox tab creation for snapshot failed."
  fi
else
  log_fail "CAMOFOX_API_KEY not set."
fi

# ─── Test 9: CamoFox screenshot ─────────────────────────────────────────────
log_test "CamoFox screenshot capture"
if [[ -n "$CAMOFOX_API_KEY" ]]; then
  # Create tab, navigate
  CF_SCREEN_TAB=$(curl -sS --max-time 10 -X POST "http://127.0.0.1:9377/tabs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAMOFOX_API_KEY" \
    -d '{"userId":"smoke-screen"}' 2>/dev/null || echo "FAIL")
  
  if echo "$CF_SCREEN_TAB" | grep -q '"tabId"'; then
    SCREEN_TAB_ID=$(echo "$CF_SCREEN_TAB" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tabId',''))" 2>/dev/null || echo "")
    if [[ -n "$SCREEN_TAB_ID" ]]; then
      curl -sS --max-time 15 -X POST "http://127.0.0.1:9377/tabs/$SCREEN_TAB_ID/navigate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAMOFOX_API_KEY" \
        -d "{\"userId\":\"smoke-screen\", \"url\":\"https://example.com\"}" >/dev/null 2>&1 || true
      sleep 2
      
      CF_SCREEN=$(curl -sS --max-time 15 "http://127.0.0.1:9377/tabs/$SCREEN_TAB_ID/screenshot?userId=smoke-screen" 2>/dev/null || echo "FAIL")
      
      # Check if response starts with PNG magic bytes or has content
      if echo "$CF_SCREEN" | head -c 4 | grep -q $'\x89PNG'; then
        SCREEN_LEN=$(echo "$CF_SCREEN" | wc -c)
        log_pass "CamoFox screenshot captured (${SCREEN_LEN} bytes)."
      elif echo "$CF_SCREEN" | grep -q '"url"'; then
        log_pass "CamoFox screenshot returned URL (external storage)."
      else
        log_fail "CamoFox screenshot failed or returned unexpected format."
      fi
    else
      log_fail "No tabId for screenshot test."
    fi
  else
    log_fail "CamoFox tab creation for screenshot failed."
  fi
else
  log_fail "CAMOFOX_API_KEY not set."
fi

# ─── Test 10: Docker service health ─────────────────────────────────────────
log_test "Docker service status"
COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.web-stack.yml"
SERVICES_OK=true

for SERVICE in firecrawl-api camofox redis rabbitmq nuq-postgres playwright-service; do
  STATUS=$(docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep "$SERVICE" | awk '{print $NF}' || echo "not_found")
  if echo "$STATUS" | grep -qi 'up\|healthy\|running'; then
    log_pass "$SERVICE: $STATUS"
  else
    log_fail "$SERVICE: $STATUS"
    SERVICES_OK=false
  fi
done

# ─── Summary ────────────────────────────────────────────────────────────────
echo ""
echo "======================================================================"
echo "  Smoke Test Results"
echo "======================================================================"
echo ""
echo "  Tests run:    $TESTS_RUN"
echo "  Passed:       $TESTS_PASSED"
echo "  Failed:       $TESTS_FAILED"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo "  All smoke tests PASSED. ✓"
else
  echo "  $TESTS_FAILED test(s) FAILED. Check logs above."
  echo "  Run: docker compose -f $COMPOSE_FILE logs"
  echo ""
  echo "  Common issues:"
  echo "    1. SearXNG not running: docker ps | grep searxng"
  echo "    2. Firecrawl not ready: docker compose -f $COMPOSE_FILE logs firecrawl-api"
  echo "    3. CamoFox not ready: docker compose -f $COMPOSE_FILE logs camofox"
  echo "    4. API key not set: check $ENV_FILE"
fi

echo ""
echo "======================================================================"
