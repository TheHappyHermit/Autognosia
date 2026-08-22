---
name: hermes-backup-restore
description: Backup/restore Hermes to private GitHub using gh token auth.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [Hermes, Backup, Restore, GitHub, Disaster Recovery]
    related_skills: [github-workflow, hermes-agent]
---

# Hermes Agent Backup & Restore

Backup all Hermes skills, config, memory, and scripts to a private GitHub repo. Sensitive files (API keys, tokens, OAuth credentials) are excluded and must be re-configured on restore.

## Prerequisites

- `gh` CLI authenticated (`gh auth status`)
- Target repo exists (private recommended)

## Backup

### Steps

```bash
# 1. Clone the backup repo (or create it)
# Using HTTPS with gh token (no SSH key needed):
gh repo create <user>/hermes-backup --private --clone  # first time, auto-clones

# OR if repo already exists:
cd /tmp && git clone https://github.com/<user>/hermes-backup.git
cd /tmp/hermes-backup
git config --local credential.helper '!f() { echo "username=<user>"; echo "password=$(gh auth token)"; }; f'

# Alternative: use SSH if you have keys configured
# git clone git@github.com:<user>/hermes-backup.git /tmp/hermes-backup

# 2. Set up .gitignore (if not already present)
cat > .gitignore << 'EOF'
# Sensitive - NEVER commit
*.secret *.key *.pem
.google_*_secret.json
auth.json
.env
google_token.json
state.db*
*.db-wal
*.db-shm
newsletter_cache.db
channel_directory.json
gateway_state.json
processes.json
gateway.pid

# Cache and generated
audio_cache/ cache/ hermes-agent/ hermes-webui/
webui/ whatsapp/ logs/ pastes/ pairing/
image_cache/ images/ models_dev_cache.json
.hermes_history .update_check
__pycache__/ *.pyc newsletter_venv/

# Large binaries
*.mp3 *.wav *.png *.jpg
EOF

# 3. Copy content (preserving structure, skipping sensitive/cache)
HERMES="$HOME/.hermes"

# Skills - exclude bundled/default skills and managed files
BUNDLED=$(cut -d: -f1 "$HERMES/skills/.bundled_manifest" 2>/dev/null)

rsync -a --exclude='*.pyc' --exclude='__pycache__' "$HERMES/skills/" ./skills/

# Remove bundled skills from backup (fresh Hermes install already has these)
if [ -n "$BUNDLED" ]; then
  for skill in $BUNDLED; do
    # Find and remove only the matching skill directory, not the parent category
    find ./skills -maxdepth 3 -type d -name "$skill" -path "*/skills/*/$skill" -exec rm -rf {} + 2>/dev/null
    find ./skills -maxdepth 2 -type d -name "$skill" -path "*/skills/$skill" -exec rm -rf {} + 2>/dev/null
  done
  # Clean up empty category directories
  find ./skills -type d -empty -delete 2>/dev/null || true
fi

# Also remove bundled-only directories from the backup
rm -rf ./skills/.bundle* ./skills/.hub

# Config (review before overwriting on restore)
mkdir -p config
cp "$HERMES/config.yaml" config/
cp "$HERMES/SOUL.md" config/ 2>/dev/null || true

# Memory system
mkdir -p memory-system
cp "$HERMES/memory_enhancement"/* memory-system/ 2>/dev/null || true
cp "$HERMES/memories"/* memory-system/ 2>/dev/null || true

# Scripts
mkdir -p scripts
cp -r "$HERMES/scripts/"* scripts/ 2>/dev/null || true

# Cron config
mkdir -p cron
cp -r "$HERMES/cron/"* cron/ 2>/dev/null || true

# 4. Commit and push
git add -A
git commit -m "Hermes backup $(date -u +%Y-%m-%d)"
git push
```

## Restore

### Steps

```bash
# 1. Clone the backup (using HTTPS with gh token)
cd /tmp && git clone https://github.com/<user>/hermes-backup.git hermes-restore
cd /tmp/hermes-restore
git config --local credential.helper '!f() { echo "username=<user>"; echo "password=$(gh auth token)"; }; f'

# 2. Restore skills
rsync -a /tmp/hermes-restore/skills/ ${HOME}/.hermes/skills/

# 3. Restore config (REVIEW FIRST - merge don't blindly overwrite)
# Compare: diff /tmp/hermes-restore/config/config.yaml ${HOME}/.hermes/config.yaml
cp /tmp/hermes-restore/config/config.yaml ${HOME}/.hermes/config.yaml

# 4. Restore SOUL.md
cp /tmp/hermes-restore/config/SOUL.md ${HOME}/.hermes/SOUL.md

# 5. Restore memory system
cp /tmp/hermes-restore/memory-system/memories.db ${HOME}/.hermes/memory_enhancement/ 2>/dev/null || true

# 6. Restore scripts
rsync -a /tmp/hermes-restore/scripts/ ${HOME}/.hermes/scripts/ 2>/dev/null || true

# 7. Restart Hermes Agent
```

### Verification

```bash
# Count skills loaded
find ${HOME}/.hermes/skills -name "SKILL.md" | wc -l

# Verify config parses
python3 -c "import yaml; yaml.safe_load(open('$HOME/.hermes/config.yaml'))" && echo "Config OK"

# Check memory
ls ${HOME}/.hermes/memory_enhancement/memories.db 2>/dev/null && echo "Memory DB present"
```

## What to Do After Restore

