#!/usr/bin/env bash
# Stale node_modules/*/android/build dirs break verifyReleaseResources after prebuild
# or interrupted Gradle runs (e.g. Crashlytics linked.apk missing).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "[gradle] purging native module android/build caches..."

shopt -s nullglob
for module_build in \
  "$ROOT"/node_modules/@react-native-firebase/*/android/build \
  "$ROOT"/node_modules/@react-native-google-signin/*/android/build; do
  if [[ -d "$module_build" ]]; then
    rm -rf "$module_build"
  fi
done
shopt -u nullglob
