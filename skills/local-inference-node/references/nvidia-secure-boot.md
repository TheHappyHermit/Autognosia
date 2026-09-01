# NVIDIA Driver + Secure Boot (Headless Server)

## The Problem

Secure Boot refuses to load unsigned kernel modules. DKMS builds fresh unsigned modules on each kernel change, requiring interactive MOK enrollment at boot — impossible on headless servers.

## What DOESN'T Work (Don't Waste Time)

- **`sign-file` from kernel headers** — throws `SSL error: no such file` with MOK keys. The binary in `/usr/src/linux-headers-*/scripts/sign-file` is a compiled ELF that won't execute on modern systems.
- **`sbsign`** — rejects `.ko` files with "Invalid DOS header magic". The `--add-dos-stub` flag doesn't exist in Ubuntu 24.04's version.
- **`mokutil --delete-enrolled-key`** — does nothing. UEFI keys can't be unenrolled from the OS.
- **`mokutil --disable-validation`** — requires the MOK password (set during initial Ubuntu install), which you likely don't know.
- **Rebooting alone to see the blue MOK screen** — the screen only appears when a NEW key is imported via `mokutil --import`. If the existing key is already enrolled, rebooting does nothing.

## What DOES Work: MOK Key + kmodsign

### One-Time Setup (Requires Monitor)

```bash
# 1. Generate new signing key
sudo openssl req -new -x509 -newkey rsa:2048 \
  -keyout /var/lib/shim-signed/mok/nvidia.key \
  -out /var/lib/shim-signed/mok/nvidia.crt.der \
  -days 3650 -nodes -subj "/CN=NVIDIA Driver Key/" -outform DER

# 2. Import — queues for MOK enrollment on next boot
sudo mokutil --import /var/lib/shim-signed/mok/nvidia.crt.der
# Set a password (e.g. "nvidia") — you'll type this at the blue screen

# 3. Reboot — the blue MOK screen WILL appear
#    Enroll Key → Continue → password → Yes → Reboot

# 4. Sign current kernel's DKMS modules
sudo bash /usr/local/bin/sign-nvidia-dkms.sh

# 5. Verify
nvidia-smi
```

### Signing Script (`/usr/local/bin/sign-nvidia-dkms.sh`)

See `scripts/sign-nvidia-dkms.sh` in this skill. This script:
- Uncompresses `.ko.zst` files
- Signs each module with `kmodsign sha256`
- Recompresses them
- Handles multiple kernel versions

### After Kernel Upgrades

Run the signing script again (or set up the DKMS hook in `framework.conf.d`):

```bash
sudo bash /usr/local/bin/sign-nvidia-dkms.sh
sudo modprobe nvidia
nvidia-smi
```

## Diagnostic Messages

| nvidia-smi output | Cause | Fix |
|---|---|---|
| "NVIDIA-SMI has failed" | Driver not installed | `apt install nvidia-driver-580-server` |
| "Key was rejected by service" | Modules unsigned, Secure Boot blocking | Sign with `kmodsign` |
| "No devices were found" | Module loaded but GPU has no power | Check `dmesg \| grep nvidia` — V100 needs 8-pin EPS power cable |
| Works fine | All good | — |

## Protect Against Auto-Updates

```bash
# APT pin: lock 580 branch
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

# Unattended-upgrades blacklist
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

## Legacy: Pre-Signed Only (Fragile)

```bash
sudo apt remove -y nvidia-dkms-580-server
sudo apt install -y nvidia-driver-580-server
# BREAKS on kernel updates — only works for the kernel the pre-signed module was built for
```

## Ubuntu 26.04 Upgrade Path

The 580-server branch is available in both 24.04 and 26.04. After OS upgrade:

1. Reinstall `nvidia-dkms-580-server`
2. Run signing script for new kernel
3. Docker NVIDIA runtime config persists in `/etc/docker/daemon.json`
4. APT pin and unattended-upgrades blacklist survive upgrade

## V100-Specific: Power Cable

The Tesla V100 PCIe uses a CPU/EPS-style 8-pin power connector. The modular PSU cable MUST be labeled "CPU" — never use a cable labeled "PCIe". If `nvidia-smi` shows "No devices were found" and dmesg says "GPU does not have the necessary power cables connected", the power cable is the issue.
