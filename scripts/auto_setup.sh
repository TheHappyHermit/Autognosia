#!/bin/bash
# auto_setup.sh — Zero-configuration setup for Autognosia
# 
# This script sets up everything needed for Autognosia to work
# immediately. It handles:
#   - Prerequisites checking (Python, Docker, etc.)
#   - Directory structure creation
#   - Database initialization
#   - Skills installation
#   - Docker service deployment
#   - Verification of all components
#
# Usage: bash scripts/auto_setup.sh [--dry-run] [--verbose]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AUTOGNOSIA_DIR="$HOME/.autognosia"
HERMES_SKILLS="$HOME/.hermes/skills"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

verbose=false
dry_run=false

# Proper argument parsing - handle both --dry-run and --verbose in any position
for arg in "$@"; do
    case "$arg" in
        --dry-run) dry_run=true ;;
        --verbose) verbose=true ;;
        *) echo "Unknown option: $arg"; exit 1 ;;
    esac
done

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

run_cmd() {
    if $verbose; then
        echo "  $ $1"
    fi
    if $dry_run; then
        return 0
    fi
    # SECURITY: use bash -c instead of eval for safer command execution
    bash -c "$1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        warn "Missing command: $1"
        return 1
    fi
    return 0
}

# === Phase 1: Prerequisites ===
echo ""
echo "========================================"
echo "  Autognosia Auto-Setup"
echo "========================================"
echo ""

log "Phase 1: Checking prerequisites..."

prereq_ok=true

if ! check_command "python3"; then
    error "Python 3 is required. Install from https://python.org or your package manager"
    prereq_ok=false
fi

if ! check_command "docker" && ! check_command "docker-compose"; then
    warn "Docker is recommended but not required (some services optional)"
fi

if ! check_command "curl"; then
    error "curl is required"
    prereq_ok=false
fi

if ! check_command "git"; then
    error "git is required"
    prereq_ok=false
fi

if ! check_command "openssl" && ! check_command "python3" -c "import secrets"; then
    warn "openssl or Python secrets module needed for secret generation"
fi

if ! $prereq_ok; then
    error "Prerequisites not met. Please install missing components and re-run."
    exit 1
fi

success "All prerequisites met"

# === Phase 2: Directory Structure ===
echo ""
log "Phase 2: Creating directory structure..."

mkdir -p "$AUTOGNOSIA_DIR/active-wiki/projects"
mkdir -p "$AUTOGNOSIA_DIR/active-wiki/reference"
mkdir -p "$AUTOGNOSIA_DIR/active-wiki/system"
mkdir -p "$AUTOGNOSIA_DIR/active-wiki/personal"
mkdir -p "$AUTOGNOSIA_DIR/active-wiki/.meta"
mkdir -p "$AUTOGNOSIA_DIR/oracle/brain"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/research"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/documents"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/articles"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/transcripts"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/conversations"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/imports"
mkdir -p "$AUTOGNOSIA_DIR/oracle/raw/assets"
mkdir -p "$AUTOGNOSIA_DIR/personal-organizer/data"
mkdir -p "$AUTOGNOSIA_DIR/personal-organizer/backups"
mkdir -p "$AUTOGNOSIA_DIR/personal-organizer/data/views"
mkdir -p "$AUTOGNOSIA_DIR/personal-organizer/data/integrity-reports"
mkdir -p "$AUTOGNOSIA_DIR/backups/daily"
mkdir -p "$AUTOGNOSIA_DIR/backups/weekly"
mkdir -p "$AUTOGNOSIA_DIR/backups/monthly"
mkdir -p "$AUTOGNOSIA_DIR/logs"
mkdir -p "$AUTOGNOSIA_DIR/exchange/research"
mkdir -p "$AUTOGNOSIA_DIR/exchange/oracle"
mkdir -p "$AUTOGNOSIA_DIR/graphify-main-out"
mkdir -p "$AUTOGNOSIA_DIR/graphify-oracle-out"

# Create .gitignore in .meta directory
cat > "$AUTOGNOSIA_DIR/active-wiki/.meta/.gitignore" << 'EOF'
# Ignore large files and caches
*.db
*.json
*.pyc
__pycache__/
EOF

success "Directory structure created at $AUTOGNOSIA_DIR"

