# Autognosia Command Deck — Local System .env Configuration Guide
> **Audience**: Autonomous AI Agents (Hermes Agent, OpenClaw) and System Administrators with access to local system resources.

This document specifies the exact environment variables used by the Autognosia Command Deck, where credentials and services reside on the local system, and how an agent can automatically configure `c:\Coding\Autognosia\.env` and `dashboard/.env`.

---

## 1. Quick Automated Setup

If Hermes has shell or Python access on this machine, it can automatically probe all local services and configure `.env` by running:

```powershell
python dashboard/scripts/auto_discover_env.py
```

Or via HTTP API on the dashboard server:
```http
POST /api/system/auto-discover
```

To set a specific API key programmatically:
```powershell
python dashboard/scripts/auto_discover_env.py --set ALPHAVANTAGE_API_KEY=your_key_here
```

---

## 2. Local Environment Discovery Protocol

When configuring `.env`, Hermes should inspect the following local system locations:

| Service | Default Local Address | How Hermes Can Discover / Verify | Credential Location on Local Host |
| :--- | :--- | :--- | :--- |
| **Hermes Gateway API** | `http://127.0.0.1:8642` | Test `GET /health` or `GET /v1/models` | `~/.hermes/auth.json` or `~/.hermes/.env` (`API_SERVER_KEY` / `HERMES_API_KEY`) |
| **Uptime Kuma** | `http://localhost:3001` | Test `GET /api/status-page/default` or `GET /` | `UPTIME_KUMA_URL`, `UPTIME_KUMA_SLUG=default`, optional `UPTIME_KUMA_TOKEN` |
| **Home Assistant** | `http://10.1.1.13:8123` or `http://localhost:8123` | Test `GET /api/states` | HA -> Profile -> Long-Lived Access Tokens (`HASS_TOKEN`) |
| **SearXNG** | `http://127.0.0.1:8080` | Test `GET /search?q=test&format=json` | No auth needed by default (`SEARXNG_URL`) |
| **PostgreSQL + pgvector** | `postgresql://postgres:postgres@localhost:5432/autognosia` | Test TCP connection to port `5432` | Standard local Postgres credentials (`PG_URL` / `DATABASE_URL`) |
| **God's Eye View** | `http://localhost:5173` | Test `GET /` (Vite/Cesium 3D HUD) | `https://github.com/bilawalsidhu/gods-eye-view` (`GODS_EYE_URL`) |
| **Inference Cluster** | `http://10.1.1.10:8080` (Main), `http://10.1.1.151:1234` (Vision), `http://10.1.1.151:18020` (vLLM) | Test HTTP GET to `/v1/models` | `INFERENCE_NODE_MAIN`, `INFERENCE_NODE_VISION`, `INFERENCE_NODE_VLLM` |
| **n8n Automations** | `http://127.0.0.1:5678` | Test `GET /rest/workflows` | n8n -> Settings -> Community API (`N8N_API_KEY`) |
| **Immich Photos** | `http://localhost:2283` | Test `GET /api/server-info/ping` | Immich -> Account Settings -> API Keys (`IMMICH_API_KEY`) |
| **Audiobookshelf** | `http://localhost:13378` | Test `GET /api/libraries` | Audiobookshelf -> Settings -> Users -> API Token (`AUDIOBOOKSHELF_TOKEN`) |
| **Booklore / Calibre** | `http://localhost:8080` | Test `GET /` | `BOOKLORE_URL` / `BOOKLORE_API_KEY` |
| **Nextcloud** | `http://localhost:8080` | Test `GET /status.php` | Nextcloud -> Settings -> Security -> App Password (`NEXTCLOUD_TOKEN`) |
| **Seer (Overseerr)** | `http://localhost:5055` | Test `GET /api/v1/status` | Seer -> Settings -> General -> API Key (`SEER_API_KEY`) |
| **FreshRSS** | `http://localhost:8080` | Test `GET /` | FreshRSS -> Profile -> API management (`FRESHRSS_API_KEY`) |
| **DeerFlow** | `http://localhost:8000` | Test `GET /` | `DEERFLOW_URL` (`http://localhost:8000`) |
| **Vane (Perplexica)**| `http://localhost:3000` | Test `GET /api/search` | `VANE_URL` (`http://localhost:3000`) |
| **Open WebUI** | `http://localhost:3000` | Test `GET /api/v1/models` | Open WebUI -> Settings -> Account -> API Keys (`OPENWEBUI_API_KEY`) |

