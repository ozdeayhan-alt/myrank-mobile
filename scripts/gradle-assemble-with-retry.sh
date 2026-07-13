#!/usr/bin/env bash
# Run a Gradle release task with native-module cache purge and automatic retry.
# Usage: gradle-assemble-with-retry.sh assembleRelease
#        gradle-assemble-with-retry.sh bundleRelease
# SKIP_NATIVE_PURGE=1 skips initial native-module cache purge (fast incremental builds).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE_TASK="${1:?gradle task required (e.g. assembleRelease or bundleRelease)}"

# shellcheck source=scripts/build-runtime-env.sh
source "$ROOT/scripts/build-runtime-env.sh"
# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"

run_gradle() {
  cd "$ROOT/android"
  ./gradlew "$GRADLE_TASK" "${GRADLE_LOW_RAM_ARGS[@]}"
}

purge_native_caches() {
  bash "$ROOT/scripts/purge-native-module-gradle-caches.sh"
}

if [[ "${SKIP_NATIVE_PURGE:-0}" != "1" ]]; then
  purge_native_caches
fi

echo "[gradle] GRADLE_USER_HOME=$GRADLE_USER_HOME"
echo "[gradle] $GRADLE_TASK (arm64-v8a, max-workers=1, lint skipped)..."
if run_gradle; then
  exit 0
fi

echo "[gradle] first attempt failed; purging native module caches and retrying once..." >&2
purge_native_caches

if run_gradle; then
  exit 0
fi

echo "[gradle] build failed after retry (gradlew clean is intentionally skipped — it breaks CMake on low RAM)." >&2
echo "[gradle] Free RAM, then rerun. JS-only: npm run build:preview:fast" >&2
exit 1
