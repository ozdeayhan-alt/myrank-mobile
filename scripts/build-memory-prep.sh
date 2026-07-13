#!/usr/bin/env bash
# Free RAM before Gradle/Metro on low-memory VPS. Restored by build-memory-restore.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="${ROOT}/.build-pm2-stopped"

PM2_APPS=(myrankapp myrankapp-worker myrankapp-staging)

: > "$STATE_FILE"

echo "[build:mem] preparing low-RAM build environment..."
free -h | sed -n '1,2p'

bash "$ROOT/scripts/ensure-build-swap.sh"

if command -v pm2 >/dev/null 2>&1; then
  for name in "${PM2_APPS[@]}"; do
    if pm2 describe "$name" >/dev/null 2>&1; then
      echo "[build:mem] stopping pm2:$name"
      pm2 stop "$name" >/dev/null 2>&1 || true
      echo "$name" >> "$STATE_FILE"
    fi
  done
fi

pkill -f 'KotlinCompileDaemon' 2>/dev/null || true
if [[ -f "$ROOT/android/gradlew" ]]; then
  (cd "$ROOT/android" && ./gradlew --stop) 2>/dev/null || true
fi

sleep 2
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true

echo "[build:mem] after prep:"
free -h | sed -n '1,2p'
swapon --show 2>/dev/null || true
