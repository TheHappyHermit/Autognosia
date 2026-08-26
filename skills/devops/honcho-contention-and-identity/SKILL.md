---
name: honcho-contention-and-identity
description: Fix Honcho retry storms and fragmented peer identity.
category: devops
version: 1.0.0
author: hermes
license: MIT
metadata:
  hermes:
    tags: [honcho, memory, docker, postgres, llm, timeout, troubleshooting]
    related_skills: [honcho-self-hosted, memory-backend-configuration]
---

# Honcho: Retry Storms, Timeouts, and Peer Identity

Two failure modes on a self-hosted Honcho backed by a **local** LLM. Both were
diagnosed and fixed on 2026-08-25; commands here are verified, not theoretical.

## When to Use

Reach for this skill when:

- Honcho memory "works" but `honcho_reasoning` times out
- A local inference endpoint sits pegged at 100% slot usage with no obvious owner
- Deriver queue depth grows instead of draining
- The same human appears under several peer names (platform id vs configured name)
- `honcho_search` returns nothing while raw SQL clearly holds the data

---

## Part 1 — The retry storm

### Symptom

`docker logs <honcho-api>` repeats:

```
openai._base_client - INFO - Retrying request to /chat/completions in 0.39 seconds
httpx.ReadTimeout
tenacity.RetryError: RetryError[<Future ... raised APITimeoutError>]
```

Stack frames point at `src/dialectic/chat.py::agentic_chat` via
`src/dialectic/core.py::answer` — the code path behind `honcho_reasoning`.

### Root cause

`provider_params.timeout` unset on every dialectic level means **nothing is
forwarded** and the SDK default applies. Against a slow local model that default
fires mid-generation. `tenacity` then retries (3 attempts,
`wait_exponential(min=4, max=10)`) and **each retry opens a new socket**. Old
connections linger ESTABLISHED. More connections → endpoint more saturated →
more timeouts → more retries. Self-sustaining.

Observed: **80 ESTABLISHED connections**, **166 retries/hour** against a
~6/hour baseline, all 4 llama.cpp slots pegged.

The official docs state this explicitly:

> "A too-tight timeout doesn't fail once: the aborted request goes through the
> normal retry/fallback chain before the caller sees an error, so the observed
> latency is several multiples of the timeout."

Tool iterations multiply it. Check `MAX_TOOL_ITERATIONS` per level — `low`
defaults to **5**, so one `honcho_reasoning` can mean 5 calls × 3 retries.

### CRITICAL diagnostic pitfall

**`ss -tnp` on the host cannot see inside container network namespaces.** A host
snapshot showing one connection while a container holds 80 will send you hunting
a phantom external consumer. Always check inside every container:

```bash
# port 8080 = hex 1F90
for c in $(docker ps --format '{{.Names}}'); do
  n=$(docker exec "$c" sh -c "grep -c ':1F90' /proc/net/tcp 2>/dev/null" 2>/dev/null | tr -d '\r')
  [ "${n:-0}" != "0" ] && echo "$c -> $n conns"
done
```

Confirm the remote address, since 8080 is also a common in-container listen port:

```bash
docker exec <container> sh -c "cat /proc/net/tcp" \
  | awk 'NR>1{print $3,$4}' | grep ':1F90' | head -3
# little-endian hex remote addr; state 01 = ESTABLISHED
```

### Fix

Set `overrides.provider_params.timeout` (SECONDS, validated at config load) in
the compose `.env`. Env var path uses `__` for nesting and **UPPERCASE** level
names work even though docs show lowercase:

```bash
DIALECTIC_LEVELS__MINIMAL__MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=600
DIALECTIC_LEVELS__LOW__MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=900
DIALECTIC_LEVELS__MEDIUM__MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=1200
DIALECTIC_LEVELS__HIGH__MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=1800
DIALECTIC_LEVELS__MAX__MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=3600
DERIVER_MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=3600
SUMMARY_MODEL_CONFIG__OVERRIDES__PROVIDER_PARAMS__TIMEOUT=1800
```

Recreate (also drops the stuck sockets):

```bash
docker compose -f docker-compose.honcho.yml --env-file .env up -d \
  --force-recreate api deriver
```

Verify loaded — do not assume:

```bash
docker exec <api> sh -c "cd /app && /app/.venv/bin/python -c \"
from src.config import settings
for n,c in sorted(settings.DIALECTIC.LEVELS.items()):
    print(n, c.MODEL_CONFIG.overrides.provider_params.get('timeout'))
\""
```

