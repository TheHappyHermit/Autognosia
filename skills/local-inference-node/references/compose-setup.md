# Docker Compose + Entrypoint for llama.cpp

## Key Insight: llama-server Uses CLI Args, Not Env Vars

Docker Compose passes settings as environment variables. `llama-server` only accepts command-line flags. An entrypoint script bridges the gap.

## Entrypoint Template

```bash
#!/bin/bash
set -e
CMD="/usr/local/bin/llama-server"
[ -n "$MODEL_PATH" ] && CMD="$CMD -m $MODEL_PATH"
[ -n "$GPU_OFFLOAD" ] && CMD="$CMD -ngl $GPU_OFFLOAD"
[ -n "$CONTEXT_SIZE" ] && CMD="$CMD -c $CONTEXT_SIZE"
[ -n "$KV_CACHE_TYPE" ] && CMD="$CMD --cache-type-k $KV_CACHE_TYPE --cache-type-v $KV_CACHE_TYPE"
[ -n "$FLASH_ATTENTION" ] && CMD="$CMD --flash-attn $FLASH_ATTENTION"
[ -n "$CONCURRENCY" ] && CMD="$CMD -cp $CONCURRENCY"
[ -n "$UBATCH" ] && CMD="$CMD -ub $UBATCH"
[ -n "$BATCH" ] && CMD="$CMD -b $BATCH"
[ -n "$TEMPERATURE" ] && CMD="$CMD --temp $TEMPERATURE"
[ -n "$TOP_P" ] && CMD="$CMD --top-p $TOP_P"
[ -n "$TOP_K" ] && CMD="$CMD --top-k $TOP_K"
[ -n "$MIN_P" ] && CMD="$CMD --min-p $MIN_P"
[ -n "$REPEAT_PENALTY" ] && CMD="$CMD --repeat-penalty $REPEAT_PENALTY"
CMD="$CMD --host 0.0.0.0 --port 8080"
exec $CMD
```

## Compose Template

```yaml
services:
  llama-server:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - CUDA_VERSION=12.8.1
        - CUDA_ARCH=70
    container_name: llama-server
    restart: unless-stopped
    runtime: nvidia
    environment:
      - MODEL_PATH=/models/${MODEL_NAME:-Qwen3.8-27B-UD-Q4_K_XL.gguf}
      - CONTEXT_SIZE=${CONTEXT_SIZE:-256000}
      - GPU_OFFLOAD=${GPU_OFFLOAD:-99}
      - KV_CACHE_TYPE=${KV_CACHE_TYPE:-q8_0}
      - FLASH_ATTENTION=${FLASH_ATTENTION:-on}
      - CONCURRENCY=${CONCURRENCY:-4}
      - UBATCH=${UBATCH:-512}
      - BATCH=${BATCH:-4096}
      - TEMPERATURE=${TEMPERATURE:-1.0}
      - TOP_P=${TOP_P:-0.95}
      - TOP_K=${TOP_K:-20}
      - MIN_P=${MIN_P:-0.0}
      - REPEAT_PENALTY=${REPEAT_PENALTY:-1.0}
    volumes:
      - ${HOST_MODEL_DIR:-/llama-v100/models}:/models:ro
      - ${HOST_CACHE_DIR:-/llama-v100/cache}:/cache
      - ${HOST_LOG_DIR:-/llama-v100/logs}:/logs
      - ${HOST_CONFIG_DIR:-/llama-v100/config}:/config
    ports:
      - "${SERVER_PORT:-8080}:${SERVER_PORT:-8080}"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

## Critical: Avoid Env Var Name Collisions

Container env var `MODEL_PATH` = path inside container. Host volume mount needs a DIFFERENT variable name (`HOST_MODEL_DIR`). Using the same name causes Docker to substitute the container path as the host path, breaking the mount.

## Dockerfile Template

```dockerfile
FROM nvidia/cuda:12.8.1-devel-ubuntu24.04 AS builder
ARG CUDA_ARCH=70
ENV CUDAARCHS=${CUDA_ARCH}
RUN apt-get update && apt-get install -y build-essential cmake git
RUN git clone --depth 1 https://github.com/ggml-org/llama.cpp.git /src/llama.cpp
WORKDIR /src/llama.cpp
RUN mkdir build && cd build && cmake .. \
    -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=${CUDAARCHS} \
    -DLLAMA_SERVER=ON && make -j$(nproc)

FROM nvidia/cuda:12.8.1-runtime-ubuntu24.04
COPY --from=builder /src/llama.cpp/build/bin/llama-server /usr/local/bin/
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
```

## V100-Specific: CUDA_ARCH=70

The V100 is a Volta GPU (sm_70). Other GPUs need different values:
- A100: 80
- RTX 3090: 86
- RTX 4090: 89
