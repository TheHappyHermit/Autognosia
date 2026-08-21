# INSTALL.md — Autognosia Deployment Guide

**Target OS:** Linux / macOS / Windows (all supported)  
**Host Runtime:** Hermes Agent (`NousResearch/hermes-agent`)  
**Goal:** Deploy all cognitive services, memory tiers, and automation with zero manual friction.

---

## Option A: Hermes Auto-Setup (Recommended)

If you are pointing your Hermes instance at this repository, Hermes can set everything up automatically:

```
Please set up the Autognosia from https://github.com/<your-org>/autognosia
```

Hermes will:
1. Clone the repository
2. Create the `~/.autognosia/` directory structure
3. Initialize databases (`organizer.db`, `autognosia.db`) with sample data
4. Install all repo skills to `~/.hermes/skills/`
5. Configure environment (`.env`, secrets)
6. Start Docker services (SearXNG, Honcho, Personal Organizer) and setup GBrain (PGLite)
7. Automatically start the **Command Deck Dashboard daemon** on `http://127.0.0.1:8088`
8. Run full verification suite
9. Report completion only after all checks pass

When Hermes says "done," the entire cognitive architecture and interactive web dashboard (`http://127.0.0.1:8088`) are live, verified, and immediately ready to use with zero extra commands.

---

## Option B: Manual Setup

Follow these steps in order. Each step handles its own dependencies gracefully.

### 1. Prerequisites

Install these on your system (commands vary by OS):

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y git curl ca-certificates jq ripgrep sqlite3 python3 python3-venv python3-pip build-essential

# macOS (Homebrew)
brew install git curl jq ripgrep sqlite3 python3

# Windows (winget)
winget install Git.Git Python.Python.3 OpenJS.NodeJS
```

Verify:
```bash
python3 --version  # Python 3.8+
git --version      # Git 2.0+
curl --version     # curl 7.0+
```

**Docker** is optional — services run without Docker but with reduced capabilities. If Docker is available:
```bash
# Ubuntu
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
# Re-login or run: newgrp docker

# macOS: Docker Desktop from https://docs.docker.com/desktop/install/mac-install/
# Windows: Docker Desktop from https://docs.docker.com/desktop/install/windows-install/
```

### 2. Clone and Initialize

```bash
git clone https://github.com/<your-org>/autognosia.git
cd autognosia
```

### 3. Run the Auto-Setup Script

This script handles everything: directories, databases, skills, config, Docker, and verification.

```bash
# Full setup (interactive, shows progress)
bash scripts/auto_setup.sh

# Dry-run mode (shows what it would do without executing)
bash scripts/auto_setup.sh --dry-run --verbose

# Verbose mode (shows all commands being run)
bash scripts/auto_setup.sh --verbose
```

The script does:
- **Phase 1:** Checks prerequisites (Python, curl, git)
- **Phase 2:** Creates complete directory structure (`~/.autognosia/`)
- **Phase 3:** Initializes databases with schema + sample data
- **Phase 4:** Installs all repo skills to `~/.hermes/skills/`
- **Phase 5:** Configures environment (copies `.env.example`, generates secrets)
- **Phase 6:** Starts Docker services (if Docker available): SearXNG → Honcho → Personal Organizer
- **Phase 7:** Runs comprehensive verification suite
- **Phase 8:** Reports completion only after all checks pass

### 3b. Manual Steps (if you prefer step-by-step)

If you prefer manual control, follow these steps:

#### Initialize Databases
```bash
python3 scripts/init_db.py --yes              # Personal Organizer (organizer.db)
python3 scripts/init_autognosia_db.py --yes       # Experience Index (autognosia.db)
python3 scripts/init_graphify.py              # Graphify (gracefully skips if CLI not installed)
```

These create `~/.autognosia/` with all subdirectories and SQLite schemas. Sample data is inserted automatically.

#### Install Skills
```bash
python3 scripts/install_skills.py             # Copies Autognosia skills from repo to ~/.hermes/skills/

# Optional: Install official Nous Research Obsidian note-taking skill
hermes skills install obsidian
```

#### Configure Environment
```bash
cd docker/
cp .env.example .env                          # Copy template

# Generate SearXNG secret
openssl rand -hex 32 | tee /dev/stderr | sed -i "s/SEARXNG_SECRET=CHANGE_ME/SEARXNG_SECRET=$(cat)/" .env
# Or without openssl:
python3 -c 'import secrets; print(secrets.token_hex(32))' > /tmp/secret.txt
sed -i "s/SEARXNG_SECRET=CHANGE_ME/SEARXNG_SECRET=$(cat /tmp/secret.txt)/" .env
```

#### Deploy Docker Services
```bash
cd docker/

# Start each service (scripts check if already running)
docker compose -f docker-compose.searxng.yml up -d    # SearXNG
docker compose -f docker-compose.honcho.yml up -d     # Honcho memory
docker compose -f docker-compose.personal-organizer.yml up -d  # Personal Organizer API

