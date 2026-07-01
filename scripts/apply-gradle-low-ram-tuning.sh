#!/usr/bin/env bash
# Low-RAM VPS tuning (3–4 GB RAM): run after expo prebuild, before ./gradlew.
# Patches android/gradle.properties and sets GRADLE_LOW_RAM_ARGS for assemble/bundle.
set -euo pipefail

apply_gradle_low_ram_tuning() {
  local root="${1:?project root required}"
  local gradle_props="$root/android/gradle.properties"

  if [[ ! -f "$gradle_props" ]]; then
    echo "[gradle-low-ram] skip: $gradle_props not found" >&2
    return 1
  fi

  echo "[gradle-low-ram] applying arm64-only, reduced heap, no parallel (VPS OOM guard)..."

  sed -i 's/^org.gradle.jvmargs=.*/org.gradle.jvmargs=-Xmx1280m -XX:MaxMetaspaceSize=384m/' "$gradle_props"

  if grep -q '^org.gradle.parallel=' "$gradle_props"; then
    sed -i 's/^org.gradle.parallel=.*/org.gradle.parallel=false/' "$gradle_props"
  else
    echo 'org.gradle.parallel=false' >> "$gradle_props"
  fi

  sed -i 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' "$gradle_props"

  for key in \
    "android.lint.checkReleaseBuilds=false" \
    "android.lint.abortOnError=false" \
    "org.gradle.caching=true"; do
    local prop="${key%%=*}"
    if grep -q "^${prop}=" "$gradle_props"; then
      sed -i "s/^${prop}=.*/${key}/" "$gradle_props"
    else
      echo "$key" >> "$gradle_props"
    fi
  done
}

# shellcheck disable=SC2034
GRADLE_LOW_RAM_ARGS=(
  --no-daemon
  --max-workers=1
  -PreactNativeArchitectures=arm64-v8a
  -x lintVitalAnalyzeRelease
  -x lintVitalReportRelease
  -x lintVitalRelease
)
