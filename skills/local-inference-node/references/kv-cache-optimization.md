# KV Cache Optimization for Large Models on Limited VRAM

## Problem

When deploying large models (e.g., Qwen3.8-27B) on GPUs with limited VRAM (e.g., V100 32GB), llama.cpp pre-allocates the full KV cache on GPU at startup. Default f16 KV cache for a 27B model is ~16GB, which combined with model weights (~17.7GB) exceeds 32GB and causes OOM.

## Solution: KV Cache Quantization + Auto-Fit

Use these three flags together:

```bash
--cache-type-k q4_0 \
--cache-type-v q4_0 \
--fit on
```

### `--cache-type-k` / `--cache-type-v`

Quantize the KV cache from f16 (default) to a lower precision. Available types:
- `f32` — full precision (largest)
- `f16` — default
- `bf16` — bfloat16
- `q8_0` — 8-bit quantized
- `q4_0` — 4-bit quantized (~8x smaller than f16)
- `q4_1`, `iq4_nl`, `q5_0`, `q5_1` — intermediate options

For Qwen3.8-27B on V100 32GB: `q4_0` reduced KV cache from ~16GB to ~2GB, bringing total VRAM from 33.7GB down to 30.8GB.

### `--fit on`

Tells llama.cpp to automatically reduce GPU layers until everything fits in device memory. **Always prefer `--fit on` over hardcoding `--ngl 99`** — hardcoding 99 forces all layers to GPU and OOMs before KV quantization can help.

### Compose Configuration

```yaml
environment:
  - CACHE_TYPE_K=q4_0
  - CACHE_TYPE_V=q4_0
  - FIT=on
  - FLASH_ATTN=on
```

### Verified Results

- Qwen3.8-27B-UD-Q4_K_XL on V100 32GB: **30,860 MiB / 32,768 MiB** (97% utilization)
- Model loads in ~8 minutes
- Server responds to OpenAI-compatible API requests
- Temperature stable at 40°C with fan controller

## Entrypoint Template with KV Cache Support

```bash
#!/bin/bash
set -e
CMD="/usr/local/bin/llama-server"
ARGS=(-m "$MODEL_PATH" --host "0.0.0.0")
[ -n "$GPU_LAYERS" ] && ARGS+=(-ngl "$GPU_LAYERS")
[ -n "$THREADS" ] && ARGS+=(-t "$THREADS")
[ -n "$BATCH_SIZE" ] && ARGS+=(-b "$BATCH_SIZE")
[ -n "$U_BATCH_SIZE" ] && ARGS+=(-ub "$U_BATCH_SIZE")
[ "$KV_OFFLOAD" = "false" ] && ARGS+=(--no-kv-offload)
[ -n "$CACHE_TYPE_K" ] && ARGS+=(--cache-type-k "$CACHE_TYPE_K")
[ -n "$CACHE_TYPE_V" ] && ARGS+=(--cache-type-v "$CACHE_TYPE_V")
[ -n "$FLASH_ATTN" ] && ARGS+=(--flash-attn "$FLASH_ATTN")
[ -n "$CTX_SIZE" ] && ARGS+=(-c "$CTX_SIZE")
[ -n "$FIT" ] && ARGS+=(--fit "$FIT")
[ -n "$PORT" ] && ARGS+=(--port "$PORT")
exec "$CMD" "${ARGS[@]}"
```

## Writing Entrypoint via SSH

SSH heredoc strips `$` variables from the script. Use one of:
- `python3` heredoc over SSH (most reliable):
  ```bash
  ssh user@host 'python3 << "PYEOF"
  import os
  content = """..."""
  with open("/path/entrypoint.sh", "w") as f:
      f.write(content)
  os.chmod("/path/entrypoint.sh", 0o755)
  PYEOF'
  ```
- Base64 encoding: `echo "base64_string" | base64 -d > entrypoint.sh`
- Never use plain `cat << 'EOF'` for files containing shell variables

## SearXNG Search Backend

SearXNG at `searxng.<oracle-server>` runs behind Traefik on the server.

- Container IP: `172.18.0.11` (check with `docker inspect searxng`)
- JSON API: `http://172.18.0.11:8080/search?q=query&format=json`
- DNS only resolves internally (from the server itself), not from external machines
- Access from server: `python3` urllib or `curl` to container IP directly
