#!/usr/bin/env bash
# Play Console → App signing key → SHA-1 değerini Firebase Android uygulamasına ekler
# ve güncel google-services.json indirir.
#
# Ön koşul:
#   firebase login --reauth
#
# Kullanım:
#   bash scripts/register-play-signing-sha1.sh
#   bash scripts/register-play-signing-sha1.sh "AA:BB:..."

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${FIREBASE_PROJECT_ID:-myrankapp-d62b9}"
ANDROID_APP_ID="${FIREBASE_ANDROID_APP_ID:-1:479174575595:android:0304e36b0765ad390585ae}"
PLAY_APP_SIGNING_SHA1="${1:-A4:0C:12:48:C4:CE:E6:B3:B6:A9:C2:CB:59:23:F9:28:52:AC:80:E9}"
OUT_JSON="$ROOT/google-services.json"

cd "$ROOT"

if ! command -v firebase >/dev/null 2>&1; then
  echo "[register-play-sha1] firebase CLI yok; npx firebase-tools kullanılıyor."
  FIREBASE=(npx --yes firebase-tools)
else
  FIREBASE=(firebase)
fi

echo "[register-play-sha1] Proje: $PROJECT_ID"
echo "[register-play-sha1] Android app: $ANDROID_APP_ID"
echo "[register-play-sha1] SHA-1: $PLAY_APP_SIGNING_SHA1"
echo

echo "[register-play-sha1] Mevcut parmak izleri:"
if ! "${FIREBASE[@]}" apps:android:sha:list "$ANDROID_APP_ID" --project "$PROJECT_ID"; then
  echo
  echo "[register-play-sha1] HATA: Firebase oturumu gerekli. Çalıştır: firebase login --reauth"
  exit 1
fi

echo
echo "[register-play-sha1] SHA-1 ekleniyor..."
if "${FIREBASE[@]}" apps:android:sha:create "$ANDROID_APP_ID" "$PLAY_APP_SIGNING_SHA1" --project "$PROJECT_ID"; then
  echo "[register-play-sha1] SHA-1 eklendi."
else
  echo "[register-play-sha1] Eklenemedi (zaten kayıtlı olabilir)."
fi

echo
echo "[register-play-sha1] google-services.json indiriliyor..."
"${FIREBASE[@]}" apps:sdkconfig android "$ANDROID_APP_ID" --project "$PROJECT_ID" > "$OUT_JSON"

if [[ -f "$ROOT/android/app/google-services.json" ]]; then
  cp "$OUT_JSON" "$ROOT/android/app/google-services.json"
  echo "[register-play-sha1] android/app/google-services.json güncellendi."
fi

echo
echo "[register-play-sha1] Tamam."
echo "  1) Firebase Console → Authentication → Google → Enabled olduğundan emin olun."
echo "  2) 15–60 dk bekleyin, kapalı test sürümünde Google ile girişi deneyin."
echo "  3) Hâlâ DEVELOPER_ERROR ise yeni kapalı test build (google-services.json ile) gerekir."