# Wait for health checks
sleep 10
curl -sf http://127.0.0.1:8000/health && echo "✓ Honcho"
curl -sf http://127.0.0.1:8001/health && echo "✓ Personal Organizer"
curl -sf http://127.0.0.1:8080/healthz && echo "✓ SearXNG"
```

### 5. Set Up Graphify (Knowledge Graph Index)

Graphify builds relationship indexes over the Active Wiki and Oracle Wiki:

```bash
# Install via uv (requires uv package manager)
uv tool install graphifyy

# Initialize Graphify output directories
mkdir -p ~/.autognosia/graphify-main-out
mkdir -p ~/.autognosia/graphify-oracle-out

# Run extraction (uses local LLM at http://10.1.1.10:8080 by default)
# For Active Wiki (main graph):
graphify extract ~/.autognosia/active-wiki \
  --backend openai \
  --model Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --out ~/.autognosia/graphify-main-out

# For Oracle Wiki (oracle graph):
graphify extract ~/.autognosia/oracle/brain \
  --backend openai \
  --model Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --out ~/.autognosia/graphify-oracle-out
```

Graphify is configured to use the local llama.cpp server — **never** an OpenAI key on OpenRouter. The cron job `Graphify Refresh` runs weekly to rebuild both graphs.

### 6. Set Up Honcho (Autobiographical Memory)

Honcho runs in Docker with PostgreSQL + pgvector and Redis. Setup via Docker Compose:

```bash
cd docker/
cp .env.example .env

# Start Honcho stack
docker compose -f docker-compose.honcho.yml up -d

# Verify health
curl -sf http://127.0.0.1:8000/health && echo "✓ Honcho"
```

Honcho requires a workspace and peers to be created after first run:

```bash
# Create workspace
curl -s -X POST http://127.0.0.1:8000/v3/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "hermes-workspace"}'

# Create peers (user and hermes)
curl -s -X POST http://127.0.0.1:8000/v3/workspaces/hermes-workspace/peers \
  -H "Content-Type: application/json" \
  -d '{"name": "user"}'

curl -s -X POST http://127.0.0.1:8000/v3/workspaces/hermes-workspace/peers \
  -H "Content-Type: application/json" \
  -d '{"name": "hermes"}'
```

### 7. Set Up SessionDB FTS (Full-Text Search)

SessionDB's messages table already has FTS5 indexing. To enable FTS on the sessions table:

```bash
cd ~/.hermes
python3 << 'EOF'
import sqlite3
conn = sqlite3.connect("state.db")

# Create FTS5 virtual table for sessions
conn.execute("""
    CREATE VIRTUAL TABLE sessions_fts USING fts5(
        title, source, end_reason,
        content='sessions',
        content_rowid='rowid'
    )
""")

# Populate with existing sessions
conn.execute("""
    INSERT INTO sessions_fts(rowid, title, source, end_reason)
    SELECT rowid, title, source, end_reason FROM sessions
""")

conn.commit()
conn.close()
print("SessionDB FTS table created and populated.")
EOF
```

### 8. Set Up GBrain

GBrain is the historical retrieval layer. It runs in PGLite mode by default (no Docker needed):

```bash
# Install bun if not already installed
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install and initialize GBrain
bun install -g gbrain
gbrain init --pglite
gbrain doctor --fast  # Verify health

# Install retrieval-reflex (teaches agent when to retrieve from brain)
gbrain integrations install retrieval-reflex --target $(cd "$(dirname "$0")/.." && pwd)
```

For PostgreSQL backend (advanced), see `docker/docker-compose.gbrain-postgres.yml` — requires Docker and the gbrain repo cloned locally.

### 9. Verify Everything Works

Run the verification suite:

```bash
# Comprehensive verification (12 checks)
python3 scripts/verify_stack.py

# Quick health check
python3 scripts/health_check.py

# Test each script works
python3 scripts/check_reminders.py
python3 scripts/generate_views.py
python3 scripts/integrity_check.py
python3 scripts/backup_databases.py
python3 scripts/autognosia_health.py
python3 scripts/gbrain_sync.py
python3 scripts/gbrain_weekly_doctor.py
```

### 10. Launch the Command Deck (Personal Assistant Dashboard)

Start the local web dashboard (Port 8088):

```bash
python3 scripts/run_dashboard.py
```

Open `http://127.0.0.1:8088` in your browser to view your unified schedule, tasks, email triage radar, prospective memory, and second-brain search.

### 11. Register Cron Jobs

See `cron-jobs/setup-instructions.md` for cron job registration commands.

### 12. Set Up Firecrawl + CamoFox (Web Search & Scraping)

Firecrawl provides web search (via your existing SearXNG) and page extraction. CamoFox provides interactive browser automation for complex pages.

```
IMAGE REPOSITORIES (verified working):
  ghcr.io/firecrawl/firecrawl:latest          — Firecrawl API (main)
  ghcr.io/firecrawl/playwright-service:latest — Playwright headless scraping service
  ghcr.io/jo-inc/camofox-browser:latest       — CamoFox stealth browser automation
  firecrawl/nuq-postgres:latest               — NUQ PostgreSQL queue (CUSTOM BUILD)

NOTE: NUQ PostgreSQL MUST be built from source — there is no official pre-built image.
```

