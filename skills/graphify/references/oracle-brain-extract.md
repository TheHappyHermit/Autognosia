# Running `graphify extract` against the Oracle brain on the V100

## Context
The Autognosia Oracle brain (`/home/<USER>/.autognosia/oracle/brain`) is ingested by graphify's
`extract` subcommand, pinned to the local V100 (`10.1.1.10:8080`) running Qwen3.6-35B-A3B. This is a
long-running daemon-style job — NOT the interactive `/graphify` slash pipeline in this skill's main body.

## Launch (via script — never hand-type the env)
```bash
bash ~/.hermes/scripts/graphify_launch_48k.sh
```
The script sets:
- `OPENAI_BASE_URL=http://10.1.1.10:8080/v1`
- `OPENAI_API_KEY=sk-local`
- `OPENAI_MODEL=/models/Qwen3.6-35B-A3B-Q4_K_M.gguf`
- `GRAPHIFY_MAX_OUTPUT_TOKENS=98304`   # 96k
Then runs:
```bash
graphify extract . --backend openai --max-concurrency 1 --token-budget 24000 --api-timeout 1800
```

## CRITICAL rules
- **NEVER `source ~/.openai_keys`** — it can point at OpenRouter and 400 every chunk. The launch script must NOT source it.
- **No OpenRouter fallback.** Graphify must only ever hit the V100. A 400 storm across chunks = it fell back to OpenRouter (kill and relaunch on V100).
- One heavy job at a time; the V100 is shared with the wife's agent.

## Chunking model
- `--token-budget 24000` ≈ 96 KB source text per chunk. Corpus of ~1046 docs → 34 chunks.
- `GRAPHIFY_MAX_OUTPUT_TOKENS` caps each chunk's EXTRACTION output:
  - 48k → JSON parse errors / 400s on large chunks.
  - 96k → fixed the 400s, BUT a chunk packing a giant file (e.g. a 577 KB doc) now generates up to
    ~384 KB and takes 10–60× longer than a normal ~6-min chunk. Tradeoff: correctness over speed.

## Monitoring (verified, not assumed)
- Progress: `grep -cE "chunk [0-9]+/34 done" <log>` and `tail` the log for `chunk N/34 done`.
- Live connection: `ss -tnp | grep '10.1.1.10:8080'` — look for ESTAB from the graphify pid.
- V100 busy: `ssh main-server "nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader"`
  (expect ~91% util, ~26/32 GB VRAM).
- Process: `ps -p <pid>` — a 2h+ elapsed with steady ESTAB = healthy grind, not hung.

## Gotcha: on-disk `.graphify_chunk_NN.json` are OUTPUT artifacts from a PRIOR run
They are NOT the current chunk plan. Their mtimes predate the current run, so reading them to infer
"which chunk is slow" is misleading. To get the exact per-chunk input sizes you must pause the job and
dump the plan — which costs the in-flight chunk. Usually not worth it; just let it grind.
