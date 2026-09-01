Coder profile: ~/.hermes/profiles/coder — wired to LMStudio (qwen/qwen3.6-35b-a3b). SOUL.md enforces pragmatic, direct engineering style. Use for coding tasks, code review, and architecture work. Gets fresh context on delegation (no main session bleed). Distinct from openclaw-agent-coder (OpenClaw ecosystem).
§
User expects agents to be decision layers that call existing workflow/services, not reimplement workflow logic. Agents should make exactly one decision: which tool/service to call with what parameters, while the tool/service contains all the actual workflow logic. If claimed completion is challenged, switch from broad extraction to per-file verification.
§
User prefers using IP addresses directly for internal services (e.g., FreshRSS at 10.1.1.10) rather than configuring DNS or /etc/hosts entries. Agents should adapt scripts to use direct IPs with appropriate Host headers where required by the service.
§
Honcho Docker stack operational: honcho_db (pgvector:5433), honcho_server (FastAPI:8000), honcho_deriver (Gemini). Coexists with default-postgres-1 (TimescaleDB:5432/bridge) and litellm-postgres (PG15:5432/lightllm_litellm-network) on separate networks. Schema migrated via alembic. Hermes provider set to honcho. Cross-session recall verified.
§
User wants cron jobs to use the same model as the main Hermes agent (configured in config.yaml), not a separate fallback chain. Main agent default is nvidia/nemotron-3-ultra-550b-a55b:free via openrouter with Nous base URL.
§
Disk cleanup plan pending sudo: remove disabled snap revisions (~3-4 GB), Docker build cache pruned (768 MB done), journal vacuum to 200 MB (needs sudo), apt clean (needs sudo). Kept: Docker images, Hermes (9.2 GB), snap user data.
§
llama.cpp server running at http://10.1.1.10:8080/v1 with Qwen3.6-35B-A3B-Q4_K_M.gguf (256K context, works well with tool calling). Configured as providers.llamaCPP in config.yaml.
§
When making config changes that require a service restart, user expects agent to handle the full lifecycle — make the change, restart the service, and verify — not just make the change and tell the user to restart manually.