#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="${APP_VARIANT:-preview}"

cd "$ROOT"

echo "[preview] verifying environment..."
"$ROOT/scripts/verify-build-env.sh"

echo "[preview] APP_VARIANT=$APP_VARIANT"
echo "[preview] prebuild (android)..."
npx expo prebuild --platform android --no-install

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
apply_gradle_low_ram_tuning "$ROOT"

echo "[preview] gradle assembleRelease (arm64-v8a, max-workers=1, lint skipped)..."
cd "$ROOT/android"
./gradlew assembleRelease "${GRADLE_LOW_RAM_ARGS[@]}"

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PREVIEW_APK="$ROOT/android/app/build/outputs/apk/release/myrank-preview.apk"
cp -f "$APK" "$PREVIEW_APK"

PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$PREVIEW_APK" "$PUBLIC_DIR/myrank-preview.apk"
bash /root/myrankapp/scripts/sync-download-apks.sh

echo "[preview] Done: $PREVIEW_APK"
echo "[preview] Download: https://myrank.com.tr/download/myrank-preview.apk"
echo "[preview] Variant: $APP_VARIANT (no dev client for preview/production)"
