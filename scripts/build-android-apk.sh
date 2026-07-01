#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="${APP_VARIANT:-preview}"

cd "$ROOT"

echo "[build] verifying environment..."
"$ROOT/scripts/verify-build-env.sh"

echo "[build] APP_VARIANT=$APP_VARIANT"

echo "[build] prebuild (android)..."
npx expo prebuild --platform android --no-install --clean

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
apply_gradle_low_ram_tuning "$ROOT"

echo "[build] gradle assembleRelease..."
"$ROOT/scripts/gradle-assemble-with-retry.sh" assembleRelease

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$APK" "$PUBLIC_DIR/myrank-test.apk"
ln -sfn "$APK" "$PUBLIC_DIR/myrank.apk"
if [[ -f "/root/myrankapp/scripts/sync-download-apks.sh" ]]; then
  bash /root/myrankapp/scripts/sync-download-apks.sh
fi

echo "[build] Done: $APK"
echo "[build] Download: https://myrank.com.tr/download/myrank.apk"
echo "[build] Variant: $APP_VARIANT (preview = gömülü bundle, dev client yok)"
