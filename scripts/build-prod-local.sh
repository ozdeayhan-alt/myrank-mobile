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
echo "[prod] play upload keystore..."
"$ROOT/scripts/ensure-play-keystore.sh"

echo "[prod] prebuild (android)..."
npx expo prebuild --platform android --no-install

"$ROOT/scripts/apply-play-signing.sh"

mkdir -p "$ROOT/android"
cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

# shellcheck source=scripts/apply-gradle-low-ram-tuning.sh
source "$ROOT/scripts/apply-gradle-low-ram-tuning.sh"
apply_gradle_low_ram_tuning "$ROOT"

echo "[prod] gradle bundleRelease (arm64-v8a, max-workers=1, lint skipped)..."
cd "$ROOT/android"
./gradlew bundleRelease "${GRADLE_LOW_RAM_ARGS[@]}"

AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
cp -f "$AAB" "$PUBLIC_DIR/myrank-release.aab"

echo "[prod] Done: $AAB"
echo "[prod] Play upload bundle: $PUBLIC_DIR/myrank-release.aab"
echo "[prod] Firebase SHA-1 için: bash scripts/print-play-sha1.sh"
