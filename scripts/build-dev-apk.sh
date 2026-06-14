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

# Low-RAM server tuning (3–4 GB RAM VPS): avoid OOM during native compile.
GRADLE_PROPS="$ROOT/android/gradle.properties"
if [[ -f "$GRADLE_PROPS" ]]; then
  sed -i 's/^org.gradle.jvmargs=.*/org.gradle.jvmargs=-Xmx1280m -XX:MaxMetaspaceSize=384m/' "$GRADLE_PROPS"
  if grep -q '^org.gradle.parallel=' "$GRADLE_PROPS"; then
    sed -i 's/^org.gradle.parallel=.*/org.gradle.parallel=false/' "$GRADLE_PROPS"
  else
    echo 'org.gradle.parallel=false' >> "$GRADLE_PROPS"
  fi
  sed -i 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' "$GRADLE_PROPS"
  for key in "android.lint.checkReleaseBuilds=false" "android.lint.abortOnError=false"; do
    prop="${key%%=*}"
    if grep -q "^${prop}=" "$GRADLE_PROPS"; then
      sed -i "s/^${prop}=.*/${key}/" "$GRADLE_PROPS"
    else
      echo "$key" >> "$GRADLE_PROPS"
    fi
  done
fi

echo "[dev] gradle assembleRelease (arm64-v8a, max-workers=1, lint skipped)..."
cd "$ROOT/android"
./gradlew assembleRelease --no-daemon --max-workers=1 \
  -x lintVitalAnalyzeRelease -x lintVitalReportRelease -x lintVitalRelease

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEV_APK="$ROOT/android/app/build/outputs/apk/release/myrank-dev.apk"
cp -f "$APK" "$DEV_APK"

PUBLIC_DIR="/root/myrankapp/public"
mkdir -p "$PUBLIC_DIR"
ln -sfn "$DEV_APK" "$PUBLIC_DIR/myrank-dev.apk"

echo "[dev] Done: $DEV_APK"
echo "[dev] Download: https://myrank.com.tr/download/myrank-dev.apk"
echo "[dev] Sonra: cd myrank-mobile && npm run start:tunnel"
