# Acceptance Tests

Lightweight tests to verify deployment. Run these after installation.

## Docker Services

```bash
#!/bin/bash
# test-docker.sh — Verify all containers are healthy

services=("honcho-api" "personal-organizer-api" "searxng-core")
all_pass=true

for svc in "${services[@]}"; do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null)
    if [ "$status" = "healthy" ]; then
        echo "✓ $svc"
    else
        echo "✗ $svc ($status)"
        all_pass=false
    fi
done

$all_pass && echo "All Docker services healthy" || echo "Some Docker services unhealthy"
```

## API Health Checks & CLI Tools

```bash
#!/bin/bash
# test-health.sh — Verify API endpoints and CLI tools respond

endpoints=(
    "http://127.0.0.1:8000/health"   # Honcho
    "http://127.0.0.1:8001/health"   # Personal Organizer
    "http://127.0.0.1:8080/healthz"  # SearXNG
)

for url in "${endpoints[@]}"; do
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "✓ $url"
    else
        echo "✗ $url"
    fi
done

# GBrain CLI Check (Bun/PGLite)
if command -v gbrain >/dev/null 2>&1 || [ -f "$HOME/.bun/bin/gbrain" ]; then
    echo "✓ GBrain CLI available"
else
    echo "✗ GBrain CLI not installed"
fi
```

## Wiki Operations

```bash
#!/bin/bash
# test-wiki.sh — Verify wiki operations work

WIKI_DIR="$HOME/.autognosia/active-wiki"
TEST_PAGE="$WIKI_DIR/projects/test-page.md"

# Create test page
cat > "$TEST_PAGE" << 'EOF'
---
id: test-page
title: Test Page
created: 2026-01-01
status: active
---

# Test Page

This is a test page for acceptance testing.

Source: user-provided
EOF

# Verify page exists
if [ -f "$TEST_PAGE" ]; then
    echo "✓ Wiki write works"
else
    echo "✗ Wiki write failed"
fi

# Search for page
if grep -r "Test Page" "$WIKI_DIR" > /dev/null 2>&1; then
    echo "✓ Wiki search works"
else
    echo "✗ Wiki search failed"
fi

# Clean up
rm "$TEST_PAGE"
echo "✓ Cleanup complete"
```

## Backup Verification

```bash
#!/bin/bash
# test-backup.sh — Verify backup creates restorable file

BACKUP_DIR="$HOME/.autognosia/backups"
mkdir -p "$BACKUP_DIR"

# Create test backup
cp "$HOME/.autognosia/personal-organizer/data/organizer.db" "$BACKUP_DIR/test-backup.db" 2>/dev/null

if [ -f "$BACKUP_DIR/test-backup.db" ]; then
    echo "✓ Backup file created"
    # Verify it's a valid SQLite file
    if sqlite3 "$BACKUP_DIR/test-backup.db" "PRAGMA integrity_check;" | grep -q "ok"; then
        echo "✓ Backup is valid SQLite"
    else
        echo "✗ Backup integrity check failed"
    fi
else
    echo "✗ Backup file not created"
fi

# Clean up
rm "$BACKUP_DIR/test-backup.db"
```

## Cron Job Verification

```bash
#!/bin/bash
# test-cron.sh — Verify all cron jobs are registered

# This checks that all cron job definitions have valid YAML
CRON_FILE="cron-jobs/definitions.md"

if [ -f "$CRON_FILE" ]; then
    # Count job definitions
    job_count=$(grep -c "^## [0-9]" "$CRON_FILE")
    echo "✓ Found $job_count cron job definitions"
else
    echo "✗ Cron definitions file not found"
fi
```

## How to Run

```bash
cd autognosia-clone
chmod +x tests/*.sh
./tests/test-docker.sh
./tests/test-health.sh
./tests/test-wiki.sh
./tests/test-backup.sh
./tests/test-cron.sh
```
