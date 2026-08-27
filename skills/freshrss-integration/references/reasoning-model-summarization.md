# Reasoning-Only Models Break Newsletter Summarization (tencent/hy3:free)

## Symptom
`newsletter_builder.py` produced a broken newsletter: summaries were raw concatenations
of `TITLE:`/`CONTENT:` text, with uncleaned HTML entities (`Q＆A`) and even a Chinese
refusal string (`我无法提供相关信息...`) in the World section. The "Summarization failed"
log showed `'NoneType' object has no attribute 'strip'`.

## Root Cause
The user's default OpenRouter model is `tencent/hy3:free` — a **reasoning-only** model.
- `message.content` is `None` unless reasoning is constrained AND a large token budget exists.
- The actual answer lives in `message.reasoning` (chain-of-thought), which can itself contain
  the model's refusal (hence the Chinese text leaking into output).
- The old code did `response.choices[0].message.content.strip()` with `max_tokens=300`.
  The 300-token budget is entirely consumed by the reasoning trace before `content` is ever
  emitted -> `content=None` -> `.strip()` crashes -> exception -> messy fallback.

## Reproduction recipe (verified)
```python
import openai
c = openai.OpenAI(api_key=<REDACTED_API_KEY>, base_url="https://openrouter.ai/api/v1")

# FAILS: content is None, reasoning holds the answer (especially multi-item batches)
r = c.chat.completions.create(model="tencent/hy3:free",
    messages=[{"role":"user","content": prompt}], max_tokens=300, temperature=0.2)
assert r.choices[0].message.content is None

# ROBUST: minimal effort + big budget -> clean content for 15-item batches
r = c.chat.completions.create(model="tencent/hy3:free",
    messages=[...], max_tokens=2500, temperature=0.2,
    extra_body={"reasoning": {"effort": "minimal"}})
summary = r.choices[0].message.content  # clean, non-None
```

## Why smaller budget fails
`max_tokens` caps the TOTAL generation including the reasoning trace. With `effort` default
and only 300 tokens, the model spends all 300 on reasoning and never emits `content`.
Raising the budget to 2500+ lets the trace finish and the final answer appear in `content`.

## Other free-model availability (this key, 2026-07)
- `meta-llama/llama-3.1-8b-instruct:free` -> 404 (unavailable for free)
- `google/gemini-2.0-flash-exp:free` -> 404
- `microsoft/phi-3-mini-128k-instruct:free` -> 404
- `openai/gpt-4o-mini` -> 403 (key limit exceeded)
- => `tencent/hy3:free` is the ONLY working model. No non-reasoning fallback exists.

## Fix applied to newsletter_builder.py
1. `summarize_content()` now sends `extra_body={"reasoning": {"effort": "minimal"}}`
   and retries with `max_tokens` budgets (2500, then 4000). On `None`/`empty`, it pulls
   the final line out of `message.reasoning` as last resort, then falls back to truncation.
2. `clean_text()` added: `html.unescape` + tag strip + fullwidth->ASCII normalization
   (range U+FF01-U+FF5F and U+3000). Replaces the old regex-only cleaning.
3. `is_refusal()` added: drops bodies containing Chinese refusals (`我无法提供`,
   `无法提供相关信息`), Cloudflare/`Just a moment`/`Checking your browser`, `404 not found`,
   `enable javascript`, etc.
4. `extract_content_with_waterfall()` now returns `content=None` for refusal/boilerplate
   bodies so they are skipped (not surfaced) by the caller.
5. Jina URL bug fixed: `https://r.jina.ai/{url}` (NOT `https://r.jina.ai/http://{url}`).
   Jina Reader takes the full target URL appended after `r.jina.ai/`.

## Verification notes
Ad-hoc checks (run from HOME dir, NOT /tmp — see caveat): `clean_text` decodes entities +
normalizes fullwidth; `is_refusal` catches Chinese refusals and Cloudflare boilerplate,
passes real articles; `summarize_content` returns clean non-None summary via the live model
(no reasoning leak); `extract_content_with_waterfall` returns `content=None` for a refusal body.

CAUTION: a stray `/tmp/inspect.py` shadows the stdlib `inspect` module, breaking any Python
run from `/tmp` (raises `module 'inspect' has no attribute 'signature'`). Run verifiers from
the home dir, or delete `/tmp/inspect.py`.
