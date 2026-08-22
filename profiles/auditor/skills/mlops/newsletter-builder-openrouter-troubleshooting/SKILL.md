---
name: newsletter-builder-openrouter-troubleshooting
description: Guide for diagnosing and resolving OpenRouter API issues in the FreshRSS newsletter builder
category: mlops
---

# Newsletter Builder OpenRouter API Troubleshooting

## Problem
The FreshRSS newsletter builder script fails during the summarization step with an error indicating that the OpenRouter API response does not have the expected structure (specifically, lacking a 'choices' attribute).

## Context
This issue occurred while running the scheduled newsletter builder:
```
MAX_ARTICLES=25 LOOKBACK_HOURS=24 ${HOME}/.hermes/newsletter_venv/bin/python3 ${HOME}/.hermes/scripts/newsletter_builder.py
```

The script successfully:
- Authenticated with FreshRSS via IP direct connection
- Fetched 25 non-sports articles from the last 24 hours
- Extracted content using the waterfall method (FreshRSS → direct fetch → Jina → summary fallback)
- Failed during the OpenRouter summarization phase

## Root Cause Analysis
Through diagnostic testing, it was determined that:
1. FreshRSS integration components were functioning correctly
2. Content extraction was working via multiple methods
3. The OpenRouter API key was present and valid in the environment
4. However, the OpenRouter API endpoint was returning HTML content instead of the expected JSON response
5. This caused the summarization function to receive a string (HTML) rather than an OpenAI response object
6. When the code attempted to access `response.choices[0].message.content`, it failed because strings don't have a 'choices' attribute

## Diagnostic Approach Used
1. **Component isolation**: Verified each stage of the pipeline worked independently
2. **Direct API testing**: Made direct calls to the OpenRouter API to observe the actual response format
3. **Response inspection**: Examined the type and content of what was being returned
4. **Environment validation**: Confirmed API key presence and configuration
5. **Script tracing**: Added debug output to identify exactly where the failure occurred

## Solution Framework
When encountering similar API response structure issues:

### Immediate Verification Steps
1. Confirm the LLM service endpoint is correct
2. Validate that API requests are reaching the intended service (not being intercepted)
3. Check that the response format matches what the client library expects
4. Verify authentication is being processed correctly by the target service

### Investigation Techniques
- Make minimal test requests to isolate the issue
- Compare working and non-working request/response pairs
- Check for middleware, proxies, or security devices that might alter responses
- Validate TLS/SSL certificate handling if applicable
- Review service status pages for known issues

### Mitigation Strategies
1. **Fallback utilization**: The newsletter builder already includes graceful degradation to text truncation when summarization fails
2. **Response validation**: Add type checking before accessing API response attributes
3. **Alternative providers**: Consider configuring the system to use other available LLM providers if one consistently fails
4. **Request formatting**: Ensure headers and payload match API expectations exactly

## Key Findings from This Incident
- The newsletter builder's modular design allowed successful completion despite the summarization failure
- Content extraction via multiple fallback methods (FreshRSS → direct fetch → Jina → summary) proved resilient
- The IP direct connection method for FreshRSS worked correctly in this environment
- Article filtering (excluding sports) functioned as intended
- The failure was isolated to a single integration point (OpenRouter summarization)

## Preventive Measures for Similar Issues
1. **Response contract testing**: Validate that external APIs return expected schemas
2. **Fallback chain verification**: Regularly test that degradation paths work correctly
3. **Component-level monitoring**: Instrument individual pipeline stages for faster fault isolation
4. **Service health checks**: Implement lightweight connectivity/response validation before intensive operations

## Related Knowledge
This troubleshooting approach aligns with general API integration diagnostics:
- Verify connectivity and authentication
- Confirm request formation matches API specifications
- Inspect actual responses (not just assumed responses)
- Isolate failure points through systematic component testing
- Leverage built-in fallback mechanisms when primary paths fail

The diagnostic methodology used here—component isolation, direct service testing, and response inspection—is applicable to similar integration issues across the Hermes agent ecosystem.

## Model Pin & Rate-Limit Failures (NEW — 2026-07)

A distinct failure class from the OpenRouter 'choices' HTML issue above: **the model the newsletter runs under is wrong or rate-limited**, causing `error` status on the cron job and silent non-delivery.

### Symptom
- `cronjob action=list` shows the newsletter job with `last_status: "error"` and `model: "nvidia/nemotron-3-ultra-550b-a55b:free"`.
- Root cause is a rate-limit (429 / worker-limit) from the Nemotron free model. **User policy: avoid Nemotron free and Z.ai free** — they hit the 32-worker concurrency limit under frequent cron load.

### Two sources of the wrong model
1. **Cron job model pin** — jobs can be created with a hardcoded `model` (e.g. `nvidia/nemotron-3-ultra-550b-a55b:free`) instead of inheriting the agent default. Audit every job:
   ```bash
   cronjob action=list
   ```
   Any job whose `model` is not your default (`tencent/hy3:free` / `nous`) should be repinned:
   ```bash
   cronjob action=update job_id=<id> model={"model":"tencent/hy3:free","provider":"nous"}
   ```
   The `model` field takes a JSON object `{model, provider}`, NOT a bare string.

2. **Script hardcoded model** — `newsletter_builder.py` / `newsletter_builder_v2.py` both call `client.chat.completions.create(model="openai/gpt-4o-mini", ...)` directly, bypassing the agent default and billing OpenRouter even when a free default exists. Fix: read the default model + provider from `${HOME}/.hermes/config.yaml` at runtime and route accordingly (Nous base URL when provider is `nous`). See `references/newsletter_model_runtime.md` for the drop-in `_get_default_model()` helper.

### Prevention
- After creating any cron job, run `cronjob action=list` and confirm every `model`/`provider` matches the default.
- Prefer leaving cron `model`/`provider` unset (or `auto`/`auto`) so jobs inherit the agent default — only pin when a specific model is required.
- Keep the newsletter script model-agnostic by reading config (see references file) so changing your default model propagates automatically.

**References:** `references/newsletter_model_runtime.md` — drop-in runtime default-model resolver for the newsletter scripts.