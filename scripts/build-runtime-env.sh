#!/usr/bin/env bash
# Shared env for local preview APK builds (persistent Gradle cache, low Metro RAM).
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-/root/.gradle}"
export NODE_ENV="${NODE_ENV:-production}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

mkdir -p "$GRADLE_USER_HOME"
