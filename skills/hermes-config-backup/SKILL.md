---
name: hermes-config-backup
description: "Backup/restore Hermes config, profiles, skills, cron to Git."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Hermes, Backup, Restore, Configuration, Git, Profiles, Skills, Cron]
    related_skills: [hermes-agent, github-auth, github-repo-management]
---

# Hermes Config Backup & Restore

Back up all user customizations from a Hermes Agent installation to a Git repository, and restore them on a fresh install.

## When to Use

- Migrating Hermes config to a new machine
- Creating a portable backup of profiles, skills, and cron jobs
- Version-controlling Hermes customizations across sessions
- Sharing a curated Hermes setup with team members

## What Gets Backed Up

| Category | Paths | Notes |
|----------|-------|-------|
| Main config | `config.yaml`, `SOUL.md` | Default profile |
| Profiles | `profiles/<name>/config.yaml`, `profile.yaml`, `SOUL.md`, `cron/` | All custom profiles |
| Skills | `skills/` (entire tree) | All skill dirs with references/, scripts/, templates/ |
| Cron | `cron/jobs.json`, `cron/*.py`, `profiles/*/cron/` | Scheduled jobs + scripts |

## What Is EXCLUDED (Intentional)

- **Memory**: `memories/`, `state.db*`, `kanban.db*`, `verification_evidence.db`
- **Sessions**: `sessions/`, `state-snapshots/`, `checkpoints/`
- **Cache**: `models_dev_cache.json`, `provider_models_cache.json`, `.skills_prompt_snapshot.json`, `cache/`, `bootstrap-cache/`
- **Logs**: `logs/`, `gateway-starts.log`, `gateway.log`, `*.log`
- **Auth/Secrets**: `auth.json`, `.env`, `auth.lock`, `*.key`
- **Runtime**: `processes.json`, `gateway_state.json`, `gateway.pid`, `gateway.lock`, `*.lock`
- **Curator metadata**: `.curator_backups/`, `.hub/`, `.usage.json`, `.bundled_manifest`, `.curator_state`
- **App artifacts**: `hermes-setup.exe`, `pairing/`, `sandboxes/`, `pending_messages/`, `rate_limits/`, `projects.db`

## Backup Procedure

```bash
# 1. Create private GitHub repo
gh repo create hermes-config-backup --private --description "Hermes Agent configuration backup"

# 2. Clone locally
cd ~ && git clone https://github.com/<user>/hermes-config-backup.git
cd hermes-config-backup

# 3. Copy customizations (cross-platform paths)
HERMES_DIR="${HERMES_DIR:-$HOME/.hermes}"  # Linux/macOS default
# HERMES_DIR="$LOCALAPPDATA/hermes"         # Windows

mkdir -p profiles/ cron skills desktop-plugins hooks .github

# Main config
cp "$HERMES_DIR/config.yaml" .
cp "$HERMES_DIR/SOUL.md" .

# Profiles (repeat for each custom profile)
for p in analyst researcher writer; do
  mkdir -p "profiles/$p/cron"
  cp "$HERMES_DIR/profiles/$p/config.yaml" "profiles/$p/" 2>/dev/null || true
  cp "$HERMES_DIR/profiles/$p/profile.yaml" "profiles/$p/" 2>/dev/null || true
  cp "$HERMES_DIR/profiles/$p/SOUL.md" "profiles/$p/" 2>/dev/null || true
  cp "$HERMES_DIR/profiles/$p/cron/"* "profiles/$p/cron/" 2>/dev/null || true
done

# Cron (default profile)
cp "$HERMES_DIR/cron/jobs.json" cron/ 2>/dev/null || true
cp "$HERMES_DIR/cron/"*.py cron/ 2>/dev/null || true

# Skills (entire tree, exclude curator metadata)
rsync -a --exclude='.curator_backups' --exclude='.hub' --exclude='.bundled_manifest' --exclude='.curator_state' --exclude='.usage.json' --exclude='.usage.json.lock' "$HERMES_DIR/skills/" skills/

# 4. Commit and push
git add .
git commit -m "Backup Hermes customizations: config, profiles, skills, cron"
git push -u origin main
```

## Restore Procedure

```bash
# 1. Install Hermes Agent (fresh)
# 2. Clone backup repo
git clone https://github.com/<user>/hermes-config-backup.git
cd hermes-config-backup

# 3. Copy to Hermes data directory
HERMES_DIR="${HERMES_DIR:-$HOME/.hermes}"  # Linux/macOS default
# HERMES_DIR="$LOCALAPPDATA/hermes"         # Windows

# Main config
cp config.yaml "$HERMES_DIR/config.yaml"
cp SOUL.md "$HERMES_DIR/SOUL.md"

# Profiles
for p in analyst researcher writer; do
  mkdir -p "$HERMES_DIR/profiles/$p"
  cp -r "profiles/$p/"* "$HERMES_DIR/profiles/$p/" 2>/dev/null || true
done

# Skills (entire tree)
cp -r skills/* "$HERMES_DIR/skills/"

# Cron
cp -r cron/* "$HERMES_DIR/cron/"

# 4. Restart Hermes
```

## Cron Job Integration

This skill is referenced by the **Config Backup** cron job (daily 01:00) in `cron-jobs/definitions.md`. The script `scripts/backup_config.py` uses this skill's logic.

## Pitfalls & Corrections

- **Cron jobs are per-profile AND global** — Both `$HERMES_DIR/cron/` and `$HERMES_DIR/profiles/*/cron/` must be backed up.
- **Cross-platform paths** — Use `$HOME/.hermes` (Linux/macOS) or `$LOCALAPPDATA/hermes` (Windows). The `HERMES_DIR` env var overrides.
- **Profile SOUL.md files are distinct** — They are NOT copies of the default; each defines a unique persona. Back them up individually.
- **Empty dirs won't track in Git** — `desktop-plugins/`, `hooks/`, `.github/` are created as placeholders; they track in Git only if non-empty.
- **Line endings** — Windows Git converts LF→CRLF on commit; this is harmless but noisy. Configure `core.autocrlf=input` if desired.
- **Robocopy on Windows** — Use `robocopy` with `/XD` (exclude dirs) and `/XF` (exclude files) for skills; `rsync`/`cp -r` works on Unix.

## Related Repositories

- **autognosia** — This skill lives in the Autognosia repo for deployment portability
- **hermes-laptop** (`<username>/hermes-laptop`, private) — Full-config backup repo example

## References

- `hermes-agent` skill for core Hermes configuration
- `github-auth` skill for GitHub authentication setup
- `github-repo-management` skill for repo operations