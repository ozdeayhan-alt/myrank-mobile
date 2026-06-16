#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE_PATH="$ROOT/play-upload.keystore"
PROPS_PATH="$ROOT/play-keystore.properties"

if [[ -f "$KEYSTORE_PATH" && -f "$PROPS_PATH" ]]; then
  echo "[play-keystore] Mevcut upload keystore kullanılacak: $KEYSTORE_PATH"
  exit 0
fi

if ! command -v keytool >/dev/null 2>&1; then
  echo "[play-keystore] keytool bulunamadı (JDK gerekli)."
  exit 1
fi

STORE_PASS="$(openssl rand -hex 16)"
KEY_PASS="$STORE_PASS"

echo "[play-keystore] Yeni upload keystore oluşturuluyor..."
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_PATH" \
  -alias myrank-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=MyRank, OU=Mobile, O=MyRank, L=Istanbul, ST=Istanbul, C=TR"

cat > "$PROPS_PATH" <<EOF
storeFile=../play-upload.keystore
storePassword=$STORE_PASS
keyAlias=myrank-upload
keyPassword=$KEY_PASS
EOF

chmod 600 "$PROPS_PATH"
echo "[play-keystore] Oluşturuldu: $KEYSTORE_PATH"
echo "[play-keystore] Şifreler: $PROPS_PATH (git'e eklenmez)"
