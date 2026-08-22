---
name: newsletter-builder-troubleshooting
description: Systematic approach to troubleshooting the Hermes newsletter builder script when it encounters issues like timeouts, failures, or empty outputs.
category: devops
---

# Newsletter Builder Troubleshooting Skill

## Overview
This skill provides a systematic approach to troubleshooting the Hermes newsletter builder script when it encounters issues like timeouts, failures, or empty outputs.

## When to Use
- The newsletter builder script times out or hangs
- The script produces no output or empty newsletters
- You need to verify the script is working correctly after configuration changes
- The cron job for newsletter delivery is failing

## Prerequisites
- Access to the Hermes environment (`${HOME}/.hermes/`)
- Basic understanding of the newsletter builder script location and purpose
- Required API keys in `${HOME}/.hermes/.env` (FRESHRSS credentials, OPENROUTER_API_KEY, JINA_API_KEY)

## Step-by-Step Troubleshooting Procedure

### 0. Check Infrastructure Docs First

Before changing any hardcoded address (IP, URL, port) in the newsletter builder script, verify the correct values against the `freshrss-integration` skill's reference files and your memory. The reference files are the authoritative source — scripts can fall out of sync with infrastructure changes.

Quick connectivity test:
```bash
curl -sk -o /dev/null -w "%{http_code}" "https://10.1.1.10/" \
  -H "Host: freshrss.wineandgecko.com" --max-time 10
```

### 1. Initial Script Test with Minimal Parameters
Start with the smallest possible workload to verify basic functionality:

```bash
MAX_ARTICLES=5 LOOKBACK_HOURS=1 ${HOME}/.hermes/newsletter_venv/bin/python3 ${HOME}/.hermes/scripts/newsletter_builder.py
```

**Expected Outcome**: Should complete within 30 seconds and show processing of articles.

### 2. Verify Environment and API Connectivity

#### Check Environment Variables
```bash
source ${HOME}/.hermes/.env
echo "FRESHRSS_URL: $FRESHRSS_URL"
echo "FRESHRSS_USERNAME: $FRESHRSS_USERNAME"
echo "FRESHRSS_API_PASSWORD set: [${#FRESHRSS_API_PASSWORD} chars]"
echo "OPENROUTER_API_KEY set: [${#OPENROUTER_API_KEY} chars]"
echo "JINA_API_KEY set: [${#JINA_API_KEY} chars]"
```

#### Test FreshRSS Authentication
```bash
curl -X POST "$FRESHRSS_URL/api/greader.php/accounts/ClientLogin" \
  -d "Email=$FRESHRSS_USERNAME" \
  -d "Passwd=$FRESHRSS_API_PASSWORD" \
  -d "service=reader" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --max-time 30
```

**Success Indicator**: HTTP 200 response containing `Auth=` line in the response body.

### 3. Check for Cached Results
Look for output lines like:
```
[1/3] Article Title
  → Cached (flaresolverr)
```
This indicates the script is working but finding previously processed articles.

### 4. Examine Script Output and Errors

#### Normal Progress Indicators:
- `Fetching unread articles from: user/-/state/com.google/reading-list`
- `Processing X articles (mode: fresh)`
- `[N/X] Article Title` progress markers
- `→ Waterfall result: [source] (Y words)` showing extraction method

#### Error Patterns to Watch For:
- `ERROR: Missing required environment variables` — Check .env file
- `ERROR: FreshRSS auth failed` — Verify credentials
- `Installing [package]...` — First-time dependency installation (normal)
- `LLM error:` or `LLM request failed:` — OpenRouter API issues
- Timeout messages — Reduce MAX_ARTICLES or LOOKBACK_HOURS

### 5. Gradually Increase Scope
```bash
MAX_ARTICLES=10 LOOKBACK_HOURS=6 ${HOME}/.hermes/newsletter_venv/bin/python3 ${HOME}/.hermes/scripts/newsletter_builder.py
MAX_ARTICLES=25 LOOKBACK_HOURS=12 ...
MAX_ARTICLES=25 LOOKBACK_HOURS=24 ...
```

### 6. Common Issues and Solutions

#### Issue: Newsletter Shows Old/Stale Articles (82+ days old)
**Symptoms**: Newsletter output contains articles from weeks or months ago instead of today's news.

