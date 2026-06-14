import Constants from "expo-constants";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type FirebaseExtra = Partial<FirebaseClientConfig>;

const PLACEHOLDER_VALUES = new Set([
  "your_api_key",
  "your_sender_id",
  "your_app_id",
]);

/**
 * Reads Firebase Web App config from Expo `extra` (app.config.ts) or EXPO_PUBLIC_* env vars.
 * Secrets stay in .env (EXPO_PUBLIC_*); never hardcode or commit service-account.json.
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  const fromExtra = Constants.expoConfig?.extra?.firebase as
    | FirebaseExtra
    | undefined;

  return {
    apiKey:
      fromExtra?.apiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain:
      fromExtra?.authDomain ??
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      "",
    projectId:
      fromExtra?.projectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket:
      fromExtra?.storageBucket ??
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      "",
    messagingSenderId:
      fromExtra?.messagingSenderId ??
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      "",
    appId: fromExtra?.appId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

export function assertFirebaseClientConfig(
  config: FirebaseClientConfig
): void {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Firebase client yapılandırması eksik: ${missing.join(", ")}. ` +
        "myrank-mobile/.env dosyasını .env.example şablonuna göre doldurun " +
        "(Firebase Console > Web app config)."
    );
  }

  const placeholders = Object.entries(config)
    .filter(([, value]) => PLACEHOLDER_VALUES.has(String(value).trim()))
    .map(([key]) => key);

  if (placeholders.length > 0) {
    throw new Error(
      `Firebase yapılandırması örnek (placeholder) değer içeriyor: ${placeholders.join(", ")}. ` +
        "Gerçek Web app değerlerini .env dosyasına yazın."
    );
  }
}
