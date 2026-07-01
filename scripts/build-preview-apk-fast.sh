#!/usr/bin/env bash
# JS-only preview build: skip prebuild, incremental Gradle (~3–5 min vs ~10–14 min).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="${APP_VARIANT:-preview}"
export SKIP_NATIVE_PURGE=1

cd "$ROOT"

echo "[preview:fast] disk cleanup..."
bash "$ROOT/scripts/clean-build-disk.sh"

echo "[preview:fast] verifying environment..."
bash "$ROOT/scripts/verify-build-env.sh"

if [[ ! -f "$ROOT/android/gradlew" ]]; then
  echo "[preview:fast] android/ missing — one-time prebuild..."
  PREBUILD_CLEAN=0 bash "$ROOT/scripts/preview-android-prepare.sh"
else
  echo "[preview:fast] reusing android/ (no prebuild)"
  mkdir -p "$ROOT/android"
  cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF
  # shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
  source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
  apply_gradle_low_ram_tuning "$ROOT"
fi

echo "[preview:fast] gradle assembleRelease (incremental)..."
bash "$ROOT/scripts/gradle-assemble-with-retry.sh" assembleRelease

bash "$ROOT/scripts/finish-preview-apk.sh"
