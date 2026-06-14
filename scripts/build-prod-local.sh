#!/usr/bin/env bash
# Production AAB — Google Play Store upload bundle.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export APP_VARIANT="production"

cd "$ROOT"

echo "[prod] verifying environment..."
"$ROOT/scripts/verify-build-env.sh"

echo "[prod] APP_VARIANT=$APP_VARIANT"
echo "[prod] prebuild (android)..."
npx expo prebuild --platform android --no-install

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

echo "[prod] gradle bundleRelease..."
cd "$ROOT/android"
./gradlew bundleRelease --no-daemon

AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
cp -f "$AAB" "$PUBLIC_DIR/myrank-release.aab"

echo "[prod] Done: $AAB"
echo "[prod] Play upload bundle: $PUBLIC_DIR/myrank-release.aab"