#### Step 1: Build NUQ PostgreSQL (one-time)

This custom build fixes a critical bug where `pg_cron` extension placement causes the container to crash:

```bash
# Clone the official Firecrawl repo
cd /tmp
git clone https://github.com/mendableai/firecrawl.git

# Copy the fixed init script from this repo
cp /path/to/autognosia/docker/nuq-postgres-init.sh \
    /tmp/firecrawl/apps/nuq-postgres/docker-entrypoint-initdb.d/000-init.sh

# Build the custom image
cd /tmp/firecrawl/apps/nuq-postgres
docker build -t firecrawl/nuq-postgres:latest .

# Verify it built correctly
docker images | grep nuq-postgres
```

The fix: `nuq-postgres-init.sh` creates `pg_cron` in the `postgres` database (as pg_cron requires), then runs the NUQ schema in the `firecrawl` database. The official setup has these in mismatched databases.

#### Step 2: Run the Installer

```bash
cd /path/to/autognosia
bash scripts/install_web_stack.sh
```

The installer will:
1. Discover your existing SearXNG container and network automatically
2. Generate API keys and database passwords
3. Start all 6 Docker services (firecrawl-api, nuq-postgres, redis, rabbitmq, playwright-service, camofox)
4. Wait for all services to become healthy
5. Configure Hermes with the correct Docker-internal URLs
6. Run a 6-test smoke test suite

Or with verbose output: `bash scripts/install_web_stack.sh --verbose`

#### Step 3: Manual Setup (if you prefer step-by-step)

```bash
# 1. Build NUQ PostgreSQL (see Step 1 above)

# 2. Generate secrets
python3 -c "import secrets; [print(f'{k}={secrets.token_hex(16)}') for k in ['FC_API_KEY','FC_PG_PASS','FC_RABBITMQ_PASS','CAMOFOX_API_KEY']]"

# 3. Write docker/.env.web-stack:
#    FC_API_KEY=<your-key>
#    FC_PG_PASS=<your-key>
#    FC_RABBITMQ_PASS=<your-key>
#    CAMOFOX_API_KEY=<your-key>
#    FC_SEARXNG_ENDPOINT=http://<searxng-container-ip>:8080
#    FC_SEARXNG_NETWORK=<searxng-docker-network-name>

# 4. Start services
docker compose --env-file docker/.env.web-stack -f docker/docker-compose.web-stack.yml up -d

# 5. Wait 60s, then verify
curl http://127.0.0.1:3002/          → {"message":"Firecrawl API"}
curl http://127.0.0.1:9377/health    → {"ok":true,"engine":"camoufox",...}
```

**Endpoints:**
| Service | URL | Auth |
|---------|-----|------|
| Firecrawl API | `http://127.0.0.1:3002` | Bearer token from `.env.web-stack` |
| CamoFox | `http://127.0.0.1:9377` | Bearer token from `.env.web-stack` |
| SearXNG | `http://<container-ip>:8080` | None (internal only) |

**API Examples:**
```bash
# Firecrawl search (via SearXNG)
curl -X POST http://127.0.0.1:3002/v2/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ***" \
  -d '{"query":"your search query"}'

# Firecrawl scrape a page
curl -X POST http://127.0.0.1:3002/v2/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ***" \
  -d '{"url":"https://example.com"}'

# CamoFox health check
curl http://127.0.0.1:9377/health
```

**Host Requirements:** 2 CPUs, 8GB+ RAM. Firecrawl uses up to 10GB RAM and 2 CPUs. The stack is designed to coexist with SearXNG, Honcho, and Personal Organizer on the same host.

**Troubleshooting:** See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) for the complete Firecrawl + CamoFox troubleshooting section covering:
- "pg_cron extension not found" (NUQ PostgreSQL build fix)
- "Port 3002 did not become available" (worker count + RAM)
- SearXNG not discoverable or unreachable
- CamoFox tab creation failures
- Hermes integration configuration
- Performance tuning for 2-CPU hosts

### 13. Weekly Session Export

Completed sessions older than 7 days are automatically exported to structured JSON format each Sunday at 5am. Exported sessions are stored in `~/.hermes/archives/sessions/` with full message history and timestamps. No data is pruned — sessions are preserved indefinitely for long-term archival retrieval.

---

## Documentation Links

- **Detailed configuration:** [`SETUP.md`](SETUP.md) (profiles, cron, wiki, schemas)
- **Architecture & Epistemic Protocol:** [`REFERENCE.md`](REFERENCE.md)
- **Three-Tier Memory Architecture:** [`architecture/THREE-TIER-MEMORY.md`](architecture/THREE-TIER-MEMORY.md)
- **Cron Jobs Reference:** [`cron-jobs/definitions.md`](cron-jobs/definitions.md)
- **Troubleshooting:** [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
- **Required Inputs:** [`REQUIRED_INPUTS.md`](REQUIRED_INPUTS.md)
