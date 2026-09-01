---
id: hermes-stack-web-and-inference
title: Web and Inference Services (SearXNG, Firecrawl, llama.cpp)
domain: Hermes-Stack
type: research_report
status: current
created: 2026-08-25
updated: 2026-08-25
tags: [metasearch, web-scraping, local-inference, docker, openai-compatible, self-hosting]
sources: [https://docs.searxng.org/, https://github.com/searxng/searxng, https://github.com/searxng/searxng/blob/master/searx/settings.yml, https://docs.firecrawl.dev/, https://github.com/mendableai/firecrawl/blob/main/SELF_HOST.md, https://github.com/firecrawl/firecrawl/releases, https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/server/README.md, https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md, https://github.com/ggml-org/llama.cpp/commit/9e0ecfb697d297355e43c20559d29bcc71beb0c3]
confidence: high
provenance: complete
---

# Web and Inference Services

> **Scope:** Self-hosted web search, web scraping, and local LLM inference services used in the Hermes agent stack.
> **Last updated:** 2026-08-25

This report documents three services that form the ingestion and inference layer of a local AI agent stack:

- **SearXNG** — privacy-respecting metasearch engine for web discovery
- **Firecrawl** — web scraping/crawling API returning clean Markdown
- **llama.cpp server** — OpenAI-compatible local inference server

---

## 1. SearXNG — Privacy-Respecting Metasearch Engine

### 1.1 What it is

SearXNG is a free, open-source metasearch engine that fans out a user query to 70+ search engines simultaneously (Google, DuckDuckGo, Bing, Brave, Wikipedia, etc.), aggregates the results, and strips all tracking. It does not have its own index — it is a privacy-preserving proxy over existing search engines.

**Docker image:** `docker.io/searxng/searxng:latest`

**Why an agent uses it:** No per-query cost, no API keys required for most engines, diverse aggregated results, and a JSON API available once enabled in configuration. Unlike SerpAPI or the Bing Search API, it has no rate-based billing.

### 1.2 Architecture and dependencies

The Docker container runs a Python Flask/FastAPI application backed by a Granian ASGI server. The architecture is a single container with no external dependencies — no Redis, no database, no message broker. All search engine integrations are pure HTTP calls made from the SearXNG process itself.

Key directories in the container:

- `/etc/searxng/` — Configuration files, most importantly `settings.yml`
- `/var/cache/searxng/` — Persistent data (favicon cache, etc.)

### 1.3 API surface used by an agent

The agent interacts with SearXNG through its query API:

| Endpoint | Method | Purpose |
|---|---|---|
| `/search?q=…&format=json&categories=…` | GET | Perform a search; returns JSON with `results` array |

**Key query parameters:**

| Param | Description |
|---|---|
| `q` | Search query string |
| `format` | Set to `json` (requires `search.formats` to include `json` in `settings.yml`) |
| `categories` | `general`, `images`, `videos`, `news`, `science`, `it`, `files`, `social_media`, `map`, `music` |
| `engines` | Comma-separated list of engines to use (e.g., `brave,duckduckgo`) |
| `language` | Language code (e.g., `en`, `en-US`) |
| `time_range` | `day`, `week`, `month`, `year` |

**Response structure:** A JSON object with `results` (array of `{title, url, snippet, engine}`), `unresponsive_engines`, `suggestions`, and pagination metadata.

### 1.4 Configuration that matters for self-hosting

The `settings.yml` is the single configuration file. Essential options for agent use:

```yaml
use_default_settings: true  # Loads all built-in engine configs

server:
  secret_key: "<random>"    # Required; must differ from default
  bind_address: "0.0.0.0"  # Or "[::]" for IPv6
  limiter: false            # Disable rate limiting for local dev

search:
  formats: [html, json, csv, rss]  # JSON must be explicitly enabled

engines:
  - name: google
    disabled: true          # Often disabled to avoid CAPTCHA
  - name: duckduckgo
    disabled: false
  - name: brave
    disabled: false
  - name: wikipedia
    disabled: false         # Useful for factual lookups
```

**Environment variables** override settings via the `SEARXNG_*` prefix (e.g., `SEARXNG_SETTINGS_PATH`). The `GRANIAN_*` variables control the ASGI server.

### 1.5 Known failure modes

- **403 Forbidden on JSON API:** Most common error. The default `settings.yml` only enables `html` output. You must add `json` (and optionally `csv`, `rss`) to `search.formats`.
- **CAPTCHA blocks:** Google, Bing, and some other engines will return CAPTCHAs or blank results when queried from a data-center IP (Docker host). DuckDuckGo and Brave are generally more reliable.
- **Limiter errors:** If `server.limiter` is `true` (default), requests exceeding the rate limit are rejected. Set to `false` for local agent use.
- **Unresponsive engines:** The response includes an `unresponsive_engines` array — agents should check this to detect which engines are failing.
- **Config change requires restart:** Modifying `settings.yml` requires `docker compose restart core` (or `docker restart <container>`). No hot-reload.

---

## 2. Firecrawl — Web Scraping/Crawling API

### 2.1 What it is

Firecrawl is an open-source web scraping and crawling API (AGPL-3.0) that returns clean Markdown or structured JSON from any URL. It handles JavaScript rendering, anti-bot detection, link extraction, and content cleaning — essentially turning the messy web into LLM-ready data.

**Docker image:** `ghcr.io/firecrawl/firecrawl:latest`

**Key distinction:** Firecrawl is **not** a search engine. It takes a known URL and extracts its content. Use SearXNG to *discover* URLs, Firecrawl to *ingest* them.

### 2.2 Architecture and dependencies

Firecrawl is a **multi-service stack**, not a single binary. The Docker Compose file runs 6–7 services:

```
firecrawl-api (TypeScript/Express)
  ├── Playwright service (Chromium, JS rendering)
  ├── NuQ PostgreSQL (job queue with FOR UPDATE SKIP LOCKED)
  ├── RabbitMQ (pg_notify fan-out, webhooks, extract)
  ├── Redis (rate limits, crawl dedup, concurrency semaphores)
  └── FoundationDB (optional queue backend — migration target for nuq)
```

The API server is TypeScript/Express. Content cleaning uses a Rust native module (napi v3). Markdown conversion is done by a Go engine (a fork of html-to-markdown, via cgo/koffi or HTTP service), with a Turndown (JS) fallback.

**Self-hosting caveat:** The cloud-exclusive **Fire-Engine** (anti-bot rendering, managed proxies, IP rotation) is **not available** in the self-hosted image. Self-hosted instances rely on `fetch` + Playwright only. Pages protected by aggressive bot detection may fail or return incomplete content.

### 2.3 API surface used by an agent

Firecrawl has evolved through multiple API versions. Current endpoints (v2):

| Endpoint | Method | Purpose |
|---|---|---|
| `/v2/scrape` | POST | Scrape a single URL; returns Markdown/JSON |
| `/v2/crawl` | POST | Kick off a site crawl; returns job ID |
| `/v2/crawl/:jobId` | GET | Check crawl status |
| `/v2/map` | POST | Discover all URLs on a domain |
| `/v2/search` | POST | Search the web + scrape results |
| `/v2/extract` | POST/GET | Extract structured data (being folded into `/v2/scrape` with JSON format) |

**v1 endpoints** (`/v1/scrape`, `/v1/crawl`) are **deprecated** (as of v2.10) and emit `Deprecation: true` + `Warning: 299` headers. Use v2.

**Key scrape options:** `formats` (`markdown`, `html`, `rawHtml`, `links`, `summary`, JSON with schema), `onlyMainContent`, `waitFor` (ms to wait for JS), `actions` (interact with page), `timeout`, `proxy` (`auto` uses managed proxies — cloud only in self-host).

**Crawl flow:** POST to `/v2/crawl` returns `{ok: true, id: "..."}`. Poll `/v2/crawl/:jobId` for status. Results come as Markdown for each discovered page.

### 2.4 Configuration that matters for self-hosting

Critical `.env` / environment variables:

| Variable | Purpose |
|---|---|
| `USE_DB_AUTHENTICATION=false` | Disables authentication for initial setup; add a full auth design before exposing to untrusted networks |
| `NUQ_BACKEND` | `pg` (default) or `fdb` (FoundationDB); keep `pg` unless operating FoundationDB |
| `MAX_CONCURRENT_PAGES` | Max concurrent Chromium tabs in Playwright (default 5) |
| `BLOCK_MEDIA` | Block images/video/fonts in Playwright (default `true`) — saves RAM |
| `LOGGING_LEVEL` | `debug`, `info`, `warn`, `error` |
| `NUQ_WORKER_COUNT` | Number of queue worker processes |
| `FIRE_ENGINE_BETA_URL` | If set, enables cloud Fire-Engine features (not available self-hosted) |

### 2.5 Known failure modes

- **Redis/RabbitMQ/PostgreSQL stay dead after reboot:** These dependency containers have no guaranteed restart policies in the default Compose. After a host reboot, the API may start but the queue is non-functional until all dependencies are up. **Always configure `restart: unless-stopped`** (or `always`) on dependency services.
- **Fire-Engine is cloud-only:** Self-hosted instances lack advanced anti-bot rendering, managed proxies, and hosted search. Strongly bot-blocked sites will produce poor results.
- **Complex operational load:** 6–7 services with inter-dependencies. The self-orchestrating harness helps, but disk persistence for Postgres/Redis/RabbitMQ is **not defined** in the default Compose. Add volumes before production.
- **Version mismatch across upgrades:** The API, Playwright, and queue schemas must be compatible. Upgrade all images together; pin to specific digests for reproducibility.
- **Three-language build friction:** TypeScript + Rust (napi) + Go (cgo) in one scrape pipeline means three failure points in custom builds.
- **Scraped content is not persisted by Firecrawl:** The API returns content in responses but does not store it. For archival, the client must save responses.

---

## 3. llama.cpp Server — Local OpenAI-Compatible Inference

### 3.1 What it is

`llama-server` is the HTTP server component of llama.cpp — a fast, lightweight, pure C/C++ inference server. It implements the OpenAI Chat Completions API (and Anthropic Messages API) for GGUF models, running entirely locally with no cloud dependency.

In this stack, it serves `Qwen3.6-35B-A3B-Q4_K_M.gguf` with 4 parallel slots, exposing `/v1/models`, `/v1/chat/completions`, `/slots`, and `/health`.

**License:** MIT

### 3.2 Architecture and dependencies

llama.cpp is a single binary (with optional GPU libraries). No external services required.

- **Networking layer:** cpp-httplib (header-only C++ HTTP library)
- **Serialization:** nlohmann::json
- **Inference engine:** llama.cpp (llama.h / libllama) with continuous batching
- **GPU support:** Vulkan, CUDA, Metal, ROCm (via build flags)

### 3.3 The slot model — how `--parallel` works

A **slot** (`server_slot`) is an independent inference context — a per-request execution state that includes its own KV cache, prompt buffer, sampling parameters, and generation state.

**`--parallel N`** (or `-np N`, or env `LLAMA_ARG_N_PARALLEL`) sets the number of concurrent slots. Default `-1` means auto-detect based on model size and available memory.

**Slot states (lifecycle):**

```
IDLE → STARTED → PROCESSING_PROMPT → GENERATING → IDLE
```

- **IDLE:** Slot is available to accept a new request. Its KV cache may be retained (prompt caching).
- **STARTED:** A request has been assigned; prompt is being tokenized.
- **PROCESSING_PROMPT:** The prompt tokens are being processed through the model (prompt evaluation).
- **GENERATING:** Token-by-token generation is in progress (SSE stream).
- **IDLE (again):** Generation complete; slot is available for a new request.

**`--kv-unified`** (`-kvu`) uses a single unified KV buffer shared across all sequences instead of per-slot buffers. This saves memory but reduces per-slot context isolation. When enabled, the default `--parallel` becomes auto.

**`--cache-idle-slots`** saves idle slot KV caches to RAM instead of freeing them, enabling faster resumption. Requires `--cache-ram`.

### 3.4 API surface used by an agent

| Endpoint | Method | Purpose |
|---|---|---|
| `/v1/chat/completions` | POST | Primary inference endpoint; OpenAI-compatible JSON body + optional SSE streaming |
| `/v1/models` | GET | List available models |
| `/v1/completions` | POST | Legacy completion endpoint |
| `/v1/embeddings` | POST | Embedding generation |
| `/health` | GET | Health check; returns `server_state` (READY, LOADING, etc.) |
| `/slots` | GET | Per-slot status and metrics (intended for debugging) |
| `/props` | GET | Model metadata and server configuration; includes `sleeping` status |
| `/metrics` | GET | Prometheus-compatible metrics (requires `--metrics`) |

**`/v1/chat/completions` request body:** Standard OpenAI format with `model`, `messages` (ChatML format), `stream` (boolean), `temperature`, `top_p`, `tools` (function calling), `max_tokens`, etc.

**`/slots` response:** JSON array of slot objects. Each slot includes:
- `id` — slot identifier
- `is_processing` — **boolean** (true if the slot is actively processing/generating; false if idle). Replaces the deprecated `state` field (PR #10162).
- `id_task` — internal task ID
- `prompt` — detokenized prompt text
- `next_token` — object with `has_next_token`, `has_new_line`, `n_remain`
- Sampling parameters, grammar, stop words, etc.
- **Security warning:** The documentation states this endpoint is **intended for debugging and may be modified in future versions**. For security, it should not be enabled in production environments (`--slots` enables it; it is disabled by default in recent versions).

**`?fail_on_no_slot=1`** query param on `/slots` returns HTTP 503 if no slots are available — useful as a readiness check.

**`/health`** returns `server_state` (e.g., `READY`, `LOADING`). When the server is loading a model, it returns 503 on all endpoints (except health, props, models, metrics which use cached responses).

### 3.5 Why a saturated slot pool causes client timeouts and retry storms

This is the critical operational pitfall for llama.cpp in an agent context:

1. **Finite slot pool:** If you have `--parallel 4` (4 slots) and all 4 are processing, a 5th incoming `/v1/chat/completions` request has two possible behaviors:
   - **Queuing/deferring:** The server accepts the request but queues it behind the currently processing slots. The client's SSE stream or HTTP response waits in the queue.
   - **Connection timeout:** If the client has a shorter timeout (e.g., 30 seconds) than the queue wait time (which depends on model size, context length, and output tokens), the client times out and retries.

2. **Retry storms:** When an agent framework (like the Hermes tool-calling loop) times out and retries the same request, it creates additional requests that queue behind the already-saturated slots. This compounds the queue length exponentially.

3. **`requests_deferred` metric:** Prometheus metric `llamacpp:requests_deferred` tracks queued requests. If this climbs, slots are saturated.

4. **Mitigation strategies:**
   - **Increase `--parallel`** to match expected concurrent tool calls (the agent currently uses 4, which may be insufficient during heavy multi-tool invocation).
   - **Use `id_slot` parameter** to pin requests to specific idle slots and avoid contention.
   - **Set client timeouts** longer than the expected worst-case generation time.
   - **Check `/slots` or `llamacpp:requests_deferred`** before sending new requests.
   - **`--sleep-idle-seconds`** (newer feature): The server can sleep after inactivity, unloading the model to save RAM. New requests trigger reload, which adds latency. Consider disabling if you have consistent load.

### 3.6 Configuration that matters for self-hosting

| Parameter | Purpose |
|---|---|
| `--model` | Path to GGUF model file |
| `--parallel` | Number of concurrent inference slots |
| `--threads` | CPU threads for generation |
| `--ctx-size` | Context window size (tokens) |
| `--n-gpu-layers` | Number of layers to offload to GPU |
| `--batch-size` / `--ubatch-size` | Logical/physical batch size |
| `--temp` | Default temperature |
| `--seed` | RNG seed for reproducibility |
| `--prompt-template` | Chat template (e.g., `chatml`, `llama3`, `qwen2.5`) |
| `--log-disable` / `--log-file` | Logging control |
| `--load-mode` | `auto`, `mmap`, `mlock`, `dio` |
| `--kv-unified` | Shared KV buffer across slots (saves memory) |
| `--cache-ram` / `--cache-idle-slots` | Prompt caching in RAM |

### 3.7 Known failure modes

- **Model load failure exits with code 1:** If the model file path is wrong or the GGUF is corrupt, the server exits entirely rather than returning an error.
- **KV cache OOM:** If `--ctx-size` or `--parallel` are set too high for available RAM/VRAM, the server may crash or fail to serve requests. The `--fit` option attempts auto-adjustment.
- **Slot exhaustion → 503:** When all slots are busy and the queue is full, new requests get HTTP 503. With `?fail_on_no_slot=1` on `/slots`, you can probe this proactively.
- **No built-in authentication:** Unlike the OpenAI API, there is no API key support. For network-exposed servers, a reverse proxy with auth is required.
- **Router mode complexity:** Multi-model router mode (`--router`) adds complexity with model selection and per-model routing. Not needed for single-model setups.

---

## 4. Comparison and Integration

### 4.1 How the three services fit together

```
Agent tool call ──► SearXNG ──► [discovered URLs] ──► Firecrawl ──► [Markdown content]
                                                              │
Agent tool call ──► llama.cpp /v1/chat/completions ──► [structured response / tool calls]
```

- **SearXNG** → Firecrawl: SearXNG results provide URLs; Firecrawl scrapes them to Markdown for the agent's context window.
- **SearXNG** → llama.cpp: SearXNG results are passed as context for the LLM to reason about.
- **Firecrawl** → llama.cpp: Scraped content is fed to the LLM as context for answering.
- **llama.cpp** → SearXNG/Firecrawl: The LLM decides *what* to search for and *which* URLs to scrape, forming a retrieval loop.

### 4.2 Operational comparison

| Dimension | SearXNG | Firecrawl | llama.cpp server |
|---|---|---|---|
| **Complexity** | Low (single container) | High (6–7 services) | Low (single binary) |
| **Dependencies** | None | Redis, RabbitMQ, Postgres, Playwright, (optional) FoundationDB | None (optional GPU libs) |
| **API style** | Simple GET | POST-heavy, async job pattern | OpenAI-compatible |
| **Auth** | None (local) | `USE_DB_AUTHENTICATION` (self-host optional) | None (needs reverse proxy) |
| **Persistence** | favicon cache | Queue state (if volumes configured) | None |
| **Resource use** | ~100 MB RAM | ~2–4 GB RAM (full stack) | Model size × quantization factor (Q4_K_M ~35B ≈ 20 GB VRAM) |
| **Scalability** | Single instance | API is stateless; horizontal scale API, not deps | Per-slot parallelism; no horizontal scaling |

### 4.3 Shared operational pitfalls

1. **Container restart policies:** SearXNG and llama.cpp are single-container services, but Firecrawl's dependencies (Redis, RabbitMQ, Postgres) need explicit `restart: unless-stopped` in Compose. A host reboot without restart policies will leave Firecrawl in a partially-broken state.

2. **Health checks:** llama.cpp's `/health` returns `LOADING` while the model is loading (a few seconds). Firecrawl's API health check must account for the full dependency stack booting. SearXNG has no startup delay beyond container start.

3. **No built-in auth:** None of the three services has production-ready authentication. All should sit behind a reverse proxy (Nginx, Caddy) when exposed beyond the agent's internal network.

4. **Log rotation:** llama.cpp logs to stdout by default; Firecrawl logs to the Node.js process. In Docker, configure log rotation to avoid disk exhaustion during long crawl jobs.

5. **Version pinning:** Firecrawl's API surface changes between major versions (v0 → v1 → v2). Pin to specific image digests (`ghcr.io/firecrawl/firecrawl@sha256:...`) to avoid breaking changes. SearXNG's Docker image version is more stable but still check for breaking config changes. llama.cpp's CLI flags evolve — pin the release tag.

---

## Related

[[Honcho]], [[GBrain]], [[Graphify]]
