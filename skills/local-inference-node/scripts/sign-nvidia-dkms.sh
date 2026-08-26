#!/bin/bash
# Auto-sign NVIDIA DKMS modules after kernel upgrade
# Place at /usr/local/bin/sign-nvidia-dkms.sh
# Called by DKMS post_install hook or systemd service after kernel update

set -e

MOK_KEY="/var/lib/shim-signed/mok/nvidia.key"
MOK_CRT="/var/lib/shim-signed/mok/nvidia.crt.der"

# Only run if signing key exists
if [ ! -f "$MOK_KEY" ] || [ ! -f "$MOK_CRT" ]; then
    echo "No MOK signing key found, skipping"
    exit 0
fi

# Find all installed kernel versions with DKMS modules
for kver in $(dkms status 2>/dev/null | grep 'nvidia-srv' | grep 'installed' | awk -F, '{print $2}' | awk '{print $1}'); do
    MODDIR="/lib/modules/${kver}/updates/dkms"
    if [ ! -d "$MODDIR" ]; then
        continue
    fi

    echo "Signing NVIDIA modules for kernel $kver"

    for mod in nvidia nvidia-drm nvidia-modeset nvidia-uvm nvidia-peermem; do
        ZST="$MODDIR/${mod}.ko.zst"
        KO="$MODDIR/${mod}.ko"

        # Uncompress if needed
        if [ -f "$ZST" ] && [ ! -f "$KO" ]; then
            uncompress "$ZST" 2>/dev/null || true
        fi

        # Sign if exists
        if [ -f "$KO" ]; then
            kmodsign sha256 "$MOK_KEY" "$MOK_CRT" "$KO"
        fi

        # Recompress
        if [ -f "$KO" ]; then
            zstd -f "$KO"
        fi
    done
done

echo "DKMS module signing complete"
