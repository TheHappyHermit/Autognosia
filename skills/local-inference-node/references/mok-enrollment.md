# MOK Enrollment for Headless NVIDIA Driver (Secure Boot)

## When This Is Needed

- Secure Boot is enabled
- DKMS rebuilds NVIDIA modules on kernel update
- Modules are unsigned and rejected by Secure Boot
- `nvidia-smi` fails after reboot with "NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver"
- Manual signing with `sign-file` fails (SSL error: no such file)

## Diagnosis

```bash
# Secure Boot is on
mokutil --sb-state

# DKMS built modules but they're unsigned
dkms status
ls /lib/modules/$(uname -r)/updates/dkms/nvidia*

# Module load is rejected
sudo modprobe nvidia
# ERROR: could not insert 'nvidia': Key was rejected by service
```

## Why Manual Signing Doesn't Work

- `sign-file` from kernel headers cannot resolve `/var/lib/shim-signed/mok/MOK.pem` — throws `SSL error: no such file`. Do NOT waste time trying.
- `sbsign` rejects DKMS `.ko` files with "Invalid DOS header magic" — kernel modules lack the DOS stub that PE binaries have.
- `mokutil --delete-enrolled-key` does NOT work — UEFI keys cannot be unenrolled from the OS.
- `mokutil --disable-validation` requires the MOK password, which may not be known.

## Forcing MOK Enrollment Screen (When Blue Screen Doesn't Appear)

The MOK enrollment screen only appears when there's a **pending key to enroll**. If the existing MOK key is already enrolled, the screen is skipped and unsigned modules are silently rejected.

**Solution: Generate a new key and import it — this guarantees the blue screen appears on next reboot.**

```bash
# 1. Generate a new signing key (PEM format, DER output for mokutil)
sudo openssl req -new -x509 -newkey rsa:2048 \
  -keyout /var/lib/shim-signed/mok/nvidia.key \
  -out /var/lib/shim-signed/mok/nvidia.crt.der \
  -days 3650 -nodes \
  -subj "/CN=NVIDIA Driver Key/" \
  -outform DER

# 2. Import the key (queues for MOK enrollment)
sudo mokutil --import /var/lib/shim-signed/mok/nvidia.crt.der
# → Sets a password (e.g. "nvidia") — REMEMBER THIS PASSWORD

# 3. Reboot — blue screen WILL appear
sudo reboot
```

## MOK Enrollment Procedure (Requires Display)

1. **Reboot** with monitor/keyboard attached
2. Watch for the **blue "Manage UEFI key database" screen** — appears briefly during boot, lasts only a few seconds
3. **Press any key immediately** to stop boot and enter MOK management
4. Follow the menu:
   - **Enroll key** → Enter
   - **Continue** → Enter (or select the key name if listed)
   - Enter password (the one set during `mokutil --import`, e.g. `nvidia`)
   - Enter password again
   - **Yes** → Enter
   - **Reboot** → Enter
5. After reboot, the new key is enrolled and can sign DKMS modules

## Post-Enrollment: Sign DKMS Modules

Once the new key is enrolled, sign existing unsigned DKMS modules:

```bash
sudo bash -c '
MODDIR="/lib/modules/$(uname -r)/updates/dkms"
KEY="/var/lib/shim-signed/mok/nvidia.key"
CERT="/var/lib/shim-signed/mok/nvidia.crt.der"

for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
  KO="$MODDIR/${mod}.ko"
  if [ -f "$KO" ]; then
    openssl x509 -in "$CERT" -inform DER -out /tmp/nvidia.pem
    sbsign --key "$KEY" --cert /tmp/nvidia.pem --output "$KO" "$KO"
    zstd -f "$KO"
  fi
done
'
```

**Note:** After signing, `modprobe nvidia` should work and `nvidia-smi` should show the GPU.

## Post-Enrollment Verification

```bash
nvidia-smi  # Should show GPU
dkms status  # Should show modules installed for current kernel
mokutil --list-enrolled  # Should show enrolled key fingerprint
```

## Preventing Future Kernel Updates (Headless)

Even with MOK enrolled, unexpected kernel updates force a reboot with the blue screen you can't see. Lock the kernel:

```bash
# Hold kernel meta-packages
sudo apt-mark hold linux-image-generic-hwe-24.04 linux-headers-generic-hwe-24.04

# Blacklist in unattended-upgrades (still not bulletproof — hold is essential)
cat > /etc/apt/apt.conf.d/99nvidia-no-auto-upgrade << 'EOF'
Unattended-Upgrade::Package-Blacklist {
    "nvidia-*";
    "libnvidia-*";
    "xserver-xorg-video-nvidia-*";
    "linux-headers-*";
    "linux-image-*";
    "linux-modules-*";
    "linux-generic-*";
    "dkms";
};
EOF
```

## Alternative: Disable Secure Boot (Recommended Long-Term)

If you have BIOS access, disabling Secure Boot is the cleanest solution — no MOK enrollment needed, kernel updates work normally.