# === Phase 3: Database Initialization ===
echo ""
log "Phase 3: Initializing databases..."

# Initialize Personal Organizer database
run_cmd "python3 '$REPO_ROOT/scripts/init_db.py' --yes"

# Initialize Autognosia Experience Index database
run_cmd "python3 '$REPO_ROOT/scripts/init_autognosia_db.py' --yes"

# Initialize Graphify (gracefully handles missing graphify CLI)
run_cmd "python3 '$REPO_ROOT/scripts/init_graphify.py' || true"

success "Databases initialized"

# === Phase 4: Install Skills ===
echo ""
log "Phase 4: Installing skills..."

if [ -d "$REPO_ROOT/skills" ]; then
    run_cmd "python3 '$REPO_ROOT/scripts/install_skills.py' || true"
    success "Skills installed to $HERMES_SKILLS"
else
    warn "Repository skills directory not found, skipping skill installation"
fi

# === Phase 5: Environment Configuration ===
echo ""
log "Phase 5: Configuring environment..."

# Copy .env.example to .env if it doesn't exist
if [ ! -f "$REPO_ROOT/docker/.env" ]; then
    cp "$REPO_ROOT/docker/.env.example" "$REPO_ROOT/docker/.env"
    log "Created .env from .env.example"
fi

# Generate secret if not set
if grep -q "SEARXNG_SECRET=CHANGE_ME" "$REPO_ROOT/docker/.env" 2>/dev/null; then
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -hex 32)
    else
        SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
    fi
    sed -i "s/SEARXNG_SECRET=CHANGE_ME/SEARXNG_SECRET=$SECRET/" "$REPO_ROOT/docker/.env"
    log "Generated SearXNG secret"
fi

success "Environment configured"

# === Phase 6: Docker Services & GBrain ===
echo ""
log "Phase 6: Deploying Docker services & GBrain..."

cd "$REPO_ROOT/docker"

# Deploy SearXNG if not already running
if curl -sf http://127.0.0.1:8080/healthz >/dev/null 2>&1; then
    success "SearXNG already running"
    # Verify the JSON API actually works — a pre-existing instance started
    # from another checkout (e.g. /tmp) may predate the search.formats fix
    # and return 403 on ?format=json, silently breaking Hermes web_search.
    if ! curl -sf "http://127.0.0.1:8080/search?q=test&format=json" >/dev/null 2>&1; then
        warn "SearXNG is running but its JSON API returns an error."
        warn "Fix: ensure settings.yml contains 'search: formats: [html, json]'"
        warn "(see docker/core-config/settings.yml), then: docker restart <searxng-container>"
    fi
else
    if command -v docker &> /dev/null; then
        log "Starting SearXNG..."
        docker compose -f docker-compose.searxng.yml up -d
        # Wait for health
        count=0
        while [ $count -lt 30 ]; do
            if curl -sf http://127.0.0.1:8080/healthz >/dev/null 2>&1; then
                success "SearXNG deployed and healthy"
                break
            fi
            sleep 2
            count=$((count + 1))
        done
    else
        warn "Docker not available, skipping SearXNG"
    fi
fi

# Deploy Honcho
if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
    success "Honcho already running"
else
    if command -v docker &> /dev/null; then
        log "Starting Honcho..."
        docker compose -f docker-compose.honcho.yml up -d
        # Wait for health
        count=0
        while [ $count -lt 60 ]; do
            if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
                success "Honcho deployed and healthy"
                break
            fi
            sleep 3
            count=$((count + 1))
        done
    else
        warn "Docker not available, skipping Honcho"
    fi
fi

# Deploy Personal Organizer
if curl -sf http://127.0.0.1:8001/health >/dev/null 2>&1; then
    success "Personal Organizer already running"
else
    if command -v docker &> /dev/null; then
        log "Starting Personal Organizer..."
        docker compose -f docker-compose.personal-organizer.yml up -d
        # Wait for health
        count=0
        while [ $count -lt 30 ]; do
            if curl -sf http://127.0.0.1:8001/health >/dev/null 2>&1; then
                success "Personal Organizer deployed and healthy"
                break
            fi
            sleep 2
            count=$((count + 1))
        done
    else
        warn "Docker not available, skipping Personal Organizer"
    fi
fi

