# Reasoning Model Stalling in Cron Jobs

**Observed:** 2026-08-07
**Context:** WealthForge Research Cron (`082b13bf66ea`) running every 10 min with `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter

## Symptoms

- Cron executes on schedule
- Output: `⚠️ The model produced only internal reasoning and no final answer, despite retries.`
- 1 of 13 runs today completed successfully (21:45)
- 12 runs stalled in reasoning phase — no final answer, no research file written

## Root Cause

Nemotron 3 Ultra is a **reasoning model** that emits extended chain-of-thought before the final answer. In a cron context:
- Single-shot prompt, no interactive turns
- No opportunity to "continue" after reasoning
- May hit token budget or internal cutoff during reasoning
- Returns only the reasoning trace, never the final answer

## Mitigation Strategies (Priority Order)

### 1. Add Explicit Output Constraint to Cron Prompt

```text
CRITICAL: You MUST produce a final answer in the format specified below. Do not output only reasoning. If you find yourself reasoning extensively, stop and emit the final research report immediately.

FINAL ANSWER FORMAT:
## Research Complete: `<topic-id>` — <Title>
**Output:** `<path>` (<size>)
### Key Findings
| Aspect | Decision |
|---|---|
| ... | ... |
```

### 2. Reduce Schedule Frequency

Change from `*/10 * * * *` to:
- `*/30 * * * *` (every 30 min) — reduces rate limit pressure
- `0,30 * * * *` (hourly at :00 and :30) — more predictable

### 3. Switch to Non-Reasoning Model

Update via CLI:
```bash
hermes cron edit 082b13bf66ea --model deepseek/deepseek-v3.2:free --provider openrouter
```

Recommended free non-reasoning models (fallback chain):
1. `openrouter/auto` — routes to available decisive model
2. `deepseek/deepseek-v3.2:free` — non-reasoning, fast, free
3. `qwen/qwen3-coder:free` — coding-optimized, non-reasoning
4. `openai/gpt-oss-120b:free` — non-reasoning
5. `google/gemma-4-31b-it:free` — non-reasoning

### 4. Disable Reasoning via OpenRouter Parameter

If Hermes cron model config supports it:
```yaml
model:
  default: nvidia/nemotron-3-ultra-550b-a55b:free
  provider: openrouter
  reasoning: hide  # or "none"
```

## Verification Checklist

After any fix, monitor 2–3 consecutive runs:

- [ ] Final answer produced (not just reasoning)
- [ ] Research file written to canonical append target
- [ ] Output format matches expected schema
- [ ] No `[SILENT]` suppression when work was done

## Related Skills

- `wealthforge-research-workflow` — contains detailed cron workflow and this reference
- `hermes-cron-management` — this skill (CLI management patterns)