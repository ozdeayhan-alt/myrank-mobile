#!/usr/bin/env bash
# Prebuild (optional) + local.properties + low-RAM Gradle tuning.
# PREBUILD_CLEAN=1  → expo prebuild --clean (full native regen)
# PREBUILD_FORCE=1  → expo prebuild even when android/ exists
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

run_prebuild() {
  local args=(--platform android --no-install)
  if [[ "${PREBUILD_CLEAN:-0}" == "1" ]]; then
    args=(--clean "${args[@]}")
  fi
  npx expo prebuild "${args[@]}"
}

if [[ "${PREBUILD_CLEAN:-0}" == "1" ]]; then
  echo "[preview] prebuild --clean (full native regen)..."
  run_prebuild
elif [[ ! -f "$ROOT/android/gradlew" ]]; then
  echo "[preview] prebuild (first-time android/)..."
  run_prebuild
elif [[ "${PREBUILD_FORCE:-0}" == "1" ]]; then
  echo "[preview] prebuild (forced incremental)..."
  run_prebuild
else
  echo "[preview] skipping prebuild (android/ present; set PREBUILD_FORCE=1 to refresh)"
fi

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=${ANDROID_HOME:-/opt/android-sdk}
EOF

# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
apply_gradle_low_ram_tuning "$ROOT"
