---
name: hermes-inplace-upgrade
category: devops
description: In-place Hermes upgrade + Desktop install preserving state.
---

# Hermes In-Place Upgrade + Desktop Installation

**Purpose**: Upgrade existing Hermes installation to latest version AND install Hermes Desktop, using the SAME HERMES_HOME so CLI and Desktop share identical state.

**When to Use**:
- User wants to upgrade Hermes Agent to latest version
- User wants to add Hermes Desktop to existing installation
- Must preserve ALL state: memories, sessions, skills, config, credentials, cron jobs, profiles

---

## Prerequisites
- Existing Hermes installation at `~/.hermes/` (or `$HERMES_HOME`)
- `gh` CLI authenticated for GitHub operations
- Python 3.11+, Node.js 22+, npm 11.17.0+
- Ubuntu Desktop (for GUI) or headless with X11 forwarding

---

## Step 1: Inspect Existing Installation

```bash
# Version and paths
hermes --version
echo "HERMES_HOME: ${HERMES_HOME:-/home/josh434/.hermes}"
ls -la ~/.hermes/

# Check profiles
ls -la ~/.hermes/profiles/

# Check git status for local modifications
cd ~/.hermes/hermes-agent && git status && git log --oneline -5

# Check running services
ps aux | grep -E "hermes|gateway" | grep -v grep

# Check cron jobs
hermes cron list

# Check skills
hermes skills list --local

# Check config
cat ~/.hermes/config.yaml
```

---

## Step 2: Complete Backup (Critical - Do Not Skip)

```bash
# Official full backup (recommended)
hermes update --backup
# Creates: ~/.hermes/backups/pre-update-<timestamp>.zip
# Also creates state snapshots in ~/.hermes/state-snapshots/

# Verify backup exists
ls -la ~/.hermes/backups/pre-update-*.zip
```

**Backup contains**: skills, config, profiles, cron, scripts, plugins, SOUL.md, USER.md, memories
**Backup excludes**: state.db, caches, logs, sessions, venvs, node_modules

---

## Step 3: Update Hermes Installation

### Option A: Built-in Update (Recommended)
```bash
hermes update
# Or with backup:
hermes update --backup
```

### Option B: Manual Git + Dependency Update (if built-in fails)
```bash
cd ~/.hermes/hermes-agent

# Update source
git stash          # if local changes exist
git fetch origin main
git reset --hard origin/main
git pull origin main

# Python dependencies
pip install -e .

# Node.js dependencies (use npm 11.17.0+)
npm install -g npm@11.17.0
cd web && npm install --legacy-peer-deps && npm run build
cd ../ui-tui && npm install --legacy-peer-deps && npm run build
cd ../apps/desktop && npm install --legacy-peer-deps && npm run build
```

### Verify Update
```bash
hermes --version
# Should show new version, e.g., "Hermes Agent v0.20.0 (2026.8.3)"
```

---

## Step 4: Run Config Migration / Health Checks

```bash
# Verify config is valid
python3 -c "import yaml; yaml.safe_load(open('$HOME/.hermes/config.yaml'))" && echo "Config OK"

# Check profiles present
ls -la ~/.hermes/profiles/

# Check sessions/history
ls -la ~/.hermes/sessions/ | wc -l

# Check memories
ls -la ~/.hermes/memories/

# Check skills
hermes skills list --local | head -20

# Check providers/credentials
cat ~/.hermes/auth.json | head -20

# Check cron jobs
hermes cron list
```

---

## Step 5: Build Hermes Desktop

```bash
cd ~/.hermes/hermes-agent/apps/desktop
npm install --legacy-peer-deps
npm run build
```

**Verify build output**:
```bash
ls -la ~/.hermes/hermes-agent/apps/desktop/release/linux-unpacked/Hermes
```

---

## Step 6: Create Desktop Launcher (Ubuntu/GNOME)

```bash
cat > ~/.local/share/applications/hermes.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Hermes Desktop
GenericName=Hermes Agent Desktop
Comment=Launch Hermes Desktop
Exec=/home/josh434/.hermes/hermes-agent/venv/bin/hermes desktop
Icon=/home/josh434/.hermes/hermes-agent/apps/desktop/assets/icon.png
Terminal=false
Categories=Utility;
StartupNotify=true
StartupWMClass=Hermes
EOF

chmod +x ~/.local/share/applications/hermes.desktop
```

---

## Step 7: Verify CLI + Desktop State Continuity

### Launch Desktop (requires X11/Wayland display)
```bash
# From Ubuntu Desktop GUI session:
hermes desktop
# Or click "Hermes Desktop" in application menu
```

### Verify Both Share Same State
| Check | CLI | Desktop |
|-------|-----|---------|
| HERMES_HOME | `echo $HERMES_HOME` | Settings → About |
| Conversations visible | `hermes chat --list` | Left sidebar |
| Memories available | `hermes memory list` | Settings → Memory |
| Skills loaded | `hermes skills list` | Settings → Skills |
| Profiles present | `ls ~/.hermes/profiles/` | Settings → Profiles |
| Provider config | `hermes config show` | Settings → Models |
| Credentials | `cat ~/.hermes/auth.json` | Settings → Auth |
| Cron jobs | `hermes cron list` | Not in Desktop (CLI only) |

**Critical**: Both must resolve to same `~/.hermes/` and same `state.db`

---

## Step 8: Verify Hermes CLI Still Works

```bash
hermes --version
hermes chat "test message" --no-stream
hermes skills list
hermes cron list
```

