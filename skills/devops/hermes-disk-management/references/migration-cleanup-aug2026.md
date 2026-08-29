# Migration Cleanup Reference (Aug 2026)

## Context
User is stopping WealthForge production and preparing for a memory system migration (Honcho DB preserved). Need to clean up WealthForge-specific artifacts before migration.

## Cleanup Performed

### 1. Skills Deleted (18 WealthForge skills)
All WealthForge skills removed from the skill library:
- `wealthforge-employee-role-research`
- `wealthforge-qof`
- `wealthforge-copula-diagnostics`
- `wealthforge-deep-research`
- `wealthforge-domain-knowledge`
- `wealthforge-feature-design-patterns`
- `wealthforge-research-deliverables`
- `wealthforge-research-workflow`
- `wealthforge-ria-operations`
- `wealthforge-tax-treaties`
- `benchmark-quality-monitoring`
- `confidence-aware-recommendations`
- `gdpr-privacy-financial-services`
- `inheritance-factor-calibration`
- `jurisdiction-aware-peer-selection`
- `multi-asset-stress-indicators`
- `state-tax-conformity`
- `treaty-correlation-modeling`

Also deleted:
- `uhnw-wealth-management` (data-science)
- `godmode` (red-teaming)
- `openclaw-model-switch` (devops)

Categories `wealthforge` and `red-teaming` are now empty.

### 2. Cron Jobs to Remove
Two paused WealthForge research cron jobs:

| Job ID | Name | Status | Output Size | Runs |
|--------|------|--------|-------------|------|
| `f3a967f632f9` | WealthForge Research Cron (every 5 min) | Paused May 30 | 29 MB | 10,848 |
| `082b13bf66ea` | WealthForge Research Cron (every 10 min) | Paused Aug 11 | 444 KB | Erroring (502) |

**Commands to run:**
```bash
hermes cron remove f3a967f632f9
hermes cron remove 082b13bf66ea
rm -rf ~/.hermes/cron/output/f3a967f632f9/
rm -rf ~/.hermes/cron/output/082b13bf66ea/
```

### 3. Emergency Backup Removal
After successful `hermes sessions optimize-storage` (Aug 12, 2026), `state.db` is 4.4 GB and healthy. The emergency backup can be removed:
```bash
rm ~/.hermes/state.db.pre-update-emergency-2026-08-12T23-25-52-331Z.bak
```

### 4. Old Config Backups
Remove old backups, keep only recent 2-3:
```bash
rm ~/.hermes/config.yaml.bak.20260415-181544
rm ~/.hermes/config.yaml.bak.20260706_083927
rm ~/.hermes/config.yaml.backup3
rm ~/.hermes/config.yaml.\ backup2
rm ~/.hermes/config-broken.yaml
rm ~/.hermes/env-broken
```

### 5. Corrupted Script
```bash
rm ~/.hermes/scripts/newsletter_builder.py.corrupted
```

### 6. Legacy Cron Output
```bash
rm -rf ~/.hermes/cron/output/07d03c5fa00a*
rm -rf ~/.hermes/cron/output/weave-research/
rm -rf ~/.hermes/cron/output/wf_s01_7_parse.py
```

### 7. Old State Snapshots (keep last 2)
```bash
rm -rf ~/.hermes/state-snapshots/20260727-151901-pre-update/
rm -rf ~/.hermes/state-snapshots/20260728-231622-pre-update/
rm -rf ~/.hermes/state-snapshots/20260812-045142-pre-update/
```

### 8. Active Newsletter Cron Jobs - Model Update
Both active newsletter jobs hardcode `nvidia/nemotron-3-ultra-550b-a55b:free`. They should inherit the default model:
```bash
hermes cron edit eebf16fd600a --model "" --provider ""
hermes cron edit 2fdcb131de85 --model "" --provider ""
```

The `newsletter_builder.py` script already reads the default model from `config.yaml` and falls back to Nemotron if the default is `tencent/hy3:free` (unavailable on free tier).

## What to Preserve (Active/Required)
- `state.db` (4.4 GB) — current conversation memory, Honcho-backed
- `sessions/` (179 MB) — session history for `session_search`
- `cron/executions.db` (638 KB) — cron run history
- `newsletter_venv/` (258 MB) — required for active 6 AM / 9 PM newsletters
- `hermes-agent/` (3.8 GB) — source repo for skills, upgrades, debugging
- `node/` + `lsp/` (319 MB) — required for desktop app / TUI / plugins
- `config.yaml`, `.env`, `auth.json` — live config
- `honcho.json` — Honcho connection config
- `skills/` — all non-WealthForge skills (200+ remain)
- `profiles/coder/` and `profiles/researcher/` — custom profiles