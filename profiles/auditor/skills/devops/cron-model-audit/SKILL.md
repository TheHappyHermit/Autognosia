---
name: cron-model-audit
description: Audit and repin Hermes Agent cron jobs so none hardcode a rate-limited or wrong model; ensure all jobs inherit the agent default model/provider.
category: devops
---

# Cron Model Pin Audit

Cron jobs in Hermes can be created with a hardcoded `model` (and `provider`) that does NOT
inherit the agent's configured default. When that pinned model is a free tier with low
worker/concurrency limits (e.g. `nvidia/nemotron-3-ultra-550b-a55b:free`), the job fails
with rate-limit errors and stops delivering — even though the underlying task (newsletter,
research, etc.) is fine.

This skill covers detecting and fixing that class of failure.

## When to run this
- A cron job shows `last_status: "error"` and you suspect a model/rate-limit cause.
- After creating or importing any cron job — verify its model pin.
- Periodically, as a hygiene check (free models get deprecated/rate-limited).

## Audit loop
1. List all jobs and inspect the `model` / `provider` fields:
   - Via tool: `cronjob action=list`
   - Or CLI: `hermes cron list`
2. Read the agent default:
   ```bash
   grep -nA3 "^model:" ${HOME}/.hermes/config.yaml
   # e.g. default: tencent/hy3:free / provider: nous
   ```
3. For any job whose `model` differs from the default (or is a known-bad free model), repin it.
4. Also check the job's *script* (if it calls an LLM directly) for a hardcoded model string —
   see the `newsletter-builder-openrouter-troubleshooting` skill's model-runtime section
   (`references/newsletter_model_runtime.md`).

## Repin command
The `model` field is a JSON object `{model, provider}`, NOT a bare string:
```bash
cronjob action=update job_id=<id> model={"model":"tencent/hy3:free","provider":"nous"}
```

## Known-bad models (user policy — avoid in free tier)
- `nvidia/nemotron-3-ultra-550b-a55b:free` — 32-worker concurrency limit, rate-limited under frequent cron load.
- `z.ai/*:free` — billing issues.
Prefer inheriting the default, or pin to a model on your fallback chain.

## Prevention
- Leave cron `model`/`provider` unset or `auto`/`auto` unless a specific model is required —
  jobs then inherit the agent default and follow config changes automatically.
- After `hermes config set model.default ...`, no per-job edit is needed if jobs are unpinned.

## References
- `references/cron_model_audit.md` — full `cronjob list` field reference and repin examples.
- Related: `newsletter-builder-openrouter-troubleshooting` (script-side hardcoded model fix).
