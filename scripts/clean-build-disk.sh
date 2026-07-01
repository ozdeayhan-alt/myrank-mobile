#!/usr/bin/env bash
# Free disk before local Android builds (ENOSPC guard).
set -euo pipefail

MIN_FREE_GB="${MIN_FREE_GB:-8}"

df_line() {
  df -h / | tail -1
}

avail_gb() {
  df -BG / | awk 'NR==2 { gsub(/G/, "", $4); print $4 }'
}

echo "[disk] before: $(df_line)"

if [[ -d /tmp/cursor-sandbox-cache ]]; then
  cache_size="$(du -sh /tmp/cursor-sandbox-cache 2>/dev/null | cut -f1 || echo "?")"
  echo "[disk] removing /tmp/cursor-sandbox-cache (${cache_size})..."
  rm -rf /tmp/cursor-sandbox-cache
fi

shopt -s nullglob
for pattern in /tmp/metro-* /tmp/haste-map-* /tmp/react-*; do
  rm -rf "$pattern"
done
shopt -u nullglob

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
rm -rf "$ROOT/node_modules/.cache" 2>/dev/null || true

find /tmp -maxdepth 1 -type f -name '*.apk' -mtime +3 -delete 2>/dev/null || true

echo "[disk] after: $(df_line)"

free_gb="$(avail_gb)"
if [[ "$free_gb" -lt "$MIN_FREE_GB" ]]; then
  echo "[disk] warning: ${free_gb}GB free (target >= ${MIN_FREE_GB}GB)" >&2
fi