1. Re-authenticate external services (GitHub via `gh auth login`, Google OAuth, etc.)
2. Re-populate .env with API keys and tokens
3. Verify MCP server connections (n8n, Home Assistant)
4. Test cron jobs (`cronjob list`)
5. Confirm Telegram/Discord/WhatsApp messaging works

## What to Exclude

### Always exclude (secrets/caches)
- .env, auth.json, google_token.json - live credentials
- state.db*, *.db-wal, *.db-shm - session state, may cause conflicts
- Large media: audio_cache, images, models_dev_cache.json
- newsletter_cache.db, gateway files (pid, state, etc.)

### Bundled skills
- Use .bundled_manifest to identify which skills ship with Hermes
- Remove them from backup so you only store custom/user-added skills
- CRITICAL: When removing bundled skills, use `find` to target only the exact skill directory name - do NOT `rm -rf` parent category directories, as custom skills may live alongside bundled ones in the same category (e.g., `skills/mlops/rss-content-waterfall` vs `skills/mlops/training/axolotl`)

## Extended Backup: OpenClaw & Paperclip

### OpenClaw Customizations (`${HOME}/.openclaw/`)
```bash
# Target repo: private GitHub repo
gh repo create <user>/openclaw-customizations --private --clone
cd /tmp/openclaw-customizations

# 19 plugin skills + 8 agent workspaces
rsync -a ${HOME}/.openclaw/skills/ skills/ --exclude='.clawhub' --exclude='.git' --exclude='*.crate' --exclude='clap-*'
rsync -a ${HOME}/.openclaw/agents/ agents/ --exclude='.env' --exclude='qmd/' --exclude='memory/' --exclude='logs/' --exclude='sessions/' --exclude='.git/' --exclude='.cleaned_memory/' --exclude='.openclaw/' --exclude='.mcp.json'
cp ${HOME}/.openclaw/openclaw.json .
rsync -a ${HOME}/.openclaw/credentials/ agents/credentials/
```

### Paperclip Customizations
```bash
# Option A: Custom skills only (if using upstream Paperclip)
gh repo create <user>/paperclip-customizations --private --clone
cd /tmp/paperclip-customizations
mkdir -p skills
rsync -av ${HOME}/paperclip/skills/paperclip-board/ skills/
rsync -av ${HOME}/paperclip/skills/paperclip-converting-plans-to-tasks/ skills/
rsync -av ${HOME}/paperclip/skills/paperclip-create-agent/ skills/
rsync -av ${HOME}/paperclip/skills/para-memory-files/ skills/

# Option B: Full fork with Hermes adapters (current setup)
# The feat/externalize-hermes-adapter branch was merged into master in paperclipai/paperclip
# Push master to your private fork:
gh repo create <user>/paperclip --private --clone
cd /tmp/paperclip
git remote add myfork https://github.com/<user>/paperclip.git
git push myfork master
```

### Credential Helper for Automated Push
```bash
# Use gh auth token for credential helper (no interactive prompts)
# This MUST be set per-repository after cloning; it does not persist globally
git config --local credential.helper '!f() { echo "username=<user>"; echo "password=$(gh auth token)"; }; f'
git push origin main
```

### Docker Volume Analysis for Migration Decisions
When evaluating whether to migrate a Docker stack to a new server, use this pattern to assess data value:

```bash
# 1. List volumes
docker volume ls

# 2. Measure volume sizes
docker run --rm -v <volume_name>:/data alpine du -sh /data

# 3. Inspect database contents
# PostgreSQL
docker exec <container> psql -U <user> -d <db> -c "\dt"
docker exec <container> psql -U <user> -d <db> -c "SELECT COUNT(*) FROM <key_tables>;"

# Qdrant
curl -s http://localhost:6333/collections

# Redis
docker exec <container> redis-cli DBSIZE

# Meilisearch
curl -s http://localhost:7700/indexes  # requires auth header
```

**Decision Framework:**
| Volume Size | Tables/Collections | Data Value | Action |
|-------------|-------------------|------------|--------|
| >100 MB | Many with data | High (production) | Migrate via pg_dump/restore |
| 1-100 MB | Some data | Moderate (dev/test) | Export critical tables only, or rebuild from config |
| <1 MB | Empty/minimal | None | Discard, recreate on new server |

### Permission Issues with Obsidian/Syncthing Directories
Some `.obsidian` and `.stfolder` files may have restrictive permissions (owned by other processes). When cleaning up:
```bash
# Fix permissions first, then remove
chmod -R u+w /path/to/dir 2>/dev/null
rm -rf /path/to/dir
```

## Pitfalls

- Always exclude .env, auth.json, google_token.json - these contain live credentials
- config.yaml may have machine-specific paths; review before overwriting
- state.db is session state - restoring it may cause conflicts with a running agent
- The SQLite memories.db can be copied while the agent is stopped; copying while running risks corruption
- Large media files (audio_cache, images) are excluded to keep repo small
- When pruning bundled skills, NEVER remove entire category directories (e.g., `skills/mlops/`) - custom skills may live in the same category dirs. Use targeted deletion of specific skill subdirectories only.
- OpenClaw agent workspaces have SQLite databases in `qmd/` - exclude these (regenerated on restore)
- Paperclip fork: the Hermes adapter branch (`feat/externalize-hermes-adapter`) is already merged into master in upstream; push master to your fork instead of searching for the branch
- Use `gh auth token` in credential helper for non-interactive CI/scripted pushes
- Permission issues with Obsidian/Syncthing directories: fix with `chmod -R u+w /path` before `rm -rf`
- Docker volume migration: see `references/docker-volume-migration-guide.md` for decision framework and commands