### The second timeout everyone misses

Server-side alone is NOT enough. The **Hermes client** has its own timeout and
will abort at ~30s while the server keeps working. Set it in
`~/.hermes/honcho.json` (NOT `config.yaml`), at root **and** every host, to at
least the server value:

```python
d['timeout'] = 900
for cfg in d['hosts'].values():
    cfg['timeout'] = 900
```

**The gateway caches this at startup — it must be restarted to take effect, and
it cannot restart itself from inside its own process tree.** Ask the user to run
`hermes gateway restart` from a separate shell.

### Success criteria

| Metric | Storm | Fixed |
|---|---|---|
| Container conns to endpoint | 80 | 1–3 |
| Retries per 5 min | ~25 | 0 |
| `honcho_reasoning` | timeout | full answer |

---

## Part 2 — Fragmented peer identity

### Symptom

One human across several peers, e.g. a Telegram numeric chat id, the configured
`peerName`, and a stray. Each peer only sees its own slice, so cross-interface
recall silently fails.

### Root cause

`plugins/memory/honcho/session.py::_resolve_user_peer_id` prefers a **runtime
id** over configured `peer_name`. Platform gateways supply their own id, which
wins. Upstream already ships the fix: **`pinUserPeer`**. No code change needed.

```python
for cfg in d['hosts'].values():
    cfg['pinUserPeer'] = True
    cfg.setdefault('userPeerAliases', {})['<old-runtime-id>'] = '<canonical>'
```

Requires a gateway restart. Rows written before the restart stay under the old
peer and need one more small merge.

### Choosing the canonical peer

Prefer the configured `peerName` over the platform id, even when the platform id
holds more rows:

- it is already the declared contract in `honcho.json`
- platform ids are per-platform, so each new channel re-fragments identity
- it keeps a platform identifier out of every stored observation

Volume should not pick a primary key; correctness should. The migration cost is
paid once.

### FK ordering — load-bearing, learned from 4 rolled-back attempts

1. **Peers are per-workspace.** Composite FK `(peer_name, workspace_name)`.
   Check for a second workspace before assuming one; the canonical peer row must
   exist in EACH source workspace first.
2. **`collections` before `documents`.** `documents` has a composite FK to
   `collections` on `(observer, observed, workspace_name)`, and `collections`
   has a UNIQUE constraint on that same triple. Merging can collapse two pairs
   into one, so pre-create the surviving collection.
3. **`documents` needs ONE atomic UPDATE.** That FK is **NOT DEFERRABLE**
   (verify via `pg_constraint`), so updating `observer` then `observed` in
   separate statements creates an invalid intermediate and aborts the
   transaction. Use `CASE WHEN` on both columns in a single statement.
4. **ids are length-checked at exactly 21 chars** (`ck_*_id_length`) with no
   DEFAULT. Use `substr(md5(random()::text || clock_timestamp()::text),1,21)`.
5. **`session_peers` has a composite PK.** Delete alias rows that would collide
   with an existing canonical membership, then move the rest.
6. Delete the alias `peers` row **last**, once nothing references it.

Working script: `~/.autognosia/scripts/honcho_merge_peers.py` (dry-run first).

### Always

- `pg_dump` before touching anything; refuse to proceed if the dump fails
- Single transaction so any error rolls back
- Merge, never drop — only empty alias rows get deleted
- Verify after: zero alias rows, zero orphans, embeddings still `N/N`

---

## Related failure: unembedded documents

Rows inserted directly (e.g. a memory port) may carry `sync_state='synced'` with
`embedding IS NULL`. Honcho's reconciler treats them as done and **never
retries**, so they are permanently invisible to semantic search while still
appearing in raw representation dumps.

```sql
SELECT count(*) AS total, count(embedding) AS embedded FROM documents;
```

Repair with `~/.autognosia/scripts/honcho_backfill_embeddings.py`. Embeddings go
to the **embedding** endpoint (Ollama), not the chat endpoint.

## Pitfalls

- Do not blame a co-tenant job for slot saturation without checking
  `is_processing` **before and after** stopping it. A wrong attribution here
  killed a healthy graphify run.
- Queue `in_progress_work_units` is **bookkeeping, not concurrency**. Do not
  read it as parallel LLM calls; check `DERIVER_WORKERS` (default 1).
- `honcho_search` is cheap (no LLM). `honcho_reasoning` runs an agentic loop.
  Prefer search when the endpoint is contended.
- Honcho Postgres often has **no `honcho` role** — connect as `postgres`.
