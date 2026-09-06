# Gitignore Audit Checklist

## Docker/Deployment Files (keep these — they're project config)
- [ ] `docker-compose.yml` files (root and subdirectories)
- [ ] `Dockerfile` files
- [ ] `.env.example` / `.env.*.example` templates (NOT `.env` with real secrets)
- [ ] Docker config files: `docker-compose.brain.yml`, `docker-compose.honcho.yml`, etc.
- [ ] Database init scripts (`.sql` files referenced by Docker)
- [ ] Docker network/service config: `core-config/`, `personal-organizer/` in docker/

## Project Source (keep these)
- [ ] Application source code (JS, CSS, HTML, Python, etc.)
- [ ] Custom scripts (in `scripts/`, `bin/` only if self-compiled)
- [ ] Documentation (README, INSTALL, SETUP, TROUBLESHOOTING, etc.)
- [ ] Custom skills (in `skills/` but NOT bundled Hermes skills)
- [ ] Schema files (`.schema.json`, `SCHEMA.md`)
- [ ] Profile core configs (`SOUL.md`, `config.yaml`, `profile.yaml`)
- [ ] Tests (in `tests/`)
- [ ] Reference notes (`.md` files that are actual project docs, not research scratch)

## Downloaded Binaries (gitignore + remove)
- [ ] `bin/` (downloaded CLI tools like gh, etc.)
- [ ] `.opencode/` (obsolete - safe to remove)
- [ ] `.codex/` (Codex CLI)
- [ ] `.claude/` (Claude Code)

## Docker/Build Artifacts (gitignore + remove)
- [ ] `lightllm/` (LLM proxy — Docker-pulled, config-only needed)
- [ ] `litellm_proxy/` (LiteLLM proxy — config-only needed)
- [ ] `firecrawl-stack/` (Firecrawl — Docker-pulled)
- [ ] `.electron-gyp/` (Electron build headers)
- [ ] `__pycache__/` (Python bytecode)
- [ ] `*.egg-info/` (Python egg metadata)
- [ ] `*.whl`, `*.gguf`, `*.safetensors` (downloaded packages/models)
- [ ] `node_modules/` (npm deps)

## Docker-Downloaded Runtime (gitignore + remove)
- [ ] `oc-work/` (Coder scratch workspace)
- [ ] `personal-agent/` (if Docker-pulled)
- [ ] `honcho/` (Honcho — Docker-pulled)
- [ ] `hermes-cortex/`, `cortex-backup/` (legacy Docker artifacts — deleted)
- [ ] `hermes-retrieval-reflex/` (Docker artifact)

## Profile Cache/State (gitignore + remove)
- [ ] `profiles/*/models_dev_cache.etag` (model cache ETag)
- [ ] `profiles/*/.update_check` (update timestamp)
- [ ] `profiles/*/.skills_prompt_snapshot.json` (skills snapshot)

## Research Scratch (gitignore + remove)
- [ ] `research_tmp/` (temporary research downloads)
- [ ] `tmp_research_blocks/` (research scratch)
- [ ] `research_*.py`, `research_*.json` (one-off research scripts/data)
- [ ] `*_research.md`, `*_research.json` (research findings from single session)
- [ ] `*_summary.json`, `*_summary.md` (one-off summaries)
- [ ] `dump_*.py`, `extract_*.py` (one-off data dump scripts)
- [ ] `pages/*.txt` (cached web pages from design research)

## Screenshots/Audits (gitignore + remove)
- [ ] `*.png` (screenshots, audit results)
- [ ] `*.webp`, `*.jpg` (image artifacts)
- [ ] `phase2-test.png` and similar test images
- [ ] `dashboard-refactor-summary.json`, `dashboard-screenshots.js`

## Bundled Hermes Skills (gitignore + remove)
- [ ] `skills/apple/` (shipped with base Hermes)
- [ ] `skills/creative/`
- [ ] `skills/data-science/`
- [ ] `skills/devops/`
- [ ] `skills/email/`
- [ ] `skills/mlops/`
- [ ] `skills/note-taking/`
- [ ] `skills/productivity/`
- [ ] `skills/research/`
- [ ] `skills/software-development/`
- [ ] `skills/web/`
- [ ] `skills/media/`
- [ ] `skills/smart-home/`
- [ ] `skills/social-media/`
- [ ] `profiles/*/skills/` (duplicated bundled skills under profiles)

## Hermes Skills Backup (gitignore + remove)
- [ ] `hermes-skills-backup/` (regenerated from base Hermes install)

## Legacy/Obsolete (gitignore + remove)
- [ ] `.gbrain/` (legacy brain system — superseded by brain-postgres)
- [ ] `gbrain/`

## Environment Secrets (gitignore — NEVER commit real credentials)
- [ ] `.env` (any bare .env file with real secrets)
- [ ] `.env.web-stack`, `lightllm/.env`, `litellm_proxy/.env`
- [ ] `.hermes/.env`, `profiles/*/.env`
- [ ] State snapshots with `.env`: `state-snapshots/*/.*.env`

## System/OS Junk (gitignore + remove)
- [ ] `.dotnet/corefx/` (CRL cache — 300+ KB of revoked cert lists)
- [ ] `.gnupg/` (GPG keys — keep in secure storage, not git)
- [ ] `.npmrc` (npm config — contains auth tokens)
- [ ] `.echo`, `.sudo_as_admin_successful` (system markers)
- [ ] `.wget-hsts` (wget cache)
- [ ] `.xorgxrdp.10.log*`, `.xsession-errors` (X11 session logs)
- [ ] `.summarize/cache.sqlite` (cache database)
- [ ] `Cargo.lock` (for project-local tools only, not project source)
- [ ] `hermes-update.log`, `hermes-config-backup.yaml` (operational logs)
- [ ] `metadata_rs.txt` (temporary metadata)

## Gitignore Self-Check
- [ ] `.gitignore` is NOT in the ignore list (so changes are tracked)
- [ ] No duplicate rules (e.g., `gbrain/` appearing twice)
- [ ] Sections are clearly labeled with headers