---

## 3. Environment Variable Specification

### Section 1: Core Automation & System Services
```env
# Home Assistant
HASS_URL=http://10.1.1.13:8123
HASS_TOKEN=
# Recognized Aliases: HOME_ASSISTANT_URL, HOME_ASSISTANT_TOKEN

# n8n Orchestrator
N8N_URL=http://127.0.0.1:5678
N8N_API_KEY=
N8N_MCP_TOKEN=

# SearXNG Metasearch
SEARXNG_URL=http://127.0.0.1:8080

# PostgreSQL + pgvector Semantic Memory
PG_URL=postgresql://postgres:postgres@localhost:5432/autognosia
# Recognized Alias: DATABASE_URL

# Local Inference Cluster
INFERENCE_NODE_MAIN=http://10.1.1.10:8080
INFERENCE_NODE_VISION=http://10.1.1.151:1234
INFERENCE_NODE_VLLM=http://10.1.1.151:18020
INFERENCE_API_KEY=

# ElevenLabs Neural Voice
ELEVENLABS_API_KEY=
# Recognized Alias: ELEVEN_LABS_API_KEY
```

### Section 2: Self-Hosted Homelab Applications
```env
# Uptime Kuma Monitoring
UPTIME_KUMA_URL=http://localhost:3001
UPTIME_KUMA_SLUG=default
UPTIME_KUMA_TOKEN=
# Recognized Aliases: UPTIMEKUMA_URL, KUMA_URL, UPTIMEKUMA_SLUG

# God's Eye View (3D Geospatial Intelligence)
GODS_EYE_URL=http://localhost:5173
GODS_EYE_API_KEY=
# Recognized Alias: GODSEYE_URL

# DeerFlow Research Engine
DEERFLOW_URL=http://localhost:8000
DEERFLOW_API_KEY=

# Vane (Perplexica) Search
VANE_URL=http://localhost:3000
VANE_API_KEY=
# Recognized Aliases: PERPLEXICA_URL, PERPLEXICA_API_KEY

# Open WebUI
OPENWEBUI_URL=http://localhost:3000
OPENWEBUI_API_KEY=

# Audiobookshelf
AUDIOBOOKSHELF_URL=http://localhost:13378
AUDIOBOOKSHELF_TOKEN=
# Recognized Alias: AUDIOBOOKSHELF_API_KEY

# Booklore (Calibre-Web)
BOOKLORE_URL=http://localhost:8080
BOOKLORE_API_KEY=
# Recognized Alias: CALIBRE_WEB_URL, CALIBRE_WEB_API_KEY

# Immich Photos & Videos
IMMICH_URL=http://localhost:2283
IMMICH_API_KEY=
# Recognized Alias: IMMICH_KEY

# Nextcloud Cloud Suite
NEXTCLOUD_URL=http://localhost:8080
NEXTCLOUD_USER=admin
NEXTCLOUD_TOKEN=
# Recognized Alias: NEXTCLOUD_APP_PASSWORD

# Seer (Overseerr / Jellyseerr)
SEER_URL=http://localhost:5055
SEER_API_KEY=
# Recognized Aliases: OVERSEERR_URL, JELLYSEERR_URL, SEER_API_KEY

# FreshRSS Aggregator
FRESHRSS_URL=http://localhost:8080
FRESHRSS_USER=admin
FRESHRSS_API_KEY=
```

### Section 3: Financial Market Data APIs
```env
ALPHAVANTAGE_API_KEY=
MASSIVE_API_KEY=
MASSIVE_API_URL=https://api.massive.com/v1
FINNHUB_API_KEY=
FMP_API_KEY=
TWELVEDATA_API_KEY=
FRED_API_KEY=
```

---

## 4. How Hermes Completes `.env` Programmatically

1. **Read existing `.env`**:
   Parse `c:\Coding\Autognosia\.env` using `integrations_backend.parse_env_file()`.
2. **Scan local system**:
   Execute `python dashboard/scripts/auto_discover_env.py` to identify running services and ports.
3. **Inspect Hermes credentials**:
   Check `~/.hermes/auth.json` or `~/.hermes/.env` for API keys (e.g. OpenAI, Anthropic, OpenRouter, ElevenLabs).
4. **Save updates non-destructively**:
   Call `integrations_backend.sync_env_file()` to write values while preserving all existing comments and structure.
5. **Verify**:
   Call `/api/system/test-connection?provider=<name>` to verify connectivity.
