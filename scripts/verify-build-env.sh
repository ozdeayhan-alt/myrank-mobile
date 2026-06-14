#!/usr/bin/env bash
# EAS preview build öncesi ortam değişkenlerini doğrular.
# Cloud build: `eas env:create` ile EXPO_PUBLIC_* değerlerini preview/production scope'a ekleyin.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REQUIRED=(
  EXPO_PUBLIC_FIREBASE_API_KEY
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  EXPO_PUBLIC_FIREBASE_PROJECT_ID
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  EXPO_PUBLIC_FIREBASE_APP_ID
  EXPO_PUBLIC_API_URL
  EXPO_PUBLIC_EAS_PROJECT_ID
)

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

missing=0
for key in "${REQUIRED[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "[verify-build-env] Eksik: $key"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo "[verify-build-env] Yerel .env eksik. EAS cloud build için:"
  echo "  eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value ... --environment preview"
  exit 1
fi

echo "[verify-build-env] Tüm EXPO_PUBLIC_* değişkenleri mevcut."
