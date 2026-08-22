---
name: memory-backend-configuration
description: "Configure and troubleshoot persistent memory backends (Honcho, Mem0, etc.) for Hermes Agent. Covers Docker setup, hybrid LLM configurations, authentication, and cross-session memory verification."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
tags: [memory, honcho, mem0, docker, llm-configuration, persistent-memory]
related_skills: [hermes-agent]
---

# Memory Backend Configuration for Hermes Agent

This skill covers setting up external memory providers (primarily **Honcho**) as the persistent memory backend for Hermes Agent, replacing the built-in session-based memory with durable, cross-session storage.

## Overview

Hermes Agent supports multiple memory backends via plugins. The default is built-in session memory (stored in `${HOME}/.hermes/state.db`). For true cross-session persistence with semantic recall, external backends like **Honcho** are required.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- OpenRouter API key (for LLM) or local Ollama
- ~3GB free RAM if using local Ollama models
- `HONCHO_API_KEY` set in `${HOME}/.hermes/.env` (can be dummy value for local Honcho with auth disabled)

## Step-by-Step: Honcho Memory Backend

### 1. Clone and Start Honcho Server

```bash
git clone https://github.com/plastic-labs/honcho.git
cd honcho
cp docker-compose.yml.example docker-compose.yml
cp .env.template .env
docker compose up -d --build
```

### 2. Fix Common Docker Issues

**CRLF line endings in entrypoint.sh** (Windows git clone):
```bash
sed -i 's/\r$//' docker/entrypoint.sh
docker compose up -d --force-recreate api
```

**Broken CACHE_URL in docker-compose.yml** (has duplicate/garbled lines):
```bash
# Edit docker-compose.yml - ensure CACHE_URL appears once:
#   - CACHE_URL=redis://redis:6379/0?suppress=true
#   - CACHE_ENABLED=true
```

### 3. Configure LLM Provider (Hybrid: OpenRouter + Ollama)

Edit `.env` for Honcho:

```env
# LLM via OpenRouter
LLM_OPENAI_API_KEY=sk-or-...
OLLAMA_BASE_URL=https://openrouter.ai/api/v1
OLLAMA_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

# Deriver/Dialectic/Summary/Dream all use OpenRouter
DERIVER_MODEL_CONFIG__TRANSPORT=openai
DERIVER_MODEL_CONFIG__MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
DERIVER_MODEL_CONFIG__OVERRIDES__BASE_URL=https://openrouter.ai/api/v1

# Embeddings via LOCAL Ollama (saves API costs, no rate limits)
EMBEDDING_MODEL_CONFIG__TRANSPORT=openai
EMBEDDING_MODEL_CONFIG__MODEL=nomic-embed-text
EMBEDDING_MODEL_CONFIG__OVERRIDES__BASE_URL=http://host.docker.internal:11434/v1
```

Pull embedding model:
```bash
ollama pull nomic-embed-text
```

### 4. Configure Hermes Agent

```bash
# Set Honcho as memory provider
hermes config set memory.provider honcho
hermes config set honcho.base_url http://127.0.0.1:8000
hermes config set honcho.workspace hermes-memory
hermes config set honcho.api_key " "  # dummy value for auth-disabled local

# Add dummy key to .env
echo "HONCHO_API_KEY= " >> ${HOME}/.hermes/.env

# Verify
hermes memory status
# Should show: Provider: honcho, Status: available ✓
```

### 5. Test Cross-Session Memory

```bash
# Session 1
hermes chat -q "My favorite color is electric blue"

# Session 2 (new session)
hermes chat -q "What's my favorite color?"
# Should reply: "Electric blue — you told me earlier..."
```

## Pitfalls & Fixes

| Issue | Fix |
|-------|-----|
| `docker/entrypoint.sh: Illegal option -` | CRLF line endings → `sed -i 's/\r$//' docker/entrypoint.sh` |
| `ValidationError: USE_AUTH Input should be boolean` | `.env` has comments merged into values → recreate `.env` cleanly |
| `AuthenticationError` on chat | No valid LLM key → check `.env` LLM_OPENAI_API_KEY |
| `BadRequestError` on chat | Model doesn't support tools → use `nvidia/nemotron-3-ultra-550b-a55b:free` |
| Honcho status shows "Missing HONCHO_API_KEY" | Add dummy key: `echo "HONCHO_API_KEY= " >> ${HOME}/.hermes/.env` |
| Graphify processes consuming LM Studio | `powershell -Command "Stop-Process -Id <PIDs> -Force"` |

## Hybrid LLM Configuration Pattern

For cost optimization with local embeddings:

| Component | Provider | Base URL | Model |
|-----------|----------|----------|-------|
| Chat/Dialectic/Deriver/Summary/Dream | OpenRouter | `https://openrouter.ai/api/v1` | `nvidia/nemotron-3-ultra-550b-a55b:free` |
| Embeddings | Local Ollama | `http://host.docker.internal:11434/v1` | `nomic-embed-text` |

This avoids OpenRouter embedding rate limits and costs.

## Verification Checklist

- [ ] Honcho API healthy: `curl http://127.0.0.1:8000/health` → `{"status":"ok"}`
- [ ] Docker containers all healthy: `docker compose ps`
- [ ] Hermes memory status shows "available ✓"
- [ ] Cross-session recall works in new Hermes session
- [ ] No stray Graphify/LM Studio processes running

## Autognosia Integration

In Autognosia, Honcho runs as a Docker service (see `docker/docker-compose.honcho.yml` and `INSTALL.md` §4). The hybrid LLM configuration above is the recommended pattern for Autognosia deployments.

This skill is referenced by:
- `autognosia-deployment` skill (for Docker service setup)
- Autognosia `INSTALL.md` §6 (Hermes memory setup)

## References

- `references/honcho-docker-compose.yml` — Known-good docker-compose.yml
- `references/honcho-env.template` — Complete .env with hybrid config
- `references/hermes-honcho-config.yaml` — Hermes config.yaml snippets

## Related Skills

- `hermes-agent` — Core Hermes configuration (bundled, read-only)