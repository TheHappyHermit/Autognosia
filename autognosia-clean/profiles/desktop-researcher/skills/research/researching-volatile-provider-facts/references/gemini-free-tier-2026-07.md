# Gemini API free tier — status snapshot (July 2026)

Condensed from Google official docs (ai.google.dev/gemini-api) + 3rd-party trackers.
Sources conflict on exact RPD per model — treat numbers as ESTIMATES, verify live.

## Source reliability
- Google official rate-limits page (last updated 2026-07-03): does NOT publish a fixed free-tier RPM/RPD table. States limits "vary depending on the specific model" and "actual capacity may vary"; read them live per-project in AI Studio.
- 3rd-party trackers (aifreeapi.com, pecollective.com, aipricing.guru, laozhang.ai, discuss.ai.google.dev) consistently CONFLICT on RPD for the same model (e.g. 2.5 Flash: 250 vs 1500). Trust official + live headers, not blog numbers.

## Free vs paid (as of 2026-07)
- PRO MODELS = PAID ONLY since 2026-04-01. Gemini 3.1 Pro, 3 Pro, 2.5 Pro are NOT on free tier.
- FREE TIER = Flash family only: Gemini 3.x Flash, 3.x Flash-Lite, 2.5 Flash, 2.5 Flash-Lite.

## Reported free-tier limits (ESTIMATES — timestamp mid-2026, verify live)
| Model | RPM | TPM | RPD | Confidence |
|---|---|---|---|---|
| Gemini 3 Flash (current free default) | ~10 | 250,000 | ~1,500 | Medium |
| Gemini 3.5 / 3.x Flash-Lite | ~10-15 | 250,000 | ~1,000-1,500 | Low-Medium |
| Gemini 2.5 Flash | ~10 | 250,000 | 250-1,500 (CONFLICT) | Low |
| Gemini 2.5 Flash-Lite | ~15 | 250,000 | 1,000-1,500 | Low-Medium |
| Gemini 2.5 Pro | — | — | — | Paid only since 2026-04-01 |

Note: RPD reset = midnight Pacific. Limits per Google Cloud PROJECT (not per API key).

## Firm structural facts (reliable, from Google docs)
- Three+ enforced dimensions: RPM, RPD, TPM. Some models add TPD (tokens/day) or IPM (images/min). Hit ANY one → 429 RESOURCE_EXHAUSTED.
- RPD resets midnight Pacific.
- Limits are per PROJECT, not per KEY. More keys ≠ more quota.
- Preview/experimental models: stricter limits than stable.
- Spend-based caps (rolling 10 min): Free = N/A; Tier 1 = $10; Tier 2/3 = $200.
- 1M-token context free, but you'll usually hit TPM (250k) first.
- Enabling Cloud Billing on a project DROPS the free tier entirely — all calls billable from first token.

## Model lineup (official models page, updated 2026-07-09)
Current: Gemini 3 family (Stable + Preview), Gemini 2.5 Flash, 2.5 Flash-Lite, 2.5 Pro.
Gemini 3.5 Flash launched 2026-05-19 (Google I/O) at $1.50/$9 per 1M tokens.
Gemini 2.0 Flash shut down 2026-06-01.
Gemini 3.1 Pro GA with 2M context window.

## Verification (authoritative, not estimates)
- Live per-project: aistudio.google.com/rate-limit
- API headers on any generateContent call:
  x-ratelimit-limit-requests, x-ratelimit-limit-tokens,
  x-ratelimit-remaining-requests, x-ratelimit-remaining-tokens,
  retry-after (on 429)
