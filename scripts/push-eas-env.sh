#!/usr/bin/env bash
# Yerel .env içindeki EXPO_PUBLIC_* değişkenlerini EAS preview + production ortamlarına yükler.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "[push-eas-env] .env bulunamadı"
  exit 1
fi

ENVIRONMENTS=("preview" "production")

set -a
# shellcheck disable=SC1091
source .env
set +a

for env_name in "${ENVIRONMENTS[@]}"; do
  echo "[push-eas-env] Ortam: $env_name"
  for key in EXPO_PUBLIC_FIREBASE_API_KEY EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID EXPO_PUBLIC_FIREBASE_APP_ID EXPO_PUBLIC_API_URL EXPO_PUBLIC_MEDIA_PROXY_ORIGIN EXPO_PUBLIC_REELS_HLS_FIRST EXPO_PUBLIC_EAS_PROJECT_ID EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID; do
    value="${!key:-}"
    if [[ -z "$value" ]]; then
      echo "[push-eas-env] Atlanıyor (boş): $key"
      continue
    fi
    npx eas-cli env:create \
      --name "$key" \
      --value "$value" \
      --environment "$env_name" \
      --visibility plaintext \
      --force \
      --non-interactive
  done
done

echo "[push-eas-env] Tamamlandı."
