#!/usr/bin/env bash
# Restart PM2 apps stopped by build-memory-prep.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="${ROOT}/.build-pm2-stopped"

if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

if ! command -v pm2 >/dev/null 2>&1; then
  rm -f "$STATE_FILE"
  exit 0
fi

mapfile -t stopped < "$STATE_FILE"
rm -f "$STATE_FILE"

if [[ "${#stopped[@]}" -eq 0 ]]; then
  exit 0
fi

echo "[build:mem] restoring pm2: ${stopped[*]}"
pm2 start "${stopped[@]}" >/dev/null 2>&1 || pm2 resurrect >/dev/null 2>&1 || true
