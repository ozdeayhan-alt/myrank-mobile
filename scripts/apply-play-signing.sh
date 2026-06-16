#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE_FILE="$ROOT/android/app/build.gradle"
PROPS_PATH="$ROOT/play-keystore.properties"

if [[ ! -f "$GRADLE_FILE" ]]; then
  echo "[play-signing] android/app/build.gradle bulunamadı (önce prebuild)."
  exit 1
fi

if [[ ! -f "$PROPS_PATH" ]]; then
  echo "[play-signing] $PROPS_PATH yok; release debug keystore ile kalır."
  exit 0
fi

ROOT="$ROOT" python3 <<'PY'
import os
from pathlib import Path

root = Path(os.environ["ROOT"])
gradle = root / "android" / "app" / "build.gradle"
text = gradle.read_text()

if "playKeystoreProperties" in text:
    print("[play-signing] Zaten yapılandırılmış.")
    raise SystemExit(0)

inject_props = """
def playKeystorePropertiesFile = rootProject.file("../play-keystore.properties")
def playKeystoreProperties = new Properties()
if (playKeystorePropertiesFile.exists()) {
    playKeystoreProperties.load(new FileInputStream(playKeystorePropertiesFile))
}
"""

inject_release_config = """
        release {
            if (playKeystorePropertiesFile.exists()) {
                storeFile rootProject.file(playKeystoreProperties['storeFile'])
                storePassword playKeystoreProperties['storePassword']
                keyAlias playKeystoreProperties['keyAlias']
                keyPassword playKeystoreProperties['keyPassword']
            }
        }
"""

text = text.replace(
    "android {",
    "android {" + inject_props,
    1,
)

text = text.replace(
    """    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }""",
    """    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }"""
    + inject_release_config
    + """
    }""",
    1,
)

text = text.replace(
    """        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug""",
    """        release {
            signingConfig playKeystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug""",
    1,
)

gradle.write_text(text)
print("[play-signing] Release upload keystore gradle'a eklendi.")
PY