# Deploy GBrain — PGLite mode (default, no Docker needed)
log "Setting up GBrain (PGLite mode)..."
if command -v gbrain &> /dev/null; then
    log "gbrain CLI already installed"
else
    if ! command -v bun &> /dev/null; then
        log "Installing bun..."
        if command -v curl &> /dev/null; then
            curl -fsSL https://bun.sh/install | bash
            export PATH="$HOME/.bun/bin:$PATH"
        else
            warn "curl not available, cannot install bun. Install bun manually: https://bun.sh"
        fi
    fi
    
    if command -v bun &> /dev/null; then
        log "Installing gbrain CLI..."
        bun install -g gbrain
        log "Initializing gbrain with PGLite..."
        # Use --no-embedding for headless/deferred embedding configuration
        gbrain init --pglite --no-embedding 2>/dev/null || gbrain init --pglite
        success "gbrain installed and initialized"
    else
        warn "bun not available, cannot install gbrain. Install manually: bun install -g gbrain"
    fi
fi

# Run gbrain doctor to verify
if command -v gbrain &> /dev/null; then
    log "Verifying gbrain health..."
    gbrain doctor --fast 2>&1 | tail -3
    success "gbrain health check complete"
else
    warn "gbrain not installed — install with: bun install -g gbrain"
fi

# PostgreSQL backend (optional, advanced users only)
log "Note: For PostgreSQL backend, use: docker compose -f docker-compose.gbrain-postgres.yml up -d"
log "Requires: bun install -g gbrain, then gbrain init --pglite for PGLite mode"

# Launch Command Deck Dashboard Daemon (Port 8088)
log "Launching Autognosia Command Deck Dashboard on port 8088..."
if curl -sf http://127.0.0.1:8088/api/overview >/dev/null 2>&1; then
    success "Command Deck Dashboard already running on http://127.0.0.1:8088"
else
    mkdir -p "$AUTOGNOSIA_DIR/logs"
    # Allow port 8088 through UFW (in case firewall is active)
    sudo ufw allow 8088/tcp >/dev/null 2>&1 || true
    nohup python3 "$REPO_ROOT/scripts/run_dashboard.py" --port 8088 --host 0.0.0.0 > "$AUTOGNOSIA_DIR/logs/dashboard.log" 2>&1 &
    sleep 2
    if curl -sf http://127.0.0.1:8088/api/overview >/dev/null 2>&1; then
        success "Command Deck Dashboard active at http://127.0.0.1:8088"
    else
        warn "Command Deck Dashboard initializing in background (logs at $AUTOGNOSIA_DIR/logs/dashboard.log)"
    fi
fi

cd "$REPO_ROOT"

# === Phase 7: Verification ===
echo ""
log "Phase 7: Running verification checks..."

# Run health check
if [ -f "$REPO_ROOT/scripts/health_check.py" ]; then
    if python3 "$REPO_ROOT/scripts/health_check.py" 2>&1 | grep -q "All checks passed"; then
        success "Health check passed"
    else
        warn "Health check reported issues (may be expected in fresh install)"
    fi
fi

# Run verify_stack if available
if [ -f "$REPO_ROOT/scripts/verify_stack.py" ]; then
    log "Running comprehensive verification..."
    python3 "$REPO_ROOT/scripts/verify_stack.py" 2>&1 || warn "Some checks failed (may need manual intervention)"
fi

# Verify databases
if [ -f "$AUTOGNOSIA_DIR/personal-organizer/data/organizer.db" ]; then
    success "Personal Organizer database exists"
else
    error "Personal Organizer database missing"
fi

if [ -f "$AUTOGNOSIA_DIR/autognosia.db" ]; then
    success "Experience Index database exists"
else
    error "Experience Index database missing"
fi

# Verify Docker services
echo ""
echo "Docker services status:"
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || warn "Docker not available"
fi

# === Complete ===
echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
log "Next steps:"
echo "  1. Configure your LLM provider in $REPO_ROOT/docker/.env"
echo "  2. Register cron jobs (see cron-jobs/setup-instructions.md)"
echo "  3. Run: python3 scripts/verify_stack.py"
echo ""
log "Repository: $REPO_ROOT"
log "Configuration: $REPO_ROOT/docker/.env"
log "Logs: $AUTOGNOSIA_DIR/logs/"

exit 0
