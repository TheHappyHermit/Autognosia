#!/usr/bin/env bash
set -euo pipefail

echo "=== Autognosia Acceptance Tests ==="
echo ""

PASS=0
FAIL=0

check() {
    local name="$1"
    local cmd="$2"
    if eval "$cmd" > /dev/null 2>&1; then
        echo "✓ $name"
        ((PASS++))
    else
        echo "✗ $name"
        ((FAIL++))
    fi
}

# Docker services
check "Honcho API" "curl -sf http://127.0.0.1:8000/health"
check "Personal Organizer API" "curl -sf http://127.0.0.1:8001/health"
check "SearXNG" "curl -sf http://127.0.0.1:8080/healthz"
check "GBrain CLI" "command -v gbrain >/dev/null 2>&1 || test -f ${HOME}/.bun/bin/gbrain"

# Database
check "organizer.db exists" "test -f ${HOME}/.autognosia/personal-organizer/data/organizer.db"

# Wiki structure
check "Active Wiki directory" "test -d ${HOME}/.autognosia/active-wiki"
check "Active Wiki projects" "test -d ${HOME}/.autognosia/active-wiki/projects"

# Scripts executable
check "backup_config.py" "test -f scripts/backup_config.py"
check "backup_databases.py" "test -f scripts/backup_databases.py"
check "health_check.py" "test -x scripts/health_check.py"

# Cron scheduler
check "Hermes cron running" "hermes cron list > /dev/null 2>&1"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi
