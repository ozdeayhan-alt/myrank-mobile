#!/usr/bin/env bash
# Development client APK — telefonda canlı kod güncellemesi (expo start --dev-client).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="development"

cd "$ROOT"

echo "[dev] APP_VARIANT=$APP_VARIANT (expo-dev-client included)"
echo "[dev] prebuild (android)..."
npx expo prebuild --platform android --no-install --clean

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
apply_gradle_low_ram_tuning "$ROOT"

echo "[dev] gradle assembleRelease (arm64-v8a, max-workers=1, lint skipped)..."
cd "$ROOT/android"
./gradlew assembleRelease "${GRADLE_LOW_RAM_ARGS[@]}"

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEV_APK="$ROOT/android/app/build/outputs/apk/release/myrank-dev.apk"
cp -f "$APK" "$DEV_APK"

PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$DEV_APK" "$PUBLIC_DIR/myrank-dev.apk"
bash /root/myrankapp/scripts/sync-download-apks.sh

echo "[dev] Done: $DEV_APK"
echo "[dev] Download: https://myrank.com.tr/download/myrank-dev.apk"
echo "[dev] Sonra: cd myrank-mobile && npm run start:tunnel"
