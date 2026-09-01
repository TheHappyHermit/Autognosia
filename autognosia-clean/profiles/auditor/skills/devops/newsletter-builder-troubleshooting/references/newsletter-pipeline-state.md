# Newsletter Pipeline — Verified Working State

*Last verified: 2026-06-09*

## Server
- FreshRSS: 10.1.1.10:443, Host header: freshrss.wineandgecko.com
- Self-signed TLS (Traefik default cert), verify=False
- DNS is NXDOMAIN on public internet, resolved via IP direct
- Root page returns blank (normal), API endpoints work

## Auth
- gReader ClientLogin at /api/greader.php/accounts/ClientLogin
- Returns Auth=josh434/<token> on success
- Token lasts ~2 hours

## Script
- Path: ~/.hermes/scripts/newsletter_builder.py
- Venv: ~/.hermes/newsletter_venv/
- Uses IP direct with Host header (no /etc/hosts needed)
- Cache: ~/.hermes/newsletter_cache.db (SQLite, auto-expiring)
- Default params: MAX_ARTICLES=50, LOOKBACK_HOURS=24
- Completion time: ~90 seconds for 50 articles
- Output: ~3500 chars, 2 sections (AI/Tech + Global Affairs)

## Summarization
- Model: openrouter/owl-alpha (free, works with exhausted key)
- Previously: openai/gpt-4o-mini (hit $10 limit)
- Fallback: raw text truncation if LLM fails
- Key: OPENROUTER_API_KEY in ~/.hermes/.env
- Jina API key available for content extraction fallback

## Cron Jobs
- Morning: 0 6 * * *, job_id eebf16fd600a
- Evening: 0 21 * * *, job_id 2fdcb131de85
- Both deliver to Telegram via Hermes auto-delivery (cron job configured with delivery channel)
- **Note**: TELEGRAM_BOT_TOKEN in ~/.hermes/.env is currently commented out (`# TELEGRAM_BOT_TOKEN=...`). The cron delivery works because Hermes handles the Telegram send via its internal gateway, not via the script's direct bot calls. The token in .env is for the script's standalone use (e.g., manual runs).
- Hermes gateway config: API_SERVER_ENABLED=true, TELEGRAM_WEBHOOK_ENABLED=true