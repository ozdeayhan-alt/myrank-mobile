#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# shellcheck source=scripts/build-runtime-env.sh
source "$ROOT/scripts/build-runtime-env.sh"
export APP_VARIANT="${APP_VARIANT:-preview}"

# Incremental Gradle unless full native regen (prebuild --clean).
if [[ "${PREBUILD_CLEAN:-0}" != "1" ]]; then
  export SKIP_NATIVE_PURGE=1
fi

cd "$ROOT"

trap 'bash "$ROOT/scripts/build-memory-restore.sh"' EXIT
bash "$ROOT/scripts/build-memory-prep.sh"

echo "[preview] disk cleanup..."
bash "$ROOT/scripts/clean-build-disk.sh"

echo "[preview] verifying environment..."
bash "$ROOT/scripts/verify-build-env.sh"

echo "[preview] APP_VARIANT=$APP_VARIANT GRADLE_USER_HOME=$GRADLE_USER_HOME"
bash "$ROOT/scripts/preview-android-prepare.sh"

echo "[preview] gradle assembleRelease..."
bash "$ROOT/scripts/gradle-assemble-with-retry.sh" assembleRelease

bash "$ROOT/scripts/finish-preview-apk.sh"
