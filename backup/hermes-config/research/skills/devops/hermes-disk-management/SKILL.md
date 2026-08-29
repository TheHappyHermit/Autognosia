---
name: hermes-disk-management
description: Periodic disk maintenance for Hermes Agent — state snapshot cleanup, cron output pruning, and general disk audit.
---

# Hermes Disk Management

Periodic maintenance of disk usage across the Hermes workspace.

### Official Hermes Backup Command
The `hermes update --backup` command creates a full backup automatically:
```bash
hermes update --backup
# Creates: ~/.hermes/backups/pre-update-<timestamp>.zip
# Contains: skills, config, profiles, cron, scripts, plugins, memory files
# Excludes: state.db, caches, logs, sessions, venvs
```

**Verified backup contents** (this session):
- `pre-update-2026-08-11-215142.zip` — 908 KB (skills, configs, profiles, scripts, plugins, cron, SOUL.md)
- State snapshots also created in `~/.hermes/state-snapshots/20260812-045142-pre-update/` etc.

### State Snapshot Cleanup

State snapshots in `~/.hermes/state-snapshots/` are pre-update backups that can grow to **5 GB+ each**. They contain copies of `state.db`, `config.yaml`, `auth.json`, cron jobs, and channel directory — useful for rollback but not for research or workspace data.

### When to clean
- Total snapshot directory exceeds ~15 GB
- User reports disk pressure
- Routine maintenance check

### Procedure
1. Run `du -sh ~/.hermes/state-snapshots/*/ 2>/dev/null | sort -rh` to see sizes
2. Keep the **2 most recent** snapshots (for rollback safety)
3. Delete the rest: `rm -rf ~/.hermes/state-snapshots/<oldest-dirs>/`
4. Verify remaining space with `du -sh ~/.hermes/state-snapshots/*/ 2>/dev/null | sort -rh`

**Never delete all snapshots** — always keep at least 2 for rollback.

## Cron Output Cleanup

Cron job outputs live in `~/.hermes/cron/output/<job_id>/` as timestamped `.md` files. These accumulate over time.

### Procedure
1. `du -sh ~/.hermes/cron/output/<job_id>/` to check size
2. List files: `ls -la ~/.hermes/cron/output/<job_id>/`
3. Delete old files selectively or the entire directory if the user wants a clean slate
4. Note: cron jobs will regenerate outputs on next run

### Current Active Job IDs (Aug 2026)
- `eebf16fd600a` — Morning Newsletter (6 AM) — **active**, delivers to Telegram
- `2fdcb131de85` — Evening Newsletter (9 PM) — **active**, delivers to Telegram

### Paused/Removed Job Cleanup (WealthForge)
The following WealthForge research cron jobs are **paused** and their output directories can be safely deleted:
- `f3a967f632f9` — WealthForge Research Cron (every 5 min) — **paused May 30**, 10,848 runs, **29 MB** output
- `082b13bf66ea` — WealthForge Research Cron (every 10 min) — **paused Aug 11**, erroring (502), **444 KB** output

**Cleanup commands:**
```bash
# Remove output directories
rm -rf ~/.hermes/cron/output/f3a967f632f9/
rm -rf ~/.hermes/cron/output/082b13bf66ea/

# Remove the cron jobs themselves
hermes cron remove f3a967f632f9
hermes cron remove 082b13bf66ea
```

### Legacy/Orphaned Output Directories
Old cron output directories that don't match current `jobs.json`:
- `07d03c5fa00a*` — root-owned, Jun 2026
- `weave-research/` — old research experiment
- `wf_s01_7_parse.py` — old script
These can be removed: `rm -rf ~/.hermes/cron/output/07d03c5fa00a* ~/.hermes/cron/output/weave-research/ ~/.hermes/cron/output/wf_s01_7_parse.py`

## NAS Drive (/mnt/nas/)

**Mounted at `/mnt/nas/` but owned by root.** The josh434 user can read but NOT write. Any copy/mkdir operations will fail with permission denied.

