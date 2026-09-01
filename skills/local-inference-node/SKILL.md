---
name: local-inference-node
description: Deploy headless GPU server for llama.cpp inference.
---
# Local Inference Node Deployment

Deploy a headless GPU server (V100, A100, etc.) as a dedicated CUDA inference node running llama.cpp in Docker. Covers driver installation, Secure Boot compatibility, container setup, and thermal management.

## Trigger

Setting up a headless GPU server for local LLM inference — NVIDIA driver install, Docker GPU passthrough, llama.cpp containerization, fan control, or troubleshooting `nvidia-smi` / container startup failures.

## Prerequisites

- Ubuntu 24.04+ server, SSH access
- NVIDIA GPU (V100 PCIe 32GB tested; adjust CUDA_ARCH for other GPUs)
- Docker + NVIDIA Container Toolkit
- Model GGUF file (pre-quantized preferred to avoid local quantization)

## NVIDIA Driver Installation (Headless + Secure Boot)

### Recommended: DKMS with MOK Key Signing (Survives Kernel Upgrades)

This is the only approach that works with Secure Boot AND survives kernel upgrades on a headless server. The workflow:

1. **Install driver + DKMS**
   ```bash
   sudo apt install -y nvidia-dkms-580-server build-essential dkms linux-headers-generic
   ```

2. **Generate + enroll signing key** (requires one-time boot with monitor)
   ```bash
   # Generate new key
   sudo openssl req -new -x509 -newkey rsa:2048 \
     -keyout /var/lib/shim-signed/mok/nvidia.key \
     -out /var/lib/shim-signed/mok/nvidia.crt.der \
     -days 3650 -nodes -subj "/CN=NVIDIA Driver Key/" -outform DER

   # Import — queues for MOK enrollment on next boot
   sudo mokutil --import /var/lib/shim-signed/mok/nvidia.crt.der
   # Set a password (e.g. "nvidia") — you'll type this at the blue screen
   ```

3. **Reboot — enroll at the blue MOK screen**
   - Press any key when "Manage UEFI key database" appears
   - Enroll Key → Continue → type password → Yes → Reboot

