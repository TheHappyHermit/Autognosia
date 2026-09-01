---
name: docker-app-upgrade
description: Upgrade self-hosted Docker apps across major versions.
---

# Docker Application Upgrade & Maintenance

Upgrade self-hosted Docker applications across major versions, handling config migrations, divergent repos, and compose environment scoping.

## Trigger Conditions

- Upgrading a Docker-based app (deer-flow, OpenWebUI, etc.) across major versions
- Config schema version jumps (e.g., config_version 4 → 34)
- Git repo has divergent/unrelated history from fork or manual clone
- Docker Compose `.env` not found or variables defaulting to blank
- Container volume mounts failing with "empty section between colons"

## Upgrade Workflow

### 1. Pre-Upgrade Backup

```bash
# Backup configs before touching anything
cp config.yaml config.yaml.bak
cp .env .env.bak
cp extensions_config.json extensions_config.json.bak
cp docker-compose.yml docker-compose.yml.bak
```

### 2. Stop Containers Gracefully

```bash
# Try compose first, fall back to direct stop
docker compose -f docker/docker-compose.yaml down 2>/dev/null || \
docker stop container-name-1 container-name-2 ...
```

### 3. Handle Divergent Git History

If `git pull` or `git reset --hard origin/main` fails with "refusing to merge unrelated histories":

```bash
# Local repo was cloned from fork/manual clone with unrelated history
# Backed-up configs survive this since they're outside .git tracking
git branch -D main 2>/dev/null
git checkout --orphan temp-main
git rm -rf .
git commit --allow-empty -m "temp"
git checkout main --force
git reset --hard origin/main
```

**Key insight:** The repo content is ephemeral — configs are backed up externally. A full reset to origin is safer than fighting merge conflicts across 2000+ commits.

### 4. Docker Compose `.env` Scoping

**Critical pitfall:** When `docker-compose.yaml` lives in a subdirectory (e.g., `docker/docker-compose.yaml`), Docker Compose looks for `.env` **relative to the compose file location**, not the project root.

```bash
# Fix: copy .env to compose file's directory
cp .env docker/.env

# Alternative: use --env-file flag explicitly
docker compose -f docker/docker-compose.yaml --env-file .env up -d
```

Watch for warnings like `The "VAR_NAME" variable is not set. Defaulting to a blank string.` — these mean compose can't find the `.env` file.

### 5. Volume Mount Path Configuration

Compose files that reference `${VAR}` for volume mounts need **absolute paths** in `.env`. Relative paths cause "empty section between colons" errors:

```bash
# Required in .env when compose uses these for volume mounts
DEER_FLOW_CONFIG_PATH=/absolute/path/to/config.yaml
DEER_FLOW_EXTENSIONS_CONFIG_PATH=/absolute/path/to/extensions_config.json
DEER_FLOW_HOME=/absolute/path/to/.deer-flow
```

### 6. Config Schema Migration

When config version jumps significantly (e.g., 4 → 34):

1. Read the new `config.example.yaml` or `config.example.json`
2. Note new top-level sections, renamed fields, removed fields
3. Build a new config from scratch using the example as template
4. Migrate user-specific values (API keys, model names, paths) from backup
5. Keep user preferences (model choices, tool configs) but adopt new schema structure

### 7. Build and Verify

```bash
# Build new stack
docker compose -f docker/docker-compose.yaml up -d --build

# Verify health
docker ps --filter "name=app" --format "table {{.Names}}\t{{.Status}}"
docker logs app-gateway 2>&1 | tail -20
```

## Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| "empty section between colons" | Empty env var used in volume mount path | Set absolute paths in `.env` |
| "refusing to merge unrelated histories" | Fork/manual clone diverged from origin | Orphan branch + reset to origin |
| Variables defaulting to blank | `.env` not in compose file's directory | Copy `.env` or use `--env-file` |
| Container restarts immediately | Missing required env var or config field | Check logs, compare to example config |
| Health check fails from host | Service binds to internal interface only | Check from inside container network |

## Post-Upgrade Checklist

- [ ] All containers healthy
- [ ] Frontend responds on expected port
- [ ] Gateway health endpoint returns 200
- [ ] API keys and credentials working
- [ ] Memory/persistence backend initialized
- [ ] First-boot setup completed (if applicable)
- [ ] Backup files cleaned up (`.bak` files removed after verification)