- Contents: `/mnt/nas/backups/VMs/` (empty, VM backup target)
- To write: requires `sudo` (password needed — can't be automated from agent)
- **Workaround**: Use alternative writable storage (local backup dir, cloud, etc.) or ask user to run the copy command manually

## General Disk Audit

When user reports disk pressure, check these in order:
1. `~/.hermes/state.db` — **main session database (often 10-15 GB)** — run `hermes sessions optimize-storage` to reclaim ~60% (~8 GB)
2. `~/.hermes/state-snapshots/` — pre-update backups (can be 5 GB+ each)
3. `~/.hermes/cron/output/` — cron job outputs (accumulate over time)
4. `~/.hermes/memory_enhancement/` — SQLite memory database
5. `~/Documents/Hermes-Vault/` — Obsidian vault
6. `~/.hermes/media_cache/` — cached media files
7. `~/.hermes/audio_cache/` — TTS audio files
8. `~/.hermes/hermes-agent/` — source tree + node_modules (3-4 GB)

### State Database (`state.db`) Deep Dive

The `state.db` SQLite database contains:
| Table | Rows | Purpose |
|-------|------|---------|
| `messages` | ~1.2M | Full conversation history |
| `messages_fts` | ~1.2M | Full-text search index (FTS5) |
| `messages_fts_trigram` | ~1.2M | Trigram index for fuzzy search |
| `sessions` | ~25K | Session metadata |
| + 13 smaller tables | | |

**Optimization**: `hermes sessions optimize-storage` reclaims ~60% by:
- Merging fragmented FTS5 segments into single efficient segment
- Rebuilding trigram index (removing gaps from deleted entries)
- Reclaiming free pages from SQLite's free-list
- Checkpointing WAL pages back to main DB

**Process**: Runs in foreground with progress bar, safe to interrupt/resume, never changes conversations.

#### Session Source Breakdown (This VM)

| Source | Sessions | Messages | Nature |
|--------|----------|----------|--------|
| **CLI** | ~2,600 | ~842K | **Mixed**: ~2,560 are Paperclip agent runs (Apr 2026), ~35 are real user sessions |
| **Cron** | ~22,700 | ~368K | WealthForge research runs (every 5-10 min), newsletter runs — **redundant with RESEARCH.md/Telegram** |
| **Telegram** | ~218 | ~12K | Real user conversations |

**Cron Session Deletion** (safe, reclaims ~2 GB):
```sql
-- Delete cron sessions and their messages
DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE source = 'cron');
DELETE FROM sessions WHERE source = 'cron';
-- Then run VACUUM to reclaim space
VACUUM;
```
- Cron configs live in `cron/jobs.json` — **unaffected**
- Cron execution history in `cron/executions.db` — **unaffected**  
- Research output in `RESEARCH.md` — **unaffected**
- Newsletter delivered to Telegram — **unaffected**

### ~/.hermes/ Size Breakdown (Typical)

```
~/.hermes/state.db              14 GB  ← optimize with `hermes sessions optimize-storage` + cron deletion
~/.hermes/hermes-agent/         3.4 GB  (source + node_modules + .git)
~/.hermes/sessions/             177 MB  (raw JSON request dumps)
~/.hermes/newsletter_venv/      258 MB  (Python venv for newsletter)
~/.hermes/node/                 205 MB  (Node.js runtime)
~/.hermes/lsp/                  113 MB  (Language server)
~/.hermes/scratch/              88 MB
~/.hermes/skills/               84 MB
~/.hermes/logs/                 81 MB
~/.hermes/bin/                  68 MB
~/.hermes/cron/                 34 MB
... (rest < 20 MB each)
```

### Verified Optimization Results (This Session)

| Step | Before | After | Reclaimed |
|------|--------|-------|-----------|
| Initial `state.db` | 14.4 GB | — | — |
| After `hermes sessions optimize-storage` | 14.4 GB | 6.5 GB | **7.8 GB (55%)** |
| After cron session deletion + VACUUM | 6.5 GB | 4.4 GB | **2.0 GB (31%)** |
| After Paperclip agent session deletion + VACUUM | 4.4 GB | 4.4 GB* | **~0 GB** (index already compact) |
| **Total** | **14.4 GB** | **4.4 GB** | **~10 GB (69%)** |

*Paperclip deletion removed 842K messages but indexes were already compact from prior optimization; VACUUM confirmed no further reclaim.

This is the **single largest space recovery** available on this VM — larger than any Docker cleanup or cache pruning.

### Emergency Backup Cleanup

After a successful `hermes update` with `--backup` (or `hermes sessions optimize-storage`), the emergency backup file created as a safety net can be removed:

```bash
# After verifying state.db is healthy post-optimization/update
rm ~/.hermes/state.db.pre-update-emergency-<timestamp>.bak
```

**Example:** `state.db.pre-update-emergency-2026-08-12T23-25-52-331Z.bak` (4.4 GB) — current `state.db` is also 4.4 GB and healthy, so this emergency backup can be deleted.

### Config Backup Cleanup

Old `config.yaml` backups in `~/.hermes/` can accumulate. Keep only the most recent 2-3 dated backups:

```bash
# Remove old config backups (keep newest 2-3)
rm ~/.hermes/config.yaml.bak.20260415-181544
rm ~/.hermes/config.yaml.bak.20260706_083927
rm ~/.hermes/config.yaml.backup3
rm ~/.hermes/config.yaml.\ backup2  # Note: typo in filename with space
rm ~/.hermes/config-broken.yaml
rm ~/.hermes/env-broken
```

### Corrupted Script Cleanup

Explicitly named corrupted/broken scripts:
```bash
rm ~/.hermes/scripts/newsletter_builder.py.corrupted
```

### Paperclip Agent Session Deletion (April 2026)

The CLI source contained **2,562 Paperclip agent runs from April 2026** (not real user conversations):

| Metric | Value |
|--------|-------|
| Sessions deleted | 2,562 |
| Messages deleted | 842,025 |
| Source identifier | `source = 'cli'` AND `started_at` between `2026-04-01` and `2026-05-01` |

**Deletion SQL:**
```sql
-- Identify Paperclip sessions (April 2026 CLI runs)
SELECT id FROM sessions 
WHERE source = 'cli' 
  AND started_at >= strftime('%s', '2026-04-01') 
  AND started_at < strftime('%s', '2026-05-01');

-- Delete messages then sessions
DELETE FROM messages WHERE session_id IN (...);
DELETE FROM sessions WHERE id IN (...);
VACUUM;
```

**Why safe to delete:**
- These are automated Paperclip agent executions (Web Engineer, CI/CD agents, etc.)
- Not user conversations — agent prompts + Paperclip API calls + tool outputs
- Paperclip has been removed from this VM; these logs are orphaned
- Real CLI sessions (May–July 2026): only 33 sessions, 193 messages

**Detection pattern for future sessions:**
```sql
-- Check for non-user CLI sessions (agent runs, batch executions)
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

### Automated Newsletter / Cron Delivery Sessions — Investigation Result

**No automated newsletter sessions exist in the database.**

The cron jobs (`Morning Newsletter (6 AM)`, `Evening Newsletter (9 PM)`) use `deliver: "telegram"` in their config, which sends the newsletter directly via the Telegram Bot API — **no Hermes session is created**.

The keyword matches found earlier ("newsletter" in messages) were false positives from the current conversation discussing cleanup results (e.g., "## ✅ Cleanup Complete — Disk Usage: 69 GB → 58 GB").

**Verification query:**
```sql
-- Sessions with zero user messages (would indicate automated delivery)
SELECT s.id, s.source, SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_count
FROM sessions s LEFT JOIN messages m ON m.session_id = s.id
GROUP BY s.id HAVING user_count = 0 AND total > 5;
-- Returns: EMPTY — no automated delivery sessions
```

**Conclusion:** Nothing to delete. Cron deliveries bypass Hermes sessions entirely.

### Rust / Go Toolchain Cleanup

The VM had leftover toolchains from WealthForge research projects (not needed for Hermes):

| Toolchain | Path | Size | Removal |
|-----------|------|------|---------|
| **Rust (stable)** | `~/.rustup/toolchains/stable-...` | 1.8 GB | `rustup self uninstall -y` |
| **Rust (nightly)** | `~/.rustup/toolchains/nightly-...` | 2.4 GB | `rustup toolchain remove nightly` |
| **Go module cache** | `~/go/pkg/mod/` | 477 MB | `chmod -R u+w ~/go && rm -rf ~/go` |
| **cel-ast-research** | `~/cel-ast-research/` | ~4 MB | `rm -rf ~/cel-ast-research` |

**Total freed: ~2.3 GB**

**When to apply:** If `du -sh ~/.rustup` or `du -sh ~/go` shows significant usage and no active Rust/Go projects exist (check for `Cargo.toml` / `go.mod` outside `.cargo/registry`).
