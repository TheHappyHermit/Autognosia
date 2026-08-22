# OpenClaw & Paperclip Backup Patterns

Extended backup procedures for the OpenClaw agent ecosystem and Paperclip control plane.

## OpenClaw Customizations (`${HOME}/.openclaw/`)

### What to Backup
- **19 plugin skills** in `${HOME}/.openclaw/skills/`
- **8 agent workspaces** in `${HOME}/.openclaw/agents/` (each with AGENTS.md, SOUL.md, TOOLS.md, HEARTBEAT.md)
- **Main config** `${HOME}/.openclaw/openclaw.json`
- **Credentials** `${HOME}/.openclaw/credentials/` (Telegram allowlist/pairing)

### What to Exclude
- `.env` files (secrets)
- `qmd/` SQLite databases (regenerated)
- `memory/`, `logs/`, `sessions/`, `.cleaned_memory/`, `cache/`, `state/`
- `.git/` directories inside agent workspaces
- `.mcp.json` files
- `.openclaw/` symlinks

### Backup Script
```bash
#!/bin/bash
set -euo pipefail

REPO_DIR="/tmp/openclaw-customizations"
mkdir -p "$REPO_DIR"
cd "$REPO_DIR"

# Initialize if needed
if [ ! -d .git ]; then
    git init
    git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
    git remote add origin https://github.com/openclaw434/openclaw-customizations.git
fi

# Skills (19 plugin skills)
rsync -a ${HOME}/.openclaw/skills/ skills/ \
    --exclude='.clawhub' \
    --exclude='.git' \
    --exclude='*.crate' \
    --exclude='clap-*' \
    --exclude='probe_a'

# Agent workspaces (8 agents)
mkdir -p agents
rsync -a ${HOME}/.openclaw/agents/ agents/ \
    --exclude='.env' \
    --exclude='qmd/' \
    --exclude='memory/' \
    --exclude='logs/' \
    --exclude='sessions/' \
    --exclude='.git/' \
    --exclude='.cleaned_memory/' \
    --exclude='.openclaw/' \
    --exclude='.mcp.json'

# Main config
cp ${HOME}/.openclaw/openclaw.json .

# Credentials
mkdir -p agents/credentials
rsync -a ${HOME}/.openclaw/credentials/ agents/credentials/

# Commit & push
git add -A
git commit -m "OpenClaw backup $(date -u +%Y-%m-%d)"
git push origin main
```

## Paperclip Customizations

### Option A: Custom Skills Only
For users running upstream Paperclip with local skill extensions.

```bash
#!/bin/bash
set -euo pipefail

REPO_DIR="/tmp/paperclip-customizations"
mkdir -p "$REPO_DIR/skills"
cd "$REPO_DIR"

if [ ! -d .git ]; then
    git init
    git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
    git remote add origin https://github.com/openclaw434/paperclip-customizations.git
fi

# 4 custom skills
rsync -av ${HOME}/paperclip/skills/paperclip-board/ skills/
rsync -av ${HOME}/paperclip/skills/paperclip-converting-plans-to-tasks/ skills/
rsync -av ${HOME}/paperclip/skills/paperclip-create-agent/ skills/
rsync -av ${HOME}/paperclip/skills/para-memory-files/ skills/

git add -A
git commit -m "Paperclip custom skills backup $(date -u +%Y-%m-%d)"
git push origin main
```

### Option B: Full Private Fork
For users with Hermes adapter patches or other fork-level changes.

The `feat/externalize-hermes-adapter` branch (commit `fd2f82ac5`) was merged into `master` in `paperclipai/paperclip`. Push master to your fork:

```bash
#!/bin/bash
set -euo pipefail

# One-time setup
cd ${HOME}/paperclip
git remote add myfork https://github.com/openclaw434/paperclip.git  # if not already added

# Push master (includes Hermes adapters)
git config --local credential.helper '!f() { echo "username=openclaw434"; echo "password=$(gh auth token)"; }; f'
git push myfork master
```

### Paperclip Fork Details
- **Upstream:** `paperclipai/paperclip` (public)
- **Fork:** `openclaw434/paperclip` (private)
- **Key commit:** `fd2f82ac5` — "Add built-in Hermes adapters" (merged to master)
- **Adapters included:** `hermes_local`, `hermes_gateway` (built-in, no adapter-manager install needed)
- **Branch strategy:** Master branch contains all Hermes adapter work; no separate feature branch needed

## Credential Helper Reference
See `references/credential-helper-pattern.md` for the `gh auth token` credential helper pattern used in all scripts above.

## Pitfalls

| Scenario | Solution |
|----------|----------|
| SSH URL in remote | `git remote set-url origin https://github.com/user/repo.git` |
| `gh auth token` fails | Run `gh auth login` or `gh auth refresh` |
| SQLite `qmd/` databases | Exclude — regenerated on agent startup |
| Agent `.git` directories | Exclude — workspace history not needed for restore |
| Paperclip `feat/externalize-hermes-adapter` branch missing | It's merged into master; push master instead |
| Large `node_modules` in Paperclip | Exclude via `.gitignore` or `--exclude='node_modules/'` |

## Restore Notes

### OpenClaw
```bash
# 1. Clone backup
git clone https://github.com/openclaw434/openclaw-customizations.git /tmp/restore
cd /tmp/restore

# 2. Restore skills (merges with any bundled skills)
rsync -a skills/ ${HOME}/.openclaw/skills/

# 3. Restore agent workspaces (REVIEW FIRST - merge SOUL.md, AGENTS.md)
# Use diff to compare: diff agents/openclaw-agent-coder/AGENTS.md ${HOME}/.openclaw/agents/openclaw-agent-coder/AGENTS.md
rsync -a agents/ ${HOME}/.openclaw/agents/ --exclude='.git'

# 4. Restore config (REVIEW FIRST)
diff openclaw.json ${HOME}/.openclaw/openclaw.json
cp openclaw.json ${HOME}/.openclaw/openclaw.json

# 5. Restore credentials
cp agents/credentials/* ${HOME}/.openclaw/credentials/

# 6. Restart OpenClaw
```

### Paperclip Skills
```bash
git clone https://github.com/openclaw434/paperclip-customizations.git /tmp/pc-restore
rsync -a /tmp/pc-restore/skills/ ${HOME}/paperclip/skills/
```

### Paperclip Fork
```bash
# Fresh clone of your fork
git clone https://github.com/openclaw434/paperclip.git ${HOME}/paperclip
cd ${HOME}/paperclip
# Verify Hermes adapters present
ls packages/adapters/hermes/ packages/adapters/hermes-gateway/
```