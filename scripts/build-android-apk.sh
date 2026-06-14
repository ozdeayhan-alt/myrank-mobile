#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"

cd "$ROOT"

echo "[build] verifying environment..."
"$ROOT/scripts/verify-build-env.sh"

echo "[build] prebuild (android)..."
npx expo prebuild --platform android --no-install

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

echo "[build] gradle assembleRelease..."
cd "$ROOT/android"
./gradlew assembleRelease --no-daemon

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$APK" "$PUBLIC_DIR/myrank-test.apk"

echo "[build] Done: $APK"
echo "[build] Download: https://myrank.com.tr/download/myrank.apk"
