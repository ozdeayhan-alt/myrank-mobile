#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE_PATH="$ROOT/play-upload.keystore"
PROPS_PATH="$ROOT/play-keystore.properties"

if [[ ! -f "$KEYSTORE_PATH" || ! -f "$PROPS_PATH" ]]; then
  echo "[play-sha1] Önce: bash scripts/ensure-play-keystore.sh"
  exit 1
fi

# shellcheck disable=SC1091
source "$PROPS_PATH"

echo "[play-sha1] Firebase / Google Sign-In için SHA-1:"
keytool -list -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "${keyAlias:-myrank-upload}" \
  -storepass "$storePassword" \
  2>/dev/null | awk '/SHA1:/{print $2}'
