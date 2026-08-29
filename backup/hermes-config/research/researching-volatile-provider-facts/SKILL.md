---
name: researching-volatile-provider-facts
description: How to research time-sensitive external provider facts — API rate limits (RPM/RPD/TPM), quotas, pricing, model availability, free-vs-paid tier status — where the official published data is dynamic or absent and third-party trackers conflict. Use whenever the user asks "what are the current limits/quotas/prices for provider X" or "which models are free/paid now". Encodes the official-docs-first, conflict-flagging, never-fabricate method.
---

# Researching volatile provider facts

Class-level skill. Trigger when a user wants **current, externally-governed facts that change over time**: API rate limits, RPM/RPD/TPM quotas, pricing, model/version availability, free-tier eligibility, or "paid-only since when" status — for LLM/AI providers (Gemini, OpenAI, OpenRouter, Anthropic, Mistral, etc.), cloud services, or APIs in general.

## Core method

1. **Official docs first.** Pull the provider's OWN docs page (e.g. `ai.google.dev/gemini-api/docs/rate-limits`, `platform.openai.com/docs`, `openrouter.ai/docs`, `docs.anthropic.com`). These are authoritative on *structure* (which dimensions exist, how limits reset) even when they don't publish a static table.

2. **Recognize dynamic limits.** Many providers (Google Gemini especially) **do NOT publish a fixed free-tier RPM/RPD table**. Limits are per-project, per-region, per-model, per-tier, and "actual capacity may vary." The official answer is "view your live limits in the dashboard." Record this honestly instead of hunting for a magic number.

3. **Third-party trackers are dated snapshots, not truth.** Multiple trackers for the same provider at the same date often **conflict** (e.g. Gemini 2.5 Flash RPD cited as 250 vs 1500 in mid-2026). Cross-check 3+ sources, **timestamp them**, and report the disagreement rather than averaging two numbers into a fake-precise figure.

4. **NEVER fabricate a precise table.** If you cannot get a hard number, present **ranges + a confidence column**, and hand the user the verification method (dashboard URL, or API response headers like `x-ratelimit-*`). The agent's job is to reduce uncertainty, not invent certainty.

5. **Separate FACT from SNAPSHOT.**
   - *Firm structural facts* (reliable): which dimensions are enforced (RPM/RPD/TPM/TPD/IPM), RPD reset time (e.g. midnight Pacific), limits are per *project* not per *key*, preview/experimental models get stricter limits, hitting any single dimension throws `429 RESOURCE_EXHAUSTED`.
   - *Per-number values* (estimates, timestamp them): exact RPM/RPD/TPM figures.

6. **State your own access gap.** If you lack the relevant API key (none in `config.yaml` providers block or `.env`), say so explicitly and offer to (a) wire it into the config as a provider, or (b) run a `curl` that reads the real rate-limit headers so the user gets authoritative numbers instead of estimates.

## Verification methods to hand the user
- **Google Gemini:** live per-project limits at `aistudio.google.com/rate-limit`. Any `generateContent` call returns `x-ratelimit-limit-requests`, `x-ratelimit-limit-tokens`, `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens`, and `retry-after` on 429.
- **General pattern:** make a real API call (even a tiny one) and read the response headers — headers are the ground truth, more reliable than any doc.

## Pitfalls
- Do **not** present one third-party blog's number as canonical.
- Do **not** say "the limit is X" when the provider says it's dynamic. Say "reported ~X, sources conflict, verify live."
- **Free tier ≠ free after billing is enabled.** Enabling Cloud Billing on a Gemini project *drops the free tier entirely* — every call becomes billable from the first token. Critical for cost-sensitive users.
- "Pro is paid-only since <date>" facts change; always timestamp and tell the user when to re-verify.
- Don't dump a wall of conflicting raw citations. Synthesize into a table with a confidence column; put raw transcript detail in `references/`.

## References
- `references/gemini-free-tier-2026-07.md` — snapshot of Gemini free-tier status as of July 2026 (model lineup, free vs paid, reported limits with confidence, official verification paths).
