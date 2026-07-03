#!/usr/bin/env bash
# Standalone debug APK: embedded dev JS bundle (__DEV__=true), no Metro, no Expo Dev Client UI.
# Does not change playback logic — only produces a loggable installable artifact.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="${APP_VARIANT:-preview}"
export SKIP_NATIVE_PURGE=1

FLOW_DEBUG_MARKER="FLOW_DEBUG_EMBEDDED_BUNDLE"
FLOW_STANDALONE_MARKER="FLOW_DEBUG_STANDALONE"
GRADLE_FILE="$ROOT/android/app/build.gradle"
MAIN_APP_FILE="$ROOT/android/app/src/main/java/com/myrank/mobile/MainApplication.kt"

cd "$ROOT"

echo "[flow-debug] disk cleanup..."
bash "$ROOT/scripts/clean-build-disk.sh"

echo "[flow-debug] verifying environment..."
bash "$ROOT/scripts/verify-build-env.sh"

if [[ ! -f "$ROOT/android/gradlew" ]]; then
  echo "[flow-debug] android/ missing — one-time prebuild (preview, no dev client plugin)..."
  PREBUILD_CLEAN=0 bash "$ROOT/scripts/preview-android-prepare.sh"
else
  echo "[flow-debug] reusing android/ (no prebuild)"
  mkdir -p "$ROOT/android"
  cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF
  # shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
  source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
  apply_gradle_low_ram_tuning "$ROOT"
fi

enable_embedded_debug_bundle() {
  if grep -q "$FLOW_DEBUG_MARKER" "$GRADLE_FILE"; then
    echo "[flow-debug] embedded debug bundle already enabled in build.gradle"
    return
  fi
  echo "[flow-debug] enabling embedded dev bundle for assembleDebug..."
  sed -i "/autolinkLibrariesWithApp()/a\\    // ${FLOW_DEBUG_MARKER}\\n    debuggableVariants = []" "$GRADLE_FILE"
}

disable_embedded_debug_bundle() {
  if ! grep -q "$FLOW_DEBUG_MARKER" "$GRADLE_FILE"; then
    return
  fi
  echo "[flow-debug] restoring build.gradle..."
  sed -i "/${FLOW_DEBUG_MARKER}/d" "$GRADLE_FILE"
  sed -i '/debuggableVariants = \[\]/d' "$GRADLE_FILE"
}

enable_standalone_debug_launch() {
  if grep -q "$FLOW_STANDALONE_MARKER" "$MAIN_APP_FILE"; then
    echo "[flow-debug] standalone debug launch already enabled in MainApplication.kt"
    return
  fi
  echo "[flow-debug] disabling Metro developer support for standalone debug APK..."
  sed -i "s/override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG/override fun getUseDeveloperSupport(): Boolean = false \/\/ ${FLOW_STANDALONE_MARKER}/" "$MAIN_APP_FILE"
}

disable_standalone_debug_launch() {
  if ! grep -q "$FLOW_STANDALONE_MARKER" "$MAIN_APP_FILE"; then
    return
  fi
  echo "[flow-debug] restoring MainApplication.kt..."
  sed -i "s/override fun getUseDeveloperSupport(): Boolean = false \/\/ ${FLOW_STANDALONE_MARKER}/override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG/" "$MAIN_APP_FILE"
}

restore_build_patches() {
  disable_embedded_debug_bundle
  disable_standalone_debug_launch
}

trap restore_build_patches EXIT

enable_embedded_debug_bundle
enable_standalone_debug_launch

echo "[flow-debug] APP_VARIANT=$APP_VARIANT (preview = no expo-dev-client plugin)"
echo "[flow-debug] gradle assembleDebug (embedded dev bundle, __DEV__=true, standalone)..."
bash "$ROOT/scripts/gradle-assemble-with-retry.sh" assembleDebug

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
FLOW_DEBUG_APK="$ROOT/android/app/build/outputs/apk/debug/myrank-flow-debug.apk"

if [[ ! -f "$APK" ]]; then
  echo "[flow-debug] error: debug APK not found at $APK" >&2
  exit 1
fi

cp -f "$APK" "$FLOW_DEBUG_APK"

PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$FLOW_DEBUG_APK" "$PUBLIC_DIR/myrank-flow-debug.apk"
if [[ -f "/root/myrankapp/scripts/sync-download-apks.sh" ]]; then
  bash /root/myrankapp/scripts/sync-download-apks.sh
fi

BUNDLE_FILE="$ROOT/android/app/build/generated/assets/createBundleDebugJsAndAssets/index.android.bundle"
if [[ -f "$BUNDLE_FILE" ]]; then
  if rg -aq 'FlowPlayback' "$BUNDLE_FILE"; then
    echo "[flow-debug] OK: FlowPlayback instrumentation present in bundle"
  else
    echo "[flow-debug] warn: FlowPlayback string not found in bundle" >&2
  fi
  if rg -aq '__DEV__' "$BUNDLE_FILE"; then
    echo "[flow-debug] OK: __DEV__ present in dev bundle"
  fi
else
  echo "[flow-debug] warn: could not locate JS bundle for post-build verification" >&2
fi

if rg -q "$FLOW_STANDALONE_MARKER" "$MAIN_APP_FILE"; then
  echo "[flow-debug] OK: MainApplication uses embedded bundle (no Metro)"
fi

echo "[flow-debug] Done: $FLOW_DEBUG_APK"
echo "[flow-debug] Download: https://myrank.com.tr/download/myrank-flow-debug.apk"
echo "[flow-debug] Standalone: opens app directly, no Metro / no dev-client screen"
echo "[flow-debug] Logcat: adb logcat | grep FlowPlayback"
echo "[flow-debug] Install: adb install -r $FLOW_DEBUG_APK"