4. **Sign DKMS modules** — see [Signing Workflow](#signing-dkms-modules-with-mok-key) below

5. **Set up DKMS auto-sign hook** — see [Auto-Signing Hook](#dkms-auto-signing-hook-for-future-kernels) below

### Signing DKMS Modules with MOK Key

`sign-file` and `sbsign` DO NOT work for this — they throw SSL errors / "Invalid DOS header magic". Use `kmodsign`:

```bash
sudo bash -c '
MODDIR="/lib/modules/$(uname -r)/updates/dkms"
KEY="/var/lib/shim-signed/mok/nvidia.key"
CRT="/var/lib/shim-signed/mok/nvidia.crt.der"

# Uncompress .zst files
for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
  [ -f "$MODDIR/${mod}.ko.zst" ] && uncompress "$MODDIR/${mod}.ko.zst"
done

# Sign each module
for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
  [ -f "$MODDIR/${mod}.ko" ] && kmodsign sha256 "$KEY" "$CRT" "$MODDIR/${mod}.ko"
done

# Recompress
for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
  [ -f "$MODDIR/${mod}.ko" ] && zstd -f "$MODDIR/${mod}.ko"
done
'

# Load and verify
sudo modprobe nvidia
nvidia-smi
```

### DKMS Auto-Signing Hook for Future Kernels

Ubuntu 24.04 DKMS supports `post.d/` hooks that run after each kernel module build. This is the kernel-independent approach — once set up, kernel upgrades auto-sign and work:

```bash
# The post.d directory is called by DKMS after each build
sudo mkdir -p /etc/dkms/post.d

sudo tee /etc/dkms/post.d/99-secureboot-sign << 'EOF'
#!/bin/bash
# Auto-sign NVIDIA DKMS modules with enrolled MOK key
MODDIR="/lib/modules/${kernelver}/updates/dkms"
KEY="/var/lib/shim-signed/mok/nvidia.key"
CRT="/var/lib/shim-signed/mok/nvidia.crt.der"

[ ! -f "$KEY" ] || [ ! -f "$CRT" ] && exit 0
[ ! -d "$MODDIR" ] && exit 0

for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
    ZST="$MODDIR/${mod}.ko.zst"
    KO="$MODDIR/${mod}.ko"
    [ -f "$ZST" ] && uncompress "$ZST" 2>/dev/null || true
    if [ -f "$KO" ]; then
        kmodsign sha256 "$KEY" "$CRT" "$KO"
        zstd -f "$KO"
        echo "Signed ${mod} for ${kernelver}"
    fi
done
EOF

sudo chmod +x /etc/dkms/post.d/99-secureboot-sign
```

This hook runs automatically after every DKMS build — including kernel upgrades — so the driver survives kernel changes without manual intervention.

**Verified on:** Ubuntu 24.04, kernel 6.17.0-35, NVIDIA 580.173.02, Secure Boot enabled, V100 32GB via OCuLink.

### Protect Against Unwanted Updates

```bash
# APT pin to lock 580 branch
cat > /etc/apt/preferences.d/nvidia-580-pin << 'EOF'
Package: nvidia-*
Pin: version 580.*
Pin-Priority: 900
Package: nvidia-*
Pin: version 59*.*
Pin-Priority: -1
Package: nvidia-*
Pin: version 57*.*
Pin-Priority: -1
EOF

# Hold kernel meta-packages
sudo apt-mark hold linux-image-generic-hwe-24.04 linux-headers-generic-hwe-24.04

# Blacklist from unattended-upgrades
cat > /etc/apt/apt.conf.d/99nvidia-no-auto-upgrade << 'EOF'
Unattended-Upgrade::Package-Blacklist {
    "nvidia-*";
    "libnvidia-*";
    "xserver-xorg-video-nvidia-*";
    "linux-headers-*";
    "linux-image-*";
    "linux-modules-*";
};
EOF
```

### Verify Driver Loaded After Reboot

```bash
nvidia-smi  # Shows GPU info = success
# If "No devices were found" = check GPU power cable (V100 needs 8-pin EPS)
# If "Key was rejected by service" = modules unsigned, Secure Boot blocking them
```

## Docker GPU Passthrough

```bash
sudo apt install -y nvidia-container-toolkit
sudo cat > /etc/docker/daemon.json << 'EOF'
{
    "runtimes": {
        "nvidia": {
            "args": [],
            "path": "nvidia-container-runtime"
        }
    }
}
EOF
sudo systemctl restart docker
```

### NVIDIA Container Toolkit Repo (Ubuntu 24.04 Noble)

The NVIDIA Container Toolkit APT repo (`nvidia.github.io/libnvidia-container/`) does NOT have a valid Release file for `noble` (Ubuntu 24.04). If `apt update` fails with "does not have a Release file", use the universal deb path:

```bash
# Remove any broken repo entries
sudo rm -f /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Add GPG key
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

# Use the universal path that works for all distros
echo "deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://nvidia.github.io/libnvidia-container/stable/deb/amd64 /" | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

## llama.cpp Docker Setup

### Directory Structure

```
/project/
├── compose/
│   ├── compose.yaml
│   ├── Dockerfile
│   ├── entrypoint.sh    ← Translates env vars → CLI args
│   └── .env
├── models/              → Symlink to NAS/large storage
├── cache/
├── logs/
├── config/
└── scripts/             ← Diagnostic scripts
```

### Entrypoint Script (Required — llama-server uses CLI args, not env vars)

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

### Compose Pitfall: Env Var Naming Conflicts

❌ **Don't** use the same variable name for both container env and host volume mount:
```yaml
environment:
  - MODEL_PATH=/models/file.gguf
volumes:
  - ${MODEL_PATH:-/host/models}:/models  # COLLISION
```

✅ **Do** prefix host paths with `HOST_`:
```yaml
environment:
  - MODEL_PATH=/models/file.gguf
volumes:
  - ${HOST_MODEL_DIR:-/host/models}:/models
```

## Fan Control (ARCTIC Controller via USB HID)

ARCTIC fan controllers respond to raw HID writes. Detection matches raw VID/PID substrings in `/sys/devices` uevent files — kernel reports `HID_ID=0003:00003904:0000F001` so search for raw `3904`/`F001` substrings, NOT `VID:3904` format.

Report format: `[0x01, PWM_byte, ...]` where PWM is 0-255.

## Verification Checklist

- [ ] `nvidia-smi` shows GPU
- [ ] `docker run --runtime=nvidia --rm nvidia/cuda:12.8.1-base nvidia-smi` works
- [ ] Fan controller service active
- [ ] Model file present and correct size
- [ ] `docker compose up --build` starts container
- [ ] Health check passes (`curl http://localhost:8080/health`)

## Pitfalls

- **sign-file from kernel headers is unusable** — throws SSL errors; `sbsign` rejects .ko files ("Invalid DOS header magic"). Use `kmodsign sha256` instead — it signs kernel modules directly without needing a DOS header
- **MOK blue screen only appears when a NEW key is imported** — if the existing MOK key is already enrolled, rebooting alone will NOT trigger the enrollment screen. You MUST import a new key first (`mokutil --import cert.der`) to force the screen to appear
- **MOK enrollment requires display** — one-time setup: boot with monitor, press any key at blue "Manage UEFI key database" screen, then: Enroll Key → Continue → password → Yes → Reboot
- **`nvidia-smi` "No devices were found" ≠ driver missing** — if the module loads but nvidia-smi says this, check dmesg: `sudo dmesg | grep -i nvidia`. Common cause: `GPU does not have the necessary power cables connected` — V100 needs an 8-pin CPU/EPS power cable (NOT a cable labeled "PCIe")
- **`nvidia-smi` "Key was rejected by service"** = DKMS modules unsigned, Secure Boot blocking them
- **llama-server ignores env vars** — requires CLI args via entrypoint script
- **Compose env var name collisions** — `MODEL_PATH` for container ≠ host mount path
- **Root filesystem fills up** — symlink model directory to NAS/large storage
- **llama.cpp repo moved to ggml-org** — old `ggerganov/llama.cpp` URL may fail
- **Kernel updates break non-DKMS driver** — DKMS preferred if MOK is enrolled
- **ARCTIC fan header adapter is power-only** — needs direct USB data connection
- **Unattended-upgrades blacklist is NOT bulletproof** — also `apt-mark hold` the kernel meta-package
- **Removing DKMS pulls the driver metapackage** — always reinstall driver after removing DKMS
- **NVIDIA Container Toolkit repo broken on noble** — use `stable/deb/amd64` path, not `ubuntu24.04/amd64`
- **Host computer going to sleep kills local LLM** — Windows host entering sleep mode disconnects WSL2/VM inference nodes

## References

- [NVIDIA Driver + Secure Boot Details](references/nvidia-secure-boot.md)
- [MOK Enrollment Procedure](references/mok-enrollment.md)
- [V100 Cooler Script](references/v100-cooler.md)
- [Compose + Entrypoint Templates](references/compose-setup.md)
- [V100 Benchmark Results — Qwen3.8-27B Q4_0](references/v100-benchmark-results.md)

## V100-Specific Pitfalls (Benchmarked)

### Qwen3.6-35B-A3B-Q4_K_M (Current — Verified Aug 2026, KV cache tested Aug 2026)

- **Speculative decoding is HIGHLY beneficial** — `--spec-type draft-mtp --spec-draft-n-max 3` delivers **152 tok/s** vs ~42 tok/s without (3.6x speedup). 89% draft acceptance at n=3. Bumping to n=5 drops acceptance to 75% with no throughput gain (149 tok/s) — **n=3 is the sweet spot**.
- **Full 262k native context loads fine** — 262,144 tokens at 26 GB VRAM with 6.8 GB headroom for KV cache. No OOM, no throughput penalty vs smaller contexts.
- **Flash Attention required** — `--flash-attn on` prevents OOM on large contexts.
- **KV cache q4_0 is optimal** — tested q5_0 (next step up from q4_0): 22% slower (119 vs 152 tok/s), lower acceptance (85% vs 89%), slightly less VRAM. Use `-ctk q4_0 -ctv q4_0`. Valid KV cache types: `f32, f16, bf16, q8_0, q4_0, q4_1, iq4_nl, q5_0, q5_1`. Note: `q6_K` does NOT exist for KV cache (only for model weights).
- **`--fit on` is essential** — auto-adjusts GPU layers to fit VRAM; without it, `-ngl 99` forces all layers to GPU and causes OOM.
- **CUDA 12.8.1 is the ceiling** — CUDA 13.x dropped Volta (sm_70) support entirely. Do not upgrade.
- **Model file corruption from interrupted downloads** — GGUF header can look valid (correct tensor count, size) but tensors are truncated. Always verify by loading the model in a container, not just checking file size or header.
- **Orphaned llama-server processes hold VRAM after container crashes** — root-owned PIDs from old containers persist and consume ~30GB VRAM. Fix: `sudo kill -9 $(pgrep llama-server)` (sudoers NOPASSWD configured). If that fails, reboot.
- **`sudo -S` is blocked by the terminal tool** — cannot pipe passwords. Sudoers NOPASSWD file at `/etc/sudoers.d/<USER>-nogpass` covers kill, pkill, nvidia-smi, docker, systemctl, shutdown, reboot. Use `sudo kill` directly over SSH, not `echo pw | sudo -S`.

### Qwen3.8-27B-Q4_0 (Legacy — deprecated Aug 2026)

- MTP speculative decoding hurt performance (3.7 → 3.0 t/s) on this older model architecture
- Context above 32k killed throughput due to Volta quadratic attention tax
- Batch size tuning was pointless — 512/1024/2048 all produced 3.0 t/s
- Q4_0 > Q4_K_XL for V100 (1.8GB less VRAM, same quality)
