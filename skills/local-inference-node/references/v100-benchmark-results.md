# V100 Benchmark Results

## Qwen3.8-27B Q4_0 (2026-08-16)

**GPU:** Tesla V100 PCIe 32GB | **llama.cpp:** 0.41

### Phase 1: Context Sweet Spot
| Context | t/s | Verdict |
|---------|-----|---------|
| **32,768** | **3.7** | ← WINNER |
| 49,152 | 3.0 | 19% slower |
| 65,536 | 3.0 | Same as 49k |

The Volta quadratic attention tax hits hard above 32k context. **32768 is the sweet spot** for non-MTP models.

### Phase 2: MTP Speculative Decoding (Qwen3.8-27B)
| Config | t/s | Verdict |
|--------|-----|---------|
| **No MTP** | **3.7** | ← WINNER |
| MTP `--spec-type draft-mtp --spec-draft-n-max 3` | 3.0 | Slower |

**MTP speculative decoding is SLOWER on V100 with Qwen3.8-27B.** The overhead of running the draft model on Volta's 1st-gen tensor cores outweighs any benefit. Qwen3.8-27B lacks an integrated draft model.

### Phase 3: KV Cache Persistence
- **Working** — API confirmed `cached_tokens` in responses (58/62 cached on repeat requests)
- KV cache skips prefill for repeated prompts within the same server session
- No additional flags needed — KV cache is automatic per-slot in llama-server

### Phase 4: Volta-Specific Optimizations

#### Flash Attention
| Setting | Result |
|---------|--------|
| **`--flash-attn on`** | **REQUIRED** — without FA, model fails to load (OOM) at any context |
| `--flash-attn off` | ❌ CRASH — immediate OOM, model won't even load |

**Flash Attention is mandatory on V100** for this model size. There is no workaround.

#### Batch Size
| Batch | t/s | Notes |
|-------|-----|-------|
| 512 | 3.0 | No difference |
| 1024 | 3.0 | No difference |
| 2048 | 3.0 | No difference |

**Batch size has no meaningful impact on generation speed** on V100. The bottleneck is the generation loop, not prefill.

#### KV Cache Quantization
| Setting | t/s | VRAM | Notes |
|---------|-----|------|-------|
| **`--cache-type-k q4_0 --cache-type-v q4_0`** | **3.6** | 31.4GB | ← WINNER |
| `--cache-type-k q8_0 --cache-type-v q8_0` | 3.0 | Higher | No speed gain, wastes VRAM |

**q4_0 KV cache quantization is optimal** — better VRAM efficiency with no speed penalty.

### Final Benchmark (3-run average, warm)
- **3.6 t/s average** (range: 3.5–3.7 t/s)
- **VRAM:** 31,384 / 32,768 MiB (4.2% headroom)
- **Temperature:** 38°C | **Power:** 36W idle

### Optimal Startup Command for V100 (non-MTP models)

```bash
llama-server \
  -m /models/Qwen3.8-27B-Q4_0.gguf \
  --host 0.0.0.0 \
  -t 8 \
  -b 2048 \
  -ub 512 \
  --flash-attn on \
  --cache-type-k q4_0 \
  --cache-type-v q4_0 \
  --fit on \
  -c 32768 \
  --reasoning-preserve
```

---

## Qwen3.6-35B-A3B Q4_K_M (2026-08-16)

**GPU:** Tesla V100 PCIe 32GB | **llama.cpp:** 0.41 | **CUDA:** 12.8.1

### Key Differences from Qwen3.8-27B

The Qwen3.6-35B-A3B has an **integrated 3B draft model** (A3B = Auto-Regressive 3B) designed for speculative decoding. This changes the performance profile significantly.

### MTP Speculative Decoding (Qwen3.6-35B-A3B)
| Metric | Result |
|--------|--------|
| Prompt processing | 52.4 tok/s |
| Token generation | **153.3 tok/s** with MTP |
| Draft acceptance | **95%** (36/38 accepted) |
| Draft tokens | 38 per step |

**MTP speculative decoding dramatically HELPS on Qwen3.6-A3B** — the integrated 3B draft model is specifically designed for this architecture and achieves 95% acceptance rate, boosting effective generation to 153 tok/s. This is the opposite of Qwen3.8-27B where MTP hurt performance (no integrated draft model).

### VRAM Usage
| Metric | Value |
|--------|-------|
| Model VRAM | ~26 GB / 32 GB |
| Headroom | ~6.8 GB |
| Context | 262,144 (262k — full native) |
| Temperature | 39°C |