**Root Cause**: The FreshRSS API returns articles **oldest first** by default. If the `"r": "n"` (newest first) parameter is missing from the `/reader/api/0/stream/contents/*` request, the first 200 items returned will be the oldest unread articles in the system.

**Fix**: In `${HOME}/.hermes/scripts/newsletter_builder.py`, ensure the fetch call includes `"r": "n"`:
```python
params={
    "n": max_articles * 4,
    "output": "json",
    "r": "n",  # CRITICAL: newest first
}
```

#### Issue: Earnings Calls / Finance Articles in Science Section
**Symptoms**: KB Home earnings calls, fund commentaries, and SEC filings appear in the Science or AI & Tech sections with nonsensical summaries.

**Root Cause**: Content extraction (trafilatura) sometimes returns only the "Conference Call Participants" section from SeekingAlpha. This text contains "Research Division" (matches "research" keyword) and brokerage names like "Evercore" (contains "ev"), inflating the science score. The old binary `any()` matching had no threshold to filter these out.

**Fix**: Two-pronged approach:
1. **Finance exclusion FIRST**: Detect earnings calls via title regex (`\(KBH\)\s*Q[1-4]`) and finance keywords BEFORE scoring. Exclude from all topic sections.
2. **Score thresholds**: Use `sum()` with threshold >= 2 instead of `any()` to avoid single-keyword false positives.

See `freshrss-integration` skill's `references/newsletter-builder-categorization.md` for the full categorization pattern.

#### Issue: LLM Hallucinates Section Content
**Symptoms**: A section mentions articles that don't exist in the filtered pool (e.g., "Gaming Monitor Deals" in AI & Tech when no gaming article was fetched).

**Root Cause**: When a topic section has only 1-2 articles, the LLM generates plausible-sounding filler content to pad the summary.

**Fix**: Set a minimum article count per section (3+). If below threshold, omit the section or merge into "World". Alternatively, use bullet-point summaries instead of narrative paragraphs.

#### Issue: OpenRouter Key Exhausted (403 "Key limit exceeded")
**Symptoms**: Script shows `Summarization failed: Error code: 403 - {'error': {'message': 'Key limit exceeded...', 'code': 403}}`. Newsletter still generates but with raw text.

**Diagnosis**:
```bash
source ${HOME}/.hermes/.env
curl -s https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  | python3 -m json.tool | grep -E '"limit"|"limit_remaining"|"usage"'
```

**Fix**: OpenRouter default keys have a $10 total credit limit. When exhausted, the script falls back to extracted-article text truncation. To restore LLM summaries, either (a) top up the OpenRouter key, or (b) change `model.default` in `${HOME}/.hermes/config.yaml` to a free model — the script reads the default model at runtime via `_get_default_model()`, so it follows the config automatically. **Do NOT re-hardcode a model string in the Python** (the old `model="openai/gpt-4o-mini"` line is gone).

#### Model & Provider Routing (current design)
`newsletter_builder.py` and `newsletter_builder_v2.py` no longer hardcode a model. `summarize_content()` calls `_get_default_model(openrouter_key)`, which reads `model.default` / `model.provider` from `${HOME}/.hermes/config.yaml` and routes through `https://openrouter.ai/api/v1` with `OPENROUTER_API_KEY`.

**Why OpenRouter, not Nous:** the agent itself authenticates to Nous via OAuth (no key needed), but a **standalone OpenAI-SDK script cannot perform OAuth**. So it must use the OpenRouter key with the configured model *name* (e.g. `tencent/hy3:free`, available on OpenRouter). Do NOT point these scripts at the Nous base URL or a `NOUS_API_KEY` — that fails auth.

#### Pitfall: Cron job model pin bypasses fallback-avoidance rules
A cron job's `model`/`provider` field overrides the Hermes default. If the newsletter (or any cron) fails with rate-limit errors, check the pin:
```bash
# via cronjob tool: list → inspect each job's "model" / "provider" fields
```
A pinned value like `nvidia/nemotron-3-ultra-550b-a55b:free` hits a **32-worker limit** on OpenRouter's free tier and will rate-limit the job — even though the user's documented fallback chain explicitly avoids Nemotron free. **Fix:** re-pin to the configured default:
```bash
# cronjob action=update, job_id=<id>, model={"model":"tencent/hy3:free","provider":"nous"}
```
The script then uses `hy3:free` via OpenRouter. A `429` (free-tier throttle) is transient and self-heals on the next run; the script's fallback still produces a complete newsletter.

