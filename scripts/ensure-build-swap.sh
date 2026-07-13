#!/usr/bin/env bash
# Ensure extra 4G swap exists and is enabled at boot (low-RAM VPS).
set -euo pipefail

SWAP_FILE="/swapfile2"
FSTAB_LINE="${SWAP_FILE} none swap sw 0 0"

if [[ ! -f "$SWAP_FILE" ]]; then
  echo "[build:swap] creating ${SWAP_FILE}..."
  fallocate -l 4G "$SWAP_FILE" || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=4096 status=progress
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE"
fi

if ! swapon --show | grep -q "$SWAP_FILE"; then
  swapon "$SWAP_FILE"
fi

if [[ -f /etc/fstab ]] && ! grep -qF "$SWAP_FILE" /etc/fstab; then
  echo "[build:swap] adding ${SWAP_FILE} to /etc/fstab"
  echo "$FSTAB_LINE" >> /etc/fstab
fi