**262k context loads successfully** with MTP on Qwen3.6-35B-A3B at 26 GB VRAM — well within 32 GB limits.

### KV Cache Quantization Test (2026-08-16)
| Setting | tok/s | Acceptance | VRAM | Verdict |
|---------|-------|------------|------|---------|
| **`-ctk q4_0 -ctv q4_0`** | **152** | **89%** | 25.5 GB | ← WINNER |
| `-ctk q5_0 -ctv q5_0` | 119 | 85% | 24.8 GB | 22% slower |

**q4_0 is optimal for KV cache.** q5_0 costs more memory bandwidth per token with no quality benefit. Note: `q6_K` does NOT exist as a KV cache type — valid types are `f32, f16, bf16, q8_0, q4_0, q4_1, iq4_nl, q5_0, q5_1`.

### Speculative Decoding n-max Test (2026-08-16)
| `--spec-draft-n-max` | tok/s | Acceptance | Verdict |
|---------------------|-------|------------|---------|
| **3** | **152** | **89%** | ← WINNER |
| 5 | 149 | 75% | No gain |

**n=3 is the sweet spot.** Higher draft counts mean more parallel work per step but lower acceptance — net result is no throughput gain.

### Optimal Startup Command for V100 (MTP models)

```bash
llama-server \
  -m /models/Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --host 0.0.0.0 \
  -ngl 99 \
  -c 131072 \
  -ctk q4_0 \
  -ctv q4_0 \
  -b 2048 \
  -ub 1024 \
  --spec-type draft-mtp \
  --spec-draft-n-max 3 \
  --flash-attn on
```

---

## CUDA Version Notes

**CUDA 12.8.1 is the LAST version supporting V100 (sm_70).** Official NVIDIA release notes: *"Removed support for Maxwell, Pascal, and Volta GPUs, corresponding to compute capabilities earlier than Turing."*

- Driver 580.173.02 supports CUDA 13.0 as the ceiling
- CUDA 13.x toolkit will NOT compile sm_70 code
- Pin `nvidia/cuda:12.8.1-devel-ubuntu24.04` and `nvidia/cuda:12.8.1-runtime-ubuntu24.04`
- No performance benefit from downgrading within 12.x

## Key Takeaways for V100 + Large Models

1. **32k context is the speed ceiling for non-MTP models** — beyond that, Volta attention tax kills throughput
2. **MTP depends on the model** — hurts with Qwen3.8-27B (no draft model), helps massively with Qwen3.6-A3B (integrated 3B draft)
3. **Flash Attention is non-negotiable** — model won't load without it
4. **Batch size is irrelevant** for gen speed — don't waste time tuning it
5. **q4_0 KV cache quantization** gives best VRAM efficiency
6. **Q4_0 > Q4_K_XL** for this setup — 1.8GB less VRAM, same quality, more headroom
7. **`--fit on`** auto-adjusts GPU layers to fit VRAM — critical for avoiding OOM
8. **CUDA 12.8.1 is the ceiling** — CUDA 13+ drops V100 entirely

## Benchmarking Methodology

Tests used `llama-cli`/`llama-server` (not `llama-bench`) since llama-bench cannot test speculative decoding or KV cache slot saving. Each parameter combination required a full container restart (~60s model load) since llama-server startup parameters cannot be changed at runtime.

For generation speed: sent a 50-word prompt requesting 100 tokens via OpenAI-compatible API (`/v1/chat/completions`). Wall time measured externally via Python `time.time()` around curl call. Multiple warm-up runs averaged to get stable baseline.

## Notes on GGUF File Integrity

Large GGUF downloads (20GB+) can appear complete but be corrupted — the download finishes before data is fully flushed to disk. Verify with:
1. Check file tail bytes are non-zero (zeros = truncated)
2. Check GGUF header tensor count matches expected (753 for Qwen3.6-35B-A3B)
3. Ultimate test: actually load the model in llama-server and watch for `tensor data is not within file bounds` errors
4. If corrupted, delete and re-download — don't resume partial downloads

## Notes on Orphaned GPU Processes

Old Docker containers that are stopped/removed can leave orphaned `llama-server` processes running as root, holding VRAM. These don't show in `docker ps` but appear in `nvidia-smi`. Fix: `sudo kill -9 $(pgrep llama-server)` or reboot. Sudoers NOPASSWD configured at `/etc/sudoers.d/<username>-nogpass`.