#### Issue: FreshRSS Auth Fails with "Not Found"
**Symptoms**: `Authentication failed: {"detail":"Not Found"}` — the IP direct connection fails.

**Diagnosis**: The script has a hardcoded `freshrss_ip` in `get_freshrss_config()`. Check if FreshRSS moved servers. Current correct IP is `10.1.1.10` (local server). Verify directly:
```bash
curl -sk -X POST "https://10.1.1.10/api/greader.php/accounts/ClientLogin" \
  -d "Email=josh434&Passwd=<pass>&service=reader" \
  -H "Host: freshrss.wineandgecko.com"
```
A valid response starts with `SID=...` and contains `Auth=...`. `{"detail":"Not Found"}` means the IP is wrong or Traefik isn't routing the subdomain.

#### Issue: OpenRouter/LLM Summarization Fails (non-key errors)
**Solution**: Verify OPENROUTER_API_KEY is valid and has credits. Check format in .env (no quotes). Test OpenRouter connectivity. The script falls back to raw text truncation if LLM fails.

#### Issue: Dependency Installation Problems
**Solution**: The script auto-installs missing packages. If that fails: `pip3 install feedparser trafilatura beautifulsoup4 -q`. Ensure internet access.

### 7. Verifying Successful Output
A successful run produces:
1. **Header**: Date, article count breakdown (`Articles: X | Summarized: Y | Cached: Z | Fallback: W`)
2. **Article Entries**: Numbered list with title/URL, source tag (`[RSS_CONTENT]`, `[FLARESOLVERR]`, `[JINA_READER]`), 2-3 paragraph summaries
3. **Statistics**: Content source breakdown

### 8. Cron Job Checks
```bash
journalctl --user -u cron --since "1 hour ago"   # Check cron logs
```
Cron command should be: `MAX_ARTICLES=25 LOOKBACK_HOURS=24 ${HOME}/.hermes/newsletter_venv/bin/python3 ${HOME}/.hermes/scripts/newsletter_builder.py`

**Cron model-pin audit** — if delivery fails with rate-limit errors, the job's `model` field may be hardcoded to a rate-limited free model (e.g. `nvidia/nemotron-3-ultra-550b-a55b:free`, 32-worker limit) that bypasses the user's documented fallback-avoidance rules. Verify and re-pin to the Hermes default (see "Pitfall: Cron job model pin bypasses fallback-avoidance rules" above).

### 9. Performance Optimization
- Cache in `${HOME}/.hermes/newsletter_cache.db` auto-expires
- Jina API key helps with blocked domains but has rate limits
- Adjust FETCH_TIMEOUT / READ_TIMEOUT constants in the script for slow networks

## Verification Steps
1. Run with normal params: `MAX_ARTICLES=25 LOOKBACK_HOURS=24`
2. Confirm output has actual article summaries (not just cached notes)
3. Check timestamp is current
4. Script should complete in < 2 minutes for 25 articles

## Recovery from Failed States
```bash
ps aux | grep newsletter_builder
pkill -f newsletter_builder.py
sqlite3 ${HOME}/.hermes/newsletter_cache.db "DELETE FROM article_cache WHERE expires_at < $(date +%s);"
```

## Related Skills
- `freshrss-integration`: For deeper FreshRSS API troubleshooting
- `rss-content-waterfall`: Content extraction fallback chain
- `webhook-subscriptions`: Webhook-based triggering instead of cron

## Troubleshooting Decision Tree
```
Start → Run MINIMAL (5 articles, 1 hour)
        │
        ├─ Success → Increase to normal params
        │
        ├─ Failure → Check env vars
        │              │
        │              ├─ Missing → Fix .env
        │              │
        │              └─ Present → Test FreshRSS auth
        │                      │
        │                      ├─ "Not Found" → Wrong IP/Traefik routing → Check step 0
        │                      │
        │                      ├─ Auth fails → Wrong password
        │                      │
        │                      └─ Auth succeeds → Check script output
        │                              │
        │                              ├─ 403 → OpenRouter key exhausted → Top up key OR change model.default in config.yaml (see 403 fix above)
        │                              │
        │                              ├─ Timeout → Reduce scope
        │                              │
        │                              └─ LLM errors → Check API key/quota
        │
        └─ Still failing → Check stderr for specifics
```

## References
See `references/newsletter-pipeline-state.md` for the last verified working state of the entire pipeline.
