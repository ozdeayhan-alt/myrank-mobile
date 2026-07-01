#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PREVIEW_APK="$ROOT/android/app/build/outputs/apk/release/myrank-preview.apk"

if [[ ! -f "$APK" ]]; then
  echo "[preview] error: release APK not found at $APK" >&2
  exit 1
fi

cp -f "$APK" "$PREVIEW_APK"

PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$PREVIEW_APK" "$PUBLIC_DIR/myrank-preview.apk"
if [[ -f "/root/myrankapp/scripts/sync-download-apks.sh" ]]; then
  bash /root/myrankapp/scripts/sync-download-apks.sh
fi

echo "[preview] Done: $PREVIEW_APK"
echo "[preview] Download: https://myrank.com.tr/download/myrank-preview.apk"
echo "[preview] Variant: ${APP_VARIANT:-preview} (no dev client for preview/production)"
