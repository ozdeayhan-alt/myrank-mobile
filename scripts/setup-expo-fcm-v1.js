#!/usr/bin/env node
/* eslint-env node */
/**
 * Upload Firebase service account to Expo (FCM V1) for Android push notifications.
 * Usage: node scripts/setup-expo-fcm-v1.js [path/to/service-account.json]
 */
const fs = require("fs");
const path = require("path");

const EAS_CLI_ROOT = process.env.EAS_CLI_ROOT || "/usr/lib/node_modules/eas-cli";
const ROOT = path.join(__dirname, "..");

function requireEas(subpath) {
  return require(path.join(EAS_CLI_ROOT, subpath));
}
const PROJECT_FULL_NAME = "@myrank/myrank-mobile";
const ANDROID_PACKAGE = "com.myrank.mobile";
const DEFAULT_KEY_PATH = path.join(ROOT, "..", "myrankapp", "service-account.json");

async function main() {
  const keyPath = path.resolve(process.argv[2] || DEFAULT_KEY_PATH);
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Service account JSON bulunamadı: ${keyPath}`);
  }

  const SessionManager = requireEas("build/user/SessionManager").default;
  const { createGraphqlClient } = requireEas(
    "build/commandUtils/context/contextUtils/createGraphqlClient"
  );
  const { readAndValidateServiceAccountKey } = requireEas(
    "build/credentials/android/utils/googleServiceAccountKey"
  );
  const { AppQuery } = requireEas("build/graphql/queries/AppQuery");
  const { AndroidAppCredentialsQuery } = requireEas(
    "build/credentials/android/api/graphql/queries/AndroidAppCredentialsQuery"
  );
  const { AndroidAppCredentialsMutation } = requireEas(
    "build/credentials/android/api/graphql/mutations/AndroidAppCredentialsMutation"
  );
  const { GoogleServiceAccountKeyMutation } = requireEas(
    "build/credentials/android/api/graphql/mutations/GoogleServiceAccountKeyMutation"
  );

  const sessionManager = new SessionManager();
  const sessionSecret = sessionManager.getSessionSecret();
  if (!sessionSecret) {
    throw new Error("Expo oturumu yok. Önce: eas login");
  }

  const graphqlClient = createGraphqlClient({ accessToken: null, sessionSecret });
  const jsonKey = readAndValidateServiceAccountKey(keyPath);

  const app = await AppQuery.byFullNameAsync(graphqlClient, PROJECT_FULL_NAME);
  if (!app?.id) {
    throw new Error(`EAS projesi bulunamadı: ${PROJECT_FULL_NAME}`);
  }

  let appCredentials =
    await AndroidAppCredentialsQuery.withCommonFieldsByApplicationIdentifierAsync(
      graphqlClient,
      PROJECT_FULL_NAME,
      { androidApplicationIdentifier: ANDROID_PACKAGE, legacyOnly: false }
    );

  if (!appCredentials) {
    console.log("[fcm] Android app credentials oluşturuluyor...");
    appCredentials = await AndroidAppCredentialsMutation.createAndroidAppCredentialsAsync(
      graphqlClient,
      {},
      app.id,
      ANDROID_PACKAGE
    );
  }

  if (appCredentials.googleServiceAccountKeyForFcmV1?.id) {
    console.log("[fcm] FCM V1 zaten yapılandırılmış.");
    return;
  }

  console.log("[fcm] Service account Expo'ya yükleniyor...");
  const uploadedKey =
    await GoogleServiceAccountKeyMutation.createGoogleServiceAccountKeyAsync(
      graphqlClient,
      { jsonKey },
      app.ownerAccount.id
    );

  console.log("[fcm] FCM V1 anahtarı atanıyor...");
  await AndroidAppCredentialsMutation.setGoogleServiceAccountKeyForFcmV1Async(
    graphqlClient,
    appCredentials.id,
    uploadedKey.id
  );

  console.log("[fcm] Tamam — Android push bildirimleri için FCM V1 hazır.");
}

main().catch((error) => {
  console.error("[fcm] Hata:", error?.message ?? error);
  process.exit(1);
});