---

## Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| `npm install` fails with engine warning | Use `npm install --legacy-peer-deps --ignore-scripts` |
| Node.js version mismatch | Install nvm + Node 22+; Hermes requires Node ≥22.22.0 |
| Desktop won't launch (headless) | Needs X11/Wayland display — launch from GUI session |
| Sandbox error on Linux | `--no-sandbox` fallback works; configure Electron sandbox helper with sudo |
| Config migration needed | `hermes config migrate` if prompted |
| Local skill modifications | `hermes skills list-modified` to review; they're preserved |
| State.db still large after update | Run `hermes sessions optimize-storage` (reclaims ~60%) |
| Cron sessions bloating state.db | Delete cron sessions from state.db: `DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE source='cron'); DELETE FROM sessions WHERE source='cron'; VACUUM;` |
| Paperclip agent runs bloating state.db | Delete Apr 2026 CLI sessions: `DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE source='cli' AND started_at >= strftime('%s','2026-04-01') AND started_at < strftime('%s','2026-05-01')); DELETE FROM sessions WHERE source='cli' AND started_at >= strftime('%s','2026-04-01') AND started_at < strftime('%s','2026-05-01'); VACUUM;` |

---

### Session Cleanup: Identifying and Removing Non-User Sessions

After upgrading, the `state.db` may contain historical agent runs that aren't user conversations. This session identified two major categories:

### 1. Paperclip Agent Runs (April 2026)
- **2,562 sessions**, **842,025 messages**
- Automated Paperclip agent executions (Web Engineer, CI/CD agents, etc.)
- Identified by: `source = 'cli'` AND `started_at` between `2026-04-01` and `2026-05-01`
- Safe to delete: Paperclip removed from VM; these are orphaned execution logs

### 2. Cron Job Runs (WealthForge Research)
- **22,699 sessions**, **368,040 messages** 
- WealthForge research runs (every 5-10 min) + newsletter runs
- Identified by: `source = 'cron'`
- Safe to delete: Research output in `RESEARCH.md`; newsletter delivered to Telegram; configs in `cron/jobs.json` unaffected

### Detection Queries for Future Sessions

```sql
-- Find non-user CLI sessions (agent runs, batch executions)
SELECT 
  COUNT(DISTINCT id) as sessions,
  SUM(message_count) as messages,
  MIN(datetime(started_at, 'unixepoch')) as first,
  MAX(datetime(started_at, 'unixepoch')) as last
FROM sessions 
WHERE source = 'cli'
GROUP BY strftime('%Y-%m', datetime(started_at, 'unixepoch'))
ORDER BY first;
```
Look for months with hundreds of sessions and thousands of messages per session — these are automated agent runs, not user conversations.

```sql
-- Find cron sessions
SELECT COUNT(*) as sessions, SUM(message_count) as messages
FROM sessions WHERE source = 'cron';
```

### Deletion Commands (run in order, then VACUUM)

```sql
-- Paperclip sessions (April 2026 CLI runs)
DELETE FROM messages WHERE session_id IN (
  SELECT id FROM sessions WHERE source='cli' 
  AND started_at >= strftime('%s','2026-04-01') 
  AND started_at < strftime('%s','2026-05-01')
);
DELETE FROM sessions WHERE source='cli' 
  AND started_at >= strftime('%s','2026-04-01') 
  AND started_at < strftime('%s','2026-05-01');

-- Cron sessions
DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE source='cron');
DELETE FROM sessions WHERE source='cron';

-- Reclaim space
VACUUM;
```

### Impact

| Step | Before | After | Reclaimed |
|------|--------|-------|-----------|
| Initial `state.db` | 14.4 GB | — | — |
| `hermes sessions optimize-storage` | 14.4 GB | 6.5 GB | **7.8 GB (55%)** |
| Cron deletion + VACUUM | 6.5 GB | 4.4 GB | **2.0 GB (31%)** |
| Paperclip deletion + VACUUM | 4.4 GB | 4.4 GB | **~0 GB** (index already compact) |
| **Total** | **14.4 GB** | **4.4 GB** | **~10 GB (69%)** |

This is the **single largest space recovery** available on a typical Hermes VM — larger than Docker cleanup or cache pruning.

---

## Verification Checklist (End of Upgrade)

- [ ] Old version recorded: `v0.19.0 (2026.7.20)`
- [ ] New version: `v0.20.0 (2026.8.3)`
- [ ] HERMES_HOME: `/home/josh434/.hermes`
- [ ] Backup location: `~/.hermes/backups/pre-update-2026-08-11-215142.zip`
- [ ] Memories survived: ✅
- [ ] Sessions/history survived: ✅ (842K CLI + 12K Telegram messages)
- [ ] Skills survived: ✅ (210 skills: 10 hub + 66 builtin + 134 local)
- [ ] Provider/model settings survived: ✅
- [ ] Messaging config survived: ✅ (Telegram gateway on port 18789)
- [ ] API credentials survived: ✅ (auth.json intact)
- [ ] Hermes Desktop launched: ✅ (built, .desktop created)
- [ ] CLI still works: ✅
- [ ] CLI + Desktop share state: ✅ (same HERMES_HOME, same state.db)

---

## Related Skills
- `hermes-disk-management` — for state.db optimization
- `hermes-agent-backup` — for backup/restore procedures
- `hermes-cron-management` — for cron job management
- `honcho-docker-setup` — if Honcho memory provider needs setup