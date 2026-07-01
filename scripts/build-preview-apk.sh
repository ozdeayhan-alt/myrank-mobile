#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="${APP_VARIANT:-preview}"

cd "$ROOT"

echo "[preview] disk cleanup..."
bash "$ROOT/scripts/clean-build-disk.sh"

echo "[preview] verifying environment..."
bash "$ROOT/scripts/verify-build-env.sh"

echo "[preview] APP_VARIANT=$APP_VARIANT"
bash "$ROOT/scripts/preview-android-prepare.sh"

echo "[preview] gradle assembleRelease..."
bash "$ROOT/scripts/gradle-assemble-with-retry.sh" assembleRelease

bash "$ROOT/scripts/finish-preview-apk.sh"
